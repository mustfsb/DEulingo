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

## Dativ vakaları (2026-09-24)

> Ham olasılıklar `docs/jev-calibration.dativ.local.json` (gitignored).
> Komut: `npm run jev:calibrate -- --dativ`

- Etiketli set: `src/lib/semantic/calibration.dativ.fixtures.ts` — **53 vaka**
  (20 kabul, 33 ret), gerçek Dativ alıştırmalarına bağlı. Kategoriler:
  kelime sırası 13, kısaltma 5, eşanlamlı 2, yanlış biçim 22, yanlış edat 4,
  anlam farkı 7. (Toplam set artık 205 vaka.)
- Karar yolları:
  - 26 biçim/edat hatası → **deterministik ret**, Jev'e hiç gitmez
    (her şeyi kabul eden Jev taklidiyle bile; `dativ-policy.test.ts`).
  - 5 kabul (4 kısaltma açık yazımı + 1 kabul edilen tam cümle) → deterministik kabul.
  - `Wir gehen mit meinem Freund.` (özne) → hâl imzası farklı, deterministik ret.
  - Kalan **20 vaka Jev'e gider** (13 kelime sırası + 1 eşanlamlı kabul, 6 anlam reti).

### Canlı Jev (n=20, eşik 0.72)

| Eşik | Doğruluk | FAR | FRR | Kabul | Ret |
|---|---|---|---|---|---|
| 0.50 | 1.000 | 0.000 | 0.000 | 14 | 6 |
| 0.70 | 0.950 | 0.000 | 0.071 | 13 | 7 |
| 0.80 | 0.950 | 0.000 | 0.071 | 13 | 7 |
| 0.90 | 0.900 | 0.000 | 0.143 | 12 | 8 |

- Üretim eşiğinde (0.72): geçerli alternatiflerin **13/14**'ü kabul, anlam
  hatalarının **6/6**'sı ret, **yanlış kabul 0**.
- Tek yanlış ret: `Meinen Freund sehe ich.` (Akkusativ nesne başta) 0.55 —
  muhafazakâr yön, kabul edilebilir.
- En yüksek ret olasılığı 0.04; eşik değiştirilmedi.
- Gecikme: medyan 367ms, p95 852ms.

### Savunma derinliği (tek seferlik ölçüm)

Deterministik koruma atlanıp 26 biçim/edat hatası doğrudan Jev'e soruldu
(Dativ yönergesiyle): **0/26** kabul (en yüksek `zu Berlin` 0.42, diğerleri
≤ 0.07). Yani yanlış Dativ biçimi iki bağımsız katmanda reddedilir.
