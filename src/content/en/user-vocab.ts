/**
 * Öğrencinin Okuma ekranından KENDİ seçtiği kelime/öbekler.
 *
 * Bunlar İngilizce kelime envanterinin çalışma zamanı uzantısıdır: seçilen
 * her öğe `VocabEntry` biçimine çevrilir ve Kelime çalışmasının tüm
 * türlerine (İng→Tr, Tr→İng, eşleştirme, yazma, zayıf kelimeler, Genel
 * Tekrar kelime akışı) girer. Almanca envantere ASLA karışmaz: kimlikler
 * `en-uv-` önekli, kayıt İngilizce beceri deposundadır ve yalnızca
 * İngilizce cephe (`contentFor('en')`) bu listeyi görür.
 *
 * Çoklu sözcüklü öbekler (pay attention to) bütün hâlinde korunur.
 */

import type { VocabEntry, VocabType } from '../vocabulary/inventory.ts';
import { EN_VOCABULARY } from './vocab.ts';

/** Depoda saklanan biçim (skills-en → readingVocab). */
export interface SavedReadingVocab {
  /** Kararlı kimlik: `en-uv-<kebab>`. İlerleme kayıtları buna bağlıdır. */
  id: string;
  /** Öbek ya da sözcük, olduğu gibi (`pay attention to`). */
  en: string;
  tr: string;
  type: VocabType;
  /** Çok sözcüklü öbek mi (collocation/chunk)? */
  chunk: boolean;
  /** Kaynak pasaj kimliği. */
  passageId: string;
  /** Eklenme zamanı (ISO). */
  at: string;
  /**
   * Öbek kelime envanterinde ZATEN varsa o kaydın kimliği. Öğrenci seçimi saklanır
   * ama ikinci bir (kopya) çalışma kaydı açılmaz; çalışma/ustalık mevcut kayıtta yürür.
   */
  linkedId?: string;
}

export const USER_VOCAB_PREFIX = 'en-uv-';

export function userVocabId(en: string): string {
  const slug = en
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${USER_VOCAB_PREFIX}${slug || 'item'}`;
}

/** Çok sözcüklü öbek mi? */
/** "be afraid of" ↔ "afraid of", "Pay attention to" ↔ "pay attention to". */
export function normalizeChunk(en: string): string {
  return en.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(be|to) /, '');
}

const STATIC_BY_KEY = new Map(EN_VOCABULARY.map((entry) => [normalizeChunk(entry.base), entry.id]));

/** Aynı sözcük/öbek envanterde varsa kimliği. */
export function staticTwinId(en: string): string | undefined {
  return STATIC_BY_KEY.get(normalizeChunk(en));
}

export function isChunk(en: string): boolean {
  return en.trim().split(/\s+/).length > 1;
}

/** Öğeyi kelime envanteri girdisine çevirir. */
export function toVocabEntry(item: SavedReadingVocab, passageTopic?: string): VocabEntry {
  const chunk = item.chunk;
  const topicIds = [passageTopic ?? 'en.present-perfect'];
  if (chunk && !topicIds.includes('en.prepositions-collocations')) topicIds.push('en.prepositions-collocations');
  return {
    id: item.id,
    german: item.en,
    base: item.en,
    turkish: item.tr,
    type: item.type,
    topicIds,
    ttsText: item.en,
    source: `Okuma › ${item.passageId} (öğrenci seçimi)`,
    lang: 'en',
  };
}

/* ------------------------------------------------------------------ */
/* Çalışma zamanı kaydı                                                 */
/* ------------------------------------------------------------------ */

let entries: VocabEntry[] = [];
let byId = new Map<string, VocabEntry>();
let version = 0;

/** Beceri deposu her değiştiğinde çağrılır (hook + yükleme). */
export function setUserVocabulary(items: readonly SavedReadingVocab[], topicOf: (passageId: string) => string | undefined): void {
  // Envanterde zaten olan öbekler için ikinci kayıt açılmaz (kopya sorusu olmaz).
  entries = items.filter((item) => !item.linkedId).map((item) => toVocabEntry(item, topicOf(item.passageId)));
  byId = new Map(entries.map((entry) => [entry.id, entry]));
  version += 1;
}

export function getUserVocabulary(): readonly VocabEntry[] {
  return entries;
}

export function getUserVocabEntry(id: string): VocabEntry | undefined {
  return byId.get(id);
}

export function userVocabVersion(): number {
  return version;
}
