/**
 * Uretilen icerigin (generated/exercises.json) sema tanimlari.
 * Bu dosya hem Node tarafindaki parser hem de React tarafi tarafindan kullanilir.
 *
 * Müfredat KONU tabanlıdır: içerik kimliği `topicId`'dir. Gün numarası
 * yalnızca `legacyDay` olarak (göç/denetim izi) taşınır ve hiçbir davranışı
 * sürmez.
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

/** Tarihî öğrenme izleği (v9 öncesi kayıtlar). Yalnızca göçte okunur. */
export type LearningTrack = 'normal' | 'private';

export function isLearningTrack(value: unknown): value is LearningTrack {
  return value === 'normal' || value === 'private';
}

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
  /**
   * Almanca özel harfler (ß, ä, ö, ü) icin klavye toleransi.
   * Aktifken bu harflerin ASCII karsiliklari (ss, ae, oe, ue) ve
   * ikinci bir harflik yazim farki tam dogru sayilir.
   * Kullanici Almanca klavye olmadan da dogru cevap verebilir.
   */
  keyboardTolerance?: boolean;
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

/** Kavramın öğrenim durumu: `planned` kavramları gerektiren alıştırmalar kilitlidir. */
export type ConceptStatus = 'learned' | 'planned';

/**
 * Ogrenilebilir en kucuk birim. Her alistirma en az bir kavrama,
 * her kavram bir ozet bolumune (ve boylece tek bir konuya) baglanir.
 */
export interface Concept {
  /** "modal-verbs.koennen.cekim" */
  id: string;
  /** Kanonik konu: "topic.modal-verbs". */
  topicId: string;
  /** Kavramin anlatildigi ozet bolumu: "modal-verbs.koennen". */
  sectionId: string;
  label: string;
  /** Bu kavramdan once ogrenilmis olmasi gereken kavramlar. */
  prerequisites?: string[];
  /** Varsayılan `learned`. */
  status?: ConceptStatus;
}

export interface ExerciseSource {
  file: string;
  section?: string;
  sectionNumber?: number;
  itemKey?: string;
  /** Override katmaninda kullanilan dogal anahtar. */
  naturalKey: string;
}

export interface Exercise {
  id: string;
  /** Birincil kanonik konu — konu pratiği, ustalık ve hatalar bunu kullanır. */
  topicId: string;
  /**
   * Alıştırmanın ayrıca çalıştırdığı konular (kavramlarından ve bölüm
   * ilişkilerinden türetilir). Konu pratiği ve Genel Tekrar filtreleri
   * birincil + ikincil üyeliği birlikte görür.
   */
  secondaryTopicIds?: string[];
  /** Özet bölümü ("Özeti aç"). */
  sectionId?: string;
  /** Birincil konunun UI başlığı. */
  topic: string;
  /**
   * Genel Tekrar bankası üyesi. `true` ise alıştırma konu ders havuzlarına
   * girmez; yalnızca kümülatif Genel Tekrar oturumlarında (ve Genel Tekrar
   * konu filtrelerinde) kullanılır. İlerleme, ustalık ve hata takibi normal
   * alıştırmalarla aynı kurallarla çalışır.
   */
  reviewOnly?: boolean;
  /** Tarihî gün — YALNIZCA göç/denetim izi; hiçbir davranışı sürmez. */
  legacyDay?: number;
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

  difficulty: Difficulty;
  skill: Skill;
  /** Bu alistirmanin gerektirdigi ve olctugu kavramlar; `concepts` kaydindaki ID'ler. */
  conceptIds: string[];
  origin: ExerciseOrigin;

  /**
   * Ayni kavrami farkli bicimlerde soran alistirmalar ayni aileyi paylasir.
   * Oturum kurucusu ayni aileyi arka arkaya gostermez (tekrar yorgunlugu).
   */
  familyId?: string;
  estimatedSeconds?: number;
  /** Varsayilan tip agirligini ezer (bkz. `lib/mastery.ts`). */
  masteryWeight?: number;
  /** Cevap verildikten SONRA gosterilecek yaklasik okunuslar. */
  pronunciation?: Pronunciation[];
}

/** Ozet dosyasindaki bir bolumun ara temsili. */
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

/* ------------------------------------------------------------------ */
/* Müfredat — kanonik konular                                          */
/* ------------------------------------------------------------------ */

/** Paketteki konu: kayıt bilgisi + türetilmiş üyelikler. */
export interface CurriculumTopic {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  description: string;
  keywords: string;
  /** Müfredat haritasındaki sıra (0 tabanlı). */
  order: number;
  sectionIds: string[];
  conceptIds: string[];
  /** Birincil konusu bu olan ders alıştırmaları (Genel Tekrar bankası hariç). */
  exerciseIds: string[];
  /** İkincil etiketle bu konuyu da çalıştıran ders alıştırmaları. */
  secondaryExerciseIds: string[];
  /** Bu konuyu (birincil ya da ikincil) çalıştıran Genel Tekrar soruları. */
  reviewExerciseIds: string[];
  estimatedMinutes: number;
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

/**
 * Bir ozet BOLUMU (kaynaktaki H2). Govde `NoteBlock` birlesimini yeniden
 * kullanir — ham HTML render edilmez.
 */
export interface SummarySection {
  /** Kararli ID; kaynak baslik yeniden yazilsa da degismez. */
  id: string;
  /** Bolumun ait oldugu kanonik konu. */
  topicId: string;
  title: string;
  /** Bu bolumun ogrettigi kavramlar. */
  conceptIds: string[];
  /** Aciklama govdesi (paragraf / liste / tablo / kod / callout). */
  blocks: NoteBlock[];
  /** "### ⚠️ Dikkat" alt bolumlerinden gelen uyarilar. */
  warnings: string[];
  /** Konudaki Almanca ornek cumleler. */
  examples: GermanExample[];
  /** Onemli kaliplarin yaklasik okunusu. */
  pronunciation: Pronunciation[];
  /** Genel Tekrar ozetinde: "Bu Konuyu Çalış" yerine başlatılacak tekrar modu. */
  reviewMode?: 'mixed' | 'vocab' | 'quick';
  /** Genel Tekrar ozetindeki "Kendini Test Et" gibi bolumlerin sorulari. */
  recallQuestions?: RecallQuestion[];
  /** Uygulama ici ek aciklama eklendiyse true (kaynak dosya degismedi). */
  augmented?: boolean;
}

/** Bir konunun tam özeti (`Konu Özetleri.md` içindeki H1 bloğu). */
export interface TopicSummary {
  topicId: string;
  title: string;
  /** Konu başlığının altındaki kısa giriş (blockquote). */
  intro: string[];
  estimatedReadingMinutes: number;
  sections: SummarySection[];
  /** "Hızlı Tekrar" kontrol listesi. */
  keyPoints: string[];
  /** "Kendine Sor" soruları + gizli cevaplar. */
  recallQuestions: RecallQuestion[];
}

/** Kümülatif, sıkıştırılmış tekrar özeti (`Genel Tekrar Özet.md`). */
export interface ReviewSummary {
  title: string;
  intro: string[];
  estimatedReadingMinutes: number;
  /** Her bölüm aynı kanonik konu kimliğine bağlıdır (`topicId`). */
  sections: SummarySection[];
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
  /** Kanonik müfredat haritası (gösterim sırasıyla). */
  topics: CurriculumTopic[];
  exercises: Exercise[];
  concepts: Concept[];
  /** Konu özetleri (konu sırasıyla). */
  summaries: TopicSummary[];
  /** Kümülatif Genel Tekrar özeti. */
  reviewSummary?: ReviewSummary;
  /** Gelistirme denetimi icin turetilmis kavram kapsami (saklanan durum degil). */
  coverage: ConceptCoverage[];
  warnings: ContentWarning[];
}

/** Bir kavramin ne kadar pratigi oldugunu gosterir; bundle'dan turetilir. */
export interface ConceptCoverage {
  topicId: string;
  sectionId: string;
  conceptId: string;
  label: string;
  exercises: { easy: number; medium: number; hard: number };
  summaryCovered: boolean;
}

export const CONTENT_SCHEMA_VERSION = 3;
