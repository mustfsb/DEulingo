/**
 * Icerik butunlugu (§45, §58, §60).
 *
 * Bu testler uretilmis paketi (generated/exercises.json) denetler; boylece
 * kaynak Markdown ya da yazilmis katman degistiginde bozulmalar yakalanir.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle } from '../types.ts';
import { AUTHORED_EXERCISES } from './index.ts';
import { CONCEPTS, SUMMARY_TOPICS } from './concepts.ts';
import { VAULT_TAGS } from './vault-tags.ts';
import { approximate, isCurated, transliterateWord } from './pronunciation.ts';
import { evaluateWordBank } from '../../lib/word-bank.ts';
import {
  DAY_4_6_SOURCE_INVENTORY,
  DAY_4_6_SOURCE_TOPICS,
  sourcesForDay,
  validateSourceMappings,
} from './sources.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
const topicIds = new Set(SUMMARY_TOPICS.map((topic) => topic.id));

describe('paket saglik durumu', () => {
  it('hicbir icerik HATASI yok', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });

  it('hicbir icerik uyarisi yok', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'warn')).toEqual([]);
  });

  it('ilk alti gunun tamami sirayla uretilir', () => {
    expect(bundle.days.map((day) => day.day)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('her gunun havuzu belirgin sekilde buyudu', () => {
    // Yukseltme oncesi: 1. Gün 18, 2. Gün 22, 3. Gün 19.
    const counts = Object.fromEntries(bundle.days.map((day) => [day.day, day.exerciseIds.length]));
    expect(counts[1]).toBeGreaterThanOrEqual(35);
    expect(counts[2]).toBeGreaterThanOrEqual(35);
    expect(counts[3]).toBeGreaterThanOrEqual(35);
    expect(counts[4]).toBeGreaterThanOrEqual(40);
    expect(counts[5]).toBeGreaterThanOrEqual(40);
    expect(counts[6]).toBeGreaterThanOrEqual(40);
  });
});

describe('Gün 4–6 kaynak envanteri', () => {
  it('planin her yeni gununde bes video ve beklenen altyazi kapsami vardir', () => {
    expect(sourcesForDay(4)).toHaveLength(5);
    expect(sourcesForDay(5)).toHaveLength(5);
    expect(sourcesForDay(6)).toHaveLength(5);
    expect(sourcesForDay(4).filter((item) => item.transcriptAvailable)).toHaveLength(5);
    expect(sourcesForDay(5).filter((item) => item.transcriptAvailable)).toHaveLength(4);
    expect(sourcesForDay(6).filter((item) => item.transcriptAvailable)).toHaveLength(5);
  });

  it('her yeni kavramli ozet konusu ve her video kaynak haritasinda yer alir', () => {
    const warnings = validateSourceMappings({
      sources: DAY_4_6_SOURCE_INVENTORY,
      mappings: DAY_4_6_SOURCE_TOPICS,
      concepts: CONCEPTS,
      summaries: bundle.summaries,
    });
    expect(warnings).toEqual([]);
  });

  it('baglanmayan kaynak video icerik denetiminde HATA verir', () => {
    const warnings = validateSourceMappings({
      sources: DAY_4_6_SOURCE_INVENTORY,
      // Bir konu eşlemesini kaldırmak yetmez: videolar birden fazla konuda
      // bilinçli olarak kullanılabilir. Bu kez videoyu tüm eşlemelerden çıkar.
      mappings: DAY_4_6_SOURCE_TOPICS.map((mapping) => ({
        ...mapping,
        sourceIds: mapping.sourceIds.filter((sourceId) => sourceId !== 'yt-FcFYDmYngaE'),
      })),
      concepts: CONCEPTS,
      summaries: bundle.summaries,
    });
    expect(warnings.some((warning) => warning.code === 'source-video-unmapped')).toBe(true);
  });
});

describe('kimlik kararliligi', () => {
  it('yazilmis ID\'ler benzersizdir', () => {
    const ids = AUTHORED_EXERCISES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('yazilmis ID\'ler anlamlidir, konuma bagli degildir', () => {
    for (const item of AUTHORED_EXERCISES) {
      // Gun onekli, kucuk harf slug.
      expect(item.id, item.id).toMatch(/^d[1-6]-[a-z0-9-]+$/);
      // Konumsal ID (`d2-1`, `d3-07`) olmamali: gun onekinden sonra
      // en az bir harfli anlam parcasi bulunmali.
      const segments = item.id.split('-').slice(1);
      expect(segments.some((segment) => /[a-z]{2,}/.test(segment)), item.id).toBe(true);
    }
  });

  it('yazilmis ID gun onekiyle gercek gunu ortusur', () => {
    for (const item of AUTHORED_EXERCISES) {
      expect(item.id.startsWith(`d${item.day}-`), item.id).toBe(true);
    }
  });

  it('paketteki tum ID\'ler benzersizdir', () => {
    const ids = bundle.exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kasa alistirmalarinin ID\'leri korunur (kayitli ilerleme bagli kalir)', () => {
    // Etiketleme oncesi uretilen bu ID'ler degismemeli.
    const known = [
      'd1-1-1-1-1luodn5',
      'd1-1-1-2-1upoqrc',
      'd1-1-1-3-0auwxun',
    ];
    const ids = new Set(bundle.exercises.map((exercise) => exercise.id));
    for (const id of known) expect(ids.has(id)).toBe(true);
  });

  it('icerik surumu uretilir', () => {
    expect(bundle.contentVersion).toMatch(/^2\./);
  });
});

describe('alistirma ustverisi', () => {
  it('her alistirmanin zorlugu, becerisi ve kavrami var', () => {
    for (const exercise of bundle.exercises) {
      expect(['easy', 'medium', 'hard']).toContain(exercise.difficulty);
      expect(exercise.skill).toBeTruthy();
      expect(exercise.conceptIds.length).toBeGreaterThan(0);
      expect(exercise.topicId).toBeTruthy();
    }
  });

  it('her kavram kayitlidir', () => {
    for (const exercise of bundle.exercises) {
      for (const conceptId of exercise.conceptIds) {
        expect(conceptIds.has(conceptId)).toBe(true);
      }
    }
  });

  it('bilgi sicramasi yok: hicbir alistirma gelecekteki bir gunu gerektirmez', () => {
    const dayOf = new Map(CONCEPTS.map((concept) => [concept.id, concept.day]));
    for (const exercise of bundle.exercises) {
      for (const conceptId of exercise.conceptIds) {
        expect(dayOf.get(conceptId)!).toBeLessThanOrEqual(exercise.day);
      }
    }
  });

  it('her konu ID\'si kayitli bir ozet konusudur', () => {
    for (const exercise of bundle.exercises) {
      expect(topicIds.has(exercise.topicId)).toBe(true);
    }
  });

  it('sesli ve eslestirme disindaki her alistirmanin cevabi var', () => {
    const missing = bundle.exercises.filter(
      (exercise) => !['spoken', 'matching'].includes(exercise.type) && !exercise.answer,
    );
    expect(missing).toEqual([]);
  });

  it('coktan secmeli sorularda dogru cevap seceneklerin icindedir', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.type !== 'multiple-choice') continue;
      expect(exercise.options?.length).toBeGreaterThanOrEqual(2);
      expect(exercise.options).toContain(exercise.answer);
    }
  });

  it('eslestirme alistirmalarinin en az iki cifti var', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.type !== 'matching') continue;
      expect(exercise.pairs!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('cumle kurma alistirmalarinin kelime cipleri var', () => {
    for (const exercise of bundle.exercises) {
      if (!['sentence-builder', 'ordering'].includes(exercise.type)) continue;
      expect(exercise.words!.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('kelime-bankası çeviri kapsamı', () => {
  it('ilk altı günde iki yönde yeterli sayıda müfredata bağlı çeviri vardır', () => {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      const translations = bundle.exercises.filter(
        (exercise) => exercise.day === day && exercise.type === 'word-bank-translation',
      );
      expect(translations.length).toBeGreaterThanOrEqual(12);
      expect(translations.some((exercise) => exercise.wordBank?.direction === 'de-to-tr')).toBe(true);
      expect(translations.some((exercise) => exercise.wordBank?.direction === 'tr-to-de')).toBe(true);
      for (const exercise of translations) {
        expect(exercise.wordBank?.tokens.every((token) => token.id && token.text)).toBe(true);
        expect(exercise.wordBank?.acceptedSequences.length).toBeGreaterThan(0);
      }
    }
  });

  it('çeviri ses yetkisini yalnızca açık Almanca metadata ile verir', () => {
    const translations = bundle.exercises.filter((exercise) => exercise.type === 'word-bank-translation');
    for (const exercise of translations) {
      const wordBank = exercise.wordBank!;
      const targets = [exercise.audio?.prompt, exercise.audio?.canonicalAnswer].filter(Boolean);
      expect(targets.every((target) => target?.language === 'de-DE')).toBe(true);
      if (wordBank.direction === 'de-to-tr') {
        expect(exercise.audio?.prompt?.text).toBe(wordBank.sourceText);
        expect(exercise.audio?.canonicalAnswer).toBeUndefined();
      } else {
        expect(exercise.audio?.prompt).toBeUndefined();
        expect(exercise.audio?.canonicalAnswer?.text).toBe(exercise.answer);
      }
    }
  });

  it('Türkçede doğal olan alternatif kelime dizilerini kabul eder', () => {
    const exercise = bundle.exercises.find((item) => item.id === 'd2-wb-vater-tr');
    const wordBank = exercise?.wordBank;
    expect(wordBank).toBeDefined();
    expect(wordBank?.acceptedSequences).toContainEqual(['Benim', 'babam', 'öğretmen']);
    expect(wordBank?.tokens.map((token) => token.text)).toEqual(
      expect.arrayContaining(['Benim', 'Babam', 'öğretmen']),
    );

    const selectedIds = ['Benim', 'Babam', 'öğretmen'].map(
      (text) => wordBank!.tokens.find((token) => token.text === text)!.id,
    );
    expect(evaluateWordBank(selectedIds, wordBank!.tokens, wordBank!.acceptedSequences)).toBe(true);
  });

  it('belirli artikel örneğini doğal Türkçe karşılığıyla sorar', () => {
    const exercise = bundle.exercises.find((item) => item.id === 'd5-wb-belirli-tasche-tr');
    expect(exercise?.wordBank?.acceptedSequences).toContainEqual(['Bu', 'çanta']);
    expect(exercise?.wordBank?.acceptedSequences).toContainEqual(['O', 'çanta']);
    expect(exercise?.wordBank?.acceptedSequences).not.toContainEqual(['Bu', 'o', 'çanta']);
  });
});

describe('dil odaklı soru kalitesi', () => {
  it('hiçbir alıştırma video/sonraki ders bilgisini ölçmez', () => {
    const metaQuestion = /\b(video|videoda|videolar|sıradaki|sonraki\s+(?:video|ders))\b/i;
    const offenders = bundle.exercises.filter((exercise) =>
      metaQuestion.test([exercise.instruction, exercise.prompt, exercise.explanation].filter(Boolean).join(' ')),
    );
    expect(offenders.map((exercise) => exercise.id)).toEqual([]);
  });
});

describe('Gün 1–3 ayrık alıştırma setleri', () => {
  it('her soru tam olarak bir sete aittir; üç set de birbirinden ayrıdır', () => {
    for (const day of [1, 2, 3]) {
      const exercises = bundle.exercises.filter((exercise) => exercise.day === day);
      const sets = ['set-1', 'set-2', 'set-3'].map((setId) =>
        exercises.filter((exercise) => (exercise as typeof exercise & { exerciseSetId?: string }).exerciseSetId === setId),
      );
      expect(sets.map((set) => set.length), `${day}. gün`).toEqual(
        expect.arrayContaining([expect.any(Number), expect.any(Number), expect.any(Number)]),
      );
      expect(sets.every((set) => set.length >= 15), `${day}. gün`).toBe(true);
      const counts = sets.map((set) => set.length);
      expect(Math.max(...counts) - Math.min(...counts), `${day}. gün set dengesi`).toBeLessThanOrEqual(1);
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const difficultyCounts = sets.map(
          (set) => set.filter((exercise) => exercise.difficulty === difficulty).length,
        );
        expect(
          Math.max(...difficultyCounts) - Math.min(...difficultyCounts),
          `${day}. gün / ${difficulty} dengesi`,
        ).toBeLessThanOrEqual(2);
      }
      expect(new Set(sets.flatMap((set) => set.map((exercise) => exercise.id))).size).toBe(exercises.length);
    }
  });
});

describe('açık Almanca ses kapsamı', () => {
  it('karma olmayan Almanca seçenek ve eşleştirmeler için içerik kaynaklı hedef taşır', () => {
    const ids = [
      'd1-ozel-harfler-mc',
      'd2-konj-kok-mc',
      'd2-artikel-lampe-mc',
      'd3-3-1-eslestirme-0rjapce',
    ];
    for (const id of ids) {
      const exercise = bundle.exercises.find((item) => item.id === id);
      expect(exercise?.audio?.targets?.length, id).toBeGreaterThan(0);
      expect(exercise?.audio?.targets?.every((target) => target.language === 'de-DE'), id).toBe(true);
    }
  });
});

describe('zorluk dagilimi', () => {
  for (const day of [1, 2, 3, 4, 5, 6]) {
    it(`${day}. Gün ~%30 / %50 / %20 dagilimina yakin`, () => {
      const exercises = bundle.exercises.filter((exercise) => exercise.day === day);
      const share = (difficulty: string) =>
        exercises.filter((exercise) => exercise.difficulty === difficulty).length / exercises.length;

      expect(share('easy')).toBeGreaterThan(0.2);
      expect(share('easy')).toBeLessThan(0.4);
      expect(share('medium')).toBeGreaterThan(0.4);
      expect(share('medium')).toBeLessThan(0.6);
      expect(share('hard')).toBeGreaterThan(0.12);
      expect(share('hard')).toBeLessThan(0.3);
    });
  }
});

describe('alistirma cesitliligi', () => {
  it('uygulama agirlikli olarak coktan secmeli degildir', () => {
    const mc = bundle.exercises.filter((exercise) => exercise.type === 'multiple-choice').length;
    expect(mc / bundle.exercises.length).toBeLessThan(0.4);
  });

  it('aktif uretim guclu sekilde temsil edilir', () => {
    const active = bundle.exercises.filter((exercise) =>
      ['production', 'correction', 'speaking'].includes(exercise.skill),
    ).length;
    expect(active / bundle.exercises.length).toBeGreaterThan(0.25);
  });

  it('kelime-bankası ve dinleme dahil on bir alistirma tipi kullanilir', () => {
    const types = new Set(bundle.exercises.map((exercise) => exercise.type));
    expect(types.size).toBe(11);
    expect(types).toEqual(
      new Set([
        'multiple-choice', 'fill-blank', 'free-text', 'sentence-builder', 'matching',
        'error-correction', 'ordering', 'spoken', 'listen-choice', 'dictation', 'word-bank-translation',
      ]),
    );
  });

  it('her gun en az dort farkli tip icerir', () => {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      const types = new Set(
        bundle.exercises.filter((exercise) => exercise.day === day).map((exercise) => exercise.type),
      );
      expect(types.size).toBeGreaterThanOrEqual(4);
    }
  });

  it('yeni günler üretim ve dinleme ile gerçekçi bir havuz taşır', () => {
    for (const day of [4, 5, 6]) {
      const exercises = bundle.exercises.filter((exercise) => exercise.day === day);
      expect(exercises.filter((exercise) => ['production', 'correction', 'speaking'].includes(exercise.skill)).length)
        .toBeGreaterThanOrEqual(12);
      expect(exercises.filter((exercise) => ['listen-choice', 'dictation'].includes(exercise.type)).length)
        .toBeGreaterThanOrEqual(2);
      expect(exercises.filter((exercise) => exercise.difficulty === 'hard').length).toBeGreaterThanOrEqual(7);
    }
  });
});

describe('kopya denetimi', () => {
  it('ayni gun icinde ayni soru metni tekrar etmez', () => {
    const seen = new Map<string, string>();
    for (const exercise of bundle.exercises) {
      const key = `${exercise.day}|${exercise.type}|${exercise.instruction}|${exercise.prompt ?? ''}`;
      expect(seen.has(key), `kopya: ${exercise.id} ↔ ${seen.get(key)}`).toBe(false);
      seen.set(key, exercise.id);
    }
  });

  it('ayni soru + ayni cevap cifti tekrar etmez', () => {
    const seen = new Map<string, string>();
    for (const exercise of bundle.exercises) {
      if (!exercise.answer || !exercise.prompt) continue;
      const key = `${exercise.day}|${exercise.type}|${exercise.prompt}|${exercise.answer}`;
      expect(seen.has(key), `kopya cevap: ${exercise.id} ↔ ${seen.get(key)}`).toBe(false);
      seen.set(key, exercise.id);
    }
  });
});

describe('kasa etiketleri', () => {
  it('her etiket gercek bir kasa alistirmasiyla eslesir', () => {
    const keys = new Set(bundle.exercises.map((exercise) => exercise.source.naturalKey));
    for (const key of Object.keys(VAULT_TAGS)) {
      expect(keys.has(key), `eslesmeyen etiket: ${key}`).toBe(true);
    }
  });

  it('her kasa alistirmasi etiketlenmistir', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.origin !== 'vault') continue;
      expect(VAULT_TAGS[exercise.source.naturalKey], exercise.source.naturalKey).toBeDefined();
    }
  });
});

describe('Turkce yaklasik okunus', () => {
  it('etiket her zaman "yaklasik" oldugunu belirtir', () => {
    // Veri modeli fonetik dogruluk iddiasi tasimaz; UI etiketi sabittir.
    expect(approximate('wie').turkishApproximation).toBeTruthy();
  });

  it('temel kelimeler beklenen yaklasik okunusu verir (§63)', () => {
    const cases: Array<[string, string]> = [
      ['ich', 'ih'],
      ['heißen', 'haysen'],
      ['Deutschland', 'Doyçlant'],
      ['Türkei', 'Türkay'],
      ['wie', 'vii'],
      ['Guten Morgen', 'guuten morgen'],
      ['Tschüss', 'Çüs'],
      ['kommen', 'komen'],
    ];
    for (const [german, expected] of cases) {
      expect(approximate(german).turkishApproximation, german).toBe(expected);
    }
  });

  it('cumleler kelime kelime cozulur', () => {
    expect(approximate('Ich komme aus der Türkei.').turkishApproximation).toBe(
      'İh kome aus dea türkay.',
    );
    expect(approximate('Wie heißt du?').turkishApproximation).toBe('Vii hayst du?');
  });

  it('zor sesler icin ogrenci notu verir', () => {
    expect(approximate('ich').note).toContain('ch');
    expect(approximate('wohnen').note).toContain('h');
  });

  it('kural motoru sozlukte olmayan kelimeleri makul cevirir', () => {
    expect(transliterateWord('sprechen')).toBe('şprehen');
    expect(transliterateWord('doch')).toBe('doh');
    expect(transliterateWord('zwanzig')).toBe('tsvantsih');
    expect(transliterateWord('Freund')).toBe('froynt');
  });

  it('sessiz `h` iki sesli arasinda duser, sessizden once uzatir', () => {
    // `ch`den gelen "h" sessiz uzatma h'si DEGILDIR ve korunur.
    expect(transliterateWord('sehen')).toBe('zeen');
    expect(transliterateWord('gehen')).toBe('geen');
    expect(transliterateWord('wohnen')).toBe('voonen');
    expect(transliterateWord('Zahl')).toBe('tsaal');
    expect(transliterateWord('Jahr')).toBe('yaar');
    expect(transliterateWord('doch')).toBe('doh');
    expect(transliterateWord('Nacht')).toBe('naht');
  });

  it('kelime sonu ekleri sessiz `h` cozuldukten sonra uygulanir', () => {
    expect(transliterateWord('sehr')).toBe('zea');
    expect(transliterateWord('Lehrer')).toBe('leera');
    expect(transliterateWord('vierzig')).toBe('fiirtsih');
  });

  it('kurs kelimeleri kurator sozlugunde tanimlidir', () => {
    for (const word of ['ich', 'heißen', 'Deutschland', 'Türkei', 'wie', 'Tschüss', 'kommen']) {
      expect(isCurated(word), word).toBe(true);
    }
  });

  it('Almanca cevapli alistirmalarda okunus bulunur', () => {
    const german = bundle.exercises.filter(
      (exercise) =>
        exercise.origin === 'authored' &&
        exercise.answer &&
        /^(Ich|Du|Er|Wir|Ihr|Sie|Wie|Wo|Woher|Wer|Guten|Gute|Auf|Bis|Tschüss)\b/.test(exercise.answer),
    );
    expect(german.length).toBeGreaterThan(5);
    for (const exercise of german) {
      expect(exercise.pronunciation?.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it('Turkce cevaplara okunus eklenmez', () => {
    const turkishAnswer = bundle.exercises.find((exercise) => exercise.answer === '"ay" gibi');
    expect(turkishAnswer).toBeDefined();
    expect(turkishAnswer?.pronunciation?.every((item) => item.german !== '"ay" gibi')).toBe(true);
  });
});
