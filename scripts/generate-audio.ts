/** Bilinen içerikteki Almanca + İngilizce metinleri tekilleştirerek Piper cache'e yazar. */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ContentBundle, Exercise } from '../src/content/types.ts';
import { validateSpeechRequest, type SpeechRequest } from '../src/lib/audio/tts.ts';
import { createTtsService } from './tts-service.ts';

function exerciseTargets(exercise: Exercise): { text: string; language: 'de-DE' | 'en-GB' }[] {
  const targets = [exercise.audio?.prompt, exercise.audio?.canonicalAnswer, ...(exercise.audio?.targets ?? [])];
  const out: { text: string; language: 'de-DE' | 'en-GB' }[] = [];
  for (const target of targets) {
    if (target?.text) out.push({ text: target.text, language: target.language });
  }
  for (const item of exercise.pronunciation ?? []) {
    if (item.german) out.push({ text: item.german, language: 'de-DE' });
  }
  return out;
}

async function main() {
  const content = JSON.parse(await readFile(resolve('generated/exercises.json'), 'utf8')) as ContentBundle;
  const texts = new Set<string>();
  for (const exercise of content.exercises) exerciseTargets(exercise).forEach((target: { text: string }) => texts.add(target.text));
  const sections = [...content.summaries.flatMap((summary) => summary.sections), ...(content.reviewSummary?.sections ?? [])];
  for (const section of sections) {
    section.examples.forEach((example) => texts.add(example.german));
    section.pronunciation.forEach((item) => texts.add(item.german));
  }
  const services = new Map<string, ReturnType<typeof createTtsService>>();
  const { voiceProfileFor } = await import('../src/lib/audio/tts.ts');
  const { voiceFileFor } = await import('./tts-service.ts');
  const serviceFor = (language: 'de-DE' | 'en-GB', voice: string) => {
    const key = `${language}:${voice}`;
    const existing = services.get(key);
    if (existing) return existing;
    const profile = voiceProfileFor(language, voice);
    const service = createTtsService({
      voice: profile.model,
      voiceVersion: profile.version,
      voiceFile: voiceFileFor(profile.id, language),
      voiceId: profile.id as never,
      speaker: 'speaker' in profile ? (profile.speaker as number) : undefined,
    });
    services.set(key, service);
    return service;
  };
  let cached = 0;
  let generated = 0;
  // `texts` geriye dönük sayım içindir (dil başına ayrı anahtar üretilir).
  const seen = new Set<string>();
  for (const exercise of content.exercises) {
    for (const target of exerciseTargets(exercise)) {
      const key = `${target.language}|${target.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const request: SpeechRequest = { text: target.text, language: target.language, speed: 'normal' };
      if (!validateSpeechRequest(request).ok) continue;
      const checked = validateSpeechRequest(request);
      if (!checked.ok) continue;
      const result = await serviceFor(checked.value.language, checked.value.voice).generate(checked.value);
      if (result.cached) cached += 1;
      else generated += 1;
    }
  }
  for (const text of texts) {
    const key = `de-DE|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const request: SpeechRequest = { text, language: 'de-DE', speed: 'normal' };
    if (!validateSpeechRequest(request).ok) continue;
    const checked = validateSpeechRequest(request);
    if (!checked.ok) continue;
    const result = await serviceFor(checked.value.language, checked.value.voice).generate(checked.value);
    if (result.cached) cached += 1;
    else generated += 1;
  }
  console.log(`[piper] ${seen.size} benzersiz metin (de-DE + en-GB) — ${generated} üretildi, ${cached} cache'ten okundu.`);
}

main().catch((error: unknown) => {
  console.error(`[piper] ses üretimi hatası: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
