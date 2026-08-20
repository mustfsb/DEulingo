import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ContentBundle, Exercise } from '../content/types';
import { recommendNext } from './recommendation';
import { recordAttempt } from './progress';
import { createEmptyProgress, type UserProgress } from './storage';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const dayNumbers = bundle.days.map((day) => day.day);
const exercisesForDay = (day: number) => bundle.exercises.filter((exercise) => exercise.day === day);

function answerAll(
  progress: UserProgress,
  exercises: Exercise[],
  result: 'correct' | 'incorrect',
): UserProgress {
  return exercises.reduce((current, exercise) => recordAttempt(current, exercise, 'x', result), progress);
}

const base = { dayNumbers, exercisesForDay };

describe('sonraki adim onerisi', () => {
  it('hicbir sey yapilmamissa ilk gunu onerir', () => {
    const recommendation = recommendNext({ progress: createEmptyProgress(), ...base });
    expect(recommendation.kind).toBe('next-day');
    expect(recommendation.route).toEqual({ name: 'day', day: 1 });
  });

  it('yarim kalan oturum her seyin onune gecer', () => {
    const progress: UserProgress = {
      ...createEmptyProgress(),
      activeLesson: {
        mode: 'day',
        day: 2,
        sessionMode: 'full',
        queue: [
          { exerciseId: 'a', presentationReason: 'primary' },
          { exerciseId: 'b', presentationReason: 'primary' },
        ],
        index: 1,
        startedAt: '2026-08-17T09:00:00.000Z',
        results: [],
        retries: {},
      },
    };
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('resume');
    expect(recommendation.route).toEqual({ name: 'lesson', day: 2, mode: 'full', topicId: undefined });
  });

  it('yarim kalan hata tekrarina dogru rotayla doner', () => {
    const progress: UserProgress = {
      ...createEmptyProgress(),
      activeLesson: {
        mode: 'mistakes',
        day: 2,
        queue: [{ exerciseId: 'a', presentationReason: 'primary' }],
        index: 0,
        startedAt: '2026-08-17T09:00:00.000Z',
        results: [],
        retries: {},
      },
    };
    expect(recommendNext({ progress, ...base }).route).toEqual({ name: 'mistake-review', day: 2 });
  });

  it('dogrulugu dusuk kalan gunu hizli tekrara yonlendirir', () => {
    const progress = answerAll(createEmptyProgress(), exercisesForDay(1), 'incorrect');
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('weak-day');
    expect(recommendation.route).toEqual({ name: 'lesson', day: 1, mode: 'quick' });
  });

  it('tum gunler tamamsa tazeleme tekrari onerir', () => {
    let progress = createEmptyProgress();
    for (const day of dayNumbers) progress = answerAll(progress, exercisesForDay(day), 'correct');
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('refresh');
    expect(recommendation.route.name).toBe('lesson');
  });

  it('ayni durum her zaman ayni oneriyi verir (deterministik)', () => {
    const progress = answerAll(createEmptyProgress(), exercisesForDay(1), 'correct');
    expect(recommendNext({ progress, ...base })).toEqual(recommendNext({ progress, ...base }));
  });
});
