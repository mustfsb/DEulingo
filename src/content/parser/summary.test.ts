/**
 * Ozet ayristirma ve ozet ↔ kavram ↔ alistirma kapsami (tek müfredat).
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
const daySummaries = bundle.summaries.filter((day) => day.day !== 0);
const generalSummary = bundle.summaries.find((day) => day.day === 0);

describe('ozet ayristirma', () => {
  it('tek mufredatin gun ozetlerini sirayla uretir', () => {
    expect(daySummaries.map((day) => day.day)).toEqual([1, 2, 3, 5, 6, 7, 10]);
  });

  it('gun ozetleri kayitli ana konularini ve aktif hatirlamayi tasir', () => {
    for (const day of [1, 2, 3, 5, 7, 10]) {
      const summary = bundle.summaries.find((item) => item.day === day)!;
      expect(summary.topics.length, `${day}. Gün`).toBeGreaterThanOrEqual(3);
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
    const vorstellung = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'private.day1.vorstellung');
    const tables = vorstellung!.blocks.filter((block) => block.kind === 'table');
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0]).toMatchObject({ kind: 'table' });
  });

  it('"Dikkat" alt bolumlerini uyari olarak ayirir', () => {
    const vorstellung = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'private.day1.vorstellung');
    expect(vorstellung!.warnings.length).toBeGreaterThan(0);
    expect(vorstellung!.warnings.join(' ')).toMatch(/heißen|bin/i);
  });

  it('hizli tekrar maddelerini konulara dagitir', () => {
    const withKeyPoints = bundle.summaries
      .flatMap((day) => day.topics)
      .filter((topic) => topic.keyPoints.length > 0);
    expect(withKeyPoints.length).toBeGreaterThanOrEqual(5);
  });

  it('Almanca ornek cumleleri cikarir', () => {
    const uhrzeit = bundle.summaries
      .flatMap((day) => day.topics)
      .find((topic) => topic.id === 'private.day10.um-uhr');
    const germans = uhrzeit!.examples.map((example) => example.german);
    expect(germans.some((german) => german.includes('um sieben Uhr'))).toBe(true);
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
      expect(day.estimatedReadingMinutes).toBeLessThan(day.day === 0 ? 60 : 30);
    }
  });
});

describe('genel tekrar ozeti (0. gun)', () => {
  it('kumulatif ozet 20+ konuyla pakettedir', () => {
    expect(generalSummary).toBeDefined();
    expect(generalSummary!.title).toBe('Genel Tekrar');
    expect(generalSummary!.topics.length).toBeGreaterThanOrEqual(20);
  });

  it('saat ve cumle kurma usta bolumleri ogretir, listelemez', () => {
    const saat = generalSummary!.topics.find((topic) => topic.id === 'genel.saat')!;
    expect(topicText(saat)).toContain('halb acht');
    const cumle = generalSummary!.topics.find((topic) => topic.id === 'genel.cumle-kurma')!;
    expect(topicText(cumle)).toMatch(/ikinci sırada/);
  });

  it('quiz sorularinin cevaplari gizlidir (recall)', () => {
    const quiz = generalSummary!.topics.find((topic) => topic.id === 'genel.kendine-sor')!;
    expect(quiz.recallQuestions.length).toBeGreaterThanOrEqual(10);
    for (const item of quiz.recallQuestions) {
      expect(item.question.length).toBeGreaterThan(5);
      expect(item.answer.length).toBeGreaterThan(1);
    }
    // Cevaplar govde bloklarinda acikta durmaz (yalnizca recall'da).
    const bodyText = quiz.blocks
      .map((block) => {
        if (block.kind === 'paragraph' || block.kind === 'callout') return block.text;
        if (block.kind === 'list') return block.items.join(' ');
        return '';
      })
      .join('\n');
    expect(bodyText).not.toContain('siebenundvierzig');
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

<details>
<summary>Cevabı Göster</summary>

1. Genel cevap.

</details>
`;

  it('cevaplari dogru gune baglar', () => {
    const answers = parseRecallAnswers(markdown);
    expect(answers.get(1)).toEqual(['Birinci cevap.', 'İkinci cevap.']);
    expect(answers.get(2)).toEqual(['Başka cevap.']);
  });

  it('gun etiketsiz genel cevaplari 0. gune baglar', () => {
    const answers = parseRecallAnswers(markdown);
    expect(answers.get(0)).toEqual(['Genel cevap.']);
  });

  it('her gun ozetinin sorulari cevaplariyla eslesir', () => {
    for (const day of daySummaries) {
      const recall = day.topics.flatMap((topic) => topic.recallQuestions);
      expect(recall.length, `${day.day}. Gün`).toBeGreaterThan(0);
      for (const item of recall) {
        expect(item.question.length).toBeGreaterThan(5);
        expect(item.answer.length).toBeGreaterThan(1);
      }
    }
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
          id: 'private.day2.uydurma.kavram',
          day: 2,
          topicId: 'private.day2.haben-sein',
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
    expect(errors[0].ref).toBe('private.day2.uydurma.kavram');
  });

  it('bilgi sicramasini HATA olarak bildirir', () => {
    const jumped = validateCoverage({
      exercises: [{ ...bundle.exercises[0], day: 1, conceptIds: ['private.day3.mogen.cekim'] }],
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
      missingTopicIds: ['gun9.olmayan'],
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
});
