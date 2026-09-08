/**
 * Genel Tekrar oturumlarını kurar.
 *
 * Oturum her zaman ÖNCEDEN kurulur (`Hatalarım` akışıyla aynı desen):
 * havuz → plan → `activeLesson` (mode `review`) → `#/tekrar`.
 * Gün sayacı artmaz, gün tamamlanması etkilenmez (§48); ustalık, hata ve
 * istatistikler normal kurallarla güncellenir.
 */

import { buildSessionPlan, type SessionMode } from './session';
import { exercisesById, reviewBank } from './content';
import { buildReviewQueue } from './lesson';
import { getExercises } from './content';
import { MIN_GROUP_SIZE, groupPoolSize, reviewModeMeta, reviewPoolFor, type ReviewMode } from './general-review';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from './router';

export const REVIEW_SESSION_MODE: Record<ReviewMode, SessionMode> = {
  mixed: 'gr-mixed',
  vocab: 'gr-vocab',
  sentence: 'gr-sentence',
  writing: 'gr-writing',
  listening: 'gr-listening',
  quick: 'gr-quick',
  challenge: 'gr-challenge',
  topic: 'gr-topic',
};

export interface StartReviewOptions {
  mode: ReviewMode;
  groupId?: string;
}

/** Oturum kurulduysa true (kurulamazsa false — örn. grup havuzu çok küçük). */
export function startReviewSession(
  api: ProgressApi,
  navigate: (route: Route) => void,
  options: StartReviewOptions,
): boolean {
  const { mode, groupId } = options;
  if (groupId && groupPoolSize(reviewBank, groupId) < MIN_GROUP_SIZE) return false;

  const pool = reviewPoolFor(reviewBank, mode, groupId);
  if (!pool.length) return false;

  const sessionMode = REVIEW_SESSION_MODE[mode];
  const plan = buildSessionPlan({
    pool,
    previous: [],
    progress: api.progress,
    mode: sessionMode,
    topicId: groupId,
    seed: `gr:${mode}:${groupId ?? ''}:${Date.now()}`,
  });
  if (!plan.primaryQueue.length) return false;

  api.update((current) => ({
    ...current,
    activeLesson: {
      mode: 'review',
      sessionMode,
      topicId: groupId,
      queue: plan.primaryQueue,
      index: 0,
      startedAt: new Date().toISOString(),
      results: [],
      retries: {},
      streak: { current: 0, best: 0, firedMilestones: [] },
    },
  }));
  navigate({ name: 'review' });
  return true;
}

/** Önizleme: bu mod/grup kaç soruluk oturum kurar? */
export function previewReviewSize(mode: ReviewMode, groupId?: string): number {
  const pool = reviewPoolFor(reviewBank, mode, groupId);
  if (!pool.length) return 0;
  const meta = reviewModeMeta(mode);
  return Math.min(meta.size, pool.length);
}

/** Tüm hatalardan tekrar oturumu (tek isim alanı — izlek ayrımı yok). */
export function startMistakeSession(api: ProgressApi, navigate: (route: Route) => void): boolean {
  const ids = buildReviewQueue(getExercises(Object.keys(api.progress.mistakes)), api.progress, 15)
    .filter((id) => exercisesById.has(id));
  if (!ids.length) return false;
  api.update((current) => ({
    ...current,
    activeLesson: {
      mode: 'review',
      queue: ids.map((exerciseId) => ({ exerciseId, presentationReason: 'primary' as const })),
      index: 0,
      startedAt: new Date().toISOString(),
      results: [],
      retries: {},
      streak: { current: 0, best: 0, firedMilestones: [] },
    },
  }));
  navigate({ name: 'review' });
  return true;
}
