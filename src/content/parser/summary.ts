/**
 * Ozet dosyasini `Özetler` bolumunun okudugu yapiya cevirir.
 *
 * Kaynaktaki H2 bolumleri konu, altlarindaki H3 bolumleri ("⚠️ Dikkat",
 * "İsim Kodlama" gibi) ayni konunun parcasi sayilir. Gun duzeyindeki
 * "5 Dakikalık Hızlı Tekrar" ve "Kendine Sor" bolumleri ayristirilip
 * mumkun oldugunda ilgili konuya dagitilir.
 */

import type {
  GermanExample,
  NoteBlock,
  Pronunciation,
  RecallQuestion,
  SummaryDay,
  SummaryTopic,
} from '../types.ts';
import { SUMMARY_TOPICS, type SummaryTopicDef } from '../authored/concepts.ts';
import { SUMMARY_AUGMENTATIONS } from '../authored/summary-augmentations.ts';
import { RECALL_ANSWER_FIX } from '../overrides.ts';
import { approximate, isCurated } from '../authored/pronunciation.ts';
import { sectionToNote } from './notes.ts';
import { collapseSpaces, plain } from './text.ts';
import type { RawDay, RawSection } from './document.ts';

const KEY_POINTS = /Hızlı Tekrar/i;
const RECALL = /Kendine Sor/i;
const SOURCES = /Bu Özeti Oluşturan/i;
const WARNING_TITLE = /Dikkat/i;

/** Konu basligini kayitli konu tanimiyla eslestirir. */
function matchTopic(title: string, track?: import('../types.ts').LearningTrack): SummaryTopicDef | undefined {
  const normalized = collapseSpaces(plain(title)).toLocaleLowerCase('tr');
  const candidates = SUMMARY_TOPICS.filter((topic) => ((topic.track as import('../types.ts').LearningTrack | undefined) ?? 'normal') === (track ?? 'normal'));
  return candidates.find((topic) =>
    topic.matchTitles.some((candidate) => collapseSpaces(plain(candidate)).toLocaleLowerCase('tr') === normalized),
  );
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

/** Konunun tum metni — kavram `anchor` aramasi bunun uzerinde yapilir. */
export function topicText(topic: SummaryTopic): string {
  return [
    topic.title,
    ...topic.blocks.map(blockText),
    ...topic.warnings,
    ...topic.keyPoints,
    ...topic.examples.map((example) => `${example.german} ${example.turkish ?? ''}`),
    ...topic.recallQuestions.map((item) => `${item.question} ${item.answer}`),
  ].join('\n');
}

/**
 * Kod bloklarindan Almanca ornek cumleleri cikarir.
 * `Ich komme aus der Türkei.  (Türkiye'den geliyorum.)` ve
 * `Tschüss / Ciao — Hoşça kal` bicimleri desteklenir.
 */
function extractExamples(blocks: NoteBlock[]): GermanExample[] {
  const examples: GermanExample[] = [];
  for (const block of blocks) {
    if (block.kind !== 'code') continue;
    for (const raw of block.lines) {
      const line = raw.trim();
      // Kural aciklamasi olan satirlar ornek degildir (`13 = drei + zehn → dreizehn`).
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

/** Konuda gecen, sozlukte karsiligi olan onemli Almanca kaliplar. */
function topicPronunciation(blocks: NoteBlock[], examples: GermanExample[], limit = 8): Pronunciation[] {
  const candidates: string[] = [];

  for (const block of blocks) {
    if (block.kind !== 'table') continue;
    // Tablolarin ilk sutunu aday kabul edilir; Almanca olmayanlar asagida
    // `isCurated` elemesinde zaten dusuyor.
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

/** "- [ ] madde" satirlarini duz metne cevirir. */
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

/**
 * Bir metni en cok ortusen konuya atar.
 *
 * Eslestirme anahtarlari konu BASLIGINDAN ve kavram ETIKETLERINDEN turetilir
 * (kapsam `anchor`lari bu is icin uygun degil: onlar kaynakta birebir gecen
 * dizeler, kontrol listesi cumleleri degil).
 * Guvenli eslesme yoksa `undefined` doner ve madde ilk konuya birakilir.
 */
function attribute(
  text: string,
  topics: SummaryTopic[],
  keywords: Map<string, string[]>,
): SummaryTopic | undefined {
  const haystack = plain(text).toLocaleLowerCase('tr');
  let best: { topic: SummaryTopic; score: number } | undefined;
  for (const topic of topics) {
    let score = 0;
    for (const keyword of keywords.get(topic.id) ?? []) {
      if (haystack.includes(keyword)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic;
}

/** Baslik ve kavram etiketlerinden eslestirme anahtarlari uretir. */
export function attributionKeywords(
  topics: Array<{ id: string; title: string }>,
  concepts: Array<{ topicId: string; label: string }>,
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const push = (topicId: string, source: string) => {
    const tokens = plain(source)
      .toLocaleLowerCase('tr')
      .split(/[^\p{L}\p{N}']+/u)
      .filter((token) => token.length >= 4);
    result.set(topicId, [...new Set([...(result.get(topicId) ?? []), ...tokens])]);
  };

  for (const topic of topics) push(topic.id, topic.title);
  for (const concept of concepts) push(concept.topicId, concept.label);
  return result;
}

/**
 * Ozet dosyasinin sonundaki `<details>` bloklarindan gun basina
 * "Kendine Sor" cevaplarini cikarir.
 *
 * Bu bloklar dosyanin en sonunda toplu halde durdugu icin belge ayristiricisi
 * hepsini son gune baglar; burada `<summary>N. Gün cevapları</summary>`
 * etiketine bakarak dogru gune dagitilir.
 */
export function parseRecallAnswers(markdown: string): Map<number, string[]> {
  const result = new Map<number, string[]>();
  const blocks = markdown.matchAll(/<details>([\s\S]*?)<\/details>/gi);

  for (const [, body] of blocks) {
    const label = body.match(/<summary>\s*(.*?)\s*<\/summary>/i)?.[1] ?? '';
    const day = Number(label.match(/(\d+)\s*\.\s*G[üu]n/u)?.[1]);
    if (!Number.isInteger(day)) continue;

    const items: string[] = [];
    for (const line of body.split('\n')) {
      const match = line.trim().match(/^(\d+)\s*[.)]\s+(.+)$/);
      if (match) items.push(collapseSpaces(match[2]));
    }
    if (items.length) result.set(day, items);
  }
  return result;
}

export interface SummaryParseResult {
  days: SummaryDay[];
  /** Kayitli oldugu halde kaynakta bulunamayan konular. */
  missingTopicIds: string[];
}

export function buildSummaries(
  rawDays: RawDay[],
  markdown: string,
  attributionKeys: Map<string, string[]>,
  conceptsByTopic: Map<string, string[]>,
  track: import('../types.ts').LearningTrack = 'normal',
): SummaryParseResult {
  const recallAnswers = parseRecallAnswers(markdown);
  const days: SummaryDay[] = [];
  const found = new Set<string>();

  for (const rawDay of rawDays) {
    const topics: SummaryTopic[] = [];
    let current: SummaryTopic | undefined;
    const pendingKeyPoints: string[] = [];
    const pendingRecall: string[] = [];

    for (const section of rawDay.sections) {
      if (SOURCES.test(section.title)) continue;

      if (KEY_POINTS.test(section.title)) {
        pendingKeyPoints.push(...checklistItems(section));
        continue;
      }
      if (RECALL.test(section.title)) {
        pendingRecall.push(...numberedItems(section));
        continue;
      }

      if (section.level === 2) {
        const def = matchTopic(section.title, track);
        if (!def) {
          current = undefined;
          continue;
        }
        found.add(def.id);
        const note = sectionToNote(section);
        current = {
          id: def.id,
          title: def.title,
          track,
          conceptIds: conceptsByTopic.get(def.id) ?? [],
          blocks: note?.blocks ?? [],
          warnings: [],
          keyPoints: [],
          recallQuestions: [],
          examples: [],
          pronunciation: [],
        };
        topics.push(current);
        continue;
      }

      // H3 ve altı: acik olan konunun parcasi.
      if (!current) continue;
      const note = sectionToNote(section);
      if (!note) continue;
      if (WARNING_TITLE.test(section.title)) {
        current.warnings.push(...note.blocks.map(blockText).filter(Boolean));
      } else {
        current.blocks.push({ kind: 'paragraph', text: `**${note.title}**` }, ...note.blocks);
      }
    }

    // Uygulama ici ek notlar.
    for (const augmentation of SUMMARY_AUGMENTATIONS) {
      const topic = topics.find((item) => item.id === augmentation.topicId);
      if (!topic) continue;
      topic.augmented = true;
      topic.blocks.push({ kind: 'paragraph', text: `**${augmentation.title}**` });
      for (const paragraph of augmentation.paragraphs ?? []) {
        topic.blocks.push({ kind: 'paragraph', text: paragraph });
      }
      if (augmentation.table) {
        topic.blocks.push({ kind: 'table', head: augmentation.table.head, rows: augmentation.table.rows });
      }
      if (augmentation.warning) topic.warnings.push(augmentation.warning);
      for (const example of augmentation.examples ?? []) {
        topic.examples.push({ ...example, pronunciation: approximate(example.german) });
      }
    }

    // Ornekler ve okunuslar.
    for (const topic of topics) {
      topic.examples = [...extractExamples(topic.blocks), ...topic.examples];
      topic.pronunciation = topicPronunciation(topic.blocks, topic.examples);
    }

    // Gun duzeyindeki maddeleri konulara dagit.
    for (const item of pendingKeyPoints) {
      const topic = attribute(item, topics, attributionKeys);
      (topic ?? topics[0])?.keyPoints.push(item);
    }

    // "Kendine Sor" sorulari, gunun cevap listesiyle eslestirilir.
    // Kaynakta kaymis cevaplar `RECALL_ANSWER_FIX` ile duzeltilir.
    const answers = recallAnswers.get(rawDay.day) ?? [];
    const fixes = RECALL_ANSWER_FIX[rawDay.day];
    pendingRecall.forEach((question, index) => {
      const answer = fixes?.[index + 1] ?? answers[index];
      if (!answer) return;
      const recall: RecallQuestion = { question, answer: collapseSpaces(answer) };
      const topic = attribute(`${question} ${answer}`, topics, attributionKeys);
      (topic ?? topics[0])?.recallQuestions.push(recall);
    });

    for (const topic of topics) {
      topic.blocks = topic.blocks.filter(
        (block) => !(block.kind === 'paragraph' && !block.text.trim()),
      );
    }

    days.push({
      day: rawDay.day,
      track,
      title: `${rawDay.day}. Gün`,
      estimatedReadingMinutes: readingMinutes(topics),
      topics,
    });
  }

  return {
    days,
    missingTopicIds: SUMMARY_TOPICS.filter((topic) => ((topic.track as import('../types.ts').LearningTrack | undefined) ?? 'normal') === track && !found.has(topic.id)).map((topic) => topic.id),
  };
}

function readingMinutes(topics: SummaryTopic[]): number {
  const words = topics
    .map((topic) => topicText(topic).split(/\s+/).length)
    .reduce((total, count) => total + count, 0);
  return Math.max(3, Math.round(words / 130));
}
