import { useMemo, useState } from 'react';
import { searchSummaries, summariesForTrack } from '../lib/content';
import { topicTrack } from '../lib/content';
import type { LearningTrack } from '../content/types';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

export function SummaryIndexScreen({
  api,
  navigate,
}: {
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const { progress } = api;
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<LearningTrack>('normal');
  const hits = useMemo(() => searchSummaries(query), [query]);
  const bookmarks = progress.settings.bookmarks ?? [];
  const read = progress.settings.readSummaries ?? {};

  const filteredSummaries = useMemo(() => summariesForTrack(track), [track]);

  const bookmarked = useMemo(
    () =>
      filteredSummaries.flatMap((day) =>
        day.topics.filter((topic) => bookmarks.includes(topic.id)).map((topic) => ({ day: day.day, track: day.track, topic })),
      ),
    [bookmarks, filteredSummaries],
  );

  const displayedHits = useMemo(() => {
    if (query.trim().length < 2) return [];
    // hits includes track info via topicTrack map
    return hits;
  }, [hits, query]);

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Ders notların</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Özetler</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Alıştırmalarda karşına çıkan her konunun açıklaması burada.
        </p>
      </header>

      <div className="mt-6 flex rounded-xl border-2 border-line overflow-hidden w-fit">
        {(['normal','private'] as LearningTrack[]).map((t) => (
          <button
            key={t}
            type="button"
            className="px-4 py-2 text-sm font-bold"
            style={{
              background: track === t ? 'var(--color-brand)' : 'transparent',
              color: track === t ? '#fff' : 'var(--color-ink-soft)',
            }}
            onClick={() => setTrack(t)}
          >
            {t === 'normal' ? 'Normal' : '🎓 Özel Ders'}
          </button>
        ))}
      </div>

      <div className="mt-7">
        <label className="eyebrow" htmlFor="ozet-arama">
          Ara
        </label>
        <input
          id="ozet-arama"
          type="search"
          className="field mt-1.5 w-full"
          placeholder="sein, artikel, fiil çekimi, Wie geht…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {query.trim().length >= 2 && (
        <section className="mt-5" aria-live="polite">
          {displayedHits.length === 0 ? (
            <p className="text-ink-soft">Sonuç bulunamadı.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {displayedHits.map((hit) => {
                const hitTrack: LearningTrack = topicTrack.get(hit.topic.id) ?? 'normal';
                return (
                  <li key={`${hitTrack}-${hit.day}-${hit.topic.id}`}>
                    <button
                      type="button"
                      className="card w-full p-4 text-left"
                      onClick={() => navigate({ name: 'summary', track: (hitTrack ?? 'normal'), day: hit.day, topicId: hit.topic.id })}
                    >
                      <p className="eyebrow">
                        {hitTrack === 'private' ? '🎓 Özel Ders · ' : ''}{hit.day}. Gün · {hit.topic.title}
                      </p>
                      <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft">{hit.excerpt}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {bookmarked.length > 0 && query.trim().length < 2 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-3">Kaydedilenler</h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarked.map(({ day, track: t, topic }) => (
              <li key={topic.id}>
                <button
                  type="button"
                  className="badge"
                  style={{ background: 'var(--color-signal)', color: '#14141b' }}
                  onClick={() => navigate({ name: 'summary', track: ((t ?? 'normal') as LearningTrack), day, topicId: topic.id })}
                >
                  ⭐ {topic.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-9">
        <h2 className="eyebrow mb-4">Günler {track === 'private' ? '— Özel Ders' : ''}</h2>
        <ul className="flex flex-col gap-4">
          {filteredSummaries.map((day) => {
            const readCount = day.topics.filter((topic) => read[topic.id]).length;
            const allRead = readCount === day.topics.length && day.topics.length > 0;

            return (
              <li key={`${day.track}-${day.day}`}>
                <button
                  type="button"
                  className="day-tile w-full"
                  onClick={() => navigate({ name: 'summary', track: (day.track ?? 'normal'), day: day.day })}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-2xl">{day.track === 'private' ? `🎓 ${day.title}` : day.title}</h3>
                    <span className="text-sm font-bold text-ink-faint">
                      ~{day.estimatedReadingMinutes} dk
                    </span>
                  </div>

                  <ul className="mt-2 flex flex-col gap-1">
                    {day.topics.map((topic) => (
                      <li key={topic.id} className="flex items-center gap-2 text-[0.98rem] text-ink-soft">
                        <span
                          className="size-1.5 flex-none rounded-full"
                          style={{ background: 'var(--color-signal)' }}
                          aria-hidden="true"
                        />
                        {topic.title}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {allRead ? (
                      <span
                        className="badge"
                        style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}
                      >
                        ✓ Okundu
                      </span>
                    ) : readCount > 0 ? (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        {readCount}/{day.topics.length} konu okundu
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        Okunmadı
                      </span>
                    )}
                    <span className="ml-auto font-bold" style={{ color: 'var(--color-brand)' }}>
                      Özeti Aç →
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {filteredSummaries.length === 0 && (
          <p className="mt-4 text-ink-soft">Bu izlek için henüz özet yok.</p>
        )}
      </section>
    </main>
  );
}
