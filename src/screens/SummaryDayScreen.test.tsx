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

function mount(day: number, topicId?: string) {
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
    root.render(createElement(SummaryDayScreen, { day, topicId, api, navigate: (route) => routes.push(route) }));
  });
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  return { dom, root, routes, buttons, progress: () => progress };
}

describe('gun ozet ekrani (tek mufredat)', () => {
  it('her gunu konulariyla, okunma kaydıyla ve konu pratiğiyle açar', () => {
    for (const day of [5, 6, 7]) {
      const summary = getSummary(day)!;
      const view = mount(day);

      expect(view.dom.window.document.body.textContent).toContain(`${day}. Gün`);
      expect(view.dom.window.document.body.textContent).not.toContain('Özel Ders');
      expect(view.dom.window.document.querySelectorAll('section[id^="konu-private"]').length).toBe(summary.topics.length);
      expect(view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış')).toHaveLength(summary.topics.length);
      expect(Object.keys(view.progress().settings.readSummaries ?? {}).filter((id) => id.startsWith('private.'))).toHaveLength(summary.topics.length);

      act(() => view.buttons().find((button) => button.textContent === 'Bu Konuyu Çalış')!.click());
      expect(view.routes).toEqual([{ name: 'lesson', day, mode: 'topic', topicId: summary.topics[0].id }]);
      act(() => view.root.unmount());
    }
  });
});

describe('genel tekrar ozeti (0. gun)', () => {
  it('kumulatif ozeti konulariyla acar; her konu calismaya gider', () => {
    const summary = getSummary(0)!;
    expect(summary.title).toBe('Genel Tekrar');
    const view = mount(0);

    expect(view.dom.window.document.body.textContent).toContain('Genel Tekrar');
    const practiceButtons = view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış');
    expect(practiceButtons.length).toBeGreaterThanOrEqual(20);

    // Saatler konusu Genel Tekrar saat grubuna gider (gun dersine degil).
    const hourSection = view.dom.window.document.getElementById('konu-genel.saat');
    expect(hourSection).not.toBeNull();
    const hourButton = [...(hourSection as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent === 'Bu Konuyu Çalış');
    expect(hourButton).toBeDefined();
    act(() => hourButton!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'review' });
    act(() => view.root.unmount());
  });
});
