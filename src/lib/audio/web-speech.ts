import type { EnglishAudioTarget, GermanAudioTarget, GermanVoiceId, SpeechSpeed } from './tts';
import { DEFAULT_GERMAN_VOICE_ID } from './tts';

const RATE_BY_SPEED: Record<SpeechSpeed, number> = {
  // 0.75 aşırı sürükleyip robotikleştiriyordu; 0.85 yavaş ama doğal kalır.
  slow: 0.85,
  normal: 0.98,
  fast: 1.28,
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

/* ------------------------------------------------------------------ */
/* İngilizce (en-GB) — birincil yol yerel Piper'dır; Web Speech yalnızca */
/* Vercel/prod yedeğidir. Aşağıdaki seçim + cümle-parçalama yedek sesi    */
/* olabildiğince canlı tutar.                                             */
/* ------------------------------------------------------------------ */

/** Doğal sinirsel sesleri robotik eSpeak/festival seslerine tercih et. */
function naturalnessScore(name: string): number {
  const hay = name.toLowerCase();
  let score = 0;
  if (hay.includes('natural')) score += 30;
  if (hay.includes('neural')) score += 25;
  if (hay.includes('premium')) score += 15;
  if (hay.includes('enhanced')) score += 15;
  if (hay.includes('google uk english female') || hay.includes('google uk english male')) score += 20;
  if (hay.includes('google') && hay.includes('english')) score += 10;
  if (hay.includes('microsoft') && (hay.includes('aria') || hay.includes('jenny') || hay.includes('guy') || hay.includes('sonia') || hay.includes('ryan') || hay.includes('libby'))) score += 18;
  if (hay.includes('samantha') || hay.includes('karen') || hay.includes('daniel') || hay.includes('moira') || hay.includes('tessa')) score += 12;
  if (hay.includes('siri')) score += 10;
  // Robotik motorları en sona it
  if (hay.includes('espeak') || hay.includes('e-speak')) score -= 50;
  if (hay.includes('festival') || hay.includes('compact') || hay.includes('android')) score -= 20;
  if (hay.includes('whisper') || hay.includes('robot')) score -= 30;
  return score;
}

/**
 * en-GB ses seçimi (IELTS hedefi: Britanya aksanı tercihi). Aynı dilde
 * birden çok ses varsa en doğal olanı seçer; robotik sesler elenir.
 */
export function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const lower = (v: SpeechSynthesisVoice) => v.lang.toLowerCase();
  const rank = (list: SpeechSynthesisVoice[]) =>
    [...list].sort((a, b) => naturalnessScore(b.name) - naturalnessScore(a.name) || a.name.localeCompare(b.name));
  const exactGb = rank(voices.filter((v) => lower(v) === 'en-gb'));
  // Robotik olmayan bir en-GB varsa onu al; tek seçenek eSpeak ise bile
  // en-GB aksanını koru (aksan, doğallıktan önce gelir).
  if (exactGb.length > 0) {
    const naturalGb = exactGb.filter((v) => naturalnessScore(v.name) > -20);
    if (naturalGb.length > 0) return naturalGb[0];
    return exactGb[0];
  }
  const english = rank(voices.filter((v) => lower(v).startsWith('en')));
  const naturalEn = english.filter((v) => naturalnessScore(v.name) > -20);
  if (naturalEn.length > 0) return naturalEn[0];
  if (english.length > 0) return english[0];
  return voices[0] ?? null;
}

const EN_RATE_BY_SPEED: Record<SpeechSpeed, number> = {
  slow: 0.85,
  normal: 0.98,
  fast: 1.25,
};

/** Metni cümlelere böl: tek monoton blok yerine nefesli, canlı akış. */
export function splitIntoSentences(text: string): string[] {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return [];
  const parts = clean.match(/[^.!?…]+[.!?…]+["'”’)]?|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];
  for (const part of parts) {
    const sentence = part.trim();
    if (!sentence) continue;
    // Çok uzun cümleleri virgülle böl (200 karakter üstü Web Speech'te kesilir).
    if (sentence.length > 200) {
      const sub = sentence.split(/,\s+/);
      let current = '';
      for (const piece of sub) {
        const next = current ? `${current}, ${piece}` : piece;
        if (next.length > 180 && current) {
          chunks.push(current.trim());
          current = piece;
        } else {
          current = next;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    } else {
      chunks.push(sentence);
    }
  }
  return chunks.length > 0 ? chunks : [clean];
}

function speakOneUtterance(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
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
    // 'interrupted' / 'canceled' bir sonraki parçaya geçişte normaldir.
    utterance.onerror = (event) => {
      const kind = (event as unknown as { error?: string })?.error ?? '';
      if (kind === 'interrupted' || kind === 'canceled') { done(); return; }
      fail(new Error('Tarayıcı telaffuzu başarısız.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      fail(e instanceof Error ? e : new Error(String(e)));
    }
    if (signal?.aborted) onAbort();
  });
}

/** Cümle aralarında kısa nefes payı: canlı ritim için 140ms. */
function pauseBetweenSentences(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** İngilizce hedefi tarayıcı sesiyle okur (yerel Piper yoksa yedek). */
export async function speakEnglishWithWebSpeech(
  target: EnglishAudioTarget,
  speed: SpeechSpeed,
  signal?: AbortSignal,
): Promise<void> {
  await ensureVoicesLoaded();

  if (!isWebSpeechAvailable()) {
    throw new Error('Tarayıcı telaffuzu desteklenmiyor.');
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const voice = pickEnglishVoice();
  const rate = EN_RATE_BY_SPEED[speed] ?? 0.98;
  // Hafif sıcak perde + cümle parçalama: tek blok robotikliğini kırar.
  const pitch = 1.04;
  const sentences = splitIntoSentences(target.text);

  try {
    window.speechSynthesis.cancel();
  } catch { /* ignore */ }
  for (let i = 0; i < sentences.length; i += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await speakOneUtterance(sentences[i], 'en-GB', voice, rate, pitch, signal);
    if (i < sentences.length - 1) await pauseBetweenSentences(140, signal);
  }
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

  if (!isWebSpeechAvailable()) {
    throw new Error('Tarayıcı telaffuzu desteklenmiyor.');
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const voice = pickGermanVoice(voiceId);
  const rate = rateForVoice(voiceId, speed);
  const pitch = pitchForVoice(voiceId);
  const sentences = splitIntoSentences(target.text);

  // Debug: Vercel'de ses değişmiyor şikayeti için teşhis logu
  try {
    console.debug(`[tts-fallback] voiceId=${voiceId} pitch=${pitch} picked=${voice?.name ?? 'null'} lang=${voice?.lang ?? 'de-DE'} rate=${rate} chunks=${sentences.length}`);
  } catch { /* ignore */ }

  try {
    window.speechSynthesis.cancel();
  } catch { /* ignore */ }
  for (let i = 0; i < sentences.length; i += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await speakOneUtterance(sentences[i], 'de-DE', voice, rate, pitch, signal);
    if (i < sentences.length - 1) await pauseBetweenSentences(140, signal);
  }
}
