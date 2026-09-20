/**
 * Yalnızca geliştirme/hata-ayıklama amaçlı güvenli sayaçlar.
 * Öğrenci cevabı asla loglanmaz; yalnızca toplu sayaçlar tutulur.
 */

export interface SemanticMetrics {
  totalChecked: number;
  deterministicAccepts: number;
  deterministicRejects: number;
  jevCalls: number;
  jevAccepts: number;
  jevRejects: number;
  jevErrors: number;
  jevTimeouts: number;
  cacheHits: number;
  jevLatencyMs: number[];
}

const metrics: SemanticMetrics = {
  totalChecked: 0,
  deterministicAccepts: 0,
  deterministicRejects: 0,
  jevCalls: 0,
  jevAccepts: 0,
  jevRejects: 0,
  jevErrors: 0,
  jevTimeouts: 0,
  cacheHits: 0,
  jevLatencyMs: [],
};

export function recordDeterministic(accepted: boolean): void {
  metrics.totalChecked += 1;
  if (accepted) metrics.deterministicAccepts += 1;
  else metrics.deterministicRejects += 1;
}

export function recordJevCall(latencyMs: number, accepted: boolean): void {
  metrics.jevCalls += 1;
  metrics.jevLatencyMs.push(latencyMs);
  if (accepted) metrics.jevAccepts += 1;
  else metrics.jevRejects += 1;
}

export function recordJevError(timeout: boolean): void {
  if (timeout) metrics.jevTimeouts += 1;
  else metrics.jevErrors += 1;
}

export function recordCacheHit(): void {
  metrics.cacheHits += 1;
}

export function resetSemanticMetrics(): void {
  metrics.totalChecked = 0;
  metrics.deterministicAccepts = 0;
  metrics.deterministicRejects = 0;
  metrics.jevCalls = 0;
  metrics.jevAccepts = 0;
  metrics.jevRejects = 0;
  metrics.jevErrors = 0;
  metrics.jevTimeouts = 0;
  metrics.cacheHits = 0;
  metrics.jevLatencyMs = [];
}

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

export interface SemanticMetricsSummary {
  totalChecked: number;
  deterministicAccepts: number;
  deterministicRejects: number;
  jevCalls: number;
  jevAccepts: number;
  jevRejects: number;
  jevErrors: number;
  jevTimeouts: number;
  cacheHits: number;
  fallbackRate: number;
  medianJevMs: number | null;
  p95JevMs: number | null;
}

export function semanticMetricsSummary(): SemanticMetricsSummary {
  const lat = [...metrics.jevLatencyMs].sort((a, b) => a - b);
  return {
    totalChecked: metrics.totalChecked,
    deterministicAccepts: metrics.deterministicAccepts,
    deterministicRejects: metrics.deterministicRejects,
    jevCalls: metrics.jevCalls,
    jevAccepts: metrics.jevAccepts,
    jevRejects: metrics.jevRejects,
    jevErrors: metrics.jevErrors,
    jevTimeouts: metrics.jevTimeouts,
    cacheHits: metrics.cacheHits,
    fallbackRate: metrics.totalChecked ? metrics.jevCalls / metrics.totalChecked : 0,
    medianJevMs: percentile(lat, 50),
    p95JevMs: percentile(lat, 95),
  };
}
