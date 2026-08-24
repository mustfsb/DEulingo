/**
 * İlk üç gün için bağımsız, dengeli alıştırma setleri.
 *
 * Aynı içerik havuzunda deterministik atama yapılır. Her konu/zorluk kovası
 * korunurken en küçük set önce doldurulur; böylece setler hem ayrık hem de eşit kalır.
 */

import type { Exercise, ExerciseSetId } from './types.ts';

export const EXERCISE_SET_IDS: ExerciseSetId[] = ['set-1', 'set-2', 'set-3'];

export const EXERCISE_SET_LABELS: Record<ExerciseSetId, string> = {
  'set-1': '1. Set',
  'set-2': '2. Set',
  'set-3': '3. Set',
};

const SET_DAYS = new Set([1, 2, 3]);

function stableOffset(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % EXERCISE_SET_IDS.length;
}

export function isExerciseSetId(value: string | undefined): value is ExerciseSetId {
  return value === 'set-1' || value === 'set-2' || value === 'set-3';
}

/** İlk üç günün tüm sorularına kalıcı, ayrık bir set kimliği ekler. */
export function assignExerciseSets(exercises: Exercise[]): Exercise[] {
  const assignments = new Map<string, ExerciseSetId>();
  const buckets = new Map<string, Exercise[]>();
  const countsByDay = new Map<number, Map<ExerciseSetId, number>>();

  for (const exercise of exercises) {
    if (!SET_DAYS.has(exercise.day)) continue;
    const track = (exercise.track as string | undefined) ?? 'normal';
    if (track !== 'normal') continue;
    // Aynı konu ve zorluk aynı setin üstüne yığılmasın.
    const key = `${exercise.day}|${exercise.topicId}|${exercise.difficulty}`;
    buckets.set(key, [...(buckets.get(key) ?? []), exercise]);
  }

  for (const [key, bucket] of [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right, 'en'))) {
    const ordered = [...bucket].sort((left, right) => left.id.localeCompare(right.id, 'en'));
    const offset = stableOffset(key);
    ordered.forEach((exercise, index) => {
      const counts = countsByDay.get(exercise.day) ?? new Map(EXERCISE_SET_IDS.map((id) => [id, 0]));
      countsByDay.set(exercise.day, counts);
      const smallest = Math.min(...EXERCISE_SET_IDS.map((id) => counts.get(id) ?? 0));
      const setId = EXERCISE_SET_IDS
        .map((_, candidate) => EXERCISE_SET_IDS[(offset + index + candidate) % EXERCISE_SET_IDS.length])
        .find((candidate) => (counts.get(candidate) ?? 0) === smallest)!;
      assignments.set(exercise.id, setId);
      counts.set(setId, (counts.get(setId) ?? 0) + 1);
    });
  }

  return exercises.map((exercise) => {
    const exerciseSetId = assignments.get(exercise.id);
    return exerciseSetId ? { ...exercise, exerciseSetId } : exercise;
  });
}

/** UI için yalnızca gerçekten tanımlı setleri, sabit sırayla döndürür. */
export function exerciseSetsForDay(exercises: Exercise[]): Array<{
  id: ExerciseSetId;
  label: string;
  exercises: Exercise[];
}> {
  return EXERCISE_SET_IDS.map((id) => ({
    id,
    label: EXERCISE_SET_LABELS[id],
    exercises: exercises.filter((exercise) => exercise.exerciseSetId === id),
  })).filter((set) => set.exercises.length > 0);
}
