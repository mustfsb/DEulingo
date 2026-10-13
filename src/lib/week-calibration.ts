/**
 * Kişisel süre kalibrasyonu: model tahmini ↔ ölçülen gerçek süre.
 *
 * Gözlem yalnızca öğrencinin TAMAMLADI diye işaretlediği ve gerçekten
 * çalıştığı (≥ 45 sn ölçülmüş) aktivitelerden gelir; ölçüm yoksa gözlem de
 * yoktur — hiçbir değer uydurulmaz. Oran, modelin HIZLI profil tahminine
 * göredir (1,00 = hızlı profille aynı tempo).
 *
 * Kalibrasyon alıştırma AİLESİ bazındadır ve sağlamdır: medyan kullanılır
 * (tek bir aşırı hızlı/yavaş oturum sonucu belirlemez), az gözlemde 1,0'a
 * doğru büzülür ve [0,4 – 2,0] aralığına kırpılır. Hız CEZALANDIRILMAZ:
 * çıktı yalnızca gösterilen tahmini ve "Daha fazla pratik" önerisini etkiler.
 */

import {
  EN_WEEK_1_ACTIVITIES, type WeekActivity, type WeekFamily, type WeekLink,
} from '../content/en/skills-weekly';
import type { EnSkillsState } from './skills-storage';

/** Gözlem sayılması için gereken en az ölçülmüş süre (sn). */
export const MIN_OBSERVED_SECONDS = 45;
/** Aile katsayısı için gereken en az gözlem. */
export const MIN_FAMILY_SAMPLES = 2;

export type CalibrationFlag = 'Belirgin fazla tahmin' | 'Hafif fazla tahmin' | 'Uyumlu' | 'Eksik tahmin';

export interface Observation {
  activityId: string;
  label: string;
  skill: string;
  family: WeekFamily;
  estimatedMinutes: number;
  actualMinutes: number;
  ratio: number;
  completed: boolean;
  flag: CalibrationFlag;
}

export function flagFor(ratio: number): CalibrationFlag {
  if (ratio < 0.6) return 'Belirgin fazla tahmin';
  if (ratio < 0.85) return 'Hafif fazla tahmin';
  if (ratio <= 1.6) return 'Uyumlu';
  return 'Eksik tahmin';
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

/** Ölçülmüş tüm aktiviteler (tanılama tablosu). */
export function observations(skills: EnSkillsState, activities: readonly WeekActivity[] = EN_WEEK_1_ACTIVITIES): Observation[] {
  const done = new Set(skills.weekly.completedActivities);
  const out: Observation[] = [];
  for (const activity of activities) {
    const timing = skills.weekly.timing[activity.id];
    if (!timing || timing.activeSeconds < MIN_OBSERVED_SECONDS) continue;
    const ratio = timing.activeSeconds / Math.max(1, activity.workload.seconds.fast);
    out.push({
      activityId: activity.id, label: activity.label, skill: activity.skill, family: activity.family,
      estimatedMinutes: round1(activity.workload.seconds.fast / 60), actualMinutes: round1(timing.activeSeconds / 60),
      ratio: Math.round(ratio * 100) / 100, completed: done.has(activity.id), flag: flagFor(ratio),
    });
  }
  return out;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Aile → kişisel katsayı (yeterli TAMAMLANMIŞ, değişken olmayan gözlem varsa). */
export function familyFactors(skills: EnSkillsState, activities: readonly WeekActivity[] = EN_WEEK_1_ACTIVITIES): Map<WeekFamily, { factor: number; samples: number }> {
  const variable = new Set(activities.filter((a) => a.workload.variable).map((a) => a.id));
  const byFamily = new Map<WeekFamily, number[]>();
  for (const obs of observations(skills, activities)) {
    if (!obs.completed || variable.has(obs.activityId)) continue;
    byFamily.set(obs.family, [...(byFamily.get(obs.family) ?? []), obs.ratio]);
  }
  const out = new Map<WeekFamily, { factor: number; samples: number }>();
  for (const [family, ratios] of byFamily) {
    if (ratios.length < MIN_FAMILY_SAMPLES) continue;
    const n = ratios.length;
    const shrunk = (median(ratios) * n + 1) / (n + 1);
    out.set(family, { factor: Math.min(2, Math.max(0.4, Math.round(shrunk * 100) / 100)), samples: n });
  }
  return out;
}

/** Bu aktivite için kişiye göre düzeltilmiş tahmin (dk); kalibrasyon yoksa null. */
export function personalMinutes(activity: WeekActivity, factors: Map<WeekFamily, { factor: number; samples: number }>): number | null {
  const entry = factors.get(activity.family);
  if (!entry || Math.abs(entry.factor - 1) < 0.15) return null;
  return Math.max(1, Math.round((activity.workload.seconds.fast * entry.factor) / 60));
}

/** Aktivite tahmininden çok hızlı bittiyse: zorlamadan, hedefli ek pratik. */
export const EARLY_FINISH_RATIO = 0.6;

export function finishedEarly(activity: WeekActivity, skills: EnSkillsState): boolean {
  const timing = skills.weekly.timing[activity.id];
  if (!timing || timing.activeSeconds < MIN_OBSERVED_SECONDS || activity.workload.variable) return false;
  return skills.weekly.completedActivities.includes(activity.id)
    && timing.activeSeconds < activity.workload.seconds.fast * EARLY_FINISH_RATIO;
}

/** "Daha fazla pratik": aynı becerinin daha zor / daha üretken bir sonraki adımı. */
export function extensionFor(activity: WeekActivity): { label: string; link: WeekLink } | null {
  const link = activity.link;
  switch (link.kind) {
    case 'lesson':
      return { label: 'Zor sorular (üretim ağırlıklı)', link: { kind: 'lesson', topicId: link.topicId, mode: 'challenge' } };
    case 'review-set':
      return { label: 'Karışık Genel Tekrar', link: { kind: 'review-mixed' } };
    case 'listening':
      return { label: 'Uzun dinleme setleri', link: { kind: 'listening', listenKind: 'ielts' } };
    case 'listening-task':
      return { label: 'Dikte ile pekiştir', link: { kind: 'listening', listenKind: 'dictation', focus: 'mixed-dictation' } };
    case 'speaking':
      return { label: 'Uzun konuşma kartları', link: { kind: 'speaking', speakKind: 'topic' } };
    case 'writing':
      return { label: 'Yeniden yazmayı derinleştir', link: { kind: 'writing', taskId: link.taskId, stage: 'rewrite' } };
    case 'reading-passage':
    case 'reading-intro':
      return { label: 'Ek IELTS tarzı pasajlar', link: { kind: 'reading', filter: 'ielts' } };
    case 'vocab-topic':
    case 'reading-vocab':
      return { label: 'Yazarak hatırla (tüm öbekler)', link: { kind: 'vocab-topic', study: 'type', size: 'full' } };
    default:
      return null;
  }
}
