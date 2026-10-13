import { describe, expect, it } from 'vitest';
import { buildReviewQueue, MAX_RETRIES, scheduleRetry, type SessionPresentation } from './lesson';
import type { Exercise } from '../content/types';
import { recordAttempt } from './progress';
import { createEmptyProgress } from './storage';

const fake = (id: string): Exercise => ({
  id, topicId: 'topic.perfekt', topic: 'Perfekt', type: 'free-text',
  instruction: 'Yaz', answer: 'a', conceptIds: [], origin: 'authored',
  source: { file: 't', naturalKey: id }, difficulty: 'medium', skill: 'recall',
});

const primary = (exerciseId: string): SessionPresentation => ({ exerciseId, presentationReason: 'primary' });

describe('oturum ici hata tekrarlari', () => {
  it('yanlis birincili en fazla bir kez, açik mistake-retry gerekçesiyle planlar', () => {
    const queue = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(primary);
    const first = scheduleRetry(queue, 0, 'a', {});
    const retry = first.queue.find((item) => item.presentationReason === 'mistake-retry');

    expect(MAX_RETRIES).toBe(1);
    expect(retry).toEqual({ exerciseId: 'a', presentationReason: 'mistake-retry' });
    expect(scheduleRetry(first.queue, 0, 'a', first.retries).queue).toEqual(first.queue);
  });

  it('yeterli soru varken ilk sunum ile retry arasina en az üç farkli alistirma koyar', () => {
    const queue = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(primary);
    const scheduled = scheduleRetry(queue, 0, 'a', {});
    const retryIndex = scheduled.queue.findIndex((item) => item.presentationReason === 'mistake-retry');
    const between = scheduled.queue.slice(1, retryIndex).map((item) => item.exerciseId);
    expect(new Set(between).size).toBeGreaterThanOrEqual(3);
  });
});

describe('hata kuyrugu esit-puan cesitliligi', () => {
  it('tohumsuz kararli, tohumlu esitler karisir, zayif-oncelik korunur', () => {
    const exercises = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map(fake);
    let progress = createEmptyProgress();
    // m1 agir hata (2 yanlis), digerleri esit (1 yanlis)
    for (const id of ['m1', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6']) {
      const ex = exercises.find((e) => e.id === id)!;
      progress = recordAttempt(progress, ex, 'yanlis', 'incorrect');
    }
    expect(buildReviewQueue(exercises, progress)).toEqual(buildReviewQueue(exercises, progress));
    const seeded = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      const queue = buildReviewQueue(exercises, progress, 12, `hata-${i}`);
      // en zayif her zaman basta
      expect(queue[0]).toBe('m1');
      seeded.add(queue.join(','));
    }
    expect(seeded.size).toBeGreaterThan(1);
  });
});
