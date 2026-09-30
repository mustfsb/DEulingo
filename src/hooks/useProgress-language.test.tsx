// @vitest-environment jsdom
import { act, createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { useProgressState, type ProgressApi } from './useProgress';
import { DE_PROGRESS_KEY, EN_PROGRESS_KEY, LANGUAGE_STORAGE_KEY } from '../lib/language';

let latest: ProgressApi | null = null;
const doms: JSDOM[] = [];

function Probe() {
  const api = useProgressState();
  useEffect(() => {
    latest = api;
  }, [api]);
  return null;
}

function mount() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  dom.window.localStorage.clear();
  latest = null;
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(createElement(Probe));
  });
  if (!latest) throw new Error('kanca kurulamadı');
  const get = () => {
    if (!latest) throw new Error('kanca kurulamadı');
    return latest;
  };
  return { dom, root, get };
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('useProgressState dil katmanı', () => {
  it('tercih yoksa Almanca açılır', () => {
    const view = mount();
    expect(view.get().language).toBe('de');
    expect(view.get().progress.exercises).toEqual({});
    act(() => view.root.unmount());
  });

  it('İngilizce seçimi saklanır ve yeniden yüklemede geri gelir', () => {
    const first = mount();
    const storage = first.dom.window.localStorage;
    act(() => first.get().setLanguage('en'));
    expect(first.get().language).toBe('en');
    expect(storage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    act(() => first.root.unmount());

    // Aynı depolamayla yeniden kur: İngilizce geri gelir.
    latest = null;
    const root = createRoot(first.dom.window.document.getElementById('root')!);
    act(() => root.render(createElement(Probe)));
    expect(latest!.language).toBe('en');
    act(() => root.unmount());

    // Almancaya dönüş de saklanır.
    latest = null;
    const root2 = createRoot(first.dom.window.document.getElementById('root')!);
    act(() => root2.render(createElement(Probe)));
    act(() => latest!.setLanguage('de'));
    expect(storage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
    act(() => root2.unmount());
  });

  it('dillerin ilerlemesi ayrı anahtarlarda ve birbirinden bağımsız', () => {
    const view = mount();
    const storage = view.dom.window.localStorage;
    // İngilizce diliminde bir deneme kaydet.
    act(() => view.get().setLanguage('en'));
    act(() =>
      view.get().update((current) => ({
        ...current,
        stats: { ...current.stats, totalAttempts: current.stats.totalAttempts + 5 },
      })),
    );
    act(() => view.root.unmount());

    expect(JSON.parse(storage.getItem(EN_PROGRESS_KEY)!).stats.totalAttempts).toBe(5);
    // Almanca dilimi yazılmış ama boştur (deneme yok).
    expect(JSON.parse(storage.getItem(DE_PROGRESS_KEY)!).stats.totalAttempts).toBe(0);

    // Almanca dilimi boş kalır; İngilizceye dönünce kayıt durur.
    latest = null;
    const root = createRoot(view.dom.window.document.getElementById('root')!);
    act(() => root.render(createElement(Probe)));
    expect(latest!.language).toBe('en');
    expect(latest!.progress.stats.totalAttempts).toBe(5);
    act(() => latest!.setLanguage('de'));
    expect(latest!.progress.stats.totalAttempts).toBe(0);
    act(() => latest!.setLanguage('en'));
    expect(latest!.progress.stats.totalAttempts).toBe(5);
    act(() => root.unmount());
  });
});
