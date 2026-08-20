/** Markdown metin yardimcilari — parser ve override katmani ortak kullanir. */

/** Deterministik 32-bit FNV-1a hash (Node + tarayici ayni sonucu verir). */
export function stableHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, '0').slice(0, 7);
}

const EMOJI_PREFIX =
  /^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}\u{2190}-\u{21FF}]\s*)+/u;

export function stripLeadingEmoji(text: string): string {
  return text.replace(EMOJI_PREFIX, '').trim();
}

/** `kod` isaretlerini kaldirir ama icerigi korur. */
export function stripBackticks(text: string): string {
  return text.replace(/`([^`]*)`/g, '$1');
}

/** **kalin** isaretlerini kaldirir. */
export function stripBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}

export function plain(text: string): string {
  return collapseSpaces(stripBold(stripBackticks(text)));
}

export function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Metindeki tum `backtick` icerikleri. */
export function backtickTokens(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** Metindeki tum **kalin** icerikleri. */
export function boldTokens(text: string): string[] {
  return [...text.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** Bos alan gostergesi (`____`, `______`, `__________`) iceriyor mu? */
export function hasBlank(text: string): boolean {
  return /_{3,}/.test(text);
}

export function slugify(text: string): string {
  return stripLeadingEmoji(plain(text))
    .toLocaleLowerCase('tr')
    .replace(/[ıİ]/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

/**
 * "(Sehr) gut." gibi opsiyonel parantezli cevaptan tum gecerli varyantlari uretir.
 * → ["Sehr gut.", "gut."]
 */
export function expandOptionalParens(text: string): string[] {
  const match = text.match(/^\(([^)]+)\)\s*(.+)$/);
  if (match) {
    const [, optional, rest] = match;
    return [`${optional} ${rest}`.trim(), rest.trim()];
  }
  return [text];
}

/** " ya da " / " veya " ile ayrilmis alternatif cevaplari boler. */
export function splitAlternatives(text: string): string[] {
  return text
    .split(/\s+(?:ya da|veya)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Cumleyi kelime + noktalama parcalarina ayirir (chip uretimi icin). */
export function tokenizeSentence(sentence: string): string[] {
  const tokens: string[] = [];
  const re = /[\p{L}\p{N}''’-]+|[.,!?;:]/gu;
  for (const match of sentence.matchAll(re)) tokens.push(match[0]);
  // Cumle sonu noktalamasini son kelimeye yapistir: "Türkei." tek chip olur.
  const merged: string[] = [];
  for (const token of tokens) {
    if (/^[.,!?;:]$/.test(token) && merged.length > 0) {
      merged[merged.length - 1] += token;
    } else {
      merged.push(token);
    }
  }
  return merged;
}

/** Tohumlu, deterministik karistirma (her sync ayni sirayi uretir). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (Math.imul(state, 31) + seed.charCodeAt(i)) >>> 0;
  const next = () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
