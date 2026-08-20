/** Uretilmis icerigi yukler ve indeksler. */

import bundle from '../../generated/exercises.json';
import type {
  Concept,
  ContentBundle,
  Day,
  Exercise,
  SummaryDay,
  SummaryTopic,
} from '../content/types';

export const content = bundle as unknown as ContentBundle;

export const exercisesById = new Map<string, Exercise>(
  content.exercises.map((exercise) => [exercise.id, exercise]),
);

export const days: Day[] = [...content.days].sort((a, b) => a.day - b.day);

export const concepts: Concept[] = content.concepts ?? [];
export const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

export const summaries: SummaryDay[] = [...(content.summaries ?? [])].sort((a, b) => a.day - b.day);

export const summaryTopicsById = new Map<string, SummaryTopic>(
  summaries.flatMap((day) => day.topics.map((topic) => [topic.id, topic] as const)),
);

/** Konu ID → ait oldugu gun. */
export const topicDay = new Map<string, number>(
  summaries.flatMap((day) => day.topics.map((topic) => [topic.id, day.day] as const)),
);

export function getDay(day: number): Day | undefined {
  return days.find((entry) => entry.day === day);
}

export function getSummary(day: number): SummaryDay | undefined {
  return summaries.find((entry) => entry.day === day);
}

export function exercisesForDay(day: number): Exercise[] {
  const entry = getDay(day);
  if (!entry) return [];
  return entry.exerciseIds
    .map((id) => exercisesById.get(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

/** Onceki tum gunlerin havuzu — karma tekrar icin. */
export function exercisesBeforeDay(day: number): Exercise[] {
  return content.exercises.filter((exercise) => exercise.day < day);
}

export function exercisesForTopic(topicId: string): Exercise[] {
  return content.exercises.filter((exercise) => exercise.topicId === topicId);
}

export function getExercises(ids: string[]): Exercise[] {
  return ids
    .map((id) => exercisesById.get(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

/** Bir gunun ozet konulari (ustalik cubuklari ve konu calismasi icin). */
export function topicsForDay(day: number): SummaryTopic[] {
  return getSummary(day)?.topics ?? [];
}

/** Bir alistirmanin ilk kavraminin bagli oldugu ozet konusu. */
export function summaryTopicForExercise(exercise: Exercise): SummaryTopic | undefined {
  if (summaryTopicsById.has(exercise.topicId)) return summaryTopicsById.get(exercise.topicId);
  for (const conceptId of exercise.conceptIds) {
    const topicId = conceptsById.get(conceptId)?.topicId;
    if (topicId && summaryTopicsById.has(topicId)) return summaryTopicsById.get(topicId);
  }
  return undefined;
}

export const allExercises = content.exercises;
export const contentVersion = content.contentVersion ?? 'bilinmiyor';

/* ------------------------------------------------------------------ */
/* Ozet arama (§50)                                                    */
/* ------------------------------------------------------------------ */

export interface SummarySearchHit {
  day: number;
  topic: SummaryTopic;
  /** Eslesmenin gectigi kisa baglam. */
  excerpt: string;
}

function searchableText(topic: SummaryTopic): string {
  const blocks = topic.blocks.map((block) => {
    switch (block.kind) {
      case 'paragraph':
      case 'callout':
        return block.text;
      case 'list':
        return block.items.join(' · ');
      case 'code':
        return block.lines.join(' · ');
      case 'table':
        return [...block.head, ...block.rows.flat()].join(' · ');
    }
  });
  return [
    topic.title,
    ...blocks,
    ...topic.warnings,
    ...topic.keyPoints,
    ...topic.examples.map((example) => `${example.german} ${example.turkish ?? ''}`),
  ].join(' · ');
}

const SEARCH_INDEX = summaries.flatMap((day) =>
  day.topics.map((topic) => ({ day: day.day, topic, text: searchableText(topic) })),
);

export function searchSummaries(query: string, limit = 8): SummarySearchHit[] {
  const needle = query.trim().toLocaleLowerCase('tr');
  if (needle.length < 2) return [];

  const hits: SummarySearchHit[] = [];
  for (const entry of SEARCH_INDEX) {
    const haystack = entry.text.toLocaleLowerCase('tr');
    const index = haystack.indexOf(needle);
    if (index === -1) continue;
    const start = Math.max(0, index - 45);
    const excerpt = `${start > 0 ? '…' : ''}${entry.text.slice(start, index + needle.length + 55).trim()}…`;
    hits.push({ day: entry.day, topic: entry.topic, excerpt });
    if (hits.length >= limit) break;
  }
  return hits;
}
