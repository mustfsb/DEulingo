import { useState } from 'react';
import { Markup } from '../Markup';
import { AudioButton } from '../AudioButton';
import { findGermanAudioTarget } from '../../lib/audio/targets';
import { languageOfExerciseId } from '../../lib/language';
import type { ExerciseViewProps } from './types';

/**
 * Cumle kurma / siralama.
 * Tiklamak cipi cevaba tasir, tekrar tiklamak geri alir; klavyeyle de calisir.
 *
 * Secim metne degil, havuzdaki ORNEK KIMLIGINE (konum) baglidir: ayni
 * kelime birden fazla kez gecse bile her cip bagimsiz tasinir. Ust
 * katmana kanonik metinler iletilir; dogrulama degismez.
 */
export function ChipsView({ exercise, value, onChange, locked, result, audioContextId, speechSpeed = 'normal', speechVoice }: ExerciseViewProps) {
  const words = exercise.words ?? [];
  const [pickedInstances, setPickedInstances] = useState<number[]>(() =>
    initialInstances(words, Array.isArray(value) ? value : []),
  );
  const targetLang = languageOfExerciseId(exercise.id) === 'en' ? 'en' : 'de';

  const add = (index: number) => {
    if (locked || pickedInstances.includes(index)) return;
    const next = [...pickedInstances, index];
    setPickedInstances(next);
    onChange(next.map((instance) => words[instance]));
  };
  const removeAt = (position: number) => {
    if (locked) return;
    const next = pickedInstances.filter((_, index) => index !== position);
    setPickedInstances(next);
    onChange(next.map((instance) => words[instance]));
  };

  const answerState = locked ? (result?.status === 'correct' ? 'correct' : 'wrong') : undefined;
  const picked = pickedInstances.map((instance) => words[instance]);

  return (
    <div className="flex flex-col gap-6">
      {exercise.prompt && (
        <p className="text-lg text-ink-soft" lang={targetLang}>
          <Markup text={exercise.prompt} lang={targetLang} />
        </p>
      )}

      <div
        className="flex min-h-[5.5rem] flex-wrap content-start items-start gap-2 rounded-2xl border-2 border-dashed p-3"
        style={{
          borderColor:
            answerState === 'wrong'
              ? 'var(--color-bad)'
              : answerState === 'correct'
                ? 'var(--color-good)'
                : 'var(--color-line)',
        }}
        aria-label="Cevap alanı"
      >
        {picked.length === 0 && (
          <span className="px-1 py-2 text-ink-faint">Kelimelere tıklayarak cümleyi kur</span>
        )}
        {picked.map((word, position) => (
          <button
            key={`answer-${word}-${position}`}
            type="button"
            className="chip chip-slot"
            disabled={locked}
            onClick={() => removeAt(position)}
            aria-label={`${word} kelimesini geri al`}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Kelime havuzu">
        {words.map((word, index) => {
          const audioTarget = findGermanAudioTarget(exercise, word);
          return (
            <span key={`pool-${index}`} className="chip-wrap" data-audio-reveal={audioTarget ? 'hover' : undefined}>
              <button
                type="button"
                className="chip"
                data-used={pickedInstances.includes(index)}
                disabled={locked || pickedInstances.includes(index)}
                onClick={() => add(index)}
              >
                {word}
              </button>
              {audioTarget && <AudioButton target={audioTarget} contextId={audioContextId ?? `chips:${exercise.id}`} speed={speechSpeed} voice={speechVoice} compact revealOnHover />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Disaridan gelen metin cevabini ilk bos orneklere esler (yalnizca ilk kurulum). */
function initialInstances(words: string[], texts: string[]): number[] {
  const used = new Set<number>();
  const instances: number[] = [];
  for (const text of texts) {
    const index = words.findIndex((candidate, i) => candidate === text && !used.has(i));
    if (index === -1) continue;
    used.add(index);
    instances.push(index);
  }
  return instances;
}
