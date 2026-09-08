/**
 * Genel Tekrar bankası — kümülatif tekrar havuzu (250 özgün alıştırma).
 *
 * Kelime (48) + Fiil/Zaman (56) + Cümle Kurma (64) + Günlük Yaşam (82).
 * Tümü `reviewOnly`: gün havuzlarına girmez, gün tamamlamasını etkilemez.
 */

import type { AuthoredExercise } from '../types.ts';
import { GENERAL_REVIEW_VOCAB } from './generalReviewVocab.ts';
import { GENERAL_REVIEW_VERBS_TIME } from './generalReviewVerbsTime.ts';
import { GENERAL_REVIEW_SENTENCES } from './generalReviewSentences.ts';
import { GENERAL_REVIEW_LIFE } from './generalReviewLife.ts';
import { GENERAL_REVIEW_TOPUP } from './generalReviewTopup.ts';

export const GENERAL_REVIEW_EXERCISES: AuthoredExercise[] = [
  ...GENERAL_REVIEW_VOCAB,
  ...GENERAL_REVIEW_VERBS_TIME,
  ...GENERAL_REVIEW_SENTENCES,
  ...GENERAL_REVIEW_LIFE,
  ...GENERAL_REVIEW_TOPUP,
];
