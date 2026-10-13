/**
 * Kanıt incelemesi (Session E3): yanlış cevaplanan sorular için destekleyen
 * cümle pasajda vurgulanır; öğrenci her kanıtı kendisi açar ve "gördüm"
 * olarak işaretler. Son denemeyi esas alır; deneme yoksa önce çözmeye yönlendirir.
 */

import { useMemo, useState } from 'react';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { PassageText } from '../components/PassageText';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

export function ReadingReviewScreen({
  passageId,
  skills,
  navigate,
}: {
  passageId: string;
  skills: EnSkillsState;
  navigate: (route: Route) => void;
}) {
  const passage = EN_READING_BY_ID.get(passageId);
  const attempt = useMemo(
    () => [...skills.reading].reverse().find((r) => r.passageId === passageId),
    [skills.reading, passageId],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  if (!passage) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Pasaj bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'reading' })}>Reading’e Dön</button>
      </main>
    );
  }

  const wrongIds = new Set(attempt?.mistakeQuestionIds ?? []);
  const wrong = passage.questions.filter((q) => wrongIds.has(q.id));
  const active = passage.questions.find((q) => q.id === selected) ?? null;

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'weekly' })}>← Haftalık Plan</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Okuma · Kanıt İncelemesi</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{passage.title}</h1>
      </header>

      {!attempt ? (
        <section className="card mt-5 p-5" role="status">
          <p className="font-bold">Bu pasaj için henüz deneme yok.</p>
          <p className="text-ink-soft">Önce soruları cevapla; yanlışların burada kanıtlarıyla incelenir.</p>
          <button type="button" className="btn btn-primary mt-3" onClick={() => navigate({ name: 'reading-passage', passageId })}>
            Pasajı Çöz →
          </button>
        </section>
      ) : (
        <>
          <p className="mt-3 text-lg text-ink-soft">
            Son deneme: {attempt.correct}/{attempt.total} · {wrong.length === 0 ? 'yanlış yok' : `${wrong.length} yanlış`} · incelenen {seen.filter((id) => wrongIds.has(id)).length}/{wrong.length}
          </p>
          {wrong.length === 0 && (
            <p className="card mt-3 p-4" role="status">
              Hepsi doğru. Yine de bir soru seç ve kanıt cümlesini pasajda bul — doğru cevabı nedenini bilerek vermek hedeftir.
            </p>
          )}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
            <article className="card p-5 text-[1.02rem] leading-relaxed" aria-label="Pasaj">
              <PassageText text={passage.text} evidence={active?.evidence} />
            </article>
            <aside className="flex flex-col gap-2" aria-label="İncelenecek sorular">
              {(wrong.length ? wrong : passage.questions).map((q) => {
                const given = attempt.answers?.[q.id];
                const isActive = selected === q.id;
                return (
                  <div key={q.id} className="card p-3" style={isActive ? { borderColor: 'var(--color-brand)' } : undefined}>
                    <button
                      type="button"
                      className="w-full text-left font-bold"
                      aria-expanded={isActive}
                      onClick={() => {
                        setSelected(isActive ? null : q.id);
                        if (!isActive) setSeen((s) => (s.includes(q.id) ? s : [...s, q.id]));
                      }}
                    >
                      {passage.questions.indexOf(q) + 1}. {q.prompt}
                    </button>
                    {isActive && (
                      <div className="mt-2 text-[0.93rem]">
                        {given !== undefined && <p>Senin cevabın: <strong>{given || '—'}</strong></p>}
                        <p>Doğru cevap: <strong>{q.answer}</strong></p>
                        <p className="mt-1"><strong>Kanıt:</strong> “{q.evidence}”</p>
                        <p className="mt-1 text-ink-soft">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
