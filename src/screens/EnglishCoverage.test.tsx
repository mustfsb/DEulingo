// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import { recordAttempt } from '../lib/progress';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { contentFor, enContent } from '../lib/content-en';
import { EN_VOCABULARY } from '../content/en/vocab';
import { buildVocabSession, assertWhitelist, buildMatching } from '../lib/vocab/questions';
import { deterministicValidate } from '../lib/semantic/validate-answer';
import { previewReviewSize, startMistakeSession, startReviewSession } from '../lib/start-review';
import { resultHeadline, LessonCompleteScreen } from './LessonCompleteScreen';
import { VocabHomeScreen } from './VocabHomeScreen';
import { VocabListScreen } from './VocabListScreen';
import { VocabStudyScreen } from './VocabStudyScreen';
import { StatsScreen } from './StatsScreen';
import { MistakesScreen } from './MistakesScreen';
import { ReviewSummaryScreen } from './SummaryTopicScreen';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

function setup() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(dom.window, 'matchMedia', {
    value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
  });
  return dom;
}

function enApi(progress: UserProgress) {
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
    language: 'en',
    setLanguage: () => undefined,
  };
  return { api, getProgress: () => progress };
}

function mount(element: React.ReactElement, api: ProgressApi) {
  const dom = setup();
  const routes: Route[] = [];
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => root.render(createElement(element.type as never, { ...(element.props as object), api, navigate: (route: Route) => routes.push(route) })));
  return { dom, root, routes, text: () => dom.window.document.body.textContent ?? '' };
}

describe('İngilizce kapsama taraması', () => {
  it('kelime ekranları İngilizce envanterle çizilir', () => {
    const { api } = enApi(createEmptyProgress());
    const home = mount(createElement(VocabHomeScreen, {} as never), api);
    expect(home.text()).toContain('38');
    expect(home.text()).toContain('İngilizce → Türkçe');
    expect(home.text()).toContain('Present Perfect');
    act(() => home.root.unmount());

    const list = mount(createElement(VocabListScreen, {} as never), api);
    expect(list.text()).toContain('38');
    expect(list.dom.window.document.querySelector('input')?.placeholder).toContain('İngilizce');
    act(() => list.root.unmount());
  });

  it('kelime oturumu her türde İngilizce soru üretir, beyaz liste temizdir', () => {
    for (const kind of ['mixed', 'detr', 'trde', 'match', 'type', 'listen', 'weak', 'flash', 'marathon', 'topic'] as const) {
      const questions = buildVocabSession({ kind, seed: `en-${kind}`, progress: createEmptyProgress(), inventory: EN_VOCABULARY });
      expect(questions.length, kind).toBeGreaterThan(0);
      expect(assertWhitelist(questions, EN_VOCABULARY), kind).toEqual([]);
    }
    // Konu filtresi İngilizce konuyu çözer.
    const topical = buildVocabSession({ kind: 'topic', topicId: 'en.present-perfect', seed: 'en-topic', inventory: EN_VOCABULARY });
    expect(topical.length).toBeGreaterThan(0);

    // Deterministik doğrulama İngilizce girdide çalışır.
    const detr = buildVocabSession({ kind: 'detr', seed: 'en-d', inventory: EN_VOCABULARY })[0];
    expect(deterministicValidate(detr.exercise, 'yanlış cevap kesinlikle').status).toBe('incorrect');

    // Eşleştirme yönergesi İngilizce der.
    const set = buildMatching(EN_VOCABULARY.slice(0, 5), 'de-tr', 'en-m');
    expect(set?.exercise.instruction).toContain('İngilizce');
  });

  it('kelime çalışma ekranı İngilizce oturumu açar', () => {
    const { api } = enApi(createEmptyProgress());
    const view = mount(createElement(VocabStudyScreen, { kind: 'mixed', size: 'quick' } as never), api);
    expect(view.text()).toContain('Tüm Kelimeler');
    act(() => view.root.unmount());
  });

  it('Genel Tekrar her modda İngilizce oturum kurar', () => {
    for (const mode of ['mixed', 'sentence', 'writing', 'listening', 'quick', 'challenge'] as const) {
      expect(previewReviewSize(mode, undefined, 'en'), mode).toBeGreaterThan(0);
    }
    expect(previewReviewSize('topic', 'en.present-perfect', 'en')).toBeGreaterThan(0);
    for (const mode of ['mixed', 'sentence', 'writing', 'listening', 'quick', 'challenge', 'topic'] as const) {
      const progress = createEmptyProgress();
      const { api } = enApi(progress);
      const routes: Route[] = [];
      const ok = startReviewSession(api, (route) => routes.push(route), {
        mode,
        ...(mode === 'topic' ? { topicId: 'en.present-perfect' } : {}),
      });
      expect(ok, mode).toBe(true);
      expect(routes).toEqual([{ name: 'review' }]);
    }
  });

  it('hata tekrarı yalnızca İngilizce hatalardan kurulur', () => {
    const exercise = enContent.exercisesById.get('en-pp-v3-fill-seen')!;
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, exercise, 'see', 'incorrect', { status: 'incorrect', expected: 'seen', normalizedInput: 'see' }, {});
    const { api, getProgress } = enApi(progress);
    const routes: Route[] = [];
    expect(startMistakeSession(api, (route) => routes.push(route))).toBe(true);
    expect(routes).toEqual([{ name: 'review' }]);
    expect(getProgress().activeLesson?.queue[0]?.exerciseId).toBe('en-pp-v3-fill-seen');

    const view = mount(createElement(MistakesScreen, {} as never), api);
    expect(view.text()).toContain('Present Perfect');
    // Kavram etiketi rozeti görünür.
    expect(view.text()).toContain('🏷️');
    act(() => view.root.unmount());
  });

  it('Genel Tekrar özeti İngilizce bölümlerden tekrar başlatır', () => {
    const { api, getProgress } = enApi(createEmptyProgress());
    const view = mount(createElement(ReviewSummaryScreen, {} as never), api);
    expect(view.text()).toContain('Present Perfect');
    const buttons = [...view.dom.window.document.querySelectorAll<HTMLButtonElement>('button')];
    const study = buttons.find((button) => button.textContent?.includes('Bu Konuyu Çalış'));
    expect(study).toBeTruthy();
    act(() => study!.click());
    expect(getProgress().activeLesson?.mode).toBe('review');
    expect(getProgress().activeLesson?.topicId).toBe('en.present-perfect');
    act(() => view.root.unmount());
  });

  it('istatistik ekranı İngilizce diliminde ses seçici yerine bilgi gösterir', () => {
    const { api } = enApi(createEmptyProgress());
    const view = mount(createElement(StatsScreen, {} as never), api);
    expect(view.text()).toContain('Present Perfect');
    expect(view.text()).toContain('en-GB');
    expect(view.dom.window.document.querySelector('select[aria-label="Telaffuz sesi"]')).toBeNull();
    act(() => view.root.unmount());
  });

  it('sonuç başlığı İngilizce konu adını çözer', () => {
    const result = {
      sessionId: 's', mode: 'topic', topicId: 'en.present-perfect', exerciseIds: [], incorrectExerciseIds: [],
      typoExerciseIds: [], skippedExerciseIds: [], total: 10, correctCount: 10, incorrectCount: 0, typoCount: 0,
      skippedCount: 0, selfAssessedCount: 0, accuracy: 1, strongestConceptIds: [], weakestConceptIds: [], topics: [],
      bestStreak: 3, perfect: true, completedAt: new Date().toISOString(),
    } as never;
    expect(resultHeadline(result, 100, false).subtitle).toContain('Present Perfect');
  });

  it('sonuç ekranı tek konulu dilimde çökmeden çizilir', () => {
    const progress = createEmptyProgress();
    const { api } = enApi(progress);
    const result = {
      sessionId: 's-en', mode: 'topic', topicId: 'en.present-perfect', sessionMode: 'normal',
      exerciseIds: ['en-pp-v3-fill-seen'], incorrectExerciseIds: [], typoExerciseIds: [],
      skippedExerciseIds: [], total: 1, correctCount: 1, incorrectCount: 0, typoCount: 0,
      skippedCount: 0, selfAssessedCount: 0, accuracy: 1, strongestConceptIds: [], weakestConceptIds: [],
      topics: [{ topicId: 'en.present-perfect', title: 'Present Perfect', correct: 1, total: 1 }],
      bestStreak: 1, perfect: true, completedAt: new Date().toISOString(),
    } as never;
    const view = mount(createElement(LessonCompleteScreen, { result } as never), api);
    expect(view.text()).toContain('Present Perfect');
    expect(view.text()).not.toContain('Sıradaki Konu');
    act(() => view.root.unmount());
  });

  it('ses yönlendirme: Almanca enjekte edilebilir, İngilizce çökmez', async () => {
    let requested = 0;
    const { AudioController } = await import('../lib/audio/playback');
    const played: string[] = [];
    const controller = new AudioController({
      requestSpeech: async () => { requested += 1; return { url: 'blob:x', cached: true }; },
      createAudio: (src) => {
        const handle: {
          currentTime: number;
          volume: number;
          onended: ((event: Event) => unknown) | null;
          onerror: ((event: Event) => unknown) | null;
          play: () => Promise<void>;
          pause: () => void;
        } = {
          currentTime: 0,
          volume: 1,
          onended: null,
          onerror: null,
          play: async () => {
            played.push(src);
            handle.onended?.(new Event('ended'));
          },
          pause: () => undefined,
        };
        return handle;
      },
    });
    await controller.speak('ctx', { text: 'Guten Morgen', language: 'de-DE', role: 'prompt' }, 'normal');
    expect(requested).toBe(1);
    expect(played).toEqual(['blob:x']);
    // Düğüm ortamında Web Speech yok: reddeder ama çökmez.
    await expect(controller.speak('ctx', { text: 'Hello', language: 'en-GB', role: 'prompt' }, 'normal')).rejects.toThrow();
    expect(contentFor('en').language).toBe('en');
  });
});
