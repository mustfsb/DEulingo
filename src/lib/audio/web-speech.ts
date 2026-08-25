import type { GermanAudioTarget, GermanVoiceId, SpeechSpeed } from './tts';
import { DEFAULT_GERMAN_VOICE_ID } from './tts';

const RATE_BY_SPEED: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1,
  fast: 1.35,
};

/** Web Speech fallback'te her Piper profili için ayırt edici perde.
 *  Tek Alman sesi olan tarayıcılarda bile 4 seçenek ayrım duyulsun
 *  ama erkek sesler doğal kalsın diye aralık ölçülü tutuldu. */
const PITCH_BY_VOICE: Record<GermanVoiceId, number> = {
  thorsten: 0.97,
  'thorsten-soft': 0.86,
  kerstin: 1.24,
  eva: 1.12,
};

const RATE_ADJUST_BY_VOICE: Record<GermanVoiceId, number> = {
  thorsten: 1,
  'thorsten-soft': 0.93,
  kerstin: 1.04,
  eva: 1,
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
  'alex',
  'oliver',
  'david',
  'aaron',
  'fred',
  'george',
  'james',
  'john',
  'arthur',
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
  'samantha',
  'karen',
  'moira',
  'tessa',
  'allison',
  'ava',
  'aura',
  'sara',
  'zuzana',
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

  const preferredGender = VOICE_GENDER[preferredVoiceId] ?? 'male';

  // Alman sesleri yoksa → doğrudan tüm seslerden cinsiyete göre seç
  if (german.length === 0) {
    const globalMapped = voices.map((voice) => ({ voice, gender: guessVoiceGender(voice) }));
    const globalCandidates = globalMapped
      .filter((e) => e.gender === preferredGender)
      .map((e) => e.voice)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (globalCandidates.length > 0) return globalCandidates[0];
    return voices[0] ?? null;
  }

  const mapped = german.map((voice) => ({ voice, gender: guessVoiceGender(voice) }));
  const maleVoices = mapped.filter((entry) => entry.gender === 'male').map((entry) => entry.voice).sort(sortByLangPreference);
  const femaleVoices = mapped.filter((entry) => entry.gender === 'female').map((entry) => entry.voice).sort(sortByLangPreference);
  const unknownVoices = mapped.filter((entry) => entry.gender === 'unknown').map((entry) => entry.voice).sort(sortByLangPreference);

  let candidates: SpeechSynthesisVoice[] = [];
  if (preferredGender === 'male') {
    if (maleVoices.length > 0) candidates = maleVoices;
    else if (unknownVoices.length > 0) candidates = unknownVoices;
    else {
      // Almanca erkek yoksa: herhangi bir dilden erkek sese düş (pitch-shiftli kadın kullanmaktan doğal)
      const globalMale = voices
        .filter((v) => guessVoiceGender(v) === 'male')
        .sort((a, b) => a.name.localeCompare(b.name));
      if (globalMale.length > 0) return globalMale[0];
      candidates = femaleVoices;
    }
    const order: GermanVoiceId[] = ['thorsten', 'thorsten-soft'];
    const idx = order.indexOf(preferredVoiceId);
    if (candidates.length > 1 && idx >= 0) return candidates[idx % candidates.length] ?? candidates[0];
    return candidates[0] ?? null;
  }
  // female
  if (femaleVoices.length > 0) candidates = femaleVoices;
  else if (unknownVoices.length > 0) candidates = unknownVoices;
  else {
    const globalFemale = voices
      .filter((v) => guessVoiceGender(v) === 'female')
      .sort((a, b) => a.name.localeCompare(b.name));
    if (globalFemale.length > 0) return globalFemale[0];
    candidates = maleVoices;
  }
  const order: GermanVoiceId[] = ['kerstin', 'eva'];
  const idx = order.indexOf(preferredVoiceId);
  if (candidates.length > 1 && idx >= 0) return candidates[idx % candidates.length] ?? candidates[0];
  return candidates[0] ?? null;
}

export function pitchForVoice(voiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID): number {
  return PITCH_BY_VOICE[voiceId] ?? 1;
}

export function rateForVoice(voiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID, speed: SpeechSpeed = 'normal'): number {
  const base = RATE_BY_SPEED[speed] ?? 1;
  const adjust = RATE_ADJUST_BY_VOICE[voiceId] ?? 1;
  return Number((base * adjust).toFixed(3));
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

async function ensureVoicesLoaded(timeoutMs = 700): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (window.speechSynthesis.getVoices().length > 0) return;
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    const handler = () => {
      clearTimeout(timer);
      finish();
    };
    try {
      window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true } as AddEventListenerOptions);
    } catch {
      // eski tarayıcı fallback
      (window.speechSynthesis as unknown as { onvoiceschanged?: () => void }).onvoiceschanged = handler;
      setTimeout(() => {
        (window.speechSynthesis as unknown as { onvoiceschanged?: () => void }).onvoiceschanged = null as unknown as undefined;
      }, timeoutMs);
    }
  });
}

export async function speakWithWebSpeech(
  target: GermanAudioTarget,
  speed: SpeechSpeed,
  signal?: AbortSignal,
  voiceId: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
): Promise<void> {
  // Vercel/prod'da ses listesi geç dolabilir → kısa süre bekle
  await ensureVoicesLoaded();

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
    utterance.rate = rateForVoice(voiceId, speed);
    utterance.pitch = pitchForVoice(voiceId);

    const voice = pickGermanVoice(voiceId);
    if (voice) utterance.voice = voice;

    // Debug: Vercel'de ses değişmiyor şikayeti için teşhis logu
    try {
      console.debug(`[tts-fallback] voiceId=${voiceId} pitch=${utterance.pitch} picked=${voice?.name ?? 'null'} lang=${voice?.lang ?? utterance.lang} rate=${utterance.rate}`);
    } catch { /* ignore */ }

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
