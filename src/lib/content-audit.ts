import type { Exercise } from '../content/types';

export interface ContentAuditReport {
  total: number;
  uniqueIds: number;
  uniqueNormalizedPrompts: number;
  familyCount: number;
  largestFamily: { id: string; count: number } | null;
  nearDuplicates: Array<{ ids: string[]; reason: 'same-normalized-prompt-and-answer' }>;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function auditExerciseContent(exercises: Exercise[]): ContentAuditReport {
  const familyCounts = new Map<string, number>();
  const nearDuplicateBuckets = new Map<string, string[]>();
  const prompts = new Set<string>();
  const ids = new Set<string>();

  for (const exercise of exercises) {
    ids.add(exercise.id);
    const normalizedPrompt = normalize(`${exercise.instruction} ${exercise.prompt ?? ''}`);
    if (normalizedPrompt) prompts.add(normalizedPrompt);
    if (exercise.familyId) familyCounts.set(exercise.familyId, (familyCounts.get(exercise.familyId) ?? 0) + 1);
    if (exercise.prompt && exercise.answer) {
      const key = `${normalize(exercise.prompt)}|${normalize(exercise.answer)}`;
      const bucket = nearDuplicateBuckets.get(key) ?? [];
      bucket.push(exercise.id);
      nearDuplicateBuckets.set(key, bucket);
    }
  }

  const families = [...familyCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return {
    total: exercises.length,
    uniqueIds: ids.size,
    uniqueNormalizedPrompts: prompts.size,
    familyCount: familyCounts.size,
    largestFamily: families[0] ? { id: families[0][0], count: families[0][1] } : null,
    nearDuplicates: [...nearDuplicateBuckets.values()]
      .filter((ids) => ids.length > 1)
      .map((ids) => ({ ids, reason: 'same-normalized-prompt-and-answer' })),
  };
}
