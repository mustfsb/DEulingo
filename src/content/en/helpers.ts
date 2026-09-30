/**
 * İngilizce alıştırma yazım yardımcıları (Present Perfect).
 *
 * Almanca `refine` hattından geçilmez: çipler (`words`) ve seçenekler elde
 * yazılır; bu yüzden karıştırma yazarın sorumluluğundadır (deterministik).
 */

import type { Exercise } from '../types.ts';

export const EN_TOPIC_ID = 'en.present-perfect';
export const EN_TOPIC_TITLE = 'Present Perfect';

/** Serbest üretimde kısaltma normalizasyonu (I've = I have …). */
export const EN = { englishContractions: true } as const;
/** Tek sözcüklü dilbilgisi cevapları: yazım toleransı da kapalı. */
export const EXACT_EN = { noTypoTolerance: true, englishContractions: true } as const;

type Rest = Partial<Exercise> & { instruction: string };

export function pp(
  id: string,
  type: Exercise['type'],
  difficulty: Exercise['difficulty'],
  skill: Exercise['skill'],
  conceptIds: string[],
  rest: Rest,
): Exercise {
  return {
    id,
    topicId: EN_TOPIC_ID,
    topic: EN_TOPIC_TITLE,
    type,
    difficulty,
    skill,
    conceptIds,
    origin: 'authored',
    source: { file: 'en.present-perfect', naturalKey: id },
    ...rest,
  };
}

/** Kelime bankası jetonu — `t1, t2, …` kararlı kimlikler. */
export const tok = (...texts: string[]) => texts.map((text, index) => ({ id: `t${index + 1}`, text }));

/** İngilizce dinleme istemi (en-GB; oynatma tarayıcı Web Speech ile). */
export const listenEn = (text: string) => ({
  prompt: { text, language: 'en-GB' as const, role: 'prompt' as const },
});

/** Geri bildirimde okunacak kanonik İngilizce cevap. */
export const answerEn = (text: string) => ({
  canonicalAnswer: { text, language: 'en-GB' as const, role: 'canonical-answer' as const },
});
