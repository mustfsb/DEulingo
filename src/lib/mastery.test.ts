import { describe, expect, it } from 'vitest';
import type { Exercise } from '../content/types';
import { computeConceptProgress, computeTopicMastery, masteryWeight, MASTERY_WEIGHTS } from './mastery';
import { recordAttempt } from './progress';
import { createEmptyProgress, type UserProgress } from './storage';

function exercise(id: string, overrides: Partial<Exercise> = {}): Exercise {
  return {
    id,
    day: 2,
    topic: 'Fiil Çekimi',
    topicId: 'day2.fiil-cekimi',
    type: 'fill-blank',
    instruction: 'test',
    answer: 'kommst',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.konjugation.du-st'],
    origin: 'authored',
    source: { file: 'authored', day: 2, naturalKey: `authored/${id}` },
    ...overrides,
  };
}

function answerAll(
  exercises: Exercise[],
  results: Array<'correct' | 'incorrect' | 'minor-typo'>,
): UserProgress {
  let progress = createEmptyProgress();
  exercises.forEach((item, index) => {
    progress = recordAttempt(progress, item, 'x', results[index] ?? 'correct');
  });
  return progress;
}

describe('ustalik agirliklari', () => {
  it('uretim, tanimadan daha guclu kanittir', () => {
    expect(MASTERY_WEIGHTS['free-text']).toBeGreaterThan(MASTERY_WEIGHTS['multiple-choice']);
    expect(MASTERY_WEIGHTS['error-correction']).toBeGreaterThan(MASTERY_WEIGHTS['fill-blank']);
    expect(MASTERY_WEIGHTS['fill-blank']).toBeGreaterThan(MASTERY_WEIGHTS.matching);
  });

  it('alistirma kendi agirligini ezebilir', () => {
    expect(masteryWeight(exercise('a', { masteryWeight: 2 }))).toBe(2);
    expect(masteryWeight(exercise('b', { type: 'free-text' }))).toBe(MASTERY_WEIGHTS['free-text']);
  });
});

describe('kavram ilerlemesi', () => {
  it('hic denenmemis kavram kayitta yer almaz', () => {
    const result = computeConceptProgress(createEmptyProgress(), [exercise('a')]);
    expect(result.size).toBe(0);
  });

  it('dogru cevaplar ustaligi artirir', () => {
    const items = [exercise('a'), exercise('b'), exercise('c')];
    const progress = answerAll(items, ['correct', 'correct', 'correct']);
    const concept = computeConceptProgress(progress, items).get('day2.konjugation.du-st');
    expect(concept?.correct).toBe(3);
    expect(concept?.masteryScore).toBeGreaterThan(0.9);
  });

  it('yanlis cevaplar ustaligi dusurur', () => {
    const items = [exercise('a'), exercise('b'), exercise('c')];
    const good = answerAll(items, ['correct', 'correct', 'correct']);
    const bad = answerAll(items, ['incorrect', 'incorrect', 'correct']);
    const goodScore = computeConceptProgress(good, items).get('day2.konjugation.du-st')!.masteryScore;
    const badScore = computeConceptProgress(bad, items).get('day2.konjugation.du-st')!.masteryScore;
    expect(badScore).toBeLessThan(goodScore);
  });

  it('tek bir dogru cevap tam ustalik saymaz (maruziyet guveni)', () => {
    const items = [exercise('a')];
    const progress = answerAll(items, ['correct']);
    const concept = computeConceptProgress(progress, items).get('day2.konjugation.du-st');
    expect(concept?.masteryScore).toBeLessThan(0.5);
  });

  it('coktan secmeli dogru, serbest metin dogrudan daha az katki verir', () => {
    const mc = [exercise('a', { type: 'multiple-choice' })];
    const free = [exercise('b', { type: 'free-text' })];
    const mcScore = computeConceptProgress(answerAll(mc, ['correct']), mc).get(
      'day2.konjugation.du-st',
    )!.masteryScore;
    const freeScore = computeConceptProgress(answerAll(free, ['correct']), free).get(
      'day2.konjugation.du-st',
    )!.masteryScore;
    expect(freeScore).toBeGreaterThan(mcScore);
  });

  it('yazim hatasi kismi kredi alir', () => {
    const items = [exercise('a'), exercise('b'), exercise('c')];
    const typo = answerAll(items, ['minor-typo', 'minor-typo', 'minor-typo']);
    const correct = answerAll(items, ['correct', 'correct', 'correct']);
    const wrong = answerAll(items, ['incorrect', 'incorrect', 'incorrect']);
    const score = (progress: UserProgress) =>
      computeConceptProgress(progress, items).get('day2.konjugation.du-st')!.masteryScore;
    expect(score(typo)).toBeLessThan(score(correct));
    expect(score(typo)).toBeGreaterThan(score(wrong));
  });

  it('bir alistirma birden fazla kavrama kanit yazar', () => {
    const items = [exercise('a', { conceptIds: ['c1', 'c2'] })];
    const result = computeConceptProgress(answerAll(items, ['correct']), items);
    expect([...result.keys()].sort()).toEqual(['c1', 'c2']);
  });
});

describe('konu ustaligi', () => {
  const topics = [{ id: 'day2.fiil-cekimi', title: 'Fiil Çekimi', conceptIds: ['c1', 'c2'] }];

  it('hic calisilmamis konu sifirdir', () => {
    const result = computeTopicMastery(createEmptyProgress(), [], topics);
    expect(result[0].masteryScore).toBe(0);
    expect(result[0].practiced).toBe(0);
  });

  it('yalnizca bir kavram calisildiysa konu tam sayilmaz', () => {
    const items = [exercise('a', { conceptIds: ['c1'] })];
    const result = computeTopicMastery(answerAll(items, ['correct']), items, topics);
    expect(result[0].practiced).toBe(1);
    expect(result[0].masteryScore).toBeLessThan(0.5);
  });
});
