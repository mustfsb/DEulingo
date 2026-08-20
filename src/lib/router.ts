/** Kucuk hash tabanli yonlendirici — ek bagimlilik yok. */

import { useCallback, useEffect, useState } from 'react';
import type { SessionMode } from './storage';
import type { ExerciseSetId } from '../content/types';
import { isExerciseSetId } from '../content/exercise-sets';

export type Route =
  | { name: 'home' }
  | { name: 'day'; day: number }
  | { name: 'lesson'; day: number; mode: SessionMode; topicId?: string; exerciseSetId?: ExerciseSetId }
  | { name: 'review' }
  /** Biten bir dersin hatalarindan kurulan hedefli tekrar (§4). */
  | { name: 'mistake-review'; day?: number }
  /** Ders sonucu — kalici `lastResult`'tan beslenir, yenilemeye dayanir (§14). */
  | { name: 'complete' }
  | { name: 'summaries' }
  | { name: 'summary'; day: number; topicId?: string }
  | { name: 'mistakes' }
  | { name: 'stats' }
  | { name: 'debug' };

const MODE_SLUGS: Record<string, SessionMode> = {
  normal: 'normal',
  tam: 'full',
  hizli: 'quick',
  zor: 'challenge',
  konu: 'topic',
};

const SLUG_BY_MODE: Record<SessionMode, string> = {
  normal: 'normal',
  full: 'tam',
  quick: 'hizli',
  challenge: 'zor',
  topic: 'konu',
  set: 'set',
};

export function parseHash(hash: string): Route {
  const path = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  const [head, first, second, third] = path;

  switch (head) {
    case undefined:
      return { name: 'home' };
    case 'gun':
      return { name: 'day', day: Number(first) || 1 };
    case 'ders': {
      const day = Number(first) || 1;
      // `#/ders/2/konu/day2.fiil-cekimi` ya da `#/ders/2/zor`
      if (second === 'konu' && third) return { name: 'lesson', day, mode: 'topic', topicId: third };
      if (second === 'set' && isExerciseSetId(`set-${third ?? ''}`)) {
        return { name: 'lesson', day, mode: 'set', exerciseSetId: `set-${third}` as ExerciseSetId };
      }
      return { name: 'lesson', day, mode: MODE_SLUGS[second ?? 'normal'] ?? 'normal' };
    }
    case 'tekrar':
      return { name: 'review' };
    case 'hata-tekrari':
      return { name: 'mistake-review', day: first === undefined ? undefined : Number(first) || undefined };
    case 'sonuc':
      return { name: 'complete' };
    case 'ozet':
      if (first === undefined) return { name: 'summaries' };
      return { name: 'summary', day: Number(first) || 1, topicId: second };
    case 'hatalarim':
      return { name: 'mistakes' };
    case 'istatistik':
      return { name: 'stats' };
    case 'icerik':
      return { name: 'debug' };
    default:
      return { name: 'home' };
  }
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'day':
      return `#/gun/${route.day}`;
    case 'lesson':
      return route.mode === 'topic' && route.topicId
        ? `#/ders/${route.day}/konu/${encodeURIComponent(route.topicId)}`
        : route.mode === 'set' && route.exerciseSetId
          ? `#/ders/${route.day}/set/${route.exerciseSetId.replace('set-', '')}`
        : `#/ders/${route.day}/${SLUG_BY_MODE[route.mode]}`;
    case 'review':
      return '#/tekrar';
    case 'mistake-review':
      return route.day === undefined ? '#/hata-tekrari' : `#/hata-tekrari/${route.day}`;
    case 'complete':
      return '#/sonuc';
    case 'summaries':
      return '#/ozet';
    case 'summary':
      return route.topicId
        ? `#/ozet/${route.day}/${encodeURIComponent(route.topicId)}`
        : `#/ozet/${route.day}`;
    case 'mistakes':
      return '#/hatalarim';
    case 'stats':
      return '#/istatistik';
    case 'debug':
      return '#/icerik';
  }
}

export function useRoute(): { route: Route; navigate: (route: Route) => void } {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const href = hrefFor(next);
    if (window.location.hash === href) setRoute(next);
    else window.location.hash = href;
    window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate };
}
