import { describe, expect, it } from 'vitest';
import {
  isOrderedScale,
  presentExercise,
  presentationSeed,
  shuffledOptions,
  shuffledWords,
} from './presentation';
import { seededShuffle } from '../content/parser/text';
import type { Exercise } from '../content/types';

function mc(id: string, options: string[], answer: string): Exercise {
  return {
    id, topicId: 'en.present-perfect', topic: 'Present Perfect',
    type: 'multiple-choice', instruction: 'Sec', prompt: 'p', answer, options,
    conceptIds: [], origin: 'authored', source: { file: 't', naturalKey: id },
    difficulty: 'easy', skill: 'recognition',
  };
}

describe('sunum tohumu', () => {
  it('parcalari kararli dizer, boslari atlar', () => {
    expect(presentationSeed('a', 1, undefined, null, '', 'b')).toBe('a#1#b');
    expect(presentationSeed('x')).toBe('x');
  });
});

describe('coktan secmeli konum dagilimi', () => {
  it('4 secenekte 1000 tohumda tum konumlar belirgin bicimde gorulur', () => {
    const options = ['have', 'has', 'having', 'had'];
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 1000; i += 1) {
      const shown = shuffledOptions(options, `session-${i}#q`);
      counts[shown.indexOf('have')] += 1;
    }
    for (const [index, count] of counts.entries()) {
      expect(count, `konum ${index + 1}`).toBeGreaterThan(100);
      expect(count, `konum ${index + 1}`).toBeLessThan(400);
    }
  });

  it('2 secenekte iki konum da gorulur', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i += 1) {
      seen.add(shuffledOptions(['have', 'has'], `s-${i}`).indexOf('have'));
    }
    expect([...seen].sort()).toEqual([0, 1]);
  });

  it('sirali olcekler korunur', () => {
    expect(isOrderedScale(['True', 'False', 'Not Given'])).toBe(true);
    expect(isOrderedScale(['False', 'True'])).toBe(true);
    expect(isOrderedScale(['Doğru', 'Yanlış'])).toBe(true);
    expect(isOrderedScale(['1', '2', '3', '4', '5'])).toBe(true);
    expect(shuffledOptions(['True', 'False', 'Not Given'], 'herhangi').join('|')).toBe('True|False|Not Given');
  });

  it('dilbilgisi secimleri karistirilir', () => {
    expect(isOrderedScale(['have', 'has'])).toBe(false);
    expect(isOrderedScale(['for', 'since'])).toBe(false);
    expect(isOrderedScale(['der', 'die', 'das'])).toBe(false);
  });

  it('ayni tohum kararli, farkli tohum cesitlidir', () => {
    const options = ['a', 'b', 'c', 'd'];
    expect(shuffledOptions(options, 's')).toEqual(shuffledOptions(options, 's'));
    const variants = new Set(
      Array.from({ length: 20 }, (_, i) => shuffledOptions(options, `t-${i}`).join('|')),
    );
    expect(variants.size).toBeGreaterThan(1);
  });

  it('girdi dizisini degistirmez', () => {
    const options = ['have', 'has', 'having', 'had'];
    shuffledOptions(options, 's');
    expect(options).toEqual(['have', 'has', 'having', 'had']);
  });
});

describe('cumle kurma cipleri', () => {
  const sentence = ['I', 'have', 'studied', 'English', 'for', 'three', 'years.'];

  it('baslangic sirasi cogunlukla kanonikten farklidir', () => {
    let same = 0;
    for (let i = 0; i < 200; i += 1) {
      if (shuffledWords(sentence, `w-${i}`).join(' ') === sentence.join(' ')) same += 1;
    }
    expect(same).toBe(0);
  });

  it('tum kelimeler korunur, kume aynidir', () => {
    const shown = shuffledWords(sentence, 'w-1');
    expect([...shown].sort()).toEqual([...sentence].sort());
  });

  it('yinelenen kelimeler kaybolmaz', () => {
    const words = ['he', 'had', 'had', 'left'];
    const shown = shuffledWords(words, 'dup-1');
    expect(shown.length).toBe(4);
    expect(shown.filter((w) => w === 'had').length).toBe(2);
  });

  it('tek/iki kelimelik uclarda kilitlenmez', () => {
    expect(shuffledWords(['Merhaba.'], 's')).toEqual(['Merhaba.']);
    expect(shuffledWords(['a', 'a'], 's').length).toBe(2);
  });
});

describe('eslestirme', () => {
  const pairs = [
    { left: 'machen', right: 'yapmak' },
    { left: 'gehen', right: 'gitmek' },
    { left: 'sehen', right: 'görmek' },
    { left: 'lernen', right: 'öğrenmek' },
  ];

  it('sol ve sag bagimsiz karisir, harita bozulmaz', () => {
    const ex = mc('m1', [], '');
    const matching: Exercise = { ...ex, type: 'matching', pairs };
    const leftVariants = new Set<string>();
    const rightVariants = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      const presented = presentExercise(matching, `match-${i}`);
      leftVariants.add(presented.pairs!.map((p) => p.left).join('|'));
      rightVariants.add(
        seededShuffle(presented.pairs!.map((p) => p.right), `match-${i}#right`).join('|'),
      );
      // harita kimligi: her sol, kendi sagiyla eslesir
      for (const pair of presented.pairs!) {
        expect(pairs.find((p) => p.left === pair.left)?.right).toBe(pair.right);
      }
    }
    expect(leftVariants.size).toBeGreaterThan(1);
    expect(rightVariants.size).toBeGreaterThan(1);
  });
});

describe('presentExercise', () => {
  it('kanonik alanlari degistirmez', () => {
    const ex = mc('c1', ['have', 'has', 'having', 'had'], 'have');
    const presented = presentExercise(ex, 's-1');
    expect(presented.answer).toBe('have');
    expect(presented.id).toBe('c1');
    expect([...presented.options!].sort()).toEqual(['had', 'has', 'have', 'having']);
    expect(ex.options).toEqual(['have', 'has', 'having', 'had']);
  });

  it('kelime bankasi kimlikleri korunur', () => {
    const ex = mc('wb1', [], '');
    const banked: Exercise = {
      ...ex,
      type: 'word-bank-translation',
      wordBank: {
        direction: 'tr-to-de',
        sourceText: 'kaynak',
        targetLanguage: 'de',
        tokens: [
          { id: 't1', text: 'Ich' },
          { id: 't2', text: 'habe' },
          { id: 't3', text: 'gelernt' },
          { id: 't4', text: 'nicht' },
        ],
        acceptedSequences: [['Ich', 'habe', 'gelernt']],
      },
    };
    const presented = presentExercise(banked, 's-9');
    expect(presented.wordBank!.tokens.map((t) => t.id).sort()).toEqual(['t1', 't2', 't3', 't4']);
    expect(presented.wordBank!.acceptedSequences).toEqual([['Ich', 'habe', 'gelernt']]);
  });
});
