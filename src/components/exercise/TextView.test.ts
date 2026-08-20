import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { TextView } from './TextView';

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
    id: 'text-audio-boundary',
    day: 1,
    topic: 'Selamlaşma',
    topicId: 'day1.selamlasma',
    type: 'fill-blank',
    instruction: 'Boşluğu doldur.',
    prompt: 'Guten ___',
    answer: 'Morgen',
    audio: {
      prompt: { text: 'Guten ___', language: 'de-DE', role: 'prompt' },
    },
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day1.selamlasma'],
    origin: 'authored',
    source: { file: 'test', day: 1, naturalKey: 'test/text-audio-boundary' },
  };
  act(() => {
    root.render(
      createElement(TextView, {
        exercise,
        value: '',
        onChange: vi.fn(),
        onSubmit: vi.fn(),
        locked: true,
        result: null,
      }),
    );
  });
  return { dom, root };
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('TextView ses denetimi sınırı', () => {
  it('ana ders görünümü prompt sesini sunduğunda aynı düğmeyi ikinci kez oluşturmaz', () => {
    const view = mount();

    expect(view.dom.window.document.querySelectorAll('.audio-button')).toHaveLength(0);

    act(() => view.root.unmount());
  });
});
