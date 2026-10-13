// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { ListeningHomeScreen } from './ListeningHomeScreen';
import { WritingHomeScreen } from './WritingHomeScreen';
import { SpeakingHomeScreen } from './SpeakingHomeScreen';
import { ReadingHomeScreen } from './ReadingHomeScreen';
import { emptySkills } from '../lib/skills-storage';
import type { Route } from '../lib/router';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mount(element: React.ReactElement): { dom: JSDOM; text: () => string; unmount: () => void } {
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
  act(() => { root.render(element); });
  return { dom, text: () => dom.window.document.body.textContent ?? '', unmount: () => act(() => { root.unmount(); }) };
}

const nav = (() => {}) as unknown as (route: Route) => void;
const noop = () => {};

describe('beceri derin baglantilari ekrana iner', () => {
  it('dinleme: for/since + dikte dogrudan Dikte 9 parcasini acar', () => {
    const view = mount(createElement(ListeningHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav,
      initial: { topicId: 'en.present-perfect', kind: 'dictation', focus: 'for-since', itemId: 'en-lis-d9' },
    }));
    expect(view.text()).toContain('Dikte 9');
    expect(view.text()).toContain('Haftalık plan kapsamı');
    // kesişim dar: genel dinleme kalabaligi yok
    expect(view.text()).not.toContain('At the Station');
    view.unmount();
  });

  it('dinleme: gecersiz parca cokmeden genel listeye duser', () => {
    const view = mount(createElement(ListeningHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav,
      initial: { itemId: 'bogus' },
    }));
    expect(view.text()).toContain('Listening');
    expect(view.text()).toContain('At the Station');
    view.unmount();
  });

  it('yazma: gorev kimligiyle dogrudan gorevi acar', () => {
    const view = mount(createElement(WritingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initialTaskId: 'en-write-2',
    }));
    expect(view.text()).toContain('My English Learning Journey');
    view.unmount();
  });

  it('konusma: tur + istem dogrudan secilir', () => {
    const view = mount(createElement(SpeakingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav,
      initial: { kind: 'short-answer', promptId: 'en-spk-sa-1' },
    }));
    expect(view.text()).toContain('How long have you studied English?');
    view.unmount();
  });

  it('okuma: ielts filtresiyle acilir', () => {
    const view = mount(createElement(ReadingHomeScreen, {
      skills: emptySkills(), navigate: nav, initialFilter: 'ielts',
    }));
    expect(view.text()).toContain('IELTS tarzı pratik');
    expect(view.text()).not.toContain('My English Journey');
    view.unmount();
  });
});
