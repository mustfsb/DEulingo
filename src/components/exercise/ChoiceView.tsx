import { useEffect } from 'react';
import { Markup } from '../Markup';
import type { ExerciseViewProps } from './types';

/** Coktan secmeli — 1/2/3/4 tuslariyla da secilebilir. */
export function ChoiceView({ exercise, value, onChange, locked, result }: ExerciseViewProps) {
  const options = exercise.options ?? [];
  const selected = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (locked) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < options.length) {
        event.preventDefault();
        onChange(options[index]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, options, onChange]);

  const stateOf = (option: string): string | undefined => {
    if (!locked) return option === selected ? 'selected' : undefined;
    if (option === exercise.answer) return 'correct';
    if (option === selected && result?.status !== 'correct') return 'wrong';
    return undefined;
  };

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Cevap seçenekleri">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === selected}
          disabled={locked}
          data-state={stateOf(option)}
          className="choice"
          onClick={() => onChange(option)}
        >
          <span className="choice-key" aria-hidden="true">
            {index + 1}
          </span>
          <span className="text-lg leading-snug">
            <Markup text={option} />
          </span>
        </button>
      ))}
    </div>
  );
}
