// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { allExercises } from '../lib/content';
import { createEmptyProgress, type ActiveLesson, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { LessonScreen } from './LessonScreen';

const doms: JSDOM[] = [];

function mountAnsweredWordBankExercise() {
  const exercise = allExercises.find((item) => item.type === 'word-bank-translation' && Boolean(item.wordBank));
  if (!exercise?.wordBank) throw new Error('Test için kelime bankası egzersizi bulunamadı.');

  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });

  let progress: UserProgress = {
    ...createEmptyProgress(),
    settings: {
      ...createEmptyProgress().settings,
      autoPronunciation: false,
      soundEffects: false,
    },
    activeLesson: {
      mode: 'topic',
      topicId: exercise.topicId,
      sessionMode: 'normal',
      queue: [{ exerciseId: exercise.id, presentationReason: 'primary' }],
      index: 0,
      startedAt: '2026-08-17T00:00:00.000Z',
      results: [],
      retries: {},
    },
  };
  const api: ProgressApi = {
    get progress() {
      return progress;
    },
    update(updater) {
      progress = updater(progress);
    },
    replace(next) {
      progress = next;
    },
  };
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => {
    root.render(
      createElement(LessonScreen, {
        mode: 'topic',
        topicId: exercise.topicId,
        sessionMode: 'normal',
        api,
        navigate: () => undefined,
      }),
    );
  });

  const tile = dom.window.document.querySelector<HTMLButtonElement>('.word-tile-available');
  if (!tile) throw new Error('Test için kelime bankası tile bulunamadı.');
  act(() => {
    tile.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  });
  const check = [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')].find(
    (button) => button.textContent === 'Kontrol Et',
  );
  if (!check) throw new Error('Test için kontrol düğmesi bulunamadı.');
  act(() => check.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));

  return { dom, root, getProgress: () => progress };
}

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

/* ------------------------------------------------------------------ */
/* Seri, kutlama, kurtarma ve tamamlanma akisi                         */
/* ------------------------------------------------------------------ */

/** Markup'siz, tek dogru cevabi metinden bulunabilen coktan secmeli sorular. */
const CHOICE_EXERCISES = allExercises.filter(
  (exercise) =>
    exercise.type === 'multiple-choice' &&
    exercise.topicId === 'topic.articles' &&
    !exercise.reviewOnly &&
    Boolean(exercise.answer) &&
    !/[`*_]/.test(exercise.answer ?? '') &&
    (exercise.options ?? []).length > 1,
);

function mountLesson(lesson: ActiveLesson) {
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
  const routes: Route[] = [];
  const api: ProgressApi = {
    get progress() {
      return progress;
    },
    update(updater) {
      progress = updater(progress);
    },
    replace(next) {
      progress = next;
    },
  };

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
  const click = (element: HTMLButtonElement | undefined, label: string) => {
    if (!element) throw new Error(`Buton bulunamadı: ${label}`);
    act(() => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
    render();
  };
  const answer = (exerciseId: string, correct: boolean) => {
    const exercise = allExercises.find((item) => item.id === exerciseId)!;
    const options = buttons().filter((button) => button.getAttribute('role') === 'radio');
    const target = correct
      ? options.find((button) => button.textContent?.includes(exercise.answer ?? ''))
      : options.find((button) => !button.textContent?.includes(exercise.answer ?? ''));
    click(target, correct ? 'doğru seçenek' : 'yanlış seçenek');
    click(buttons().find((button) => button.textContent === 'Kontrol Et'), 'Kontrol Et');
  };

  return { dom, root, routes, buttons, click, answer, rerender: render, getProgress: () => progress };
}

describe('ders akışı: seri, kutlama ve tamamlanma', () => {
  it('kaldırılmış bir soru taşıyan yarım oturumu geçerli konu havuzuyla yeniden kurar', () => {
    const view = mountLesson({
      mode: 'topic',
      topicId: 'topic.articles',
      sessionMode: 'normal',
      queue: [{ exerciseId: 'd2-hal-isimleri-mc', presentationReason: 'primary' }],
      index: 0,
      startedAt: '2026-08-17T09:00:00.000Z',
      results: [],
      retries: {},
      streak: { current: 0, best: 0, firedMilestones: [] },
    });

    view.rerender();

    const rebuilt = view.getProgress().activeLesson;
    expect(rebuilt?.queue.length).toBeGreaterThan(0);
    expect(rebuilt?.queue.every((item) => allExercises.some((exercise) => exercise.id === item.exerciseId))).toBe(true);
    // Yeni kuyruk yalnızca aynı konunun (birincil ya da ikincil) alıştırmalarıdır.
    for (const item of rebuilt?.queue ?? []) {
      const exercise = allExercises.find((candidate) => candidate.id === item.exerciseId)!;
      expect(exercise.topicId === 'topic.articles' || exercise.secondaryTopicIds?.includes('topic.articles')).toBe(true);
    }
    expect(view.dom.window.document.body.textContent).not.toContain('Alıştırma bulunamadı');
    act(() => view.root.unmount());
  });

  it('yarım kalan oturumu yeniden üretmez, kaldığı yerden sürdürür', () => {
    const queue = CHOICE_EXERCISES.slice(0, 4).map((exercise) => ({
      exerciseId: exercise.id,
      presentationReason: 'primary' as const,
    }));
    const view = mountLesson({
      mode: 'topic',
      topicId: 'topic.articles',
      sessionMode: 'full',
      queue,
      index: 2,
      startedAt: '2026-08-17T09:00:00.000Z',
      results: [
        { exerciseId: queue[0].exerciseId, result: 'correct' },
        { exerciseId: queue[1].exerciseId, result: 'incorrect' },
      ],
      retries: {},
      streak: { current: 0, best: 1, firedMilestones: [] },
    });

    const lesson = view.getProgress().activeLesson!;
    expect(lesson.queue).toEqual(queue);
    expect(lesson.index).toBe(2);
    expect(lesson.results).toHaveLength(2);
    expect(view.dom.window.document.body.textContent).toContain('3/4');
    act(() => view.root.unmount());
  });

  it('5. doğruda kutlama gösterir ve seriyi kalıcı duruma yazar', () => {
    const exercise = CHOICE_EXERCISES[0];
    const view = mountLesson({
      mode: 'topic',
      topicId: 'topic.articles',
      sessionMode: 'full',
      queue: [{ exerciseId: exercise.id, presentationReason: 'primary' }],
      index: 0,
      startedAt: '2026-08-17T09:00:00.000Z',
      results: [],
      retries: {},
      streak: { current: 4, best: 4, firedMilestones: [] },
    });

    view.answer(exercise.id, true);

    expect(view.getProgress().activeLesson?.streak?.current).toBe(5);
    expect(view.dom.window.document.body.textContent).toContain('5 doğru üst üste');
    act(() => view.root.unmount());
  });

  it('yanlış cevapta seri sıfırlanır ve kutlama açılmaz', () => {
    const exercise = CHOICE_EXERCISES[0];
    const view = mountLesson({
      mode: 'topic',
      topicId: 'topic.articles',
      sessionMode: 'full',
      queue: [{ exerciseId: exercise.id, presentationReason: 'primary' }],
      index: 0,
      startedAt: '2026-08-17T09:00:00.000Z',
      results: [],
      retries: {},
      streak: { current: 4, best: 4, firedMilestones: [] },
    });

    view.answer(exercise.id, false);

    expect(view.getProgress().activeLesson?.streak?.current).toBe(0);
    expect(view.dom.window.document.body.textContent).not.toContain('doğru üst üste');
    act(() => view.root.unmount());
  });

  it('ders bitince sonucu kalıcı yazar ve sonuç rotasına geçer', () => {
    const exercise = CHOICE_EXERCISES[1];
    const view = mountLesson({
      mode: 'topic',
      topicId: 'topic.articles',
      sessionMode: 'full',
      queue: [{ exerciseId: exercise.id, presentationReason: 'primary' }],
      index: 0,
      startedAt: '2026-08-17T09:00:00.000Z',
      results: [],
      retries: {},
      streak: { current: 0, best: 0, firedMilestones: [] },
    });

    view.answer(exercise.id, true);
    view.click(view.buttons().find((button) => button.textContent === 'Devam'), 'Devam');

    // Bitisin ardindan gelen ek cizimler HAYALET bir oturum acmamalidir:
    // aksi halde ana sayfa "yarım kalan ders" gosterir.
    view.rerender();
    view.rerender();

    const progress = view.getProgress();
    expect(progress.activeLesson).toBeUndefined();
    expect(progress.lastResult?.topicId).toBe('topic.articles');
    expect(progress.lastResult?.correctCount).toBe(1);
    expect(progress.topics['topic.articles'].sessionsCompleted).toBe(1);
    expect(view.routes.at(-1)).toEqual({ name: 'complete' });
    act(() => view.root.unmount());
  });
});

describe('konu dersi kurulumu ve etiketler', () => {
  it('konu rotasından yeni oturum kurar; başlıkta gün değil konu adı görünür', () => {
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
    let progress: UserProgress = { ...base, settings: { ...base.settings, autoPronunciation: false, soundEffects: false } };
    const api: ProgressApi = {
      get progress() { return progress; },
      update(updater) { progress = updater(progress); },
      replace(next) { progress = next; },
    };
    const root = createRoot(dom.window.document.getElementById('root')!);
    const render = () =>
      act(() => {
        root.render(createElement(LessonScreen, { mode: 'topic', topicId: 'topic.modal-verbs', sessionMode: 'normal', api, navigate: () => undefined }));
      });
    render();
    render();
    const lesson = progress.activeLesson!;
    expect(lesson.mode).toBe('topic');
    expect(lesson.topicId).toBe('topic.modal-verbs');
    expect(lesson.queue.length).toBe(22);
    const text = dom.window.document.body.textContent ?? '';
    expect(text).toContain('Modalverben · Normal Çalışma');
    expect(text).not.toMatch(/\d+\.\s*Gün/);
    act(() => root.unmount());
  });
});

describe('LessonScreen Enter devam akışı', () => {
  it('kelime bankası geri bildiriminde Enter ile bir sonraki egzersize geçer', () => {
    const view = mountAnsweredWordBankExercise();
    expect(view.dom.window.document.body.textContent).toContain('Devam');

    act(() => {
      view.dom.window.dispatchEvent(new view.dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(view.getProgress().activeLesson?.index).toBe(1);
    act(() => view.root.unmount());
  });
});
