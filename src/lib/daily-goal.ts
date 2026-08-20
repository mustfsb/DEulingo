/**
 * Gunluk hedef (§38, §39).
 *
 * Hesap yok, sunucu yok, seri baskisi yok: yalnizca YEREL takvim gunune yazilan
 * kucuk bir sayac. Gecen sureyi olcerken kronometre kullanmayiz — her cevabin
 * gercek yanit suresi (makul bir tavanla) ve sabit bir okuma payi toplanir.
 */

import type { DailyActivity, UserProgress } from './storage';

/** Tek bir cevabin hedefe yazilabilecek en fazla suresi (mola sayilmasin). */
export const MAX_ANSWER_MS = 90_000;
/** Yonergeyi okuma + geri bildirim payi. */
export const ANSWER_OVERHEAD_MS = 6_000;

/** YEREL takvim gunu — UTC kaymasi hedefi bir gun kaydirmasin. */
export function dailyKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function emptyDay(date: string): DailyActivity {
  return { date, answered: 0, activeMs: 0, sessions: 0 };
}

export function dayActivity(progress: UserProgress, date = new Date()): DailyActivity {
  const key = dailyKey(date);
  return progress.daily?.[key] ?? emptyDay(key);
}

export interface DailyDelta {
  answered?: number;
  activeMs?: number;
  sessions?: number;
}

export function addDailyActivity(
  daily: Record<string, DailyActivity> | undefined,
  delta: DailyDelta,
  date = new Date(),
): Record<string, DailyActivity> {
  const key = dailyKey(date);
  const current = daily?.[key] ?? emptyDay(key);
  return {
    ...(daily ?? {}),
    [key]: {
      ...current,
      answered: current.answered + (delta.answered ?? 0),
      activeMs: current.activeMs + Math.max(0, delta.activeMs ?? 0),
      sessions: current.sessions + (delta.sessions ?? 0),
    },
  };
}

/** Bir cevabin hedefe yazilacak suresi. */
export function answerDurationMs(responseTimeMs: number | undefined): number {
  const measured = Math.min(Math.max(0, responseTimeMs ?? 0), MAX_ANSWER_MS);
  return measured + ANSWER_OVERHEAD_MS;
}

export interface GoalProgress {
  date: string;
  minutes: number;
  targetMinutes: number;
  /** 0–1 arasi kirpilmis oran. */
  ratio: number;
  reached: boolean;
  /** Hedefe ulasildigi an bir kez kutlanir; daha once kutlandiysa false. */
  justReached: boolean;
  answered: number;
  sessions: number;
}

export const GOAL_OPTIONS = [5, 10, 20] as const;

export function goalProgress(progress: UserProgress, date = new Date()): GoalProgress {
  const activity = dayActivity(progress, date);
  const targetMinutes = Math.max(1, progress.settings.dailyGoalMinutes || 10);
  const minutes = activity.activeMs / 60_000;
  const reached = minutes >= targetMinutes;
  return {
    date: activity.date,
    minutes,
    targetMinutes,
    ratio: Math.min(1, targetMinutes > 0 ? minutes / targetMinutes : 0),
    reached,
    justReached: reached && !activity.goalReachedAt,
    answered: activity.answered,
    sessions: activity.sessions,
  };
}

/** Hedef kutlamasi bir kez gosterilir; isaret kalici olarak yazilir. */
export function markGoalCelebrated(progress: UserProgress, date = new Date()): UserProgress {
  const key = dailyKey(date);
  const current = progress.daily?.[key] ?? emptyDay(key);
  if (current.goalReachedAt) return progress;
  return {
    ...progress,
    daily: { ...(progress.daily ?? {}), [key]: { ...current, goalReachedAt: date.toISOString() } },
  };
}
