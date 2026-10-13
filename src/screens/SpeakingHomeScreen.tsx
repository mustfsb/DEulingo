/**
 * Speaking: oku / gölgele / cevapla / IELTS Part 1.
 * Kayıt + tekrar + (varsa) STT; telaffuz puanı UYDURULMAZ.
 */

import { useState } from 'react';
import { EN_SPEAKING_BY_ID, EN_SPEAKING_FOCUS_TAGS, EN_SPEAKING_PROMPTS, speakingPool, type SpeakingKind } from '../content/en/skills-speaking';
import { EN_TOPIC_BY_ID } from '../content/en/topics';
import { audioController } from '../lib/audio/playback';
import { DEFAULT_GERMAN_VOICE_ID } from '../lib/audio/tts';
import { isRecordingSupported, isSttSupported, transcriptMatchesReference, useRecorder, useSpeechRecognition } from '../lib/audio/voice';
import type { ProgressApi } from '../hooks/useProgress';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

/** Derin baglanti girisi: tur filtresi + dogrudan istem. */
export interface SpeakingInitial {
  kind?: SpeakingKind;
  promptId?: string;
  /** Konu + odak kesişimi (haftalık plan): yalnızca o istem havuzu yüklenir. */
  topicId?: string;
  focus?: string;
  /** Önceki cevaplardan tekrar gerekenleri öne al. */
  retry?: boolean;
}

/** Kapsam etiketi → kullanıcıya gösterilen başlık. */
const FOCUS_LABELS: Record<string, string> = {
  'pp-shadowing': 'Gölgeleme',
  'pp-read': 'Sesli Okuma',
  'pp-personal': 'Kişisel Sorular',
  'pp-monologue': 'Mini Monolog',
  'pp-long-turn': 'Uzun Konuşma',
  'ppf-gi': 'Past Perfect + Gerund/Infinitive',
  'reading-talk': 'Okuduğunu Anlat',
  'second-conditional': 'Second Conditional',
  'week1-test': 'Hafta 1 Konuşma Testi',
};

const SPEAKING_FILTERS = ['all', 'read-aloud', 'shadowing', 'short-answer', 'topic', 'ielts-part1'] as const;
type SpeakingFilter = (typeof SPEAKING_FILTERS)[number];

function sanitizeSpeakingInitial(initial?: SpeakingInitial): {
  filter: SpeakingFilter;
  promptId?: string;
  topic?: string;
  focus?: string;
  retry: boolean;
} {
  const prompt = initial?.promptId && EN_SPEAKING_BY_ID.has(initial.promptId)
    ? EN_SPEAKING_BY_ID.get(initial.promptId)!
    : undefined;
  const kind: SpeakingFilter = initial?.kind && (SPEAKING_FILTERS as readonly string[]).includes(initial.kind)
    ? initial.kind
    : 'all';
  const topic = initial?.topicId && EN_TOPIC_BY_ID.has(initial.topicId) ? initial.topicId : undefined;
  const focus = initial?.focus && EN_SPEAKING_FOCUS_TAGS.includes(initial.focus) ? initial.focus : undefined;
  const retry = initial?.retry === true;
  if (prompt && kind !== 'all' && prompt.kind !== kind) {
    return { filter: 'all', promptId: prompt.id, topic, focus, retry };
  }
  return { filter: prompt && kind === 'all' && !focus && !topic ? prompt.kind : kind, promptId: prompt?.id, topic, focus, retry };
}

/** Her istemin EN SON denemesi. */
function latestAttempts(skills: EnSkillsState) {
  const latest = new Map<string, EnSkillsState['speaking'][number]>();
  for (const entry of skills.speaking) latest.set(entry.promptId, entry);
  return latest;
}

/** Son deneme "tekrar gerek" ya da referansla uyuşmuyorsa tekrar adayıdır. */
function retryCandidates(prompts: ReturnType<typeof speakingPool>, skills: EnSkillsState) {
  const latest = latestAttempts(skills);
  return prompts.filter((p) => {
    const entry = latest.get(p.id);
    if (!entry) return false;
    if (entry.selfScore === 'needs-work') return true;
    return !!(p.reference && entry.transcript && !transcriptMatchesReference(entry.transcript, p.reference).hit);
  });
}

export function SpeakingHomeScreen({
  skills,
  onRecord,
  navigate,
  api,
  initial,
}: {
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
  /** Varsa ayarlanan İngilizce ses kullanılır; yoksa varsayılan (Jenny). */
  api?: ProgressApi;
  /** Derin baglanti: tur filtresi + dogrudan istem. */
  initial?: SpeakingInitial;
}) {
  const speechVoice = api?.progress.settings.speechVoice ?? DEFAULT_GERMAN_VOICE_ID;
  const [sanitized] = useState(() => sanitizeSpeakingInitial(initial));
  const [filter, setFilter] = useState<SpeakingFilter>(sanitized.filter);
  // Kapsamlı giriş (konu/odak) istem belirtmiyorsa ilk istem hazır açılır.
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (sanitized.promptId) return sanitized.promptId;
    if (!sanitized.topic && !sanitized.focus) return null;
    const pool = speakingPool({ topicId: sanitized.topic, focus: sanitized.focus, kind: sanitized.filter === 'all' ? undefined : sanitized.filter });
    const retryPool = sanitized.retry ? retryCandidates(pool, skills) : [];
    return (retryPool[0] ?? pool[0])?.id ?? null;
  });
  const [playingRef, setPlayingRef] = useState(false);
  const rec = useRecorder();
  const stt = useSpeechRecognition('en-GB');
  const active = EN_SPEAKING_PROMPTS.find((p) => p.id === activeId) ?? null;

  const scoped = speakingPool({ topicId: sanitized.topic, focus: sanitized.focus, kind: filter === 'all' ? undefined : filter });
  const latest = latestAttempts(skills);
  // Retry: önceki denemede "tekrar gerek" denen (ya da referansla uyuşmayan) cevaplar.
  const retryList = sanitized.retry ? retryCandidates(scoped, skills) : [];
  const retryFallback = sanitized.retry && retryList.length === 0;
  // Haftalık test: ipucu (hedef kalıp, örnek cevap) test bitene kadar gizli.
  const isTest = sanitized.focus === 'week1-test';
  const list = sanitized.retry && !retryFallback ? retryList : scoped;
  const scopeTitle = sanitized.retry
    ? 'Tekrar: önceki cevaplarını düzelt'
    : sanitized.focus ? FOCUS_LABELS[sanitized.focus] ?? sanitized.focus : undefined;
  const [rated, setRated] = useState<string | null>(null);
  // Hazırlık notları yalnızca bu oturumda yaşar (anahtar kelime; cümle değil).
  const [notes, setNotes] = useState<Record<string, string>>({});
  const scopedEntry = !!(sanitized.topic || sanitized.focus);
  const doneInScope = list.filter((p) => latest.has(p.id)).length;
  const nextPrompt = active ? list[list.findIndex((p) => p.id === active.id) + 1] ?? null : null;
  const selectPrompt = (id: string) => { setActiveId(id); setRated(null); rec.reset(); stt.reset(); };

  const playRef = async () => {
    if (!active?.reference) return;
    setPlayingRef(true);
    try {
      await audioController.speakEnglish(`speaking-${active.id}-${Date.now()}`, { text: active.reference, language: 'en-GB', role: 'prompt' }, api?.progress.settings.speechSpeed ?? 'normal', speechVoice);
    } catch { /* zarif düşüş */ } finally { setPlayingRef(false); }
  };

  const saveAttempt = (transcript?: string, selfScore?: 'good' | 'needs-work') => {
    if (!active) return;
    setRated(selfScore ?? 'saved');
    onRecord((s) => ({
      ...s,
      speaking: [...s.speaking, {
        id: `spk-${Date.now()}`, promptId: active.id, kind: active.kind,
        at: new Date().toISOString(), transcript, selfScore, savedRecording: false,
      }],
    }));
  };

  const match = active?.reference && stt.transcript
    ? transcriptMatchesReference(stt.transcript, active.reference)
    : null;

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>← Dersler</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">İngilizce · aktif üretim</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Speaking</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {EN_SPEAKING_PROMPTS.length} istem · kayıt + tekrar{isSttSupported() ? ' + konuşma tanıma' : ' (bu tarayıcıda tanıma yok, kayıt yine çalışır)'}
        </p>
        {(sanitized.topic || sanitized.focus || sanitized.retry) && (
          <p className="mt-1 text-[0.95rem] font-bold" style={{ color: 'var(--color-brand)' }}>
            Haftalık plan kapsamı{sanitized.topic ? ` · ${EN_TOPIC_BY_ID.get(sanitized.topic)?.title}` : ''}{scopeTitle ? ` · ${scopeTitle}` : ''} · {list.length} istem
            {scopedEntry && !sanitized.retry && <span data-scope-progress="true"> · {doneInScope} / {list.length} kaydedildi</span>}
          </p>
        )}
        {retryFallback && (
          <p className="card mt-2 p-3 text-sm" role="status">
            Tekrar gerektiren kayıtlı cevap yok. Önce kişisel soruları cevapla ve “tekrar gerek” olarak işaretle; şimdilik aynı kapsamdaki tüm sorular listeleniyor.
          </p>
        )}
      </header>

      {!isRecordingSupported() && (
        <p className="card mt-4 p-3" role="status">Bu tarayıcı mikrofon kaydını desteklemiyor. Referans sesi dinleyip aynadan çalışabilirsin.</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Konuşma filtresi">
        {([['all', 'Tümü'], ['read-aloud', 'Read Aloud'], ['shadowing', 'Shadowing'], ['short-answer', 'Cevapla'], ['topic', 'Konu'], ['ielts-part1', 'IELTS Part 1']] as const).map(([v, label]) => (
          <button key={v} type="button" className="badge" aria-pressed={filter === v}
            style={filter === v ? { background: 'var(--color-brand)', color: 'white' } : undefined}
            onClick={() => setFilter(v)}>{label}</button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <ul className="grid gap-2">
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" className="card w-full p-4 text-left"
                aria-pressed={activeId === p.id}
                style={activeId === p.id ? { borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' } : undefined}
                onClick={() => selectPrompt(p.id)}>
                <p className="font-bold">{latest.has(p.id) ? (latest.get(p.id)?.selfScore === 'needs-work' ? '↻ ' : '✓ ') : ''}{p.title} <span className="text-xs font-normal text-ink-faint">· {p.kind}</span></p>
                <p className="text-sm text-ink-soft">{p.prompt}</p>
              </button>
            </li>
          ))}
        </ul>

        <section className="card h-fit p-5" aria-live="polite">
          {!active ? (
            <p className="text-ink-soft">Bir istem seç: referansı dinle → kaydet → tekrar dinle → (varsa) transkripti gör.</p>
          ) : (
            <>
              <p className="eyebrow">{active.kind} · {active.level}</p>
              <h2 className="mt-1 text-xl font-bold">{active.title}</h2>
              <p className="mt-2 text-lg">{active.prompt}</p>
              {active.promptTr && <p className="text-sm text-ink-soft">{active.promptTr}</p>}
              {sanitized.retry && latest.get(active.id)?.transcript && (
                <p className="mt-2 rounded-lg p-2 text-sm" style={{ background: 'var(--color-sunk)' }}>
                  <strong>Önceki cevabın:</strong> “{latest.get(active.id)?.transcript}”
                </p>
              )}
              {active.targets && !isTest && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {active.targets.map((t) => <li key={t} className="badge" style={{ background: 'var(--color-sunk)' }}>{t}</li>)}
                </ul>
              )}
              {active.points && (
                <ul className="mt-2 flex list-disc flex-col gap-0.5 pl-5 text-[0.95rem]" aria-label="Değinilecek noktalar">
                  {active.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              )}
              {!active.reference && (
                <div className="mt-3 rounded-lg border border-line p-3">
                  <p className="font-bold">
                    0) Hazırlan{active.seconds ? ` — hedef: ${active.seconds >= 100 ? '1,5–2 dakika' : '60–90 saniye'} kesintisiz konuşma` : ' — 2–3 tam cümle'}
                  </p>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.95rem]" rows={active.seconds ? 3 : 2}
                    value={notes[active.id] ?? ''} aria-label="Hazırlık notları"
                    placeholder="Anahtar kelimeler (tam cümle yazma): …"
                    onChange={(e) => setNotes((n) => ({ ...n, [active.id]: e.target.value }))}
                  />
                </div>
              )}
              {active.reference && (
                <button type="button" className="btn btn-primary mt-3 w-full" aria-label="Referans sesi dinle"
                  disabled={playingRef} onClick={() => void playRef()}>
                  {playingRef ? '▶ Çalıyor…' : '🔊 Referansı Dinle'}
                </button>
              )}

              <div className="mt-4 rounded-lg border border-line p-3">
                <p className="font-bold">1) Kaydet</p>
                {rec.state === 'recording' ? (
                  <button type="button" className="btn mt-2 w-full" aria-label="Kaydı durdur" onClick={rec.stop}>⏹ Durdur</button>
                ) : (
                  <button type="button" className="btn mt-2 w-full" aria-label="Kayda başla"
                    disabled={!isRecordingSupported() || rec.state === 'requesting'} onClick={() => void rec.start()}>
                    🎙 {rec.state === 'requesting' ? 'İzin bekleniyor…' : 'Kayda Başla'}
                  </button>
                )}
                {rec.error && <p className="mt-2 text-sm" role="alert">{rec.error}</p>}
                {rec.recording && (
                  <div className="mt-2">
                    <audio controls src={rec.recording.url} className="w-full" aria-label="Kaydını dinle" />
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="btn btn-quiet" onClick={rec.reset}>↺ Sil / Tekrar Dene</button>
                    </div>
                    <p className="mt-2 text-sm font-bold">Cevabın nasıldı?</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <button type="button" className="btn" onClick={() => saveAttempt(stt.transcript || undefined, 'good')}>
                        ✓ İyiydi — kaydet
                      </button>
                      <button type="button" className="btn" onClick={() => saveAttempt(stt.transcript || undefined, 'needs-work')}>
                        ↻ Tekrar gerek — kaydet
                      </button>
                    </div>
                    {rated && <p className="mt-1 text-sm" role="status">✓ Geçmişe eklendi{rated === 'needs-work' ? ' (tekrar listesine girdi)' : ''}.</p>}
                    {rated && nextPrompt && (
                      <button type="button" className="btn btn-primary mt-2 w-full" onClick={() => selectPrompt(nextPrompt.id)}>
                        Sonraki istem →
                      </button>
                    )}
                    {rated && !nextPrompt && scopedEntry && (
                      <p className="mt-2 text-sm font-bold" role="status">Bu kapsamın son istemiydi — {doneInScope} / {list.length} kaydedildi.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 rounded-lg border border-line p-3">
                <p className="font-bold">2) Konuşma tanıma (varsa)</p>
                {!stt.supported ? (
                  <p className="text-sm text-ink-soft">Bu tarayıcıda tanıma yok — kayıt ve tekrar yine çalışır.</p>
                ) : stt.state === 'listening' ? (
                  <button type="button" className="btn mt-2 w-full" onClick={stt.stop}>⏹ Dinlemeyi Durdur</button>
                ) : (
                  <button type="button" className="btn mt-2 w-full" onClick={stt.start}>🎧 Tanımayı Başlat (en-GB)</button>
                )}
                {stt.error && <p className="mt-2 text-sm" role="alert">{stt.error}</p>}
                {stt.transcript && (
                  <div className="mt-2 rounded-lg p-2" style={{ background: 'var(--color-sunk)' }}>
                    <p className="text-sm"><strong>Transkript:</strong> {stt.transcript}</p>
                    {match && <p className="text-sm">{match.hit ? '✓' : '•'} {match.note}</p>}
                    {active.sampleAnswer && !isTest && <p className="text-sm text-ink-soft">Örnek: {active.sampleAnswer}</p>}
                  </div>
                )}
              </div>

              {active.sampleAnswer && !isTest && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm underline">Örnek cevap</summary>
                  <p className="mt-1 text-sm">{active.sampleAnswer}</p>
                </details>
              )}
            </>
          )}
        </section>
      </div>

      {skills.speaking.length > 0 && (
        <section className="mt-8">
          <h2 className="eyebrow mb-3">Speaking geçmişi ({skills.speaking.length})</h2>
          <ul className="grid gap-2">
            {[...skills.speaking].reverse().slice(0, 8).map((s) => (
              <li key={s.id} className="card px-4 py-3 text-sm">
                <strong>{s.promptId}</strong> · {new Date(s.at).toLocaleString('tr')}
                {s.transcript ? ` · “${s.transcript}”` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
