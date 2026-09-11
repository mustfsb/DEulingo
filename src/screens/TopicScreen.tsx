import { useMemo } from 'react';
import {
  allExercises,
  exercisesForSection,
  exercisesForTopic,
  getTopic,
  getTopicSummary,
  primaryExercisesForTopic,
  sectionMasteryDefs,
  topicMasteryDefs,
  topicTitle,
} from '../lib/content';
import { getTopicProgressStats } from '../lib/progress';
import { computeTopicMastery } from '../lib/mastery';
import {
  buildSessionPlan,
  challengeReadiness,
  estimateModeMinutes,
  type SessionMode,
} from '../lib/session';
import { previewReviewSize, startReviewSession } from '../lib/start-review';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const MODES: Array<{
  mode: SessionMode;
  label: string;
  hint: string;
  primary?: boolean;
}> = [
  { mode: 'normal', label: 'Normal Çalışma', hint: 'Dengeli seçki', primary: true },
  { mode: 'full', label: 'Tam Çalışma', hint: 'Konunun her bölümünden geniş seçki' },
  { mode: 'quick', label: 'Hızlı Tekrar', hint: 'Hatalar ve zayıf noktalar' },
  { mode: 'challenge', label: 'Zor Sorular', hint: 'Güçlü hatırlama, üretim ağırlıklı' },
];

function masteryColor(score: number): string {
  return score >= 0.75 ? 'var(--color-good)' : score >= 0.4 ? 'var(--color-brand)' : 'var(--color-signal)';
}

export function TopicScreen({
  topicId,
  api,
  navigate,
}: {
  topicId: string;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const topic = getTopic(topicId);
  const summary = getTopicSummary(topicId);
  const pool = useMemo(() => exercisesForTopic(topicId), [topicId]);
  const primary = useMemo(() => primaryExercisesForTopic(topicId), [topicId]);
  const { progress } = api;

  const sectionMastery = useMemo(
    () => computeTopicMastery(progress, allExercises, sectionMasteryDefs(topicId)),
    [progress, topicId],
  );
  const topicMastery = useMemo(
    () => computeTopicMastery(progress, allExercises, topicMasteryDefs.filter((def) => def.id === topicId))[0],
    [progress, topicId],
  );

  if (!topic) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Bu konu bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'home' })}>
          Derslere Dön
        </button>
      </main>
    );
  }

  const stats = getTopicProgressStats(progress, topicId, primary);
  const secondaryCount = pool.length - primary.length;
  const difficulty = {
    easy: pool.filter((item) => item.difficulty === 'easy').length,
    medium: pool.filter((item) => item.difficulty === 'medium').length,
    hard: pool.filter((item) => item.difficulty === 'hard').length,
  };
  const sessions = progress.topics[topicId]?.sessionsCompleted ?? 0;
  const reviewSize = previewReviewSize('topic', topicId);
  const relatedTopicIds = [
    ...new Set(pool.flatMap((item) => [item.topicId, ...(item.secondaryTopicIds ?? [])])),
  ].filter((id) => id !== topicId);

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>
        ← Dersler
      </button>

      <header className="mt-4 anim-pop">
        <p className="eyebrow">Konu</p>
        <h1 className="mt-1 text-5xl sm:text-6xl">
          <span aria-hidden="true">{topic.emoji} </span>
          {topic.title}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">{topic.description}</p>
      </header>

      <div className="mt-7 flex flex-wrap gap-3">
        <Stat
          label="Havuz"
          value={`${pool.length} alıştırma`}
          detail={secondaryCount > 0 ? `${primary.length} konuya ait · ${secondaryCount} bağlantılı` : undefined}
        />
        <Stat label="Zorluk" value={`${difficulty.easy}/${difficulty.medium}/${difficulty.hard}`} />
        <Stat label="Ustalık" value={`%${Math.round((topicMastery?.masteryScore ?? 0) * 100)}`} />
        <Stat label="Doğruluk" value={stats.accuracy === null ? '—' : `%${Math.round(stats.accuracy * 100)}`} />
      </div>

      <section className="mt-9">
        <h2 className="eyebrow mb-4">Nasıl çalışmak istersin?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((item) => {
            const plan = buildSessionPlan({
              pool,
              progress,
              mode: item.mode,
              topicId,
              seed: `${topicId}:${item.mode}::${sessions}`,
            });
            const count = plan.primaryQueue.length;
            const minutes = estimateModeMinutes(pool, count);
            // Havuzu gercekten yetersiz bir modda kirik bir oturum acmak yerine
            // kart devre disi kalir ve nedeni yazilir (§10, §41).
            const disabled = count === 0 || (item.mode === 'challenge' && !challengeReadiness(pool).ready);
            return (
              <button
                key={item.mode}
                type="button"
                className="card mode-card p-4 text-left"
                disabled={disabled}
                aria-disabled={disabled || undefined}
                style={
                  item.primary && !disabled
                    ? { borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' }
                    : disabled
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : undefined
                }
                onClick={() => {
                  if (disabled) return;
                  navigate({ name: 'lesson', topicId, mode: item.mode });
                }}
              >
                <p className="text-lg font-bold">{item.label}</p>
                <p className="text-[0.92rem] text-ink-soft">{item.hint}</p>
                <p className="numeral mt-2 text-sm text-ink-faint">
                  {disabled ? 'Bu konuda yeterli soru yok' : `~${count} soru · ~${minutes} dk`}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary && (
            <button type="button" className="btn btn-quiet w-full" onClick={() => navigate({ name: 'summary', topicId })}>
              📖 Özeti Oku (~{summary.estimatedReadingMinutes} dk)
            </button>
          )}
          {reviewSize > 0 && (
            <button
              type="button"
              className="btn btn-quiet w-full"
              onClick={() => startReviewSession(api, navigate, { mode: 'topic', topicId })}
            >
              🔁 Genel Tekrar'da çalış (~{reviewSize} soru)
            </button>
          )}
        </div>
      </section>

      {sectionMastery.length > 0 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-4">Bölümler</h2>
          <ul className="flex flex-col gap-3.5">
            {sectionMastery.map((section) => {
              const count = exercisesForSection(section.topicId).length;
              return (
                <li key={section.topicId}>
                  <div className="flex items-baseline justify-between gap-3">
                    {count > 0 ? (
                      <button
                        type="button"
                        className="text-left text-lg font-bold underline-offset-4 hover:underline"
                        onClick={() => navigate({ name: 'lesson', topicId, mode: 'section', sectionId: section.topicId })}
                      >
                        {section.title}
                      </button>
                    ) : (
                      <span className="text-lg font-bold">{section.title}</span>
                    )}
                    <span className="numeral flex-none text-sm text-ink-faint">
                      {count > 0 ? `${count} soru · ` : ''}%{Math.round(section.masteryScore * 100)}
                    </span>
                  </div>
                  <div className="rail mt-1.5 h-2.5">
                    <div
                      className="rail-fill"
                      style={{
                        width: `${Math.max(2, Math.round(section.masteryScore * 100))}%`,
                        background: masteryColor(section.masteryScore),
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-1 text-sm text-ink-faint underline-offset-4 hover:underline"
                    onClick={() => navigate({ name: 'summary', topicId, sectionId: section.topicId })}
                  >
                    Özette aç
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-ink-faint">Bölüm adına dokunarak yalnızca o bölümü çalışabilirsin.</p>
        </section>
      )}

      {relatedTopicIds.length > 0 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-3">Bağlantılı konular</h2>
          <ul className="flex flex-wrap gap-2">
            {relatedTopicIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="badge"
                  style={{ background: 'var(--color-sunk)' }}
                  onClick={() => navigate({ name: 'topic', topicId: id })}
                >
                  {topicTitle(id)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-0.5 text-xl">{value}</p>
      {detail && <p className="text-xs text-ink-faint">{detail}</p>}
    </div>
  );
}
