import { describe, expect, it } from 'vitest';
import { enContent } from '../../lib/content-en';
import { distinctCount, distinctKey, productionShare, PRODUCTION_TYPES } from '../../lib/pool-metrics';
import { speakingPool } from './skills-speaking';
import { EN_LESSON_EXERCISES } from './index';
import { EN_EXERCISES_WEEK1_DEPTH } from './exercises-week1-depth';
import { weekReviewEligible } from '../../lib/week-review';
import { createEmptyProgress } from '../../lib/storage';
import { evaluateExercise } from '../../lib/validation';

const pool = (id: string) => enContent.exercisesForSection(id);

/** [ad, havuz, en düşük BENZERSİZ öğe] — kullanıcının kabul ölçütleri. */
const MINIMUMS: Array<[string, string, number]> = [
  ['Sentence Structure · Sentence Ordering', 'set.ss.ordering', 20],
  ['Sentence Structure · Türkçe → İngilizce', 'set.ss.tr-en', 20],
  ['Sentence Structure · Question Structure', 'sentence-structure.questions', 15],
  ['Sentence Structure · Sentence Expansion', 'sentence-structure.expansion', 15],
  ['Sentence Structure · Error Correction', 'set.ss.error-correction', 15],
  ['Past Perfect · Timeline', 'past-perfect.timeline', 15],
  ['Past Perfect · Past Simple vs Past Perfect', 'set.ppf.contrast', 20],
  ['Past Perfect · Türkçe → İngilizce', 'set.ppf.tr-en', 15],
  ['Gerund & Infinitive · Verb Patterns', 'set.gi.patterns', 20],
  ['Gerund & Infinitive · Sentence Production', 'gerund-infinitive.production', 20],
  ['Gerund & Infinitive · Error Correction', 'gerund-infinitive.mistakes', 15],
  ['Conditionals · Second Conditional Structure', 'set.cond.second-structure', 20],
  ['Conditionals · Türkçe → İngilizce', 'set.cond.tr-en', 20],
  ['Conditionals · Error Correction', 'conditionals.mistakes', 15],
  ['Prepositions · Recognition', 'set.prep.recognition', 20],
  ['Prepositions · Production', 'set.prep.production', 20],
  ['Prepositions · Error Correction', 'prepositions-collocations.mistakes', 15],
];

describe('Hafta 1 havuz derinliği (tekilleştirilmiş)', () => {
  it.each(MINIMUMS.map(([name, id, minimum]) => [`${name} ≥ ${minimum}`, id, minimum] as const))('%s', (_name, id, minimum) => {
    expect(distinctCount(pool(id)), id).toBeGreaterThanOrEqual(minimum);
  });

  it('Past Perfect hata düzeltme (konu geneli) ≥ 10', () => {
    const errors = EN_LESSON_EXERCISES.filter((e) => e.topicId === 'en.past-perfect' && e.type === 'error-correction');
    expect(distinctCount(errors)).toBeGreaterThanOrEqual(10);
  });

  it('Conditionals konuşma istemleri ≥ 10', () => {
    expect(speakingPool({ topicId: 'en.conditionals', focus: 'second-conditional' }).length).toBeGreaterThanOrEqual(10);
  });

  it('Prepositions eşleştirme/kelime pratiği ≥ 20', () => {
    const matching = EN_LESSON_EXERCISES.filter((e) => e.topicId === 'en.prepositions-collocations' && e.type === 'matching');
    const vocab = enContent.vocabulary.filter((v) => v.topicIds.includes('en.prepositions-collocations'));
    expect(matching.length).toBeGreaterThanOrEqual(4);
    expect(distinctCount(matching) + vocab.length).toBeGreaterThanOrEqual(20);
    expect(vocab.length).toBeGreaterThanOrEqual(30);
  });

  it('Haftalık tekrar: gramer uygun havuz ≥ 50, kelime/öbek ≥ 30', () => {
    const grammar = weekReviewEligible('g-grammar', createEmptyProgress());
    expect(distinctCount(grammar)).toBeGreaterThanOrEqual(50);
    expect(enContent.vocabulary.length).toBeGreaterThanOrEqual(30);
  });
});

describe('Aktif üretim baskın', () => {
  const PRODUCTION_POOLS = [
    'set.ss.ordering', 'set.ss.tr-en', 'set.ss.error-correction',
    'past-perfect.timeline', 'set.ppf.tr-en', 'gerund-infinitive.production', 'gerund-infinitive.mistakes',
    'set.cond.tr-en', 'conditionals.mistakes', 'set.prep.production', 'prepositions-collocations.mistakes',
  ];
  it.each(PRODUCTION_POOLS)('%s neredeyse tamamen üretim', (id) => {
    expect(productionShare(pool(id)), id).toBeGreaterThanOrEqual(0.9);
  });

  it('karma havuzlarda üretim payı yüksek', () => {
    const floors: Array<[string, number]> = [
      ['sentence-structure.expansion', 0.75], ['set.ppf.contrast', 0.35], ['set.cond.second-structure', 0.5], ['sentence-structure.questions', 0.4],
    ];
    for (const [id, floor] of floors) expect(productionShare(pool(id)), id).toBeGreaterThanOrEqual(floor);
  });

  it('Verb Pattern havuzunun çoğu YAZARAK (fill-blank) ya da eşleştirmedir, çoktan seçmeli değil', () => {
    const patterns = pool('set.gi.patterns');
    const mc = patterns.filter((e) => e.type === 'multiple-choice').length;
    expect(mc / patterns.length).toBeLessThanOrEqual(0.4);
  });

  it('yeni derinlik içeriği üretim ağırlıklıdır (tanıma ≤ %20)', () => {
    const recognition = EN_EXERCISES_WEEK1_DEPTH.filter((e) => !PRODUCTION_TYPES.has(e.type) && e.type !== 'fill-blank');
    expect(recognition.length / EN_EXERCISES_WEEK1_DEPTH.length).toBeLessThanOrEqual(0.2);
  });
});

describe('Yeni içerik kopya içermez ve B1 düzeyindedir', () => {
  it('derinlik içeriğinde kanonik cevaplar benzersiz', () => {
    const keys = EN_EXERCISES_WEEK1_DEPTH.map(distinctKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('derinlik içeriği mevcut havuzdaki hiçbir cevabın kopyası değil', () => {
    const depthIds = new Set(EN_EXERCISES_WEEK1_DEPTH.map((e) => e.id));
    const others = new Set(EN_LESSON_EXERCISES.filter((e) => !depthIds.has(e.id)).map(distinctKey));
    const clashes = EN_EXERCISES_WEEK1_DEPTH.filter((e) => others.has(distinctKey(e))).map((e) => e.id);
    expect(clashes).toEqual([]);
  });

  it('cümleler kısa (≤ 18 sözcük) ve sade B1: ağır sözcük yok', () => {
    const HEAVY = /\b(notwithstanding|albeit|subsequently|nevertheless|furthermore|whereas|hitherto|consequently|aforementioned)\b/i;
    for (const e of EN_EXERCISES_WEEK1_DEPTH) {
      const text = e.answer ?? '';
      if (e.type === 'matching') continue;
      expect(text.split(/\s+/).length, e.id).toBeLessThanOrEqual(18);
      expect(HEAVY.test(text), e.id).toBe(false);
    }
  });

  it('serbest yazımın zararsız alternatifleri yinelenmez', () => {
    for (const e of EN_EXERCISES_WEEK1_DEPTH) {
      const alts = e.acceptedAnswers ?? [];
      expect(new Set(alts).size, e.id).toBe(alts.length);
      expect(alts.includes(e.answer ?? ''), e.id).toBe(false);
    }
  });
});

describe('yeni serbest yazım alıştırmaları kendi cevaplarını kabul eder', () => {
  it('kanonik cevap ve tüm zararsız alternatifler yerel olarak doğru sayılır', () => {
    const typed = EN_EXERCISES_WEEK1_DEPTH.filter((e) => e.type === 'free-text' || e.type === 'error-correction' || e.type === 'fill-blank');
    expect(typed.length).toBeGreaterThan(80);
    for (const e of typed) {
      expect(evaluateExercise(e, e.answer!).status, `${e.id} kanonik`).toBe('correct');
      for (const alt of e.acceptedAnswers ?? []) expect(evaluateExercise(e, alt).status, `${e.id} alternatif: ${alt}`).toBe('correct');
    }
  });

  it('hatalı hâl (error-correction istemi) kendi doğrusu olarak kabul edilmez', () => {
    for (const e of EN_EXERCISES_WEEK1_DEPTH.filter((x) => x.type === 'error-correction')) {
      expect(evaluateExercise(e, e.prompt!).status, e.id).not.toBe('correct');
    }
  });
});
