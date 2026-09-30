// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { HomeScreen } from './HomeScreen';
import { TopicScreen } from './TopicScreen';
import { GeneralReviewScreen } from './GeneralReviewScreen';
import { MistakesScreen } from './MistakesScreen';
import { SummaryTopicScreen } from './SummaryTopicScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function enApi(progress: UserProgress): ProgressApi {
  return {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
    language: 'en',
    setLanguage: () => undefined,
  };
}

function mount(element: React.ReactElement) {
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
  const api = enApi(progress);
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => root.render(createElement(element.type as never, { ...(element.props as object), api, navigate: (route: Route) => routes.push(route) })));
  return { dom, root, routes, api, text: () => dom.window.document.body.textContent ?? '' };
}

describe('İngilizce uygulama kabuğu (aynı bileşenler, İngilizce içerik)', () => {
  it('ana sayfa Present Perfect gösterir, Almanca konu göstermez', () => {
    const view = mount(createElement(HomeScreen, {} as never));
    expect(view.text()).toContain('Present Perfect');
    expect(view.text()).not.toContain('Modalverben');
    expect(view.text()).not.toContain('Akkusativ');
    act(() => view.root.unmount());
  });

  it('konu sayfası 4 modu, özeti ve kelime düğmesini sunar', () => {
    const view = mount(createElement(TopicScreen, { topicId: 'en.present-perfect' } as never));
    const text = view.text();
    expect(text).toContain('Present Perfect');
    for (const label of ['Normal Çalışma', 'Tam Çalışma', 'Hızlı Tekrar', 'Zor Sorular', 'Özeti Oku']) {
      expect(text, label).toContain(label);
    }
    expect(text).toContain('Bu Konunun Kelimeleri');
    act(() => view.root.unmount());
  });

  it('özet ekranı formülü ve for/since bölümünü gösterir', () => {
    const view = mount(
      createElement(SummaryTopicScreen, { topicId: 'en.present-perfect' } as never),
    );
    const text = view.text();
    expect(text).toContain('have/has + V3');
    expect(text).toContain('for / since');
    act(() => view.root.unmount());
  });

  it('Genel Tekrar ve Hatalarım İngilizce diliminde boş başlar', () => {
    const review = mount(createElement(GeneralReviewScreen, {} as never));
    expect(review.text()).toContain('Genel Tekrar');
    expect(review.text()).toContain('Present Perfect');
    act(() => review.root.unmount());

    const mistakes = mount(createElement(MistakesScreen, {} as never));
    expect(mistakes.text()).toContain('Henüz kayıtlı hata yok.');
    act(() => mistakes.root.unmount());
  });
});
