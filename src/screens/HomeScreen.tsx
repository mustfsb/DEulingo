import { useMemo } from 'react';
import { allExercises, lessonExercises, primaryExercisesForTopic, topicMasteryDefs, topics } from '../lib/content';
import { getGlobalSummary, getTopicProgressStats } from '../lib/progress';
import { computeTopicMastery } from '../lib/mastery';
import { goalProgress } from '../lib/daily-goal';
import { recommendNext } from '../lib/recommendation';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

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

function masteryColor(score: number): string {
  return score >= 0.75 ? 'var(--color-good)' : score >= 0.4 ? 'var(--color-brand)' : 'var(--color-signal)';
}

export function HomeScreen({ api, navigate }: { api: ProgressApi; navigate: (route: Route) => void }) {
  const { progress } = api;
  const hello = greeting();

  const recommendation = recommendNext({ progress, topics, exercisesForTopic: primaryExercisesForTopic });
  const goal = goalProgress(progress);
  const overall = getGlobalSummary(progress, lessonExercises);
  const totalMistakes = Object.keys(progress.mistakes).length;
  // Ustalık kavram bazlıdır: Genel Tekrar'daki cevaplar da konunun ustalığına sayılır.
  const mastery = useMemo(
    () => new Map(computeTopicMastery(progress, allExercises, topicMasteryDefs).map((item) => [item.topicId, item])),
    [progress],
  );

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
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
          <MiniStat label="Konu" value={String(topics.length)} />
          <MiniStat label="Tamamlanan konu" value={`${overall.completedTopics}/${topics.length}`} />
          <MiniStat
            label="Doğruluk"
            value={overall.accuracy === null ? '—' : `%${Math.round(overall.accuracy * 100)}`}
          />
          <MiniStat label="Aktif hata" value={String(totalMistakes)} />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="konular-baslik">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="konular-baslik" className="eyebrow">Konular</h2>
          <p className="text-sm text-ink-faint">Her konu yaşayan bir modüldür; istediğin sırayla çalışabilirsin.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => {
            const stats = getTopicProgressStats(progress, topic.id, primaryExercisesForTopic(topic.id));
            const topicMastery = mastery.get(topic.id)?.masteryScore ?? 0;
            const masteryPct = Math.round(topicMastery * 100);
            const accuracy = stats.accuracy === null ? null : Math.round(stats.accuracy * 100);

            return (
              <li key={topic.id}>
                <div
                  className="topic-tile flex h-full flex-col"
                  data-state={stats.state}
                  data-review={stats.reviewRecommended}
                >
                  <button
                    type="button"
                    className="topic-tile-main flex-1"
                    aria-label={`${topic.title} konusunu aç`}
                    onClick={() => navigate({ name: 'topic', topicId: topic.id })}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none" aria-hidden="true">
                        {topic.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl leading-tight">{topic.title}</h3>
                        <p className="mt-1 text-[0.92rem] leading-snug text-ink-soft">{topic.description}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-bold text-ink-soft">Ustalık</span>
                        <span className="numeral text-ink-faint">%{masteryPct}</span>
                      </div>
                      <div
                        className="rail mt-1 h-2"
                        role="progressbar"
                        aria-label={`${topic.title} ustalığı`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={masteryPct}
                      >
                        <div
                          className="rail-fill"
                          style={{ width: `${Math.max(2, masteryPct)}%`, background: masteryColor(topicMastery) }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                        {stats.completed}/{stats.total} alıştırma
                      </span>
                      {stats.state === 'completed' && (
                        <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>
                          ✓ Tamamlandı
                        </span>
                      )}
                      {accuracy !== null && (
                        <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                          Doğruluk %{accuracy}
                        </span>
                      )}
                      {stats.mistakeCount > 0 && (
                        <span className="badge" style={{ background: 'var(--color-bad-soft)', color: 'var(--color-bad-deep)' }}>
                          {stats.mistakeCount} hata
                        </span>
                      )}
                      {stats.reviewRecommended && (
                        <span className="badge" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
                          ⚠ Tekrar öneriliyor
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary flex-1"
                      aria-label={`${topic.title} — Çalış`}
                      onClick={() => navigate({ name: 'lesson', topicId: topic.id, mode: 'normal' })}
                    >
                      Çalış
                    </button>
                    <button
                      type="button"
                      className="btn btn-quiet"
                      aria-label={`${topic.title} özetini aç`}
                      onClick={() => navigate({ name: 'summary', topicId: topic.id })}
                    >
                      📖 Özet
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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
