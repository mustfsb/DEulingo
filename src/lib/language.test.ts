import { describe, expect, it } from 'vitest';
import {
  createEmptyProgress,
  loadProgress,
  saveProgress,
} from './storage';
import { recordAttempt } from './progress';
import {
  DE_PROGRESS_KEY,
  DEFAULT_LEARNING_LANGUAGE,
  EN_PROGRESS_KEY,
  LANGUAGE_STORAGE_KEY,
  isLearningLanguage,
  languageOfExerciseId,
  languageOfTopicId,
  loadLearningLanguage,
  progressKeyFor,
  saveLearningLanguage,
} from './language';

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

describe('öğrenme dili', () => {
  it('tercih yoksa Almanca varsayılır (geriye uyumlu)', () => {
    expect(loadLearningLanguage(memoryStorage())).toBe('de');
    expect(DEFAULT_LEARNING_LANGUAGE).toBe('de');
  });

  it('seçim saklanır ve geri yüklenir (en → en, de → de)', () => {
    const storage = memoryStorage();
    saveLearningLanguage('en', storage);
    expect(storage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(loadLearningLanguage(storage)).toBe('en');
    saveLearningLanguage('de', storage);
    expect(loadLearningLanguage(storage)).toBe('de');
  });

  it('bozuk değer güvenli varsayılana düşer', () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    expect(loadLearningLanguage(storage)).toBe('de');
    expect(isLearningLanguage('fr')).toBe(false);
    expect(isLearningLanguage('en')).toBe(true);
  });

  it('ilerleme anahtarları dile göre ayrılır', () => {
    expect(progressKeyFor('de')).toBe(DE_PROGRESS_KEY);
    expect(progressKeyFor('en')).toBe(EN_PROGRESS_KEY);
    expect(DE_PROGRESS_KEY).not.toBe(EN_PROGRESS_KEY);
  });

  it('kimlik önekinden dil bulunur', () => {
    expect(languageOfTopicId('en.present-perfect')).toBe('en');
    expect(languageOfTopicId('topic.perfekt')).toBe('de');
    expect(languageOfTopicId(undefined)).toBeUndefined();
    expect(languageOfExerciseId('en-pp-v3-fill-seen')).toBe('en');
    expect(languageOfExerciseId('pf-formula-habe-fill')).toBe('de');
  });

  it('Almanca ve İngilizce ilerleme birbirine karışmaz', () => {
    const storage = memoryStorage();
    const deExercise = {
      id: 'pf-formula-habe-fill', topicId: 'topic.perfekt', topic: 'Perfekt', type: 'free-text',
      instruction: 'x', difficulty: 'easy', skill: 'production', conceptIds: ['c'],
      origin: 'authored', source: { file: 't', naturalKey: 't' },
    } as never;
    const enExercise = {
      id: 'en-pp-v3-fill-seen', topicId: 'en.present-perfect', topic: 'Present Perfect', type: 'fill-blank',
      instruction: 'x', difficulty: 'easy', skill: 'recall', conceptIds: ['pp.v3.irregular-core'],
      origin: 'authored', source: { file: 't', naturalKey: 't' },
    } as never;

    const de = recordAttempt(createEmptyProgress(), deExercise, 'habe', 'correct', undefined, {});
    saveProgress(de, storage, DE_PROGRESS_KEY);
    const en = recordAttempt(createEmptyProgress(), enExercise, 'seen', 'correct', undefined, {});
    saveProgress(en, storage, EN_PROGRESS_KEY);

    const reloadedDe = loadProgress(storage, undefined, DE_PROGRESS_KEY);
    const reloadedEn = loadProgress(storage, undefined, EN_PROGRESS_KEY);
    // Almanca diliminde İngilizce kayıt yok, tersi de yok.
    expect(Object.keys(reloadedDe.exercises)).toEqual(['pf-formula-habe-fill']);
    expect(Object.keys(reloadedEn.exercises)).toEqual(['en-pp-v3-fill-seen']);
    expect(reloadedDe.stats.totalCorrect).toBe(1);
    expect(reloadedEn.stats.totalCorrect).toBe(1);
  });

  it('İngilizceyi sıfırlamak Almancaya dokunmaz', () => {
    const storage = memoryStorage();
    const deExercise = {
      id: 'pf-formula-habe-fill', topicId: 'topic.perfekt', topic: 'Perfekt', type: 'free-text',
      instruction: 'x', difficulty: 'easy', skill: 'production', conceptIds: ['c'],
      origin: 'authored', source: { file: 't', naturalKey: 't' },
    } as never;
    saveProgress(recordAttempt(createEmptyProgress(), deExercise, 'habe', 'correct', undefined, {}), storage, DE_PROGRESS_KEY);
    saveProgress(createEmptyProgress(), storage, EN_PROGRESS_KEY);
    expect(loadProgress(storage, undefined, DE_PROGRESS_KEY).stats.totalAttempts).toBe(1);
    expect(loadProgress(storage, undefined, EN_PROGRESS_KEY).stats.totalAttempts).toBe(0);
  });
});
