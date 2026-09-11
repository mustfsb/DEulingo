/**
 * Konu özetleri ve özet ↔ kavram ↔ alıştırma kapsamı.
 *
 * Ana garanti (§23): Özet bölümünü çalışan biri, açıklaması olmayan bir
 * bilgiyi soran alıştırmayla karşılaşmamalı. Her konunun TEK kanonik özeti
 * vardır; gün özeti yoktur.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle, SummarySection } from '../types.ts';
import { buildReviewSummary, buildTopicSummaries, sectionText } from './summary.ts';
import { validateCoverage } from './coverage.ts';
import { CONCEPTS } from '../authored/concepts.ts';
import { SUMMARY_AUGMENTATIONS } from '../authored/summary-augmentations.ts';
import { SECTION_BY_ID, SUMMARY_SECTIONS, TOPICS, T } from '../curriculum/topics.ts';
import { LEGACY_SECTION_MAP } from '../curriculum/legacy.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const allSections = bundle.summaries.flatMap((summary) => summary.sections);
const section = (id: string) => allSections.find((item) => item.id === id)!;
const review = bundle.reviewSummary!;

describe('konu ozetleri', () => {
  it('her kanonik konunun tek bir ozeti vardir ve harita sirasiyla uretilir', () => {
    expect(bundle.summaries.map((summary) => summary.topicId)).toEqual(TOPICS.map((topic) => topic.id));
  });

  it('kayitli her bolum kaynakta bulunur ve yalnizca kendi konusunda gorunur (duplicate yok)', () => {
    const ids = allSections.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(SUMMARY_SECTIONS.map((item) => item.id).sort());
    for (const summary of bundle.summaries) {
      for (const item of summary.sections) {
        expect(item.topicId, item.id).toBe(summary.topicId);
        expect(SECTION_BY_ID.get(item.id)?.topicId, item.id).toBe(summary.topicId);
      }
    }
  });

  it('her bolumun okunabilir bir govdesi var', () => {
    for (const item of allSections) {
      expect(item.blocks.length, item.id).toBeGreaterThan(0);
      expect(sectionText(item).length, item.id).toBeGreaterThan(80);
    }
  });

  it('eski gun ozetlerinin her konusu yeni bir bolume tasinmistir (hedef bildirimleri haric)', () => {
    for (const [legacyId, target] of Object.entries(LEGACY_SECTION_MAP)) {
      if (target === null) {
        expect(legacyId, legacyId).toMatch(/\.hedef$/);
        continue;
      }
      expect(SECTION_BY_ID.has(target), `${legacyId} → ${target}`).toBe(true);
    }
  });

  it('tablolari yapili sekilde tasir (ham markdown degil)', () => {
    const introduce = section(LEGACY_SECTION_MAP['private.day1.vorstellung']!);
    const tables = introduce.blocks.filter((block) => block.kind === 'table');
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0]).toMatchObject({ kind: 'table' });
  });

  it('"Dikkat" alt bolumlerini uyari olarak ayirir', () => {
    const introduce = section(LEGACY_SECTION_MAP['private.day1.vorstellung']!);
    expect(introduce.warnings.length).toBeGreaterThan(0);
    expect(introduce.warnings.join(' ')).toMatch(/heißen|bin/i);
  });

  it('hizli tekrar ve kendine sor konu duzeyinde toplanir', () => {
    expect(bundle.summaries.filter((summary) => summary.keyPoints.length > 0).length).toBeGreaterThanOrEqual(15);
    for (const summary of bundle.summaries) {
      expect(summary.recallQuestions.length, summary.topicId).toBeGreaterThan(0);
      for (const item of summary.recallQuestions) {
        expect(item.question.length).toBeGreaterThan(5);
        expect(item.answer.length).toBeGreaterThan(1);
        // "→ ipucu" soruda gorunmez; cevap gizli kalir.
        expect(item.question).not.toContain('→');
      }
    }
  });

  it('Almanca ornek cumleleri cikarir', () => {
    const um = section(LEGACY_SECTION_MAP['private.day10.um-uhr']!);
    expect(um.examples.some((example) => example.german.includes('um sieben Uhr'))).toBe(true);
  });

  it('ornek cumlelere yaklasik okunus ekler', () => {
    for (const item of [...allSections, ...review.sections]) {
      for (const example of item.examples) {
        expect(example.pronunciation?.turkishApproximation, example.german).toBeTruthy();
      }
    }
  });

  it('okuma suresi tahmini uretir', () => {
    for (const summary of bundle.summaries) {
      expect(summary.estimatedReadingMinutes, summary.topicId).toBeGreaterThanOrEqual(2);
      expect(summary.estimatedReadingMinutes, summary.topicId).toBeLessThan(30);
    }
    expect(review.estimatedReadingMinutes).toBeLessThan(60);
  });
});

describe('Modalverben ozeti', () => {
  const modal = bundle.summaries.find((summary) => summary.topicId === T.modalVerbs)!;
  const text = modal.sections.map(sectionText).join('\n');

  it('merkez kurali, bes ana fiili ve hafif mögen/müssen notunu ogretir', () => {
    expect(modal.intro.join(' ')).toMatch(/ikinci sırada/);
    expect(text).toMatch(/mastar/);
    for (const verb of ['können', 'möchten', 'wollen', 'sollen', 'dürfen', 'mögen', 'müssen']) {
      expect(text, verb).toContain(verb);
    }
    const ids = modal.sections.map((item) => item.id);
    for (const id of ['modal-verbs.rule', 'modal-verbs.questions', 'modal-verbs.negation', 'modal-verbs.separable', 'modal-verbs.akkusativ', 'modal-verbs.mistakes']) {
      expect(ids, id).toContain(id);
    }
  });

  it('ayrilabilen fiil ve Akkusativ baglantilarini kendi bolumlerinde kurar', () => {
    expect(sectionText(section('modal-verbs.separable'))).toContain('aufstehen');
    expect(sectionText(section('modal-verbs.akkusativ'))).toMatch(/einen/);
  });

  it('Konjunktiv II teorisi anlatmaz', () => {
    expect(text).not.toMatch(/Konjunktiv/i);
  });
});

describe('genel tekrar ozeti', () => {
  it('kumulatif ozet 25+ bolumle pakettedir; her konu bolumu kanonik konuya baglidir', () => {
    expect(review.title).toBe('Genel Tekrar');
    expect(review.sections.length).toBeGreaterThanOrEqual(25);
    const topicIds = new Set(TOPICS.map((topic) => topic.id));
    for (const item of review.sections) {
      if (item.topicId) expect(topicIds.has(item.topicId), item.id).toBe(true);
    }
    // Her konu Genel Tekrar ozetinde en az bir kez temsil edilir.
    const represented = new Set(review.sections.map((item) => item.topicId));
    for (const topic of TOPICS) expect(represented.has(topic.id), topic.id).toBe(true);
  });

  it('eski Genel Tekrar bolum kimlikleri korunur (okundu/yer imi bagli kalir)', () => {
    const ids = new Set(review.sections.map((item) => item.id));
    for (const id of ['genel.tanisma', 'genel.saat', 'genel.ayrilabilen', 'genel.mein-tag', 'genel.kendine-sor']) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('Modalverben, Akkusativ ve Sayilar bolumleri eklendi', () => {
    const find = (id: string) => review.sections.find((item) => item.id === id);
    expect(sectionText(find('genel.modalverben')!)).toMatch(/können/);
    expect(sectionText(find('genel.akkusativ')!)).toMatch(/einen/);
    expect(find('genel.sayilar')).toBeDefined();
  });

  it('saat ve cumle kurma bolumleri ogretir, listelemez', () => {
    const saat = review.sections.find((item) => item.id === 'genel.saat')!;
    expect(sectionText(saat)).toContain('halb acht');
    const cumle = review.sections.find((item) => item.id === 'genel.cumle-kurma')!;
    expect(sectionText(cumle)).toMatch(/ikinci sırada/);
  });

  it('quiz sorularinin cevaplari gizlidir (recall)', () => {
    const quiz = review.sections.find((item) => item.id === 'genel.kendine-sor')!;
    expect(quiz.recallQuestions?.length).toBeGreaterThanOrEqual(10);
    for (const item of quiz.recallQuestions ?? []) {
      expect(item.question.length).toBeGreaterThan(5);
      expect(item.answer.length).toBeGreaterThan(1);
    }
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

describe('konu ozeti ayristirici', () => {
  const markdown = `# 🗝️ Modalverben

> Kısa giriş.

## Modalverben Nedir?

\`können\` bir Modalverb'dir. Ich kann Deutsch sprechen.

## 🧠 Kendine Sor

1. "Yüzebilirim" nasıl denir? → \`Ich kann schwimmen.\`

<details>
<summary>✅ Cevaplar</summary>

1. \`Ich kann schwimmen.\`

</details>

# 🧩 Uydurma Konu

## Bir Bölüm

Metin.
`;

  const result = buildTopicSummaries(markdown, new Map());

  it('H1 konu blogunu, girisi ve kayitli bolumu okur', () => {
    const modal = result.summaries.find((summary) => summary.topicId === T.modalVerbs)!;
    expect(modal.intro).toEqual(['Kısa giriş.']);
    expect(modal.sections.map((item: SummarySection) => item.id)).toEqual(['modal-verbs.what']);
  });

  it('kendine sor cevaplarini soruyla eslestirir ve ipucunu gizler', () => {
    const modal = result.summaries.find((summary) => summary.topicId === T.modalVerbs)!;
    expect(modal.recallQuestions).toHaveLength(1);
    expect(modal.recallQuestions[0].question).not.toContain('→');
    expect(modal.recallQuestions[0].answer).toContain('Ich kann schwimmen.');
  });

  it('kayitsiz konu basligini, eksik konulari ve eksik bolumleri HATA olarak bildirir', () => {
    const codes = new Set(result.warnings.map((warning) => warning.code));
    expect(codes.has('unknown-topic-heading')).toBe(true);
    expect(codes.has('summary-topic-missing')).toBe(true);
    expect(codes.has('summary-section-missing')).toBe(true);
    expect(result.warnings.every((warning) => warning.level === 'error')).toBe(true);
  });

  it('ayni konu iki kez yazilirsa HATA verir', () => {
    const doubled = buildTopicSummaries(`${markdown}\n# 🗝️ Modalverben\n\n## Modalverben Nedir?\n\nTekrar.\n`, new Map());
    expect(doubled.warnings.some((warning) => warning.code === 'duplicate-topic-heading')).toBe(true);
  });

  it('kayitsiz bolum basligini HATA olarak bildirir', () => {
    const unregistered = buildTopicSummaries('# 🗝️ Modalverben\n\n## Kayıtsız Bölüm\n\nMetin.\n', new Map());
    expect(unregistered.warnings.some((warning) => warning.code === 'unregistered-section')).toBe(true);
  });

  it('Genel Tekrar ozetinde kayitsiz bolum HATA verir', () => {
    const parsed = buildReviewSummary('# 🔁 Genel Tekrar\n\n## Uydurma Başlık\n\nMetin.\n');
    expect(parsed.warnings.some((warning) => warning.code === 'unregistered-review-section')).toBe(true);
  });
});

describe('kavram kapsami', () => {
  const result = validateCoverage({ exercises: bundle.exercises, concepts: CONCEPTS, summaries: bundle.summaries });

  it('kapsam dogrulamasi hatasiz gecer', () => {
    expect(result.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });

  it('her kavramin ozet karsiligi dogrulanir', () => {
    expect(result.coverage.filter((item) => !item.summaryCovered)).toEqual([]);
  });

  it('her kavramin en az bir alistirmasi var', () => {
    const idle = result.coverage.filter((item) => item.exercises.easy + item.exercises.medium + item.exercises.hard === 0);
    expect(idle.map((item) => item.conceptId)).toEqual([]);
  });

  it('eksik ozet aciklamasini HATA olarak bildirir', () => {
    const broken = validateCoverage({
      exercises: bundle.exercises,
      concepts: [
        ...CONCEPTS,
        {
          id: 'verbs.uydurma.kavram',
          topicId: T.verbs,
          sectionId: 'verbs.haben-sein',
          label: 'Uydurma kavram',
          anchor: 'bu dize özette kesinlikle geçmiyor xyzzy',
        },
      ],
      summaries: bundle.summaries,
    });
    const errors = broken.warnings.filter((warning) => warning.code === 'concept-without-summary');
    expect(errors).toHaveLength(1);
    expect(errors[0].level).toBe('error');
    expect(errors[0].ref).toBe('verbs.uydurma.kavram');
  });

  it('henuz ogrenilmemis kavrama dayanan ogrenilmis kavrami HATA olarak bildirir', () => {
    const planned = {
      id: 'modal-verbs.planli',
      topicId: T.modalVerbs,
      sectionId: 'modal-verbs.what',
      label: 'Planlı kavram',
      anchor: 'Modalverb',
      status: 'planned' as const,
    };
    const learned = { ...CONCEPTS[0], id: 'modal-verbs.ogrenilmis', prerequisites: ['modal-verbs.planli'] };
    const jumped = validateCoverage({ exercises: [], concepts: [...CONCEPTS, planned, learned], summaries: bundle.summaries });
    const errors = jumped.warnings.filter((warning) => warning.code === 'prerequisite-not-learned');
    expect(errors).toHaveLength(1);
    expect(errors[0].level).toBe('error');
  });

  it('bilinmeyen kavrami ve konuyu HATA olarak bildirir', () => {
    const unknown = validateCoverage({
      exercises: [{ ...bundle.exercises[0], conceptIds: ['yok.boyle.bir.kavram'], topicId: 'topic.yok' }],
      concepts: CONCEPTS,
      summaries: bundle.summaries,
    });
    expect(unknown.warnings.some((warning) => warning.code === 'unknown-concept')).toBe(true);
    expect(unknown.warnings.some((warning) => warning.code === 'unknown-topic')).toBe(true);
  });

  it('onkosullar kayitli ve ogrenilmis kavramlara isaret eder', () => {
    const index = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
    for (const concept of CONCEPTS) {
      for (const prerequisite of concept.prerequisites ?? []) {
        expect(index.has(prerequisite), prerequisite).toBe(true);
        expect(index.get(prerequisite)!.status ?? 'learned').toBe('learned');
      }
    }
  });
});

describe('ozet ek notlari', () => {
  it('her ek not gercek bir bolume baglanir', () => {
    for (const augmentation of SUMMARY_AUGMENTATIONS) {
      expect(SECTION_BY_ID.has(augmentation.sectionId), augmentation.sectionId).toBe(true);
      expect(augmentation.reason.length).toBeGreaterThan(20);
    }
  });
});
