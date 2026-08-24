import { useState } from 'react';
import { daysForTrack, exercisesForDay, allExercisesForTrack } from '../lib/content';
import { getDayStats, getGlobalSummary } from '../lib/progress';
import { goalProgress } from '../lib/daily-goal';
import { recommendNext } from '../lib/recommendation';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { LearningTrack } from '../content/types';

const GREETINGS: Array<{ until: number; de: string; tr: string }> = [
  { until: 9, de: 'Guten Morgen', tr: 'Günaydın' },
  { until: 17, de: 'Guten Tag', tr: 'İyi günler' },
  { until: 21, de: 'Guten Abend', tr: 'İyi akşamlar' },
  { until: 24, de: 'Gute Nacht', tr: 'İyi geceler' },
];

function greeting(date = new Date()) {
  const hour = date.getHours();
  return GREETINGS.find((entry) => hour < entry.until) ?? GREETINGS[0];
}

export function HomeScreen({ api, navigate }: { api: ProgressApi; navigate: (route: Route) => void }) {
  const { progress } = api;
  const hello = greeting();
  const [track, setTrack] = useState<LearningTrack>('normal');

  const trackDays = daysForTrack(track);
  const recommendation = recommendNext({
    progress,
    dayNumbers: trackDays.map((day) => day.day),
    exercisesForDay: (day: number) => exercisesForDay(day, track),
    track,
  } as any);
  const goal = goalProgress(progress);
  const overallNormal = getGlobalSummary(progress, allExercisesForTrack('normal'), daysForTrack('normal').map((d) => d.day), 'normal');
  const overallPrivate = getGlobalSummary(progress, allExercisesForTrack('private'), daysForTrack('private').map((d) => d.day), 'private');
  const totalMistakes = Object.keys(progress.mistakes).length;

  return (
    <main className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-6 sm:pt-10">
      <section className="anim-pop">
        <p className="eyebrow">{hello.tr}</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-6xl" lang="de">
          {hello.de}, Mustafa
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          {goal.reached
            ? `Bugünkü hedef tamamlandı ✓ — ${Math.round(goal.minutes)} dakika çalıştın.`
            : `Bugünkü hedef: ${goal.targetMinutes} dakika odaklı alıştırma.`}
        </p>
      </section>

      <button
        type="button"
        className="card mt-7 flex w-full items-center justify-between gap-4 p-5 text-left anim-pop"
        style={{ borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' }}
        onClick={() => navigate(recommendation.route)}
      >
        <span>
          <span className="eyebrow" style={{ color: 'var(--color-brand)' }}>
            {recommendation.eyebrow}
          </span>
          <span className="mt-1 block text-xl font-bold">{recommendation.title}</span>
          <span className="text-[0.95rem] text-ink-soft">{recommendation.description}</span>
        </span>
        <span className="numeral text-2xl" aria-hidden="true">
          →
        </span>
      </button>

      <section className="card mt-4 px-5 py-4" aria-label="Bugünkü hedef">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">Bugünkü hedef</p>
          <p className="numeral text-sm text-ink-faint">
            {Math.round(goal.minutes)} / {goal.targetMinutes} dk
          </p>
        </div>
        <div className="rail mt-2 h-2.5">
          <div
            className="rail-fill"
            style={{
              width: `${Math.max(2, Math.round(goal.ratio * 100))}%`,
              background: goal.reached ? 'var(--color-good)' : 'var(--color-brand)',
            }}
          />
        </div>
        <p className="mt-2 text-[0.9rem] text-ink-soft">
          {goal.reached
            ? `${goal.sessions} çalışma · ${goal.answered} cevap. Fazlası bonus.`
            : `${goal.answered} cevap verdin. Hedefi İstatistik ekranından değiştirebilirsin.`}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="eyebrow mb-3">Son durum</h2>
        <div className="flex flex-wrap gap-3">
          <MiniStat label="Normal gün" value={String(daysForTrack('normal').length)} />
          <MiniStat label="Özel Ders gün" value={String(daysForTrack('private').length)} />
          <MiniStat
            label="Normal doğruluk"
            value={overallNormal.accuracy === null ? '—' : `%${Math.round(overallNormal.accuracy * 100)}`}
          />
          <MiniStat
            label="Özel Ders doğruluk"
            value={overallPrivate.accuracy === null ? '—' : `%${Math.round(overallPrivate.accuracy * 100)}`}
          />
          <MiniStat label="Aktif hata" value={String(totalMistakes)} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="eyebrow">Öğrenme yolu</h2>
          <div className="ml-auto flex rounded-xl border-2 border-line overflow-hidden">
            {(['normal','private'] as LearningTrack[]).map((t) => (
              <button
                key={t}
                type="button"
                className="px-3 py-1.5 text-sm font-bold"
                style={{
                  background: track === t ? 'var(--color-brand)' : 'transparent',
                  color: track === t ? '#fff' : 'var(--color-ink-soft)',
                }}
                onClick={() => setTrack(t)}
              >
                {t === 'normal' ? 'Normal Çalışma' : '🎓 Özel Ders'}
              </button>
            ))}
          </div>
        </div>
        <ol className="relative flex flex-col gap-4">
          {trackDays.map((day, index) => {
            const exercises = exercisesForDay(day.day, track);
            const stats = getDayStats(progress, day.day, exercises);
            const accuracy = stats.accuracy === null ? null : Math.round(stats.accuracy * 100);

            return (
              <li key={`${track}-${day.day}`} className="relative flex gap-4">
                <div className="relative flex w-10 flex-none justify-center">
                  <div
                    className="spine absolute inset-y-0 w-[9px]"
                    style={{ opacity: index === trackDays.length - 1 ? 0.35 : 1 }}
                    aria-hidden="true"
                  />
                  <span
                    className="numeral relative z-10 mt-4 grid size-10 place-items-center rounded-2xl text-lg"
                    style={{
                      background:
                        stats.state === 'completed'
                          ? 'var(--color-good)'
                          : stats.state === 'in-progress'
                            ? 'var(--color-brand)'
                            : 'var(--color-sunk)',
                      color: stats.state === 'not-started' ? 'var(--color-ink-faint)' : '#fff',
                    }}
                    aria-hidden="true"
                  >
                    {day.day}
                  </span>
                </div>

                <button
                  type="button"
                  className="day-tile flex-1"
                  data-state={stats.state}
                  data-review={stats.reviewRecommended}
                  onClick={() => navigate({ name: 'day', track, day: day.day })}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-2xl">{track === 'private' ? `🎓 ${day.day}. Gün` : `${day.day}. Gün`}</h3>
                    <span className="text-sm font-bold text-ink-faint">
                      {stats.completed}/{stats.total} alıştırma
                    </span>
                  </div>

                  <p className="mt-1.5 text-[0.95rem] leading-snug text-ink-soft">
                    {day.topics.join(' • ')}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {stats.state === 'not-started' && (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        Hazır
                      </span>
                    )}
                    {stats.state === 'in-progress' && (
                      <span
                        className="badge"
                        style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
                      >
                        Devam ediyor
                      </span>
                    )}
                    {stats.state === 'completed' && (
                      <span
                        className="badge"
                        style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}
                      >
                        ✓ Tamamlandı
                      </span>
                    )}
                    {accuracy !== null && (
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        Doğruluk %{accuracy}
                      </span>
                    )}
                    {stats.mistakeCount > 0 && (
                      <span
                        className="badge"
                        style={{ background: 'var(--color-bad-soft)', color: 'var(--color-bad-deep)' }}
                      >
                        {stats.mistakeCount} hata
                      </span>
                    )}
                    {stats.reviewRecommended && (
                      <span
                        className="badge"
                        style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}
                      >
                        ⚠ Tekrar öneriliyor
                      </span>
                    )}
                  </div>

                  {stats.completionPct > 0 && (
                    <div className="rail mt-4 h-2">
                      <div
                        className="rail-fill"
                        style={{
                          width: `${Math.round(stats.completionPct * 100)}%`,
                          background:
                            stats.state === 'completed' ? 'var(--color-good)' : 'var(--color-brand)',
                        }}
                      />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        {track === 'private' && trackDays.length === 0 && (
          <p className="mt-4 text-ink-soft">Özel Ders için henüz içerik yok.</p>
        )}
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-0.5 text-2xl">{value}</p>
    </div>
  );
}
