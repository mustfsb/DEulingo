/**
 * Genel Tekrar bankası — ortak taban.
 *
 * Tüm Genel Tekrar alıştırmaları `reviewOnly` üyesidir: gün havuzlarına girmez,
 * yalnızca kümülatif Genel Tekrar oturumlarında kullanılır. `day: 10` yalnızca
 * bilgi-sınırı işaretidir (kavram günü ≤ 10 her zaman sağlanır); gün sayacını,
 * gün istatistiğini ya da gün tamamlanmasını etkilemez.
 *
 * KURAL: her alıştırmanın kavramları ve kelimeleri LEARNED_SO_FAR içindedir
 * (Özel Ders 1, 2, 3, 5, 6, 7, 10. günler). Yeni dilbilgisi ya da kelime YOK.
 */

import type { AuthoredExercise } from '../types.ts';

type ExerciseType = AuthoredExercise['type'];
type Difficulty = AuthoredExercise['difficulty'];
type Skill = AuthoredExercise['skill'];

export const GR_DAY = 10;

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
    day: GR_DAY,
    track: 'private',
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
