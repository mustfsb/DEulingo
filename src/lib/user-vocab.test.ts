import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enContent, deContent } from './content-en';
import { addReadingVocab, emptySkills, loadSkills, removeReadingVocab, sanitizeReadingVocab, saveSkills } from './skills-storage';
import { setUserVocabulary, userVocabId } from '../content/en/user-vocab';
import { buildVocabSession, vocabPoolForTopic, type VocabKind } from './vocab/questions';
import { computeVocabProgress } from './vocab/mastery';
import { deterministicValidate } from './semantic/validate-answer';
import { createEmptyProgress, loadProgress, saveProgress } from './storage';
import { recordAttempt } from './progress';
import { languageOfExerciseId, progressKeyFor } from './language';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { VOCAB_BY_ID, VOCABULARY } from '../content/vocabulary/inventory';

const topicOf = (passageId: string) => EN_READING_BY_ID.get(passageId)?.topicTags[0];

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k),
    clear: () => map.clear(), key: (i) => [...map.keys()][i] ?? null, get length() { return map.size; },
  } as Storage;
}

const CHUNK = 'en-uv-fit-into-a-busy-day';

/** Öğrencinin öbeğini ölçen yazma sorusunu bulana dek tohumları dener. */
function typingQuestion(kind: 'trde' | 'type', suffix: string, progress = createEmptyProgress()) {
  for (let s = 0; s < 120; s += 1) {
    const found = buildVocabSession({
      kind, topicId: 'en.prepositions-collocations', size: 'normal', seed: `typing:${kind}:${s}`,
      progress, inventory: enContent.vocabulary,
    }).find((x) => x.primaryVocabId === CHUNK && x.exercise.id.endsWith(suffix));
    if (found) return found;
  }
  return undefined;
}

function withSaved() {
  let state = emptySkills();
  state = addReadingVocab(state, { en: 'fit into a busy day', tr: 'yoğun güne sığmak' }, 'en-read-w1-2', '2026-10-04T10:00:00.000Z');
  state = addReadingVocab(state, { en: 'overflow', tr: 'taşmak' }, 'en-read-w1-1', '2026-10-04T10:01:00.000Z');
  setUserVocabulary(state.readingVocab, topicOf);
  return state;
}

beforeEach(() => setUserVocabulary([], topicOf));
afterEach(() => setUserVocabulary([], topicOf));

describe('Okuma → kelime kaydı', () => {
  it('seçilen öğe tüm meta veriyle saklanır; öbek bütün kalır', () => {
    const state = withSaved();
    expect(state.readingVocab[0]).toEqual({
      id: CHUNK, en: 'fit into a busy day', tr: 'yoğun güne sığmak', type: 'phrase', chunk: true,
      passageId: 'en-read-w1-2', at: '2026-10-04T10:00:00.000Z',
    });
    expect(state.readingVocab[1]).toMatchObject({ en: 'overflow', chunk: false, type: 'other' });
    // 'busy' ya da 'fit' tek başına eklenmedi
    expect(state.readingVocab.map((v) => v.en)).not.toContain('busy');
  });

  it('otomatik eklenmez, kopya eklenmez, kaldırılabilir', () => {
    expect(emptySkills().readingVocab).toEqual([]);
    const once = addReadingVocab(emptySkills(), { en: 'fit into a busy day', tr: 'yoğun güne sığmak' }, 'en-read-w1-2');
    expect(addReadingVocab(once, { en: 'Fit into a busy day', tr: 'x' }, 'en-read-w1-2').readingVocab).toHaveLength(1);
    expect(removeReadingVocab(once, CHUNK).readingVocab).toEqual([]);
  });

  it('kalıcı: kaydet → yeniden yükle', () => {
    const storage = memoryStorage();
    saveSkills(withSaved(), storage);
    expect(loadSkills(storage).readingVocab.map((v) => v.id)).toEqual([CHUNK, 'en-uv-overflow']);
  });

  it('eski kayıtlar (id/tür yok) geriye uyumlu yüklenir', () => {
    const migrated = sanitizeReadingVocab([{ en: 'take a test', tr: 'sınava girmek', passageId: 'en-read-1', at: '2026-01-01T00:00:00Z' }, { bozuk: true }]);
    expect(migrated).toEqual([{ id: 'en-uv-take-a-test', en: 'take a test', tr: 'sınava girmek', type: 'phrase', chunk: true, passageId: 'en-read-1', at: '2026-01-01T00:00:00Z' }]);
  });
});

describe('İngilizce kelime envanterine girer', () => {
  it('İngilizce cephe görür; kimlik/yol doğru', () => {
    withSaved();
    expect(enContent.vocabulary.some((v) => v.id === CHUNK)).toBe(true);
    expect(enContent.vocabById.get(CHUNK)?.german).toBe('fit into a busy day');
    // öbek Prepositions & Collocations kelime havuzuna da girer
    expect(vocabPoolForTopic('en.prepositions-collocations', enContent.vocabulary).some((v) => v.id === CHUNK)).toBe(true);
    expect(languageOfExerciseId(`vocab-${CHUNK}-trde-type`)).toBe('en');
    expect(languageOfExerciseId('vocab-match-en-uv-a+en-uv-b-de-tr')).toBe('en');
  });

  it('her çalışma türünde sorulur (İng→Tr, Tr→İng, eşleştirme, yazma, zayıf, dinleme, kart, karışık)', () => {
    withSaved();
    const kinds: VocabKind[] = ['detr', 'trde', 'match', 'type', 'weak', 'listen', 'flash', 'mixed'];
    for (const kind of kinds) {
      let found = false;
      for (let s = 0; s < 80 && !found; s += 1) {
        const questions = buildVocabSession({
          kind, topicId: 'en.prepositions-collocations', size: 'normal', seed: `uv:${kind}:${s}`,
          progress: createEmptyProgress(), inventory: enContent.vocabulary,
        });
        found = questions.some((q) => q.vocabIds.includes(CHUNK));
      }
      expect(found, `${kind} içinde öbek hiç sorulmadı`).toBe(true);
    }
  });

  it('genel (konusuz) kelime oturumu da öğrencinin eklediklerini kapsar', () => {
    withSaved();
    const reached = new Set<string>();
    for (let s = 0; s < 60; s += 1) {
      buildVocabSession({ kind: 'mixed', size: 'full', seed: `g:${s}`, progress: createEmptyProgress(), inventory: enContent.vocabulary })
        .forEach((q) => q.vocabIds.forEach((id) => reached.add(id)));
    }
    expect(reached.has(CHUNK) && reached.has('en-uv-overflow')).toBe(true);
  });

  it('yazma doğrulaması öbeği bütün ister (fit into a busy → yanlış)', () => {
    withSaved();
    const q = typingQuestion('trde', '-trde-type');
    expect(q).toBeTruthy();
    expect(deterministicValidate(q!.exercise, 'fit into a busy day').status).toBe('correct');
    expect(deterministicValidate(q!.exercise, 'fit into a busy').status).not.toBe('correct');
    expect(typingQuestion('type', '-trde-type')).toBeTruthy();
  });
});

describe('ustalık kalıcılığı', () => {
  it('doğru cevaplar öğeyi new → mastered yapar ve ilerleme yenilemede korunur', () => {
    withSaved();
    const inventory = enContent.vocabulary;
    let progress = createEmptyProgress();
    expect(computeVocabProgress(progress, inventory).get(CHUNK)?.state).toBe('new');

    for (let round = 0; round < 4; round += 1) {
      const q = typingQuestion('trde', '-trde-type')!;
      progress = recordAttempt(progress, q.exercise, 'fit into a busy day', 'correct');
    }
    expect(computeVocabProgress(progress, inventory).get(CHUNK)?.state).toBe('mastered');

    // İngilizce ilerleme deposuna yaz → yeniden yükle → ustalık aynı
    const storage = memoryStorage();
    saveProgress(progress, storage, progressKeyFor('en'));
    const reloaded = loadProgress(storage, undefined, progressKeyFor('en'));
    const state = computeVocabProgress(reloaded, inventory).get(CHUNK);
    expect(state?.state).toBe('mastered');
    expect(state?.attempts).toBe(4);
    // Almanca deposu etkilenmez
    expect(storage.getItem(progressKeyFor('de'))).toBeNull();
  });

  it('yanlış cevap öğeyi zayıf listesine alır', () => {
    withSaved();
    const inventory = enContent.vocabulary;
    let progress = createEmptyProgress();
    for (let round = 0; round < 2; round += 1) {
      const q = typingQuestion('trde', '-trde-type')!;
      progress = recordAttempt(progress, q.exercise, 'fit into a busy', 'incorrect');
    }
    expect(computeVocabProgress(progress, inventory).get(CHUNK)?.state).toBe('weak');
  });
});

describe('Almanca ile karışmaz', () => {
  it('Almanca cephe ve envanter öğrenci seçimlerini ASLA görmez', () => {
    withSaved();
    expect(deContent.vocabulary.some((v) => v.id.startsWith('en-uv-'))).toBe(false);
    expect(deContent.vocabulary).toBe(VOCABULARY);
    expect(deContent.vocabById.has(CHUNK)).toBe(false);
    expect(VOCAB_BY_ID.has(CHUNK)).toBe(false);
    expect(VOCABULARY.some((v) => v.id.startsWith('en-'))).toBe(false);
  });

  it('seçimler temizlenince İngilizce envanter de eski hâline döner', () => {
    withSaved();
    expect(enContent.vocabulary.some((v) => v.id === CHUNK)).toBe(true);
    setUserVocabulary([], topicOf);
    expect(enContent.vocabulary.some((v) => v.id === CHUNK)).toBe(false);
    expect(userVocabId('Fit into a busy day')).toBe(CHUNK);
  });
});

describe('envanterde zaten olan öbekler', () => {
  it('seçim saklanır ama ikinci (kopya) çalışma kaydı açılmaz; mevcut kayda bağlanır', () => {
    let state = emptySkills();
    state = addReadingVocab(state, { en: 'pay attention to', tr: 'dikkat etmek' }, 'en-read-w1-2');
    state = addReadingVocab(state, { en: 'be afraid of', tr: 'korkmak' }, 'en-read-w1-2');
    expect(state.readingVocab.map((v) => v.linkedId)).toEqual(['en-v-pay-attention', 'en-v-afraid-of']);
    setUserVocabulary(state.readingVocab, topicOf);
    const staticCount = enContent.vocabulary.filter((v) => v.base === 'pay attention to').length;
    expect(staticCount).toBe(1);
    expect(enContent.vocabulary.some((v) => v.id === 'en-uv-pay-attention-to')).toBe(false);
    // yine de çalışma sistemine girmiştir (mevcut kayıt üzerinden)
    expect(enContent.vocabById.has('en-v-pay-attention')).toBe(true);
  });
});
