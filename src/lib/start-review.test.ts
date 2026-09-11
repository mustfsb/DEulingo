import { describe, expect, it } from 'vitest';
import { exercisesById, reviewBank, topics } from './content';
import { createEmptyProgress } from './storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from './router';
import { MIN_TOPIC_POOL, REVIEW_MODES, reviewSectionAction } from './general-review';
import { previewReviewSize, reviewPool, startMistakeSession, startReviewSession } from './start-review';
import { recordAttempt } from './progress';
import { REVIEW_SECTIONS, T } from '../content/curriculum/topics';

function setup() {
  let progress = createEmptyProgress();
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
  };
  const routes: Route[] = [];
  const navigate = (route: Route) => { routes.push(route); };
  return { api, routes, navigate, getProgress: () => progress };
}

describe('genel tekrar oturum baslatma', () => {
  it('tum modlar onceden kurulmus, konular arasi tekrar oturumu acar', () => {
    for (const meta of REVIEW_MODES) {
      const view = setup();
      expect(startReviewSession(view.api, view.navigate, { mode: meta.mode }), meta.mode).toBe(true);
      expect(view.routes).toEqual([{ name: 'review' }]);
      const lesson = view.getProgress().activeLesson;
      expect(lesson?.mode).toBe('review');
      expect(lesson?.topicId).toBeUndefined();
      expect(lesson?.queue.length).toBeGreaterThan(0);
      expect(new Set(lesson?.queue.map((item) => item.exerciseId)).size).toBe(lesson?.queue.length);
      // Konular arasi modlar yalnizca Genel Tekrar bankasindan beslenir.
      for (const item of lesson?.queue ?? []) expect(exercisesById.get(item.exerciseId)?.reviewOnly, item.exerciseId).toBe(true);
    }
  });

  it('konu karti kanonik konu kimligiyle (ikinci taksonomi olmadan) oturum kurar', () => {
    for (const topic of topics) {
      const view = setup();
      expect(startReviewSession(view.api, view.navigate, { mode: 'topic', topicId: topic.id }), topic.id).toBe(true);
      const lesson = view.getProgress().activeLesson!;
      expect(lesson.topicId).toBe(topic.id);
      expect(lesson.sessionMode).toBe('gr-topic');
      for (const item of lesson.queue) {
        const exercise = exercisesById.get(item.exerciseId)!;
        expect(exercise.topicId === topic.id || exercise.secondaryTopicIds?.includes(topic.id), item.exerciseId).toBe(true);
      }
    }
  });

  it('bilinmeyen konu icin oturum kurulmaz', () => {
    const view = setup();
    expect(startReviewSession(view.api, view.navigate, { mode: 'topic', topicId: 'topic.yok' })).toBe(false);
    expect(view.routes).toEqual([]);
  });

  it('Modalverben konu tekrari Genel Tekrar sorulariyla baslar, Cumle Kurma ve Writing modunda Modalverben vardir', () => {
    const topicPool = reviewPool('topic', T.modalVerbs);
    expect(topicPool.slice(0, 10).every((exercise) => exercise.reviewOnly)).toBe(true);
    const touches = (id: string) => {
      const exercise = exercisesById.get(id)!;
      return exercise.topicId === T.modalVerbs || Boolean(exercise.secondaryTopicIds?.includes(T.modalVerbs));
    };
    expect(reviewPool('sentence').some((exercise) => touches(exercise.id))).toBe(true);
    expect(reviewPool('writing').some((exercise) => touches(exercise.id))).toBe(true);
  });

  it('hata oturumu tum hatalardan kurulur', () => {
    const view = setup();
    expect(startMistakeSession(view.api, view.navigate)).toBe(false);
    const target = reviewBank[0];
    view.api.update((current) => recordAttempt(current, target, 'x', 'incorrect'));
    expect(startMistakeSession(view.api, view.navigate)).toBe(true);
    expect(view.routes).toEqual([{ name: 'review' }]);
    expect(view.getProgress().activeLesson?.queue[0]?.exerciseId).toBe(target.id);
  });

  it('onizleme boyutlari mod hedefleriyle tutarlidir', () => {
    expect(previewReviewSize('mixed')).toBeLessThanOrEqual(28);
    expect(previewReviewSize('mixed')).toBeGreaterThanOrEqual(20);
    expect(previewReviewSize('writing')).toBeLessThanOrEqual(10);
    expect(previewReviewSize('listening')).toBeGreaterThanOrEqual(10);
    for (const topic of topics) expect(previewReviewSize('topic', topic.id), topic.id).toBeGreaterThanOrEqual(MIN_TOPIC_POOL);
  });

  it('Genel Tekrar ozetinin her bolumu kanonik konuya ya da bir moda baglanir', () => {
    for (const section of REVIEW_SECTIONS) {
      if (section.id === 'genel.nasil-kullanilir') {
        expect(reviewSectionAction(section.id)).toBeUndefined();
        continue;
      }
      const action = reviewSectionAction(section.id);
      expect(action, section.id).toBeDefined();
      expect(previewReviewSize(action!.mode ?? 'topic', action!.topicId), section.id).toBeGreaterThan(0);
    }
  });
});
