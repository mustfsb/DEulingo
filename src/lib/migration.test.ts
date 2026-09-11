/**
 * İlerleme göçleri.
 *
 * - v8 → v9: private izlek verisi kanonik müfredata taşınır, normal izlek düşer.
 * - v9 → v10: gün tabanlı durum konu tabanlı duruma taşınır. Deneme geçmişi
 *   kayıpsız kalır (ustalık/tamamlanma konu bazında yeniden türetilir), gün
 *   sayaçları arşive gider, özet anahtarları yeni bölümlere eşlenir.
 * - Göçler deterministik ve idempotenttir.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle } from '../content/types';
import {
  createEmptyProgress,
  loadProgress,
  migrate,
  parseImportedProgress,
  saveProgress,
  STORAGE_KEY,
  STORAGE_VERSION,
  type ExerciseProgress,
  type MigrationContext,
  type UserProgress,
} from './storage';
import { computeTopicMastery } from './mastery';
import { getTopicProgressStats } from './progress';
import { T } from '../content/curriculum/topics';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const byId = new Map(bundle.exercises.map((exercise) => [exercise.id, exercise]));
const context: MigrationContext = {
  topicOfExercise: (id) => {
    const exercise = byId.get(id);
    return exercise ? { topicId: exercise.topicId, title: exercise.topic } : undefined;
  },
};
const NOW = '2026-09-01T10:00:00.000Z';

function entry(id: string, day: number, options: { incorrect?: number; track?: 'private' | 'normal'; correct?: number } = {}) {
  const incorrect = options.incorrect ?? 0;
  const correct = options.correct ?? (incorrect > 0 ? 0 : 1);
  const attempts = [
    ...Array.from({ length: correct }, (_, index) => ({ result: 'correct' as const, attemptNumber: index + 1 })),
    ...Array.from({ length: incorrect }, (_, index) => ({ result: 'incorrect' as const, attemptNumber: correct + index + 1 })),
  ].map((attempt) => ({ ...attempt, timestamp: NOW, input: 'x', normalizedInput: 'x', expected: 'y' }));
  return {
    exerciseId: id,
    day,
    track: options.track ?? 'private',
    attempts,
    firstSeenAt: NOW,
    lastSeenAt: NOW,
    correctCount: correct,
    incorrectCount: incorrect,
    typoCount: 0,
    mastered: correct >= 2,
  } as unknown as ExerciseProgress;
}

function mistake(id: string, day: number, topic: string, track: 'private' | 'normal' = 'private') {
  return {
    exerciseId: id,
    track,
    day,
    topic,
    prompt: 'soru',
    userAnswer: 'yanlış',
    expectedAnswer: 'doğru',
    count: 1,
    typoCount: 0,
    lastOccurredAt: NOW,
    type: 'grammar',
  } as unknown as UserProgress['mistakes'][string];
}

/* ------------------------------------------------------------------ */
/* v8 → v9 (zincirin başı)                                             */
/* ------------------------------------------------------------------ */

/** Gerçekçi bir v8 kaydı: iki izlekte de veri var. */
function v8Fixture(): UserProgress {
  const base = createEmptyProgress();
  return {
    ...base,
    version: 8,
    days: { 1: { day: 1, sessionsCompleted: 9 } },
    tracks: {
      normal: { days: { 1: { day: 1, sessionsCompleted: 9 } } },
      private: { days: { 1: { day: 1, sessionsCompleted: 4 }, 3: { day: 3, sessionsCompleted: 2 } } },
    },
    exercises: {
      'p1-vor-wie-heisst-mc': entry('p1-vor-wie-heisst-mc', 1),
      'p3-af-kural-mc': entry('p3-af-kural-mc', 3, { incorrect: 1 }),
      'd1-eski-soru': entry('d1-eski-soru', 1, { track: 'normal' }),
    },
    mistakes: {
      'p3-af-kural-mc': mistake('p3-af-kural-mc', 3, 'Ayrılabilen Fiiller'),
      'd1-eski-soru': mistake('d1-eski-soru', 1, 'Eski konu', 'normal'),
    },
    stats: {
      totalAttempts: 3,
      totalCorrect: 1,
      totalTypos: 0,
      totalIncorrect: 1,
      lastStudiedAt: NOW,
      studyDates: ['2026-09-01'],
    },
  } as UserProgress;
}

describe('v8 → v9 → v10 zinciri', () => {
  it('surumu en guncele yukseltir; izlek ve gun anahtarlarini kaldirir', () => {
    const migrated = migrate(structuredClone(v8Fixture()), context)!;
    expect(STORAGE_VERSION).toBe(10);
    expect(migrated.version).toBe(10);
    expect(migrated.tracks).toBeUndefined();
    expect(migrated.days).toBeUndefined();
    expect(migrated.topics).toEqual({});
  });

  it('private denemeleri ve hatalari aynen tasinir; normal izlek verisi tasinmaz', () => {
    const migrated = migrate(structuredClone(v8Fixture()), context)!;
    expect(Object.keys(migrated.exercises).sort()).toEqual(['p1-vor-wie-heisst-mc', 'p3-af-kural-mc']);
    expect(migrated.exercises['p1-vor-wie-heisst-mc'].correctCount).toBe(1);
    expect(Object.keys(migrated.mistakes)).toEqual(['p3-af-kural-mc']);
  });

  it('gun sayaclarinda private kazanir ve sayaclar arsive tasinir', () => {
    const migrated = migrate(structuredClone(v8Fixture()), context)!;
    expect(migrated.legacy?.days?.[1]?.sessionsCompleted).toBe(4);
    expect(migrated.legacy?.days?.[3]?.sessionsCompleted).toBe(2);
  });

  it('istatistikler tasinan kayitlardan yeniden hesaplanir, tarihler korunur', () => {
    const migrated = migrate(structuredClone(v8Fixture()), context)!;
    expect(migrated.stats.totalAttempts).toBe(2);
    expect(migrated.stats.totalCorrect).toBe(1);
    expect(migrated.stats.totalIncorrect).toBe(1);
    expect(migrated.stats.studyDates).toEqual(['2026-09-01']);
  });

  it('normal yarim dersi cope gider; private yarim ders tekrar oturumu olarak surer', () => {
    const lesson = (track: 'private' | 'normal', day: number, id: string) => ({
      ...structuredClone(v8Fixture()),
      activeLesson: {
        mode: 'day',
        track,
        day,
        queue: [{ exerciseId: id, presentationReason: 'primary' }],
        index: 0,
        startedAt: NOW,
        results: [],
        retries: {},
      },
    });
    const kept = migrate(lesson('private', 3, 'p3-af-kural-mc'), context)?.activeLesson;
    expect(kept?.mode).toBe('review');
    expect(kept?.legacyDay).toBe(3);
    expect(migrate(lesson('normal', 1, 'd1-eski-soru'), context)?.activeLesson).toBeUndefined();
  });

  it('yeni kurulumda goc sorunu yok', () => {
    const migrated = migrate(structuredClone(createEmptyProgress()))!;
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(migrated.exercises).toEqual({});
    expect(migrated.topics).toEqual({});
    expect(migrated.legacy).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/* v9 → v10                                                             */
/* ------------------------------------------------------------------ */

/** Gerçekçi bir v9 kaydı: 1, 5, 7 ve 10. Gün çalışılmış. */
function v9Fixture(): UserProgress {
  const base = createEmptyProgress();
  return {
    ...base,
    version: 9,
    days: {
      1: { day: 1, sessionsCompleted: 3, lastCompletedAt: NOW },
      7: { day: 7, sessionsCompleted: 2 },
      10: { day: 10, sessionsCompleted: 1 },
    },
    exercises: {
      // Saat → Saatler ve Zaman
      'p10-halb-mc-anlam': entry('p10-halb-mc-anlam', 10, { correct: 2 }),
      // aufstehen → Ayrılabilen Fiiller
      'p10-tre-listen-aufstehen': entry('p10-tre-listen-aufstehen', 10, { correct: 1, incorrect: 1 }),
      // Mein Tag → Mein Tag
      'p10-sabah-gesicht-fill': entry('p10-sabah-gesicht-fill', 10),
      // Ev → Ev ve Mobilyalar
      'p7-evim-free-tam-anlatim': entry('p7-evim-free-tam-anlatim', 7, { incorrect: 1 }),
      // Yemek → Essen und Trinken (5. ve 7. Gün aynı konuda birleşir)
      'p5-yem-ei-mc': entry('p5-yem-ei-mc', 5),
      'p7-ess-frage-mc': entry('p7-ess-frage-mc', 7),
      // Emekli meta soru: deneme geçmişi kaybolmaz (iz olarak kalır)
      'p10-hed-giris-mc': entry('p10-hed-giris-mc', 10),
      // Genel Tekrar
      'gr-cum-l4-stehe-sieben-auf': entry('gr-cum-l4-stehe-sieben-auf', 0),
    },
    mistakes: {
      'p10-tre-listen-aufstehen': mistake('p10-tre-listen-aufstehen', 10, 'Ayrılabilen Fiiller — çekirdek'),
      'p7-evim-free-tam-anlatim': mistake('p7-evim-free-tam-anlatim', 7, 'Evimi Anlatıyorum'),
      'p10-hed-giris-mc': mistake('p10-hed-giris-mc', 10, 'Günün hedefi'),
    },
    activeLesson: {
      mode: 'day',
      day: 10,
      sessionMode: 'normal',
      queue: [
        { exerciseId: 'p10-halb-mc-anlam', presentationReason: 'primary' },
        { exerciseId: 'p10-hed-giris-mc', presentationReason: 'primary' },
        { exerciseId: 'p10-tre-listen-aufstehen', presentationReason: 'primary' },
        { exerciseId: 'p10-sabah-gesicht-fill', presentationReason: 'primary' },
      ],
      index: 2,
      startedAt: NOW,
      results: [
        { exerciseId: 'p10-halb-mc-anlam', result: 'correct', presentationReason: 'primary' },
        { exerciseId: 'p10-hed-giris-mc', result: 'correct', presentationReason: 'primary' },
      ],
      retries: {},
    },
    lastResult: {
      sessionId: 'day|private|7|normal|-|-|2026-09-01T09:00:00.000Z',
      mode: 'day',
      day: 7,
      sessionMode: 'normal',
      exerciseIds: ['p7-evim-free-tam-anlatim', 'p7-ess-frage-mc'],
      incorrectExerciseIds: ['p7-evim-free-tam-anlatim'],
      unresolvedExerciseIds: ['p7-evim-free-tam-anlatim'],
      typoExerciseIds: [],
      skippedExerciseIds: [],
      total: 2,
      correctCount: 1,
      incorrectCount: 1,
      typoCount: 0,
      skippedCount: 0,
      selfAssessedCount: 0,
      accuracy: 0.5,
      strongestConceptIds: ['private.day5.yiyecek.kelimeler'],
      weakestConceptIds: ['private.day7.evim.model', 'private.day7.evim.balkon'],
      topics: [
        { topicId: 'private.day7.essen-trinken', title: 'Essen und Trinken', correct: 1, total: 1 },
        { topicId: 'private.day7.ev-odalar', title: 'Ev ve Odalar', correct: 0, total: 1 },
        { topicId: 'private.day7.mobilyalar', title: 'Mobilyalar', correct: 1, total: 1 },
      ],
      bestStreak: 1,
      perfect: false,
      completedAt: '2026-09-01T09:30:00.000Z',
    },
    settings: {
      ...base.settings,
      readSummaries: {
        'private.day10.um-uhr': '2026-08-30T10:00:00.000Z',
        'private.day10.uhrzeit-frage': '2026-08-29T10:00:00.000Z',
        'private.day7.ev-odalar': '2026-08-20T10:00:00.000Z',
        'private.day7.hedef': '2026-08-20T10:00:00.000Z',
        'genel.saat': '2026-08-31T10:00:00.000Z',
      },
      bookmarks: ['private.day10.kern-verben', 'private.day5.yiyecek', 'genel.saat', 'private.day7.hedef'],
    },
    stats: { totalAttempts: 11, totalCorrect: 8, totalTypos: 0, totalIncorrect: 3, lastStudiedAt: NOW, studyDates: ['2026-09-01'] },
  } as unknown as UserProgress;
}

describe('v9 → v10 konu tabanli goc', () => {
  const migrated = migrate(structuredClone(v9Fixture()), context)!;

  it('surum 10; gun haritasi salt okunur arsive tasinir, konu sayaclari sifirdan baslar', () => {
    expect(migrated.version).toBe(10);
    expect(migrated.days).toBeUndefined();
    expect(migrated.legacy?.days).toEqual(v9Fixture().days);
    expect(migrated.legacy?.migratedFromVersion).toBe(9);
    expect(migrated.topics).toEqual({});
  });

  it('deneme gecmisi kayipsiz kalir; gun yalnizca legacyDay izi olur', () => {
    expect(Object.keys(migrated.exercises).sort()).toEqual(Object.keys(v9Fixture().exercises).sort());
    for (const [id, item] of Object.entries(migrated.exercises)) {
      const before = v9Fixture().exercises[id] as unknown as { day: number; attempts: unknown[] };
      expect(item.attempts, id).toEqual(before.attempts);
      expect(item.legacyDay, id).toBe(before.day);
      expect((item as unknown as { day?: unknown }).day, id).toBeUndefined();
      expect((item as unknown as { track?: unknown }).track, id).toBeUndefined();
    }
    expect(migrated.stats).toEqual(v9Fixture().stats);
  });

  it('temsili esleme: saat → Saatler, aufstehen → Ayrılabilen Fiiller, rutin → Mein Tag, ev → Ev, yemek → Essen und Trinken', () => {
    const topicOf = (id: string) => context.topicOfExercise(id)?.topicId;
    expect(topicOf('p10-halb-mc-anlam')).toBe(T.time);
    expect(topicOf('p10-tre-listen-aufstehen')).toBe(T.separableVerbs);
    expect(topicOf('p10-sabah-gesicht-fill')).toBe(T.dailyRoutine);
    expect(topicOf('p7-evim-free-tam-anlatim')).toBe(T.home);
    expect(topicOf('p5-yem-ei-mc')).toBe(T.food);
    expect(topicOf('p7-ess-frage-mc')).toBe(T.food);
  });

  it('ustalik ve tamamlanma gecmisten konu bazinda yeniden turetilir', () => {
    const lesson = bundle.exercises.filter((exercise) => !exercise.reviewOnly);
    const mastery = new Map(
      computeTopicMastery(migrated, bundle.exercises, bundle.topics.map((topic) => ({ id: topic.id, title: topic.title, conceptIds: topic.conceptIds }))).map(
        (item) => [item.topicId, item],
      ),
    );
    for (const topicId of [T.time, T.separableVerbs, T.dailyRoutine, T.food]) {
      expect(mastery.get(topicId)?.practiced, topicId).toBeGreaterThan(0);
    }
    expect(mastery.get(T.modalVerbs)?.practiced).toBe(0);
    const food = getTopicProgressStats(migrated, T.food, lesson.filter((exercise) => exercise.topicId === T.food));
    // 5. ve 7. Gün'ün yemek alıştırmaları aynı konunun tamamlanmasına sayılır.
    expect(food.completed).toBe(2);
  });

  it('hata kayitlari kanonik konuya baglanir; emekli alistirmanin hatasi arsivlenerek duser', () => {
    expect(Object.keys(migrated.mistakes).sort()).toEqual(['p10-tre-listen-aufstehen', 'p7-evim-free-tam-anlatim']);
    expect(migrated.mistakes['p10-tre-listen-aufstehen'].topicId).toBe(T.separableVerbs);
    expect(migrated.mistakes['p10-tre-listen-aufstehen'].topic).toBe('Ayrılabilen Fiiller');
    expect(migrated.mistakes['p7-evim-free-tam-anlatim'].topicId).toBe(T.home);
    expect(migrated.mistakes['p7-evim-free-tam-anlatim'].legacyDay).toBe(7);
    expect(migrated.legacy?.droppedMistakeIds).toEqual(['p10-hed-giris-mc']);
  });

  it('yarim gun dersi ayni sorular ve cevaplarla tekrar oturumu olarak surer; emekli soru kuyruktan cikar', () => {
    const active = migrated.activeLesson!;
    expect(active.mode).toBe('review');
    expect(active.legacyDay).toBe(10);
    expect(active.topicId).toBeUndefined();
    expect(active.queue.map((item) => item.exerciseId)).toEqual([
      'p10-halb-mc-anlam',
      'p10-tre-listen-aufstehen',
      'p10-sabah-gesicht-fill',
    ]);
    // index 2 idi; önünde bir emekli soru vardı → 1.
    expect(active.index).toBe(1);
    expect(active.results).toHaveLength(2);
    expect((active as unknown as { day?: unknown }).day).toBeUndefined();
  });

  it('eski gun ici konu calismasi yeni bolum pratigine donusur', () => {
    const fixture = v9Fixture() as unknown as { activeLesson: Record<string, unknown> };
    fixture.activeLesson = { ...fixture.activeLesson, sessionMode: 'topic', topicId: 'private.day10.um-uhr' };
    const active = migrate(fixture, context)!.activeLesson!;
    expect(active.mode).toBe('topic');
    expect(active.topicId).toBe(T.time);
    expect(active.sectionId).toBe('time.um');
    expect(active.sessionMode).toBe('section');
  });

  it('Genel Tekrar konu grubu kanonik konuya eslenir (ikinci taksonomi kalmaz)', () => {
    const fixture = v9Fixture() as unknown as { activeLesson: Record<string, unknown> };
    fixture.activeLesson = { ...fixture.activeLesson, mode: 'review', day: undefined, sessionMode: 'gr-topic', topicId: 'saatler' };
    const active = migrate(fixture, context)!.activeLesson!;
    expect(active.mode).toBe('review');
    expect(active.topicId).toBe(T.time);
    expect(active.sessionMode).toBe('gr-topic');
  });

  it('son sonuc konu tabanli olur: eski bolumler kanonik konularda birlesir, kavramlar eslenir', () => {
    const result = migrated.lastResult!;
    expect(result.mode).toBe('review');
    expect(result.topicId).toBeUndefined();
    expect((result as unknown as { day?: unknown }).day).toBeUndefined();
    expect(result.topics).toEqual([
      { topicId: T.food, title: 'Essen und Trinken', correct: 1, total: 1 },
      { topicId: T.home, title: 'Ev ve Mobilyalar', correct: 1, total: 2 },
    ]);
    expect(result.strongestConceptIds).toEqual(['food.yiyecek.kelimeler']);
    expect(result.weakestConceptIds).toEqual(['home.evim.model', 'home.evim.balkon']);
    expect(result.unresolvedExerciseIds).toEqual(['p7-evim-free-tam-anlatim']);
  });

  it('okundu isaretleri ve yer imleri yeni bolum kimliklerine tasinir', () => {
    expect(migrated.settings.readSummaries).toEqual({
      'time.um': '2026-08-30T10:00:00.000Z',
      'time.question': '2026-08-29T10:00:00.000Z',
      'home.rooms': '2026-08-20T10:00:00.000Z',
      'genel.saat': '2026-08-31T10:00:00.000Z',
    });
    expect(migrated.settings.bookmarks).toEqual(['separable-verbs.core', 'food.words-basic', 'genel.saat']);
  });

  it('ayni yeni bolume dusen iki eski konunun okunma tarihlerinden en erkeni korunur', () => {
    const fixture = v9Fixture();
    fixture.settings.readSummaries = {
      'private.day5.yiyecek': '2026-08-25T10:00:00.000Z',
      'food.words-basic': '2026-08-26T10:00:00.000Z',
    };
    expect(migrate(fixture, context)!.settings.readSummaries).toEqual({ 'food.words-basic': '2026-08-25T10:00:00.000Z' });
  });

  it('deterministiktir: ayni girdi her zaman ayni ciktiyi verir', () => {
    expect(migrate(structuredClone(v9Fixture()), context)).toEqual(migrate(structuredClone(v9Fixture()), context));
  });

  it('idempotenttir: goc edilmis kayit tekrar goc edilince degismez', () => {
    expect(migrate(structuredClone(migrated), context)).toEqual(migrated);
  });

  it('icerik baglami olmadan da veri kaybetmez (hatalar korunur)', () => {
    const withoutContext = migrate(structuredClone(v9Fixture()))!;
    expect(Object.keys(withoutContext.exercises)).toHaveLength(8);
    expect(Object.keys(withoutContext.mistakes).sort()).toEqual(['p10-tre-listen-aufstehen', 'p7-evim-free-tam-anlatim']);
  });
});

describe('depolama katmani', () => {
  function memoryStorage(): Storage {
    const map = new Map<string, string>();
    return {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => void map.set(key, value),
      removeItem: (key) => void map.delete(key),
      clear: () => map.clear(),
      key: (index) => [...map.keys()][index] ?? null,
      get length() {
        return map.size;
      },
    } as Storage;
  }

  it('diskteki v8 ve v9 kayitlarini okurken goc uygular', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(v8Fixture()));
    expect(Object.keys(loadProgress(storage, context).exercises)).toEqual(['p1-vor-wie-heisst-mc', 'p3-af-kural-mc']);
    storage.setItem(STORAGE_KEY, JSON.stringify(v9Fixture()));
    const loaded = loadProgress(storage, context);
    expect(loaded.version).toBe(10);
    expect(loaded.mistakes['p7-evim-free-tam-anlatim'].topicId).toBe(T.home);
  });

  it('ice aktarilan eski yedek de ayni gocle konu modeline gecer', () => {
    const imported = parseImportedProgress(JSON.stringify(v9Fixture()), context);
    expect(imported.ok).toBe(true);
    expect(imported.progress?.version).toBe(10);
    expect(imported.progress?.settings.bookmarks).toContain('separable-verbs.core');
  });

  it('gelecekteki bir surumu silmez, yedekler', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...v9Fixture(), version: 99 }));
    const loaded = loadProgress(storage);
    expect(loaded.exercises).toEqual({});
    const backup = storage.getItem('almanca-alistirma:progress-backup');
    expect(backup).toContain('"version":99');
    expect(backup).toContain('p10-halb-mc-anlam');
  });

  it('yazip okuma dongusu ayarlari korur', () => {
    const storage = memoryStorage();
    const progress = migrate(structuredClone(v9Fixture()), context)!;
    progress.settings.showPronunciation = false;
    progress.settings.themePreference = 'dark';
    saveProgress(progress, storage);

    const loaded = loadProgress(storage, context);
    expect(loaded.settings.showPronunciation).toBe(false);
    expect(loaded.settings.bookmarks).toEqual(['separable-verbs.core', 'food.words-basic', 'genel.saat']);
    expect(loaded.settings.themePreference).toBe('dark');
    expect(loaded.legacy?.days?.[10]?.sessionsCompleted).toBe(1);
  });
});
