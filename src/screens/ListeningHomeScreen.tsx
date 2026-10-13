/**
 * Listening: kısa dinleme / dikte / listen&answer / IELTS tarzı.
 * Transcript gönderimden ÖNCE gösterilmez; sonra kanıt + tekrar.
 */

import { useMemo, useRef, useState } from 'react';
import { EN_LISTENING_BY_ID, EN_LISTENING_FOCUS_TAGS, EN_LISTENING_ITEMS, listeningPool } from '../content/en/skills-listening';
import { audioController } from '../lib/audio/playback';
import { DEFAULT_GERMAN_VOICE_ID } from '../lib/audio/tts';
import { shuffledOptions } from '../lib/presentation';
import { deterministicValidate } from '../lib/semantic/validate-answer';
import type { ProgressApi } from '../hooks/useProgress';
import type { EnSkillsState } from '../lib/skills-storage';
import type { ListeningKindFilter, Route } from '../lib/router';

function norm(s: string): string {
  return s.toLowerCase().replace(/[.!?,;:'"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

const UI_FILTERS = ['all', 'short', 'dictation', 'ielts'] as const;
export type ListeningUiFilter = (typeof UI_FILTERS)[number];

/** Derin baglanti girisi: konu + tur + odak kesişimi; parca dogrudan acar. */
export interface ListeningInitial {
  topicId?: string;
  kind?: ListeningKindFilter;
  focus?: string;
  itemId?: string;
}

function sanitizeInitial(initial?: ListeningInitial): {
  topic?: string;
  focus?: string;
  filter: ListeningUiFilter;
  itemId?: string;
} {
  if (!initial) return { filter: 'all' };
  const topic = initial.topicId && EN_LISTENING_ITEMS.some((i) => i.topicTags.includes(initial.topicId!))
    ? initial.topicId
    : undefined;
  const focus = initial.focus && EN_LISTENING_FOCUS_TAGS.includes(initial.focus) ? initial.focus : undefined;
  const item = initial.itemId && EN_LISTENING_BY_ID.has(initial.itemId)
    ? EN_LISTENING_BY_ID.get(initial.itemId)!
    : undefined;
  let filter: ListeningUiFilter = initial.kind === 'short' || initial.kind === 'dictation' || initial.kind === 'ielts'
    ? initial.kind
    : 'all';
  // Parca dogrudan acilir: filtre turu verilmemisse parcanin turu secilir.
  if (item && !initial.kind) {
    filter = item.kind === 'dictation' ? 'dictation' : item.level === 'B1+' ? 'ielts' : 'short';
  }
  return { topic, focus, filter, itemId: item?.id };
}

export function ListeningHomeScreen({
  skills,
  onRecord,
  navigate,
  api,
  initial,
}: {
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
  /** Varsa ayarlanan İngilizce ses/hız kullanılır; yoksa varsayılan (Jenny). */
  api?: ProgressApi;
  /** Derin baglanti: filtreli giris + dogrudan parca. */
  initial?: ListeningInitial;
}) {
  const speechVoice = api?.progress.settings.speechVoice ?? DEFAULT_GERMAN_VOICE_ID;
  const speechSpeed = api?.progress.settings.speechSpeed ?? 'normal';
  const [sanitized] = useState(() => sanitizeInitial(initial));
  const [filter, setFilter] = useState<ListeningUiFilter>(sanitized.filter);
  // Kapsamlı giriş (konu/odak) parça belirtmiyorsa ilk parça hazır açılır:
  // `Git` doğrudan çözülecek göreve iner, boş bir listeye değil.
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (sanitized.itemId) return sanitized.itemId;
    if (!sanitized.topic && !sanitized.focus) return null;
    const first = listeningPool({ topicId: sanitized.topic, focus: sanitized.focus, kind: sanitized.filter === 'all' ? undefined : sanitized.filter })[0];
    return first?.id ?? null;
  });
  // Ziyaret ici kararli, ziyaretler arasi cesitli secenek sirasi.
  const [mountNonce] = useState(() => Math.floor(Math.random() * 1e9));
  const [input, setInput] = useState('');
  const [choice, setChoice] = useState('');
  const [submitted, setSubmitted] = useState<Record<string, { correct: boolean }>>({});
  const [replays, setReplays] = useState<Record<string, number>>({});
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(0);

  const list = useMemo(
    () => listeningPool({ topicId: sanitized.topic, focus: sanitized.focus, kind: filter === 'all' ? undefined : filter }),
    [filter, sanitized],
  );

  const active = EN_LISTENING_BY_ID.get(activeId ?? '') ?? null;
  const shownOptions = useMemo(
    () => (active?.options ? shuffledOptions(active.options, `${mountNonce}:${active.id}`) : []),
    [active, mountNonce],
  );

  const play = async (text: string, id: string) => {
    const ctx = `listening-${id}-${(ctxRef.current += 1)}`;
    setPlaying(true);
    setReplays((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
    try {
      await audioController.speakEnglish(ctx, { text, language: 'en-GB', role: 'prompt' }, speechSpeed, speechVoice);
    } catch {
      /* AudioButton ile aynı zarif düşüş: sessizce dur */
    } finally {
      setPlaying(false);
    }
  };

  const check = () => {
    if (!active) return;
    const raw = active.kind === 'mc' || active.kind === 'meaning' ? choice : input;
    let correct = norm(raw) === norm(active.answer);
    if (!correct && (active.kind === 'short' || active.kind === 'dictation' || active.kind === 'missing-word')) {
      const cands = [active.answer, ...(active.acceptedAnswers ?? [])];
      if (cands.some((c) => norm(c) === norm(raw))) correct = true;
      else {
        const fake = { id: `lis-${active.id}`, topicId: 'en.present-perfect', type: 'free-text', instruction: active.prompt, answer: active.answer, acceptedAnswers: active.acceptedAnswers, conceptIds: ['pp.formula.core'], origin: 'authored', source: { file: 'listening', naturalKey: active.id }, difficulty: 'medium', skill: 'recall', validation: { englishContractions: true } } as Parameters<typeof deterministicValidate>[0];
        const r = deterministicValidate(fake, raw);
        correct = r.status === 'correct' || r.status === 'minor-typo'
          || cands.some((c) => norm(raw).includes(norm(c)) || norm(c).includes(norm(raw)));
      }
    }
    setSubmitted((s) => ({ ...s, [active.id]: { correct } }));
    onRecord((st) => ({
      ...st,
      listening: [...st.listening, { itemId: active.id, correct, replays: replays[active.id] ?? 1, at: new Date().toISOString() }],
    }));
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>← Dersler</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">İngilizce · en-GB ses</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Listening</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {EN_LISTENING_ITEMS.length} parça · {EN_LISTENING_ITEMS.filter((i) => i.kind === 'dictation').length} dikte · transcript cevap sonrası
        </p>
        {(sanitized.topic || sanitized.focus) && (
          <p className="mt-1 text-[0.95rem] font-bold" style={{ color: 'var(--color-brand)' }}>
            Haftalık plan kapsamı{sanitized.topic ? ` · ${sanitized.topic}` : ''}{sanitized.focus ? ` · ${sanitized.focus}` : ''} · {list.length} parça
          </p>
        )}
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Dinleme filtresi">
        {([['all', 'Tümü'], ['short', 'Kısa'], ['dictation', 'Dikte'], ['ielts', 'IELTS tarzı']] as const).map(([v, label]) => (
          <button key={v} type="button" className="badge" aria-pressed={filter === v}
            style={filter === v ? { background: 'var(--color-brand)', color: 'white' } : undefined}
            onClick={() => setFilter(v)}>{label}</button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        {list.length === 0 ? (
          <p className="card p-5 text-ink-soft" role="status">
            Bu kapsamda parça yok — filtreyi değiştir ya da genel listeye dön.
          </p>
        ) : (
        <ul className="grid gap-2">
          {list.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className="card w-full p-4 text-left"
                aria-pressed={activeId === i.id}
                style={activeId === i.id ? { borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' } : undefined}
                onClick={() => { setActiveId(i.id); setInput(''); setChoice(''); }}
              >
                <p className="font-bold">{i.title} <span className="text-xs font-normal text-ink-faint">· {i.kind} · {i.level}</span></p>
                <p className="text-sm text-ink-soft">{i.prompt}</p>
                {submitted[i.id] && <p className="text-sm font-bold">{submitted[i.id].correct ? '✓ Doğru' : '✗ Yanlış'}</p>}
              </button>
            </li>
          ))}
        </ul>
        )}

        <section className="card h-fit p-5" aria-live="polite">
          {!active ? (
            <p className="text-ink-soft">Bir parça seç, önce dinle — transcript cevap sonrası görünür.</p>
          ) : (
            <>
              <p className="eyebrow">{active.kind} · {active.level}</p>
              <h2 className="mt-1 text-xl font-bold">{active.title}</h2>
              <p className="mt-2">{active.prompt}</p>
              <button
                type="button" className="btn btn-primary mt-3 w-full"
                aria-label={`${active.title} sesini oynat`}
                disabled={playing}
                onClick={() => void play(active.audioText, active.id)}
              >
                {playing ? '▶ Çalıyor…' : `🔊 Dinle${(replays[active.id] ?? 0) > 0 ? ` (${replays[active.id]} kez)` : ''}`}
              </button>
              {(active.kind === 'mc' || active.kind === 'meaning') ? (
                <div className="mt-3 flex flex-col gap-2">
                  {shownOptions.map((opt, oi) => (
                    <label key={`${opt}::${oi}`} className="flex items-center gap-2">
                      <input type="radio" name={`lis-${active.id}`} checked={choice === opt}
                        disabled={!!submitted[active.id]} onChange={() => setChoice(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text" className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2"
                  value={input} disabled={!!submitted[active.id]}
                  aria-label={active.prompt} placeholder="Duyduğunu / cevabını yaz…"
                  onChange={(e) => setInput(e.target.value)}
                />
              )}
              {!submitted[active.id] ? (
                <button type="button" className="btn mt-3 w-full" onClick={check}>Gönder</button>
              ) : (
                <div className="mt-3 rounded-lg p-3" style={{ background: submitted[active.id].correct ? 'var(--color-good-soft)' : 'var(--color-bad-soft)' }}>
                  <p className="font-bold">{submitted[active.id].correct ? '✓ Doğru' : '✗ Yanlış'} — {active.answer}</p>
                  <p className="text-sm"><strong>Kanıt:</strong> {active.evidence}</p>
                  <p className="mt-2 text-sm"><strong>Transcript:</strong> {active.transcript}</p>
                  <button type="button" className="btn btn-quiet mt-2" onClick={() => void play(active.audioText, active.id)}>
                    🔊 Transcript ile tekrar dinle
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {skills.listening.length > 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          Dinleme geçmişi: {skills.listening.length} deneme · doğruluk %
          {Math.round((skills.listening.filter((l) => l.correct).length / Math.max(1, skills.listening.length)) * 100)}
        </p>
      )}
    </main>
  );
}
