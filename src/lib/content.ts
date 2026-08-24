/** Uretilmis icerigi yukler ve indeksler. */

import bundle from '../../generated/exercises.json';
import type {
  Concept,
  ContentBundle,
  Day,
  Exercise,
  SummaryDay,
  SummaryTopic,
  LearningTrack,
} from '../content/types';

export const content = bundle as unknown as ContentBundle;

function trackOf(ex: { track?: LearningTrack }): LearningTrack {
  return (ex.track as LearningTrack | undefined) ?? 'normal';
}

export const exercisesById = new Map<string, Exercise>(
  content.exercises.map((exercise) => [exercise.id, exercise]),
);

export const days: Day[] = [...content.days].sort((a, b) =>
  (a.track ?? 'normal') === (b.track ?? 'normal') ? a.day - b.day : (a.track ?? 'normal').localeCompare(b.track ?? 'normal'),
);

export const concepts: Concept[] = content.concepts ?? [];
export const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

export const summaries: SummaryDay[] = [...(content.summaries ?? [])].sort((a, b) =>
  (a.track ?? 'normal') === (b.track ?? 'normal') ? a.day - b.day : (a.track ?? 'normal').localeCompare(b.track ?? 'normal'),
);

export const summaryTopicsById = new Map<string, SummaryTopic>(
  summaries.flatMap((day) => day.topics.map((topic) => [topic.id, topic] as const)),
);

/** Konu ID → ait oldugu gun. */
export const topicDay = new Map<string, number>(
  summaries.flatMap((day) => day.topics.map((topic) => [topic.id, day.day] as const)),
);

/** Konu ID → ait olduğu izlek. */
export const topicTrack = new Map<string, LearningTrack>(
  (summaries.flatMap((day) => day.topics.map((topic) => [topic.id, (day.track ?? 'normal') as LearningTrack] as const)) as Array<[string, LearningTrack]>),
);

export function getDay(day: number, track: LearningTrack = 'normal'): Day | undefined {
  return days.find((entry) => entry.day === day && trackOf(entry) === track);
}

export function getSummary(day: number, track: LearningTrack = 'normal'): SummaryDay | undefined {
  return summaries.find((entry) => entry.day === day && entry.track === track);
}

export function exercisesForDay(day: number, track: LearningTrack = 'normal'): Exercise[] {
  const entry = getDay(day, track);
  if (!entry) return [];
  return entry.exerciseIds
    .map((id) => exercisesById.get(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

/** Onceki tum gunlerin havuzu — karma tekrar icin. */
export function exercisesBeforeDay(day: number, track: LearningTrack = 'normal'): Exercise[] {
  return content.exercises.filter((exercise) => exercise.day < day && trackOf(exercise) === track);
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
export function topicsForDay(day: number, track: LearningTrack = 'normal'): SummaryTopic[] {
  return getSummary(day, track)?.topics ?? [];
}

export function daysForTrack(track: LearningTrack): Day[] {
  return days.filter((day) => trackOf(day) === track);
}

export function summariesForTrack(track: LearningTrack): SummaryDay[] {
  return summaries.filter((day) => day.track === track);
}

export function allExercisesForTrack(track: LearningTrack): Exercise[] {
  return content.exercises.filter((ex) => trackOf(ex) === track);
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
