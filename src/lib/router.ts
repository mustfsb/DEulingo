/**
 * Kucuk hash tabanli yonlendirici — ek bagimlilik yok.
 *
 * Rotalar KONU tabanlidir ve kararlı konu slug'larini kullanir
 * (`#/konu/modal-verbs`). Gün tabanlı eski bağlantılar (`#/gun/10`,
 * `#/ders/7/tam`, `#/ozet/3/private.day3.yer-yon`, `#/hata-tekrari/2`)
 * kırılmaz: karşılık gelen konu ekranına yönlenir ve adres çubuğu yeni
 * biçimle değiştirilir.
 */

import { useCallback, useEffect, useState } from 'react';
import type { SessionMode } from './storage';
import { SECTION_BY_ID, TOPIC_BY_ID, TOPIC_BY_SLUG, TOPICS } from '../content/curriculum/topics';
import { LEGACY_SECTION_MAP, legacyDayTopic } from '../content/curriculum/legacy';

export type Route =
  | { name: 'home' }
  | { name: 'topic'; topicId: string }
  | { name: 'lesson'; topicId: string; mode: SessionMode; sectionId?: string }
  | { name: 'review' }
  | { name: 'mistake-review' }
  | { name: 'complete' }
  | { name: 'summaries' }
  | { name: 'summary'; topicId: string; sectionId?: string }
  | { name: 'review-summary'; sectionId?: string }
  | { name: 'general-review' }
  | { name: 'mistakes' }
  | { name: 'stats' }
  | { name: 'debug' };

const MODE_SLUGS: Record<string, SessionMode> = {
  normal: 'normal',
  tam: 'full',
  hizli: 'quick',
  zor: 'challenge',
  bolum: 'section',
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
  section: 'bolum',
  'gr-mixed': 'genel-karisik',
  'gr-vocab': 'genel-kelime',
  'gr-sentence': 'genel-cumle',
  'gr-writing': 'genel-yazma',
  'gr-listening': 'genel-dinleme',
  'gr-quick': 'genel-hizli',
  'gr-challenge': 'genel-zor',
  'gr-topic': 'genel-konu',
};

const FIRST_TOPIC_ID = TOPICS[0].id;

/** Sayı değilse undefined (bozuk segment güvenli varsayılan değil, yok sayılır). */
function parseLegacyDay(segment: string | undefined): number | undefined {
  const day = Number(segment);
  return segment !== undefined && /^\d+$/.test(segment) && Number.isInteger(day) && day >= 1 ? day : undefined;
}

/** Slug ya da kanonik kimlik → kanonik konu kimliği. */
function topicFromSegment(segment: string | undefined): string | undefined {
  if (!segment) return undefined;
  return TOPIC_BY_SLUG.get(segment)?.id ?? (TOPIC_BY_ID.has(segment) ? segment : undefined);
}

function slugFor(topicId: string): string {
  return TOPIC_BY_ID.get(topicId)?.slug ?? topicId;
}

/** Eski gün bölümü kimliği (`private.day3.yer-yon`) → yeni bölüm. */
function legacySection(id: string | undefined): { topicId: string; sectionId: string } | undefined {
  if (!id) return undefined;
  const mapped = LEGACY_SECTION_MAP[id] ?? (SECTION_BY_ID.has(id) ? id : undefined);
  const section = mapped ? SECTION_BY_ID.get(mapped) : undefined;
  return section ? { topicId: section.topicId, sectionId: section.id } : undefined;
}

const stripTrack = (segments: string[]) => segments.filter((segment) => segment !== 'private' && segment !== 'normal');

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
    case 'konu': {
      const topicId = topicFromSegment(rest[0]);
      return topicId ? { name: 'topic', topicId } : { name: 'home' };
    }
    case 'gun': {
      // Eski: #/gun/3, #/gun/private/3 → o günün ana konusu.
      const day = parseLegacyDay(stripTrack(rest)[0]);
      return { name: 'topic', topicId: (day && legacyDayTopic(day)) || FIRST_TOPIC_ID };
    }
    case 'ders': {
      const segments = stripTrack(rest);
      const day = parseLegacyDay(segments[0]);
      if (day !== undefined) {
        // Eski: #/ders/3/zor, #/ders/3/konu/<eski-bölüm>, #/ders/1/set/a.
        const topicId = legacyDayTopic(day) || FIRST_TOPIC_ID;
        const [, second, third] = segments;
        if (second === 'konu') {
          const section = legacySection(third);
          return section
            ? { name: 'lesson', topicId: section.topicId, mode: 'section', sectionId: section.sectionId }
            : { name: 'lesson', topicId, mode: 'normal' };
        }
        const mode = MODE_SLUGS[second ?? 'normal'];
        return { name: 'lesson', topicId, mode: mode && !mode.startsWith('gr-') && mode !== 'section' ? mode : 'normal' };
      }
      const topicId = topicFromSegment(segments[0]);
      if (!topicId) return { name: 'home' };
      const [, second, third] = segments;
      if (second === 'bolum') {
        const section = third ? SECTION_BY_ID.get(third) : undefined;
        return section && section.topicId === topicId
          ? { name: 'lesson', topicId, mode: 'section', sectionId: section.id }
          : { name: 'topic', topicId };
      }
      const mode = MODE_SLUGS[second ?? 'normal'];
      return { name: 'lesson', topicId, mode: mode && mode !== 'section' ? mode : 'normal' };
    }
    case 'tekrar':
      return { name: 'review' };
    case 'genel-tekrar':
      return { name: 'general-review' };
    case 'hata-tekrari':
      // #/hata-tekrari — eski #/hata-tekrari/2 biçimi de buraya düşer.
      return { name: 'mistake-review' };
    case 'sonuc':
      return { name: 'complete' };
    case 'ozet': {
      const segments = stripTrack(rest);
      if (segments.length === 0) return { name: 'summaries' };
      if (segments[0] === 'genel') return { name: 'review-summary', sectionId: segments[1] };
      const day = parseLegacyDay(segments[0]);
      if (day !== undefined) {
        // Eski: #/ozet/3 ya da #/ozet/3/private.day3.yer-yon.
        const section = legacySection(segments[1]);
        if (section) return { name: 'summary', topicId: section.topicId, sectionId: section.sectionId };
        return { name: 'summary', topicId: legacyDayTopic(day) || FIRST_TOPIC_ID };
      }
      const topicId = topicFromSegment(segments[0]);
      if (!topicId) return { name: 'summaries' };
      const section = segments[1] ? SECTION_BY_ID.get(segments[1]) : undefined;
      return section && section.topicId === topicId
        ? { name: 'summary', topicId, sectionId: section.id }
        : { name: 'summary', topicId };
    }
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
    case 'topic':
      return `#/konu/${slugFor(route.topicId)}`;
    case 'lesson': {
      const prefix = `#/ders/${slugFor(route.topicId)}`;
      if (route.mode === 'section' && route.sectionId) return `${prefix}/bolum/${encodeURIComponent(route.sectionId)}`;
      return `${prefix}/${SLUG_BY_MODE[route.mode]}`;
    }
    case 'review':
      return '#/tekrar';
    case 'mistake-review':
      return '#/hata-tekrari';
    case 'complete':
      return '#/sonuc';
    case 'summaries':
      return '#/ozet';
    case 'summary': {
      const base = `#/ozet/${slugFor(route.topicId)}`;
      return route.sectionId ? `${base}/${encodeURIComponent(route.sectionId)}` : base;
    }
    case 'review-summary':
      return route.sectionId ? `#/ozet/genel/${encodeURIComponent(route.sectionId)}` : '#/ozet/genel';
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

/** Gün tabanlı eski bağlantı mı (adres çubuğu yeni biçimle değiştirilir)? */
export function isLegacyHash(hash: string): boolean {
  return /^#\/(gun|ders|ozet|hata-tekrari)\/(?:(?:private|normal)\/)?\d+(?:\/|$)/.test(hash);
}

export function useRoute(): { route: Route; navigate: (route: Route) => void } {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const canonicalize = () => {
      const hash = window.location.hash;
      const parsed = parseHash(hash);
      if (isLegacyHash(hash)) window.history.replaceState(null, '', hrefFor(parsed));
      setRoute(parsed);
    };
    canonicalize();
    window.addEventListener('hashchange', canonicalize);
    return () => window.removeEventListener('hashchange', canonicalize);
  }, []);

  const navigate = useCallback((next: Route) => {
    const href = hrefFor(next);
    if (window.location.hash === href) setRoute(next);
    else window.location.hash = href;
    window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate };
}
