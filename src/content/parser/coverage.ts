/**
 * Kavram kapsami dogrulamasi.
 *
 * Amac §23–24: "Dersleri izleyen ve Özet bölümünü çalışan biri, açıklaması
 * olmayan bir bilgiyi soran alıştırmayla karşılaşmamalı."
 *
 * Bu yuzden asagidakiler HATA'dir (senkron/derleme kirmizi yanar):
 *   - bilinmeyen kavrama atif
 *   - ozette karsiligi olmayan kavram
 *   - gelecekteki bir gunun kavramini isteyen alistirma
 */

import type {
  Concept,
  ConceptCoverage,
  ContentWarning,
  Exercise,
  SummaryDay,
  SummaryTopic,
} from '../types.ts';
import { topicText } from './summary.ts';

export type { ConceptCoverage };

type AnchoredConcept = Concept & { anchor: string };

/** Metin karsilastirmasi: markdown isaretlemesi ve bosluk farklarini yok sayar. */
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
  summaries: SummaryDay[];
  missingTopicIds: string[];
}

export interface CoverageResult {
  warnings: ContentWarning[];
  coverage: ConceptCoverage[];
}

export function validateCoverage({
  exercises,
  concepts,
  summaries,
  missingTopicIds,
}: CoverageInput): CoverageResult {
  const warnings: ContentWarning[] = [];
  const conceptIndex = new Map(concepts.map((item) => [item.id, item]));

  const topics = new Map<string, SummaryTopic>();
  for (const day of summaries) {
    for (const topic of day.topics) topics.set(topic.id, topic);
  }
  const topicHaystack = new Map<string, string>();
  for (const [id, topic] of topics) topicHaystack.set(id, normalize(topicText(topic)));

  for (const topicId of missingTopicIds) {
    warnings.push({
      level: 'error',
      code: 'summary-topic-missing',
      message: `Kayıtlı özet konusu kaynak dosyada bulunamadı.`,
      ref: topicId,
    });
  }

  /* -- 1) Her kavramin ozet karsiligi var mi? ---------------------- */
  const covered = new Set<string>();
  for (const concept of concepts) {
    const haystack = topicHaystack.get(concept.topicId);
    if (haystack === undefined) {
      warnings.push({
        level: 'error',
        code: 'concept-without-summary',
        message: `"${concept.label}" kavramının özet konusu yok: ${concept.topicId}`,
        ref: concept.id,
      });
      continue;
    }
    if (!haystack.includes(normalize(concept.anchor))) {
      warnings.push({
        level: 'error',
        code: 'concept-without-summary',
        message:
          `"${concept.label}" kavramı için "${concept.topicId}" özetinde açıklama bulunamadı ` +
          `(aranan: "${concept.anchor}"). Kaynak değişmişse anchor güncellenmeli ya da ` +
          `summary-augmentations.ts içine ek açıklama yazılmalı.`,
        ref: concept.id,
      });
      continue;
    }
    covered.add(concept.id);
  }

  /* -- 2) Onkosullar --------------------------------------------- */
  for (const concept of concepts) {
    for (const prerequisite of concept.prerequisites ?? []) {
      const target = conceptIndex.get(prerequisite);
      if (!target) {
        warnings.push({
          level: 'error',
          code: 'unknown-prerequisite',
          message: `Tanımsız ön koşul: ${prerequisite}`,
          ref: concept.id,
        });
      } else if (target.day > concept.day) {
        warnings.push({
          level: 'error',
          code: 'prerequisite-after',
          message: `Ön koşul daha sonraki bir günde öğretiliyor (${target.day}. Gün).`,
          ref: concept.id,
        });
      }
    }
  }

  /* -- 3) Alistirma → kavram baglari ------------------------------ */
  const stats = new Map<string, ConceptCoverage>();
  for (const concept of concepts) {
    stats.set(concept.id, {
      day: concept.day,
      track: (concept.track as import('../types.ts').LearningTrack | undefined) ?? 'normal',
      topicId: concept.topicId,
      conceptId: concept.id,
      label: concept.label,
      exercises: { easy: 0, medium: 0, hard: 0 },
      summaryCovered: covered.has(concept.id),
    });
  }

  for (const exercise of exercises) {
    if (!exercise.conceptIds.length) {
      warnings.push({
        level: 'warn',
        code: 'missing-concepts',
        message: `Alıştırma hiçbir kavrama bağlı değil.`,
        ref: exercise.id,
      });
      continue;
    }
    // Track isolation: private exercise must reference private concepts (future days may cross tracks via prerequisites but base isolation)


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
      if (concept.day > exercise.day) {
        warnings.push({
          level: 'error',
          code: 'knowledge-jump',
          message:
            `${exercise.day}. Gün alıştırması ${concept.day}. Gün'de öğretilen ` +
            `"${concept.label}" kavramını gerektiriyor.`,
          ref: exercise.id,
        });
      }
      if (!covered.has(conceptId)) {
        warnings.push({
          level: 'error',
          code: 'exercise-without-summary',
          message:
            `Alıştırma "${concept.label}" kavramını istiyor ama bu kavramın ` +
            `özet açıklaması doğrulanamadı.`,
          ref: exercise.id,
        });
      }
      const entry = stats.get(conceptId);
      if (entry) entry.exercises[exercise.difficulty] += 1;
    }
  }

  /* -- 4) Pratigi olmayan kavramlar (uyari) ----------------------- */
  for (const entry of stats.values()) {
    const total = entry.exercises.easy + entry.exercises.medium + entry.exercises.hard;
    if (total === 0) {
      warnings.push({
        level: 'warn',
        code: 'concept-without-practice',
        message: `"${entry.label}" kavramı için hiç alıştırma yok.`,
        ref: entry.conceptId,
      });
    }
  }

  return { warnings, coverage: [...stats.values()] };
}

/** Ayni sorunun/cevabin tekrar etmedigini dogrular (§60). */
export function validateNoDuplicates(exercises: Exercise[]): ContentWarning[] {
  const warnings: ContentWarning[] = [];
  const prompts = new Map<string, string>();
  const answers = new Map<string, string>();
  const normalizedPairs = new Map<string, string>();

  for (const exercise of exercises) {
    const promptKey = normalize(`${exercise.track ?? 'normal'}|${exercise.day}|${exercise.type}|${exercise.prompt ?? ''}|${exercise.instruction}`);
    const previous = prompts.get(promptKey);
    if (previous) {
      warnings.push({
        level: 'warn',
        code: 'duplicate-prompt',
        message: `Aynı soru metni tekrar ediyor (${previous}).`,
        ref: exercise.id,
      });
    }
    prompts.set(promptKey, exercise.id);

    // Ayni gun + ayni tip + ayni cevap + ayni soru koku → gercek kopya.
    if (exercise.answer && exercise.prompt) {
      const answerKey = normalize(`${exercise.track ?? 'normal'}|${exercise.day}|${exercise.type}|${exercise.prompt}|${exercise.answer}`);
      const earlier = answers.get(answerKey);
      if (earlier) {
        warnings.push({
          level: 'warn',
          code: 'duplicate-answer',
          message: `Aynı soru/cevap çifti tekrar ediyor (${earlier}).`,
          ref: exercise.id,
        });
      }
      answers.set(answerKey, exercise.id);

      // Etkileşim türü değişse bile aynı soru-cevap çifti yeni öğrenme
      // kanıtı değildir; Tam Çalışma'yı sahte biçimde büyütmesin.
      const normalizedPairKey = normalize(`${exercise.track ?? 'normal'}|${exercise.day}|${exercise.prompt}|${exercise.answer}`);
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
