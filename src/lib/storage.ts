/**
 * localStorage kalici ilerleme katmani.
 *
 * Kurallar:
 * - Icerik senkronu, sunucu yeniden baslatma veya sayfa yenileme ilerlemeyi ASLA silmez.
 * - Sema surumu saklanir; eski surumler `migrate` ile tasinir.
 * - Bozuk veri bulunursa yedegi ayri anahtarda saklanir, ilerleme sifirdan baslar.
 */

import {
  DEFAULT_GERMAN_VOICE_ID,
  isGermanVoiceId,
  isSpeechSpeed,
  type GermanVoiceId,
  type SpeechSpeed,
} from './audio/tts';
import type { LearningTrack } from '../content/types';
import { isLearningTrack } from '../content/types';
import {
  LEGACY_CONCEPT_MAP,
  LEGACY_REVIEW_GROUP_MAP,
  LEGACY_SECTION_MAP,
  RETIRED_LEGACY_EXERCISES,
} from '../content/curriculum/legacy';
import { SECTION_BY_ID, TOPIC_BY_ID } from '../content/curriculum/topics';

export const STORAGE_KEY = 'almanca-alistirma:progress';
export const BACKUP_KEY = 'almanca-alistirma:progress-backup';
export const STORAGE_VERSION = 10;

export type AttemptResult = 'correct' | 'minor-typo' | 'incorrect' | 'skipped' | 'self-assessed';

export type MistakeType =
  | 'grammar'
  | 'spelling'
  | 'article'
  | 'vocabulary'
  | 'word-order'
  | 'unknown';

export interface ExerciseAttempt {
  timestamp: string;
  input: unknown;
  normalizedInput?: string;
  expected?: string;
  result: AttemptResult;
  attemptNumber: number;
  hintUsed?: boolean;
  responseTimeMs?: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  /** Tarihî gün (v10 öncesi kayıtlardan) — yalnızca iz; hiçbir davranışı sürmez. */
  legacyDay?: number;
  attempts: ExerciseAttempt[];
  firstSeenAt: string;
  lastSeenAt: string;
  correctCount: number;
  incorrectCount: number;
  typoCount: number;
  mastered?: boolean;
}

export interface MistakeRecord {
  exerciseId: string;
  /** Kanonik konu kimliği (`topic.modal-verbs`); içerikte bulunamazsa boş. */
  topicId: string;
  /** Konu başlığı (kayıt anındaki). */
  topic: string;
  /** Tarihî gün (v10 öncesi kayıtlardan) — yalnızca iz. */
  legacyDay?: number;
  prompt: string;
  userAnswer: string;
  expectedAnswer: string;
  count: number;
  typoCount: number;
  lastOccurredAt: string;
  type: MistakeType;
}

/** v9 öncesi gün sayacı — yalnızca göç ve `legacy` arşivi için. */
export interface DayProgressState {
  day: number;
  sessionsCompleted: number;
  lastCompletedAt?: string;
}

/** v10: konu başına tamamlanan oturum sayacı (tohum ve bilgi için). */
export interface TopicProgressState {
  topicId: string;
  sessionsCompleted: number;
  lastCompletedAt?: string;
}

/** Bir alıştırmanın oturumda neden gösterildiğini açıkça belirtir. */
export type PresentationReason = 'primary' | 'mistake-retry';

/**
 * Kuyrukta yalnızca ID tutulmaz: normal birincil sunum ile bilerek
 * planlanmış hata tekrarı birbirinden ayrılır.
 */
export interface SessionPresentation {
  exerciseId: string;
  presentationReason: PresentationReason;
}

/**
 * Bir oturumun turu.
 * - `topic`: bir konunun calisma modlarindan biri (normal/tam/hizli/zor/bolum)
 * - `review`: Genel Tekrar ya da Hatalarim ekranindan kurulan tekrar
 * - `mistakes`: BITEN BIR DERSIN hatalarindan kurulan hedefli tekrar
 */
export type LessonKind = 'topic' | 'review' | 'mistakes';

/** Ders ici ardisik dogru serisi — yenilemeye dayanmasi icin oturumda saklanir. */
export interface StreakState {
  current: number;
  best: number;
  /** Bu oturumda zaten kutlanmis esikler; ayni esik iki kez kutlanmaz. */
  firedMilestones: number[];
}

export interface ActiveLesson {
  mode: LessonKind;
  /** Kanonik konu (`topic` oturumu ya da Genel Tekrar konu filtresi). */
  topicId?: string;
  /** Bölüm pratiği (`section` modu) için özet bölümü. */
  sectionId?: string;
  /** v10 öncesinden devralınan yarım gün dersinin tarihî günü (yalnızca etiket). */
  legacyDay?: number;
  queue: SessionPresentation[];
  index: number;
  startedAt: string;
  /** Oturum icinde alinan sonuclar (ozet ekrani icin). */
  results: Array<{
    exerciseId: string;
    result: AttemptResult;
    /** v7: birincil sunum mu, ders ici hata tekrari mi. */
    presentationReason?: PresentationReason;
  }>;
  /** Alistirma basina bu oturumdaki tekrar sayisi. */
  retries: Record<string, number>;
  /** Hangi calisma modu (normal / tam / hizli / zor / bolum / Genel Tekrar modlari). */
  sessionMode?: SessionMode;
  /** v7: ders ici dogru serisi. */
  streak?: StreakState;
  /** v7: `mistakes` modunda hangi oturumun hatalarindan kuruldugu. */
  sourceSessionId?: string;
}

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

/**
 * v7: Biten bir dersin YAPILI sonucu.
 *
 * Tamamlanma ekrani yalnizca bunu tuketir; kirilgan rota state'inden hicbir sey
 * yeniden kurulmaz. Kalici oldugu icin sayfa yenilense de sonuc, hatalar ve
 * challenge baglami kaybolmaz (§13, §14).
 */
export interface LessonResult {
  sessionId: string;
  mode: LessonKind;
  sessionMode?: SessionMode;
  /** Kanonik konu (konu oturumu ya da Genel Tekrar konu filtresi). */
  topicId?: string;
  sectionId?: string;
  /** Oturumda gorulen benzersiz alistirmalar. */
  exerciseIds: string[];
  /** Oturumda en az bir kez yanlis cevaplananlar (istatistik icin). */
  incorrectExerciseIds: string[];
  /** Oturum sonunda HÂLÂ yanlis/atlanmis kalanlar — tekrar kuyrugunun kaynagi. */
  unresolvedExerciseIds?: string[];
  typoExerciseIds: string[];
  skippedExerciseIds: string[];
  total: number;
  correctCount: number;
  incorrectCount: number;
  typoCount: number;
  skippedCount: number;
  selfAssessedCount: number;
  /** 0–1; puanlanabilir deneme yoksa null. */
  accuracy: number | null;
  strongestConceptIds: string[];
  weakestConceptIds: string[];
  topics: Array<{ topicId: string; title: string; correct: number; total: number }>;
  bestStreak: number;
  perfect: boolean;
  completedAt: string;
}

/** v7: Takvim gunu basina calisma etkinligi — gunluk hedef icin. */
export interface DailyActivity {
  /** Yerel takvim gunu, `YYYY-MM-DD`. */
  date: string;
  answered: number;
  activeMs: number;
  sessions: number;
  goalReachedAt?: string;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  /** v2: geri bildirimde Turkce yaklasik okunus gosterilsin mi. */
  showPronunciation: boolean;
  /** v2: ozet konusu ID → okundugu ISO tarih. */
  readSummaries: Record<string, string>;
  /** v2: yer imlenen ozet konulari. */
  bookmarks: string[];
  /** v3: dogru/yanlis geri bildirim sesleri. */
  soundEffects: boolean;
  /** v3: egzersiz ve geri bildirimde kanonik Almanca otomatik dinletilsin mi. */
  autoPronunciation: boolean;
  /** v3/v6: Piper yavaş, normal veya hızlı yeniden dinleme hızı. */
  speechSpeed: SpeechSpeed;
  /** v4: kullanıcının kalıcı görünüm tercihi. */
  themePreference: 'light' | 'dark' | 'system';
  /** v5: kullanıcının yerel Piper Almanca ses tercihi. */
  speechVoice: GermanVoiceId;
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalMinutes: 10,
  showPronunciation: true,
  readSummaries: {},
  bookmarks: [],
  soundEffects: true,
  autoPronunciation: true,
  speechSpeed: 'normal',
  themePreference: 'system',
  speechVoice: DEFAULT_GERMAN_VOICE_ID,
};

export interface GlobalStats {
  totalAttempts: number;
  totalCorrect: number;
  totalTypos: number;
  totalIncorrect: number;
  lastStudiedAt?: string;
  /** Calisilan gunlerin ISO tarihleri (YYYY-MM-DD), benzersiz. */
  studyDates: string[];
}

/** v10 göçünün arşivi: eski gün sayaçları ve göçte düşülen kayıtlar. Hiçbir davranışı sürmez. */
export interface LegacyArchive {
  days?: Record<number, DayProgressState>;
  /** Çözülemeyen (emekli alıştırmaya ait) hata kayıtları. */
  droppedMistakeIds?: string[];
  migratedFromVersion?: number;
}

export interface UserProgress {
  version: number;
  createdAt: string;
  updatedAt: string;
  /** v10: konu → oturum sayacı. */
  topics: Record<string, TopicProgressState>;
  /** v10 öncesi gün tabanlı durumun salt okunur arşivi. */
  legacy?: LegacyArchive;
  /** v9 öncesi artıklar — yalnızca göç sırasında okunur. */
  days?: Record<number, DayProgressState>;
  tracks?: Record<string, { days: Record<number, DayProgressState> }>;
  exercises: Record<string, ExerciseProgress>;
  mistakes: Record<string, MistakeRecord>;
  activeLesson?: ActiveLesson;
  settings: UserSettings;
  stats: GlobalStats;
  /** v2: son gorulen icerik surumu — yalnizca bilgilendirme. */
  contentVersion?: string;
  /** v7: en son tamamlanan dersin sonucu (tamamlanma ekraninin tek kaynagi). */
  lastResult?: LessonResult;
  /** v7: takvim gunu → o gunun calisma etkinligi. */
  daily: Record<string, DailyActivity>;
}

/** Konu oturum sayacı. */
export function getTopicEntry(progress: UserProgress, topicId: string): TopicProgressState | undefined {
  return progress.topics[topicId];
}

export function createEmptyProgress(): UserProgress {
  const now = new Date().toISOString();
  return {
    version: STORAGE_VERSION,
    createdAt: now,
    updatedAt: now,
    topics: {},
    exercises: {},
    mistakes: {},
    daily: {},
    settings: { ...DEFAULT_SETTINGS },
    stats: {
      totalAttempts: 0,
      totalCorrect: 0,
      totalTypos: 0,
      totalIncorrect: 0,
      studyDates: [],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Gecis (migration)                                                   */
/* ------------------------------------------------------------------ */

/**
 * v1 → v2 gecisi.
 *
 * v2 yalnizca AYAR alanlari ekler; deneme gecmisi, hatalar, gun durumu ve
 * istatistikler oldugu gibi tasinir. Hicbir ilerleme silinmez.
 */
function migrateV1ToV2(progress: UserProgress): UserProgress {
  const incoming = (progress.settings ?? {}) as Partial<UserSettings>;
  return {
    ...progress,
    version: 2,
    settings: {
      dailyGoalMinutes: incoming.dailyGoalMinutes ?? DEFAULT_SETTINGS.dailyGoalMinutes,
      // Varsayilan ACIK (§17).
      showPronunciation: incoming.showPronunciation ?? DEFAULT_SETTINGS.showPronunciation,
      readSummaries: incoming.readSummaries ?? {},
      bookmarks: incoming.bookmarks ?? [],
      soundEffects: incoming.soundEffects ?? DEFAULT_SETTINGS.soundEffects,
      autoPronunciation: incoming.autoPronunciation ?? DEFAULT_SETTINGS.autoPronunciation,
      speechSpeed: isSpeechSpeed(incoming.speechSpeed) ? incoming.speechSpeed : DEFAULT_SETTINGS.speechSpeed,
      themePreference: DEFAULT_SETTINGS.themePreference,
      speechVoice: DEFAULT_SETTINGS.speechVoice,
    },
  };
}

/** v2 → v3: ses tercihleri yalnizca eklenir; ilerleme kayitlari degismez. */
function migrateV2ToV3(progress: UserProgress): UserProgress {
  const incoming = progress.settings as Partial<UserSettings>;
  return {
    ...progress,
    version: 3,
    settings: {
      ...incoming,
      soundEffects: incoming.soundEffects ?? DEFAULT_SETTINGS.soundEffects,
      autoPronunciation: incoming.autoPronunciation ?? DEFAULT_SETTINGS.autoPronunciation,
      speechSpeed: isSpeechSpeed(incoming.speechSpeed) ? incoming.speechSpeed : DEFAULT_SETTINGS.speechSpeed,
    } as UserSettings,
  };
}

/**
 * v3 → v4: yarım ders kuyruğuna sunum gerekçesi ve görünüm tercihi ekler.
 * Eski kuyrukta aynı ID birden çok kez varsa yalnızca ilk sunum primary,
 * sonrakiler geçmişte planlanmış retry olarak korunur.
 */
function migrateV3ToV4(progress: UserProgress): UserProgress {
  const rawQueue = progress.activeLesson?.queue as unknown;
  const seenPrimary = new Set<string>();
  const queue = Array.isArray(rawQueue)
    ? rawQueue.flatMap((item): SessionPresentation[] => {
      if (typeof item === 'string' && item) {
        const presentationReason: PresentationReason = seenPrimary.has(item) ? 'mistake-retry' : 'primary';
        seenPrimary.add(item);
        return [{ exerciseId: item, presentationReason }];
      }
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Partial<SessionPresentation>).exerciseId === 'string'
      ) {
        const presentation = item as Partial<SessionPresentation>;
        const exerciseId = presentation.exerciseId!;
        const presentationReason: PresentationReason =
          presentation.presentationReason === 'mistake-retry' ? 'mistake-retry' : 'primary';
        seenPrimary.add(exerciseId);
        return [{ exerciseId, presentationReason }];
      }
      return [];
    })
    : [];
  const incoming = progress.settings as Partial<UserSettings>;

  return {
    ...progress,
    version: 4,
    activeLesson: progress.activeLesson ? { ...progress.activeLesson, queue } : undefined,
    settings: {
      ...incoming,
      themePreference:
        incoming.themePreference === 'light' || incoming.themePreference === 'dark'
          ? incoming.themePreference
          : 'system',
    } as UserSettings,
  };
}

/** v4 → v5: ses tercihi eklenir; geçersiz dışa aktarma değeri varsayılana döner. */
function migrateV4ToV5(progress: UserProgress): UserProgress {
  const incoming = progress.settings as Partial<UserSettings>;
  return {
    ...progress,
    version: 5,
    settings: {
      ...incoming,
      speechVoice: isGermanVoiceId(incoming.speechVoice) ? incoming.speechVoice : DEFAULT_SETTINGS.speechVoice,
    } as UserSettings,
  };
}

/** v5 → v6: hızlı seçenek eklenir ve içe aktarılan hız değeri doğrulanır. */
function migrateV5ToV6(progress: UserProgress): UserProgress {
  const incoming = progress.settings as Partial<UserSettings>;
  return {
    ...progress,
    version: 6,
    settings: {
      ...incoming,
      speechSpeed: isSpeechSpeed(incoming.speechSpeed) ? incoming.speechSpeed : DEFAULT_SETTINGS.speechSpeed,
    } as UserSettings,
  };
}

/**
 * v6 → v7: gunluk hedef sayaci ve son ders sonucu eklenir.
 *
 * Yalnizca EKLER: deneme gecmisi, hatalar, gun durumu ve ayarlar oldugu gibi
 * tasinir. Yarim kalan ders varsa seri durumu sifirdan baslar (kutlama esikleri
 * yeniden kazanilabilir), sorular ve cevaplar korunur.
 */
function migrateV7ToV8(progress: UserProgress): UserProgress {
  const rawTracks = (progress as unknown as { tracks?: unknown }).tracks;
  if (rawTracks && typeof rawTracks === 'object' && 'normal' in (rawTracks as object) && 'private' in (rawTracks as object)) {
    const tracks = rawTracks as Record<LearningTrack, { days: Record<number, DayProgressState> }>;
    const rawNormal = tracks.normal?.days;
    const rawPrivate = tracks.private?.days;
    const normalDays = rawNormal && Object.keys(rawNormal).length ? rawNormal : (progress.days ?? {});
    const privateDays = rawPrivate && Object.keys(rawPrivate).length ? rawPrivate : {};
    // ensure valid shape
    const validatedTracks: Record<LearningTrack, { days: Record<number, DayProgressState> }> = {
      normal: { days: typeof normalDays === 'object' && normalDays !== null ? normalDays : {} },
      private: { days: typeof privateDays === 'object' && privateDays !== null ? privateDays : {} },
    };
    return {
      ...progress,
      version: 8,
      days: validatedTracks.normal.days,
      tracks: validatedTracks,
      activeLesson: withLegacyTrack(progress.activeLesson),
      lastResult: withLegacyTrack(progress.lastResult),
    };
  }
  const days = isDailyMap(progress.days) ? (progress.days as Record<number, DayProgressState>) : {};
  // also handle legacy days that might be Record<string,?>
  return {
    ...progress,
    version: 8,
    days,
    tracks: {
      normal: { days },
      private: { days: {} },
    },
    activeLesson: withLegacyTrack(progress.activeLesson),
    lastResult: withLegacyTrack(progress.lastResult),
  };
}

/** v8 kayıtlarındaki izlek alanını doğrular (v9 göçü onu okuyup siler). */
function withLegacyTrack<T extends object>(value: T | undefined): T | undefined {
  if (!value) return undefined;
  const track = (value as { track?: unknown }).track;
  return { ...value, track: isLearningTrack(track) ? (track as LearningTrack) : undefined } as T;
}

/**
 * v8 → v9: tek müfredata geçiş.
 *
 * - Gün sayaçları: `tracks.private.days` KAZANIR (üstüne yazar);
 *   altında kalan normal gün verisi yalnızca private'ta karşılığı yoksa korunur.
 * - Alıştırma/deneme kayıtları: yalnızca `track === 'private'` olanlar yaşar.
 *   Eski normal müfredat verisi bilinçli olarak taşınmaz (müfredat kaldırıldı).
 * - Hata kayıtları: aynı kural (yalnızca private yaşar).
 * - Yarım ders: private ise korunur, normal ise çöpe gider (içeriği yok).
 * - İstatistikler taşınan kayıtlardan yeniden hesaplanır; `studyDates` korunur.
 * - `tracks` anahtarı silinir; işlem idempotenttir.
 */
function migrateV8ToV9(progress: UserProgress): UserProgress {
  const rawTracks = (progress as unknown as { tracks?: unknown }).tracks;
  const privateDays: Record<number, DayProgressState> =
    rawTracks && typeof rawTracks === 'object' && (rawTracks as Record<string, { days?: unknown }>).private &&
    typeof ((rawTracks as Record<string, { days?: unknown }>).private as { days?: unknown }).days === 'object'
      ? (((rawTracks as Record<string, { days: Record<number, DayProgressState> }>).private.days ?? {}) as Record<number, DayProgressState>)
      : {};
  const days: Record<number, DayProgressState> = {
    ...(isDayMap(progress.days) ? progress.days : {}),
    ...privateDays,
  };

  const exercises: Record<string, ExerciseProgress> = {};
  for (const [id, entry] of Object.entries(progress.exercises ?? {})) {
    if ((entry as { track?: unknown }).track === 'private') exercises[id] = entry as ExerciseProgress;
  }
  const mistakes: Record<string, MistakeRecord> = {};
  for (const [id, record] of Object.entries(progress.mistakes ?? {})) {
    if ((record as { track?: unknown }).track === 'private') mistakes[id] = record as MistakeRecord;
  }

  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalTypos = 0;
  let totalIncorrect = 0;
  let lastStudiedAt: string | undefined;
  for (const entry of Object.values(exercises)) {
    totalAttempts += entry.attempts.length;
    totalCorrect += entry.correctCount;
    totalTypos += entry.typoCount;
    totalIncorrect += entry.incorrectCount;
    if (!lastStudiedAt || entry.lastSeenAt > lastStudiedAt) lastStudiedAt = entry.lastSeenAt;
  }

  const activeLesson =
    progress.activeLesson && (progress.activeLesson as unknown as { track?: unknown }).track === 'normal'
      ? undefined
      : progress.activeLesson;

  const next: UserProgress = {
    ...progress,
    version: 9,
    days,
    exercises,
    mistakes,
    activeLesson,
    stats: {
      totalAttempts,
      totalCorrect,
      totalTypos,
      totalIncorrect,
      lastStudiedAt,
      studyDates: progress.stats?.studyDates ?? [],
    },
  };
  delete (next as unknown as { tracks?: unknown }).tracks;
  return next;
}


/* ------------------------------------------------------------------ */
/* v9 → v10: gün tabanlı durum → konu tabanlı durum                     */
/* ------------------------------------------------------------------ */

/**
 * Göçün içerikten ihtiyaç duyduğu tek bilgi: alıştırma kimliği → birincil
 * kanonik konu. Verilmezse hata kayıtlarının konusu ekranda çözülür.
 */
export interface MigrationContext {
  topicOfExercise(exerciseId: string): { topicId: string; title: string } | undefined;
}

const legacySectionTarget = (id: string | undefined) => {
  if (!id) return undefined;
  const mapped = LEGACY_SECTION_MAP[id];
  if (!mapped) return undefined;
  const section = SECTION_BY_ID.get(mapped);
  return section ? { sectionId: section.id, topicId: section.topicId } : undefined;
};

const topicLabel = (topicId: string | undefined) => (topicId ? TOPIC_BY_ID.get(topicId)?.title : undefined);

/** Eski "konu" kimliği (gün bölümü ya da Genel Tekrar grubu) → kanonik konu. */
function mapLegacyTopicRef(id: string | undefined): { topicId?: string; sectionId?: string } {
  if (!id) return {};
  if (TOPIC_BY_ID.has(id)) return { topicId: id };
  const section = legacySectionTarget(id);
  if (section) return section;
  if (SECTION_BY_ID.has(id)) return { sectionId: id, topicId: SECTION_BY_ID.get(id)!.topicId };
  const review = LEGACY_REVIEW_GROUP_MAP[id];
  return review ? { topicId: review } : {};
}

function mapSessionMode(mode: unknown, hasSection: boolean): SessionMode | undefined {
  if (mode === 'topic') return hasSection ? 'section' : 'normal';
  if (mode === 'set') return 'normal';
  return typeof mode === 'string' ? (mode as SessionMode) : undefined;
}

function mapConceptIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((id) => (typeof id === 'string' ? (LEGACY_CONCEPT_MAP[id] ?? (id.startsWith('private.') ? '' : id)) : '')).filter(Boolean))];
}

/** Okundu/yer imi anahtarlarını eski bölüm kimliklerinden yenilerine taşır. */
function mapSummaryKey(id: string): string | undefined {
  if (id.startsWith('genel.') || SECTION_BY_ID.has(id)) return id;
  const target = legacySectionTarget(id);
  return target?.sectionId;
}

/**
 * v9 → v10 göçü. DETERMINISTIKTIR ve kayıp üretmez:
 *
 * - Deneme geçmişi (`exercises`) alıştırma kimliğiyle aynen kalır; ustalık,
 *   tamamlanma ve istatistik bu geçmişten konu bazında yeniden türetilir.
 *   Gün numarası yalnızca `legacyDay` izi olarak saklanır.
 * - Hata kayıtları kanonik konuya bağlanır; emekli alıştırmalara ait
 *   (çalışılamayan) kayıtlar düşer ve `legacy.droppedMistakeIds`e yazılır.
 * - Gün sayaçları `legacy.days` arşivine taşınır; konu sayaçları sıfırdan başlar.
 * - Yarım gün dersi, kuyruğu ve cevaplarıyla bir tekrar oturumu olarak sürer.
 * - Son ders sonucu, okundu işaretleri ve yer imleri yeni kimliklere taşınır.
 */
function migrateV9ToV10(progress: UserProgress, context?: MigrationContext): UserProgress {
  const exercises: Record<string, ExerciseProgress> = {};
  for (const [id, raw] of Object.entries(progress.exercises ?? {})) {
    const entry = { ...(raw as ExerciseProgress & { day?: unknown; track?: unknown }) };
    if (typeof entry.day === 'number' && entry.legacyDay === undefined) entry.legacyDay = entry.day;
    delete entry.day;
    delete entry.track;
    exercises[id] = entry as ExerciseProgress;
  }

  const mistakes: Record<string, MistakeRecord> = {};
  const droppedMistakeIds: string[] = [];
  for (const [id, raw] of Object.entries(progress.mistakes ?? {})) {
    const record = { ...(raw as MistakeRecord & { day?: unknown; track?: unknown }) };
    if (typeof record.day === 'number' && record.legacyDay === undefined) record.legacyDay = record.day;
    delete record.day;
    delete record.track;
    if (RETIRED_LEGACY_EXERCISES[id]) {
      droppedMistakeIds.push(id);
      continue;
    }
    const topic = context?.topicOfExercise(id);
    if (context && !topic) {
      droppedMistakeIds.push(id);
      continue;
    }
    record.topicId = topic?.topicId ?? (TOPIC_BY_ID.has(record.topicId) ? record.topicId : '');
    record.topic = topic?.title ?? topicLabel(record.topicId) ?? record.topic ?? '';
    mistakes[id] = record as MistakeRecord;
  }

  let activeLesson = progress.activeLesson ? { ...progress.activeLesson } as ActiveLesson & Record<string, unknown> : undefined;
  if (activeLesson) {
    const rawMode = activeLesson.mode as string;
    const ref = mapLegacyTopicRef(activeLesson.topicId);
    const legacyDay = typeof activeLesson.day === 'number' ? activeLesson.day : undefined;
    if (rawMode === 'day') {
      if ((activeLesson.sessionMode as string | undefined) === 'topic' && ref.sectionId && ref.topicId) {
        activeLesson = { ...activeLesson, mode: 'topic', topicId: ref.topicId, sectionId: ref.sectionId, sessionMode: 'section' };
      } else {
        // Günün karma kuyruğu tek bir konuya ait değildir: aynı sorular ve
        // verilen cevaplarla bir tekrar oturumu olarak sürer.
        activeLesson = { ...activeLesson, mode: 'review', topicId: undefined, sessionMode: undefined, legacyDay };
      }
    } else if (rawMode === 'review') {
      activeLesson = { ...activeLesson, topicId: ref.topicId, sessionMode: mapSessionMode(activeLesson.sessionMode, false) };
    } else {
      activeLesson = { ...activeLesson, topicId: ref.topicId, sessionMode: mapSessionMode(activeLesson.sessionMode, Boolean(ref.sectionId)) };
    }
    // Emekli alıştırmalar kuyruktan çıkar; konum buna göre kayar.
    const queue = Array.isArray(activeLesson.queue) ? activeLesson.queue : [];
    const keep = (item: SessionPresentation) => !RETIRED_LEGACY_EXERCISES[item.exerciseId];
    const removedBefore = queue.slice(0, activeLesson.index ?? 0).filter((item) => !keep(item)).length;
    activeLesson.queue = queue.filter(keep);
    activeLesson.index = Math.max(0, (activeLesson.index ?? 0) - removedBefore);
    delete activeLesson.day;
    delete activeLesson.track;
    delete activeLesson.exerciseSetId;
    if (activeLesson.topicId === undefined) delete activeLesson.topicId;
    if (activeLesson.sessionMode === undefined) delete activeLesson.sessionMode;
    if (!activeLesson.queue.length) activeLesson = undefined;
  }

  let lastResult = progress.lastResult ? { ...progress.lastResult } as LessonResult & Record<string, unknown> : undefined;
  if (lastResult) {
    const rawMode = lastResult.mode as string;
    const ref = mapLegacyTopicRef(lastResult.topicId);
    const sectionSession = (lastResult.sessionMode as string | undefined) === 'topic' && Boolean(ref.sectionId);
    const mode: LessonKind = rawMode === 'day' ? (sectionSession ? 'topic' : 'review') : (rawMode as LessonKind);
    const topicMap = new Map<string, { topicId: string; title: string; correct: number; total: number }>();
    for (const item of Array.isArray(lastResult.topics) ? lastResult.topics : []) {
      const target = mapLegacyTopicRef(item.topicId).topicId ?? (TOPIC_BY_ID.has(item.topicId) ? item.topicId : undefined);
      if (!target) continue;
      const entry = topicMap.get(target) ?? { topicId: target, title: topicLabel(target) ?? item.title, correct: 0, total: 0 };
      entry.correct += item.correct ?? 0;
      entry.total += item.total ?? 0;
      topicMap.set(target, entry);
    }
    lastResult = {
      ...lastResult,
      mode,
      topicId: rawMode === 'day' && !sectionSession ? undefined : ref.topicId,
      ...(sectionSession && ref.sectionId ? { sectionId: ref.sectionId } : {}),
      sessionMode: rawMode === 'day' && !sectionSession ? undefined : mapSessionMode(lastResult.sessionMode, sectionSession),
      topics: [...topicMap.values()].sort((a, b) => b.correct / Math.max(1, b.total) - a.correct / Math.max(1, a.total)),
      strongestConceptIds: mapConceptIds(lastResult.strongestConceptIds),
      weakestConceptIds: mapConceptIds(lastResult.weakestConceptIds),
    };
    delete lastResult.day;
    delete lastResult.track;
    delete lastResult.exerciseSetId;
    if (lastResult.topicId === undefined) delete lastResult.topicId;
    if (lastResult.sessionMode === undefined) delete lastResult.sessionMode;
  }

  const readSummaries: Record<string, string> = {};
  for (const [key, date] of Object.entries(progress.settings?.readSummaries ?? {})) {
    const mapped = mapSummaryKey(key);
    if (!mapped) continue;
    // Birden çok eski bölüm aynı yeni bölüme düşerse en erken tarih korunur.
    if (!readSummaries[mapped] || date < readSummaries[mapped]) readSummaries[mapped] = date;
  }
  const bookmarks = [...new Set((progress.settings?.bookmarks ?? []).map(mapSummaryKey).filter((id): id is string => Boolean(id)))];

  const legacyDays = isDayMap(progress.days) ? progress.days : {};
  const next: UserProgress = {
    ...progress,
    version: 10,
    topics: isTopicMap(progress.topics) ? progress.topics : {},
    exercises,
    mistakes,
    activeLesson: activeLesson as ActiveLesson | undefined,
    lastResult: lastResult as LessonResult | undefined,
    settings: { ...progress.settings, readSummaries, bookmarks },
    legacy: {
      ...(progress.legacy ?? {}),
      ...(Object.keys(legacyDays).length ? { days: legacyDays } : {}),
      ...(droppedMistakeIds.length ? { droppedMistakeIds: droppedMistakeIds.sort() } : {}),
      migratedFromVersion: 9,
    },
  };
  delete next.days;
  delete next.tracks;
  if (!next.activeLesson) delete next.activeLesson;
  if (!next.lastResult) delete next.lastResult;
  return next;
}

function isTopicMap(value: unknown): value is Record<string, TopicProgressState> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isDayMap(value: unknown): value is Record<number, DayProgressState> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function migrateV6ToV7(progress: UserProgress): UserProgress {
  const daily = isDailyMap(progress.daily) ? progress.daily : {};
  return {
    ...progress,
    version: 7,
    daily,
    lastResult: isLessonResult(progress.lastResult) ? progress.lastResult : undefined,
    activeLesson: progress.activeLesson
      ? {
        ...progress.activeLesson,
        mode: (isLessonKind(progress.activeLesson.mode) ? progress.activeLesson.mode : 'day') as LessonKind,
      }
      : undefined,
  };
}

/** v10 öncesi kayıtlarda `day` de geçerli bir tür idi; göç onu dönüştürür. */
function isLessonKind(value: unknown): value is LessonKind | 'day' {
  return value === 'topic' || value === 'day' || value === 'review' || value === 'mistakes';
}

function isDailyMap(value: unknown): value is Record<string, DailyActivity> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Ice aktarilan/eski kayittaki sonucun tamamlanma ekranini bozmayacagini garanti eder. */
export function isLessonResult(value: unknown): value is LessonResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<LessonResult>;
  return (
    typeof result.sessionId === 'string' &&
    isLessonKind(result.mode) &&
    Array.isArray(result.exerciseIds) &&
    Array.isArray(result.incorrectExerciseIds) &&
    Array.isArray(result.typoExerciseIds) &&
    typeof result.total === 'number' &&
    typeof result.completedAt === 'string'
  );
}

export function migrate(raw: unknown, context?: MigrationContext): UserProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<UserProgress> & { version?: number };
  if (typeof data.version !== 'number') return null;
  if (data.version > STORAGE_VERSION) return null;

  let progress: UserProgress = {
    ...createEmptyProgress(),
    ...data,
    ...(data.version < 10 ? { days: data.days ?? {} } : {}),
    topics: data.topics ?? {},
    exercises: data.exercises ?? {},
    mistakes: data.mistakes ?? {},
    daily: data.daily ?? {},
    settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
    stats: { ...createEmptyProgress().stats, ...(data.stats ?? {}) },
  } as UserProgress;

  // Surum gecisleri sirayla uygulanir.
  if (progress.version === 1) progress = migrateV1ToV2(progress);
  if (progress.version === 2) progress = migrateV2ToV3(progress);
  if (progress.version === 3) progress = migrateV3ToV4(progress);
  if (progress.version === 4) progress = migrateV4ToV5(progress);
  if (progress.version === 5) progress = migrateV5ToV6(progress);
  if (progress.version === 6) progress = migrateV6ToV7(progress);
  if (progress.version === 7) progress = migrateV7ToV8(progress);
  if (progress.version === 8) progress = migrateV8ToV9(progress);
  if (progress.version === 9) progress = migrateV9ToV10(progress, context);

  if (!isGermanVoiceId(progress.settings.speechVoice)) {
    progress = {
      ...progress,
      settings: { ...progress.settings, speechVoice: DEFAULT_SETTINGS.speechVoice },
    };
  }
  if (!isSpeechSpeed(progress.settings.speechSpeed)) {
    progress = {
      ...progress,
      settings: { ...progress.settings, speechSpeed: DEFAULT_SETTINGS.speechSpeed },
    };
  }

  // v10: konu tabanlı — gün haritası ve izlek artıkları taşınmaz.
  delete (progress as unknown as { tracks?: unknown }).tracks;
  delete (progress as unknown as { days?: unknown }).days;
  if (!isTopicMap(progress.topics)) progress = { ...progress, topics: {} };
  progress.version = STORAGE_VERSION;
  return progress;
}

export function isValidProgress(value: unknown): value is UserProgress {
  if (!value || typeof value !== 'object') return false;
  const data = value as UserProgress;
  return (
    typeof data.version === 'number' &&
    typeof data.exercises === 'object' &&
    data.exercises !== null &&
    typeof data.stats === 'object' &&
    data.stats !== null
  );
}

/* ------------------------------------------------------------------ */
/* Okuma / yazma                                                       */
/* ------------------------------------------------------------------ */

export function loadProgress(storage: Storage = localStorage, context?: MigrationContext): UserProgress {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return createEmptyProgress();
  }
  if (!raw) return createEmptyProgress();

  try {
    const migrated = migrate(JSON.parse(raw), context);
    if (migrated) return migrated;
    // Tanimsiz surum: veriyi silme, yedekle.
    storage.setItem(BACKUP_KEY, raw);
  } catch {
    try {
      storage.setItem(BACKUP_KEY, raw);
    } catch {
      /* yedekleme basarisizsa sessizce devam et */
    }
  }
  return createEmptyProgress();
}

export function saveProgress(progress: UserProgress, storage: Storage = localStorage): void {
  const next = { ...progress, updatedAt: new Date().toISOString() };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* kota dolu — sessizce devam et, oturum calismaya devam eder */
  }
}

export function serializeProgress(progress: UserProgress): string {
  return JSON.stringify(progress, null, 2);
}

export interface ImportResult {
  ok: boolean;
  progress?: UserProgress;
  error?: string;
}

export function parseImportedProgress(text: string, context?: MigrationContext): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Dosya geçerli bir JSON değil.' };
  }
  if (!isValidProgress(parsed)) {
    return { ok: false, error: 'Dosya bir ilerleme yedeği gibi görünmüyor.' };
  }
  const migrated = migrate(parsed, context);
  if (!migrated) {
    return { ok: false, error: 'Yedek, bu sürümden daha yeni bir şemayla oluşturulmuş.' };
  }
  return { ok: true, progress: migrated };
}
