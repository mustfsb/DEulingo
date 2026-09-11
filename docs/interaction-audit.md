# Etkileşim denetimi — görünen her kontrol gerçekten çalışıyor mu?

Bu dosya uygulamadaki KULLANICIYA GÖRÜNEN tüm eylemleri sayar ve her birinin
durumunu kaydeder. Yeni bir ekran/aksiyon eklendiğinde buraya da eklenir.
Otomatik koruma: `src/lib/interaction-audit.test.ts` (ölü buton taraması) ve
`src/screens/LessonCompleteScreen.test.ts` (tamamlama eylemleri).

Durum kodları: `OK` çalışıyor · `FIX` bu turda düzeltildi · `NEW` bu turda eklendi ·
`TOPIC` konu tabanlı müfredata geçişte (v10) değişti.

## Ana sayfa (`#/`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Devam Et kartı | Yarım kalan oturumun rotasına döner | OK |
| Bugün önerilen kartı | Deterministik öneri motorunun rotasını açar | NEW |
| Günlük hedef halkası | Bugünün dakikası / hedefi; hedef dolunca kutlama satırı | NEW |
| Konu kartı gövdesi | `#/konu/<konu>` (konu sayfası) | TOPIC |
| Konu kartı → Çalış | `#/ders/<konu>/normal` | TOPIC |
| Konu kartı → 📖 Özet | `#/ozet/<konu>` | TOPIC |
| Üst gezinme (Dersler / Genel Tekrar / Özetler / Hatalarım / İstatistik) | Rota değişir | TOPIC |
| Tema düğmesi | Açık ⇄ koyu, kalıcı ayara yazar | OK |
| `içerik` (yalnız DEV) | Debug ekranı | OK |

## Konu sayfası (`#/konu/<konu>`)

Eski `#/gun/N` bağlantısı o günün ana konusuna yönlenir.

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| ← Dersler | Ana sayfa | TOPIC |
| Normal / Tam / Hızlı / Zor kartları | İlgili modda konu dersi başlatır | TOPIC |
| Zor Sorular kartı | Havuz yetersizse kart devre dışı + gerekçe metni | OK |
| Bölüm başlıkları | `#/ders/<konu>/bolum/<bölüm>` (bölüm pratiği) | TOPIC |
| Bölüm → Özette aç | `#/ozet/<konu>/<bölüm>` | TOPIC |
| Özeti Oku | `#/ozet/<konu>` | TOPIC |
| Genel Tekrar'da çalış | Konunun Genel Tekrar oturumu (`gr-topic`) | TOPIC |
| Bağlantılı konular | `#/konu/<diğer konu>` | TOPIC |

## Ders (`#/ders/...`, `#/tekrar/...`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| ← (çıkış) | Sesi durdurur, konu sayfasına / Genel Tekrar'a / ana sayfaya döner | TOPIC |
| Kontrol Et / Devam | Cevabı değerlendirir, sıradakine geçer | OK |
| Atla | Kaydeder ve geçer (artık "yanlış" sayılmaz, ayrı sayılır) | FIX |
| Tamamladım (sesli görev) | Öz değerlendirme kaydı | OK |
| 🔊 dinle / `R` kısayolu | Piper telaffuzu, bağlam değişince iptal | OK |
| Enter kısayolu | Cevap varsa kontrol, geri bildirimde devam | OK |
| Kombo göstergesi (🔥 n) | Seri ≥ 2 iken görünür, artışta animasyon | NEW |
| Seri kutlaması (5/10/15) | ~1,1 sn overlay + özgün SFX, `reduced-motion` uyumlu | NEW |
| Geri bildirim → "Benim cevabım da doğruydu" | Kendi değerlendirmesi | OK |
| Geri bildirim → "… özetini aç" | İlgili özet konusu | OK |

## Ders sonucu (`#/sonuc`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Ekranın kendisi | Kalıcı `lastResult`'tan beslenir; yenilemeye dayanır | FIX |
| Hataları Tekrarla | Bu oturumun hatalarından gerçek tekrar dersi kurar | FIX |
| (hata yoksa) | Buton yok; "Mükemmel — tekrar gerekmiyor" satırı | FIX |
| Zor Sorular | Aynı konunun zorluk havuzuyla challenge dersi açar | TOPIC |
| Sıradaki Konu: … | Haritada sıradaki konu varsa konu sayfası; yoksa gösterilmez | TOPIC |
| Tekrar Çalış | Aynı konu + aynı mod (+ bölüm) yeni tohumla | TOPIC |
| Özeti Oku | Konu özeti (bölüm pratiğinde ilgili bölüm) | TOPIC |
| Zayıf konu → "konuyu çalış" | O konunun Hızlı Tekrar dersi | TOPIC |
| Ana Sayfa | `#/` | OK |

## Hatalarım (`#/hatalarim`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Hepsini Tekrar Çalış | Zayıflık sırasına göre tekrar oturumu | OK |
| Grupla: Konu / Hata türü | Listeyi yeniden gruplar | OK |
| Grup → Konuyu Çalış | O kanonik konunun Normal dersi | TOPIC |
| Grup → Özeti Aç | Özet konusuna gider (etiket netleştirildi) | FIX |
| Grup → Tekrar Çalış | Yalnızca o grubun hataları | OK |
| Tekrar eden yazım hataları → Bunları çalış | Yalnızca o kayıtlar | OK |
| Boş durum → Derse başla | Ana sayfa | OK |

## Genel Tekrar (`#/genel-tekrar`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Genel Tekrar Başlat | Konular arası karışık oturum (`gr-mixed`) | OK |
| Kelime / Cümle Kurma / Writing / Dinleme / Hızlı / Zor | Konular arası mod oturumu | OK |
| Hataları Tekrarla | Tüm konuların hatalarından tekrar | OK |
| Konu kartı → Çalış | Kanonik konunun Genel Tekrar oturumu (ikinci taksonomi yok) | TOPIC |

## Özetler (`#/ozet`, `#/ozet/<konu>`, `#/ozet/genel`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Arama | Canlı sonuç listesi | OK |
| Sonuç / konu / kaydedilen kartları | İlgili konu özetine / bölüme gider | TOPIC |
| ⭐ kaydet | Yer imi ayarı | OK |
| Konu gezinmesi (masaüstü) | Bölüme kaydırır | OK |
| Bu Konuyu Çalış | Konu dersi (Genel Tekrar özetinde: kanonik konunun tekrarı) | TOPIC |
| Bu Bölümü Çalış | Bölüm pratiği | TOPIC |
| Kendine sor | Cevabı açar/kapatır | OK |
| 🔊 örnek/okunuş | Piper telaffuzu | OK |

## İstatistik / Ayarlar (`#/istatistik`)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Görünüm (Sistem/Açık/Koyu) | Kalıcı tema | OK |
| Günlük hedef (5/10/20 dk) | Ana sayfadaki hedef halkasını sürer | NEW |
| Ses efektleri / Otomatik telaffuz / Okunuş | Kalıcı ayar | OK |
| Telaffuz sesi / hızı | Kalıcı ayar | OK |
| Dışa / İçe aktar | JSON indirir, doğrular, geri yükler | OK |
| Konuyu sıfırla / Tümünü sıfırla | Onaylı sıfırlama | TOPIC |

## Debug (`#/icerik`, yalnız DEV)

| Kontrol | Davranış | Durum |
| --- | --- | --- |
| Kavram tablolarını göster/gizle | Tabloyu açar | OK |

## Bu turda bulunan ölü/kırık etkileşimler

1. **`Hataları Tekrarla` ve `Zor Sorular` hiçbir şey yapmıyordu.** Kök neden:
   `App.tsx` hem `lesson` hem `review` rotasını `key`siz aynı `LessonScreen`
   bileşenine bağlıyordu; tamamlanma ekranı ise `LessonScreen` içindeki yerel
   `finished` state'inden geliyordu. Rota değişince React aynı bileşeni yeniden
   kullandığı için `finished` sıfırlanmıyor, ekran donuyordu (hash değişse bile).
   Çözüm: tamamlanma ayrı bir rota (`#/sonuc`) ve kalıcı `lastResult` oldu.
2. **Tamamlanma ekranı yenilenince kayboluyordu** (yerel state). Artık kalıcı.
3. **`Atla`** sonuçta "yanlış" olarak sayılıyordu; ayrı sayılıyor.
4. **Ana sayfadaki "Bugünkü hedef: 10 dakika"** sabit metindi, hiçbir şeyi
   ölçmüyordu; gerçek günlük hedef takibi eklendi.
5. **Hatalarım → "Konuyu tekrar et"** özete gidiyordu; etiket "Özeti Aç" oldu ve
   ayrıca gerçek "Konuyu Çalış" eylemi eklendi.
6. **Zor Sorular kartı** havuzu yetersiz bir günde boş oturum açabilirdi; artık
   üretim ağırlıklı havuz kurulur, gerçekten yetersizse kart devre dışı olur.
7. **Hayalet oturum** (tarayıcı QA'sinde yakalandı): ders bitip sonuç rotasına
   geçilirken ders ekranı bir an daha monte kaldığı için kurulum etkisi
   "aktif ders yok" görüp yepyeni bir 45 soruluk oturum açıyordu; ana sayfa bunu
   "yarım kalan çalışma" olarak gösteriyordu. `finishing` bayrağıyla kapatıldı;
   `src/screens/LessonScreen.test.ts` içindeki tamamlanma testi bayrak
   kaldırıldığında kırmızıya döner.

## Tarayıcıda süpürülen kontroller

`#/`, `#/gun/1`, `#/gun/3`, `#/ozet`, `#/ozet/1`, `#/hatalarim`, `#/istatistik`,
`#/icerik` ekranlarındaki 118 kontrol tek tek tıklandı: 108'i rota, DOM ya da
kalıcı durumda değişiklik üretti; 4'ü bilinçli olarak atlandı (yedekleme ve
sıfırlama gibi yıkıcı eylemler ayrı doğrulandı); geri kalan 6'sı zaten açık olan
sayfanın kendi gezinme bağlantısı ya da zaten seçili olan gruplama seçeneğidir —
bunların "hiçbir şey yapmaması" doğru davranıştır.
