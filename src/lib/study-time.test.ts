import { describe, expect, it } from 'vitest';
import {
  IDLE_LIMIT_MS, TICK_MAX_MS, allowAway, createClock, hideClock, interactClock, showClock, tickClock,
} from './study-time';
import {
  addActiveSeconds, emptySkills, loadSkills, migrateWeekActivities, saveSkills, startActivityTracking, stopActivityTracking,
  WEEK_ACTIVITY_MIGRATION,
} from './skills-storage';
import { EN_WEEK_1_ACTIVITIES, EN_WEEK_1_ACTIVITY_IDS, weekPlanProgress } from '../content/en/skills-weekly';
import { extensionFor, familyFactors, finishedEarly, flagFor, observations, personalMinutes } from './week-calibration';
import { routeForWeekLink } from './week-destination';

function memStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); }, clear: () => store.clear(), key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  } as Storage;
}

/** `seconds` boyunca 5 sn'lik tiklerle saati ilerletir; sayılan toplam ms. */
function run(clock: ReturnType<typeof createClock>, from: number, seconds: number, interactEvery?: number) {
  let state = clock;
  let total = 0;
  for (let s = 5; s <= seconds; s += 5) {
    const now = from + s * 1000;
    if (interactEvery && s % interactEvery === 0) {
      const ticked = tickClock(state, now);
      total += ticked.addMs;
      state = interactClock(ticked.state, now);
    } else {
      const ticked = tickClock(state, now);
      total += ticked.addMs;
      state = ticked.state;
    }
  }
  return { state, total };
}

describe('aktif çalışma saati', () => {
  it('etkileşimli çalışma tam sayılır', () => {
    const { total } = run(createClock(0), 0, 300, 20);
    expect(total).toBe(300_000);
  });

  it('kısa duraklama (okuma/düşünme) sayılır; uzun boşta kalma sayılmaz', () => {
    // 10 dk hiç etkileşim yok: yalnızca ilk IDLE_LIMIT sayılır
    const { total, state } = run(createClock(0), 0, 600);
    expect(total).toBe(IDLE_LIMIT_MS);
    // dönüşte sayaç boşluğu geri eklemez, bu andan devam eder
    const back = interactClock(state, 600_000);
    const next = tickClock(back, 605_000);
    expect(next.addMs).toBe(5_000);
  });

  it('arka plan sekmesi sayılmaz', () => {
    const hidden = hideClock(createClock(0), 10_000);
    expect(hidden.addMs).toBe(10_000);
    expect(tickClock(hidden.state, 500_000).addMs).toBe(0);
    const shown = showClock(tickClock(hidden.state, 500_000).state, 900_000);
    expect(shown.addMs).toBe(0);
  });

  it('dış dinleme: uzakta geçen süre en fazla tanınan pay kadar sayılır', () => {
    const away = hideClock(allowAway(createClock(0), 180_000), 5_000).state;
    // 2 dk dinleyip döndü → 2 dk
    expect(showClock(away, 125_000).addMs).toBe(120_000);
    // sekmeyi 1 saat açık bıraktı → yalnızca pay (3 dk)
    expect(showClock(away, 3_605_000).addMs).toBe(180_000);
    // pay tek kullanımlıktır
    const after = showClock(away, 125_000).state;
    expect(showClock(hideClock(after, 130_000).state, 400_000).addMs).toBe(0);
  });

  it('uyku / kısılmış zamanlayıcı tek tikte sınırlanır', () => {
    const state = interactClock(createClock(0), 0);
    expect(tickClock(state, 90_000).addMs).toBe(TICK_MAX_MS);
  });
});

describe('süre kaydı ve kalıcılık', () => {
  it('Git ölçümü başlatır; saniyeler yalnızca izlenen aktiviteye eklenir; plan dönüşü durdurur', () => {
    let state = emptySkills();
    expect(addActiveSeconds(state, 30)).toBe(state);
    state = startActivityTracking(state, 'en.w1.a.v3', 't0');
    state = addActiveSeconds(state, 40, 't1');
    state = addActiveSeconds(state, 25, 't2');
    expect(state.weekly.timing['en.w1.a.v3']).toEqual({ activeSeconds: 65, visits: 1, lastAt: 't2' });
    state = stopActivityTracking(state);
    expect(addActiveSeconds(state, 100).weekly.timing['en.w1.a.v3'].activeSeconds).toBe(65);
    // ikinci ziyaret süreyi biriktirir (sıfırlamaz)
    state = addActiveSeconds(startActivityTracking(state, 'en.w1.a.v3', 't3'), 10, 't4');
    expect(state.weekly.timing['en.w1.a.v3']).toEqual({ activeSeconds: 75, visits: 2, lastAt: 't4' });
    // süre tamamlanma DEĞİLDİR
    expect(state.weekly.completedActivities).toEqual([]);
  });

  it('yenilemede korunur; bozuk süre verisi güvenle atılır', () => {
    const storage = memStorage();
    let state = addActiveSeconds(startActivityTracking(emptySkills(), 'en.w1.b.personal'), 300);
    state = { ...state, listeningTasks: { 'en-lx-decision': { taskId: 'en-lx-decision', answers: { q: 'a' }, checked: { gist: true }, summary: 'x', updatedAt: 'u' } } };
    saveSkills(state, storage);
    const loaded = loadSkills(storage);
    expect(loaded.weekly.timing['en.w1.b.personal'].activeSeconds).toBe(300);
    expect(loaded.weekly.tracking).toBe('en.w1.b.personal');
    expect(loaded.listeningTasks['en-lx-decision']).toMatchObject({ answers: { q: 'a' }, checked: { gist: true, detail: false }, summary: 'x' });

    storage.setItem('almanca-alistirma:skills-en', JSON.stringify({
      weekly: { completedSessions: [], completedActivities: [], timing: { a: { activeSeconds: 'çok' }, b: null, c: { activeSeconds: -5 } }, tracking: 7 },
      listeningTasks: 'bozuk',
    }));
    const broken = loadSkills(storage);
    expect(broken.weekly.timing).toEqual({});
    expect(broken.weekly.tracking).toBeNull();
    expect(broken.listeningTasks).toEqual({});
  });
});

describe('tamamlanma işaretlerinin taşınması', () => {
  it('eşdeğer eski kimlikler yenisine taşınır; kutular silinmez', () => {
    const old = ['en.w1.a.summary', 'en.w1.a.lesson', 'en.w1.d.timeline', 'en.w1.d.production', 'en.w1.c.ordering', 'en.w1.g.reading'];
    const migrated = migrateWeekActivities(old);
    expect(migrated).toEqual(['en.w1.a.summary', 'en.w1.a.recognition', 'en.w1.d.timeline-build', 'en.w1.d.gi-production', 'en.w1.c.ordering', 'en.w1.g.reading']);
    expect(weekPlanProgress(migrated).done).toBe(6);
    // tekrar çalıştırmak güvenlidir, kopya üretmez
    expect(migrateWeekActivities([...migrated, 'en.w1.a.lesson'])).toEqual(migrated);
  });

  it('eşlemelerin hedefi planda var; kaynağı artık planda yok', () => {
    for (const [from, to] of Object.entries(WEEK_ACTIVITY_MIGRATION)) {
      expect(EN_WEEK_1_ACTIVITY_IDS.has(to), to).toBe(true);
      expect(EN_WEEK_1_ACTIVITY_IDS.has(from), from).toBe(false);
    }
  });

  it('yeni eklenen iş asla tamamlanmış sayılmaz; bilinmeyen eski kimlik silinmez', () => {
    const storage = memStorage();
    storage.setItem('almanca-alistirma:skills-en', JSON.stringify({
      reading: [], listening: [], writing: [], speaking: [],
      // b.dictation (for/since dikte) a.dictation ile aynı 13 cümleydi → oraya taşınır
      weekly: { completedSessions: [], completedActivities: ['en.w1.b.dictation', 'en.w1.f.structure', 'en.w1.x.eski'], updatedAt: 'x' },
    }));
    const loaded = loadSkills(storage);
    expect(loaded.weekly.completedActivities).toEqual(['en.w1.a.dictation', 'en.w1.f.structure', 'en.w1.x.eski']);
    expect(weekPlanProgress(loaded.weekly.completedActivities).done).toBe(2);
    const added = ['en.w1.b.mixed-dictation', 'en.w1.a.listening', 'en.w1.a.production', 'en.w1.g.listening-test'];
    for (const id of added) expect(loaded.weekly.completedActivities.includes(id), id).toBe(false);
  });
});

describe('kişisel kalibrasyon', () => {
  const grammar = EN_WEEK_1_ACTIVITIES.filter((a) => a.family === 'grammar-production' && a.tier === 'core');

  function withTimes(ratios: number[], complete = true) {
    const state = emptySkills();
    ratios.forEach((ratio, i) => {
      const a = grammar[i];
      state.weekly.timing[a.id] = { activeSeconds: Math.round(a.workload.seconds.fast * ratio), visits: 1, lastAt: 'x' };
      if (complete) state.weekly.completedActivities.push(a.id);
    });
    return state;
  }

  it('ölçüm yokken gözlem de katsayı da yoktur (uydurma veri yok)', () => {
    const state = emptySkills();
    expect(observations(state)).toEqual([]);
    expect(familyFactors(state).size).toBe(0);
    expect(personalMinutes(grammar[0], familyFactors(state))).toBeNull();
  });

  it('tek gözlem tahminleri değiştirmez; tek aşırı değer medyanı bozmaz', () => {
    expect(familyFactors(withTimes([0.3])).size).toBe(0);
    const factor = familyFactors(withTimes([1.0, 1.05, 0.95, 0.1])).get('grammar-production')!;
    expect(factor.samples).toBe(4);
    expect(factor.factor).toBeGreaterThan(0.9);
    expect(factor.factor).toBeLessThan(1.1);
  });

  it('sürekli hızlı bitiren öğrencide tahmin kısalır ama asla 0,4 katının altına inmez', () => {
    const state = withTimes([0.4, 0.42, 0.38, 0.4]);
    const factors = familyFactors(state);
    const factor = factors.get('grammar-production')!.factor;
    expect(factor).toBeLessThan(0.6);
    expect(factor).toBeGreaterThanOrEqual(0.4);
    const target = grammar[5];
    const personal = personalMinutes(target, factors)!;
    expect(personal).toBeLessThan(target.minutes);
    expect(observations(state)[0].flag).toBe('Belirgin fazla tahmin');
    expect(flagFor(1.0)).toBe('Uyumlu');
    expect(flagFor(2.1)).toBe('Eksik tahmin');
  });

  it('tamamlanmamış (yarım bırakılmış) aktiviteler kalibrasyona girmez', () => {
    expect(familyFactors(withTimes([0.2, 0.2, 0.2], false)).size).toBe(0);
  });

  it('erken bitirene zorlamadan “Daha fazla pratik” önerilir; hedefi gerçek bir rotadır', () => {
    const state = withTimes([0.4]);
    expect(finishedEarly(grammar[0], state)).toBe(true);
    expect(finishedEarly(grammar[1], state)).toBe(false);
    for (const a of EN_WEEK_1_ACTIVITIES) {
      const extension = extensionFor(a);
      if (!extension) continue;
      if (extension.link.kind !== 'review-mixed') expect(routeForWeekLink(extension.link), a.id).not.toBeNull();
    }
    // hız cezalandırılmaz: ilerleme ve işaretler değişmez
    expect(weekPlanProgress(state.weekly.completedActivities).done).toBe(1);
  });
});
