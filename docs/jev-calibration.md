# Jev Kalibrasyon Raporu

> Ham olasılıklar `docs/jev-calibration.local.json` dosyasındadır (gitignored).
> Aşağıdaki sayılar o dosyadan alınır; uydurma sayı YOKTUR.

## Yöntem

- Etiketli set: `src/lib/semantic/calibration.fixtures.ts` (152 vaka).
- Yalnızca deterministikte `incorrect` + politika-uygun vakalar Jev'e sorulur
  (85 uygun → 85 başarılı ölçüm, hata yok).
- Komut: `npm run jev:calibrate -- --full`
- Model: `typesafe-ai/jev` (Vercel AI Gateway, `experimental_evaluate`, boolean).
- Tarih: 2026-09-19. Gözlenen çalışma-içi varyans ≈ ±0.02
  (`machen-paraphrase` üç ayrı günde: 0.77 / 0.74 / 0.76).

## Eşik tablosu (n=85: 20 accept, 65 reject)

| Eşik | Doğruluk | FAR (yanlış-kabul) | FRR (yanlış-ret) | Kabul | Ret |
|---|---|---|---|---|---|
| 0.50 | 0.941 | 0.062 | 0.050 | 23 | 62 |
| 0.70 | 0.941 | 0.000 | 0.250 | 15 | 70 |
| 0.80 | 0.918 | 0.000 | 0.350 | 13 | 72 |
| 0.85 | 0.906 | 0.000 | 0.400 | 12 | 73 |
| 0.90 | 0.871 | 0.000 | 0.550 | 9 | 76 |
| 0.95 | 0.847 | 0.000 | 0.650 | 7 | 78 |

Seçilen eşik: `JEV_ACCEPT_THRESHOLD = 0.72`

Gerekçe:

- FAR=0 platosu [0.70, 0.75) aralığındadır; 0.72 bu platonun ortasıdır.
- Sınır değerler: en yüksek reject `wer-kann-order` 0.69 (bozuk kelime sırası),
  en düşük accept `schluessel-paraphrase` 0.75 ve `machen-paraphrase` 0.76.
  Her iki yöne de ≈0.03 pay bırakır.
- 0.70 de aynı örneklem istatistiğini verir ancak reject tarafı payı 0.01'e
  iner; gözlenen varyans (±0.02) karşısında 0.72 daha güvenlidir.
- FRR (0.25) bilinçli kabul edilir: yanlış ret yalnızca muhafazakâr yanlış
  demektir; kanonik cevap + alias yolu Jev'e hiç gitmediği için günlük
  akış etkilenmez.
- En riskli sınıf: 0.69 bandındaki bozuk kelime sıraları; marj dardır,
  izlenmelidir. En düşük accept'ler (`border-okula-yurudum` 0.15 gibi)
  etiketi tartışmalı sınır vakalarıdır; ret yönü güvenlidir.

## Gecikme (n=85)

- Medyan: 394ms, p95: 691ms.
- Zaman aşımı: `JEV_TIMEOUT_MS = 3000`ms; aşımda muhafazakâr deterministik yanlış.
- Hız sınırı notu: Gateway `typesafe-ai/jev` için 30 istek/dakika uygular;
  kalibrasyon betiği 2.5sn aralıkla çalışır. `maxRetries: 1`.

## Gizlilik / plan notu

- `gateway.disallowPromptTraining: true` varsayılan (hobby planda doğrulandı).
- `gateway.zeroDataRetention: true` yalnızca `JEV_ZERO_DATA_RETENTION=true`
  ise gönderilir; mevcut hobby planda Gateway bu bayrağı reddeder
  (400: "yalnızca Pro/Enterprise").
