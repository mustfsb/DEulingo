/**
 * IELTS Reading girişi (10–15 dk): anlamı oku, kanıtı bul, varsayımla cevaplama.
 * Üç cümlelik mini bir pasajla True / False / Not Given ayrımı denenir.
 */

import { useState } from 'react';
import type { Route } from '../lib/router';

const MINI_TEXT = 'Mira has studied Spanish for two years. She practises every morning before work. She has never visited Spain.';

const MINI_QUESTIONS: Array<{ id: string; prompt: string; answer: 'True' | 'False' | 'Not Given'; evidence: string; why: string }> = [
  { id: 'i1', prompt: 'Mira studies Spanish in the morning.', answer: 'True', evidence: 'She practises every morning before work.', why: 'Pasaj sabah çalıştığını açıkça söyler.' },
  { id: 'i2', prompt: 'Mira has been to Spain.', answer: 'False', evidence: 'She has never visited Spain.', why: '“never visited” gittiğini DEĞİL, gitmediğini söyler.' },
  { id: 'i3', prompt: 'Mira wants to live in Spain.', answer: 'Not Given', evidence: '', why: 'Pasajda yaşamak istediğine dair hiçbir bilgi yok. “Muhtemelen ister” bir varsayımdır — cevap Not Given.' },
];

const STEPS = [
  { title: 'Anlamı oku', body: 'Önce pasajı bir bütün olarak anla; her kelimeyi tek tek çevirmeye çalışma. Başlık, paragraf etiketleri ve ilk cümleler yol haritasıdır.' },
  { title: 'Kanıtı bul', body: 'Her cevap pasajda bir cümleye dayanır. Soruyu okuyunca anahtar kelimeleri belirle, pasajda o cümleyi bul ve cevabı o cümleden ver.' },
  { title: 'Varsayımla cevaplama', body: 'Pasajda yazmayan bir şeyi “mantıklı olduğu için” doğru kabul etme. Kanıt yoksa True/False/Not Given sorusunda cevap Not Given’dır.' },
];

export function ReadingIntroScreen({ navigate }: { navigate: (route: Route) => void }) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const answered = Object.keys(picked).length === MINI_QUESTIONS.length;

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'weekly' })}>← Haftalık Plan</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Okuma · Hafta 1 · ~10 dk</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">IELTS Reading’e Giriş</h1>
        <p className="mt-2 text-ink-soft">Üç kural, sonra üç cümlelik bir deneme. Bu hafta yeni pasaj sayısı değil, soru tekniği önemli.</p>
      </header>

      <ol className="mt-5 grid gap-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card p-4">
            <p className="font-bold"><span className="badge numeral mr-2">{i + 1}</span>{step.title}</p>
            <p className="mt-1 text-[0.97rem]">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="card mt-6 p-5" aria-label="Mini deneme">
        <p className="eyebrow">Mini deneme</p>
        <p className="mt-2 text-[1.02rem] leading-relaxed">{MINI_TEXT}</p>
        <ol className="mt-4 grid gap-4">
          {MINI_QUESTIONS.map((q, qi) => {
            const choice = picked[q.id];
            return (
              <li key={q.id}>
                <p className="font-bold">{qi + 1}. {q.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={q.prompt}>
                  {(['True', 'False', 'Not Given'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={choice === opt}
                      className="badge"
                      disabled={!!choice}
                      style={choice === opt ? { background: opt === q.answer ? 'var(--color-good)' : 'var(--color-bad)', color: 'white' } : undefined}
                      onClick={() => setPicked((p) => ({ ...p, [q.id]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {choice && (
                  <div className="mt-2 rounded-lg p-3" style={{ background: choice === q.answer ? 'var(--color-good-soft)' : 'var(--color-bad-soft)' }}>
                    <p className="font-bold">{choice === q.answer ? '✓ Doğru' : `✗ Doğru cevap: ${q.answer}`}</p>
                    {q.evidence && <p className="text-[0.92rem]"><strong>Kanıt:</strong> “{q.evidence}”</p>}
                    <p className="text-[0.92rem]">{q.why}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate({ name: 'reading-passage', passageId: 'en-read-w1-1' })}
        >
          {answered ? 'Passage 1’e Geç →' : 'Direkt Passage 1’e Geç →'}
        </button>
        <button type="button" className="btn" onClick={() => navigate({ name: 'weekly' })}>Haftalık Plana Dön</button>
      </div>
    </main>
  );
}
