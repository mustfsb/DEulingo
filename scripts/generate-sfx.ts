/** Orijinal, kısa WAV geri bildirim efektleri — üçüncü taraf ses varlığı yoktur. */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sampleRate = 44_100;

function wav(notes: Array<{ hz: number; start: number; duration: number; gain: number }>) {
  const seconds = Math.max(...notes.map((note) => note.start + note.duration)) + 0.04;
  const samples = Math.ceil(seconds * sampleRate);
  const data = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    let value = 0;
    for (const note of notes) {
      const local = time - note.start;
      if (local < 0 || local > note.duration) continue;
      const edge = Math.min(0.018, note.duration / 4);
      const envelope = Math.min(1, local / edge, (note.duration - local) / edge);
      value += Math.sin(2 * Math.PI * note.hz * local) * note.gain * envelope;
    }
    data.writeInt16LE(Math.max(-1, Math.min(1, value)) * 32767, index * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8); header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const destination = resolve('public/audio');
await mkdir(destination, { recursive: true });

/**
 * Kilometre taşı efektleri de aynı üreticiden çıkar: kısa, yükselen ve
 * telaffuzun önüne geçmeyecek kadar kısık. Hiçbiri üçüncü taraf varlık değildir.
 */
await Promise.all([
  writeFile(`${destination}/correct.wav`, wav([{ hz: 587, start: 0, duration: 0.1, gain: 0.16 }, { hz: 784, start: 0.09, duration: 0.15, gain: 0.16 }])),
  writeFile(`${destination}/incorrect.wav`, wav([{ hz: 294, start: 0, duration: 0.12, gain: 0.14 }, { hz: 247, start: 0.1, duration: 0.16, gain: 0.12 }])),
  writeFile(`${destination}/complete.wav`, wav([{ hz: 523, start: 0, duration: 0.1, gain: 0.14 }, { hz: 659, start: 0.09, duration: 0.1, gain: 0.14 }, { hz: 784, start: 0.18, duration: 0.17, gain: 0.14 }])),
  // 5'li seri: üçlü, kıvrak bir yükseliş (D–F#–A).
  writeFile(`${destination}/streak-5.wav`, wav([
    { hz: 587, start: 0, duration: 0.075, gain: 0.13 },
    { hz: 740, start: 0.07, duration: 0.075, gain: 0.13 },
    { hz: 880, start: 0.14, duration: 0.19, gain: 0.14 },
  ])),
  // 10'lu seri: aynı motif bir oktav genişler, sonda hafif bir çift vurgu.
  writeFile(`${destination}/streak-10.wav`, wav([
    { hz: 587, start: 0, duration: 0.07, gain: 0.12 },
    { hz: 740, start: 0.065, duration: 0.07, gain: 0.12 },
    { hz: 880, start: 0.13, duration: 0.09, gain: 0.13 },
    { hz: 1175, start: 0.22, duration: 0.22, gain: 0.13 },
    { hz: 880, start: 0.22, duration: 0.22, gain: 0.06 },
  ])),
  // Mükemmel ders: geniş, açık bir majör üçlü + oktav kapanışı.
  writeFile(`${destination}/perfect.wav`, wav([
    { hz: 523, start: 0, duration: 0.11, gain: 0.13 },
    { hz: 659, start: 0.1, duration: 0.11, gain: 0.13 },
    { hz: 784, start: 0.2, duration: 0.12, gain: 0.13 },
    { hz: 1047, start: 0.31, duration: 0.3, gain: 0.14 },
    { hz: 784, start: 0.31, duration: 0.3, gain: 0.05 },
  ])),
  // Günlük hedef: iki notalık, kısa ve mütevazı bir onay.
  writeFile(`${destination}/goal.wav`, wav([
    { hz: 698, start: 0, duration: 0.08, gain: 0.1 },
    { hz: 1047, start: 0.075, duration: 0.14, gain: 0.11 },
  ])),
]);
console.log(`[audio] Özgün geri bildirim ve kilometre taşı efektleri yazıldı: ${destination}`);
