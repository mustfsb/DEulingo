/**
 * Hafta 1 hata sınıflandırması (Session G8).
 *
 * Sekiz kategori: Grammar, Vocabulary, Collocation, Sentence Structure,
 * Reading, Listening, Writing, Speaking. Egzersiz hataları konudan
 * (ve kelime hatası türünden), beceri hataları beceri geçmişinden gelir.
 * Saf işlev: depolanan hiçbir şey değişmez; sayılar her seferinde türetilir.
 */

import type { UserProgress } from './storage';
import type { EnSkillsState } from './skills-storage';
import { EN_TOPIC_BY_ID } from '../content/en/topics';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { EN_LISTENING_BY_ID } from '../content/en/skills-listening';

export type MistakeCategory =
  | 'Grammar'
  | 'Vocabulary'
  | 'Collocation'
  | 'Sentence Structure'
  | 'Reading'
  | 'Listening'
  | 'Writing'
  | 'Speaking';

export const MISTAKE_CATEGORIES: MistakeCategory[] = [
  'Grammar', 'Vocabulary', 'Collocation', 'Sentence Structure', 'Reading', 'Listening', 'Writing', 'Speaking',
];

export interface MistakeBucket {
  category: MistakeCategory;
  count: number;
  /** En fazla 3 örnek (kısa metin). */
  examples: string[];
}

/** Egzersiz hatasının kategorisi (içerikte konu bulunamazsa hata türüne bakılır). */
export function categoryForExerciseMistake(topicId: string | undefined, mistakeType: string): MistakeCategory {
  if (mistakeType === 'vocabulary') return 'Vocabulary';
  if (topicId === 'en.sentence-structure') return 'Sentence Structure';
  if (topicId === 'en.prepositions-collocations') return 'Collocation';
  if (topicId && EN_TOPIC_BY_ID.has(topicId)) return 'Grammar';
  return mistakeType === 'word-order' ? 'Sentence Structure' : 'Grammar';
}

export function classifyWeekMistakes(
  progress: UserProgress,
  skills: EnSkillsState,
  topicOfExercise: (exerciseId: string) => string | undefined,
): MistakeBucket[] {
  const buckets = new Map<MistakeCategory, MistakeBucket>(
    MISTAKE_CATEGORIES.map((category) => [category, { category, count: 0, examples: [] }]),
  );
  const add = (category: MistakeCategory, amount: number, example?: string) => {
    const bucket = buckets.get(category)!;
    bucket.count += amount;
    if (example && bucket.examples.length < 3 && !bucket.examples.includes(example)) bucket.examples.push(example);
  };

  for (const record of Object.values(progress.mistakes)) {
    const topicId = topicOfExercise(record.exerciseId) ?? record.topicId;
    // Yalnızca İngilizce hafta 1 konuları (Almanca kayıtlar ayrı depodadır).
    if (topicId && !EN_TOPIC_BY_ID.has(topicId) && !record.exerciseId.startsWith('en-') && !record.exerciseId.startsWith('gr-en-')) continue;
    const weight = Math.max(1, record.count + record.typoCount);
    add(categoryForExerciseMistake(topicId, record.type), weight, record.expectedAnswer || record.prompt);
  }

  // Beceri hataları: her denemenin SON hâli (aynı pasaj/parça tekrar edilirse çift sayılmaz).
  const lastReading = new Map(skills.reading.map((attempt) => [attempt.passageId, attempt]));
  for (const attempt of lastReading.values()) {
    const passage = EN_READING_BY_ID.get(attempt.passageId);
    for (const questionId of attempt.mistakeQuestionIds) {
      const question = passage?.questions.find((q) => q.id === questionId);
      add('Reading', 1, question?.prompt);
    }
  }
  const lastListening = new Map(skills.listening.map((attempt) => [attempt.itemId, attempt]));
  for (const attempt of lastListening.values()) {
    if (!attempt.correct) add('Listening', 1, EN_LISTENING_BY_ID.get(attempt.itemId)?.transcript);
  }
  const lastWriting = new Map(skills.writing.map((entry) => [entry.taskId, entry]));
  for (const entry of lastWriting.values()) {
    for (const item of entry.feedback) {
      if (item.category === 'Collocations') add('Collocation', 1, item.message);
      else if (item.category === 'Sentence Structure') add('Sentence Structure', 1, item.message);
      else add('Writing', 1, item.message);
    }
  }
  const lastSpeaking = new Map(skills.speaking.map((entry) => [entry.promptId, entry]));
  for (const entry of lastSpeaking.values()) {
    if (entry.selfScore === 'needs-work') add('Speaking', 1, entry.transcript);
  }

  return MISTAKE_CATEGORIES.map((category) => buckets.get(category)!);
}
