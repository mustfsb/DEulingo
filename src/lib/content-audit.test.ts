import { describe, expect, it } from 'vitest';
import type { Exercise } from '../content/types';
import { auditExerciseContent } from './content-audit';

const exercise = (id: string, prompt: string, answer: string, familyId?: string): Exercise => ({
  id,
  day: 2,
  topic: 'Test',
  topicId: 'day2.test',
  type: 'fill-blank',
  instruction: 'Doldur.',
  prompt,
  answer,
  difficulty: 'easy',
  skill: 'recall',
  conceptIds: ['day2.test'],
  origin: 'authored',
  source: { file: 'test', day: 2, naturalKey: id },
  familyId,
});

describe('gelistirme icerik denetimi', () => {
  it('benzersiz kimlikleri, normalize sorulari, aileleri ve olasi yakin kopyalari raporlar', () => {
    const report = auditExerciseContent([
      exercise('one', 'Du ___ aus Deutschland.', 'kommst', 'd2.kommen.du'),
      exercise('two', 'Du ___ aus Deutschland!', 'kommst', 'd2.kommen.du'),
      exercise('three', 'Ich ___ Mustafa.', 'bin', 'd2.sein.ich'),
    ]);

    expect(report.total).toBe(3);
    expect(report.uniqueIds).toBe(3);
    expect(report.uniqueNormalizedPrompts).toBe(2);
    expect(report.familyCount).toBe(2);
    expect(report.largestFamily).toEqual({ id: 'd2.kommen.du', count: 2 });
    expect(report.nearDuplicates).toEqual([{ ids: ['one', 'two'], reason: 'same-normalized-prompt-and-answer' }]);
  });
});
