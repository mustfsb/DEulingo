/**
 * Ozet ayristirma ve ozet ↔ kavram ↔ alistirma kapsami.
 *
 * Ana garanti (§23): Ozet bolumunu calisan biri, aciklamasi olmayan bir bilgiyi
 * soran alistirmayla karsilasmamali.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle } from '../types.ts';
import { parseRecallAnswers, topicText } from './summary.ts';
import { validateCoverage } from './coverage.ts';
import { CONCEPTS, SUMMARY_TOPICS } from '../authored/concepts.ts';
import { SUMMARY_AUGMENTATIONS } from '../authored/summary-augmentations.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;

describe('ozet ayristirma', () => {
  it('ilk alti gunun ozetini sirayla uretir', () => {
    expect(bundle.summaries.filter((d: any) => (d.track ?? 'normal') === 'normal').map((day) => day.day)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('4–6. günlerin her biri kayıtlı ana konularını ve aktif hatırlamayı taşır', () => {
    for (const day of [4, 5, 6]) {
      const summary = bundle.summaries.find((item) => item.day === day)!;
      expect(summary.topics.length).toBeGreaterThanOrEqual(3);
      expect(summary.topics.flatMap((topic) => topic.recallQuestions).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('kayitli her konu kaynakta bulunur', () => {
    const found = new Set(bundle.summaries.flatMap((day) => day.topics.map((topic) => topic.id)));
    for (const topic of SUMMARY_TOPICS) {
      expect(found.has(topic.id), topic.id).toBe(true);
    }
  });

  it('her konunun okunabilir bir govdesi var', () => {
    for (const day of bundle.summaries) {
      for (const topic of day.topics) {
        expect(topic.blocks.length, topic.id).toBeGreaterThan(0);
        expect(topicText(topic).length, topic.id).toBeGreaterThan(120);
      }
    }
  });

  it('tablolari yapili sekilde tasir (ham markdown degil)', () => {
    const konjugation = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'day2.fiil-cekimi');
    const tables = konjugation!.blocks.filter((block) => block.kind === 'table');
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0]).toMatchObject({ kind: 'table' });
  });

  it('"Dikkat" alt bolumlerini uyari olarak ayirir', () => {
    const artikel = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'day2.artikel');
    expect(artikel!.warnings.length).toBeGreaterThan(0);
    expect(artikel!.warnings.join(' ')).toMatch(/büyük harfle/i);
  });

  it('hizli tekrar maddelerini konulara dagitir', () => {
    const withKeyPoints = bundle.summaries
      .flatMap((day) => day.topics)
      .filter((topic) => topic.keyPoints.length > 0);
    expect(withKeyPoints.length).toBeGreaterThanOrEqual(5);
  });

  it('Almanca ornek cumleleri cikarir', () => {
    const tanitma = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'day3.kendini-tanitma');
    const germans = tanitma!.examples.map((example) => example.german);
    expect(germans).toContain('Ich komme aus der Türkei.');
  });

  it('ornek cumlelere yaklasik okunus ekler', () => {
    for (const day of bundle.summaries) {
      for (const topic of day.topics) {
        for (const example of topic.examples) {
          expect(example.pronunciation?.turkishApproximation, example.german).toBeTruthy();
        }
      }
    }
  });

  it('okuma suresi tahmini uretir', () => {
    for (const day of bundle.summaries) {
      expect(day.estimatedReadingMinutes).toBeGreaterThanOrEqual(3);
      expect(day.estimatedReadingMinutes).toBeLessThan(30);
    }
  });
});

describe('"Kendine Sor" cevaplari', () => {
  const markdown = `
<details>
<summary>1. Gün cevapları</summary>

1. Birinci cevap.
2. İkinci cevap.

</details>

<details>
<summary>2. Gün cevapları</summary>

1. Başka cevap.

</details>
`;

  it('cevaplari dogru gune baglar', () => {
    const answers = parseRecallAnswers(markdown);
    expect(answers.get(1)).toEqual(['Birinci cevap.', 'İkinci cevap.']);
    expect(answers.get(2)).toEqual(['Başka cevap.']);
  });

  it('her gunun sorulari cevaplariyla eslesir', () => {
    for (const day of bundle.summaries.filter((d: any) => (d.track ?? 'normal') === 'normal')) {
      const recall = day.topics.flatMap((topic) => topic.recallQuestions);
      expect(recall.length, `${day.day}. Gün`).toBeGreaterThan(0);
      for (const item of recall) {
        expect(item.question.length).toBeGreaterThan(5);
        expect(item.answer.length).toBeGreaterThan(1);
      }
    }
  });

  it('3. Gün cevap kaymasi duzeltilmistir', () => {
    const recall = bundle.summaries
      .find((day) => day.day === 3)!
      .topics.flatMap((topic) => topic.recallQuestions);
    const benSorusu = recall.find((item) => item.question.includes('"ben" nasıl söylenir'));
    // Kaynakta bu soruya `Wie heißt du?` cevabi eslesiyordu; duzeltildi.
    expect(benSorusu?.answer).toContain('ich');
  });
});

describe('kavram kapsami', () => {
  const result = validateCoverage({
    exercises: bundle.exercises,
    concepts: CONCEPTS,
    summaries: bundle.summaries,
    missingTopicIds: [],
  });

  it('kapsam dogrulamasi hatasiz gecer', () => {
    expect(result.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });

  it('her kavramin ozet karsiligi dogrulanir', () => {
    const uncovered = result.coverage.filter((item) => !item.summaryCovered);
    expect(uncovered).toEqual([]);
  });

  it('her kavramin en az bir alistirmasi var', () => {
    const idle = result.coverage.filter(
      (item) => item.exercises.easy + item.exercises.medium + item.exercises.hard === 0,
    );
    expect(idle.map((item) => item.conceptId)).toEqual([]);
  });

  it('eksik ozet aciklamasini HATA olarak bildirir', () => {
    const broken = validateCoverage({
      exercises: bundle.exercises,
      concepts: [
        ...CONCEPTS,
        {
          id: 'day2.uydurma.kavram',
          day: 2,
          topicId: 'day2.fiil-cekimi',
          label: 'Uydurma kavram',
          anchor: 'bu dize özette kesinlikle geçmiyor xyzzy',
        },
      ],
      summaries: bundle.summaries,
      missingTopicIds: [],
    });
    const errors = broken.warnings.filter((warning) => warning.code === 'concept-without-summary');
    expect(errors).toHaveLength(1);
    expect(errors[0].level).toBe('error');
    expect(errors[0].ref).toBe('day2.uydurma.kavram');
  });

  it('bilgi sicramasini HATA olarak bildirir', () => {
    const jumped = validateCoverage({
      exercises: [{ ...bundle.exercises[0], day: 1, conceptIds: ['day3.sayilar.0-10'] }],
      concepts: CONCEPTS,
      summaries: bundle.summaries,
      missingTopicIds: [],
    });
    const errors = jumped.warnings.filter((warning) => warning.code === 'knowledge-jump');
    expect(errors).toHaveLength(1);
    expect(errors[0].level).toBe('error');
  });

  it('bilinmeyen kavrami HATA olarak bildirir', () => {
    const unknown = validateCoverage({
      exercises: [{ ...bundle.exercises[0], conceptIds: ['yok.boyle.bir.kavram'] }],
      concepts: CONCEPTS,
      summaries: bundle.summaries,
      missingTopicIds: [],
    });
    expect(unknown.warnings.some((warning) => warning.code === 'unknown-concept')).toBe(true);
  });

  it('kayip ozet konusunu HATA olarak bildirir', () => {
    const missing = validateCoverage({
      exercises: [],
      concepts: [],
      summaries: bundle.summaries,
      missingTopicIds: ['day9.olmayan'],
    });
    expect(missing.warnings[0].code).toBe('summary-topic-missing');
    expect(missing.warnings[0].level).toBe('error');
  });

  it('onkosullar daha sonraki bir gune isaret etmez', () => {
    const dayOf = new Map(CONCEPTS.map((concept) => [concept.id, concept.day]));
    for (const concept of CONCEPTS) {
      for (const prerequisite of concept.prerequisites ?? []) {
        expect(dayOf.has(prerequisite), prerequisite).toBe(true);
        expect(dayOf.get(prerequisite)!).toBeLessThanOrEqual(concept.day);
      }
    }
  });
});

describe('ozet ek notlari', () => {
  it('her ek not gercek bir konuya baglanir', () => {
    const topicIds = new Set(SUMMARY_TOPICS.map((topic) => topic.id));
    for (const augmentation of SUMMARY_AUGMENTATIONS) {
      expect(topicIds.has(augmentation.topicId), augmentation.topicId).toBe(true);
      expect(augmentation.reason.length).toBeGreaterThan(20);
    }
  });

  it('ek notlar ozete islenir ve isaretlenir', () => {
    const sayilar = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'day3.sayilar');
    expect(sayilar!.augmented).toBe(true);
    // Kaynakta olmayan ama kontrol listesinin istedigi sayilar.
    expect(topicText(sayilar!)).toContain('zwölf');
    expect(topicText(sayilar!)).toContain('elf');
  });

  it('cumle basi buyuk harf kurali ek notla ogretilir', () => {
    const artikel = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'day2.artikel');
    expect(topicText(artikel!)).toContain('Cümleler her zaman büyük harfle başlar');
  });
});
