/**
 * Seri kutlamasi (§17, §18).
 *
 * Kisitlar bilinçli: ~1,1 sn, tek renk vurgusu, basit isinsal patlama ve az
 * sayida kivilcim. Konfeti kutuphanesi, dev degrade, sinematik dizi yok.
 * `prefers-reduced-motion` acikken hareket duser ama METIN geri bildirimi kalir.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { celebrationHoldMs, prefersReducedMotion } from '../lib/motion';
import { isQuietMilestone, milestoneCopy } from '../lib/streak';

export interface StreakCelebrationProps {
  streak: number;
  /** Overlay kapandiginda cagrilir; ogrenci erken kapatabilir. */
  onDone: () => void;
}

const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

export function StreakCelebration({ streak, onDone }: StreakCelebrationProps) {
  const reduced = useMemo(prefersReducedMotion, []);
  const copy = milestoneCopy(streak);
  const quiet = isQuietMilestone(streak);
  const [closing, setClosing] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDone();
    };
    const hold = quiet ? 1400 : celebrationHoldMs(reduced);
    const timer = setTimeout(finish, hold);
    // Erken devam: herhangi bir tusa/tiklamaya basinca beklemeden kapanir.
    const dismiss = () => {
      setClosing(true);
      finish();
    };
    window.addEventListener('keydown', dismiss);
    window.addEventListener('pointerdown', dismiss);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('pointerdown', dismiss);
    };
  }, [onDone, quiet, reduced]);

  if (quiet) {
    return (
      <div className="streak-toast" role="status" aria-live="polite" data-closing={closing || undefined}>
        <span className="streak-toast-flame" aria-hidden="true">
          🔥
        </span>
        <span>
          <strong className="numeral">{streak}</strong> doğru üst üste
        </span>
      </div>
    );
  }

  return (
    <div
      className="celebration"
      data-tone={copy.tone}
      data-reduced={reduced || undefined}
      role="status"
      aria-live="assertive"
    >
      <div className="celebration-stage">
        {!reduced && (
          <>
            <span className="celebration-ring" aria-hidden="true" />
            <span className="celebration-ring celebration-ring-late" aria-hidden="true" />
            {SPARKS.map((angle) => (
              <span
                key={angle}
                className="celebration-spark"
                style={{ '--spark-angle': `${angle}deg` } as React.CSSProperties}
                aria-hidden="true"
              />
            ))}
          </>
        )}
        <p className="celebration-number numeral" aria-hidden="true">
          {streak}
        </p>
      </div>
      <p className="celebration-title">🔥 {copy.title}</p>
      <p className="celebration-subtitle">{copy.subtitle}</p>
    </div>
  );
}

/** Ilerleme cubugunun yanindaki kucuk kombo gostergesi (§21). */
export function ComboIndicator({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <span className="combo-chip" key={streak} aria-label={`${streak} doğru üst üste`}>
      <span aria-hidden="true">🔥</span>
      <span className="numeral">{streak}</span>
    </span>
  );
}
