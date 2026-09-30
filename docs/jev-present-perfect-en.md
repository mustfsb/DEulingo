# Jev — Present Perfect (İngilizce) kalibrasyon notu

> Mevcut Jev altyapısı yeniden kullanılır (deterministik → uygunluk → Jev).
> Bu belge İngilizce sıkılaştırmanın niyetini kaydeder; bağlayıcı testler
> `src/lib/semantic/en-present-perfect.test.ts` içindedir.

## İlke

Jev, **geçerli anlam/kelime-sırası varyasyonunu** kabul edebilir; **o an
ölçülen Present Perfect dilbilgisini** asla affetmez. Pedagojik hedef,
anlamsal benzerlikten üstündür.

## Kabul (deterministik katmanda biter, Jev çağrılmaz)

- `I have not seen it.` ↔ `I haven't seen it.` (kısaltma normalizasyonu)
- `I've lived here …` ↔ `I have lived here …`
- Büyük/küçük harf, kıvırcık kesme işareti, sonda noktalama farkları

## Jev'e gidebilir (uygunluk: true)

- `For three years, I have lived here.` (kelime sırası hedef değilse)
- `I have seen this movie three times.` (eşanlamlı içerik kelimesi)
- `Have you seen this film before?` (doğal ek)

## Jev'e gitmez (uygunluk: false → deterministik yanlış)

- Yanlış V3: `I haven't see it.`, `She has went home.`
- Yardımcı hatası/eksikliği: `She haven't finished.`, `I seen it.`, `I know her since 2023.`
- for/since: `since three years`, `for 2024`, `from 2023` (for/since sorusunda)
- Zaman karıştırma: `I have seen him yesterday.`, `I saw this film three times.` (deneyim bağlamında)
- Olumsuzluk/ever-never değişimi

## Gerçekleştirme

- `validation.ts`: `englishContractions` bayrağı + `EN_CLOSED_SETS`
  (have/has, for/since, ever/never, V1/V2/V3 aileleri).
- `policy.ts`: `isPresentPerfectTested`, `presentPerfectFormMismatch`,
  `englishClosedGrammarSwap`; `semanticPolicyFor` sıkılaştırması.
- Yapısal tipler (MC, eşleştirme, kelime bankası, çip, dikte, sesli) Jev'e
  gitmez — Almancayla aynı matris.

## Hedef

Seçilmiş dilbilgisi durumlarında **0 yanlış kabul** (testte doğrulanır).
