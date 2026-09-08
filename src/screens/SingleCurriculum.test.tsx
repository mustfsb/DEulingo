/**
 * 10. Gün + Genel Tekrar — ekran duman testleri.
 *
 * - 10. Gün girişi dört çalışma modunu sunar (izleksiz).
 * - Özetler → 10. Gün 15 konuyu listeler ve "Bu Konuyu Çalış" konu pratiğine gider.
 * - Genel Tekrar ana sayfası açılır, mod ve konu kartlarını gösterir,
 *   "Genel Tekrar Başlat" karışık oturum kurar.
 */
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { exercisesForDay, getSummary, reviewBank } from '../lib/content';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { DayIntroScreen } from './DayIntroScreen';
import { GeneralReviewScreen } from './GeneralReviewScreen';
import { HomeScreen } from './HomeScreen';
import { MistakesScreen } from './MistakesScreen';
import { StatsScreen } from './StatsScreen';
import { SummaryDayScreen } from './SummaryDayScreen';
import { SummaryIndexScreen } from './SummaryIndexScreen';

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
  return { dom, root, routes, buttons, api, getProgress: () => progress };
}

describe('10. Gün ekranları (tek müfredat)', () => {
  it('gün girişi Normal / Tam / Zor akışlarına gider', () => {
    const view = setup();
    act(() => {
      view.root.render(createElement(DayIntroScreen, {
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
    expect(view.dom.window.document.body.textContent).not.toContain('Özel Ders');

    act(() => view.buttons().find((button) => button.textContent?.includes('Normal Çalışma'))!.click());
    expect(view.routes).toEqual([{ name: 'lesson', day: 10, mode: 'normal' }]);
    act(() => view.root.unmount());
  });

  it('özet ekranı 15 konuyu ve konu pratiği düğmelerini açar', () => {
    const summary = getSummary(10)!;
    expect(summary.topics).toHaveLength(15);
    const view = setup();
    act(() => {
      view.root.render(createElement(SummaryDayScreen, {
        day: 10,
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    expect(view.dom.window.document.body.textContent).toContain('10. Gün');
    expect(view.buttons().filter((button) => button.textContent === 'Bu Konuyu Çalış')).toHaveLength(15);

    act(() => view.buttons().find((button) => button.textContent === 'Bu Konuyu Çalış')!.click());
    expect(view.routes).toEqual([
      { name: 'lesson', day: 10, mode: 'topic', topicId: summary.topics[0].id },
    ]);
    act(() => view.root.unmount());
  });

  it('günün havuzu ve özeti tutarlıdır', () => {
    expect(exercisesForDay(10)).toHaveLength(122);
  });
});

describe('Genel Tekrar ekrani', () => {
  it('ana sayfa acilir, modlari ve konulari listeler', () => {
    expect(reviewBank.length).toBeGreaterThanOrEqual(180);
    const view = setup();
    act(() => {
      view.root.render(createElement(GeneralReviewScreen, {
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    const text = view.dom.window.document.body.textContent ?? '';
    expect(text).toContain('Genel Tekrar Başlat');
    expect(text).toContain('Kelime Çalışması');
    expect(text).toContain('Cümle Kurma');
    expect(text).toContain('Writing');
    expect(text).toContain('Dinleme');
    expect(text).toContain('Saatler');
    expect(text).toContain('Ayrılabilen Fiiller');
    act(() => view.root.unmount());
  });

  it('"Genel Tekrar Başlat" karisik oturum kurar ve tekrara gecer', () => {
    const view = setup();
    act(() => {
      view.root.render(createElement(GeneralReviewScreen, {
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    act(() => view.buttons().find((button) => button.textContent?.includes('Genel Tekrar Başlat'))!.click());
    expect(view.routes).toEqual([{ name: 'review' }]);
    const lesson = view.getProgress().activeLesson;
    expect(lesson?.mode).toBe('review');
    expect(lesson?.sessionMode).toBe('gr-mixed');
    expect(lesson?.queue.length).toBeGreaterThan(20);
    act(() => view.root.unmount());
  });

  it('konu karti o konuya ozel oturum kurar', () => {
    const view = setup();
    act(() => {
      view.root.render(createElement(GeneralReviewScreen, {
        api: view.api,
        navigate: (route) => view.routes.push(route),
      }));
    });
    const cards = view.dom.window.document.querySelectorAll('li.card');
    const saatCard = [...cards].find((card) => card.textContent?.includes('Saatler'));
    expect(saatCard).toBeDefined();
    const button = [...(saatCard as HTMLElement).querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.includes('Çalış'));
    act(() => button!.click());
    expect(view.routes).toEqual([{ name: 'review' }]);
    expect(view.getProgress().activeLesson?.topicId).toBe('saatler');
    act(() => view.root.unmount());
  });
});

describe('izlek ayrimi kalmamistir (regresyon)', () => {
  it('hicbir aktif ekranda "Özel Ders / Normal Ders" secimi gecmez', () => {
    const screens = [HomeScreen, GeneralReviewScreen, MistakesScreen, StatsScreen, SummaryIndexScreen];
    for (const Screen of screens) {
      const view = setup();
      act(() => {
        view.root.render(createElement(Screen as never, {
          api: view.api,
          navigate: (route: Route) => view.routes.push(route),
        } as never));
      });
      const text = view.dom.window.document.body.textContent ?? '';
      expect(text).not.toContain('Özel Ders');
      expect(text).not.toContain('Normal Ders');
      act(() => view.root.unmount());
    }
  });
});
