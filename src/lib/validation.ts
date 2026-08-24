/**
 * Katmanli cevap degerlendirici.
 *
 * Sira: normalize → tam eslesme → yazim varyanti (ß/ue) → dilbilgisi korumasi
 * → duzenleme mesafesi (yazim hatasi toleransi).
 *
 * Temel ilke: yazim hatasi affedilir, dilbilgisi hatasi affedilmez.
 */

import type { Exercise, ExerciseValidation } from '../content/types';
import { evaluateWordBank } from './word-bank';

export type ValidationStatus = 'correct' | 'minor-typo' | 'incorrect';

export interface ValidationResult {
  status: ValidationStatus;
  /** Kullaniciya gosterilecek dogru cevap. */
  expected: string;
  normalizedInput: string;
  /** Kucuk yazim farkinda: girilen → beklenen. */
  diff?: { got: string; want: string };
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Normalizasyon                                                       */
/* ------------------------------------------------------------------ */

const QUOTES: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '–': '-',
  '—': '-',
  '…': '...',
};

export interface NormalizeOptions {
  caseSensitive?: boolean;
  punctuationSensitive?: boolean;
  /** Alman özel harfleri (ß/ä/ö/ü) icin klavye toleransi: ASCII yaklasimi tam dogru sayilir. */
  keyboardTolerance?: boolean;
}

export function normalizeAnswer(value: string, options: NormalizeOptions = {}): string {
  let text = value.normalize('NFC');
  text = text.replace(/[‘’‚“”„–—…]/g, (ch) => QUOTES[ch] ?? ch);
  text = text.replace(/\s+/g, ' ').trim();
  if (!options.punctuationSensitive) {
    text = text.replace(/[.!?;:,]+$/g, '').trim();
  }
  if (!options.caseSensitive) {
    text = text.toLocaleLowerCase('de');
  }
  return text;
}

/** ß→ss, ä→ae: ozel karakterlerin yaygin ASCII yazimi (harf buyuklugu korunur). */
export function foldSpecialChars(value: string): string {
  return value
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue');
}

/** Bicim gruplari icin: ozel karakter + harf buyuklugu farklarini yok sayar. */
export function foldGerman(value: string): string {
  return foldSpecialChars(value.toLocaleLowerCase('de'));
}

/* ------------------------------------------------------------------ */
/* Dilbilgisi korumalari                                               */
/* ------------------------------------------------------------------ */

/**
 * Ayni gruptaki iki farkli bicim asla "yazim hatasi" sayilmaz.
 * Gruplar Ozet dosyasindaki A1 tablolarindan turetilmistir.
 */
const FORM_GROUPS: string[][] = [
  ['der', 'die', 'das', 'den', 'dem', 'des'],
  ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'],
  ['bin', 'bist', 'ist', 'sind', 'seid', 'sein'],
  ['habe', 'hast', 'hat', 'haben', 'habt'],
  ['komme', 'kommst', 'kommt', 'kommen'],
  ['gehe', 'gehst', 'geht', 'gehen'],
  ['wohne', 'wohnst', 'wohnt', 'wohnen'],
  ['heiße', 'heißt', 'heißen', 'heisse', 'heisst', 'heissen'],
  ['trinke', 'trinkst', 'trinkt', 'trinken'],
  ['aus', 'in', 'an', 'nach', 'von', 'bei', 'zu', 'mit'],
  ['wie', 'wo', 'woher', 'wer', 'was', 'wann'],
  ['guten morgen', 'guten tag', 'guten abend', 'gute nacht'],
  ['auf wiedersehen', 'auf wiederhören', 'auf wiederhoeren'],
  ['dein', 'ihr', 'mein'],
];

const GROUP_INDEX = new Map<string, number>();
FORM_GROUPS.forEach((group, index) => {
  for (const form of group) GROUP_INDEX.set(foldGerman(form), index);
});

function inSameFormGroup(a: string, b: string): boolean {
  const groupA = GROUP_INDEX.get(foldGerman(a));
  const groupB = GROUP_INDEX.get(foldGerman(b));
  return groupA !== undefined && groupA === groupB;
}

/** Buyuk harfi anlam tasiyan sozcukler (resmî `Sie`). */
const CASE_CRITICAL = new Set(['Sie']);

const VERB_ENDINGS = ['en', 'st', 't', 'e'];

/**
 * Iki bicim ayni fiil kokunden farkli sahis takilariyla turemis mi?
 * "komme" / "kommen" → evet (dilbilgisi hatasi).
 * "is" / "ist"       → hayir (kok cok kisa, yazim hatasi olabilir).
 */
export function isConjugationVariant(a: string, b: string): boolean {
  const stemOf = (word: string): { stem: string; ending: string } | null => {
    for (const ending of VERB_ENDINGS) {
      if (word.length > ending.length + 2 && word.endsWith(ending)) {
        return { stem: word.slice(0, -ending.length), ending };
      }
    }
    return null;
  };
  const first = stemOf(foldGerman(a));
  const second = stemOf(foldGerman(b));
  if (!first || !second) return false;
  if (first.ending === second.ending) return false;
  return first.stem === second.stem && first.stem.length >= 3;
}

/* ------------------------------------------------------------------ */
/* Yaklasik okunus                                                     */
/* ------------------------------------------------------------------ */

/**
 * "Yaklasik okunus" cevaplarini SES duzeyinde karsilastirmak icin kanonik hale
 * getirir. Turkce yazimin tek dogrusu yoktur; asagidaki donusumler ayni sesi
 * anlatan yazimlari esitler:
 *
 *   voonen · vonen · voonnen        → vonen
 *   leera  · leerer · lehrer · lera → lera
 *   doyçlant · doyçland · doyclant  → doyclant
 *   nayn · nain                     → nayn
 *
 * Anlamı degistiren farklar (ör. `şport` yerine `sport`) hâlâ ayirt edilir:
 * yalnizca uzatma, tonlama ve schwa yazimlari serbest birakilir.
 */
export function canonicalizeApproximation(value: string): string {
  let text = value.normalize('NFC').toLocaleLowerCase('tr').trim();
  // Tirnak, noktalama ve bosluklar sesin parcasi degildir.
  text = text.replace(/["'`.,!?;:()\-\s]/g, '');
  // Sessiz `h` yalnizca uzatir: "lehra" → "leera".
  text = text.replace(/([aeıioöuü])h/g, '$1$1');
  // Almanca `w` sesi Turkce "v" ile yazilir.
  text = text.replace(/w/g, 'v');
  // "ay" ikili sesi "ai" olarak da yazilir.
  text = text.replace(/ai/g, 'ay');
  // `ç` ve `c` ayni sesin iki yazimidir; `ş`/`s` ayrimi ise bilerek korunur.
  text = text.replace(/ç/g, 'c');
  // Kelime sonu schwa: "-er" / "-ar" / "-a" ayni hafif "a" sesidir.
  text = text.replace(/(er|ar)$/g, 'a');
  // Almanca kelime sonunda `d` sertlesir: "doyçland" ≈ "doyçlant".
  text = text.replace(/d$/g, 't');
  // Uzatma ve ikizleme serbesttir: "vii" → "vi", "voonnen" → "vonen".
  text = text.replace(/(.)\1+/g, '$1');
  // Kapali/acik "i" yazimi (ı/i) yaklasik okunusta ayirt edici degildir.
  text = text.replace(/ı/g, 'i');
  return text;
}

/** Iki yaklasik okunus ayni sesi mi anlatiyor? */
export function approximationsMatch(input: string, expected: string): boolean {
  const got = canonicalizeApproximation(input);
  const want = canonicalizeApproximation(expected);
  return got.length > 0 && got === want;
}

/* ------------------------------------------------------------------ */
/* Duzenleme mesafesi                                                  */
/* ------------------------------------------------------------------ */

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/** Beklenen cevabin uzunluguna gore izin verilen toplam yazim hatasi. */
export function typoBudget(expected: string): number {
  const length = expected.replace(/\s/g, '').length;
  if (length <= 2) return 0;
  if (length <= 8) return 1;
  if (length <= 16) return 2;
  return 3;
}

/* ------------------------------------------------------------------ */
/* Metin degerlendirme                                                 */
/* ------------------------------------------------------------------ */

function compareOne(input: string, expected: string, options: NormalizeOptions): ValidationResult {
  const normalizedInput = normalizeAnswer(input, options);
  const normalizedExpected = normalizeAnswer(expected, options);

  if (!normalizedInput) {
    return { status: 'incorrect', expected, normalizedInput };
  }

  // Buyuk/kucuk harf duyarli olmayan alistirmalarda bile resmi `Sie` ayrimi korunur.
  const rawInputTokens = normalizeAnswer(input, { ...options, caseSensitive: true }).split(' ');
  const rawExpectedTokens = normalizeAnswer(expected, { ...options, caseSensitive: true }).split(' ');
  if (rawInputTokens.length === rawExpectedTokens.length) {
    for (let i = 0; i < rawExpectedTokens.length; i++) {
      const want = rawExpectedTokens[i].replace(/[.!?,;:]+$/, '');
      const got = rawInputTokens[i].replace(/[.!?,;:]+$/, '');
      if (
        CASE_CRITICAL.has(want) &&
        got !== want &&
        got.toLocaleLowerCase('de') === want.toLocaleLowerCase('de')
      ) {
        return { status: 'incorrect', expected, normalizedInput, diff: { got, want } };
      }
    }
  }

  if (normalizedInput === normalizedExpected) {
    return { status: 'correct', expected, normalizedInput };
  }

  // Klavye toleransi: Almanca özel harfler (ß/ä/ö/ü) iceren cevaplarda
  // ASCII yaklasimi (ss/ae/oe/ue) ve kucuk yazim farklari tam dogru sayilir.
  // Kullanici Almanca klavye olmadan da dogru cevap verebilmelidir.
  if (options.keyboardTolerance && /[ßäöü]/.test(normalizedExpected)) {
    const foldedInput = foldSpecialChars(normalizedInput);
    const foldedExpected = foldSpecialChars(normalizedExpected);
    if (foldedInput === foldedExpected || levenshtein(foldedInput, foldedExpected) <= 2) {
      return { status: 'correct', expected, normalizedInput };
    }
  }

  // ß / ue gibi kabul edilebilir yazim varyantlari (harf buyuklugu farki degil).
  // Klavye toleransi aktifken bu varyantlar yukarda yakalanir; normal modda minor-typo kalir.
  if (foldSpecialChars(normalizedInput) === foldSpecialChars(normalizedExpected)) {
    return {
      status: 'minor-typo',
      expected,
      normalizedInput,
      diff: { got: normalizedInput, want: normalizedExpected },
      note: 'Almanca özel karakter yazımı',
    };
  }

  const inputTokens = normalizedInput.split(' ');
  const expectedTokens = normalizedExpected.split(' ');
  if (inputTokens.length !== expectedTokens.length) {
    return { status: 'incorrect', expected, normalizedInput };
  }

  let distance = 0;
  let mismatches = 0;
  let diff: ValidationResult['diff'];

  for (let i = 0; i < expectedTokens.length; i++) {
    const want = expectedTokens[i];
    const got = inputTokens[i];
    if (want === got) continue;

    if (inSameFormGroup(want, got) || isConjugationVariant(want, got)) {
      return { status: 'incorrect', expected, normalizedInput, diff: { got, want } };
    }
    mismatches += 1;
    distance += levenshtein(got, want);
    diff ??= { got, want };
  }

  const budget = typoBudget(normalizedExpected);
  const maxMismatches = Math.max(1, Math.floor(expectedTokens.length / 3));
  if (distance > 0 && distance <= budget && mismatches <= maxMismatches) {
    return { status: 'minor-typo', expected, normalizedInput, diff };
  }
  return { status: 'incorrect', expected, normalizedInput, diff };
}

const RANK: Record<ValidationStatus, number> = { correct: 2, 'minor-typo': 1, incorrect: 0 };

export function evaluateText(
  input: string,
  answer: string,
  acceptedAnswers: string[] = [],
  validation: ExerciseValidation = {},
): ValidationResult {
  const options: NormalizeOptions = {
    caseSensitive: validation.caseSensitive ?? false,
    punctuationSensitive: validation.punctuationSensitive ?? false,
    keyboardTolerance: validation.keyboardTolerance ?? false,
  };

  const candidates = [answer, ...acceptedAnswers];

  // Yaklasik okunusta once SES esitligi denenir: tek dogru yazim yoktur, bu
  // yuzden "vonen" ile "voonen" arasindaki fark hata sayilmaz (§yaklasik okunus).
  if (validation.approximation && candidates.some((candidate) => approximationsMatch(input, candidate))) {
    return { status: 'correct', expected: answer, normalizedInput: normalizeAnswer(input, options) };
  }

  let best: ValidationResult | null = null;
  for (const candidate of candidates) {
    let result = compareOne(input, candidate, options);
    if (result.status === 'minor-typo' && validation.noTypoTolerance) {
      result = { ...result, status: 'incorrect' };
    }
    if (!best || RANK[result.status] > RANK[best.status]) best = result;
    if (best.status === 'correct') break;
  }
  // Yaklasik okunusta tek harflik kalan fark da (ör. "doyçlan") yazim
  // hatasidir; ogrenci sesi dogru duymus, yazimda takilmistir.
  if (validation.approximation && best?.status === 'incorrect') {
    const got = canonicalizeApproximation(input);
    const near = candidates.some(
      (candidate) => got.length > 0 && levenshtein(got, canonicalizeApproximation(candidate)) <= 1,
    );
    if (near) best = { ...best, status: 'minor-typo' };
  }

  // Yanlissa her zaman asil cevabi goster.
  if (best && best.status === 'incorrect') best = { ...best, expected: answer };
  return best ?? { status: 'incorrect', expected: answer, normalizedInput: '' };
}

/* ------------------------------------------------------------------ */
/* Alistirma degerlendirme                                             */
/* ------------------------------------------------------------------ */

export type ExerciseInput = string | string[] | Record<string, string>;

export function evaluateExercise(exercise: Exercise, input: ExerciseInput): ValidationResult {
  const validation = exercise.validation ?? {};

  if (exercise.type === 'matching') {
    const answers = (input ?? {}) as Record<string, string>;
    const pairs = exercise.pairs ?? [];
    const wrong = pairs.filter((pair) => answers[pair.left] !== pair.right);
    return {
      status: wrong.length === 0 ? 'correct' : 'incorrect',
      expected: pairs.map((pair) => `${pair.left} → ${pair.right}`).join('\n'),
      normalizedInput: pairs.map((pair) => `${pair.left} → ${answers[pair.left] ?? '—'}`).join('\n'),
    };
  }

  if (exercise.type === 'word-bank-translation') {
    const wordBank = exercise.wordBank;
    const ids = Array.isArray(input) ? input : [];
    const matched = Boolean(wordBank && evaluateWordBank(ids, wordBank.tokens, wordBank.acceptedSequences));
    const normalizedInput = wordBank
      ? ids
          .map((id) => wordBank.tokens.find((token) => token.id === id)?.text)
          .filter((text): text is string => Boolean(text))
          .join(' ')
      : '';
    return {
      status: matched ? 'correct' : 'incorrect',
      expected: exercise.answer ?? wordBank?.acceptedSequences[0]?.join(' ') ?? '',
      normalizedInput,
    };
  }

  if (exercise.type === 'sentence-builder' || exercise.type === 'ordering') {
    const chips = Array.isArray(input) ? input : [];
    const joined = chips.join(' ');
    const answer = exercise.answer ?? '';
    const options: NormalizeOptions = {
      caseSensitive: validation.caseSensitive ?? false,
      punctuationSensitive: false,
    };
    const candidates = [answer, ...(exercise.acceptedAnswers ?? [])];
    const matched = candidates.some(
      (candidate) => normalizeAnswer(joined, options) === normalizeAnswer(candidate, options),
    );
    // Kelime ciplerinde yazim hatasi mumkun degildir: fark varsa dizilim yanlistir.
    return {
      status: matched ? 'correct' : 'incorrect',
      expected: answer,
      normalizedInput: joined,
    };
  }

  if (exercise.type === 'multiple-choice') {
    const value = typeof input === 'string' ? input : '';
    return {
      status: value === exercise.answer ? 'correct' : 'incorrect',
      expected: exercise.answer ?? '',
      normalizedInput: value,
    };
  }

  const value = typeof input === 'string' ? input : '';
  return evaluateText(value, exercise.answer ?? '', exercise.acceptedAnswers, validation);
}

/** "is → ist" gibi kisa fark ozeti. */
export function describeDiff(result: ValidationResult): string | null {
  if (!result.diff || result.diff.got === result.diff.want) return null;
  return `${result.diff.got} → ${result.diff.want}`;
}
