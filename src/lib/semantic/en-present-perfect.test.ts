import { describe, expect, it } from 'vitest';
import type { Exercise } from '../../content/types';
import { evaluateExercise } from '../validation';
import {
  isPresentPerfectTested,
  isSemanticFallbackEligible,
  presentPerfectFormMismatch,
  semanticPolicyFor,
} from './policy';
import { getExercise, resetExerciseStore } from '../../../server/exercise-store';

function enExercise(partial: Partial<Exercise> & { id: string; answer: string }): Exercise {
  return {
    topicId: 'en.present-perfect',
    topic: 'Present Perfect',
    type: 'free-text',
    difficulty: 'medium',
    skill: 'production',
    instruction: 'Türkçeden İngilizceye çevir:',
    conceptIds: ['pp.formula.core'],
    origin: 'authored',
    source: { file: 'test', naturalKey: partial.id },
    validation: { englishContractions: true },
    ...partial,
  } as Exercise;
}

const SEEN = () =>
  enExercise({ id: 't-seen', answer: "I haven't seen it.", acceptedAnswers: ['I have not seen it.'] });
const LIVED = () => enExercise({ id: 't-lived', answer: 'I have lived here for three years.' });
const KNOWN = () => enExercise({ id: 't-known', answer: 'I have known her since 2023.' });
const QUESTION = () => enExercise({ id: 't-q', answer: 'Have you seen this film?' });
const PAST = () => enExercise({ id: 't-past', answer: 'I saw him yesterday.' });
const TIMES = () => enExercise({ id: 't-times', answer: 'I have seen this film three times.' });

describe('Present Perfect deterministik katman', () => {
  it('geçerli kısaltma/açılım varyasyonlarını kabul eder', () => {
    expect(evaluateExercise(SEEN(), 'I have not seen it.').status).toBe('correct');
    expect(evaluateExercise(SEEN(), "I haven't seen it").status).toBe('correct');
    expect(evaluateExercise(SEEN(), 'i haven’t seen it.').status).toBe('correct');
    expect(evaluateExercise(LIVED(), "I've lived here for three years.").status).toBe('correct');
    expect(evaluateExercise(LIVED(), 'I HAVE LIVED HERE FOR THREE YEARS.').status).toBe('correct');
    expect(evaluateExercise(QUESTION(), 'have you seen this film').status).toBe('correct');
  });

  it('küçük yazım hatasını affeder (minor-typo), dilbilgisini affetmez', () => {
    expect(evaluateExercise(LIVED(), 'I have lived here for three yaers.').status).toBe('minor-typo');
  });

  it('yanlış V3 reddedilir', () => {
    expect(evaluateExercise(SEEN(), "I haven't see it.").status).toBe('incorrect');
    expect(evaluateExercise(SEEN(), 'I have saw it.').status).toBe('incorrect');
    expect(evaluateExercise(LIVED(), 'I have live here for three years.').status).toBe('incorrect');
    expect(evaluateExercise(TIMES(), 'I have saw this film three times.').status).toBe('incorrect');
  });

  it('yanlış/eksik yardımcı reddedilir', () => {
    const she = enExercise({ id: 't-she', answer: "She hasn't finished." });
    expect(evaluateExercise(she, "She haven't finished.").status).toBe('incorrect');
    expect(evaluateExercise(she, 'She has finish.').status).toBe('incorrect');
    expect(evaluateExercise(SEEN(), 'I seen it.').status).toBe('incorrect');
    expect(evaluateExercise(KNOWN(), 'I know her since 2023.').status).toBe('incorrect');
    expect(evaluateExercise(QUESTION(), 'Has you seen this film?').status).toBe('incorrect');
  });

  it('yanlış for/since reddedilir', () => {
    expect(evaluateExercise(LIVED(), 'I have lived here since three years.').status).toBe('incorrect');
    expect(evaluateExercise(KNOWN(), 'I have known her for 2023.').status).toBe('incorrect');
  });

  it('zaman karıştırma reddedilir', () => {
    expect(evaluateExercise(PAST(), 'I have seen him yesterday.').status).toBe('incorrect');
    expect(evaluateExercise(TIMES(), 'I saw this film yesterday.').status).toBe('incorrect');
    expect(evaluateExercise(LIVED(), 'I lived here for three years.').status).toBe('incorrect');
  });
});

describe('Present Perfect Jev uygunluğu (40 durum)', () => {
  it('konu tanılama', () => {
    expect(isPresentPerfectTested(SEEN())).toBe(true);
    expect(
      isPresentPerfectTested(
        enExercise({ id: 't-x', answer: 'x', topicId: 'topic.perfekt', conceptIds: ['perfekt.formula.kural'] }),
      ),
    ).toBe(false);
  });

  it('geçerli varyasyonlar Jev’e gidebilir (anlam korunur, dilbilgisi doğru)', () => {
    // Kelime sırası hedef değilse serbest.
    expect(isSemanticFallbackEligible(LIVED(), 'For three years, I have lived here.')).toBe(true);
    // Eşanlamlı içerik kelimesi.
    expect(isSemanticFallbackEligible(TIMES(), 'I have seen this movie three times.')).toBe(true);
    // Zararsız fazlalık.
    expect(isSemanticFallbackEligible(LIVED(), 'I have lived here for three years now.')).toBe(true);
    // Aynı dilbilgisiyle doğal ek (before).
    expect(isSemanticFallbackEligible(QUESTION(), 'Have you seen this film before?')).toBe(true);
  });

  it('yanlış V3 Jev’e gitmez', () => {
    expect(isSemanticFallbackEligible(SEEN(), "I haven't see it.")).toBe(false);
    expect(isSemanticFallbackEligible(SEEN(), 'I have saw it.')).toBe(false);
    expect(isSemanticFallbackEligible(LIVED(), 'I have live here for three years.')).toBe(false);
    expect(presentPerfectFormMismatch(SEEN(), "I haven't see it.")).toBe(true);
  });

  it('yanlış/eksik yardımcı Jev’e gitmez', () => {
    const she = enExercise({ id: 't-she', answer: "She hasn't finished." });
    expect(isSemanticFallbackEligible(she, "She haven't finished.")).toBe(false);
    expect(isSemanticFallbackEligible(SEEN(), 'I seen it.')).toBe(false);
    expect(isSemanticFallbackEligible(KNOWN(), 'I know her since 2023.')).toBe(false);
    expect(isSemanticFallbackEligible(QUESTION(), 'Has you seen this film?')).toBe(false);
  });

  it('yanlış for/since Jev’e gitmez', () => {
    expect(isSemanticFallbackEligible(LIVED(), 'I have lived here since three years.')).toBe(false);
    expect(isSemanticFallbackEligible(KNOWN(), 'I have known her for 2023.')).toBe(false);
    expect(isSemanticFallbackEligible(KNOWN(), 'I have known her from 2023.')).toBe(false);
    expect(presentPerfectFormMismatch(LIVED(), 'I have lived here since three years.')).toBe(true);
  });

  it('zaman karıştırma Jev’e gitmez', () => {
    expect(isSemanticFallbackEligible(PAST(), 'I have seen him yesterday.')).toBe(false);
    expect(isSemanticFallbackEligible(TIMES(), 'I saw this film yesterday.')).toBe(false);
    expect(isSemanticFallbackEligible(LIVED(), 'I lived here for three years.')).toBe(false);
  });

  it('olumsuzluk/ever-never değişimi Jev’e gitmez', () => {
    expect(isSemanticFallbackEligible(SEEN(), 'I have seen it.')).toBe(false);
    const never = enExercise({ id: 't-never', answer: 'I have never seen this film.' });
    expect(isSemanticFallbackEligible(never, 'I have ever seen this film.')).toBe(false);
  });

  it('politika: serbest metin açık, yapı deterministik, writing kapalı', () => {
    const policy = semanticPolicyFor(SEEN());
    expect(policy.enabled).toBe(true);
    expect(policy.testedConcepts).toContain('present_perfect_auxiliary');
    expect(policy.testedConcepts).toContain('past_participle_v3');
    expect(policy.testedConcepts).toContain('for_since_selection');
    expect(policy.forbiddenVariation.join(' ')).toMatch(/for\/since/);
    expect(policy.allowedVariation.join(' ')).toMatch(/word order/);

    const mc = enExercise({ id: 't-mc', answer: 'for', type: 'multiple-choice', options: ['for', 'since'] });
    expect(semanticPolicyFor(mc).enabled).toBe(false);
    const dict = enExercise({ id: 't-d', answer: 'x', type: 'dictation' });
    expect(semanticPolicyFor(dict).enabled).toBe(false);
    const writing = enExercise({ id: 't-w', answer: 'x', openEnded: true });
    expect(semanticPolicyFor(writing).enabled).toBe(false);
  });

  it('boş/aşırı uzun girdi Jev’e gitmez', () => {
    expect(isSemanticFallbackEligible(SEEN(), '   ')).toBe(false);
    expect(isSemanticFallbackEligible(SEEN(), 'x'.repeat(600))).toBe(false);
  });
});

describe('sunucu deposu İngilizceyi çözer (Jev geri dönüşü üretimde çalışır)', () => {
  it('ders, tekrar ve kelime kimlikleri kanonik tanıma düşer', () => {
    resetExerciseStore();
    expect(getExercise('en-pp-v3-fill-seen')?.answer).toBe('seen');
    expect(getExercise('gr-en-v3-mc')?.answer).toBe('gone');
    expect(getExercise('vocab-en-v-for-detr-type')?.answer).toContain('süre');
    expect(getExercise('vocab-en-v-for-trde-type')?.answer).toBe('for');
    // Almanca çözümleme etkilenmez; bilinmeyen ID hâlâ tanımsız.
    expect(getExercise('pf-formula-habe-fill')?.answer).toBe('habe');
    expect(getExercise('uydurma-id')).toBeUndefined();
  });
});
