# Yerel Piper Ses Deneyimi Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Almanca alıştırmalarına tamamen yerel Piper telaffuzu, önbellek, ses geri bildirimi ve erişilebilir oynatma kontrolleri eklemek.

**Architecture:** Vite geliştirme eklentisi `127.0.0.1` üzerinde `/api/tts/*` uçlarını sağlar; metin doğrulama, SHA-256 anahtar üretimi, model çalıştırma ve proje-içi WAV önbelleği Node tarafındadır. React, Piper ayrıntılarını bilmeyen bir TTS istemcisi ve tek kanallı ses kuyruğu kullanır; ekranlar yalnızca kanonik Almanca metni bu soyutlamaya iletir.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, Node `spawn`, Piper CLI.

## Global Constraints

- TTS sadece Piper ve yerel dosyalarla çalışır; API anahtarı veya bulut hizmeti kullanılmaz.
- Ses sunucusu yalnızca `127.0.0.1` Vite geliştirme sunucusundan erişilir.
- Model ve üretilen WAV dosyaları proje altında kalır; Obsidian kasası salt okunurdur.
- Cache anahtarı dil, seçili ses, hız ve metnin SHA-256 toplamıdır.
- Yanlış öğrenci girdisi asla otomatik söylenmez; sadece kanonik doğru Almanca söylenir.
- Mevcut ilerleme alanları korunur; yeni ayarlar güvenli varsayılanlarla eklenir.

---

### Task 1: Ses çekirdeği ve yerel Piper köprüsü

**Files:**
- Create: `src/lib/audio/shared.ts`, `src/lib/audio/tts.ts`, `scripts/tts-service.ts`, `scripts/tts-setup.ts`, `scripts/generate-audio.ts`
- Modify: `vite.config.ts`, `package.json`, `.gitignore`
- Test: `src/lib/audio/tts.test.ts`, `scripts/tts-service.test.ts`

- [ ] Önce deterministic anahtar, metin doğrulama, kanonik cevap seçimi ve otomatik oynatma kararları için başarısız testler yaz.
- [ ] Testlerin özellik eksikliği nedeniyle kırmızı olduğunu doğrula.
- [ ] Saf TTS sözleşmesini ve Vite üzerinde güvenli `spawn` kullanan yerel endpointleri uygula.
- [ ] Önce cache-hit/miss testlerini, sonra tüm ses çekirdeği testlerini çalıştır.
- [ ] `tts:setup`, `tts:check`, `generate:audio` komutlarıyla proje-içi Piper/voice kurulumu ve statik içerik ön üretimi ekle.

### Task 2: İstemci oynatma ve ayar göçü

**Files:**
- Create: `src/lib/audio/playback.ts`, `src/components/AudioButton.tsx`
- Modify: `src/lib/storage.ts`, `src/lib/migration.test.ts`, `src/content/types.ts`
- Test: `src/lib/audio/playback.test.ts`, `src/lib/storage.test.ts`

- [ ] Ses ayarı varsayımları ve eski ilerleme verisinden kayıpsız göç için başarısız testler yaz.
- [ ] Tek kanallı, iptal edilebilir ses kuyruğunu; manuel oynatmanın önceki sesi durdurmasını uygula.
- [ ] Ayarları kalıcılaştır ve erişilebilir normal/yavaş dinleme düğmesini ekle.
- [ ] Birim testlerini yeşile çevir.

### Task 3: Ders, özet ve dinleme deneyimi

**Files:**
- Modify: `src/screens/LessonScreen.tsx`, `src/components/FeedbackPanel.tsx`, `src/components/exercise/*.tsx`, `src/screens/SummaryDayScreen.tsx`, `src/index.css`, `src/content/authored/exercises/day*.ts`
- Test: `src/lib/audio/feedback.test.ts`, `src/content/authored/authored.test.ts`

- [ ] Geri bildirimde doğru/yanlış/ufak hata için kanonik ses seçimini test et.
- [ ] Özgün, kısa ses efektlerini versioned asset olarak ekle ve efekt ardından TTS sıralamasını bağla.
- [ ] Almanca prompt/cevap/kelime/özet örneklerine dinleme düğmesi koy; cevabı sızdırabilecek ön-oynatmayı engelle.
- [ ] Orta/zor seviyede sınırlı dinleme-seçim veya diktasyon içerikleri ekle; Türkçe yaklaşık okunuş ayarını koru.
- [ ] Odağı metin girdisinde değilken `R` ile yeniden dinleme desteğini ekle.

### Task 4: Dokümantasyon ve uçtan uca doğrulama

**Files:**
- Modify: `README.md`
- Test: `scripts/tts-integration-test.ts`

- [ ] Piper bulunamadığında uygulamanın bozulmadığını ve health endpointinin tanı sunduğunu test et.
- [ ] Üç temsilî Almanca cümle için gerçek Piper WAV üretimi, dosya boyutu ve endpoint erişimini doğrula.
- [ ] `npm test`, `npm run build`, TTS health/integration ve görsel manuel QA çalıştır.
- [ ] Kurulum, model, cache, sorun giderme ve yerel çalışma komutlarını belgele.
