/**
 * Uygulama ici yazilmis alistirma katmani.
 *
 * Her tanim yalnizca `concepts.ts` icindeki kavramlara dayanabilir — boylece
 * ogretilmemis bilgi sorulamaz. Konu kimligi (`topicId`) kanonik konu
 * kaydindan gelir (`curriculum/topics.ts`); gun numarasi yoktur.
 *
 * ID KURALI: elle yazilir, anlamlidir ve KONUMDAN BAGIMSIZDIR. Listenin
 * ortasina yeni alistirma eklemek mevcut hicbir ID'yi kaydirmaz, dolayisiyla
 * kayitli ilerleme bozulmaz. Eski ID'ler (`p7-…`) kalici ilerleme icin
 * degistirilmeden korunur.
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
  /** Elle verilen kararli ID: `mv-koennen-deutsch-wb`. */
  id: string;
  /** Birincil kanonik konu: `topic.modal-verbs` (bkz. `T`). */
  topicId: string;
  /**
   * Alistirmanin ayrica calistirdigi konular. Kavramlardan ve bolum
   * iliskilerinden otomatik turetilir; burada yalnizca ek etiket verilir.
   */
  secondaryTopicIds?: string[];
  /** "Özeti aç" icin ozet bolumu; verilmezse ilk kavramin bolumu kullanilir. */
  sectionId?: string;
  /**
   * Genel Tekrar bankası üyesi. `true` ise alıştırma konu ders havuzlarına
   * girmez; kümülatif Genel Tekrar oturumlarında kullanılır.
   */
  reviewOnly?: boolean;
  /** Tarihî gün — YALNIZCA kaynak izi/denetim; hiçbir davranışı sürmez. */
  legacyDay?: number;
  type: ExerciseType;
  difficulty: Difficulty;
  skill: Skill;
  /** Alistirmanin gerektirdigi ve olctugu kavramlar (ilki birincil). */
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
  sectionId: string;
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
