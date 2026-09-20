import { describe, expect, it } from 'vitest';
import type { Exercise } from '../../content/types';
import { isSemanticFallbackEligible, semanticPolicyFor, validationMatrix } from './policy';

function base(partial: Partial<Exercise> & Pick<Exercise, 'id' | 'type'>): Exercise {
  return {
    topicId: 'topic.vocabulary',
    topic: 'Kelime',
    instruction: 'Çevir:',
    prompt: 'machen',
    answer: 'yapmak',
    source: { file: 'test', naturalKey: 't' },
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: [],
    origin: 'authored',
    ...partial,
  };
}

describe('semanticPolicyFor', () => {
  it('yapısal tipleri kapatır', () => {
    for (const type of [
      'multiple-choice',
      'matching',
      'listen-choice',
      'word-bank-translation',
      'sentence-builder',
      'ordering',
      'dictation',
      'spoken',
    ] as const) {
      expect(semanticPolicyFor(base({ id: `x-${type}`, type })).enabled, type).toBe(false);
    }
  });

  it('serbest metin ailesini açar', () => {
    for (const type of ['free-text', 'fill-blank', 'error-correction'] as const) {
      expect(semanticPolicyFor(base({ id: `x-${type}`, type })).enabled, type).toBe(true);
    }
  });

  it('açık uçlu Writing için tek boolean açmaz', () => {
    const policy = semanticPolicyFor(
      base({ id: 'w1', type: 'free-text', openEnded: true, answer: 'Uzun paragraf cevabı.' }),
    );
    expect(policy.enabled).toBe(false);
  });

  it('yaklaşık okunuşu kapatır', () => {
    const policy = semanticPolicyFor(
      base({ id: 'a1', type: 'free-text', validation: { approximation: true } }),
    );
    expect(policy.enabled).toBe(false);
  });
});

describe('isSemanticFallbackEligible', () => {
  const free = () => base({ id: 'vocab-v-machen-detr-type', type: 'free-text' });

  it('yapısal alıştırmada asla uygun değil', () => {
    expect(
      isSemanticFallbackEligible(base({ id: 'm1', type: 'multiple-choice', answer: 'der' }), 'die'),
    ).toBe(false);
    expect(
      isSemanticFallbackEligible(base({ id: 'w1', type: 'word-bank-translation', answer: 'Ich komme.' }), 'farklı'),
    ).toBe(false);
  });

  it('kapalı dilbilgisi değişiminde Jev çağrılmaz (der/den)', () => {
    const artikel = base({ id: 'art1', type: 'fill-blank', answer: 'der', topicId: 'topic.articles' });
    expect(isSemanticFallbackEligible(artikel, 'den')).toBe(false);
    expect(isSemanticFallbackEligible(artikel, 'die')).toBe(false);
  });

  it('yardımcı fiil değişiminde Jev çağrılmaz (bin/habe)', () => {
    const aux = base({ id: 'aux1', type: 'fill-blank', answer: 'bin' });
    expect(isSemanticFallbackEligible(aux, 'habe')).toBe(false);
  });

  it('gerçek anlam uyuşmazlığında uygundur', () => {
    expect(isSemanticFallbackEligible(free(), 'bir şey yapmak')).toBe(true);
    expect(isSemanticFallbackEligible(free(), 'gitmek')).toBe(true);
  });

  it('boş ve devasa girdileri eler', () => {
    expect(isSemanticFallbackEligible(free(), '   ')).toBe(false);
    expect(isSemanticFallbackEligible(free(), 'x'.repeat(10_000))).toBe(false);
  });
});

describe('validationMatrix', () => {
  it('tüm alıştırma tiplerini belgeler', () => {
    const matrix = validationMatrix();
    expect(matrix.length).toBeGreaterThan(10);
    const mc = matrix.find((row) => row.exercise === 'multiple-choice');
    expect(mc?.jevFallback).toBe('asla');
  });
});
