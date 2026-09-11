/**
 * Gelistirme denetimi (§59).
 * Yalnizca `import.meta.env.DEV` altinda gezinmede gorunur.
 * Ogrenci bu ham muhendislik istatistiklerini gormek zorunda degildir.
 */

import { useMemo, useState } from 'react';
import { allExercises, content, exercisesForTopic, reviewBank, summaries, topics } from '../lib/content';
import { auditExerciseContent } from '../lib/content-audit';
import type { Difficulty, Skill } from '../content/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const SKILLS: Skill[] = ['recognition', 'recall', 'production', 'correction', 'speaking'];

const SKILL_LABEL: Record<Skill, string> = {
  recognition: 'Tanıma',
  recall: 'Hatırlama',
  production: 'Üretim',
  correction: 'Düzeltme',
  speaking: 'Sesli',
};

export function DebugScreen() {
  const [showAll, setShowAll] = useState(false);
  const errors = content.warnings.filter((warning) => warning.level === 'error');
  const warns = content.warnings.filter((warning) => warning.level === 'warn');

  const perTopic = useMemo(
    () =>
      topics.map((topic) => {
        const exercises = exercisesForTopic(topic.id);
        const coverage = (content.coverage ?? []).filter((item) => item.topicId === topic.id);
        const uncovered = coverage.filter((item) => !item.summaryCovered);
        const noPractice = coverage.filter(
          (item) => item.exercises.easy + item.exercises.medium + item.exercises.hard === 0,
        );
        return {
          topic,
          exercises,
          coverage,
          uncovered,
          noPractice,
          audit: auditExerciseContent(exercises),
        };
      }),
    [],
  );

  const reviewAudit = useMemo(() => auditExerciseContent(reviewBank), []);

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 pb-24 pt-6 font-mono text-[0.9rem]">
      <h1 className="font-display text-3xl">İçerik Denetimi</h1>
      <p className="mt-2 text-ink-soft">
        {allExercises.length} alıştırma · {content.concepts.length} kavram ·{' '}
        {topics.length} konu · {summaries.reduce((total, summary) => total + summary.sections.length, 0)} özet bölümü · sürüm{' '}
        {content.contentVersion}
      </p>

      <div className="mt-4 flex gap-3">
        <span
          className="badge"
          style={{
            background: errors.length ? 'var(--color-bad-soft)' : 'var(--color-good-soft)',
            color: errors.length ? 'var(--color-bad-deep)' : 'var(--color-good-deep)',
          }}
        >
          {errors.length} hata
        </span>
        <span className="badge" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
          {warns.length} uyarı
        </span>
      </div>

      {content.warnings.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1">
          {content.warnings.map((warning, index) => (
            <li key={index} style={{ color: warning.level === 'error' ? 'var(--color-bad)' : 'var(--color-warn)' }}>
              {warning.level === 'error' ? '✕' : '!'} [{warning.code}] {warning.message} ({warning.ref ?? '-'})
            </li>
          ))}
        </ul>
      )}

      {perTopic.map(({ topic, exercises, coverage, uncovered, noPractice, audit }) => (
        <section key={topic.id} className="mt-10">
          <h2 className="font-display text-2xl">
            {topic.title} — {topic.exerciseIds.length} birincil + {topic.secondaryExerciseIds.length} bağlantılı ·{' '}
            {topic.reviewExerciseIds.length} Genel Tekrar
          </h2>
          <p className="text-ink-faint">{topic.id}</p>

          <div className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <div>
              <p className="font-bold">Zorluk</p>
              {DIFFICULTIES.map((difficulty) => {
                const count = exercises.filter((item) => item.difficulty === difficulty).length;
                return (
                  <p key={difficulty}>
                    {difficulty.padEnd(7)} {String(count).padStart(3)} · %
                    {Math.round((count / exercises.length) * 100)}
                  </p>
                );
              })}
            </div>
            <div>
              <p className="font-bold">Beceri</p>
              {SKILLS.map((skill) => (
                <p key={skill}>
                  {SKILL_LABEL[skill].padEnd(10)}{' '}
                  {String(exercises.filter((item) => item.skill === skill).length).padStart(3)}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-sunk px-3 py-2 text-[0.84rem] leading-relaxed text-ink-soft">
            <p>
              Toplam: {audit.total} · Benzersiz ID: {audit.uniqueIds} · Normalize soru: {audit.uniqueNormalizedPrompts}
            </p>
            <p>
              Aile: {audit.familyCount}
              {audit.largestFamily ? ` · En büyük: ${audit.largestFamily.id} — ${audit.largestFamily.count} varyant` : ''}
              {` · Olası yakın kopya: ${audit.nearDuplicates.length}`}
            </p>
          </div>

          {sourcesBlock(exercises)}

          <p className="mt-3 font-bold">
            Kavram kapsamı: {coverage.length - uncovered.length}/{coverage.length} özet karşılığı var
            {uncovered.length === 0 ? ' ✓' : ' ✕'}
          </p>
          {noPractice.length > 0 && (
            <p style={{ color: 'var(--color-warn)' }}>
              Pratiği olmayan: {noPractice.map((item) => item.conceptId).join(', ')}
            </p>
          )}

          {showAll && (
            <table className="mt-3 w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-line text-left">
                  <th className="py-1 pr-2">kavram</th>
                  <th className="py-1 pr-2">K</th>
                  <th className="py-1 pr-2">O</th>
                  <th className="py-1 pr-2">Z</th>
                  <th className="py-1">özet</th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((item) => (
                  <tr key={item.conceptId} className="border-b border-line">
                    <td className="py-1 pr-2">{item.conceptId}</td>
                    <td className="py-1 pr-2">{item.exercises.easy}</td>
                    <td className="py-1 pr-2">{item.exercises.medium}</td>
                    <td className="py-1 pr-2">{item.exercises.hard}</td>
                    <td className="py-1">{item.summaryCovered ? '✓' : '✕'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}

      <button type="button" className="btn mt-8" onClick={() => setShowAll((value) => !value)}>
        {showAll ? 'Kavram tablolarını gizle' : 'Kavram tablolarını göster'}
      </button>

      <section className="mt-10">
        <h2 className="font-display text-2xl">
          Genel Tekrar — {reviewBank.length} alıştırma
        </h2>
        <div className="mt-3 rounded-xl bg-sunk px-3 py-2 text-[0.84rem] leading-relaxed text-ink-soft">
          <p>
            Toplam: {reviewAudit.total} · Benzersiz ID: {reviewAudit.uniqueIds} · Normalize soru:{' '}
            {reviewAudit.uniqueNormalizedPrompts} · Olası yakın kopya: {reviewAudit.nearDuplicates.length}
          </p>
        </div>
        {sourcesBlock(reviewBank)}
      </section>
    </main>
  );
}

function sourcesBlock(exercises: { type: string; skill: string; wordBank?: { direction: string } }[]) {
  return (
    <div className="mt-3 rounded-xl bg-sunk px-3 py-2 text-[0.84rem] leading-relaxed text-ink-soft">
      <p>
        Çeviri:{' '}
        {exercises.filter((item) => item.type === 'word-bank-translation' && item.wordBank?.direction === 'de-to-tr').length}{' '}
        DE→TR /{' '}
        {exercises.filter((item) => item.type === 'word-bank-translation' && item.wordBank?.direction === 'tr-to-de').length}{' '}
        TR→DE · Dinleme: {exercises.filter((item) => item.type === 'listen-choice' || item.type === 'dictation').length} ·
        Üretim: {exercises.filter((item) => ['production', 'correction', 'speaking'].includes(item.skill)).length}
      </p>
    </div>
  );
}
