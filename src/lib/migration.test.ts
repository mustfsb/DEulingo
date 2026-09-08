/**
 * Tek müfredat göçü — v8 → v9.
 *
 * - Private izlek verisi kanonik müfredata taşınır (kaybolmaz).
 * - Normal izlek verisi taşınmaz (müfredat kaldırıldı).
 * - Göç deterministik ve idempotenttir.
 */

import { describe, expect, it } from 'vitest';
import {
  createEmptyProgress,
  loadProgress,
  migrate,
  saveProgress,
  STORAGE_KEY,
  STORAGE_VERSION,
  type ExerciseProgress,
  type UserProgress,
} from './storage';

function privateEntry(id: string, day: number, incorrect = 0): ExerciseProgress {
  const now = '2026-09-01T10:00:00.000Z';
  return {
    exerciseId: id,
    day,
    track: 'private',
    attempts: [
      {
        timestamp: now,
        input: 'x',
        normalizedInput: 'x',
        expected: 'y',
        result: incorrect > 0 ? 'incorrect' : 'correct',
        attemptNumber: 1,
      },
    ],
    firstSeenAt: now,
    lastSeenAt: now,
    correctCount: incorrect > 0 ? 0 : 1,
    incorrectCount: incorrect,
    typoCount: 0,
  };
}

function normalEntry(id: string, day: number): ExerciseProgress {
  return { ...privateEntry(id, day), track: 'normal' };
}

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
    } as never,
    exercises: {
      'p1-vor-wie-heisst-mc': privateEntry('p1-vor-wie-heisst-mc', 1),
      'p3-af-kural-mc': privateEntry('p3-af-kural-mc', 3, 1),
      'd1-eski-soru': normalEntry('d1-eski-soru', 1),
    },
    mistakes: {
      'p3-af-kural-mc': {
        exerciseId: 'p3-af-kural-mc',
        track: 'private',
        day: 3,
        topic: 'Ayrılabilen Fiiller',
        prompt: 'Ich aufstehe.',
        userAnswer: 'Ich aufstehe.',
        expectedAnswer: 'Ich stehe auf.',
        count: 1,
        typoCount: 0,
        lastOccurredAt: '2026-09-01T10:00:00.000Z',
        type: 'grammar',
      },
      'd1-eski-soru': {
        exerciseId: 'd1-eski-soru',
        track: 'normal',
        day: 1,
        topic: 'Eski konu',
        prompt: 'eski',
        userAnswer: 'eski',
        expectedAnswer: 'yeni',
        count: 2,
        typoCount: 0,
        lastOccurredAt: '2026-09-01T10:00:00.000Z',
        type: 'vocabulary',
      },
    },
    stats: {
      totalAttempts: 3,
      totalCorrect: 1,
      totalTypos: 0,
      totalIncorrect: 1,
      lastStudiedAt: '2026-09-01T10:00:00.000Z',
      studyDates: ['2026-09-01'],
    },
  };
}

describe('v8 → v9 tek mufredat gocu', () => {
  it('surumu yukseltir ve izlek anahtarini kaldirir', () => {
    const migrated = migrate(structuredClone(v8Fixture()))!;
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(STORAGE_VERSION).toBe(9);
    expect((migrated as unknown as { tracks?: unknown }).tracks).toBeUndefined();
  });

  it('A: private denemeleri ve hatalari aynen tasinir', () => {
    const migrated = migrate(structuredClone(v8Fixture()))!;
    expect(Object.keys(migrated.exercises).sort()).toEqual(['p1-vor-wie-heisst-mc', 'p3-af-kural-mc']);
    expect(migrated.exercises['p1-vor-wie-heisst-mc'].correctCount).toBe(1);
    expect(Object.keys(migrated.mistakes)).toEqual(['p3-af-kural-mc']);
  });

  it('B/D: normal izlek verisi kanonik alana tasinmaz', () => {
    const migrated = migrate(structuredClone(v8Fixture()))!;
    expect(migrated.exercises['d1-eski-soru']).toBeUndefined();
    expect(migrated.mistakes['d1-eski-soru']).toBeUndefined();
  });

  it('D: gun sayaclarinda private kazanir', () => {
    const migrated = migrate(structuredClone(v8Fixture()))!;
    // 1. Gün iki izlekte de var → private (4) kazanır, normal (9) ezilir.
    expect(migrated.days[1]?.sessionsCompleted).toBe(4);
    // 3. Gün yalnızca private'ta → korunur.
    expect(migrated.days[3]?.sessionsCompleted).toBe(2);
  });

  it('istatistikler tasinan kayitlardan yeniden hesaplanir, tarihler korunur', () => {
    const migrated = migrate(structuredClone(v8Fixture()))!;
    expect(migrated.stats.totalAttempts).toBe(2);
    expect(migrated.stats.totalCorrect).toBe(1);
    expect(migrated.stats.totalIncorrect).toBe(1);
    expect(migrated.stats.studyDates).toEqual(['2026-09-01']);
  });

  it('normal yanim dersi cope gider, private yanim ders korunur', () => {
    const withPrivateActive = {
      ...structuredClone(v8Fixture()),
      activeLesson: {
        mode: 'day' as const,
        track: 'private' as const,
        day: 3,
        queue: [{ exerciseId: 'p3-af-kural-mc', presentationReason: 'primary' as const }],
        index: 0,
        startedAt: '2026-09-01T10:00:00.000Z',
        results: [],
        retries: {},
      },
    };
    expect(migrate(withPrivateActive)?.activeLesson?.day).toBe(3);

    const withNormalActive = {
      ...structuredClone(v8Fixture()),
      activeLesson: {
        mode: 'day' as const,
        track: 'normal' as const,
        day: 1,
        queue: [{ exerciseId: 'd1-eski-soru', presentationReason: 'primary' as const }],
        index: 0,
        startedAt: '2026-09-01T10:00:00.000Z',
        results: [],
        retries: {},
      },
    };
    expect(migrate(withNormalActive)?.activeLesson).toBeUndefined();
  });

  it('C: goc tekrar calistirilinca veriyi bozmaz (idempotent)', () => {
    const once = migrate(structuredClone(v8Fixture()))!;
    const twice = migrate(structuredClone(once))!;
    expect(twice.exercises).toEqual(once.exercises);
    expect(twice.mistakes).toEqual(once.mistakes);
    expect(twice.days).toEqual(once.days);
    expect(twice.stats).toEqual(once.stats);
    expect(twice.version).toBe(STORAGE_VERSION);
  });

  it('E: yeni kurulumda goc sorunu yok', () => {
    const fresh = createEmptyProgress();
    const migrated = migrate(structuredClone(fresh))!;
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(migrated.exercises).toEqual({});
    expect(migrated.days).toEqual({});
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

  it('diskteki v8 kaydini okurken goc uygular', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(v8Fixture()));
    const loaded = loadProgress(storage);
    expect(loaded.version).toBe(STORAGE_VERSION);
    expect(Object.keys(loaded.exercises)).toEqual(['p1-vor-wie-heisst-mc', 'p3-af-kural-mc']);
  });

  it('gelecekteki bir surumu silmez, yedekler', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...v8Fixture(), version: 99 }));
    const loaded = loadProgress(storage);
    expect(loaded.exercises).toEqual({});
    const backup = storage.getItem('almanca-alistirma:progress-backup');
    expect(backup).toContain('"version":99');
    expect(backup).toContain('p1-vor-wie-heisst-mc');
  });

  it('yazip okuma dongusu ayarlari korur', () => {
    const storage = memoryStorage();
    const progress = migrate(structuredClone(v8Fixture()))!;
    progress.settings.showPronunciation = false;
    progress.settings.bookmarks = ['private.day2.fiil-cekimi'];
    progress.settings.themePreference = 'dark';
    saveProgress(progress, storage);

    const loaded = loadProgress(storage);
    expect(loaded.settings.showPronunciation).toBe(false);
    expect(loaded.settings.bookmarks).toEqual(['private.day2.fiil-cekimi']);
    expect(loaded.settings.themePreference).toBe('dark');
  });
});
