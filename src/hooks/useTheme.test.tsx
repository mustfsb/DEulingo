import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { ThemeProvider } from './useTheme';

const doms: JSDOM[] = [];

function mountSystemTheme(initialDark: boolean) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
  doms.push(dom);
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  const mediaQuery = {
    matches: initialDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, callback: (event: MediaQueryListEvent) => void) => { listener = callback; },
    removeEventListener: () => undefined,
  };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(dom.window, 'matchMedia', {
    value: () => mediaQuery,
  });
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => root.render(createElement(ThemeProvider, { preference: 'system', children: createElement('span') })));
  return {
    dom,
    root,
    changeSystem: (dark: boolean) => act(() => {
      mediaQuery.matches = dark;
      listener?.({ matches: dark } as MediaQueryListEvent);
    }),
  };
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('ThemeProvider system modu', () => {
  it('mocked prefers-color-scheme degişimini sayfa yenilenmeden uygular', () => {
    const view = mountSystemTheme(false);
    expect(view.dom.window.document.documentElement.dataset.theme).toBe('light');
    view.changeSystem(true);
    expect(view.dom.window.document.documentElement.dataset.theme).toBe('dark');
    act(() => view.root.unmount());
  });
});
