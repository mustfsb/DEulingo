import { Markup } from '../Markup';
import { AudioButton } from '../AudioButton';
import { findGermanAudioTarget } from '../../lib/audio/targets';
import type { ExerciseViewProps } from './types';

/**
 * Cumle kurma / siralama.
 * Tiklamak cipi cevaba tasir, tekrar tiklamak geri alir; klavyeyle de calisir.
 */
export function ChipsView({ exercise, value, onChange, locked, result, audioContextId, speechSpeed = 'normal', speechVoice }: ExerciseViewProps) {
  const words = exercise.words ?? [];
  const picked = Array.isArray(value) ? value : [];

  // Ayni kelime birden fazla kez gecebilir: cipler indeksle takip edilir.
  const usedIndexes = new Set<number>();
  const pickedIndexes = picked.map((word) => {
    const index = words.findIndex((candidate, i) => candidate === word && !usedIndexes.has(i));
    usedIndexes.add(index);
    return index;
  });

  const add = (index: number) => {
    if (locked || pickedIndexes.includes(index)) return;
    onChange([...picked, words[index]]);
  };
  const removeAt = (position: number) => {
    if (locked) return;
    onChange(picked.filter((_, index) => index !== position));
  };

  const answerState = locked ? (result?.status === 'correct' ? 'correct' : 'wrong') : undefined;

  return (
    <div className="flex flex-col gap-6">
      {exercise.prompt && (
        <p className="text-lg text-ink-soft">
          <Markup text={exercise.prompt} />
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
            key={`${word}-${position}`}
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
            <span key={`${word}-${index}`} className="chip-wrap" data-audio-reveal={audioTarget ? 'hover' : undefined}>
              <button
                type="button"
                className="chip"
                data-used={pickedIndexes.includes(index)}
                disabled={locked || pickedIndexes.includes(index)}
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
