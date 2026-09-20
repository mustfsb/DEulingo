# Jev Doğrulama Matrisi

Hibrit boru hattı: **yerel normalizasyon → deterministik kanonik doğrulama →
uygunluk → (gerekirse) sunucu tarafı Jev**. Jev yedektir (fallback); ilk
doğrulayıcı asla değildir.

| Alıştırma | Yerel | Jev yedeği |
|---|---|---|
| Multiple choice | evet (tam eşleşme) | asla |
| Matching | evet (çift eşleşme) | asla |
| Word bank exact order | evet (sıra eşleşme) | asla |
| Article selection (seçim) | evet | asla |
| Listen-choice | evet | asla |
| Dictation (dikte) | evet (yazım toleranslı) | asla (yazım deterministik) |
| Sentence-builder / ordering (çip) | evet | asla |
| Spoken (sesli) | öz-değerlendirme | asla |
| Approximation (yaklaşık okunuş) | evet (ses eşitliği) | asla |
| Alman­ca→Türkçe yazma (detr-type) | evet | evet |
| Türkçe→Almanca yazma (trde-type) | evet (artikel politikası) | evet (artikel politikasıyla) |
| Sentence translation (free-text) | evet | evet |
| Free sentence construction (free-text) | evet | evet |
| Fill-blank (serbest) | evet | koşullu (kapalı dilbilgisi hariç) |
| Error-correction | evet | evet |
| Clock / number parsing | evet (deterministik) | nadiren/asla |
| Perfekt auxiliary selection (tek sözcük) | evet | asla (kapalı küme) |
| Open Writing (openEnded) | mevcut politika | sınırlı (tek boolean yok) |

## Kapalı dilbilgisi kuralı

Tek sözcüklü kapalı-küme değişimleri (`der/den`, `bin/habe`, `kann/kannst`
vb.) deterministik olarak yanlıştır ve Jev'e sorulmaz. Gerekçe: maliyet,
gecikme ve pedagojik kesinlik.

## Kaynak kodu

- Politika: `src/lib/semantic/policy.ts` (`semanticPolicyFor`,
  `isSemanticFallbackEligible`, `validationMatrix`)
- Durum: `src/lib/semantic/jev-state.ts`
- Orkestrasyon: `src/lib/semantic/validate-answer.ts`
- Sunucu: `server/validate-handler.ts`, `server/jev-evaluate.ts`,
  `server/exercise-store.ts`, `api/validate-answer.ts`
