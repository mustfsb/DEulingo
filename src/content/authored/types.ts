/**
 * Uygulama ici yazilmis alistirma katmani.
 *
 * Kaynak Obsidian dosyalari DEGISTIRILMEZ; havuzu genisletmek icin alistirmalar
 * burada tanimlanir. Her tanim yalnizca `concepts.ts` icindeki kavramlara
 * dayanabilir — boylece ogretilmemis bilgi sorulamaz.
 *
 * ID KURALI: elle yazilir, anlamlidir ve KONUMDAN BAGIMSIZDIR. Listenin
 * ortasina yeni alistirma eklemek mevcut hicbir ID'yi kaydirmaz, dolayisiyla
 * kayitli ilerleme bozulmaz.
 */

import type {
  Difficulty,
  ExercisePair,
  ExerciseType,
  ExerciseValidation,
  ExerciseAudio,
  Skill,
  WordBankTranslation,
} from '../types.ts';

export interface AuthoredExercise {
  /** Elle verilen kararli ID: `d2-konj-du-kommst-fill`. */
  id: string;
  day: number;
  track?: import('../types.ts').LearningTrack;
  /** Bagli oldugu ozet konusu (`SUMMARY_TOPICS` ID'si). */
  topicId: string;
  type: ExerciseType;
  difficulty: Difficulty;
  skill: Skill;
  conceptIds: string[];
  /** Ayni kavrami farkli bicimde soranlar ayni aileyi paylasir. */
  familyId?: string;

  instruction: string;
  prompt?: string;
  audioText?: string;
  answer?: string;
  acceptedAnswers?: string[];
  options?: string[];
  pairs?: ExercisePair[];
  words?: string[];
  wordBank?: WordBankTranslation;
  audio?: ExerciseAudio;
  requirements?: string[];
  sampleAnswer?: string;
  hint?: string;
  explanation?: string;
  openEnded?: boolean;
  validation?: ExerciseValidation;

  /**
   * Cevaptan sonra yaklasik okunusu gosterilecek Almanca dizeler.
   * Bos birakilirsa cevabin kendisi (Almancaysa) kullanilir.
   */
  pronounce?: string[];
  estimatedSeconds?: number;
  masteryWeight?: number;
}

/** Uygulama ici ek ozet aciklamasi (kaynak dosya degistirilmeden). */
export interface SummaryAugmentation {
  topicId: string;
  /** Bu ek notun ogrettigi kavramlar. */
  conceptIds: string[];
  title: string;
  paragraphs?: string[];
  table?: { head: string[]; rows: string[][] };
  examples?: Array<{ german: string; turkish?: string }>;
  warning?: string;
  /** Neden gerekli oldugu — denetim raporunda gosterilir. */
  reason: string;
}
