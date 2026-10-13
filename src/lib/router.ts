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
import { EN_SECTION_BY_ID, EN_TOPIC_BY_ID, EN_TOPIC_BY_SLUG } from '../content/en/topics';
import { EN_PRACTICE_SET_BY_ID } from '../content/en/practice-sets';
import { EN_LISTENING_BY_ID, EN_LISTENING_FOCUS_TAGS } from '../content/en/skills-listening';
import { EN_EXTERNAL_LISTENING_BY_ID } from '../content/en/skills-listening-external';
import { EN_SPEAKING_BY_ID, EN_SPEAKING_FOCUS_TAGS, type SpeakingKind } from '../content/en/skills-speaking';
import { EN_WRITING_BY_ID } from '../content/en/skills-writing';
import { LEGACY_SECTION_MAP, legacyDayTopic } from '../content/curriculum/legacy';

/** Derin baglanti filtreleri (ekran ici filtrelerle ayni kume). */
export type ListeningKindFilter = 'short' | 'dictation' | 'ielts';
export type ReadingFilter = 'short' | 'ielts';

export type Route =
  | { name: 'home' }
  | { name: 'topic'; topicId: string }
  /** `all`: bölüm/set havuzunun TAMAMI tek oturumda (haftalık plan). */
  | { name: 'lesson'; topicId: string; mode: SessionMode; sectionId?: string; all?: boolean }
  | { name: 'review' }
  | { name: 'mistake-review' }
  | { name: 'complete' }
  | { name: 'summaries' }
  | { name: 'summary'; topicId: string; sectionId?: string }
  | { name: 'review-summary'; sectionId?: string }
  | { name: 'general-review' }
  | { name: 'mistakes'; scope?: 'week1' }
  | { name: 'stats' }
  | { name: 'vocab' }
  | { name: 'vocab-list' }
  | { name: 'vocab-study'; kind: string; topicId?: string; size?: string }
  | { name: 'reading'; filter?: ReadingFilter }
  | { name: 'reading-passage'; passageId: string; view?: 'review' }
  | { name: 'reading-intro' }
  | { name: 'reading-vocab' }
  | { name: 'writing'; taskId?: string; stage?: 'rewrite' }
  | { name: 'listening'; topicId?: string; kind?: ListeningKindFilter; focus?: string; itemId?: string }
  | { name: 'listening-task'; taskId: string }
  | { name: 'speaking'; kind?: SpeakingKind; promptId?: string; topicId?: string; focus?: string; retry?: boolean }
  | { name: 'weekly' }
  | { name: 'weekly-analysis' }
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

/** Kelime çalışması türleri (ekran `lib/vocab/questions.ts` ile aynı kümeyi kullanır). */
const VOCAB_KINDS = new Set([
  'mixed', 'detr', 'trde', 'match', 'type', 'listen', 'weak', 'flash', 'marathon', 'topic',
]);

const VOCAB_SIZES = new Set(['quick', 'normal', 'full', 'marathon']);

/** Sayı değilse undefined (bozuk segment güvenli varsayılan değil, yok sayılır). */
function parseLegacyDay(segment: string | undefined): number | undefined {
  const day = Number(segment);
  return segment !== undefined && /^\d+$/.test(segment) && Number.isInteger(day) && day >= 1 ? day : undefined;
}

/** Slug ya da kanonik kimlik → kanonik konu kimliği (önce Almanca, sonra İngilizce). */
function topicFromSegment(segment: string | undefined): string | undefined {
  if (!segment) return undefined;
  return (
    TOPIC_BY_SLUG.get(segment)?.id ??
    (TOPIC_BY_ID.has(segment) ? segment : undefined) ??
    EN_TOPIC_BY_SLUG.get(segment)?.id ??
    (EN_TOPIC_BY_ID.has(segment) ? segment : undefined)
  );
}

function slugFor(topicId: string): string {
  return TOPIC_BY_ID.get(topicId)?.slug ?? EN_TOPIC_BY_ID.get(topicId)?.slug ?? topicId;
}

/** Bölüm kimliği → konu + bölüm (önce Almanca, sonra İngilizce özet bölümleri). */
function sectionFromSegment(
  topicId: string,
  segment: string | undefined,
  allowSets = false,
): { topicId: string; sectionId: string } | undefined {
  if (!segment) return undefined;
  const de = SECTION_BY_ID.get(segment);
  if (de && de.topicId === topicId) return { topicId, sectionId: de.id };
  const en = EN_SECTION_BY_ID.get(segment);
  if (en && en.topicId === topicId) return { topicId, sectionId: en.id };
  const set = allowSets ? EN_PRACTICE_SET_BY_ID.get(segment) : undefined;
  if (set && set.topicId === topicId) return { topicId, sectionId: set.id };
  return undefined;
}

/** Eski gün bölümü kimliği (`private.day3.yer-yon`) → yeni bölüm. */
function legacySection(id: string | undefined): { topicId: string; sectionId: string } | undefined {
  if (!id) return undefined;
  const mapped = LEGACY_SECTION_MAP[id] ?? (SECTION_BY_ID.has(id) ? id : undefined);
  const section = mapped ? SECTION_BY_ID.get(mapped) : undefined;
  return section ? { topicId: section.topicId, sectionId: section.id } : undefined;
}

const stripTrack = (segments: string[]) => segments.filter((segment) => segment !== 'private' && segment !== 'normal');

/**
 * Dinleme derin baglantisi: `#/dinleme[/konu/<slug>][/tur/<kisa|dikte|ielts>][/odak/<odak>][/parca/<parca>]`.
 * Bilinmeyen degerler sessizce dusurulur; rota her zaman gecerli bir
 * dinleme kapsamina iner (en kotu: filtresiz ev).
 */
function parseListeningRoute(rest: string[]): Route {
  // `#/dinleme/gorev/<kimlik>`: gerçek sesli dış dinleme görevi.
  if (rest[0] === 'gorev') {
    return rest[1] && EN_EXTERNAL_LISTENING_BY_ID.has(rest[1]) ? { name: 'listening-task', taskId: rest[1] } : { name: 'listening' };
  }
  let topicId: string | undefined;
  let kind: ListeningKindFilter | undefined;
  let focus: string | undefined;
  let itemId: string | undefined;
  for (let i = 0; i + 1 < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (key === 'konu') {
      const topic = topicFromSegment(value);
      if (topic && EN_TOPIC_BY_ID.has(topic)) topicId = topic;
    } else if (key === 'tur') {
      if (value === 'kisa') kind = 'short';
      else if (value === 'dikte') kind = 'dictation';
      else if (value === 'ielts') kind = 'ielts';
    } else if (key === 'odak') {
      if (EN_LISTENING_FOCUS_TAGS.includes(value)) focus = value;
    } else if (key === 'parca') {
      if (EN_LISTENING_BY_ID.has(value)) itemId = value;
    }
  }
  const route: Extract<Route, { name: 'listening' }> = { name: 'listening' };
  if (topicId) route.topicId = topicId;
  if (kind) route.kind = kind;
  if (focus) route.focus = focus;
  if (itemId) route.itemId = itemId;
  return route;
}

const SPEAKING_KINDS: SpeakingKind[] = ['read-aloud', 'shadowing', 'short-answer', 'topic', 'ielts-part1'];

/**
 * Konusma derin baglantisi: `#/konusma[/tur/<tur>][/istem/<istem>]`.
 * Gecersiz tur/istem dusurulur; istem gecerliyse turle celisse bile
 * istem acilir (en ozel hedef kazanir).
 */
function parseSpeakingRoute(rest: string[]): Route {
  let kind: SpeakingKind | undefined;
  let promptId: string | undefined;
  let topicId: string | undefined;
  let focus: string | undefined;
  let retry = false;
  for (let i = 0; i + 1 < rest.length; i += 2) {
    const key = rest[i];
    const value = rest[i + 1];
    if (key === 'tur') {
      if ((SPEAKING_KINDS as string[]).includes(value)) kind = value as SpeakingKind;
    } else if (key === 'istem') {
      if (EN_SPEAKING_BY_ID.has(value)) promptId = value;
    } else if (key === 'konu') {
      const topic = topicFromSegment(value);
      if (topic && EN_TOPIC_BY_ID.has(topic)) topicId = topic;
    } else if (key === 'odak') {
      if (EN_SPEAKING_FOCUS_TAGS.includes(value)) focus = value;
    } else if (key === 'tekrar') {
      retry = value === '1';
    }
  }
  const route: Extract<Route, { name: 'speaking' }> = { name: 'speaking' };
  if (kind) route.kind = kind;
  if (promptId) route.promptId = promptId;
  if (topicId) route.topicId = topicId;
  if (focus) route.focus = focus;
  if (retry) route.retry = true;
  return route;
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
        const section = sectionFromSegment(topicId, third, true);
        return section
          ? { name: 'lesson', topicId, mode: 'section', sectionId: section.sectionId, ...(segments[3] === 'tumu' ? { all: true } : {}) }
          : { name: 'topic', topicId };
      }
      const mode = MODE_SLUGS[second ?? 'normal'];
      return { name: 'lesson', topicId, mode: mode && mode !== 'section' ? mode : 'normal' };
    }
    case 'tekrar':
      return { name: 'review' };
    case 'genel-tekrar':
      return { name: 'general-review' };
    case 'kelime': {
      if (rest[0] === 'liste') return { name: 'vocab-list' };
      if (rest[0] === 'calisma') {
        const kind = VOCAB_KINDS.has(rest[1] ?? '') ? (rest[1] as string) : 'mixed';
        const topicId = topicFromSegment(rest[2]);
        const size = VOCAB_SIZES.has(rest[3] ?? '') ? (rest[3] as string) : rest[2] && VOCAB_SIZES.has(rest[2]) ? (rest[2] as string) : undefined;
        // `#/kelime/calisma/topic/<slug>` kısayolu: kind=topic.
        if ((rest[1] === 'konu' || rest[1] === 'topic') && topicId) {
          return { name: 'vocab-study', kind: 'topic', topicId, ...(size ? { size } : {}) };
        }
        return {
          name: 'vocab-study',
          kind,
          ...(topicId ? { topicId } : {}),
          ...(size ? { size } : {}),
        };
      }
      return { name: 'vocab' };
    }
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
      const section = sectionFromSegment(topicId, segments[1]);
      return section
        ? { name: 'summary', topicId, sectionId: section.sectionId }
        : { name: 'summary', topicId };
    }
    case 'hatalarim':
      return rest[0] === 'hafta' && rest[1] === '1' ? { name: 'mistakes', scope: 'week1' } : { name: 'mistakes' };
    case 'istatistik':
      return { name: 'stats' };
    case 'okuma': {
      if (rest[0] === 'tur') {
        const filter = rest[1] === 'kisa' ? 'short' : rest[1] === 'ielts' ? 'ielts' : undefined;
        return filter ? { name: 'reading', filter } : { name: 'reading' };
      }
      if (rest[0] === 'giris') return { name: 'reading-intro' };
      if (rest[0] === 'kelime') return { name: 'reading-vocab' };
      if (rest[0]) {
        const passageId = decodeURIComponent(rest[0]);
        return rest[1] === 'inceleme'
          ? { name: 'reading-passage', passageId, view: 'review' }
          : { name: 'reading-passage', passageId };
      }
      return { name: 'reading' };
    }
    case 'yazma':
      if (rest[0] === 'gorev' && rest[1] && EN_WRITING_BY_ID.has(rest[1])) {
        return rest[2] === 'asama' && rest[3] === 'yeniden'
          ? { name: 'writing', taskId: rest[1], stage: 'rewrite' }
          : { name: 'writing', taskId: rest[1] };
      }
      return { name: 'writing' };
    case 'dinleme':
      return parseListeningRoute(rest);
    case 'konusma':
      return parseSpeakingRoute(rest);
    case 'haftalik':
      return rest[0] === 'analiz' ? { name: 'weekly-analysis' } : { name: 'weekly' };
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
      if (route.mode === 'section' && route.sectionId) return `${prefix}/bolum/${encodeURIComponent(route.sectionId)}${route.all ? '/tumu' : ''}`;
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
    case 'vocab':
      return '#/kelime';
    case 'vocab-list':
      return '#/kelime/liste';
    case 'vocab-study': {
      const base = `#/kelime/calisma/${encodeURIComponent(route.kind)}`;
      const topic = route.topicId ? `/${slugFor(route.topicId)}` : '';
      const size = route.size ? `/${route.size}` : '';
      return `${base}${topic}${size}`;
    }
    case 'mistakes':
      return route.scope === 'week1' ? '#/hatalarim/hafta/1' : '#/hatalarim';
    case 'stats':
      return '#/istatistik';
    case 'reading':
      if (route.filter === 'ielts') return '#/okuma/tur/ielts';
      if (route.filter === 'short') return '#/okuma/tur/kisa';
      return '#/okuma';
    case 'reading-passage':
      return `#/okuma/${encodeURIComponent(route.passageId)}${route.view === 'review' ? '/inceleme' : ''}`;
    case 'reading-intro':
      return '#/okuma/giris';
    case 'reading-vocab':
      return '#/okuma/kelime';
    case 'writing':
      return route.taskId
        ? `#/yazma/gorev/${encodeURIComponent(route.taskId)}${route.stage === 'rewrite' ? '/asama/yeniden' : ''}`
        : '#/yazma';
    case 'listening': {
      let href = '#/dinleme';
      if (route.topicId) href += `/konu/${slugFor(route.topicId)}`;
      if (route.kind) href += `/tur/${route.kind === 'short' ? 'kisa' : route.kind === 'dictation' ? 'dikte' : 'ielts'}`;
      if (route.focus) href += `/odak/${encodeURIComponent(route.focus)}`;
      if (route.itemId) href += `/parca/${encodeURIComponent(route.itemId)}`;
      return href;
    }
    case 'listening-task':
      return `#/dinleme/gorev/${encodeURIComponent(route.taskId)}`;
    case 'speaking': {
      let href = '#/konusma';
      if (route.topicId) href += `/konu/${slugFor(route.topicId)}`;
      if (route.kind) href += `/tur/${route.kind}`;
      if (route.focus) href += `/odak/${encodeURIComponent(route.focus)}`;
      if (route.promptId) href += `/istem/${encodeURIComponent(route.promptId)}`;
      if (route.retry) href += '/tekrar/1';
      return href;
    }
    case 'weekly':
      return '#/haftalik';
    case 'weekly-analysis':
      return '#/haftalik/analiz';
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
