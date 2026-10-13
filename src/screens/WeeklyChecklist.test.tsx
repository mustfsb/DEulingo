// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { WeeklyReviewScreen } from './WeeklyReviewScreen';
import { EN_WEEK_1_ACTIVITIES } from '../content/en/skills-weekly';
import { emptySkills, type EnSkillsState } from '../lib/skills-storage';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  return dom;
}

function mountWeekly(skills: EnSkillsState, onSkills: (fn: (s: EnSkillsState) => EnSkillsState) => void, navigate: (route: Route) => void) {
  const dom = setupDom();
  let progress: UserProgress = createEmptyProgress();
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
    language: 'en',
    setLanguage: () => undefined,
  };
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(createElement(WeeklyReviewScreen, { api, skills, onSkills, navigate }));
  });
  return { dom, root };
}

function checkboxes(dom: JSDOM): HTMLElement[] {
  return [...dom.window.document.querySelectorAll('[role="checkbox"]')] as HTMLElement[];
}

describe('haftalik plan listesi', () => {
  it('her aktivite bagimsiz isaretlenebilir', () => {
    const skills = emptySkills();
    const seen: Array<(s: EnSkillsState) => EnSkillsState> = [];
    const { dom, root } = mountWeekly(skills, (fn) => { seen.push(fn); }, () => {});
    const boxes = checkboxes(dom);
    expect(boxes.length).toBe(EN_WEEK_1_ACTIVITIES.length);
    expect(boxes.every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);

    const first = boxes[0];
    act(() => { first.click(); });
    expect(seen.length).toBe(1);
    const next = seen[0](skills);
    expect(next.weekly.completedActivities).toEqual([EN_WEEK_1_ACTIVITIES[0].id]);
    // diger aktiviteler etkilenmez
    expect(next.weekly.completedActivities.length).toBe(1);
    act(() => { root.unmount(); });
  });

  it('isaret kalicidir ve geri alinabilir (yeniden cizimde korunur)', () => {
    let skills = emptySkills();
    const routes: Route[] = [];
    const onSkills = (fn: (s: EnSkillsState) => EnSkillsState) => { skills = fn(skills); };
    const first = mountWeekly(skills, onSkills, (r) => { routes.push(r); });
    act(() => { checkboxes(first.dom)[0].click(); });
    expect(skills.weekly.completedActivities.length).toBe(1);
    act(() => { first.root.unmount(); });

    const second = mountWeekly(skills, onSkills, (r) => { routes.push(r); });
    const boxes = checkboxes(second.dom);
    expect(boxes[0].getAttribute('aria-checked')).toBe('true');
    expect(boxes[1].getAttribute('aria-checked')).toBe('false');
    act(() => { boxes[0].click(); });
    expect(skills.weekly.completedActivities).toEqual([]);
    act(() => { second.root.unmount(); });
  });

  it('For/Since + Dikte Git tam filtreli dinlemeye gider (genel degil)', () => {
    const skills = emptySkills();
    const routes: Route[] = [];
    const updaters: Array<(s: EnSkillsState) => EnSkillsState> = [];
    const { dom, root } = mountWeekly(skills, (fn) => { updaters.push(fn); }, (r) => { routes.push(r); });
    const boxes = checkboxes(dom);
    const dictation = boxes.find((b) => (b.getAttribute('aria-label') ?? '').startsWith('For / Since Dikte:'));
    expect(dictation).toBeTruthy();
    const row = dictation!.closest('li')!;
    const git = row.querySelector('a')!;
    expect(git.textContent).toContain('Git');
    act(() => { git.click(); });
    expect(routes.length).toBe(1);
    expect(routes[0]).toEqual({
      name: 'listening',
      topicId: 'en.present-perfect',
      kind: 'dictation',
      focus: 'for-since',
      itemId: 'en-lis-d9',
    });
    // Git isareti degistirmez: onay kutusu ayridir. Yalnizca sure olcumu baslar.
    const after = updaters.reduce((state, fn) => fn(state), skills);
    expect(after.weekly.completedActivities).toEqual([]);
    expect(after.weekly.tracking).toBe('en.w1.a.dictation');
    expect(after.weekly.timing['en.w1.a.dictation']).toMatchObject({ activeSeconds: 0, visits: 1 });
    expect(dictation!.getAttribute('aria-checked')).toBe('false');
    act(() => { root.unmount(); });
  });

  it('ilerleme isaretlerden turetilir', () => {
    const skills = emptySkills();
    skills.weekly.completedActivities = [EN_WEEK_1_ACTIVITIES[0].id, EN_WEEK_1_ACTIVITIES[1].id];
    const { dom, root } = mountWeekly(skills, () => {}, () => {});
    const text = dom.window.document.body.textContent ?? '';
    expect(text).toContain(`2 / ${EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'core').length} tamamlandı`);
    act(() => { root.unmount(); });
  });
});
