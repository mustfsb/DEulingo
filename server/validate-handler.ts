/**
 * `/api/validate-answer` çekirdek işleyici (Vercel + Vite dev ortak).
 *
 * Girdi: yalnızca `{ exerciseId, userAnswer }`.
 * Sunucu kanonik alıştırmayı çözer, deterministik hızlı yolu uygular
 * (yerel eşleşme varsa Jev'e hiç gitmez), uygunluk + önbellek + Jev
 * değerlendirmesi yapar. İstemciden model/yönerge/eşik alınmaz —
 * uç nokta genel bir Jev vekili (proxy) değildir.
 */

import { getCachedDecision, semanticCacheKey, setCachedDecision } from '../src/lib/semantic/cache.ts';
import { deterministicValidate } from '../src/lib/semantic/validate-answer.ts';
import { isSemanticFallbackEligible, semanticPolicyFor } from '../src/lib/semantic/policy.ts';
import { evaluateSemantic } from './jev-evaluate.ts';
import { getExercise } from './exercise-store.ts';

/** Mutlak üst sınır (politika daha küçük olabilir). */
export const ABSOLUTE_MAX_INPUT = 2000;

export interface ValidateBody {
  exerciseId?: unknown;
  userAnswer?: unknown;
}

export interface ValidateOk {
  correct: boolean;
  probability: number;
  validationSource: 'jev-semantic' | 'deterministic';
  latencyMs: number;
}

export interface RouteResult {
  status: number;
  json: unknown;
}

/* Basit süreç-içi hız sınırı: IP başına 60 istek/dakika. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 1000) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return list.length > 60;
}

export function resetRateLimit(): void {
  hits.clear();
}

export async function handleValidate(body: ValidateBody, clientIp = 'unknown'): Promise<RouteResult> {
  if (rateLimited(clientIp)) {
    return { status: 429, json: { error: 'Çok fazla istek.' } };
  }
  const exerciseId = typeof body.exerciseId === 'string' ? body.exerciseId.trim() : '';
  const userAnswer = typeof body.userAnswer === 'string' ? body.userAnswer : '';

  if (!exerciseId || exerciseId.length > 200) {
    return { status: 400, json: { error: 'Geçersiz alıştırma kimliği.' } };
  }
  if (!userAnswer.trim()) {
    return { status: 400, json: { error: 'Cevap boş olamaz.' } };
  }
  if (userAnswer.length > ABSOLUTE_MAX_INPUT) {
    return { status: 413, json: { error: 'Cevap çok büyük.' } };
  }

  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return { status: 404, json: { error: 'Alıştırma bulunamadı.' } };
  }

  const policy = semanticPolicyFor(exercise);
  if (userAnswer.length > policy.maxInputLength) {
    return { status: 413, json: { error: 'Cevap bu alıştırma için çok büyük.' } };
  }

  // Sunucu tarafı deterministik hızlı yol: yerelde doğruysa Jev'e gitme.
  const local = deterministicValidate(exercise, userAnswer);
  if (local.status === 'correct' || local.status === 'minor-typo') {
    return {
      status: 200,
      json: {
        correct: true,
        probability: 1,
        validationSource: 'deterministic',
        latencyMs: 0,
      } satisfies ValidateOk,
    };
  }

  if (!isSemanticFallbackEligible(exercise, userAnswer)) {
    return {
      status: 200,
      json: {
        correct: false,
        probability: 0,
        validationSource: 'deterministic',
        latencyMs: 0,
      } satisfies ValidateOk,
    };
  }

  const key = semanticCacheKey({
    exerciseId: exercise.id,
    expectedAnswer: exercise.answer ?? '',
    acceptedAnswers: exercise.acceptedAnswers,
    userAnswer,
  });
  const cached = getCachedDecision(key);
  if (cached) {
    return {
      status: 200,
      json: {
        correct: cached.accepted,
        probability: cached.probability,
        validationSource: 'jev-semantic',
        latencyMs: 0,
      } satisfies ValidateOk,
    };
  }

  const started = Date.now();
  try {
    const evaluation = await evaluateSemantic(exercise, userAnswer);
    // Yalnızca başarılı değerlendirmeler önbelleğe yazılır.
    setCachedDecision(key, { probability: evaluation.probability, accepted: evaluation.accepted });
    return {
      status: 200,
      json: {
        correct: evaluation.accepted,
        probability: evaluation.probability,
        validationSource: 'jev-semantic',
        latencyMs: Date.now() - started,
      } satisfies ValidateOk,
    };
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : (error as Error).message;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[validate-answer] jev failed (${message}) exercise=${exercise.id}`);
    }
    const missingKey = message.includes('AI_GATEWAY_API_KEY');
    return {
      status: missingKey ? 503 : 502,
      json: { error: 'Semantik değerlendirme şu anda kullanılamıyor.' },
    };
  }
}
