import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTtsService } from '../../../scripts/tts-service';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('Piper cache service', () => {
  it('returns a cached WAV without starting Piper', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'almanca-tts-'));
    directories.push(cacheDir);
    const service = createTtsService({ cacheDir, voice: 'test-voice', runPiper: vi.fn() });
    const key = service.cacheKey({ text: 'Wie heißt du?', language: 'de-DE', speed: 'normal' });
    await writeFile(join(cacheDir, `${key}.wav`), 'cached-wav');

    const result = await service.generate({ text: 'Wie heißt du?', language: 'de-DE', speed: 'normal' });

    expect(result.cached).toBe(true);
    expect(service.runPiper).not.toHaveBeenCalled();
  });

  it('generates a missing WAV once and caches the result', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'almanca-tts-'));
    directories.push(cacheDir);
    const runPiper = vi.fn(async (_text: string, output: string) => writeFile(output, 'new-wav'));
    const service = createTtsService({ cacheDir, voice: 'test-voice', runPiper });

    const first = await service.generate({ text: 'Guten Morgen.', language: 'de-DE', speed: 'slow' });
    const second = await service.generate({ text: 'Guten Morgen.', language: 'de-DE', speed: 'slow' });

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(runPiper).toHaveBeenCalledTimes(1);
    expect(await readFile(join(cacheDir, `${first.key}.wav`), 'utf8')).toBe('new-wav');
  });

  it('ani biten Piper çıktısının kuyruğunu yumuşatır, gövdeye dokunmaz', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'almanca-tts-'));
    directories.push(cacheDir);
    const abrupt = makeAbruptWav();
    const runPiper = vi.fn(async (_text: string, output: string) => writeFile(output, abrupt));
    const service = createTtsService({ cacheDir, voice: 'test-voice', runPiper });

    const result = await service.generate({ text: 'dir.', language: 'de-DE', speed: 'normal' });
    expect(result.cached).toBe(false);
    const produced = await readFile(join(cacheDir, `${result.key}.wav`));
    const { samples, sampleRate } = parseTestWav(produced);
    const peak = Math.max(...samples.map((value) => Math.abs(value)));
    // Son örnek neredeyse sessiz; gövde tepesi korunur.
    expect(Math.abs(samples[samples.length - 1]) / peak).toBeLessThan(0.05);
    expect(peak).toBeGreaterThan(29000);
    // Yumuşatma pencereleri dışında kalan gövde bit-bit aynıdır.
    const fadeStart = samples.length - Math.floor((sampleRate * 30) / 1000);
    const fadeInEnd = Math.floor((sampleRate * 4) / 1000);
    const original = parseTestWav(abrupt).samples;
    expect(samples.slice(fadeInEnd, fadeStart)).toEqual(original.slice(fadeInEnd, fadeStart));
  });

  it('WAV olmayan çıktıyı "düzeltmeye" kalkmaz', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'almanca-tts-'));
    directories.push(cacheDir);
    const runPiper = vi.fn(async (_text: string, output: string) => writeFile(output, 'not-a-wav'));
    const service = createTtsService({ cacheDir, voice: 'test-voice', runPiper });
    const result = await service.generate({ text: 'x.', language: 'de-DE', speed: 'normal' });
    expect(await readFile(join(cacheDir, `${result.key}.wav`), 'utf8')).toBe('not-a-wav');
  });
});

/** Tam genlikte kesilen 0,5sn 220Hz sinüs (son örnek = tepe). */
function makeAbruptWav(): Buffer {
  const sampleRate = 22050;
  const count = sampleRate / 2;
  const samples = new Array<number>(count);
  for (let i = 0; i < count; i += 1) {
    // Faz, dosya sonunda tepeye denk gelecek şekilde seçilir.
    samples[i] = Math.round(30000 * Math.sin((2 * Math.PI * 220 * i) / sampleRate + Math.PI / 2 - ((2 * Math.PI * 220 * count) / sampleRate % (2 * Math.PI))));
  }
  samples[count - 1] = 30000;
  const data = Buffer.alloc(count * 2);
  samples.forEach((value, i) => data.writeInt16LE(value, i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8); header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function parseTestWav(buffer: Buffer): { samples: number[]; sampleRate: number } {
  const dataSize = buffer.readUInt32LE(40);
  const count = dataSize / 2;
  const samples: number[] = new Array<number>(count);
  for (let i = 0; i < count; i += 1) samples[i] = buffer.readInt16LE(44 + i * 2);
  return { samples, sampleRate: buffer.readUInt32LE(24) };
}
