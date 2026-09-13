/**
 * Master kelime listesi — 244 öğenin tamamı.
 *
 * Arama yalnızca envanterde yapılır; filtreler gerçek ustalık durumundan
 * gelir (All / Learning / Weak / Mastered / By Topic).
 */

import { useMemo, useState } from 'react';
import { VOCABULARY } from '../content/vocabulary/inventory';
import { topicsById } from '../lib/content';
import { computeVocabProgress, type VocabState } from '../lib/vocab/mastery';
import { AudioButton } from '../components/AudioButton';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import { VOCAB_TOPICS } from './VocabHomeScreen';

type Filter = 'all' | VocabState | string;

const STATE_LABEL: Record<VocabState, string> = {
  new: 'Yeni',
  learning: 'Öğreniliyor',
  weak: 'Zayıf',
  familiar: 'Tanıdık',
  mastered: 'Öğrenildi',
};

const STATE_FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'learning', label: 'Öğreniliyor' },
  { id: 'weak', label: 'Zayıf' },
  { id: 'mastered', label: 'Öğrenildi' },
];

export function VocabListScreen({
  api,
  navigate,
}: {
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const { progress } = api;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const byId = useMemo(() => computeVocabProgress(progress), [progress]);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr');
    return VOCABULARY.filter((entry) => {
      if (filter !== 'all') {
        if (filter === 'new' || filter === 'learning' || filter === 'weak' || filter === 'familiar' || filter === 'mastered') {
          if (byId.get(entry.id)?.state !== filter) return false;
        } else if (!entry.topicIds.includes(filter)) return false;
      }
      if (needle.length >= 2) {
        const hay = `${entry.german} ${entry.base} ${entry.turkish}`.toLocaleLowerCase('tr');
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [query, filter, byId]);

  const ctx = `vocab-list`;

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'vocab' })}>
        ← Kelime Çalışması
      </button>
      <header className="mt-4">
        <p className="eyebrow">Kapalı havuz</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Kelime Havuzu</h1>
        <p className="mt-2 text-lg text-ink-soft">
          {results.length} / {VOCABULARY.length} kelime
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        <input
          type="search"
          className="card w-full p-3"
          placeholder="Almanca ya da Türkçe ara…"
          aria-label="Kelime ara"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtre">
          {STATE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="badge"
              aria-pressed={filter === item.id}
              style={filter === item.id ? { background: 'var(--color-brand)', color: 'white' } : undefined}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
          <select
            className="badge"
            aria-label="Konuya göre filtrele"
            value={VOCAB_TOPICS.includes(filter as string) ? (filter as string) : ''}
            onChange={(event) => setFilter(event.target.value || 'all')}
          >
            <option value="">Konu: tümü</option>
            {VOCAB_TOPICS.map((topicId) => (
              <option key={topicId} value={topicId}>
                {topicsById.get(topicId)?.title ?? topicId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {results.map((entry) => {
          const state = byId.get(entry.id)?.state ?? 'new';
          const topicNames = entry.topicIds.map((id) => topicsById.get(id)?.title ?? id).join(' · ');
          return (
            <li key={entry.id} className="card flex items-center gap-3 p-3">
              <AudioButton
                target={{ text: entry.ttsText, language: 'de-DE', role: 'vocabulary' }}
                contextId={ctx}
                compact
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold" lang="de">{entry.german}</p>
                <p className="truncate text-[0.92rem] text-ink-soft">{entry.turkish}</p>
                <p className="truncate text-xs text-ink-faint">{topicNames}</p>
              </div>
              <span className="badge flex-none">{STATE_LABEL[state]}</span>
            </li>
          );
        })}
      </ul>
      {results.length === 0 && (
        <p className="mt-8 text-center text-ink-soft">Aramanla eşleşen kelime yok.</p>
      )}
    </main>
  );
}
