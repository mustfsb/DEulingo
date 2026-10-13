/**
 * Havuz ölçümleri: "kaç benzersiz alıştırma?" sorusunun tek tanımı.
 *
 * Aynı cümlenin birden çok biçimi (sıralama + kutucuk + serbest yazım)
 * TEK sayılır; böylece havuz şişirilmiş görünmez. Üretim türlerinde kimlik
 * kanonik cevaptır; tanıma türlerinde soru + cevap.
 */

import type { Exercise } from '../content/types';

const norm = (value: string | undefined): string =>
  (value ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Cevap/üretim ağırlıklı türler: kimlik = kanonik cevap. */
export const PRODUCTION_TYPES = new Set<Exercise['type']>([
  'free-text', 'ordering', 'word-bank-translation', 'sentence-builder', 'error-correction',
]);

/** Tanıma/eşleştirme: soru metnine bağlı. */
export function distinctKey(exercise: Exercise): string {
  if (exercise.type === 'matching') {
    return `m|${(exercise.pairs ?? []).map((pair) => `${norm(pair.left)}=${norm(pair.right)}`).sort().join(';')}`;
  }
  if (PRODUCTION_TYPES.has(exercise.type)) return `p|${norm(exercise.answer)}`;
  return `r|${norm(exercise.prompt)}|${norm(exercise.answer)}`;
}

export function distinctCount(exercises: readonly Exercise[]): number {
  return new Set(exercises.map(distinctKey)).size;
}

/** Üretim türlerinin payı (0–1). */
export function productionShare(exercises: readonly Exercise[]): number {
  if (!exercises.length) return 0;
  return exercises.filter((exercise) => PRODUCTION_TYPES.has(exercise.type)).length / exercises.length;
}
