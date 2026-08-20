/**
 * Uretilen icerigin (generated/exercises.json) sema tanimlari.
 * Bu dosya hem Node tarafindaki parser hem de React tarafi tarafindan kullanilir.
 */

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-blank'
  | 'free-text'
  | 'sentence-builder'
  | 'matching'
  | 'error-correction'
  | 'ordering'
  | 'spoken'
  | 'listen-choice'
  | 'dictation'
  | 'word-bank-translation';

/** İlk üç günün birbirini tekrar etmeyen, seçilebilir alıştırma paketleri. */
export type ExerciseSetId = 'set-1' | 'set-2' | 'set-3';

export interface ExerciseValidation {
  /** Buyuk/kucuk harf farki cevabin bir parcasiysa true (orn. `Sie` vs `sie`). */
  caseSensitive?: boolean;
  /** Noktalama cevabin bir parcasiysa true. */
  punctuationSensitive?: boolean;
  /** Yazim hatasi toleransini tamamen kapatir (orn. artikel testleri). */
  noTypoTolerance?: boolean;
  /**
   * "Yaklasik okunus" gibi TEK DOGRU YAZIMI OLMAYAN cevaplar icin.
   *
   * Turkce yazim Almanca sesleri birebir veremez — uygulama bunu ogrenciye de
   * soyler. Bu yuzden `voonen` / `vonen` / `voonnen` ya da `leerer` / `leera`
   * gibi ayni sesi anlatan yazimlar ayni cevap sayilir.
   */
  approximation?: boolean;
}

export interface ExercisePair {
  left: string;
  right: string;
}

export type TranslationDirection = 'de-to-tr' | 'tr-to-de';

export interface WordBankToken {
  /** Yinelenen kelimelerde dahi kararlı seçim kimliği. */
  id: string;
  text: string;
  distractor?: boolean;
}

export interface WordBankTranslation {
  direction: TranslationDirection;
  /** Öğrenciye gösterilen, zaten bilinen kaynak cümle. */
  sourceText: string;
  targetLanguage: 'de' | 'tr';
  tokens: WordBankToken[];
  /** Kanonik sıra ilk sıradır; doğal Türkçe alternatifleri sonrakilerdir. */
  acceptedSequences: string[][];
}

/** Piper'a gönderilebilecek tek tür metin: içerikte açıkça Almanca olarak işaretlenmiş hedef. */
export interface GermanAudioTarget {
  text: string;
  language: 'de-DE';
  role: 'prompt' | 'canonical-answer' | 'example' | 'vocabulary';
}

export interface ExerciseAudio {
  prompt?: GermanAudioTarget;
  canonicalAnswer?: GermanAudioTarget;
  /** İçerik yazarı tarafından açıkça Almanca olarak işaretlenmiş ek yüzeyler. */
  targets?: GermanAudioTarget[];
}

/** Alistirmanin bilissel yuku. A1 sinirlari icinde kalir. */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Alistirmanin olctugu beceri.
 * `recognition` tanima, `recall` hatirlama, `production` uretim,
 * `correction` duzeltme, `speaking` sesli gorev.
 */
export type Skill = 'recognition' | 'recall' | 'production' | 'correction' | 'speaking';

/** Alistirmanin kaynagi: Obsidian kasasi mi, uygulama ici yazilmis katman mi. */
export type ExerciseOrigin = 'vault' | 'authored';

/**
 * Turkce yaklasik okunus.
 *
 * ONEMLI: Turkce yazim Almanca sesleri birebir veremez. Bu veri her zaman
 * "Yaklasik okunus" etiketiyle sunulur; fonetik dogruluk iddiasi tasimaz.
 */
export interface Pronunciation {
  german: string;
  turkishApproximation: string;
  /** Zor sesler icin kisa ogrenci notu ("`ch` tam bir h degildir"). */
  note?: string;
}

/**
 * Ogrenilebilir en kucuk birim. Her alistirma en az bir kavrama,
 * her kavram bir ozet konusuna baglanir.
 */
export interface Concept {
  /** "day2.konjugation.du-st" */
  id: string;
  day: number;
  /** Bagli oldugu ozet konusu: "day2.fiil-cekimi" */
  topicId: string;
  label: string;
  /** Bu kavramdan once ogrenilmis olmasi gereken kavramlar. */
  prerequisites?: string[];
}

export interface ExerciseSource {
  file: string;
  day: number;
  section?: string;
  sectionNumber?: number;
  itemKey?: string;
  /** Override katmaninda kullanilan dogal anahtar: `gun/bolum/madde` */
  naturalKey: string;
}

export interface Exercise {
  id: string;
  day: number;
  topic: string;
  type: ExerciseType;

  instruction: string;
  prompt?: string;
  /** Dinleme sorusunda cevap sızdırmadan Piper'a gönderilecek gizli kanonik metin. */
  audioText?: string;

  answer?: string;
  acceptedAnswers?: string[];

  options?: string[];
  words?: string[];
  pairs?: ExercisePair[];
  wordBank?: WordBankTranslation;
  /** Metin sezgisi değil, içerik metadatası TTS yetkisini verir. */
  audio?: ExerciseAudio;

  /** `spoken` tipinde gosterilecek gereksinim listesi. */
  requirements?: string[];
  /** Ornek cevap (spoken / acik uclu alistirmalar icin). */
  sampleAnswer?: string;

  hint?: string;
  explanation?: string;

  /**
   * Kaynakta "ornek cevap" olarak isaretlenmis, birden fazla dogru uretimin
   * mumkun oldugu alistirma. Yanlis sayildiginda kullaniciya "yine de dogruydu"
   * secenegi sunulur.
   */
  openEnded?: boolean;

  validation?: ExerciseValidation;
  source: ExerciseSource;

  /* -- v2 ustveri ------------------------------------------------- */

  difficulty: Difficulty;
  skill: Skill;
  /** Bu alistirmanin olctugu kavramlar; `concepts` kaydindaki ID'ler. */
  conceptIds: string[];
  origin: ExerciseOrigin;
  /** Bagli oldugu ozet konusu — konu bazli calisma bunu kullanir. */
  topicId: string;

  /** Varsa soru yalnızca bu bağımsız alıştırma setinde gösterilir. */
  exerciseSetId?: ExerciseSetId;

  /**
   * Ayni kavrami farkli bicimlerde soran alistirmalar ayni aileyi paylasir.
   * Oturum kurucusu ayni aileyi arka arkaya gostermez (§32 tekrar yorgunlugu).
   */
  familyId?: string;
  estimatedSeconds?: number;
  /** Varsayilan tip agirligini ezer (bkz. `lib/mastery.ts`). */
  masteryWeight?: number;
  /** Cevap verildikten SONRA gosterilecek yaklasik okunuslar. */
  pronunciation?: Pronunciation[];
}

/**
 * Ozet dosyasindaki bir bolumun ara temsili.
 * `Özetler` bolumu bunun uzerine kurulur; pakette AYRICA saklanmaz.
 */
export interface LessonNote {
  title: string;
  /** Kaynak baslik duzeyi: 2 = ana konu, 3 = alt not ("Dikkat" gibi). */
  level: number;
  /** Duz metin paragraflari / madde isaretleri (markdown isaretlemesi sadelestirilmis). */
  blocks: NoteBlock[];
}

export type NoteBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'code'; lines: string[] }
  | { kind: 'callout'; text: string };

export interface Day {
  day: number;
  /** Ozet dosyasindaki H2 basliklarindan turetilen ana konular. */
  topics: string[];
  exerciseIds: string[];
  estimatedMinutes: number;
  /** Bu gunde ogretilen kavramlar. */
  conceptIds: string[];
  /** Bu gune ait ozet konularinin ID'leri. */
  summaryTopicIds: string[];
}

/* ------------------------------------------------------------------ */
/* Ozet (Ozetler bolumu)                                               */
/* ------------------------------------------------------------------ */

export interface GermanExample {
  german: string;
  /** Turkce karsiligi (kaynakta parantez icinde verilmisse). */
  turkish?: string;
  pronunciation?: Pronunciation;
}

export interface RecallQuestion {
  question: string;
  answer: string;
}

export interface SummaryTable {
  head: string[];
  rows: string[][];
}

/**
 * Ozet dosyasindaki bir H2 bolumunun yapilandirilmis hali.
 * Govde `NoteBlock` birlesimini yeniden kullanir — ham HTML render edilmez.
 */
export interface SummaryTopic {
  /** Kararli ID; kaynak baslik yeniden yazilsa da degismez. */
  id: string;
  title: string;
  /** Bu konunun ogrettigi kavramlar. */
  conceptIds: string[];
  /** Aciklama govdesi (paragraf / liste / tablo / kod / callout). */
  blocks: NoteBlock[];
  /** "### ⚠️ Dikkat" alt bolumlerinden gelen uyarilar. */
  warnings: string[];
  /** "5 Dakikalık Hızlı Tekrar" maddeleri. */
  keyPoints: string[];
  /** "Kendine Sor" sorulari + `<details>` icindeki cevaplari. */
  recallQuestions: RecallQuestion[];
  /** Konudaki Almanca ornek cumleler. */
  examples: GermanExample[];
  /** Onemli kaliplarin yaklasik okunusu. */
  pronunciation: Pronunciation[];
  /** Uygulama ici ek aciklama eklendiyse true (kaynak dosya degismedi). */
  augmented?: boolean;
}

export interface SummaryDay {
  day: number;
  title: string;
  estimatedReadingMinutes: number;
  topics: SummaryTopic[];
}

export interface ContentWarning {
  level: 'error' | 'warn';
  code: string;
  message: string;
  ref?: string;
}

export interface ContentBundle {
  generatedAt: string;
  schemaVersion: number;
  /**
   * Alistirma havuzunun icerik parmak izi. Havuz degistiginde degisir;
   * ilerleme goclerinde ve denetimde kullanilir. Mevcut ilerlemeyi
   * gecersiz KILMAZ — yalnizca bilgilendirme amaclidir.
   */
  contentVersion: string;
  sourceFiles: string[];
  days: Day[];
  exercises: Exercise[];
  concepts: Concept[];
  summaries: SummaryDay[];
  /** Gelistirme denetimi icin turetilmis kavram kapsami (saklanan durum degil). */
  coverage: ConceptCoverage[];
  warnings: ContentWarning[];
}

/** Bir kavramin ne kadar pratigi oldugunu gosterir; bundle'dan turetilir. */
export interface ConceptCoverage {
  day: number;
  topicId: string;
  conceptId: string;
  label: string;
  exercises: { easy: number; medium: number; hard: number };
  summaryCovered: boolean;
}

export const CONTENT_SCHEMA_VERSION = 2;
