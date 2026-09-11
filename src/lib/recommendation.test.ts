import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ContentBundle, Exercise } from '../content/types';
import { recommendNext } from './recommendation';
import { recordAttempt } from './progress';
import { createEmptyProgress, type UserProgress } from './storage';
import { T } from '../content/curriculum/topics';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const topics = bundle.topics.map((topic) => ({ id: topic.id, title: topic.title }));
const exercisesForTopic = (topicId: string) =>
  bundle.exercises.filter((exercise) => !exercise.reviewOnly && exercise.topicId === topicId);

function answerAll(progress: UserProgress, exercises: Exercise[], result: 'correct' | 'incorrect'): UserProgress {
  return exercises.reduce((current, exercise) => recordAttempt(current, exercise, 'x', result), progress);
}

const base = { topics, exercisesForTopic };
const lessonAt = (overrides: Partial<NonNullable<UserProgress['activeLesson']>>): UserProgress => ({
  ...createEmptyProgress(),
  activeLesson: {
    mode: 'topic',
    queue: [
      { exerciseId: 'a', presentationReason: 'primary' },
      { exerciseId: 'b', presentationReason: 'primary' },
    ],
    index: 1,
    startedAt: '2026-08-17T09:00:00.000Z',
    results: [],
    retries: {},
    ...overrides,
  },
});

describe('sonraki adim onerisi', () => {
  it('hicbir sey yapilmamissa haritadaki ilk konuyu onerir', () => {
    const recommendation = recommendNext({ progress: createEmptyProgress(), ...base });
    expect(recommendation.kind).toBe('next-topic');
    expect(recommendation.route).toEqual({ name: 'topic', topicId: T.greetings });
    expect(recommendation.title).not.toMatch(/Gün/);
  });

  it('yarim kalan konu oturumu her seyin onune gecer', () => {
    const recommendation = recommendNext({ progress: lessonAt({ topicId: T.modalVerbs, sessionMode: 'full' }), ...base });
    expect(recommendation.kind).toBe('resume');
    expect(recommendation.title).toBe('Modalverben — Tam Çalışma');
    expect(recommendation.route).toEqual({ name: 'lesson', topicId: T.modalVerbs, mode: 'full' });
  });

  it('yarim kalan bolum pratigine bolumuyle doner', () => {
    const progress = lessonAt({ topicId: T.time, sessionMode: 'section', sectionId: 'time.um' });
    expect(recommendNext({ progress, ...base }).route).toEqual({ name: 'lesson', topicId: T.time, mode: 'section', sectionId: 'time.um' });
  });

  it('yarim kalan genel tekrara dogru rotayla doner', () => {
    const progress = lessonAt({ mode: 'review', sessionMode: 'gr-topic', topicId: T.modalVerbs });
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.route).toEqual({ name: 'review' });
    expect(recommendation.title).toBe('Konu Tekrarı — Modalverben');
  });

  it('yarim kalan hata tekrarina dogru rotayla doner', () => {
    expect(recommendNext({ progress: lessonAt({ mode: 'mistakes' }), ...base }).route).toEqual({ name: 'mistake-review' });
  });

  it('dogrulugu dusuk kalan konuyu hizli tekrara yonlendirir', () => {
    const progress = answerAll(createEmptyProgress(), exercisesForTopic(T.greetings), 'incorrect');
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('weak-topic');
    expect(recommendation.route).toEqual({ name: 'lesson', topicId: T.greetings, mode: 'quick' });
  });

  it('yarim birakilan konu, baslanmamis konulardan once onerilir', () => {
    const progress = answerAll(createEmptyProgress(), exercisesForTopic(T.time).slice(0, 3), 'correct');
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('next-topic');
    expect(recommendation.route).toEqual({ name: 'topic', topicId: T.time });
  });

  it('tum konular tamamsa tazeleme tekrari onerir', () => {
    let progress = createEmptyProgress();
    for (const topic of topics) progress = answerAll(progress, exercisesForTopic(topic.id), 'correct');
    const recommendation = recommendNext({ progress, ...base });
    expect(recommendation.kind).toBe('refresh');
    expect(recommendation.route.name).toBe('lesson');
  });

  it('ayni durum her zaman ayni oneriyi verir (deterministik)', () => {
    const progress = answerAll(createEmptyProgress(), exercisesForTopic(T.greetings), 'correct');
    expect(recommendNext({ progress, ...base })).toEqual(recommendNext({ progress, ...base }));
  });
});
