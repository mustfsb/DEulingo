// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';
import { WeeklyReviewScreen } from './WeeklyReviewScreen';
import { SpeakingHomeScreen } from './SpeakingHomeScreen';
import { ListeningHomeScreen } from './ListeningHomeScreen';
import { WritingHomeScreen } from './WritingHomeScreen';
import { ReadingReviewScreen } from './ReadingReviewScreen';
import { ReadingIntroScreen } from './ReadingIntroScreen';
import { ReadingVocabScreen } from './ReadingVocabScreen';
import { WeeklyAnalysisScreen } from './WeeklyAnalysisScreen';
import { MistakesScreen } from './MistakesScreen';
import { EN_WEEK_1_ACTIVITIES, EN_WEEK_1_PLAN } from '../content/en/skills-weekly';
import { emptySkills, type EnSkillsState } from '../lib/skills-storage';
import { createEmptyProgress, type UserProgress } from '../lib/storage';
import { classifyWeekMistakes } from '../lib/week-analysis';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const doms: JSDOM[] = [];
afterEach(() => { for (const dom of doms.splice(0)) dom.window.close(); });

function mount(element: React.ReactElement) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
    localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  });
  // jsdom: scrollTo uygulanmamis
  (dom.window as unknown as { scrollTo: () => void }).scrollTo = () => undefined;
  const root = createRoot(dom.window.document.getElementById('root')!);
  act(() => { root.render(element); });
  return { dom, text: () => dom.window.document.body.textContent ?? '', unmount: () => act(() => { root.unmount(); }) };
}

function makeApi(initial: UserProgress = createEmptyProgress()) {
  let progress = initial;
  const api: ProgressApi = {
    get progress() { return progress; },
    update(updater) { progress = updater(progress); },
    replace(next) { progress = next; },
    language: 'en',
    setLanguage: () => undefined,
  };
  return { api, get: () => progress };
}

const noop = () => undefined;
const nav = noop as unknown as (route: Route) => void;

describe('haftalik plan ekrani', () => {
  it('her oturum kartinda sure, ilerleme, hedef yolu ve Git var', () => {
    const { api } = makeApi();
    const view = mount(createElement(WeeklyReviewScreen, { api, skills: emptySkills(), onSkills: noop, navigate: nav }));
    const cards = [...view.dom.window.document.querySelectorAll('[data-session]')];
    expect(cards.map((c) => c.getAttribute('data-session'))).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    const d = cards.find((c) => c.getAttribute('data-session') === 'D')!;
    const planD = EN_WEEK_1_PLAN.find((s) => s.code === 'D')!;
    // sure icerikten turetilen araliktir (hizli – tipik), elle yazilmis sayi degil
    expect(d.textContent).toContain(planD.hours);
    expect(d.textContent).toContain(`0 / ${planD.activities.length}`);
    expect(d.textContent).toContain('Zaman Çizgisi');
    expect(d.textContent).toContain('Alıştırma → Past Perfect');
    expect(d.textContent).toContain(planD.activities[1].duration);
    expect(d.querySelectorAll('[role="checkbox"]').length).toBe(planD.activities.length);
    expect(d.querySelectorAll('a').length).toBe(planD.activities.length);
    expect(view.text()).toContain('Süreler içerikten hesaplanan tahminlerdir');
    // toplam satir sayisi = planin tum aktiviteleri
    expect(view.dom.window.document.querySelectorAll('[role="checkbox"]').length).toBe(EN_WEEK_1_ACTIVITIES.length);
    view.unmount();
  });

  it('oturum ilerlemesi isaretlerden turetilir; tum kutular isaretliyse Tamamlandi', () => {
    const { api } = makeApi();
    const skills = emptySkills();
    const b = EN_WEEK_1_PLAN.find((s) => s.code === 'B')!;
    skills.weekly.completedActivities = b.activities.map((a) => a.id).slice(0, 5);
    let view = mount(createElement(WeeklyReviewScreen, { api, skills, onSkills: noop, navigate: nav }));
    let card = view.dom.window.document.querySelector('[data-session="B"]')!;
    expect(card.textContent).toContain(`5 / ${b.activities.length}`);
    expect(card.textContent).not.toContain('Tamamlandı');
    expect(view.text()).toContain(`5 / ${EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'core').length} tamamlandı`);
    view.unmount();

    skills.weekly.completedActivities = b.activities.map((a) => a.id);
    view = mount(createElement(WeeklyReviewScreen, { api, skills, onSkills: noop, navigate: nav }));
    card = view.dom.window.document.querySelector('[data-session="B"]')!;
    expect(card.textContent).toContain(`${b.activities.length} / ${b.activities.length}`);
    expect(card.textContent).toContain('Tamamlandı');
    // diger oturum tamamlanmis sayilmaz
    expect(view.dom.window.document.querySelector('[data-session="A"]')!.textContent).not.toContain('Tamamlandı');
    view.unmount();
  });

  it('kartlar acilip kapanir (aria-expanded) ve ilk tamamlanmamis oturum acik baslar', () => {
    const { api } = makeApi();
    const view = mount(createElement(WeeklyReviewScreen, { api, skills: emptySkills(), onSkills: noop, navigate: nav }));
    const headers = [...view.dom.window.document.querySelectorAll('[data-session] button[aria-expanded]')] as HTMLElement[];
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false', 'false', 'false', 'false', 'false']);
    act(() => { headers[3].click(); });
    expect(headers[3].getAttribute('aria-expanded')).toBe('true');
    act(() => { headers[3].click(); });
    expect(headers[3].getAttribute('aria-expanded')).toBe('false');
    view.unmount();
  });

  it('Git: tum duz rota aktiviteleri hedef rotaya, imperatifler oturum kurmaya gider', () => {
    const { api, get } = makeApi();
    const routes: Route[] = [];
    const view = mount(createElement(WeeklyReviewScreen, { api, skills: emptySkills(), onSkills: noop, navigate: (r) => { routes.push(r); } }));
    const links = [...view.dom.window.document.querySelectorAll('[data-session] ol a')] as HTMLElement[];
    expect(links.length).toBe(EN_WEEK_1_ACTIVITIES.length);
    for (const link of links) act(() => { link.click(); });
    // her tiklama tam bir gecis uretti (hicbiri sessiz kalmadi)
    expect(routes.length).toBe(EN_WEEK_1_ACTIVITIES.length);
    // imperatif olanlar tekrar oturumuna gecer ve aktif ders kurar
    const reviewRoutes = routes.filter((r) => r.name === 'review');
    expect(reviewRoutes.length).toBe(4);
    expect(get().activeLesson?.mode).toBe('review');
    expect(routes.some((r) => r.name === 'listening' && r.focus === 'week1-test')).toBe(true);
    view.unmount();
  });

  it('Mini Tekrar yalnizca Present Perfect dinleme/konusma sorulari kurar', () => {
    const { api, get } = makeApi();
    const view = mount(createElement(WeeklyReviewScreen, { api, skills: emptySkills(), onSkills: noop, navigate: nav }));
    const row = [...view.dom.window.document.querySelectorAll('[data-session="B"] ol li')].find((li) => li.textContent?.includes('Mini Tekrar'))!;
    act(() => { (row.querySelector('a') as HTMLElement).click(); });
    const queue = get().activeLesson!.queue;
    expect(queue.length).toBe(15);
    view.unmount();
  });
});

describe('beceri kapsamlari', () => {
  it('konusma: gölgeleme yalnizca Present Perfect gölgelemeyi listeler', () => {
    const view = mount(createElement(SpeakingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav,
      initial: { topicId: 'en.present-perfect', kind: 'shadowing', focus: 'pp-shadowing' },
    }));
    const items = view.dom.window.document.querySelectorAll('ul.grid > li');
    expect(items.length).toBe(16);
    expect(view.text()).toContain('PP Shadowing 10');
    // gölgelemede referans cümle önceden yazıyla verilmez (önce dinle)
    expect(view.text()).not.toContain('I\'ve lived here for three years.');
    expect(view.text()).not.toContain('Hafta Testi');
    expect(view.text()).toContain('Haftalık plan kapsamı');
    view.unmount();
  });

  it('konusma tekrar: yalnizca "tekrar gerek" cevaplari acilir ve onceki transkript gorunur', () => {
    const skills = emptySkills();
    skills.speaking.push(
      { id: 's1', promptId: 'en-spk-sa-pp-04', kind: 'short-answer', at: '2026-01-01T10:00:00Z', transcript: 'I not finish yet', selfScore: 'needs-work', savedRecording: false },
      { id: 's2', promptId: 'en-spk-sa-pp-05', kind: 'short-answer', at: '2026-01-01T10:05:00Z', transcript: 'I have already had breakfast', selfScore: 'good', savedRecording: false },
    );
    const view = mount(createElement(SpeakingHomeScreen, {
      skills, onRecord: noop, navigate: nav,
      initial: { topicId: 'en.present-perfect', kind: 'short-answer', focus: 'pp-personal', retry: true },
    }));
    expect(view.text()).toContain('What haven\'t you finished yet?');
    expect(view.text()).toContain('I not finish yet');
    expect(view.text()).not.toContain('What have you already done today?');
    view.unmount();
  });

  it('konusma tekrar: kayit yoksa aciklayici uyari + tum kapsam', () => {
    const view = mount(createElement(SpeakingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav,
      initial: { topicId: 'en.present-perfect', kind: 'short-answer', focus: 'pp-personal', retry: true },
    }));
    expect(view.text()).toContain('Tekrar gerektiren kayıtlı cevap yok');
    expect(view.dom.window.document.querySelectorAll('ul.grid > li').length).toBe(14);
    view.unmount();
  });

  it('konusma testi: hedef kalip ve ornek cevap gosterilmez', () => {
    const view = mount(createElement(SpeakingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initial: { focus: 'week1-test' },
    }));
    expect(view.dom.window.document.querySelectorAll('ul.grid > li').length).toBe(8);
    expect(view.text()).not.toContain('Örnek cevap');
    view.unmount();
  });

  it('Second Conditional konusma: yalnizca o istem havuzu', () => {
    const view = mount(createElement(SpeakingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initial: { topicId: 'en.conditionals', focus: 'second-conditional' },
    }));
    expect(view.dom.window.document.querySelectorAll('ul.grid > li').length).toBe(13);
    expect(view.text()).toContain('What would you buy if you had more money?');
    expect(view.text()).not.toContain('How long have you studied English?');
    view.unmount();
  });

  it('dinleme: V3 kapsami yalnizca V3 parcalarini verir ve ilk parca hazir acilir', () => {
    const view = mount(createElement(ListeningHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initial: { topicId: 'en.present-perfect', focus: 'v3' },
    }));
    expect(view.text()).toContain('14 parça');
    expect(view.text()).toContain('V3:');
    expect(view.text()).not.toContain('At the Station');
    view.unmount();
  });

  it('dinleme testi: hafta 1 testi parcalari', () => {
    const view = mount(createElement(ListeningHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initial: { focus: 'week1-test' },
    }));
    expect(view.text()).toContain('12 parça');
    view.unmount();
  });
});

describe('okuma ekranlari', () => {
  it('kanit incelemesi: deneme yoksa once cozmeye yonlendirir', () => {
    const view = mount(createElement(ReadingReviewScreen, { passageId: 'en-read-w1-1', skills: emptySkills(), navigate: nav }));
    expect(view.text()).toContain('henüz deneme yok');
    view.unmount();
  });

  it('kanit incelemesi: yanlis soru acilinca destekleyen cumle pasajda vurgulanir', () => {
    const skills = emptySkills();
    skills.reading.push({
      passageId: 'en-read-w1-1', correct: 11, total: 12, at: '2026-01-01T10:00:00Z',
      mistakeQuestionIds: ['en-read-w1-1-q6'], addedVocab: [], answers: { 'en-read-w1-1-q6': 'True' },
    });
    const view = mount(createElement(ReadingReviewScreen, { passageId: 'en-read-w1-1', skills, navigate: nav }));
    expect(view.text()).toContain('1 yanlış');
    expect(view.dom.window.document.querySelector('mark')).toBeNull();
    const toggle = [...view.dom.window.document.querySelectorAll('aside button')].find((b) => b.textContent?.includes('completely new idea')) as HTMLElement;
    act(() => { toggle.click(); });
    const mark = view.dom.window.document.querySelector('mark[data-evidence]')!;
    expect(mark.textContent).toBe('The idea is not new');
    expect(view.text()).toContain('Senin cevabın: True');
    expect(view.text()).toContain('Doğru cevap: False');
    view.unmount();
  });

  it('IELTS girisi: Not Given ornegi varsayimla cevaplamayi ogretir', () => {
    const view = mount(createElement(ReadingIntroScreen, { navigate: nav }));
    expect(view.text()).toContain('Kanıtı bul');
    const notGiven = [...view.dom.window.document.querySelectorAll('[role="radio"]')].filter((b) => b.textContent === 'True')[2] as HTMLElement;
    act(() => { notGiven.click(); });
    expect(view.text()).toContain('Doğru cevap: Not Given');
    view.unmount();
  });

  it('kelime cikarma: otomatik eklenmez; "Öğrenilecek Kelimelere Ekle" ogeyi kelime sistemine alir', () => {
    let skills: EnSkillsState = emptySkills();
    const view = mount(createElement(ReadingVocabScreen, {
      skills, onRecord: (fn) => { skills = fn(skills); }, navigate: nav,
    }));
    expect(skills.readingVocab).toEqual([]);
    const add = [...view.dom.window.document.querySelectorAll('li button')].find((b) => b.getAttribute('aria-label') === 'pay attention to: Öğrenilecek Kelimelere Ekle') as HTMLElement;
    expect(add).toBeTruthy();
    act(() => { add.click(); });
    expect(skills.readingVocab.length).toBe(1);
    // öbek bütün hâlinde korunur, meta veri eksiksizdir
    expect(skills.readingVocab[0]).toMatchObject({
      id: 'en-uv-pay-attention-to', en: 'pay attention to', tr: 'dikkat etmek', type: 'phrase', chunk: true, passageId: 'en-read-w1-2',
    });
    expect(Date.parse(skills.readingVocab[0].at)).not.toBeNaN();
    view.unmount();
  });
});

describe('yazma', () => {
  it('yeniden yazma asamasi kayitli taslagi ve geri bildirimi yukler', () => {
    const skills = emptySkills();
    skills.writing.push({
      id: 'wr-1', taskId: 'en-write-w1-guided', draft1: 'I enjoy to visit museums because I am interested for art. '.repeat(3),
      feedback: [], words1: 30, at: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z',
    });
    const view = mount(createElement(WritingHomeScreen, {
      skills, onRecord: noop, navigate: nav, initialTaskId: 'en-write-w1-guided', initialStage: 'rewrite',
    }));
    const area = view.dom.window.document.querySelector('textarea[aria-label$="taslağı"]') as HTMLTextAreaElement;
    expect(area.value).toContain('enjoy to visit');
    expect(view.text()).toContain('Geri bildirim');
    expect(view.text()).toContain('Yeniden yazma');
    expect(view.text()).toContain('Introduction');
    view.unmount();
  });

  it('yeniden yazma: taslak yoksa acik uyari', () => {
    const view = mount(createElement(WritingHomeScreen, {
      skills: emptySkills(), onRecord: noop, navigate: nav, initialTaskId: 'en-write-w1-guided', initialStage: 'rewrite',
    }));
    expect(view.text()).toContain('kayıtlı taslak yok');
    view.unmount();
  });

  it('haftalik yazma testi: gramer ipuclari gizli, geri bildirimde kullanilan yapilar listelenir', () => {
    const skills = emptySkills();
    const view = mount(createElement(WritingHomeScreen, {
      skills, onRecord: noop, navigate: nav, initialTaskId: 'en-write-wt-1',
    }));
    expect(view.text()).toContain('Test modu: gramer ipucu yok');
    expect(view.text()).not.toContain('en az 2 because');
    view.unmount();
  });

  it('taslak kaydi tek kayit uzerinde guncellenir (cogalmaz)', () => {
    let skills: EnSkillsState = emptySkills();
    const view = mount(createElement(WritingHomeScreen, {
      skills, onRecord: (fn) => { skills = fn(skills); }, navigate: nav, initialTaskId: 'en-write-1',
    }));
    const area = view.dom.window.document.querySelector('textarea[aria-label$="taslağı"]') as HTMLTextAreaElement;
    const setValue = Object.getOwnPropertyDescriptor(view.dom.window.HTMLTextAreaElement.prototype, 'value')!.set!;
    const type = (text: string) => act(() => {
      setValue.call(area, text);
      area.dispatchEvent(new view.dom.window.Event('input', { bubbles: true }));
    });
    const saveBtn = () => [...view.dom.window.document.querySelectorAll('button')].find((b) => b.textContent?.includes('Taslağı Kaydet')) as HTMLElement;
    type('I want to improve my English because I want a better job. I have studied for two years.');
    act(() => { saveBtn().click(); });
    type('I want to improve my English because I want a better job. I have studied English for two years.');
    act(() => { saveBtn().click(); });
    expect(skills.writing.length).toBe(1);
    expect(skills.writing[0].draft1).toContain('English for two years');
    view.unmount();
  });
});

describe('hata analizi', () => {
  it('hatalar sekiz kategoriye ayrilir', () => {
    const progress = createEmptyProgress();
    progress.mistakes['en-gi-err-enjoy'] = {
      exerciseId: 'en-gi-err-enjoy', topicId: 'en.gerund-infinitive', topic: 'Gerund & Infinitive', prompt: 'I enjoy to visit museums.',
      userAnswer: 'I enjoy to visit museums.', expectedAnswer: 'I enjoy visiting museums.', count: 2, typoCount: 0, lastOccurredAt: 'x', type: 'grammar',
    };
    progress.mistakes['en-pc-err-interested'] = {
      exerciseId: 'en-pc-err-interested', topicId: 'en.prepositions-collocations', topic: 'Prepositions', prompt: 'x', userAnswer: 'x',
      expectedAnswer: 'I am interested in music.', count: 1, typoCount: 0, lastOccurredAt: 'x', type: 'grammar',
    };
    progress.mistakes['en-ss-mist-err-order'] = {
      exerciseId: 'en-ss-mist-err-order', topicId: 'en.sentence-structure', topic: 'SS', prompt: 'x', userAnswer: 'x',
      expectedAnswer: 'I study English every evening.', count: 1, typoCount: 0, lastOccurredAt: 'x', type: 'word-order',
    };
    const skills = emptySkills();
    skills.reading.push({ passageId: 'en-read-w1-1', correct: 10, total: 12, at: 'x', mistakeQuestionIds: ['en-read-w1-1-q6', 'en-read-w1-1-q7'], addedVocab: [] });
    skills.listening.push({ itemId: 'en-lis-wt-01', correct: false, replays: 1, at: 'x' });
    skills.speaking.push({ id: 's', promptId: 'en-spk-wt-01', kind: 'short-answer', at: 'x', selfScore: 'needs-work', savedRecording: false });
    skills.writing.push({ id: 'w', taskId: 'en-write-wt-1', draft1: 'x', feedback: [{ category: 'Grammar', message: 'm' }], words1: 1, at: 'x', updatedAt: 'x' });
    const buckets = classifyWeekMistakes(progress, skills, () => undefined);
    const byCat = Object.fromEntries(buckets.map((b) => [b.category, b.count]));
    expect(buckets.map((b) => b.category)).toEqual(['Grammar', 'Vocabulary', 'Collocation', 'Sentence Structure', 'Reading', 'Listening', 'Writing', 'Speaking']);
    expect(byCat).toMatchObject({ Grammar: 2, Collocation: 1, 'Sentence Structure': 1, Reading: 2, Listening: 1, Writing: 1, Speaking: 1 });
  });

  it('analiz ekrani bos durumda aciklayici, doluda oncelik listeler', () => {
    const { api } = makeApi();
    let view = mount(createElement(WeeklyAnalysisScreen, { api, skills: emptySkills(), navigate: nav }));
    expect(view.text()).toContain('Henüz sınıflandırılacak hata yok');
    view.unmount();
    const skills = emptySkills();
    skills.reading.push({ passageId: 'en-read-w1-1', correct: 10, total: 12, at: 'x', mistakeQuestionIds: ['en-read-w1-1-q6'], addedVocab: [] });
    view = mount(createElement(WeeklyAnalysisScreen, { api, skills, navigate: nav }));
    expect(view.text()).toContain('Öncelik');
    expect(view.dom.window.document.querySelectorAll('[data-category]').length).toBe(8);
    view.unmount();
  });

  it('Hataları Tekrarla (hafta 1): yalnizca hafta konularinin hatalari', () => {
    const { api } = makeApi();
    api.update((p) => ({
      ...p,
      mistakes: {
        'en-gi-err-enjoy': {
          exerciseId: 'en-gi-err-enjoy', topicId: 'en.gerund-infinitive', topic: 'Gerund & Infinitive', prompt: 'I enjoy to visit museums.',
          userAnswer: 'I enjoy to visit museums.', expectedAnswer: 'I enjoy visiting museums.', count: 1, typoCount: 0, lastOccurredAt: 'x', type: 'grammar',
        },
        'de-artefakt': {
          exerciseId: 'de-artefakt', topicId: 'topic.modal-verbs', topic: 'Modalverben', prompt: 'Ich kann.', userAnswer: 'x',
          expectedAnswer: 'Ich kann schwimmen.', count: 1, typoCount: 0, lastOccurredAt: 'x', type: 'grammar',
        },
      },
    }));
    const view = mount(createElement(MistakesScreen, { api, navigate: nav, scope: 'week1' }));
    expect(view.text()).toContain('Hafta 1 Hataları');
    expect(view.text()).toContain('I enjoy visiting museums.');
    expect(view.text()).not.toContain('Ich kann schwimmen.');
    view.unmount();
  });
});
