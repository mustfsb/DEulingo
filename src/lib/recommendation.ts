/**
 * "Bugün ne yapmalıyım?" (§36, §37).
 *
 * Yapay zekâ yok, sunucu yok, sürpriz yok: yerel ilerlemeden okunan
 * DETERMINISTIK bir oncelik listesi. Ayni durum her zaman ayni oneriyi verir.
 *
 * Oncelik:
 *   1. Yarim kalan oturum
 *   2. Yakin zamanda dusuk dogruluklu gun
 *   3. Cozulmemis hatalar (esik ustunde)
 *   4. Siradaki tamamlanmamis gun
 *   5. Eski/zayif malzemenin hizli tekrari
 */

import type { Exercise } from '../content/types';
import type { Route } from './router';
import { getDayStats, REVIEW_THRESHOLD } from './progress';
import type { UserProgress } from './storage';

export type RecommendationKind =
  | 'resume'
  | 'weak-day'
  | 'mistakes'
  | 'next-day'
  | 'refresh';

export interface Recommendation {
  kind: RecommendationKind;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  route: Route;
}

export interface RecommendationInput {
  progress: UserProgress;
  /** Icerikteki gun numaralari, artan sirada. */
  dayNumbers: number[];
  exercisesForDay: (day: number) => Exercise[];
}

/** Bu sayidan fazla acik hata varsa tekrar one cikar. */
export const OPEN_MISTAKE_THRESHOLD = 5;

const MODE_LABEL: Record<string, string> = {
  normal: 'Normal Çalışma',
  full: 'Tam Çalışma',
  quick: 'Hızlı Tekrar',
  challenge: 'Zor Sorular',
  topic: 'Konu Çalışması',
};

export function recommendNext(input: RecommendationInput): Recommendation {
  const { progress, dayNumbers, exercisesForDay } = input;
  const active = progress.activeLesson;

  if (active && active.index < active.queue.length) {
    const remaining = active.queue.length - active.index;
    const label =
      active.mode === 'day'
        ? `${active.day}. Gün — ${MODE_LABEL[active.sessionMode ?? 'normal'] ?? 'Çalışma'}`
        : active.mode === 'mistakes'
          ? 'Hata tekrarı'
          : 'Tekrar oturumu';
    return {
      kind: 'resume',
      eyebrow: 'Yarım kalan çalışma',
      title: label,
      description: `${remaining} soru kaldı. Kaldığın yerden devam edebilirsin.`,
      action: 'Devam Et',
      route:
        active.mode === 'day'
          ? {
            name: 'lesson',
            day: active.day ?? dayNumbers[0] ?? 1,
            mode: active.sessionMode ?? 'normal',
            topicId: active.topicId,
          }
          : active.mode === 'mistakes'
            ? { name: 'mistake-review', day: active.day }
            : { name: 'review' },
    };
  }

  const dayStats = dayNumbers.map((day) => ({
    day,
    stats: getDayStats(progress, day, exercisesForDay(day)),
  }));

  // 2. Calisilmis ama dogrulugu dusuk kalan en yeni gun.
  const weak = [...dayStats]
    .reverse()
    .find(
      (entry) =>
        entry.stats.completed > 0 &&
        entry.stats.accuracy !== null &&
        entry.stats.accuracy < REVIEW_THRESHOLD,
    );
  if (weak) {
    return {
      kind: 'weak-day',
      eyebrow: 'Bugün önerilen',
      title: `${weak.day}. Gün — Hızlı Tekrar`,
      description: `Doğruluğun %${Math.round((weak.stats.accuracy ?? 0) * 100)}. Kısa bir tur bunu toparlar.`,
      action: 'Hızlı Tekrar',
      route: { name: 'lesson', day: weak.day, mode: 'quick' },
    };
  }

  // 3. Biriken hatalar.
  const openMistakes = Object.keys(progress.mistakes).length;
  if (openMistakes >= OPEN_MISTAKE_THRESHOLD) {
    return {
      kind: 'mistakes',
      eyebrow: 'Bugün önerilen',
      title: `${openMistakes} aktif hata`,
      description: 'Hatalarını tekrar etmek, yeni gün açmaktan daha çok kazandırır.',
      action: 'Hataları Tekrar Et',
      route: { name: 'mistakes' },
    };
  }

  // 4. Siradaki tamamlanmamis gun.
  const next = dayStats.find((entry) => entry.stats.state !== 'completed');
  if (next) {
    return {
      kind: 'next-day',
      eyebrow: 'Bugün önerilen',
      title:
        next.stats.state === 'in-progress'
          ? `${next.day}. Gün — Kalanları Çalış`
          : `${next.day}. Gün — Normal Çalışma`,
      description:
        next.stats.state === 'in-progress'
          ? `${next.stats.total - next.stats.completed} alıştırma henüz hiç karşına çıkmadı.`
          : 'Yeni gün seni bekliyor.',
      action: 'Başla',
      route: { name: 'day', day: next.day },
    };
  }

  // 5. Her sey tamam: en dusuk dogruluklu gunun hizli tekrari.
  const oldest = [...dayStats].sort(
    (a, b) => (a.stats.accuracy ?? 1) - (b.stats.accuracy ?? 1) || a.day - b.day,
  )[0];
  const day = oldest?.day ?? dayNumbers[0] ?? 1;
  return {
    kind: 'refresh',
    eyebrow: 'Bugün önerilen',
    title: `${day}. Gün — Hızlı Tekrar`,
    description: 'Tüm günler tamam. Bilgiyi taze tutmak için kısa bir tur.',
    action: 'Hızlı Tekrar',
    route: { name: 'lesson', day, mode: 'quick' },
  };
}
