/**
 * Kelime çıkarma (Session E5): Hafta 1 okuma pasajlarından 5–10 işe yarar
 * kelime/öbek. Hiçbiri otomatik eklenmez; öğrenci "Öğrenilecek Kelimelere
 * Ekle" dediği öğe İngilizce kelime öğrenme sistemine girer (İng→Tr, Tr→İng,
 * eşleştirme, yazma, zayıf kelimeler, Genel Tekrar kelime akışı).
 */

import { useMemo } from 'react';
import { EN_READING_PASSAGES } from '../content/en/skills-reading';
import { userVocabId } from '../content/en/user-vocab';
import { contentFor } from '../lib/content-en';
import { computeVocabProgress, type VocabState } from '../lib/vocab/mastery';
import { addReadingVocab, removeReadingVocab } from '../lib/skills-storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

const STATE_LABEL: Record<VocabState, string> = {
  new: 'Yeni', learning: 'Öğreniliyor', familiar: 'Tanıdık', mastered: 'Öğrenildi', weak: 'Zayıf',
};

export function ReadingVocabScreen({
  skills,
  onRecord,
  navigate,
  api,
}: {
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
  /** Ustalık durumunu göstermek için (yoksa durum rozeti gizlenir). */
  api?: ProgressApi;
}) {
  const sources = EN_READING_PASSAGES.filter((p) => p.weekRole === 'week1-passage-1' || p.weekRole === 'week1-passage-2');
  const savedIds = new Set(skills.readingVocab.map((v) => v.id));
  const mastery = useMemo(() => {
    if (!api) return null;
    return computeVocabProgress(api.progress, contentFor('en').vocabulary);
  }, [api, skills.readingVocab]);

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'weekly' })}>← Haftalık Plan</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Okuma · Hafta 1</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Kelime Çıkarma</h1>
        <p className="mt-2 text-ink-soft">
          Pasajlardan öne çıkan öbekler. Hiçbiri otomatik eklenmez: işine yarayan 5–10 tanesi için
          <strong> Öğrenilecek Kelimelere Ekle</strong>’ye bas. Eklenenler Kelime çalışmasında sorulur.
        </p>
      </header>

      {sources.map((p) => (
        <section key={p.id} className="mt-6">
          <h2 className="eyebrow mb-2">{p.title}</h2>
          <ul className="grid gap-2">
            {p.vocab.map((w) => {
              const id = userVocabId(w.en);
              const isSaved = savedIds.has(id);
              return (
                <li key={`${p.id}::${w.en}`} className="card flex items-center justify-between gap-3 px-4 py-2">
                  <span><strong>{w.en}</strong> — {w.tr}</span>
                  {isSaved ? (
                    <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>✓ Eklendi</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-quiet"
                      aria-label={`${w.en}: Öğrenilecek Kelimelere Ekle`}
                      onClick={() => onRecord((s) => addReadingVocab(s, w, p.id))}
                    >
                      Öğrenilecek Kelimelere Ekle
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {skills.readingVocab.length > 0 && (
        <section className="mt-8" aria-label="Eklediklerim">
          <h2 className="eyebrow mb-2">Eklediklerim ({skills.readingVocab.length})</h2>
          {skills.readingVocab.length > 10 && (
            <p className="mb-2 text-sm text-ink-soft">10’dan fazla ekledin — en işe yarayanlara odaklanmak daha etkili.</p>
          )}
          <ul className="grid gap-2">
            {skills.readingVocab.map((v) => {
              const state = mastery?.get(v.linkedId ?? v.id)?.state;
              return (
                <li key={v.id} className="card flex items-center justify-between gap-3 px-4 py-2">
                  <span>
                    <strong>{v.en}</strong> — {v.tr}
                    {v.chunk && <span className="badge ml-2">öbek</span>}
                    {v.linkedId && <span className="badge ml-2">kelime listesinde zaten vardı</span>}
                    {state && <span className="badge ml-2" data-state={state}>{STATE_LABEL[state]}</span>}
                  </span>
                  <button type="button" className="btn btn-quiet" aria-label={`${v.en} kaydını kaldır`} onClick={() => onRecord((s) => removeReadingVocab(s, v.id))}>Kaldır</button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'vocab' })}>Kelime Çalışmasını Aç →</button>
            <button type="button" className="btn" onClick={() => navigate({ name: 'vocab-list' })}>Kelime Listesi →</button>
          </div>
        </section>
      )}
    </main>
  );
}
