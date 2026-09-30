/**
 * Gunluk hedef (§38, §39).
 *
 * Hesap yok, sunucu yok, seri baskisi yok: yalnizca YEREL takvim gunune yazilan
 * kucuk bir sayac. Egzersizlerde kronometre kullanmayiz — her cevabin
 * gercek yanit suresi (makul bir tavanla) ve sabit bir okuma payi toplanir.
 * Ozet okuma ise sayfada gecirilen gercek sureyle (ziyaret basina tavanla)
 * hedefe yazilir.
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

/** Tek bir özet ziyaretinde hedefe yazilabilecek en fazla süre (sekme açık unutulmasın). */
export const MAX_SUMMARY_VISIT_MS = 15 * 60_000;

/** Özet sayfasında geçen sürenin hedefe yazılacak karşılığı. */
export function summaryDurationMs(dwellMs: number | undefined): number {
  if (!Number.isFinite(dwellMs)) return 0;
  return Math.min(Math.max(0, dwellMs as number), MAX_SUMMARY_VISIT_MS);
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

/** Günlük hedef sınırları: en az 5 dk, en çok 5 saat (300 dk). */
export const GOAL_MIN_MINUTES = 5;
export const GOAL_MAX_MINUTES = 300;
/** Artır/azalt düğmelerinin adımı. */
export const GOAL_STEP_MINUTES = 5;

/** Hedef süreyi [5, 300] aralığına kırpar; geçersizse varsayılan 10 döner. */
export function clampGoalMinutes(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(GOAL_MAX_MINUTES, Math.max(GOAL_MIN_MINUTES, Math.round(parsed)));
}

/** Hedef sürenin okunabilir karşılığı: 45 → "45 dakika", 60 → "1 saat", 90 → "1 sa 30 dk". */
export function formatGoalMinutes(minutes: number): string {
  const total = clampGoalMinutes(minutes);
  if (total < 60) return `${total} dakika`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (rest === 0) return `${hours} saat`;
  return `${hours} sa ${rest} dk`;
}

export function goalProgress(progress: UserProgress, date = new Date()): GoalProgress {
  const activity = dayActivity(progress, date);
  const targetMinutes = clampGoalMinutes(progress.settings.dailyGoalMinutes);
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
