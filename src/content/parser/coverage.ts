/**
 * Kavram kapsamı doğrulaması.
 *
 * Amaç: "Konu özetini çalışan biri, açıklaması olmayan bir bilgiyi soran
 * alıştırmayla karşılaşmamalı."
 *
 * Aşağıdakiler HATA'dır (senkron/derleme kırmızı yanar):
 *   - bilinmeyen kavrama ya da konuya atıf
 *   - özet bölümünde karşılığı olmayan kavram
 *   - öğrenilmiş bir kavramın öğrenilmemiş (`planned`) ön koşula dayanması
 */

import type {
  Concept,
  ConceptCoverage,
  ContentWarning,
  Exercise,
  SummarySection,
  TopicSummary,
} from '../types.ts';
import { TOPIC_BY_ID } from '../curriculum/topics.ts';
import { sectionText } from './summary.ts';

export type { ConceptCoverage };

type AnchoredConcept = Concept & { anchor: string };

/** Metin karşılaştırması: markdown işaretlemesi ve boşluk farklarını yok sayar. */
function normalize(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('tr');
}

export interface CoverageInput {
  exercises: Exercise[];
  concepts: AnchoredConcept[];
  summaries: TopicSummary[];
}

export interface CoverageResult {
  warnings: ContentWarning[];
  coverage: ConceptCoverage[];
}

export function isLearned(concept: Pick<Concept, 'status'> | undefined): boolean {
  return (concept?.status ?? 'learned') === 'learned';
}

export function validateCoverage({ exercises, concepts, summaries }: CoverageInput): CoverageResult {
  const warnings: ContentWarning[] = [];
  const conceptIndex = new Map(concepts.map((item) => [item.id, item]));

  const sections = new Map<string, SummarySection>();
  for (const summary of summaries) for (const section of summary.sections) sections.set(section.id, section);
  const haystack = new Map<string, string>();
  for (const [id, section] of sections) haystack.set(id, normalize(sectionText(section)));

  /* -- 1) Her kavramın özet karşılığı var mı? ---------------------- */
  const covered = new Set<string>();
  for (const concept of concepts) {
    if (!TOPIC_BY_ID.has(concept.topicId)) {
      warnings.push({ level: 'error', code: 'unknown-topic', message: `Kavramın konusu kayıtlı değil: ${concept.topicId}`, ref: concept.id });
      continue;
    }
    const text = haystack.get(concept.sectionId);
    if (text === undefined) {
      warnings.push({
        level: 'error',
        code: 'concept-without-summary',
        message: `"${concept.label}" kavramının özet bölümü yok: ${concept.sectionId}`,
        ref: concept.id,
      });
      continue;
    }
    if (!text.includes(normalize(concept.anchor))) {
      warnings.push({
        level: 'error',
        code: 'concept-without-summary',
        message:
          `"${concept.label}" kavramı için "${concept.sectionId}" bölümünde açıklama bulunamadı ` +
          `(aranan: "${concept.anchor}"). Kaynak değişmişse anchor güncellenmeli.`,
        ref: concept.id,
      });
      continue;
    }
    covered.add(concept.id);
  }

  /* -- 2) Ön koşullar --------------------------------------------- */
  for (const concept of concepts) {
    for (const prerequisite of concept.prerequisites ?? []) {
      const target = conceptIndex.get(prerequisite);
      if (!target) {
        warnings.push({ level: 'error', code: 'unknown-prerequisite', message: `Tanımsız ön koşul: ${prerequisite}`, ref: concept.id });
      } else if (isLearned(concept) && !isLearned(target)) {
        warnings.push({
          level: 'error',
          code: 'prerequisite-not-learned',
          message: `Öğrenilmiş kavram, henüz öğrenilmemiş bir ön koşula dayanıyor (${prerequisite}).`,
          ref: concept.id,
        });
      }
    }
  }

  /* -- 3) Alıştırma → kavram / konu bağları ---------------------- */
  const stats = new Map<string, ConceptCoverage>();
  for (const concept of concepts) {
    stats.set(concept.id, {
      topicId: concept.topicId,
      sectionId: concept.sectionId,
      conceptId: concept.id,
      label: concept.label,
      exercises: { easy: 0, medium: 0, hard: 0 },
      summaryCovered: covered.has(concept.id),
    });
  }

  for (const exercise of exercises) {
    if (!TOPIC_BY_ID.has(exercise.topicId)) {
      warnings.push({ level: 'error', code: 'unknown-topic', message: `Alıştırmanın konusu kayıtlı değil: ${exercise.topicId}`, ref: exercise.id });
    }
    for (const secondary of exercise.secondaryTopicIds ?? []) {
      if (!TOPIC_BY_ID.has(secondary)) {
        warnings.push({ level: 'error', code: 'unknown-topic', message: `İkincil konu kayıtlı değil: ${secondary}`, ref: exercise.id });
      }
    }
    if (!exercise.conceptIds.length) {
      warnings.push({ level: 'warn', code: 'missing-concepts', message: `Alıştırma hiçbir kavrama bağlı değil.`, ref: exercise.id });
      continue;
    }
    for (const conceptId of exercise.conceptIds) {
      const concept = conceptIndex.get(conceptId);
      if (!concept) {
        warnings.push({
          level: 'error',
          code: 'unknown-concept',
          message: `Alıştırma kayıtlı olmayan bir kavrama atıfta bulunuyor: ${conceptId}`,
          ref: exercise.id,
        });
        continue;
      }
      if (!covered.has(conceptId)) {
        warnings.push({
          level: 'error',
          code: 'exercise-without-summary',
          message: `Alıştırma "${concept.label}" kavramını istiyor ama bu kavramın özet açıklaması doğrulanamadı.`,
          ref: exercise.id,
        });
      }
      const entry = stats.get(conceptId);
      if (entry) entry.exercises[exercise.difficulty] += 1;
    }
  }

  /* -- 4) Pratiği olmayan kavramlar (uyarı) ----------------------- */
  for (const entry of stats.values()) {
    const total = entry.exercises.easy + entry.exercises.medium + entry.exercises.hard;
    if (total === 0) {
      warnings.push({ level: 'warn', code: 'concept-without-practice', message: `"${entry.label}" kavramı için hiç alıştırma yok.`, ref: entry.conceptId });
    }
  }

  return { warnings, coverage: [...stats.values()] };
}

/**
 * Aynı sorunun/cevabın aynı havuzda tekrar etmediğini doğrular.
 * Havuz = (ders bankası | Genel Tekrar bankası) × birincil konu.
 */
export function validateNoDuplicates(exercises: Exercise[]): ContentWarning[] {
  const warnings: ContentWarning[] = [];
  const prompts = new Map<string, string>();
  const answers = new Map<string, string>();
  const normalizedPairs = new Map<string, string>();

  for (const exercise of exercises) {
    const pool = `${exercise.reviewOnly ? 'review' : 'lesson'}|${exercise.topicId}`;
    const promptKey = normalize(`${pool}|${exercise.type}|${exercise.prompt ?? ''}|${exercise.instruction}`);
    const previous = prompts.get(promptKey);
    if (previous) {
      warnings.push({ level: 'warn', code: 'duplicate-prompt', message: `Aynı soru metni tekrar ediyor (${previous}).`, ref: exercise.id });
    }
    prompts.set(promptKey, exercise.id);

    if (exercise.answer && exercise.prompt) {
      const answerKey = normalize(`${pool}|${exercise.type}|${exercise.prompt}|${exercise.answer}`);
      const earlier = answers.get(answerKey);
      if (earlier) {
        warnings.push({ level: 'warn', code: 'duplicate-answer', message: `Aynı soru/cevap çifti tekrar ediyor (${earlier}).`, ref: exercise.id });
      }
      answers.set(answerKey, exercise.id);

      // Etkileşim türü değişse bile aynı soru-cevap çifti yeni öğrenme
      // kanıtı değildir; Tam Çalışma'yı sahte biçimde büyütmesin.
      const normalizedPairKey = normalize(`${pool}|${exercise.prompt}|${exercise.answer}`);
      const first = normalizedPairs.get(normalizedPairKey);
      if (first) {
        warnings.push({
          level: 'error',
          code: 'near-duplicate-exercise',
          message: `Normalize edilmiş soru/cevap çifti tekrar ediyor (${first}).`,
          ref: exercise.id,
        });
      }
      normalizedPairs.set(normalizedPairKey, exercise.id);
    }
  }
  return warnings;
}
