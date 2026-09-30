/**
 * İngilizce içerik katmanının tek giriş noktası.
 *
 * Almanca hattaki `generated/exercises.json` paketine dokunulmaz; İngilizce
 * içerik statik modüllerden derlenir ve `lib/content-en.ts` üzerinden
 * Almanca `lib/content.ts` ile AYNI cephe (`ContentFacade`) arkasında
 * sunulur. Ekranlar dili değil cepheyi görür.
 */

import type { Concept, CurriculumTopic, Exercise, ReviewSummary, SummarySection, TopicSummary } from '../types.ts';
import type { MigrationContext } from '../../lib/storage.ts';
import { EN_CONCEPTS } from './concepts.ts';
import { EN_REVIEW_EXERCISES } from './review.ts';
import { EN_EXERCISES_CONTRAST } from './exercises-contrast.ts';
import { EN_EXERCISES_CORE } from './exercises-core.ts';
import { EN_EXERCISES_PRODUCTION } from './exercises-production.ts';
import { EN_PRESENT_PERFECT_SUMMARY } from './summary.ts';
import { EN_SUMMARY_SECTIONS, EN_TOPICS } from './topics.ts';
import { EN_VOCABULARY } from './vocab.ts';

export { EN_CONCEPTS } from './concepts.ts';
export { EN_REVIEW_EXERCISES } from './review.ts';
export { EN_PRESENT_PERFECT_SUMMARY } from './summary.ts';
export { EN_TOPICS, EN_TOPIC_BY_ID, EN_TOPIC_BY_SLUG } from './topics.ts';
export { EN_VOCABULARY, EN_VOCAB_BY_ID } from './vocab.ts';

/** Ders bankası (konu havuzu) — Genel Tekrar bankası hariç. */
export const EN_LESSON_EXERCISES: Exercise[] = [
  ...EN_EXERCISES_CORE,
  ...EN_EXERCISES_PRODUCTION,
  ...EN_EXERCISES_CONTRAST,
];

/** Kümülatif İngilizce Genel Tekrar bankası. */
export const EN_REVIEW_BANK: Exercise[] = [...EN_REVIEW_EXERCISES];

export const EN_ALL_EXERCISES: Exercise[] = [...EN_LESSON_EXERCISES, ...EN_REVIEW_BANK];

export const enExercisesById = new Map<string, Exercise>(EN_ALL_EXERCISES.map((exercise) => [exercise.id, exercise]));

export const enConcepts: Concept[] = [...EN_CONCEPTS];
export const enConceptsById = new Map(enConcepts.map((concept) => [concept.id, concept]));

/* ------------------------------------------------------------------ */
/* Müfredat haritası (türetilmiş)                                       */
/* ------------------------------------------------------------------ */

function buildEnTopics(): CurriculumTopic[] {
  const def = EN_TOPICS[0];
  const lesson = EN_LESSON_EXERCISES.filter((exercise) => exercise.topicId === def.id);
  return [
    {
      id: def.id,
      slug: def.slug,
      title: def.title,
      emoji: def.emoji,
      description: def.description,
      keywords: def.keywords,
      order: 0,
      sectionIds: EN_SUMMARY_SECTIONS.map((section) => section.id),
      conceptIds: EN_CONCEPTS.map((concept) => concept.id),
      exerciseIds: lesson.map((exercise) => exercise.id),
      secondaryExerciseIds: [],
      reviewExerciseIds: EN_REVIEW_BANK.filter(
        (exercise) => exercise.topicId === def.id || exercise.secondaryTopicIds?.includes(def.id),
      ).map((exercise) => exercise.id),
      // 2,5–3 saatlik ilk oturum hedefi (özet + pratik + dinleme + yazma).
      estimatedMinutes: 150,
    },
  ];
}

export const enTopics: CurriculumTopic[] = buildEnTopics();
export const enTopicsById = new Map(enTopics.map((topic) => [topic.id, topic]));
export const enTopicsBySlug = new Map(enTopics.map((topic) => [topic.slug, topic]));

/* ------------------------------------------------------------------ */
/* Özetler                                                              */
/* ------------------------------------------------------------------ */

export const enSummaries: TopicSummary[] = [EN_PRESENT_PERFECT_SUMMARY];
export const enSummariesByTopic = new Map(enSummaries.map((summary) => [summary.topicId, summary]));

export const enSectionsById = new Map<string, SummarySection>(
  enSummaries.flatMap((summary) => summary.sections.map((section) => [section.id, section] as const)),
);

export const enReviewSummary: ReviewSummary = {
  title: 'Genel Tekrar Özeti — English',
  intro: ['Present Perfectin sıkıştırılmış tekrarı: formül, have/has, V3, for/since ve zaman ayrımı.'],
  estimatedReadingMinutes: 8,
  sections: [
    {
      id: 'genel-en.present-perfect',
      topicId: 'en.present-perfect',
      title: 'Present Perfect',
      conceptIds: ['pp.formula.core', 'pp.have-has.table', 'pp.v3.irregular-core', 'pp.for-since.rule'],
      blocks: [
        { kind: 'paragraph', text: 'Formül: have/has + V3. I have seen, She has finished, We have lived here for three years.' },
        { kind: 'list', items: ['I/you/we/they → have; he/she/it → has', 'haven\'t seen ✅, haven\'t see ❌', 'for = süre (for three years), since = başlangıç (since 2023)', 'yesterday → saw; three times → have seen'] },
      ],
      warnings: ['I know her since 2023. ❌ → I have known her since 2023. ✅'],
      examples: [
        { german: 'I have lived here for three years.', turkish: 'Üç yıldır burada yaşıyorum.' },
        { german: 'Have you ever been to Germany?', turkish: 'Hiç Almanya’da bulundun mu?' },
      ],
      pronunciation: [],
    },
    {
      id: 'genel-en.nasil-kullanilir',
      topicId: '',
      title: 'Nasıl Kullanılır?',
      conceptIds: [],
      blocks: [
        { kind: 'paragraph', text: 'Bu özet, öğrendiğin İngilizce konuların sıkıştırılmış tekrarıdır. “Bu Konuyu Çalış” seni ilgili konunun tekrarına götürür.' },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
      reviewMode: 'mixed',
    },
    {
      id: 'genel-en.kaliplar',
      topicId: '',
      title: 'Konuşma Kalıpları',
      conceptIds: [],
      blocks: [
        { kind: 'paragraph', text: 'Günlük kalıplar: Have you ever…? / I have never… / I’ve just… / I haven’t … yet.' },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
      reviewMode: 'mixed',
    },
    {
      id: 'genel-en.hizli-tekrar',
      topicId: '',
      title: 'Hızlı Özet Turu',
      conceptIds: [],
      blocks: [
        { kind: 'paragraph', text: 'Hataların ve zayıf kavramların hızlı turu (~10 dakika).' },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
      reviewMode: 'quick',
    },
  ],
};

export const enReviewSectionsById = new Map<string, SummarySection>(
  enReviewSummary.sections.map((section) => [section.id, section] as const),
);

/* ------------------------------------------------------------------ */
/* Göç bağlamı + kelime havuzu                                         */
/* ------------------------------------------------------------------ */

export const enMigrationContext: MigrationContext = {
  topicOfExercise(exerciseId) {
    const exercise = enExercisesById.get(exerciseId);
    return exercise ? { topicId: exercise.topicId, title: exercise.topic } : undefined;
  },
};

export const enVocabulary = EN_VOCABULARY;
