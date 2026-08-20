import { exercisesBeforeDay, exercisesForDay, getDay, getSummary, topicsForDay } from '../lib/content';
import { getDayStats } from '../lib/progress';
import { computeTopicMastery } from '../lib/mastery';
import { exerciseSetsForDay } from '../content/exercise-sets';
import {
  buildSessionPlan,
  challengeReadiness,
  estimateModeMinutes,
  type SessionMode,
} from '../lib/session';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

const MODES: Array<{
  mode: SessionMode;
  label: string;
  hint: string;
  primary?: boolean;
}> = [
  { mode: 'normal', label: 'Normal Çalışma', hint: 'Dengeli seçki', primary: true },
  { mode: 'full', label: 'Tam Çalışma', hint: 'Geniş, dengeli seçki' },
  { mode: 'quick', label: 'Hızlı Tekrar', hint: 'Hatalar ve zayıf konular' },
  { mode: 'challenge', label: 'Zor Sorular', hint: 'Güçlü hatırlama' },
];

export function DayIntroScreen({
  day,
  api,
  navigate,
}: {
  day: number;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const entry = getDay(day);
  const exercises = exercisesForDay(day);
  const summary = getSummary(day);
  const exerciseSets = exerciseSetsForDay(exercises);

  if (!entry) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Bu gün bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'home' })}>
          Ana Sayfaya Dön
        </button>
      </main>
    );
  }

  const stats = getDayStats(api.progress, day, exercises);
  const topics = topicsForDay(day);
  const mastery = computeTopicMastery(api.progress, exercises, topics);
  const difficulty = {
    easy: exercises.filter((item) => item.difficulty === 'easy').length,
    medium: exercises.filter((item) => item.difficulty === 'medium').length,
    hard: exercises.filter((item) => item.difficulty === 'hard').length,
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>
        ← Öğrenme yolu
      </button>

      <header className="mt-4 anim-pop">
        <p className="eyebrow">{entry.topics.join(' • ')}</p>
        <h1 className="mt-1 text-5xl sm:text-7xl">{day}. Gün</h1>
      </header>

      <div className="mt-7 flex flex-wrap gap-3">
        <Stat label="Havuz" value={`${exercises.length} alıştırma`} />
        <Stat label="Zorluk" value={`${difficulty.easy}/${difficulty.medium}/${difficulty.hard}`} />
        <Stat
          label="Doğruluk"
          value={stats.accuracy === null ? '—' : `%${Math.round(stats.accuracy * 100)}`}
        />
      </div>

      {mastery.length > 0 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-4">Konu ustalığı</h2>
          <ul className="flex flex-col gap-3.5">
            {mastery.map((topic) => (
              <li key={topic.topicId}>
                <div className="flex items-baseline justify-between gap-3">
                  <button
                    type="button"
                    className="text-left text-lg font-bold underline-offset-4 hover:underline"
                    onClick={() =>
                      navigate({ name: 'lesson', day, mode: 'topic', topicId: topic.topicId })
                    }
                  >
                    {topic.title}
                  </button>
                  <span className="numeral text-sm text-ink-faint">
                    %{Math.round(topic.masteryScore * 100)}
                  </span>
                </div>
                <div className="rail mt-1.5 h-2.5">
                  <div
                    className="rail-fill"
                    style={{
                      width: `${Math.max(2, Math.round(topic.masteryScore * 100))}%`,
                      background:
                        topic.masteryScore >= 0.75
                          ? 'var(--color-good)'
                          : topic.masteryScore >= 0.4
                            ? 'var(--color-brand)'
                            : 'var(--color-signal)',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-faint">
            Konu adına dokunarak yalnızca o konuyu çalışabilirsin.
          </p>
        </section>
      )}

      <section className="mt-9">
        <h2 className="eyebrow mb-4">Nasıl çalışmak istersin?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((item) => {
            const plan = buildSessionPlan({
              pool: exercises,
              previous: exercisesBeforeDay(day),
              progress: api.progress,
              mode: item.mode,
              seed: `${day}:${item.mode}::${api.progress.days[day]?.sessionsCompleted ?? 0}`,
            });
            const count = plan.primaryQueue.length;
            const minutes = estimateModeMinutes(exercises, count);
            // Havuzu gercekten yetersiz bir modda kirik bir oturum acmak yerine
            // kart devre disi kalir ve nedeni yazilir (§10, §41).
            const disabled =
              count === 0 || (item.mode === 'challenge' && !challengeReadiness(exercises).ready);
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
                  navigate({ name: 'lesson', day, mode: item.mode });
                }}
              >
                <p className="text-lg font-bold">{item.label}</p>
                <p className="text-[0.92rem] text-ink-soft">{item.hint}</p>
                <p className="numeral mt-2 text-sm text-ink-faint">
                  {disabled ? 'Bu günde yeterli soru yok' : `~${count} soru · ~${minutes} dk`}
                </p>
              </button>
            );
          })}
        </div>

        {summary && (
          <button
            type="button"
            className="btn btn-quiet mt-4 w-full"
            onClick={() => navigate({ name: 'summary', day })}
          >
            📖 Özeti Oku (~{summary.estimatedReadingMinutes} dk)
          </button>
        )}
      </section>

      {exerciseSets.length > 0 && (
        <section className="mt-9">
          <h2 className="eyebrow mb-2">Alıştırma setleri</h2>
          <p className="mb-4 text-sm text-ink-soft">
            Setler birbirini tekrar etmez; seçtiğin setin bütün soruları her seferinde farklı sırayla gelir.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {exerciseSets.map((set) => {
              const setStats = getDayStats(api.progress, day, set.exercises);
              return (
                <button
                  key={set.id}
                  type="button"
                  className="card mode-card p-4 text-left"
                  onClick={() => navigate({ name: 'lesson', day, mode: 'set', exerciseSetId: set.id })}
                >
                  <p className="text-lg font-bold">{set.label}</p>
                  <p className="mt-1 text-[0.92rem] text-ink-soft">
                    {set.exercises.length} farklı soru · tamamen karışık
                  </p>
                  <p className="numeral mt-2 text-sm text-ink-faint">
                    {setStats.completed === 0 ? 'Henüz başlanmadı' : `${setStats.completed}/${set.exercises.length} denendi`}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-0.5 text-xl">{value}</p>
    </div>
  );
}
