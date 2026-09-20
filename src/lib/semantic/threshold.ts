/**
 * Jev boolean eşiği: P(true) >= eşik → kabul, aksi hâlde yanlış.
 *
 * Eğitim ilkesi: YANLIŞ KABUL (false accept) çok nadir olmalı.
 * Eşik, etiketli kalibrasyon setiyle seçilir; burada yalnızca
 * varsayılan + aday değerlendirme yardımcısı tutulur.
 */

export const JEV_MODEL_ID = 'typesafe-ai/jev';

/** Muhafazakâr varsayılan; kalibrasyon raporuna göre güncellenir. */
export const JEV_ACCEPT_THRESHOLD = 0.72;

/** Etkileşimli alıştırmalar için Jev zaman aşımı (ms). */
export const JEV_TIMEOUT_MS = 3000;

/** Aday eşikler (kalibrasyon betiği bunları tarar). */
export const CANDIDATE_THRESHOLDS = [0.5, 0.7, 0.8, 0.85, 0.9, 0.95];

export interface ThresholdStats {
  threshold: number;
  accuracy: number;
  falseAcceptRate: number;
  falseRejectRate: number;
  accepts: number;
  rejects: number;
}

export function evaluateThreshold(
  cases: Array<{ gold: 'accept' | 'reject'; probability: number }>,
  threshold: number,
): ThresholdStats {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  for (const c of cases) {
    const predicted = c.probability >= threshold ? 'accept' : 'reject';
    if (predicted === 'accept' && c.gold === 'accept') tp += 1;
    else if (predicted === 'reject' && c.gold === 'reject') tn += 1;
    else if (predicted === 'accept') fp += 1;
    else fn += 1;
  }
  const total = cases.length || 1;
  const actualAccept = tp + fn || 1;
  const actualReject = tn + fp || 1;
  return {
    threshold,
    accuracy: (tp + tn) / total,
    falseAcceptRate: fp / actualReject,
    falseRejectRate: fn / actualAccept,
    accepts: tp + fp,
    rejects: tn + fn,
  };
}

/** Eşik adaylarını raporlar; en düşük false-accept önceliklidir. */
export function rankThresholds(
  cases: Array<{ gold: 'accept' | 'reject'; probability: number }>,
  candidates: number[] = CANDIDATE_THRESHOLDS,
): ThresholdStats[] {
  return candidates
    .map((t) => evaluateThreshold(cases, t))
    .sort((a, b) => a.falseAcceptRate - b.falseAcceptRate || b.accuracy - a.accuracy);
}
