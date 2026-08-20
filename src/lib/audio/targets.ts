import type { Exercise, GermanAudioTarget } from '../../content/types';

/**
 * Metin benzerliğiyle dil tahmini yapmaz. Yalnızca içerikte ayrı ayrı
 * de-DE olarak işaretlenmiş, tam eşleşen bir hedef döndürülebilir.
 */
export function findGermanAudioTarget(
  exercise: Pick<Exercise, 'audio'>,
  text: string | undefined,
): GermanAudioTarget | undefined {
  if (!text) return undefined;
  const requested = text.trim();
  const targets = [
    exercise.audio?.prompt,
    exercise.audio?.canonicalAnswer,
    ...(exercise.audio?.targets ?? []),
  ].filter((target): target is GermanAudioTarget => Boolean(target));
  return targets.find((target) => target.language === 'de-DE' && target.text.trim() === requested);
}
