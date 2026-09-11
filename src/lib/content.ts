/**
 * Üretilmiş içeriği yükler ve KONU bazında indeksler.
 *
 * Tek kimlik `topicId`'dir. Konu pratiği, özet, ustalık, hatalar ve Genel
 * Tekrar filtreleri aynı kanonik konu kaydını (`content.topics`) kullanır.
 */

import bundle from '../../generated/exercises.json';
import type {
  Concept,
  ContentBundle,
  CurriculumTopic,
  Exercise,
  ReviewSummary,
  SummarySection,
  TopicSummary,
} from '../content/types';
import type { MigrationContext } from './storage';

export const content = bundle as unknown as ContentBundle;

export const exercisesById = new Map<string, Exercise>(content.exercises.map((exercise) => [exercise.id, exercise]));

export const concepts: Concept[] = content.concepts ?? [];
export const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

/** Kanonik müfredat haritası (gösterim sırası). */
export const topics: CurriculumTopic[] = [...(content.topics ?? [])].sort((a, b) => a.order - b.order);
export const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
export const topicsBySlug = new Map(topics.map((topic) => [topic.slug, topic]));

export function getTopic(topicId: string | undefined): CurriculumTopic | undefined {
  return topicId ? topicsById.get(topicId) : undefined;
}

export function getTopicBySlug(slug: string | undefined): CurriculumTopic | undefined {
  return slug ? topicsBySlug.get(slug) : undefined;
}

export function topicTitle(topicId: string | undefined): string {
  return (topicId && topicsById.get(topicId)?.title) || 'Konu';
}

/* ------------------------------------------------------------------ */
/* Özetler                                                             */
/* ------------------------------------------------------------------ */

export const summaries: TopicSummary[] = content.summaries ?? [];
export const summariesByTopic = new Map(summaries.map((summary) => [summary.topicId, summary]));
export const reviewSummary: ReviewSummary | undefined = content.reviewSummary;

export const sectionsById = new Map<string, SummarySection>(
  summaries.flatMap((summary) => summary.sections.map((section) => [section.id, section] as const)),
);
export const reviewSectionsById = new Map<string, SummarySection>(
  (reviewSummary?.sections ?? []).map((section) => [section.id, section] as const),
);

export function getTopicSummary(topicId: string | undefined): TopicSummary | undefined {
  return topicId ? summariesByTopic.get(topicId) : undefined;
}

/** Bir alıştırmanın "Özeti aç" hedefi: kendi bölümü, yoksa ilk kavramının bölümü. */
export function summarySectionForExercise(exercise: Exercise): SummarySection | undefined {
  if (exercise.sectionId && sectionsById.has(exercise.sectionId)) return sectionsById.get(exercise.sectionId);
  for (const conceptId of exercise.conceptIds) {
    const sectionId = conceptsById.get(conceptId)?.sectionId;
    if (sectionId && sectionsById.has(sectionId)) return sectionsById.get(sectionId);
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Havuzlar                                                            */
/* ------------------------------------------------------------------ */

/** Ders bankası (konu havuzları) — Genel Tekrar bankası hariç. */
export const lessonExercises: Exercise[] = content.exercises.filter((exercise) => !exercise.reviewOnly);

/** Kümülatif Genel Tekrar bankası. */
export const reviewBank: Exercise[] = content.exercises.filter((exercise) => exercise.reviewOnly);

/** Alıştırma bu konuyu çalıştırıyor mu (birincil ya da ikincil etiket)? */
export function exerciseInTopic(exercise: Exercise, topicId: string): boolean {
  return exercise.topicId === topicId || Boolean(exercise.secondaryTopicIds?.includes(topicId));
}

/** Konunun birincil ders alıştırmaları (tamamlanma ve istatistik bunları sayar). */
export function primaryExercisesForTopic(topicId: string): Exercise[] {
  return lessonExercises.filter((exercise) => exercise.topicId === topicId);
}

/**
 * Konu pratiği havuzu: birincil + ikincil etiketli ders alıştırmaları.
 * Örn. `Ich will früh aufstehen.` hem Modalverben hem Ayrılabilen Fiiller
 * pratiğinde görünür.
 */
export function exercisesForTopic(topicId: string): Exercise[] {
  return lessonExercises.filter((exercise) => exerciseInTopic(exercise, topicId));
}

/** Bir özet bölümüne ait ders alıştırmaları (bölüm pratiği). */
export function exercisesForSection(sectionId: string): Exercise[] {
  return lessonExercises.filter((exercise) => exercise.sectionId === sectionId);
}

/** v9 → v10 ilerleme göçünün içerik bağlamı (alıştırma → kanonik konu). */
export const migrationContext: MigrationContext = {
  topicOfExercise(exerciseId) {
    const exercise = exercisesById.get(exerciseId);
    return exercise ? { topicId: exercise.topicId, title: exercise.topic } : undefined;
  },
};

export function getExercises(ids: string[]): Exercise[] {
  return ids.map((id) => exercisesById.get(id)).filter((exercise): exercise is Exercise => Boolean(exercise));
}

export const allExercises = content.exercises;
export const contentVersion = content.contentVersion ?? 'bilinmiyor';

/** Konunun kavramları (ustalık hesabı için). */
export function conceptIdsForTopic(topicId: string): string[] {
  return topicsById.get(topicId)?.conceptIds ?? [];
}

/** Ustalık hesabına verilecek konu tanımları. */
export const topicMasteryDefs = topics.map((topic) => ({ id: topic.id, title: topic.title, conceptIds: topic.conceptIds }));

/** Bir konunun bölümleri — ustalık çubukları için bölüm başına kavramlar. */
export function sectionMasteryDefs(topicId: string): Array<{ id: string; title: string; conceptIds: string[] }> {
  const summary = summariesByTopic.get(topicId);
  return (summary?.sections ?? [])
    .filter((section) => section.conceptIds.length > 0)
    .map((section) => ({ id: section.id, title: section.title, conceptIds: section.conceptIds }));
}

/* ------------------------------------------------------------------ */
/* Özet arama                                                          */
/* ------------------------------------------------------------------ */

export interface SummarySearchHit {
  /** Konu özeti için konu kimliği; Genel Tekrar özeti için `review`. */
  scope: string;
  section: SummarySection;
  /** Eşleşmenin geçtiği kısa bağlam. */
  excerpt: string;
}

function searchableText(section: SummarySection): string {
  const blocks = section.blocks.map((block) => {
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
    section.title,
    ...blocks,
    ...section.warnings,
    ...section.examples.map((example) => `${example.german} ${example.turkish ?? ''}`),
  ].join(' · ');
}

const SEARCH_INDEX = [
  ...summaries.flatMap((summary) =>
    summary.sections.map((section) => ({ scope: summary.topicId, section, text: searchableText(section) })),
  ),
  ...(reviewSummary?.sections ?? []).map((section) => ({ scope: 'review', section, text: searchableText(section) })),
];

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
    hits.push({ scope: entry.scope, section: entry.section, excerpt });
    if (hits.length >= limit) break;
  }
  return hits;
}
