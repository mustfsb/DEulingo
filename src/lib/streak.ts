/**
 * Ders ici ardisik dogru serisi (§16–§22).
 *
 * Kurallar bilerek sade:
 *   correct      → seri artar
 *   minor-typo   → seri DEVAM eder (ama ders "mukemmel" sayilmaz)
 *   self-assessed→ seri korunur, artmaz (sesli gorev kendi beyanidir)
 *   incorrect    → seri sifirlanir
 *   skipped      → seri sifirlanir
 *
 * Ders ici hata tekrari (`mistake-retry`) seriyi ARTIRMAZ: az once gorulen
 * soruyu tekrar dogru yapmak kutlama esigini ucuzlatmamalidir (§20).
 * Yanlislik ise her sunumda seriyi kirar.
 */

import type { AttemptResult, PresentationReason, StreakState } from './storage';

/** Kutlama esikleri — kisa oturumda yalnizca 5 gorulur. */
export const STREAK_MILESTONES = [5, 10, 15, 20, 30] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export const EMPTY_STREAK: StreakState = { current: 0, best: 0, firedMilestones: [] };

export interface StreakStep {
  state: StreakState;
  /** Bu cevapla ILK KEZ ulasilan esik; yoksa undefined. */
  milestone?: number;
}

export function normalizeStreak(state: StreakState | undefined): StreakState {
  if (!state) return { ...EMPTY_STREAK };
  return {
    current: Number.isFinite(state.current) ? Math.max(0, state.current) : 0,
    best: Number.isFinite(state.best) ? Math.max(0, state.best) : 0,
    firedMilestones: Array.isArray(state.firedMilestones) ? [...state.firedMilestones] : [],
  };
}

export function applyAttemptToStreak(
  previous: StreakState | undefined,
  result: AttemptResult,
  reason: PresentationReason = 'primary',
): StreakStep {
  const state = normalizeStreak(previous);

  if (result === 'incorrect' || result === 'skipped') {
    return { state: { ...state, current: 0 } };
  }
  if (result === 'self-assessed' || reason === 'mistake-retry') {
    return { state };
  }

  const current = state.current + 1;
  const best = Math.max(state.best, current);
  const milestone = STREAK_MILESTONES.find(
    (threshold) => threshold === current && !state.firedMilestones.includes(threshold),
  );

  return {
    state: {
      current,
      best,
      firedMilestones: milestone ? [...state.firedMilestones, milestone] : state.firedMilestones,
    },
    milestone,
  };
}

export interface MilestoneCopy {
  title: string;
  subtitle: string;
  /** `public/audio/<effect>.wav` */
  effect: 'streak-5' | 'streak-10';
  tone: 'signal' | 'brand';
}

/** Esik buyudukce metin degisir ama gosterim suresi hep kisadir. */
export function milestoneCopy(streak: number): MilestoneCopy {
  if (streak >= 15) {
    return {
      title: `${streak} doğru üst üste`,
      subtitle: 'Bu ders senin.',
      effect: 'streak-10',
      tone: 'brand',
    };
  }
  if (streak >= 10) {
    return {
      title: `${streak} doğru üst üste!`,
      subtitle: 'Seriyi bozmuyorsun.',
      effect: 'streak-10',
      tone: 'brand',
    };
  }
  return {
    title: `${streak} doğru üst üste!`,
    subtitle: 'Harika gidiyorsun.',
    effect: 'streak-5',
    tone: 'signal',
  };
}

/** 15 ve uzeri esikler tam ekran yerine kucuk bir onay olarak gosterilir (§19). */
export function isQuietMilestone(streak: number): boolean {
  return streak >= 15;
}
