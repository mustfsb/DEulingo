/**
 * Dativ semantik doğrulama politikası.
 *
 * İlke: Jev anlamı yargılar, Dativ biçimini ASLA affetmez. Yanlış artikel,
 * iyelik eki, zamir, çoğul -n ya da edat deterministik katmanda yakalanır —
 * Jev'e hiç sorulmaz. Bu yüzden testler "her şeyi kabul eden" bir Jev
 * taklidiyle bile yanlış Dativ'in kabul edilmediğini kanıtlar.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { DATIV_EXERCISES } from '../../content/authored/topics/dativ';
import { evaluateText } from '../validation';
import { DATIV_CALIBRATION_CASES, type DativCategory } from './calibration.dativ.fixtures';
import { clearSemanticCache } from './cache';
import { buildJevState, equivalentInstructions } from './jev-state';
import { caseSignature, isDativeTested, isSemanticFallbackEligible, semanticPolicyFor } from './policy';
import { deterministicValidate, validateAnswer } from './validate-answer';

const alwaysAccept = () =>
  vi.fn(async () => ({ correct: true, probability: 0.99, validationSource: 'jev-semantic' as const, latencyMs: 1 }));

const byCategory = (category: DativCategory) => DATIV_CALIBRATION_CASES.filter((c) => c.category === category);

function asExercise(id: string): Exercise {
  const authored = DATIV_EXERCISES.find((exercise) => exercise.id === id)!;
  return { ...authored, topic: 'Dativ', source: { file: 'authored', naturalKey: id }, origin: 'authored' } as Exercise;
}

beforeEach(() => clearSemanticCache());

describe('Dativ kalibrasyon seti', () => {
  it('en az 40 Dativ vakası içerir; iki etiket ve tüm kategoriler temsil edilir', () => {
    expect(DATIV_CALIBRATION_CASES.length).toBeGreaterThanOrEqual(40);
    expect(DATIV_CALIBRATION_CASES.filter((c) => c.gold === 'accept').length).toBeGreaterThanOrEqual(15);
    expect(DATIV_CALIBRATION_CASES.filter((c) => c.gold === 'reject').length).toBeGreaterThanOrEqual(25);
    for (const category of ['order', 'contraction', 'synonym', 'form', 'preposition', 'meaning'] as const) {
      expect(byCategory(category).length, category).toBeGreaterThan(0);
    }
    expect(new Set(DATIV_CALIBRATION_CASES.map((c) => c.id)).size).toBe(DATIV_CALIBRATION_CASES.length);
  });

  it('görevdeki zorunlu yedi vaka altın etiketleriyle mevcuttur', () => {
    const gold = new Map(DATIV_CALIBRATION_CASES.map((c) => [c.id, c]));
    const required: Array<[string, string, 'accept' | 'reject']> = [
      ['dat-case1-order', 'Mit meinem Freund gehe ich.', 'accept'],
      ['dat-case2-mein', 'Ich gehe mit mein Freund.', 'reject'],
      ['dat-case3-zu-dem', 'Ich gehe zu dem Arzt.', 'accept'],
      ['dat-case4-zu-den', 'Ich gehe zu den Arzt.', 'reject'],
      ['dat-case5-meine', 'Ich spreche mit meine Mutter.', 'reject'],
      ['dat-case6-freunde', 'Ich spiele mit meine Freunde.', 'reject'],
      ['dat-case7-dich', 'Ich helfe dich.', 'reject'],
    ];
    for (const [id, answer, label] of required) {
      expect(gold.get(id)?.userAnswer, id).toBe(answer);
      expect(gold.get(id)?.gold, id).toBe(label);
    }
  });
});

describe('Dativ karar yolları (çevrimdışı)', () => {
  it('yanlış biçim ve yanlış edat: deterministik ret, Jev hiç çağrılmaz — her şeyi kabul eden Jev ile bile', async () => {
    const cases = [...byCategory('form'), ...byCategory('preposition')];
    expect(cases.length).toBeGreaterThanOrEqual(20);
    for (const c of cases) {
      const jev = alwaysAccept();
      expect(deterministicValidate(c.exercise, c.userAnswer).status, c.id).toBe('incorrect');
      expect(isSemanticFallbackEligible(c.exercise, c.userAnswer), c.id).toBe(false);
      const result = await validateAnswer(c.exercise, c.userAnswer, { jevFetch: jev });
      expect(result.correct, c.id).toBe(false);
      expect(jev, c.id).not.toHaveBeenCalled();
    }
  });

  it('kısaltmanın açık yazımı (zu dem / zu der / bei dem / von dem) yerelde kabul edilir', async () => {
    for (const c of byCategory('contraction')) {
      const jev = alwaysAccept();
      const result = await validateAnswer(c.exercise, c.userAnswer, { jevFetch: jev });
      expect(result.correct, c.id).toBe(true);
      expect(result.validationSource, c.id).toBe('deterministic');
      expect(jev, c.id).not.toHaveBeenCalled();
    }
  });

  it('geçerli kelime sırası yerelde eşleşmez ama Jev’e uygundur (Dativ biçimi aynı)', () => {
    for (const c of byCategory('order')) {
      expect(deterministicValidate(c.exercise, c.userAnswer).status, c.id).toBe('incorrect');
      expect(isSemanticFallbackEligible(c.exercise, c.userAnswer), c.id).toBe(true);
    }
  });

  it('anlam farkları yerelde asla "küçük yazım hatası" sayılmaz ve Jev’e gider (özne değişimi hariç)', () => {
    for (const c of byCategory('meaning')) {
      expect(deterministicValidate(c.exercise, c.userAnswer).status, c.id).toBe('incorrect');
      const eligible = isSemanticFallbackEligible(c.exercise, c.userAnswer);
      expect(eligible, c.id).toBe(c.id !== 'dat-mean-subject');
    }
  });

  it('sözcük başına yazım toleransı: Zug ≠ Bus, spiele ≠ spreche; gerçek yazım hatası affedilir', () => {
    const bus = asExercise('dat-tr-bus');
    expect(bus.validation?.strictTokenTypos).toBe(true);
    expect(deterministicValidate(bus, 'Ich fahre mit dem Zug.').status).toBe('incorrect');
    expect(deterministicValidate(bus, 'Ich fahre mit dem Buss.').status).toBe('minor-typo');
    const mutter = asExercise('dat-tr-mutter');
    expect(deterministicValidate(mutter, 'Ich spiele mit meiner Mutter.').status).toBe('incorrect');
    expect(deterministicValidate(mutter, 'Ich spreche mit meiner Muter.').status).toBe('minor-typo');
    // Kısa biçim soruları ve açık uçlu yazma bu bayrağı taşımaz.
    expect(asExercise('dat-def-freund-fill').validation?.strictTokenTypos).toBeUndefined();
    expect(asExercise('dat-free-kiminle').validation?.strictTokenTypos).toBeUndefined();
  });

  it('kabul edilen tam cümle alternatifi yerelde doğrudur', () => {
    const syn = DATIV_CALIBRATION_CASES.find((c) => c.id === 'dat-syn-geschenk')!;
    expect(deterministicValidate(syn.exercise, syn.userAnswer).status).toBe('correct');
  });

  it('kısaltmayı AÇIKÇA test eden biçim sorusunda `zu dem` yanlış kalır', () => {
    const exercise = asExercise('dat-zu-supermarkt-fill');
    expect(exercise.answer).toBe('zum');
    expect(deterministicValidate(exercise, 'zu dem').status).toBe('incorrect');
    expect(isSemanticFallbackEligible(exercise, 'zu dem')).toBe(false);
  });
});

describe('Dativ politikası', () => {
  it('Dativ konusunun tüm alıştırmaları Dativ korumalıdır', () => {
    for (const authored of DATIV_EXERCISES) expect(isDativeTested(asExercise(authored.id)), authored.id).toBe(true);
  });

  it('kısa biçim soruları (≤2 sözcük) Jev’e asla gitmez', () => {
    const drills = DATIV_EXERCISES.filter(
      (exercise) => exercise.type === 'fill-blank' && (exercise.answer ?? '').trim().split(/\s+/).length <= 2,
    );
    expect(drills.length).toBeGreaterThanOrEqual(30);
    for (const drill of drills) {
      const exercise = asExercise(drill.id);
      expect(semanticPolicyFor(exercise).enabled, drill.id).toBe(false);
      expect(isSemanticFallbackEligible(exercise, 'den'), drill.id).toBe(false);
    }
  });

  it('cümle düzeyinde Jev durumu Dativ kavramlarını ve yasaklarını taşır (kesme sonrası)', () => {
    const exercise = asExercise('dat-tr-freund');
    const policy = semanticPolicyFor(exercise);
    expect(policy.enabled).toBe(true);
    expect(policy.testedConcepts).toEqual(expect.arrayContaining(['dative_case', 'article_form', 'possessive_form', 'dative_preposition', 'sentence_meaning']));
    const state = buildJevState(exercise, 'Mit meinem Freund gehe ich.');
    expect(state.testedConcepts).toContain('dative_case');
    expect(state.forbiddenVariation.some((rule) => rule.includes('wrong Dativ article'))).toBe(true);
    expect(state.forbiddenVariation.some((rule) => rule.includes('Akkusativ form where Dativ'))).toBe(true);
    expect(state.allowedVariation.some((rule) => rule.includes('word order'))).toBe(true);
    const instructions = equivalentInstructions(state);
    expect(instructions).toContain('This exercise tests German Dativ');
    expect(instructions).toContain('mit meinen Freund');
  });

  it('Dativ dışı alıştırmaların Jev durumu Dativ yönergesi taşımaz (regresyon yok)', () => {
    const perfekt = {
      id: 'pf-haben-mutter-kocht', topicId: 'topic.perfekt', topic: 'Perfekt', type: 'free-text',
      instruction: 'Türkçeden Almancaya çevir:', prompt: 'Annem dün akşam yemek yaptı. → ______',
      answer: 'Meine Mutter hat gestern Abend gekocht.', conceptIds: ['perfekt.haben.cumle'],
      source: { file: 'x', naturalKey: 'x' }, difficulty: 'hard', skill: 'production', origin: 'authored',
    } as Exercise;
    expect(isDativeTested(perfekt)).toBe(false);
    expect(equivalentInstructions(buildJevState(perfekt, 'x'))).not.toContain('Dativ');
  });

  it('hâl imzası kelime sırasından bağımsız, kısaltmadan bağımsızdır', () => {
    expect(caseSignature('Ich gehe mit meinem Freund.')).toBe(caseSignature('Mit meinem Freund gehe ich.'));
    expect(caseSignature('Ich gehe zum Arzt.')).toBe(caseSignature('Ich gehe zu dem Arzt.'));
    expect(caseSignature('Ich gehe zum Arzt.')).not.toBe(caseSignature('Ich gehe zu den Arzt.'));
    expect(caseSignature('Ich helfe dir.')).not.toBe(caseSignature('Ich helfe dich.'));
  });
});

/* ------------------------------------------------------------------ */
/* Mutasyon denetimi: her Dativ üretim cevabının yanlış hâl biçimleri   */
/* ------------------------------------------------------------------ */

const SWAPS: Record<string, string[]> = {
  dem: ['den', 'der'],
  der: ['die', 'dem'],
  den: ['dem'],
  einem: ['einen', 'ein'],
  einer: ['eine', 'einem'],
  keinem: ['keinen'],
  meinem: ['meinen', 'mein'],
  meiner: ['meine', 'meinem'],
  meinen: ['meinem', 'meine'],
  seinem: ['seinen'],
  ihrer: ['ihre'],
  zum: ['zur'],
  zur: ['zum'],
  beim: ['bei'],
  vom: ['von'],
  mir: ['mich'],
  dir: ['dich'],
  ihm: ['ihn'],
  Freunden: ['Freunde'],
  Kindern: ['Kinder'],
  Monaten: ['Monate'],
};

function mutations(answer: string): string[] {
  const tokens = answer.split(' ');
  const out: string[] = [];
  tokens.forEach((raw, index) => {
    const match = raw.match(/^([A-Za-zÄÖÜäöüß]+)(.*)$/);
    if (!match) return;
    for (const replacement of SWAPS[match[1]] ?? []) {
      const next = [...tokens];
      next[index] = `${replacement}${match[2]}`;
      out.push(next.join(' '));
    }
  });
  return out;
}

describe('Dativ mutasyon denetimi (yanlış biçim asla kabul edilmez)', () => {
  const production = DATIV_EXERCISES.filter(
    (exercise) =>
      ['free-text', 'error-correction', 'dictation'].includes(exercise.type) &&
      !exercise.openEnded &&
      (exercise.answer ?? '').trim().split(/\s+/).length >= 3,
  );

  it('her cümle üretim cevabının hâl mutasyonları — her şeyi kabul eden Jev ile bile — yanlıştır', async () => {
    let total = 0;
    const leaks: string[] = [];
    for (const authored of production) {
      const exercise = asExercise(authored.id);
      for (const wrong of mutations(authored.answer!)) {
        total += 1;
        const jev = alwaysAccept();
        const result = await validateAnswer(exercise, wrong, { jevFetch: jev });
        if (result.correct) leaks.push(`${authored.id}: ${wrong}`);
      }
    }
    console.log(`[dativ-mutasyon] alıştırma=${production.length} mutasyon=${total} sızıntı=${leaks.length}`);
    expect(total).toBeGreaterThanOrEqual(100);
    expect(leaks).toEqual([]);
  });

  it('klavye/yazım toleransı Dativ biçimini affetmez', () => {
    expect(evaluateText('Das gefällt mich.', 'Das gefällt mir.', [], { keyboardTolerance: true }).status).toBe('incorrect');
    expect(evaluateText('Das gefaellt mich', 'Das gefällt mir.', [], { keyboardTolerance: true }).status).toBe('incorrect');
    expect(evaluateText('Ich spreche mit den Kinder.', 'Ich spreche mit den Kindern.').status).toBe('incorrect');
    expect(evaluateText('Ich gehe zur Arzt.', 'Ich gehe zum Arzt.').status).toBe('incorrect');
    expect(evaluateText('Er spielt mit seinen Bruder.', 'Er spielt mit seinem Bruder.').status).toBe('incorrect');
    expect(evaluateText('Ich helfe dich.', 'Ich helfe dir.').status).toBe('incorrect');
    // Gerçek yazım hatası hâlâ affedilir.
    expect(evaluateText('Ich spreche mit meiner Muter.', 'Ich spreche mit meiner Mutter.').status).toBe('minor-typo');
    expect(evaluateText('Ich komme aus der Tuerkei', 'Ich komme aus der Türkei.', [], { keyboardTolerance: true }).status).toBe('correct');
  });
});
