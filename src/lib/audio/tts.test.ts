import { describe, expect, it } from 'vitest';
import {
  canonicalGermanAnswer,
  createSpeechCacheKey,
  GERMAN_VOICE_PROFILES,
  piperLengthScaleFor,
  speechCacheMaterial,
  shouldAutoplayPrompt,
  validateSpeechRequest,
} from './tts';

describe('local TTS contract', () => {
  it('creates a deterministic cache key from locale, voice profile, speed and text', async () => {
    const normal = await createSpeechCacheKey({ text: 'Wie heißt du?', language: 'de-DE', speed: 'normal' });
    expect(normal).toBe(await createSpeechCacheKey({ text: 'Wie heißt du?', language: 'de-DE', speed: 'normal' }));
    expect(normal).not.toBe(await createSpeechCacheKey({ text: 'Wie heißt du?', language: 'de-DE', speed: 'slow' }));
    expect(normal).not.toBe(await createSpeechCacheKey({ text: 'Wie heißt du?', language: 'de-DE', speed: 'fast' }));
    expect(normal).not.toBe(await createSpeechCacheKey({ text: 'Guten Morgen.', language: 'de-DE', speed: 'normal' }));
    const request = { text: 'Wie heißt du?', language: 'de-DE' as const, speed: 'normal' as const };
    expect(speechCacheMaterial(request, 'other-voice')).not.toBe(speechCacheMaterial(request));
    expect(speechCacheMaterial(request, 'de_DE-thorsten-high', 'new-model')).not.toBe(speechCacheMaterial(request));
    const softVoice = await createSpeechCacheKey({
      text: 'Wie heißt du?',
      language: 'de-DE',
      speed: 'normal',
      voice: 'thorsten-soft',
    });
    expect(softVoice).not.toBe(normal);
  });

  it('rejects empty, oversized and non-German speech requests', () => {
    expect(validateSpeechRequest({ text: 'Guten Morgen', language: 'de-DE', speed: 'normal' })).toEqual({
      ok: true,
      value: { text: 'Guten Morgen', language: 'de-DE', speed: 'normal', voice: 'kerstin' },
    });
    expect(validateSpeechRequest({ text: '   ', language: 'de-DE', speed: 'normal' }).ok).toBe(false);
    expect(validateSpeechRequest({ text: 'a'.repeat(501), language: 'de-DE', speed: 'normal' }).ok).toBe(false);
    expect(validateSpeechRequest({ text: 'Merhaba', language: 'tr-TR', speed: 'normal' }).ok).toBe(false);
  });

  it('only accepts a known selected German voice profile', () => {
    expect(validateSpeechRequest({
      text: 'Guten Morgen',
      language: 'de-DE',
      speed: 'normal',
      voice: 'thorsten-soft',
    })).toEqual({
      ok: true,
      value: { text: 'Guten Morgen', language: 'de-DE', speed: 'normal', voice: 'thorsten-soft' },
    });
    expect(validateSpeechRequest({
      text: 'Guten Morgen',
      language: 'de-DE',
      speed: 'normal',
      voice: 'arbitrary-voice',
    }).ok).toBe(false);
  });

  it('offers fast, normal and slow speeds with a per-voice normal-speed calibration', () => {
    expect(validateSpeechRequest({ text: 'Guten Morgen', language: 'de-DE', speed: 'fast' })).toEqual({
      ok: true,
      value: { text: 'Guten Morgen', language: 'de-DE', speed: 'fast', voice: 'kerstin' },
    });

    for (const profile of GERMAN_VOICE_PROFILES) {
      const fast = Number(piperLengthScaleFor(profile.id, 'fast'));
      const normal = Number(piperLengthScaleFor(profile.id, 'normal'));
      const slow = Number(piperLengthScaleFor(profile.id, 'slow'));
      expect(fast).toBeLessThan(normal);
      expect(normal).toBeLessThan(slow);
    }

    // Aynı "normal" temposu için her model ayrı ölçeklenir; tek 1.00 değeri
    // çok konuşmacılı kadın modelini gereksiz yavaş bırakır.
    expect(piperLengthScaleFor('thorsten', 'normal')).toBe('1');
    expect(piperLengthScaleFor('thorsten-soft', 'normal')).not.toBe('1');
    expect(piperLengthScaleFor('kerstin', 'normal')).not.toBe('1');
    expect(piperLengthScaleFor('eva', 'normal')).not.toBe('1');
  });

  it('uses explicit German metadata for autoplay and never string heuristics', () => {
    const target = { text: 'Wie heißt du?', language: 'de-DE' as const, role: 'prompt' as const };
    expect(shouldAutoplayPrompt({ type: 'multiple-choice', audio: { prompt: target } } as never)).toBe(true);
    expect(shouldAutoplayPrompt({ type: 'word-bank-translation', wordBank: { direction: 'de-to-tr' }, audio: { prompt: target } } as never)).toBe(true);
    expect(shouldAutoplayPrompt({ type: 'word-bank-translation', wordBank: { direction: 'tr-to-de' }, audio: { prompt: target } } as never)).toBe(false);
    expect(shouldAutoplayPrompt({ type: 'multiple-choice', audio: undefined } as never)).toBe(false);
  });

  it('only returns an explicitly marked canonical German feedback target', () => {
    const target = { text: 'Du kommst aus Deutschland.', language: 'de-DE' as const, role: 'canonical-answer' as const };
    expect(canonicalGermanAnswer({ audio: { canonicalAnswer: target } } as never, { status: 'incorrect' })).toEqual(target);
    expect(canonicalGermanAnswer({ audio: undefined } as never, { status: 'minor-typo' })).toBeUndefined();
  });
});
