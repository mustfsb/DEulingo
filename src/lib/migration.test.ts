/**
 * Depolama gocu — v1 → v2.
 *
 * Bu testler yukseltmenin ESKI ILERLEMEYI KAYBETMEDIGINI garanti eder.
 * Fixture, v2 alanlarindan hicbirini icermeyen gercek bir v1 kaydidir.
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  loadProgress,
  migrate,
  saveProgress,
  STORAGE_KEY,
  STORAGE_VERSION,
} from './storage';

/** Yukseltmeden once uretilmis gercek bir v1 kaydi. */
const V1_FIXTURE = {
  version: 1,
  createdAt: '2026-08-10T09:00:00.000Z',
  updatedAt: '2026-08-15T18:30:00.000Z',
  days: {
    1: { day: 1, sessionsCompleted: 2, lastCompletedAt: '2026-08-14T10:00:00.000Z' },
    2: { day: 2, sessionsCompleted: 1 },
  },
  exercises: {
    'd1-1-1-1-1luodn5': {
      exerciseId: 'd1-1-1-1-1luodn5',
      day: 1,
      attempts: [
        {
          timestamp: '2026-08-14T09:58:00.000Z',
          input: '"ay" gibi',
          normalizedInput: '"ay" gibi',
          expected: '"ay" gibi',
          result: 'correct',
          attemptNumber: 1,
        },
      ],
      firstSeenAt: '2026-08-14T09:58:00.000Z',
      lastSeenAt: '2026-08-14T09:58:00.000Z',
      correctCount: 1,
      incorrectCount: 0,
      typoCount: 0,
      mastered: false,
    },
    'd2-2-6-1-abcdefg': {
      exerciseId: 'd2-2-6-1-abcdefg',
      day: 2,
      attempts: [
        {
          timestamp: '2026-08-15T18:20:00.000Z',
          input: 'Du kommen aus Deutschland.',
          expected: 'Du kommst aus Deutschland.',
          result: 'incorrect',
          attemptNumber: 1,
        },
      ],
      firstSeenAt: '2026-08-15T18:20:00.000Z',
      lastSeenAt: '2026-08-15T18:20:00.000Z',
      correctCount: 0,
      incorrectCount: 1,
      typoCount: 0,
    },
  },
  mistakes: {
    'd2-2-6-1-abcdefg': {
      exerciseId: 'd2-2-6-1-abcdefg',
      day: 2,
      topic: 'Hata Avı',
      prompt: 'Du kommen aus Deutschland.',
      userAnswer: 'Du kommen aus Deutschland.',
      expectedAnswer: 'Du kommst aus Deutschland.',
      count: 1,
      typoCount: 0,
      lastOccurredAt: '2026-08-15T18:20:00.000Z',
      type: 'grammar',
    },
  },
  activeLesson: {
    mode: 'day',
    day: 2,
    queue: ['d2-2-6-1-abcdefg', 'd1-1-1-1-1luodn5'],
    index: 1,
    startedAt: '2026-08-15T18:19:00.000Z',
    results: [{ exerciseId: 'd2-2-6-1-abcdefg', result: 'incorrect' }],
    retries: {},
  },
  settings: { dailyGoalMinutes: 15 },
  stats: {
    totalAttempts: 2,
    totalCorrect: 1,
    totalTypos: 0,
    totalIncorrect: 1,
    lastStudiedAt: '2026-08-15T18:20:00.000Z',
    studyDates: ['2026-08-14', '2026-08-15'],
  },
};

describe('v1 → guncel surum gocu', () => {
  const migrated = migrate(structuredClone(V1_FIXTURE))!;

  it('gocu basariyla tamamlar ve surumu yukseltir', () => {
    expect(migrated).not.toBeNull();
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(STORAGE_VERSION).toBe(8);
  });

  it('v7 alanlarini bos ama kullanilabilir baslatir', () => {
    expect(migrated.daily).toEqual({});
    expect(migrated.lastResult).toBeUndefined();
  });

  it('deneme gecmisini oldugu gibi korur', () => {
    expect(Object.keys(migrated.exercises)).toHaveLength(2);
    expect(migrated.exercises['d1-1-1-1-1luodn5'].attempts).toHaveLength(1);
    expect(migrated.exercises['d2-2-6-1-abcdefg'].incorrectCount).toBe(1);
    expect(migrated.exercises['d1-1-1-1-1luodn5'].firstSeenAt).toBe('2026-08-14T09:58:00.000Z');
  });

  it('hata kayitlarini korur', () => {
    expect(migrated.mistakes['d2-2-6-1-abcdefg'].expectedAnswer).toBe('Du kommst aus Deutschland.');
    expect(migrated.mistakes['d2-2-6-1-abcdefg'].type).toBe('grammar');
  });

  it('gun ve istatistik verisini korur', () => {
    expect((migrated.tracks?.normal.days[1] ?? migrated.days[1]).sessionsCompleted).toBe(2);
    expect(migrated.stats.totalAttempts).toBe(2);
    expect(migrated.stats.studyDates).toEqual(['2026-08-14', '2026-08-15']);
    expect(migrated.createdAt).toBe('2026-08-10T09:00:00.000Z');
  });

  it('yarim kalan dersi korur', () => {
    expect(migrated.activeLesson?.day).toBe(2);
    expect(migrated.activeLesson?.index).toBe(1);
    expect(migrated.activeLesson?.queue).toEqual([
      { exerciseId: 'd2-2-6-1-abcdefg', presentationReason: 'primary' },
      { exerciseId: 'd1-1-1-1-1luodn5', presentationReason: 'primary' },
    ]);
  });

  it('kullanicinin var olan ayarini ezmez', () => {
    expect(migrated.settings.dailyGoalMinutes).toBe(15);
  });

  it('yeni ayarlari varsayilanlarla doldurur (ses varsayilan ACIK)', () => {
    expect(migrated.settings.showPronunciation).toBe(true);
    expect(migrated.settings.soundEffects).toBe(true);
    expect(migrated.settings.autoPronunciation).toBe(true);
    expect(migrated.settings.speechSpeed).toBe('normal');
    expect(migrated.settings.speechVoice).toBe('kerstin');
    expect(migrated.settings.readSummaries).toEqual({});
    expect(migrated.settings.bookmarks).toEqual([]);
    expect(migrated.settings.themePreference).toBe('system');
  });

  it('goc tekrar calistirilinca veriyi bozmaz (idempotent)', () => {
    const twice = migrate(structuredClone(migrated))!;
    expect(twice.exercises).toEqual(migrated.exercises);
    expect(twice.settings).toEqual(migrated.settings);
    expect(twice.version).toBe(STORAGE_VERSION);
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

  it('diskteki v1 kaydini okurken goc uygular', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(V1_FIXTURE));
    const loaded = loadProgress(storage);
    expect(loaded.version).toBe(STORAGE_VERSION);
    expect(loaded.settings.showPronunciation).toBe(true);
    expect(Object.keys(loaded.exercises)).toHaveLength(2);
  });

  it('gelecekteki bir surumu silmez, yedekler', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...V1_FIXTURE, version: 99 }));
    const loaded = loadProgress(storage);
    expect(loaded.exercises).toEqual({});
    const backup = storage.getItem('almanca-alistirma:progress-backup');
    expect(backup).toContain('"version":99');
    // Denemeler yedekte duruyor: veri silinmedi.
    expect(backup).toContain('d2-2-6-1-abcdefg');
  });

  it('yazip okuma dongusu ayarlari korur', () => {
    const storage = memoryStorage();
    const progress = migrate(structuredClone(V1_FIXTURE))!;
    progress.settings.showPronunciation = false;
    progress.settings.bookmarks = ['day2.fiil-cekimi'];
    progress.settings.themePreference = 'dark';
    progress.settings.speechVoice = 'eva';
    saveProgress(progress, storage);

    const loaded = loadProgress(storage);
    expect(loaded.settings.showPronunciation).toBe(false);
    expect(loaded.settings.bookmarks).toEqual(['day2.fiil-cekimi']);
    expect(loaded.settings.themePreference).toBe('dark');
    expect(loaded.settings.speechVoice).toBe('eva');
  });

  it('varsayilan ayarlar telaffuzu acik tutar', () => {
    expect(DEFAULT_SETTINGS.showPronunciation).toBe(true);
    expect(DEFAULT_SETTINGS.soundEffects).toBe(true);
    expect(DEFAULT_SETTINGS.autoPronunciation).toBe(true);
  });

  it('v5 ayarinda yeni hızlı hız seçeneğini ilerlemeyi bozmadan korur', () => {
    const v5 = {
      ...structuredClone(V1_FIXTURE),
      version: 5,
      settings: { ...DEFAULT_SETTINGS, speechSpeed: 'fast' as const },
    };

    const migrated = migrate(v5)!;
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(migrated.settings.speechSpeed).toBe('fast');
    expect(migrated.exercises).toEqual(v5.exercises);
  });
});
