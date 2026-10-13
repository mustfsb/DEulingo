/**
 * Aktif çalışma saati: `enabled` iken görünür + boşta olmayan süreyi toplar
 * ve `onAdd(saniye)` ile bildirir. Kurallar `lib/study-time.ts` içindedir.
 */

import { useEffect, useRef } from 'react';
import {
  allowAway, createClock, hideClock, interactClock, showClock, takeAwayAllowance, tickClock, type ClockState,
} from '../lib/study-time';

const TICK_MS = 5_000;
/** Depoya yazmadan önce biriktirilecek en az süre. */
const FLUSH_SECONDS = 15;

export function useStudyClock(enabled: boolean, onAdd: (seconds: number) => void): void {
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;
    let clock: ClockState = createClock(Date.now(), document.visibilityState !== 'hidden');
    let pendingMs = 0;

    const flush = (force: boolean) => {
      const seconds = Math.floor(pendingMs / 1000);
      if (seconds <= 0 || (!force && seconds < FLUSH_SECONDS)) return;
      pendingMs -= seconds * 1000;
      onAddRef.current(seconds);
    };
    const apply = (result: { state: ClockState; addMs: number }, force = false) => {
      clock = result.state;
      pendingMs += result.addMs;
      flush(force);
    };
    const onTick = () => apply(tickClock(clock, Date.now()));
    const onInteract = () => {
      apply(tickClock(clock, Date.now()));
      clock = interactClock(clock, Date.now());
    };
    const onVisibility = () => {
      const now = Date.now();
      if (document.visibilityState === 'hidden') {
        const away = takeAwayAllowance();
        if (away > 0) clock = allowAway(clock, away);
        apply(hideClock(clock, now), true);
      } else {
        apply(showClock(clock, now));
      }
    };
    const onPageHide = () => apply(tickClock(clock, Date.now()), true);

    const interval = window.setInterval(onTick, TICK_MS);
    const events: Array<keyof DocumentEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    for (const name of events) document.addEventListener(name, onInteract, { passive: true, capture: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      for (const name of events) document.removeEventListener(name, onInteract, { capture: true });
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      apply(tickClock(clock, Date.now()), true);
    };
  }, [enabled]);
}
