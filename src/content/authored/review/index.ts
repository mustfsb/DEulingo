/**
 * Genel Tekrar bankası — kümülatif, konular arası tekrar havuzu.
 *
 * Kelime + Fiil/Zaman + Cümle Kurma + Günlük Yaşam + dengeleme + Modalverben.
 * Hepsi `reviewOnly`: konu ders havuzlarına girmez; aynı kanonik konu
 * etiketlerini taşıdığı için Genel Tekrar'da konuya göre filtrelenebilir.
 */

import type { AuthoredExercise } from '../types.ts';
import { GENERAL_REVIEW_VOCAB } from './vocab.ts';
import { GENERAL_REVIEW_VERBS_TIME } from './verbsTime.ts';
import { GENERAL_REVIEW_SENTENCES } from './sentences.ts';
import { GENERAL_REVIEW_LIFE } from './life.ts';
import { GENERAL_REVIEW_TOPUP } from './topup.ts';
import { GENERAL_REVIEW_MODAL } from './modal.ts';

export const GENERAL_REVIEW_EXERCISES: AuthoredExercise[] = [
  ...GENERAL_REVIEW_VOCAB,
  ...GENERAL_REVIEW_VERBS_TIME,
  ...GENERAL_REVIEW_SENTENCES,
  ...GENERAL_REVIEW_LIFE,
  ...GENERAL_REVIEW_TOPUP,
  ...GENERAL_REVIEW_MODAL,
];
