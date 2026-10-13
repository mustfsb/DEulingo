/**
 * Haftalık plan — imperatif karma oturumlar (Mini Tekrar, Karışık Tekrar,
 * Zayıf Alanlar, Haftalık Gramer).
 *
 * Havuzlar İngilizce DERS bankasından kurulur ve konu/tür koşuluyla
 * sınırlıdır: Past Perfect + Gerund karışık tekrarında başka konu sızmaz.
 * Oturum Genel Tekrar akışıyla (`review` modu, `gr-mixed` ayarları) açılır;
 * konu oturum sayaçları artmaz, ustalık ve hata takibi normal çalışır.
 */

import type { Exercise } from '../content/types';
import type { WeekReviewSetId } from '../content/en/skills-weekly';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import { seededShuffle } from '../content/parser/text';
import { buildSessionPlan } from './session';
import type { UserProgress } from './storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from './router';

export interface WeekReviewMeta {
  id: WeekReviewSetId;
  title: string;
  /** Oturum büyüklüğü (soru sayısı). */
  size: number;
}

export const WEEK_REVIEW_META: Record<WeekReviewSetId, WeekReviewMeta> = {
  'b-mini': { id: 'b-mini', title: 'Session B Mini Tekrar', size: 15 },
  'd-mixed': { id: 'd-mixed', title: 'Past Perfect + Gerund & Infinitive Karışık Tekrar', size: 24 },
  'g-weak': { id: 'g-weak', title: 'Zayıf Alanlar Isınma', size: 24 },
  'g-grammar': { id: 'g-grammar', title: 'Haftalık Gramer Tekrarı', size: 54 },
};

const GRAMMAR_TOPICS = [
  'en.present-perfect', 'en.past-perfect', 'en.gerund-infinitive',
  'en.sentence-structure', 'en.conditionals', 'en.prepositions-collocations',
];

const AUDIO_ONLY = new Set<Exercise['type']>(['spoken', 'dictation', 'listen-choice']);

const WEAK_SECTIONS = new Set([
  'present-perfect.v3',
  'prepositions-collocations.chunks-a',
  'prepositions-collocations.chunks-b',
  'prepositions-collocations.chunks-c',
]);

/**
 * Bu setin UYGUN (örneklenmemiş) havuzu: oturum bundan seçer. Denetim ve
 * "yeterince geniş mi?" ölçümleri bunu sayar; `weekReviewPool` ise g-grammar için
 * konu başına örnekleyerek altı konunun da temsilini garanti eder.
 */
export function weekReviewEligible(
  setId: WeekReviewSetId,
  progress: UserProgress,
  lesson: readonly Exercise[] = EN_LESSON_EXERCISES,
): Exercise[] {
  if (setId === 'g-grammar') {
    return lesson.filter((e) => GRAMMAR_TOPICS.includes(e.topicId) && !AUDIO_ONLY.has(e.type));
  }
  return weekReviewPool(setId, progress, lesson);
}

/** Tüm ders egzersizlerinden bu setin uygun havuzu (oturum kurulmadan sayılabilir). */
export function weekReviewPool(
  setId: WeekReviewSetId,
  progress: UserProgress,
  lesson: readonly Exercise[] = EN_LESSON_EXERCISES,
  seed = 'pool',
): Exercise[] {
  switch (setId) {
    case 'b-mini':
      return lesson.filter(
        (e) => e.topicId === 'en.present-perfect' && (e.type === 'listen-choice' || e.type === 'dictation' || e.type === 'spoken'),
      );
    case 'd-mixed':
      return lesson.filter((e) => (e.topicId === 'en.past-perfect' || e.topicId === 'en.gerund-infinitive') && e.type !== 'spoken');
    case 'g-grammar': {
      // Altı konu da temsil edilsin: konu başına en fazla 12. Aktarım ölçülür:
      // hafta içinde HİÇ görülmemiş ya da yanlış yapılmış sorular önce gelir,
      // doğru çözülmüş olanlar yalnızca yer kalırsa girer.
      const rank = (e: Exercise): number => {
        const entry = progress.exercises[e.id];
        if (!entry || entry.attempts.length === 0) return 0;
        return entry.incorrectCount > 0 ? 0 : 1;
      };
      return GRAMMAR_TOPICS.flatMap((topicId) => {
        const shuffled = seededShuffle(lesson.filter((e) => e.topicId === topicId && !AUDIO_ONLY.has(e.type)), `${seed}:${topicId}`);
        return [...shuffled].sort((a, b) => rank(a) - rank(b)).slice(0, 12);
      });
    }
    case 'g-weak': {
      const mistaken = new Set(Object.keys(progress.mistakes));
      return lesson.filter(
        (e) =>
          mistaken.has(e.id) ||
          (e.sectionId !== undefined && WEAK_SECTIONS.has(e.sectionId)) ||
          e.type === 'error-correction',
      );
    }
  }
}

/** Oturumu kurar ve `#/tekrar` rotasına geçer; havuz boşsa false. */
export function startWeekReview(
  api: ProgressApi,
  navigate: (route: Route) => void,
  setId: WeekReviewSetId,
): boolean {
  const meta = WEEK_REVIEW_META[setId];
  const stamp = Date.now();
  const pool = weekReviewPool(setId, api.progress, EN_LESSON_EXERCISES, `wk:${setId}:${stamp}`);
  if (!pool.length) return false;
  const plan = buildSessionPlan({
    pool,
    progress: api.progress,
    mode: 'gr-mixed',
    seed: `wk:${setId}:${stamp}`,
    size: Math.min(meta.size, pool.length),
  });
  if (!plan.primaryQueue.length) return false;
  api.update((current) => ({
    ...current,
    activeLesson: {
      mode: 'review',
      sessionMode: 'gr-mixed',
      queue: plan.primaryQueue,
      index: 0,
      startedAt: new Date().toISOString(),
      results: [],
      retries: {},
      streak: { current: 0, best: 0, firedMilestones: [] },
    },
  }));
  navigate({ name: 'review' });
  return true;
}
