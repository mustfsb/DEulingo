import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { DayIntroScreen } from './DayIntroScreen';

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
  act(() => root.render(createElement(DayIntroScreen, { day, api, navigate: (route) => routes.push(route) })));
  const find = (label: string) => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')]
    .find((button) => button.textContent?.includes(label));
  return { root, routes, find };
}

describe('Gün 4–6 çalışma başlangıcı', () => {
  it('bütün öğrenme modları ve özet eylemi çalışır; challenge devre dışı kalmaz', () => {
    const modes = [
      ['Normal Çalışma', 'normal'],
      ['Tam Çalışma', 'full'],
      ['Hızlı Tekrar', 'quick'],
      ['Zor Sorular', 'challenge'],
    ] as const;

    for (const day of [4, 5, 6]) {
      for (const [label, mode] of modes) {
        const view = mount(day);
        const button = view.find(label);
        expect(button?.disabled, `${day}/${mode}`).toBe(false);
        act(() => button!.click());
        expect(view.routes).toEqual([{ name: 'lesson', track: 'normal', day, mode }]);
        act(() => view.root.unmount());
      }
      const view = mount(day);
      act(() => view.find('Özeti Oku')!.click());
      expect(view.routes).toEqual([{ name: 'summary', track: 'normal', day }]);
      act(() => view.root.unmount());
    }
  });
});

describe('Gün 1–3 alıştırma seti seçimi', () => {
  it('üç ayrık seti gösterir ve seçilen setin rastgele oturumunu açar', () => {
    for (const day of [1, 2, 3]) {
      const view = mount(day);
      for (const set of [1, 2, 3]) {
        const button = view.find(`${set}. Set`);
        expect(button, `${day}. gün / ${set}. set`).toBeDefined();
        act(() => button!.click());
        expect(view.routes.at(-1)).toEqual({
          name: 'lesson',
          track: 'normal',
          day,
          mode: 'set',
          exerciseSetId: `set-${set}`,
        });
      }
      act(() => view.root.unmount());
    }
  });
});
