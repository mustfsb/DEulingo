// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { ReadingHomeScreen } from './ReadingHomeScreen';
import { WritingHomeScreen } from './WritingHomeScreen';
import { ListeningHomeScreen } from './ListeningHomeScreen';
import { SpeakingHomeScreen } from './SpeakingHomeScreen';
import { WeeklyReviewScreen } from './WeeklyReviewScreen';
import { emptySkills } from '../lib/skills-storage';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { languageOfTopicId, progressKeyFor } from '../lib/language';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function setup() {
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

function mount(element: React.ReactElement) {
  const dom = setup();
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => { root.render(element); });
  return { dom, root, routes, text: () => dom.window.document.body.textContent ?? '' };
}

describe('beceri ekranları çökmeden çizilir', () => {
  it('reading/writing/listening/speaking/weekly', () => {
    const skills = emptySkills();
    const noop = () => {};
    const nav = (() => {}) as unknown as (route: Route) => void;

    let view = mount(createElement(ReadingHomeScreen, { skills, navigate: nav }));
    expect(view.text()).toContain('Reading');
    act(() => { view.root.unmount(); });

    view = mount(createElement(WritingHomeScreen, { skills, onRecord: noop, navigate: nav }));
    expect(view.text()).toContain('Writing');
    act(() => { view.root.unmount(); });

    view = mount(createElement(ListeningHomeScreen, { skills, onRecord: noop, navigate: nav }));
    expect(view.text()).toContain('Listening');
    act(() => { view.root.unmount(); });

    view = mount(createElement(SpeakingHomeScreen, { skills, onRecord: noop, navigate: nav }));
    expect(view.text()).toContain('Speaking');
    act(() => { view.root.unmount(); });

    let progress: UserProgress = createEmptyProgress();
    const api: ProgressApi = {
      get progress() { return progress; },
      update(updater) { progress = updater(progress); },
      replace(next) { progress = next; },
      language: 'en',
      setLanguage: () => undefined,
    };
    view = mount(createElement(WeeklyReviewScreen, { api, skills, onSkills: noop, navigate: nav }));
    expect(view.text()).toContain('Haftalık');
    act(() => { view.root.unmount(); });
  });

  it('dil izolasyonu: konu kimlikleri + ilerleme anahtarları', () => {
    expect(progressKeyFor('de')).not.toBe(progressKeyFor('en'));
    for (const id of ['en.present-perfect', 'en.sentence-structure', 'en.past-perfect', 'en.gerund-infinitive', 'en.conditionals', 'en.prepositions-collocations']) {
      expect(languageOfTopicId(id)).toBe('en');
    }
    expect(languageOfTopicId('topic.perfekt')).toBe('de');
  });
});
