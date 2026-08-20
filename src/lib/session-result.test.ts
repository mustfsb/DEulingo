import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ContentBundle, Exercise } from '../content/types';
import {
  buildLessonResult,
  buildMistakeQueueIds,
  completeLesson,
  hasReviewableMistakes,
} from './session-result';
import { createEmptyProgress, loadProgress, saveProgress, type ActiveLesson } from './storage';
import { dailyKey } from './daily-goal';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const byId = new Map(bundle.exercises.map((exercise) => [exercise.id, exercise]));
const lookup = (id: string) => byId.get(id);
const day2 = bundle.exercises.filter((exercise) => exercise.day === 2);

function lesson(
  results: ActiveLesson['results'],
  overrides: Partial<ActiveLesson> = {},
): ActiveLesson {
  return {
    mode: 'day',
    day: 2,
    sessionMode: 'full',
    queue: results.map((item) => ({ exerciseId: item.exerciseId, presentationReason: 'primary' as const })),
    index: results.length,
    startedAt: '2026-08-17T09:00:00.000Z',
    results,
    retries: {},
    streak: { current: 3, best: 6, firedMilestones: [5] },
    ...overrides,
  };
}

const ids = day2.slice(0, 5).map((exercise: Exercise) => exercise.id);

describe('ders sonucu', () => {
  it('sayimlari, dogrulugu ve hata kimliklerini yapili bicimde uretir', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'correct' },
        { exerciseId: ids[1], result: 'minor-typo' },
        { exerciseId: ids[2], result: 'incorrect' },
        { exerciseId: ids[3], result: 'skipped' },
        { exerciseId: ids[4], result: 'self-assessed' },
      ]),
      { lookup, completedAt: '2026-08-17T09:20:00.000Z' },
    );

    expect(result.total).toBe(5);
    expect(result.correctCount).toBe(1);
    expect(result.typoCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.selfAssessedCount).toBe(1);
    // Atlanan soru dogrulugu dusurmez: puanlanan 3 denemenin 2'si dogru.
    expect(result.accuracy).toBeCloseTo(2 / 3);
    expect(result.incorrectExerciseIds).toEqual([ids[2]]);
    expect(result.typoExerciseIds).toEqual([ids[1]]);
    expect(result.skippedExerciseIds).toEqual([ids[3]]);
    expect(result.day).toBe(2);
    expect(result.sessionMode).toBe('full');
    expect(result.bestStreak).toBe(6);
    expect(result.perfect).toBe(false);
  });

  it('hatasiz ve yazim hatasiz dersi mukemmel isaretler', () => {
    const result = buildLessonResult(
      lesson(ids.map((exerciseId) => ({ exerciseId, result: 'correct' as const }))),
      { lookup },
    );
    expect(result.perfect).toBe(true);
    expect(result.accuracy).toBe(1);
    expect(hasReviewableMistakes(result)).toBe(false);
  });

  it('kucuk yazim hatasi mukemmel dersi bozar', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'correct' },
        { exerciseId: ids[1], result: 'minor-typo' },
      ]),
      { lookup },
    );
    expect(result.perfect).toBe(false);
  });

  it('konu ve kavram kirilimini sonuca yazar', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'correct' },
        { exerciseId: ids[1], result: 'incorrect' },
      ]),
      { lookup },
    );
    expect(result.topics.length).toBeGreaterThan(0);
    expect(result.topics.every((topic) => topic.total > 0)).toBe(true);
    const wrongConcepts = byId.get(ids[1])!.conceptIds;
    if (wrongConcepts.length) {
      expect(result.weakestConceptIds).toContain(wrongConcepts[0]);
    }
  });
});

describe('hata tekrari kuyrugu', () => {
  it('yanlislari, atlananlari ve israrli yazim hatalarini sirayla alir', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'correct' },
        { exerciseId: ids[1], result: 'incorrect' },
        { exerciseId: ids[2], result: 'skipped' },
        { exerciseId: ids[3], result: 'minor-typo' },
      ]),
      { lookup },
    );
    const queue = buildMistakeQueueIds(result, {
      mistakes: {
        [ids[3]]: {
          exerciseId: ids[3],
          day: 2,
          topic: 't',
          prompt: 'p',
          userAnswer: 'a',
          expectedAnswer: 'b',
          count: 0,
          typoCount: 3,
          lastOccurredAt: '2026-08-17T09:10:00.000Z',
          type: 'spelling',
        },
      },
      exists: (id) => byId.has(id),
    });

    expect(queue).toEqual([ids[1], ids[2], ids[3]]);
    // Dogru cevaplanan soru tekrar oturumuna sizmaz.
    expect(queue).not.toContain(ids[0]);
  });

  it('kuyrugu tekillestirir ve icerikte olmayan kimlikleri atar', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[1], result: 'incorrect' },
        { exerciseId: ids[1], result: 'incorrect', presentationReason: 'mistake-retry' },
        { exerciseId: 'silinmis-alistirma', result: 'incorrect' },
      ]),
      { lookup },
    );
    expect(buildMistakeQueueIds(result, { exists: (id) => byId.has(id) })).toEqual([ids[1]]);
  });

  it('ders icinde duzeltilen yanlisi tekrar kuyruguna ALMAZ', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'incorrect' },
        { exerciseId: ids[1], result: 'incorrect' },
        // Ders ici tekrarda dogru cevaplandi: artik cozulmus sayilir.
        { exerciseId: ids[0], result: 'correct', presentationReason: 'mistake-retry' },
      ]),
      { lookup },
    );

    expect(result.incorrectExerciseIds).toEqual([ids[0], ids[1]]);
    expect(result.unresolvedExerciseIds).toEqual([ids[1]]);
    expect(buildMistakeQueueIds(result, { exists: (id) => byId.has(id) })).toEqual([ids[1]]);
  });

  it('tekrar oturumunda hepsi dogruysa yeni bir tekrar onerilmez', () => {
    const review = buildLessonResult(
      lesson(
        [
          { exerciseId: ids[0], result: 'correct' },
          { exerciseId: ids[1], result: 'correct' },
        ],
        { mode: 'mistakes', sessionMode: undefined },
      ),
      { lookup },
    );
    expect(review.unresolvedExerciseIds).toEqual([]);
    expect(hasReviewableMistakes(review)).toBe(false);
  });

  it('hatasiz derste bos kuyruk dondurur (bos ders acilmaz)', () => {
    const result = buildLessonResult(
      lesson([{ exerciseId: ids[0], result: 'correct' }]),
      { lookup },
    );
    expect(buildMistakeQueueIds(result)).toEqual([]);
  });
});

describe('ders kapanisi', () => {
  it('aktif dersi temizler, gun sayacini artirir ve sonucu saklar', () => {
    const result = buildLessonResult(lesson([{ exerciseId: ids[0], result: 'correct' }]), { lookup });
    const completedAt = new Date('2026-08-17T09:30:00.000Z');
    const next = completeLesson(createEmptyProgress(), result, completedAt);

    expect(next.activeLesson).toBeUndefined();
    expect(next.days[2].sessionsCompleted).toBe(1);
    expect(next.lastResult?.sessionId).toBe(result.sessionId);
    expect(next.daily[dailyKey(completedAt)].sessions).toBe(1);
  });

  it('yeni ders bitince eski sonucun yerini alir (bayat sonuc kalmaz)', () => {
    const first = buildLessonResult(lesson([{ exerciseId: ids[0], result: 'incorrect' }]), { lookup });
    const second = buildLessonResult(
      lesson([{ exerciseId: ids[1], result: 'correct' }], {
        day: 3,
        startedAt: '2026-08-17T10:00:00.000Z',
      }),
      { lookup },
    );

    const after = completeLesson(completeLesson(createEmptyProgress(), first), second);
    expect(after.lastResult?.day).toBe(3);
    expect(after.lastResult?.incorrectExerciseIds).toEqual([]);
    expect(after.lastResult?.sessionId).not.toBe(first.sessionId);
  });

  it('sonuc sayfa yenilemesine dayanir (localStorage donusu)', () => {
    const result = buildLessonResult(
      lesson([
        { exerciseId: ids[0], result: 'incorrect' },
        { exerciseId: ids[1], result: 'correct' },
      ]),
      { lookup },
    );
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    } as unknown as Storage;

    saveProgress(completeLesson(createEmptyProgress(), result), storage);
    const reloaded = loadProgress(storage);

    expect(reloaded.lastResult?.sessionId).toBe(result.sessionId);
    expect(reloaded.lastResult?.incorrectExerciseIds).toEqual([ids[0]]);
    expect(reloaded.lastResult?.day).toBe(2);
  });
});
