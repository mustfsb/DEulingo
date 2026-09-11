import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { getTopicSummary, reviewSummary } from '../lib/content';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { ReviewSummaryScreen, SummaryTopicScreen } from './SummaryTopicScreen';
import { T } from '../content/curriculum/topics';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(render: (api: ProgressApi, navigate: (route: Route) => void) => ReturnType<typeof createElement>) {
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
  act(() => root.render(render(api, (route) => routes.push(route))));
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  return { dom, root, routes, buttons, progress: () => progress };
}

describe('konu ozeti ekrani', () => {
  it('Modalverben ozetini bolumleriyle acar, okunma kaydeder, konu ve bolum pratigine gider', () => {
    const summary = getTopicSummary(T.modalVerbs)!;
    const view = mount((api, navigate) => createElement(SummaryTopicScreen, { topicId: T.modalVerbs, api, navigate }));
    const text = view.dom.window.document.body.textContent ?? '';

    expect(text).toContain('Modalverben');
    expect(text).not.toMatch(/\d+\.\s*Gün/);
    expect(view.dom.window.document.querySelectorAll('section[id^="bolum-modal-verbs."]').length).toBe(summary.sections.length);
    expect(Object.keys(view.progress().settings.readSummaries)).toEqual(summary.sections.map((section) => section.id));

    const topicButtons = view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış');
    expect(topicButtons.length).toBeGreaterThanOrEqual(1);
    act(() => topicButtons[0].click());
    expect(view.routes.at(-1)).toEqual({ name: 'lesson', topicId: T.modalVerbs, mode: 'normal' });

    const section = view.dom.window.document.getElementById('bolum-modal-verbs.duerfen')!;
    const sectionButton = [...section.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent === 'Bu Bölümü Çalış');
    act(() => sectionButton!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'lesson', topicId: T.modalVerbs, mode: 'section', sectionId: 'modal-verbs.duerfen' });
    act(() => view.root.unmount());
  });

  it('her konu ozeti acilir ve "Bu Konuyu Çalış" sunar', () => {
    for (const topicId of [T.time, T.separableVerbs, T.food, T.home]) {
      const view = mount((api, navigate) => createElement(SummaryTopicScreen, { topicId, api, navigate }));
      expect(view.buttons().some((button) => button.textContent === 'Bu Konuyu Çalış'), topicId).toBe(true);
      act(() => view.root.unmount());
    }
  });

  it('yer imi bolum kimligiyle saklanir', () => {
    const view = mount((api, navigate) => createElement(SummaryTopicScreen, { topicId: T.time, api, navigate }));
    const section = view.dom.window.document.getElementById('bolum-time.um')!;
    act(() => section.querySelector<HTMLButtonElement>('button[aria-label="Kaydet"]')!.click());
    expect(view.progress().settings.bookmarks).toEqual(['time.um']);
    act(() => view.root.unmount());
  });
});

describe('genel tekrar ozeti ekrani', () => {
  it('kumulatif ozeti acar; konu bolumu kanonik konunun tekrarini kurar', () => {
    expect(reviewSummary?.title).toBe('Genel Tekrar');
    const view = mount((api, navigate) => createElement(ReviewSummaryScreen, { api, navigate }));
    expect(view.dom.window.document.body.textContent).toContain('Genel Tekrar');
    const practiceButtons = view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış');
    expect(practiceButtons.length).toBeGreaterThanOrEqual(25);

    const hourSection = view.dom.window.document.getElementById('bolum-genel.saat')!;
    const hourButton = [...hourSection.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent === 'Bu Konuyu Çalış');
    act(() => hourButton!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'review' });
    expect(view.progress().activeLesson?.topicId).toBe(T.time);

    const modalSection = view.dom.window.document.getElementById('bolum-genel.modalverben')!;
    const summaryLink = [...modalSection.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Konu özetini aç'));
    act(() => summaryLink!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'summary', topicId: T.modalVerbs });
    act(() => view.root.unmount());
  });
});
