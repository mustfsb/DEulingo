/**
 * Öğrenilen hedef dil — uygulama arayüz dili DEĞİL, çalışılan dildir.
 *
 * Arayüz (navigasyon, butonlar) Türkçe kalır; bu değer yalnızca HANGİ dilin
 * konuları/alıştırmaları/kelimeleri/ilerlemesi gösterileceğini seçer.
 *
 * - `de`: Almanca (varsayılan; mevcut davranışla birebir aynı)
 * - `en`: İngilizce (Present Perfect ile başlar)
 */

export type LearningLanguage = 'de' | 'en';

export const LEARNING_LANGUAGES: LearningLanguage[] = ['de', 'en'];

/** localStorage anahtarı: son seçilen hedef dil. */
export const LANGUAGE_STORAGE_KEY = 'learning-language';

/** Almanca ilerlemenin mevcut anahtarı — ASLA değişmez (geriye uyumluluk). */
export const DE_PROGRESS_KEY = 'almanca-alistirma:progress';

/** İngilizce ilerlemenin ayrı anahtarı — Almanca verisine dokunmaz. */
export const EN_PROGRESS_KEY = 'almanca-alistirma:progress-en';

export const DEFAULT_LEARNING_LANGUAGE: LearningLanguage = 'de';

export function isLearningLanguage(value: unknown): value is LearningLanguage {
  return value === 'de' || value === 'en';
}

export function loadLearningLanguage(storage: Storage = localStorage): LearningLanguage {
  try {
    const raw = storage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLearningLanguage(raw)) return raw;
  } catch {
    /* okunamazsa varsayılan */
  }
  return DEFAULT_LEARNING_LANGUAGE;
}

export function saveLearningLanguage(language: LearningLanguage, storage: Storage = localStorage): void {
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* kota dolu — sessizce devam et */
  }
}

/** Bu dilin ilerleme kayıtlarının tutulduğu localStorage anahtarı. */
export function progressKeyFor(language: LearningLanguage): string {
  return language === 'en' ? EN_PROGRESS_KEY : DE_PROGRESS_KEY;
}

/** Alıştırma/konu kimliğinin hangi dile ait olduğu (kimlik önekinden). */
export function languageOfTopicId(topicId: string | undefined): LearningLanguage | undefined {
  if (!topicId) return undefined;
  if (topicId === 'en.present-perfect' || topicId.startsWith('en.')) return 'en';
  if (topicId.startsWith('topic.')) return 'de';
  return undefined;
}

export function languageOfExerciseId(exerciseId: string | undefined): LearningLanguage | undefined {
  if (!exerciseId) return undefined;
  if (exerciseId.startsWith('en-') || exerciseId.startsWith('vocab-en-v-') || exerciseId.startsWith('gr-en-')) return 'en';
  return 'de';
}
