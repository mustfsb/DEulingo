/**
 * Haftalık plan aktivitesi → gerçek rota + okunabilir hedef.
 *
 * Her `Git` eylemi en özel hedefe iner; genel beceri sayfasına düşüş
 * yoktur. `review-set` / `review-mixed` rota değil, oturum kurulumudur:
 * `routeForWeekLink` null döner ve ekran `startWeekReview` çağırır.
 */

import type { WeekLink } from '../content/en/skills-weekly';
import { EN_PRACTICE_SET_BY_ID } from '../content/en/practice-sets';
import { EN_SECTION_BY_ID, EN_TOPIC_BY_ID } from '../content/en/topics';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { EN_WRITING_BY_ID } from '../content/en/skills-writing';
import { EN_EXTERNAL_LISTENING_BY_ID } from '../content/en/skills-listening-external';
import type { Route } from './router';

export function routeForWeekLink(link: WeekLink): Route | null {
  switch (link.kind) {
    case 'summary': {
      const route: Extract<Route, { name: 'summary' }> = { name: 'summary', topicId: link.topicId };
      if (link.sectionId) route.sectionId = link.sectionId;
      return route;
    }
    case 'lesson': {
      const route: Extract<Route, { name: 'lesson' }> = {
        name: 'lesson',
        topicId: link.topicId,
        mode: link.mode,
      };
      if (link.sectionId) route.sectionId = link.sectionId;
      if (link.all && link.mode === 'section') route.all = true;
      return route;
    }
    case 'listening-task':
      return { name: 'listening-task', taskId: link.taskId };
    case 'listening': {
      const route: Extract<Route, { name: 'listening' }> = { name: 'listening' };
      if (link.topicId) route.topicId = link.topicId;
      if (link.listenKind) route.kind = link.listenKind;
      if (link.focus) route.focus = link.focus;
      if (link.itemId) route.itemId = link.itemId;
      return route;
    }
    case 'writing': {
      const route: Extract<Route, { name: 'writing' }> = { name: 'writing', taskId: link.taskId };
      if (link.stage) route.stage = link.stage;
      return route;
    }
    case 'speaking': {
      const route: Extract<Route, { name: 'speaking' }> = { name: 'speaking' };
      if (link.topicId) route.topicId = link.topicId;
      if (link.speakKind) route.kind = link.speakKind;
      if (link.focus) route.focus = link.focus;
      if (link.promptId) route.promptId = link.promptId;
      if (link.retry) route.retry = true;
      return route;
    }
    case 'reading':
      return link.filter ? { name: 'reading', filter: link.filter } : { name: 'reading' };
    case 'reading-intro':
      return { name: 'reading-intro' };
    case 'reading-passage':
      return link.view
        ? { name: 'reading-passage', passageId: link.passageId, view: link.view }
        : { name: 'reading-passage', passageId: link.passageId };
    case 'reading-vocab':
      return { name: 'reading-vocab' };
    case 'vocab-topic': {
      const route: Extract<Route, { name: 'vocab-study' }> = { name: 'vocab-study', kind: link.study ?? 'topic' };
      if (link.topicId) route.topicId = link.topicId;
      if (link.size) route.size = link.size;
      return route;
    }
    case 'weekly-analysis':
      return { name: 'weekly-analysis' };
    case 'mistakes':
      return link.scope ? { name: 'mistakes', scope: link.scope } : { name: 'mistakes' };
    case 'review-mixed':
    case 'review-set':
      return null;
  }
}

/** Oturum kuran (rotası olmayan) hedef mi? */
export function isImperativeLink(link: WeekLink): boolean {
  return link.kind === 'review-set' || link.kind === 'review-mixed';
}

export interface WeekLinkDescription {
  skill: string;
  topic?: string;
  mode?: string;
  focus?: string;
}

const FOCUS_LABELS: Record<string, string> = {
  'for-since': 'For / Since',
  'pp-short': 'Short Listening',
  v3: 'V3',
  'pp-shadowing': 'Shadowing',
  'pp-read': 'Read Aloud',
  'pp-personal': 'Answer the Question',
  'pp-monologue': 'Mini Monologue',
  'pp-long-turn': 'Long Turn',
  'ppf-gi': 'Past Perfect + Gerund/Infinitive',
  'reading-talk': 'Talk About the Reading',
  'mixed-dictation': 'Mixed Dictation',
  'second-conditional': 'Second Conditional',
  'week1-test': 'Hafta 1 Testi',
};

const SET_REVIEW_LABELS: Record<string, string> = {
  'b-mini': 'Mini Tekrar',
  'd-mixed': 'Karışık Tekrar',
  'g-weak': 'Zayıf Alanlar',
  'g-grammar': 'Gramer',
};

const WRITING_KIND_LABELS: Record<string, string> = {
  short: 'Short Writing',
  grammar: 'Grammar Writing',
  guided: 'Guided Writing',
  'ielts-intro': 'IELTS Writing',
  'weekly-test': 'Weekly Test',
};

const topicTitle = (id?: string): string | undefined => (id ? EN_TOPIC_BY_ID.get(id)?.title : undefined);

/** "Listening → Present Perfect → Dictation → For / Since" için bileşenler. */
export function describeWeekLink(link: WeekLink): WeekLinkDescription {
  switch (link.kind) {
    case 'summary':
      return { skill: 'Özet', topic: topicTitle(link.topicId) };
    case 'lesson': {
      const set = link.sectionId ? EN_PRACTICE_SET_BY_ID.get(link.sectionId) : undefined;
      const section = link.sectionId ? EN_SECTION_BY_ID.get(link.sectionId) : undefined;
      return {
        skill: 'Alıştırma',
        topic: topicTitle(link.topicId),
        mode: set?.title ?? section?.title ?? (link.mode === 'normal' ? 'Normal çalışma' : link.mode),
      };
    }
    case 'review-set':
      return { skill: 'Genel Tekrar', topic: 'Hafta 1', mode: SET_REVIEW_LABELS[link.setId] };
    case 'review-mixed':
      return { skill: 'Genel Tekrar', topic: 'Hafta 1', mode: 'Karışık' };
    case 'listening': {
      const mode = link.listenKind === 'dictation' ? 'Dictation' : link.listenKind === 'short' ? 'Short Listening' : link.listenKind === 'ielts' ? 'IELTS' : undefined;
      const focus = link.focus ? FOCUS_LABELS[link.focus] ?? link.focus : undefined;
      return { skill: 'Listening', topic: topicTitle(link.topicId), mode, focus: focus === mode ? undefined : focus };
    }
    case 'listening-task': {
      const task = EN_EXTERNAL_LISTENING_BY_ID.get(link.taskId);
      return { skill: 'Listening', topic: task?.provider, mode: 'Gerçek dinleme', focus: task?.title };
    }
    case 'writing': {
      const task = EN_WRITING_BY_ID.get(link.taskId);
      return {
        skill: 'Writing',
        topic: task ? WRITING_KIND_LABELS[task.kind] : undefined,
        mode: link.stage === 'rewrite' ? 'Yeniden yazma' : link.draftOnly ? 'Plan + taslak' : 'Plan → taslak → yeniden yazma',
        focus: task?.title,
      };
    }
    case 'speaking':
      return {
        skill: 'Speaking',
        topic: topicTitle(link.topicId) ?? (link.focus === 'week1-test' ? 'Hafta 1 Testi' : undefined),
        mode: link.retry ? 'Retry / Mistakes' : link.speakKind === 'shadowing' ? 'Shadowing' : link.speakKind === 'read-aloud' ? 'Read Aloud' : link.speakKind === 'short-answer' ? 'Answer the Question' : undefined,
        focus: link.focus && link.focus !== 'week1-test' && !link.speakKind ? FOCUS_LABELS[link.focus] ?? link.focus : undefined,
      };
    case 'reading':
      return { skill: 'Reading', mode: link.filter === 'ielts' ? 'IELTS' : undefined };
    case 'reading-intro':
      return { skill: 'Reading', mode: 'IELTS Introduction' };
    case 'reading-passage': {
      const passage = EN_READING_BY_ID.get(link.passageId);
      const label = passage?.weekRole === 'week1-passage-1' ? 'Week 1 Passage 1'
        : passage?.weekRole === 'week1-passage-2' ? 'Week 1 Passage 2'
        : passage?.weekRole === 'week1-test' ? 'Hafta 1 Testi' : passage?.title;
      return { skill: 'Reading', topic: passage?.weekRole === 'week1-test' ? 'Weekly Test' : 'IELTS Practice', mode: label, focus: link.view === 'review' ? 'Evidence Review' : undefined };
    }
    case 'reading-vocab':
      return { skill: 'Reading', topic: 'Week 1', mode: 'Vocabulary Extraction' };
    case 'vocab-topic':
      return {
        skill: 'Vocabulary',
        topic: link.topicId ? 'Collocations' : 'Hafta 1',
        mode: link.study === 'mixed' ? 'Mixed Practice' : link.study === 'flash' ? 'Flashcards' : link.study === 'type' ? 'Typing' : 'Study',
      };
    case 'weekly-analysis':
      return { skill: 'Weekly Review', mode: 'Mistake Analysis' };
    case 'mistakes':
      return { skill: 'Mistakes', topic: link.scope === 'week1' ? 'Week 1' : undefined };
  }
}

/** "Listening → Present Perfect → Dictation → For / Since" */
export function weekLinkLabel(link: WeekLink): string {
  const d = describeWeekLink(link);
  return [d.skill, d.topic, d.mode, d.focus].filter(Boolean).join(' → ');
}
