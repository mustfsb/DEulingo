import type { Exercise, SpeechAudioTarget } from '../../content/types';
import { findEnglishAudioTarget, findGermanAudioTarget } from './targets';

export type { EnglishAudioTarget, GermanAudioTarget, SpeechAudioTarget } from '../../content/types';

/** Yerel Piper kurulumunda desteklenen, Almanca için sınırlandırılmış sesler. */
export const GERMAN_VOICE_PROFILES = [
  {
    id: 'thorsten',
    label: 'Thorsten',
    description: 'Erkek · Net (mevcut)',
    model: 'de_DE-thorsten-high',
    huggingFaceDir: 'de/de_DE',
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
    huggingFaceDir: 'de/de_DE',
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
    huggingFaceDir: 'de/de_DE',
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
    huggingFaceDir: 'de/de_DE',
    repositoryPath: 'mls/medium',
    // Eski `eva` kimliği de aynı nedenle korunur.
    version: 'piper-voices-2024.06-mls-medium-speaker-120',
    speaker: 120,
    // Kalibrasyon metninde 2,98 sn.
    normalLengthScale: 0.39,
  },
] as const;

/**
 * Yerel Piper'da İngilizce (en-GB, IELTS hedefi: Britanya aksanı) sesler.
 * Almanca akışla aynı motor + aynı doğallık ayarları kullanılır; böylece
 * İngilizce de tarayıcı robot sesine kalmadan canlı okunur.
 */
export const ENGLISH_VOICE_PROFILES = [
  {
    id: 'alan',
    label: 'Alan',
    description: 'Erkek · İngiliz (Birleşik Krallık), doğal',
    gender: 'male' as const,
    model: 'en_GB-alan-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'alan/medium',
    version: 'piper-voices-2024.06-en-gb-alan-medium-natural-v1',
    normalLengthScale: 1,
  },
  {
    id: 'northern',
    label: 'Northern',
    description: 'Erkek · Kuzey İngiltere aksanı, doğal',
    gender: 'male' as const,
    model: 'en_GB-northern_english_male-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'northern_english_male/medium',
    version: 'piper-voices-2024.06-en-gb-northern-medium-natural-v1',
    normalLengthScale: 1.12,
  },
  {
    id: 'vctk',
    label: 'VCTK',
    description: 'Erkek · Edinburgh aksanı (VCTK p227), doğal',
    gender: 'male' as const,
    model: 'en_GB-vctk-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'vctk/medium',
    version: 'piper-voices-2024.06-en-gb-vctk-p227-natural-v1',
    speaker: 82,
    normalLengthScale: 1,
  },
  {
    id: 'jenny',
    label: 'Jenny',
    description: 'Kadın · İngiliz (Birleşik Krallık), doğal',
    gender: 'female' as const,
    model: 'en_GB-jenny_dioco-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'jenny_dioco/medium',
    version: 'piper-voices-2024.06-en-gb-jenny-medium-natural-v1',
    normalLengthScale: 1,
  },
  {
    id: 'cori',
    label: 'Cori',
    description: 'Kadın · İngiliz (Birleşik Krallık), doğal',
    gender: 'female' as const,
    model: 'en_GB-cori-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'cori/medium',
    version: 'piper-voices-2024.06-en-gb-cori-medium-natural-v1',
    normalLengthScale: 1,
  },
  {
    id: 'alba',
    label: 'Alba',
    description: 'Kadın · İskoç aksanı, doğal',
    gender: 'female' as const,
    model: 'en_GB-alba-medium',
    huggingFaceDir: 'en/en_GB',
    repositoryPath: 'alba/medium',
    version: 'piper-voices-2024.06-en-gb-alba-medium-natural-v1',
    normalLengthScale: 1,
  },
] as const;

export type GermanVoiceId = (typeof GERMAN_VOICE_PROFILES)[number]['id'];
export const DEFAULT_GERMAN_VOICE_ID: GermanVoiceId = 'kerstin';
export const PIPER_GERMAN_VOICE = GERMAN_VOICE_PROFILES.find((p) => p.id === DEFAULT_GERMAN_VOICE_ID)!.model;
export const PIPER_GERMAN_VOICE_VERSION = GERMAN_VOICE_PROFILES.find((p) => p.id === DEFAULT_GERMAN_VOICE_ID)!.version;

export type EnglishVoiceId = (typeof ENGLISH_VOICE_PROFILES)[number]['id'];
export const DEFAULT_ENGLISH_VOICE_ID: EnglishVoiceId = 'jenny';
export const PIPER_ENGLISH_VOICE = ENGLISH_VOICE_PROFILES.find((p) => p.id === DEFAULT_ENGLISH_VOICE_ID)!.model;
export const PIPER_ENGLISH_VOICE_VERSION = ENGLISH_VOICE_PROFILES.find((p) => p.id === DEFAULT_ENGLISH_VOICE_ID)!.version;

/** Piper ile okunabilen tüm ses kimlikleri (Almanca + İngilizce). */
export type PiperVoiceId = GermanVoiceId | EnglishVoiceId;

export function isGermanVoiceId(value: unknown): value is GermanVoiceId {
  return typeof value === 'string' && GERMAN_VOICE_PROFILES.some((profile) => profile.id === value);
}

export function isEnglishVoiceId(value: unknown): value is EnglishVoiceId {
  return typeof value === 'string' && ENGLISH_VOICE_PROFILES.some((profile) => profile.id === value);
}

export function isPiperVoiceId(value: unknown): value is PiperVoiceId {
  return isGermanVoiceId(value) || isEnglishVoiceId(value);
}

export function germanVoiceProfile(voice: GermanVoiceId | undefined = DEFAULT_GERMAN_VOICE_ID) {
  return GERMAN_VOICE_PROFILES.find((profile) => profile.id === voice) ?? GERMAN_VOICE_PROFILES.find((p) => p.id === DEFAULT_GERMAN_VOICE_ID)!;
}

export function englishVoiceProfile(voice: EnglishVoiceId | undefined = DEFAULT_ENGLISH_VOICE_ID) {
  return ENGLISH_VOICE_PROFILES.find((profile) => profile.id === voice) ?? ENGLISH_VOICE_PROFILES.find((p) => p.id === DEFAULT_ENGLISH_VOICE_ID)!;
}

/** Dile göre doğru profil (tür güvenli değilse o dilin varsayılanı). */
export function voiceProfileFor(language: 'de-DE' | 'en-GB', voice?: string) {
  if (language === 'en-GB') {
    return isEnglishVoiceId(voice)
      ? ENGLISH_VOICE_PROFILES.find((p) => p.id === voice)!
      : englishVoiceProfile();
  }
  return isGermanVoiceId(voice)
    ? GERMAN_VOICE_PROFILES.find((p) => p.id === voice)!
    : germanVoiceProfile();
}

/**
 * Almanca ses tercihinden İngilizce Piper karşılığı (cinsiyet eşlemesi).
 * Mevcut tek `speechVoice` ayarı böylece iki dilde de doğal kalır;
 * ayrı bir ayar/aşama gerekmez.
 */
export function englishVoiceForGermanVoice(voice: GermanVoiceId | undefined): EnglishVoiceId {
  if (voice === 'thorsten' || voice === 'thorsten-soft') return 'alan';
  return 'jenny';
}

/** İngilizce sesten Almanca karşılığı (yalnızca tür uyumu gerektiğinde). */
export function germanVoiceForEnglishVoice(voice: EnglishVoiceId | undefined): GermanVoiceId {
  if (voice && englishVoiceProfile(voice).gender === 'male') return 'thorsten';
  return DEFAULT_GERMAN_VOICE_ID;
}

/** İngilizce sesin cinsiyeti (ayar ekranı eşlemesi için). */
export function englishVoiceGender(voice: string): 'male' | 'female' {
  if (isEnglishVoiceId(voice)) return englishVoiceProfile(voice).gender;
  return 'female';
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
  voice: PiperVoiceId | undefined = DEFAULT_GERMAN_VOICE_ID,
  speed: SpeechSpeed,
): string {
  const profile =
    (GERMAN_VOICE_PROFILES as readonly { id: string; normalLengthScale: number }[]).find((p) => p.id === voice) ??
    (ENGLISH_VOICE_PROFILES as readonly { id: string; normalLengthScale: number }[]).find((p) => p.id === voice) ??
    (GERMAN_VOICE_PROFILES as readonly { id: string; normalLengthScale: number }[]).find((p) => p.id === DEFAULT_GERMAN_VOICE_ID)!;
  const lengthScale = profile.normalLengthScale * PIPER_GENERATION_PROFILE[speed].multiplier;
  return String(Number(lengthScale.toFixed(3)));
}

export type SpeechLanguage = 'de-DE' | 'en-GB';

export interface SpeechRequest {
  text: string;
  language: SpeechLanguage;
  speed: SpeechSpeed;
  /** Seçim yalnızca izin verilen yerel Piper profillerinden biri olabilir. */
  voice?: string;
}

export interface ValidatedSpeechRequest extends SpeechRequest {
  voice: string;
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
  const voiceProfile = voiceProfileFor(request.language, request.voice);
  const lengthScale = piperLengthScaleFor(request.voice as PiperVoiceId | undefined, request.speed);
  const localePrefix = request.language === 'en-GB' ? 'en_GB' : 'de_DE';
  // Doğallık sentez parametreleri (v3): cümle arası sessizlik + hafif
  // varyasyon. Malzemeye girer; eski robotik WAV'lar otomatik yenilenir.
  const synthesis = 'ns=0.8|nw=0.85|ss=0.25';
  return `${localePrefix}|${voice ?? voiceProfile.model}|${voiceVersion ?? voiceProfile.version}|length_scale=${lengthScale}|${synthesis}|${request.text.trim()}`;
}

export async function createSpeechCacheKey(request: SpeechRequest): Promise<string> {
  const bytes = new TextEncoder().encode(speechCacheMaterial(request));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateSpeechRequest(value: unknown): SpeechValidation {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Geçersiz telaffuz isteği.' };
  const candidate = value as Partial<SpeechRequest>;
  if (candidate.language !== 'de-DE' && candidate.language !== 'en-GB') {
    return { ok: false, error: 'Yalnızca Almanca ve İngilizce telaffuz desteklenir.' };
  }
  if (!isSpeechSpeed(candidate.speed)) {
    return { ok: false, error: 'Geçersiz telaffuz hızı.' };
  }
  if (
    candidate.voice !== undefined &&
    !isGermanVoiceId(candidate.voice) &&
    !isEnglishVoiceId(candidate.voice)
  ) {
    return { ok: false, error: 'Geçersiz telaffuz sesi.' };
  }
  if (typeof candidate.text !== 'string') return { ok: false, error: 'Telaffuz metni geçersiz.' };
  const text = candidate.text.trim().replace(/\s+/g, ' ');
  if (!text || text.length > MAX_SPEECH_LENGTH || /[\u0000-\u001f]/.test(text)) {
    return { ok: false, error: 'Telaffuz metni desteklenmiyor.' };
  }
  // Tek ses ayarı iki dilde de doğal kalsın: Almanca kimlik İngilizce
  // istekte cinsiyete göre eşlenir (tersi de aynıdır).
  let voice: string;
  if (candidate.language === 'en-GB') {
    if (isEnglishVoiceId(candidate.voice)) voice = candidate.voice;
    else if (isGermanVoiceId(candidate.voice)) voice = englishVoiceForGermanVoice(candidate.voice);
    else voice = DEFAULT_ENGLISH_VOICE_ID;
  } else {
    if (isGermanVoiceId(candidate.voice)) voice = candidate.voice;
    else if (isEnglishVoiceId(candidate.voice)) voice = germanVoiceForEnglishVoice(candidate.voice);
    else voice = DEFAULT_GERMAN_VOICE_ID;
  }
  return {
    ok: true,
    value: {
      text,
      language: candidate.language,
      speed: candidate.speed,
      voice,
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
): SpeechAudioTarget | undefined {
  // Statü her zaman sonuç panelini belirler; burada öğrenci girdisi hiç alınmaz.
  void result;
  return (
    exercise.audio?.canonicalAnswer ??
    findGermanAudioTarget(exercise, exercise.answer) ??
    findEnglishAudioTarget(exercise, exercise.answer)
  );
}

export class LocalTtsService {
  async speak(
    target: SpeechAudioTarget,
    speed: SpeechSpeed,
    voice?: string,
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
