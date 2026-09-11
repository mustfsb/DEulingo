import { useMemo, useState } from 'react';
import {
  getTopic,
  reviewSectionsById,
  reviewSummary,
  searchSummaries,
  sectionsById,
  summaries,
} from '../lib/content';
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
  const searching = query.trim().length >= 2;

  const bookmarked = useMemo(
    () =>
      bookmarks.flatMap((id) => {
        const section = sectionsById.get(id);
        if (section) return [{ id, title: section.title, route: { name: 'summary', topicId: section.topicId, sectionId: id } as Route }];
        const review = reviewSectionsById.get(id);
        if (review) return [{ id, title: `🔁 ${review.title}`, route: { name: 'review-summary', sectionId: id } as Route }];
        return [];
      }),
    [bookmarks],
  );

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Ders notların</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Özetler</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Her konunun tek, kanonik özeti. Alıştırmalarda karşına çıkan her kural burada.
        </p>
      </header>

      {reviewSummary && !searching && (
        <button
          type="button"
          className="card mt-7 flex w-full items-center justify-between gap-4 p-5 text-left anim-pop"
          style={{ borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' }}
          onClick={() => navigate({ name: 'review-summary' })}
        >
          <span>
            <span className="eyebrow" style={{ color: 'var(--color-brand)' }}>
              Kümülatif tekrar
            </span>
            <span className="mt-1 block text-xl font-bold">🔁 Genel Tekrar</span>
            <span className="text-[0.95rem] text-ink-soft">
              Bugüne kadar öğrendiğin her konu, sıkıştırılmış tek özette (~{reviewSummary.estimatedReadingMinutes} dk)
            </span>
          </span>
          <span className="numeral text-2xl" aria-hidden="true">
            →
          </span>
        </button>
      )}

      <div className="mt-7">
        <label className="eyebrow" htmlFor="ozet-arama">
          Ara
        </label>
        <input
          id="ozet-arama"
          type="search"
          className="field mt-1.5 w-full"
          placeholder="können, artikel, fiil çekimi, Wie spät…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {searching && (
        <section className="mt-5" aria-live="polite">
          {hits.length === 0 ? (
            <p className="text-ink-soft">Sonuç bulunamadı.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {hits.map((hit) => (
                <li key={`${hit.scope}-${hit.section.id}`}>
                  <button
                    type="button"
                    className="card w-full p-4 text-left"
                    onClick={() =>
                      navigate(
                        hit.scope === 'review'
                          ? { name: 'review-summary', sectionId: hit.section.id }
                          : { name: 'summary', topicId: hit.scope, sectionId: hit.section.id },
                      )
                    }
                  >
                    <p className="eyebrow">
                      {hit.scope === 'review' ? '🔁 Genel Tekrar' : getTopic(hit.scope)?.title} · {hit.section.title}
                    </p>
                    <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft">{hit.excerpt}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {bookmarked.length > 0 && !searching && (
        <section className="mt-9">
          <h2 className="eyebrow mb-3">Kaydedilenler</h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarked.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="badge"
                  style={{ background: 'var(--color-signal)', color: '#14141b' }}
                  onClick={() => navigate(item.route)}
                >
                  ⭐ {item.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-9">
        <h2 className="eyebrow mb-4">Konular</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {summaries.map((summary) => {
            const topic = getTopic(summary.topicId);
            const readCount = summary.sections.filter((section) => read[section.id]).length;
            const allRead = readCount === summary.sections.length && summary.sections.length > 0;

            return (
              <li key={summary.topicId}>
                <button
                  type="button"
                  className="topic-tile h-full w-full"
                  onClick={() => navigate({ name: 'summary', topicId: summary.topicId })}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-xl">
                      <span aria-hidden="true">{topic?.emoji} </span>
                      {summary.title}
                    </h3>
                    <span className="text-sm font-bold text-ink-faint">~{summary.estimatedReadingMinutes} dk</span>
                  </div>
                  {topic?.description && (
                    <p className="mt-1.5 text-[0.93rem] leading-snug text-ink-soft">{topic.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {allRead ? (
                      <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>
                        ✓ Okundu
                      </span>
                    ) : readCount > 0 ? (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        {readCount}/{summary.sections.length} bölüm okundu
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        {summary.sections.length} bölüm
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
        {summaries.length === 0 && <p className="mt-4 text-ink-soft">Henüz özet yok.</p>}
      </section>
    </main>
  );
}
