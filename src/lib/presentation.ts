/**
 * Sunum katmani karistirmasi.
 *
 * Kanonik icerik (cevap, kabul edilen cevaplar, eslesme haritasi, token
 * kimlikleri) DEGISTIRILMEZ; yalnizca gorunur sira tohumlu bicimde
 * turetilir. Ayni tohum + ayni alistirma her zaman ayni sunumu verir
 * (soru acikken kararli), farkli tohum farkli sira verebilir (oturumlar
 * ve tekrarlar arasi cesitlilik).
 *
 * Tek rastgelelik kaynagi `content/parser/text.ts` icindeki `seededShuffle`
 * Fisher-Yates karistirmasidir; burada rakip bir RNG uretilmez.
 */

import type { Exercise } from '../content/types.ts';
import { seededShuffle } from '../content/parser/text.ts';

/** Sunum tohumu: oturum + soru olusumu parcalarindan kararli dize. */
export function presentationSeed(...parts: Array<string | number | undefined | null>): string {
  return parts
    .filter((part): part is string | number => part !== undefined && part !== null && part !== '')
    .join('#');
}

/** Sirasi pedagojik anlam tasiyan ve karistirilmamasi gereken secenek kumeleri. */
const ORDERED_TOKENS = new Set([
  'true', 'false', 'not given',
  'dogru', 'doğru', 'yanlis', 'yanlış',
  'richtig', 'falsch', 'wahr', 'ja', 'nein',
]);

function normalizeOption(option: string): string {
  return option.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Secenek sirasi korunmali mi?
 * Dogru/Yanlis (True/False/Not Given dahil) ve sirali sayi olcekleri
 * (1 → 5 gibi) oldugu gibi birakilir; have/has, for/since, der/die/das
 * gibi dilbilgisi secimleri karistirilir.
 */
export function isOrderedScale(options: string[]): boolean {
  if (options.length < 2) return true;
  const normalized = options.map(normalizeOption);
  if (normalized.every((option) => ORDERED_TOKENS.has(option))) return true;
  const numbers = normalized.map((option) => Number(option.replace(',', '.')));
  if (numbers.every((value) => Number.isFinite(value) && optionLooksNumeric(normalized))) {
    const ascending = numbers.every((value, index) => index === 0 || numbers[index - 1] <= value);
    const descending = numbers.every((value, index) => index === 0 || numbers[index - 1] >= value);
    if (ascending || descending) return true;
  }
  return false;
}

function optionLooksNumeric(normalized: string[]): boolean {
  return normalized.every((option) => /^-?\d+([.,]\d+)?$/.test(option));
}

/** Coktan secmeli / dinleme secimi: dogru cevap konumu tohumla dagilir. */
export function shuffledOptions(options: string[], seed: string): string[] {
  if (options.length < 2 || isOrderedScale(options)) return [...options];
  return seededShuffle(options, seed);
}

/**
 * Cumle kurma / siralama cipleri: baslangic sirasi karistirilir.
 * Karisim tesadufen kanonik siraya esit cikarsa yeniden karistirilir
 * (soru cozulmus gelmez); permutasyon yoksa oldugu gibi birakilir.
 */
export function shuffledWords(words: string[], seed: string): string[] {
  if (words.length < 2) return [...words];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const shuffled = seededShuffle(words, `${seed}#${attempt}`);
    if (shuffled.join(' ') !== words.join(' ')) return shuffled;
  }
  return [...words].reverse();
}

/**
 * Belirli bir alistirma icin sunum kopyasi uretir.
 *
 * - `options`: karistirilir (sirali olcekler haric).
 * - `words`: karistirilir (kanonikle ayni kalmaz).
 * - `pairs`: sol sutun sirasi karistirilir; sag sutun
 *   `MatchingView` tarafindan BAGIMSIZ tohumla karistirilir
 *   (`${seed}#right`), boylece sol[i] ↔ sag[i] konumsal sizinti kapanir.
 * - `wordBank.tokens`: token kimlikleri korunarak karistirilir.
 *
 * `answer`, `acceptedAnswers`, `acceptedSequences` ve eslesme ciftleri
 * aynen korunur: dogrulama kanonik anlamla calisir.
 */
export function presentExercise(exercise: Exercise, seed: string): Exercise {
  let next = exercise;
  if (exercise.options && exercise.options.length > 1) {
    next = { ...next, options: shuffledOptions(exercise.options, `${seed}#options`) };
  }
  if (exercise.words && exercise.words.length > 1) {
    next = { ...next, words: shuffledWords(exercise.words, `${seed}#words`) };
  }
  if (exercise.pairs && exercise.pairs.length > 1) {
    next = { ...next, pairs: seededShuffle(exercise.pairs, `${seed}#left`) };
  }
  if (exercise.wordBank && exercise.wordBank.tokens.length > 1) {
    next = {
      ...next,
      wordBank: {
        ...exercise.wordBank,
        tokens: seededShuffle(exercise.wordBank.tokens, `${seed}#bank`),
      },
    };
  }
  return next;
}
