/**
 * Sunucu tarafı Jev çağrısı (Node-only).
 *
 * Üretim API şekli (kurulu `ai@7` ile doğrulandı):
 *   import { experimental_evaluate } from 'ai';
 *   await experimental_evaluate({
 *     model: 'typesafe-ai/jev',           // Gateway değerlendirme modeli
 *     state: { ... },                     // küçük, ilgili bağlam
 *     questions: { equivalent: { type: 'boolean', instructions } },
 *     providerOptions: { gateway: { zeroDataRetention: true } },
 *   });
 * Sonuç: answers.equivalent.probability (P(true), [0,1] aralığında).
 *
 * Jev bir üretim (generation) modeli değildir; generateText/streamText
 * KULLANILMAZ. Tek iş: boolean semantik-eşdeğerlik kararı.
 */

import { buildJevState, equivalentInstructions } from '../src/lib/semantic/jev-state.ts';
import { JEV_ACCEPT_THRESHOLD, JEV_MODEL_ID, JEV_TIMEOUT_MS } from '../src/lib/semantic/threshold.ts';
import type { Exercise } from '../src/content/types.ts';

export interface JevEvaluation {
  probability: number;
  accepted: boolean;
  latencyMs: number;
  modelId: string;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function jevModelId(): string {
  return env('JEV_MODEL_ID') ?? JEV_MODEL_ID;
}

export function jevThreshold(): number {
  const raw = Number(env('JEV_ACCEPT_THRESHOLD'));
  if (Number.isFinite(raw) && raw > 0 && raw < 1) return raw;
  return JEV_ACCEPT_THRESHOLD;
}

export function jevTimeoutMs(): number {
  const raw = Number(env('JEV_TIMEOUT_MS'));
  if (Number.isFinite(raw) && raw >= 500 && raw <= 15000) return raw;
  return JEV_TIMEOUT_MS;
}

export function hasGatewayKey(): boolean {
  return Boolean(env('AI_GATEWAY_API_KEY'));
}

/**
 * Gizlilik bayrakları (§23).
 *
 * Doğrulanan davranış (kurulu `ai@7`, Gateway hobby planı):
 * - `gateway.zeroDataRetention: true` → 400 hatası ("yalnızca Pro/Enterprise").
 *   Bu yüzden yalnızca `JEV_ZERO_DATA_RETENTION=true` ise gönderilir.
 * - `gateway.disallowPromptTraining: true` → hobby planda çalışır
 *   (eğitimde kullanmayan sağlayıcılara yönlendirme filtresi).
 *   Varsayılan açıktır; `JEV_DISALLOW_PROMPT_TRAINING=false` ile kapatılabilir.
 */
export function jevGatewayOptions(): { disallowPromptTraining: boolean; zeroDataRetention: boolean } {
  return {
    disallowPromptTraining: env('JEV_DISALLOW_PROMPT_TRAINING') !== 'false',
    // Hobby planda `true` Gateway tarafından reddedilir; opt-in bayrak.
    zeroDataRetention: env('JEV_ZERO_DATA_RETENTION') === 'true',
  };
}

/**
 * Kanonik alıştırma + kullanıcı cevabı için Jev boolean değerlendirmesi.
 * Geçici hata/zaman aşımı/eksik anahtar durumlarında throw eder;
 * çağıran katman deterministik geri dönüşe düşer (asla otomatik doğru).
 */
export async function evaluateSemantic(
  exercise: Exercise,
  userAnswer: string,
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<JevEvaluation> {
  if (!hasGatewayKey()) {
    throw new Error('AI_GATEWAY_API_KEY missing');
  }
  const timeoutMs = options.timeoutMs ?? jevTimeoutMs();
  const { experimental_evaluate } = await import('ai');
  const state = buildJevState(exercise, userAnswer);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const result = await experimental_evaluate({
      model: jevModelId(),
      state,
      questions: {
        equivalent: { type: 'boolean', instructions: equivalentInstructions(state) },
      },
      providerOptions: { gateway: jevGatewayOptions() },
      abortSignal: options.signal ?? controller.signal,
      maxRetries: 1,
    });
    const answer = result.answers.equivalent;
    const probability = (answer as { probability?: unknown }).probability;
    if (typeof probability !== 'number' || !Number.isFinite(probability) || probability < 0 || probability > 1) {
      throw new Error('invalid Jev probability');
    }
    const threshold = jevThreshold();
    return {
      probability,
      accepted: probability >= threshold,
      latencyMs: Date.now() - started,
      modelId: result.response?.modelId ?? jevModelId(),
    };
  } finally {
    clearTimeout(timer);
  }
}
