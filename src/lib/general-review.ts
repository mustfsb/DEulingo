/**
 * Genel Tekrar — kümülatif tekrar havuzunun konu haritası ve oturum modları.
 *
 * Konu grupları LEARNED_SO_FAR'dan türetilir (Özel Ders 1, 2, 3, 5, 6, 7, 10).
 * NOT: müfredatta hafta günü / ay adı / mevsim adı ÖĞRETİLMEDİ (gün adları,
 * aylar ve mevsimler ayrı birer kelime listesi olarak yok); zaman grubu bu
 * yüzden öğrenilen zaman ifadelerine (am Morgen, im Winter, um ... Uhr,
 * heute, jeden Tag, Wochenende, saatler) dayanır.
 */

import type { Exercise } from '../content/types';

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
  { mode: 'mixed', title: 'Karışık Genel Tekrar', description: 'Öğrendiğin her şeyden karışık seçki', size: 28 },
  { mode: 'vocab', title: 'Kelime Çalışması', description: 'Artikel + kelime, iki yönlü', size: 24 },
  { mode: 'sentence', title: 'Cümle Kurma', description: 'Türkçeden Almancaya aktif üretim', size: 24 },
  { mode: 'writing', title: 'Writing', description: 'Kısa yönlendirmeli yazma', size: 7 },
  { mode: 'listening', title: 'Dinleme', description: 'Duyduğunu tanı ve yaz', size: 16 },
  { mode: 'quick', title: 'Hızlı Tekrar', description: 'Hatalar ve zayıf konular, ~10 dakika', size: 12 },
  { mode: 'challenge', title: 'Zor Sorular', description: 'Güçlü hatırlama, üretim ağırlıklı', size: 22 },
];

export function reviewModeMeta(mode: ReviewMode): ReviewModeMeta {
  return REVIEW_MODES.find((entry) => entry.mode === mode) ?? REVIEW_MODES[0];
}

/* ------------------------------------------------------------------ */
/* Konu grupları                                                        */
/* ------------------------------------------------------------------ */

export interface ReviewGroup {
  id: string;
  title: string;
  description: string;
  /** Bu gruba giren özet konuları. Bir alıştırma, topicId'si buradaysa gruptadır. */
  topicIds: string[];
}

export const REVIEW_GROUPS: ReviewGroup[] = [
  {
    id: 'tanisma',
    title: 'Kendini Tanıtma',
    description: 'İsim, tanışma, diller ve selamlaşma',
    topicIds: ['private.day1.vorstellung', 'private.day1.diller-selamlasma', 'private.day5.kendini-tanitma'],
  },
  {
    id: 'kisisel-bilgiler',
    title: 'Kişisel Bilgiler',
    description: 'Yaş, köken, meslek, form ve sayılarla kimlik',
    topicIds: [
      'private.day1.alter-herkunft-wohnort',
      'private.day1.beruf',
      'private.day1.kontakt-formular',
      'private.day5.leben',
      'private.day5.kisisel-bilgiler',
      'private.day5.dogum-yeri',
      'private.day5.medeni-hal',
      'private.day5.kelimeler',
    ],
  },
  {
    id: 'fiil-cekimi',
    title: 'Fiiller ve Çekimler',
    description: 'sein, haben ve günlük fiillerin çekimi',
    topicIds: ['private.day1.fiil-cekimi', 'private.day2.haben-sein'],
  },
  {
    id: 'artikeller',
    title: 'Artikeller',
    description: 'der/die/das, ein/eine, kein, mein/dein',
    topicIds: ['private.day2.artikel-belirli-belirsiz', 'private.day2.artikel-kein-mein-dein'],
  },
  {
    id: 'cumle-kurma',
    title: 'Cümle Kurma',
    description: 'Olumlu/olumsuz cümle, soru ve fiil sırası',
    topicIds: [
      'private.day2.cumle-olumlu',
      'private.day2.cumle-olumsuz',
      'private.day2.sorular',
      'private.day3.cumle-dizilisi',
      'private.day6.cumle-kurma',
      'private.day6.hedef',
    ],
  },
  {
    id: 'iyelik',
    title: 'İyelik Yapıları',
    description: 'mein, dein, sein, ihr, unser ile sahiplik',
    topicIds: ['private.day3.iyelik', 'private.day6.iyelik-tablo'],
  },
  {
    id: 'sevmek-istemek',
    title: 'Sevmek ve İstemek',
    description: 'mögen, gern ve möchten',
    topicIds: ['private.day3.mogen-moechten-gern'],
  },
  {
    id: 'es-gibt',
    title: 'es gibt — Var / Yok',
    description: 'Varlık anlatma ve Akkusativ',
    topicIds: ['private.day3.es-gibt'],
  },
  {
    id: 'yer-yon',
    title: 'Yer ve Yön',
    description: 'zum/zur/im/ins/am, nach Hause, mit + Dativ',
    topicIds: ['private.day3.yer-yon'],
  },
  {
    id: 'sifatlar',
    title: 'Sıfatlar',
    description: 'Yüklem sıfatları ve ev tasviri',
    topicIds: ['private.day3.sifat-ekleri', 'private.day7.evi-tarif'],
  },
  {
    id: 'sayilar-miktar',
    title: 'Sayılar ve Miktarlar',
    description: '10–1000 arası sayılar, şişe/paket/demek',
    topicIds: [
      'private.day3.miktar-cogul',
      'private.day5.sayilar-onluklar',
      'private.day5.sayilar-yuzler',
      'private.day7.miktar',
    ],
  },
  {
    id: 'zaman',
    title: 'Zaman İfadeleri',
    description: 'am Morgen, im Winter, heute, jeden Tag',
    topicIds: ['private.day3.zaman'],
  },
  {
    id: 'saatler',
    title: 'Saatler',
    description: 'Wie spät ist es? halb, Viertel, um ... Uhr',
    topicIds: [
      'private.day10.uhrzeit-frage',
      'private.day10.uhrzeit-resmi',
      'private.day10.uhrzeit-gunluk',
      'private.day10.halb-viertel',
      'private.day10.um-uhr',
    ],
  },
  {
    id: 'gunluk-hayat',
    title: 'Günlük Hayat',
    description: 'Okul, iş, hava, hayvanlar ve hobiler',
    topicIds: ['private.day2.gunluk-hayat', 'private.day3.gunluk-hayat', 'private.day3.hedef'],
  },
  {
    id: 'yiyecek',
    title: 'Essen und Trinken',
    description: 'Yemekler, içecekler ve gern ile sevmek',
    topicIds: ['private.day5.yiyecek', 'private.day7.essen-trinken', 'private.day7.yeni-yiyecek'],
  },
  {
    id: 'alisveris',
    title: 'Alışveriş',
    description: 'Sıklık, fiyat, brauchen ve miktarlar',
    topicIds: ['private.day7.alisveris-siklik', 'private.day7.fiyat', 'private.day7.brauchen'],
  },
  {
    id: 'ev',
    title: 'Ev ve Odalar',
    description: 'Odalar, mobilyalar, gefallen ve evini anlatma',
    topicIds: [
      'private.day7.hedef',
      'private.day7.ev-odalar',
      'private.day7.mobilyalar',
      'private.day7.artikel-zamir',
      'private.day7.yeni-fiiller',
      'private.day7.gefallen',
      'private.day7.faydali-kelimeler',
      'private.day7.evimi-anlatiyorum',
      'private.day7.kaliplar',
    ],
  },
  {
    id: 'ayrilabilen-fiiller',
    title: 'Ayrılabilen Fiiller',
    description: 'aufstehen, anrufen, einkaufen ve ayrılmayanlar',
    topicIds: [
      'private.day3.ayrilabilen-fiiller',
      'private.day3.refleksif',
      'private.day10.trennbar-nedir',
      'private.day10.kern-verben',
      'private.day10.trennbar-nicht',
      'private.day10.hedef',
    ],
  },
  {
    id: 'mein-tag',
    title: 'Mein Tag',
    description: 'Günlük rutin ve dann / danach ile bağlama',
    topicIds: [
      'private.day10.mein-tag-sabah',
      'private.day10.mein-tag-gun',
      'private.day10.mein-tag-aksam',
      'private.day10.dann-danach',
      'private.day10.mein-tag-tam',
      'private.day10.wortschatz',
    ],
  },
  {
    id: 'baglaclar',
    title: 'Bağlaçlar',
    description: 'und, aber, dann ve danach',
    topicIds: ['private.day5.baglaclar', 'private.day5.hedef', 'private.day10.dann-danach'],
  },
];

export function reviewGroupById(groupId: string): ReviewGroup | undefined {
  return REVIEW_GROUPS.find((group) => group.id === groupId);
}

/** Alıştırma bu konu grubuna mı ait (topicId üzerinden)? */
export function exerciseInGroup(exercise: Exercise, groupId: string): boolean {
  const group = reviewGroupById(groupId);
  return group ? group.topicIds.includes(exercise.topicId) : false;
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

/**
 * Bir modun havuzu. `groupId` verilirse konu grubuna daraltılır
 * (Konu Çalışması akışı); mod filtresi üstüne uygulanır.
 */
export function reviewPoolFor(bank: Exercise[], mode: ReviewMode, groupId?: string): Exercise[] {
  let pool = groupId ? bank.filter((exercise) => exerciseInGroup(exercise, groupId)) : [...bank];
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

/** Grup havuzu bu kadar sorudan küçükse konu çalışması açılmaz. */
export const MIN_GROUP_SIZE = 6;

export function groupPoolSize(bank: Exercise[], groupId: string): number {
  return bank.filter((exercise) => exerciseInGroup(exercise, groupId)).length;
}

/* ------------------------------------------------------------------ */
/* Genel özet → pratik bağlantısı (§54 "Bu Konuyu Çalış")               */
/* ------------------------------------------------------------------ */

/** Genel özet konusu → başlatılacak Genel Tekrar hedefi. */
export const GENERAL_TOPIC_ACTION: Record<string, { groupId?: string; mode?: ReviewMode }> = {
  'genel.tanisma': { groupId: 'tanisma' },
  'genel.kendini-tanitma': { groupId: 'tanisma' },
  'genel.kisi-zamirleri': { groupId: 'cumle-kurma' },
  'genel.artikeller': { groupId: 'artikeller' },
  'genel.kein-mein': { groupId: 'artikeller' },
  'genel.kisisel-bilgiler': { groupId: 'kisisel-bilgiler' },
  'genel.soru-kurma': { groupId: 'cumle-kurma' },
  'genel.cumle-kurma': { groupId: 'cumle-kurma' },
  'genel.olumsuzluk': { groupId: 'cumle-kurma' },
  'genel.fiiller': { groupId: 'fiil-cekimi' },
  'genel.fiil-cekimi': { groupId: 'fiil-cekimi' },
  'genel.yiyecek': { groupId: 'yiyecek' },
  'genel.gern': { groupId: 'sevmek-istemek' },
  'genel.yer-yon': { groupId: 'yer-yon' },
  'genel.alisveris': { groupId: 'alisveris' },
  'genel.miktar-fiyat': { groupId: 'sayilar-miktar' },
  'genel.ev': { groupId: 'ev' },
  'genel.mobilya': { groupId: 'ev' },
  'genel.sifat': { groupId: 'sifatlar' },
  'genel.saat': { groupId: 'saatler' },
  'genel.ayrilabilen': { groupId: 'ayrilabilen-fiiller' },
  'genel.mein-tag': { groupId: 'mein-tag' },
  'genel.dann-danach': { groupId: 'baglaclar' },
  'genel.kelimeler': { mode: 'vocab' },
  'genel.kaliplar': { mode: 'mixed' },
  'genel.hizli-tekrar': { mode: 'quick' },
  'genel.kendine-sor': { mode: 'mixed' },
};
