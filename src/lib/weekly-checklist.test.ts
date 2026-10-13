import { describe, expect, it } from 'vitest';
import {
  emptySkills,
  loadSkills,
  saveSkills,
  toggleWeekActivity,
  weekActivityProgress,
} from './skills-storage';

function memStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  } as Storage;
}

describe('haftalik aktivite isaretleri', () => {
  it('ac/kapat bagimsizdir', () => {
    let list: string[] = [];
    list = toggleWeekActivity(list, 'en.w1.a.summary');
    expect(list).toEqual(['en.w1.a.summary']);
    list = toggleWeekActivity(list, 'en.w1.a.v3');
    expect(list).toEqual(['en.w1.a.summary', 'en.w1.a.v3']);
    // geri alma yalnizca o aktiviteyi etkiler
    list = toggleWeekActivity(list, 'en.w1.a.summary');
    expect(list).toEqual(['en.w1.a.v3']);
  });

  it('ilerleme isaretlerden turetilir', () => {
    expect(weekActivityProgress([], 12)).toEqual({ done: 0, total: 12, percent: 0 });
    expect(weekActivityProgress(['a', 'b', 'c'], 12)).toEqual({ done: 3, total: 12, percent: 25 });
    const full = Array.from({ length: 12 }, (_, i) => `en.w1.x.${i}`);
    expect(weekActivityProgress(full, 12)).toEqual({ done: 12, total: 12, percent: 100 });
    expect(weekActivityProgress(full.slice(0, 11), 12).done).toBe(11);
  });

  it('kalicilik: isaretle → yenile → korunur; geri al → korunur', () => {
    const storage = memStorage();
    const state = emptySkills();
    state.weekly.completedActivities = toggleWeekActivity(state.weekly.completedActivities, 'en.w1.a.dictation');
    saveSkills(state, storage);
    expect(loadSkills(storage).weekly.completedActivities).toEqual(['en.w1.a.dictation']);

    const reloaded = loadSkills(storage);
    reloaded.weekly.completedActivities = toggleWeekActivity(reloaded.weekly.completedActivities, 'en.w1.a.dictation');
    saveSkills(reloaded, storage);
    expect(loadSkills(storage).weekly.completedActivities).toEqual([]);
  });

  it('eski kayitlarla uyumlu (completedActivities yoksa bos)', () => {
    const storage = memStorage();
    storage.setItem(
      'almanca-alistirma:skills-en',
      JSON.stringify({
        reading: [], listening: [], writing: [], speaking: [],
        weekly: { completedSessions: ['week1-A'], updatedAt: 'x' },
      }),
    );
    const loaded = loadSkills(storage);
    expect(loaded.weekly.completedActivities).toEqual([]);
    expect(loaded.weekly.completedSessions).toEqual(['week1-A']);
  });

  it('bozuk haftalik veri guvenli bos doner', () => {
    const storage = memStorage();
    storage.setItem(
      'almanca-alistirma:skills-en',
      JSON.stringify({ weekly: { completedSessions: 'bozuk', completedActivities: [1, 2] } }),
    );
    expect(loadSkills(storage).weekly.completedActivities).toEqual([]);
  });
});
