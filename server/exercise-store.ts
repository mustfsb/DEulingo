/**
 * Sunucu tarafı kanonik alıştırma deposu (Node-only).
 *
 * Güvenlik: istemciden beklenen cevap / politika alınmaz. Sunucu,
 * `exerciseId` ile kanonik tanımı buradan çözer. Vocab sentetik
 * soruları (`vocab-<id>-<tür>`) envanterden yeniden kurulur; diğer
 * alıştırmalar `generated/exercises.json` paketinden okunur.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Exercise } from '../src/content/types.ts';
import { VOCAB_BY_ID } from '../src/content/vocabulary/inventory.ts';
import { EN_VOCAB_BY_ID } from '../src/content/en/vocab.ts';
import { enExercisesById } from '../src/content/en/index.ts';

interface BundleShape {
  exercises?: Exercise[];
}

let cache: Map<string, Exercise> | null = null;

function bundlePath(): string {
  // server/*.ts → proje kökü/generated/exercises.json
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', 'generated', 'exercises.json');
}

function loadBundle(): Map<string, Exercise> {
  if (cache) return cache;
  const map = new Map<string, Exercise>();
  try {
    const raw = readFileSync(bundlePath(), 'utf8');
    const parsed = JSON.parse(raw) as BundleShape;
    for (const exercise of parsed.exercises ?? []) {
      if (exercise && typeof exercise.id === 'string') map.set(exercise.id, exercise);
    }
  } catch {
    // Paket yoksa yalnızca vocab çözümlemesi çalışır.
  }
  cache = map;
  return map;
}

const VOCAB_SUFFIXES = ['-detr-type', '-trde-type', '-listen-type'] as const;

function vocabExercise(exerciseId: string): Exercise | undefined {
  if (!exerciseId.startsWith('vocab-')) return undefined;
  const rest = exerciseId.slice('vocab-'.length);
  const suffix = VOCAB_SUFFIXES.find((s) => rest.endsWith(s));
  if (!suffix) return undefined;
  const vocabId = rest.slice(0, -suffix.length);
  const entry = VOCAB_BY_ID.get(vocabId);
  if (!entry) return undefined;

  const topicId = entry.topicIds[0] ?? 'topic.vocabulary';
  if (suffix === '-detr-type') {
    return {
      id: exerciseId,
      topicId,
      topic: topicId,
      type: 'free-text',
      instruction: 'Türkçesini yaz:',
      prompt: entry.german,
      answer: entry.turkish,
      acceptedAnswers: [],
      source: { file: 'vocab-inventory', naturalKey: entry.id },
      difficulty: 'medium',
      skill: 'recall',
      conceptIds: [],
      origin: 'authored',
    };
  }
  const nounArticle = entry.type === 'noun';
  return {
    id: exerciseId,
    topicId,
    topic: topicId,
    type: suffix === '-listen-type' ? 'dictation' : 'free-text',
    instruction: nounArticle ? 'Almancasını ARTİKELİYLE yaz:' : 'Almancasını yaz:',
    prompt: entry.turkish,
    answer: entry.german,
    acceptedAnswers: [],
    validation: { keyboardTolerance: true },
    source: { file: 'vocab-inventory', naturalKey: entry.id },
    difficulty: 'hard',
    skill: 'production',
    conceptIds: [],
    origin: 'authored',
  };
}

/**
 * İngilizce envanterden sentetik soru (`vocab-en-v-*-<tür>`).
 * Almanca çözümleyiciye düşmez (envanter ayrıdır); yönergeler İngilizce der.
 */
function enVocabExercise(exerciseId: string): Exercise | undefined {
  if (!exerciseId.startsWith('vocab-en-v-')) return undefined;
  const rest = exerciseId.slice('vocab-'.length);
  const suffix = VOCAB_SUFFIXES.find((s) => rest.endsWith(s));
  if (!suffix) return undefined;
  const vocabId = rest.slice(0, -suffix.length);
  const entry = EN_VOCAB_BY_ID.get(vocabId);
  if (!entry) return undefined;

  const topicId = entry.topicIds[0] ?? 'en.present-perfect';
  if (suffix === '-detr-type') {
    return {
      id: exerciseId,
      topicId,
      topic: topicId,
      type: 'free-text',
      instruction: 'Türkçesini yaz:',
      prompt: entry.german,
      answer: entry.turkish,
      acceptedAnswers: [],
      source: { file: 'vocab-inventory', naturalKey: entry.id },
      difficulty: 'medium',
      skill: 'recall',
      conceptIds: [],
      origin: 'authored',
    };
  }
  return {
    id: exerciseId,
    topicId,
    topic: topicId,
    type: suffix === '-listen-type' ? 'dictation' : 'free-text',
    instruction: 'İngilizcesini yaz:',
    prompt: entry.turkish,
    answer: entry.german,
    acceptedAnswers: [],
    validation: { keyboardTolerance: true },
    source: { file: 'vocab-inventory', naturalKey: entry.id },
    difficulty: 'hard',
    skill: 'production',
    conceptIds: [],
    origin: 'authored',
  };
}

/** Kanonik alıştırmayı ID ile çözer; bilinmeyen ID → undefined. */
export function getExercise(exerciseId: string): Exercise | undefined {
  return (
    vocabExercise(exerciseId) ??
    enVocabExercise(exerciseId) ??
    loadBundle().get(exerciseId) ??
    enExercisesById.get(exerciseId)
  );
}

/** Testler için önbelleği sıfırlar. */
export function resetExerciseStore(): void {
  cache = null;
}
