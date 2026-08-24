/**
 * Ilerleme kaydi ve turetilmis istatistikler.
 * Tum sayilar localStorage'daki denemelerden hesaplanir; ayrica ozet tutulmaz.
 */

import type { Exercise, LearningTrack } from '../content/types';
import type { ValidationResult } from './validation';
import { evaluateExercise } from './validation';
import { addDailyActivity, answerDurationMs } from './daily-goal';
import {
  getTrackDays,
  setTrackDays,
  createEmptyProgress,
  type AttemptResult,
  type ExerciseProgress,
  type MistakeRecord,
  type MistakeType,
  type UserProgress,
} from './storage';

const MASTERY_STREAK = 2;

/**
 * Geriye dönük klavye toleransi düzeltmesi.
 *
 * keyboardTolerance:true olan egzersizlerde, daha önce yanlış sayılan
 * (incorrect / minor-typo) denemeleri yeniden değerlendirir.
 * Eger yeni kurallara göre cevap dogruysa deneme 'correct' olarak
 * güncellenir, hata kaydı temizlenir, istatistikler yeniden hesaplanir.
 */
export function correctKeyboardToleranceHistory(
  progress: UserProgress,
  lookup: (id: string) => Exercise | undefined,
): UserProgress {
  let changed = false;
  const exercises: Record<string, ExerciseProgress> = {};
  const mistakes = { ...progress.mistakes };

  for (const [id, entry] of Object.entries(progress.exercises)) {
    const exercise = lookup(id);
    if (!exercise || !exercise.validation?.keyboardTolerance) {
      exercises[id] = entry;
      continue;
    }

    let corrected = false;
    let correctCount = 0;
    let incorrectCount = 0;
    let typoCount = 0;
    const attempts = entry.attempts.map((attempt) => {
      let result = attempt.result;
      if (result === 'incorrect' || result === 'minor-typo') {
        const raw = typeof attempt.input === 'string' ? attempt.input : attempt.normalizedInput ?? '';
        if (raw) {
          const evalResult = evaluateExercise(exercise, raw);
          if (evalResult.status === 'correct') {
            result = 'correct';
            corrected = true;
          }
        }
      }
      if (result === 'correct') correctCount += 1;
      else if (result === 'incorrect') incorrectCount += 1;
      else if (result === 'minor-typo') typoCount += 1;
      return { ...attempt, result };
    });

    if (!corrected) {
      exercises[id] = entry;
      continue;
    }
    changed = true;
    const recent = attempts.slice(-MASTERY_STREAK);
    exercises[id] = {
      ...entry,
      attempts,
      correctCount,
      incorrectCount,
      typoCount,
      mastered: recent.length === MASTERY_STREAK && recent.every((a) => a.result === 'correct'),
    };

    // Hata kaydı varsa yeniden değerlendir
    if (mistakes[id]) {
      const evalResult = evaluateExercise(exercise, mistakes[id].userAnswer);
      if (evalResult.status === 'correct') delete mistakes[id];
    }
  }

  // keyboardTolerance etkilemeyen egzersizlerin verilerini de kopyala
  for (const id of Object.keys(progress.exercises)) {
    if (!exercises[id]) exercises[id] = progress.exercises[id];
  }

  if (!changed) return progress;

  const stats = recomputeStats(exercises);
  return {
    ...progress,
    exercises,
    mistakes,
    stats: { ...stats, studyDates: progress.stats.studyDates ?? [] },
  };
}

export interface RecordOptions {
  hintUsed?: boolean;
  responseTimeMs?: number;
}

function isoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function classifyMistake(exercise: Exercise, result: AttemptResult): MistakeType {
  if (result === 'minor-typo') return 'spelling';
  const topic = exercise.topic.toLocaleLowerCase('tr');
  const isArticle =
    topic.includes('artikel') ||
    (exercise.options?.length === 3 && exercise.options.every((o) => ['der', 'die', 'das'].includes(o)));

  switch (exercise.type) {
    case 'error-correction':
      return 'grammar';
    case 'ordering':
    case 'sentence-builder':
      return 'word-order';
    case 'multiple-choice':
      return isArticle ? 'article' : 'vocabulary';
    case 'fill-blank':
      if (isArticle) return 'article';
      return /fiil|çekim/i.test(exercise.instruction) ? 'grammar' : 'vocabulary';
    case 'free-text':
      return 'vocabulary';
    default:
      return 'unknown';
  }
}

export const MISTAKE_LABELS: Record<MistakeType, string> = {
  grammar: 'Dilbilgisi',
  spelling: 'Yazım',
  article: 'Artikel',
  vocabulary: 'Kelime',
  'word-order': 'Kelime sırası',
  unknown: 'Diğer',
};

/** Bir denemeyi kaydeder ve guncellenmis ilerlemeyi dondurur (girdi degistirilmez). */
export function recordAttempt(
  progress: UserProgress,
  exercise: Exercise,
  input: unknown,
  result: AttemptResult,
  validation?: ValidationResult,
  options: RecordOptions = {},
): UserProgress {
  const now = new Date().toISOString();
  const track: LearningTrack = (exercise.track as LearningTrack | undefined) ?? 'normal';
  const previous: ExerciseProgress = progress.exercises[exercise.id] ?? {
    exerciseId: exercise.id,
    day: exercise.day,
    track,
    attempts: [],
    firstSeenAt: now,
    lastSeenAt: now,
    correctCount: 0,
    incorrectCount: 0,
    typoCount: 0,
  };

  const attempt = {
    timestamp: now,
    input,
    normalizedInput: validation?.normalizedInput,
    expected: validation?.expected ?? exercise.answer,
    result,
    attemptNumber: previous.attempts.length + 1,
    hintUsed: options.hintUsed,
    responseTimeMs: options.responseTimeMs,
  };

  const attempts = [...previous.attempts, attempt];
  const updated: ExerciseProgress = {
    ...previous,
    day: exercise.day,
    track,
    attempts,
    lastSeenAt: now,
    correctCount: previous.correctCount + (result === 'correct' ? 1 : 0),
    typoCount: previous.typoCount + (result === 'minor-typo' ? 1 : 0),
    incorrectCount: previous.incorrectCount + (result === 'incorrect' ? 1 : 0),
  };
  const recent = attempts.slice(-MASTERY_STREAK);
  updated.mastered =
    recent.length === MASTERY_STREAK && recent.every((item) => item.result === 'correct');

  const mistakes = { ...progress.mistakes };
  // Cozulen hata listeden DUSER: dogru cevapladigin soru "Hatalarım"da ve
  // hata tekrarinda bir daha karsina cikmaz. Ogrenci kendi cevabini dogru
  // ilan ettiginde (self-assessed) de ayni kural gecerlidir.
  if (result === 'correct' || result === 'self-assessed') {
    delete mistakes[exercise.id];
  }
  if (result === 'incorrect' || result === 'minor-typo') {
    const existing = mistakes[exercise.id];
    const record: MistakeRecord = {
      exerciseId: exercise.id,
      track,
      day: exercise.day,
      topic: exercise.topic,
      prompt: exercise.prompt ?? exercise.instruction,
      userAnswer: formatInput(input),
      expectedAnswer: validation?.expected ?? exercise.answer ?? '',
      count: (existing?.count ?? 0) + (result === 'incorrect' ? 1 : 0),
      typoCount: (existing?.typoCount ?? 0) + (result === 'minor-typo' ? 1 : 0),
      lastOccurredAt: now,
      type: classifyMistake(exercise, result),
    };
    mistakes[exercise.id] = record;
  }

  const studyDates = progress.stats.studyDates.includes(isoDate())
    ? progress.stats.studyDates
    : [...progress.stats.studyDates, isoDate()];

  return {
    ...progress,
    exercises: { ...progress.exercises, [exercise.id]: updated },
    mistakes,
    // Gunluk hedef gercek calisma suresinden beslenir (§38).
    daily: addDailyActivity(progress.daily, {
      answered: 1,
      activeMs: answerDurationMs(options.responseTimeMs),
    }),
    stats: {
      totalAttempts: progress.stats.totalAttempts + 1,
      totalCorrect: progress.stats.totalCorrect + (result === 'correct' ? 1 : 0),
      totalTypos: progress.stats.totalTypos + (result === 'minor-typo' ? 1 : 0),
      totalIncorrect: progress.stats.totalIncorrect + (result === 'incorrect' ? 1 : 0),
      lastStudiedAt: now,
      studyDates,
    },
    updatedAt: now,
  };
}

export function formatInput(input: unknown): string {
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) return input.join(' ');
  if (input && typeof input === 'object') {
    return Object.entries(input as Record<string, string>)
      .map(([left, right]) => `${left} → ${right}`)
      .join(', ');
  }
  return '';
}

/* ------------------------------------------------------------------ */
/* Turetilmis istatistikler                                            */
/* ------------------------------------------------------------------ */

export interface DayStats {
  day: number;
  total: number;
  completed: number;
  correct: number;
  typo: number;
  incorrect: number;
  /** 0–1 arasi; hic deneme yoksa null. */
  accuracy: number | null;
  completionPct: number;
  mistakeCount: number;
  reviewRecommended: boolean;
  state: 'not-started' | 'in-progress' | 'completed';
}

export const REVIEW_THRESHOLD = 0.75;

export function getDayStats(progress: UserProgress, day: number, exercises: Exercise[]): DayStats {
  const total = exercises.length;
  let completed = 0;
  let correct = 0;
  let typo = 0;
  let incorrect = 0;

  for (const exercise of exercises) {
    const entry = progress.exercises[exercise.id];
    if (!entry || entry.attempts.length === 0) continue;
    completed += 1;
    correct += entry.correctCount;
    typo += entry.typoCount;
    incorrect += entry.incorrectCount;
  }

  const graded = correct + typo + incorrect;
  const accuracy = graded > 0 ? (correct + typo) / graded : null;
  const completionPct = total > 0 ? completed / total : 0;
  // Sadece bugün AÇIK (cozulmemis) hatalar sayısı — Hatalarım ekraniyla tutarlı.
  const openMistakeIds = new Set(Object.keys(progress.mistakes));
  const mistakeCount = exercises.filter((exercise) => openMistakeIds.has(exercise.id)).length;
  const state: DayStats['state'] =
    completed === 0 ? 'not-started' : completed >= total ? 'completed' : 'in-progress';

  return {
    day,
    total,
    completed,
    correct,
    typo,
    incorrect,
    accuracy,
    completionPct,
    mistakeCount,
    reviewRecommended:
      graded > 0 && ((accuracy !== null && accuracy < REVIEW_THRESHOLD) || mistakeCount >= 3),
    state,
  };
}

export interface TopicStat {
  topic: string;
  incorrect: number;
  typo: number;
  attempts: number;
  accuracy: number | null;
}

export function getTopicStats(progress: UserProgress, exercises: Exercise[]): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const exercise of exercises) {
    const entry = progress.exercises[exercise.id];
    if (!entry || !entry.attempts.length) continue;
    const stat = map.get(exercise.topic) ?? {
      topic: exercise.topic,
      incorrect: 0,
      typo: 0,
      attempts: 0,
      accuracy: null,
    };
    stat.incorrect += entry.incorrectCount;
    stat.typo += entry.typoCount;
    stat.attempts += entry.correctCount + entry.typoCount + entry.incorrectCount;
    map.set(exercise.topic, stat);
  }
  for (const stat of map.values()) {
    stat.accuracy = stat.attempts > 0 ? (stat.attempts - stat.incorrect) / stat.attempts : null;
  }
  return [...map.values()].sort(
    (a, b) => b.incorrect * 2 + b.typo - (a.incorrect * 2 + a.typo) || a.topic.localeCompare(b.topic, 'tr'),
  );
}

/** Zayiflik puani: tekrar onceligini belirler (0 = sorun yok). */
export function weaknessScore(progress: UserProgress, exerciseId: string): number {
  const entry = progress.exercises[exerciseId];
  if (!entry) return 0;
  const lastResult = entry.attempts.at(-1)?.result;
  const recentPenalty = lastResult === 'incorrect' ? 2 : lastResult === 'minor-typo' ? 1 : 0;
  return entry.incorrectCount * 2 + entry.typoCount + recentPenalty;
}

export interface GlobalSummary {
  totalExercises: number;
  attemptedExercises: number;
  masteredExercises: number;
  accuracy: number | null;
  totalIncorrect: number;
  totalTypos: number;
  completedDays: number;
  studyDays: number;
}

export function getGlobalSummary(
  progress: UserProgress,
  exercises: Exercise[],
  dayNumbers: number[],
  track: LearningTrack = 'normal',
): GlobalSummary {
  const attempted = exercises.filter((exercise) => progress.exercises[exercise.id]?.attempts.length);
  const mastered = attempted.filter((exercise) => progress.exercises[exercise.id]?.mastered);
  const { totalCorrect, totalTypos, totalIncorrect } = progress.stats;
  const graded = totalCorrect + totalTypos + totalIncorrect;

  const completedDays = dayNumbers.filter((day) => {
    const dayExercises = exercises.filter((exercise) => exercise.day === day && ((exercise.track as LearningTrack | undefined) ?? 'normal') === track);
    return dayExercises.length > 0 && getDayStats(progress, day, dayExercises).state === 'completed';
  }).length;

  return {
    totalExercises: exercises.length,
    attemptedExercises: attempted.length,
    masteredExercises: mastered.length,
    accuracy: graded > 0 ? (totalCorrect + totalTypos) / graded : null,
    totalIncorrect,
    totalTypos,
    completedDays,
    studyDays: progress.stats.studyDates.length,
  };
}

/* ------------------------------------------------------------------ */
/* Sifirlama                                                           */
/* ------------------------------------------------------------------ */

export function resetDayProgress(progress: UserProgress, day: number, track: LearningTrack = 'normal'): UserProgress {
  const exercises = { ...progress.exercises };
  const mistakes = { ...progress.mistakes };
  for (const [id, entry] of Object.entries(progress.exercises)) {
    const entryTrack: LearningTrack = (entry.track as LearningTrack | undefined) ?? 'normal';
    if (entry.day === day && entryTrack === track) delete exercises[id];
  }
  for (const [id, record] of Object.entries(progress.mistakes)) {
    const recTrack: LearningTrack = (record.track as LearningTrack | undefined) ?? 'normal';
    if (record.day === day && recTrack === track) delete mistakes[id];
  }
  // track-aware days
  const trackDays = { ...getTrackDays(progress, track) };
  delete trackDays[day];
  const updatedProgress = setTrackDays(progress, track, trackDays);

  const stats = recomputeStats(exercises);
  const activeLesson =
    progress.activeLesson?.day === day && ((progress.activeLesson.track as LearningTrack | undefined) ?? 'normal') === track ? undefined : progress.activeLesson;

  return { ...updatedProgress, exercises, mistakes, activeLesson, stats: {
    ...stats,
    studyDates: progress.stats.studyDates,
  } };
}

export function resetAllProgress(): UserProgress {
  return createEmptyProgress();
}

function recomputeStats(exercises: Record<string, ExerciseProgress>) {
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalTypos = 0;
  let totalIncorrect = 0;
  let lastStudiedAt: string | undefined;

  for (const entry of Object.values(exercises)) {
    totalAttempts += entry.attempts.length;
    totalCorrect += entry.correctCount;
    totalTypos += entry.typoCount;
    totalIncorrect += entry.incorrectCount;
    if (!lastStudiedAt || entry.lastSeenAt > lastStudiedAt) lastStudiedAt = entry.lastSeenAt;
  }
  return { totalAttempts, totalCorrect, totalTypos, totalIncorrect, lastStudiedAt, studyDates: [] };
}
