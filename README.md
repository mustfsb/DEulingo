# Almanca Alıştırma

Obsidian'daki Almanca çalışma notlarını interaktif bir alıştırma uygulamasına dönüştüren
yerel (offline) web uygulaması. Duolingo'nun etkileşim modeli, senin kendi müfredatın.

```text
Obsidian Markdown ─┐
                   ├─► Node parser ─► generated/exercises.json ─► React ─► localStorage
src/content/authored ─┘
```

Müfredat **konu tabanlıdır**: 20 kanonik konu (`topic.greetings` … `topic.modal-verbs`,
`topic.vocabulary`) ders, özet, ustalık, hata ve Genel Tekrar için tek kimlik kaynağıdır.
Kasa (salt okunur) konu özetlerinin kaynağıdır; `src/content/authored/` katmanı konu
bazlı alıştırma bankalarını, kavram kaydını, Türkçe yaklaşık okunuşları ve uygulama içi
ek özet notlarını tutar. İkisi senkron sırasında birleşir ve **kapsam doğrulamasından** geçer.

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
| `npm run audit:sessions` | Her konu × mod ve her Genel Tekrar modu için 50 deterministik tohumla birincil kuyruk, aile aralığı ve hata retry denetimi yapar |
| `npm run audit:coverage` | Gün tabanlı eski envanterin (kavram / alıştırma / özet) konu modeline eksiksiz eşlendiğini denetler |

## Kaynak içerik

Kaynak klasör `content.config.json` içinde tanımlıdır ve **salt okunurdur** —
uygulama Obsidian kasasına hiçbir şey yazmaz.

```json
{
  "vaultPath": "/Users/mustafa/Library/Mobile Documents/iCloud~md~obsidian/Documents/almanca",
  "files": [
    { "path": "Konu Özetleri.md", "role": "topic-summary" },
    { "path": "Genel Tekrar Özet.md", "role": "review-summary" }
  ]
}
```

`Konu Özetleri.md` her konu için tek bir H1 bloğu taşır (bölümler H2); her H2 bölümü
`src/content/curriculum/topics.ts` içinde kararlı bir bölüm kimliğine kayıtlıdır. Konu
alıştırmaları `src/content/authored/topics/<konu>.ts` bankalarından, kümülatif Genel Tekrar
bankası (`reviewOnly`) `src/content/authored/review/` içinden gelir ve aynı kanonik konu
etiketlerini taşır. Bir alıştırmanın **birincil** konusu (`topicId`) ve kavramlarından
türetilen **ikincil** konuları (`secondaryTopicIds`) vardır: `Ich will früh aufstehen.`
hem Modalverben hem Ayrılabilen Fiiller pratiğinde görünür.

Gün yalnızca tarihî izdir (`legacyDay`); hiçbir havuz, rota, özet ya da istatistik günle
kurulmaz. Geçiş öncesi envanter `src/content/curriculum/legacy-inventory.json` içindedir;
eski gün kimliklerinin yeni konu/bölüm/kavram karşılıkları `src/content/curriculum/legacy.ts`
içindedir.

Geçici olarak başka bir klasörü denemek için: `ALMANCA_VAULT=/başka/yol npm run sync`

## Proje yapısı

```text
scripts/sync-content.ts        Node ingestion CLI (kasayı okur, JSON yazar)
src/content/types.ts           Alıştırma / kavram / konu / özet şeması
src/content/curriculum/        Kanonik müfredat haritası
  topics.ts                      20 konu, özet bölümleri, Genel Tekrar bölümü → konu eşlemesi
  legacy.ts                      eski gün kimlikleri → yeni konu/bölüm/kavram (göç ve yönlendirme)
  legacy-inventory.json          geçiş öncesi paketin salt okunur envanteri (denetim için)
src/content/authored/          Uygulama içi içerik katmanı
  concepts.ts                    kavram kaydı (kavram → bölüm → konu) + `anchor`lar
  topics/<konu>.ts               konu alıştırma bankaları (modal-verbs-bank.ts: 130 yeni soru)
  review/                        kümülatif Genel Tekrar bankası (reviewOnly, aynı konu etiketleri)
  pronunciation.ts               Türkçe yaklaşık okunuş sözlüğü + kural motoru
  summary-augmentations.ts       kaynakta eksik kalan A1 açıklamaları
src/content/parser/            Markdown → özet + alıştırma boru hattı
  document.ts                    konu (H1) / bölüm (H2) / cevap anahtarı ayrıştırma
  refine.ts                      kelime çipleri, çeldiriciler, doğrulama bayrakları
  metadata.ts                    yazılmış tanım → Exercise, okunuş bağlama
  summary.ts                     Konu Özetleri / Genel Tekrar Özet → özet verisi
  coverage.ts                    kavram ↔ özet ↔ alıştırma kapsam doğrulaması
  notes.ts                       bölüm gövdesi → not blokları
  index.ts                       boru hattı + konu üyelikleri + içerik doğrulama
src/lib/validation.ts          katmanlı cevap değerlendirici
src/lib/storage.ts             sürümlü localStorage şeması + göç + dışa/içe aktarma
src/lib/progress.ts            deneme kaydı ve türetilmiş istatistikler
src/lib/session.ts             oturum kurucusu (konu havuzu, mod, puanlama, aşama, aile aralığı)
src/lib/general-review.ts      Genel Tekrar modları + kanonik konu kartı havuzu
src/lib/mastery.ts             kavram/konu ustalığı — deneme geçmişinden TÜRETİLİR
src/lib/lesson.ts              ders kuyruğu, aralıklı tekrar
src/lib/session-result.ts      ders sonucu (LessonResult), hata tekrarı kuyruğu, ders kapanışı
src/lib/streak.ts              ders içi doğru serisi ve kutlama eşikleri
src/lib/daily-goal.ts          günlük hedef sayacı (yerel takvim günü)
src/lib/recommendation.ts      "bugün ne yapmalıyım" — deterministik öneri
src/lib/motion.ts              hareket belirteçleri + `prefers-reduced-motion`
src/lib/router.ts              konu rotaları + gün tabanlı eski bağlantıların yönlendirmesi
src/screens/                   Dersler (konu kartları), konu, ders, Özetler, Genel Tekrar, hatalar, istatistik, denetim
generated/exercises.json       üretilen içerik (`npm run sync` yeniden üretir)
```

## Kavram kapsamı

Her alıştırma en az bir **kavrama**, her kavram bir **özet bölümüne**, her bölüm bir
**konuya** bağlıdır. Senkron sırasında şunlar **hata** verir (derleme kırmızı yanar):

| Kod | Anlamı |
|---|---|
| `unknown-concept` / `unknown-topic` | Alıştırma kayıtta olmayan bir kavrama ya da konuya atıfta bulunuyor |
| `concept-without-summary` | Kavramın `anchor`'ı kendi bölümünün özet metninde bulunamadı |
| `prerequisite-not-learned` | Öğrenilmiş bir kavram henüz öğrenilmemiş (`planned`) bir ön koşula dayanıyor |
| `summary-topic-missing` / `summary-section-missing` | Kayıtlı konu ya da bölüm kaynak dosyada yok |
| `unregistered-section` | Kaynaktaki bölüm başlığı kararlı bir kimliğe kayıtlı değil |
| `day-language` | Öğrenciye görünen alıştırma metni "N. Gün" dili taşıyor |
| `near-duplicate-exercise` | Aynı konu havuzunda normalize soru/cevap çifti tekrar ediyor |

Böylece "Özet'i çalıştım ama alıştırma açıklanmamış bir şey soruyor" durumu, kaynak
Markdown değiştiğinde bile yakalanır.

## Öğrenme akışı

```text
Özeti Oku → Normal Çalışma → Yanlışları Gör → Konuyu Tekrar Aç
          → Hızlı Tekrar → Zor Sorular → tekrar
```

### Oturum yaşam döngüsü

```text
Konu → oturum kurulumu → aktif ders → SONUÇ (#/sonuc) → devam eylemi
```

Ders bitince yapılı bir **`LessonResult`** üretilir (`src/lib/session-result.ts`) ve kalıcı
ilerlemeye `lastResult` olarak yazılır. Tamamlanma ekranı yalnızca bunu tüketir; bu yüzden
sayfa yenilense de sonuç, hatalar ve challenge bağlamı kaybolmaz. Devam eylemleri gerçek
rotalar açar:

| Eylem | Rota | Kaynağı |
|---|---|---|
| Hataları Tekrarla | `#/hata-tekrari` | O oturumun yanlışları, atlananları, ısrarlı yazım hataları |
| Zor Sorular | `#/ders/<konu>/zor` | Aynı konunun üretim ağırlıklı zor havuzu |
| Sıradaki Konu | `#/konu/<konu>` | Haritada sıradaki konu varsa gösterilir (konular istenen sırayla çalışılabilir) |

Diğer rotalar: `#/konu/<konu>` (konu sayfası), `#/ders/<konu>/<normal|tam|hizli|zor>`,
`#/ders/<konu>/bolum/<bölüm>` (bölüm pratiği), `#/ozet/<konu>(/<bölüm>)`, `#/ozet/genel`.
Eski gün bağlantıları (`#/gun/10`, `#/ders/7/tam`, `#/ozet/3/private.day3.yer-yon`,
`#/hata-tekrari/2`) karşılık gelen konu ekranına yönlenir ve adres çubuğu yeni biçimle
değiştirilir.

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

Havuz ile oturum ayrıdır: konu havuzundan (birincil + ikincil etiketli ders alıştırmaları)
her çalışmada farklı ama yapılandırılmış bir seçki kurulur (Normal ~18–22, Tam ~45–52,
Hızlı ~8–10, Zor ~12–18, Bölüm ~12); konunun kendi alıştırmaları öncelik alır, küçük
havuzlarda tek bir aile oturumu dolduramaz. Genel Tekrar bankası (298 kümülatif soru)
konu ders havuzlarından ayrıdır ve konu oturum sayacını etkilemez (Karışık 28, Kelime 24,
Cümle 24, Writing 7, Dinleme 16, Hızlı 12, Zor 22). Genel Tekrar konu kartı (20 soru) aynı
kanonik konuyu kullanır: önce o konunun Genel Tekrar soruları, sonra ders soruları.
Birincil sıra oturum başında örneklemesiz tekrar olmadan tamamen kurulur; yanlış bir soru
en az üç farklı sorudan sonra, en fazla bir kez ve açık `mistake-retry` gerekçesiyle dönebilir.

### Kelime bankası çevirileri

**Tam Çalışma**, öğretilmiş kalıpları iki yönde, görünür metin alanı olmadan kelime
tile'larıyla kurduran `word-bank-translation` sorularını içerir: Almanca → Türkçe ve
Türkçe → Almanca. Tile'a tıklamak onu cevaba taşır; seçilmiş tile'a tıklamak geri verir.
Klavye ile kelimeyi yazmak aynı tile'ı seçer; `Backspace` önce görünmez eşleştirme
buffer'ını, boşsa son tile'ı siler. `Enter` önce tam eşleşmeyi, cevap tamamlandığında
kontrolü çalıştırır.

## İlerleme verisi

Tüm ilerleme tarayıcıda `localStorage` içinde, `almanca-alistirma:progress` anahtarında tutulur.
Hesap yok, sunucu yok. Alıştırma ID'leri kaynak sorudan türetilir ve cevap anahtarı
düzeltilse bile değişmez — bu yüzden içerik senkronu ilerlemeyi silmez.

İstatistik sayfasından **İlerlemeyi Dışa Aktar / İçe Aktar** ile JSON yedeği alabilirsin.
Tarayıcı verisi silinebildiği için ara ara yedek almak iyi fikir.

Şema sürümü **v10**'dur. Eski kayıtlar açılışta otomatik ve deterministik olarak taşınır.
v9 → v10 (gün → konu) göçünde: deneme geçmişi alıştırma kimliğiyle aynen kalır (ustalık ve
tamamlanma konu bazında yeniden türetilir; gün yalnızca `legacyDay` izi olur), hata
kayıtları kanonik konuya bağlanır, gün sayaçları `legacy.days` arşivine taşınır, yarım gün
dersi aynı kuyrukla tekrar oturumu olarak sürer, okundu işaretleri ve yer imleri yeni bölüm
kimliklerine eşlenir. Göç idempotenttir — `src/lib/migration.test.ts` bunu temsilî v8/v9
fixture'larıyla doğrular.

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
konu başına alıştırma sayısı, benzersiz/normalize soru sayıları, aileler, olası yakın kopyalar,
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
