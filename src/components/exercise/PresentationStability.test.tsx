// @vitest-environment jsdom
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChoiceView } from './ChoiceView';
import { ChipsView } from './ChipsView';
import { MatchingView } from './MatchingView';
import { presentExercise } from '../../lib/presentation';
import type { Exercise } from '../../content/types';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  return dom;
}

function base(id: string): Exercise {
  return {
    id, topicId: 'topic.perfekt', topic: 'Perfekt',
    type: 'multiple-choice', instruction: 'Sec', answer: 'a',
    conceptIds: [], origin: 'authored', source: { file: 't', naturalKey: id },
    difficulty: 'easy', skill: 'recognition',
  };
}

function orderOf(radios: NodeListOf<Element>): string[] {
  return [...radios].map((el) => el.textContent ?? '');
}

describe('sunum kararliligi (soru acikken)', () => {
  it('yeniden cizimler secenek sirasini degistirmez', () => {
    const dom = setupDom();
    const exercise = presentExercise(
      { ...base('stab-1'), options: ['haben', 'sein', 'werden', 'haben gewesen'], answer: 'haben' },
      'oturum:3:primary:stab-1',
    );
    function Host() {
      const [tick, setTick] = useState(0);
      return createElement(
        'div',
        null,
        createElement('button', { id: 'tick', onClick: () => setTick((t) => t + 1) }, `tick-${tick}`),
        createElement(ChoiceView, {
          exercise, value: '', onChange: () => {}, onSubmit: () => {}, locked: false, result: null,
        }),
      );
    }
    const root = createRoot(dom.window.document.getElementById('root')!);
    act(() => { root.render(createElement(Host)); });
    const before = orderOf(dom.window.document.querySelectorAll('[role="radio"]'));
    expect(before.length).toBe(4);
    act(() => { (dom.window.document.getElementById('tick') as HTMLElement).click(); });
    act(() => { (dom.window.document.getElementById('tick') as HTMLElement).click(); });
    const after = orderOf(dom.window.document.querySelectorAll('[role="radio"]'));
    expect(after).toEqual(before);
    act(() => { root.unmount(); });
  });

  it('eslestirme eslemesi karisik sag sutunda dogru kalir', () => {
    const dom = setupDom();
    const pairs = [
      { left: 'machen', right: 'yapmak' },
      { left: 'gehen', right: 'gitmek' },
      { left: 'sehen', right: 'görmek' },
    ];
    const exercise: Exercise = { ...base('match-1'), type: 'matching', pairs };
    const presented = presentExercise(exercise, 'oturum:5:primary:match-1');
    const onChange = vi.fn();
    const root = createRoot(dom.window.document.getElementById('root')!);
    act(() => {
      root.render(createElement(MatchingView, {
        exercise: presented, value: {}, onChange, onSubmit: () => {}, locked: false, result: null,
        presentationSeed: 'oturum:5:primary:match-1',
      }));
    });
    const buttons = [...dom.window.document.querySelectorAll('button.choice')] as HTMLElement[];
    const leftBtn = buttons.find((b) => (b.textContent ?? '').includes('machen'))!;
    act(() => { leftBtn.click(); });
    const rightBtn = buttons.find((b) => (b.textContent ?? '').trim() === 'yapmak')!;
    act(() => { rightBtn.click(); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual({ machen: 'yapmak' });
    act(() => { root.unmount(); });
  });

  it('yinelenen cipler bagimsiz tasinir, degerlendirme dogru kalir', () => {
    const dom = setupDom();
    const exercise: Exercise = {
      ...base('chip-1'), type: 'sentence-builder', answer: 'he had had lunch',
      words: ['lunch', 'had', 'he', 'had'],
    };
    let latest: unknown;
    const root = createRoot(dom.window.document.getElementById('root')!);
    act(() => {
      root.render(createElement(ChipsView, {
        exercise, value: [], onChange: (v) => { latest = v; }, onSubmit: () => {}, locked: false, result: null,
      }));
    });
    const pool = dom.window.document.querySelector('[aria-label="Kelime havuzu"]')!;
    const chips = [...pool.querySelectorAll('button.chip')] as HTMLElement[];
    expect(chips.length).toBe(4);
    // iki 'had' cipi de ayri ornek olarak tiklanabilir
    const hads = chips.filter((c) => c.textContent === 'had') as HTMLButtonElement[];
    expect(hads.length).toBe(2);
    act(() => { hads[0].click(); });
    act(() => { hads[1].click(); });
    expect(latest).toEqual(['had', 'had']);
    expect(hads[0].disabled && hads[1].disabled).toBe(true);
    act(() => { root.unmount(); });
  });
});
