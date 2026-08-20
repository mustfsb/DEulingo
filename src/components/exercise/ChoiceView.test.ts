import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { ChoiceView } from './ChoiceView';

const doms: JSDOM[] = [];

function mount() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const root = createRoot(dom.window.document.getElementById('root')!);
  const exercise: Exercise = {
    id: 'choice-audio-boundary',
    day: 1,
    topic: 'Selamlaşma',
    topicId: 'day1.selamlasma',
    type: 'multiple-choice',
    instruction: 'Doğru Almanca ifadeyi seç.',
    prompt: 'Sabah saat 08:00.',
    answer: 'Guten Morgen',
    options: ['Guten Morgen', 'Gute Nacht'],
    audio: {
      targets: [{ text: 'Guten Morgen', language: 'de-DE', role: 'vocabulary' }],
    },
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.selamlasma'],
    origin: 'authored',
    source: { file: 'test', day: 1, naturalKey: 'test/choice-audio-boundary' },
  };
  act(() => {
    root.render(
      createElement(ChoiceView, {
        exercise,
        value: '',
        onChange: vi.fn(),
        onSubmit: vi.fn(),
        locked: false,
        result: null,
      }),
    );
  });
  return { dom, root };
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('ChoiceView ses denetimi sınırı', () => {
  it('telaffuz metadatası olsa bile şıkların içine ikinci bir ses düğmesi koymaz', () => {
    const view = mount();

    expect(view.dom.window.document.querySelectorAll('.choice-option .audio-button')).toHaveLength(0);

    act(() => view.root.unmount());
  });
});
