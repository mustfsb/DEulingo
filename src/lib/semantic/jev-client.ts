/**
 * Tarayıcı → sunucu Jev istemcisi.
 *
 * Sözleşme: istemci yalnızca `{ exerciseId, userAnswer }` gönderir.
 * Beklenen cevap, politika, model adı, eşik istemciden alınmaz;
 * sunucu bunları kanonik veriden türetir (güvenlik §14).
 * API anahtarı tarayıcıya hiç inmez.
 */

import { JEV_TIMEOUT_MS } from './threshold';

export interface JevServerDecision {
  correct: boolean;
  probability: number;
  validationSource: 'jev-semantic';
  latencyMs: number;
}

function isDecision(value: unknown): value is { correct: boolean; probability: number } {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v['correct'] === 'boolean' && typeof v['probability'] === 'number';
}

export async function fetchJevDecision(
  exerciseId: string,
  userAnswer: string,
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<JevServerDecision> {
  const timeoutMs = options.timeoutMs ?? JEV_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch('/api/validate-answer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ exerciseId, userAnswer }),
      signal: options.signal ?? controller.signal,
    });
    if (!response.ok) {
      throw new Error(`validate-answer failed: ${response.status}`);
    }
    const parsed: unknown = await response.json();
    if (!isDecision(parsed)) throw new Error('malformed validate-answer response');
    if (!Number.isFinite(parsed.probability) || parsed.probability < 0 || parsed.probability > 1) {
      throw new Error('invalid probability');
    }
    return {
      correct: parsed.correct,
      probability: parsed.probability,
      validationSource: 'jev-semantic',
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}
