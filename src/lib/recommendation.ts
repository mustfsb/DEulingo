/**
 * "Bugün ne yapmalıyım?" (§36, §37).
 *
 * Yapay zekâ yok, sunucu yok, sürpriz yok: yerel ilerlemeden okunan
 * DETERMINISTIK bir oncelik listesi. Ayni durum her zaman ayni oneriyi verir.
 *
 * Oncelik:
 *   1. Yarim kalan oturum
 *   2. Calisilmis ama dogrulugu dusuk konu
 *   3. Cozulmemis hatalar (esik ustunde)
 *   4. Harita sirasinda siradaki tamamlanmamis konu
 *   5. En zayif konunun hizli tekrari
 */

import type { Exercise } from '../content/types';
import type { Route } from './router';
import { getTopicProgressStats, REVIEW_THRESHOLD } from './progress';
import type { UserProgress } from './storage';

export type RecommendationKind =
  | 'resume'
  | 'weak-topic'
  | 'mistakes'
  | 'next-topic'
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
  /** Kanonik konular, müfredat haritası sırasıyla. */
  topics: Array<{ id: string; title: string }>;
  /** Konunun birincil ders alıştırmaları (tamamlanma bunlarla ölçülür). */
  exercisesForTopic: (topicId: string) => Exercise[];
}

/** Bu sayidan fazla acik hata varsa tekrar one cikar. */
export const OPEN_MISTAKE_THRESHOLD = 5;

const MODE_LABEL: Record<string, string> = {
  normal: 'Normal Çalışma',
  full: 'Tam Çalışma',
  quick: 'Hızlı Tekrar',
  challenge: 'Zor Sorular',
  section: 'Bölüm Çalışması',
  'gr-mixed': 'Genel Tekrar',
  'gr-vocab': 'Kelime Çalışması',
  'gr-sentence': 'Cümle Kurma',
  'gr-writing': 'Writing',
  'gr-listening': 'Dinleme',
  'gr-quick': 'Hızlı Tekrar',
  'gr-challenge': 'Zor Sorular',
  'gr-topic': 'Konu Tekrarı',
};

export function recommendNext(input: RecommendationInput): Recommendation {
  const { progress, topics, exercisesForTopic } = input;
  const active = progress.activeLesson;
  const titleOf = (topicId: string | undefined) => topics.find((topic) => topic.id === topicId)?.title;

  if (active && active.index < active.queue.length) {
    const remaining = active.queue.length - active.index;
    const topicLesson = active.mode === 'topic' && active.topicId;
    const label = topicLesson
      ? `${titleOf(active.topicId) ?? 'Konu'} — ${MODE_LABEL[active.sessionMode ?? 'normal'] ?? 'Çalışma'}`
      : active.mode === 'mistakes'
        ? 'Hata tekrarı'
        : `${MODE_LABEL[active.sessionMode ?? 'gr-mixed'] ?? 'Genel Tekrar'}${
          active.topicId && titleOf(active.topicId) ? ` — ${titleOf(active.topicId)}` : ''
        }`;
    return {
      kind: 'resume',
      eyebrow: 'Yarım kalan çalışma',
      title: label,
      description: `${remaining} soru kaldı. Kaldığın yerden devam edebilirsin.`,
      action: 'Devam Et',
      route: topicLesson
        ? {
          name: 'lesson',
          topicId: active.topicId!,
          mode: active.sessionMode ?? 'normal',
          ...(active.sectionId ? { sectionId: active.sectionId } : {}),
        }
        : active.mode === 'mistakes'
          ? { name: 'mistake-review' }
          : { name: 'review' },
    };
  }

  const topicStats = topics.map((topic) => ({
    topic,
    stats: getTopicProgressStats(progress, topic.id, exercisesForTopic(topic.id)),
  }));

  // 2. Calisilmis ama dogrulugu dusuk kalan konu (haritada en ileri olan).
  const weak = [...topicStats]
    .reverse()
    .find(
      (entry) =>
        entry.stats.completed > 0 &&
        entry.stats.accuracy !== null &&
        entry.stats.accuracy < REVIEW_THRESHOLD,
    );
  if (weak) {
    return {
      kind: 'weak-topic',
      eyebrow: 'Bugün önerilen',
      title: `${weak.topic.title} — Hızlı Tekrar`,
      description: `Doğruluğun %${Math.round((weak.stats.accuracy ?? 0) * 100)}. Kısa bir tur bunu toparlar.`,
      action: 'Hızlı Tekrar',
      route: { name: 'lesson', topicId: weak.topic.id, mode: 'quick' },
    };
  }

  // 3. Biriken hatalar.
  const openMistakes = Object.keys(progress.mistakes).length;
  if (openMistakes >= OPEN_MISTAKE_THRESHOLD) {
    return {
      kind: 'mistakes',
      eyebrow: 'Bugün önerilen',
      title: `${openMistakes} aktif hata`,
      description: 'Hatalarını tekrar etmek, yeni konu açmaktan daha çok kazandırır.',
      action: 'Hataları Tekrar Et',
      route: { name: 'mistakes' },
    };
  }

  // 4. Haritada siradaki tamamlanmamis konu (yarim olan once).
  const next =
    topicStats.find((entry) => entry.stats.state === 'in-progress') ??
    topicStats.find((entry) => entry.stats.state !== 'completed');
  if (next) {
    return {
      kind: 'next-topic',
      eyebrow: 'Bugün önerilen',
      title:
        next.stats.state === 'in-progress'
          ? `${next.topic.title} — Kalanları Çalış`
          : `${next.topic.title} — Normal Çalışma`,
      description:
        next.stats.state === 'in-progress'
          ? `${next.stats.total - next.stats.completed} alıştırma henüz hiç karşına çıkmadı.`
          : 'Bu konu seni bekliyor.',
      action: 'Başla',
      route: { name: 'topic', topicId: next.topic.id },
    };
  }

  // 5. Her sey tamam: en dusuk dogruluklu konunun hizli tekrari.
  const weakest = [...topicStats].sort(
    (a, b) => (a.stats.accuracy ?? 1) - (b.stats.accuracy ?? 1),
  )[0];
  const topic = weakest?.topic ?? topics[0];
  return {
    kind: 'refresh',
    eyebrow: 'Bugün önerilen',
    title: `${topic?.title ?? 'Konu'} — Hızlı Tekrar`,
    description: 'Tüm konular tamam. Bilgiyi taze tutmak için kısa bir tur.',
    action: 'Hızlı Tekrar',
    route: { name: 'lesson', topicId: topic?.id ?? '', mode: 'quick' },
  };
}
