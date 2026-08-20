/** macOS/Apple Silicon icin proje-ici Piper + secilebilir Almanca ses kurulumu. */
import { createWriteStream } from 'node:fs';
import { access, mkdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { DEFAULT_PIPER_BIN, PIPER_DIRECTORY, voiceFileFor } from './tts-service.ts';
import { GERMAN_VOICE_PROFILES } from '../src/lib/audio/tts.ts';

function run(command: string, args: string[]) {
  return new Promise<void>((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => (code === 0 ? resolveRun() : reject(new Error(`${command} ${code} ile kapandı.`))));
  });
}

async function exists(path: string) {
  return access(path).then(() => true).catch(() => false);
}

async function download(url: string, target: string) {
  if (await exists(target)) return;
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Ses modeli indirilemedi: ${response.status} ${response.statusText}`);
  await mkdir(dirname(target), { recursive: true });
  // Orta/yüksek kalite modeller onlarca MB olabilir. Tüm response'u RAM'e
  // almak yerine diske akar; tamamlanmamış dosya asla gerçek model adıyla
  // kalmaz ve sonraki `tts:setup` denemesi güvenle tekrar indirir.
  const temporary = `${target}.${process.pid}.part`;
  try {
    await pipeline(Readable.fromWeb(response.body as never), createWriteStream(temporary));
    await rename(temporary, target);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

async function main() {
  const python = process.env.PYTHON ?? 'python3';
  if (!(await exists(DEFAULT_PIPER_BIN))) {
    console.log('[piper] Proje-ici Python ortamı hazırlanıyor…');
    await mkdir(PIPER_DIRECTORY, { recursive: true });
    await run(python, ['-m', 'venv', `${PIPER_DIRECTORY}/venv`]);
    await run(`${PIPER_DIRECTORY}/venv/bin/python`, ['-m', 'pip', 'install', '--upgrade', 'pip', 'piper-tts']);
  }
  for (const profile of GERMAN_VOICE_PROFILES) {
    const model = voiceFileFor(profile.id);
    const voiceBase = `https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/${profile.repositoryPath}/${profile.model}.onnx`;
    console.log(`[piper] ${profile.label} indiriliyor/doğrulanıyor…`);
    await download(voiceBase, model);
    await download(`${voiceBase}.json`, `${model}.json`);
    const size = (await stat(model)).size;
    if (size < 1_000_000) throw new Error(`${profile.label} modeli beklenenden küçük.`);
  }
  console.log(`[piper] hazır\n  binary: ${DEFAULT_PIPER_BIN}\n  voices: ${GERMAN_VOICE_PROFILES.map((profile) => profile.label).join(', ')}`);
}

main().catch((error: unknown) => {
  console.error(`[piper] kurulum hatası: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
