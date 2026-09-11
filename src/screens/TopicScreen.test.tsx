import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { TopicScreen } from './TopicScreen';
import { T } from '../content/curriculum/topics';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(topicId: string) {
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
  act(() => root.render(createElement(TopicScreen, { topicId, api, navigate: (route) => routes.push(route) })));
  const find = (label: string) =>
    [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes(label));
  return { dom, root, routes, find, progress: () => progress };
}

describe('konu sayfasi', () => {
  it('bütün öğrenme modları ve özet eylemi çalışır; challenge devre dışı kalmaz', () => {
    const modes = [
      ['Normal Çalışma', 'normal'],
      ['Tam Çalışma', 'full'],
      ['Hızlı Tekrar', 'quick'],
      ['Zor Sorular', 'challenge'],
    ] as const;

    for (const topicId of [T.modalVerbs, T.time, T.separableVerbs, T.food]) {
      for (const [label, mode] of modes) {
        const view = mount(topicId);
        const button = view.find(label);
        expect(button?.disabled, `${topicId}/${mode}`).toBe(false);
        act(() => button!.click());
        expect(view.routes).toEqual([{ name: 'lesson', topicId, mode }]);
        act(() => view.root.unmount());
      }
      const view = mount(topicId);
      act(() => view.find('Özeti Oku')!.click());
      expect(view.routes).toEqual([{ name: 'summary', topicId }]);
      act(() => view.root.unmount());
    }
  });

  it('bolum listesi bolum pratigine ve ozetin ilgili bolumune gider', () => {
    const view = mount(T.modalVerbs);
    act(() => view.find('dürfen — izin ve yasak')!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'lesson', topicId: T.modalVerbs, mode: 'section', sectionId: 'modal-verbs.duerfen' });
    act(() => view.root.unmount());
  });

  it("Genel Tekrar'da bu konuyu calismak konu tekrari kurar", () => {
    const view = mount(T.modalVerbs);
    act(() => view.find("Genel Tekrar'da çalış")!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'review' });
    expect(view.progress().activeLesson?.topicId).toBe(T.modalVerbs);
    expect(view.progress().activeLesson?.sessionMode).toBe('gr-topic');
    act(() => view.root.unmount());
  });

  it('gun dili ve izlek secici yoktur', () => {
    const view = mount(T.separableVerbs);
    const text = view.dom.window.document.body.textContent ?? '';
    expect(text).toContain('Ayrılabilen Fiiller');
    expect(text).not.toMatch(/\d+\.\s*Gün/);
    expect(text).not.toContain('Özel Ders');
    act(() => view.root.unmount());
  });

  it('bilinmeyen konu icin derslere donus sunar', () => {
    const view = mount('topic.yok');
    expect(view.dom.window.document.body.textContent).toContain('Bu konu bulunamadı');
    act(() => view.root.unmount());
  });
});
