import { describe, expect, it, vi } from 'vitest';
import { AudioController, browserTimer, type AudioHandle, type TimerDriver } from './playback';
import type { GermanAudioTarget, GermanVoiceId } from './tts';

const german = (text: string): GermanAudioTarget => ({ text, language: 'de-DE', role: 'prompt' });

class FakeAudio implements AudioHandle {
  currentTime = 0;
  volume = 1;
  onended: ((event: Event) => unknown) | null = null;
  onerror: ((event: Event) => unknown) | null = null;
  paused = false;
  constructor(readonly src: string, private readonly played: string[]) {}
  async play() { this.played.push(this.src); }
  pause() { this.paused = true; }
  end() { this.onended?.(new Event('ended')); }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function clock(): TimerDriver & { run: () => void } {
  let task: (() => void) | undefined;
  return {
    set: (callback, _delayMs) => { task = callback; return 1 as unknown as ReturnType<typeof setTimeout>; },
    clear: () => { task = undefined; },
    run: () => task?.(),
  };
}

describe('browser timer driver', () => {
  it('clears a pending delay when called as a method (no Illegal invocation)', () => {
    const original = globalThis.clearTimeout;
    const cleared: unknown[] = [];
    // Tarayici davranisi: native `clearTimeout` yanlis `this` ile cagrilirsa patlar.
    globalThis.clearTimeout = function (this: unknown, id: unknown) {
      if (this !== globalThis && this !== undefined) throw new TypeError('Illegal invocation');
      cleared.push(id);
    } as unknown as typeof clearTimeout;

    try {
      const owner = { timer: browserTimer };
      expect(() => owner.timer.clear(7 as unknown as ReturnType<typeof setTimeout>)).not.toThrow();
      expect(cleared).toEqual([7]);
    } finally {
      globalThis.clearTimeout = original;
    }
  });
});

describe('AudioController exercise lifecycle', () => {
  it('discards Exercise A TTS when it resolves after Exercise B becomes active', async () => {
    const request = deferred<{ url: string; cached: boolean }>();
    const played: string[] = [];
    const controller = new AudioController({ createAudio: (url) => new FakeAudio(url, played), requestSpeech: vi.fn(() => request.promise) });
    controller.activate('A');
    const pending = controller.speakGerman('A', german('Wie heißt du?'), 'normal');
    controller.activate('B');
    request.resolve({ url: '/a.wav', cached: false });
    await pending;
    expect(played).toEqual([]);
  });

  it('cancels scheduled feedback pronunciation when the exercise changes', async () => {
    const timer = clock();
    const played: string[] = [];
    const sounds: FakeAudio[] = [];
    const requestSpeech = vi.fn(async () => ({ url: '/speech.wav', cached: true }));
    const controller = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech,
      timer,
    });
    controller.activate('A');
    const pending = controller.playFeedback('A', 'correct', german('Ich bin Mustafa.'), true, 'normal');
    sounds[0].end();
    await Promise.resolve();
    controller.activate('B');
    timer.run();
    await pending;
    expect(requestSpeech).not.toHaveBeenCalled();
    expect(played).toEqual(['/audio/correct.wav']);
  });

  it('stops currently playing audio immediately on transition', async () => {
    const played: string[] = [];
    const sounds: FakeAudio[] = [];
    const controller = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech: async () => ({ url: '/a.wav', cached: true }),
    });
    controller.activate('A');
    void controller.speakGerman('A', german('Guten Morgen.'), 'normal');
    await Promise.resolve();
    controller.activate('B');
    expect(sounds[0].paused).toBe(true);
    expect(controller.state).toBe('idle');
  });

  it('handles an aborted TTS request silently without playback', async () => {
    const played: string[] = [];
    const requestSpeech = vi.fn((_target: GermanAudioTarget, _speed: string, _voice: GermanVoiceId, signal: AbortSignal) =>
      new Promise<{ url: string; cached: boolean }>((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
      ),
    );
    const controller = new AudioController({ createAudio: (url) => new FakeAudio(url, played), requestSpeech });
    controller.activate('A');
    const pending = controller.speakGerman('A', german('Tschüss.'), 'normal');
    controller.activate('B');
    await expect(pending).resolves.toBeUndefined();
    expect(played).toEqual([]);
    expect(controller.state).toBe('idle');
  });

  it('sequences correct SFX → streak milestone SFX → German pronunciation', async () => {
    const timer = clock();
    const played: string[] = [];
    const sounds: FakeAudio[] = [];
    const requestSpeech = vi.fn(async () => ({ url: '/speech.wav', cached: true }));
    const controller = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech,
      timer,
    });
    controller.activate('A');
    const pending = controller.playFeedback('A', 'correct', german('Ich bin Mustafa.'), true, 'normal', 'thorsten', {
      milestone: 'streak-5',
    });

    // Efektler SIRAYLA calar: her biri bitmeden sonraki baslamaz.
    // Test bunu, siradaki ses ancak oncekinin `ended` olayindan sonra
    // olusabildigini gozleyerek dogrular.
    const advanceTo = async (index: number) => {
      for (let attempt = 0; attempt < 20 && sounds.length <= index; attempt += 1) {
        await Promise.resolve();
        timer.run();
      }
      expect(sounds[index], `${index}. ses olusmadi`).toBeDefined();
      sounds[index].end();
    };

    await advanceTo(0);
    expect(sounds).toHaveLength(1);
    await advanceTo(1);
    await advanceTo(2);
    await pending;

    expect(played).toEqual(['/audio/correct.wav', '/audio/streak-5.wav', '/speech.wav']);
  });

  it('respects the sound-effects setting for milestone audio', async () => {
    const played: string[] = [];
    const controller = new AudioController({
      createAudio: (url) => new FakeAudio(url, played),
      requestSpeech: async () => ({ url: '/speech.wav', cached: true }),
    });
    controller.activate('A');
    await controller.playEffect('A', 'streak-5', false);
    expect(played).toEqual([]);

    const sounds: FakeAudio[] = [];
    const withSound = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech: async () => ({ url: '/speech.wav', cached: true }),
    });
    withSound.activate('A');
    const pending = withSound.playEffect('A', 'perfect', true);
    sounds[0].end();
    await pending;
    expect(played).toEqual(['/audio/perfect.wav']);
  });

  it('cancels a queued milestone effect when the session changes', async () => {
    const timer = clock();
    const played: string[] = [];
    const sounds: FakeAudio[] = [];
    const requestSpeech = vi.fn(async () => ({ url: '/speech.wav', cached: true }));
    const controller = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech,
      timer,
    });
    controller.activate('A');
    const pending = controller.playFeedback('A', 'correct', german('Guten Morgen.'), true, 'normal', 'thorsten', {
      milestone: 'streak-10',
    });
    sounds[0].end();
    await Promise.resolve();
    // Ogrenci hemen devam etti: bekleyen kutlama sesi ve telaffuz dusuruldu.
    controller.activate('B');
    timer.run();
    await pending;

    expect(played).toEqual(['/audio/correct.wav']);
    expect(requestSpeech).not.toHaveBeenCalled();
  });

  it('gives rapid manual replay priority to the latest request', async () => {
    const first = deferred<{ url: string; cached: boolean }>();
    const second = deferred<{ url: string; cached: boolean }>();
    const played: string[] = [];
    const sounds: FakeAudio[] = [];
    const requestSpeech = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const controller = new AudioController({
      createAudio: (url) => { const audio = new FakeAudio(url, played); sounds.push(audio); return audio; },
      requestSpeech,
    });
    controller.activate('A');
    const one = controller.speakGerman('A', german('Wie heißt du?'), 'normal');
    const two = controller.speakGerman('A', german('Guten Morgen.'), 'normal');
    first.resolve({ url: '/first.wav', cached: false });
    second.resolve({ url: '/second.wav', cached: false });
    await Promise.resolve();
    sounds[0].end();
    await Promise.all([one, two]);
    expect(played).toEqual(['/second.wav']);
  });
});
