// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { VocabHomeScreen } from './VocabHomeScreen';
import { VocabListScreen } from './VocabListScreen';
import { VocabStudyScreen } from './VocabStudyScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function harness() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLButtonElement: dom.window.HTMLButtonElement,
    localStorage: dom.window.localStorage,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  let progress: UserProgress = {
    ...createEmptyProgress(),
    settings: { ...createEmptyProgress().settings, autoPronunciation: false, soundEffects: false },
  };
  const navigations: Route[] = [];
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
  const navigate = (route: Route) => {
    navigations.push(route);
  };
  const root = createRoot(dom.window.document.getElementById('root')!);
  const text = () => dom.window.document.body.textContent ?? '';
  return { dom, root, api, navigate, navigations, text, get progress() { return progress; } };
}

describe('Kelime Çalışması ekranları', () => {
  it('ana sayfa 244 sayısını ve 8 modu gösterir', () => {
    const h = harness();
    act(() => {
      h.root.render(createElement(VocabHomeScreen, { api: h.api, navigate: h.navigate }));
    });
    expect(h.text()).toContain('Kelime Çalışması');
    expect(h.text()).toContain('244');
    for (const label of ['Tüm Kelimeler', 'Almanca → Türkçe', 'Türkçe → Almanca', 'Eşleştirme', 'Yazma', 'Dinleme', 'Zayıf Kelimeler']) {
      expect(h.text(), label).toContain(label);
    }
  });

  it('mod kartı vocab-study rotasına gider', () => {
    const h = harness();
    act(() => {
      h.root.render(createElement(VocabHomeScreen, { api: h.api, navigate: h.navigate }));
    });
    const buttons = [...h.dom.window.document.querySelectorAll('button')];
    const card = buttons.find((b) => b.textContent?.includes('Eşleştirme'));
    expect(card).toBeDefined();
    act(() => {
      card!.dispatchEvent(new h.dom.window.MouseEvent('click', { bubbles: true }));
    });
    expect(h.navigations[0]).toMatchObject({ name: 'vocab-study', kind: 'match' });
  });

  it('liste ekranı Almanca + Türkçe arama yapar', () => {
    const h = harness();
    act(() => {
      h.root.render(createElement(VocabListScreen, { api: h.api, navigate: h.navigate }));
    });
    const search = h.dom.window.document.querySelector('input[type="search"]') as HTMLInputElement;
    expect(search).not.toBeNull();
    const count = () => h.dom.window.document.querySelectorAll('ul li').length;
    expect(count()).toBe(244);
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(search),
        'value',
      )?.set;
      setter?.call(search, 'anahtar');
      search.dispatchEvent(new h.dom.window.Event('input', { bubbles: true }));
    });
    expect(h.text()).toContain('der Schlüssel');
    expect(count()).toBeLessThan(244);
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(search),
        'value',
      )?.set;
      setter?.call(search, 'çanta');
      search.dispatchEvent(new h.dom.window.Event('input', { bubbles: true }));
    });
    expect(h.text()).toContain('die Tasche');
  });

  it('oturum ekranı soru gösterir ve cevap kaydedilir', () => {
    const h = harness();
    act(() => {
      h.root.render(
        createElement(VocabStudyScreen, { kind: 'detr', api: h.api, navigate: h.navigate }),
      );
    });
    expect(h.text()).toContain('Almanca → Türkçe');
    // İlk soru çoktan seçmeliyse bir seçeneğe bas, değilse atla.
    const doc = h.dom.window.document;
    const radios = [...doc.querySelectorAll('button[role="radio"]')];
    if (radios.length) {
      const before = Object.keys(h.progress.exercises).length;
      act(() => {
        radios[0].dispatchEvent(new doms[0].window.MouseEvent('click', { bubbles: true }));
      });
      const check = [...doc.querySelectorAll('button')].find((b) => b.textContent === 'Kontrol Et');
      act(() => {
        check?.dispatchEvent(new doms[0].window.MouseEvent('click', { bubbles: true }));
      });
      expect(Object.keys(h.progress.exercises).length).toBeGreaterThan(before);
    }
  });

  it('konu kelime rotası topic-study açar', () => {
    const h = harness();
    act(() => {
      h.root.render(
        createElement(VocabStudyScreen, { kind: 'topic', topicId: 'topic.home', api: h.api, navigate: h.navigate }),
      );
    });
    expect(h.text()).toContain('Konu Kelimeleri');
  });

  it('yazı girdisinde Enter önce kontrol eder, ikinci Enter ilerletir', () => {
    const h = harness();
    act(() => {
      h.root.render(
        createElement(VocabStudyScreen, { kind: 'type', api: h.api, navigate: h.navigate }),
      );
    });
    const doc = h.dom.window.document;
    const input = doc.querySelector('input.field') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    const position = () =>
      doc.querySelector('[role="progressbar"]')?.getAttribute('aria-label');
    const positionIndex = () => position()?.split('/')[0]?.trim();

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input!), 'value')?.set;
      setter?.call(input!, 'xyz');
      input!.dispatchEvent(new h.dom.window.Event('input', { bubbles: true }));
    });
    expect(positionIndex()).toBe('1');
    act(() => {
      input!.dispatchEvent(
        new h.dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
      );
    });
    // Geri bildirim görünür ve AYNI soruda kalınır (atlama yok).
    expect(doc.querySelector('.feedback-panel')).not.toBeNull();
    expect(positionIndex()).toBe('1');
    expect(Object.keys(h.progress.exercises).length).toBe(1);

    // İkinci Enter fareyle Devam'a basmakla aynıdır: ilerler.
    act(() => {
      doc.body.dispatchEvent(
        new h.dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
      );
    });
    expect(positionIndex()).toBe('2');
  });
});
