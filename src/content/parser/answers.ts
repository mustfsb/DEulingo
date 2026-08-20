/** Cevap anahtari metnini yapisal cevaba cevirir. */

import {
  backtickTokens,
  collapseSpaces,
  expandOptionalParens,
  plain,
  splitAlternatives,
} from './text.ts';

export interface ParsedAnswer {
  answer: string;
  acceptedAnswers: string[];
  explanation?: string;
  /** Kaynak "örnek cevap" dediginde true — tek dogru cevap yok. */
  openEnded: boolean;
  /** Cevap tamamen `backtick` icindeyse true (uretilmesi istenen Almanca ifade). */
  isQuotedTarget: boolean;
}

const SAMPLE_PREFIX = /^(?:Örnek cevap|Ornek cevap|Örn\.?)\s*:?\s*/i;
/** "Doğrusu:", "İyi:", "Orta:" gibi kisa etiket onekleri. */
const LABEL_PREFIX = /^[\p{L}\s]{1,24}:\s+/u;
const NO_SINGLE_ANSWER = /tek doğru cevap yok/i;

export function hasNoSingleAnswer(text: string): boolean {
  return NO_SINGLE_ANSWER.test(text);
}

/** "15 → `fünfzehn`" gibi satirlarda ok isaretinden sonrasini alir. */
export function afterArrow(text: string): string {
  const idx = text.lastIndexOf('→');
  return idx === -1 ? text.trim() : text.slice(idx + 1).trim();
}

/**
 * Sondaki parantezli aciklamayi cevaptan ayirir.
 * "Gute Nacht. (`Guten` değil `Gute` — çünkü ...)" → core + explanation
 */
export function splitTrailingExplanation(text: string): { core: string; reason?: string } {
  const match = text.match(/^(.*\S)\s*\(([^()]{12,})\)\s*[.!]?\s*$/);
  if (!match) return { core: text.trim() };
  return { core: match[1].trim(), reason: plain(match[2].trim()) };
}

export function parseAnswerText(raw: string): ParsedAnswer {
  let text = collapseSpaces(raw);
  const openEnded = /örnek cevap|ornek cevap/i.test(text);
  text = text.replace(SAMPLE_PREFIX, '').trim();
  text = text.replace(/^\((?:örnek|ornek)[^)]*\)\s*/i, '').trim();
  if (!text.startsWith('`')) text = text.replace(LABEL_PREFIX, '').trim();

  const { core, reason } = splitTrailingExplanation(text);
  const variants: string[] = [];
  for (const alternative of splitAlternatives(core)) {
    const quoted = backtickTokens(alternative);
    const flat = plain(alternative);
    const base = quoted.length === 1 && flat === quoted[0] ? quoted[0] : flat;
    for (const expanded of expandOptionalParens(base.trim())) {
      const clean = collapseSpaces(expanded);
      if (clean && !variants.includes(clean)) variants.push(clean);
    }
  }

  const quotedAll = backtickTokens(core);
  const isQuotedTarget = quotedAll.length > 0 && plain(core) === quotedAll.join(' ');

  return {
    answer: variants[0] ?? plain(core),
    acceptedAnswers: variants.slice(1),
    explanation: reason,
    openEnded,
    isQuotedTarget,
  };
}
