import { describe, expect, it } from 'vitest';
import { MAX_RETRIES, scheduleRetry, type SessionPresentation } from './lesson';

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
