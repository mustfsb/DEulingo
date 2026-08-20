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
});
