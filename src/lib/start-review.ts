/**
 * Genel Tekrar oturumlarını kurar.
 *
 * Oturum her zaman ÖNCEDEN kurulur (`Hatalarım` akışıyla aynı desen):
 * havuz → plan → `activeLesson` (mode `review`) → `#/tekrar`.
 * Konu oturum sayacı artmaz; ustalık, hata ve istatistikler normal
 * kurallarla (alıştırmanın kanonik konusuna) işlenir.
 */

import { buildSessionPlan, type SessionMode } from './session';
import { contentFor, type ContentFacade } from './content-en';
import type { LearningLanguage } from './language';
import { buildReviewQueue } from './lesson';
import { MIN_TOPIC_POOL, reviewModeMeta, reviewPoolFor, type ReviewMode } from './general-review';
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
  /** Kanonik konu (Genel Tekrar konu kartı). */
  topicId?: string;
}

/** Aktif dile ait içerik cephesi (varsayılan Almanca; mevcut çağrılar değişmez). */
function facadeFor(api: ProgressApi): ContentFacade {
  return contentFor(api.language ?? 'de');
}

/** Genel Tekrar havuzu (konu kartında ders bankası da katılır). */
export function reviewPool(mode: ReviewMode, topicId?: string, language: LearningLanguage = 'de') {
  const facade = contentFor(language);
  return reviewPoolFor(facade.reviewBank, mode, topicId, facade.lessonExercises);
}

/** Oturum kurulduysa true (kurulamazsa false — örn. konu havuzu çok küçük). */
export function startReviewSession(
  api: ProgressApi,
  navigate: (route: Route) => void,
  options: StartReviewOptions,
): boolean {
  const { mode, topicId } = options;
  const pool = reviewPool(mode, topicId, api.language ?? 'de');
  if (!pool.length) return false;
  if (topicId && pool.length < MIN_TOPIC_POOL) return false;

  const sessionMode = REVIEW_SESSION_MODE[mode];
  const plan = buildSessionPlan({
    pool,
    progress: api.progress,
    mode: sessionMode,
    topicId,
    seed: `gr:${api.language ?? 'de'}:${mode}:${topicId ?? ''}:${Date.now()}`,
  });
  if (!plan.primaryQueue.length) return false;

  api.update((current) => ({
    ...current,
    activeLesson: {
      mode: 'review',
      sessionMode,
      ...(topicId ? { topicId } : {}),
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

/** Önizleme: bu mod/konu kaç soruluk oturum kurar? */
export function previewReviewSize(mode: ReviewMode, topicId?: string, language: LearningLanguage = 'de'): number {
  const pool = reviewPool(mode, topicId, language);
  if (!pool.length) return 0;
  if (topicId && pool.length < MIN_TOPIC_POOL) return 0;
  return Math.min(reviewModeMeta(mode).size, pool.length);
}

/** Tüm hatalardan tekrar oturumu (yalnızca aktif dilin hataları — dilim ayrı tutulur). */
export function startMistakeSession(api: ProgressApi, navigate: (route: Route) => void): boolean {
  const facade = facadeFor(api);
  const ids = buildReviewQueue(facade.getExercises(Object.keys(api.progress.mistakes)), api.progress, 15)
    .filter((id) => facade.exercisesById.has(id));
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
