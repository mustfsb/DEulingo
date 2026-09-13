/**
 * Kelime soru üretici — kanonik envanterden sentetik alıştırmalar.
 *
 * TÜM soru hedefleri `VOCABULARY` içinden gelir (whitelist). Türkçe UI
 * metinleri ve dilbilgisi yardımcıları hedef sayılmaz; bağlam cümleleri
 * yeni kelime ÖĞRETMEZ (yalnızca bilinen işlev kelimeleri + hedef kelime).
 *
 * Sorular `Exercise` biçimindedir; böylece mevcut `ExerciseView`,
 * `evaluateExercise`, `recordAttempt`, hata takibi ve Piper TTS yeniden
 * kullanılır. İlerleme `vocab-<id>-<tür>` kimlikleriyle `progress.exercises`
 * içinde birikir — ayrı ilerleme sistemi YOKTUR.
 */

import type { Exercise, ExercisePair } from '../../content/types';
import { VOCAB_BY_ID, VOCABULARY, type VocabEntry } from '../../content/vocabulary/inventory';
import { topicTitle } from '../../content/curriculum/topics';
import type { UserProgress } from '../storage';

export type VocabKind =
  | 'mixed'
  | 'detr'
  | 'trde'
  | 'match'
  | 'type'
  | 'listen'
  | 'weak'
  | 'flash'
  | 'marathon'
  | 'topic';

export type VocabSize = 'quick' | 'normal' | 'full' | 'marathon' | number;

export interface VocabQuestion {
  exercise: Exercise;
  /** Bu sorunun ölçtüğü envanter kimlikleri (eşleştirmede birden çok). */
  vocabIds: string[];
  /** Birincil ölçülen öğe (tek hedefli sorularda). */
  primaryVocabId: string;
  /** Ustalık ağırlığı (üretim > tanıma). */
  weight: number;
  /** Kolay→zor sahne sırası (oturum dizilimi için). */
  stage: number;
}

export interface VocabSessionOptions {
  kind: VocabKind;
  topicId?: string;
  size?: VocabSize;
  seed?: string;
  progress?: UserProgress;
}

/* ------------------------------------------------------------------ */
/* Deterministik RNG                                                   */
/* ------------------------------------------------------------------ */

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

export const VOCAB_EXERCISE_PREFIX = 'vocab-';

export function vocabQuestionId(vocabId: string, suffix: string): string {
  return `${VOCAB_EXERCISE_PREFIX}${vocabId}-${suffix}`;
}

/** Eşleştirme belirsizliğini önlemek için Türkçe anlam normalizasyonu. */
export function normalizeTurkish(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .split('/')[0]
    .replace(/[().,!?;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function exerciseTopicOf(entry: VocabEntry): { topicId: string; topic: string } {
  const topicId = entry.topicIds[0];
  return { topicId, topic: topicTitle(topicId) };
}

function baseExercise(
  id: string,
  entry: VocabEntry,
  partial: Partial<Exercise> & Pick<Exercise, 'type' | 'instruction' | 'difficulty' | 'skill'>,
): Exercise {
  const { topicId, topic } = exerciseTopicOf(entry);
  return {
    id,
    topicId,
    topic,
    ...partial,
    source: { file: 'vocab-inventory', naturalKey: entry.id },
    conceptIds: [],
    origin: 'authored',
    audio: {
      prompt: { text: entry.ttsText, language: 'de-DE', role: 'vocabulary' },
    },
  } satisfies Exercise;
}

/** Aynı türden, cevabı çakışmayan 3 çeldirici (deterministik). */
function pickDistractors(
  entry: VocabEntry,
  pool: VocabEntry[],
  count: number,
  rand: () => number,
  key: (item: VocabEntry) => string,
): string[] {
  const want = normalizeTurkish(key(entry));
  const sameType = pool.filter(
    (item) => item.id !== entry.id && normalizeTurkish(key(item)) !== want && item.type === entry.type,
  );
  const others = pool.filter(
    (item) =>
      item.id !== entry.id && normalizeTurkish(key(item)) !== want && item.type !== entry.type,
  );
  const picked: string[] = [];
  const seen = new Set([want]);
  for (const candidate of shuffle([...sameType, ...others], rand)) {
    const value = key(candidate);
    const norm = normalizeTurkish(value);
    if (seen.has(norm)) continue;
    seen.add(norm);
    picked.push(value);
    if (picked.length >= count) break;
  }
  return picked;
}

/* ------------------------------------------------------------------ */
/* Soru kurucular (her biri whitelist üyesi)                           */
/* ------------------------------------------------------------------ */

export function buildDetrMc(entry: VocabEntry, pool: VocabEntry[], rand: () => number): VocabQuestion {
  const distractors = pickDistractors(entry, pool, 3, rand, (item) => item.turkish);
  const options = shuffle([entry.turkish, ...distractors], rand);
  const exercise = baseExercise(vocabQuestionId(entry.id, 'detr-mc'), entry, {
    type: 'multiple-choice',
    difficulty: 'easy',
    skill: 'recognition',
    instruction: 'Türkçesini seç:',
    prompt: entry.german,
    answer: entry.turkish,
    options,
    familyId: `vocab-${entry.id}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 0.6, stage: 0 };
}

export function buildDetrType(entry: VocabEntry, _pool: VocabEntry[]): VocabQuestion {
  const exercise = baseExercise(vocabQuestionId(entry.id, 'detr-type'), entry, {
    type: 'free-text',
    difficulty: 'medium',
    skill: 'recall',
    instruction: 'Türkçesini yaz:',
    prompt: entry.german,
    answer: entry.turkish,
    familyId: `vocab-${entry.id}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 0.8, stage: 1 };
}

export function buildTrdeMc(entry: VocabEntry, pool: VocabEntry[], rand: () => number): VocabQuestion {
  const distractors = pickDistractors(entry, pool, 3, rand, (item) => item.german);
  const options = shuffle([entry.german, ...distractors], rand);
  const exercise = baseExercise(vocabQuestionId(entry.id, 'trde-mc'), entry, {
    type: 'multiple-choice',
    difficulty: 'medium',
    skill: 'recall',
    instruction: entry.type === 'noun' ? 'Almancasını artikeliyle seç:' : 'Almancasını seç:',
    prompt: entry.turkish,
    answer: entry.german,
    options,
    familyId: `vocab-${entry.id}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 0.8, stage: 2 };
}

/**
 * Türkçe → Almanca yazma (ZOR, üretim). İsimlerde kanonik cevap
 * ARTİKELLİDİR; artikelsiz yazım `validateVocabTyping` içinde kısmi
 * doğruluğa (minor-typo) indirgenir, yanlış artikel ise affedilmez.
 */
export function buildTrdeType(entry: VocabEntry, _pool: VocabEntry[]): VocabQuestion {
  const exercise = baseExercise(vocabQuestionId(entry.id, 'trde-type'), entry, {
    type: 'free-text',
    difficulty: 'hard',
    skill: 'production',
    instruction: entry.type === 'noun' ? 'Almancasını ARTİKELİYLE yaz:' : 'Almancasını yaz:',
    prompt: entry.turkish,
    answer: entry.german,
    acceptedAnswers: [],
    validation: { keyboardTolerance: true },
    familyId: `vocab-${entry.id}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 1.3, stage: 4 };
}

export function buildArticle(entry: VocabEntry, rand: () => number): VocabQuestion | null {
  if (entry.type !== 'noun' || !entry.article) return null;
  const exercise = baseExercise(vocabQuestionId(entry.id, 'article'), entry, {
    type: 'multiple-choice',
    difficulty: 'medium',
    skill: 'recall',
    instruction: 'Doğru artikeli seç:',
    prompt: `___ ${entry.base} (${entry.turkish})`,
    answer: entry.article,
    options: shuffle(['der', 'die', 'das'], rand),
    familyId: `vocab-${entry.id}`,
    explanation: `${entry.german} — ${entry.turkish}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 1.0, stage: 3 };
}

export type MatchDirection = 'de-tr' | 'tr-de';

export function buildMatching(
  entries: VocabEntry[],
  direction: MatchDirection,
  seed: string,
): VocabQuestion | null {
  if (entries.length < 2) return null;
  // Aynı sette yinelenen Türkçe anlam belirsizlik yaratır — çakışanı ele.
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    const key = normalizeTurkish(entry.turkish);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (unique.length < 2) return null;
  const rand = seededRandom(`${seed}:order`);
  const ordered = shuffle(unique, rand);
  const pairs: ExercisePair[] = ordered.map((entry) => ({
    left: direction === 'de-tr' ? entry.german : entry.turkish,
    right: direction === 'de-tr' ? entry.turkish : entry.german,
  }));
  const { topicId, topic } = exerciseTopicOf(ordered[0]);
  const id = `${VOCAB_EXERCISE_PREFIX}match-${ordered.map((e) => e.id).sort().join('+')}-${direction}`;
  const exercise: Exercise = {
    id,
    topicId,
    topic,
    type: 'matching',
    instruction:
      direction === 'de-tr' ? 'Almancayı Türkçesiyle eşleştir.' : 'Türkçeyi Almancasıyla eşleştir.',
    pairs,
    difficulty: direction === 'de-tr' ? 'easy' : 'medium',
    skill: direction === 'de-tr' ? 'recognition' : 'recall',
    source: { file: 'vocab-inventory', naturalKey: ordered.map((e) => e.id).join('+') },
    conceptIds: [],
    origin: 'authored',
    familyId: `vocab-match-${direction}`,
    audio: {
      targets: ordered.map((entry) => ({ text: entry.ttsText, language: 'de-DE', role: 'vocabulary' })),
    },
  };
  return {
    exercise,
    vocabIds: ordered.map((e) => e.id),
    primaryVocabId: ordered[0].id,
    weight: 0.7,
    stage: direction === 'de-tr' ? 1 : 3,
  };
}

export function buildListenChoice(
  entry: VocabEntry,
  pool: VocabEntry[],
  rand: () => number,
): VocabQuestion {
  const distractors = pickDistractors(entry, pool, 3, rand, (item) => item.turkish);
  const options = shuffle([entry.turkish, ...distractors], rand);
  const exercise = baseExercise(vocabQuestionId(entry.id, 'listen-choice'), entry, {
    type: 'listen-choice',
    difficulty: 'medium',
    skill: 'recognition',
    instruction: 'Duyduğun kelimenin anlamını seç:',
    prompt: 'Dinle ve seç',
    audioText: entry.ttsText,
    answer: entry.turkish,
    options,
    familyId: `vocab-${entry.id}`,
  });
  exercise.audio = { prompt: { text: entry.ttsText, language: 'de-DE', role: 'prompt' } };
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 0.7, stage: 3 };
}

export function buildListenType(entry: VocabEntry, _pool: VocabEntry[]): VocabQuestion {
  const exercise = baseExercise(vocabQuestionId(entry.id, 'listen-type'), entry, {
    type: 'dictation',
    difficulty: 'hard',
    skill: 'production',
    instruction: entry.type === 'noun' ? 'Duyduğunu ARTİKELİYLE yaz:' : 'Duyduğunu yaz:',
    audioText: entry.ttsText,
    answer: entry.german,
    validation: { keyboardTolerance: true },
    familyId: `vocab-${entry.id}`,
  });
  exercise.audio = { prompt: { text: entry.ttsText, language: 'de-DE', role: 'prompt' } };
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 1.1, stage: 5 };
}

export function buildFlash(entry: VocabEntry, _pool: VocabEntry[]): VocabQuestion {
  const exercise = baseExercise(vocabQuestionId(entry.id, 'flash'), entry, {
    type: 'spoken',
    difficulty: 'easy',
    skill: 'recall',
    instruction: 'Hatırlamaya çalış, sonra cevabı aç:',
    prompt: entry.german,
    sampleAnswer: `${entry.german} — ${entry.turkish}`,
    requirements: ['Önce içinden söyle', 'Sonra Cevabı Göster'],
    familyId: `vocab-${entry.id}`,
    explanation: `${entry.german} — ${entry.turkish}`,
  });
  return { exercise, vocabIds: [entry.id], primaryVocabId: entry.id, weight: 0.5, stage: 0 };
}

/* ------------------------------------------------------------------ */
/* Havuz + zayıflık önceliği                                           */
/* ------------------------------------------------------------------ */

export function vocabPoolForTopic(topicId?: string): VocabEntry[] {
  if (!topicId) return [...VOCABULARY];
  return VOCABULARY.filter((entry) => entry.topicIds.includes(topicId));
}

function weaknessOf(progress: UserProgress | undefined, vocabId: string): number {
  if (!progress) return 0;
  let incorrect = 0;
  let typo = 0;
  let lastBad = 0;
  let attempts = 0;
  for (const [id, entry] of Object.entries(progress.exercises)) {
    if (id === `vocab-${vocabId}` || id.startsWith(`vocab-${vocabId}-`)) {
      incorrect += entry.incorrectCount;
      typo += entry.typoCount;
      attempts += entry.attempts.length;
      const last = entry.attempts.at(-1)?.result;
      if (last === 'incorrect') lastBad = Math.max(lastBad, 2);
      else if (last === 'minor-typo') lastBad = Math.max(lastBad, 1);
    }
  }
  if (attempts === 0) return 5;
  return incorrect * 3 + typo + lastBad;
}

/** Zayıf → görülmemiş → yeni → ustalaşmış; tohumla deterministik kırılım. */
export function orderByWeakness(
  pool: VocabEntry[],
  progress: UserProgress | undefined,
  seed: string,
): VocabEntry[] {
  const rand = seededRandom(`${seed}:tiebreak`);
  const tie = new Map(pool.map((entry) => [entry.id, rand()]));
  return [...pool].sort(
    (a, b) => weaknessOf(progress, b.id) - weaknessOf(progress, a.id) || (tie.get(a.id) ?? 0) - (tie.get(b.id) ?? 0),
  );
}

function resolveSize(size: VocabSize | undefined, poolSize: number): number {
  if (typeof size === 'number') return Math.max(1, Math.min(size, poolSize));
  switch (size ?? 'normal') {
    case 'quick':
      return Math.min(10, poolSize);
    case 'normal':
      return Math.min(22, poolSize);
    case 'full':
      return Math.min(50, poolSize);
    case 'marathon':
      return poolSize;
    default:
      return Math.min(22, poolSize);
  }
}

export function topicSessionSize(poolSize: number): number {
  if (poolSize <= 12) return poolSize;
  if (poolSize <= 50) return Math.min(25, poolSize);
  return Math.min(30, poolSize);
}

/* ------------------------------------------------------------------ */
/* Oturum kurucu                                                       */
/* ------------------------------------------------------------------ */

const MATCH_SET_SIZE = 5;
const MATCH_MAX_SIZE = 8;

/**
 * Örneklemi 4–8 aralığında dengeli gruplara böler (son grup cılız kalmaz).
 * Grup sayısı `round(n/5)` ile bulunur; kalanlar baştan dağıtılır.
 */
export function balancedGroups<T>(items: T[]): T[][] {
  if (items.length <= MATCH_MAX_SIZE) return items.length ? [items] : [];
  const count = Math.max(1, Math.round(items.length / MATCH_SET_SIZE));
  const groups: T[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => groups[i % count].push(item));
  return groups;
}

function arrange(questions: VocabQuestion[], seed: string): VocabQuestion[] {
  const rand = seededRandom(`${seed}:arrange`);
  const tie = new Map(questions.map((q) => [q.exercise.id, rand()]));
  const byStage = [...questions].sort(
    (a, b) => a.stage - b.stage || (tie.get(a.exercise.id) ?? 0) - (tie.get(b.exercise.id) ?? 0),
  );
  // Aynı kelime arka arkaya gelmesin (≥3 aralık).
  const result: VocabQuestion[] = [];
  const pending = [...byStage];
  while (pending.length) {
    const recent = new Set(result.slice(-3).flatMap((q) => q.vocabIds));
    const index = pending.findIndex((q) => q.vocabIds.every((id) => !recent.has(id)));
    result.push(pending.splice(index === -1 ? 0 : index, 1)[0]);
  }
  return result;
}

function sampleVocabs(options: VocabSessionOptions, pool: VocabEntry[]): VocabEntry[] {
  const { progress, seed = 'vocab', size, kind } = options;
  const ordered = orderByWeakness(pool, progress, seed);
  if (kind === 'marathon') return ordered;
  const target =
    kind === 'topic'
      ? Math.min(topicSessionSize(pool.length), pool.length)
      : resolveSize(size, pool.length);
  return ordered.slice(0, Math.min(target, pool.length));
}

function individualFor(entry: VocabEntry, pool: VocabEntry[], rand: () => number, stage: number): VocabQuestion {
  // Zayıflık arttıkça daha zor üretim biçimi.
  if (stage >= 4) return buildTrdeType(entry, pool);
  if (stage === 3) return buildArticle(entry, rand) ?? buildTrdeMc(entry, pool, rand);
  if (stage === 2) return buildTrdeMc(entry, pool, rand);
  if (stage === 1) return buildDetrType(entry, pool);
  return buildDetrMc(entry, pool, rand);
}

export function buildVocabSession(options: VocabSessionOptions): VocabQuestion[] {
  const { kind, topicId, seed = 'vocab', progress } = options;
  const pool = vocabPoolForTopic(topicId);
  if (!pool.length) return [];
  const rand = seededRandom(`${seed}:pick`);

  if (kind === 'marathon') {
    const ordered = sampleVocabs(options, pool);
    return ordered.map((entry) => buildDetrMc(entry, pool, seededRandom(`${seed}:${entry.id}`)));
  }

  if (kind === 'detr') {
    return arrange(
      sampleVocabs(options, pool).map((entry, i) =>
        i % 3 === 2 ? buildDetrType(entry, pool) : buildDetrMc(entry, pool, seededRandom(`${seed}:${entry.id}`)),
      ),
      seed,
    );
  }

  if (kind === 'trde' || kind === 'type') {
    return arrange(
      sampleVocabs(options, pool).map((entry) => {
        if (entry.type === 'noun' && kind === 'trde' && hashSeed(`${seed}:${entry.id}`) % 3 === 0) {
          return buildArticle(entry, seededRandom(`${seed}:${entry.id}`)) ?? buildTrdeType(entry, pool);
        }
        return buildTrdeType(entry, pool);
      }),
      seed,
    );
  }

  if (kind === 'match') {
    const sampled = sampleVocabs(options, pool);
    const sets: VocabQuestion[] = [];
    for (const group of balancedGroups(sampled)) {
      if (group.length < 2) {
        sets.push(buildDetrMc(group[0], pool, seededRandom(`${seed}:${group[0].id}`)));
        continue;
      }
      const direction: MatchDirection = sets.length % 2 === 0 ? 'de-tr' : 'tr-de';
      const set = buildMatching(group, direction, `${seed}:set${sets.length}`);
      if (set) sets.push(set);
    }
    return sets;
  }

  if (kind === 'listen') {
    return arrange(
      sampleVocabs(options, pool).map((entry, i) =>
        i % 2 === 0
          ? buildListenChoice(entry, pool, seededRandom(`${seed}:${entry.id}`))
          : buildListenType(entry, pool),
      ),
      seed,
    );
  }

  if (kind === 'flash') {
    return sampleVocabs(options, pool).map((entry) => buildFlash(entry, pool));
  }

  if (kind === 'weak') {
    const weak = orderByWeakness(pool, progress, seed).filter((entry) => weaknessOf(progress, entry.id) > 0);
    const sampled = weak.slice(0, Math.min(resolveSize(options.size, weak.length || pool.length), weak.length || pool.length));
    const list = sampled.length ? sampled : orderByWeakness(pool, progress, seed).slice(0, 10);
    return arrange(
      list.map((entry, i) => individualFor(entry, pool, seededRandom(`${seed}:${entry.id}`), 2 + (i % 3))),
      seed,
    );
  }

  // mixed / topic: önce 1 eşleştirme seti, sonra sahneye göre bireysel sorular.
  const sampled = sampleVocabs(options, pool);
  const questions: VocabQuestion[] = [];
  const matchCount = Math.min(MATCH_SET_SIZE, sampled.length);
  if (sampled.length >= 6) {
    const set = buildMatching(sampled.slice(0, matchCount), 'de-tr', `${seed}:mixed`);
    if (set) questions.push(set);
  }
  const rest = sampled.slice(questions.length ? matchCount : 0);
  rest.forEach((entry, i) => {
    questions.push(individualFor(entry, pool, seededRandom(`${seed}:${entry.id}`), i % 6));
  });
  void rand;
  return arrange(questions, seed);
}

/* ------------------------------------------------------------------ */
/* Whitelist denetimi                                                  */
/* ------------------------------------------------------------------ */

/** Sorudaki her hedef envanterde mi? (Test + çalışma-zamanı güvencesi.) */
export function assertWhitelist(questions: VocabQuestion[]): string[] {
  const violations: string[] = [];
  for (const question of questions) {
    for (const id of question.vocabIds) {
      if (!VOCAB_BY_ID.has(id)) violations.push(`${question.exercise.id} → ${id}`);
    }
  }
  return violations;
}

/** Metinsel hedefin envanter dışı kelime sızdırmadığını denetler (basit). */
export function targetInWhitelist(vocabId: string): boolean {
  return VOCAB_BY_ID.has(vocabId);
}
