/**
 * Ders sonucunun TEK kaynagi (§13).
 *
 * `ActiveLesson` biterken burada yapili bir `LessonResult` uretilir ve kalici
 * ilerlemeye yazilir. Tamamlanma ekrani, hata tekrari ve challenge baglami
 * yalnizca bu nesneden beslenir; hicbiri rota state'inden yeniden kurulmaz.
 */

import type { Exercise } from '../content/types';
import type { ActiveLesson, AttemptResult, LessonResult, MistakeRecord, UserProgress } from './storage';
import { normalizeStreak } from './streak';
import { addDailyActivity } from './daily-goal';

export interface ResultContext {
  lookup: (exerciseId: string) => Exercise | undefined;
  completedAt?: string;
}

interface ExerciseTally {
  correct: number;
  typo: number;
  incorrect: number;
  skipped: number;
  selfAssessed: number;
}

function emptyTally(): ExerciseTally {
  return { correct: 0, typo: 0, incorrect: 0, skipped: 0, selfAssessed: 0 };
}

/** Oturum kimligi: ayni gun+mod tekrar calisilsa bile benzersizdir. */
export function sessionIdFor(lesson: ActiveLesson): string {
  return [lesson.mode, lesson.day ?? '-', lesson.sessionMode ?? '-', lesson.topicId ?? '-', lesson.exerciseSetId ?? '-', lesson.startedAt].join(
    '|',
  );
}

export function buildLessonResult(lesson: ActiveLesson, context: ResultContext): LessonResult {
  const tallies = new Map<string, ExerciseTally>();
  const order: string[] = [];
  let correctCount = 0;
  let typoCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let selfAssessedCount = 0;

  for (const item of lesson.results) {
    if (!tallies.has(item.exerciseId)) {
      tallies.set(item.exerciseId, emptyTally());
      order.push(item.exerciseId);
    }
    const tally = tallies.get(item.exerciseId)!;
    switch (item.result) {
      case 'correct':
        tally.correct += 1;
        correctCount += 1;
        break;
      case 'minor-typo':
        tally.typo += 1;
        typoCount += 1;
        break;
      case 'incorrect':
        tally.incorrect += 1;
        incorrectCount += 1;
        break;
      case 'skipped':
        tally.skipped += 1;
        skippedCount += 1;
        break;
      case 'self-assessed':
        tally.selfAssessed += 1;
        selfAssessedCount += 1;
        break;
    }
  }

  // Atlanan soru yanlis DEGILDIR: dogrulugu dusurmez ama tekrar havuzuna girer.
  const graded = correctCount + typoCount + incorrectCount;
  const incorrectExerciseIds = order.filter((id) => (tallies.get(id)?.incorrect ?? 0) > 0);
  // Oturum icinde SON durumu hâlâ yanlis/atlanmis olanlar. Ders ici tekrarda
  // duzeltilen soru "cozulmus" sayilir ve bir daha tekrara girmez.
  const lastResultById = new Map<string, AttemptResult>();
  for (const item of lesson.results) lastResultById.set(item.exerciseId, item.result);
  const unresolvedExerciseIds = order.filter((id) => {
    const last = lastResultById.get(id);
    return last === 'incorrect' || last === 'skipped';
  });
  const typoExerciseIds = order.filter(
    (id) => (tallies.get(id)?.incorrect ?? 0) === 0 && (tallies.get(id)?.typo ?? 0) > 0,
  );
  const skippedExerciseIds = order.filter(
    (id) =>
      (tallies.get(id)?.skipped ?? 0) > 0 &&
      (tallies.get(id)?.correct ?? 0) === 0 &&
      (tallies.get(id)?.typo ?? 0) === 0,
  );

  const concepts = conceptOutcomes(tallies, context.lookup);
  const topics = topicOutcomes(tallies, context.lookup);
  const streak = normalizeStreak(lesson.streak);

  return {
    sessionId: sessionIdFor(lesson),
    day: lesson.day,
    mode: lesson.mode,
    sessionMode: lesson.sessionMode,
    topicId: lesson.topicId,
    exerciseSetId: lesson.exerciseSetId,
    exerciseIds: order,
    incorrectExerciseIds,
    unresolvedExerciseIds,
    typoExerciseIds,
    skippedExerciseIds,
    total: lesson.results.length,
    correctCount,
    incorrectCount,
    typoCount,
    skippedCount,
    selfAssessedCount,
    accuracy: graded > 0 ? (correctCount + typoCount) / graded : null,
    strongestConceptIds: concepts.strongest,
    weakestConceptIds: concepts.weakest,
    topics,
    bestStreak: streak.best,
    perfect: graded > 0 && incorrectCount === 0 && typoCount === 0 && skippedCount === 0,
    completedAt: context.completedAt ?? new Date().toISOString(),
  };
}

function conceptOutcomes(
  tallies: Map<string, ExerciseTally>,
  lookup: ResultContext['lookup'],
): { strongest: string[]; weakest: string[] } {
  const scores = new Map<string, { credit: number; total: number }>();
  for (const [exerciseId, tally] of tallies) {
    const exercise = lookup(exerciseId);
    if (!exercise) continue;
    const graded = tally.correct + tally.typo + tally.incorrect + tally.skipped;
    if (graded === 0) continue;
    const credit = tally.correct + tally.typo * 0.5;
    for (const conceptId of exercise.conceptIds) {
      const entry = scores.get(conceptId) ?? { credit: 0, total: 0 };
      entry.credit += credit;
      entry.total += graded;
      scores.set(conceptId, entry);
    }
  }

  const ranked = [...scores.entries()]
    .filter(([, value]) => value.total > 0)
    .map(([conceptId, value]) => ({ conceptId, ratio: value.credit / value.total, total: value.total }))
    .sort((a, b) => b.ratio - a.ratio || b.total - a.total || a.conceptId.localeCompare(b.conceptId));

  return {
    strongest: ranked.filter((item) => item.ratio >= 0.99).map((item) => item.conceptId),
    weakest: ranked
      .filter((item) => item.ratio < 0.75)
      .reverse()
      .map((item) => item.conceptId),
  };
}

function topicOutcomes(
  tallies: Map<string, ExerciseTally>,
  lookup: ResultContext['lookup'],
): LessonResult['topics'] {
  const map = new Map<string, { topicId: string; title: string; correct: number; total: number }>();
  for (const [exerciseId, tally] of tallies) {
    const exercise = lookup(exerciseId);
    if (!exercise) continue;
    const graded = tally.correct + tally.typo + tally.incorrect;
    if (graded === 0) continue;
    const entry = map.get(exercise.topicId) ?? {
      topicId: exercise.topicId,
      title: exercise.topic,
      correct: 0,
      total: 0,
    };
    entry.correct += tally.correct + tally.typo;
    entry.total += graded;
    map.set(exercise.topicId, entry);
  }
  return [...map.values()].sort((a, b) => b.correct / b.total - a.correct / a.total);
}

/* ------------------------------------------------------------------ */
/* Hata tekrari kuyrugu (§4, §5)                                       */
/* ------------------------------------------------------------------ */

export interface MistakeQueueOptions {
  /** Ayni oturumdan gelen kalici hata kayitlari — tekrar eden yazim hatalari icin. */
  mistakes?: Record<string, MistakeRecord>;
  limit?: number;
  /** Icerikte hâlâ var mi. */
  exists?: (exerciseId: string) => boolean;
}

/** Yazim hatasi bu kadar tekrar ederse tekrar oturumuna alinir (§4). */
export const TYPO_REVIEW_THRESHOLD = 2;

/**
 * Biten oturumun hatalarindan tekrar kuyrugu kurar.
 *
 * Sira: COZULMEMIS yanlislar → atlananlar → israrli yazim hatalari.
 *
 * "Cozulmemis" onemlidir: ders icinde yanlis yapip tekrarinda dogru cevapladigin
 * soru bir daha karsina cikmaz — yalnizca hâlâ yanlis kalanlar tekrar edilir.
 */
export function buildMistakeQueueIds(
  result: LessonResult,
  options: MistakeQueueOptions = {},
): string[] {
  const { mistakes = {}, limit = 15, exists } = options;
  const persistentTypos = result.typoExerciseIds.filter(
    (id) => (mistakes[id]?.typoCount ?? 1) >= TYPO_REVIEW_THRESHOLD,
  );
  // Eski (v7 oncesi alan icermeyen) sonuclar icin guvenli geri donus.
  const unresolved = result.unresolvedExerciseIds ?? result.incorrectExerciseIds;
  const ordered = [
    ...unresolved,
    ...result.skippedExerciseIds,
    ...persistentTypos,
  ];

  const seen = new Set<string>();
  const queue: string[] = [];
  for (const id of ordered) {
    if (seen.has(id)) continue;
    if (exists && !exists(id)) continue;
    seen.add(id);
    queue.push(id);
    if (queue.length >= limit) break;
  }
  return queue;
}

/** Tekrar butonu yalnizca gercekten calisilacak bir sey varken aktif olmalidir (§6). */
export function hasReviewableMistakes(result: LessonResult, options: MistakeQueueOptions = {}): boolean {
  return buildMistakeQueueIds(result, options).length > 0;
}

/* ------------------------------------------------------------------ */
/* Kalici duruma yazma                                                 */
/* ------------------------------------------------------------------ */

/**
 * Dersi kapatir: aktif oturumu temizler, gun sayacini artirir, gunluk hedefe
 * bir oturum yazar ve sonucu `lastResult` olarak saklar.
 *
 * Sonuc HER ZAMAN yenisiyle degistirilir: 3. Gun bitince 2. Gun'un sonucu
 * tamamlanma ekranini besleyemez (§15).
 */
export function completeLesson(
  progress: UserProgress,
  result: LessonResult,
  now = new Date(),
): UserProgress {
  const day = result.day;
  const days = { ...progress.days };
  if (day !== undefined && result.mode === 'day') {
    const entry = days[day] ?? { day, sessionsCompleted: 0 };
    days[day] = {
      ...entry,
      sessionsCompleted: entry.sessionsCompleted + 1,
      lastCompletedAt: now.toISOString(),
    };
  }
  return {
    ...progress,
    activeLesson: undefined,
    days,
    lastResult: result,
    daily: addDailyActivity(progress.daily, { sessions: 1 }, now),
  };
}
