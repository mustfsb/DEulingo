import { useMemo, useState } from 'react';
import { searchSummaries, summaries } from '../lib/content';
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
  const hits = useMemo(() => searchSummaries(query), [query]);
  const bookmarks = progress.settings.bookmarks ?? [];
  const read = progress.settings.readSummaries ?? {};

  const bookmarked = useMemo(
    () =>
      summaries.flatMap((day) =>
        day.topics.filter((topic) => bookmarks.includes(topic.id)).map((topic) => ({ day: day.day, topic })),
      ),
    [bookmarks],
  );

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Ders notların</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Özetler</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Alıştırmalarda karşına çıkan her konunun açıklaması burada.
        </p>
      </header>

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
          {hits.length === 0 ? (
            <p className="text-ink-soft">Sonuç bulunamadı.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {hits.map((hit) => (
                <li key={`${hit.day}-${hit.topic.id}`}>
                  <button
                    type="button"
                    className="card w-full p-4 text-left"
                    onClick={() => navigate({ name: 'summary', day: hit.day, topicId: hit.topic.id })}
                  >
                    <p className="eyebrow">
                      {hit.day}. Gün · {hit.topic.title}
                    </p>
                    <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft">{hit.excerpt}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {bookmarked.length > 0 && query.trim().length < 2 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-3">Kaydedilenler</h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarked.map(({ day, topic }) => (
              <li key={topic.id}>
                <button
                  type="button"
                  className="badge"
                  style={{ background: 'var(--color-signal)', color: '#14141b' }}
                  onClick={() => navigate({ name: 'summary', day, topicId: topic.id })}
                >
                  ⭐ {topic.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-9">
        <h2 className="eyebrow mb-4">Günler</h2>
        <ul className="flex flex-col gap-4">
          {summaries.map((day) => {
            const readCount = day.topics.filter((topic) => read[topic.id]).length;
            const allRead = readCount === day.topics.length && day.topics.length > 0;

            return (
              <li key={day.day}>
                <button
                  type="button"
                  className="day-tile w-full"
                  onClick={() => navigate({ name: 'summary', day: day.day })}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-2xl">{day.title}</h3>
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
      </section>
    </main>
  );
}
