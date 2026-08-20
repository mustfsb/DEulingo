import { describe, expect, it } from 'vitest';
import type { Exercise } from '../types.ts';
import { validateNoDuplicates } from './coverage.ts';

function exercise(id: string, type: Exercise['type']): Exercise {
  return {
    id,
    day: 4,
    topic: 'Takvim',
    topicId: 'day4.takvim-sorulari',
    type,
    instruction: type === 'ordering' ? 'Cümleyi sırala.' : 'Cevabı oluştur.',
    prompt: 'Bugün pazartesi.',
    answer: 'Heute ist Montag.',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day4.soru.welcher-tag'],
    origin: 'authored',
    source: { file: 'test', day: 4, naturalKey: id },
  };
}

describe('normalize alıştırma kopyası denetimi', () => {
  it('farklı etkileşim türlerinde aynı günün aynı soru-cevap çiftini HATA yapar', () => {
    const warnings = validateNoDuplicates([
      exercise('builder', 'sentence-builder'),
      exercise('word-bank', 'word-bank-translation'),
    ]);

    expect(warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ level: 'error', code: 'near-duplicate-exercise', ref: 'word-bank' }),
    ]));
  });
});
