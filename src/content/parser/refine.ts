/**
 * Yazilmis taslaklari oynanabilir alistirmalara donusturur:
 * kelime cipleri, celdiriciler, secenek siralamasi ve dogrulama bayraklari.
 * Tum rastgelelik alistirma ID'siyle tohumlanir — cikti deterministiktir.
 */

import type { Exercise } from '../types.ts';
import { seededShuffle, tokenizeSentence } from './text.ts';

/** Refine asamasinin okudugu/yazdigi alanlar. */
export type DraftExercise = Pick<
  Exercise,
  | 'type'
  | 'instruction'
  | 'prompt'
  | 'audioText'
  | 'answer'
  | 'acceptedAnswers'
  | 'options'
  | 'words'
  | 'pairs'
  | 'wordBank'
  | 'audio'
  | 'requirements'
  | 'sampleAnswer'
  | 'hint'
  | 'explanation'
  | 'openEnded'
  | 'validation'
>;

/** Sik karistirilan ciftler — cumle kurma celdiricileri once buradan secilir. */
const CONFUSABLES: Record<string, string[]> = {
  aus: ['in', 'nach'],
  in: ['aus', 'an'],
  komme: ['kommen', 'kommst'],
  kommst: ['kommen', 'komme'],
  kommen: ['komme', 'kommst'],
  wohne: ['wohnen', 'wohnst'],
  wohnst: ['wohnen', 'wohne'],
  heiße: ['heißen', 'heißt'],
  heißt: ['heißen', 'heiße'],
  bin: ['ist', 'bist'],
  bist: ['ist', 'bin'],
  ist: ['bin', 'bist'],
  der: ['die', 'das'],
  die: ['der', 'das'],
  das: ['der', 'die'],
  ich: ['du', 'wir'],
  du: ['ich', 'ihr'],
};

const FALLBACK_POOL = ['und', 'nicht', 'sehr', 'auch', 'ein', 'mein'];

function pickDistractors(answerTokens: string[], count: number, seed: string): string[] {
  const used = new Set(answerTokens.map((token) => token.toLocaleLowerCase('de')));
  const candidates: string[] = [];

  for (const token of answerTokens) {
    for (const candidate of CONFUSABLES[token.toLocaleLowerCase('de')] ?? []) {
      if (!used.has(candidate) && !candidates.includes(candidate)) candidates.push(candidate);
    }
  }
  for (const candidate of FALLBACK_POOL) {
    if (!used.has(candidate) && !candidates.includes(candidate)) candidates.push(candidate);
  }
  return seededShuffle(candidates, seed).slice(0, count);
}

/** Karistirilmis dizilim orijinalle ayni olmasin. */
function shuffleDistinct(tokens: string[], seed: string): string[] {
  for (let attempt = 0; attempt < 8; attempt++) {
    const shuffled = seededShuffle(tokens, `${seed}#${attempt}`);
    if (tokens.length < 2 || shuffled.join(' ') !== tokens.join(' ')) return shuffled;
  }
  return [...tokens].reverse();
}

/** Tek sozcuklu ve buyuk harfle baslayan cevaplarda buyuk/kucuk harf anlamlidir (`Sie`, `Buch`). */
function inferCaseSensitivity(answer: string): boolean {
  const trimmed = answer.trim();
  if (/\s/.test(trimmed)) return false;
  return /^[A-ZÄÖÜ]/.test(trimmed);
}

export function refineDraft(draft: DraftExercise, seed: string): DraftExercise {
  const answer = draft.answer?.trim();

  if (draft.type === 'sentence-builder' && answer) {
    const tokens = tokenizeSentence(answer);
    const distractors = pickDistractors(tokens, tokens.length >= 5 ? 2 : 1, seed);
    draft.words = shuffleDistinct([...tokens, ...distractors], seed);
    draft.validation = { punctuationSensitive: false, ...draft.validation };
  }

  if (draft.type === 'ordering' && answer) {
    const tokens = tokenizeSentence(answer);
    draft.words = shuffleDistinct(tokens, seed);
  }

  if (draft.type === 'multiple-choice' && draft.options) {
    const options = [...new Set(draft.options.map((option) => option.trim()))];
    if (answer && !options.some((option) => option === answer)) options.push(answer);
    draft.options = seededShuffle(options, seed);
  }

  if (answer && draft.validation?.caseSensitive === undefined) {
    const caseSensitive = inferCaseSensitivity(answer);
    if (caseSensitive) draft.validation = { ...draft.validation, caseSensitive: true };
  }

  return draft;
}
