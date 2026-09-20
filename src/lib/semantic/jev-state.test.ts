import { describe, expect, it } from 'vitest';
import type { Exercise } from '../../content/types';
import { buildJevState, equivalentInstructions } from './jev-state';

function ex(): Exercise {
  return {
    id: 'vocab-v-machen-detr-type',
    topicId: 'topic.verbs',
    topic: 'Fiiller',
    type: 'free-text',
    instruction: 'Türkçesini yaz:',
    prompt: 'machen',
    answer: 'yapmak',
    acceptedAnswers: ['yapmak fiili'],
    source: { file: 'test', naturalKey: 't' },
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: [],
    origin: 'authored',
  };
}

describe('buildJevState', () => {
  it('küçük ve ilgili bağlam kurar (müfredat dökümü yok)', () => {
    const state = buildJevState(ex(), 'bir şey yapmak');
    expect(state.exerciseType).toBe('free-text');
    expect(state.expectedAnswers).toContain('yapmak');
    expect(state.userAnswer).toBe('bir şey yapmak');
    expect(JSON.stringify(state).length).toBeLessThan(2000);
  });

  it('uzun girdiyi politika sınırında keser', () => {
    const state = buildJevState(ex(), 'x'.repeat(5000));
    expect(state.userAnswer.length).toBeLessThanOrEqual(200);
  });

  it('yönerge test edilen kavramları taşır', () => {
    const state = buildJevState(ex(), 'bir şey yapmak');
    const instructions = equivalentInstructions(state);
    expect(instructions).toMatch(/lexical_meaning/);
    expect(instructions).toMatch(/different lexical meaning/);
    expect(instructions.toLowerCase()).toContain('do not require literal string equality');
  });
});
