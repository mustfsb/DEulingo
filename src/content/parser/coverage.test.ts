import { describe, expect, it } from 'vitest';
import type { Exercise } from '../types.ts';
import { validateNoDuplicates } from './coverage.ts';
import { T } from '../curriculum/topics.ts';

function exercise(id: string, type: Exercise['type'], overrides: Partial<Exercise> = {}): Exercise {
  return {
    id,
    topic: 'Saatler ve Zaman',
    topicId: T.time,
    type,
    instruction: type === 'ordering' ? 'Cümleyi sırala.' : 'Cevabı oluştur.',
    prompt: 'Saat yedi buçuk.',
    answer: 'Es ist halb acht.',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['time.halb.kural'],
    origin: 'authored',
    source: { file: 'test', naturalKey: id },
    ...overrides,
  };
}

describe('normalize alıştırma kopyası denetimi', () => {
  it('farklı etkileşim türlerinde aynı konunun aynı soru-cevap çiftini HATA yapar', () => {
    const warnings = validateNoDuplicates([exercise('builder', 'sentence-builder'), exercise('word-bank', 'word-bank-translation')]);
    expect(warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ level: 'error', code: 'near-duplicate-exercise', ref: 'word-bank' })]),
    );
  });

  it('farklı konu havuzlarında ve ders/Genel Tekrar bankaları arasında aynı çift kopya sayılmaz', () => {
    expect(
      validateNoDuplicates([
        exercise('a', 'free-text'),
        exercise('b', 'free-text', { topicId: T.dailyRoutine }),
        exercise('c', 'free-text', { reviewOnly: true }),
      ]),
    ).toEqual([]);
  });
});
