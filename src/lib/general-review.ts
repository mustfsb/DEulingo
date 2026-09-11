/**
 * Genel Tekrar — konular arası kümülatif tekrar.
 *
 * İkinci bir taksonomi YOKTUR: konu kartları ve konu filtresi, müfredatın
 * kanonik konu kimliklerini (`topic.*`) kullanır. Genel Tekrar bankası
 * (`reviewOnly`) aynı konu etiketlerini taşır.
 *
 * - Modlar (Karışık, Kelime, Cümle Kurma, Writing, Dinleme, Hızlı, Zor)
 *   konular arasıdır ve yalnızca Genel Tekrar bankasından beslenir.
 * - Konu kartı bir konuya odaklanır: o konunun Genel Tekrar soruları önce
 *   gelir, ders bankasındaki aynı konu soruları havuzu tamamlar.
 */

import type { Exercise } from '../content/types';
import { REVIEW_SECTION_BY_ID } from '../content/curriculum/topics';

export type ReviewMode =
  | 'mixed'
  | 'vocab'
  | 'sentence'
  | 'writing'
  | 'listening'
  | 'quick'
  | 'challenge'
  | 'topic';

export interface ReviewModeMeta {
  mode: ReviewMode;
  title: string;
  description: string;
  /** Önerilen oturum büyüklüğü. */
  size: number;
}

export const REVIEW_MODES: ReviewModeMeta[] = [
  { mode: 'mixed', title: 'Karışık Genel Tekrar', description: 'Öğrendiğin her konudan karışık seçki', size: 28 },
  { mode: 'vocab', title: 'Kelime Çalışması', description: 'Artikel + kelime, iki yönlü', size: 24 },
  { mode: 'sentence', title: 'Cümle Kurma', description: 'Türkçeden Almancaya aktif üretim', size: 24 },
  { mode: 'writing', title: 'Writing', description: 'Kısa yönlendirmeli yazma', size: 7 },
  { mode: 'listening', title: 'Dinleme', description: 'Duyduğunu tanı ve yaz', size: 16 },
  { mode: 'quick', title: 'Hızlı Tekrar', description: 'Hatalar ve zayıf konular, ~10 dakika', size: 12 },
  { mode: 'challenge', title: 'Zor Sorular', description: 'Güçlü hatırlama, üretim ağırlıklı', size: 22 },
];

/** Konu kartından açılan odaklı tekrar. */
export const TOPIC_REVIEW_META: ReviewModeMeta = {
  mode: 'topic',
  title: 'Konu Tekrarı',
  description: 'Seçilen konunun Genel Tekrar ve ders soruları',
  size: 20,
};

export function reviewModeMeta(mode: ReviewMode): ReviewModeMeta {
  if (mode === 'topic') return TOPIC_REVIEW_META;
  return REVIEW_MODES.find((entry) => entry.mode === mode) ?? REVIEW_MODES[0];
}

/* ------------------------------------------------------------------ */
/* Mod havuzları                                                        */
/* ------------------------------------------------------------------ */

const VOCAB_TYPES = new Set(['multiple-choice', 'matching', 'listen-choice', 'dictation', 'fill-blank']);
const SENTENCE_TYPES = new Set(['free-text', 'word-bank-translation', 'ordering', 'sentence-builder']);
const LISTENING_TYPES = new Set(['listen-choice', 'dictation']);

function answerWords(exercise: Exercise): number {
  return (exercise.answer ?? '').trim().split(/\s+/).filter(Boolean).length;
}

/** Tür + cevap uzunluğuna göre kelime-odaklı alıştırma mı? */
export function isVocabExercise(exercise: Exercise): boolean {
  if (VOCAB_TYPES.has(exercise.type)) return true;
  // Kısa üretimler (kelime → basit cümle) kelime çalışmasına girer.
  if (exercise.type === 'free-text' && answerWords(exercise) <= 5 && !exercise.openEnded) return true;
  return false;
}

/** Aktif cümle üretimi mi (kelime bankası Türkçe→Almanca yönü dahil)? */
export function isSentenceExercise(exercise: Exercise): boolean {
  if (exercise.type === 'word-bank-translation') return exercise.wordBank?.direction !== 'de-to-tr';
  if (exercise.type === 'free-text') return answerWords(exercise) >= 2;
  return SENTENCE_TYPES.has(exercise.type);
}

export function isListeningExercise(exercise: Exercise): boolean {
  return LISTENING_TYPES.has(exercise.type);
}

export function isWritingExercise(exercise: Exercise): boolean {
  return exercise.type === 'free-text' && exercise.openEnded === true;
}

/** Alıştırma bu kanonik konuyu çalıştırıyor mu (birincil ya da ikincil etiket)? */
export function exerciseTouchesTopic(exercise: Exercise, topicId: string): boolean {
  return exercise.topicId === topicId || Boolean(exercise.secondaryTopicIds?.includes(topicId));
}

const answerKey = (exercise: Exercise) =>
  (exercise.answer ?? '').toLocaleLowerCase('de').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();

/**
 * Konu kartının havuzu: konunun Genel Tekrar soruları + aynı konunun ders
 * soruları. Genel Tekrar sorusuyla aynı cevabı isteyen ders sorusu havuza
 * girmez (aynı cümle bir oturumda iki kez sorulmaz).
 */
export function topicReviewPool(reviewBank: Exercise[], lessonBank: Exercise[], topicId: string): Exercise[] {
  const review = reviewBank.filter((exercise) => exerciseTouchesTopic(exercise, topicId));
  const taken = new Set(review.map(answerKey).filter(Boolean));
  const lesson = lessonBank.filter((exercise) => {
    if (!exerciseTouchesTopic(exercise, topicId)) return false;
    const key = answerKey(exercise);
    return !key || !taken.has(key);
  });
  return [...review, ...lesson];
}

/**
 * Bir modun havuzu. Konu kartı (`topicId`) verilirse konuya odaklanır;
 * mod filtresi (varsa) bunun üstüne uygulanır.
 */
export function reviewPoolFor(
  reviewBank: Exercise[],
  mode: ReviewMode,
  topicId?: string,
  lessonBank: Exercise[] = [],
): Exercise[] {
  const pool = topicId ? topicReviewPool(reviewBank, lessonBank, topicId) : [...reviewBank];
  switch (mode) {
    case 'vocab':
      return pool.filter(isVocabExercise);
    case 'sentence':
      return pool.filter(isSentenceExercise);
    case 'writing':
      return pool.filter(isWritingExercise);
    case 'listening':
      return pool.filter(isListeningExercise);
    case 'mixed':
    case 'quick':
    case 'challenge':
    case 'topic':
      return pool;
  }
}

/** Konu havuzu bu kadar sorudan küçükse konu tekrarı açılmaz. */
export const MIN_TOPIC_POOL = 6;

/* ------------------------------------------------------------------ */
/* Genel özet → pratik bağlantısı ("Bu Konuyu Çalış")                  */
/* ------------------------------------------------------------------ */

/**
 * Genel Tekrar Özeti bölümü → başlatılacak hedef. Bölümün kanonik konusu
 * varsa o konunun tekrarı; yoksa konular arası bir mod.
 */
export function reviewSectionAction(sectionId: string): { topicId?: string; mode?: ReviewMode } | undefined {
  const def = REVIEW_SECTION_BY_ID.get(sectionId);
  if (!def) return undefined;
  if (def.topicId) return { topicId: def.topicId };
  if (def.mode) return { mode: def.mode };
  return undefined;
}
