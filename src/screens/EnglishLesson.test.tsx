// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type ActiveLesson, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { enExercisesById } from '../lib/content-en';
import { LessonScreen } from './LessonScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function mountEnLesson(lesson: ActiveLesson) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });

  const base = createEmptyProgress();
  let progress: UserProgress = {
    ...base,
    settings: { ...base.settings, autoPronunciation: false, soundEffects: false },
    activeLesson: lesson,
  };
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
    language: 'en',
    setLanguage: () => undefined,
  };
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  const render = () =>
    act(() => {
      root.render(
        createElement(LessonScreen, {
          mode: lesson.mode,
          topicId: lesson.topicId,
          sessionMode: lesson.sessionMode,
          sectionId: lesson.sectionId,
          api,
          navigate: (route: Route) => routes.push(route),
        }),
      );
    });
  render();

  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  const inputs = () => [...dom.window.document.querySelectorAll<HTMLInputElement>('input, textarea')];
  return { dom, root, routes, buttons, inputs, rerender: render, getProgress: () => progress };
}

function queueOf(ids: string[]): ActiveLesson {
  return {
    mode: 'topic',
    topicId: 'en.present-perfect',
    sessionMode: 'normal',
    queue: ids.map((exerciseId) => ({ exerciseId, presentationReason: 'primary' as const })),
    index: 0,
    startedAt: '2026-09-29T00:00:00.000Z',
    results: [],
    retries: {},
    streak: { current: 0, best: 0, firedMilestones: [] },
  };
}

describe('İngilizce ders döngüsü', () => {
  it('Present Perfect oturumu kurulur, doğru cevap kaydedilir, sonuç rotasına gidilir', () => {
    const view = mountEnLesson(queueOf(['en-pp-v3-fill-seen', 'en-pp-fs-fill-years']));
    expect(view.dom.window.document.body.textContent).toContain('see →');

    // Doğru cevap: seen.
    typeAnswer(view, 'seen');
    pressEnter(view);
    expect(view.dom.window.document.body.textContent).toContain('Doğru!');
    expect(view.getProgress().exercises['en-pp-v3-fill-seen']?.correctCount).toBe(1);

    // Devam: ikinci soru.
    const next = view.buttons().find((button) => button.textContent === 'Devam')!;
    act(() => next.dispatchEvent(new view.dom.window.MouseEvent('click', { bubbles: true })));
    view.rerender();
    expect(view.getProgress().activeLesson?.index).toBe(1);
    act(() => view.root.unmount());
  });

  it('yanlış V3 hata olarak kaydedilir ve özet bağlantısı İngilizce bölüme gider', () => {
    const view = mountEnLesson(queueOf(['en-pp-err-see']));
    typeAnswer(view, 'I have see it.');
    pressEnter(view);
    expect(view.dom.window.document.body.textContent).toContain('Henüz değil');
    expect(view.getProgress().mistakes['en-pp-err-see']).toBeTruthy();
    // Özet bağlantısı İngilizce bölümü açar.
    const summary = view.buttons().find((button) => button.textContent?.includes('özetini aç'))!;
    act(() => summary.dispatchEvent(new view.dom.window.MouseEvent('click', { bubbles: true })));
    expect(view.routes.at(-1)).toEqual({
      name: 'summary',
      topicId: 'en.present-perfect',
      sectionId: 'present-perfect.mistakes',
    });
    act(() => view.root.unmount());
  });

  it('İngilizce havuzundaki her alıştırma bulunabilir (kayıp kimlik yok)', () => {
    for (const id of [...enExercisesById.keys()]) {
      expect(enExercisesById.get(id)?.topicId).toBe('en.present-perfect');
    }
  });

  it('eşleştirme çözülebilir: her özne kısaltmasıyla eşleşir, hata kaydı düşmez', () => {
    const view = mountEnLesson(queueOf(['en-pp-have-table-match']));
    const pairs: Array<[string, string]> = [
      ['I', "I've"], ['you', "you've"], ['he', "he's"], ['she', "she's"], ['it', "it's"], ['we', "we've"], ['they', "they've"],
    ];
    const doc = view.dom.window.document;
    const click = (text: string, exact = false) => {
      const button = [...doc.querySelectorAll<HTMLButtonElement>('button')].find((candidate) => {
        const content = candidate.textContent?.trim() ?? '';
        return exact ? content === text : content.includes(text);
      });
      if (!button) throw new Error(`Buton bulunamadı: ${text}`);
      act(() => button.dispatchEvent(new doc.defaultView!.MouseEvent('click', { bubbles: true })));
      view.rerender();
    };
    for (const [left, right] of pairs) {
      click(left);
      click(right, true);
    }
    expect(doc.body.textContent).not.toContain('Henüz değil');
    const check = [...doc.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent === 'Kontrol Et',
    )!;
    act(() => check.dispatchEvent(new doc.defaultView!.MouseEvent('click', { bubbles: true })));
    view.rerender();
    expect(doc.body.textContent).toContain('Doğru!');
    expect(view.getProgress().mistakes['en-pp-have-table-match']).toBeUndefined();
    act(() => view.root.unmount());
  });
});

function typeAnswer(view: ReturnType<typeof mountEnLesson>, text: string) {
  const doc = view.dom.window.document;
  const input = doc.querySelector('input.field') as HTMLInputElement | null;
  if (!input) throw new Error('Test için yazı girdisi bulunamadı.');
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set;
    setter?.call(input, text);
    input.dispatchEvent(new view.dom.window.Event('input', { bubbles: true }));
  });
}

function pressEnter(view: ReturnType<typeof mountEnLesson>) {
  const doc = view.dom.window.document;
  const input = doc.querySelector('input.field') as HTMLInputElement | null;
  act(() => {
    (input ?? doc.body).dispatchEvent(
      new view.dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
  });
  view.rerender();
}
