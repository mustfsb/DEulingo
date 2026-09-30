/**
 * Dil-bağımsız içerik cephesi.
 *
 * Almanca (`lib/content.ts`) ve İngilizce (`content/en`) AYNI cephe
 * arkasında sunulur: ekranlar dili değil cepheyi görür; içerik değişir,
 * bileşenler paylaşılır. Ayrı `GermanDashboard / EnglishDashboard` YOKTUR.
 */

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
import type { LearningLanguage } from './language';
import {
  allExercises,
  conceptsById,
  content,
  contentVersion,
  conceptIdsForTopic,
  exercisesById,
  exercisesForSection,
  exercisesForTopic,
  exerciseInTopic,
  getExercises,
  getTopic,
  getTopicBySlug,
  getTopicSummary,
  lessonExercises,
  migrationContext,
  primaryExercisesForTopic,
  reviewBank,
  reviewSectionsById,
  reviewSummary,
  searchSummaries,
  sectionMasteryDefs,
  sectionsById,
  summaries,
  summariesByTopic,
  summarySectionForExercise,
  topicMasteryDefs,
  topicTitle,
  topics,
  topicsById,
  topicsBySlug,
  concepts,
} from './content';
import {
  enConcepts,
  enConceptsById,
  enMigrationContext,
  enExercisesById,
  enReviewSectionsById,
  enReviewSummary,
  enSectionsById,
  enSummaries,
  enSummariesByTopic,
  enTopics,
  enTopicsById,
  enTopicsBySlug,
  enVocabulary,
  EN_ALL_EXERCISES,
  EN_LESSON_EXERCISES,
  EN_REVIEW_BANK,
} from '../content/en/index';
import { EN_VOCAB_BY_ID, EN_VOCABULARY } from '../content/en/vocab';
import { VOCAB_BY_ID, VOCABULARY } from '../content/vocabulary/inventory';
import type { VocabEntry } from '../content/vocabulary/inventory';

export interface ContentFacade {
  language: LearningLanguage;
  bundle: ContentBundle | null;
  topics: CurriculumTopic[];
  topicsById: Map<string, CurriculumTopic>;
  topicsBySlug: Map<string, CurriculumTopic>;
  getTopic: (topicId: string | undefined) => CurriculumTopic | undefined;
  getTopicBySlug: (slug: string | undefined) => CurriculumTopic | undefined;
  topicTitle: (topicId: string | undefined) => string;
  summaries: TopicSummary[];
  summariesByTopic: Map<string, TopicSummary>;
  reviewSummary: ReviewSummary | undefined;
  sectionsById: Map<string, SummarySection>;
  reviewSectionsById: Map<string, SummarySection>;
  getTopicSummary: (topicId: string | undefined) => TopicSummary | undefined;
  summarySectionForExercise: (exercise: Exercise) => SummarySection | undefined;
  searchSummaries: (query: string, limit?: number) => Array<{ scope: string; section: SummarySection; excerpt: string }>;
  exercisesById: Map<string, Exercise>;
  getExercises: (ids: string[]) => Exercise[];
  allExercises: Exercise[];
  lessonExercises: Exercise[];
  reviewBank: Exercise[];
  exerciseInTopic: (exercise: Exercise, topicId: string) => boolean;
  primaryExercisesForTopic: (topicId: string) => Exercise[];
  exercisesForTopic: (topicId: string) => Exercise[];
  exercisesForSection: (sectionId: string) => Exercise[];
  concepts: Concept[];
  conceptsById: Map<string, Concept>;
  conceptIdsForTopic: (topicId: string) => string[];
  topicMasteryDefs: Array<{ id: string; title: string; conceptIds: string[] }>;
  sectionMasteryDefs: (topicId: string) => Array<{ id: string; title: string; conceptIds: string[] }>;
  migrationContext: MigrationContext;
  contentVersion: string;
  vocabulary: VocabEntry[];
  vocabById: Map<string, VocabEntry>;
}

function enConceptIdsForTopic(topicId: string): string[] {
  return enTopicsById.get(topicId)?.conceptIds ?? [];
}

function enSectionMasteryDefs(topicId: string): Array<{ id: string; title: string; conceptIds: string[] }> {
  const summary = enSummariesByTopic.get(topicId);
  return (summary?.sections ?? [])
    .filter((section) => section.conceptIds.length > 0)
    .map((section) => ({ id: section.id, title: section.title, conceptIds: section.conceptIds }));
}

function enSummarySectionForExercise(exercise: Exercise): SummarySection | undefined {
  if (exercise.sectionId && enSectionsById.has(exercise.sectionId)) return enSectionsById.get(exercise.sectionId);
  for (const conceptId of exercise.conceptIds) {
    const sectionId = enConceptsById.get(conceptId)?.sectionId;
    if (sectionId && enSectionsById.has(sectionId)) return enSectionsById.get(sectionId);
  }
  return undefined;
}

function enGetExercises(ids: string[]): Exercise[] {
  return ids.map((id) => enExercisesById.get(id)).filter((exercise): exercise is Exercise => Boolean(exercise));
}

function enExerciseInTopic(exercise: Exercise, topicId: string): boolean {
  return exercise.topicId === topicId || Boolean(exercise.secondaryTopicIds?.includes(topicId));
}

function searchableEnText(section: SummarySection): string {
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

const EN_SEARCH_INDEX = [
  ...enSummaries.flatMap((summary) =>
    summary.sections.map((section) => ({ scope: summary.topicId, section, text: searchableEnText(section) })),
  ),
  ...enReviewSummary.sections.map((section) => ({ scope: 'review', section, text: searchableEnText(section) })),
];

function enSearchSummaries(query: string, limit = 8): Array<{ scope: string; section: SummarySection; excerpt: string }> {
  const needle = query.trim().toLocaleLowerCase('tr');
  if (needle.length < 2) return [];
  const hits: Array<{ scope: string; section: SummarySection; excerpt: string }> = [];
  for (const entry of EN_SEARCH_INDEX) {
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

function enGetTopic(topicId: string | undefined): CurriculumTopic | undefined {
  return topicId ? enTopicsById.get(topicId) : undefined;
}

function enGetTopicBySlug(slug: string | undefined): CurriculumTopic | undefined {
  return slug ? enTopicsBySlug.get(slug) : undefined;
}

function enTopicTitle(topicId: string | undefined): string {
  return (topicId && enTopicsById.get(topicId)?.title) || 'Konu';
}

function enGetTopicSummary(topicId: string | undefined): TopicSummary | undefined {
  return topicId ? enSummariesByTopic.get(topicId) : undefined;
}

export const enContent: ContentFacade = {
  language: 'en',
  bundle: null,
  topics: enTopics,
  topicsById: enTopicsById,
  topicsBySlug: enTopicsBySlug,
  getTopic: enGetTopic,
  getTopicBySlug: enGetTopicBySlug,
  topicTitle: enTopicTitle,
  summaries: enSummaries,
  summariesByTopic: enSummariesByTopic,
  reviewSummary: enReviewSummary,
  sectionsById: enSectionsById,
  reviewSectionsById: enReviewSectionsById,
  getTopicSummary: enGetTopicSummary,
  summarySectionForExercise: enSummarySectionForExercise,
  searchSummaries: enSearchSummaries,
  exercisesById: enExercisesById,
  getExercises: enGetExercises,
  allExercises: EN_ALL_EXERCISES,
  lessonExercises: EN_LESSON_EXERCISES,
  reviewBank: EN_REVIEW_BANK,
  exerciseInTopic: enExerciseInTopic,
  primaryExercisesForTopic: (topicId) => EN_LESSON_EXERCISES.filter((exercise) => exercise.topicId === topicId),
  exercisesForTopic: (topicId) => EN_LESSON_EXERCISES.filter((exercise) => enExerciseInTopic(exercise, topicId)),
  exercisesForSection: (sectionId) => EN_LESSON_EXERCISES.filter((exercise) => exercise.sectionId === sectionId),
  concepts: enConcepts,
  conceptsById: enConceptsById,
  conceptIdsForTopic: enConceptIdsForTopic,
  topicMasteryDefs: enTopics.map((topic) => ({ id: topic.id, title: topic.title, conceptIds: topic.conceptIds })),
  sectionMasteryDefs: enSectionMasteryDefs,
  migrationContext: enMigrationContext,
  contentVersion: 'en.present-perfect-v1',
  vocabulary: enVocabulary,
  vocabById: EN_VOCAB_BY_ID,
};

export const deContent: ContentFacade = {
  language: 'de',
  bundle: content,
  topics,
  topicsById,
  topicsBySlug,
  getTopic,
  getTopicBySlug,
  topicTitle,
  summaries,
  summariesByTopic,
  reviewSummary,
  sectionsById,
  reviewSectionsById,
  getTopicSummary,
  summarySectionForExercise,
  searchSummaries,
  exercisesById,
  getExercises,
  allExercises,
  lessonExercises,
  reviewBank,
  exerciseInTopic,
  primaryExercisesForTopic,
  exercisesForTopic,
  exercisesForSection,
  concepts,
  conceptsById,
  conceptIdsForTopic,
  topicMasteryDefs,
  sectionMasteryDefs,
  migrationContext,
  contentVersion,
  vocabulary: VOCABULARY,
  vocabById: VOCAB_BY_ID,
};

/** Aktif dile ait cephe — ekranların tek içerik girişi. */
export function contentFor(language: LearningLanguage): ContentFacade {
  return language === 'en' ? enContent : deContent;
}

export { EN_LESSON_EXERCISES, EN_REVIEW_BANK, enVocabulary, EN_VOCABULARY, EN_VOCAB_BY_ID, enExercisesById, enMigrationContext };
