/**
 * Ders ici kuyruk davranisi.
 *
 * Oturumun HANGI alistirmalardan kurulacagini `lib/session.ts` belirler;
 * bu dosya ders SIRASINDA olanlarla ilgilenir:
 *
 * - Yanlis cevaplanan soru hemen degil, 3–6 soru sonra tekrar sorulur.
 * - Ayni derste bir alistirma en fazla `MAX_RETRIES` kez tekrar eklenir.
 * - Hata tekrari oturumlari zayiflik puanina gore siralanir.
 */

import type { Exercise } from '../content/types';
import type { SessionPresentation, UserProgress } from './storage';
import { weaknessScore } from './progress';

export type { SessionPresentation } from './storage';

export const MAX_RETRIES = 1;
export const RETRY_GAP_MIN = 3;
export const RETRY_GAP_MAX = 6;

export function buildReviewQueue(
  exercises: Exercise[],
  progress: UserProgress,
  limit = 12,
): string[] {
  return exercises
    .map((exercise) => ({ id: exercise.id, score: weaknessScore(progress, exercise.id) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.id);
}

/**
 * Yanlis cevaplanan alistirmayi kuyruga geri koyar.
 * Ekleme noktasi deterministiktir: mevcut konumdan 3–6 soru sonrasi.
 */
export function scheduleRetry(
  queue: SessionPresentation[],
  currentIndex: number,
  exerciseId: string,
  retries: Record<string, number>,
): { queue: SessionPresentation[]; retries: Record<string, number> } {
  const used = retries[exerciseId] ?? 0;
  if (used >= MAX_RETRIES) return { queue, retries };

  const laterUniqueIds = [...new Set(
    queue.slice(currentIndex + 1).map((item) => item.exerciseId).filter((id) => id !== exerciseId),
  )];
  const gap = Math.min(
    RETRY_GAP_MAX,
    Math.max(RETRY_GAP_MIN, Math.floor(laterUniqueIds.length / 2) || RETRY_GAP_MIN),
  );
  let distinctSeen = 0;
  const distinctIds = new Set<string>();
  let insertAt = queue.length;
  for (let index = currentIndex + 1; index < queue.length; index += 1) {
    const candidateId = queue[index].exerciseId;
    if (candidateId === exerciseId || distinctIds.has(candidateId)) continue;
    distinctIds.add(candidateId);
    distinctSeen += 1;
    if (distinctSeen >= gap) {
      insertAt = index + 1;
      break;
    }
  }

  const next = [...queue];
  next.splice(insertAt, 0, { exerciseId, presentationReason: 'mistake-retry' });
  return { queue: next, retries: { ...retries, [exerciseId]: used + 1 } };
}

/** Öğrenci aynı yanıtı doğru kabul ettiğinde henüz gösterilmemiş retry'ı kaldırır. */
export function cancelScheduledRetry(
  queue: SessionPresentation[],
  currentIndex: number,
  exerciseId: string,
): SessionPresentation[] {
  return queue.filter(
    (item, index) =>
      !(index > currentIndex && item.exerciseId === exerciseId && item.presentationReason === 'mistake-retry'),
  );
}

/**
 * Ders ozeti artik `lib/session-result.ts` icindeki `buildLessonResult` ile
 * uretilir: sonuc kalici, yapili ve tamamlanma ekraninin tek kaynagidir.
 */
