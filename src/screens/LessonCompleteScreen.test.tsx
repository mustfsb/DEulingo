/**
 * Tamamlanma eylemleri regresyon testi.
 *
 * Bu dosyanin varlik sebebi somut bir hatadir: "Hataları Tekrarla" ve
 * "Zor Sorular" gorunuyordu ama hicbir sey yapmiyordu. Testler artik hem
 * OTURUMUN KURULDUGUNU hem de DOGRU ROTAYA gecildigini dogruluyor.
 */

import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { allExercises } from '../lib/content';
import { buildLessonResult } from '../lib/session-result';
import { createEmptyProgress, type ActiveLesson, type LessonResult, type UserProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { LessonCompleteScreen, pickPrimaryAction, resultHeadline } from './LessonCompleteScreen';

const doms: JSDOM[] = [];
const day2 = allExercises.filter((exercise) => exercise.day === 2);
const day3 = allExercises.filter((exercise) => exercise.day === 3);
const day4 = allExercises.filter((exercise) => exercise.day === 4);
const day5 = allExercises.filter((exercise) => exercise.day === 5);
const day6 = allExercises.filter((exercise) => exercise.day === 6);

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function resultFor(results: ActiveLesson['results'], day = 2): LessonResult {
  const lesson: ActiveLesson = {
    mode: 'day',
    day,
    sessionMode: 'full',
    queue: results.map((item) => ({ exerciseId: item.exerciseId, presentationReason: 'primary' as const })),
    index: results.length,
    startedAt: '2026-08-17T09:00:00.000Z',
    results,
    retries: {},
    streak: { current: 4, best: 4, firedMilestones: [] },
  };
  return buildLessonResult(lesson, {
    lookup: (id) => allExercises.find((exercise) => exercise.id === id),
    completedAt: '2026-08-17T09:25:00.000Z',
  });
}

function setResultFor(day: 1 | 2 | 3, exerciseSetId: 'set-1' | 'set-2' | 'set-3'): LessonResult {
  const exercises = allExercises
    .filter((exercise) => exercise.day === day && exercise.exerciseSetId === exerciseSetId)
    .slice(0, 3);
  const lesson: ActiveLesson = {
    mode: 'day',
    day,
    sessionMode: 'set',
    exerciseSetId,
    queue: exercises.map((exercise) => ({ exerciseId: exercise.id, presentationReason: 'primary' as const })),
    index: exercises.length,
    startedAt: '2026-08-18T09:00:00.000Z',
    results: exercises.map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })),
    retries: {},
    streak: { current: 3, best: 3, firedMilestones: [] },
  };
  return buildLessonResult(lesson, {
    lookup: (id) => allExercises.find((exercise) => exercise.id === id),
    completedAt: '2026-08-18T09:25:00.000Z',
  });
}

function mount(result: LessonResult) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
  });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  // Azaltilmis hareket: detaylar zamanlayici beklemeden acilir (§44).
  Object.defineProperty(dom.window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
  });

  const base = createEmptyProgress();
  let progress: UserProgress = {
    ...base,
    settings: { ...base.settings, soundEffects: false },
    lastResult: result,
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
  act(() => {
    root.render(
      createElement(LessonCompleteScreen, { result, api, navigate: (route) => routes.push(route) }),
    );
  });

  const buttons = () => [...dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
  const find = (label: string) => buttons().find((button) => button.textContent?.includes(label));
  const click = (label: string) => {
    const button = find(label);
    if (!button) throw new Error(`Buton bulunamadı: ${label}`);
    act(() => button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  };

  return { dom, root, routes, find, click, buttons, getProgress: () => progress };
}

describe('sonuç başlığı ve eylem hiyerarşisi', () => {
  const perfect = resultFor(day2.slice(0, 5).map((e) => ({ exerciseId: e.id, result: 'correct' as const })));
  const nearPerfect = resultFor([
    ...day2.slice(0, 9).map((e) => ({ exerciseId: e.id, result: 'correct' as const })),
    { exerciseId: day2[9].id, result: 'minor-typo' },
  ]);
  const weak = resultFor([
    ...day2.slice(0, 4).map((e) => ({ exerciseId: e.id, result: 'incorrect' as const })),
    ...day2.slice(4, 10).map((e) => ({ exerciseId: e.id, result: 'correct' as const })),
  ]);

  it('mükemmel dersi ayrı ama abartısız bir metinle kutlar', () => {
    expect(perfect.perfect).toBe(true);
    expect(resultHeadline(perfect, 100, false).title).toBe('Mükemmel ders!');
  });

  it('yüksek doğrulukta da olumlu geri bildirim verir (%100 şart değil)', () => {
    const accuracy = Math.round((nearPerfect.accuracy ?? 0) * 100);
    expect(accuracy).toBeGreaterThanOrEqual(90);
    expect(nearPerfect.perfect).toBe(false);
    expect(resultHeadline(nearPerfect, accuracy, false).title).toBe('Harika çalışma!');
  });

  it('düşük doğrulukta suçlamaz, yol gösterir', () => {
    const accuracy = Math.round((weak.accuracy ?? 0) * 100);
    expect(accuracy).toBeLessThan(70);
    expect(resultHeadline(weak, accuracy, false).title).toBe('Bir tur daha iyi olur');
  });

  it('birincil eylem sonuca göre değişir', () => {
    const base = { challengeReady: true, nextDay: 3, isFollowUp: false, weakTopicPracticable: false };
    expect(pickPrimaryAction({ ...base, result: weak, accuracy: 60, canReview: true })).toBe('mistakes');
    expect(pickPrimaryAction({ ...base, result: nearPerfect, accuracy: 95, canReview: false })).toBe('challenge');
    expect(pickPrimaryAction({ ...base, result: perfect, accuracy: 100, canReview: false })).toBe('next-day');
    // Son günde "sonraki gün" birincil olamaz.
    expect(
      pickPrimaryAction({ ...base, nextDay: undefined, result: perfect, accuracy: 100, canReview: false }),
    ).toBe('challenge');
  });
});

describe('ders sonucu eylemleri', () => {
  it('hatalar varken gercek bir hata tekrari oturumu kurar ve rotaya gecer', () => {
    const result = resultFor([
      { exerciseId: day2[0].id, result: 'correct' },
      { exerciseId: day2[1].id, result: 'incorrect' },
      { exerciseId: day2[2].id, result: 'incorrect' },
    ]);
    const view = mount(result);

    expect(view.find('Hataları Tekrarla')?.textContent).toContain('2');
    view.click('Hataları Tekrarla');

    const lesson = view.getProgress().activeLesson;
    expect(lesson?.mode).toBe('mistakes');
    expect(lesson?.day).toBe(2);
    expect(lesson?.index).toBe(0);
    expect(lesson?.queue.map((item) => item.exerciseId)).toEqual([day2[1].id, day2[2].id]);
    expect(lesson?.sourceSessionId).toBe(result.sessionId);
    expect(view.routes).toEqual([{ name: 'mistake-review', day: 2 }]);
    act(() => view.root.unmount());
  });

  it('Zor Sorular dogru gunun challenge oturumunu acar (gun tekrar sorulmaz)', () => {
    const view = mount(
      resultFor([
        { exerciseId: day2[0].id, result: 'correct' },
        { exerciseId: day2[1].id, result: 'correct' },
      ]),
    );

    view.click('Zor Sorular');
    expect(view.routes).toEqual([{ name: 'lesson', day: 2, mode: 'challenge' }]);
    act(() => view.root.unmount());
  });

  it('hatasiz derste "Hataları Tekrarla" aktif bir eylem olarak sunulmaz', () => {
    const view = mount(
      resultFor(day2.slice(0, 4).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const }))),
    );

    expect(view.find('Hataları Tekrarla')).toBeUndefined();
    expect(view.dom.window.document.body.textContent).toContain('Mükemmel');
    // Mukemmel derste birincil oneri sonraki gundur.
    expect(view.find('3. Güne Geç')?.className).toContain('btn-primary');
    act(() => view.root.unmount());
  });

  it('Gün 3–5 tamamlanınca sonraki gerçek güne ilerler', () => {
    for (const [day, nextDay, pool] of [[3, 4, day3], [4, 5, day4], [5, 6, day5]] as const) {
      const view = mount(
        resultFor(pool.slice(0, 3).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })), day),
      );

      expect(view.find(`${nextDay}. Güne Geç`)).toBeDefined();
      view.click(`${nextDay}. Güne Geç`);
      expect(view.routes).toEqual([{ name: 'day', day: nextDay }]);
      act(() => view.root.unmount());
    }
  });

  it('bir set bitince sıradaki ayrık sete geçer', () => {
    const view = mount(setResultFor(2, 'set-1'));

    expect(view.find('2. Sete Geç')).toBeDefined();
    view.click('2. Sete Geç');
    expect(view.routes).toEqual([{ name: 'lesson', day: 2, mode: 'set', exerciseSetId: 'set-2' }]);
    act(() => view.root.unmount());
  });

  it('son gunde olu "Sonraki Gün" yerine gercek alternatifler gosterir', () => {
    const view = mount(
      resultFor(
        day6.slice(0, 3).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })),
        6,
      ),
    );

    expect(view.find('Güne Geç')).toBeUndefined();
    expect(view.find('Hızlı Tekrar')).toBeDefined();
    view.click('Hızlı Tekrar');
    expect(view.routes).toEqual([{ name: 'lesson', day: 6, mode: 'quick' }]);
    act(() => view.root.unmount());
  });

  it('ust uste tiklamada tek bir oturum kurar', () => {
    const view = mount(
      resultFor([
        { exerciseId: day2[0].id, result: 'incorrect' },
        { exerciseId: day2[1].id, result: 'correct' },
      ]),
    );

    view.click('Hataları Tekrarla');
    const started = view.getProgress().activeLesson?.startedAt;
    view.click('Hataları Tekrarla');

    expect(view.routes).toHaveLength(1);
    expect(view.getProgress().activeLesson?.startedAt).toBe(started);
    act(() => view.root.unmount());
  });

  it('hata tekrari bittiginde sonsuz tekrar dongusu onerilmez', () => {
    const lesson: ActiveLesson = {
      mode: 'mistakes',
      day: 2,
      queue: [{ exerciseId: day2[1].id, presentationReason: 'primary' }],
      index: 1,
      startedAt: '2026-08-17T10:00:00.000Z',
      results: [{ exerciseId: day2[1].id, result: 'incorrect' }],
      retries: {},
    };
    const view = mount(
      buildLessonResult(lesson, { lookup: (id) => allExercises.find((exercise) => exercise.id === id) }),
    );

    expect(view.find('Hataları Tekrarla')).toBeUndefined();
    expect(view.dom.window.document.body.textContent).toContain('Hataların tekrar edildi');
    expect(view.find('Ana Sayfaya Dön')).toBeDefined();
    act(() => view.root.unmount());
  });

  it('ekrandaki HER eylem gercekten bir sey yapar (olu buton yok)', () => {
    const results: ActiveLesson['results'] = [
      { exerciseId: day2[0].id, result: 'incorrect' },
      { exerciseId: day2[1].id, result: 'correct' },
      { exerciseId: day2[2].id, result: 'minor-typo' },
    ];

    const probe = mount(resultFor(results));
    const labels = probe
      .buttons()
      .filter((button) => !button.disabled && button.textContent?.trim())
      .map((button) => button.textContent!.trim());
    act(() => probe.root.unmount());

    expect(labels.length).toBeGreaterThanOrEqual(4);

    // Her buton temiz bir ekranda ayri ayri denenir: "mesgul" durumu
    // digerlerini maskelemesin.
    for (const label of labels) {
      const view = mount(resultFor(results));
      const lessonBefore = view.getProgress().activeLesson;
      view.click(label);
      const changed = view.routes.length > 0 || view.getProgress().activeLesson !== lessonBefore;
      expect(changed, `"${label}" hiçbir şey yapmıyor`).toBe(true);
      act(() => view.root.unmount());
    }
  });
});
