/**
 * Kelime Çalışması ana sayfası.
 *
 * Tüm sayılar GERÇEK veriden: envanter büyüklüğü, ustalık özeti ve konu
 * başına kelime sayıları. Uydurma istatistik YOKTUR.
 */

import { useMemo, useState } from 'react';
import { VOCABULARY } from '../content/vocabulary/inventory';
import { topicsById } from '../lib/content';
import { computeVocabProgress, summarizeVocab } from '../lib/vocab/mastery';
import { vocabPoolForTopic } from '../lib/vocab/questions';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { VocabKind } from '../lib/vocab/questions';

const MODES: Array<{ kind: VocabKind; title: string; description: string; icon: string }> = [
  { kind: 'mixed', title: 'Tüm Kelimeler', description: '244 kelimeden karışık tekrar', icon: '📚' },
  { kind: 'detr', title: 'Almanca → Türkçe', description: 'Tanıma: anlamı bul', icon: '🇩🇪' },
  { kind: 'trde', title: 'Türkçe → Almanca', description: 'Üretim: artikeliyle yaz', icon: '🇹🇷' },
  { kind: 'match', title: 'Eşleştirme', description: '4–8 çift, iki yönlü', icon: '🔗' },
  { kind: 'type', title: 'Yazma', description: 'Türkçeden Almancaya yaz', icon: '⌨️' },
  { kind: 'listen', title: 'Dinleme', description: 'Duy, tanı ve yaz', icon: '🔊' },
  { kind: 'weak', title: 'Zayıf Kelimeler', description: 'Hatalar ve zayıflar önce', icon: '🎯' },
  { kind: 'flash', title: 'Kartlar', description: 'Hatırla, çevir, puanla', icon: '🃏' },
];

type SizeChoice = 'quick' | 'normal' | 'full';

const SIZE_LABEL: Record<SizeChoice, string> = {
  quick: 'Hızlı (~10)',
  normal: 'Normal (~22)',
  full: 'Tam (~50)',
};

export function VocabHomeScreen({
  api,
  navigate,
}: {
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const { progress } = api;
  const [size, setSize] = useState<SizeChoice>('normal');
  const summary = useMemo(() => summarizeVocab(progress), [progress]);
  const byId = useMemo(() => computeVocabProgress(progress), [progress]);

  const start = (kind: VocabKind, topicId?: string, fixedSize?: string) => {
    navigate({ name: 'vocab-study', kind, ...(topicId ? { topicId } : {}), size: fixedSize ?? size });
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'general-review' })}>
        ← Genel Tekrar
      </button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Kapalı havuz · ezber + aktif hatırlama</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Kelime Çalışması</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {summary.mastered} / {summary.total} öğrenildi · {summary.weak} zayıf · {summary.learning} öğreniliyor
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Toplam Kelime" value={`${summary.total}`} />
        <Stat label="Öğrenildi" value={`${summary.mastered}`} />
        <Stat label="Zayıf" value={`${summary.weak}`} />
        <Stat label="Öğreniliyor" value={`${summary.learning + summary.familiar}`} />
      </div>
      <div className="rail mt-4 h-2.5" aria-label={`${summary.mastered} / ${summary.total} öğrenildi`}>
        <div
          className="rail-fill"
          style={{ width: `${Math.max(2, Math.round((summary.mastered / Math.max(1, summary.total)) * 100))}%` }}
        />
      </div>

      <section className="mt-8">
        <h2 className="eyebrow mb-2">Nasıl çalışmak istersin?</h2>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Oturum büyüklüğü">
          {(Object.keys(SIZE_LABEL) as SizeChoice[]).map((choice) => (
            <button
              key={choice}
              type="button"
              className="badge"
              aria-pressed={size === choice}
              style={size === choice ? { background: 'var(--color-brand)', color: 'white' } : undefined}
              onClick={() => setSize(choice)}
            >
              {SIZE_LABEL[choice]}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((mode) => (
            <button
              key={mode.kind}
              type="button"
              className="card mode-card p-4 text-left"
              onClick={() => start(mode.kind)}
            >
              <p className="text-lg font-bold">
                <span aria-hidden="true">{mode.icon} </span>
                {mode.title}
              </p>
              <p className="text-[0.92rem] text-ink-soft">{mode.description}</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="card mt-3 flex w-full items-center justify-between gap-4 p-5 text-left"
          style={{ borderColor: 'var(--color-signal)', boxShadow: '0 5px 0 0 var(--color-signal)' }}
          onClick={() => start('marathon', undefined, 'marathon')}
        >
          <span>
            <span className="eyebrow" style={{ color: 'var(--color-signal)' }}>
              Özel tarama · ara sıra
            </span>
            <span className="mt-1 block text-xl font-bold">244 Kelime Taraması</span>
            <span className="text-[0.95rem] text-ink-soft">Her kelime bir kez, kontrollü tanımayla havuzu denetle.</span>
          </span>
          <span className="numeral text-2xl" aria-hidden="true">→</span>
        </button>
      </section>

      <section className="mt-10" aria-labelledby="vocab-topics">
        <h2 id="vocab-topics" className="eyebrow mb-4">Konulara göre</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VOCAB_TOPICS.map((topicId) => {
            const pool = vocabPoolForTopic(topicId);
            if (!pool.length) return null;
            const mastered = pool.filter((entry) => byId.get(entry.id)?.state === 'mastered').length;
            const title = topicsById.get(topicId)?.title ?? topicId;
            const emoji = topicsById.get(topicId)?.emoji ?? '📖';
            return (
              <li key={topicId} className="card flex flex-col gap-1 p-4">
                <p className="text-lg font-bold">
                  <span aria-hidden="true">{emoji} </span>
                  {title}
                </p>
                <p className="numeral text-sm text-ink-faint">
                  {pool.length} kelime · {mastered} / {pool.length} öğrenildi
                </p>
                <div className="rail mt-2 h-2">
                  <div
                    className="rail-fill"
                    style={{ width: `${Math.max(2, Math.round((mastered / Math.max(1, pool.length)) * 100))}%` }}
                  />
                </div>
                <button
                  type="button"
                  className="btn mt-auto w-full"
                  style={{ marginTop: '0.75rem' }}
                  aria-label={`${title} kelimelerini çalış`}
                  onClick={() => start('topic', topicId)}
                >
                  Çalış
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <button
          type="button"
          className="btn btn-quiet w-full"
          onClick={() => navigate({ name: 'vocab-list' })}
        >
          📖 Tüm 244 kelimeyi listele ve ara →
        </button>
      </section>
    </main>
  );
}

/** Envanterde üyesi olan konular (gerçek veriden, sabit liste değil). */
export const VOCAB_TOPICS: string[] = [...new Set(VOCABULARY.flatMap((entry) => entry.topicIds))].sort(
  (a, b) => vocabPoolForTopic(b).length - vocabPoolForTopic(a).length,
);

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-0.5 text-xl">{value}</p>
    </div>
  );
}
