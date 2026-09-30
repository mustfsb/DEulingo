import { useEffect, useRef, useState } from 'react';
import { audioController } from '../lib/audio/playback';
import { DEFAULT_GERMAN_VOICE_ID, type GermanVoiceId, type SpeechAudioTarget, type SpeechSpeed } from '../lib/audio/tts';

export function PronunciationButton({
  target,
  contextId,
  speed = 'normal',
  voice = DEFAULT_GERMAN_VOICE_ID,
  compact = true,
  revealOnHover = false,
}: {
  /** Yalnızca içerikte açıkça işaretlenmiş hedef gönderilebilir (de-DE ya da en-GB). */
  target: SpeechAudioTarget;
  /** Elle oynatma da aktif ekran bağlamına bağlıdır; eski ekranda kalmaz. */
  contextId: string;
  speed?: SpeechSpeed;
  /** Kullanıcının ayarlardan seçtiği, doğrulanmış Piper sesi (Almanca hedeflerde). */
  voice?: GermanVoiceId;
  compact?: boolean;
  /** Metin/tile kapsayıcısı hover veya klavye odağındayken görünür. */
  revealOnHover?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const requestGeneration = useRef(0);
  const isEnglish = target.language === 'en-GB';

  useEffect(() => () => { requestGeneration.current += 1; }, []);

  const listen = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const generation = ++requestGeneration.current;
    setUnavailable(false);
    setPlaying(true);
    try {
      await audioController.speak(contextId, target, speed, voice);
    } catch {
      if (generation === requestGeneration.current) setUnavailable(true);
    } finally {
      if (generation === requestGeneration.current) setPlaying(false);
    }
  };

  const label = isEnglish
    ? speed === 'slow'
      ? 'İngilizce telaffuzu yavaş dinle'
      : speed === 'fast'
        ? 'İngilizce telaffuzu hızlı dinle'
        : 'İngilizce telaffuzu dinle'
    : speed === 'slow'
      ? 'Almanca telaffuzu yavaş dinle'
      : speed === 'fast'
        ? 'Almanca telaffuzu hızlı dinle'
        : 'Almanca telaffuzu dinle';

  return (
    <span className={`audio-button-wrap inline-flex items-center gap-2${revealOnHover ? ' is-reveal' : ''}`}>
      <button
        type="button"
        className={`audio-button${playing ? ' is-playing' : ''}${compact ? ' is-compact' : ''}`}
        aria-label={label}
        title={isEnglish ? 'İngilizce telaffuzu dinle' : 'Almanca telaffuzu dinle'}
        aria-busy={playing}
        aria-pressed={playing}
        onClick={(event) => void listen(event)}
      >
        <span aria-hidden="true">🔊</span>
        {!compact && <span className="sr-only">{speed === 'slow' ? 'Yavaş' : speed === 'fast' ? 'Hızlı' : 'Dinle'}</span>}
      </button>
      {unavailable && <span className="text-xs text-ink-faint">Telaffuz şu anda kullanılamıyor.</span>}
    </span>
  );
}

/** Eski çağrılar için isim uyumu; tüm yüzeyler aynı ses yaşam döngüsünü kullanır. */
export const AudioButton = PronunciationButton;
