/**
 * Konu tabanlı müfredat — ekran duman testleri.
 *
 * - Dersler (ana sayfa) gün kartları yerine konu kartları gösterir; "N. Gün" dili yoktur.
 * - Konu kartındaki "Çalış" konu dersini açar (Modalverben, Saatler, Ayrılabilen Fiiller, Essen und Trinken).
 * - Özetler dizini konu özetlerini listeler; Modalverben açılır.
 * - Genel Tekrar ana sayfası kanonik konu kartlarını (Modalverben dahil) ve
 *   konular arası modları gösterir.
 */
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { exercisesById, reviewBank, topics } from '../lib/content';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { GeneralReviewScreen } from './GeneralReviewScreen';
import { HomeScreen } from './HomeScreen';
import { MistakesScreen } from './MistakesScreen';
import { StatsScreen } from './StatsScreen';
import { SummaryIndexScreen } from './SummaryIndexScreen';
import { T } from '../content/curriculum/topics';
import { recordAttempt } from '../lib/progress';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function setup(initial: UserProgress = createEmptyProgress()) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  let progress = initial;
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
  };
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  const text = () => dom.window.document.body.textContent ?? '';
  const render = (Screen: unknown) =>
    act(() => {
      root.render(createElement(Screen as never, { api, navigate: (route: Route) => routes.push(route) } as never));
    });
  return { dom, root, routes, buttons, text, render, api, getProgress: () => progress };
}

describe('Dersler (ana sayfa)', () => {
  it('gun kartlari yerine 20 konu kartini ad, aciklama ve ustalikla gosterir', () => {
    const view = setup();
    view.render(HomeScreen);
    const cards = view.dom.window.document.querySelectorAll('.topic-tile');
    expect(cards).toHaveLength(topics.length);
    expect(topics).toHaveLength(20);
    for (const topic of topics) {
      expect(view.text()).toContain(topic.title);
      expect(view.text()).toContain(topic.description);
    }
    expect(view.dom.window.document.querySelectorAll('[aria-label$="ustalığı"]')).toHaveLength(20);
    expect(view.text()).not.toMatch(/\d+\.\s*Gün/);
    expect(view.text()).not.toContain('Ders günü');
    act(() => view.root.unmount());
  });

  it('konu kartindaki "Çalış" konu dersini acar (Modalverben, Saatler, Ayrılabilen Fiiller, Essen und Trinken)', () => {
    for (const topicId of [T.modalVerbs, T.time, T.separableVerbs, T.food]) {
      const title = topics.find((topic) => topic.id === topicId)!.title;
      const view = setup();
      view.render(HomeScreen);
      const button = view.buttons().find((item) => item.getAttribute('aria-label') === `${title} — Çalış`);
      expect(button, title).toBeDefined();
      act(() => button!.click());
      expect(view.routes.at(-1)).toEqual({ name: 'lesson', topicId, mode: 'normal' });
      act(() => view.root.unmount());
    }
  });

  it('kart govdesi konu sayfasini, özet dugmesi konu ozetini acar', () => {
    const view = setup();
    view.render(HomeScreen);
    act(() => view.buttons().find((item) => item.getAttribute('aria-label') === 'Modalverben konusunu aç')!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'topic', topicId: T.modalVerbs });
    act(() => view.buttons().find((item) => item.getAttribute('aria-label') === 'Modalverben özetini aç')!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'summary', topicId: T.modalVerbs });
    act(() => view.root.unmount());
  });

  it('eski gun ilerlemesi konu ustaligi olarak gorunur', () => {
    const halb = exercisesById.get('p10-halb-mc-anlam')!;
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, halb, '07:30', 'correct');
    progress = recordAttempt(progress, halb, '07:30', 'correct');
    const view = setup(progress);
    view.render(HomeScreen);
    const bar = view.dom.window.document.querySelector('[aria-label="Saatler ve Zaman ustalığı"]');
    expect(Number(bar?.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    act(() => view.root.unmount());
  });
});

describe('Özetler dizini', () => {
  it('konu ozetlerini listeler; Modalverben ozetine gider', () => {
    const view = setup();
    view.render(SummaryIndexScreen);
    expect(view.dom.window.document.querySelectorAll('.topic-tile')).toHaveLength(20);
    expect(view.text()).not.toMatch(/\d+\.\s*Gün/);
    const modal = view.buttons().find((button) => button.textContent?.includes('Modalverben'));
    act(() => modal!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'summary', topicId: T.modalVerbs });
    act(() => view.buttons().find((button) => button.textContent?.includes('Genel Tekrar'))!.click());
    expect(view.routes.at(-1)).toEqual({ name: 'review-summary' });
    act(() => view.root.unmount());
  });
});

describe('Genel Tekrar ekrani', () => {
  it('ana sayfa acilir; konular arasi modlari ve kanonik konu kartlarini (Modalverben dahil) listeler', () => {
    expect(reviewBank.length).toBeGreaterThanOrEqual(180);
    const view = setup();
    view.render(GeneralReviewScreen);
    const text = view.text();
    for (const label of ['Genel Tekrar Başlat', 'Kelime Çalışması', 'Cümle Kurma', 'Writing', 'Dinleme', 'Hataları Tekrarla']) {
      expect(text, label).toContain(label);
    }
    const cards = [...view.dom.window.document.querySelectorAll('li.card')];
    expect(cards).toHaveLength(20);
    for (const title of ['Modalverben', 'Saatler ve Zaman', 'Ayrılabilen Fiiller', 'Essen und Trinken']) {
      expect(cards.some((card) => card.textContent?.includes(title)), title).toBe(true);
    }
    act(() => view.root.unmount());
  });

  it('"Genel Tekrar Başlat" karisik oturum kurar ve tekrara gecer', () => {
    const view = setup();
    view.render(GeneralReviewScreen);
    act(() => view.buttons().find((button) => button.textContent?.includes('Genel Tekrar Başlat'))!.click());
    expect(view.routes).toEqual([{ name: 'review' }]);
    const lesson = view.getProgress().activeLesson;
    expect(lesson?.mode).toBe('review');
    expect(lesson?.sessionMode).toBe('gr-mixed');
    expect(lesson?.queue.length).toBeGreaterThan(20);
    act(() => view.root.unmount());
  });

  it('Modalverben konu karti kanonik konu kimligiyle oturum kurar', () => {
    const view = setup();
    view.render(GeneralReviewScreen);
    act(() => view.buttons().find((button) => button.getAttribute('aria-label') === 'Modalverben — Genel Tekrar')!.click());
    expect(view.routes).toEqual([{ name: 'review' }]);
    expect(view.getProgress().activeLesson?.topicId).toBe(T.modalVerbs);
    act(() => view.root.unmount());
  });

  it('Cümle Kurma modu Modalverben cumleleri de icerebilen konular arasi oturum kurar', () => {
    const view = setup();
    view.render(GeneralReviewScreen);
    act(() => view.buttons().find((button) => button.textContent?.startsWith('Cümle Kurma'))!.click());
    const lesson = view.getProgress().activeLesson!;
    expect(lesson.sessionMode).toBe('gr-sentence');
    expect(lesson.topicId).toBeUndefined();
    const topicIds = new Set(lesson.queue.map((item) => exercisesById.get(item.exerciseId)?.topicId));
    expect(topicIds.size).toBeGreaterThanOrEqual(4);
    act(() => view.root.unmount());
  });
});

describe('gun ve izlek dili kalmamistir (regresyon)', () => {
  it('hicbir aktif ekranda "N. Gün" ya da "Özel Ders / Normal Ders" gecmez', () => {
    for (const Screen of [HomeScreen, GeneralReviewScreen, MistakesScreen, StatsScreen, SummaryIndexScreen]) {
      const view = setup();
      view.render(Screen);
      const text = view.text();
      expect(text).not.toMatch(/\d+\.\s*Gün/);
      expect(text).not.toContain('Özel Ders');
      expect(text).not.toContain('Normal Ders');
      act(() => view.root.unmount());
    }
  });
});
