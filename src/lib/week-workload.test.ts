import { describe, expect, it } from 'vitest';
import {
  EN_WEEK_1_ACTIVITIES, EN_WEEK_1_CORE, EN_WEEK_1_MINUTES, EN_WEEK_1_MINUTES_TYPICAL, EN_WEEK_1_PLAN,
} from '../content/en/skills-weekly';
import { EN_EXTERNAL_LISTENING, estimatedMediaSeconds } from '../content/en/skills-listening-external';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import { allExercises } from './content';
import {
  EXERCISE_SECONDS, PACES, displayRange, exerciseQueueWorkload, lessonPoolFor, lessonQueueFor, modelWorkload, summaryWordCount,
} from './week-workload';
import { hrefFor, parseHash } from './router';
import { routeForWeekLink } from './week-destination';
import { weekReviewPool } from './week-review';
import { createEmptyProgress } from './storage';
import { semanticPolicyFor } from './semantic/policy';

/**
 * Kimlikler kalıcıdır: öğrencinin işaretleri bu kimliklere bağlıdır. Bir
 * kimliği yeniden adlandırmak için `WEEK_ACTIVITY_MIGRATION`a eşleme ekle
 * VE bu listeyi güncelle.
 */
const STABLE_IDS = [
  'en.w1.a.summary', 'en.w1.a.recognition', 'en.w1.a.v3', 'en.w1.a.forsince', 'en.w1.a.production', 'en.w1.a.errors',
  'en.w1.a.dictation', 'en.w1.a.listening', 'en.w1.a.speaking', 'en.w1.a.writing-1', 'en.w1.a.writing-2',
  'en.w1.b.short', 'en.w1.b.v3', 'en.w1.b.mixed-dictation', 'en.w1.b.listening-skills', 'en.w1.b.work-life',
  'en.w1.b.shadowing', 'en.w1.b.read-aloud', 'en.w1.b.personal', 'en.w1.b.retry', 'en.w1.b.long-turn', 'en.w1.b.mini',
  'en.w1.c.summary', 'en.w1.c.recognition', 'en.w1.c.ordering', 'en.w1.c.tr-en', 'en.w1.c.questions', 'en.w1.c.expansion',
  'en.w1.c.errors', 'en.w1.c.listening', 'en.w1.c.writing', 'en.w1.c.rewrite', 'en.w1.c.routine',
  'en.w1.d.pp-summary', 'en.w1.d.contrast', 'en.w1.d.timeline-build', 'en.w1.d.pp-tr-en', 'en.w1.d.gi-summary',
  'en.w1.d.patterns', 'en.w1.d.gi-build', 'en.w1.d.gi-production', 'en.w1.d.errors', 'en.w1.d.speaking', 'en.w1.d.writing', 'en.w1.d.mixed',
  'en.w1.e.intro', 'en.w1.e.passage-1', 'en.w1.e.evidence', 'en.w1.e.passage-2', 'en.w1.e.evidence-2', 'en.w1.e.vocab-extract',
  'en.w1.e.talk', 'en.w1.e.response', 'en.w1.e.listening', 'en.w1.e.collocations', 'en.w1.e.mixed', 'en.w1.e.chunk-writing',
  'en.w1.f.cond-summary', 'en.w1.f.structure', 'en.w1.f.tr-en', 'en.w1.f.errors', 'en.w1.f.speaking', 'en.w1.f.listening',
  'en.w1.f.prep-summary', 'en.w1.f.recognition', 'en.w1.f.production', 'en.w1.f.prep-errors', 'en.w1.f.writing', 'en.w1.f.hypotheticals',
  'en.w1.g.weak', 'en.w1.g.grammar', 'en.w1.g.vocab', 'en.w1.g.reading', 'en.w1.g.listening', 'en.w1.g.listening-test',
  'en.w1.g.writing', 'en.w1.g.speaking', 'en.w1.g.analysis', 'en.w1.g.mistakes',
];

describe('hafta 1 envanteri', () => {
  it('aktivite kimlikleri kararlıdır (sessiz yeniden adlandırma yok)', () => {
    expect(EN_WEEK_1_ACTIVITIES.map((a) => a.id)).toEqual(STABLE_IDS);
  });

  it('her satırda beceri, aile, beklenen çıktı ve tamamlanma ölçütü var', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      expect(a.skill, a.id).toBeTruthy();
      expect(a.family, a.id).toBeTruthy();
      expect(a.output.length, a.id).toBeGreaterThanOrEqual(8);
      expect(a.completion.length, a.id).toBeGreaterThan(10);
      // tamamlanma ölçütü süre/bekleme değil, iştir
      expect(a.completion, a.id).not.toMatch(/dakika|dk\b|süre dol|bekle/i);
    }
  });

  it('her aktivitenin içeriği gerçek ve ulaşılabilir; rota gidiş-dönüşü aynı', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      expect(a.workload.reachable, `${a.id} içerik yok`).toBe(true);
      expect(a.workload.items, a.id).toBeGreaterThan(0);
      const route = routeForWeekLink(a.link);
      if (route) expect(parseHash(hrefFor(route)), a.id).toEqual(route);
    }
  });

  it('her beceri haftada yer alır; üretim becerileri (dinleme/konuşma/yazma) haftanın en az %40’ı', () => {
    const bySkill = new Map<string, number>();
    for (const a of EN_WEEK_1_CORE) bySkill.set(a.skill, (bySkill.get(a.skill) ?? 0) + a.workload.seconds.fast);
    for (const skill of ['Grammar', 'Listening', 'Speaking', 'Writing', 'Reading', 'Vocabulary', 'Review']) {
      expect(bySkill.get(skill) ?? 0, skill).toBeGreaterThan(0);
    }
    const total = [...bySkill.values()].reduce((x, y) => x + y, 0);
    const active = (bySkill.get('Listening') ?? 0) + (bySkill.get('Speaking') ?? 0) + (bySkill.get('Writing') ?? 0);
    expect(active / total).toBeGreaterThanOrEqual(0.4);
    // Okuma zaten güçlü: haftanın küçük bir payı
    expect((bySkill.get('Reading') ?? 0) / total).toBeLessThanOrEqual(0.1);
  });
});

describe('süre dökümü bütünlüğü', () => {
  it('toplam = bileşenlerin toplamı; hızlı ≤ tipik ≤ yavaş', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      expect(a.workload.components.length, a.id).toBeGreaterThan(0);
      for (const pace of PACES) {
        const sum = a.workload.components.reduce((n, c) => n + c.seconds[pace], 0);
        expect(a.workload.seconds[pace], `${a.id} ${pace}`).toBeCloseTo(sum, 5);
      }
      expect(a.workload.seconds.fast, a.id).toBeLessThanOrEqual(a.workload.seconds.typical);
      expect(a.workload.seconds.typical, a.id).toBeLessThanOrEqual(a.workload.seconds.slow);
      for (const c of a.workload.components) expect(c.units, `${a.id} ${c.label}`).toBeGreaterThan(0);
    }
  });

  it('gösterilen tahmin modelin desteklediğinden büyük olamaz (4 dk’lık iş 25 dk yazılamaz)', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      const { low, high, label } = displayRange(a.workload.seconds);
      expect(a.duration, a.id).toBe(label);
      // alt uç hızlı profile, üst uç tipik profile yuvarlanır (en fazla 2,5 dk sapma)
      expect(Math.abs(low - a.workload.seconds.fast / 60), `${a.id} alt`).toBeLessThanOrEqual(2.5);
      expect(Math.abs(high - a.workload.seconds.typical / 60), `${a.id} üst`).toBeLessThanOrEqual(2.5);
      // yavaş profil süreyi haklı çıkarmak için kullanılmaz
      expect(high, a.id).toBeLessThanOrEqual(Math.ceil(a.workload.seconds.typical / 60) + 2);
    }
  });

  it('ders aktivitelerinin süresi GERÇEK kuyruktan gelir: kuyruk = havuzun tamamı', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      if (a.link.kind !== 'lesson') continue;
      const pool = lessonPoolFor(a.link);
      const queue = lessonQueueFor(a.link);
      expect(a.link.all, `${a.id} tüm havuz`).toBe(true);
      expect(queue.length, a.id).toBe(new Set(pool.map((e) => e.id)).size);
      expect(a.workload.items, a.id).toBe(queue.length);
      expect(queue.length, `${a.id} en az 10 soru`).toBeGreaterThanOrEqual(10);
      const expected = exerciseQueueWorkload(queue).reduce((n, c) => n + c.seconds.fast, 0);
      expect(a.workload.seconds.fast, a.id).toBeCloseTo(expected, 5);
    }
  });

  it('hiçbir soru iki ders aktivitesinde sayılmaz (ayrık setler)', () => {
    const owner = new Map<string, string>();
    for (const a of EN_WEEK_1_ACTIVITIES) {
      if (a.link.kind !== 'lesson') continue;
      for (const exercise of lessonPoolFor(a.link)) {
        expect(owner.get(exercise.id), `${exercise.id}: ${owner.get(exercise.id)} + ${a.id}`).toBeUndefined();
        owner.set(exercise.id, a.id);
      }
    }
    // çekirdek + ek birlikte ders havuzunun büyük kısmını kapsar; kalan (sesli cevaplar) karışık tekrarlara kalır
    expect(owner.size / EN_LESSON_EXERCISES.length).toBeGreaterThanOrEqual(0.9);
  });

  it('birim süreler öğrencinin bildirdiği hızlı aralıklarla uyumlu', () => {
    expect(EXERCISE_SECONDS['multiple-choice'].fast).toBeLessThanOrEqual(15);
    expect(EXERCISE_SECONDS['ordering'].fast).toBeGreaterThanOrEqual(20);
    expect(EXERCISE_SECONDS['ordering'].fast).toBeLessThanOrEqual(50);
    for (const type of ['free-text', 'error-correction'] as const) {
      expect(EXERCISE_SECONDS[type].fast).toBeGreaterThanOrEqual(30);
      expect(EXERCISE_SECONDS[type].typical).toBeLessThanOrEqual(90);
    }
  });

  it('özet süresi gerçek uzunluktan gelir: kısa özet uzun gösterilmez', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      if (a.link.kind !== 'summary') continue;
      const words = summaryWordCount(a.link.topicId);
      expect(words, a.id).toBeGreaterThan(100);
      // en hızlı okuma: 170 kelime/dk + bölüm başına kısa geri çağırma
      expect(a.workload.seconds.fast / 60, a.id).toBeLessThanOrEqual(words / 170 + a.workload.items * 0.25 + 0.01);
    }
  });

  it('yazma süresi kelime hedefiyle, konuşma süresi istem sayısıyla ölçeklenir', () => {
    const w1 = modelWorkload({ kind: 'writing', taskId: 'en-write-1' }).seconds.fast;
    const wt = modelWorkload({ kind: 'writing', taskId: 'en-write-wt-1' }).seconds.fast;
    expect(wt).toBeGreaterThan(w1);
    const draft = modelWorkload({ kind: 'writing', taskId: 'en-write-w1-guided', draftOnly: true }).seconds.fast;
    const rewrite = modelWorkload({ kind: 'writing', taskId: 'en-write-w1-guided', stage: 'rewrite' }).seconds.fast;
    const full = modelWorkload({ kind: 'writing', taskId: 'en-write-w1-guided' }).seconds.fast;
    // taslak + yeniden yazma ayrı aktivitedir: aynı iş iki kez sayılmaz
    expect(draft + rewrite).toBeCloseTo(full, 5);
    const personal = modelWorkload({ kind: 'speaking', topicId: 'en.present-perfect', speakKind: 'short-answer', focus: 'pp-personal' });
    expect(personal.items).toBe(14);
    expect(personal.seconds.fast / personal.items).toBeGreaterThanOrEqual(60);
  });
});

describe('oturum ve hafta toplamları', () => {
  it('hafta toplamı = oturum toplamları = çekirdek aktivite toplamları', () => {
    expect(EN_WEEK_1_MINUTES).toBe(EN_WEEK_1_PLAN.reduce((n, s) => n + s.minutes, 0));
    expect(EN_WEEK_1_MINUTES).toBe(EN_WEEK_1_CORE.reduce((n, a) => n + a.minutes, 0));
    expect(EN_WEEK_1_MINUTES_TYPICAL).toBe(EN_WEEK_1_CORE.reduce((n, a) => n + a.minutesTypical, 0));
  });

  it('HIZLI öğrencinin çekirdek iş yükü 15–20 saat (ek pratik hariç)', () => {
    const fastHours = EN_WEEK_1_CORE.reduce((n, a) => n + a.workload.seconds.fast, 0) / 3600;
    expect(fastHours).toBeGreaterThanOrEqual(15);
    expect(fastHours).toBeLessThanOrEqual(20);
    // hedef, yavaş profile yaslanarak tutturulmuş değildir
    const typicalHours = EN_WEEK_1_CORE.reduce((n, a) => n + a.workload.seconds.typical, 0) / 3600;
    expect(typicalHours).toBeGreaterThan(fastHours);
  });

  it('ek pratik gerçekten ektir: çekirdek toplamı ek olmadan hedefi tutar', () => {
    const extra = EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'extra');
    expect(extra.length).toBeGreaterThan(0);
    expect(EN_WEEK_1_MINUTES).toBeGreaterThanOrEqual(15 * 60);
    for (const a of extra) expect(EN_WEEK_1_CORE.includes(a)).toBe(false);
  });
});

describe('dış dinleme kaynakları (ağ çağrısı yok: yapı denetimi)', () => {
  it('her kaynak tam akışa sahip ve bir aktiviteye bağlı', () => {
    const linked = new Set(EN_WEEK_1_ACTIVITIES.flatMap((a) => (a.link.kind === 'listening-task' ? [a.link.taskId] : [])));
    expect(EN_EXTERNAL_LISTENING.length).toBeGreaterThanOrEqual(7);
    for (const task of EN_EXTERNAL_LISTENING) {
      expect(linked.has(task.id), `${task.id} planda yok`).toBe(true);
      expect(task.url, task.id).toMatch(/^https:\/\/learnenglish\.britishcouncil\.org\/free-resources\/listening\/b1\/[a-z-]+$/);
      expect(task.verifiedOn, task.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(task.prep.length, task.id).toBeGreaterThanOrEqual(2);
      expect(task.gist.length, task.id).toBeGreaterThanOrEqual(2);
      expect(task.detail.length, task.id).toBeGreaterThanOrEqual(8);
      expect(task.chunks.length, task.id).toBeGreaterThanOrEqual(5);
      expect(task.speaking.points.length, task.id).toBeGreaterThanOrEqual(3);
      expect(task.writing.minWords, task.id).toBeGreaterThanOrEqual(50);
      const ids = [...task.gist, ...task.detail].map((q) => q.id);
      expect(new Set(ids).size, task.id).toBe(ids.length);
      for (const q of [...task.gist, ...task.detail]) {
        if (q.options) {
          expect(q.options, q.id).toContain(q.answer);
          expect(new Set(q.options).size, `${q.id} kopya seçenek`).toBe(q.options.length);
        }
        if (q.type === 'mc') expect(q.options!.length, q.id).toBe(4);
        expect(q.explanation.length, q.id).toBeGreaterThan(10);
      }
    }
  });

  it('süre uydurulmaz: sayfada yoksa null kalır ve tahmin transkript uzunluğundan gelir', () => {
    for (const task of EN_EXTERNAL_LISTENING) {
      if (task.mediaSeconds === null) {
        expect(estimatedMediaSeconds(task), task.id).toBe(Math.round((task.transcriptWords / 150) * 60));
      } else {
        expect(estimatedMediaSeconds(task), task.id).toBe(task.mediaSeconds);
      }
      const workload = modelWorkload({ kind: 'listening-task', taskId: task.id });
      expect(workload.mediaUrl).toBe(task.url);
      expect(workload.mediaVerified).toBe(task.mediaSeconds !== null);
      // dinlemenin kendisi akışın küçük bir parçası: süre soru/konuşma/yazma işinden gelir
      const listening = workload.components.filter((c) => c.unit === 'sn ses').reduce((n, c) => n + c.seconds.fast, 0);
      expect(listening / workload.seconds.fast, task.id).toBeLessThan(0.5);
    }
  });
});

describe('dil yalıtımı, rastgelelik ve Jev', () => {
  it('İngilizce plan Almanca içeriğe dokunmaz', () => {
    const germanIds = new Set(allExercises.map((e) => e.id));
    expect(germanIds.size).toBeGreaterThan(0);
    for (const e of EN_LESSON_EXERCISES) expect(germanIds.has(e.id), e.id).toBe(false);
    for (const a of EN_WEEK_1_ACTIVITIES) {
      if (a.link.kind === 'lesson') for (const e of lessonPoolFor(a.link)) expect(e.topicId.startsWith('en.'), e.id).toBe(true);
    }
  });

  it('tüm havuz oturumunda sıra tohuma göre değişir ama içerik aynıdır', () => {
    const link = EN_WEEK_1_ACTIVITIES.find((a) => a.id === 'en.w1.c.tr-en')!.link;
    if (link.kind !== 'lesson') throw new Error('beklenmeyen bağlantı');
    const base = lessonQueueFor(link).map((e) => e.id);
    expect(new Set(base).size).toBe(base.length);
    const a = weekReviewPool('g-grammar', createEmptyProgress(), EN_LESSON_EXERCISES, 'seed-a').map((e) => e.id);
    const b = weekReviewPool('g-grammar', createEmptyProgress(), EN_LESSON_EXERCISES, 'seed-b').map((e) => e.id);
    expect(a.length).toBe(72);
    expect(a.join()).not.toBe(b.join());
  });

  it('haftalık gramer tekrarı: doğru çözülmüş sorular geri plana, görülmemiş/yanlışlar öne', () => {
    const progress = createEmptyProgress();
    const pp = EN_LESSON_EXERCISES.filter((e) => e.topicId === 'en.present-perfect' && !['spoken', 'dictation', 'listen-choice'].includes(e.type));
    const solved = new Set(pp.slice(0, pp.length - 12).map((e) => e.id));
    for (const id of solved) {
      progress.exercises[id] = { ...(progress.exercises[id] ?? {}), attempts: [{ result: 'correct', at: 'x' }], correctCount: 1, incorrectCount: 0, typoCount: 0 } as never;
    }
    const picked = weekReviewPool('g-grammar', progress, EN_LESSON_EXERCISES, 's').filter((e) => e.topicId === 'en.present-perfect');
    expect(picked.length).toBe(12);
    for (const e of picked) expect(solved.has(e.id), e.id).toBe(false);
  });

  it('uzun oturumlar gereksiz Jev isteği doğurmaz: tanıma türleri deterministiktir', () => {
    for (const a of EN_WEEK_1_ACTIVITIES) {
      if (a.link.kind !== 'lesson') continue;
      for (const e of lessonPoolFor(a.link)) {
        if (e.type === 'multiple-choice' || e.type === 'matching' || e.type === 'ordering' || e.type === 'listen-choice') {
          expect(semanticPolicyFor(e).enabled, e.id).toBe(false);
        }
      }
    }
  });
});
