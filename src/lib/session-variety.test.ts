import { describe, expect, it } from 'vitest';
import { buildSessionPlan } from './session';
import { presentExercise, presentationSeed } from './presentation';
import { enContent } from './content-en';
import { createEmptyProgress } from './storage';

describe('oturum cesitliligi (secim + sunum)', () => {
  const pool = enContent.exercisesForTopic('en.present-perfect');

  it('ayni tohum ayni secimi, farkli tohum farkli sirayi uretebilir', () => {
    const a = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'normal', topicId: 'en.present-perfect', seed: 'sabit' });
    const b = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'normal', topicId: 'en.present-perfect', seed: 'sabit' });
    expect(a.primaryQueue.map((q) => q.exerciseId)).toEqual(b.primaryQueue.map((q) => q.exerciseId));

    const orders = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      const plan = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'normal', topicId: 'en.present-perfect', seed: `tohum-${i}` });
      orders.add(plan.primaryQueue.map((q) => q.exerciseId).join(','));
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('birincil sirada tekrar eden alistirma kimligi yok', () => {
    for (let i = 0; i < 10; i += 1) {
      const plan = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'normal', topicId: 'en.present-perfect', seed: `tekrar-${i}` });
      const ids = plan.primaryQueue.map((q) => q.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('sunum tohumu: ayni soru farkli olusumda farkli sira alabilir', () => {
    const exercise = enContent.exercisesById.get('en-pp-formula-mc-structure')!;
    const seen = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      const seed = presentationSeed(`2026-10-03T10:00:0${i}Z`, i, 'primary', exercise.id);
      seen.add(presentExercise(exercise, seed).options!.join('|'));
    }
    expect(seen.size).toBeGreaterThan(1);
    // ayni olusum kararli
    const seed = presentationSeed('t0', 0, 'primary', exercise.id);
    expect(presentExercise(exercise, seed).options).toEqual(presentExercise(exercise, seed).options);
  });
});
