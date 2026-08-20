import { describe, expect, it } from 'vitest';
import {
  addDailyActivity,
  ANSWER_OVERHEAD_MS,
  answerDurationMs,
  dailyKey,
  goalProgress,
  markGoalCelebrated,
  MAX_ANSWER_MS,
} from './daily-goal';
import { createEmptyProgress, type UserProgress } from './storage';

const today = new Date('2026-08-17T12:00:00.000Z');

function withMinutes(minutes: number, goal = 10): UserProgress {
  const base = createEmptyProgress();
  return {
    ...base,
    settings: { ...base.settings, dailyGoalMinutes: goal },
    daily: addDailyActivity(base.daily, { answered: 4, activeMs: minutes * 60_000 }, today),
  };
}

describe('gunluk hedef', () => {
  it('yerel takvim gunune yazar', () => {
    const local = new Date(2026, 7, 17, 23, 30);
    expect(dailyKey(local)).toBe('2026-08-17');
  });

  it('cok uzun duraklamayi hedefe saymaz', () => {
    expect(answerDurationMs(5_000)).toBe(5_000 + ANSWER_OVERHEAD_MS);
    expect(answerDurationMs(60 * 60_000)).toBe(MAX_ANSWER_MS + ANSWER_OVERHEAD_MS);
    expect(answerDurationMs(undefined)).toBe(ANSWER_OVERHEAD_MS);
  });

  it('etkinligi birikimli toplar', () => {
    const first = addDailyActivity({}, { answered: 1, activeMs: 30_000 }, today);
    const second = addDailyActivity(first, { answered: 2, activeMs: 30_000, sessions: 1 }, today);
    expect(second[dailyKey(today)]).toMatchObject({ answered: 3, activeMs: 60_000, sessions: 1 });
  });

  it('hedefe ulasilmadan kutlama yapmaz', () => {
    const progress = goalProgress(withMinutes(4), today);
    expect(progress.reached).toBe(false);
    expect(progress.justReached).toBe(false);
    expect(progress.ratio).toBeCloseTo(0.4);
  });

  it('hedefe ulasinca bir kez kutlanir', () => {
    const progress = withMinutes(11);
    expect(goalProgress(progress, today).justReached).toBe(true);
    const celebrated = markGoalCelebrated(progress, today);
    expect(goalProgress(celebrated, today).justReached).toBe(false);
    expect(goalProgress(celebrated, today).reached).toBe(true);
  });

  it('hedef suresi ayardan gelir', () => {
    expect(goalProgress(withMinutes(11, 20), today).reached).toBe(false);
    expect(goalProgress(withMinutes(11, 5), today).reached).toBe(true);
  });
});
