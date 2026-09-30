/** Yerel Piper calistiricisi. Vite eklentisi ve on-uretim CLI'i bunu kullanir. */
import { createHash } from 'node:crypto';
import { access, mkdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_GERMAN_VOICE_ID,
  germanVoiceProfile,
  GERMAN_VOICE_PROFILES,
  PIPER_GERMAN_VOICE,
  PIPER_GERMAN_VOICE_VERSION,
  piperLengthScaleFor,
  speechCacheMaterial,
  validateSpeechRequest,
  type GermanVoiceId,
  type SpeechRequest,
} from '../src/lib/audio/tts.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PIPER_DIRECTORY = join(projectRoot, '.piper');
export const AUDIO_CACHE_DIRECTORY = join(projectRoot, 'generated', 'audio');
export const voiceFileFor = (voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID) =>
  join(PIPER_DIRECTORY, 'voices', `${germanVoiceProfile(voice).model}.onnx`);
export const DEFAULT_VOICE_FILE = voiceFileFor();
export const DEFAULT_PIPER_BIN = join(PIPER_DIRECTORY, 'venv', 'bin', 'piper');

export interface SpeechGeneration {
  key: string;
  cached: boolean;
  file: string;
}

export type PiperRunner = (text: string, output: string, speed: SpeechRequest['speed']) => Promise<void>;

/** Ses URL'si sürümü: oynatılan baytlar değiştiğinde artırılır; tarayıcıların
 *  `immutable` önbelleğindeki eski WAV'lar böylece baypas edilir. */
export const TTS_AUDIO_URL_VERSION = '2';

/** Üretimde kenar yumuşatma süreleri: sonda 30ms, başta 4ms. */
export const TTS_FADE_OUT_MS = 30;
export const TTS_FADE_IN_MS = 4;

/**
 * Piper çıktısının kenar yumuşatması.
 *
 * Piper bazen cümleyi tam genlikte keser (son örnek ≈ tepe değer). Dosya
 * bitince genlik dikey olarak sıfıra düşer ve katı oynatıcılar bunu duyulur
 * bir "tık/dıt" olarak çalar. Üretimde deterministik yumuşatma uygulanır:
 * sonda raised-cosine fade-out, başta kısa fade-in. Dosyanın geri kalanı
 * bit-bit aynı kalır; önbellek anahtarı (istek karması) değişmez.
 *
 * Yalnızca 16-bit PCM WAV işlenir; tanınmayan içerik aynen bırakılır
 * (böylece sahte/bozuk çıktı sessizce "düzeltilmiş" gibi görünmez).
 */
export async function applyEdgeFades(file: string): Promise<'faded' | 'skipped'> {
  const { readFile, writeFile } = await import('node:fs/promises');
  const buffer = await readFile(file);
  const parsed = parsePcm16(buffer);
  if (!parsed) return 'skipped';
  const { samples, sampleRate, dataOffset } = parsed;
  const fadeOut = Math.min(samples.length, Math.floor((sampleRate * TTS_FADE_OUT_MS) / 1000));
  const fadeIn = Math.min(samples.length, Math.floor((sampleRate * TTS_FADE_IN_MS) / 1000));
  let touched = false;
  for (let i = 0; i < fadeOut; i += 1) {
    const factor = 0.5 * (1 - Math.cos((Math.PI * (fadeOut - 1 - i)) / Math.max(1, fadeOut - 1)));
    const index = samples.length - fadeOut + i;
    const next = Math.round(samples[index] * factor);
    if (next !== samples[index]) {
      samples[index] = next;
      touched = true;
    }
  }
  for (let i = 0; i < fadeIn; i += 1) {
    const factor = 0.5 * (1 - Math.cos((Math.PI * i) / Math.max(1, fadeIn)));
    const next = Math.round(samples[i] * factor);
    if (next !== samples[i]) {
      samples[i] = next;
      touched = true;
    }
  }
  if (!touched) return 'skipped';
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  for (let i = 0; i < samples.length; i += 1) view.setInt16(dataOffset + i * 2, samples[i], true);
  await writeFile(file, buffer);
  return 'faded';
}

interface Pcm16Data {
  samples: number[];
  sampleRate: number;
  dataOffset: number;
}

/** 16-bit PCM mono/stereo WAV yükler; başka hiçbir biçime dokunulmaz. */
function parsePcm16(buffer: Buffer): Pcm16Data | null {
  try {
    if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF') return null;
    let offset = 12;
    let sampleRate = 0;
    let channels = 0;
    let bits = 0;
    let audioFormat = 0;
    let dataOffset = -1;
    let dataSize = 0;
    while (offset + 8 <= buffer.length) {
      const id = buffer.toString('ascii', offset, offset + 4);
      const size = buffer.readUInt32LE(offset + 4);
      if (id === 'fmt ' && size >= 16) {
        audioFormat = buffer.readUInt16LE(offset + 8);
        channels = buffer.readUInt16LE(offset + 10);
        sampleRate = buffer.readUInt32LE(offset + 12);
        bits = buffer.readUInt16LE(offset + 22);
      } else if (id === 'data') {
        dataOffset = offset + 8;
        dataSize = size;
        break;
      }
      offset += 8 + size + (size % 2);
    }
    if (audioFormat !== 1 || bits !== 16 || !sampleRate || !channels || dataOffset < 0) return null;
    const frames = Math.min(Math.floor(dataSize / 2), Math.floor((buffer.length - dataOffset) / 2));
    if (frames < 1) return null;
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const samples: number[] = new Array(frames);
    for (let i = 0; i < frames; i += 1) samples[i] = view.getInt16(dataOffset + i * 2, true);
    return { samples, sampleRate, dataOffset };
  } catch {
    return null;
  }
}

export interface TtsServiceOptions {
  cacheDir?: string;
  voice?: string;
  voiceVersion?: string;
  voiceFile?: string;
  /** Sesin modelden bağımsız normal hız kalibrasyonunu seçer. */
  voiceId?: GermanVoiceId;
  speaker?: number;
  piperBin?: string;
  runPiper?: PiperRunner;
}

function nonEmptyFile(path: string): Promise<boolean> {
  return stat(path).then((file) => file.size > 0).catch(() => false);
}

export function createTtsService(options: TtsServiceOptions = {}) {
  const cacheDir = resolve(options.cacheDir ?? AUDIO_CACHE_DIRECTORY);
  const voice = options.voice ?? PIPER_GERMAN_VOICE;
  const voiceVersion = options.voiceVersion ?? PIPER_GERMAN_VOICE_VERSION;
  const voiceFile = options.voiceFile ?? DEFAULT_VOICE_FILE;
  const voiceId = options.voiceId ?? DEFAULT_GERMAN_VOICE_ID;
  const piperBin = options.piperBin ?? DEFAULT_PIPER_BIN;
  const runPiper = options.runPiper ?? createPiperRunner(piperBin, voiceFile, voiceId, options.speaker);

  const cacheKey = (request: SpeechRequest) =>
    createHash('sha256').update(speechCacheMaterial(request, voice, voiceVersion), 'utf8').digest('hex');

  return {
    cacheDir,
    voice,
    runPiper,
    cacheKey,
    async generate(request: SpeechRequest): Promise<SpeechGeneration> {
      const checked = validateSpeechRequest(request);
      if (!checked.ok) throw new Error(checked.error);
      const key = cacheKey(checked.value);
      const file = join(cacheDir, `${key}.wav`);
      if (await nonEmptyFile(file)) return { key, cached: true, file };

      await mkdir(cacheDir, { recursive: true });
      const temporary = join(cacheDir, `.${key}.${process.pid}.${Date.now()}.wav`);
      try {
        await runPiper(checked.value.text, temporary, checked.value.speed);
        if (!(await nonEmptyFile(temporary))) throw new Error('Piper geçerli bir WAV dosyası üretmedi.');
        // Ani kesilme "tık"ı üretmesin diye kenar yumuşatma (deterministik).
        await applyEdgeFades(temporary);
        await rename(temporary, file);
      } finally {
        await unlink(temporary).catch(() => undefined);
      }
      return { key, cached: false, file };
    },
  };
}

export function createPiperRunner(
  piperBin: string,
  voiceFile: string,
  voice: GermanVoiceId = DEFAULT_GERMAN_VOICE_ID,
  speaker?: number,
): PiperRunner {
  return async (text, output, speed) => {
    const lengthScale = piperLengthScaleFor(voice, speed);
    const args = ['--model', voiceFile];
    if (speaker !== undefined) args.push('--speaker', String(speaker));
    args.push('--output_file', output, '--length_scale', lengthScale);
    await new Promise<void>((resolveRun, reject) => {
      const child = spawn(piperBin, args, {
        stdio: ['pipe', 'ignore', 'pipe'],
        shell: false,
      });
      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = `${stderr}${chunk.toString()}`.slice(-1200);
      });
      child.on('error', (error) => reject(new Error(`Piper başlatılamadı: ${error.message}`)));
      child.on('close', (code) => {
        if (code === 0) resolveRun();
        else reject(new Error(`Piper ${code ?? 'bilinmeyen'} koduyla kapandı: ${stderr || 'ayrıntı yok'}`));
      });
      child.stdin.end(`${text}\n`, 'utf8');
    });
  };
}

export async function ttsHealth() {
  const service = createTtsService();
  const [binary, voices] = await Promise.all([
    access(DEFAULT_PIPER_BIN).then(() => true).catch(() => false),
    Promise.all(
      GERMAN_VOICE_PROFILES.map(async (profile) => ({
        id: profile.id,
        available: await access(voiceFileFor(profile.id)).then(() => true).catch(() => false),
      })),
    ),
  ]);
  const defaultVoiceReady = voices.some((voice) => voice.id === DEFAULT_GERMAN_VOICE_ID && voice.available);
  return {
    ready: binary && defaultVoiceReady,
    voice: service.voice,
    voiceVersion: PIPER_GERMAN_VOICE_VERSION,
    voices,
    cacheDirectory: AUDIO_CACHE_DIRECTORY,
    diagnostics: binary && defaultVoiceReady ? undefined : 'Piper veya varsayılan de_DE sesi kurulmamış. `npm run tts:setup` çalıştırın.',
  };
}
