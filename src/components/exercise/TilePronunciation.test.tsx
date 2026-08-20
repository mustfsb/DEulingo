import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { ChipsView } from './ChipsView';
import { MatchingView } from './MatchingView';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(element: ReturnType<typeof createElement>) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => root.render(element));
  return { dom, root };
}

describe('kutu içi telaffuz görünürlüğü', () => {
  it('eşleştirme kutusundaki Almanca ses düğmesini hover ile açılacak biçimde işaretler', () => {
    const exercise: Exercise = {
      id: 'matching-hover-audio', day: 1, topic: 'Test', topicId: 'day1.test', type: 'matching',
      instruction: 'Eşleştir.', pairs: [{ left: 'Guten Morgen', right: 'Günaydın' }],
      audio: { targets: [{ text: 'Guten Morgen', language: 'de-DE', role: 'vocabulary' }] },
      difficulty: 'easy', skill: 'recognition', conceptIds: ['day1.test'], origin: 'authored',
      source: { file: 'test', day: 1, naturalKey: 'matching-hover-audio' },
    };
    const view = mount(createElement(MatchingView, {
      exercise, value: {}, onChange: vi.fn(), onSubmit: vi.fn(), locked: false, result: null,
    }));

    expect(view.dom.window.document.querySelectorAll('.choice-option[data-audio-reveal="hover"] .audio-button-wrap.is-reveal')).toHaveLength(1);
    act(() => view.root.unmount());
  });

  it('yerleştirme kutusundaki Almanca ses düğmesini hover ile açılacak biçimde işaretler', () => {
    const exercise: Exercise = {
      id: 'chips-hover-audio', day: 1, topic: 'Test', topicId: 'day1.test', type: 'sentence-builder',
      instruction: 'Cümleyi kur.', answer: 'Guten Morgen', words: ['Guten', 'Morgen'],
      audio: { targets: [{ text: 'Guten', language: 'de-DE', role: 'vocabulary' }] },
      difficulty: 'easy', skill: 'production', conceptIds: ['day1.test'], origin: 'authored',
      source: { file: 'test', day: 1, naturalKey: 'chips-hover-audio' },
    };
    const view = mount(createElement(ChipsView, {
      exercise, value: [], onChange: vi.fn(), onSubmit: vi.fn(), locked: false, result: null,
    }));

    expect(view.dom.window.document.querySelectorAll('.chip-wrap[data-audio-reveal="hover"] .audio-button-wrap.is-reveal')).toHaveLength(1);
    act(() => view.root.unmount());
  });
});
