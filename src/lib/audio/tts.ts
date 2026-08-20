import type { Exercise, GermanAudioTarget } from '../../content/types';
import { findGermanAudioTarget } from './targets';

export type { GermanAudioTarget } from '../../content/types';

/** Yerel Piper kurulumunda desteklenen, Almanca için sınırlandırılmış sesler. */
export const GERMAN_VOICE_PROFILES = [
  {
    id: 'thorsten',
    label: 'Thorsten',
    description: 'Erkek · Net (mevcut)',
    model: 'de_DE-thorsten-high',
    repositoryPath: 'thorsten/high',
    // Hız kalibrasyonu v2: önceki aynı-model WAV cache'i yanlışlıkla
    // kullanılmasın diye üretim sürümü de değişir.
    version: 'piper-voices-2024.06-high-balanced-speeds-v2',
    // Referans ses: kalibrasyon metninde 2,94 sn.
    normalLengthScale: 1,
  },
  {
    id: 'thorsten-soft',
    label: 'Thorsten Yumuşak',
    description: 'Erkek · Yumuşak, dengeli',
    model: 'de_DE-thorsten_emotional-medium',
    repositoryPath: 'thorsten_emotional/medium',
    // `sleepy` doğal olmayan derecede yavaş ve boğuk kalıyordu. Aynı resmi
    // modelin neutral konuşmacısı daha yumuşak ama günlük kullanımda doğal.
    version: 'piper-voices-2024.06-medium-neutral-balanced',
    speaker: 4,
    // Kalibrasyon metninde 2,95 sn.
    normalLengthScale: 0.99,
  },
  {
    id: 'kerstin',
    label: 'Kadın Net',
    description: 'Kadın · Orta kalite, dengeli',
    model: 'de_DE-mls-medium',
    repositoryPath: 'mls/medium',
    // Eski `kerstin` kimliği korunur: kullanıcının localStorage seçimi yeni,
    // daha kaliteli profile otomatik geçer; ayrı bir ayar kaybı yaşanmaz.
    version: 'piper-voices-2024.06-mls-medium-speaker-104',
    speaker: 104,
    // Kalibrasyon metninde 2,95 sn.
    normalLengthScale: 0.28,
  },
  {
    id: 'eva',
    label: 'Kadın Dengeli',
    description: 'Kadın · Orta kalite, doğal',
    model: 'de_DE-mls-medium',
    repositoryPath: 'mls/medium',
    // Eski `eva` kimliği de aynı nedenle korunur.
    version: 'piper-voices-2024.06-mls-medium-speaker-120',
    speaker: 120,
    // Kalibrasyon metninde 2,98 sn.
    normalLengthScale: 0.39,
  },
] as const;

export type GermanVoiceId = (typeof GERMAN_VOICE_PROFILES)[number]['id'];
export const DEFAULT_GERMAN_VOICE_ID: GermanVoiceId = 'thorsten';
export const PIPER_GERMAN_VOICE = GERMAN_VOICE_PROFILES[0].model;
export const PIPER_GERMAN_VOICE_VERSION = GERMAN_VOICE_PROFILES[0].version;

export function isGermanVoiceId(value: unknown): value is GermanVoiceId {
  return typeof value === 'string' && GERMAN_VOICE_PROFILES.some((profile) => profile.id === value);
}

export function germanVoiceProfile(voice: GermanVoiceId | undefined = DEFAULT_GERMAN_VOICE_ID) {
  return GERMAN_VOICE_PROFILES.find((profile) => profile.id === voice) ?? GERMAN_VOICE_PROFILES[0];
}

export type SpeechSpeed = 'slow' | 'normal' | 'fast';

/**
 * Hız tercihi modelden bağımsız göreli bir etkidir. Her sesin kendi
 * `normalLengthScale` değeri vardır; kullanıcıya gösterilen "Normal" böylece
 * sesler arasında aynı konuşma ritmine yakın kalır.
 */
export const PIPER_GENERATION_PROFILE: Record<SpeechSpeed, { multiplier: number }> = {
  // Yavaş tekrar da normalden duyulur biçimde ayrılmalıdır.
  slow: { multiplier: 1.3 },
  normal: { multiplier: 1 },
  // 0.84 bazı çok konuşmacılı model çıktılarında duyulabilir fark yaratmıyor.
  // 0.72, dört profil için net ama hâlâ anlaşılır bir hızlı tekrar verir.
  fast: { multiplier: 0.72 },
};

export function isSpeechSpeed(value: unknown): value is SpeechSpeed {
  return value === 'slow' || value === 'normal' || value === 'fast';
}

/** Piper'ın beklediği sabit, cache anahtarına da girecek biçimde üretilir. */
export function piperLengthScaleFor(
  voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
  speed: SpeechSpeed,
): string {
  const lengthScale = germanVoiceProfile(voice).normalLengthScale * PIPER_GENERATION_PROFILE[speed].multiplier;
  return String(Number(lengthScale.toFixed(3)));
}

export interface SpeechRequest {
  text: string;
  language: 'de-DE';
  speed: SpeechSpeed;
  /** Seçim yalnızca izin verilen yerel Piper profillerinden biri olabilir. */
  voice?: GermanVoiceId;
}

export interface ValidatedSpeechRequest extends SpeechRequest {
  voice: GermanVoiceId;
}

export interface AudioResult {
  url: string;
  cached: boolean;
}

export type SpeechValidation =
  | { ok: true; value: ValidatedSpeechRequest }
  | { ok: false; error: string };

const MAX_SPEECH_LENGTH = 500;

/** UI ve Node katmaninin ayni SHA-256 cache malzemesini kullanmasi icin tek kaynak. */
export function speechCacheMaterial(
  request: SpeechRequest,
  voice?: string,
  voiceVersion?: string,
): string {
  const voiceProfile = germanVoiceProfile(request.voice);
  const lengthScale = piperLengthScaleFor(request.voice, request.speed);
  return `de_DE|${voice ?? voiceProfile.model}|${voiceVersion ?? voiceProfile.version}|length_scale=${lengthScale}|${request.text.trim()}`;
}

export async function createSpeechCacheKey(request: SpeechRequest): Promise<string> {
  const bytes = new TextEncoder().encode(speechCacheMaterial(request));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateSpeechRequest(value: unknown): SpeechValidation {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Geçersiz telaffuz isteği.' };
  const candidate = value as Partial<SpeechRequest>;
  if (candidate.language !== 'de-DE') return { ok: false, error: 'Yalnızca Almanca telaffuz desteklenir.' };
  if (!isSpeechSpeed(candidate.speed)) {
    return { ok: false, error: 'Geçersiz telaffuz hızı.' };
  }
  if (candidate.voice !== undefined && !isGermanVoiceId(candidate.voice)) {
    return { ok: false, error: 'Geçersiz telaffuz sesi.' };
  }
  if (typeof candidate.text !== 'string') return { ok: false, error: 'Telaffuz metni geçersiz.' };
  const text = candidate.text.trim().replace(/\s+/g, ' ');
  if (!text || text.length > MAX_SPEECH_LENGTH || /[\u0000-\u001f]/.test(text)) {
    return { ok: false, error: 'Telaffuz metni desteklenmiyor.' };
  }
  return {
    ok: true,
    value: {
      text,
      language: 'de-DE',
      speed: candidate.speed,
      voice: candidate.voice ?? DEFAULT_GERMAN_VOICE_ID,
    },
  };
}

/** Cevabi sizdirmadan otomatik ses verilebilecek egzersizler. */
export function shouldAutoplayPrompt(exercise: Pick<Exercise, 'type' | 'wordBank' | 'audio'>): boolean {
  if (!exercise.audio?.prompt) return false;
  if (exercise.type === 'dictation' || exercise.type === 'listen-choice') return true;
  if (exercise.type === 'word-bank-translation') return exercise.wordBank?.direction === 'de-to-tr';
  // Boşluk doldurma gibi görünür ama eksik cevap içerebilen promptlar otomatik oynatılmaz.
  return exercise.type === 'multiple-choice' || exercise.type === 'error-correction';
}

export function canonicalGermanAnswer(
  exercise: Pick<Exercise, 'audio' | 'answer'>,
  result: { status: 'correct' | 'minor-typo' | 'incorrect' },
): GermanAudioTarget | undefined {
  // Statü her zaman sonuç panelini belirler; burada öğrenci girdisi hiç alınmaz.
  void result;
  return exercise.audio?.canonicalAnswer ?? findGermanAudioTarget(exercise, exercise.answer);
}

export class LocalTtsService {
  async speak(
    target: GermanAudioTarget,
    speed: SpeechSpeed,
    voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
    signal?: AbortSignal,
  ): Promise<AudioResult> {
    const request: SpeechRequest = { text: target.text, language: target.language, speed, voice };
    const checked = validateSpeechRequest(request);
    if (!checked.ok) throw new Error(checked.error);
    const response = await fetch('/api/tts/speak', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(checked.value),
      signal,
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(detail?.error ?? 'Telaffuz şu anda kullanılamıyor.');
    }
    return response.json() as Promise<AudioResult>;
  }

  async isReady(): Promise<boolean> {
    try {
      const response = await fetch('/api/tts/health');
      return response.ok && Boolean((await response.json() as { ready?: boolean }).ready);
    } catch {
      return false;
    }
  }
}

export const localTts = new LocalTtsService();
