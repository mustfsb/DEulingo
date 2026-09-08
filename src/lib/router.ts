/** Kucuk hash tabanli yonlendirici — ek bagimlilik yok. Tek müfredat: rotalarda izlek yok. */

import { useCallback, useEffect, useState } from 'react';
import type { SessionMode } from './storage';
import type { ExerciseSetId } from '../content/types';
import { isExerciseSetId } from '../content/exercise-sets';

export type Route =
  | { name: 'home' }
  | { name: 'day'; day: number }
  | { name: 'lesson'; day: number; mode: SessionMode; topicId?: string; exerciseSetId?: ExerciseSetId }
  | { name: 'review' }
  | { name: 'mistake-review'; day?: number }
  | { name: 'complete' }
  | { name: 'summaries' }
  | { name: 'summary'; day: number; topicId?: string }
  | { name: 'general-review' }
  | { name: 'mistakes' }
  | { name: 'stats' }
  | { name: 'debug' };

const MODE_SLUGS: Record<string, SessionMode> = {
  normal: 'normal',
  tam: 'full',
  hizli: 'quick',
  zor: 'challenge',
  konu: 'topic',
  'genel-karisik': 'gr-mixed',
  'genel-kelime': 'gr-vocab',
  'genel-cumle': 'gr-sentence',
  'genel-yazma': 'gr-writing',
  'genel-dinleme': 'gr-listening',
  'genel-hizli': 'gr-quick',
  'genel-zor': 'gr-challenge',
  'genel-konu': 'gr-topic',
};

const SLUG_BY_MODE: Record<SessionMode, string> = {
  normal: 'normal',
  full: 'tam',
  quick: 'hizli',
  challenge: 'zor',
  topic: 'konu',
  set: 'set',
  'gr-mixed': 'genel-karisik',
  'gr-vocab': 'genel-kelime',
  'gr-sentence': 'genel-cumle',
  'gr-writing': 'genel-yazma',
  'gr-listening': 'genel-dinleme',
  'gr-quick': 'genel-hizli',
  'gr-challenge': 'genel-zor',
  'gr-topic': 'genel-konu',
};

/** Sayı değilse undefined (bozuk segment güvenli varsayılan değil, yok sayılır). */
function parseDay(segment: string | undefined): number | undefined {
  const day = Number(segment);
  return segment !== undefined && Number.isInteger(day) && day >= 1 ? day : undefined;
}

export function parseHash(hash: string): Route {
  const path = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  const [head, ...rest] = path;

  switch (head) {
    case undefined:
      return { name: 'home' };
    case 'gun': {
      // Yeni: #/gun/3 — Eski: #/gun/private/3 ya da #/gun/normal/3 (izlek yoksayılır).
      const day = parseDay(rest[rest.length - 1]);
      return { name: 'day', day: day ?? 1 };
    }
    case 'ders': {
      // Yeni: #/ders/3/zor — Eski: #/ders/private/3/zor (izlek yoksayılır).
      const segments = rest.filter((segment) => segment !== 'private' && segment !== 'normal');
      const day = parseDay(segments[0]) ?? 1;
      const second = segments[1];
      const third = segments[2];
      if (second === 'konu' && third) return { name: 'lesson', day, mode: 'topic', topicId: third };
      if (second === 'set' && isExerciseSetId(`set-${third ?? ''}`)) {
        return { name: 'lesson', day, mode: 'set', exerciseSetId: `set-${third}` as ExerciseSetId };
      }
      return { name: 'lesson', day, mode: MODE_SLUGS[second ?? 'normal'] ?? 'normal' };
    }
    case 'tekrar': {
      return { name: 'review' };
    }
    case 'genel-tekrar': {
      return { name: 'general-review' };
    }
    case 'hata-tekrari': {
      // #/hata-tekrari ya da #/hata-tekrari/2 (eski izlekli biçimler de buraya düşer).
      const day = parseDay(rest[rest.length - 1]);
      return { name: 'mistake-review', day };
    }
    case 'sonuc':
      return { name: 'complete' };
    case 'ozet': {
      // Yeni: #/ozet ya da #/ozet/3(/konu) — eski izlek segmenti yoksayılır.
      // Kümülatif özet: #/ozet/genel.
      const segments = rest.filter((segment) => segment !== 'private' && segment !== 'normal');
      if (segments.length === 0) return { name: 'summaries' };
      if (segments[0] === 'genel') return { name: 'summary', day: 0, topicId: segments[1] };
      return { name: 'summary', day: parseDay(segments[0]) ?? 1, topicId: segments[1] };
    }
    case 'hatalarim': {
      return { name: 'mistakes' };
    }
    case 'istatistik': {
      return { name: 'stats' };
    }
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
    case 'lesson': {
      const prefix = `#/ders/${route.day}`;
      if (route.mode === 'topic' && route.topicId) return `${prefix}/konu/${encodeURIComponent(route.topicId)}`;
      if (route.mode === 'set' && route.exerciseSetId) return `${prefix}/set/${route.exerciseSetId.replace('set-', '')}`;
      return `${prefix}/${SLUG_BY_MODE[route.mode]}`;
    }
    case 'review':
      return '#/tekrar';
    case 'mistake-review': {
      return route.day === undefined ? '#/hata-tekrari' : `#/hata-tekrari/${route.day}`;
    }
    case 'complete':
      return '#/sonuc';
    case 'summaries':
      return '#/ozet';
    case 'summary': {
      if (route.day === 0) {
        const base = '#/ozet/genel';
        return route.topicId ? `${base}/${encodeURIComponent(route.topicId)}` : base;
      }
      const base = `#/ozet/${route.day}`;
      return route.topicId ? `${base}/${encodeURIComponent(route.topicId)}` : base;
    }
    case 'general-review':
      return '#/genel-tekrar';
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
