import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearSemanticCache,
  getCachedDecision,
  semanticCacheKey,
  setCachedDecision,
} from './cache';

beforeEach(() => clearSemanticCache());

describe('semanticCacheKey', () => {
  it('normalizasyonda kararlıdır (boşluk/büyük harf fark etmez)', () => {
    const a = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: 'bir şey yapmak' });
    // Almanca yerel ayar katlamasıyla güvenli varyasyon (İsviçre-İ hariç).
    const b = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: '  bir   şey YAPMAK. ' });
    expect(a).toBe(b);
  });

  it('kanonik cevap değişince anahtar değişir (geçersiz kılma)', () => {
    const a = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: 'x' });
    const b = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'etmek', userAnswer: 'x' });
    expect(a).not.toBe(b);
  });

  it('farklı alıştırma farklı anahtar üretir', () => {
    const a = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: 'x' });
    const b = semanticCacheKey({ exerciseId: 'e2', expectedAnswer: 'yapmak', userAnswer: 'x' });
    expect(a).not.toBe(b);
  });
});

describe('get/setCachedDecision', () => {
  it('yazılan kararı okur', () => {
    const key = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: 'bir şey yapmak' });
    expect(getCachedDecision(key)).toBeNull();
    setCachedDecision(key, { probability: 0.97, accepted: true });
    expect(getCachedDecision(key)?.accepted).toBe(true);
  });

  it('temizleme önbelleği boşaltır', () => {
    const key = semanticCacheKey({ exerciseId: 'e1', expectedAnswer: 'yapmak', userAnswer: 'x' });
    setCachedDecision(key, { probability: 0.1, accepted: false });
    clearSemanticCache();
    expect(getCachedDecision(key)).toBeNull();
  });
});
