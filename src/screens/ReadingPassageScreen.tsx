/**
 * Reading pasaj ekranı: oku → cevapla → skor → kanıtlı inceleme → kelime çıkarma.
 * Kısa cevaplar: önce yerel normalizasyon, sonra Jev (validateAnswer) — gramer korumalı.
 */

import { useMemo, useState } from 'react';
import { EN_READING_BY_ID } from '../content/en/skills-reading';
import { PassageText } from '../components/PassageText';
import { userVocabId } from '../content/en/user-vocab';
import { addReadingVocab } from '../lib/skills-storage';
import { shuffledOptions } from '../lib/presentation';
import { deterministicValidate } from '../lib/semantic/validate-answer';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

function norm(s: string): string {
  return s.toLowerCase().replace(/[.!?,;:'"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function ReadingPassageScreen({
  passageId,
  skills,
  onRecord,
  navigate,
}: {
  passageId: string;
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
}) {
  const passage = EN_READING_BY_ID.get(passageId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  // Ziyaret ici kararli, ziyaretler arasi cesitli secenek sirasi.
  // True/False/Not Given gibi sirali olcekler korunur.
  const [mountNonce] = useState(() => Math.floor(Math.random() * 1e9));
  const optionOrder = useMemo(() => {
    const map = new Map<string, string[] | undefined>();
    if (!passage) return map;
    for (const q of passage.questions) {
      map.set(q.id, q.options ? shuffledOptions(q.options, `${mountNonce}:${passage.id}:${q.id}`) : undefined);
    }
    return map;
  }, [passage, mountNonce]);

  const results = useMemo(() => {
    if (!passage) return [];
    return passage.questions.map((q) => {
      const input = (answers[q.id] ?? '').trim();
      if (!input) return { q, correct: false, empty: true };
      if (q.type === 'short-answer' || q.type === 'sentence-completion') {
        const cands = [q.answer, ...(q.acceptedAnswers ?? [])];
        if (cands.some((c) => norm(c) === norm(input))) return { q, correct: true, empty: false };
        // yerel deterministik (İngilizce kısaltma toleranslı mini egzersiz)
        const fake = { id: `reading-${q.id}`, topicId: 'en.present-perfect', type: 'free-text', instruction: q.prompt, answer: q.answer, acceptedAnswers: q.acceptedAnswers, conceptIds: ['pp.formula.core'], origin: 'authored', source: { file: 'reading', naturalKey: q.id }, difficulty: 'medium', skill: 'recall', validation: { englishContractions: true } } as Parameters<typeof deterministicValidate>[0];
        const r = deterministicValidate(fake, input);
        if (r.status === 'correct' || r.status === 'minor-typo') return { q, correct: true, empty: false };
        // kapsayıcı eşleşme (küçük yazım farkları için)
        const hit = cands.some((c) => norm(input).includes(norm(c)) || norm(c).includes(norm(input)));
        return { q, correct: hit, empty: false };
      }
      return { q, correct: norm(input) === norm(q.answer), empty: false };
    });
  }, [answers, passage]);

  if (!passage) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Pasaj bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'reading' })}>Reading’e Dön</button>
      </main>
    );
  }

  const correct = results.filter((r) => r.correct).length;
  const total = passage.questions.length;

  const submit = () => {
    setSubmitted(true);
    onRecord((s) => ({
      ...s,
      reading: [...s.reading, {
        passageId: passage.id,
        correct,
        total,
        at: new Date().toISOString(),
        mistakeQuestionIds: results.filter((r) => !r.correct).map((r) => r.q.id),
        addedVocab: added,
        answers,
      }],
    }));
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'reading' })}>← Reading</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">{passage.ieltsStyle ? 'IELTS tarzı pratik (özgün)' : 'Okuma'} · {passage.level} · ~{passage.wordCount} kelime</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{passage.title}</h1>
      </header>

      <article className="card mt-5 p-5 text-[1.02rem] leading-relaxed">
        <PassageText text={passage.text} />
      </article>

      <section className="mt-8">
        <h2 className="eyebrow mb-4">Sorular ({total})</h2>
        <ol className="flex flex-col gap-4">
          {passage.questions.map((q, qi) => {
            const res = results.find((r) => r.q.id === q.id);
            return (
              <li key={q.id} className="card p-4">
                <p className="font-bold">{qi + 1}. {q.prompt}</p>
                {q.options ? (
                  <div className="mt-2 flex flex-col gap-2">
                    {(optionOrder.get(q.id) ?? q.options).map((opt, oi) => (
                      <label key={`${opt}::${oi}`} className="flex items-center gap-2 text-[0.98rem]">
                        <input
                          type="radio"
                          name={q.id}
                          checked={(answers[q.id] ?? '') === opt}
                          disabled={submitted}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2"
                    placeholder="Cevabını yaz…"
                    value={answers[q.id] ?? ''}
                    disabled={submitted}
                    aria-label={q.prompt}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                )}
                {submitted && res && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: res.correct ? 'var(--color-good-soft)' : 'var(--color-bad-soft)' }}>
                    <p className="font-bold">{res.correct ? '✓ Doğru' : '✗ Yanlış'} — Doğru: {q.answer}</p>
                    <p className="mt-1 text-[0.92rem]"><strong>Kanıt:</strong> “{q.evidence}”</p>
                    <p className="text-[0.92rem]">{q.explanation}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {!submitted ? (
          <button type="button" className="btn btn-primary mt-5 w-full" onClick={submit}>
            Gönder ve Skoru Gör ({correct}/{total} şimdilik)
          </button>
        ) : (
          <div className="card mt-5 p-4" style={{ borderColor: 'var(--color-brand)' }}>
            <p className="text-xl font-bold">Skor: {correct} / {total} (%{Math.round((correct / Math.max(1, total)) * 100)})</p>
            <p className="text-[0.95rem] text-ink-soft">Yanlışlarını kanıt cümlesiyle karşılaştır, sonra kelime çıkar.</p>
            <button type="button" className="btn mt-3" onClick={() => navigate({ name: 'reading-passage', passageId: passage.id, view: 'review' })}>
              Kanıt İncelemesine Geç →
            </button>
          </div>
        )}
      </section>

      {submitted && (
        <section className="mt-8">
          <h2 className="eyebrow mb-3">Yararlı kelime/öbekler ({passage.vocab.length})</h2>
          <p className="text-sm text-ink-soft">Otomatik eklenmez — seçtiğin öbek “Öğrenilecek Kelimelere Ekle” ile Kelime çalışmasına girer.</p>
          <ul className="mt-2 grid gap-2">
            {passage.vocab.map((w) => {
              const isSaved = skills.readingVocab.some((v) => v.id === userVocabId(w.en));
              return (
              <li key={w.en} className="card flex items-center justify-between gap-3 px-4 py-2">
                <span><strong>{w.en}</strong> — {w.tr}</span>
                {isSaved ? (
                  <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>✓ Eklendi</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-quiet"
                    aria-label={`${w.en}: Öğrenilecek Kelimelere Ekle`}
                    onClick={() => {
                      setAdded((a) => (a.includes(w.en) ? a : [...a, w.en]));
                      onRecord((s) => addReadingVocab(s, w, passage.id));
                    }}
                  >
                    Öğrenilecek Kelimelere Ekle
                  </button>
                )}
              </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
