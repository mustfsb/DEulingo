import { describe, expect, it } from 'vitest';
import type { Exercise } from '../content/types';
import {
  evaluateExercise,
  evaluateText,
  isConjugationVariant,
  levenshtein,
  normalizeAnswer,
} from './validation';

const base: Exercise = {
  id: 'test',
  day: 1,
  topic: 'Test',
  topicId: 'day1.test',
  type: 'fill-blank',
  instruction: 'Test',
  difficulty: 'medium',
  skill: 'recall',
  conceptIds: [],
  origin: 'vault',
  source: { file: 'test.md', day: 1, naturalKey: '1/1/1' },
};

describe('normalizeAnswer', () => {
  it('bosluklari, tirnaklari ve son noktalamayi sadelestirir', () => {
    expect(normalizeAnswer('  Ich   komme  aus der Türkei. ')).toBe('ich komme aus der türkei');
    expect(normalizeAnswer('Es geht’s')).toBe("es geht's");
  });

  it('buyuk/kucuk harf duyarli modda harfleri korur', () => {
    expect(normalizeAnswer('Sie', { caseSensitive: true })).toBe('Sie');
    expect(normalizeAnswer('Sie')).toBe('sie');
  });

  it('noktalama duyarli modda son noktalamayi korur', () => {
    expect(normalizeAnswer('Gut.', { punctuationSensitive: true })).toBe('gut.');
  });
});

describe('levenshtein', () => {
  it('temel mesafeleri hesaplar', () => {
    expect(levenshtein('ist', 'is')).toBe(1);
    expect(levenshtein('komme', 'kommen')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
});

describe('yazim hatasi toleransi', () => {
  it('"is" → "ist" kucuk yazim hatasi sayilir', () => {
    const result = evaluateText('is', 'ist');
    expect(result.status).toBe('minor-typo');
    expect(result.diff).toEqual({ got: 'is', want: 'ist' });
  });

  it('tam dogru cevap dogru sayilir', () => {
    expect(evaluateText('ist', 'ist').status).toBe('correct');
  });

  it('buyuk/kucuk harf ve son nokta farki varsayilan olarak affedilir', () => {
    expect(evaluateText('ich komme aus der türkei.', 'Ich komme aus der Türkei.').status).toBe('correct');
  });

  it('ß yerine ss yazimi kucuk yazim farki olarak isaretlenir', () => {
    const result = evaluateText('Ich heisse Mustafa', 'Ich heiße Mustafa');
    expect(result.status).toBe('minor-typo');
    expect(result.note).toBeDefined();
  });

  it('umlaut yerine ue yazimi kabul edilir ama kaydedilir', () => {
    expect(evaluateText('Tuerkei', 'Türkei').status).toBe('minor-typo');
  });

  it('cok uzun sapmalar yanlis sayilir', () => {
    expect(evaluateText('hallo', 'ist').status).toBe('incorrect');
  });

  it('bos cevap yanlistir', () => {
    expect(evaluateText('   ', 'ist').status).toBe('incorrect');
  });
});

describe('dilbilgisi korumasi', () => {
  it('fiil cekimi hatasi yazim hatasi sayilmaz', () => {
    const result = evaluateText('Du kommen aus Deutschland.', 'Du kommst aus Deutschland.');
    expect(result.status).toBe('incorrect');
    expect(result.expected).toBe('Du kommst aus Deutschland.');
  });

  it('ich komme / ich kommen ayrimini korur', () => {
    expect(evaluateText('ich kommen', 'ich komme').status).toBe('incorrect');
  });

  it('artikel hatasi kabul edilmez', () => {
    expect(evaluateText('die Tisch', 'der Tisch').status).toBe('incorrect');
    expect(evaluateText('die', 'der').status).toBe('incorrect');
  });

  it('sein/haben cekimleri birbirine karistirilamaz', () => {
    expect(evaluateText('habt', 'hast').status).toBe('incorrect');
    expect(evaluateText('bist', 'ist').status).toBe('incorrect');
  });

  it('edat degisimi kabul edilmez', () => {
    expect(evaluateText('Ich komme in der Türkei', 'Ich komme aus der Türkei').status).toBe('incorrect');
  });

  it('resmi `Sie` kucuk yazildiginda kabul edilmez', () => {
    expect(evaluateText('Wie heißen sie?', 'Wie heißen Sie?').status).toBe('incorrect');
  });

  it('kelime sayisi farkli oldugunda yanlistir', () => {
    expect(evaluateText('Ich komme', 'Ich komme aus der Türkei').status).toBe('incorrect');
  });

  it('isConjugationVariant kisa kokleri elemez', () => {
    expect(isConjugationVariant('ist', 'is')).toBe(false);
    expect(isConjugationVariant('komme', 'kommen')).toBe(true);
    expect(isConjugationVariant('wohnst', 'wohnt')).toBe(true);
  });
});

describe('kabul edilen varyantlar', () => {
  it('acikca tanimlanmis alternatifler dogru sayilir', () => {
    const result = evaluateText('Es geht mir gut.', 'Gut.', ['Sehr gut.', 'Es geht mir gut.']);
    expect(result.status).toBe('correct');
  });

  it('yanlis cevapta asil cevap gosterilir', () => {
    const result = evaluateText('Schlecht', 'Gut.', ['Sehr gut.']);
    expect(result.status).toBe('incorrect');
    expect(result.expected).toBe('Gut.');
  });
});

describe('dogrulama bayraklari', () => {
  it('caseSensitive acikken buyuk harf farki yanlistir', () => {
    const result = evaluateText('ich bin Mustafa.', 'Ich bin Mustafa.', [], { caseSensitive: true });
    expect(result.status).toBe('incorrect');
  });

  it('noTypoTolerance yazim toleransini kapatir', () => {
    expect(evaluateText('is', 'ist', [], { noTypoTolerance: true }).status).toBe('incorrect');
  });

  it('punctuationSensitive acikken son nokta onemlidir', () => {
    expect(evaluateText('Gut', 'Gut.', [], { punctuationSensitive: true }).status).not.toBe('correct');
  });
});

describe('yaklasik okunus (tek dogru yazimi yok)', () => {
  const approx = (input: string, answer: string, accepted: string[] = []) =>
    evaluateText(input, answer, accepted, { approximation: true }).status;

  it('uzatma ve ikizleme farkini dogru sayar', () => {
    expect(approx('vonen', 'voonen')).toBe('correct');
    expect(approx('voonnen', 'voonen')).toBe('correct');
    expect(approx('vi', 'vii')).toBe('correct');
    expect(approx('şule', 'şuule')).toBe('correct');
  });

  it('sessiz `h` ve kelime sonu schwa yazimlarini esitler', () => {
    for (const input of ['leera', 'leerer', 'lehrer', 'lera', 'lerer']) {
      expect(approx(input, 'leera'), input).toBe('correct');
    }
  });

  it('`w`/`v`, `ai`/`ay`, `ç`/`c` ve kelime sonu `d`/`t` yazimlarini esitler', () => {
    expect(approx('wonen', 'voonen')).toBe('correct');
    expect(approx('nain', 'nayn')).toBe('correct');
    expect(approx('doyclant', 'doyçlant')).toBe('correct');
    expect(approx('doyçland', 'doyçlant')).toBe('correct');
  });

  it('tek harflik kalan farki yazim hatasi sayar, sifirdan yanlisi saymaz', () => {
    expect(approx('doyçlan', 'doyçlant')).toBe('minor-typo');
    expect(approx('sport', 'şport')).toBe('minor-typo');
    expect(approx('doyshlant', 'doyçlant')).toBe('incorrect');
    expect(approx('ney', 'nayn')).toBe('incorrect');
    expect(approx('', 'nayn')).toBe('incorrect');
  });

  it('bayrak kapaliyken eski kati davranis surer', () => {
    expect(evaluateText('vonen', 'voonen', [], {}).status).toBe('minor-typo');
    expect(evaluateText('lerer', 'leera', [], {}).status).toBe('incorrect');
  });
});

describe('alistirma tipleri', () => {
  it('coktan secmeli tam eslesme ister', () => {
    const exercise: Exercise = { ...base, type: 'multiple-choice', answer: 'der', options: ['der', 'die', 'das'] };
    expect(evaluateExercise(exercise, 'der').status).toBe('correct');
    expect(evaluateExercise(exercise, 'die').status).toBe('incorrect');
  });

  it('cumle kurmada dizilim yanlissa yazim hatasi degil, yanlis sayilir', () => {
    const exercise: Exercise = {
      ...base,
      type: 'sentence-builder',
      answer: 'Ich komme aus der Türkei.',
      words: ['Ich', 'komme', 'aus', 'der', 'Türkei.'],
    };
    expect(evaluateExercise(exercise, ['Ich', 'komme', 'aus', 'der', 'Türkei.']).status).toBe('correct');
    expect(evaluateExercise(exercise, ['Ich', 'komme', 'der', 'aus', 'Türkei.']).status).toBe('incorrect');
  });

  it('eslestirme tum ciftler dogruysa dogrudur', () => {
    const exercise: Exercise = {
      ...base,
      type: 'matching',
      pairs: [
        { left: 'Wie heißt du?', right: 'Ich heiße Mustafa.' },
        { left: 'Wo wohnst du?', right: 'Ich wohne in Istanbul.' },
      ],
    };
    expect(
      evaluateExercise(exercise, {
        'Wie heißt du?': 'Ich heiße Mustafa.',
        'Wo wohnst du?': 'Ich wohne in Istanbul.',
      }).status,
    ).toBe('correct');
    expect(
      evaluateExercise(exercise, {
        'Wie heißt du?': 'Ich wohne in Istanbul.',
        'Wo wohnst du?': 'Ich heiße Mustafa.',
      }).status,
    ).toBe('incorrect');
  });
});
