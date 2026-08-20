/** Ozet dosyasindaki bolumleri kisa tekrar notlarina cevirir. */

import type { LessonNote, NoteBlock } from '../types.ts';
import type { RawSection } from './document.ts';
import { collapseSpaces } from './text.ts';

const SKIP = /(Hızlı Tekrar|Kendine Sor|Bu Özeti Oluşturan|Cevapları Göster)/i;

export function sectionToNote(section: RawSection): LessonNote | null {
  if (SKIP.test(section.title) || section.level > 3) return null;

  const blocks: NoteBlock[] = [];
  let list: string[] | null = null;
  let table: { head: string[]; rows: string[][] } | null = null;
  let fence: string[] | null = null;

  const closeList = () => {
    if (list?.length) blocks.push({ kind: 'list', items: list });
    list = null;
  };
  const closeTable = () => {
    if (table && table.rows.length) blocks.push({ kind: 'table', ...table });
    table = null;
  };

  for (const raw of section.lines) {
    const line = raw.trim();
    if (/^```/.test(line)) {
      if (fence) {
        if (fence.length) blocks.push({ kind: 'code', lines: fence });
        fence = null;
      } else {
        closeList();
        closeTable();
        fence = [];
      }
      continue;
    }
    if (fence) {
      fence.push(raw);
      continue;
    }
    if (!line) {
      closeList();
      closeTable();
      continue;
    }
    if (line.startsWith('#')) {
      closeList();
      closeTable();
      blocks.push({ kind: 'paragraph', text: collapseSpaces(line.replace(/^#+\s*/, '')) });
      continue;
    }
    if (line.startsWith('>')) {
      closeList();
      closeTable();
      blocks.push({ kind: 'callout', text: collapseSpaces(line.replace(/^>\s*/, '')) });
      continue;
    }
    if (line.startsWith('|')) {
      closeList();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) continue;
      if (!table) table = { head: cells, rows: [] };
      else table.rows.push(cells);
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      closeTable();
      list ??= [];
      list.push(bullet[1].trim());
      continue;
    }
    closeList();
    closeTable();
    blocks.push({ kind: 'paragraph', text: collapseSpaces(line) });
  }
  closeList();
  closeTable();
  if (fence?.length) blocks.push({ kind: 'code', lines: fence });

  if (!blocks.length) return null;
  return { title: section.title, level: section.level, blocks };
}
