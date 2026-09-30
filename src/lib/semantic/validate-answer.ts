/**
 * Merkezi cevap doğrulama: normalize → deterministik → uygunluk → Jev.
 *
 * Hızlı yol her zaman yereldir. Jev yalnızca gerçek deterministik
 * uyuşmazlıkta ve politika izin verirse çağrılır; asla deterministik
 * ile paralel/spekülatif çağrı yapılmaz (maliyet/gecikme).
 */

import type { Exercise } from '../../content/types';
import { VOCAB_BY_ID } from '../../content/vocabulary/inventory';
import { EN_VOCAB_BY_ID } from '../../content/en/vocab';
import {
  evaluateExercise,
  normalizeAnswer,
  type ExerciseInput,
  type ValidationResult,
} from '../validation';
import { validateDetrTyping, validateVocabTyping } from '../vocab/validate';
import { getCachedDecision, semanticCacheKey, setCachedDecision } from './cache';
import { fetchJevDecision } from './jev-client';
import { recordCacheHit, recordDeterministic, recordJevCall, recordJevError } from './metrics';
import { isSemanticFallbackEligible } from './policy';
import { JEV_ACCEPT_THRESHOLD, JEV_TIMEOUT_MS } from './threshold';

export type ValidationSource = 'deterministic' | 'jev-semantic';

export interface HybridResult {
  correct: boolean;
  validationSource: ValidationSource;
  /** Öğrenciye gösterilecek kanonik cevap. */
  canonicalAnswer: string;
  /** Altta yatan deterministik durum (minor-typo korunur). */
  deterministicStatus: ValidationResult['status'];
  /** Jev P(true); yalnızca başarılı semantik değerlendirmede dolu. */
  probability?: number;
  /** Belirsiz/geçici durumda muhafazakâr yanlışa düşüldü. */
  uncertain?: boolean;
  latencyMs?: number;
}

export type JevFetch = typeof fetchJevDecision;

function vocabIdOf(exercise: Exercise): string | null {
  const id = exercise.id;
  if (!id.startsWith('vocab-')) return null;
  const rest = id.slice('vocab-'.length);
  for (const suffix of ['-detr-type', '-trde-type', '-listen-type']) {
    if (rest.endsWith(suffix)) return rest.slice(0, -suffix.length);
  }
  return null;
}

/** Ders + kelime ekranlarındaki deterministik dalları tek noktada birleştirir. */
export function deterministicValidate(exercise: Exercise, input: ExerciseInput): ValidationResult {
  const vocabId = vocabIdOf(exercise);
  if (vocabId && (VOCAB_BY_ID.has(vocabId) || EN_VOCAB_BY_ID.has(vocabId)) && typeof input === 'string') {
    if (exercise.id.endsWith('-detr-type')) return validateDetrTyping(vocabId, input);
    if (exercise.id.endsWith('-trde-type') || exercise.id.endsWith('-listen-type')) {
      return validateVocabTyping(vocabId, input);
    }
  }
  return evaluateExercise(exercise, input);
}

function canonicalOf(exercise: Exercise, local: ValidationResult): string {
  return local.expected || exercise.answer || '';
}

export interface ValidateOptions {
  jevFetch?: JevFetch;
  acceptThreshold?: number;
  timeoutMs?: number;
}

/**
 * Hibrit doğrulama. `correct`/`minor-typo` yerelde bitirilir (Jev çağrılmaz).
 * `incorrect` + uygunluk → önbellek → sunucu Jev → eşik → sonuç.
 */
export async function validateAnswer(
  exercise: Exercise,
  input: ExerciseInput,
  options: ValidateOptions = {},
): Promise<HybridResult> {
  const local = deterministicValidate(exercise, input);
  const canonicalAnswer = canonicalOf(exercise, local);

  if (local.status === 'correct' || local.status === 'minor-typo') {
    recordDeterministic(true);
    return {
      correct: true,
      validationSource: 'deterministic',
      canonicalAnswer,
      deterministicStatus: local.status,
    };
  }

  recordDeterministic(false);
  const userAnswer = typeof input === 'string' ? input : '';
  if (typeof input !== 'string' || !isSemanticFallbackEligible(exercise, userAnswer)) {
    return {
      correct: false,
      validationSource: 'deterministic',
      canonicalAnswer,
      deterministicStatus: 'incorrect',
    };
  }

  const threshold = options.acceptThreshold ?? JEV_ACCEPT_THRESHOLD;
  const key = semanticCacheKey({
    exerciseId: exercise.id,
    expectedAnswer: exercise.answer ?? '',
    acceptedAnswers: exercise.acceptedAnswers,
    userAnswer,
  });
  const cached = getCachedDecision(key);
  if (cached) {
    recordCacheHit();
    const accepted = cached.probability >= threshold;
    return {
      correct: accepted,
      validationSource: 'jev-semantic',
      canonicalAnswer,
      deterministicStatus: 'incorrect',
      probability: cached.probability,
    };
  }

  const jevFetch = options.jevFetch ?? fetchJevDecision;
  const timeoutMs = options.timeoutMs ?? JEV_TIMEOUT_MS;
  const started = Date.now();
  try {
    const decision = await jevFetch(exercise.id, userAnswer, { timeoutMs });
    if (!Number.isFinite(decision.probability) || decision.probability < 0 || decision.probability > 1) {
      throw new Error('invalid Jev probability');
    }
    const accepted = decision.probability >= threshold;
    recordJevCall(Date.now() - started, accepted);
    // Yalnızca başarılı değerlendirmeler önbelleğe yazılır.
    setCachedDecision(key, { probability: decision.probability, accepted });
    return {
      correct: accepted,
      validationSource: 'jev-semantic',
      canonicalAnswer,
      deterministicStatus: 'incorrect',
      probability: decision.probability,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === 'AbortError';
    recordJevError(timeout);
    if (import.meta.env.DEV) {
      // Öğrenci cevabını loglamadan yalnızca tanı metası.
      console.warn(`[jev] fallback (${timeout ? 'timeout' : 'error'}) exercise=${exercise.id}`);
    }
    return {
      correct: false,
      validationSource: 'deterministic',
      canonicalAnswer,
      deterministicStatus: 'incorrect',
      uncertain: true,
    };
  }
}

/** Hibrit sonucu mevcut `ValidationResult` sözleşmesine indirger (olasılık sızdırmaz). */
export function hybridToValidation(exercise: Exercise, input: ExerciseInput, hybrid: HybridResult): ValidationResult {
  const normalizedInput = typeof input === 'string' ? normalizeAnswer(input) : '';
  if (hybrid.correct) {
    return { status: 'correct', expected: hybrid.canonicalAnswer, normalizedInput };
  }
  const local = deterministicValidate(exercise, input);
  return { ...local, status: 'incorrect', expected: hybrid.canonicalAnswer };
}
