import type { GermanAudioTarget, SpeechSpeed } from './tts';

const RATE_BY_SPEED: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1,
  fast: 1.35,
};

function pickGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  // Önce de-DE, sonra de-* tercih et
  return (
    voices.find((v) => v.lang.toLowerCase() === 'de-de') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('de')) ??
    null
  );
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speakWithWebSpeech(
  target: GermanAudioTarget,
  speed: SpeechSpeed,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isWebSpeechAvailable()) {
      reject(new Error('Tarayıcı telaffuzu desteklenmiyor.'));
      return;
    }
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(target.text);
    utterance.lang = 'de-DE';
    utterance.rate = RATE_BY_SPEED[speed] ?? 1;

    const voice = pickGermanVoice();
    if (voice) utterance.voice = voice;

    let settled = false;
    const cleanup = () => {
      utterance.onend = null;
      utterance.onerror = null;
      signal?.removeEventListener('abort', onAbort);
    };
    const done = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    const onAbort = () => {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      fail(new DOMException('Aborted', 'AbortError'));
    };

    utterance.onend = done;
    utterance.onerror = () => fail(new Error('Tarayıcı telaffuzu başarısız.'));
    signal?.addEventListener('abort', onAbort, { once: true });

    // Bazı tarayıcılarda getVoices() async dolar; ses yoksa da konuşur
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      fail(e instanceof Error ? e : new Error(String(e)));
    }

    // Abort zaten geldiyse hemen iptal et
    if (signal?.aborted) onAbort();
  });
}
