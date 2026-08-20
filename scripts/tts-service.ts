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
