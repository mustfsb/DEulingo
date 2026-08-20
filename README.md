# Almanca Alıştırma

Obsidian'daki Almanca çalışma notlarını interaktif bir alıştırma uygulamasına dönüştüren
yerel (offline) web uygulaması. Duolingo'nun etkileşim modeli, senin kendi müfredatın.

```text
Obsidian Markdown ─┐
                   ├─► Node parser ─► generated/exercises.json ─► React ─► localStorage
src/content/authored ─┘
```

Kasa (salt okunur) alıştırma ve özet kaynağıdır; `src/content/authored/` katmanı havuzu
genişleten alıştırmaları, kavram kaydını, Türkçe yaklaşık okunuşları ve uygulama içi ek
özet notlarını tutar. İkisi senkron sırasında birleşir ve **kapsam doğrulamasından** geçer.

## Kurulum ve çalıştırma

```bash
npm install
npm run tts:setup
npm run dev
```

`npm run dev` önce içeriği senkronlar, sonra Vite'ı başlatır (http://localhost:5183).
Geliştirme sırasında kaynak Markdown dosyaları izlenir: dosyayı Obsidian'da kaydettiğinde
alıştırmalar yeniden üretilir ve sayfa tazelenir.

| Komut | Ne yapar |
|---|---|
| `npm run sync` | Obsidian içeriğini okur, `generated/exercises.json` üretir, doğrulama raporu basar |
| `npm run dev` | Senkron + geliştirme sunucusu (Markdown izleme açık) |
| `npm run app` | Yerel uygulamayı TTS uçlarıyla başlatır (`dev` eşdeğeri) |
| `npm run build` | Senkron + tip kontrolü + üretim derlemesi |
| `npm test` | Vitest testleri |
| `npm run tts:setup` | Proje içine Piper ve Almanca sesi kurar (macOS Apple Silicon) |
| `npm run tts:check` | Piper/model durumunu denetler |
| `npm run generate:audio` | Bilinen Almanca içerik için tekrar etmeyen yerel ses cache'i üretir |
| `npm run test:tts` | Üç cümleyle gerçek Piper WAV kabul testi çalıştırır |
| `npm run audit:sessions` | Her gün/mod için 50 deterministik tohumla birincil kuyruk, aile aralığı ve hata retry denetimi yapar |

## Kaynak içerik

Kaynak klasör `content.config.json` içinde tanımlıdır ve **salt okunurdur** —
uygulama Obsidian kasasına hiçbir şey yazmaz.

```json
{
  "vaultPath": "/Users/mustafa/Library/Mobile Documents/iCloud~md~obsidian/Documents/almanca",
  "files": [
    { "path": "İlk 3 Hafta/İlk 3 Hafta Alıştırma.md", "role": "exercises" },
    { "path": "İlk 3 Hafta/İlk 3 Hafta Özet.md", "role": "summary" }
  ]
}
```

Geçici olarak başka bir klasörü denemek için: `ALMANCA_VAULT=/başka/yol npm run sync`

Yeni bir gün eklemek için tek yapman gereken Alıştırma dosyasına `# 📅 4. Gün` bölümü ve
`<details>` içinde cevap anahtarını yazmak. Parser günleri kendisi bulur ve sıralar.

## Proje yapısı

```text
scripts/sync-content.ts        Node ingestion CLI (kasayı okur, JSON yazar)
src/content/types.ts           Alıştırma / kavram / özet şeması
src/content/overrides.ts       Kurasyon katmanı (belirsiz kaynakların elle düzeltmesi)
src/content/authored/          Uygulama içi içerik katmanı
  concepts.ts                    kavram kaydı + özet konusu ID'leri + `anchor`lar
  exercises/day{1,2,3}.ts        yazılmış alıştırma havuzları
  vault-tags.ts                  kasa alıştırmalarına kavram/zorluk/beceri etiketi
  pronunciation.ts               Türkçe yaklaşık okunuş sözlüğü + kural motoru
  summary-augmentations.ts       kaynakta eksik kalan A1 açıklamaları
src/content/parser/            Markdown → alıştırma boru hattı
  document.ts                    gün / bölüm / cevap anahtarı ayrıştırma
  body.ts                        bölüm gövdesi (madde, liste, kod bloğu, ipucu)
  answers.ts                     cevap metni → cevap + alternatifler + açıklama
  extract.ts                     desen tanıyan alıştırma çıkarıcıları
  refine.ts                      kelime çipleri, çeldiriciler, doğrulama bayrakları
  metadata.ts                    yazılmış tanım → Exercise, okunuş bağlama
  summary.ts                     Özet dosyası → Özetler bölümü verisi
  coverage.ts                    kavram ↔ özet ↔ alıştırma kapsam doğrulaması
  notes.ts                       Özet dosyası → kısa tekrar notları
  index.ts                       boru hattı + içerik doğrulama
src/lib/validation.ts          katmanlı cevap değerlendirici
src/lib/storage.ts             sürümlü localStorage şeması + göç + dışa/içe aktarma
src/lib/progress.ts            deneme kaydı ve türetilmiş istatistikler
src/lib/session.ts             oturum kurucusu (mod, puanlama, aşama, aile aralığı)
src/lib/mastery.ts             kavram/konu ustalığı — deneme geçmişinden TÜRETİLİR
src/lib/lesson.ts              ders kuyruğu, aralıklı tekrar
src/lib/session-result.ts      ders sonucu (LessonResult), hata tekrarı kuyruğu, ders kapanışı
src/lib/streak.ts              ders içi doğru serisi ve kutlama eşikleri
src/lib/daily-goal.ts          günlük hedef sayacı (yerel takvim günü)
src/lib/recommendation.ts      "bugün ne yapmalıyım" — deterministik öneri
src/lib/motion.ts              hareket belirteçleri + `prefers-reduced-motion`
src/screens/                   Öğrenme yolu, gün, ders, Özetler, hatalar, istatistik, denetim
generated/exercises.json       üretilen içerik (git'e girmez, `npm run sync` yeniden üretir)
```

## Kavram kapsamı

Her alıştırma en az bir **kavrama**, her kavram bir **özet konusuna** bağlıdır. Senkron
sırasında şunlar **hata** verir (derleme kırmızı yanar):

| Kod | Anlamı |
|---|---|
| `unknown-concept` | Alıştırma kayıtta olmayan bir kavrama atıfta bulunuyor |
| `concept-without-summary` | Kavramın `anchor`'ı özet metninde bulunamadı |
| `knowledge-jump` | Alıştırma, kendi gününden sonraki bir günün kavramını istiyor |
| `summary-topic-missing` | Kayıtlı özet konusu kaynak dosyada yok |

Böylece "Özet'i çalıştım ama alıştırma açıklanmamış bir şey soruyor" durumu, kaynak
Markdown değiştiğinde bile yakalanır.

## Öğrenme akışı

```text
Özeti Oku → Normal Çalışma → Yanlışları Gör → Konuyu Tekrar Aç
          → Hızlı Tekrar → Zor Sorular → tekrar
```

### Oturum yaşam döngüsü

```text
Gün → oturum kurulumu → aktif ders → SONUÇ (#/sonuc) → devam eylemi
```

Ders bitince yapılı bir **`LessonResult`** üretilir (`src/lib/session-result.ts`) ve kalıcı
ilerlemeye `lastResult` olarak yazılır. Tamamlanma ekranı yalnızca bunu tüketir; bu yüzden
sayfa yenilense de sonuç, hatalar ve challenge bağlamı kaybolmaz. Devam eylemleri gerçek
rotalar açar:

| Eylem | Rota | Kaynağı |
|---|---|---|
| Hataları Tekrarla | `#/hata-tekrari/<gün>` | O oturumun yanlışları, atlananları, ısrarlı yazım hataları |
| Zor Sorular | `#/ders/<gün>/zor` | Aynı günün üretim ağırlıklı zor havuzu |
| Sonraki Güne Geç | `#/gun/<gün+1>` | Yalnızca sonraki gün varsa gösterilir |

Zor oturum, sesli görevleri ve kolay soruları dışarıda bırakır; tanıma görevleri
(çoktan seçmeli vb.) oturumun en fazla dörtte biri olabilir — kalanı üretim, düzeltme ve
Türkçe → Almanca kurma sorularıdır. Havuz gerçekten yetersizse kart devre dışı kalır.

### Seri ve kutlama

Ders içinde ardışık doğrular sayılır: `correct` seriyi büyütür, kabul edilen küçük yazım
hatası seriyi sürdürür (ama dersi "mükemmel" olmaktan çıkarır), yanlış ve atlama sıfırlar.
Ders içi hata tekrarı seriyi büyütmez. 5 / 10 / 15 eşiklerinde oturum başına bir kez, ~1,1
saniyelik kısa bir kutlama ve özgün bir ses efekti gelir (`public/audio/streak-*.wav`,
`npm run generate:sfx` ile üretilir). `prefers-reduced-motion` açıkken büyüme ve parçacıklar
düşer, metin geri bildirimi kalır.

### Günlük hedef

Her takvim günü için gerçek çalışma süresi (yanıt süresi + okuma payı, cevap başına en çok
90 sn) toplanır ve ana sayfadaki hedef çubuğunu sürer. Hedef süresi İstatistik ekranından
5 / 10 / 20 dakika olarak seçilir. Hesap, sunucu veya seri baskısı yoktur.

Havuz ile oturum ayrıdır: gün başına 59–76 alıştırmalık havuzdan her çalışmada farklı
ama yapılandırılmış bir seçki kurulur (Normal 18, Tam 45, Hızlı 8, Zor 12, Konu en çok 12).
Birincil sıra oturum başında örneklemesiz tekrar olmadan tamamen kurulur; yanlış bir soru
en az üç farklı sorudan sonra, en fazla bir kez ve açık `mistake-retry` gerekçesiyle dönebilir.

### Kelime bankası çevirileri

**Tam Çalışma**, öğretilmiş kalıpları iki yönde, görünür metin alanı olmadan kelime
tile'larıyla kurduran `word-bank-translation` sorularını içerir: Almanca → Türkçe ve
Türkçe → Almanca. Tile'a tıklamak onu cevaba taşır; seçilmiş tile'a tıklamak geri verir.
Klavye ile kelimeyi yazmak aynı tile'ı seçer; `Backspace` önce görünmez eşleştirme
buffer'ını, boşsa son tile'ı siler. `Enter` önce tam eşleşmeyi, cevap tamamlandığında
kontrolü çalıştırır. Tam Çalışma'da güncel/önceki-gün karışımında bu türler %20–35
bandında tutulur.

## İlerleme verisi

Tüm ilerleme tarayıcıda `localStorage` içinde, `almanca-alistirma:progress` anahtarında tutulur.
Hesap yok, sunucu yok. Alıştırma ID'leri kaynak sorudan türetilir ve cevap anahtarı
düzeltilse bile değişmez — bu yüzden içerik senkronu ilerlemeyi silmez.

İstatistik sayfasından **İlerlemeyi Dışa Aktar / İçe Aktar** ile JSON yedeği alabilirsin.
Tarayıcı verisi silinebildiği için ara ara yedek almak iyi fikir.

Şema sürümü **v7**'dir. Eski kayıtlar açılışta otomatik taşınır: denemeler, hatalar, gün
durumu ve istatistikler olduğu gibi korunur; yarım kalmış eski string kuyrukları sunum
gerekçeli kayda dönüştürülür, görünüm/ses tercihleri güvenli varsayılanlarla tamamlanır ve
v7'de yalnızca iki alan EKLENİR: son ders sonucu (`lastResult`) ile günlük hedef sayacı
(`daily`) — `src/lib/migration.test.ts` bunu gerçek bir v1 fixture'ıyla doğrular.

Yarım kalan ders de kalıcıdır: sayfa yenilendiğinde aynı kuyruk, aynı sıra, verilmiş
cevaplar ve doğru serisi geri gelir; yeni bir 20 soruluk oturum üretilmez.

Ustalık, kavram ilerlemesi ve kapsam analitiği **saklanmaz** — her zaman deneme
geçmişinden yeniden hesaplanır. Öğrenci durumu için tek kaynak vardır.

## Geliştirici denetimi

Görünen her etkileşimin ne yaptığı `docs/interaction-audit.md` dosyasında ekran ekran
listelenir. İki otomatik koruma vardır: `src/lib/interaction-audit.test.ts` ölü/yer tutucu
kontrolleri tarar, `src/screens/LessonCompleteScreen.test.tsx` ise tamamlanma ekranındaki
her eylemin gerçekten bir oturum kurduğunu ya da rota değiştirdiğini doğrular.

Geliştirme modunda üst menüdeki **içerik** bağlantısı (`#/icerik`) ayrıştırma sonucunu gösterir:
gün başına alıştırma sayısı, benzersiz/normalize soru sayıları, aileler, olası yakın kopyalar,
tipler, kaynak bölüm, beklenen cevap, kabul edilen varyantlar ve doğrulama bayrakları.
Üretim derlemesinde bu bağlantı görünmez.

## Yerel Piper telaffuzu

Uygulama Almanca için hiçbir bulut API'si kullanmaz. `npm run tts:setup`, proje altında
`.piper/venv` içine **Piper 1.7.0** ve `.piper/voices/` içine dört seçilebilir Almanca
sesi kurar. Kadın profilleri resmi orta-kalite çok konuşmacılı `de_DE-mls-medium`
modelini, erkek profilleri Thorsten modellerini kullanır. İkisi de `.gitignore`dadır; modeli değiştirmek için
`src/lib/audio/tts.ts` içindeki ses/model sürümü sabitlerini ve `scripts/tts-setup.ts`
içindeki kurulum URL'sini birlikte güncelle.

Vite geliştirme sunucusu yalnızca `127.0.0.1:5183` üzerinde `/api/tts/health`,
`/api/tts/speak` ve `/api/tts/audio/:sha256` uçlarını ekler. React yalnızca bu yerel
uçlarla konuşur; Piper ikilisi tarayıcıdan çağrılmaz. Her WAV,
`generated/audio/<sha256>.wav` altında `de_DE|voice|model-sürümü|length_scale|metin`
SHA-256 anahtarıyla önbelleğe alınır. Model/ses ya da hız profili değiştiğinde eski WAV
yanlışlıkla kullanılmaz. Cache de git dışıdır ve Obsidian kasasına hiçbir zaman yazılmaz.

İlk açılış gecikmesini önlemek için kurulumdan sonra bir kez `npm run generate:audio`
çalıştırabilirsin. Cache eksik olsa bile `npm run dev` istekte üretir. Piper yoksa ya da
çökerse ders çalışmaya devam eder; dinleme düğmesi kısa bir “Telaffuz şu anda
kullanılamıyor.” bilgisi gösterir. `npm run tts:check` tanı için ilk komuttur.

İstatistikler > Ayarlar bölümünde ses efektlerini, otomatik telaffuzu, Türkçe yaklaşık
okunuşu, dört ses profilini ve yavaş/normal/hızlı Piper hızını değiştirebilirsin.
"Normal" hız, her sesin kendi model ölçeğiyle dengelenir; Piper'a yalnızca içerikte
`de-DE` olarak işaretlenmiş Almanca hedefler verilir; Türkçe yönergeler, açıklamalar ve
yaklaşık okunuş metni seslendirilmez. Tek `AudioController`, egzersiz değişiminde oynayan
WAV'ı, gecikmeyi ve bekleyen TTS isteğini iptal eder. `R` tuşu (metin alanında değilken)
o an dinlenebilir Almanca metni yeniden oynatır.
