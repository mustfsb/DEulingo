/**
 * Özel Ders 10. Gün — ekran duman testi (§60 manuel QA akışlarının
 * bileşen düzeyinde karşılığı).
 *
 * - Özel Ders → 10. Gün girişi dört çalışma modunu sunar.
 * - Özetler → Özel Ders → 10. Gün 15 konuyu listeler ve her konuda
 *   "Bu Konuyu Çalış" konu pratiğine gider.
 */
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { exercisesForDay, getSummary } from '../lib/content';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { DayIntroScreen } from './DayIntroScreen';
import { SummaryDayScreen } from './SummaryDayScreen';

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
  let progress: UserProgress = createEmptyProgress();
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
  };
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  return { dom, root, routes, buttons, api };
}

describe('Özel Ders — 10. Gün ekranları', () => {
  it('gün girişi Normal / Tam / Zor akışlarına gider', () => {
    const view = setup();
    act(() => {
      view.root.render(createElement(DayIntroScreen, {
        track: 'private',
        day: 10,
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    const labels = view.buttons().map((button) => button.textContent ?? '');
    expect(labels.some((text) => text.includes('Normal Çalışma'))).toBe(true);
    expect(labels.some((text) => text.includes('Tam Çalışma'))).toBe(true);
    expect(labels.some((text) => text.includes('Zor Sorular'))).toBe(true);
    expect(view.dom.window.document.body.textContent).not.toContain('Bu gün bulunamadı');

    act(() => view.buttons().find((button) => button.textContent?.includes('Normal Çalışma'))!.click());
    expect(view.routes).toEqual([{ name: 'lesson', track: 'private', day: 10, mode: 'normal' }]);
    act(() => view.root.unmount());
  });

  it('özet ekranı 15 konuyu ve konu pratiği düğmelerini açar', () => {
    const summary = getSummary(10, 'private')!;
    expect(summary.topics).toHaveLength(15);
    const view = setup();
    act(() => {
      view.root.render(createElement(SummaryDayScreen, {
        track: 'private',
        day: 10,
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    expect(view.dom.window.document.body.textContent).toContain('10. Gün');
    expect(view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış')).toHaveLength(15);

    act(() => view.buttons().find((button) => button.textContent === 'Bu Konuyu Çalış')!.click());
    expect(view.routes).toEqual([
      { name: 'lesson', track: 'private', day: 10, mode: 'topic', topicId: summary.topics[0].id },
    ]);
    act(() => view.root.unmount());
  });

  it('günün havuzu ve özeti tutarlıdır', () => {
    expect(exercisesForDay(10, 'private')).toHaveLength(122);
    expect(exercisesForDay(10, 'normal')).toHaveLength(0);
  });
});
