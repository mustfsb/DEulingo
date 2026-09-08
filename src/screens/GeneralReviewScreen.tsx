import { useState } from 'react';
import { reviewBank } from '../lib/content';
import { computeConceptProgress } from '../lib/mastery';
import { conceptsById } from '../lib/content';
import {
  MIN_GROUP_SIZE,
  REVIEW_GROUPS,
  REVIEW_MODES,
  groupPoolSize,
  type ReviewMode,
} from '../lib/general-review';
import { previewReviewSize, startMistakeSession, startReviewSession } from '../lib/start-review';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const MODE_ORDER: ReviewMode[] = ['mixed', 'vocab', 'sentence', 'writing', 'listening', 'quick', 'challenge'];

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
  const conceptScores = computeConceptProgress(progress, reviewBank);

  const launch = (mode: ReviewMode, groupId?: string) => {
    const ok = startReviewSession(api, navigate, { mode, groupId });
    if (!ok) setNotice('Bu başlık için henüz yeterli soru yok.');
  };

  return (
    <main className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Bugüne kadar öğrendiğin her şey</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Genel Tekrar</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {reviewBank.length} kümülatif soru arasından zayıf noktalarına öncelik veren karışık seçkiler.
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
            ~{previewReviewSize('mixed')} soru · kelime → cümle → saat → yemek → fiil → dinleme
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
        <div className="grid gap-3 sm:grid-cols-2">
          {MODE_ORDER.filter((mode) => mode !== 'mixed').map((mode) => {
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
            <p className="text-[0.92rem] text-ink-soft">Tüm günlerin hataları, tek listede</p>
            <p className="numeral mt-2 text-sm text-ink-faint">
              {mistakeCount === 0 ? 'Hata yok' : `${mistakeCount} aktif hata`}
            </p>
          </button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="eyebrow mb-4">Konuya göre çalış</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {REVIEW_GROUPS.map((group) => {
            const size = groupPoolSize(reviewBank, group.id);
            if (size < MIN_GROUP_SIZE) return null;
            const mastery = groupMastery(group.topicIds, conceptScores);
            return (
              <li key={group.id} className="card flex flex-col gap-1 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-lg font-bold">{group.title}</p>
                  {mastery !== null && (
                    <span className="numeral text-sm text-ink-faint">%{Math.round(mastery * 100)}</span>
                  )}
                </div>
                <p className="text-[0.92rem] text-ink-soft">{group.description}</p>
                {mastery !== null && (
                  <div className="rail mt-2 h-2">
                    <div
                      className="rail-fill"
                      style={{
                        width: `${Math.max(2, Math.round(mastery * 100))}%`,
                        background:
                          mastery >= 0.75
                            ? 'var(--color-good)'
                            : mastery >= 0.4
                              ? 'var(--color-brand)'
                              : 'var(--color-signal)',
                      }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="btn mt-3 w-full"
                  onClick={() => launch('topic', group.id)}
                >
                  Çalış · ~{Math.min(20, size)} soru
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function groupMastery(
  topicIds: string[],
  conceptScores: Map<string, { masteryScore: number; attempts: number }>,
): number | null {
  const conceptIds = topicIds.flatMap((topicId) => {
    const entry = [...conceptsById.values()].filter((concept) => concept.topicId === topicId);
    return entry.map((concept) => concept.id);
  });
  const practiced = conceptIds
    .map((id) => conceptScores.get(id))
    .filter((item) => item && item.attempts > 0);
  if (!practiced.length) return null;
  return practiced.reduce((sum, item) => sum + item!.masteryScore, 0) / practiced.length;
}
