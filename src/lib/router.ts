/** Kucuk hash tabanli yonlendirici — ek bagimlilik yok. */

import { useCallback, useEffect, useState } from 'react';
import type { SessionMode } from './storage';
import type { ExerciseSetId, LearningTrack } from '../content/types';
import { isExerciseSetId } from '../content/exercise-sets';
import { isLearningTrack } from '../content/types';

export type Route =
  | { name: 'home' }
  | { name: 'day'; track: LearningTrack; day: number }
  | { name: 'lesson'; track: LearningTrack; day: number; mode: SessionMode; topicId?: string; exerciseSetId?: ExerciseSetId }
  | { name: 'review'; track?: LearningTrack }
  | { name: 'mistake-review'; track?: LearningTrack; day?: number }
  | { name: 'complete' }
  | { name: 'summaries'; track?: LearningTrack }
  | { name: 'summary'; track: LearningTrack; day: number; topicId?: string }
  | { name: 'mistakes'; track?: LearningTrack }
  | { name: 'stats'; track?: LearningTrack }
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

function parseTrack(segment: string | undefined): LearningTrack | undefined {
  if (isLearningTrack(segment)) return segment;
  return undefined;
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
      // #/gun/1  or #/gun/private/1
      if (rest.length === 1) return { name: 'day', track: 'normal', day: Number(rest[0]) || 1 };
      const track = parseTrack(rest[0]);
      if (track) return { name: 'day', track, day: Number(rest[1]) || 1 };
      return { name: 'day', track: 'normal', day: Number(rest[0]) || 1 };
    }
    case 'ders': {
      // legacy: #/ders/2/konu/... or #/ders/2/zor
      // new: #/ders/private/2/konu/... or #/ders/private/2/zor
      let track: LearningTrack = 'normal';
      let idx = 0;
      const maybeTrack = parseTrack(rest[0]);
      if (maybeTrack) { track = maybeTrack; idx = 1; }
      const day = Number(rest[idx]) || 1;
      const second = rest[idx + 1];
      const third = rest[idx + 2];
      if (second === 'konu' && third) return { name: 'lesson', track, day, mode: 'topic', topicId: third };
      if (second === 'set' && isExerciseSetId(`set-${third ?? ''}`)) {
        return { name: 'lesson', track, day, mode: 'set', exerciseSetId: `set-${third}` as ExerciseSetId };
      }
      return { name: 'lesson', track, day, mode: MODE_SLUGS[second ?? 'normal'] ?? 'normal' };
    }
    case 'tekrar': {
      const track = parseTrack(rest[0]);
      return { name: 'review', track };
    }
    case 'hata-tekrari': {
      // #/hata-tekrari, #/hata-tekrari/2, #/hata-tekrari/private, #/hata-tekrari/private/2
      if (rest.length === 0) return { name: 'mistake-review' };
      if (rest.length === 1) {
        const track = parseTrack(rest[0]);
        if (track) return { name: 'mistake-review', track };
        return { name: 'mistake-review', day: Number(rest[0]) || undefined };
      }
      const track = parseTrack(rest[0]);
      if (track) return { name: 'mistake-review', track, day: rest[1] ? Number(rest[1]) || undefined : undefined };
      return { name: 'mistake-review', day: Number(rest[0]) || undefined };
    }
    case 'sonuc':
      return { name: 'complete' };
    case 'ozet': {
      if (rest.length === 0) return { name: 'summaries' };
      if (rest.length === 1) {
        // could be day or track
        const track = parseTrack(rest[0]);
        if (track) return { name: 'summaries', track };
        return { name: 'summary', track: 'normal', day: Number(rest[0]) || 1 };
      }
      // rest length >=2
      const track = parseTrack(rest[0]);
      if (track) {
        if (rest.length === 1) return { name: 'summaries', track };
        return { name: 'summary', track, day: Number(rest[1]) || 1, topicId: rest[2] };
      }
      return { name: 'summary', track: 'normal', day: Number(rest[0]) || 1, topicId: rest[1] };
    }
    case 'hatalarim': {
      const track = parseTrack(rest[0]);
      return { name: 'mistakes', track };
    }
    case 'istatistik': {
      const track = parseTrack(rest[0]);
      return { name: 'stats', track };
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
      return route.track === 'private' ? `#/gun/${route.track}/${route.day}` : `#/gun/${route.day}`;
    case 'lesson': {
      const prefix = route.track === 'private' ? `#/ders/${route.track}/${route.day}` : `#/ders/${route.day}`;
      if (route.mode === 'topic' && route.topicId) return `${prefix}/konu/${encodeURIComponent(route.topicId)}`;
      if (route.mode === 'set' && route.exerciseSetId) return `${prefix}/set/${route.exerciseSetId.replace('set-', '')}`;
      return `${prefix}/${SLUG_BY_MODE[route.mode]}`;
    }
    case 'review':
      return route.track ? `#/tekrar/${route.track}` : '#/tekrar';
    case 'mistake-review': {
      if (route.track && route.day !== undefined) return `#/hata-tekrari/${route.track}/${route.day}`;
      if (route.track) return `#/hata-tekrari/${route.track}`;
      return route.day === undefined ? '#/hata-tekrari' : `#/hata-tekrari/${route.day}`;
    }
    case 'complete':
      return '#/sonuc';
    case 'summaries':
      return route.track ? `#/ozet/${route.track}` : '#/ozet';
    case 'summary': {
      const base = route.track === 'private' ? `#/ozet/${route.track}/${route.day}` : `#/ozet/${route.day}`;
      return route.topicId ? `${base}/${encodeURIComponent(route.topicId)}` : base;
    }
    case 'mistakes':
      return route.track ? `#/hatalarim/${route.track}` : '#/hatalarim';
    case 'stats':
      return route.track ? `#/istatistik/${route.track}` : '#/istatistik';
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
