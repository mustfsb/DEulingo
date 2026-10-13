// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Exercise, TranslationDirection } from '../../content/types';
import { WordBankView, wordBankPrompt } from './WordBankView';
import { EN_LESSON_EXERCISES } from '../../content/en/index';

const doms: JSDOM[] = [];
afterEach(() => { for (const dom of doms.splice(0)) dom.window.close(); });

function render(exercise: Exercise): string {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(createElement(WordBankView, {
      exercise, value: [], onChange: () => {}, onSubmit: () => {}, locked: false, result: null,
    }));
  });
  const label = dom.window.document.querySelector('.eyebrow')?.textContent ?? '';
  act(() => { root.unmount(); });
  return label;
}

describe('kelime bankası yönergesi hedef dile duyarlı', () => {
  it('yön → yönerge', () => {
    const expected: Record<TranslationDirection, string> = {
      'tr-to-en': 'Türkçesini İngilizce oluştur',
      'tr-to-de': 'Türkçesini Almanca oluştur',
      'de-to-tr': 'Almancayı Türkçe oluştur',
      'en-to-tr': 'İngilizceyi Türkçe oluştur',
    };
    for (const [direction, label] of Object.entries(expected)) expect(wordBankPrompt(direction as TranslationDirection)).toBe(label);
  });

  it('İngilizce alıştırmada "İngilizce" gösterilir, "Almanca" asla', () => {
    const english = EN_LESSON_EXERCISES.find((e) => e.wordBank?.direction === 'tr-to-en')!;
    const label = render(english);
    expect(label).toBe('Türkçesini İngilizce oluştur');
    expect(label).not.toContain('Almanca');
  });

  it('Almanca alıştırmada davranış korunur', () => {
    const german: Exercise = {
      id: 'wb-de', topic: 'Tanışma', topicId: 'topic.personal-info', type: 'word-bank-translation', instruction: 'x',
      answer: 'Ich bin Mustafa.', conceptIds: [], origin: 'authored', source: { file: 't', naturalKey: 'wb-de' },
      difficulty: 'easy', skill: 'production',
      wordBank: {
        direction: 'tr-to-de', sourceText: "Ben Mustafa'yım.", targetLanguage: 'de',
        tokens: [{ id: 'a', text: 'Ich' }, { id: 'b', text: 'bin' }, { id: 'c', text: 'Mustafa' }],
        acceptedSequences: [['Ich', 'bin', 'Mustafa']],
      },
    };
    expect(render(german)).toBe('Türkçesini Almanca oluştur');
  });
});
