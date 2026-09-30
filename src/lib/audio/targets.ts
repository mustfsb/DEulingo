import type { EnglishAudioTarget, Exercise, GermanAudioTarget } from '../../content/types';

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

/**
 * Almanca bulucunun İngilizce karşılığı: yalnızca içerikte açıkça en-GB
 * olarak işaretlenmiş, tam eşleşen hedef döndürülür.
 */
export function findEnglishAudioTarget(
  exercise: Pick<Exercise, 'audio'>,
  text: string | undefined,
): EnglishAudioTarget | undefined {
  if (!text) return undefined;
  const requested = text.trim();
  const targets = [
    exercise.audio?.prompt,
    exercise.audio?.canonicalAnswer,
    ...(exercise.audio?.targets ?? []),
  ].filter((target): target is EnglishAudioTarget => Boolean(target));
  return targets.find((target) => target.language === 'en-GB' && target.text.trim() === requested);
}
