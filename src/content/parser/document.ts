/**
 * Markdown belgesini gun / bolum / cevap-anahtari yapisina ayirir.
 * Icerik tabanli degil, yapi tabanli calisir; formatlama degisikliklerine karsi savunmacidir.
 */

import { collapseSpaces, plain, stripLeadingEmoji } from './text.ts';

export interface RawSection {
  /** `## ` sonrasi ham baslik (emoji dahil). */
  rawTitle: string;
  /** Emoji ve numara ayiklanmis baslik: "Fiil Çekimi — Tablo Doldur" */
  title: string;
  /** Baslik basindaki sira numarasi (varsa). */
  number?: number;
  level: number;
  lines: string[];
  /** Belge icindeki sirasi (0 tabanli). */
  index: number;
}

export interface AnswerGroup {
  number?: number;
  title: string;
  lines: string[];
  /** `1.` ile baslayan cevap satirlari, madde numarasina gore. */
  items: Map<string, string>;
}

export interface RawDay {
  day: number;
  sections: RawSection[];
  answerGroups: AnswerGroup[];
}

export interface RawDocument {
  file: string;
  days: RawDay[];
}

const DAY_HEADING = /^#{1,3}\s+(?:[^\d#\n]*?)(\d+)\s*\.\s*G[üu]n\s*$/u;
const HEADING = /^(#{2,4})\s+(.*)$/;

/** "🔤 1. Hızlı Hatırlama" → { number: 1, title: "Hızlı Hatırlama" } */
export function parseSectionTitle(raw: string): { number?: number; title: string } {
  const withoutEmoji = stripLeadingEmoji(raw);
  const numbered = withoutEmoji.match(/^(\d+)\s*[.)]\s*(.+)$/);
  if (numbered) {
    return { number: Number(numbered[1]), title: collapseSpaces(plain(numbered[2])) };
  }
  return { title: collapseSpaces(plain(withoutEmoji)) };
}

/** Fenced code bloklarini dikkate alarak satirlari gezer. */
function* walkLines(lines: string[]): Generator<{ line: string; inFence: boolean; index: number }> {
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      yield { line, inFence: true, index: i };
      inFence = !inFence;
      continue;
    }
    yield { line, inFence, index: i };
  }
}

/**
 * `<details>` bloklarini gun icerigenden ayirir; icerideki
 * `**1. Bölüm Adı**` bloklarini cevap gruplarina donusturur.
 */
function extractAnswerGroups(lines: string[]): { body: string[]; groups: AnswerGroup[] } {
  const body: string[] = [];
  const detailBlocks: string[][] = [];
  let current: string[] | null = null;

  for (const line of lines) {
    if (/^\s*<details>/i.test(line)) {
      current = [];
      continue;
    }
    if (/^\s*<\/details>/i.test(line)) {
      if (current) detailBlocks.push(current);
      current = null;
      continue;
    }
    if (current) {
      if (/^\s*<\/?summary>/i.test(line)) continue;
      current.push(line);
    } else {
      body.push(line);
    }
  }
  if (current) detailBlocks.push(current);

  const groups: AnswerGroup[] = [];
  for (const block of detailBlocks) {
    let group: AnswerGroup | null = null;
    let inFence = false;
    for (const line of block) {
      if (/^\s*```/.test(line)) inFence = !inFence;
      // Grup basligi: "**2. Nasıl Okursun?**" — basliktan sonra aciklama gelebilir.
      // Yalnizca numarali baslik ya da satiri tamamen kaplayan kalin metin sayilir.
      const header = !inFence && line.match(/^\*\*(.+?)\*\*(.*)$/);
      if (header && (/^\d+\s*[.)]/.test(header[1]) || !header[2].trim())) {
        if (group) groups.push(group);
        const parsed = parseSectionTitle(header[1]);
        group = { number: parsed.number, title: parsed.title, lines: [], items: new Map() };
        if (header[2].trim()) group.lines.push(header[2].trim());
        continue;
      }
      if (group) group.lines.push(line);
      else if (line.trim()) {
        // Basliksiz cevap blogu (orn. Ozet dosyasindaki "1. Gün cevapları").
        group = { title: '', lines: [line], items: new Map() };
      }
    }
    if (group) groups.push(group);
  }

  for (const group of groups) group.items = indexAnswerItems(group.lines);
  return { body, groups };
}

/**
 * Cevap satirlarini madde anahtarina gore indeksler.
 * "1. ..." → "1", "a) ..." → "a". Fenced blok icerigi indekslenmez.
 */
export function indexAnswerItems(lines: string[]): Map<string, string> {
  const items = new Map<string, string>();
  let currentKey: string | null = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const numbered = line.match(/^\s*(\d+)\s*[.)]\s+(.*)$/);
    const lettered = line.match(/^\s*([a-zA-Z])\s*\)\s+(.*)$/);
    const match = numbered ?? lettered;
    if (match) {
      currentKey = match[1].toLowerCase();
      items.set(currentKey, match[2].trim());
      continue;
    }
    if (currentKey && line.trim()) {
      items.set(currentKey, `${items.get(currentKey)} ${line.trim()}`.trim());
      continue;
    }
    if (!line.trim()) currentKey = null;
  }
  return items;
}

export function parseDocument(file: string, markdown: string): RawDocument {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const days: RawDay[] = [];

  let currentDayLines: string[] | null = null;
  let currentDayNumber = 0;

  const flush = () => {
    if (currentDayLines === null) return;
    days.push(buildDay(currentDayNumber, currentDayLines));
    currentDayLines = null;
  };

  for (const { line, inFence } of walkLines(lines)) {
    if (!inFence) {
      const dayMatch = line.match(DAY_HEADING);
      if (dayMatch) {
        flush();
        currentDayNumber = Number(dayMatch[1]);
        currentDayLines = [];
        continue;
      }
    }
    if (currentDayLines) currentDayLines.push(line);
  }
  flush();

  days.sort((a, b) => a.day - b.day);
  return { file, days };
}

function buildDay(day: number, lines: string[]): RawDay {
  const { body, groups } = extractAnswerGroups(lines);
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  let index = 0;

  for (const { line, inFence } of walkLines(body)) {
    if (!inFence) {
      const heading = line.match(HEADING);
      if (heading) {
        if (current) sections.push(current);
        const parsed = parseSectionTitle(heading[2]);
        current = {
          rawTitle: heading[2].trim(),
          title: parsed.title,
          number: parsed.number,
          level: heading[1].length,
          lines: [],
          index: index++,
        };
        continue;
      }
    }
    if (current) current.lines.push(line);
  }
  if (current) sections.push(current);

  return { day, sections, answerGroups: groups };
}

/** Bolum numarasina (yoksa basligina) gore eslesen cevap grubunu bulur. */
export function findAnswerGroup(day: RawDay, section: RawSection): AnswerGroup | undefined {
  if (section.number !== undefined) {
    const byNumber = day.answerGroups.find((group) => group.number === section.number);
    if (byNumber) return byNumber;
  }
  const target = section.title.toLocaleLowerCase('tr');
  return day.answerGroups.find(
    (group) => group.title && target.startsWith(group.title.toLocaleLowerCase('tr')),
  );
}
