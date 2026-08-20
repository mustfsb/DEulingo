/**
 * v2 ustverisinin varsayilanlari ve yazilmis alistirmalarin donusumu.
 */

import type { Exercise } from '../types.ts';
import type { AuthoredExercise } from '../authored/types.ts';
import { approximate } from '../authored/pronunciation.ts';
import { refineDraft } from './refine.ts';
import { SECONDS_BY_TYPE } from './defaults.ts';
import type { DraftExercise } from './extract.ts';

/**
 * Alistirmaya okunus verisi ekler.
 * Acikca `pronounce` verilmemisse yalnızca görsel destek için cevaptan
 * türetilir. Piper yetkisi ise sadece açık içerik metadatasından gelir.
 */
export function attachPronunciation(exercise: Exercise, pronounce?: string[]): Exercise {
  const sources = pronounce?.length ? pronounce : implicitPronounceTargets(exercise);
  if (!sources.length) return exercise;

  const seen = new Set<string>();
  const pronunciation = sources
    .filter((value) => {
      const key = value.trim().toLocaleLowerCase('de');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((value) => approximate(value));

  const next: Exercise = pronunciation.length ? { ...exercise, pronunciation } : exercise;

  // `pronounce` yazar tarafından Almanca olarak beyan edilmiştir. Otomatik
  // ses için rastgele metin sezgisi kullanmayız: yalnızca bu açık işaret ve
  // önceden tanımlı `audio` alanı Piper'a ulaşabilir.
  if (!pronounce?.length) return next;
  const declared = new Set(pronounce.map((value) => value.trim()));
  const audio = { ...next.audio };
  const targets = new Map((audio.targets ?? []).map((target) => [target.text.trim(), target]));
  const addTarget = (text: string, role: 'prompt' | 'canonical-answer' | 'example' | 'vocabulary' = 'vocabulary') => {
    const trimmed = text.trim();
    if (trimmed && !targets.has(trimmed)) targets.set(trimmed, { text: trimmed, language: 'de-DE', role });
  };
  // `pronounce` yazarın açık Almanca bildirimi olduğu için ek ses yüzeyleri
  // bu listeyle sınırlıdır; rastgele UI/öğrenci metni asla Piper'a çıkmaz.
  for (const text of declared) addTarget(text);
  if (next.wordBank?.targetLanguage === 'de') {
    for (const token of next.wordBank.tokens) addTarget(token.text);
  }
  if (next.words?.length && next.answer && declared.size > 0) {
    for (const word of next.words) addTarget(word);
  }
  if (!audio.prompt && next.prompt && declared.has(next.prompt.trim())) {
    audio.prompt = { text: next.prompt.trim(), language: 'de-DE', role: 'prompt' };
  }
  if (!audio.canonicalAnswer && next.answer && declared.has(next.answer.trim())) {
    audio.canonicalAnswer = { text: next.answer.trim(), language: 'de-DE', role: 'canonical-answer' };
  }

  if (targets.size) audio.targets = [...targets.values()];
  return audio.prompt || audio.canonicalAnswer || audio.targets?.length ? { ...next, audio } : next;
}

/**
 * Cevabin kendisi Almancaysa okunus gosterilebilir.
 * Turkce cevaplarda (ör. "uzun \"i\" gibi") okunus anlamsizdir.
 */
function implicitPronounceTargets(exercise: Exercise): string[] {
  const answer = exercise.answer?.trim();
  if (!answer || exercise.type === 'matching') return [];
  // Turkce'ye ozgu harfler ya da tirnakli aciklama iceren cevaplar Almanca degildir.
  if (/[ığşİĞŞçÇ]|"|gibi|okunur|okunmaz/.test(answer)) return [];
  if (!/[A-Za-zÄÖÜäöüß]/.test(answer)) return [];
  return [answer];
}

/** Yazilmis tanimi tam bir `Exercise`e cevirir. */
export function buildAuthoredExercise(item: AuthoredExercise): Exercise {
  const draft: DraftExercise = {
    itemKey: item.id,
    day: item.day,
    topic: item.topicId,
    type: item.type,
    instruction: item.instruction,
    prompt: item.prompt,
    audioText: item.audioText,
    answer: item.answer,
    acceptedAnswers: item.acceptedAnswers,
    options: item.options,
    pairs: item.pairs,
    wordBank: item.wordBank,
    audio: item.audio,
    requirements: item.requirements,
    sampleAnswer: item.sampleAnswer,
    hint: item.hint,
    explanation: item.explanation,
    openEnded: item.openEnded,
    validation: item.validation,
  };

  // Kelime cipleri, celdiriciler ve secenek sirasi ID'ye gore deterministik uretilir.
  refineDraft(draft, item.id);

  const exercise: Exercise = {
    id: item.id,
    day: item.day,
    topic: item.topicId,
    type: item.type,
    instruction: draft.instruction,
    difficulty: item.difficulty,
    skill: item.skill,
    conceptIds: item.conceptIds,
    origin: 'authored',
    topicId: item.topicId,
    estimatedSeconds: item.estimatedSeconds ?? SECONDS_BY_TYPE[item.type],
    source: {
      file: 'authored',
      day: item.day,
      section: item.topicId,
      itemKey: item.id,
      naturalKey: `authored/${item.id}`,
    },
  };

  if (draft.prompt) exercise.prompt = draft.prompt;
  if (draft.audioText) exercise.audioText = draft.audioText;
  if (draft.answer) exercise.answer = draft.answer;
  if (draft.acceptedAnswers?.length) exercise.acceptedAnswers = draft.acceptedAnswers;
  if (draft.options?.length) exercise.options = draft.options;
  if (draft.words?.length) exercise.words = draft.words;
  if (draft.pairs?.length) exercise.pairs = draft.pairs;
  if (draft.wordBank) exercise.wordBank = draft.wordBank;
  if (draft.audio) exercise.audio = draft.audio;
  if (draft.requirements?.length) exercise.requirements = draft.requirements;
  if (draft.sampleAnswer) exercise.sampleAnswer = draft.sampleAnswer;
  if (draft.hint) exercise.hint = draft.hint;
  if (draft.explanation) exercise.explanation = draft.explanation;
  if (draft.openEnded) exercise.openEnded = true;
  if (draft.validation) exercise.validation = draft.validation;
  if (item.familyId) exercise.familyId = item.familyId;
  if (item.masteryWeight !== undefined) exercise.masteryWeight = item.masteryWeight;

  return attachPronunciation(exercise, item.pronounce);
}
