# Kelime Bankası ve Piper Yaşam Döngüsü Uygulama Planı

**Goal:** Tam Çalışma’ya müfredata bağlı Almanca-Türkçe kelime-bankası çevirileri eklemek ve Piper oynatmayı egzersiz bağlamına bağlı, iptal edilebilir tek bir denetleyicide toplamak.

**Architecture:** `word-bank-translation`, kimlikli hedef/distractor tokenlarını ve iki yönü taşır; yalnızca `full` oturumu bu türü anlamlı bir oranda seçer. Tüm TTS hedefleri açık `GermanAudioTarget` metadatasıdır. `AudioController`, context ID + generation + AbortController + timer + tek HTMLAudio ile stale callbackleri geçersizleştirir.

## Constraints

- TTS’ye yalnızca `GermanAudioTarget` gönderilebilir; metin sezgisi dil yetkisi değildir.
- Turkish-to-German sorularda gizli Almanca hedef cevap önceden seslendirilmez.
- Eski localStorage ilerlemesi korunur; yeni ayar alanı gerekmedikçe şema artırılmaz.
- Kelime bankası görünür text input kullanmaz; klavye yalnızca tile’ları denetler.

## Tasks

1. Kelime-bankası veri şeması, normalleştirme ve validator için kırmızı birim testleri yaz; type/default/mastery/validation kodunu yeşile getir.
2. `WordBankView` ile token ID’li mouse ve görünmez klavye etkileşimini test-önce uygula; cleanup ve Enter davranışını kapsa.
3. İlk üç güne her yön için müfredata bağlı çeviri içerikleri ekle; Full oturum seçimini %20–35 bantta karışık hâle getir ve session testlerini ekle.
4. Stale fetch, gecikmiş feedback, aktif oynatma, abort ve hızlı replay için kırmızı yarış testleri yaz; AudioController’ı tek context sahibi olarak yeniden kur.
5. Açık Almanca audio metadata’sını içerik/özet/ders düğmelerine geçir; ses parametre/cache identity’sini güncelle; voice sample ve tüm doğrulamaları çalıştır.
