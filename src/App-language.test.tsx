// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';
import { LANGUAGE_STORAGE_KEY } from './lib/language';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(initialHash = '#/') {
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
  dom.window.location.hash = initialHash;
  // `matchMedia` yokluğunda tema kancası sistem varsayılanına düşer.
  Object.defineProperty(dom.window, 'matchMedia', {
    value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
  });
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(createElement(App));
  });
  const text = () => dom.window.document.body.textContent ?? '';
  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  return { dom, root, text, buttons };
}

describe('uygulama kabuğu + dil seçici', () => {
  it('varsayılan Almanca açılır, seçici sağ üstte durur', () => {
    const view = mount();
    expect(view.text()).toContain('Modalverben');
    expect(view.text()).not.toContain('Present Perfect');
    const group = view.dom.window.document.querySelector('[role="group"][aria-label="Öğrenme dili"]');
    expect(group).not.toBeNull();
    const german = view.buttons().find((button) => button.getAttribute('aria-label') === 'Öğrenme dili: Deutsch')!;
    expect(german.getAttribute('aria-pressed')).toBe('true');
    act(() => view.root.unmount());
  });

  it('bayrakla İngilizceye geçiş anında ortamı değiştirir ve saklar', () => {
    const view = mount();
    const english = view.buttons().find((button) => button.getAttribute('aria-label') === 'Öğrenme dili: English')!;
    expect(english.getAttribute('aria-pressed')).toBe('false');
    act(() => english.click());
    expect(view.dom.window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(english.getAttribute('aria-pressed')).toBe('true');
    expect(view.text()).toContain('Present Perfect');
    expect(view.text()).not.toContain('Modalverben');
    // Özetlere git: İngilizce özet listelenir.
    const summaries = view.buttons().find((button) => button.textContent === 'Özetler')!;
    act(() => summaries.click());
    expect(view.text()).toContain('Present Perfect');
    // Almancaya dönüş de tek dokunuş.
    const german = view.buttons().find((button) => button.getAttribute('aria-label') === 'Öğrenme dili: Deutsch')!;
    act(() => german.click());
    expect(view.dom.window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
    expect(view.text()).toContain('Modalverben');
    act(() => view.root.unmount());
  });
});
