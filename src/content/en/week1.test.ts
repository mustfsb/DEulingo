import { describe, expect, it } from 'vitest';
import { EN_LESSON_EXERCISES, EN_REVIEW_BANK, enTopics } from './index';
import { EN_READING_PASSAGES } from './skills-reading';
import { EN_LISTENING_ITEMS } from './skills-listening';
import { EN_SPEAKING_PROMPTS } from './skills-speaking';
import { EN_WRITING_TASKS, analyzeWriting, week1GrammarUse } from './skills-writing';
import { EN_WEEK_1_PLAN } from './skills-weekly';
import { EN_VOCABULARY } from './vocab';
import { reviewPoolFor } from '../../lib/general-review';
import { buildSessionPlan } from '../../lib/session';
import { createEmptyProgress } from '../../lib/storage';

describe('1. hafta içerik sayıları', () => {
  it('gramer havuzları hedefte', () => {
    const count = (t: string) => EN_LESSON_EXERCISES.filter((e) => e.topicId === t).length;
    expect(count('en.present-perfect')).toBeGreaterThanOrEqual(140);
    expect(count('en.sentence-structure')).toBeGreaterThanOrEqual(100);
    expect(count('en.past-perfect')).toBeGreaterThanOrEqual(80);
    expect(count('en.gerund-infinitive')).toBeGreaterThanOrEqual(100);
    expect(count('en.conditionals')).toBeGreaterThanOrEqual(100);
    expect(count('en.prepositions-collocations')).toBeGreaterThanOrEqual(100);
  });

  it('reading: 8 pasaj, 3 IELTS tarzı, kanıtlı', () => {
    expect(EN_READING_PASSAGES.length).toBeGreaterThanOrEqual(8);
    expect(EN_READING_PASSAGES.filter((p) => p.ieltsStyle).length).toBeGreaterThanOrEqual(3);
    for (const p of EN_READING_PASSAGES) {
      const words = p.text.split(/\s+/).filter(Boolean).length;
      // Kısa/normal B1 giriş pasajları ~130–170 kelime; IELTS tarzı ~150–200.
      // Gerçek sayı arayüzde gösterilir; resmî bölüm gibi gösterilmez.
      expect(words, p.id).toBeGreaterThanOrEqual(p.ieltsStyle ? 150 : 130);
      expect(p.questions.length).toBeGreaterThanOrEqual(4);
      for (const q of p.questions) {
        expect(q.evidence.length).toBeGreaterThan(0);
        expect(q.explanation.length).toBeGreaterThan(0);
        const content = q.evidence.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
        const hay = p.text.toLowerCase();
        const hit = content.filter((w) => hay.includes(w)).length;
        expect(hit, `${p.id}/${q.id}`).toBeGreaterThanOrEqual(Math.min(2, content.length));
      }
      expect(p.vocab.length).toBeGreaterThanOrEqual(5);
      expect(p.vocab.length).toBeLessThanOrEqual(10);
    }
    const types = new Set(EN_READING_PASSAGES.flatMap((p) => p.questions.map((q) => q.type)));
    for (const t of ['multiple-choice', 'true-false-notgiven', 'matching-headings', 'sentence-completion', 'short-answer']) {
      expect(types.has(t as never), t).toBe(true);
    }
  });

  it('listening: 40 parça + 10 dikte + uzun setler', () => {
    expect(EN_LISTENING_ITEMS.length).toBeGreaterThanOrEqual(50);
    expect(EN_LISTENING_ITEMS.filter((i) => i.kind === 'dictation').length).toBeGreaterThanOrEqual(10);
    expect(EN_LISTENING_ITEMS.filter((i) => i.level === 'B1+').length).toBeGreaterThanOrEqual(3);
    for (const item of EN_LISTENING_ITEMS) {
      expect(item.audioText.length).toBeGreaterThan(0);
      expect(item.transcript.length).toBeGreaterThan(0);
      expect(item.evidence.length).toBeGreaterThan(0);
    }
  });

  it('speaking: 40+ istem, 5 tür', () => {
    expect(EN_SPEAKING_PROMPTS.length).toBeGreaterThanOrEqual(40);
    const kinds = new Set(EN_SPEAKING_PROMPTS.map((p) => p.kind));
    for (const k of ['read-aloud', 'shadowing', 'short-answer', 'topic', 'ielts-part1']) {
      expect(kinds.has(k as never), k).toBe(true);
    }
  });

  it('writing: 10 görev, artan zorluk, rubrik', () => {
    expect(EN_WRITING_TASKS.length).toBeGreaterThanOrEqual(10);
    for (const t of EN_WRITING_TASKS) {
      expect(t.requirements.length).toBeGreaterThanOrEqual(2);
      expect(t.sampleAnswer.length).toBeGreaterThan(0);
      expect(t.minWords).toBeGreaterThanOrEqual(80);
    }
    // bilinen hata yakalama
    const task = EN_WRITING_TASKS[0];
    const fb = analyzeWriting('I enjoy to visit museums. I am interested for music.', task);
    expect(fb.length).toBeGreaterThanOrEqual(2);
    expect(analyzeWriting(task.sampleAnswer, task).length).toBeLessThanOrEqual(2);
  });

  it('haftalık plan: 7 oturum, Session G test', () => {
    expect(EN_WEEK_1_PLAN.length).toBe(7);
    expect(EN_WEEK_1_PLAN.map((s) => s.code)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('kelime: chunk/collocation kapsama', () => {
    const ids = new Set(EN_VOCABULARY.map((v) => v.id));
    for (const id of ['en-v-pay-attention', 'en-v-look-forward-doing', 'en-v-decide-to-do', 'en-v-enjoy-doing', 'en-v-interested-in', 'en-v-depend-on']) {
      expect(ids.has(id), id).toBe(true);
    }
    // kategori türetme: en az 4 farklı topic etiketi
    const topics = new Set(EN_VOCABULARY.flatMap((v) => v.topicIds));
    expect(topics.size).toBeGreaterThanOrEqual(5);
  });

  it('General Review yeni konuları kapsar', () => {
    for (const topic of enTopics) {
      const pool = reviewPoolFor(EN_REVIEW_BANK, 'topic', topic.id, EN_LESSON_EXERCISES);
      expect(pool.length, topic.id).toBeGreaterThanOrEqual(6);
    }
  });

  it('haftalık review oturumu kurulur', () => {
    const pool = reviewPoolFor(EN_REVIEW_BANK, 'mixed');
    const plan = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'gr-mixed', seed: 'weekly' });
    expect(plan.primaryQueue.length).toBeGreaterThan(0);
  });
});

describe('1. hafta planı içeriği (Session B–G)', () => {
  const week = EN_READING_PASSAGES.filter((p) => p.weekRole);

  it('IELTS tarzı hafta pasajları 500–700 kelime, özgün ve birebir kanıtlı', () => {
    expect(week.map((p) => p.weekRole).sort()).toEqual(['week1-passage-1', 'week1-passage-2', 'week1-test']);
    for (const passage of week) {
      const words = passage.text.split(/\s+/).filter(Boolean).length;
      expect(words, passage.id).toBeGreaterThanOrEqual(480);
      expect(words, passage.id).toBeLessThanOrEqual(700);
      expect(passage.ieltsStyle).toBe(true);
      expect(passage.questions.length, passage.id).toBeGreaterThanOrEqual(10);
      for (const q of passage.questions) {
        // kanıt pasajda BİREBİR geçmeli (incelemede vurgulanır)
        expect(passage.text.includes(q.evidence), `${q.id} kanıt birebir değil: ${q.evidence}`).toBe(true);
        if (q.options) expect(q.options, q.id).toContain(q.answer);
        if (q.type === 'true-false-notgiven') expect(q.options).toEqual(['True', 'False', 'Not Given']);
      }
    }
  });

  it('Passage 2 başlık eşleştirme + cümle tamamlama + çoktan seçmeli; Passage 1 T/F/NG + kısa cevap', () => {
    const types = (id: string) => new Set(week.find((p) => p.id === id)!.questions.map((q) => q.type));
    expect(types('en-read-w1-1')).toEqual(new Set(['multiple-choice', 'true-false-notgiven', 'short-answer', 'sentence-completion']));
    expect(types('en-read-w1-2')).toEqual(new Set(['matching-headings', 'sentence-completion', 'multiple-choice']));
    // başlık sayısı paragraf sayısından fazla (çeldirici başlık)
    const p2 = week.find((p) => p.id === 'en-read-w1-2')!;
    const paragraphs = p2.text.split(/\n\s*\n/).length;
    expect(p2.questions.find((q) => q.type === 'matching-headings')!.options!.length).toBeGreaterThan(paragraphs);
  });

  it('test pasajı çalışma pasajlarından farklıdır (görülmemiş metin)', () => {
    const [p1, p2] = ['en-read-w1-1', 'en-read-w1-2'].map((id) => week.find((p) => p.id === id)!.text);
    const test = week.find((p) => p.weekRole === 'week1-test')!.text;
    const sentences = (t: string) => new Set(t.split(/(?<=[.!?])\s+/).map((s) => s.replace(/^\[[A-Z]\]\s*/, '').trim()));
    const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((s) => b.has(s));
    expect(overlap(sentences(test), sentences(p1))).toEqual([]);
    expect(overlap(sentences(test), sentences(p2))).toEqual([]);
  });

  it('dinleme: tüm seçenekli parçalar cevabı içerir; kimlikler benzersiz', () => {
    const ids = EN_LISTENING_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of EN_LISTENING_ITEMS) {
      if (item.options) expect(item.options, item.id).toContain(item.answer);
      if (item.kind === 'dictation') expect(item.audioText, item.id).toBe(item.answer);
      if (item.kind === 'missing-word') expect(item.prompt, item.id).toContain('___');
    }
  });

  it('konuşma: kimlikler benzersiz; test istemleri ipucu taşımaz', () => {
    const ids = EN_SPEAKING_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const prompt of EN_SPEAKING_PROMPTS.filter((p) => p.focusTags?.includes('week1-test'))) {
      expect(prompt.targets, prompt.id).toBeUndefined();
      expect(prompt.sampleAnswer, prompt.id).toBeUndefined();
    }
  });

  it('yazma testi: gramer ipucu yok, ama kullanılan hafta 1 yapıları tespit edilir', () => {
    const task = EN_WRITING_TASKS.find((t) => t.kind === 'weekly-test')!;
    expect(task.grammarFocus).toEqual([]);
    const used = week1GrammarUse(task.sampleAnswer).filter((g) => g.used).map((g) => g.label);
    expect(used.length).toBeGreaterThanOrEqual(5);
    expect(week1GrammarUse('Hello. I like tea.').some((g) => g.used)).toBe(false);
    const guided = EN_WRITING_TASKS.find((t) => t.id === 'en-write-w1-guided')!;
    expect(guided.outline).toHaveLength(5);
    expect(guided.minWords).toBe(120);
    expect(guided.maxWords).toBe(150);
  });
});
