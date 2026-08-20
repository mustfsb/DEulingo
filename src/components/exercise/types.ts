import type { Exercise } from '../../content/types';
import type { ExerciseInput, ValidationResult } from '../../lib/validation';
import type { GermanVoiceId, SpeechSpeed } from '../../lib/audio/tts';

export interface ExerciseViewProps {
  exercise: Exercise;
  value: ExerciseInput;
  onChange: (value: ExerciseInput) => void;
  /** Enter ile gonderim. */
  onSubmit: () => void;
  /** Geri bildirim gosteriliyorsa girdi kilitlenir. */
  locked: boolean;
  result: ValidationResult | null;
  /** Tek AudioController bağlamı; yanlış ekrana ses sızmaz. */
  audioContextId?: string;
  speechSpeed?: SpeechSpeed;
  speechVoice?: GermanVoiceId;
}

/** Bir alistirmanin cevaplanmis sayilmasi icin gereken en az girdi. */
export function hasInput(exercise: Exercise, value: ExerciseInput): boolean {
  if (exercise.type === 'spoken') return true;
  if (exercise.type === 'matching') {
    const answers = (value ?? {}) as Record<string, string>;
    return (exercise.pairs ?? []).every((pair) => Boolean(answers[pair.left]));
  }
  if (exercise.type === 'sentence-builder' || exercise.type === 'ordering' || exercise.type === 'word-bank-translation') {
    return Array.isArray(value) && value.length > 0;
  }
  return typeof value === 'string' && value.trim().length > 0;
}

export function emptyInput(exercise: Exercise): ExerciseInput {
  if (exercise.type === 'matching') return {};
  if (exercise.type === 'sentence-builder' || exercise.type === 'ordering' || exercise.type === 'word-bank-translation') return [];
  return '';
}
