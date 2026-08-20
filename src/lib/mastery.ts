/**
 * Kavram ustaligi — TURETILMIS.
 *
 * Hicbir sey saklanmaz: tum degerler `progress.exercises` icindeki deneme
 * gecmisinden hesaplanir. Boylece ilerleme tek kaynakta kalir ve goc gerektirmez.
 *
 * Ilke (§43): Almanca URETMEK, tanimaktan daha guclu kanittir.
 */

import type { Exercise, ExerciseType } from '../content/types';
import type { AttemptResult, UserProgress } from './storage';

/** Tip → ustalik agirligi. Cok secenekli sorular tahminle gecilebilir. */
export const MASTERY_WEIGHTS: Record<ExerciseType, number> = {
  'multiple-choice': 0.6,
  matching: 0.7,
  ordering: 0.9,
  'fill-blank': 1.0,
  'sentence-builder': 1.0,
  'error-correction': 1.2,
  'free-text': 1.3,
  // Sesli gorevler oz degerlendirmedir; kanit degeri dusuk tutulur.
  spoken: 0.5,
  'listen-choice': 0.7,
  dictation: 1.1,
  // Türkçe → Almanca kurma üretim kanıtıdır; ters yön daha çok anlam tanımadır.
  'word-bank-translation': 1,
};

/** Bir denemenin ne kadar "dogru" sayildigi. */
const CREDIT: Record<AttemptResult, number> = {
  correct: 1,
  'minor-typo': 0.5,
  'self-assessed': 0.5,
  incorrect: 0,
  skipped: 0,
};

/** Ustaligin doygunluga ulasmasi icin gereken agirlikli deneme miktari. */
export const CONFIDENCE_TARGET = 3;

export function masteryWeight(exercise: Exercise): number {
  return exercise.masteryWeight ?? MASTERY_WEIGHTS[exercise.type];
}

export interface ConceptProgress {
  conceptId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  typoCount: number;
  /** 0–1. Bilimsel bir olcu degil; tekrar onceligi icin pratik bir gosterge. */
  masteryScore: number;
  lastPracticedAt?: string;
}

function emptyConcept(conceptId: string): ConceptProgress & { weighted: number; credit: number } {
  return {
    conceptId,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    typoCount: 0,
    masteryScore: 0,
    weighted: 0,
    credit: 0,
  };
}

/**
 * Her kavram icin ilerleme hesaplar.
 * Bir alistirma birden fazla kavrama bagliysa kanit hepsine yazilir.
 */
export function computeConceptProgress(
  progress: UserProgress,
  exercises: Exercise[],
): Map<string, ConceptProgress> {
  const accumulator = new Map<string, ReturnType<typeof emptyConcept>>();

  for (const exercise of exercises) {
    const entry = progress.exercises[exercise.id];
    if (!entry?.attempts.length) continue;
    const weight = masteryWeight(exercise);

    for (const conceptId of exercise.conceptIds) {
      const target = accumulator.get(conceptId) ?? emptyConcept(conceptId);

      for (const attempt of entry.attempts) {
        target.attempts += 1;
        target.weighted += weight;
        target.credit += weight * (CREDIT[attempt.result] ?? 0);
        if (attempt.result === 'correct') target.correct += 1;
        else if (attempt.result === 'incorrect') target.incorrect += 1;
        else if (attempt.result === 'minor-typo') target.typoCount += 1;
      }
      if (!target.lastPracticedAt || entry.lastSeenAt > target.lastPracticedAt) {
        target.lastPracticedAt = entry.lastSeenAt;
      }
      accumulator.set(conceptId, target);
    }
  }

  const result = new Map<string, ConceptProgress>();
  for (const [conceptId, item] of accumulator) {
    // Dogruluk orani × maruziyet guveni: az denemeyle "ustalasilmis" sayilmaz.
    const ratio = item.weighted > 0 ? item.credit / item.weighted : 0;
    const confidence = Math.min(1, item.weighted / CONFIDENCE_TARGET);
    result.set(conceptId, {
      conceptId,
      attempts: item.attempts,
      correct: item.correct,
      incorrect: item.incorrect,
      typoCount: item.typoCount,
      masteryScore: Number((ratio * confidence).toFixed(4)),
      lastPracticedAt: item.lastPracticedAt,
    });
  }
  return result;
}

export interface TopicMastery {
  topicId: string;
  title: string;
  masteryScore: number;
  practiced: number;
  total: number;
}

/** Konu ustaligi = konunun kavramlarinin ortalamasi (hic denenmemis = 0). */
export function computeTopicMastery(
  progress: UserProgress,
  exercises: Exercise[],
  topics: Array<{ id: string; title: string; conceptIds: string[] }>,
): TopicMastery[] {
  const concepts = computeConceptProgress(progress, exercises);

  return topics.map((topic) => {
    const scores = topic.conceptIds.map((id) => concepts.get(id)?.masteryScore ?? 0);
    const practiced = topic.conceptIds.filter((id) => (concepts.get(id)?.attempts ?? 0) > 0).length;
    const total = scores.reduce((sum, value) => sum + value, 0);
    return {
      topicId: topic.id,
      title: topic.title,
      masteryScore: scores.length ? total / scores.length : 0,
      practiced,
      total: topic.conceptIds.length,
    };
  });
}
