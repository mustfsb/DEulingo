/**
 * Hafta 1 iş yükü modeli — süreler ELLE YAZILMAZ, içerikten türetilir.
 *
 * Her aktivite için: hedefindeki GERÇEK içerik sayılır (kurulacak soru
 * kuyruğu, pasajın kelime sayısı, dinleme parçaları, yazma kelime hedefi…)
 * ve her iş birimi üç öğrenci profilinin birim süresiyle çarpılır:
 *
 *   fast    — arayüze alışkın, B1 gramerinin bir kısmını bilen hızlı öğrenci
 *             (birincil ölçüt: planın 15–20 saat hedefi BU profile göre sınanır)
 *   typical — ortalama B1- öğrenci
 *   slow    — yavaş / çok dikkatli çalışan öğrenci (süre gerekçesi DEĞİLDİR)
 *
 * Birim süreler ÖLÇÜM DEĞİL, başlangıç varsayımıdır (öğrencinin bildirdiği
 * aralıklar: kolay çoktan seçmeli 5–15 sn, sıralama 20–50 sn, Türkçe→İngilizce
 * üretim 30–90 sn, hata düzeltme 30–90 sn). Gerçek kullanım `study-time`
 * ile ölçülür ve `week-calibration` tahminleri kişiye göre düzeltir.
 *
 * Bu dosya `content/en/skills-weekly` tarafından yüklenir; döngü olmaması
 * için oradan yalnızca TİP alır.
 */

import type { Exercise, ExerciseType } from '../content/types';
import type { WeekLink } from '../content/en/skills-weekly';
import { EN_LESSON_EXERCISES } from '../content/en/index';
import { exercisesForPracticeSet, isPracticeSetId } from '../content/en/practice-sets';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { EN_WRITING_BY_ID } from '../content/en/skills-writing';
import { listeningPool, type ListeningItem } from '../content/en/skills-listening';
import { EN_EXTERNAL_LISTENING_BY_ID, estimatedMediaSeconds } from '../content/en/skills-listening-external';
import { speakingPool, type SpeakingPrompt } from '../content/en/skills-speaking';
import { EN_PRESENT_PERFECT_SUMMARY } from '../content/en/summary';
import {
  EN_CONDITIONALS_SUMMARY, EN_GERUND_SUMMARY, EN_PAST_PERFECT_SUMMARY, EN_PREPOSITIONS_SUMMARY, EN_SENTENCE_STRUCTURE_SUMMARY,
} from '../content/en/summaries-new';
import { EN_VOCABULARY } from '../content/en/vocab';
import { buildSessionPlan } from './session';
import { createEmptyProgress } from './storage';
import { buildVocabSession } from './vocab/questions';
import { WEEK_REVIEW_META, weekReviewPool } from './week-review';

export type Pace = 'fast' | 'typical' | 'slow';
export const PACES: Pace[] = ['fast', 'typical', 'slow'];
export type Triple = Record<Pace, number>;

export interface WorkloadComponent {
  /** "Türkçe → İngilizce üretim", "1. dinleme"… */
  label: string;
  /** İş birimi sayısı (soru, kelime, saniye…). */
  units: number;
  unit: string;
  /** Bu bileşenin toplam süresi (saniye). */
  seconds: Triple;
}

export interface Workload {
  components: WorkloadComponent[];
  /** Toplam (saniye). */
  seconds: Triple;
  /** Öğrencinin gördüğü ana öğe sayısı (soru / parça / istem / kelime). */
  items: number;
  itemLabel: string;
  /** İçerik gerçekten var ve ulaşılabilir mi? */
  reachable: boolean;
  /** Dış medya (varsa). `mediaVerified=false` → süre tahmindir. */
  mediaUrl?: string;
  mediaSeconds?: number;
  mediaVerified?: boolean;
  /** Süre öğrencinin geçmişine bağlıysa (hata tekrarı gibi) true. */
  variable?: boolean;
}

const t = (fast: number, typical: number, slow: number): Triple => ({ fast, typical, slow });
const scale = (per: Triple, units: number): Triple => ({ fast: per.fast * units, typical: per.typical * units, slow: per.slow * units });
const sum = (parts: Triple[]): Triple => parts.reduce((acc, p) => ({ fast: acc.fast + p.fast, typical: acc.typical + p.typical, slow: acc.slow + p.slow }), t(0, 0, 0));

/* ------------------------------------------------------------------ */
/* Birim süreler (saniye) — soruyu okuma + cevap + geri bildirimi okuma */
/* ------------------------------------------------------------------ */

export const EXERCISE_SECONDS: Record<ExerciseType, Triple> = {
  'multiple-choice': t(11, 18, 30),
  'fill-blank': t(15, 24, 40),
  'listen-choice': t(17, 26, 40),
  matching: t(24, 38, 60),
  ordering: t(26, 40, 62),
  'word-bank-translation': t(28, 42, 66),
  'sentence-builder': t(28, 42, 66),
  dictation: t(34, 52, 82),
  spoken: t(28, 42, 65),
  'error-correction': t(36, 56, 90),
  'free-text': t(40, 62, 98),
};

const EXERCISE_LABEL: Record<ExerciseType, string> = {
  'multiple-choice': 'Çoktan seçmeli (tanıma)',
  'fill-blank': 'Boşluk doldurma',
  'listen-choice': 'Dinle + seç',
  matching: 'Eşleştirme',
  ordering: 'Cümle sıralama',
  'word-bank-translation': 'Kutucukla çeviri',
  'sentence-builder': 'Cümle kurma',
  dictation: 'Dikte',
  spoken: 'Sesli cevap',
  'error-correction': 'Hata düzeltme',
  'free-text': 'Serbest yazım (Türkçe → İngilizce / kişisel cümle)',
};

/** Yanlış cevaplar oturum içinde yeniden sorulur: beklenen ek sunum oranı. */
export const RETRY_RATE: Triple = t(0.08, 0.16, 0.24);

/** Dikkatli okuma hızı (kelime/dk): Türkçe açıklamalı özet · İngilizce pasaj. */
const SUMMARY_WPM: Triple = t(170, 130, 95);
const PASSAGE_WPM: Triple = t(170, 135, 100);
/** L2'de düşünerek yazma (kelime/dk) ve düzelterek yeniden yazma. */
const DRAFT_WPM: Triple = t(11, 8, 5.5);
const REWRITE_WPM: Triple = t(17, 12, 8);

const READING_Q_SECONDS: Record<string, Triple> = {
  'multiple-choice': t(30, 45, 70),
  'true-false-notgiven': t(35, 52, 80),
  'matching-headings': t(40, 60, 90),
  'sentence-completion': t(30, 45, 70),
  'short-answer': t(35, 52, 80),
};

const perMinute = (words: number, wpm: Triple): Triple => ({
  fast: (words / wpm.fast) * 60, typical: (words / wpm.typical) * 60, slow: (words / wpm.slow) * 60,
});

function finish(components: WorkloadComponent[], items: number, itemLabel: string, extra: Partial<Workload> = {}): Workload {
  const kept = components.filter((c) => c.units > 0);
  return { components: kept, seconds: sum(kept.map((c) => c.seconds)), items, itemLabel, reachable: items > 0, ...extra };
}

/* ------------------------------------------------------------------ */
/* Alıştırma oturumları                                                */
/* ------------------------------------------------------------------ */

/** Bir soru kuyruğunun türlere göre iş yükü (+ beklenen yanlış tekrarları). */
export function exerciseQueueWorkload(queue: readonly Exercise[]): WorkloadComponent[] {
  const byType = new Map<ExerciseType, number>();
  for (const exercise of queue) byType.set(exercise.type, (byType.get(exercise.type) ?? 0) + 1);
  const components: WorkloadComponent[] = [...byType].map(([type, count]) => ({
    label: EXERCISE_LABEL[type], units: count, unit: 'soru', seconds: scale(EXERCISE_SECONDS[type], count),
  }));
  const base = sum(components.map((c) => c.seconds));
  if (queue.length) {
    components.push({
      label: 'Yanlışların oturum içi tekrarı (beklenen)', units: queue.length, unit: 'soru',
      seconds: { fast: base.fast * RETRY_RATE.fast, typical: base.typical * RETRY_RATE.typical, slow: base.slow * RETRY_RATE.slow },
    });
  }
  return components;
}

const byId = new Map(EN_LESSON_EXERCISES.map((exercise) => [exercise.id, exercise]));

/** Haftalık plandaki bir ders bağlantısının havuzu (ekranla AYNI kural). */
export function lessonPoolFor(link: Extract<WeekLink, { kind: 'lesson' }>): Exercise[] {
  if (link.mode === 'section' && link.sectionId) {
    return isPracticeSetId(link.sectionId)
      ? exercisesForPracticeSet(link.sectionId, EN_LESSON_EXERCISES)
      : EN_LESSON_EXERCISES.filter((exercise) => exercise.sectionId === link.sectionId);
  }
  return EN_LESSON_EXERCISES.filter((exercise) => exercise.topicId === link.topicId);
}

/** Bu bağlantıyla GERÇEKTEN kurulacak kuyruk (boş ilerleme, sabit tohum). */
export function lessonQueueFor(link: Extract<WeekLink, { kind: 'lesson' }>): Exercise[] {
  const pool = lessonPoolFor(link);
  const plan = buildSessionPlan({
    pool, progress: createEmptyProgress(), mode: link.mode, topicId: link.topicId, sectionId: link.sectionId,
    seed: 'workload', ...(link.all ? { size: pool.length } : {}),
  });
  return plan.primaryQueue.map((item) => byId.get(item.exerciseId)!).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Dinleme / konuşma / yazma / okuma                                   */
/* ------------------------------------------------------------------ */

/** TTS parçası: dinle (1–2 kez) + cevapla + transkripti/kanıtı oku. */
const LISTENING_ITEM_SECONDS: Record<ListeningItem['kind'], Triple> = {
  mc: t(20, 30, 46),
  meaning: t(20, 30, 46),
  'missing-word': t(24, 36, 56),
  short: t(30, 46, 70),
  ordering: t(38, 56, 85),
  dictation: t(42, 64, 100),
};

function listeningItemsWorkload(items: readonly ListeningItem[]): WorkloadComponent[] {
  const groups: Array<[string, (i: ListeningItem) => boolean]> = [
    ['Dinle + seç / anlam', (i) => i.kind === 'mc' || i.kind === 'meaning'],
    ['Dinle + eksik kelime / kısa cevap', (i) => i.kind === 'missing-word' || i.kind === 'short' || i.kind === 'ordering'],
    ['Dikte (tam cümle yaz)', (i) => i.kind === 'dictation'],
  ];
  return groups.map(([label, test]) => {
    const matched = items.filter(test);
    // Uzun cümleli dikte daha uzun sürer: 9 kelimeden sonrası kelime başına ek süre.
    const extraWords = matched.filter((i) => i.kind === 'dictation')
      .reduce((n, i) => n + Math.max(0, i.audioText.split(/\s+/).length - 9), 0);
    const seconds = sum([...matched.map((i) => LISTENING_ITEM_SECONDS[i.kind]), scale(t(2.5, 4, 6), extraWords)]);
    return { label, units: matched.length, unit: 'parça', seconds };
  });
}

/**
 * Konuşma istemi: hazırlık + kayıt + kaydı dinleme + öz değerlendirme.
 * Konuşma süresi istemin hedefinden (uzun konuşma) ya da referans cümlenin
 * uzunluğundan gelir; uydurma tekrar eklenmez.
 */
function speakingPromptSeconds(prompt: SpeakingPrompt): Triple {
  const refWords = (prompt.reference ?? '').split(/\s+/).filter(Boolean).length;
  if (prompt.kind === 'shadowing') {
    const say = Math.max(3, refWords / 2.5);
    // referansı 2 kez dinle + söyle/kaydet + kaydı dinle + değerlendir
    return t(say * 4 + 12, say * 5 + 20, say * 6 + 34);
  }
  if (prompt.kind === 'read-aloud') {
    const say = Math.max(3, refWords / 2.3);
    return t(say * 3 + 10, say * 3.5 + 18, say * 4.5 + 30);
  }
  if (prompt.kind === 'topic') {
    const speak = prompt.seconds ?? 60;
    // not hazırla + konuş + kaydın tamamını dinle + noktaları kontrol et
    return t(60 + speak * 2 + 25, 100 + speak * 2.1 + 40, 160 + speak * 2.3 + 60);
  }
  // short-answer / ielts-part1: 2–3 cümlelik cevap
  return t(25 + 25 * 2 + 12, 40 + 32 * 2 + 20, 65 + 40 * 2 + 32);
}

/** Zayıf bulunan cevapların yeniden kaydı (beklenen oran). */
const SPEAKING_REDO: Triple = t(0.25, 0.35, 0.45);

function speakingWorkload(prompts: readonly SpeakingPrompt[], retryOnly: boolean): WorkloadComponent[] {
  const label: Record<SpeakingPrompt['kind'], string> = {
    shadowing: 'Gölgeleme (dinle → tekrarla → kaydı dinle)',
    'read-aloud': 'Sesli okuma (kaydet → dinle)',
    'short-answer': 'Soruya 2–3 cümlelik sözlü cevap',
    'ielts-part1': 'IELTS Part 1 sorusu',
    topic: 'Uzun konuşma (not al → 1–2 dk konuş → dinle)',
  };
  if (retryOnly) {
    const redo = sum(prompts.map(speakingPromptSeconds));
    return [{
      label: '“Tekrar gerek” denen cevapları yeniden kaydet (beklenen pay)', units: prompts.length, unit: 'istem',
      seconds: { fast: redo.fast * SPEAKING_REDO.fast, typical: redo.typical * SPEAKING_REDO.typical, slow: redo.slow * SPEAKING_REDO.slow },
    }];
  }
  const kinds = [...new Set(prompts.map((p) => p.kind))];
  return kinds.map((kind) => {
    const matched = prompts.filter((p) => p.kind === kind);
    return { label: label[kind], units: matched.length, unit: 'istem', seconds: sum(matched.map(speakingPromptSeconds)) };
  });
}

function writingWorkload(taskId: string, stage: 'draft' | 'rewrite' | 'full'): WorkloadComponent[] {
  const task = EN_WRITING_BY_ID.get(taskId);
  if (!task) return [];
  const words = Math.round((task.minWords + task.maxWords) / 2);
  const draft: WorkloadComponent[] = [
    { label: 'İstemi anla + plan notu çıkar', units: 1, unit: 'plan', seconds: t(150, 270, 420) },
    { label: `Taslak yaz (~${words} kelime)`, units: words, unit: 'kelime', seconds: perMinute(words, DRAFT_WPM) },
    { label: 'Öz denetim (kontrol listesi)', units: task.checklist.length, unit: 'madde', seconds: scale(t(18, 28, 42), task.checklist.length) },
  ];
  const rewrite: WorkloadComponent[] = [
    { label: 'Geri bildirimi oku, hataları işaretle', units: 1, unit: 'inceleme', seconds: t(90, 170, 260) },
    { label: `Düzelterek yeniden yaz (~${words} kelime)`, units: words, unit: 'kelime', seconds: perMinute(words, REWRITE_WPM) },
    { label: 'Taslak ↔ yeniden yazma ↔ örnek cevap karşılaştır', units: 1, unit: 'karşılaştırma', seconds: t(90, 150, 240) },
  ];
  return stage === 'draft' ? draft : stage === 'rewrite' ? rewrite : [...draft, ...rewrite];
}

/** Soruları cevaplarken pasaja geri dönüp tarama payı. */
const SCAN_BACK = 1.3;
/** Kanıt incelemesinde beklenen yanlış oranı ve yanlış başına inceleme süresi. */
const READING_ERROR_RATE: Triple = t(0.25, 0.35, 0.45);

function readingWorkload(passageId: string, view?: 'review'): WorkloadComponent[] {
  const passage = EN_READING_BY_ID.get(passageId);
  if (!passage) return [];
  if (view === 'review') {
    const n = passage.questions.length;
    return [
      { label: 'Tüm soruların kanıt cümlesini pasajda bul', units: n, unit: 'soru', seconds: scale(t(9, 14, 22), n) },
      {
        label: 'Yanlışların açıklamasını oku, nedenini not et (beklenen pay)', units: n, unit: 'soru',
        seconds: { fast: n * READING_ERROR_RATE.fast * 45, typical: n * READING_ERROR_RATE.typical * 70, slow: n * READING_ERROR_RATE.slow * 100 },
      },
    ];
  }
  const read = perMinute(passage.wordCount, PASSAGE_WPM);
  const types = [...new Set(passage.questions.map((q) => q.type))];
  return [
    { label: `Pasajı oku + sorularda geri tara (${passage.wordCount} kelime)`, units: passage.wordCount, unit: 'kelime', seconds: { fast: read.fast * SCAN_BACK, typical: read.typical * SCAN_BACK, slow: read.slow * SCAN_BACK } },
    ...types.map((type) => {
      const n = passage.questions.filter((q) => q.type === type).length;
      return { label: `Soru: ${type}`, units: n, unit: 'soru', seconds: scale(READING_Q_SECONDS[type], n) };
    }),
  ];
}

function externalListeningWorkload(taskId: string): { components: WorkloadComponent[]; extra: Partial<Workload>; items: number } {
  const task = EN_EXTERNAL_LISTENING_BY_ID.get(taskId);
  if (!task) return { components: [], extra: {}, items: 0 };
  const media = estimatedMediaSeconds(task);
  const speak = task.speaking.seconds;
  const words = Math.round((task.writing.minWords + task.writing.maxWords) / 2);
  const components: WorkloadComponent[] = [
    { label: 'Hazırlık soruları (tahmin et, not al)', units: task.prep.length, unit: 'soru', seconds: scale(t(20, 35, 55), task.prep.length) },
    { label: '1. dinleme (genel fikir) + sayfaya geçiş', units: media, unit: 'sn ses', seconds: t(media + 20, media + 30, media + 45) },
    { label: 'Genel fikir soruları', units: task.gist.length, unit: 'soru', seconds: scale(t(18, 28, 42), task.gist.length) },
    { label: '2. dinleme (not alarak, gerekirse durdurarak)', units: media, unit: 'sn ses', seconds: t(media * 1.15, media * 1.4, media * 1.8) },
    { label: 'Ayrıntı soruları + açıklamalar', units: task.detail.length, unit: 'soru', seconds: scale(t(26, 40, 62), task.detail.length) },
    { label: 'Transkriptle 3. dinleme: kaçırdıklarını bul', units: task.transcriptWords, unit: 'kelime', seconds: t(media + 45, media * 1.2 + 90, media * 1.5 + 150) },
    { label: 'Öbekleri incele, işine yarayanları kaydet', units: task.chunks.length, unit: 'öbek', seconds: scale(t(12, 20, 32), task.chunks.length) },
    { label: `Sözlü özet (not al → ~${speak} sn konuş → kaydı dinle)`, units: 1, unit: 'konuşma', seconds: t(75 + speak * 2 + 20, 120 + speak * 2.1 + 40, 180 + speak * 2.3 + 60) },
    { label: `Yazılı özet / görüş (~${words} kelime) + gözden geçirme`, units: words, unit: 'kelime', seconds: sum([perMinute(words, DRAFT_WPM), t(40, 70, 110)]) },
  ];
  return {
    components,
    items: task.gist.length + task.detail.length,
    extra: { mediaUrl: task.url, mediaSeconds: media, mediaVerified: task.mediaSeconds !== null },
  };
}

const SUMMARIES = new Map([
  EN_PRESENT_PERFECT_SUMMARY, EN_SENTENCE_STRUCTURE_SUMMARY, EN_PAST_PERFECT_SUMMARY, EN_GERUND_SUMMARY,
  EN_CONDITIONALS_SUMMARY, EN_PREPOSITIONS_SUMMARY,
].map((summary) => [summary.topicId, summary]));

/** Özetteki tüm metin (başlık, açıklama, örnek) — JSON anahtarları sayılmaz. */
export function summaryWordCount(topicId: string): number {
  const summary = SUMMARIES.get(topicId);
  if (!summary) return 0;
  let words = 0;
  const walk = (value: unknown, key?: string): void => {
    if (typeof value === 'string') {
      if (key !== 'id' && key !== 'topicId' && key !== 'conceptIds' && !/Id$/.test(key ?? '')) words += value.split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(value)) value.forEach((item) => walk(item, key));
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk(summary.sections);
  return words;
}

/* ------------------------------------------------------------------ */
/* Aktivite → iş yükü                                                  */
/* ------------------------------------------------------------------ */

export function modelWorkload(link: WeekLink): Workload {
  switch (link.kind) {
    case 'summary': {
      const words = summaryWordCount(link.topicId);
      const sections = SUMMARIES.get(link.topicId)?.sections.length ?? 0;
      return finish([
        { label: `Özeti örnekleriyle oku (${words} kelime)`, units: words, unit: 'kelime', seconds: perMinute(words, SUMMARY_WPM) },
        { label: 'Her bölümden bir örneği kapatıp kendin söyle (geri çağırma)', units: sections, unit: 'bölüm', seconds: scale(t(12, 20, 32), sections) },
      ], sections, 'bölüm');
    }
    case 'lesson': {
      const queue = lessonQueueFor(link);
      return finish(exerciseQueueWorkload(queue), queue.length, 'soru');
    }
    case 'review-set': {
      const pool = weekReviewPool(link.setId, createEmptyProgress(), EN_LESSON_EXERCISES, 'workload');
      const plan = buildSessionPlan({
        pool, progress: createEmptyProgress(), mode: 'gr-mixed', seed: 'workload',
        size: Math.min(WEEK_REVIEW_META[link.setId].size, pool.length),
      });
      const queue = plan.primaryQueue.map((item) => byId.get(item.exerciseId)!).filter(Boolean);
      return finish(exerciseQueueWorkload(queue), queue.length, 'soru', { variable: link.setId === 'g-weak' });
    }
    case 'review-mixed':
      return finish([{ label: 'Karışık Genel Tekrar', units: 28, unit: 'soru', seconds: scale(t(28, 44, 70), 28) }], 28, 'soru');
    case 'listening': {
      const pool = listeningPool({ topicId: link.topicId, kind: link.listenKind, focus: link.focus });
      return finish(listeningItemsWorkload(pool), pool.length, 'parça');
    }
    case 'listening-task': {
      const { components, extra, items } = externalListeningWorkload(link.taskId);
      return finish(components, items, 'soru', extra);
    }
    case 'speaking': {
      const pool = speakingPool({ topicId: link.topicId, kind: link.speakKind, focus: link.focus });
      return finish(speakingWorkload(pool, link.retry === true), pool.length, 'istem', { variable: link.retry === true });
    }
    case 'writing': {
      const stage = link.stage === 'rewrite' ? 'rewrite' : link.draftOnly ? 'draft' : 'full';
      const components = writingWorkload(link.taskId, stage);
      return finish(components, components.length ? 1 : 0, 'yazma görevi');
    }
    case 'reading':
      return finish([{ label: 'Serbest okuma', units: 1, unit: 'pasaj', seconds: t(300, 480, 720) }], 1, 'pasaj');
    case 'reading-intro':
      // Ekran: 3 ilke + True/False/Not Given açıklaması + 3 soruluk deneme (sabit içerik).
      return finish([
        { label: 'Soru türleri ve “Not Given” mantığını oku', units: 1, unit: 'giriş', seconds: t(120, 190, 290) },
        { label: 'Deneme soruları + açıklamalar', units: 3, unit: 'soru', seconds: scale(t(35, 52, 80), 3) },
      ], 4, 'adım');
    case 'reading-passage': {
      const passage = EN_READING_BY_ID.get(link.passageId);
      return finish(readingWorkload(link.passageId, link.view), passage?.questions.length ?? 0, 'soru');
    }
    case 'reading-vocab': {
      const count = [...EN_READING_BY_ID.values()]
        .filter((passage) => passage.weekRole === 'week1-passage-1' || passage.weekRole === 'week1-passage-2')
        .reduce((n, passage) => n + passage.vocab.length, 0);
      return finish([
        { label: 'Pasajlara dön, öbeği bağlamında bul, seç/kaydet', units: count, unit: 'öbek', seconds: scale(t(22, 34, 52), count) },
        { label: 'Seçtiklerinle birer cümle kur (sesli)', units: Math.min(8, count), unit: 'cümle', seconds: scale(t(18, 28, 44), Math.min(8, count)) },
      ], count, 'öbek');
    }
    case 'vocab-topic': {
      const questions = buildVocabSession({
        kind: link.study ?? 'topic', topicId: link.topicId, size: link.size ?? 'normal', seed: 'workload',
        progress: createEmptyProgress(), inventory: EN_VOCABULARY,
      });
      const per = link.study === 'flash' ? t(9, 14, 22) : link.study === 'type' ? t(18, 28, 44) : link.study === 'trde' ? t(14, 22, 34) : t(12, 19, 30);
      const label = link.study === 'flash' ? 'Kart: anlamı hatırla → çevir → kendini değerlendir'
        : link.study === 'type' ? 'Yazarak hatırla (Türkçe → İngilizce öbek)'
        : link.study === 'trde' ? 'Türkçe → İngilizce seç/yaz' : 'Karışık: anlam, öbek, eşleştirme, yazarak';
      return finish([
        { label, units: questions.length, unit: 'soru', seconds: scale(per, questions.length) },
        { label: 'Bilemediklerinin tekrarı (beklenen)', units: questions.length, unit: 'soru', seconds: { fast: questions.length * per.fast * 0.15, typical: questions.length * per.typical * 0.25, slow: questions.length * per.slow * 0.35 } },
      ], questions.length, 'soru');
    }
    case 'weekly-analysis':
      return finish([
        { label: 'Sekiz kategorideki hata dökümünü incele', units: 8, unit: 'kategori', seconds: scale(t(20, 32, 50), 8) },
        { label: 'En sık 3 hata kalıbı için birer doğru cümle yaz', units: 3, unit: 'cümle', seconds: scale(t(45, 70, 110), 3) },
      ], 8, 'kategori');
    case 'mistakes':
      // Havuz öğrencinin o haftaki hatalarına bağlıdır; model, hafta boyunca
      // görülen ~500 sorunun beklenen yanlış oranından bir alt sınır alır.
      return finish([
        { label: 'Aktif hataları yeniden çöz (beklenen ~20 soru)', units: 20, unit: 'soru', seconds: scale(t(32, 50, 80), 20) },
      ], 20, 'soru', { variable: true });
  }
}

/* ------------------------------------------------------------------ */
/* Gösterim                                                            */
/* ------------------------------------------------------------------ */

/** Saniye → dakika (en az 1). */
export const toMinutes = (seconds: number): number => Math.max(1, Math.round(seconds / 60));

/** 5'in katına yuvarlar; 10 dk altı için tam dakika. */
function niceMinutes(minutes: number): number {
  return minutes < 10 ? Math.max(1, Math.round(minutes)) : Math.round(minutes / 5) * 5;
}

/**
 * Gösterilen tahmin: hızlı–tipik aralığı ("20–30 dk"). Yavaş profil süreyi
 * haklı çıkarmak için kullanılmaz; yalnızca denetim tablosunda görünür.
 */
export function displayRange(seconds: Triple): { low: number; high: number; label: string } {
  const low = niceMinutes(seconds.fast / 60);
  const high = Math.max(low, niceMinutes(seconds.typical / 60));
  return { low, high, label: low === high ? `${low} dk` : `${low}–${high} dk` };
}
