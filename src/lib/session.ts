/**
 * Oturum kurucusu.
 *
 * Havuz (bir KONUNUN birincil + ikincil etiketli alistirmalari) ile OTURUM
 * (5–25 alistirma) ayri kavramlardir: her calisma havuzdan farkli ama yapili
 * bir secki uretir.
 *
 * Tasarim:
 *   - Puanlama (§33) neyin secilecegini belirler; konunun BIRINCIL
 *     alistirmalari esit puanda ikincil etiketlilerin onune gecer.
 *   - Asama plani (§31) sirayi belirler: kolay ısınma → orta → zor → kapanis.
 *   - Aile araligi (§32) ayni kavramin varyantlarini arka arkaya gostermez.
 *   - Konular arasi karma tekrar Genel Tekrar'in isidir; konu oturumu
 *     yalnizca kendi havuzundan secer.
 *
 * `seed` verildigi surece cikti DETERMINISTIKTIR (test edilebilir), ama
 * uygulamada seed her oturumda degistigi icin sira tekrar etmez.
 */

import type { Difficulty, Exercise } from '../content/types';
import type { SessionPresentation, UserProgress } from './storage';
import { computeConceptProgress } from './mastery';

export type SessionMode =
  | 'normal'
  | 'full'
  | 'quick'
  | 'challenge'
  | 'section'
  | 'gr-mixed'
  | 'gr-vocab'
  | 'gr-sentence'
  | 'gr-writing'
  | 'gr-listening'
  | 'gr-quick'
  | 'gr-challenge'
  | 'gr-topic';

interface ModeConfig {
  size: number;
  difficulties?: Difficulty[];
  /** Zorluk sablonu: kolay / orta / zor oranlari. */
  mix: { easy: number; medium: number; hard: number };
}

const MODE_CONFIG: Record<SessionMode, ModeConfig> = {
  normal: { size: 18, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  // Tam çalışma: konunun geniş bir kesiti; her bölüm temsil edilir.
  full: { size: 45, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  quick: { size: 8, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  challenge: {
    size: 12,
    difficulties: ['medium', 'hard'],
    mix: { easy: 0, medium: 0.35, hard: 0.65 },
  },
  // Bölüm pratiği: tek bir özet bölümünün alıştırmaları.
  section: { size: 12, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  // Genel Tekrar: havuz zaten konular arası ve kümülatiftir.
  'gr-mixed': { size: 28, mix: { easy: 0.25, medium: 0.5, hard: 0.25 } },
  'gr-vocab': { size: 24, mix: { easy: 0.35, medium: 0.45, hard: 0.2 } },
  'gr-sentence': { size: 24, mix: { easy: 0.15, medium: 0.45, hard: 0.4 } },
  'gr-writing': { size: 7, mix: { easy: 0.2, medium: 0.5, hard: 0.3 } },
  'gr-listening': { size: 16, mix: { easy: 0.35, medium: 0.45, hard: 0.2 } },
  'gr-quick': { size: 12, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
  'gr-challenge': {
    size: 22,
    difficulties: ['medium', 'hard'],
    mix: { easy: 0, medium: 0.35, hard: 0.65 },
  },
  'gr-topic': { size: 20, mix: { easy: 0.3, medium: 0.5, hard: 0.2 } },
};

/**
 * Konu bazli oturum boyu istisnalari (kanonik konu kimligiyle).
 *
 * Varsayilan `MODE_CONFIG` boyutlari TUM konular icin gecerlidir; burada
 * yalnizca havuzu belirgin sekilde daha buyuk olan konular icin daha genis
 * bir oturum tanimlanir. Genel Tekrar modlari bu tablodan etkilenmez.
 */
export const SESSION_SIZE_OVERRIDES: Record<string, Partial<Record<SessionMode, number>>> = {
  // ~145 alistirmalik, uretim agirlikli havuz.
  'topic.modal-verbs': { normal: 22, full: 52, quick: 10, challenge: 18 },
  // ~105 alistirmalik havuz (Mein Tag ve Modalverben ile ortak cumleler dahil).
  'topic.separable-verbs': { normal: 20, full: 50, challenge: 16 },
};

const LESSON_MODES = new Set<SessionMode>(['normal', 'full', 'quick', 'challenge']);

function modeSize(mode: SessionMode, topicId: string | undefined): number {
  const override = topicId && LESSON_MODES.has(mode) ? SESSION_SIZE_OVERRIDES[topicId]?.[mode] : undefined;
  return override ?? MODE_CONFIG[mode].size;
}

/**
 * Konunun kapanis uretim gorevleri.
 *
 * Bazi konularin pedagojik hedefi tek bir uretim gorevinde toplanir
 * ("Evini Almanca anlat", "Gününü anlat", "Yarın ne yapmak istiyorsun?").
 * Bu gorev sans eseri secilmeye birakilmaz: kayitli oldugu modda oturuma HER
 * ZAMAN girer ve EN SONA konur. Kayitli olmayan konu/mod icin liste bostur.
 */
export const SESSION_CLOSING_TASKS: Record<string, Partial<Record<SessionMode, string[]>>> = {
  'topic.home': {
    full: ['p7-evim-free-tam-anlatim'],
    challenge: ['p7-evim-free-tam-anlatim'],
  },
  'topic.daily-routine': {
    full: ['p10-meintag-free-tam-anlatim'],
    challenge: ['p10-meintag-free-tam-anlatim'],
  },
  'topic.modal-verbs': {
    full: ['mv-free-morgen'],
    challenge: ['mv-free-morgen'],
  },
};

function closingTasks(mode: SessionMode, topicId: string | undefined, candidates: Exercise[]): Exercise[] {
  const ids = topicId && LESSON_MODES.has(mode) ? (SESSION_CLOSING_TASKS[topicId]?.[mode] ?? []) : [];
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
  /** Konu oturumunda, alistirmanin BIRINCIL konusu oturumun konusuysa. */
  primaryTopic: 2,
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
  /** Konunun (ya da Genel Tekrar modunun) tam havuzu. */
  pool: Exercise[];
  progress: UserProgress;
  mode: SessionMode;
  /**
   * Oturumun kanonik konusu. Konu modlarinda boyut istisnasi, kapanis
   * gorevi ve birincil-konu onceligi bununla belirlenir.
   */
  topicId?: string;
  /** `section` modunda zorunlu: yalnizca bu ozet bolumunun alistirmalari. */
  sectionId?: string;
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
  const { pool, progress, mode, topicId, sectionId, seed } = input;
  const config = MODE_CONFIG[mode];
  const conceptScores = new Map(
    [...computeConceptProgress(progress, uniqueExercises(pool))].map(
      ([id, item]) => [id, item.masteryScore] as const,
    ),
  );

  let candidates = uniqueExercises(pool);
  if (mode === 'section') {
    candidates = sectionId ? candidates.filter((exercise) => exercise.sectionId === sectionId) : [];
  }
  if (mode === 'challenge' || mode === 'gr-challenge') {
    candidates = challengeCandidates(candidates);
  } else if (config.difficulties) {
    candidates = candidates.filter((exercise) => config.difficulties!.includes(exercise.difficulty));
  }
  if (mode === 'quick' || mode === 'gr-quick') {
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

  // Konu oturumunda konunun kendi (birincil) alistirmalari esit durumda
  // one gecer; ikincil etiketliler havuzu zenginlestirir ama baskin olmaz.
  // Genel Tekrar konu kartinda ise Genel Tekrar bankasi sorulari one gecer.
  const primaryBonus = (exercise: Exercise) => {
    if (topicId && LESSON_MODES.has(mode)) return exercise.topicId === topicId ? SCORE.primaryTopic : 0;
    if (mode === 'gr-topic') return exercise.reviewOnly ? SCORE.primaryTopic : 0;
    return 0;
  };
  const scored = new Map(
    candidates.map((exercise) => [
      exercise.id,
      scoreExercise(exercise, progress, conceptScores) + primaryBonus(exercise),
    ]),
  );

  const rank = (a: Exercise, b: Exercise) =>
    (scored.get(b.id) ?? 0) - (scored.get(a.id) ?? 0) ||
    tieBreaker(a.id, seed) - tieBreaker(b.id, seed);

  const requestedSize = input.size ?? modeSize(mode, topicId);
  const primaryCount = Math.min(requestedSize, candidates.length);

  let selected =
    mode === 'challenge' || mode === 'gr-challenge'
      ? selectChallenge(candidates, primaryCount, rank)
      : selectByMix(candidates, primaryCount, config.mix, rank);
  if (mode === 'full') selected = ensureSectionCoverage(selected, candidates, primaryCount, rank);
  // Kucuk konu havuzlarinda tek bir aile oturumu doldurmasin: aralik (§32)
  // ancak ailenin payi sinirliysa korunabilir.
  // Zor oturumda degisim uretim/tanima dengesini bozmaz (§10).
  const sameKind =
    mode === 'challenge' || mode === 'gr-challenge'
      ? (a: Exercise, b: Exercise) => isProductionTask(a) === isProductionTask(b)
      : undefined;
  selected = limitFamilies(selected, candidates, rank, familyCap(primaryCount), sameKind);

  // Kapanis gorevi secime kalmaz: yoksa eklenir, varsa yerinde birakilir.
  const closing = closingTasks(mode, topicId, candidates);
  const missingClosing = closing.filter((task) => !selected.some((item) => item.id === task.id));
  if (missingClosing.length && primaryCount > 0) {
    const keep = selected.filter((item) => !closing.some((task) => task.id === item.id));
    const trimmed = keep.slice(0, Math.max(0, primaryCount - closing.length));
    selected = [...trimmed, ...closing];
  }

  const closingIds = new Set(closing.map((task) => task.id));
  const arranged = spaceFamilies(arrange(selected, seed));
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

/** Bir oturumda ayni aileden en fazla kac alistirma olabilir. */
export function familyCap(size: number): number {
  return Math.max(2, Math.ceil(size / (FAMILY_GAP * 2)));
}

/**
 * Sinirini asan ailenin en dusuk oncelikli uyelerini, siniri asmayan en
 * yuksek oncelikli adaylarla degistirir. Yeterli aday yoksa secim oldugu
 * gibi kalir (oturum kisalmaz).
 */
function limitFamilies(
  selected: Exercise[],
  candidates: Exercise[],
  rank: (a: Exercise, b: Exercise) => number,
  cap: number,
  compatible: (removed: Exercise, replacement: Exercise) => boolean = () => true,
): Exercise[] {
  const count = new Map<string, number>();
  for (const item of selected) if (item.familyId) count.set(item.familyId, (count.get(item.familyId) ?? 0) + 1);
  if (![...count.values()].some((value) => value > cap)) return selected;

  const chosen = new Set(selected.map((item) => item.id));
  const replacements = candidates
    .filter((item) => !chosen.has(item.id))
    .sort(rank);
  const next = [...selected];
  for (let index = next.length - 1; index >= 0; index -= 1) {
    const family = next[index].familyId;
    if (!family || (count.get(family) ?? 0) <= cap) continue;
    const removed = next[index];
    const replacementIndex = replacements.findIndex(
      (item) => (!item.familyId || (count.get(item.familyId) ?? 0) < cap) && compatible(removed, item),
    );
    if (replacementIndex === -1) continue;
    const [replacement] = replacements.splice(replacementIndex, 1);
    count.set(family, (count.get(family) ?? 0) - 1);
    if (replacement.familyId) count.set(replacement.familyId, (count.get(replacement.familyId) ?? 0) + 1);
    next[index] = replacement;
  }
  return next;
}

/** Tam çalışmada konunun her özet bölümü, kapasite el verdiği sürece temsil edilir. */
function ensureSectionCoverage(
  selected: Exercise[],
  candidates: Exercise[],
  size: number,
  rank: (a: Exercise, b: Exercise) => number,
): Exercise[] {
  if (size === 0) return [];
  const sectionOf = (item: Exercise) => item.sectionId ?? item.topicId;
  const next = [...selected];
  const seenSections = new Set(next.map(sectionOf));
  const sections = [...new Set(candidates.map(sectionOf))];
  for (const sectionId of sections) {
    if (seenSections.has(sectionId)) continue;
    const representative = candidates.filter((item) => sectionOf(item) === sectionId).sort(rank)[0];
    if (!representative) continue;
    // En kalabalik bolumun en dusuk oncelikli uyesi yer acar.
    let duplicateIndex = -1;
    for (let index = next.length - 1; index >= 0; index -= 1) {
      const key = sectionOf(next[index]);
      if (key !== sectionId && next.filter((other) => sectionOf(other) === key).length > 1) {
        duplicateIndex = index;
        break;
      }
    }
    if (duplicateIndex === -1) continue;
    next.splice(duplicateIndex, 1, representative);
    seenSections.add(sectionId);
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
 *   → kapanış güven sorusu
 */
function arrange(selected: Exercise[], seed: string): Exercise[] {
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

  const result = [...warmUp, ...orderedMedium, ...easy, ...hard];
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
export function sessionSize(mode: SessionMode, poolSize: number, topicId?: string): number {
  return Math.min(modeSize(mode, topicId), poolSize);
}
