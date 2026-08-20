import { useMemo, useState } from 'react';
import { seededShuffle } from '../../content/parser/text';
import { AudioButton } from '../AudioButton';
import { findGermanAudioTarget } from '../../lib/audio/targets';
import type { ExerciseViewProps } from './types';

/** Eslestirme: once soldan, sonra sagdan sec. Tamamlanan cift isaretlenir. */
export function MatchingView({ exercise, value, onChange, locked, audioContextId, speechSpeed = 'normal', speechVoice }: ExerciseViewProps) {
  const pairs = useMemo(() => exercise.pairs ?? [], [exercise.pairs]);
  const answers = (value ?? {}) as Record<string, string>;
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const rights = useMemo(
    () => seededShuffle(pairs.map((pair) => pair.right), exercise.id),
    [pairs, exercise.id],
  );

  const takenRights = new Set(Object.values(answers));

  const isPairCorrect = (left: string) =>
    pairs.find((pair) => pair.left === left)?.right === answers[left];

  const chooseLeft = (left: string) => {
    if (locked) return;
    if (answers[left]) {
      const next = { ...answers };
      delete next[left];
      onChange(next);
      setActiveLeft(left);
      return;
    }
    setActiveLeft(activeLeft === left ? null : left);
  };

  const chooseRight = (right: string) => {
    if (locked || !activeLeft) return;
    if (takenRights.has(right)) return;
    onChange({ ...answers, [activeLeft]: right });
    setActiveLeft(null);
  };

  const stateFor = (left: string) => {
    if (locked && answers[left]) return isPairCorrect(left) ? 'correct' : 'wrong';
    if (answers[left]) return 'selected';
    if (activeLeft === left) return 'selected';
    return undefined;
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <div className="flex flex-col gap-3">
        {pairs.map((pair, index) => {
          const audioTarget = findGermanAudioTarget(exercise, pair.left);
          return (
          <div key={pair.left} className="choice-option" data-audio-reveal={audioTarget ? 'hover' : undefined}>
            <button
              type="button"
              className="choice flex-1"
              data-state={stateFor(pair.left)}
              disabled={locked}
              onClick={() => chooseLeft(pair.left)}
            >
              <span className="choice-key" aria-hidden="true">
                {index + 1}
              </span>
              <span className="flex-1">
                <span className="block font-mono font-bold" lang="de">
                  {pair.left}
                </span>
                {answers[pair.left] && (
                  <span className="mt-1 block text-sm text-ink-soft" lang="de">
                    ↳ {answers[pair.left]}
                  </span>
                )}
              </span>
            </button>
            {audioTarget && (
              <AudioButton target={audioTarget} contextId={audioContextId ?? `matching:${exercise.id}`} speed={speechSpeed} voice={speechVoice} compact revealOnHover />
            )}
          </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {rights.map((right) => {
          const audioTarget = findGermanAudioTarget(exercise, right);
          return (
            <div key={right} className="choice-option" data-audio-reveal={audioTarget ? 'hover' : undefined} style={{ opacity: takenRights.has(right) ? 0.4 : 1 }}>
              <button
                type="button"
                className="choice"
                data-state={takenRights.has(right) ? 'selected' : undefined}
                disabled={locked || takenRights.has(right) || !activeLeft}
                onClick={() => chooseRight(right)}
              >
                <span className="font-mono font-bold" lang="de">
                  {right}
                </span>
              </button>
              {audioTarget && <AudioButton target={audioTarget} contextId={audioContextId ?? `matching:${exercise.id}`} speed={speechSpeed} voice={speechVoice} compact revealOnHover />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
