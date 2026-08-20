/** Bilinen içerikteki Almanca metinleri tekilleştirerek Piper cache'e yazar. */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ContentBundle, Exercise } from '../src/content/types.ts';
import { validateSpeechRequest, type SpeechRequest } from '../src/lib/audio/tts.ts';
import { createTtsService } from './tts-service.ts';

function exerciseTexts(exercise: Exercise): string[] {
  return [
    exercise.audio?.prompt?.text,
    exercise.audio?.canonicalAnswer?.text,
    ...(exercise.pronunciation?.map((item) => item.german) ?? []),
  ].filter((text): text is string => Boolean(text));
}

async function main() {
  const content = JSON.parse(await readFile(resolve('generated/exercises.json'), 'utf8')) as ContentBundle;
  const texts = new Set<string>();
  for (const exercise of content.exercises) exerciseTexts(exercise).forEach((text) => texts.add(text));
  for (const day of content.summaries) {
    for (const topic of day.topics) {
      topic.examples.forEach((example) => texts.add(example.german));
      topic.pronunciation.forEach((item) => texts.add(item.german));
    }
  }
  const service = createTtsService();
  let cached = 0;
  let generated = 0;
  for (const text of texts) {
    const request: SpeechRequest = { text, language: 'de-DE', speed: 'normal' };
    if (!validateSpeechRequest(request).ok) continue;
    const result = await service.generate(request);
    if (result.cached) cached += 1;
    else generated += 1;
  }
  console.log(`[piper] ${texts.size} benzersiz Almanca metin — ${generated} üretildi, ${cached} cache'ten okundu.`);
}

main().catch((error: unknown) => {
  console.error(`[piper] ses üretimi hatası: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
