# Almanca Alıştırma — Derinleştirme Tasarımı

**Tarih:** 2026-08-17
**Durum:** Onaylandı, uygulanıyor

Uygulamayı "Markdown alıştırma görüntüleyici"den kişisel bir Almanca öğrenme
sistemine dönüştürür. Seviye **A1 mutlak başlangıç** olarak kalır.

## Başlangıç Durumu (baseline)

| Ölçüm | Değer |
|---|---|
| Test | 71 geçti (validation 27, progress 22, parser 22) |
| Alıştırma | 59 — 1. Gün 18, 2. Gün 22, 3. Gün 19 |
| Tip dağılımı | fill-blank 21, multiple-choice 13, free-text 7, error-correction 5, sentence-builder 5, spoken 5, ordering 2, matching 1 |
| Depolama | localStorage şema v1 |
| İçerik şeması | v1 |

## Değişmeyen Kurallar

1. Obsidian kasası **salt okunur**. Hiçbir kod yoluyla yazılmaz.
2. Kasadan türeyen alıştırma ID'leri **korunur** — mevcut localStorage denemeleri
   bağlı kalır. ID imzası `naturalKey|type|prompt|instruction`; şemaya alan
   eklemek bu imzayı değiştirmez.
3. Mevcut doğrulama garantileri korunur: yazım hatası affedilir, dilbilgisi
   hatası affedilmez (`FORM_GROUPS`, `isConjugationVariant`, `CASE_CRITICAL`).
4. Öğrenci durumu için **tek kaynak**: yalnızca deneme geçmişi + ayarlar
   saklanır. Ustalık, kavram ilerlemesi ve kapsam analitiği her zaman bunlardan
   **türetilir**, ayrıca saklanmaz.
5. Öğretilmemiş bilgi hiçbir alıştırmada gerekmez. Zorluk; hatırlama, üretim,
   düzeltme, kelime sırası ve bilinen kavramları birleştirmeden gelir.

## 1. İçerik Boru Hattı

```
kasa/İlk 3 Hafta Alıştırma.md ─► parseDocument ─► taslak ─► overrides ─┐
kasa/İlk 3 Hafta Özet.md ─────► parseDocument ─► konular ──────────────┤
                                                                       ├─► parseContent()
src/content/authored/                                                  │     birleştir
  concepts.ts               kavram kaydı                               │     doğrula
  exercises/day{1,2,3}.ts   yazılmış havuzlar                          │     denetle
  vault-tags.ts             kasa alıştırmalarına kavram/zorluk etiketi │       ↓
  pronunciation.ts          küratörlü okunuş sözlüğü + kurallar        │  generated/
  summary-augmentations.ts  ek A1 açıklamaları ─────────────────────────┘  exercises.json
```

**`vault-tags.ts`** kasadan gelen 59 alıştırmayı `naturalKey` üzerinden
`conceptIds` / `difficulty` / `skill` ile zenginleştirir. ID'ye dokunmaz.

**Yazılmış ID'ler** elle, anlamlı ve konumdan bağımsızdır:
`d2-konj-du-kommst-fill`, `d3-vorstellung-woher-frei`. Havuza yeni alıştırma
eklemek mevcut hiçbir ID'yi kaydırmaz.

## 2. Kavram Omurgası

```ts
interface Concept {
  id: string;            // "day2.konjugation.du-st"
  day: number;
  topicId: string;       // "day2.fiil-cekimi" → özet konusu
  label: string;
  prerequisites?: string[];
}
```

Her alıştırma `conceptIds` taşır. Senkron sırasında **hata** üreten üç bütünlük
kontrolü:

| Kod | Anlamı |
|---|---|
| `unknown-concept` | Alıştırma kayıtta olmayan bir kavrama atıfta bulunuyor |
| `concept-without-summary` | Kavramın özet karşılığı yok (ne Obsidian ne augmentation) |
| `knowledge-jump` | Alıştırma, kendi gününden sonraki bir günün kavramını istiyor |

Uyarı (hata değil) üretenler: eksik `difficulty`, eksik `conceptIds`, tekrar eden
soru metni, beklenen yerde eksik okunuş, yetersiz konu kapsamı.

## 3. Özet Modeli

`SummaryTopic`, Özet dosyasının H2 bölümlerinden üretilir ve mevcut `NoteBlock`
birleşimini (paragraph/list/table/code/callout) yeniden kullanır — ham HTML
render edilmez.

```ts
interface SummaryDay { day; title; estimatedReadingMinutes; topics: SummaryTopic[] }
interface SummaryTopic {
  id; title; conceptIds: string[];
  blocks: NoteBlock[];        // açıklama gövdesi
  warnings: string[];         // "### ⚠️ Dikkat" alt bölümleri
  keyPoints: string[];        // "5 Dakikalık Hızlı Tekrar" maddeleri
  recallQuestions: RecallQuestion[];  // "Kendine Sor" + <details> cevapları
  examples: GermanExample[];  // Almanca örnek satırlar (+ okunuş)
  pronunciation: Pronunciation[];
}
```

Konu ID'leri açık bir tabloyla eşlenir (`SUMMARY_TOPIC_IDS`), böylece kaynaktaki
başlık yeniden yazılsa da ID sabit kalır.

**Augmentation:** Bir alıştırmanın gerektirdiği küçük açıklama özet dosyasında
yoksa ama mevcut materyalden açıkça çıkıyorsa, `summary-augmentations.ts`
içinde yerel ek not tanımlanır ve görüntülemede özetle birleştirilir. Kaynak
Markdown asla değiştirilmez. İlgisiz yeni dilbilgisi eklenmez.

## 4. Oturum Motoru

`src/lib/session.ts` — saf fonksiyonlar, `buildSession(mode, pool, progress, seed)`.

**Modlar**

| Mod | Hedef | Süre |
|---|---|---|
| `normal` | ~18 | 8–12 dk |
| `full` | havuzun tamamı | 15–25 dk |
| `quick` | ~8, hata/zayıf konu öncelikli | 3–5 dk |
| `challenge` | ~12, medium+hard | — |
| `topic` | tek konuya filtreli | — |

**Puanlama** (§33): hiç görülmemiş +5, önceden yanlış +5, tekrar eden hata +3,
zayıf konu +3, küçük yazım hatası +1, yakında doğru −2, tekrar tekrar ustalaşmış −4.

**Akış** (§31): kolay ısınma → orta hatırlama → orta uygulama → zor üretim →
hata tekrarı → kapanış güven sorusu.

**Aile aralığı** (§32): aynı `familyId`'ye sahip iki alıştırma arka arkaya
gelmez, oturuma yayılır.

**Karma tekrar** (§48): 2. günden itibaren ~%20 önceki gün kavramları.

**Determinizm:** `seed` argümanı testlerde sabit; uygulamada gün numarası +
tamamlanan oturum sayısından türer, böylece art arda oturumlar aynı diziyi
göstermez.

## 5. Ustalık (türetilmiş)

`src/lib/mastery.ts`, deneme geçmişinden `ConceptProgress` hesaplar; saklamaz.

Üretim tanıma'dan daha güçlü kanıttır (§43):

| Tip | Ağırlık |
|---|---|
| multiple-choice | 0.6 |
| matching | 0.7 |
| ordering | 0.9 |
| fill-blank | 1.0 |
| sentence-builder | 1.0 |
| error-correction | 1.2 |
| free-text | 1.3 |
| spoken | 0.5 (öz değerlendirme) |

`ConceptCoverage` de aynı şekilde bundle'dan türetilir; geliştirme denetimi için.

## 6. Depolama v2

Eklenen alanlar:

```ts
settings.showPronunciation: boolean   // varsayılan true
settings.readSummaries: Record<string, string>   // topicId → ISO tarih
settings.bookmarks: string[]                     // topicId
activeLesson.sessionMode: SessionMode
activeLesson.topicId?: string
contentVersion: string
```

`migrate()` v1→v2 yalnızca eksik varsayılanları doldurur; `exercises`,
`mistakes`, `stats`, `days` olduğu gibi taşınır. Gerçek bir v1 fixture'ı ile
test edilir.

## 7. Rotalar

```
#/                       ana sayfa
#/gun/:day               gün detayı (modlar, konu ustalığı)
#/ders/:day              normal oturum
#/ders/:day/:mode        full | hizli | zor
#/ders/:day/konu/:topic  konu oturumu
#/tekrar                 hata tekrarı
#/ozet                   Özetler dizini
#/ozet/:day              gün özeti
#/ozet/:day/:topic       konuya kaydırma
#/hatalarim  #/istatistik  #/icerik(dev)
```

Gezinme: `Öğren · Özetler · Hatalarım · İstatistik`.

## 8. Okunuş

`Pronunciation { german; turkishApproximation; note? }`.

Küratörlü sözlük önce gelir; kapsanmayan dizeler için deterministik kural motoru
(`ei→ay`, `ie→ii`, `sch→ş`, `z→ts`, `v→f`, `w→v`, sesli sonrası `h` sessiz,
kelime sonu `-er→a`, `ch` çift davranışı) devreye girer. Her zaman
**"Yaklaşık okunuş"** etiketiyle ve cevaptan **sonra** gösterilir; ikincil
görsel ağırlıkta. Kullanıcı ayarından kapatılabilir.

## 9. UI İlkeleri

Duolingo esinli yön korunur. Özet bölümü ders kitabı gibi okunur: dar ölçü,
güçlü tipografi, kompakt tablolar, katlanabilir notlar. Analitik pano hissi
verilmez; ham mühendislik istatistikleri yalnızca geliştirme denetim ekranında.

## 10. Test Kapsamı

Mevcut 71 test korunur. Eklenenler: oturum seçimi ve determinizm, zorluk
dağılımı, önceki gün karışımı, aile aralığı, kavram ustalığı, özet ayrıştırma,
özet↔kavram eşlemesi, alıştırma↔özet kapsamı, okunuş verisi, v1→v2 göçü,
yazılmış ID kararlılığı, içerik bütünlüğü (yinelenen soru/cevap, eksik alan).

## 11. Kabul Ölçütleri

- Her gün için havuz belirgin biçimde büyür (hedef ~40 / ~46 / ~44; sayı kota
  değil, kalite önce gelir).
- Zorluk dağılımı gün başına kabaca %30 / %50 / %20.
- Beş oturum modu çalışır ve havuzdan oturumu ayırır.
- Her alıştırma en az bir kavrama, her kavram bir özet açıklamasına bağlanır.
- Eski ilerleme göç sonrası kayıpsız okunur.
- `npm test` ve `npm run build` temiz geçer.
