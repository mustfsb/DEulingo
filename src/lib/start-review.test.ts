import { describe, expect, it } from 'vitest';
import { reviewBank } from './content';
import { createEmptyProgress } from './storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from './router';
import { MIN_GROUP_SIZE, REVIEW_GROUPS, REVIEW_MODES } from './general-review';
import { previewReviewSize, startMistakeSession, startReviewSession } from './start-review';
import { recordAttempt } from './progress';

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
  it('tum modlar onceden kurulmus tekrar oturumu acar', () => {
    for (const meta of REVIEW_MODES) {
      const view = setup();
      const ok = startReviewSession(view.api, view.navigate, { mode: meta.mode });
      expect(ok, meta.mode).toBe(true);
      expect(view.routes).toEqual([{ name: 'review' }]);
      const lesson = view.getProgress().activeLesson;
      expect(lesson?.mode).toBe('review');
      expect(lesson?.queue.length).toBeGreaterThan(0);
      expect(new Set(lesson?.queue.map((item) => item.exerciseId)).size).toBe(lesson?.queue.length);
    }
  });

  it('konu karti gruba ozel oturum kurar', () => {
    for (const group of REVIEW_GROUPS) {
      const view = setup();
      const ok = startReviewSession(view.api, view.navigate, { mode: 'topic', groupId: group.id });
      expect(ok, group.id).toBe(true);
      expect(view.getProgress().activeLesson?.topicId).toBe(group.id);
    }
  });

  it('havuz kucukse oturum kurulmaz', () => {
    const view = setup();
    expect(startReviewSession(view.api, view.navigate, { mode: 'topic', groupId: 'yok-boyle-grup' })).toBe(false);
    expect(view.routes).toEqual([]);
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
    for (const group of REVIEW_GROUPS) {
      expect(previewReviewSize('topic', group.id)).toBeGreaterThanOrEqual(MIN_GROUP_SIZE);
    }
  });
});
