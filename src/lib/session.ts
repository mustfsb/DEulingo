/**
 * Oturum kurucusu.
 *
 * Havuz (35–55 alistirma) ile OTURUM (5–25 alistirma) ayri kavramlardir:
 * her calisma havuzdan farkli ama yapili bir secki uretir.
 *
 * Tasarim:
 *   - Puanlama (§33) neyin secilecegini belirler.
 *   - Asama plani (§31) sirayi belirler: kolay ısınma → orta → zor → hata tekrari → kapanis.
 *   - Aile araligi (§32) ayni kavramin varyantlarini arka arkaya gostermez.
 *   - Karma tekrar (§48) 2. gunden itibaren onceki gunlerden ~%20 ekler.
 *
 * `seed` verildigi surece cikti DETERMINISTIKTIR (test edilebilir), ama
 * uygulamada seed her oturumda degistigi icin sira tekrar etmez.
 */

import type { Difficulty, Exercise, ExerciseSetId } from '../content/types';
import type { SessionPresentation, UserProgress } from './storage';
import { computeConceptProgress } from './mastery';

export type SessionMode = 'normal' | 'full' | 'quick' | 'challenge' | 'topic' | 'set';

interface ModeConfig {
  size: number;
  difficulties?: Difficulty[];
  /** Onceki gunlerden gelecek oran. */
  previousDayRatio: number;
  /** Zorluk sablonu: kolay / orta / zor oranlari. */
  mix: { easy: number; medium: number; hard: number };
}

const MODE_CONFIG: Record<SessionMode, ModeConfig> = {
  normal: { size: 18, previousDayRatio: 0.2, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  // Tam çalışma o günün havuzunun tamamını + yaklaşık %20 önceki gün tekrarını içerir.
  // `current / (current + current * .25)` = %80 güncel, %20 kümülatif tekrar.
  full: { size: 45, previousDayRatio: 0.2, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  quick: { size: 8, previousDayRatio: 0, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  challenge: {
    size: 12,
    difficulties: ['medium', 'hard'],
    previousDayRatio: 0,
    mix: { easy: 0, medium: 0.35, hard: 0.65 },
  },
  topic: { size: 12, previousDayRatio: 0, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  // Set modunda seçilen havuzun tamamı, pedagojik sıra dayatılmadan karışır.
  set: { size: Number.MAX_SAFE_INTEGER, previousDayRatio: 0, mix: { easy: 0, medium: 0, hard: 0 } },
};

/**
 * Gun/izlek bazli oturum boyu istisnalari.
 *
 * Varsayilan `MODE_CONFIG` boyutlari TUM gunler icin gecerlidir; burada
 * yalnizca havuzu belirgin sekilde daha buyuk olan gunler icin daha genis
 * bir oturum tanimlanir. Kayitli olmayan her gun/izlek varsayilanla calisir,
 * bu yuzden onceki gunlerin davranisi degismez.
 */
export const SESSION_SIZE_OVERRIDES: Record<string, Partial<Record<SessionMode, number>>> = {
  // Özel Ders 7. Gün: 139 alistirmalik kelime agirlikli havuz.
  'private:7': { normal: 22, full: 50, quick: 10, challenge: 16 },
};

function sizeKey(pool: Exercise[]): string | undefined {
  const first = pool[0];
  if (!first) return undefined;
  return `${first.track ?? 'normal'}:${first.day}`;
}

function modeSize(mode: SessionMode, pool: Exercise[]): number {
  const key = sizeKey(pool);
  return (key ? SESSION_SIZE_OVERRIDES[key]?.[mode] : undefined) ?? MODE_CONFIG[mode].size;
}

/**
 * Gunun kapanis uretim gorevleri.
 *
 * Bazi gunlerin pedagojik hedefi tek bir uretim gorevinde toplanir
 * (Ozel Ders 7. Gun: "Evini Almanca anlat"). Bu gorev, sans eseri secilmeye
 * birakilmaz: kayitli oldugu modda oturuma HER ZAMAN girer ve EN SONA konur.
 * Kayitli olmayan gun/izlek/mod icin liste bostur, davranis degismez.
 */
export const SESSION_CLOSING_TASKS: Record<string, Partial<Record<SessionMode, string[]>>> = {
  'private:7': {
    full: ['p7-evim-free-tam-anlatim'],
    challenge: ['p7-evim-free-tam-anlatim'],
  },
};

function closingTasks(mode: SessionMode, pool: Exercise[], candidates: Exercise[]): Exercise[] {
  const key = sizeKey(pool);
  const ids = key ? (SESSION_CLOSING_TASKS[key]?.[mode] ?? []) : [];
  return ids
    .map((id) => candidates.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

/** Ayni aileden iki alistirma arasinda birakilacak en az mesafe. */
export const FAMILY_GAP = 3;

/* ------------------------------------------------------------------ */
/* Zor sorular havuzu (§9, §10)                                        */
/* ------------------------------------------------------------------ */

/** Challenge'ta "uretim" sayilan gorev tipleri. */
const PRODUCTION_TYPES = new Set<Exercise['type']>([
  'free-text',
  'fill-blank',
  'error-correction',
  'sentence-builder',
  'ordering',
  'dictation',
]);

/**
 * Uretim kaniti mi?
 * Kelime bankasinda yalnizca Turkce → Almanca yon uretimdir; ters yon
 * anlam tanimadir ve challenge'i kolaylastirir.
 */
export function isProductionTask(exercise: Exercise): boolean {
  if (exercise.type === 'word-bank-translation') return exercise.wordBank?.direction !== 'de-to-tr';
  if (PRODUCTION_TYPES.has(exercise.type)) return true;
  return exercise.skill === 'production' || exercise.skill === 'correction';
}

/** Challenge oturumunda tanima gorevlerinin ust siniri — "10 test sorusu" olmaz. */
export const CHALLENGE_MAX_RECOGNITION_RATIO = 0.25;

/** Bunun altinda anlamli bir challenge kurulamaz; buton devre disi birakilir. */
export const MIN_CHALLENGE_SIZE = 6;

export interface ChallengeReadiness {
  /** Uygun (zor + orta, sesli olmayan) alistirma sayisi. */
  eligible: number;
  hard: number;
  production: number;
  ready: boolean;
}

export function challengeCandidates(pool: Exercise[]): Exercise[] {
  return uniqueExercises(pool).filter(
    // Sesli gorev oz degerlendirmedir: "zor" oturumda kanit degeri yoktur.
    (exercise) => exercise.type !== 'spoken' && exercise.difficulty !== 'easy',
  );
}

export function challengeReadiness(pool: Exercise[]): ChallengeReadiness {
  const candidates = challengeCandidates(pool);
  const hard = candidates.filter((item) => item.difficulty === 'hard').length;
  const production = candidates.filter(isProductionTask).length;
  return {
    eligible: candidates.length,
    hard,
    production,
    ready: candidates.length >= MIN_CHALLENGE_SIZE && production >= Math.ceil(MIN_CHALLENGE_SIZE / 2),
  };
}

/**
 * Zor oturum secimi.
 *
 * Once zor uretim, sonra orta uretim, en son sinirli sayida tanima gorevi.
 * Zor havuz yetmezse en guclu orta uretim gorevleriyle tamamlanir (§10).
 */
export function selectChallenge(
  candidates: Exercise[],
  size: number,
  rank: (a: Exercise, b: Exercise) => number,
): Exercise[] {
  if (size <= 0) return [];
  const production = candidates.filter(isProductionTask);
  const recognition = candidates.filter((item) => !isProductionTask(item));
  const hardFirst = (list: Exercise[]) => [
    ...list.filter((item) => item.difficulty === 'hard').sort(rank),
    ...list.filter((item) => item.difficulty !== 'hard').sort(rank),
  ];

  const picked = hardFirst(production).slice(0, size);
  const recognitionQuota = Math.min(
    Math.floor(size * CHALLENGE_MAX_RECOGNITION_RATIO),
    Math.max(0, size - picked.length),
  );
  picked.push(...hardFirst(recognition).slice(0, recognitionQuota));

  // Hâlâ eksikse (havuz gercekten dar) kalanlarla doldur; kopya asla eklenmez.
  if (picked.length < size) {
    const chosen = new Set(picked.map((item) => item.id));
    picked.push(...hardFirst(candidates.filter((item) => !chosen.has(item.id))).slice(0, size - picked.length));
  }
  return picked.slice(0, size);
}

/* ------------------------------------------------------------------ */
/* Puanlama                                                            */
/* ------------------------------------------------------------------ */

export const SCORE = {
  unseen: 5,
  incorrectBefore: 5,
  repeatedMistake: 3,
  weakConcept: 3,
  minorTypo: 1,
  recentlyCorrect: -2,
  mastered: -4,
} as const;

/** Kavram ustaligi bu esigin altindaysa "zayif" sayilir. */
export const WEAK_CONCEPT_THRESHOLD = 0.5;

export function scoreExercise(
  exercise: Exercise,
  progress: UserProgress,
  conceptScores: Map<string, number>,
): number {
  const entry = progress.exercises[exercise.id];
  let score = 0;

  if (!entry || entry.attempts.length === 0) {
    score += SCORE.unseen;
  } else {
    if (entry.incorrectCount > 0) score += SCORE.incorrectBefore;
    if (entry.incorrectCount >= 2) score += SCORE.repeatedMistake;
    if (entry.typoCount > 0) score += SCORE.minorTypo;
    if (entry.attempts.at(-1)?.result === 'correct') score += SCORE.recentlyCorrect;
    if (entry.mastered && entry.correctCount >= 2) score += SCORE.mastered;
  }

  const weak = exercise.conceptIds.some(
    (id) => (conceptScores.get(id) ?? 0) < WEAK_CONCEPT_THRESHOLD,
  );
  if (weak && exercise.conceptIds.length > 0) score += SCORE.weakConcept;

  return score;
}

/* ------------------------------------------------------------------ */
/* Deterministik karistirma                                            */
/* ------------------------------------------------------------------ */

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Esit puanlilar arasinda seed'e bagli, tekrarlanabilir bir sira uretir. */
function tieBreaker(id: string, seed: string): number {
  return hash(`${seed}#${id}`);
}

/* ------------------------------------------------------------------ */
/* Oturum kurma                                                        */
/* ------------------------------------------------------------------ */

export interface SessionInput {
  /** Bu gunun tam havuzu. */
  pool: Exercise[];
  /** Onceki gunlerin havuzu (karma tekrar icin). Bos olabilir. */
  previous?: Exercise[];
  progress: UserProgress;
  mode: SessionMode;
  /** `topic` modunda zorunlu. */
  topicId?: string;
  /** `set` modunda zorunlu: ilk üç günün ayrık soru seti. */
  exerciseSetId?: ExerciseSetId;
  seed: string;
  /** Test icin oturum boyutunu ezmek amaciyla. */
  size?: number;
}

export interface SessionPlan {
  /** Oturum başlamadan bir kez kurulan, benzersiz ana soru sırası. */
  primaryQueue: SessionPresentation[];
  /** Ders sırasında yanlışlara göre doldurulur; başlangıçta her zaman boştur. */
  retryQueue: SessionPresentation[];
}

/**
 * Birincil oturumu sampling-without-replacement ile peşinen kurar.
 * `retryQueue` özellikle boş döner: doğru cevaplar asla buraya girmez.
 */
export function buildSessionPlan(input: SessionInput): SessionPlan {
  const { pool, progress, mode, topicId, exerciseSetId, seed } = input;
  const config = MODE_CONFIG[mode];
  const allKnown = uniqueExercises([...pool, ...(input.previous ?? [])]);
  const conceptScores = new Map(
    [...computeConceptProgress(progress, allKnown)].map(
      ([id, item]) => [id, item.masteryScore] as const,
    ),
  );

  let candidates = uniqueExercises(pool);
  if (mode === 'topic') {
    candidates = candidates.filter((exercise) => exercise.topicId === topicId);
  }
  if (mode === 'set') {
    candidates = exerciseSetId
      ? candidates.filter((exercise) => exercise.exerciseSetId === exerciseSetId)
      : [];
  }
  if (mode === 'challenge') {
    candidates = challengeCandidates(candidates);
  } else if (config.difficulties) {
    candidates = candidates.filter((exercise) => config.difficulties!.includes(exercise.difficulty));
  }
  if (mode === 'quick') {
    // Yalnizca hata gecmisi olan, zayif konuya ait ya da hic gorulmemis olanlar.
    const weakOnly = candidates.filter((exercise) => {
      const entry = progress.exercises[exercise.id];
      const hasMistake = (entry?.incorrectCount ?? 0) > 0 || (entry?.typoCount ?? 0) > 0;
      const weak = exercise.conceptIds.some(
        (id) => (conceptScores.get(id) ?? 0) < WEAK_CONCEPT_THRESHOLD,
      );
      return hasMistake || weak || !entry;
    });
    if (weakOnly.length) candidates = weakOnly;
  }
  if (!candidates.length) return { primaryQueue: [], retryQueue: [] };

  // Setler baştan sona tek bir rastgele sıra taşır: kolay/orta/zor dizisi,
  // konu kapanışı ya da önceki gün tekrarı yoktur. Aynı seed testte tekrar
  // üretilebilir, uygulamada ise her yeni oturumda seed değişir.
  if (mode === 'set') {
    return {
      primaryQueue: randomize(candidates, seed).map((exercise) => ({
        exerciseId: exercise.id,
        presentationReason: 'primary' as const,
      })),
      retryQueue: [],
    };
  }

  const scored = new Map(
    candidates.map((exercise) => [exercise.id, scoreExercise(exercise, progress, conceptScores)]),
  );

  const rank = (a: Exercise, b: Exercise) =>
    (scored.get(b.id) ?? 0) - (scored.get(a.id) ?? 0) ||
    tieBreaker(a.id, seed) - tieBreaker(b.id, seed);

  const uniquePrevious = uniqueExercises(input.previous ?? []).filter(
    (exercise) => !candidates.some((candidate) => candidate.id === exercise.id),
  );
  const requestedSize = input.size ?? modeSize(mode, pool);
  const capacity = Math.min(requestedSize, candidates.length + uniquePrevious.length);
  // 18 soruluk normal oturumda `round(.2)` dört tekrar (%22,2) yapar;
  // bu da güncel günün %80–85 hedefinin altına düşer. Aşağı yuvarlama,
  // 3/18 (%16,7) ve 9/45 (%20) ile hedef bandını korur.
  const requestedReviewCount = Math.floor(capacity * config.previousDayRatio);
  const reviewCount = Math.min(requestedReviewCount, uniquePrevious.length);
  const primaryCount = Math.min(candidates.length, capacity - reviewCount);
  const actualReviewCount = Math.min(uniquePrevious.length, capacity - primaryCount);

  let selected =
    mode === 'challenge'
      ? selectChallenge(candidates, primaryCount, rank)
      : selectByMix(candidates, primaryCount, config.mix, rank);
  if (mode === 'full') selected = ensureTopicCoverage(selected, candidates, primaryCount, rank);

  // Kapanis gorevi secime kalmaz: yoksa eklenir, varsa yerinde birakilir.
  const closing = closingTasks(mode, pool, candidates);
  const missingClosing = closing.filter((task) => !selected.some((item) => item.id === task.id));
  if (missingClosing.length && primaryCount > 0) {
    const keep = selected.filter((item) => !closing.some((task) => task.id === item.id));
    const trimmed = keep.slice(0, Math.max(0, primaryCount - closing.length));
    selected = [...trimmed, ...closing];
  }

  const review = uniquePrevious.sort(rank).slice(0, actualReviewCount);
  const closingIds = new Set(closing.map((task) => task.id));
  const arranged = spaceFamilies(arrange(selected, review, seed));
  const ordered = closingIds.size
    ? [...arranged.filter((item) => !closingIds.has(item.id)), ...arranged.filter((item) => closingIds.has(item.id))]
    : arranged;
  const usedExerciseIds = new Set<string>();
  const primaryQueue = ordered.flatMap((exercise): SessionPresentation[] => {
    if (usedExerciseIds.has(exercise.id)) return [];
    usedExerciseIds.add(exercise.id);
    return [{ exerciseId: exercise.id, presentationReason: 'primary' }];
  });

  return { primaryQueue, retryQueue: [] };
}

/** Geriye dönük, ID tabanlı tüketiciler için yalnızca primary sıra. */
export function buildSession(input: SessionInput): string[] {
  return buildSessionPlan(input).primaryQueue.map((item) => item.exerciseId);
}

function uniqueExercises(exercises: Exercise[]): Exercise[] {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    if (seen.has(exercise.id)) return false;
    seen.add(exercise.id);
    return true;
  });
}

/** Fisher–Yates: tüm sorular aynı olasılıkla farklı sırada gelir. */
function randomize(exercises: Exercise[], seed: string): Exercise[] {
  let state = hash(seed) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
  const shuffled = [...exercises];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

/** Tam çalışmada günün her ana konusu, kapasite el verdiği sürece temsil edilir. */
function ensureTopicCoverage(
  selected: Exercise[],
  candidates: Exercise[],
  size: number,
  rank: (a: Exercise, b: Exercise) => number,
): Exercise[] {
  if (size === 0) return [];
  const next = [...selected];
  const seenTopics = new Set(next.map((item) => item.topicId));
  const topics = [...new Set(candidates.map((item) => item.topicId))];
  for (const topicId of topics) {
    if (seenTopics.has(topicId)) continue;
    const representative = candidates.filter((item) => item.topicId === topicId).sort(rank)[0];
    if (!representative) continue;
    const duplicateIndex = next.findIndex(
      (item) => item.topicId !== topicId && next.filter((other) => other.topicId === item.topicId).length > 1,
    );
    if (duplicateIndex === -1) continue;
    next.splice(duplicateIndex, 1, representative);
    seenTopics.add(topicId);
  }
  return next;
}

/** Zorluk sablonuna gore secim yapar; bir kova yetmezse digerlerinden tamamlar. */
function selectByMix(
  candidates: Exercise[],
  size: number,
  mix: ModeConfig['mix'],
  rank: (a: Exercise, b: Exercise) => number,
): Exercise[] {
  const buckets: Record<Difficulty, Exercise[]> = {
    easy: candidates.filter((item) => item.difficulty === 'easy').sort(rank),
    medium: candidates.filter((item) => item.difficulty === 'medium').sort(rank),
    hard: candidates.filter((item) => item.difficulty === 'hard').sort(rank),
  };

  const quota: Record<Difficulty, number> = {
    easy: Math.round(size * mix.easy),
    medium: Math.round(size * mix.medium),
    hard: Math.round(size * mix.hard),
  };

  const picked: Exercise[] = [];
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    picked.push(...buckets[difficulty].slice(0, quota[difficulty]));
  }

  // Kota tutmadiysa (kova bos ya da yuvarlanma) kalan en yuksek puanlilarla doldur.
  if (picked.length < size) {
    const chosen = new Set(picked.map((item) => item.id));
    const rest = candidates.filter((item) => !chosen.has(item.id)).sort(rank);
    picked.push(...rest.slice(0, size - picked.length));
  }
  return picked.slice(0, size);
}

/**
 * Ders akisi (§31):
 *   kolay ısınma → orta hatırlama → orta uygulama → zor üretim
 *   → hata tekrarı (önceki günler) → kapanış güven sorusu
 */
function arrange(selected: Exercise[], review: Exercise[], seed: string): Exercise[] {
  const easy = selected.filter((item) => item.difficulty === 'easy');
  const medium = selected.filter((item) => item.difficulty === 'medium');
  const hard = selected.filter((item) => item.difficulty === 'hard');

  // Kapanis icin bir kolay soru ayrilir (varsa).
  const closer = easy.length > 1 ? easy.pop() : undefined;
  const warmUp = easy.splice(0, 2);

  // Orta seviye: once hatirlama, sonra uygulama.
  const bySkill = (item: Exercise) =>
    item.skill === 'recall' || item.skill === 'recognition' ? 0 : 1;
  const orderedMedium = [...medium].sort(
    (a, b) => bySkill(a) - bySkill(b) || tieBreaker(a.id, seed) - tieBreaker(b.id, seed),
  );

  const result = [...warmUp, ...orderedMedium, ...easy, ...hard, ...review];
  if (closer) result.push(closer);
  return result;
}

/**
 * Ayni `familyId`'ye sahip alistirmalari birbirinden uzaklastirir.
 * Yer degistirme yapilamayan durumlarda sira korunur (sonsuz dongu yok).
 */
export function spaceFamilies(items: Exercise[], gap = FAMILY_GAP): Exercise[] {
  const result: Exercise[] = [];
  const pending = [...items];

  while (pending.length) {
    const recent = result.slice(-gap).map((item) => item.familyId);
    // Yakinda ayni aileden biri yoksa ilk adayi al; varsa uygun ilk adayi one cek.
    let index = pending.findIndex((item) => !item.familyId || !recent.includes(item.familyId));
    if (index === -1 && result.length > gap) {
      // Acgozlu ileri yerleştirme iki aynı aileyi kuyruğun sonuna sıkıştırmış
      // olabilir. Sonraki farklı aileyi geri alıp bu kopyayı daha erken,
      // iki komşusuyla da çakışmayacağı bir yere koyarak boşluğu aç.
      const fallback = pending[0];
      const swapIndex = result.findIndex((item, candidateIndex) => {
        if (item.familyId && recent.includes(item.familyId)) return false;
        if (!fallback.familyId) return true;
        const nearby = result.slice(
          Math.max(0, candidateIndex - gap),
          Math.min(result.length, candidateIndex + gap + 1),
        );
        return nearby.every((nearbyItem, nearbyIndex) =>
          candidateIndex - gap + nearbyIndex === candidateIndex || nearbyItem.familyId !== fallback.familyId,
        );
      });
      if (swapIndex !== -1) {
        const displaced = result[swapIndex];
        result[swapIndex] = fallback;
        pending[0] = displaced;
        continue;
      }
    }
    if (index === -1) index = 0;
    result.push(pending.splice(index, 1)[0]);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Sure tahmini                                                        */
/* ------------------------------------------------------------------ */

/**
 * Soru basina cozum disi ek sure: yonergeyi okumak, geri bildirimi ve
 * yaklasik okunusu gozden gecirmek. Bunu saymazsak tahmin gercekte
 * harcanandan belirgin sekilde kisa cikar.
 */
export const OVERHEAD_SECONDS = 8;

/**
 * Bir modun tahmini suresi.
 * Havuzun ORTALAMA soru suresi kullanilir — havuzun bas tarafindaki
 * alistirmalar temsili olmayabilir.
 */
export function estimateModeMinutes(pool: Exercise[], count: number): number {
  if (!pool.length || count <= 0) return 1;
  const average =
    pool.reduce((total, item) => total + (item.estimatedSeconds ?? 25) + OVERHEAD_SECONDS, 0) /
    pool.length;
  return Math.max(1, Math.round((average * count) / 60));
}

/** Bir modun bu havuzda kac soru uretecegini onceden gosterir. */
export function sessionSize(mode: SessionMode, poolSize: number, pool: Exercise[] = []): number {
  return Math.min(modeSize(mode, pool), poolSize);
}
