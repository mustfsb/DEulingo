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

## Dativ politikası (`topic.dativ` ve `dativ.*` kavramları)

Jev anlamı yargılar; Dativ biçimini **asla** affetmez. Karar yolu:

| Durum | Örnek (beklenen: `Ich gehe mit meinem Freund.`) | Karar |
|---|---|---|
| Kısa biçim sorusu (≤2 sözcük) | `mit ___ Freund` → `den` | deterministik, Jev yok |
| Yanlış artikel / iyelik / zamir / çoğul -n | `Ich gehe mit mein Freund.` | deterministik ret (hâl imzası farklı), Jev yok |
| Yanlış edat | `Ich komme von der Türkei.` | deterministik ret, Jev yok |
| Kısaltmanın açık yazımı (kısaltma test edilmiyorsa) | `Ich gehe zu dem Arzt.` | deterministik kabul (`acceptedAnswers`) |
| Kısaltmayı test eden biçim sorusu | `Ich gehe ___ Supermarkt.` → `zu dem` | deterministik ret |
| Geçerli kelime sırası, aynı Dativ biçimleri | `Mit meinem Freund gehe ich.` | Jev (kabul beklenir) |
| Dativ doğru, anlam farklı | `Ich gehe mit meinem Vater.` | Jev (ret beklenir) |

- **Hâl imzası** (`caseSignature`): artikel, `ein/kein`, iyelik, zamir ve edat
  biçimlerinin sıralı çoklu kümesi; kısaltmalar açılır (`zum` = `zu dem`).
  Kelime sırası imzayı değiştirmez, yanlış hâl biçimi değiştirir.
- İsim eki (`Freunde` ↔ `Freunden`, `Kinder` ↔ `Kindern`) de deterministik
  olarak yakalanır.
- Cümle düzeyindeki Dativ üretimlerinde yazım toleransı **sözcük başınadır**
  (`strictTokenTypos`): `Zug` ↔ `Bus`, `spiele` ↔ `spreche` yazım hatası sayılmaz.
- Jev durumu `dative_case, article_form, possessive_form, dative_preposition`
  kavramlarını ve Dativ'e özel izin/yasak listesini taşır; Dativ kuralları
  kesmeden (8/10 öğe) etkilenmesin diye listelerin başındadır.

## Kaynak kodu

- Politika: `src/lib/semantic/policy.ts` (`semanticPolicyFor`,
  `isSemanticFallbackEligible`, `validationMatrix`)
- Durum: `src/lib/semantic/jev-state.ts`
- Orkestrasyon: `src/lib/semantic/validate-answer.ts`
- Sunucu: `server/validate-handler.ts`, `server/jev-evaluate.ts`,
  `server/exercise-store.ts`, `api/validate-answer.ts`
