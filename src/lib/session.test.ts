import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle, Difficulty, Exercise } from '../content/types';
import {
  buildSession,
  buildSessionPlan,
  challengeReadiness,
  CHALLENGE_MAX_RECOGNITION_RATIO,
  isProductionTask,
  MIN_CHALLENGE_SIZE,
  scoreExercise,
  spaceFamilies,
  SCORE,
} from './session';
import { createEmptyProgress, type UserProgress } from './storage';
import { recordAttempt } from './progress';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const forDay = (day: number) => bundle.exercises.filter((exercise) => exercise.day === day && ((exercise as any).track ?? 'normal') === 'normal');
const beforeDay = (day: number) => bundle.exercises.filter((exercise) => exercise.day < day && ((exercise as any).track ?? 'normal') === 'normal');

function answer(
  progress: UserProgress,
  exercise: Exercise,
  result: 'correct' | 'incorrect' | 'minor-typo',
): UserProgress {
  return recordAttempt(progress, exercise, 'x', result);
}

describe('oturum secimi', () => {
  const pool = forDay(2);

  it('normal mod havuzdan daha kucuk bir secki uretir', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(15);
    expect(queue.length).toBeLessThanOrEqual(25);
    expect(queue.length).toBeLessThan(pool.length);
  });

  it('hizli tekrar kisa bir oturum uretir', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'quick', seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(5);
    expect(queue.length).toBeLessThanOrEqual(10);
  });

  it('ayni tohum ayni sirayi uretir (deterministik)', () => {
    const options = { pool, progress: createEmptyProgress(), mode: 'normal' as const, seed: 'sabit' };
    expect(buildSession(options)).toEqual(buildSession(options));
  });

  it('farkli tohum farkli sira uretir (tekrar yorgunlugu olmaz)', () => {
    const base = { pool, progress: createEmptyProgress(), mode: 'normal' as const };
    const first = buildSession({ ...base, seed: 'a' });
    const second = buildSession({ ...base, seed: 'b' });
    expect(first).not.toEqual(second);
  });

  it('ayni alistirmayi bir oturumda iki kez sormaz', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 's' });
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('tum modlarda birincil sunumlari peşinen benzersiz ve gerekçeli kurar', () => {
    for (const mode of ['normal', 'full', 'quick', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        const plan = buildSessionPlan({
          pool,
          previous: beforeDay(2),
          progress: createEmptyProgress(),
          mode,
          seed: `${mode}-${seed}`,
        });
        const ids = plan.primaryQueue.map((item) => item.exerciseId);
        expect(new Set(ids).size, `${mode}/${seed}`).toBe(ids.length);
        expect(plan.primaryQueue.every((item) => item.presentationReason === 'primary')).toBe(true);
        expect(plan.retryQueue).toEqual([]);
      }
    }
  });

  it('requested capacity is capped to unique eligible primaries instead of padding with copies', () => {
    const smallPool = pool.slice(0, 9);
    const plan = buildSessionPlan({
      pool: smallPool,
      progress: createEmptyProgress(),
      mode: 'normal',
      size: 15,
      seed: 'small-pool',
    });
    expect(plan.primaryQueue).toHaveLength(9);
    expect(new Set(plan.primaryQueue.map((item) => item.exerciseId)).size).toBe(9);
  });

  it('yalnizca istenen gunun havuzundan secer', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 's' });
    const ids = new Set(pool.map((exercise) => exercise.id));
    const previousIds = new Set(beforeDay(2).map((exercise) => exercise.id));
    for (const id of queue) expect(ids.has(id) || previousIds.has(id)).toBe(true);
  });

  it('set oturumu yalnızca seçilen ayrık seti tamamen ve rastgele sırada gösterir', () => {
    const setPool = forDay(2).filter(
      (exercise) => (exercise as Exercise & { exerciseSetId?: string }).exerciseSetId === 'set-1',
    );
    const options = {
      pool: forDay(2),
      progress: createEmptyProgress(),
      mode: 'set' as const,
      exerciseSetId: 'set-1' as const,
    };
    const first = buildSession({ ...options, seed: 'set-a' });
    const second = buildSession({ ...options, seed: 'set-b' });

    expect(first).toHaveLength(setPool.length);
    expect(new Set(first)).toEqual(new Set(setPool.map((exercise) => exercise.id)));
    expect(second).not.toEqual(first);
  });

  it('ilk üç gündeki her set 50 farklı tohumda eksiksiz, tekrarsız ve değişen sırayla gelir', () => {
    for (const day of [1, 2, 3]) {
      const pool = forDay(day);
      for (const exerciseSetId of ['set-1', 'set-2', 'set-3'] as const) {
        const expected = pool.filter((exercise) => exercise.exerciseSetId === exerciseSetId);
        const orders = new Set<string>();
        for (let seed = 0; seed < 50; seed += 1) {
          const plan = buildSessionPlan({
            pool,
            previous: beforeDay(day),
            progress: createEmptyProgress(),
            mode: 'set',
            exerciseSetId,
            seed: `set:${day}:${exerciseSetId}:${seed}`,
          });
          const ids = plan.primaryQueue.map((item) => item.exerciseId);
          expect(new Set(ids).size, `${day}/${exerciseSetId}/${seed}`).toBe(ids.length);
          expect(new Set(ids), `${day}/${exerciseSetId}/${seed}`).toEqual(new Set(expected.map((exercise) => exercise.id)));
          expect(plan.primaryQueue.every((item) => item.presentationReason === 'primary')).toBe(true);
          orders.add(ids.join('|'));
        }
        expect(orders.size, `${day}/${exerciseSetId}`).toBeGreaterThan(1);
      }
    }
  });
});

describe('zorluk dagilimi', () => {
  it('normal oturum agirlikli olarak orta seviyedir', () => {
    const pool = forDay(2);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    for (const id of queue) {
      const difficulty = byId.get(id)?.difficulty;
      if (difficulty) counts[difficulty] += 1;
    }
    expect(counts.medium).toBeGreaterThan(counts.easy);
    expect(counts.medium).toBeGreaterThan(counts.hard);
    expect(counts.hard).toBeGreaterThan(0);
  });

  it('zor mod kolay soru icermez', () => {
    const pool = forDay(3);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'challenge', seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    expect(queue.length).toBeGreaterThan(0);
    for (const id of queue) expect(byId.get(id)?.difficulty).not.toBe('easy');
  });

  it('zor mod uretim agirliklidir: coktan secmeli oturuma donusmez', () => {
    for (const day of [1, 2, 3]) {
      const pool = forDay(day);
      const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
      for (let seed = 0; seed < 12; seed += 1) {
        const queue = buildSession({
          pool,
          progress: createEmptyProgress(),
          mode: 'challenge',
          seed: `zor:${day}:${seed}`,
        });
        const chosen = queue.map((id) => byId.get(id)!);
        expect(chosen.length).toBeGreaterThanOrEqual(MIN_CHALLENGE_SIZE);
        expect(new Set(queue).size).toBe(queue.length);
        // Sesli gorev oz degerlendirmedir; zor oturumda yeri yoktur.
        expect(chosen.some((exercise) => exercise.type === 'spoken')).toBe(false);
        const production = chosen.filter(isProductionTask).length;
        expect(production / chosen.length).toBeGreaterThanOrEqual(1 - CHALLENGE_MAX_RECOGNITION_RATIO);
        expect(chosen.filter((exercise) => exercise.difficulty === 'hard').length).toBeGreaterThan(0);
      }
    }
  });

  it('zor havuz yetersizse en guclu orta uretimle tamamlanir', () => {
    const pool = forDay(2);
    const thin = [
      ...pool.filter((exercise) => exercise.difficulty === 'hard').slice(0, 2),
      ...pool.filter((exercise) => exercise.difficulty === 'medium').slice(0, 10),
    ];
    const queue = buildSession({ pool: thin, progress: createEmptyProgress(), mode: 'challenge', seed: 'ince' });
    expect(queue.length).toBeGreaterThanOrEqual(MIN_CHALLENGE_SIZE);
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('gercekten dar bir havuzda challenge hazir sayilmaz', () => {
    const pool = forDay(1);
    const tiny = pool.filter((exercise) => exercise.difficulty !== 'easy').slice(0, 3);
    expect(challengeReadiness(tiny).ready).toBe(false);
    expect(challengeReadiness(pool).ready).toBe(true);
  });

  it('tam calisma 30–50 benzersiz birincili sınırlar ve kapasiteyi dürüst gösterir', () => {
    const pool = forDay(1);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(30);
    expect(queue.length).toBeLessThanOrEqual(50);
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('tam calisma ana gun konularini kapsar ve sinirli onceki-gun tekrarini karistirir', () => {
    const pool = forDay(2);
    const queue = buildSession({
      pool,
      previous: beforeDay(2),
      progress: createEmptyProgress(),
      mode: 'full',
      seed: 's',
    });
    const current = new Set(pool.map((exercise) => exercise.id));
    const previous = new Set(beforeDay(2).map((exercise) => exercise.id));
    const review = queue.filter((id) => previous.has(id));
    expect(queue).toHaveLength(45);
    expect(queue.filter((id) => current.has(id)).length).toBeGreaterThan(0);
    expect(review.length).toBeGreaterThan(0);
    expect(review.length / queue.length).toBeLessThanOrEqual(0.25);
    const byId = new Map([...pool, ...beforeDay(2)].map((exercise) => [exercise.id, exercise]));
    const coveredTopics = new Set(queue.map((id) => byId.get(id)?.topicId));
    for (const topicId of new Set(pool.map((exercise) => exercise.topicId))) {
      expect(coveredTopics.has(topicId)).toBe(true);
    }
  });

  it('tam calisma da yapilandirilmis akisi kullanir (kolay baslar)', () => {
    const pool = forDay(2);
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', seed: 's' });
    expect(byId.get(queue[0])?.difficulty).toBe('easy');
  });
});

describe('tam calismada kelime-bankası çevirileri', () => {
  it('her gün iki yönü de %20–35 bandında içerir', () => {
    for (const day of [1, 2, 3]) {
      const pool = forDay(day);
      const queue = buildSession({
        pool,
        previous: beforeDay(day),
        progress: createEmptyProgress(),
        mode: 'full',
        seed: `wb-${day}`,
      });
      const all = new Map([...pool, ...beforeDay(day)].map((exercise) => [exercise.id, exercise]));
      const translations = queue.map((id) => all.get(id)).filter((exercise) => exercise?.type === 'word-bank-translation');
      expect(translations.length / queue.length).toBeGreaterThanOrEqual(0.2);
      expect(translations.length / queue.length).toBeLessThanOrEqual(0.35);
      expect(translations.some((exercise) => exercise?.wordBank?.direction === 'de-to-tr')).toBe(true);
      expect(translations.some((exercise) => exercise?.wordBank?.direction === 'tr-to-de')).toBe(true);
    }
  });

  it('normal modda kelime-bankaları baskın değildir', () => {
    const pool = forDay(3);
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 'normal-wb' });
    const translations = queue.filter((id) => byId.get(id)?.type === 'word-bank-translation');
    expect(translations.length / queue.length).toBeLessThan(0.4);
  });
});

describe('konu ve karma tekrar', () => {
  it('konu modu yalnizca o konunun alistirmalarini verir', () => {
    const pool = forDay(2);
    const topicId = 'day2.sein-haben';
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'topic', topicId, seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    expect(queue.length).toBeGreaterThan(0);
    for (const id of queue) expect(byId.get(id)?.topicId).toBe(topicId);
  });

  it('2. gunden itibaren onceki gunlerden alistirma karistirir', () => {
    const queue = buildSession({
      pool: forDay(2),
      previous: beforeDay(2),
      progress: createEmptyProgress(),
      mode: 'normal',
      seed: 's',
    });
    const previousIds = new Set(beforeDay(2).map((exercise) => exercise.id));
    const mixed = queue.filter((id) => previousIds.has(id));
    expect(mixed.length).toBeGreaterThan(0);
    // ~%20 civari, yarisindan fazlasi olmamali.
    expect(mixed.length).toBeLessThan(queue.length / 2);
  });

  it('Gün 4–6 normal ve tam çalışmada %80–85 güncel, yalnızca geçmişten tekrar içerir', () => {
    for (const day of [4, 5, 6]) {
      const currentPool = forDay(day);
      const previousPool = beforeDay(day);
      const currentIds = new Set(currentPool.map((exercise) => exercise.id));
      const previousById = new Map(previousPool.map((exercise) => [exercise.id, exercise]));

      for (const mode of ['normal', 'full'] as const) {
        for (let seed = 0; seed < 50; seed += 1) {
          const plan = buildSessionPlan({
            pool: currentPool,
            previous: previousPool,
            progress: createEmptyProgress(),
            mode,
            seed: `review:${day}:${mode}:${seed}`,
          });
          const ids = plan.primaryQueue.map((item) => item.exerciseId);
          const reviewIds = ids.filter((id) => !currentIds.has(id));
          const currentRatio = (ids.length - reviewIds.length) / ids.length;

          expect(currentRatio, `${day}/${mode}/${seed}`).toBeGreaterThanOrEqual(0.8);
          expect(currentRatio, `${day}/${mode}/${seed}`).toBeLessThanOrEqual(0.85);
          expect(reviewIds.every((id) => (previousById.get(id)?.day ?? day) < day), `${day}/${mode}/${seed}`).toBe(true);
        }
      }
    }
  });

  it('1. gunde onceki gun olmadigi icin karma tekrar bos kalir', () => {
    const queue = buildSession({
      pool: forDay(1),
      previous: beforeDay(1),
      progress: createEmptyProgress(),
      mode: 'normal',
      seed: 's',
    });
    const ids = new Set(forDay(1).map((exercise) => exercise.id));
    for (const id of queue) expect(ids.has(id)).toBe(true);
  });
});

describe('puanlama', () => {
  const [exercise] = forDay(2);

  it('hic gorulmemis alistirma yuksek puan alir', () => {
    const score = scoreExercise(exercise, createEmptyProgress(), new Map());
    expect(score).toBeGreaterThanOrEqual(SCORE.unseen);
  });

  it('yanlis cevaplanan, dogru cevaplanandan once gelir', () => {
    const wrong = answer(createEmptyProgress(), exercise, 'incorrect');
    const right = answer(createEmptyProgress(), exercise, 'correct');
    expect(scoreExercise(exercise, wrong, new Map())).toBeGreaterThan(
      scoreExercise(exercise, right, new Map()),
    );
  });

  it('tekrar eden hata ek oncelik alir', () => {
    let once = answer(createEmptyProgress(), exercise, 'incorrect');
    let twice = answer(once, exercise, 'incorrect');
    expect(scoreExercise(exercise, twice, new Map())).toBeGreaterThan(
      scoreExercise(exercise, once, new Map()),
    );
  });

  it('kucuk yazim hatasi kucuk bir oncelik ekler', () => {
    const typo = answer(createEmptyProgress(), exercise, 'minor-typo');
    const clean = answer(createEmptyProgress(), exercise, 'correct');
    expect(scoreExercise(exercise, typo, new Map())).toBeGreaterThan(
      scoreExercise(exercise, clean, new Map()),
    );
  });

  it('zayif kavram onceligi artirir', () => {
    const weak = new Map(exercise.conceptIds.map((id) => [id, 0.1] as const));
    const strong = new Map(exercise.conceptIds.map((id) => [id, 0.95] as const));
    const progress = createEmptyProgress();
    expect(scoreExercise(exercise, progress, weak)).toBeGreaterThan(
      scoreExercise(exercise, progress, strong),
    );
  });
});

describe('aile araligi', () => {
  const make = (id: string, familyId?: string): Exercise =>
    ({
      id,
      familyId,
      day: 1,
      topic: 't',
      topicId: 'day1.t',
      type: 'fill-blank',
      instruction: 'x',
      difficulty: 'easy',
      skill: 'recall',
      conceptIds: [],
      origin: 'authored',
      source: { file: 'a', day: 1, naturalKey: id },
    }) as Exercise;

  it('ayni aileden sorulari arka arkaya gostermez', () => {
    const items = [
      make('1', 'f'),
      make('2', 'f'),
      make('3', 'f'),
      make('4', 'g'),
      make('5', 'h'),
      make('6', 'i'),
      make('7', 'j'),
    ];
    const spaced = spaceFamilies(items);
    const families = spaced.map((item) => item.familyId);
    for (let i = 1; i < families.length; i++) {
      expect(families[i]).not.toBe(families[i - 1]);
    }
    expect(spaced).toHaveLength(items.length);
  });

  it('hicbir alistirmayi kaybetmez ya da cogaltmaz', () => {
    const items = [make('1', 'f'), make('2', 'f'), make('3', 'f')];
    const spaced = spaceFamilies(items);
    expect(spaced.map((item) => item.id).sort()).toEqual(['1', '2', '3']);
  });

  it('gercek oturumda ayni aile arka arkaya gelmez', () => {
    const pool = forDay(2);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', seed: 'x' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    for (let i = 1; i < queue.length; i++) {
      const current = byId.get(queue[i])?.familyId;
      const previous = byId.get(queue[i - 1])?.familyId;
      if (current && previous) expect(current).not.toBe(previous);
    }
  });

  it('gec yerleştirme durumunda da alternatif aile varken ayni aileyi bitiştirmez', () => {
    const pool = forDay(1);
    const queue = buildSession({
      pool,
      progress: createEmptyProgress(),
      mode: 'normal',
      seed: 'audit:1:normal:17',
    });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    for (let index = 1; index < queue.length; index += 1) {
      const previous = byId.get(queue[index - 1])?.familyId;
      const current = byId.get(queue[index])?.familyId;
      expect(previous && current ? previous === current : false, `${queue[index - 1]} → ${queue[index]}`).toBe(false);
    }
  });
});
