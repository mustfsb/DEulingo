import { describe, expect, it } from 'vitest';
import { isSemanticFallbackEligible, presentPerfectFormMismatch } from './policy';
import type { Exercise } from '../../content/types';

function ex(partial: Partial<Exercise>): Exercise {
  return {
    id: 'en-test-1', topicId: 'en.present-perfect', topic: 'Present Perfect',
    type: 'free-text', instruction: 'Çevir', answer: 'I have seen it.',
    difficulty: 'medium', skill: 'production', conceptIds: ['pp.formula.core'],
    origin: 'authored', source: { file: 't', naturalKey: 't' },
    validation: { englishContractions: true },
    ...partial,
  } as Exercise;
}

describe('Jev gramer koruması (1. hafta)', () => {
  it('I haven\'t see → reddet (V3)', () => {
    const e = ex({ answer: 'I have not seen it.', acceptedAnswers: ["I haven't seen it."] });
    expect(presentPerfectFormMismatch(e, "I haven't see it.")).toBe(true);
    expect(isSemanticFallbackEligible(e, "I haven't see it.")).toBe(false);
  });
  it('I know him since 2023 → reddet (have eksik)', () => {
    const e = ex({ answer: 'I have known him since 2023.' });
    expect(isSemanticFallbackEligible(e, 'I know him since 2023.')).toBe(false);
  });
  it('If I would have → reddet', () => {
    const e = ex({ topicId: 'en.conditionals', conceptIds: ['cond.second.formula'], answer: 'If I had more time, I would study more.' });
    expect(isSemanticFallbackEligible(e, 'If I would have more time, I would study more.')).toBe(false);
  });
  it('enjoy to visit → reddet', () => {
    const e = ex({ topicId: 'en.gerund-infinitive', conceptIds: ['gi.gerund.chunks'], answer: 'I enjoy visiting museums.' });
    expect(isSemanticFallbackEligible(e, 'I enjoy to visit museums.')).toBe(false);
  });
  it('interested for → reddet', () => {
    const e = ex({ topicId: 'en.prepositions-collocations', conceptIds: ['pc.chunks-a.core'], answer: 'I am interested in music.' });
    expect(isSemanticFallbackEligible(e, 'I am interested for music.')).toBe(false);
  });
  it('had started vs has started → reddet', () => {
    const e = ex({ topicId: 'en.past-perfect', conceptIds: ['ppf.formula.core'], answer: 'By the time we arrived, the film had started.' });
    expect(isSemanticFallbackEligible(e, 'By the time we arrived, the film has started.')).toBe(false);
  });
  it('where the bank it is → reddet', () => {
    const e = ex({ topicId: 'en.sentence-structure', conceptIds: ['ss.questions.indirect'], answer: 'Do you know where the bank is?' });
    expect(isSemanticFallbackEligible(e, 'Do you know where the bank it is?')).toBe(false);
  });
  it('zararsız kısaltma Jev’e gidebilir (I\'ve = I have)', () => {
    const e = ex({ answer: 'I have seen this film.', acceptedAnswers: ["I've seen this film."] });
    // deterministik zaten doğru sayar; fallback uygunluğu gramer imza aynıysa açıktır
    expect(isSemanticFallbackEligible(e, 'I have seen this movie.')).toBe(true);
  });
  it('yapısal tipler Jev’e gitmez', () => {
    const mc = ex({ type: 'multiple-choice', answer: 'seen', options: ['seen', 'saw'] } as Partial<Exercise>);
    expect(isSemanticFallbackEligible(mc, 'saw')).toBe(false);
  });
});
