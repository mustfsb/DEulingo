import { describe, expect, it } from 'vitest';
import { EN_CONCEPTS, EN_CONCEPT_BY_ID } from './concepts';
import {
  enConceptsById,
  enMigrationContext,
  enReviewSummary,
  enSectionsById,
  enSummaries,
  enTopics,
  EN_ALL_EXERCISES as enAllExercises,
  EN_LESSON_EXERCISES,
  EN_REVIEW_BANK,
} from './index';
import { EN_PRESENT_PERFECT_SUMMARY } from './summary';
import { EN_VOCABULARY } from './vocab';
import { EN_TOPIC_BY_ID } from './topics';
import { buildSessionPlan } from '../../lib/session';
import { reviewPoolFor } from '../../lib/general-review';
import { createEmptyProgress } from '../../lib/storage';
import type { Exercise } from '../types';

const lesson = EN_LESSON_EXERCISES;

function sectionText(sectionId: string): string {
  const section = enSectionsById.get(sectionId);
  if (!section) return '';
  const blocks = section.blocks.map((block) => {
    switch (block.kind) {
      case 'paragraph':
      case 'callout':
        return block.text;
      case 'list':
        return block.items.join(' ');
      case 'code':
        return block.lines.join(' ');
      case 'table':
        return [...block.head, ...block.rows.flat()].join(' ');
    }
  });
  return [section.title, ...blocks, ...section.warnings].join(' ');
}

describe('İngilizce içerik denetimi', () => {
  it('yalnızca Present Perfect vardır (gelecek konular uydurulmaz)', () => {
    expect(enTopics.map((topic) => topic.id)).toEqual(['en.present-perfect']);
    expect(EN_TOPIC_BY_ID.has('en.present-perfect')).toBe(true);
  });

  it('en az 140 benzersiz ders alıştırması + tekrar bankası', () => {
    expect(lesson.length).toBeGreaterThanOrEqual(140);
    expect(EN_REVIEW_BANK.length).toBeGreaterThanOrEqual(10);
    expect(new Set(enAllExercises.map((exercise) => exercise.id)).size).toBe(enAllExercises.length);
  });

  it('kimlik ve konu kuralları (Almancayla çakışmaz)', () => {
    for (const exercise of lesson) {
      expect(exercise.id.startsWith('en-')).toBe(true);
      expect(exercise.topicId).toBe('en.present-perfect');
      expect(exercise.reviewOnly).not.toBe(true);
    }
    for (const exercise of EN_REVIEW_BANK) {
      expect(exercise.reviewOnly).toBe(true);
      expect(exercise.id.startsWith('gr-en-')).toBe(true);
    }
  });

  it('kavram ve bölüm göndermeleri geçerli', () => {
    for (const exercise of enAllExercises) {
      expect(exercise.conceptIds.length).toBeGreaterThan(0);
      for (const conceptId of exercise.conceptIds) {
        expect(enConceptsById.has(conceptId), `${exercise.id} → ${conceptId}`).toBe(true);
      }
      if (exercise.sectionId) {
        expect(enSectionsById.has(exercise.sectionId), `${exercise.id} → ${exercise.sectionId}`).toBe(true);
      }
    }
  });

  it('her kavram özet bölümünde çapalanmıştır (öğretmeden sorulmaz)', () => {
    for (const concept of EN_CONCEPTS) {
      const haystack = sectionText(concept.sectionId);
      expect(haystack.includes(concept.anchor), `${concept.id} çapası «${concept.anchor}»`).toBe(true);
    }
  });

  it('iki yazma görevi açık uçlu ve gereksinimli', () => {
    const writing = lesson.filter((exercise) => exercise.type === 'free-text' && exercise.openEnded === true);
    expect(writing.map((exercise) => exercise.id).sort()).toEqual(['en-pp-write-experience', 'en-pp-write-journey']);
    for (const exercise of writing) {
      expect((exercise.requirements ?? []).length).toBeGreaterThanOrEqual(3);
      expect(exercise.sampleAnswer).toBeTruthy();
    }
  });

  it('kişisel üretim (spoken) alıştırmaları örnek cevap taşır', () => {
    const spoken = lesson.filter((exercise) => exercise.type === 'spoken');
    expect(spoken.length).toBeGreaterThanOrEqual(5);
    for (const exercise of spoken) {
      expect(exercise.sampleAnswer).toBeTruthy();
      expect((exercise.requirements ?? []).length).toBeGreaterThan(0);
    }
  });

  it('dinleme/dikte alıştırmaları en-GB ses hedefi taşır, de-DE sızmaz', () => {
    const listening = enAllExercises.filter(
      (exercise) => exercise.type === 'listen-choice' || exercise.type === 'dictation',
    );
    expect(listening.length).toBeGreaterThanOrEqual(7);
    for (const exercise of listening) {
      expect(exercise.audio?.prompt?.language).toBe('en-GB');
      expect(exercise.audioText).toBeTruthy();
    }
    for (const exercise of enAllExercises) {
      const targets = [exercise.audio?.prompt, exercise.audio?.canonicalAnswer, ...(exercise.audio?.targets ?? [])];
      for (const target of targets) {
        if (target) expect(target.language).toBe('en-GB');
      }
    }
  });

  it('serbest üretimde kısaltma normalizasyonu, tek sözcüklü dilbilgisinde toleranssızlık', () => {
    for (const exercise of enAllExercises) {
      if (exercise.type === 'free-text' || exercise.type === 'error-correction' || exercise.type === 'dictation') {
        expect(exercise.validation?.englishContractions, exercise.id).toBe(true);
      }
      if (exercise.type === 'fill-blank' && (exercise.answer ?? '').split(' ').length === 1) {
        expect(exercise.validation?.noTypoTolerance, exercise.id).toBe(true);
      }
    }
  });

  it('cümle kurma/sıralama çipleri cevabı kurar (çeldiricili)', () => {
    const chips = enAllExercises.filter(
      (exercise) => exercise.type === 'sentence-builder' || exercise.type === 'ordering',
    );
    expect(chips.length).toBeGreaterThanOrEqual(5);
    for (const exercise of chips) {
      expect((exercise.words ?? []).length).toBeGreaterThanOrEqual(4);
      const strip = (token: string) => token.replace(/[.?!]$/, '');
      const answerTokens = new Set(strip(exercise.answer!).split(' '));
      const chips = new Set((exercise.words ?? []).map(strip));
      for (const token of answerTokens) {
        expect(chips, `${exercise.id} çipi «${token}»`).toContain(token);
      }
    }
  });

  it('eşleştirme çiftleri tekildir (yinelenen sağ seçenek dersi kilitler)', () => {
    const matching = enAllExercises.filter((exercise) => exercise.type === 'matching');
    expect(matching.length).toBeGreaterThanOrEqual(3);
    for (const exercise of matching) {
      const lefts = exercise.pairs!.map((pair) => pair.left);
      const rights = exercise.pairs!.map((pair) => pair.right);
      expect(new Set(lefts).size, `${exercise.id} sol`).toBe(lefts.length);
      // Sağ yinelenirse `takenRights` tüm kopyaları kilitler ve ders çözülemez.
      expect(new Set(rights).size, `${exercise.id} sağ`).toBe(rights.length);
    }
  });

  it('çoktan seçmeli seçenekler tekildir', () => {
    for (const exercise of enAllExercises.filter((e) => e.type === 'multiple-choice' || e.type === 'listen-choice')) {
      expect(new Set(exercise.options).size, exercise.id).toBe(exercise.options!.length);
      expect(exercise.options, exercise.id).toContain(exercise.answer);
    }
  });

  it('kelime bankası jetonları tutarlıdır', () => {
    for (const exercise of enAllExercises.filter((e) => e.type === 'word-bank-translation')) {
      const ids = exercise.wordBank!.tokens.map((token) => token.id);
      expect(new Set(ids).size, exercise.id).toBe(ids.length);
      const texts = new Set(exercise.wordBank!.tokens.map((token) => token.text));
      for (const sequence of exercise.wordBank!.acceptedSequences) {
        for (const text of sequence) {
          expect(texts.has(text), `${exercise.id} jeton «${text}»`).toBe(true);
        }
      }
    }
  });

  it('kelime bankaları kanonik sırayı kurar', () => {
    const banks = enAllExercises.filter((exercise) => exercise.type === 'word-bank-translation');
    expect(banks.length).toBeGreaterThanOrEqual(8);
    for (const exercise of banks) {
      expect(exercise.wordBank?.direction).toBe('tr-to-en');
      expect(exercise.wordBank?.targetLanguage).toBe('en');
      const first = exercise.wordBank!.acceptedSequences[0].join(' ');
      expect(first.replace(/[.!?]$/, '')).toBe((exercise.answer ?? '').replace(/[.!?]$/, ''));
    }
  });

  it('zorluk dağılımı yaklaşık hedefte (kolay %25 / orta %45 / zor %30)', () => {
    const count = (difficulty: Exercise['difficulty']) => lesson.filter((e) => e.difficulty === difficulty).length;
    const easy = count('easy') / lesson.length;
    const medium = count('medium') / lesson.length;
    const hard = count('hard') / lesson.length;
    expect(easy).toBeGreaterThanOrEqual(0.18);
    expect(easy).toBeLessThanOrEqual(0.36);
    expect(medium).toBeGreaterThanOrEqual(0.32);
    expect(medium).toBeLessThanOrEqual(0.56);
    expect(hard).toBeGreaterThanOrEqual(0.2);
    expect(hard).toBeLessThanOrEqual(0.36);
  });

  it('kategori dağılımı plana uyar', () => {
    const withConcepts = (...ids: string[]) =>
      lesson.filter((exercise) => exercise.conceptIds.some((id) => ids.includes(id)));
    // have/has + yapı ~%10
    expect(withConcepts('pp.formula.core', 'pp.have-has.table', 'pp.have-has.contractions').length).toBeGreaterThanOrEqual(12);
    // V3 ~%20
    expect(withConcepts('pp.v3.irregular-core', 'pp.v3.regular', 'pp.v3.v1v2v3').length).toBeGreaterThanOrEqual(24);
    // for/since ~%15
    expect(withConcepts('pp.for-since.rule', 'pp.for-since.states').length).toBeGreaterThanOrEqual(18);
    // olumsuz/soru ~%10
    expect(withConcepts('pp.neg.havent', 'pp.q.have-has', 'pp.q.short-answers').length).toBeGreaterThanOrEqual(12);
    // ever/never/already/yet/just ~%10
    expect(withConcepts('pp.ever-never.use', 'pp.markers.already-yet-just').length).toBeGreaterThanOrEqual(12);
    // zaman karşıtlığı ~%10
    expect(withConcepts('pp.vs-past.time-words', 'pp.vs-past.experience-count').length).toBeGreaterThanOrEqual(12);
  });

  it('türetilmiş müfredat haritası ders havuzuyla tutarlı', () => {
    expect(enTopics[0].exerciseIds.length).toBe(lesson.length);
    expect(enTopics[0].conceptIds.length).toBe(EN_CONCEPTS.length);
    expect(enTopics[0].sectionIds.length).toBe(enSummaries[0].sections.length);
    for (const id of enTopics[0].exerciseIds) {
      expect(enMigrationContext.topicOfExercise(id)?.topicId).toBe('en.present-perfect');
    }
  });

  it('özet bölümleri kavramları kapsar, hızlı tekrar ve kendini test içerir', () => {
    expect(EN_PRESENT_PERFECT_SUMMARY.sections.length).toBeGreaterThanOrEqual(11);
    expect(EN_PRESENT_PERFECT_SUMMARY.keyPoints.length).toBeGreaterThanOrEqual(8);
    expect(EN_PRESENT_PERFECT_SUMMARY.recallQuestions.length).toBeGreaterThanOrEqual(4);
    expect(enReviewSummary.sections.length).toBeGreaterThanOrEqual(3);
  });

  it('kelime envanteri yalnızca konunun öğrettikleri (~30–45 girdi)', () => {
    expect(EN_VOCABULARY.length).toBeGreaterThanOrEqual(30);
    expect(EN_VOCABULARY.length).toBeLessThanOrEqual(45);
    expect(new Set(EN_VOCABULARY.map((entry) => entry.id)).size).toBe(EN_VOCABULARY.length);
    for (const entry of EN_VOCABULARY) {
      expect(entry.id.startsWith('en-v-')).toBe(true);
      expect(entry.topicIds).toContain('en.present-perfect');
      expect(entry.lang).toBe('en');
    }
  });
});

describe('İngilizce oturum çeşitliliği (50 tohum)', () => {
  const modes = ['normal', 'full', 'challenge'] as const;
  for (const mode of modes) {
    it(`${mode}: oturum içi birincil ID tekrarı yok`, () => {
      for (let seed = 0; seed < 50; seed += 1) {
        const plan = buildSessionPlan({
          pool: lesson,
          progress: createEmptyProgress(),
          mode,
          topicId: 'en.present-perfect',
          seed: `en present-perfect ${mode} ${seed}`,
        });
        const ids = plan.primaryQueue.map((item) => item.exerciseId);
        expect(new Set(ids).size, `${mode} tohum ${seed}`).toBe(ids.length);
        expect(ids.length).toBeGreaterThan(0);
      }
    });
  }

  it('Genel Tekrar (mixed): 50 tohumda oturum içi tekrar yok', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const pool = reviewPoolFor(EN_REVIEW_BANK, 'mixed');
      const plan = buildSessionPlan({
        pool,
        progress: createEmptyProgress(),
        mode: 'gr-mixed',
        seed: `en gr-mixed ${seed}`,
      });
      const ids = plan.primaryQueue.map((item) => item.exerciseId);
      expect(new Set(ids).size, `gr tohum ${seed}`).toBe(ids.length);
    }
  });

  it('konu tekrar havuzu ders + tekrar bankasını birleştirir', () => {
    const pool = reviewPoolFor(EN_REVIEW_BANK, 'topic', 'en.present-perfect', lesson);
    expect(pool.length).toBeGreaterThanOrEqual(20);
  });

  it('kavram kimlikleri EN_CONCEPT_BY_ID ile eşleşir', () => {
    for (const concept of EN_CONCEPTS) {
      expect(EN_CONCEPT_BY_ID.get(concept.id)?.sectionId).toBe(concept.sectionId);
    }
  });
});
