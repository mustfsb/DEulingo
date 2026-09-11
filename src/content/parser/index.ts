/**
 * İçerik boru hattı (konu tabanlı):
 *   Konu Özetleri.md + Genel Tekrar Özet.md + yazılmış katman
 *     → özetler → alıştırmalar (konu etiketleri türetilir) → doğrulama → JSON
 */

import {
  CONTENT_SCHEMA_VERSION,
  type Concept,
  type ContentBundle,
  type ContentWarning,
  type CurriculumTopic,
  type Exercise,
  type ReviewSummary,
  type TopicSummary,
} from '../types.ts';
import type { AuthoredExercise } from '../authored/types.ts';
import { SECTION_BY_ID, TOPICS, TOPIC_BY_ID, sectionsForTopic } from '../curriculum/topics.ts';
import { buildAuthoredExercise } from './metadata.ts';
import { buildReviewSummary, buildTopicSummaries } from './summary.ts';
import { validateCoverage, validateNoDuplicates, type ConceptCoverage } from './coverage.ts';
import { stableHash } from './text.ts';

export interface SourceFile {
  /** Sadece dosya adi — kaynak izlenebilirligi icin saklanir. */
  name: string;
  markdown: string;
  /** `topic-summary` = kanonik konu özetleri, `review-summary` = kümülatif Genel Tekrar özeti. */
  role: 'topic-summary' | 'review-summary';
}

type AnchoredConcept = Concept & { anchor: string };

/** Yazilmis icerik katmani. */
export interface AuthoredLayer {
  concepts: AnchoredConcept[];
  exercises: AuthoredExercise[];
}

export interface ParseOptions {
  authored?: AuthoredLayer;
}

const unique = <T>(items: T[]) => [...new Set(items)];

/**
 * Alıştırmanın özet bölümünü ve ikincil konularını türetir.
 * - Bölüm: açık `sectionId` → birincil konudaki ilk kavramın bölümü → ilk kavramın bölümü.
 * - İkincil konular: açık etiketler + kavramların konuları + bölümün ilişkili konuları.
 */
export function enrichExercise(exercise: Exercise, conceptIndex: Map<string, Concept>): Exercise {
  const concepts = exercise.conceptIds.map((id) => conceptIndex.get(id)).filter((item): item is Concept => Boolean(item));
  const sectionId =
    exercise.sectionId ??
    concepts.find((concept) => concept.topicId === exercise.topicId)?.sectionId ??
    concepts[0]?.sectionId;
  const related = sectionId ? (SECTION_BY_ID.get(sectionId)?.relatedTopicIds ?? []) : [];
  const secondary = unique([
    ...(exercise.secondaryTopicIds ?? []),
    ...concepts.map((concept) => concept.topicId),
    ...related,
  ]).filter((topicId) => topicId !== exercise.topicId);

  const next: Exercise = { ...exercise, topic: TOPIC_BY_ID.get(exercise.topicId)?.title ?? exercise.topicId };
  if (sectionId) next.sectionId = sectionId;
  if (secondary.length) next.secondaryTopicIds = secondary;
  else delete next.secondaryTopicIds;
  return next;
}

export function parseContent(files: SourceFile[], options: ParseOptions = {}): ContentBundle {
  const warnings: ContentWarning[] = [];
  const authored = options.authored;
  const concepts = authored?.concepts ?? [];
  const conceptIndex = new Map<string, Concept>(concepts.map((concept) => [concept.id, concept]));

  const conceptsBySection = new Map<string, string[]>();
  for (const concept of concepts) {
    conceptsBySection.set(concept.sectionId, [...(conceptsBySection.get(concept.sectionId) ?? []), concept.id]);
  }

  // 1) Özetler.
  let summaries: TopicSummary[] = [];
  let reviewSummary: ReviewSummary | undefined;
  const topicFiles = files.filter((file) => file.role === 'topic-summary');
  if (!topicFiles.length) {
    warnings.push({ level: 'error', code: 'no-topic-summary', message: 'Kanonik konu özeti dosyası (Konu Özetleri.md) okunmadı.' });
  }
  for (const file of topicFiles) {
    const built = buildTopicSummaries(file.markdown, conceptsBySection);
    summaries = built.summaries;
    warnings.push(...built.warnings);
  }
  for (const file of files.filter((item) => item.role === 'review-summary')) {
    const built = buildReviewSummary(file.markdown);
    reviewSummary = built.summary;
    warnings.push(...built.warnings);
  }

  // 2) Alıştırmalar — konu başlığı, bölüm ve ikincil konular türetilir.
  const exercises: Exercise[] = (authored?.exercises ?? [])
    .map(buildAuthoredExercise)
    .map((exercise) => enrichExercise(exercise, conceptIndex));

  warnings.push(...validateExercises(exercises));

  // 3) Kavram / özet kapsamı.
  let coverage: ConceptCoverage[] = [];
  if (authored) {
    const result = validateCoverage({ exercises, concepts, summaries });
    warnings.push(...result.warnings, ...validateNoDuplicates(exercises));
    coverage = result.coverage;
  }

  // 4) Müfredat haritası — konu başına türetilmiş üyelikler.
  const topics: CurriculumTopic[] = TOPICS.map((def, order) => {
    const lesson = exercises.filter((exercise) => !exercise.reviewOnly);
    const primary = lesson.filter((exercise) => exercise.topicId === def.id);
    const secondary = lesson.filter((exercise) => exercise.topicId !== def.id && exercise.secondaryTopicIds?.includes(def.id));
    const review = exercises.filter(
      (exercise) => exercise.reviewOnly && (exercise.topicId === def.id || exercise.secondaryTopicIds?.includes(def.id)),
    );
    return {
      id: def.id,
      slug: def.slug,
      title: def.title,
      emoji: def.emoji,
      description: def.description,
      keywords: def.keywords,
      order,
      sectionIds: sectionsForTopic(def.id).map((section) => section.id),
      conceptIds: concepts.filter((concept) => concept.topicId === def.id).map((concept) => concept.id),
      exerciseIds: primary.map((exercise) => exercise.id),
      secondaryExerciseIds: secondary.map((exercise) => exercise.id),
      reviewExerciseIds: review.map((exercise) => exercise.id),
      estimatedMinutes: Math.max(
        3,
        Math.round(primary.reduce((total, item) => total + (item.estimatedSeconds ?? 25), 0) / 60),
      ),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    schemaVersion: CONTENT_SCHEMA_VERSION,
    contentVersion: contentVersionOf(exercises),
    sourceFiles: files.map((file) => file.name),
    topics,
    exercises,
    concepts: concepts.map(({ anchor: _anchor, ...rest }) => rest),
    summaries,
    ...(reviewSummary ? { reviewSummary } : {}),
    warnings,
    coverage,
  };
}

function contentVersionOf(exercises: Exercise[]): string {
  const signature = exercises
    .map((exercise) => [
      exercise.id,
      exercise.topicId,
      exercise.answer ?? '',
      ...(exercise.wordBank?.acceptedSequences.map((sequence) => sequence.join(' ')) ?? []),
    ].join(':'))
    .sort()
    .join('|');
  return `${CONTENT_SCHEMA_VERSION}.${stableHash(signature)}`;
}

function normalizeWordBankToken(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ');
}

export function validateExercises(exercises: Exercise[]): ContentWarning[] {
  const warnings: ContentWarning[] = [];
  const seenIds = new Set<string>();
  const metaQuestion = /video|videoda|videolar|sıradaki|sonraki\s+(?:video|ders)/i;
  const dayMeta = /\d+\s*\.\s*G[üu]n/u;

  for (const exercise of exercises) {
    if (seenIds.has(exercise.id)) {
      warnings.push({ level: 'error', code: 'duplicate-id', message: `Aynı ID iki kez üretildi.`, ref: exercise.id });
    }
    seenIds.add(exercise.id);

    const surface = [exercise.instruction, exercise.prompt, exercise.explanation, exercise.hint].filter(Boolean).join(' ');
    if (metaQuestion.test(surface)) {
      warnings.push({
        level: 'error',
        code: 'non-learning-meta-question',
        message: 'Alıştırma video/sonraki ders bilgisini değil, Almanca kullanımını ölçmeli.',
        ref: exercise.id,
      });
    }
    // Konu modeli: öğrenciye görünen metinde ders günü dili kalmamalı.
    if (dayMeta.test(surface)) {
      warnings.push({
        level: 'error',
        code: 'day-language',
        message: 'Alıştırma metni ders gününe atıf yapıyor ("N. Gün"); konu adıyla değiştir.',
        ref: exercise.id,
      });
    }

    const needsAnswer = !['spoken', 'matching'].includes(exercise.type);
    if (needsAnswer && !exercise.answer) {
      warnings.push({
        level: 'error',
        code: 'missing-answer',
        message: `Cevabı olmayan alıştırma: "${exercise.prompt ?? exercise.instruction}".`,
        ref: exercise.id,
      });
    }
    if (exercise.type === 'multiple-choice') {
      if (!exercise.options?.length) {
        warnings.push({ level: 'error', code: 'missing-options', message: `Çoktan seçmeli alıştırmanın seçenekleri yok.`, ref: exercise.id });
      } else if (exercise.answer && !exercise.options.includes(exercise.answer)) {
        warnings.push({
          level: 'error',
          code: 'answer-not-in-options',
          message: `Doğru cevap seçenekler arasında değil: "${exercise.answer}".`,
          ref: exercise.id,
        });
      }
    }
    if ((exercise.type === 'sentence-builder' || exercise.type === 'ordering') && (!exercise.words || exercise.words.length < 2)) {
      warnings.push({ level: 'error', code: 'missing-words', message: `Cümle kurma alıştırmasının kelime çipleri yok.`, ref: exercise.id });
    }
    if (exercise.type === 'matching' && (!exercise.pairs || exercise.pairs.length < 2)) {
      warnings.push({ level: 'error', code: 'missing-pairs', message: `Eşleştirme alıştırmasının çiftleri eksik.`, ref: exercise.id });
    }
    if (exercise.wordBank) {
      const available = new Map<string, number>();
      for (const token of exercise.wordBank.tokens) {
        const key = normalizeWordBankToken(token.text);
        available.set(key, (available.get(key) ?? 0) + 1);
      }
      const impossible = exercise.wordBank.acceptedSequences.find((sequence) => {
        const required = new Map<string, number>();
        for (const word of sequence) {
          const key = normalizeWordBankToken(word);
          required.set(key, (required.get(key) ?? 0) + 1);
        }
        return [...required].some(([word, needed]) => (available.get(word) ?? 0) < needed);
      });
      if (impossible) {
        warnings.push({
          level: 'error',
          code: 'word-bank-unbuildable-answer',
          message: `Kabul edilen kelime-bankası cevabı kutucuklardan kurulamaz: "${impossible.join(' ')}".`,
          ref: exercise.id,
        });
      }
    }
  }
  return warnings;
}
