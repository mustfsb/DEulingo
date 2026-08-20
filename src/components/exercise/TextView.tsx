import { useEffect, useRef } from 'react';
import { Markup } from '../Markup';
import type { ExerciseViewProps } from './types';

/** Bosluk doldurma, serbest yazma ve hata duzeltme icin yazi girisi. */
export function TextView({ exercise, value, onChange, onSubmit, locked, result }: ExerciseViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const text = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (!locked) inputRef.current?.focus();
  }, [locked, exercise.id]);

  const state = locked ? (result?.status === 'incorrect' ? 'wrong' : 'correct') : undefined;
  const isBlank = exercise.type === 'fill-blank' && exercise.prompt?.includes('___');

  return (
    <div className="flex flex-col gap-4">
      {exercise.prompt && (
        <div className="flex items-start gap-2">
          <p
            className="font-display text-2xl leading-snug sm:text-[1.75rem]"
            style={{ fontVariationSettings: "'wdth' 108", fontWeight: 700 }}
            lang={exercise.type === 'error-correction' ? 'de' : undefined}
          >
            {isBlank ? (
              <BlankPrompt prompt={exercise.prompt!} filled={text} />
            ) : (
              <Markup text={exercise.prompt} />
            )}
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        className="field"
        data-state={state}
        type="text"
        lang="de"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={locked}
        value={text}
        placeholder={exercise.type === 'error-correction' ? 'Doğru hâlini yaz…' : 'Cevabını yaz…'}
        aria-label={exercise.instruction}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
    </div>
  );
}

/** Bosluk, yazildikca doldugu gorunen bir cizgi olarak gosterilir. */
function BlankPrompt({ prompt, filled }: { prompt: string; filled: string }) {
  const [before, after] = prompt.split('___');
  return (
    <span lang="de">
      {before}
      <span
        className="mx-1 inline-block min-w-[4.5ch] border-b-4 text-center align-baseline"
        style={{ borderColor: filled ? 'var(--color-brand)' : 'var(--color-line)' }}
      >
        {filled || ' '}
      </span>
      {after}
    </span>
  );
}
