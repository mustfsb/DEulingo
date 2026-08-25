import type { GermanAudioTarget, GermanVoiceId, SpeechSpeed } from './tts';
import { DEFAULT_GERMAN_VOICE_ID } from './tts';

const RATE_BY_SPEED: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1,
  fast: 1.35,
};

/** Web Speech fallback'te her Piper profili için ayırt edici perde. */
const PITCH_BY_VOICE: Record<GermanVoiceId, number> = {
  thorsten: 1,
  'thorsten-soft': 0.88,
  kerstin: 1.16,
  eva: 1.04,
};

const VOICE_GENDER: Record<GermanVoiceId, 'male' | 'female'> = {
  thorsten: 'male',
  'thorsten-soft': 'male',
  kerstin: 'female',
  eva: 'female',
};

const MALE_HINTS = [
  'conrad',
  'stefan',
  'yannick',
  'hans',
  'klaus',
  'thorsten',
  'andreas',
  'markus',
  'jonas',
  'bernd',
  'peter',
  'reiner',
  'thomas',
  'daniel',
  'paul',
];

const FEMALE_HINTS = [
  'katja',
  'anna',
  'petra',
  'helena',
  'marlene',
  'paula',
  'steffi',
  'heda',
  'vicki',
  'eva',
  'kerstin',
  'ginger',
  'amala',
  'heidi',
  'julia',
  'sabine',
  'birgit',
  'ines',
  'google deutsch',
];

function guessVoiceGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const haystack = `${voice.name} ${voice.voiceURI ?? ''}`.toLowerCase();
  // 'female' is 'male' üst kümesi olduğu için önce kadın kontrolü
  if (FEMALE_HINTS.some((hint) => haystack.includes(hint)) || haystack.includes('female')) return 'female';
  if (MALE_HINTS.some((hint) => haystack.includes(hint))) return 'male';
  // Genel erkek/kadın işaretleri son çare
  if (haystack.includes('female')) return 'female';
  if (haystack.includes(' male') || haystack.includes('(male') || haystack.includes('mann') || haystack.includes('herr')) return 'male';
  return 'unknown';
}

function sortByLangPreference(a: SpeechSynthesisVoice, b: SpeechSynthesisVoice): number {
  const aExact = a.lang.toLowerCase() === 'de-de' ? 0 : 1;
  const bExact = b.lang.toLowerCase() === 'de-de' ? 0 : 1;
  if (aExact !== bExact) return aExact - bExact;
  return a.name.localeCompare(b.name);
}

export function pickGermanVoice(preferredVoiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith('de'));
  if (german.length === 0) return null;

  const preferredGender = VOICE_GENDER[preferredVoiceId] ?? 'male';

  const mapped = german.map((voice) => ({ voice, gender: guessVoiceGender(voice) }));
  const maleVoices = mapped.filter((entry) => entry.gender === 'male').map((entry) => entry.voice).sort(sortByLangPreference);
  const femaleVoices = mapped.filter((entry) => entry.gender === 'female').map((entry) => entry.voice).sort(sortByLangPreference);
  const unknownVoices = mapped.filter((entry) => entry.gender === 'unknown').map((entry) => entry.voice).sort(sortByLangPreference);

  let candidates: SpeechSynthesisVoice[] = [];
  if (preferredGender === 'male') {
    if (maleVoices.length > 0) candidates = maleVoices;
    else if (unknownVoices.length > 0) candidates = unknownVoices;
    else candidates = femaleVoices;
    const order: GermanVoiceId[] = ['thorsten', 'thorsten-soft'];
    const idx = order.indexOf(preferredVoiceId);
    if (candidates.length > 1 && idx >= 0) return candidates[idx % candidates.length] ?? candidates[0];
    return candidates[0] ?? null;
  }
  // female
  if (femaleVoices.length > 0) candidates = femaleVoices;
  else if (unknownVoices.length > 0) candidates = unknownVoices;
  else candidates = maleVoices;
  const order: GermanVoiceId[] = ['kerstin', 'eva'];
  const idx = order.indexOf(preferredVoiceId);
  if (candidates.length > 1 && idx >= 0) return candidates[idx % candidates.length] ?? candidates[0];
  return candidates[0] ?? null;
}

export function pitchForVoice(voiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID): number {
  return PITCH_BY_VOICE[voiceId] ?? 1;
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speakWithWebSpeech(
  target: GermanAudioTarget,
  speed: SpeechSpeed,
  signal?: AbortSignal,
  voiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isWebSpeechAvailable()) {
      reject(new Error('Tarayıcı telaffuzu desteklenmiyor.'));
      return;
    }
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(target.text);
    utterance.lang = 'de-DE';
    utterance.rate = RATE_BY_SPEED[speed] ?? 1;
    utterance.pitch = pitchForVoice(voiceId);

    const voice = pickGermanVoice(voiceId);
    if (voice) utterance.voice = voice;

    let settled = false;
    const cleanup = () => {
      utterance.onend = null;
      utterance.onerror = null;
      signal?.removeEventListener('abort', onAbort);
    };
    const done = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    const onAbort = () => {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      fail(new DOMException('Aborted', 'AbortError'));
    };

    utterance.onend = done;
    utterance.onerror = () => fail(new Error('Tarayıcı telaffuzu başarısız.'));
    signal?.addEventListener('abort', onAbort, { once: true });

    // Bazı tarayıcılarda getVoices() async dolar; ses yoksa da konuşur
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      fail(e instanceof Error ? e : new Error(String(e)));
    }

    // Abort zaten geldiyse hemen iptal et
    if (signal?.aborted) onAbort();
  });
}
