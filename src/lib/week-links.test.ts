import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './router';
import { routeForWeekLink } from './week-destination';
import { auditWeekPlan } from './week-audit';
import { buildSessionPlan } from './session';
import { createEmptyProgress } from './storage';
import { listeningPool } from '../content/en/skills-listening';
import { speakingPool } from '../content/en/skills-speaking';
import { EN_WEEK_1_ACTIVITIES, EN_WEEK_1_PLAN, weekPlanProgress } from '../content/en/skills-weekly';
import { EN_LISTENING_BY_ID } from '../content/en/skills-listening';
import { enContent } from './content-en';

describe('derin baglanti rotalari', () => {
  it('dinleme: tam kapsam round-trip', () => {
    const route = {
      name: 'listening',
      topicId: 'en.present-perfect',
      kind: 'dictation',
      focus: 'for-since',
      itemId: 'en-lis-d9',
    } as const;
    const href = hrefFor(route);
    expect(href).toBe('#/dinleme/konu/present-perfect/tur/dikte/odak/for-since/parca/en-lis-d9');
    expect(parseHash(href)).toEqual(route);
  });

  it('dinleme: kismi kapsam + gecersiz degerler dusurulur', () => {
    expect(parseHash('#/dinleme/tur/dikte')).toEqual({ name: 'listening', kind: 'dictation' });
    expect(parseHash('#/dinleme')).toEqual({ name: 'listening' });
    expect(parseHash('#/dinleme/tur/bogus')).toEqual({ name: 'listening' });
    expect(parseHash('#/dinleme/konu/bogus')).toEqual({ name: 'listening' });
    expect(parseHash('#/dinleme/odak/bogus')).toEqual({ name: 'listening' });
    expect(parseHash('#/dinleme/parca/bogus')).toEqual({ name: 'listening' });
    expect(parseHash('#/dinleme/konu/present-perfect/parca/bogus')).toEqual({
      name: 'listening',
      topicId: 'en.present-perfect',
    });
  });

  it('yazma/konusma/okuma: round-trip + geri dusus', () => {
    expect(hrefFor({ name: 'writing', taskId: 'en-write-2' })).toBe('#/yazma/gorev/en-write-2');
    expect(parseHash('#/yazma/gorev/en-write-2')).toEqual({ name: 'writing', taskId: 'en-write-2' });
    expect(parseHash('#/yazma/gorev/bogus')).toEqual({ name: 'writing' });
    expect(parseHash('#/yazma')).toEqual({ name: 'writing' });

    expect(hrefFor({ name: 'speaking', kind: 'shadowing' })).toBe('#/konusma/tur/shadowing');
    expect(parseHash('#/konusma/tur/shadowing')).toEqual({ name: 'speaking', kind: 'shadowing' });
    expect(parseHash('#/konusma/tur/bogus')).toEqual({ name: 'speaking' });
    expect(parseHash('#/konusma/istem/en-spk-sa-1')).toEqual({
      name: 'speaking',
      promptId: 'en-spk-sa-1',
    });

    expect(hrefFor({ name: 'reading', filter: 'ielts' })).toBe('#/okuma/tur/ielts');
    expect(parseHash('#/okuma/tur/ielts')).toEqual({ name: 'reading', filter: 'ielts' });
    expect(parseHash('#/okuma/tur/kisa')).toEqual({ name: 'reading', filter: 'short' });
    expect(parseHash('#/okuma/en-read-1')).toEqual({ name: 'reading-passage', passageId: 'en-read-1' });
  });
});

describe('hafta plani hedefleri', () => {
  it('aktivite kimlikleri kararli, ad alanli, benzersiz', () => {
    expect(EN_WEEK_1_ACTIVITIES.length).toBeGreaterThan(12);
    const ids = EN_WEEK_1_ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith('en.w1.'), id).toBe(true);
    expect(EN_WEEK_1_PLAN.length).toBe(7);
  });

  it('kritik: For/Since + Dikte tam filtreli dinlemeye iner', () => {
    const activity = EN_WEEK_1_ACTIVITIES.find((a) => a.id === 'en.w1.a.dictation');
    expect(activity).toBeTruthy();
    const route = routeForWeekLink(activity!.link);
    expect(route).toEqual({
      name: 'listening',
      topicId: 'en.present-perfect',
      kind: 'dictation',
      focus: 'for-since',
      itemId: 'en-lis-d9',
    });
    // kesişim gerçekten o parcayı verir, ilgisiz icerik sizmaz
    const item = EN_LISTENING_BY_ID.get('en-lis-d9')!;
    expect(item.topicTags).toContain('en.present-perfect');
    expect(item.kind).toBe('dictation');
    expect(item.focusTags ?? []).toContain('for-since');
  });

  it('tum aktivitelerin gercek hedefi var (genel sayfa = 0, bos havuz = 0)', () => {
    const rows = auditWeekPlan();
    expect(rows.length).toBe(EN_WEEK_1_ACTIVITIES.length);
    for (const row of rows) {
      expect(row.contentExists, `${row.activityId} icerik`).toBe(true);
      expect(row.enough, `${row.activityId} havuz ${row.count} < ${row.minimum}`).toBe(true);
      expect(row.deepLinkWorks, `${row.activityId} derin baglanti`).toBe(true);
    }
  });

  it('hicbir Git genel beceri sayfasina inmez', () => {
    for (const activity of EN_WEEK_1_ACTIVITIES) {
      const link = activity.link;
      if (link.kind === 'review-set' || link.kind === 'review-mixed') continue;
      const route = routeForWeekLink(link)!;
      expect(route, activity.id).not.toBeNull();
      switch (route.name) {
        case 'listening':
          // konu, tur, odak ya da parca — en az biri
          expect(Boolean(route.topicId || route.kind || route.focus || route.itemId), activity.id).toBe(true);
          break;
        case 'speaking':
          expect(Boolean(route.topicId || route.kind || route.focus || route.promptId), activity.id).toBe(true);
          break;
        case 'reading':
          throw new Error(`${activity.id}: genel Reading sayfasi`);
        case 'writing':
          expect(route.taskId, activity.id).toBeTruthy();
          break;
        case 'lesson':
          expect(route.mode === 'section' ? route.sectionId : true, activity.id).toBeTruthy();
          break;
        default:
          break;
      }
    }
  });

  it('plan yapisi: 7 oturum, sureler icerikten turetilir, hizli ogrenci 15-20 saat', () => {
    expect(EN_WEEK_1_PLAN.map((s) => s.code)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    for (const session of EN_WEEK_1_PLAN) {
      const core = session.activities.filter((a) => a.tier === 'core');
      expect(core.length, session.id).toBeGreaterThanOrEqual(8);
      expect(core.length, session.id).toBeLessThanOrEqual(12);
      // oturum toplami yalnizca CEKIRDEK aktivitelerin toplamidir (ek pratik haric)
      expect(session.minutes, session.id).toBe(core.reduce((sum, a) => sum + a.minutes, 0));
      expect(session.minutesTypical, session.id).toBe(core.reduce((sum, a) => sum + a.minutesTypical, 0));
      for (const activity of session.activities) {
        // sure elle yazilmaz: modelin hizli/tipik toplamindan gelir
        expect(activity.minutes, activity.id).toBe(Math.max(1, Math.round(activity.workload.seconds.fast / 60)));
        expect(activity.minutesTypical, activity.id).toBeGreaterThanOrEqual(activity.minutes);
        expect(activity.minutes, activity.id).toBeLessThanOrEqual(35);
        expect(activity.id.startsWith(`en.w1.${session.code.toLowerCase()}.`), activity.id).toBe(true);
      }
    }
    const total = EN_WEEK_1_PLAN.reduce((sum, s) => sum + s.minutes, 0);
    expect(total).toBeGreaterThanOrEqual(15 * 60);
    expect(total).toBeLessThanOrEqual(20 * 60);
  });

  it('oturum sureleri (hizli profil) 2-3 saat bandinda, hicbiri bos degil', () => {
    for (const session of EN_WEEK_1_PLAN) {
      expect(session.minutes, session.code).toBeGreaterThanOrEqual(120);
      expect(session.minutes, session.code).toBeLessThanOrEqual(195);
    }
  });

  it('ilerleme isaretlerden turetilir; gecersiz kimlik ve ek pratik sayilmaz', () => {
    const all = EN_WEEK_1_ACTIVITIES.map((a) => a.id);
    const core = EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'core').map((a) => a.id);
    const extra = EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'extra').map((a) => a.id);
    expect(extra.length).toBeGreaterThan(0);
    expect(weekPlanProgress([]).done).toBe(0);
    expect(weekPlanProgress(['en.w1.a.summary', 'bozuk.kimlik', ...extra]).done).toBe(1);
    const withB = weekPlanProgress(all.filter((id) => id.startsWith('en.w1.b.')));
    const bCore = core.filter((id) => id.startsWith('en.w1.b.')).length;
    expect(withB.sessions.find((s) => s.code === 'B')).toMatchObject({ done: bCore, total: bCore, complete: true });
    expect(withB.sessions.find((s) => s.code === 'A')).toMatchObject({ done: 0, complete: false });
    expect(weekPlanProgress(all)).toMatchObject({ done: core.length, total: core.length, percent: 100 });
  });

  it('kritik derin baglantilar tam hedefe iner', () => {
    const byId = (id: string) => routeForWeekLink(EN_WEEK_1_ACTIVITIES.find((a) => a.id === id)!.link);
    expect(byId('en.w1.b.mixed-dictation')).toEqual({ name: 'listening', kind: 'dictation', focus: 'mixed-dictation' });
    expect(byId('en.w1.d.pp-tr-en')).toEqual({ name: 'lesson', topicId: 'en.past-perfect', mode: 'section', sectionId: 'set.ppf.tr-en', all: true });
    expect(byId('en.w1.d.timeline-build')).toEqual({ name: 'lesson', topicId: 'en.past-perfect', mode: 'section', sectionId: 'set.ppf.timeline-build', all: true });
    expect(byId('en.w1.a.listening')).toEqual({ name: 'listening-task', taskId: 'en-lx-old-friend' });
    expect(byId('en.w1.e.collocations')).toEqual({ name: 'vocab-study', kind: 'flash', topicId: 'en.prepositions-collocations', size: 'full' });
    expect(byId('en.w1.e.passage-1')).toEqual({ name: 'reading-passage', passageId: 'en-read-w1-1' });
    expect(byId('en.w1.f.speaking')).toEqual({ name: 'speaking', topicId: 'en.conditionals', focus: 'second-conditional' });
    expect(byId('en.w1.g.listening')).toEqual({ name: 'listening', focus: 'week1-test' });
    expect(byId('en.w1.g.mistakes')).toEqual({ name: 'mistakes', scope: 'week1' });
  });

  it('filtreleme: Past Perfect + Turkce->Ingilizce yalnizca o havuzu verir', () => {
    const pool = enContent.exercisesForSection('set.ppf.tr-en');
    expect(pool.length).toBeGreaterThanOrEqual(10);
    for (const exercise of pool) {
      expect(exercise.topicId).toBe('en.past-perfect');
      expect(exercise.type).toBe('free-text');
    }
    // Conditionals + Speaking + Second Conditional: yalnizca dogru istem havuzu
    const prompts = speakingPool({ topicId: 'en.conditionals', focus: 'second-conditional' });
    expect(prompts.length).toBeGreaterThanOrEqual(8);
    for (const prompt of prompts) {
      expect(prompt.topicTags).toContain('en.conditionals');
      expect(prompt.focusTags).toContain('second-conditional');
    }
    // For/Since dikte havuzu yalnizca dikte + for-since
    for (const item of listeningPool({ topicId: 'en.present-perfect', kind: 'dictation', focus: 'for-since' })) {
      expect(item.kind).toBe('dictation');
      expect(item.focusTags).toContain('for-since');
    }
  });

  it('bolum pratikleri yeterli havuza sahip', () => {
    expect(enContent.exercisesForSection('present-perfect.for-since').length).toBeGreaterThanOrEqual(8);
    expect(enContent.exercisesForSection('present-perfect.v3').length).toBeGreaterThanOrEqual(8);
  });
});

describe('plan -> oturum: bolum/set havuzundan gercek soru kuyrugu', () => {
  it('her bolum/set aktivitesi yalnizca kendi havuzundan, tekrarsiz, 12 soruya kadar kuyruk kurar', () => {
    for (const activity of EN_WEEK_1_ACTIVITIES) {
      const link = activity.link;
      if (link.kind !== 'lesson' || link.mode !== 'section') continue;
      const pool = enContent.exercisesForSection(link.sectionId!);
      const plan = buildSessionPlan({
        pool,
        progress: createEmptyProgress(),
        mode: 'section',
        topicId: link.topicId,
        sectionId: link.sectionId,
        seed: `audit:${activity.id}`,
      });
      const ids = plan.primaryQueue.map((item) => item.exerciseId);
      expect(ids.length, activity.id).toBeGreaterThanOrEqual(Math.min(8, pool.length));
      expect(new Set(ids).size, `${activity.id} tekrar`).toBe(ids.length);
      const allowed = new Set(pool.map((e) => e.id));
      for (const id of ids) expect(allowed.has(id), `${activity.id} sizinti: ${id}`).toBe(true);
    }
  });

  it('farkli tohumlar farkli secki/sira uretir (sabit liste degil)', () => {
    const pool = enContent.exercisesForSection('set.ss.ordering');
    const queue = (seed: string) => buildSessionPlan({
      pool, progress: createEmptyProgress(), mode: 'section', topicId: 'en.sentence-structure', sectionId: 'set.ss.ordering', seed,
    }).primaryQueue.map((item) => item.exerciseId).join(',');
    const variants = new Set(['a', 'b', 'c', 'd', 'e'].map(queue));
    expect(variants.size).toBeGreaterThan(1);
  });

  it('yeni rotalar gidis-donus: konusma kapsami, kanit incelemesi, yeniden yazma, hafta hatalari', () => {
    const routes = [
      { name: 'speaking', topicId: 'en.present-perfect', kind: 'short-answer', focus: 'pp-personal', retry: true },
      { name: 'speaking', topicId: 'en.conditionals', focus: 'second-conditional' },
      { name: 'speaking', focus: 'week1-test' },
      { name: 'reading-passage', passageId: 'en-read-w1-1', view: 'review' },
      { name: 'reading-intro' },
      { name: 'reading-vocab' },
      { name: 'writing', taskId: 'en-write-w1-guided', stage: 'rewrite' },
      { name: 'mistakes', scope: 'week1' },
      { name: 'weekly-analysis' },
      { name: 'lesson', topicId: 'en.past-perfect', mode: 'section', sectionId: 'set.ppf.tr-en' },
      { name: 'lesson', topicId: 'en.past-perfect', mode: 'section', sectionId: 'set.ppf.tr-en', all: true },
      { name: 'listening-task', taskId: 'en-lx-decision' },
      { name: 'listening', kind: 'dictation', focus: 'mixed-dictation' },
      { name: 'speaking', focus: 'ppf-gi' },
    ] as const;
    for (const route of routes) expect(parseHash(hrefFor(route)), hrefFor(route)).toEqual(route);
    // set kimligi yalnizca kendi konusunda gecerli; baska konuda sessizce konuya duser
    expect(parseHash('#/ders/conditionals/bolum/set.ppf.tr-en')).toEqual({ name: 'topic', topicId: 'en.conditionals' });
    // ozet rotasi set kabul etmez
    expect(parseHash('#/ozet/past-perfect/set.ppf.tr-en')).toEqual({ name: 'summary', topicId: 'en.past-perfect' });
    // bilinmeyen dis dinleme gorevi cokmeden genel dinlemeye duser
    expect(parseHash('#/dinleme/gorev/yok')).toEqual({ name: 'listening' });
    // gecersiz odak dusurulur
    expect(parseHash('#/konusma/odak/bogus')).toEqual({ name: 'speaking' });
  });
});
