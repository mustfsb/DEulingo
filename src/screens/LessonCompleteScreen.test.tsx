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
import { T } from '../content/curriculum/topics';

const doms: JSDOM[] = [];
const topicPool = (topicId: string) => allExercises.filter((exercise) => exercise.topicId === topicId && !exercise.reviewOnly);
const articles = topicPool(T.articles);
const vocabulary = topicPool(T.vocabulary);

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function resultFor(results: ActiveLesson['results'], topicId: string = T.articles, sessionMode: ActiveLesson['sessionMode'] = 'full'): LessonResult {
  const lesson: ActiveLesson = {
    mode: 'topic',
    topicId,
    sessionMode,
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
  const perfect = resultFor(articles.slice(0, 5).map((e) => ({ exerciseId: e.id, result: 'correct' as const })));
  const nearPerfect = resultFor([
    ...articles.slice(0, 9).map((e) => ({ exerciseId: e.id, result: 'correct' as const })),
    { exerciseId: articles[9].id, result: 'minor-typo' },
  ]);
  const weak = resultFor([
    ...articles.slice(0, 4).map((e) => ({ exerciseId: e.id, result: 'incorrect' as const })),
    ...articles.slice(4, 10).map((e) => ({ exerciseId: e.id, result: 'correct' as const })),
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
    const base = { challengeReady: true, nextTopicId: T.pronouns, isFollowUp: false, weakTopicPracticable: false };
    expect(pickPrimaryAction({ ...base, result: weak, accuracy: 60, canReview: true })).toBe('mistakes');
    expect(pickPrimaryAction({ ...base, result: nearPerfect, accuracy: 95, canReview: false })).toBe('challenge');
    expect(pickPrimaryAction({ ...base, result: perfect, accuracy: 100, canReview: false })).toBe('next-topic');
    // Haritanın son konusunda "sıradaki konu" birincil olamaz.
    expect(
      pickPrimaryAction({ ...base, nextTopicId: undefined, result: perfect, accuracy: 100, canReview: false }),
    ).toBe('challenge');
    // Zor Sorular oturumunun ardından tekrar "Zor Sorular" önerilmez.
    const challengeResult = { ...nearPerfect, sessionMode: 'challenge' as const };
    expect(pickPrimaryAction({ ...base, nextTopicId: undefined, result: challengeResult, accuracy: 95, canReview: false })).toBe('home');
  });
});

describe('ders sonucu eylemleri', () => {
  it('hatalar varken gercek bir hata tekrari oturumu kurar ve rotaya gecer', () => {
    const result = resultFor([
      { exerciseId: articles[0].id, result: 'correct' },
      { exerciseId: articles[1].id, result: 'incorrect' },
      { exerciseId: articles[2].id, result: 'incorrect' },
    ]);
    const view = mount(result);

    expect(view.find('Hataları Tekrarla')?.textContent).toContain('2');
    view.click('Hataları Tekrarla');

    const lesson = view.getProgress().activeLesson;
    expect(lesson?.mode).toBe('mistakes');
    expect(lesson?.topicId).toBeUndefined();
    expect(lesson?.index).toBe(0);
    expect(lesson?.queue.map((item) => item.exerciseId)).toEqual([articles[1].id, articles[2].id]);
    expect(lesson?.sourceSessionId).toBe(result.sessionId);
    expect(view.routes).toEqual([{ name: 'mistake-review' }]);
    act(() => view.root.unmount());
  });

  it('Zor Sorular dogru konunun challenge oturumunu acar (konu tekrar sorulmaz)', () => {
    const view = mount(
      resultFor([
        { exerciseId: articles[0].id, result: 'correct' },
        { exerciseId: articles[1].id, result: 'correct' },
      ]),
    );

    view.click('Zor Sorular');
    expect(view.routes).toEqual([{ name: 'lesson', topicId: T.articles, mode: 'challenge' }]);
    act(() => view.root.unmount());
  });

  it('hatasiz derste "Hataları Tekrarla" aktif bir eylem olarak sunulmaz', () => {
    const view = mount(
      resultFor(articles.slice(0, 4).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const }))),
    );

    expect(view.find('Hataları Tekrarla')).toBeUndefined();
    expect(view.dom.window.document.body.textContent).toContain('Mükemmel');
    // Mukemmel derste birincil oneri haritadaki siradaki konudur.
    expect(view.find('Sıradaki Konu: Zamirler ve İyelik')?.className).toContain('btn-primary');
    expect(view.dom.window.document.body.textContent).toContain('Artikeller ve Olumsuzluk');
    expect(view.dom.window.document.body.textContent).not.toMatch(/\d+\.\s*Gün/);
    act(() => view.root.unmount());
  });

  it('konu bitince haritadaki siradaki konuya ilerler', () => {
    for (const [topicId, next, nextTitle] of [
      [T.greetings, T.personalInfo, 'Kişisel Bilgiler'],
      [T.time, T.dailyRoutine, 'Mein Tag'],
      [T.separableVerbs, T.modalVerbs, 'Modalverben'],
    ] as const) {
      const pool = topicPool(topicId);
      const view = mount(resultFor(pool.slice(0, 3).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })), topicId));
      view.click(`Sıradaki Konu: ${nextTitle}`);
      expect(view.routes).toEqual([{ name: 'topic', topicId: next }]);
      act(() => view.root.unmount());
    }
  });

  it('Tekrar Çalış ayni konu ve modu (bolum dahil) yeniden acar', () => {
    const pool = topicPool(T.modalVerbs).filter((exercise) => exercise.sectionId === 'modal-verbs.duerfen');
    const lesson: ActiveLesson = {
      mode: 'topic',
      topicId: T.modalVerbs,
      sessionMode: 'section',
      sectionId: 'modal-verbs.duerfen',
      queue: pool.slice(0, 2).map((exercise) => ({ exerciseId: exercise.id, presentationReason: 'primary' as const })),
      index: 2,
      startedAt: '2026-08-17T10:00:00.000Z',
      results: pool.slice(0, 2).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })),
      retries: {},
    };
    const view = mount(buildLessonResult(lesson, { lookup: (id) => allExercises.find((exercise) => exercise.id === id) }));
    view.click('Tekrar Çalış');
    expect(view.routes).toEqual([{ name: 'lesson', topicId: T.modalVerbs, mode: 'section', sectionId: 'modal-verbs.duerfen' }]);
    act(() => view.root.unmount());
  });

  it('haritanin son konusunda olu "Sıradaki" yerine gercek alternatifler gosterir', () => {
    const view = mount(
      resultFor(vocabulary.slice(0, 3).map((exercise) => ({ exerciseId: exercise.id, result: 'correct' as const })), T.vocabulary),
    );
    expect(view.find('Sıradaki Konu')).toBeUndefined();
    expect(view.find('Hızlı Tekrar')).toBeDefined();
    view.click('Hızlı Tekrar');
    expect(view.routes).toEqual([{ name: 'lesson', topicId: T.vocabulary, mode: 'quick' }]);
    act(() => view.root.unmount());
  });

  it('genel tekrar sonucu "Genel Tekrar’a Dön" eylemini sunar', () => {
    const lesson: ActiveLesson = {
      mode: 'review',
      sessionMode: 'gr-mixed',
      queue: [{ exerciseId: articles[0].id, presentationReason: 'primary' }],
      index: 1,
      startedAt: '2026-08-17T10:00:00.000Z',
      results: [{ exerciseId: articles[0].id, result: 'correct' }],
      retries: {},
    };
    const view = mount(
      buildLessonResult(lesson, { lookup: (id) => allExercises.find((exercise) => exercise.id === id) }),
    );
    expect(view.find('Genel Tekrar’a Dön')).toBeDefined();
    view.click('Genel Tekrar’a Dön');
    expect(view.routes).toEqual([{ name: 'general-review' }]);
    act(() => view.root.unmount());
  });

  it('ust uste tiklamada tek bir oturum kurar', () => {
    const view = mount(
      resultFor([
        { exerciseId: articles[0].id, result: 'incorrect' },
        { exerciseId: articles[1].id, result: 'correct' },
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
      queue: [{ exerciseId: articles[1].id, presentationReason: 'primary' }],
      index: 1,
      startedAt: '2026-08-17T10:00:00.000Z',
      results: [{ exerciseId: articles[1].id, result: 'incorrect' }],
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
      { exerciseId: articles[0].id, result: 'incorrect' },
      { exerciseId: articles[1].id, result: 'correct' },
      { exerciseId: articles[2].id, result: 'minor-typo' },
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
