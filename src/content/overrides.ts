/**
 * Kurasyon katmani.
 *
 * Otomatik ayristirmanin belirsiz kaldigi (ya da kaynak metnin serbest yazilmis
 * oldugu) durumlarda kullanilir. Kaynak Obsidian dosyalari ASLA degistirilmez;
 * duzeltme her zaman burada yapilir.
 *
 * Anahtar bicimi: `gün/bölüm` veya `gün/bölüm/madde`
 */

import type { Exercise } from './types.ts';
import type { DraftExercise } from './parser/extract.ts';

export interface SectionOverride {
  mode: 'replace' | 'append';
  /** Neden gerekli oldugunun kisa aciklamasi — sync raporunda gosterilir. */
  reason: string;
  exercises: Array<Partial<DraftExercise> & { itemKey: string; type: Exercise['type'] }>;
}

export type ExercisePatch = Partial<Omit<Exercise, 'id' | 'source'>> & { reason?: string };

/** Bolum duzeyinde ekleme/degistirme. Tek müfredatta kasa alistirma dosyasi yok; bos tutulur. */
export const SECTION_OVERRIDES: Record<string, SectionOverride> = {};

/** Tek alistirma duzeyinde duzeltme. Tek müfredatta kasa alistirma dosyasi yok; bos tutulur. */
export const EXERCISE_PATCHES: Record<string, ExercisePatch> = {};

/**
 * Bolum yonergesi otomatik olarak ilk paragraftan alinir. Bolum etkilesimli bir
 * tipe donusturuldugunde ("yaz" → "seç") yonerge burada guncellenir.
 */
export const SECTION_INSTRUCTIONS: Record<string, string> = {};

/**
 * "Kendine Sor" cevap duzeltmeleri.
 *
 * Ozet dosyasinin 3. Gün cevap listesi kaynakta bir kaydirma iceriyor:
 * 1. cevap 2. soruya, 2. cevap 3. soruya karsilik geliyor ve son cevap
 * hicbir soruyla eslesmiyor. Kaynak dosya DEGISTIRILMEDEN burada duzeltilir.
 *
 * Anahtar: `gün` → soru sirasi (1 tabanli) → cevap.
 */
export const RECALL_ANSWER_FIX: Record<number, Record<number, string>> = {};

/** UI'da gunun uzerinde gosterilecek konu adlari; Ozet dosyasindan gelmezse yedek. */
export const FALLBACK_DAY_TOPICS: Record<number, string[]> = {};
