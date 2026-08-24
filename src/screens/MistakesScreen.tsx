import { useMemo, useState } from 'react';
import { Markup } from '../components/Markup';
import { exercisesById, getExercises, summaryTopicsById, topicDay, topicTrack } from '../lib/content';
import type { LearningTrack } from '../content/types';
import { buildReviewQueue } from '../lib/lesson';
import { MISTAKE_LABELS } from '../lib/progress';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { MistakeRecord } from '../lib/storage';

/** Ayni yazim hatasi bu kadar tekrar edince uyari gosterilir (§41). */
export const TYPO_WARNING_THRESHOLD = 3;

/** Tek bir tekrar oturumuna alinacak en fazla hata sayisi. */
const REVIEW_LIMIT = 15;

type GroupBy = 'topic' | 'type';

export function MistakesScreen({
  api,
  navigate,
  track,
}: {
  api: ProgressApi;
  navigate: (route: Route) => void;
  track?: LearningTrack;
}) {
  const initialTrack: LearningTrack = track ?? 'normal';
  const [filterTrack, setFilterTrack] = useState<LearningTrack>(initialTrack);
  const { progress, update } = api;
  const [groupBy, setGroupBy] = useState<GroupBy>('topic');

  const groups = useMemo(() => {
    const buckets = new Map<string, { label: string; topicId?: string; records: MistakeRecord[] }>();

    for (const record of Object.values(progress.mistakes)) {
      const ex = exercisesById.get(record.exerciseId);
      const recTrack: LearningTrack = (record.track as LearningTrack | undefined) ?? (ex?.track as LearningTrack | undefined) ?? 'normal';
      if (recTrack !== filterTrack) continue;
      const exercise = exercisesById.get(record.exerciseId);
      const key =
        groupBy === 'topic' ? (exercise?.topicId ?? record.topic) : MISTAKE_LABELS[record.type];
      const bucket = buckets.get(key) ?? {
        label: groupBy === 'topic' ? (exercise?.topic ?? record.topic) : MISTAKE_LABELS[record.type],
        topicId: groupBy === 'topic' ? exercise?.topicId : undefined,
        records: [],
      };
      bucket.records.push(record);
      buckets.set(key, bucket);
    }

    return [...buckets.values()]
      .map((bucket) => ({
        ...bucket,
        records: bucket.records.sort((a, b) => b.count + b.typoCount - (a.count + a.typoCount)),
        weight: bucket.records.reduce((sum, record) => sum + record.count * 2 + record.typoCount, 0),
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [progress.mistakes, groupBy, filterTrack]);

  const repeatedTypos = useMemo(
    () =>
      Object.values(progress.mistakes).filter((record) => {
        const ex = exercisesById.get(record.exerciseId);
        const recTrack: LearningTrack = (record.track as LearningTrack | undefined) ?? (ex?.track as LearningTrack | undefined) ?? 'normal';
        return recTrack === filterTrack && record.typoCount >= TYPO_WARNING_THRESHOLD;
      }),
    [progress.mistakes, filterTrack],
  );

  const startReview = (ids: string[]) => {
    const queue = ids.filter((id) => exercisesById.has(id));
    if (!queue.length) return;
    update((current) => ({
      ...current,
      activeLesson: {
        mode: 'review',
        track: filterTrack,
        queue: queue.map((exerciseId) => ({ exerciseId, presentationReason: 'primary' as const })),
        index: 0,
        startedAt: new Date().toISOString(),
        results: [],
        retries: {},
        streak: { current: 0, best: 0, firedMilestones: [] },
      },
    }));
    navigate({ name: 'review', track: filterTrack });
  };

  // "Hepsini tekrar çalış" en zorlanılandan başlar (zayıflık puanına göre),
  // hata listesinin görüntüleme sırasına göre değil.
  const allIds = buildReviewQueue(
    getExercises(Object.keys(progress.mistakes).filter((id) => {
      const ex = exercisesById.get(id);
      const rec = progress.mistakes[id];
      const recTrack: LearningTrack = (rec.track as LearningTrack | undefined) ?? (ex?.track as LearningTrack | undefined) ?? 'normal';
      return recTrack === filterTrack;
    })),
    progress,
    REVIEW_LIMIT,
  );

  return (
    <main className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Zayıf noktalar</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Hatalarım</h1>
      </header>
      <div className="mt-6 flex rounded-xl border-2 border-line overflow-hidden w-fit">
        {(['normal','private'] as LearningTrack[]).map((t) => (
          <button
            key={t}
            type="button"
            className="px-4 py-2 text-sm font-bold"
            style={{ background: filterTrack === t ? 'var(--color-brand)' : 'transparent', color: filterTrack === t ? '#fff' : 'var(--color-ink-soft)' }}
            onClick={() => setFilterTrack(t)}
          >
            {t === 'normal' ? 'Normal' : '🎓 Özel Ders'}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <p className="text-lg font-bold">Henüz kayıtlı hata yok.</p>
          <p className="mt-2 text-ink-soft">
            Bir ders çözdüğünde yanlışların ve küçük yazım hataların burada birikir.
          </p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => navigate({ name: 'home' })}>
            Derse başla
          </button>
        </div>
      ) : (
        <>
          {repeatedTypos.length > 0 && (
            <div
              className="mt-6 rounded-2xl px-4 py-3"
              style={{ background: 'var(--color-warn-soft)' }}
            >
              <p className="font-bold">⚠ Tekrar eden yazım hataları</p>
              <ul className="mt-1.5 flex flex-col gap-0.5 text-[0.95rem]">
                {repeatedTypos.map((record) => (
                  <li key={record.exerciseId}>
                    <span className="font-mono" lang="de">
                      {record.expectedAnswer}
                    </span>{' '}
                    — bu yazım hatasını {record.typoCount} kez yaptın.
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-quiet mt-2 px-0 underline"
                onClick={() => startReview(repeatedTypos.map((record) => record.exerciseId))}
              >
                Bunları çalış →
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              // Bos kuyrukla ders acilmaz: buton o durumda gorunur bicimde pasiftir.
              disabled={allIds.length === 0}
              onClick={() => startReview(allIds)}
            >
              {allIds.length === 0
                ? 'Tekrar gerekmiyor'
                : `Hepsini Tekrar Çalış (${allIds.length})`}
            </button>
            <div className="flex items-center gap-1" role="group" aria-label="Gruplama">
              <span className="eyebrow mr-1">Grupla</span>
              {(['topic', 'type'] as GroupBy[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="nav-link text-sm"
                  aria-current={groupBy === value ? 'page' : undefined}
                  onClick={() => setGroupBy(value)}
                >
                  {value === 'topic' ? 'Konu' : 'Hata türü'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.label}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl">{group.label}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    {group.topicId && summaryTopicsById.has(group.topicId) && (
                      <>
                        {/* Konu pratigi ile ozet okuma ayri eylemlerdir; etiketler
                            artik hangisinin ne yaptigini soyler. */}
                        <button
                          type="button"
                          className="btn btn-quiet text-sm"
                          onClick={() =>
                            navigate({
                              name: 'lesson',
                              track: topicTrack.get(group.topicId!) ?? filterTrack,
                              day: topicDay.get(group.topicId!) ?? group.records[0].day,
                              mode: 'topic',
                              topicId: group.topicId,
                            })
                          }
                        >
                          Konuyu Çalış
                        </button>
                        <button
                          type="button"
                          className="btn btn-quiet text-sm"
                          onClick={() =>
                            navigate({
                              name: 'summary',
                              track: topicTrack.get(group.topicId!) ?? filterTrack,
                              day: topicDay.get(group.topicId!) ?? group.records[0].day,
                              topicId: group.topicId,
                            })
                          }
                        >
                          Özeti Aç
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="btn btn-quiet text-sm"
                      onClick={() => startReview(group.records.map((record) => record.exerciseId))}
                    >
                      Tekrar Çalış →
                    </button>
                  </div>
                </div>

                <ul className="flex flex-col gap-3">
                  {group.records.map((record) => (
                    <li key={record.exerciseId} className="card p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                          {(exercisesById.get(record.exerciseId)?.track === 'private' ? '🎓 ' : '')}{record.day}. Gün
                        </span>
                        <span className="badge" style={{ background: 'var(--color-sunk)' }}>
                          {MISTAKE_LABELS[record.type]}
                        </span>
                        {record.count > 0 && (
                          <span
                            className="badge"
                            style={{ background: 'var(--color-bad-soft)', color: 'var(--color-bad-deep)' }}
                          >
                            {record.count} kez yanlış
                          </span>
                        )}
                        {record.typoCount > 0 && (
                          <span
                            className="badge"
                            style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}
                          >
                            {record.typoCount >= TYPO_WARNING_THRESHOLD ? '⚠ ' : ''}
                            {record.typoCount} yazım hatası
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[0.95rem] text-ink-soft">
                        <Markup text={record.prompt} />
                      </p>

                      <div className="mt-2 flex flex-col gap-1 font-mono text-[0.95rem]">
                        <p style={{ color: 'var(--color-bad)' }} lang="de">
                          ✕ {record.userAnswer || '—'}
                        </p>
                        <p style={{ color: 'var(--color-good-deep)' }} lang="de">
                          ✓ {record.expectedAnswer || '—'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
