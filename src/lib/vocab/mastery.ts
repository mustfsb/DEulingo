/**
 * Kelime ustalığı — TÜRETİLMİŞ (mevcut mimariyle aynı ilke).
 *
 * Hiçbir şey saklanmaz: `progress.exercises` içindeki `vocab-<id>-*`
 * denemelerinden hesaplanır. Böylece ilerleme tek kaynakta kalır, göç
 * gerekmez ve ders tamamlama etkilenmez (kelime kimlikleri ders havuzunda
 * yoktur — bilinçli tercih).
 *
 * Ağırlık: Türkçe→Almanca yazma > artikel > dinleyerek yazma > tanıma.
 * Tek kolay tanımayla "mastered" olunmaz (güven eşiği).
 */

import { VOCABULARY, type VocabEntry } from '../../content/vocabulary/inventory';
import type { UserProgress } from '../storage';

export type VocabState = 'new' | 'learning' | 'weak' | 'familiar' | 'mastered';

export interface VocabProgress {
  vocabId: string;
  entry: VocabEntry;
  attempts: number;
  correct: number;
  incorrect: number;
  typoCount: number;
  /** 0–1 ağırlıklı ustalık puanı. */
  score: number;
  state: VocabState;
  lastPracticedAt?: string;
}

/** Soru-tür eki → kanıt ağırlığı. */
function weightOf(questionId: string): number {
  if (questionId.endsWith('-trde-type')) return 1.3;
  if (questionId.endsWith('-listen-type')) return 1.1;
  if (questionId.endsWith('-article')) return 1.0;
  if (questionId.endsWith('-trde-mc')) return 0.8;
  if (questionId.endsWith('-detr-type')) return 0.8;
  if (questionId.endsWith('-listen-choice')) return 0.7;
  if (questionId.includes('-match-')) return 0.7;
  if (questionId.endsWith('-detr-mc')) return 0.6;
  if (questionId.endsWith('-flash')) return 0.5;
  return 0.7;
}

const CREDIT = { correct: 1, 'minor-typo': 0.5, 'self-assessed': 0.5, incorrect: 0, skipped: 0 } as const;

/** Doygunluk için gereken ağırlıklı kanıt miktarı (tek kolay cevap yetmez). */
export const VOCAB_CONFIDENCE_TARGET = 3;

export function computeVocabProgress(progress: UserProgress): Map<string, VocabProgress> {
  const acc = new Map<string, { weighted: number; credit: number; attempts: number; correct: number; incorrect: number; typo: number; last?: string }>();
  for (const [id, record] of Object.entries(progress.exercises)) {
    if (!id.startsWith('vocab-') || id.startsWith('vocab-match-')) continue;
    const vocabId = id.slice('vocab-'.length).split(/-(detr|trde|article|listen|match|flash)-/)[0];
    if (!vocabId) continue;
    const weight = weightOf(id);
    const target = acc.get(vocabId) ?? { weighted: 0, credit: 0, attempts: 0, correct: 0, incorrect: 0, typo: 0 };
    for (const attempt of record.attempts) {
      target.attempts += 1;
      target.weighted += weight;
      target.credit += weight * (CREDIT[attempt.result as keyof typeof CREDIT] ?? 0);
      if (attempt.result === 'correct') target.correct += 1;
      else if (attempt.result === 'incorrect') target.incorrect += 1;
      else if (attempt.result === 'minor-typo') target.typo += 1;
    }
    if (!target.last || record.lastSeenAt > target.last) target.last = record.lastSeenAt;
    acc.set(vocabId, target);
  }
  // Eşleştirme soruları tek kimlikte N kelimeyi ölçer — katılımı her üyeye yaz.
  for (const [id, record] of Object.entries(progress.exercises)) {
    if (!id.startsWith('vocab-match-')) continue;
    const memberPart = id.slice('vocab-match-'.length).split('-de-tr')[0].split('-tr-de')[0];
    const members = memberPart.split('+').filter(Boolean);
    for (const vocabId of members) {
      const target = acc.get(vocabId) ?? { weighted: 0, credit: 0, attempts: 0, correct: 0, incorrect: 0, typo: 0 };
      const weight = 0.7;
      for (const attempt of record.attempts) {
        target.attempts += 1;
        target.weighted += weight;
        target.credit += weight * (CREDIT[attempt.result as keyof typeof CREDIT] ?? 0);
        if (attempt.result === 'correct') target.correct += 1;
        else if (attempt.result === 'incorrect') target.incorrect += 1;
        else if (attempt.result === 'minor-typo') target.typo += 1;
      }
      if (!target.last || record.lastSeenAt > target.last) target.last = record.lastSeenAt;
      acc.set(vocabId, target);
    }
  }

  const result = new Map<string, VocabProgress>();
  for (const entry of VOCABULARY) {
    const item = acc.get(entry.id);
    if (!item) {
      result.set(entry.id, {
        vocabId: entry.id, entry, attempts: 0, correct: 0, incorrect: 0, typoCount: 0, score: 0, state: 'new',
      });
      continue;
    }
    const ratio = item.weighted > 0 ? item.credit / item.weighted : 0;
    const confidence = Math.min(1, item.weighted / VOCAB_CONFIDENCE_TARGET);
    const score = Number((ratio * confidence).toFixed(4));
    const state: VocabState =
      item.incorrect >= 2 || (item.incorrect >= 1 && ratio < 0.4)
        ? 'weak'
        : score >= 0.8 && item.weighted >= VOCAB_CONFIDENCE_TARGET
          ? 'mastered'
          : score >= 0.5
            ? 'familiar'
            : item.attempts > 0
              ? 'learning'
              : 'new';
    result.set(entry.id, {
      vocabId: entry.id,
      entry,
      attempts: item.attempts,
      correct: item.correct,
      incorrect: item.incorrect,
      typoCount: item.typo,
      score,
      state,
      lastPracticedAt: item.last,
    });
  }
  return result;
}

export interface VocabSummary {
  total: number;
  mastered: number;
  familiar: number;
  learning: number;
  weak: number;
  untouched: number;
}

export function summarizeVocab(progress: UserProgress): VocabSummary {
  const map = computeVocabProgress(progress);
  const summary: VocabSummary = { total: VOCABULARY.length, mastered: 0, familiar: 0, learning: 0, weak: 0, untouched: 0 };
  for (const item of map.values()) {
    if (item.state === 'mastered') summary.mastered += 1;
    else if (item.state === 'familiar') summary.familiar += 1;
    else if (item.state === 'weak') summary.weak += 1;
    else if (item.state === 'learning') summary.learning += 1;
    else summary.untouched += 1;
  }
  return summary;
}

/** Konu başına kelime ustalığı (gerçek veriden; uydurma yok). */
export function topicVocabProgress(
  progress: UserProgress,
  topicId: string,
): { total: number; mastered: number; entries: VocabEntry[] } {
  const map = computeVocabProgress(progress);
  const entries = VOCABULARY.filter((entry) => entry.topicIds.includes(topicId));
  const mastered = entries.filter((entry) => map.get(entry.id)?.state === 'mastered').length;
  return { total: entries.length, mastered, entries };
}

/** Zayıf kelimeler (önce en çok yanlış yapılan). */
export function weakVocabs(progress: UserProgress, limit = 30): VocabProgress[] {
  return [...computeVocabProgress(progress).values()]
    .filter((item) => item.state === 'weak' || item.incorrect > 0 || item.typoCount > 0)
    .sort((a, b) => b.incorrect - a.incorrect || b.typoCount - a.typoCount || b.attempts - a.attempts)
    .slice(0, limit);
}
