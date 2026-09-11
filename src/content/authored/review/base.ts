/**
 * Genel Tekrar bankası — ortak taban.
 *
 * Genel Tekrar soruları `reviewOnly` üyesidir: konuların ders havuzlarına
 * (Dersler → Konu → Çalış) karışmaz; kümülatif Genel Tekrar modlarında ve
 * Genel Tekrar'daki konu filtrelerinde kullanılır. Konu etiketleri derslerle
 * AYNI kanonik konu kaydından gelir (bkz. `curriculum/topics.ts`) — ayrı bir
 * ikinci taksonomi yoktur.
 *
 * KURAL: her alıştırmanın kavramları öğrenilmiş (`learned`) kavramlardır.
 */

import type { AuthoredExercise } from '../types.ts';

type ExerciseType = AuthoredExercise['type'];
type Difficulty = AuthoredExercise['difficulty'];
type Skill = AuthoredExercise['skill'];

export function G(
  id: string,
  topicId: string,
  type: ExerciseType,
  difficulty: Difficulty,
  skill: Skill,
  conceptIds: string[],
  rest: Partial<AuthoredExercise> & { instruction: string },
): AuthoredExercise {
  return {
    id,
    reviewOnly: true,
    topicId,
    type,
    difficulty,
    skill,
    conceptIds,
    ...rest,
  };
}

/** Kelime bankası jetonu — `t1, t2, ...` kararlı kimlikler. */
export function tok(...texts: string[]): Array<{ id: string; text: string }> {
  return texts.map((text, index) => ({ id: `t${index + 1}`, text }));
}

/** Almanca üretimde klavye toleransı (ä/ö/ü/ß için ASCII yazım kabulü). */
export const DE_PROD = { keyboardTolerance: true } as const;
