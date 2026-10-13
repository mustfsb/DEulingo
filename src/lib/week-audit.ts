/**
 * Hafta 1 plan denetimi: her aktivite için hedef GERÇEK bir içeriğe iniyor mu,
 * havuz yeterince geniş mi, derin bağlantı gidiş-dönüşte aynı rotayı veriyor mu?
 *
 * Test (`week-links.test.ts`) ve manuel QA aynı tabloyu kullanır; böylece
 * "Git" düğmelerinin sahte hedefe inmesi derlemede yakalanır.
 */

import { EN_WEEK_1_PLAN, type WeekActivity } from '../content/en/skills-weekly';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { EN_WRITING_BY_ID } from '../content/en/skills-writing';
import { EN_LISTENING_BY_ID, listeningPool } from '../content/en/skills-listening';
import { EN_EXTERNAL_LISTENING_BY_ID } from '../content/en/skills-listening-external';
import { EN_SPEAKING_BY_ID, speakingPool } from '../content/en/skills-speaking';
import { EN_TOPIC_BY_ID, EN_SECTION_BY_ID } from '../content/en/topics';
import { enContent } from './content-en';
import { buildVocabSession } from './vocab/questions';
import { createEmptyProgress } from './storage';
import { hrefFor, parseHash } from './router';
import { isImperativeLink, routeForWeekLink, weekLinkLabel } from './week-destination';
import { WEEK_REVIEW_META, weekReviewEligible, weekReviewPool } from './week-review';
import { distinctCount } from './pool-metrics';

export interface WeekAuditRow {
  session: string;
  activityId: string;
  label: string;
  destination: string;
  href: string;
  /** Hedefte gerçek içerik var mı? */
  contentExists: boolean;
  /** Havuzdaki öğe sayısı (soru/parça/istem/kelime/pasaj sorusu). */
  count: number;
  /** Bu aktivite için beklenen en düşük havuz. */
  minimum: number;
  enough: boolean;
  /** Rota href'ten geri ayrıştırılınca aynı rotayı veriyor mu (imperatifte: oturum kurulabiliyor mu)? */
  deepLinkWorks: boolean;
}

/**
 * Aktivite için beklenen en düşük öğe sayısı: iş yükü modelinin saydığı
 * gerçek öğelerden (soru / parça / istem) türetilir — elle tablo tutulmaz.
 */
export function minimumFor(activity: WeekActivity): number {
  switch (activity.link.kind) {
    case 'lesson':
      return 10;
    case 'review-set':
      return 12;
    case 'listening':
      return activity.link.itemId ? 1 : 10;
    case 'listening-task':
      return 8;
    case 'reading-passage':
      return 10;
    case 'speaking':
      return 2;
    case 'vocab-topic':
      return 20;
    default:
      return 1;
  }
}

function poolCount(activity: WeekActivity): { exists: boolean; count: number } {
  const link = activity.link;
  switch (link.kind) {
    case 'summary': {
      const summary = enContent.summariesByTopic.get(link.topicId);
      const section = link.sectionId ? summary?.sections.find((entry) => entry.id === link.sectionId) : undefined;
      return { exists: !!summary && (!link.sectionId || !!section), count: summary?.sections.length ?? 0 };
    }
    case 'lesson': {
      if (!EN_TOPIC_BY_ID.has(link.topicId)) return { exists: false, count: 0 };
      if (link.mode === 'section') {
        const known = !!link.sectionId && (EN_SECTION_BY_ID.has(link.sectionId) || link.sectionId.startsWith('set.'));
        const count = link.sectionId ? distinctCount(enContent.exercisesForSection(link.sectionId)) : 0;
        return { exists: known && count > 0, count };
      }
      const count = distinctCount(enContent.exercisesForTopic(link.topicId));
      return { exists: count > 0, count };
    }
    case 'review-set': {
      const count = distinctCount(weekReviewEligible(link.setId, createEmptyProgress(), EN_LESSON_EXERCISES));
      return { exists: count > 0 && !!WEEK_REVIEW_META[link.setId], count };
    }
    case 'review-mixed':
      return { exists: enContent.reviewBank.length > 0, count: enContent.reviewBank.length };
    case 'listening': {
      const pool = listeningPool({ topicId: link.topicId, kind: link.listenKind, focus: link.focus });
      const itemOk = !link.itemId || (EN_LISTENING_BY_ID.has(link.itemId) && pool.some((item) => item.id === link.itemId));
      return { exists: pool.length > 0 && itemOk, count: pool.length };
    }
    case 'listening-task': {
      const task = EN_EXTERNAL_LISTENING_BY_ID.get(link.taskId);
      return { exists: !!task && /^https:\/\//.test(task.url), count: task ? task.gist.length + task.detail.length : 0 };
    }
    case 'speaking': {
      const pool = speakingPool({ topicId: link.topicId, kind: link.speakKind, focus: link.focus });
      const itemOk = !link.promptId || (EN_SPEAKING_BY_ID.has(link.promptId) && pool.some((prompt) => prompt.id === link.promptId));
      return { exists: pool.length > 0 && itemOk, count: pool.length };
    }
    case 'writing': {
      const task = EN_WRITING_BY_ID.get(link.taskId);
      return { exists: !!task, count: task ? 1 : 0 };
    }
    case 'reading':
      return { exists: true, count: 1 };
    case 'reading-intro':
      return { exists: true, count: 1 };
    case 'reading-passage': {
      const passage = EN_READING_BY_ID.get(link.passageId);
      return { exists: !!passage, count: passage?.questions.length ?? 0 };
    }
    case 'reading-vocab': {
      const count = [...EN_READING_BY_ID.values()]
        .filter((passage) => passage.weekRole === 'week1-passage-1' || passage.weekRole === 'week1-passage-2')
        .reduce((sum, passage) => sum + passage.vocab.length, 0);
      return { exists: count > 0, count };
    }
    case 'vocab-topic': {
      const questions = buildVocabSession({
        kind: link.study ?? 'topic',
        topicId: link.topicId,
        size: link.size ?? 'normal',
        seed: 'week-audit',
        progress: createEmptyProgress(),
        inventory: enContent.vocabulary,
      });
      const pool = enContent.vocabulary.filter((entry) => !link.topicId || entry.topicIds.includes(link.topicId));
      return { exists: questions.length > 0, count: pool.length };
    }
    case 'weekly-analysis':
    case 'mistakes':
      return { exists: true, count: 1 };
  }
}

/** Anahtar sırasından bağımsız karşılaştırma. */
function stableKey(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v);
}

function deepLinkWorks(activity: WeekActivity): boolean {
  if (isImperativeLink(activity.link)) {
    if (activity.link.kind !== 'review-set') return true;
    return weekReviewPool(activity.link.setId, createEmptyProgress(), EN_LESSON_EXERCISES).length > 0;
  }
  const route = routeForWeekLink(activity.link);
  if (!route) return false;
  return stableKey(parseHash(hrefFor(route))) === stableKey(route);
}

export function auditWeekPlan(): WeekAuditRow[] {
  return EN_WEEK_1_PLAN.flatMap((session) =>
    session.activities.map((activity): WeekAuditRow => {
      const { exists, count } = poolCount(activity);
      const minimum = minimumFor(activity);
      const route = isImperativeLink(activity.link) ? null : routeForWeekLink(activity.link);
      return {
        session: session.code,
        activityId: activity.id,
        label: activity.label,
        destination: weekLinkLabel(activity.link),
        href: route ? hrefFor(route) : '(oturum kurar)',
        contentExists: exists,
        count,
        minimum,
        enough: count >= minimum,
        deepLinkWorks: deepLinkWorks(activity),
      };
    }),
  );
}
