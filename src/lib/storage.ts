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
import type { ExerciseSetId, LearningTrack } from '../content/types';
import { isLearningTrack } from '../content/types';

export const STORAGE_KEY = 'almanca-alistirma:progress';
export const BACKUP_KEY = 'almanca-alistirma:progress-backup';
export const STORAGE_VERSION = 8;

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
  day: number;
  track?: import('../content/types').LearningTrack;
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
  track?: import('../content/types').LearningTrack;
  day: number;
  topic: string;
  prompt: string;
  userAnswer: string;
  expectedAnswer: string;
  count: number;
  typoCount: number;
  lastOccurredAt: string;
  type: MistakeType;
}

export interface DayProgressState {
  day: number;
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
 * - `day`: gunun calisma modlarindan biri (normal/tam/hizli/zor/konu)
 * - `review`: Hatalarim ekranindan kurulan genel tekrar
 * - `mistakes`: BITEN BIR DERSIN hatalarindan kurulan hedefli tekrar (§5)
 */
export type LessonKind = 'day' | 'review' | 'mistakes';

/** Ders ici ardisik dogru serisi — yenilemeye dayanmasi icin oturumda saklanir. */
export interface StreakState {
  current: number;
  best: number;
  /** Bu oturumda zaten kutlanmis esikler; ayni esik iki kez kutlanmaz. */
  firedMilestones: number[];
}

export interface ActiveLesson {
  /** Gunluk ders icin gun numarasi; tekrar oturumunda `review` / `mistakes`. */
  mode: LessonKind;
  /** Hangi izlek — normal ve private birbirinden bağımsızdır. */
  track?: LearningTrack;
  day?: number;
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
  /** v2: hangi calisma modu (normal / tam / hizli / zor / konu). */
  sessionMode?: SessionMode;
  /** v2: `topic` modunda calisilan ozet konusu. */
  topicId?: string;
  /** İlk üç gündeki bağımsız alıştırma seti. */
  exerciseSetId?: ExerciseSetId;
  /** v7: ders ici dogru serisi. */
  streak?: StreakState;
  /** v7: `mistakes` modunda hangi oturumun hatalarindan kuruldugu. */
  sourceSessionId?: string;
}

export type SessionMode = 'normal' | 'full' | 'quick' | 'challenge' | 'topic' | 'set';

/**
 * v7: Biten bir dersin YAPILI sonucu.
 *
 * Tamamlanma ekrani yalnizca bunu tuketir; kirilgan rota state'inden hicbir sey
 * yeniden kurulmaz. Kalici oldugu icin sayfa yenilense de sonuc, hatalar ve
 * challenge baglami kaybolmaz (§13, §14).
 */
export interface LessonResult {
  sessionId: string;
  track?: LearningTrack;
  day?: number;
  mode: LessonKind;
  sessionMode?: SessionMode;
  topicId?: string;
  exerciseSetId?: ExerciseSetId;
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

export interface UserProgress {
  version: number;
  createdAt: string;
  updatedAt: string;
  days: Record<number, DayProgressState>;
  /** v8: izlek bazlı gün sayaçları — tracks.normal.days === days (senkron tutulur). */
  tracks?: Record<LearningTrack, { days: Record<number, DayProgressState> }>;
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

export function getTrackDays(progress: UserProgress, track: LearningTrack): Record<number, DayProgressState> {
  if (progress.tracks && progress.tracks[track]) return progress.tracks[track].days;
  if (track === 'normal') return progress.days;
  return {};
}

export function setTrackDays(progress: UserProgress, track: LearningTrack, days: Record<number, DayProgressState>): UserProgress {
  const tracks = progress.tracks ?? { normal: { days: progress.days }, private: { days: {} } };
  const nextTracks: Record<LearningTrack, { days: Record<number, DayProgressState> }> = {
    normal: { days: track === 'normal' ? days : tracks.normal.days },
    private: { days: track === 'private' ? days : tracks.private.days },
  };
  // keep legacy days in sync for normal
  return { ...progress, days: nextTracks.normal.days, tracks: nextTracks };
}

export function createEmptyProgress(): UserProgress {
  const now = new Date().toISOString();
  const tracks: Record<LearningTrack, { days: Record<number, DayProgressState> }> = {
    normal: { days: {} },
    private: { days: {} },
  };
  return {
    version: STORAGE_VERSION,
    createdAt: now,
    updatedAt: now,
    days: tracks.normal.days,
    tracks,
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
      activeLesson: progress.activeLesson
        ? {
            ...progress.activeLesson,
            track: isLearningTrack((progress.activeLesson as unknown as { track?: unknown }).track) ? (progress.activeLesson as unknown as { track: LearningTrack }).track : undefined,
          }
        : undefined,
      lastResult: progress.lastResult
        ? {
            ...progress.lastResult,
            track: isLearningTrack((progress.lastResult as unknown as { track?: unknown }).track) ? (progress.lastResult as unknown as { track: LearningTrack }).track : undefined,
          }
        : undefined,
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
    activeLesson: progress.activeLesson
      ? {
          ...progress.activeLesson,
          track: isLearningTrack((progress.activeLesson as unknown as { track?: unknown }).track) ? (progress.activeLesson as unknown as { track: LearningTrack }).track : undefined,
        }
      : undefined,
    lastResult: progress.lastResult
      ? {
          ...progress.lastResult,
          track: isLearningTrack((progress.lastResult as unknown as { track?: unknown }).track) ? (progress.lastResult as unknown as { track: LearningTrack }).track : undefined,
        }
      : undefined,
  };
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
        mode: isLessonKind(progress.activeLesson.mode) ? progress.activeLesson.mode : 'day',
      }
      : undefined,
  };
}

function isLessonKind(value: unknown): value is LessonKind {
  return value === 'day' || value === 'review' || value === 'mistakes';
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

export function migrate(raw: unknown): UserProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<UserProgress> & { version?: number };
  if (typeof data.version !== 'number') return null;
  if (data.version > STORAGE_VERSION) return null;

  let progress: UserProgress = {
    ...createEmptyProgress(),
    ...data,
    days: data.days ?? {},
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

  // ensure tracks exists even if file was manually edited
  if (!progress.tracks || !progress.tracks.normal || !progress.tracks.private) {
    const normalDays = progress.tracks?.normal?.days ?? progress.days ?? {};
    const privateDays = progress.tracks?.private?.days ?? {};
    progress = { ...progress, days: normalDays, tracks: { normal: { days: normalDays }, private: { days: privateDays } } };
  } else {
    // keep legacy days in sync
    progress = { ...progress, days: progress.tracks.normal.days };
  }
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

export function loadProgress(storage: Storage = localStorage): UserProgress {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return createEmptyProgress();
  }
  if (!raw) return createEmptyProgress();

  try {
    const migrated = migrate(JSON.parse(raw));
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

export function parseImportedProgress(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Dosya geçerli bir JSON değil.' };
  }
  if (!isValidProgress(parsed)) {
    return { ok: false, error: 'Dosya bir ilerleme yedeği gibi görünmüyor.' };
  }
  const migrated = migrate(parsed);
  if (!migrated) {
    return { ok: false, error: 'Yedek, bu sürümden daha yeni bir şemayla oluşturulmuş.' };
  }
  return { ok: true, progress: migrated };
}
