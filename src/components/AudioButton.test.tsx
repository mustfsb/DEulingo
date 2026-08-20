import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { PronunciationButton } from './AudioButton';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('PronunciationButton görünürlük kipi', () => {
  it('metin kapsayıcısının hover/focus durumunda açılması için ayrı bir işaret taşır', () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
    doms.push(dom);
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    const root = createRoot(dom.window.document.getElementById('root')!);

    act(() => {
      root.render(createElement(PronunciationButton, {
        target: { text: 'Wie heißt du?', language: 'de-DE', role: 'prompt' },
        contextId: 'audio-button-reveal',
        revealOnHover: true,
      }));
    });

    expect(dom.window.document.querySelector('.audio-button-wrap.is-reveal')).not.toBeNull();
    act(() => root.unmount());
  });
});
