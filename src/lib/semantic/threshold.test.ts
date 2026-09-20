import { describe, expect, it } from 'vitest';
import { evaluateThreshold, rankThresholds } from './threshold';

describe('evaluateThreshold', () => {
  const cases = [
    { gold: 'accept' as const, probability: 0.97 },
    { gold: 'accept' as const, probability: 0.9 },
    { gold: 'accept' as const, probability: 0.6 },
    { gold: 'reject' as const, probability: 0.4 },
    { gold: 'reject' as const, probability: 0.1 },
  ];

  it('eşik istatistiklerini hesaplar', () => {
    const stats = evaluateThreshold(cases, 0.85);
    expect(stats.accuracy).toBeCloseTo(0.8, 5);
    expect(stats.falseAcceptRate).toBe(0);
    expect(stats.falseRejectRate).toBeCloseTo(1 / 3, 5);
  });

  it('düşük eşik yanlış kabulleri artırır', () => {
    const low = evaluateThreshold(cases, 0.3);
    expect(low.falseAcceptRate).toBeGreaterThan(0);
  });
});

describe('rankThresholds', () => {
  it('en düşük yanlış-kabulü öne koyar', () => {
    const cases = [
      { gold: 'accept' as const, probability: 0.99 },
      { gold: 'reject' as const, probability: 0.7 },
      { gold: 'reject' as const, probability: 0.1 },
    ];
    const ranked = rankThresholds(cases, [0.5, 0.8, 0.95]);
    expect(ranked[0]?.falseAcceptRate).toBe(0);
  });
});
