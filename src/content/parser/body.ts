/** Bir bolumun govdesini yapisal parcalara ayirir. */

import { collapseSpaces, plain } from './text.ts';

export interface BodyItem {
  /** "1", "2" veya "a", "b" */
  key: string;
  lines: string[];
  text: string;
}

export interface BodyFence {
  info: string;
  lines: string[];
  /** Fence'ten hemen once gelen paragraf (orn. "`kommen` (gelmek):"). */
  lead?: string;
}

export interface ParsedBody {
  items: BodyItem[];
  bullets: string[];
  fences: BodyFence[];
  paragraphs: string[];
  quotes: string[];
  hint?: string;
  checklist: string[];
  /** Numarali maddeye ait olmayan `Yanlış:` / `Doğrusu:` satirlari. */
  looseLines: string[];
}

const ITEM_START = /^\s*(?:\*\*)?(\d+|[a-zA-Z])(?:\*\*)?\s*[.)]\s+(.*)$/;
const BOLD_LETTER = /^\s*\*\*([a-zA-Z])\)\*\*\s*(.*)$/;
const OPTIONS_LINE = /^[A-ZÇĞİÖŞÜ]\)\s+\S.*\s{2,}[A-ZÇĞİÖŞÜ]\)\s+\S/;

export function parseBody(lines: string[]): ParsedBody {
  const body: ParsedBody = {
    items: [],
    bullets: [],
    fences: [],
    paragraphs: [],
    quotes: [],
    checklist: [],
    looseLines: [],
  };

  let currentItem: BodyItem | null = null;
  let fence: BodyFence | null = null;
  let lastParagraph: string | undefined;

  const closeItem = () => {
    if (currentItem) {
      currentItem.text = collapseSpaces(currentItem.lines.join(' '));
      body.items.push(currentItem);
      currentItem = null;
    }
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (fence) {
        body.fences.push(fence);
        fence = null;
      } else {
        closeItem();
        fence = { info: line.replace(/^\s*```/, '').trim(), lines: [], lead: lastParagraph };
      }
      continue;
    }
    if (fence) {
      fence.lines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      closeItem();
      continue;
    }

    if (/^>\s*/.test(trimmed)) {
      const quote = collapseSpaces(trimmed.replace(/^>\s*/, ''));
      body.quotes.push(quote);
      const hint = quote.match(/^[^\p{L}]*(?:İpucu|Ipucu|Unutma)\s*:?\s*(.+)$/u);
      if (hint && !body.hint) body.hint = plain(hint[1]);
      continue;
    }

    const checkbox = trimmed.match(/^-\s*\[[ xX]\]\s*(.+)$/);
    if (checkbox) {
      closeItem();
      body.checklist.push(plain(checkbox[1]));
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      closeItem();
      body.bullets.push(bullet[1].trim());
      continue;
    }

    // "A) Gute Nacht  B) Guten Morgen  C) Auf Wiederhören" — secenek satiri.
    // Madde baslangici gibi gorunur, bu yuzden madde ayristirmasindan once yakalanir.
    if (OPTIONS_LINE.test(trimmed)) {
      if (currentItem) currentItem.lines.push(trimmed);
      else body.looseLines.push(trimmed);
      continue;
    }

    const boldLetter = trimmed.match(BOLD_LETTER);
    if (boldLetter) {
      closeItem();
      currentItem = { key: boldLetter[1].toLowerCase(), lines: [boldLetter[2].trim()], text: '' };
      continue;
    }

    const item = trimmed.match(ITEM_START);
    if (item) {
      closeItem();
      currentItem = { key: item[1].toLowerCase(), lines: [item[2].trim()], text: '' };
      continue;
    }

    if (currentItem) {
      currentItem.lines.push(trimmed);
      continue;
    }

    if (/^(Yanlış|Yanlis|Doğrusu|Dogrusu|Durum)\s*:/i.test(trimmed)) {
      body.looseLines.push(trimmed);
      continue;
    }

    lastParagraph = collapseSpaces(trimmed);
    body.paragraphs.push(lastParagraph);
  }

  closeItem();
  if (fence) body.fences.push(fence);
  return body;
}
