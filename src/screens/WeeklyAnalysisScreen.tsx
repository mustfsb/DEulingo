/**
 * Hata sınıflandırması (Session G8): hafta testinden sonra hatalar sekiz
 * kategoriye ayrılır ve her kategori doğrudan ilgili pratiğe bağlanır.
 * Sayılar kayıtlı hata ve beceri geçmişinden her seferinde türetilir.
 */

import { useMemo } from 'react';
import { contentFor } from '../lib/content-en';
import { classifyWeekMistakes, type MistakeCategory } from '../lib/week-analysis';
import type { ProgressApi } from '../hooks/useProgress';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

const ACTIONS: Record<MistakeCategory, { label: string; route: Route }> = {
  Grammar: { label: 'Gramer hatalarını tekrarla', route: { name: 'mistakes', scope: 'week1' } },
  Vocabulary: { label: 'Kelime çalış', route: { name: 'vocab-study', kind: 'weak' } },
  Collocation: { label: 'Öbek pratiği', route: { name: 'vocab-study', kind: 'topic', topicId: 'en.prepositions-collocations' } },
  'Sentence Structure': { label: 'Cümle yapısı hataları', route: { name: 'lesson', topicId: 'en.sentence-structure', mode: 'section', sectionId: 'set.ss.error-correction' } },
  Reading: { label: 'Okuma kanıt incelemesi', route: { name: 'reading-passage', passageId: 'en-read-wt-1', view: 'review' } },
  Listening: { label: 'Dinleme testini tekrarla', route: { name: 'listening', focus: 'week1-test' } },
  Writing: { label: 'Yazıyı yeniden yaz', route: { name: 'writing', taskId: 'en-write-wt-1', stage: 'rewrite' } },
  Speaking: { label: 'Konuşma tekrarı', route: { name: 'speaking', topicId: 'en.present-perfect', focus: 'pp-personal', retry: true } },
};

export function WeeklyAnalysisScreen({
  api,
  skills,
  navigate,
}: {
  api: ProgressApi;
  skills: EnSkillsState;
  navigate: (route: Route) => void;
}) {
  const C = contentFor(api.language ?? 'de');
  const buckets = useMemo(
    () => classifyWeekMistakes(api.progress, skills, (id) => C.exercisesById.get(id)?.topicId),
    [api.progress, skills, C],
  );
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const priority = [...buckets].filter((bucket) => bucket.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'weekly' })}>← Haftalık Plan</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Hafta 1 · Session G</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Hata Sınıflandırması</h1>
        <p className="mt-2 text-ink-soft">
          Hafta testinden sonra hatalarını sekiz kategoriye ayır; en çok zorlandığın yerden başla.
        </p>
      </header>

      {total === 0 ? (
        <section className="card mt-6 p-6 text-center" role="status">
          <p className="text-lg font-bold">Henüz sınıflandırılacak hata yok.</p>
          <p className="mt-1 text-ink-soft">Haftalık tekrar ve mini testleri çözdükten sonra hatalar burada kategorilere ayrılır.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => navigate({ name: 'weekly' })}>Plana Dön</button>
        </section>
      ) : (
        <>
          <section className="card mt-6 p-5" aria-label="Öncelik">
            <p className="eyebrow">Öncelik</p>
            <ol className="mt-1 grid gap-1">
              {priority.map((bucket, index) => (
                <li key={bucket.category}><span className="badge numeral mr-2">{index + 1}</span><strong>{bucket.category}</strong> — {bucket.count} hata</li>
              ))}
            </ol>
          </section>
          <ul className="mt-5 grid gap-3">
            {buckets.map((bucket) => (
              <li key={bucket.category} className="card p-4" data-category={bucket.category}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-bold">{bucket.category}</p>
                  <span className="badge numeral">{bucket.count}</span>
                </div>
                <div className="rail mt-2 h-1.5" aria-hidden="true">
                  <div className="rail-fill" style={{ width: `${Math.round((bucket.count / max) * 100)}%` }} />
                </div>
                {bucket.examples.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[0.92rem] text-ink-soft">
                    {bucket.examples.map((example) => <li key={example}>{example}</li>)}
                  </ul>
                )}
                {bucket.count > 0 && (
                  <button type="button" className="btn btn-quiet mt-2 px-0" onClick={() => navigate(ACTIONS[bucket.category].route)}>
                    {ACTIONS[bucket.category].label} →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
