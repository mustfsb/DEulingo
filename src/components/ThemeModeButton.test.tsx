import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeModeButton } from './ThemeModeButton';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('ThemeModeButton', () => {
  it('shows the destination theme and switches directly between light and dark', () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
    doms.push(dom);
    Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
    const onChange = vi.fn();
    const root = createRoot(dom.window.document.getElementById('root')!);
    act(() => root.render(createElement(ThemeModeButton, { theme: 'light', onChange })));

    const button = dom.window.document.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Koyu temaya geç');
    act(() => button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
    expect(onChange).toHaveBeenCalledWith('dark');
    act(() => root.unmount());
  });
});
