/**
 * Reading ana sayfa: Kısa Okuma / IELTS Reading / geçmiş.
 * Mevcut kart/düğme dilini yeniden kullanır.
 */

import { useState } from 'react';
import { EN_READING_PASSAGES } from '../content/en/skills-reading';
import type { EnSkillsState } from '../lib/skills-storage';
import type { ReadingFilter, Route } from '../lib/router';

export function ReadingHomeScreen({
  skills,
  navigate,
  initialFilter,
}: {
  skills: EnSkillsState;
  navigate: (route: Route) => void;
  /** Derin baglanti: bu filtreyle acilir (gecersizse tumu). */
  initialFilter?: ReadingFilter;
}) {
  const [filter, setFilter] = useState<'all' | 'short' | 'ielts'>(
    initialFilter === 'short' || initialFilter === 'ielts' ? initialFilter : 'all',
  );
  const list = EN_READING_PASSAGES.filter((p) =>
    filter === 'all' ? true : filter === 'ielts' ? p.ieltsStyle : !p.ieltsStyle,
  );
  const doneIds = new Set(skills.reading.map((r) => r.passageId));

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>
        ← Dersler
      </button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">İngilizce · B1 → erken B1+</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Reading</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {EN_READING_PASSAGES.length} özgün pasaj · {EN_READING_PASSAGES.filter((p) => p.ieltsStyle).length} IELTS tarzı pratik · kanıtlı inceleme
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Pasaj filtresi">
        {([['all', 'Tümü'], ['short', 'Kısa / Normal'], ['ielts', 'IELTS tarzı']] as const).map(([v, label]) => (
          <button
            key={v}
            type="button"
            className="badge"
            aria-pressed={filter === v}
            style={filter === v ? { background: 'var(--color-brand)', color: 'white' } : undefined}
            onClick={() => setFilter(v)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {list.map((p) => {
          const attempts = skills.reading.filter((r) => r.passageId === p.id);
          const best = attempts.length ? Math.max(...attempts.map((a) => a.correct / Math.max(1, a.total))) : null;
          return (
            <li key={p.id} className="card flex h-full flex-col p-5">
              <p className="eyebrow">{p.ieltsStyle ? 'IELTS tarzı pratik' : p.size === 'short' ? 'Kısa okuma' : 'Normal okuma'} · ~{p.wordCount} kelime</p>
              <h3 className="mt-1 text-xl font-bold">{p.title}</h3>
              <p className="mt-1 text-[0.92rem] text-ink-soft">
                {p.questions.length} soru · {p.level}
                {doneIds.has(p.id) && best !== null ? ` · en iyi %${Math.round(best * 100)}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {doneIds.has(p.id) && (
                  <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>✓ Okundu</span>
                )}
                <span className="badge" style={{ background: 'var(--color-sunk)' }}>{p.questions.length} soru</span>
              </div>
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => navigate({ name: 'reading-passage', passageId: p.id })}>
                {doneIds.has(p.id) ? 'Tekrar Oku' : 'Oku ve Cevapla'}
              </button>
            </li>
          );
        })}
      </ul>

      {skills.reading.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3">Okuma geçmişi</h2>
          <ul className="grid gap-2">
            {[...skills.reading].reverse().slice(0, 8).map((r, i) => (
              <li key={`${r.passageId}-${r.at}-${i}`} className="card flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[0.95rem]"><strong>{r.passageId}</strong> · {r.correct}/{r.total} · {new Date(r.at).toLocaleDateString('tr')}</span>
                <button type="button" className="btn btn-quiet" onClick={() => navigate({ name: 'reading-passage', passageId: r.passageId })}>
                  İncele →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
