import { useEffect, useRef, useState } from 'react';
import { audioController } from '../lib/audio/playback';
import { DEFAULT_GERMAN_VOICE_ID, type GermanAudioTarget, type GermanVoiceId, type SpeechSpeed } from '../lib/audio/tts';

export function PronunciationButton({
  target,
  contextId,
  speed = 'normal',
  voice = DEFAULT_GERMAN_VOICE_ID,
  compact = true,
  revealOnHover = false,
}: {
  /** Piper'a yalnızca açıkça Almanca işaretli hedef gönderilebilir. */
  target: GermanAudioTarget;
  /** Elle oynatma da aktif ekran bağlamına bağlıdır; eski ekranda kalmaz. */
  contextId: string;
  speed?: SpeechSpeed;
  /** Kullanıcının ayarlardan seçtiği, doğrulanmış Piper sesi. */
  voice?: GermanVoiceId;
  compact?: boolean;
  /** Metin/tile kapsayıcısı hover veya klavye odağındayken görünür. */
  revealOnHover?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const requestGeneration = useRef(0);

  useEffect(() => () => { requestGeneration.current += 1; }, []);

  const listen = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const generation = ++requestGeneration.current;
    setUnavailable(false);
    setPlaying(true);
    try {
      await audioController.speakGerman(contextId, target, speed, voice);
    } catch {
      if (generation === requestGeneration.current) setUnavailable(true);
    } finally {
      if (generation === requestGeneration.current) setPlaying(false);
    }
  };

  return (
    <span className={`audio-button-wrap inline-flex items-center gap-2${revealOnHover ? ' is-reveal' : ''}`}>
      <button
        type="button"
        className={`audio-button${playing ? ' is-playing' : ''}${compact ? ' is-compact' : ''}`}
        aria-label={speed === 'slow' ? 'Almanca telaffuzu yavaş dinle' : speed === 'fast' ? 'Almanca telaffuzu hızlı dinle' : 'Almanca telaffuzu dinle'}
        title={speed === 'slow' ? 'Yavaş dinle' : speed === 'fast' ? 'Hızlı dinle' : 'Almanca telaffuzu dinle'}
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
