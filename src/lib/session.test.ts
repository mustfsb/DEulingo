import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle, Difficulty, Exercise } from '../content/types';
import {
  buildSession,
  buildSessionPlan,
  challengeReadiness,
  CHALLENGE_MAX_RECOGNITION_RATIO,
  familyCap,
  isProductionTask,
  MIN_CHALLENGE_SIZE,
  scoreExercise,
  sessionSize,
  spaceFamilies,
  SCORE,
  SESSION_CLOSING_TASKS,
  SESSION_SIZE_OVERRIDES,
} from './session';
import { createEmptyProgress, type UserProgress } from './storage';
import { recordAttempt } from './progress';
import { T } from '../content/curriculum/topics';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const lesson = bundle.exercises.filter((exercise) => !exercise.reviewOnly);
/** Konu havuzu: birincil + ikincil etiketli ders alıştırmaları. */
const forTopic = (topicId: string) =>
  lesson.filter((exercise) => exercise.topicId === topicId || exercise.secondaryTopicIds?.includes(topicId));

function answer(
  progress: UserProgress,
  exercise: Exercise,
  result: 'correct' | 'incorrect' | 'minor-typo',
): UserProgress {
  return recordAttempt(progress, exercise, 'x', result);
}

describe('oturum secimi', () => {
  const topicId = T.articles;
  const pool = forTopic(topicId);

  it('normal mod havuzdan daha kucuk bir secki uretir', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(15);
    expect(queue.length).toBeLessThanOrEqual(25);
    expect(queue.length).toBeLessThan(pool.length);
  });

  it('hizli tekrar kisa bir oturum uretir', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'quick', topicId, seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(5);
    expect(queue.length).toBeLessThanOrEqual(10);
  });

  it('ayni tohum ayni sirayi uretir (deterministik)', () => {
    const options = { pool, progress: createEmptyProgress(), mode: 'normal' as const, topicId, seed: 'sabit' };
    expect(buildSession(options)).toEqual(buildSession(options));
  });

  it('farkli tohum farkli sira uretir (tekrar yorgunlugu olmaz)', () => {
    const base = { pool, progress: createEmptyProgress(), mode: 'normal' as const, topicId };
    expect(buildSession({ ...base, seed: 'a' })).not.toEqual(buildSession({ ...base, seed: 'b' }));
  });

  it('ayni alistirmayi bir oturumda iki kez sormaz', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 's' });
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('tum modlarda birincil sunumlari peşinen benzersiz ve gerekçeli kurar', () => {
    for (const mode of ['normal', 'full', 'quick', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        const plan = buildSessionPlan({ pool, progress: createEmptyProgress(), mode, topicId, seed: `${mode}-${seed}` });
        const ids = plan.primaryQueue.map((item) => item.exerciseId);
        expect(new Set(ids).size, `${mode}/${seed}`).toBe(ids.length);
        expect(plan.primaryQueue.every((item) => item.presentationReason === 'primary')).toBe(true);
        expect(plan.retryQueue).toEqual([]);
      }
    }
  });

  it('requested capacity is capped to unique eligible primaries instead of padding with copies', () => {
    const plan = buildSessionPlan({ pool: pool.slice(0, 9), progress: createEmptyProgress(), mode: 'normal', size: 15, seed: 'small-pool' });
    expect(plan.primaryQueue).toHaveLength(9);
    expect(new Set(plan.primaryQueue.map((item) => item.exerciseId)).size).toBe(9);
  });

  it('yalnizca verilen konu havuzundan secer (onceki-gun karisimi yok)', () => {
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', topicId, seed: 's' });
    const ids = new Set(pool.map((exercise) => exercise.id));
    for (const id of queue) expect(ids.has(id)).toBe(true);
  });

  it('bolum modu yalnizca secilen ozet bolumunun alistirmalarini gosterir', () => {
    const sectionId = 'articles.negation';
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'section', topicId, sectionId, seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    expect(queue.length).toBeGreaterThan(0);
    for (const id of queue) expect(byId.get(id)?.sectionId).toBe(sectionId);
    expect(buildSession({ pool, progress: createEmptyProgress(), mode: 'section', topicId, seed: 's' })).toEqual([]);
  });
});

describe('konu onceligi ve boyut', () => {
  it('konunun birincil alistirmalari esit puanda ikincil etiketlilerin onune gecer', () => {
    const topicId = T.sentenceBuilding;
    const pool = forTopic(topicId);
    const primaryShare = pool.filter((exercise) => exercise.topicId === topicId).length / pool.length;
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const ids = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 'oncelik' });
    const share = ids.filter((id) => byId.get(id)?.topicId === topicId).length / ids.length;
    // Havuzun yalnizca ~%32'si birincil; oturumda birincil pay belirgin bicimde yuksektir.
    expect(primaryShare).toBeLessThan(0.4);
    expect(share).toBeGreaterThan(primaryShare + 0.2);
  });

  it('konu istisnalari yalnizca konu modlarini etkiler', () => {
    expect(SESSION_SIZE_OVERRIDES[T.modalVerbs]?.normal).toBe(22);
    expect(sessionSize('normal', 500, T.modalVerbs)).toBe(22);
    expect(sessionSize('normal', 500, T.greetings)).toBe(18);
    expect(sessionSize('gr-mixed', 500, T.modalVerbs)).toBe(28);
    for (const key of [...Object.keys(SESSION_SIZE_OVERRIDES), ...Object.keys(SESSION_CLOSING_TASKS)]) {
      expect(key).toMatch(/^topic\./);
    }
  });

  it('kapanis gorevi kayitli konu ve modda en sona konur', () => {
    const topicId = T.modalVerbs;
    const pool = forTopic(topicId);
    const ids = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', topicId, seed: 'kapanis' });
    expect(ids.at(-1)).toBe('mv-free-morgen');
    const normal = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 'kapanis' });
    expect(normal.at(-1)).not.toBe('mv-free-morgen');
  });
});

describe('zorluk dagilimi', () => {
  it('normal oturum agirlikli olarak orta seviyedir', () => {
    const topicId = T.articles;
    const pool = forTopic(topicId);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 's' });
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
    const topicId = T.sentenceBuilding;
    const pool = forTopic(topicId);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'challenge', topicId, seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    expect(queue.length).toBeGreaterThan(0);
    for (const id of queue) expect(byId.get(id)?.difficulty).not.toBe('easy');
  });

  it('zor mod uretim agirliklidir: coktan secmeli oturuma donusmez', () => {
    for (const topicId of [T.greetings, T.articles, T.sentenceBuilding, T.modalVerbs]) {
      const pool = forTopic(topicId);
      const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
      for (let seed = 0; seed < 12; seed += 1) {
        const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'challenge', topicId, seed: `zor:${topicId}:${seed}` });
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
    const pool = forTopic(T.articles);
    const thin = [
      ...pool.filter((exercise) => exercise.difficulty === 'hard').slice(0, 2),
      ...pool.filter((exercise) => exercise.difficulty === 'medium').slice(0, 10),
    ];
    const queue = buildSession({ pool: thin, progress: createEmptyProgress(), mode: 'challenge', seed: 'ince' });
    expect(queue.length).toBeGreaterThanOrEqual(MIN_CHALLENGE_SIZE);
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('gercekten dar bir havuzda challenge hazir sayilmaz', () => {
    const pool = forTopic(T.greetings);
    const tiny = pool.filter((exercise) => exercise.difficulty !== 'easy').slice(0, 3);
    expect(challengeReadiness(tiny).ready).toBe(false);
    expect(challengeReadiness(pool).ready).toBe(true);
  });

  it('tam calisma 30–50 benzersiz birincili sınırlar ve kapasiteyi dürüst gösterir', () => {
    const topicId = T.personalInfo;
    const queue = buildSession({ pool: forTopic(topicId), progress: createEmptyProgress(), mode: 'full', topicId, seed: 's' });
    expect(queue.length).toBeGreaterThanOrEqual(30);
    expect(queue.length).toBeLessThanOrEqual(50);
    expect(new Set(queue).size).toBe(queue.length);
  });

  it('tam calisma konunun bolumlerini kapsar', () => {
    const topicId = T.articles;
    const pool = forTopic(topicId);
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', topicId, seed: 's' });
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const covered = new Set(queue.map((id) => byId.get(id)?.sectionId));
    const ownSections = new Set(pool.filter((exercise) => exercise.topicId === topicId).map((exercise) => exercise.sectionId));
    for (const sectionId of ownSections) expect(covered.has(sectionId), sectionId).toBe(true);
  });

  it('tam calisma da yapilandirilmis akisi kullanir (kolay baslar)', () => {
    const topicId = T.articles;
    const pool = forTopic(topicId);
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', topicId, seed: 's' });
    expect(byId.get(queue[0])?.difficulty).toBe('easy');
  });
});

describe('tam calismada kelime-bankası çevirileri', () => {
  it('havuzda varsa iki yonu de oturumlara tasir (baskin olmadan)', () => {
    for (const topicId of [T.modalVerbs, T.time]) {
      const pool = forTopic(topicId);
      const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
      const seenDirections = new Set<string>();
      let translationSessions = 0;
      for (let seed = 0; seed < 10; seed += 1) {
        const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'full', topicId, seed: `wb-${topicId}-${seed}` });
        const translations = queue.map((id) => byId.get(id)).filter((exercise) => exercise?.type === 'word-bank-translation');
        expect(translations.length / queue.length).toBeLessThanOrEqual(0.5);
        if (translations.length) translationSessions += 1;
        for (const item of translations) if (item?.wordBank) seenDirections.add(item.wordBank.direction);
      }
      expect(translationSessions, topicId).toBeGreaterThan(0);
      expect(seenDirections.has('de-to-tr'), topicId).toBe(true);
      expect(seenDirections.has('tr-to-de'), topicId).toBe(true);
    }
  });

  it('normal modda kelime-bankaları baskın değildir', () => {
    const topicId = T.separableVerbs;
    const pool = forTopic(topicId);
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: 'normal-wb' });
    const translations = queue.filter((id) => byId.get(id)?.type === 'word-bank-translation');
    expect(translations.length / queue.length).toBeLessThan(0.4);
  });
});

describe('puanlama', () => {
  const [exercise] = forTopic(T.articles);

  it('hic gorulmemis alistirma yuksek puan alir', () => {
    expect(scoreExercise(exercise, createEmptyProgress(), new Map())).toBeGreaterThanOrEqual(SCORE.unseen);
  });

  it('yanlis cevaplanan, dogru cevaplanandan once gelir', () => {
    const wrong = answer(createEmptyProgress(), exercise, 'incorrect');
    const right = answer(createEmptyProgress(), exercise, 'correct');
    expect(scoreExercise(exercise, wrong, new Map())).toBeGreaterThan(scoreExercise(exercise, right, new Map()));
  });

  it('tekrar eden hata ek oncelik alir', () => {
    const once = answer(createEmptyProgress(), exercise, 'incorrect');
    const twice = answer(once, exercise, 'incorrect');
    expect(scoreExercise(exercise, twice, new Map())).toBeGreaterThan(scoreExercise(exercise, once, new Map()));
  });

  it('kucuk yazim hatasi kucuk bir oncelik ekler', () => {
    const typo = answer(createEmptyProgress(), exercise, 'minor-typo');
    const clean = answer(createEmptyProgress(), exercise, 'correct');
    expect(scoreExercise(exercise, typo, new Map())).toBeGreaterThan(scoreExercise(exercise, clean, new Map()));
  });

  it('zayif kavram onceligi artirir', () => {
    const weak = new Map(exercise.conceptIds.map((id) => [id, 0.1] as const));
    const strong = new Map(exercise.conceptIds.map((id) => [id, 0.95] as const));
    const progress = createEmptyProgress();
    expect(scoreExercise(exercise, progress, weak)).toBeGreaterThan(scoreExercise(exercise, progress, strong));
  });
});

describe('aile araligi', () => {
  const make = (id: string, familyId?: string): Exercise =>
    ({
      id,
      familyId,
      topic: 't',
      topicId: T.greetings,
      type: 'fill-blank',
      instruction: 'x',
      difficulty: 'easy',
      skill: 'recall',
      conceptIds: [],
      origin: 'authored',
      source: { file: 'a', naturalKey: id },
    }) as Exercise;

  it('ayni aileden sorulari arka arkaya gostermez', () => {
    const items = [make('1', 'f'), make('2', 'f'), make('3', 'f'), make('4', 'g'), make('5', 'h'), make('6', 'i'), make('7', 'j')];
    const spaced = spaceFamilies(items);
    const families = spaced.map((item) => item.familyId);
    for (let i = 1; i < families.length; i++) expect(families[i]).not.toBe(families[i - 1]);
    expect(spaced).toHaveLength(items.length);
  });

  it('hicbir alistirmayi kaybetmez ya da cogaltmaz', () => {
    const spaced = spaceFamilies([make('1', 'f'), make('2', 'f'), make('3', 'f')]);
    expect(spaced.map((item) => item.id).sort()).toEqual(['1', '2', '3']);
  });

  it('kucuk konu havuzunda tek aile oturumu doldurmaz (aile siniri)', () => {
    const topicId = T.greetings;
    const pool = forTopic(topicId);
    const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
    for (let seed = 0; seed < 50; seed += 1) {
      const queue = buildSession({ pool, progress: createEmptyProgress(), mode: 'normal', topicId, seed: `aile:${seed}` });
      const counts = new Map<string, number>();
      for (const id of queue) {
        const family = byId.get(id)?.familyId;
        if (family) counts.set(family, (counts.get(family) ?? 0) + 1);
      }
      for (const [family, count] of counts) expect(count, `${family}#${seed}`).toBeLessThanOrEqual(familyCap(queue.length));
    }
  });

  it('gercek oturumlarda ayni aile arka arkaya gelmez', () => {
    for (const topicId of [T.greetings, T.questions, T.articles, T.modalVerbs]) {
      const pool = forTopic(topicId);
      const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
      for (const mode of ['normal', 'quick'] as const) {
        for (let seed = 0; seed < 50; seed += 1) {
          const queue = buildSession({ pool, progress: createEmptyProgress(), mode, topicId, seed: `bitisik:${topicId}:${mode}:${seed}` });
          for (let index = 1; index < queue.length; index += 1) {
            const previous = byId.get(queue[index - 1])?.familyId;
            const current = byId.get(queue[index])?.familyId;
            expect(previous && current ? previous === current : false, `${queue[index - 1]} → ${queue[index]}`).toBe(false);
          }
        }
      }
    }
  });
});
