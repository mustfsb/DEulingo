/**
 * Jev'e gönderilen küçük, veri-en-az (data-minimizing) durum.
 *
 * Kural: tek cevap için yalnızca gerekli bağlam. Müfredat, kelime
 * veritabanı, geçmiş, profil asla gönderilmez.
 */

import type { Exercise } from '../../content/types';
import { semanticPolicyFor } from './policy';

export interface JevState {
  readonly [key: string]: string | string[];
  exerciseType: string;
  question: string;
  expectedAnswers: string[];
  userAnswer: string;
  testedConcepts: string[];
  allowedVariation: string[];
  forbiddenVariation: string[];
  sourceLanguage: 'de' | 'tr' | 'mixed';
  targetLanguage: 'de' | 'tr' | 'mixed';
}

function detectDirection(exercise: Exercise): { source: JevState['sourceLanguage']; target: JevState['targetLanguage'] } {
  const id = exercise.id;
  if (id.endsWith('-detr-type') || id.endsWith('-detr-mc')) return { source: 'de', target: 'tr' };
  if (id.endsWith('-trde-type') || id.endsWith('-trde-mc')) return { source: 'tr', target: 'de' };
  const instruction = `${exercise.instruction} ${exercise.prompt ?? ''}`;
  if (/Türkçeden Almancaya|Türkçe→Almanca|tr→de/i.test(instruction)) return { source: 'tr', target: 'de' };
  if (/Almancadan Türkçeye|Almanca→Türkçe|de→tr/i.test(instruction)) return { source: 'de', target: 'tr' };
  if (/Türkçesini (yaz|seç)/i.test(instruction)) return { source: 'de', target: 'tr' };
  if (/Almancasını/i.test(instruction)) return { source: 'tr', target: 'de' };
  return { source: 'mixed', target: 'mixed' };
}

/** Jev durumunu kanonik alıştırmadan kurar (sunucu tarafı). */
export function buildJevState(exercise: Exercise, userAnswer: string): JevState {
  const policy = semanticPolicyFor(exercise);
  const question = [exercise.instruction, exercise.prompt].filter(Boolean).join('\n').slice(0, 400);
  const expectedAnswers = [exercise.answer ?? '', ...(exercise.acceptedAnswers ?? [])]
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((s) => s.slice(0, 300));
  const direction = detectDirection(exercise);
  return {
    exerciseType: exercise.type,
    question,
    expectedAnswers,
    userAnswer: userAnswer.slice(0, policy.maxInputLength),
    testedConcepts: policy.testedConcepts.slice(0, 8),
    allowedVariation: policy.allowedVariation.slice(0, 8),
    forbiddenVariation: policy.forbiddenVariation.slice(0, 10),
    sourceLanguage: direction.source,
    targetLanguage: direction.target,
  };
}

/**
 * Tek boolean sorunun yönergesi. Dil öğrenimi için katı:
 * tested kavramlardaki farklar affedilmez.
 */
export const EQUIVALENT_QUESTION_ID = 'equivalent';

export function equivalentInstructions(state: JevState): string {
  const tested = state.testedConcepts.length ? state.testedConcepts.join(', ') : 'general meaning';
  const allowed = state.allowedVariation.length ? state.allowedVariation.join('; ') : 'harmless paraphrases';
  const forbidden = state.forbiddenVariation.length
    ? state.forbiddenVariation.join('; ')
    : 'opposite or partially wrong meaning';
  return [
    'Return true only if the learner answer should be ACCEPTED as semantically',
    'equivalent to one of the expected answers for this exact language-learning exercise.',
    `Tested concepts: ${tested}.`,
    `Allow: ${allowed}.`,
    `Reject: ${forbidden}.`,
    'Do not require literal string equality.',
    'When the exercise tests grammar (tense, case, article, person, modal, auxiliary, participle),',
    'do not forgive those differences even if the general meaning is understandable.',
  ].join(' ');
}
