import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import type { ProgressApi } from '../hooks/useProgress';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import { StatsScreen } from './StatsScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('Ayarlar telaffuz hızı', () => {
  it('dört ses için hızlı tercihini sunar ve kalıcı ayara yazar', () => {
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
      get progress() {
        return progress;
      },
      update(updater) {
        progress = updater(progress);
      },
      replace(next) {
        progress = next;
      },
    };
    const root = createRoot(dom.window.document.getElementById('root')!);
    act(() => root.render(createElement(StatsScreen, { api })));

    const speed = dom.window.document.querySelector<HTMLSelectElement>('select[aria-label="Telaffuz hızı"]');
    if (!speed) throw new Error('Telaffuz hızı seçicisi bulunamadı.');
    expect([...speed.options].map((option) => option.value)).toEqual(['slow', 'normal', 'fast']);

    act(() => {
      speed.value = 'fast';
      speed.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });

    expect(progress.settings.speechSpeed).toBe('fast');
    act(() => root.unmount());
  });
});
