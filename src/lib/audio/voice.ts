/**
 * Ses becerileri soyutlaması: kayıt + konuşma tanıma (STT).
 * Almanca/İngilizce aynı mimariyi kullanır; dil yapılandırması parametredir.
 * Kayıtlar varsayılan olarak geçicidir (blob localStorage'a yazılmaz).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied' | 'unsupported' | 'error';

export interface Recording {
  url: string;
  mimeType: string;
  durationMs: number;
}

function mimeSupported(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    } catch { /* ignore */ }
  }
  return null;
}

export function isRecordingSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export function useRecorder(): {
  state: RecorderState;
  recording: Recording | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
} {
  const [state, setState] = useState<RecorderState>('idle');
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => { try { t.stop(); } catch { /* ignore */ } });
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* ignore */ } }
    urlRef.current = null;
    setRecording(null);
    setError(null);
    setState('idle');
    chunksRef.current = [];
  }, []);

  useEffect(() => () => {
    try { mediaRef.current?.state !== 'inactive' && mediaRef.current?.stop(); } catch { /* ignore */ }
    cleanupStream();
    if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* ignore */ } }
  }, [cleanupStream]);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) { setState('unsupported'); setError('Bu tarayıcı kaydı desteklemiyor.'); return; }
    setState('requesting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = mimeSupported() ?? undefined;
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      startRef.current = Date.now();
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* ignore */ } }
        urlRef.current = url;
        setRecording({ url, mimeType: blob.type, durationMs: Date.now() - startRef.current });
        setState('stopped');
        cleanupStream();
      };
      rec.onerror = () => { setState('error'); setError('Kayıt başarısız.'); cleanupStream(); };
      mediaRef.current = rec;
      rec.start();
      setState('recording');
    } catch (e) {
      const name = (e as DOMException)?.name ?? '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setState('denied');
        setError('Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verip tekrar dene.');
      } else if (name === 'NotFoundError') {
        setState('denied');
        setError('Mikrofon bulunamadı.');
      } else {
        setState('error');
        setError('Mikrofon açılamadı.');
      }
      cleanupStream();
    }
  }, [cleanupStream]);

  const stop = useCallback(() => {
    try {
      if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
      else { setState('idle'); cleanupStream(); }
    } catch {
      setState('error');
    }
  }, [cleanupStream]);

  return { state, recording, error, start, stop, reset };
}

/* ------------------------------------------------------------------ */
/* Konuşma tanıma (STT) — en küçük soyutlama + zarif geri dönüş         */
/* ------------------------------------------------------------------ */

export type SttState = 'idle' | 'listening' | 'unsupported' | 'denied' | 'error';
export type SttLang = 'en-GB' | 'de-DE';

interface SttRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function getSttConstructor(): (new () => SttRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SttRecognition) | undefined;
  return ctor ?? null;
}

export function isSttSupported(): boolean {
  return getSttConstructor() !== null;
}

export function useSpeechRecognition(lang: SttLang = 'en-GB'): {
  supported: boolean;
  state: SttState;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
} {
  const [state, setState] = useState<SttState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SttRecognition | null>(null);
  const supported = isSttSupported();

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setState('idle');
  }, []);

  useEffect(() => () => { try { recRef.current?.abort(); } catch { /* ignore */ } }, []);

  const start = useCallback(() => {
    const Ctor = getSttConstructor();
    if (!Ctor) { setState('unsupported'); setError('Bu tarayıcı konuşma tanımayı desteklemiyor. Kayıt ve tekrar yine çalışır.'); return; }
    try { recRef.current?.abort(); } catch { /* ignore */ }
    setError(null);
    setTranscript('');
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      try {
        const last = e.results[e.results.length - 1];
        const text = last?.[0]?.transcript ?? '';
        if (text) setTranscript(text);
      } catch { /* ignore */ }
    };
    rec.onerror = (e) => {
      const code = e?.error ?? '';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setState('denied');
        setError('Mikrofon izni verilmedi.');
      } else if (code === 'no-speech' || code === 'aborted') {
        setState('idle');
        setError('Ses algılanamadı — tekrar dene.');
      } else {
        setState('error');
        setError('Tanıma başarısız — kayıt ve tekrar yine çalışır.');
      }
    };
    rec.onend = () => {
      setState((s) => (s === 'listening' ? 'idle' : s));
    };
    recRef.current = rec;
    try {
      rec.start();
      setState('listening');
    } catch {
      setState('error');
      setError('Tanıma başlatılamadı.');
    }
  }, [lang]);

  return { supported, state, transcript, error, start, stop, reset };
}

/** Transkripti hedef kalıba kaba eşleme (telaffuz puanı UYDURULMAZ). */
export function transcriptMatchesReference(transcript: string, reference: string): { hit: boolean; note: string } {
  const norm = (s: string) => s.toLowerCase().replace(/[.!?,;:'"()]/g, ' ').replace(/\s+/g, ' ').trim();
  const t = norm(transcript);
  const r = norm(reference);
  if (!t) return { hit: false, note: 'Transkript yok — kaydını dinleyip kendini değerlendir.' };
  if (t === r) return { hit: true, note: 'Referansla birebir eşleşti.' };
  const tTokens = new Set(t.split(' '));
  const rTokens = r.split(' ');
  const common = rTokens.filter((w) => tTokens.has(w)).length;
  const ratio = common / Math.max(1, rTokens.length);
  if (ratio >= 0.7) return { hit: true, note: `Ana kelimeler eşleşti (${common}/${rTokens.length}).` };
  return { hit: false, note: `Fark var (${common}/${rTokens.length} kelime). Kaydını dinleyip tekrar dene.` };
}
