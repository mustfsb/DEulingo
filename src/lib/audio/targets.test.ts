import { describe, expect, it } from 'vitest';
import { findGermanAudioTarget } from './targets';

describe('explicit German audio target lookup', () => {
  const prompt = { text: 'Wie heißt du?', language: 'de-DE' as const, role: 'prompt' as const };
  const vocabulary = { text: 'Guten Morgen', language: 'de-DE' as const, role: 'vocabulary' as const };

  it('returns only an exact target that content explicitly marked as German', () => {
    const exercise = { audio: { prompt, targets: [vocabulary] } } as never;
    expect(findGermanAudioTarget(exercise, 'Guten Morgen')).toEqual(vocabulary);
    expect(findGermanAudioTarget(exercise, 'Wie heißt du?')).toEqual(prompt);
    expect(findGermanAudioTarget(exercise, 'Günaydın')).toBeUndefined();
  });

  it('never turns arbitrary learner or Turkish strings into a Piper target', () => {
    const exercise = { audio: { targets: [vocabulary] } } as never;
    expect(findGermanAudioTarget(exercise, 'Merhaba')).toBeUndefined();
    expect(findGermanAudioTarget(exercise, 'Guten Mrogen')).toBeUndefined();
  });
});
