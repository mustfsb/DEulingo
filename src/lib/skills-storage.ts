/**
 * İngilizce beceri ilerlemesi — Almanca verisinden TAMAMEN ayrı.
 *
 * Konu ilerlemesi (`progress-en`) Ders/Hata/Ustalık sisteminde yaşar;
 * burası BECERİ geçmişidir: okuma/dinleme/yazma/konuşma/haftalık plan.
 * Anahtarlar `-en` ad alanındadır; Almanca anahtarlara dokunulmaz.
 * Büyük ses blobları saklanmaz (kayıt meta verisi hafiftir).
 */

import { isChunk, staticTwinId, userVocabId, type SavedReadingVocab } from '../content/en/user-vocab';

export type SkillId = 'reading' | 'writing' | 'listening' | 'speaking';

export interface ReadingAttempt {
  passageId: string;
  correct: number;
  total: number;
  at: string;
  mistakeQuestionIds: string[];
  addedVocab: string[];
  /** Verilen cevaplar (soru kimliği → cevap); kanıt incelemesi için. Eski kayıtlarda yok. */
  answers?: Record<string, string>;
}

export interface ListeningAttempt {
  itemId: string;
  correct: boolean;
  replays: number;
  at: string;
}

export interface WritingEntry {
  id: string;
  taskId: string;
  draft1: string;
  feedback: Array<{ category: string; message: string; suggestion?: string }>;
  rewrite?: string;
  /** Planlama notları (taslaktan önce). Eski kayıtlarda yok. */
  plan?: string;
  /** Öğrencinin öz denetimde işaretlediği kontrol maddeleri. */
  checks?: string[];
  words1: number;
  words2?: number;
  at: string;
  updatedAt: string;
}

export interface SpeakingEntry {
  id: string;
  promptId: string;
  kind: string;
  at: string;
  transcript?: string;
  selfScore?: 'good' | 'needs-work';
  /** Blob saklanmaz; yalnızca kullanıcının kaydettiği not. */
  savedRecording: boolean;
}

/** Dış dinleme görevi ilerlemesi (devam edilebilir; ses/transkript saklanmaz). */
export interface ExternalListeningProgress {
  taskId: string;
  /** Soru kimliği → verilen cevap. */
  answers: Record<string, string>;
  /** Kontrol edilmiş aşamalar. */
  checked: { gist?: boolean; detail?: boolean };
  /** Transkript incelemesi yapıldı mı (öğrenci beyanı). */
  transcriptReviewed?: boolean;
  /** Sözlü özet: öz değerlendirme (ses saklanmaz). */
  spoken?: 'good' | 'needs-work';
  /** Yazılı özet metni. */
  summary?: string;
  updatedAt: string;
  completedAt?: string;
}

/** Bir haftalık aktivitede ölçülen GERÇEK aktif çalışma süresi. */
export interface ActivityTiming {
  /** Aktif saniye (arka plan sekmesi ve uzun boşta kalma sayılmaz). */
  activeSeconds: number;
  /** `Git` ile kaç kez açıldı. */
  visits: number;
  lastAt: string;
}

export interface WeeklyState {
  /** Oturum duzeyi eski isaretler (geriye uyumluluk; ilerleme artik aktiviteden turetilir). */
  completedSessions: string[];
  /**
   * Aktivite duzeyi isaretler (`en.w1.*` kararli kimlikler).
   * Dil + hafta + aktivite ad alanlidir; Almanca plan gelirse `de.w1.*`
   * kendi deposunda yasar.
   */
  completedActivities: string[];
  /** Aktivite kimliği → ölçülen aktif süre. Eski kayıtlarda yok → {}. */
  timing: Record<string, ActivityTiming>;
  /** Şu an süresi ölçülen aktivite (`Git` ile açılan); plan/ana sayfada null. */
  tracking: string | null;
  updatedAt: string;
}

export type { SavedReadingVocab } from '../content/en/user-vocab';

export interface EnSkillsState {
  reading: ReadingAttempt[];
  /** Okuma → Kelime Çıkarma ekranında seçilenler. Eski kayıtlarda yok → []. */
  readingVocab: SavedReadingVocab[];
  listening: ListeningAttempt[];
  writing: WritingEntry[];
  speaking: SpeakingEntry[];
  /** Dış dinleme görevleri (kimlik → ilerleme). Eski kayıtlarda yok → {}. */
  listeningTasks: Record<string, ExternalListeningProgress>;
  weekly: WeeklyState;
}

const KEY = 'almanca-alistirma:skills-en';

export function emptySkills(): EnSkillsState {
  return {
    reading: [], readingVocab: [], listening: [], writing: [], speaking: [], listeningTasks: {},
    weekly: { completedSessions: [], completedActivities: [], timing: {}, tracking: null, updatedAt: new Date().toISOString() },
  };
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Hafta 1 yeniden tasarımı: kimliği değişen aktivitelerin eşlemesi.
 * Yalnızca İÇERİĞİ EŞDEĞER olanlar taşınır; yeni eklenen iş asla
 * "tamamlandı" sayılmaz. Eşlemesi olmayan eski kimlikler listede kalır
 * (silinmez) ama ilerleme sayacına girmez.
 */
export const WEEK_ACTIVITY_MIGRATION: Record<string, string> = {
  // "Normal çalışma" (karışık 28 soru) → çekirdek tanı + kontrollü pratik seti.
  'en.w1.a.lesson': 'en.w1.a.recognition',
  // Session B'deki for/since diktesi, Session A'daki ile AYNI 13 cümleydi (kopya iş kaldırıldı).
  'en.w1.b.dictation': 'en.w1.a.dictation',
  // Zaman çizgisi bölümü → aynı bölümün sıralama/kutucuk yarısı.
  'en.w1.d.timeline': 'en.w1.d.timeline-build',
  // "Kalıp üretimi" bölümü → aynı bölümün serbest üretim yarısı.
  'en.w1.d.production': 'en.w1.d.gi-production',
};

export function migrateWeekActivities(completed: string[]): string[] {
  const out: string[] = [];
  for (const id of completed) {
    const next = WEEK_ACTIVITY_MIGRATION[id] ?? id;
    if (!out.includes(next)) out.push(next);
  }
  return out;
}

function sanitizeTiming(raw: unknown): Record<string, ActivityTiming> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, ActivityTiming> = {};
  for (const [id, value] of Object.entries(raw as Record<string, Partial<ActivityTiming> | null>)) {
    if (!value || typeof value.activeSeconds !== 'number' || !Number.isFinite(value.activeSeconds) || value.activeSeconds < 0) continue;
    out[id] = {
      activeSeconds: Math.round(value.activeSeconds),
      visits: typeof value.visits === 'number' && value.visits >= 0 ? Math.round(value.visits) : 0,
      lastAt: typeof value.lastAt === 'string' ? value.lastAt : new Date(0).toISOString(),
    };
  }
  return out;
}

function sanitizeListeningTasks(raw: unknown): Record<string, ExternalListeningProgress> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, ExternalListeningProgress> = {};
  for (const [id, value] of Object.entries(raw as Record<string, Partial<ExternalListeningProgress> | null>)) {
    if (!value || typeof value !== 'object') continue;
    const answers: Record<string, string> = {};
    for (const [qid, answer] of Object.entries(value.answers ?? {})) if (typeof answer === 'string') answers[qid] = answer;
    out[id] = {
      taskId: id,
      answers,
      checked: { gist: value.checked?.gist === true, detail: value.checked?.detail === true },
      transcriptReviewed: value.transcriptReviewed === true,
      ...(value.spoken === 'good' || value.spoken === 'needs-work' ? { spoken: value.spoken } : {}),
      ...(typeof value.summary === 'string' ? { summary: value.summary } : {}),
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date(0).toISOString(),
      ...(typeof value.completedAt === 'string' ? { completedAt: value.completedAt } : {}),
    };
  }
  return out;
}

/** Eski kayıtlara (id/type/chunk yok) kararlı alanlar ekler; bozukları ve kopyaları eler. */
export function sanitizeReadingVocab(raw: unknown[]): SavedReadingVocab[] {
  const seen = new Set<string>();
  const out: SavedReadingVocab[] = [];
  for (const value of raw) {
    const v = value as Partial<SavedReadingVocab> | null;
    if (!v || typeof v.en !== 'string' || typeof v.tr !== 'string' || !v.en.trim() || !v.tr.trim()) continue;
    const en = v.en.trim();
    const id = typeof v.id === 'string' && v.id.startsWith('en-uv-') ? v.id : userVocabId(en);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      en,
      tr: v.tr.trim(),
      type: v.type === 'phrase' || v.type === 'verb' || v.type === 'noun' || v.type === 'adjective' || v.type === 'adverb' || v.type === 'preposition' || v.type === 'other'
        ? v.type : (isChunk(en) ? 'phrase' : 'other'),
      chunk: typeof v.chunk === 'boolean' ? v.chunk : isChunk(en),
      passageId: typeof v.passageId === 'string' ? v.passageId : 'reading',
      at: typeof v.at === 'string' ? v.at : new Date(0).toISOString(),
      ...(typeof v.linkedId === 'string' && v.linkedId ? { linkedId: v.linkedId } : staticTwinId(en) ? { linkedId: staticTwinId(en) } : {}),
    });
  }
  return out;
}

export function loadSkills(storage: Storage = localStorage): EnSkillsState {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return emptySkills();
    const parsed = JSON.parse(raw) as Partial<EnSkillsState>;
    return {
      reading: Array.isArray(parsed.reading) ? parsed.reading : [],
      readingVocab: Array.isArray(parsed.readingVocab)
        ? sanitizeReadingVocab(parsed.readingVocab)
        : [],
      listening: Array.isArray(parsed.listening) ? parsed.listening : [],
      writing: Array.isArray(parsed.writing) ? parsed.writing : [],
      speaking: Array.isArray(parsed.speaking) ? parsed.speaking : [],
      listeningTasks: sanitizeListeningTasks(parsed.listeningTasks),
      weekly: parsed.weekly && Array.isArray(parsed.weekly.completedSessions)
        ? {
            completedSessions: stringList(parsed.weekly.completedSessions),
            completedActivities: migrateWeekActivities(stringList(
              (parsed.weekly as Partial<WeeklyState>).completedActivities,
            )),
            timing: sanitizeTiming((parsed.weekly as Partial<WeeklyState>).timing),
            tracking: typeof (parsed.weekly as Partial<WeeklyState>).tracking === 'string'
              ? (parsed.weekly as Partial<WeeklyState>).tracking as string
              : null,
            updatedAt: typeof parsed.weekly.updatedAt === 'string'
              ? parsed.weekly.updatedAt
              : new Date().toISOString(),
          }
        : { completedSessions: [], completedActivities: [], timing: {}, tracking: null, updatedAt: new Date().toISOString() },
    };
  } catch {
    return emptySkills();
  }
}

export function saveSkills(state: EnSkillsState, storage: Storage = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* kota dolu — sessizce devam */
  }
}

/** Aktivite isaretini acar/kapatir (manuel onay yetkilidir; saf islev). */
export function toggleWeekActivity(completed: string[], activityId: string): string[] {
  return completed.includes(activityId)
    ? completed.filter((id) => id !== activityId)
    : [...completed, activityId];
}

/** `Git`: bu aktivitenin süresi ölçülmeye başlar (ziyaret sayacı artar). */
export function startActivityTracking(state: EnSkillsState, activityId: string, now: string = new Date().toISOString()): EnSkillsState {
  const previous = state.weekly.timing[activityId];
  return {
    ...state,
    weekly: {
      ...state.weekly,
      tracking: activityId,
      timing: {
        ...state.weekly.timing,
        [activityId]: { activeSeconds: previous?.activeSeconds ?? 0, visits: (previous?.visits ?? 0) + 1, lastAt: now },
      },
    },
  };
}

/** Plana/ana sayfaya dönünce ölçüm durur (süre silinmez). */
export function stopActivityTracking(state: EnSkillsState): EnSkillsState {
  return state.weekly.tracking === null ? state : { ...state, weekly: { ...state.weekly, tracking: null } };
}

/** Ölçülen aktif saniyeleri, izlenen aktiviteye ekler (izleme yoksa dokunmaz). */
export function addActiveSeconds(state: EnSkillsState, seconds: number, now: string = new Date().toISOString()): EnSkillsState {
  const id = state.weekly.tracking;
  if (!id || !(seconds > 0)) return state;
  const previous = state.weekly.timing[id] ?? { activeSeconds: 0, visits: 1, lastAt: now };
  return {
    ...state,
    weekly: {
      ...state.weekly,
      timing: { ...state.weekly.timing, [id]: { ...previous, activeSeconds: previous.activeSeconds + Math.round(seconds), lastAt: now } },
    },
  };
}

/** Hafta ilerlemesi isaretlerden TURETILIR; ayri yuzde saklanmaz. */
export function weekActivityProgress(
  completed: string[],
  total: number,
): { done: number; total: number; percent: number } {
  const known = total > 0 ? completed.slice(0) : [];
  const done = Math.min(known.length, total);
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function skillProgressSummary(state: EnSkillsState): Record<SkillId, { done: number; accuracy: number | null }> {
  const readingDone = state.reading.length;
  const readingAcc = state.reading.length
    ? state.reading.reduce((s, r) => s + r.correct / Math.max(1, r.total), 0) / state.reading.length
    : null;
  const listeningDone = state.listening.length;
  const listeningAcc = state.listening.length
    ? state.listening.filter((l) => l.correct).length / state.listening.length
    : null;
  return {
    reading: { done: readingDone, accuracy: readingAcc },
    writing: { done: state.writing.length, accuracy: null },
    listening: { done: listeningDone, accuracy: listeningAcc },
    speaking: { done: state.speaking.length, accuracy: null },
  };
}

/** Deterministik "önerilen sonraki çalışma": zayıf beceri/konu + hatalar. */
export function recommendWeeklyNext(input: {
  skills: EnSkillsState;
  topicAccuracy: Map<string, number | null>;
  openMistakes: number;
}): { label: string; detail: string } {
  const { skills, topicAccuracy, openMistakes } = input;
  if (openMistakes >= 5) return { label: 'Hata tekrarı', detail: `${openMistakes} aktif hata birikti — önce hataları temizle.` };
  // en düşük doğruluklu konu
  let worst: string | null = null;
  let worstAcc = 2;
  for (const [id, acc] of topicAccuracy) {
    if (acc !== null && acc < worstAcc) { worstAcc = acc; worst = id; }
  }
  if (worst && worstAcc < 0.7) return { label: `${shortTopic(worst)} tekrar`, detail: `Doğruluk %${Math.round(worstAcc * 100)} — kısa tur önerilir.` };
  const summary = skillProgressSummary(skills);
  const order: SkillId[] = ['listening', 'speaking', 'writing', 'reading'];
  for (const skill of order) {
    if (summary[skill].done === 0) {
      return { label: skillLabel(skill), detail: 'Henüz hiç çalışılmadı — ilk turu başlat.' };
    }
  }
  if ((summary.listening.accuracy ?? 1) < 0.7) return { label: 'Listening', detail: 'Dinleme doğruluğu düşük — kısa dinleme turu.' };
  if ((summary.reading.accuracy ?? 1) < 0.7) return { label: 'Reading', detail: 'Okuma kanıtlarını tekrar incele.' };
  return { label: 'Weekly Review', detail: 'Haftalık karışıma hazırsın — Session G.' };
}

function shortTopic(id: string): string {
  const map: Record<string, string> = {
    'en.present-perfect': 'Present Perfect',
    'en.sentence-structure': 'Sentence Structure',
    'en.past-perfect': 'Past Perfect',
    'en.gerund-infinitive': 'Gerund & Infinitive',
    'en.conditionals': 'Conditionals',
    'en.prepositions-collocations': 'Prepositions',
  };
  return map[id] ?? id;
}

function skillLabel(skill: SkillId): string {
  return skill === 'reading' ? 'Reading' : skill === 'writing' ? 'Writing' : skill === 'listening' ? 'Listening' : 'Speaking';
}

/** Okumadan öğrencinin seçtiği öbeği kelime öğrenme sistemine ekler (kopya eklemez). */
export function addReadingVocab(
  state: EnSkillsState,
  item: { en: string; tr: string },
  passageId: string,
  now: string = new Date().toISOString(),
): EnSkillsState {
  const en = item.en.trim();
  const id = userVocabId(en);
  if (!en || state.readingVocab.some((entry) => entry.id === id)) return state;
  const chunk = isChunk(en);
  const twin = staticTwinId(en);
  const saved: SavedReadingVocab = {
    id, en, tr: item.tr.trim(), type: chunk ? 'phrase' : 'other', chunk, passageId, at: now,
    ...(twin ? { linkedId: twin } : {}),
  };
  return { ...state, readingVocab: [...state.readingVocab, saved] };
}

export function removeReadingVocab(state: EnSkillsState, id: string): EnSkillsState {
  return { ...state, readingVocab: state.readingVocab.filter((entry) => entry.id !== id) };
}
