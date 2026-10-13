import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import { EN_EXERCISES_WEEK1_DEPTH } from '../content/en/exercises-week1-depth';
import { EN_EXERCISES_WEEK1_PLAN } from '../content/en/exercises-week1-plan';
import { isOrderedScale, presentExercise, presentationSeed } from './presentation';

const SEEDS = Array.from({ length: 30 }, (_, i) => presentationSeed('rand', i));
const NEW_CONTENT = [...EN_EXERCISES_WEEK1_PLAN, ...EN_EXERCISES_WEEK1_DEPTH];

describe('yeni egzersizler mevcut kararlı rastgeleleştirmeyi kullanır', () => {
  it('çoktan seçmeli: doğru cevabın konumu seed’e göre değişir, cevap dizine bağlı değil', () => {
    const mcs = NEW_CONTENT.filter((e) => e.options && e.options.length >= 3 && !isOrderedScale(e.options));
    expect(mcs.length).toBeGreaterThanOrEqual(5);
    for (const e of mcs) {
      const positions = new Set(SEEDS.map((seed) => presentExercise(e, seed).options!.indexOf(e.answer!)));
      expect(positions.has(-1), `${e.id} cevap seçeneklerde yok`).toBe(false);
      expect(positions.size, e.id).toBeGreaterThan(1);
      // sunum kopyası kanonik cevabı değiştirmez
      expect(presentExercise(e, SEEDS[0]).answer).toBe(e.answer);
    }
  });

  it('cümle sıralama: jetonlar karıştırılır, kanonik sıra hazır gelmez', () => {
    const orderings = NEW_CONTENT.filter((e) => e.type === 'ordering');
    expect(orderings.length).toBeGreaterThanOrEqual(15);
    for (const e of orderings) {
      const shown = SEEDS.map((seed) => presentExercise(e, seed).words!.join(' '));
      expect(shown.every((order) => order !== e.words!.join(' ')), `${e.id} çözülmüş geldi`).toBe(true);
      expect(new Set(shown).size, `${e.id} hep aynı sıra`).toBeGreaterThan(1);
      // jeton çoklu kümesi korunur
      expect([...presentExercise(e, SEEDS[1]).words!].sort()).toEqual([...e.words!].sort());
    }
  });

  it('eşleştirme: sol sütun karışır; çiftler değişmez', () => {
    const matching = NEW_CONTENT.filter((e) => e.type === 'matching');
    expect(matching.length).toBeGreaterThanOrEqual(9);
    for (const e of matching) {
      const lefts = new Set(SEEDS.map((seed) => presentExercise(e, seed).pairs!.map((p) => p.left).join('|')));
      expect(lefts.size, e.id).toBeGreaterThan(1);
      const rights = e.pairs!.map((p) => p.right);
      expect(new Set(rights).size, `${e.id} sağ sütun benzersiz`).toBe(rights.length);
      const shown = presentExercise(e, SEEDS[2]).pairs!;
      for (const pair of e.pairs!) expect(shown.some((s) => s.left === pair.left && s.right === pair.right)).toBe(true);
    }
  });

  it('kelime bankası: jeton kimlikleri korunur, sıra karışır', () => {
    const banks = EN_LESSON_EXERCISES.filter((e) => e.wordBank && e.wordBank.tokens.length > 3);
    expect(banks.length).toBeGreaterThan(20);
    for (const e of banks.slice(0, 60)) {
      const a = presentExercise(e, SEEDS[0]).wordBank!.tokens.map((t) => t.id);
      expect([...a].sort()).toEqual(e.wordBank!.tokens.map((t) => t.id).sort());
    }
    const varied = banks.some((e) => new Set(SEEDS.map((seed) => presentExercise(e, seed).wordBank!.tokens.map((t) => t.id).join())).size > 1);
    expect(varied).toBe(true);
  });

  it('aynı seed → aynı sunum (yeniden çizimde soru kararlı)', () => {
    for (const e of NEW_CONTENT) {
      expect(JSON.stringify(presentExercise(e, SEEDS[3]))).toBe(JSON.stringify(presentExercise(e, SEEDS[3])));
    }
  });
});

describe('Math.random karıştırma yasağı', () => {
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
    });
  }
  it('kaynakta sort(() => Math.random() - 0.5) yok', () => {
    const offenders = walk('src').filter((path) => /sort\(\s*\(\)\s*=>\s*Math\.random\(\)\s*-\s*0\.5\s*\)/.test(readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
