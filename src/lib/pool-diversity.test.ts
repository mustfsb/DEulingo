import { describe, expect, it } from 'vitest';
import { enContent } from './content-en';
import { buildSessionPlan } from './session';
import { createEmptyProgress } from './storage';
import { buildVocabSession } from './vocab/questions';
import { EN_WEEK_1_ACTIVITIES } from '../content/en/skills-weekly';
import { weekReviewPool, WEEK_REVIEW_META } from './week-review';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import type { WeekReviewSetId } from '../content/en/skills-weekly';

const SEEDS = 50;

const lessonPools = EN_WEEK_1_ACTIVITIES.flatMap((a) =>
  a.link.kind === 'lesson' && a.link.mode === 'section'
    ? [{ id: a.id, topicId: a.link.topicId, sectionId: a.link.sectionId! }]
    : [],
);

describe(`${SEEDS} tohumlu oturum çeşitliliği — bölüm/set havuzları`, () => {
  it.each(lessonPools.map((p) => [p.id, p] as const))('%s', (_id, p) => {
    const pool = enContent.exercisesForSection(p.sectionId);
    const freq = new Map<string, number>();
    const queues = new Set<string>();
    for (let s = 0; s < SEEDS; s += 1) {
      const queue = buildSessionPlan({
        pool, progress: createEmptyProgress(), mode: 'section', topicId: p.topicId, sectionId: p.sectionId, seed: `diversity:${s}`,
      }).primaryQueue.map((item) => item.exerciseId);
      // oturum içinde tekrar yok
      expect(new Set(queue).size, `${p.id} seed ${s} oturum içi tekrar`).toBe(queue.length);
      // yalnızca havuzdan
      for (const id of queue) expect(pool.some((e) => e.id === id), `${p.id} sızıntı`).toBe(true);
      queues.add(queue.join(','));
      queue.forEach((id) => freq.set(id, (freq.get(id) ?? 0) + 1));
    }
    // farklı tohum → farklı seçki
    expect(queues.size, `${p.id} farklı kuyruk`).toBeGreaterThanOrEqual(Math.round(SEEDS * 0.9));
    // uygun her öğeye ulaşılabilir
    expect(freq.size, `${p.id} ulaşılabilirlik`).toBe(pool.length);
    // küçük bir altküme baskın değil: en çok seçilen %10'luk dilim, tek biçimli
    // dağılımın en fazla 2,4 katı pay alır (zorluk kovaları hafif sapma üretir).
    const counts = [...freq.values()].sort((a, b) => b - a);
    const total = counts.reduce((sum, n) => sum + n, 0);
    const top = Math.max(1, Math.ceil(pool.length * 0.1));
    const share = counts.slice(0, top).reduce((sum, n) => sum + n, 0) / total;
    expect(share, `${p.id} baskın dilim (${share.toFixed(3)})`).toBeLessThanOrEqual(Math.min(1, (top / pool.length) * 2.4));
  });
});

describe(`${SEEDS} tohumlu oturum çeşitliliği — karma tekrar kümeleri`, () => {
  const sets: WeekReviewSetId[] = ['b-mini', 'd-mixed', 'g-weak', 'g-grammar'];
  it.each(sets)('%s', (setId) => {
    const meta = WEEK_REVIEW_META[setId];
    const queues = new Set<string>();
    const reached = new Set<string>();
    for (let s = 0; s < SEEDS; s += 1) {
      const pool = weekReviewPool(setId, createEmptyProgress(), EN_LESSON_EXERCISES, `div:${setId}:${s}`);
      const queue = buildSessionPlan({
        pool, progress: createEmptyProgress(), mode: 'gr-mixed', seed: `div:${setId}:${s}`, size: Math.min(meta.size, pool.length),
      }).primaryQueue.map((item) => item.exerciseId);
      expect(new Set(queue).size, `${setId} seed ${s}`).toBe(queue.length);
      expect(queue.length).toBe(Math.min(meta.size, pool.length));
      queues.add(queue.join(','));
      queue.forEach((id) => reached.add(id));
    }
    expect(queues.size).toBeGreaterThanOrEqual(Math.round(SEEDS * 0.9));
    // g-grammar altı konunun hepsini temsil eder
    if (setId === 'g-grammar') {
      const topics = new Set([...reached].map((id) => enContent.exercisesById.get(id)!.topicId));
      expect(topics.size).toBe(6);
    }
  });
});

describe('kelime oturumları (50 tohum)', () => {
  it.each(['flash', 'mixed', 'type', 'match'] as const)('%s: tekrarsız ve çeşitli', (kind) => {
    const queues = new Set<string>();
    const reached = new Set<string>();
    for (let s = 0; s < SEEDS; s += 1) {
      const questions = buildVocabSession({
        kind, topicId: 'en.prepositions-collocations', size: 'normal', seed: `v:${kind}:${s}`,
        progress: createEmptyProgress(), inventory: enContent.vocabulary,
      });
      const ids = questions.map((q) => q.exercise.id);
      expect(new Set(ids).size, `${kind} seed ${s}`).toBe(ids.length);
      queues.add(ids.join(','));
      questions.forEach((q) => q.vocabIds.forEach((id) => reached.add(id)));
    }
    expect(queues.size).toBeGreaterThan(1);
    expect(reached.size).toBeGreaterThan(10);
  });
});
