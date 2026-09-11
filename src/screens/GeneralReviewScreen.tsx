import { useMemo, useState } from 'react';
import { allExercises, reviewBank, topicMasteryDefs, topics } from '../lib/content';
import { computeTopicMastery } from '../lib/mastery';
import { REVIEW_MODES, type ReviewMode } from '../lib/general-review';
import { previewReviewSize, startMistakeSession, startReviewSession } from '../lib/start-review';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const MODE_ORDER: ReviewMode[] = ['vocab', 'sentence', 'writing', 'listening', 'quick', 'challenge'];

function masteryColor(score: number): string {
  return score >= 0.75 ? 'var(--color-good)' : score >= 0.4 ? 'var(--color-brand)' : 'var(--color-signal)';
}

/**
 * Genel Tekrar ana sayfası. Konu kartları müfredatın KANONİK konularıdır —
 * ayrı bir tekrar taksonomisi yoktur.
 */
export function GeneralReviewScreen({
  api,
  navigate,
}: {
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const { progress } = api;
  const [notice, setNotice] = useState<string | null>(null);

  const mistakeCount = Object.keys(progress.mistakes).length;
  const mastery = useMemo(
    () => new Map(computeTopicMastery(progress, allExercises, topicMasteryDefs).map((item) => [item.topicId, item])),
    [progress],
  );

  const launch = (mode: ReviewMode, topicId?: string) => {
    const ok = startReviewSession(api, navigate, { mode, topicId });
    if (!ok) setNotice('Bu başlık için henüz yeterli soru yok.');
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Bugüne kadar öğrendiğin her konu</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Genel Tekrar</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {reviewBank.length} konular arası soru; zayıf noktalarına öncelik veren karışık seçkiler.
        </p>
      </header>

      <button
        type="button"
        className="card mt-7 flex w-full items-center justify-between gap-4 p-5 text-left anim-pop"
        style={{ borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' }}
        onClick={() => launch('mixed')}
      >
        <span>
          <span className="eyebrow" style={{ color: 'var(--color-brand)' }}>
            Karışık Genel Tekrar
          </span>
          <span className="mt-1 block text-xl font-bold">Genel Tekrar Başlat</span>
          <span className="text-[0.95rem] text-ink-soft">
            ~{previewReviewSize('mixed')} soru · kelime → cümle → saat → Modalverben → yemek → dinleme
          </span>
        </span>
        <span className="numeral text-2xl" aria-hidden="true">
          →
        </span>
      </button>

      {notice && (
        <p className="mt-3 text-[0.95rem] text-ink-soft" role="status">
          {notice}
        </p>
      )}

      <section className="mt-10">
        <h2 className="eyebrow mb-4">Nasıl çalışmak istersin?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODE_ORDER.map((mode) => {
            const meta = REVIEW_MODES.find((entry) => entry.mode === mode)!;
            const count = previewReviewSize(mode);
            return (
              <button
                key={mode}
                type="button"
                className="card mode-card p-4 text-left"
                disabled={count === 0}
                onClick={() => launch(mode)}
              >
                <p className="text-lg font-bold">{meta.title}</p>
                <p className="text-[0.92rem] text-ink-soft">{meta.description}</p>
                <p className="numeral mt-2 text-sm text-ink-faint">~{count} soru</p>
              </button>
            );
          })}
          <button
            type="button"
            className="card mode-card p-4 text-left"
            disabled={mistakeCount === 0}
            style={mistakeCount === 0 ? { opacity: 0.5 } : undefined}
            onClick={() => {
              const ok = startMistakeSession(api, navigate);
              if (!ok) setNotice('Tekrar edilecek hata yok — önce biraz çalış.');
            }}
          >
            <p className="text-lg font-bold">Hataları Tekrarla</p>
            <p className="text-[0.92rem] text-ink-soft">Tüm konuların hataları, tek listede</p>
            <p className="numeral mt-2 text-sm text-ink-faint">
              {mistakeCount === 0 ? 'Hata yok' : `${mistakeCount} aktif hata`}
            </p>
          </button>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="gr-konular">
        <h2 id="gr-konular" className="eyebrow mb-4">Konuya göre tekrar et</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const size = previewReviewSize('topic', topic.id);
            if (size === 0) return null;
            const item = mastery.get(topic.id);
            const score = item?.masteryScore ?? 0;
            const practiced = (item?.practiced ?? 0) > 0;
            return (
              <li key={topic.id} className="card flex flex-col gap-1 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-lg font-bold">
                    <span aria-hidden="true">{topic.emoji} </span>
                    {topic.title}
                  </p>
                  {practiced && <span className="numeral text-sm text-ink-faint">%{Math.round(score * 100)}</span>}
                </div>
                <p className="text-[0.9rem] leading-snug text-ink-soft">{topic.description}</p>
                {practiced && (
                  <div className="rail mt-2 h-2">
                    <div
                      className="rail-fill"
                      style={{ width: `${Math.max(2, Math.round(score * 100))}%`, background: masteryColor(score) }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="btn mt-auto w-full"
                  style={{ marginTop: '0.75rem' }}
                  aria-label={`${topic.title} — Genel Tekrar`}
                  onClick={() => launch('topic', topic.id)}
                >
                  Çalış · ~{size} soru
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
