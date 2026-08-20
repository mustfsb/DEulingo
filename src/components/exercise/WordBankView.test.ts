import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { WordBankView } from './WordBankView';

const doms: JSDOM[] = [];

function exercise(): Exercise {
  return {
    id: 'wb-ui',
    day: 3,
    topic: 'Tanışma',
    topicId: 'day3.kendini-tanitma',
    type: 'word-bank-translation',
    instruction: 'Türkçesini Almanca oluştur.',
    answer: 'Ich bin Mustafa.',
    audio: {
      targets: [
        { text: 'Ich', language: 'de-DE', role: 'vocabulary' },
        { text: 'bin', language: 'de-DE', role: 'vocabulary' },
        { text: 'Mustafa', language: 'de-DE', role: 'vocabulary' },
      ],
    },
    wordBank: {
      direction: 'tr-to-de',
      sourceText: "Ben Mustafa'yım.",
      targetLanguage: 'de',
      tokens: [
        { id: 'ich', text: 'Ich' },
        { id: 'bin', text: 'bin' },
        { id: 'mustafa', text: 'Mustafa' },
        { id: 'bist', text: 'bist', distractor: true },
      ],
      acceptedSequences: [['Ich', 'bin', 'Mustafa']],
    },
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day3.cevap.ich-bin'],
    origin: 'authored',
    source: { file: 'test', day: 3, naturalKey: 'test/wb-ui' },
  };
}

function mount(value: string[] = []) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const root = createRoot(dom.window.document.getElementById('root')!);
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  act(() => {
    root.render(createElement(WordBankView, {
      exercise: exercise(),
      value,
      onChange,
      onSubmit,
      locked: false,
      result: null,
    }));
  });
  return { dom, root, onChange, onSubmit };
}

function buttons(dom: JSDOM, className: string) {
  return [...dom.window.document.querySelectorAll<HTMLButtonElement>(`button.${className}`)];
}

function click(dom: JSDOM, element: Element) {
  act(() => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
}

function key(dom: JSDOM, value: string) {
  act(() => dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true })));
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

describe('WordBankView görünmez klavye ve tile etkileşimi', () => {
  it('available tile tıklamasını seçime, selected tile tıklamasını bankaya geri gönderir', () => {
    const first = mount();
    click(first.dom, buttons(first.dom, 'word-tile-available').find((item) => item.textContent === 'Ich')!);
    expect(first.onChange).toHaveBeenLastCalledWith(['ich']);
    act(() => first.root.unmount());

    const selected = mount(['ich']);
    click(selected.dom, buttons(selected.dom, 'word-tile-selected')[0]);
    expect(selected.onChange).toHaveBeenLastCalledWith([]);
    act(() => selected.root.unmount());
  });

  it('tile sarmalayıcılarını yerleşim geçişi için kararlı anahtarlarla işaretler', () => {
    const view = mount(['ich']);
    expect([...view.dom.window.document.querySelectorAll<HTMLElement>('[data-tile-layout-key]')].map((item) => item.dataset.tileLayoutKey)).toEqual([
      'answer:ich:0',
      'bank:bin',
      'bank:mustafa',
      'bank:bist',
    ]);
    act(() => view.root.unmount());
  });

  it('Almanca kelime tile’ında seçimden ayrı, küçük bir telaffuz denetimi sunar', () => {
    const view = mount();
    expect(view.dom.window.document.querySelectorAll('.word-tile-audio .audio-button')).toHaveLength(3);
    expect(view.dom.window.document.querySelectorAll('.word-tile-wrap[data-audio="true"]')).toHaveLength(3);
    expect(view.dom.window.document.querySelectorAll('.word-tile-wrap[data-audio-reveal="hover"]')).toHaveLength(3);
    expect(view.dom.window.document.querySelector('.word-tile-wrap[data-audio="true"] .word-tile-audio')).not.toBeNull();
    expect(view.dom.window.document.querySelector('.word-tile-wrap:not([data-audio]) .word-tile-audio')).toBeNull();
    act(() => view.root.unmount());
  });

  it('tam yazılan kelimeyi görünür input olmadan seçer ve Enter ile gönderir', () => {
    const view = mount();
    key(view.dom, 'i');
    key(view.dom, 'c');
    const ich = buttons(view.dom, 'word-tile-available').find((item) => item.textContent === 'Ich')!;
    expect(ich.dataset.prefixMatch).toBe('true');
    expect(ich.querySelector('mark')?.textContent).toBe('Ic');
    key(view.dom, 'h');
    expect(view.onChange).toHaveBeenLastCalledWith(['ich']);
    expect(view.dom.window.document.querySelector('input, textarea')).toBeNull();
    key(view.dom, 'Enter');
    expect(view.onSubmit).toHaveBeenCalledTimes(1);
    act(() => view.root.unmount());
  });

  it('shows every ambiguous typed candidate and gives a restrained no-match state', () => {
    const view = mount();
    key(view.dom, 'b');
    expect(buttons(view.dom, 'word-tile-available').filter((item) => item.dataset.prefixMatch === 'true').map((item) => item.textContent)).toEqual(['bin', 'bist']);

    key(view.dom, 'x');
    expect(view.dom.window.document.querySelector('.word-bank-no-match')?.textContent).toContain('bx');
    act(() => view.root.unmount());
  });

  it('unmount sonrasında eski egzersizin klavye dinleyicisini temizler', () => {
    const view = mount();
    act(() => view.root.unmount());
    key(view.dom, 'i');
    key(view.dom, 'c');
    key(view.dom, 'h');
    expect(view.onChange).not.toHaveBeenCalled();
  });
});
