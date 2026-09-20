/**
 * Semantik karar önbelleği.
 *
 * Anahtar: hash(exerciseId + expectedAnswerVersion + normalizedUserAnswer
 * + semanticPolicyVersion). Geçici hatalar (timeout/hata) asla
 * önbelleğe yazılmaz; yalnızca başarılı Jev değerlendirmeleri saklanır.
 */

import { normalizeAnswer } from '../validation';

export const SEMANTIC_CACHE_VERSION = 'jev-v1';
export const SEMANTIC_POLICY_VERSION = 'policy-v1';

function fnv1a(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export interface SemanticCacheKeyParts {
  exerciseId: string;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  userAnswer: string;
}

export function semanticCacheKey(parts: SemanticCacheKeyParts): string {
  const normalizedUser = normalizeAnswer(parts.userAnswer);
  const expectedVersion = fnv1a(
    [parts.expectedAnswer, ...(parts.acceptedAnswers ?? [])].join(''),
  );
  return [
    'sem',
    SEMANTIC_CACHE_VERSION,
    SEMANTIC_POLICY_VERSION,
    parts.exerciseId,
    expectedVersion,
    fnv1a(normalizedUser),
  ].join(':');
}

export interface CachedSemanticDecision {
  /** Jev boolean P(true). */
  probability: number;
  /** Eşik uygulanmış karar. */
  accepted: boolean;
  storedAt: number;
}

const MAX_ENTRIES = 500;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const memory = new Map<string, CachedSemanticDecision>();

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

const STORAGE_PREFIX = 'jev-sem-cache:';

export function getCachedDecision(key: string): CachedSemanticDecision | null {
  const mem = memory.get(key);
  if (mem && Date.now() - mem.storedAt < TTL_MS) return mem;
  if (mem) memory.delete(key);
  const store = storage();
  if (store) {
    try {
      const raw = store.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedSemanticDecision;
        if (Date.now() - parsed.storedAt < TTL_MS && Number.isFinite(parsed.probability)) {
          memory.set(key, parsed);
          return parsed;
        }
        store.removeItem(STORAGE_PREFIX + key);
      }
    } catch {
      // Önbellek okuma hatası sessizce yok sayılır.
    }
  }
  return null;
}

/** Yalnızca başarılı değerlendirmeleri sakla (timeout/hata çağrılmaz). */
export function setCachedDecision(key: string, decision: Omit<CachedSemanticDecision, 'storedAt'>): void {
  const value: CachedSemanticDecision = { ...decision, storedAt: Date.now() };
  memory.set(key, value);
  if (memory.size > MAX_ENTRIES) {
    const oldest = memory.keys().next().value;
    if (oldest) memory.delete(oldest);
  }
  const store = storage();
  if (store) {
    try {
      store.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Kota dolarsa sessizce geç.
    }
  }
}

export function clearSemanticCache(): void {
  memory.clear();
  const store = storage();
  if (store) {
    try {
      const doomed: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k?.startsWith(STORAGE_PREFIX)) doomed.push(k);
      }
      doomed.forEach((k) => store.removeItem(k));
    } catch {
      // Yok say.
    }
  }
}
