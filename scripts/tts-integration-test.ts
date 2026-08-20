/** Gercek Piper kabul testi: model calisir, WAV uretilir ve cache okunabilir. */
import { readFile, stat } from 'node:fs/promises';
import { createTtsService, ttsHealth, voiceFileFor } from './tts-service.ts';
import { GERMAN_VOICE_PROFILES } from '../src/lib/audio/tts.ts';

const samples = ['Wie heißt du?', 'Ich komme aus der Türkei.', 'Guten Morgen.'];
const calibrationText = 'Guten Morgen. Wie heißt du? Ich komme aus der Türkei.';

async function wavDurationSeconds(path: string) {
  const wav = await readFile(path);
  // Piper'ın ürettiği PCM WAV içinde `fmt ` ve `data` bölümlerini bulur.
  let cursor = 12;
  let byteRate = 0;
  let dataLength = 0;
  while (cursor + 8 <= wav.length) {
    const id = wav.toString('ascii', cursor, cursor + 4);
    const length = wav.readUInt32LE(cursor + 4);
    if (id === 'fmt ' && cursor + 16 <= wav.length) byteRate = wav.readUInt32LE(cursor + 16);
    if (id === 'data') {
      dataLength = length;
      break;
    }
    cursor += 8 + length + (length % 2);
  }
  if (!byteRate || !dataLength) throw new Error(`Geçersiz WAV: ${path}`);
  return dataLength / byteRate;
}

async function main() {
  const health = await ttsHealth();
  if (!health.ready) throw new Error(health.diagnostics ?? 'Piper hazır değil.');
  const unavailable = health.voices.filter((voice) => !voice.available).map((voice) => voice.id);
  if (unavailable.length) throw new Error(`Eksik Piper sesleri: ${unavailable.join(', ')}.`);
  let referenceNormalDuration: number | undefined;
  for (const profile of GERMAN_VOICE_PROFILES) {
    const service = createTtsService({
      voice: profile.model,
      voiceVersion: profile.version,
      voiceFile: voiceFileFor(profile.id),
      voiceId: profile.id,
      speaker: 'speaker' in profile ? profile.speaker : undefined,
    });
    const speedDurations: Record<'fast' | 'normal' | 'slow', number> = { fast: 0, normal: 0, slow: 0 };
    for (const speed of ['fast', 'normal', 'slow'] as const) {
      const result = await service.generate({ text: calibrationText, language: 'de-DE', speed, voice: profile.id });
      speedDurations[speed] = await wavDurationSeconds(result.file);
    }
    if (referenceNormalDuration === undefined) referenceNormalDuration = speedDurations.normal;
    if (Math.abs(speedDurations.normal - referenceNormalDuration) > 0.25) {
      throw new Error(`${profile.label}: normal hız kalibrasyonu referanstan fazla sapıyor.`);
    }
    if (
      !(speedDurations.fast <= speedDurations.normal - 0.1
        && speedDurations.slow >= speedDurations.normal + 0.1)
    ) {
      throw new Error(`${profile.label}: hızlı/normal/yavaş farkı yeterince belirgin değil.`);
    }
    console.log(
      `[piper] ${profile.label} · hızlı ${speedDurations.fast.toFixed(2)} sn · normal ${speedDurations.normal.toFixed(2)} sn · yavaş ${speedDurations.slow.toFixed(2)} sn`,
    );
    for (const text of samples) {
      const result = await service.generate({ text, language: 'de-DE', speed: 'normal', voice: profile.id });
      const file = await stat(result.file);
      if (file.size < 44) throw new Error(`${profile.label} / ${text}: WAV boş ya da geçersiz görünüyor.`);
      console.log(`[piper] ${profile.label} · ${text} → ${file.size} B (${result.cached ? 'cache' : 'üretildi'})`);
    }
  }
  console.log('[piper] gerçek entegrasyon testi başarılı.');
}

main().catch((error: unknown) => {
  console.error(`[piper] entegrasyon testi hatası: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
