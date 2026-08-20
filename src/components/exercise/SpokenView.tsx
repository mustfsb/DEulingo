import { useState } from 'react';
import { Markup } from '../Markup';
import { AudioButton } from '../AudioButton';
import { findGermanAudioTarget } from '../../lib/audio/targets';
import type { ExerciseViewProps } from './types';

/**
 * Sesli / aktif hatirlama karti.
 * Konusma tanima yok — sonuc objektif dogru sayilmaz, "kendim yaptim" olarak kaydedilir.
 */
export function SpokenView({ exercise, locked, audioContextId, speechSpeed = 'normal', speechVoice }: ExerciseViewProps) {
  const [showSample, setShowSample] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'var(--color-brand-soft)' }}
      >
        <span aria-hidden="true" className="text-2xl">
          🎙️
        </span>
        <p className="text-base font-bold">Sesli görev — yüksek sesle yap.</p>
      </div>

      <ul className="flex flex-col gap-2">
        {(exercise.requirements ?? []).map((requirement, index) => (
          <li key={requirement}>
            <button
              type="button"
              className="choice"
              data-state={done.has(index) ? 'correct' : undefined}
              onClick={() => toggle(index)}
              aria-pressed={done.has(index)}
            >
              <span className="choice-key" aria-hidden="true">
                {done.has(index) ? '✓' : index + 1}
              </span>
              <span className="text-left leading-snug">
                <Markup text={requirement} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {exercise.sampleAnswer && (
        <div>
          {showSample ? (
            <div className="card p-4 anim-pop">
              <p className="eyebrow mb-2">Örnek cevap</p>
              <div className="pronunciation-hover-target">
                <span className="pronunciation-hover-text whitespace-pre-line text-ink-soft" lang="de">
                  <Markup text={exercise.sampleAnswer} />
                </span>
                {findGermanAudioTarget(exercise, exercise.sampleAnswer) && (
                  <AudioButton target={findGermanAudioTarget(exercise, exercise.sampleAnswer)!} contextId={audioContextId ?? `spoken:${exercise.id}`} speed={speechSpeed} voice={speechVoice} compact revealOnHover />
                )}
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-quiet px-0" onClick={() => setShowSample(true)}>
              Örnek cevabı göster
            </button>
          )}
        </div>
      )}

      {locked && (
        <p className="text-sm text-ink-faint">
          Sesli görevler doğruluk oranına katılmaz — kendi değerlendirmen olarak kaydedilir.
        </p>
      )}
    </div>
  );
}
