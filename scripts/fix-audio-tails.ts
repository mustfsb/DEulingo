/**
 * Önbellekteki ani-bitişli WAV'ları tek seferlik yamalar.
 *
 * Bazı Piper çıktıları cümleyi tam genlikte keser (son örnek ≈ tepe);
 * katı oynatıcılar bunu her çalmanın sonunda duyulur bir "tık/dıt" olarak
 * çalar. Bu betik yalnızca son örneği tepeye göre yüksek dosyaları bulur ve
 * `applyEdgeFades` ile yumuşatır. Deterministiktir; ikinci çalıştırma
 * temiz dosyaları atlar.
 *
 * Kullanım: `npx tsx scripts/fix-audio-tails.ts [--check]`
 * `--check` yalnızca raporlar, dosyaya dokunmaz.
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { AUDIO_CACHE_DIRECTORY, applyEdgeFades } from './tts-service.ts';
import { readFile } from 'node:fs/promises';

async function endLevel(file: string): Promise<number | null> {
  try {
    const buffer = await readFile(file);
    if (buffer.length < 46 || buffer.toString('ascii', 0, 4) !== 'RIFF') return null;
    let offset = 12;
    let dataOffset = -1;
    let dataSize = 0;
    while (offset + 8 <= buffer.length) {
      const id = buffer.toString('ascii', offset, offset + 4);
      const size = buffer.readUInt32LE(offset + 4);
      if (id === 'data') {
        dataOffset = offset + 8;
        dataSize = size;
        break;
      }
      offset += 8 + size + (size % 2);
    }
    if (dataOffset < 0) return null;
    const frames = Math.min(Math.floor(dataSize / 2), Math.floor((buffer.length - dataOffset) / 2));
    if (frames < 100) return null;
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    let peak = 0;
    for (let i = 0; i < frames; i += 1) {
      const value = Math.abs(view.getInt16(dataOffset + i * 2, true));
      if (value > peak) peak = value;
    }
    if (!peak) return null;
    return Math.abs(view.getInt16(dataOffset + (frames - 1) * 2, true)) / peak;
  } catch {
    return null;
  }
}

const checkOnly = process.argv.includes('--check');
const files = (await readdir(AUDIO_CACHE_DIRECTORY)).filter((name) => name.endsWith('.wav'));

let abrupt = 0;
let fixed = 0;
for (const name of files) {
  const level = await endLevel(join(AUDIO_CACHE_DIRECTORY, name));
  if (level === null || level <= 0.25) continue;
  abrupt += 1;
  if (checkOnly) {
    console.log(`[kuyruk] ${name.slice(0, 12)}… son/tepe=${level.toFixed(2)}`);
    continue;
  }
  const result = await applyEdgeFades(join(AUDIO_CACHE_DIRECTORY, name));
  if (result === 'faded') {
    fixed += 1;
    console.log(`[yama] ${name.slice(0, 12)}… son/tepe=${level.toFixed(2)} → yumuşatıldı`);
  }
}
console.log(`[kuyruk] ${files.length} dosya tarandı, ${abrupt} ani-bitişli${checkOnly ? '' : `, ${fixed} yamandı`}.`);
