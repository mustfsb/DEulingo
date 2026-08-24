import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { getSummary } from '../lib/content';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { SummaryDayScreen } from './SummaryDayScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(day: number) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });

  let progress: UserProgress = createEmptyProgress();
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
  };
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(createElement(SummaryDayScreen, { day, api, navigate: (route) => routes.push(route) }));
  });
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  return { dom, root, routes, buttons, progress: () => progress };
}

describe('Gün 4–6 özet ekranı', () => {
  it('her yeni günü üç kaynak-konuyla, okunma kaydıyla ve konu pratiğiyle açar', () => {
    for (const day of [4, 5, 6]) {
      const summary = getSummary(day)!;
      const view = mount(day);

      expect(view.dom.window.document.body.textContent).toContain(`${day}. Gün`);
      expect(view.dom.window.document.querySelectorAll('section[id^="konu-day"]').length).toBe(summary.topics.length);
      expect(view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış')).toHaveLength(summary.topics.length);
      expect(Object.keys(view.progress().settings.readSummaries ?? {}).filter((id) => id.startsWith(`day${day}.`))).toHaveLength(summary.topics.length);

      act(() => view.buttons().find((button) => button.textContent === 'Bu Konuyu Çalış')!.click());
      expect(view.routes).toEqual([{ name: 'lesson', track: 'normal', day, mode: 'topic', topicId: summary.topics[0].id }]);
      act(() => view.root.unmount());
    }
  });
});
