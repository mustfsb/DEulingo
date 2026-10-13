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
import { EN_REVIEW_EXERCISES_NEW } from './review-new.ts';
import { EN_EXERCISES_CONTRAST } from './exercises-contrast.ts';
import { EN_EXERCISES_CORE } from './exercises-core.ts';
import { EN_EXERCISES_PRODUCTION } from './exercises-production.ts';
import { EN_EXERCISES_SENTENCE_STRUCTURE } from './exercises-sentence-structure.ts';
import { EN_EXERCISES_PAST_PERFECT } from './exercises-past-perfect.ts';
import { EN_EXERCISES_GERUND_INFINITIVE } from './exercises-gerund-infinitive.ts';
import { EN_EXERCISES_CONDITIONALS } from './exercises-conditionals.ts';
import { EN_EXERCISES_PREPOSITIONS } from './exercises-prepositions.ts';
import { EN_EXERCISES_WEEK1_PLAN } from './exercises-week1-plan.ts';
import { EN_EXERCISES_WEEK1_DEPTH } from './exercises-week1-depth.ts';
import { EN_PRESENT_PERFECT_SUMMARY } from './summary.ts';
import {
  EN_CONDITIONALS_SUMMARY,
  EN_GERUND_SUMMARY,
  EN_PAST_PERFECT_SUMMARY,
  EN_PREPOSITIONS_SUMMARY,
  EN_SENTENCE_STRUCTURE_SUMMARY,
} from './summaries-new.ts';
import { EN_SUMMARY_SECTIONS, EN_TOPICS } from './topics.ts';
import { EN_VOCABULARY } from './vocab.ts';

export { EN_CONCEPTS } from './concepts.ts';
export { EN_REVIEW_EXERCISES } from './review.ts';
export { EN_PRESENT_PERFECT_SUMMARY } from './summary.ts';
export { EN_TOPICS, EN_TOPIC_BY_ID, EN_TOPIC_BY_SLUG } from './topics.ts';
export { EN_VOCABULARY, EN_VOCAB_BY_ID } from './vocab.ts';

/**
 * Present Perfect bolum eslemesi.
 *
 * Cekirdek/uretim/karsitlik dosyalari `sectionId` tasimaz; oysa ozet
 * bolumleri (`present-perfect.v3`, `present-perfect.for-since`) ve bolum
 * pratigi (`lesson` modu `section`) vardir. Kavram kimlikleri zaten dogru
 * oldugu icin esleme burada, tek noktada yapilir: mevcut `sectionId`
 * korunur, yalnizca V3 / for-since kavramlilar bos bolume yerlesir.
 */
const PP_FORSINCE_CONCEPTS = new Set(['pp.for-since.rule', 'pp.for-since.states']);
const PP_V3_CONCEPTS = new Set([
  'pp.v3.irregular-core',
  'pp.v3.regular',
  'pp.v3.v1v2v3',
]);

function withPresentPerfectSections(list: Exercise[]): Exercise[] {
  return list.map((exercise) => {
    if (exercise.topicId !== 'en.present-perfect' || exercise.sectionId) return exercise;
    // Hata-odakli alistirmalar `mistakes` ozet bolumune baglidir; bolum
    // pratigine alinip ozet baglantisi bozulmaz.
    if (exercise.conceptIds.some((id) => id.startsWith('pp.mistakes.'))) return exercise;
    if (exercise.conceptIds.some((id) => PP_FORSINCE_CONCEPTS.has(id))) {
      return { ...exercise, sectionId: 'present-perfect.for-since' };
    }
    if (exercise.conceptIds.some((id) => PP_V3_CONCEPTS.has(id))) {
      return { ...exercise, sectionId: 'present-perfect.v3' };
    }
    return exercise;
  });
}

/** Ders bankası (konu havuzu) — Genel Tekrar bankası hariç. */
export const EN_LESSON_EXERCISES: Exercise[] = withPresentPerfectSections([
  ...EN_EXERCISES_CORE,
  ...EN_EXERCISES_PRODUCTION,
  ...EN_EXERCISES_CONTRAST,
  ...EN_EXERCISES_SENTENCE_STRUCTURE,
  ...EN_EXERCISES_PAST_PERFECT,
  ...EN_EXERCISES_GERUND_INFINITIVE,
  ...EN_EXERCISES_CONDITIONALS,
  ...EN_EXERCISES_PREPOSITIONS,
  ...EN_EXERCISES_WEEK1_PLAN,
  ...EN_EXERCISES_WEEK1_DEPTH,
]);

/** Kümülatif İngilizce Genel Tekrar bankası. */
export const EN_REVIEW_BANK: Exercise[] = [...EN_REVIEW_EXERCISES, ...EN_REVIEW_EXERCISES_NEW];

export const EN_ALL_EXERCISES: Exercise[] = [...EN_LESSON_EXERCISES, ...EN_REVIEW_BANK];

export const enExercisesById = new Map<string, Exercise>(EN_ALL_EXERCISES.map((exercise) => [exercise.id, exercise]));

export const enConcepts: Concept[] = [...EN_CONCEPTS];
export const enConceptsById = new Map(enConcepts.map((concept) => [concept.id, concept]));

/* ------------------------------------------------------------------ */
/* Müfredat haritası (türetilmiş)                                       */
/* ------------------------------------------------------------------ */

const ESTIMATED_MINUTES: Record<string, number> = {
  'en.present-perfect': 150,
  'en.sentence-structure': 160,
  'en.past-perfect': 140,
  'en.gerund-infinitive': 140,
  'en.conditionals': 150,
  'en.prepositions-collocations': 140,
};

function buildEnTopics(): CurriculumTopic[] {
  return EN_TOPICS.map((def, order) => {
    const lesson = EN_LESSON_EXERCISES.filter((exercise) => exercise.topicId === def.id);
    return {
      id: def.id,
      slug: def.slug,
      title: def.title,
      emoji: def.emoji,
      description: def.description,
      keywords: def.keywords,
      order,
      sectionIds: EN_SUMMARY_SECTIONS.filter((section) => section.topicId === def.id).map((section) => section.id),
      conceptIds: EN_CONCEPTS.filter((concept) => concept.topicId === def.id).map((concept) => concept.id),
      exerciseIds: lesson.map((exercise) => exercise.id),
      secondaryExerciseIds: [],
      reviewExerciseIds: EN_REVIEW_BANK.filter(
        (exercise) => exercise.topicId === def.id || exercise.secondaryTopicIds?.includes(def.id),
      ).map((exercise) => exercise.id),
      estimatedMinutes: ESTIMATED_MINUTES[def.id] ?? 120,
    };
  });
}

export const enTopics: CurriculumTopic[] = buildEnTopics();
export const enTopicsById = new Map(enTopics.map((topic) => [topic.id, topic]));
export const enTopicsBySlug = new Map(enTopics.map((topic) => [topic.slug, topic]));

/* ------------------------------------------------------------------ */
/* Özetler                                                              */
/* ------------------------------------------------------------------ */

export const enSummaries: TopicSummary[] = [
  EN_PRESENT_PERFECT_SUMMARY,
  EN_SENTENCE_STRUCTURE_SUMMARY,
  EN_PAST_PERFECT_SUMMARY,
  EN_GERUND_SUMMARY,
  EN_CONDITIONALS_SUMMARY,
  EN_PREPOSITIONS_SUMMARY,
];
export const enSummariesByTopic = new Map(enSummaries.map((summary) => [summary.topicId, summary]));

export const enSectionsById = new Map<string, SummarySection>(
  enSummaries.flatMap((summary) => summary.sections.map((section) => [section.id, section] as const)),
);

export const enReviewSummary: ReviewSummary = {
  title: 'Genel Tekrar Özeti — English',
  intro: ['Altı konunun sıkıştırılmış tekrarı: Present Perfect, Sentence Structure, Past Perfect, Gerund/Infinitive, Conditionals, Prepositions.'],
  estimatedReadingMinutes: 14,
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
      id: 'genel-en.sentence-structure',
      topicId: 'en.sentence-structure',
      title: 'Sentence Structure',
      conceptIds: ['ss.svo.core', 'ss.place-time.order', 'ss.questions.indirect'],
      blocks: [
        { kind: 'paragraph', text: 'SVO + yer + zaman: I study English every evening. They study in the library every evening. Dolaylı soru: Do you know where the bank is? (where the bank it is ❌).' },
      ],
      warnings: [],
      examples: [{ german: 'Do you know where the bank is?', turkish: 'Bankanın nerede olduğunu biliyor musun?' }],
      pronunciation: [],
    },
    {
      id: 'genel-en.past-perfect',
      topicId: 'en.past-perfect',
      title: 'Past Perfect',
      conceptIds: ['ppf.formula.core', 'ppf.timeline.earlier', 'ppf.by-time.before'],
      blocks: [
        { kind: 'paragraph', text: 'Önce olan had + V3: The film had started before we arrived. By the time we arrived, the film had started. (has started ❌).' },
      ],
      warnings: [],
      examples: [{ german: 'By the time we arrived, the film had started.', turkish: 'Vardığımızda film başlamıştı.' }],
      pronunciation: [],
    },
    {
      id: 'genel-en.gerund-infinitive',
      topicId: 'en.gerund-infinitive',
      title: 'Gerund & Infinitive',
      conceptIds: ['gi.gerund.chunks', 'gi.infinitive.chunks', 'gi.look-forward.doing'],
      blocks: [
        { kind: 'paragraph', text: 'Chunk: enjoy doing, decide to do, look forward to doing. enjoy to visit ❌, decide take ❌, look forward to see ❌.' },
      ],
      warnings: [],
      examples: [{ german: 'I look forward to seeing you.', turkish: 'Seni görmeyi dört gözle bekliyorum.' }],
      pronunciation: [],
    },
    {
      id: 'genel-en.conditionals',
      topicId: 'en.conditionals',
      title: 'Conditionals',
      conceptIds: ['cond.zero-first.rule', 'cond.second.formula'],
      blocks: [
        { kind: 'paragraph', text: 'Second: If + Past, would + V1. If I had more time, I would study more. If içinde would olmaz: If I would have ❌.' },
      ],
      warnings: [],
      examples: [{ german: 'If I had more time, I would study more English.', turkish: 'Daha çok zamanım olsaydı daha çok çalışırdım.' }],
      pronunciation: [],
    },
    {
      id: 'genel-en.prepositions',
      topicId: 'en.prepositions-collocations',
      title: 'Prepositions & Collocations',
      conceptIds: ['pc.chunks-a.core', 'pc.chunks-b.core', 'pc.chunks-c.core'],
      blocks: [
        { kind: 'paragraph', text: 'Öbekler: interested in, pay attention to, believe in myself. interested for ❌, give attention ❌, believe myself ❌.' },
      ],
      warnings: [],
      examples: [{ german: 'Pay attention to the teacher.', turkish: 'Öğretmene dikkat et.' }],
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
        { kind: 'paragraph', text: 'Günlük kalıplar: Have you ever…? / I have never… / I’ve just… / I haven’t … yet. / If I were you… / I look forward to…' },
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
