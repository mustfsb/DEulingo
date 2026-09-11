/**
 * Markdown belgesini KONU / bölüm / cevap-anahtarı yapısına ayırır.
 *
 *   # Konu (H1)            → konu bloğu (kanonik konu kaydıyla eşleşir)
 *   > giriş                → konunun kısa açıklaması
 *   ## Bölüm (H2)          → özet bölümü
 *   ### Alt başlık (H3)    → bölümün parçası ("⚠️ Dikkat" → uyarı)
 *   <details>…</details>   → cevap grupları ("Kendine Sor" cevapları)
 *
 * İçerik tabanlı değil, yapı tabanlı çalışır; formatlama değişikliklerine
 * karşı savunmacıdır. Gün başlığı kavramı yoktur.
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

export interface RawBlock {
  sections: RawSection[];
  answerGroups: AnswerGroup[];
}

export interface RawTopicBlock extends RawBlock {
  rawTitle: string;
  /** Emoji ayıklanmış H1 başlığı. */
  title: string;
  /** Başlığın hemen altındaki blockquote satırları (işaretsiz). */
  intro: string[];
}

export interface RawTopicDocument {
  topics: RawTopicBlock[];
}

const H1 = /^#\s+(.*)$/;
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
 * `<details>` bloklarini icerikten ayirir; icerideki `**1. Bölüm Adı**`
 * bloklarini (ya da basliksiz numarali listeyi) cevap gruplarina donusturur.
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
      if (/^\s*<\/?summary>/i.test(line) || /^\s*<summary>.*<\/summary>\s*$/i.test(line)) continue;
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
        // Basliksiz cevap blogu ("Kendine Sor" cevaplari).
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

/** Bir bloğu (konu gövdesi) H2–H4 bölümlerine ve cevap gruplarına ayırır. */
export function parseBlock(lines: string[]): RawBlock {
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

  return { sections, answerGroups: groups };
}

/** Belgeyi H1 konu bloklarına böler (kod blokları içindeki `#` yok sayılır). */
export function parseTopicDocument(markdown: string): RawTopicDocument {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const chunks: Array<{ rawTitle: string; lines: string[] }> = [];
  let current: { rawTitle: string; lines: string[] } | null = null;

  for (const { line, inFence } of walkLines(lines)) {
    if (!inFence) {
      const h1 = line.match(H1);
      if (h1) {
        current = { rawTitle: h1[1].trim(), lines: [] };
        chunks.push(current);
        continue;
      }
    }
    current?.lines.push(line);
  }

  return {
    topics: chunks.map((chunk) => {
      const intro: string[] = [];
      for (const line of chunk.lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          if (intro.length) break;
          continue;
        }
        if (!trimmed.startsWith('>')) break;
        intro.push(collapseSpaces(trimmed.replace(/^>\s*/, '')));
      }
      return {
        rawTitle: chunk.rawTitle,
        title: collapseSpaces(plain(stripLeadingEmoji(chunk.rawTitle))),
        intro: intro.filter(Boolean),
        ...parseBlock(chunk.lines),
      };
    }),
  };
}
