/**
 * Kelime yazma doğrulaması.
 *
 * - Büyük/küçük harf ve noktalama toleranslıdır (mevcut değerlendirici).
 * - İsimlerde kanonik cevap ARTİKELLİDİR (`der Schlüssel`).
 * - Artikel atlanırsa KISMİ doğruluk (minor-typo): "Schlüssel" → yanlış
 *   değil, ama tam doğru da değil; kanonik cevap gösterilir.
 * - YANLIŞ artikel affedilmez (`die Schlüssel` → incorrect; der/die/das
 *   aynı biçim grubundadır).
 * - Klavye toleransı (ß→ss, ä→ae…) tam doğru sayılır.
 */

import { evaluateText, type ValidationResult } from '../validation';
import { VOCAB_BY_ID } from '../../content/vocabulary/inventory';

function normalize(value: string): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de').replace(/[.!?;:,]+$/g, '');
}

export function validateVocabTyping(vocabId: string, input: string): ValidationResult {
  const entry = VOCAB_BY_ID.get(vocabId);
  if (!entry) return { status: 'incorrect', expected: '', normalizedInput: input };
  const base = evaluateText(input, entry.german, entry.aliases ?? [], { keyboardTolerance: true });
  if (base.status === 'correct' || base.status === 'incorrect') {
    // İsimde artikelsiz yazım `incorrect` döndüyse kısmi doğruluğa çevir.
    if (base.status === 'incorrect' && entry.type === 'noun') {
      const bare = normalize(entry.base);
      if (normalize(input) === bare) {
        return {
          status: 'minor-typo',
          expected: entry.german,
          normalizedInput: base.normalizedInput,
          note: 'Artikel eksik — tam cevap artikelle birlikte',
        };
      }
    }
    return base.status === 'incorrect' ? { ...base, expected: entry.german } : base;
  }
  return { ...base, expected: entry.german };
}

export function validateDetrTyping(vocabId: string, input: string): ValidationResult {
  const entry = VOCAB_BY_ID.get(vocabId);
  if (!entry) return { status: 'incorrect', expected: '', normalizedInput: input };
  const result = evaluateText(input, entry.turkish, [], {});
  return result.status === 'incorrect' ? { ...result, expected: entry.turkish } : result;
}
