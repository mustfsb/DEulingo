/**
 * Özet dosyalarını `Özetler` bölümünün okuduğu yapıya çevirir.
 *
 * - `Konu Özetleri.md`: H1 = kanonik konu, H2 = kayıtlı özet bölümü, H3 ve
 *   altı aynı bölümün parçası ("⚠️ Dikkat" → uyarı). Konu sonundaki
 *   "Hızlı Tekrar" ve "Kendine Sor" bölümleri konu düzeyine alınır.
 * - `Genel Tekrar Özet.md`: tek bir H1 altındaki H2 bölümleri; her biri AYNI
 *   kanonik konu kimliğine bağlanır (ayrı taksonomi yoktur).
 */

import type {
  ContentWarning,
  GermanExample,
  NoteBlock,
  Pronunciation,
  RecallQuestion,
  ReviewSummary,
  SummarySection,
  TopicSummary,
} from '../types.ts';
import {
  REVIEW_SECTIONS,
  SUMMARY_SECTIONS,
  TOPICS,
  type CurriculumTopicDef,
  type ReviewSectionDef,
  type SummarySectionDef,
} from '../curriculum/topics.ts';
import { SUMMARY_AUGMENTATIONS } from '../authored/summary-augmentations.ts';
import { approximate, isCurated } from '../authored/pronunciation.ts';
import { sectionToNote } from './notes.ts';
import { collapseSpaces, plain } from './text.ts';
import { parseTopicDocument, type AnswerGroup, type RawSection } from './document.ts';

const KEY_POINTS = /Hızlı Tekrar/i;
const RECALL = /Kendine Sor/i;
const QUIZ = /Kendini Test Et/i;
const SOURCES = /Bu Özeti Oluşturan/i;
const WARNING_TITLE = /Dikkat/i;

const normalizeTitle = (title: string) => collapseSpaces(plain(title)).toLocaleLowerCase('tr');

function matchTopic(title: string): CurriculumTopicDef | undefined {
  const normalized = normalizeTitle(title);
  return TOPICS.find((topic) => topic.summaryTitles.some((candidate) => normalizeTitle(candidate) === normalized));
}

function matchSection(topicId: string, title: string): SummarySectionDef | undefined {
  const normalized = normalizeTitle(title);
  return SUMMARY_SECTIONS.find(
    (section) =>
      section.topicId === topicId && section.matchTitles.some((candidate) => normalizeTitle(candidate) === normalized),
  );
}

function matchReviewSection(title: string): ReviewSectionDef | undefined {
  const normalized = normalizeTitle(title);
  return REVIEW_SECTIONS.find((section) => section.matchTitles.some((candidate) => normalizeTitle(candidate) === normalized));
}

function blockText(block: NoteBlock): string {
  switch (block.kind) {
    case 'paragraph':
    case 'callout':
      return block.text;
    case 'list':
      return block.items.join(' ');
    case 'code':
      return block.lines.join(' ');
    case 'table':
      return [...block.head, ...block.rows.flat()].join(' ');
  }
}

/** Bölümün tüm metni — kavram `anchor` araması bunun üzerinde yapılır. */
export function sectionText(section: SummarySection): string {
  return [
    section.title,
    ...section.blocks.map(blockText),
    ...section.warnings,
    ...section.examples.map((example) => `${example.german} ${example.turkish ?? ''}`),
    ...(section.recallQuestions ?? []).map((item) => `${item.question} ${item.answer}`),
  ].join('\n');
}

/**
 * Kod bloklarından Almanca örnek cümleleri çıkarır.
 * `Ich komme aus der Türkei.  (Türkiye'den geliyorum.)` ve
 * `der Brief — mektup` biçimleri desteklenir.
 */
function extractExamples(blocks: NoteBlock[]): GermanExample[] {
  const examples: GermanExample[] = [];
  for (const block of blocks) {
    if (block.kind !== 'code') continue;
    for (const raw of block.lines) {
      const line = raw.trim();
      // Kural açıklaması olan satırlar örnek değildir (`13 = drei + zehn → dreizehn`).
      if (!line || line.includes('=') || line.includes('→')) continue;

      const dash = line.match(/^(.+?)\s+[—–]\s+(.+)$/);
      const paren = line.match(/^(.+?)\s{2,}\((.+)\)\s*$/) ?? line.match(/^(.+?)\s+\((.+)\)\s*$/);
      if (dash) {
        examples.push({ german: dash[1].trim(), turkish: dash[2].trim() });
      } else if (paren) {
        examples.push({ german: paren[1].trim(), turkish: paren[2].trim() });
      } else {
        examples.push({ german: line });
      }
    }
  }
  return examples.map((example) => ({ ...example, pronunciation: approximate(example.german) }));
}

/** Konuda geçen, sözlükte karşılığı olan önemli Almanca kalıplar. */
function sectionPronunciation(blocks: NoteBlock[], examples: GermanExample[], limit = 8): Pronunciation[] {
  const candidates: string[] = [];
  for (const block of blocks) {
    if (block.kind !== 'table') continue;
    // Tabloların ilk sütunu aday kabul edilir; Almanca olmayanlar `isCurated` elemesinde düşer.
    for (const row of block.rows) {
      const first = plain(row[0] ?? '').trim();
      if (first) candidates.push(first);
    }
  }
  for (const example of examples) candidates.push(example.german);

  const seen = new Set<string>();
  const result: Pronunciation[] = [];
  for (const candidate of candidates) {
    const key = candidate.toLocaleLowerCase('de');
    if (seen.has(key) || !isCurated(candidate)) continue;
    seen.add(key);
    result.push(approximate(candidate));
    if (result.length >= limit) break;
  }
  return result;
}

/** "- [ ] madde" satırlarını düz metne çevirir. */
function checklistItems(section: RawSection): string[] {
  return section.lines
    .map((line) => line.trim().match(/^-\s*\[[ xX]?\]\s*(.+)$/)?.[1])
    .filter((item): item is string => Boolean(item))
    .map(collapseSpaces);
}

function numberedItems(section: RawSection): string[] {
  return section.lines
    .map((line) => line.trim().match(/^\d+\s*[.)]\s*(.+)$/)?.[1])
    .filter((item): item is string => Boolean(item))
    .map(collapseSpaces);
}

/** Soru satırındaki "→ ipucu" kısmını ayırır; cevap gizli kalır. */
function questionOnly(item: string): string {
  return item.split(/\s+→\s+/)[0].trim();
}

function recallFrom(section: RawSection, groups: AnswerGroup[]): RecallQuestion[] {
  const answers = groups.find((group) => !group.title) ?? groups[0];
  return numberedItems(section)
    .map((item, index) => {
      const answer = answers?.items.get(String(index + 1)) ?? item.split(/\s+→\s+/)[1];
      return answer ? { question: questionOnly(item), answer: collapseSpaces(answer) } : null;
    })
    .filter((item): item is RecallQuestion => item !== null);
}

function createSection(id: string, topicId: string, title: string, raw: RawSection, conceptIds: string[]): SummarySection {
  const note = sectionToNote(raw);
  return {
    id,
    topicId,
    title,
    conceptIds,
    blocks: note?.blocks ?? [],
    warnings: [],
    examples: [],
    pronunciation: [],
  };
}

/** H3 ve altı: açık bölümün parçası. */
function appendSubsection(target: SummarySection, raw: RawSection): void {
  const note = sectionToNote(raw);
  if (!note) return;
  if (WARNING_TITLE.test(raw.title)) {
    target.warnings.push(...note.blocks.map(blockText).filter(Boolean));
  } else {
    target.blocks.push({ kind: 'paragraph', text: `**${note.title}**` }, ...note.blocks);
  }
}

function finalizeSection(section: SummarySection): void {
  section.examples = [...extractExamples(section.blocks), ...section.examples];
  section.pronunciation = sectionPronunciation(section.blocks, section.examples);
  section.blocks = section.blocks.filter((block) => !(block.kind === 'paragraph' && !block.text.trim()));
}

function readingMinutes(text: string): number {
  return Math.max(2, Math.round(text.split(/\s+/).length / 130));
}

export interface TopicSummaryParseResult {
  summaries: TopicSummary[];
  foundSectionIds: string[];
  warnings: ContentWarning[];
}

/** `Konu Özetleri.md` → konu özetleri. */
export function buildTopicSummaries(
  markdown: string,
  conceptsBySection: Map<string, string[]>,
): TopicSummaryParseResult {
  const document = parseTopicDocument(markdown);
  const warnings: ContentWarning[] = [];
  const summaries = new Map<string, TopicSummary>();
  const found = new Set<string>();

  for (const block of document.topics) {
    const def = matchTopic(block.title);
    if (!def) {
      // Belge başlığı gibi bölümsüz H1'ler konu değildir.
      if (block.sections.some((section) => section.level === 2)) {
        warnings.push({
          level: 'error',
          code: 'unknown-topic-heading',
          message: `Konu başlığı kanonik konu kaydında yok: "${block.title}".`,
          ref: block.title,
        });
      }
      continue;
    }
    if (summaries.has(def.id)) {
      warnings.push({ level: 'error', code: 'duplicate-topic-heading', message: `Konu iki kez yazılmış.`, ref: def.id });
      continue;
    }

    const summary: TopicSummary = {
      topicId: def.id,
      title: def.title,
      intro: block.intro,
      estimatedReadingMinutes: 0,
      sections: [],
      keyPoints: [],
      recallQuestions: [],
    };
    let current: SummarySection | undefined;

    for (const raw of block.sections) {
      if (SOURCES.test(raw.title)) continue;
      if (raw.level === 2 && KEY_POINTS.test(raw.title)) {
        summary.keyPoints.push(...checklistItems(raw));
        current = undefined;
        continue;
      }
      if (raw.level === 2 && RECALL.test(raw.title)) {
        summary.recallQuestions.push(...recallFrom(raw, block.answerGroups));
        current = undefined;
        continue;
      }
      if (raw.level === 2) {
        const sectionDef = matchSection(def.id, raw.title);
        if (!sectionDef) {
          warnings.push({
            level: 'error',
            code: 'unregistered-section',
            message: `"${def.title}" konusundaki bölüm kayıtlı değil: "${raw.title}". Kararlı kimlik için curriculum/topics.ts içine ekle.`,
            ref: `${def.id}/${raw.title}`,
          });
          current = undefined;
          continue;
        }
        found.add(sectionDef.id);
        current = createSection(sectionDef.id, def.id, sectionDef.title, raw, conceptsBySection.get(sectionDef.id) ?? []);
        summary.sections.push(current);
        continue;
      }
      if (current) appendSubsection(current, raw);
    }

    for (const augmentation of SUMMARY_AUGMENTATIONS) {
      const section = summary.sections.find((item) => item.id === augmentation.sectionId);
      if (!section) continue;
      section.augmented = true;
      section.blocks.push({ kind: 'paragraph', text: `**${augmentation.title}**` });
      for (const paragraph of augmentation.paragraphs ?? []) section.blocks.push({ kind: 'paragraph', text: paragraph });
      if (augmentation.table) section.blocks.push({ kind: 'table', head: augmentation.table.head, rows: augmentation.table.rows });
      if (augmentation.warning) section.warnings.push(augmentation.warning);
      for (const example of augmentation.examples ?? []) {
        section.examples.push({ ...example, pronunciation: approximate(example.german) });
      }
    }

    for (const section of summary.sections) finalizeSection(section);
    summary.estimatedReadingMinutes = readingMinutes(
      [
        ...summary.intro,
        ...summary.sections.map(sectionText),
        ...summary.keyPoints,
        ...summary.recallQuestions.map((item) => `${item.question} ${item.answer}`),
      ].join(' '),
    );
    summaries.set(def.id, summary);
  }

  for (const topic of TOPICS) {
    if (!summaries.has(topic.id)) {
      warnings.push({ level: 'error', code: 'summary-topic-missing', message: `Konu özeti bulunamadı: "${topic.title}".`, ref: topic.id });
    }
  }
  for (const section of SUMMARY_SECTIONS) {
    if (!found.has(section.id)) {
      warnings.push({ level: 'error', code: 'summary-section-missing', message: `Kayıtlı özet bölümü kaynakta yok: "${section.title}".`, ref: section.id });
    }
  }

  const ordered = TOPICS.map((topic) => summaries.get(topic.id)).filter((item): item is TopicSummary => Boolean(item));
  return { summaries: ordered, foundSectionIds: [...found], warnings };
}

/** `Genel Tekrar Özet.md` → kümülatif tekrar özeti. */
export function buildReviewSummary(markdown: string): { summary: ReviewSummary; warnings: ContentWarning[] } {
  const document = parseTopicDocument(markdown);
  const warnings: ContentWarning[] = [];
  const block = document.topics[0];
  const summary: ReviewSummary = { title: 'Genel Tekrar', intro: block?.intro ?? [], estimatedReadingMinutes: 0, sections: [] };
  if (!block) {
    warnings.push({ level: 'error', code: 'review-summary-empty', message: 'Genel Tekrar özetinde başlık bulunamadı.' });
    return { summary, warnings };
  }

  const found = new Set<string>();
  let current: SummarySection | undefined;
  for (const raw of block.sections) {
    if (raw.level === 2) {
      const def = matchReviewSection(raw.title);
      if (!def) {
        warnings.push({
          level: 'error',
          code: 'unregistered-review-section',
          message: `Genel Tekrar özetindeki bölüm kayıtlı değil: "${raw.title}".`,
          ref: raw.title,
        });
        current = undefined;
        continue;
      }
      found.add(def.id);
      current = createSection(def.id, def.topicId ?? '', def.title, raw, []);
      if (def.mode) current.reviewMode = def.mode;
      if (QUIZ.test(raw.title)) {
        current.recallQuestions = recallFrom(raw, block.answerGroups);
        current.blocks = current.blocks.filter((item) => !(item.kind === 'paragraph' && /^\d+\s*[.)]\s+/.test(item.text.trim())));
      }
      summary.sections.push(current);
      continue;
    }
    if (current) appendSubsection(current, raw);
  }
  for (const section of summary.sections) finalizeSection(section);
  for (const def of REVIEW_SECTIONS) {
    if (!found.has(def.id)) {
      warnings.push({ level: 'error', code: 'review-section-missing', message: `Genel Tekrar bölümü kaynakta yok: "${def.title}".`, ref: def.id });
    }
  }
  summary.estimatedReadingMinutes = readingMinutes(summary.sections.map(sectionText).join(' '));
  return { summary, warnings };
}
