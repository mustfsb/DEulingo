/** Ustverisi acikca verilmemis alistirmalar icin yedek degerler. */

import type { ExerciseType, Skill } from '../types.ts';

/** Tip → olculen beceri. */
export const SKILL_BY_TYPE: Record<ExerciseType, Skill> = {
  'multiple-choice': 'recognition',
  matching: 'recognition',
  'fill-blank': 'recall',
  'free-text': 'production',
  'sentence-builder': 'production',
  ordering: 'production',
  'error-correction': 'correction',
  spoken: 'speaking',
  'listen-choice': 'recognition',
  dictation: 'recall',
  'word-bank-translation': 'production',
};

/** Tip → tahmini cozum suresi (saniye); oturum sureleri bundan hesaplanir. */
export const SECONDS_BY_TYPE: Record<ExerciseType, number> = {
  'multiple-choice': 15,
  matching: 40,
  'fill-blank': 20,
  'free-text': 35,
  'sentence-builder': 35,
  ordering: 30,
  'error-correction': 40,
  spoken: 60,
  'listen-choice': 35,
  dictation: 45,
  'word-bank-translation': 45,
};
