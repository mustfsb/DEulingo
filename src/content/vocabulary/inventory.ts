/**
 * Kanonik kelime envanteri — TEK DOĞRULUK KAYNAĞI.
 *
 * CURRENT_VOCABULARY = bu listedeki 244 benzersiz öğe.
 * Tüm kelime öğrenme oturumları (Genel Tekrar › Kelime Çalışması, konuya göre,
 * de↔tr, eşleştirme, yazma, dinleme, zayıf kelimeler, master liste) SADECE
 * bu listeden beslenir. Ayrı elle tutulan kelime listeleri YASAKTIR.
 *
 * Kurallar:
 * - Her öğe el yazısı ders notlarında açıkça öğretilmiş kelime/öbek olmalı
 *   (`source` alanında kanıt: Konu Özetleri.md bölümü ya da authored kavramı).
 * - Tekrar eden öğrenimler tek girdiye indirgenir (mehr, ruhig, Kaffee…).
 * - İsimlerde kanonik artikel zorunludur; TTS metni Almancadır.
 * - İlerleme bu nesnede SAKLANMAZ (deneme geçmişinden türetilir).
 *
 * KAPSAM KARARI (şeffaf, geri alınabilir):
 * - Vault taramasında 261 kanıtlı aday bulundu. 244 hedefine inmek için
 *   17 öğe kelime-ezber havuzunun DIŞINDA tutuldu (aşağıda listeli):
 *   10 sayı (zehn…tausend — Sayılar konusunun kendi alıştırmalarıyla
 *   çalışılır) + 7 dilbilgisi tutkalı (ja, nein, man, nach, vor, um, dann —
 *   cümle/yer/zaman dilbilgisi alıştırmalarıyla çalışılır).
 * - Dışarıda tutulanlar silinmedi: gramer cümlelerinde bağlam olarak
 *   kullanılmaya devam eder, sadece kelime-hedefi olmazlar.
 * - Yeni kelime öğrenildiğinde BU liste genişletilir; paralel sistem açılmaz.
 */

export const VOCAB_EXCLUDED_IDS = [
  'v-zehn', 'v-elf', 'v-zwoelf', 'v-dreizehn', 'v-zwanzig',
  'v-dreissig', 'v-vierzig', 'v-fuenfzig', 'v-hundert', 'v-tausend',
  'v-ja', 'v-nein', 'v-man', 'v-nach', 'v-vor', 'v-um', 'v-dann',
] as const;

export type VocabType =
  | 'noun'
  | 'verb'
  | 'separable-verb'
  | 'modal-verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'number'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'other';

export interface VocabEntry {
  /** Kararlı kimlik: `v-<kök>` (asla değişmez, ilerleme buna bağlıdır). */
  id: string;
  /** Kanonik Almanca (isimlerde artikel + isim: `der Schlüssel`). */
  german: string;
  /** Artikelsiz yalın biçim (eşleştirme/TTS normalizasyonu için). */
  base: string;
  /** Notlarda öğretilen Türkçe karşılık. */
  turkish: string;
  type: VocabType;
  article?: 'der' | 'die' | 'das';
  /** En az bir kanonik konu (`topic.*`). Çoklu üyelik etikettir, kopya değil. */
  topicIds: string[];
  aliases?: string[];
  /** Piper'a gönderilecek Almanca metin (isimlerde artikelli). */
  ttsText: string;
  /** Kaynak kanıtı (vault bölümü ya da kavram kimliği). */
  source: string;
  priority?: number;
}

function v(entry: VocabEntry): VocabEntry {
  return entry;
}

/**
 * 244 benzersiz öğe. Sıra: selamlaşma → kişisel → sayılar → fiiller →
 * ayrılabilen → modal → yiyecek → alışveriş → ev → sıfat → zaman →
 * günlük rutin → hava/hayvan/hobi → eşyalar → derste → küçük kelimeler.
 */
export const VOCABULARY: VocabEntry[] = [
  /* ---------------- Selamlaşma ve Nezaket (11) ---------------- */
  v({ id: 'v-hallo', german: 'Hallo!', base: 'Hallo!', turkish: 'Merhaba!', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Hallo!', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-guten-morgen', german: 'Guten Morgen', base: 'Guten Morgen', turkish: 'Günaydın', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Guten Morgen', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-guten-tag', german: 'Guten Tag', base: 'Guten Tag', turkish: 'İyi günler', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Guten Tag', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-guten-abend', german: 'Guten Abend', base: 'Guten Abend', turkish: 'İyi akşamlar', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Guten Abend', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-gute-nacht', german: 'Gute Nacht', base: 'Gute Nacht', turkish: 'İyi geceler', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Gute Nacht', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-freut-mich', german: 'Freut mich!', base: 'Freut mich!', turkish: 'Memnun oldum!', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Freut mich!', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-entschuldigung', german: 'Entschuldigung', base: 'Entschuldigung', turkish: 'Affedersiniz / Pardon', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Entschuldigung', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-danke-schoen', german: 'Danke schön', base: 'Danke schön', turkish: 'Çok teşekkürler', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Danke schön', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),
  v({ id: 'v-bitte', german: 'Bitte', base: 'Bitte', turkish: 'Lütfen / Buyurun', type: 'phrase', topicIds: ['topic.greetings'], ttsText: 'Bitte', source: 'Konu Özetleri.md › Selamlaşma ve Tanışma' }),

  /* ---------------- Kişisel Bilgiler (11) ---------------- */
  v({ id: 'v-vorname', german: 'der Vorname', base: 'Vorname', turkish: 'ad', type: 'noun', article: 'der', topicIds: ['topic.personal-info'], ttsText: 'der Vorname', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-familienname', german: 'der Familienname', base: 'Familienname', turkish: 'soyad', type: 'noun', article: 'der', topicIds: ['topic.personal-info'], ttsText: 'der Familienname', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-geburtsort', german: 'der Geburtsort', base: 'Geburtsort', turkish: 'doğum yeri', type: 'noun', article: 'der', topicIds: ['topic.personal-info'], ttsText: 'der Geburtsort', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-wohnort', german: 'der Wohnort', base: 'Wohnort', turkish: 'ikamet yeri', type: 'noun', article: 'der', topicIds: ['topic.personal-info'], ttsText: 'der Wohnort', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-strasse', german: 'die Straße', base: 'Straße', turkish: 'cadde / sokak', type: 'noun', article: 'die', topicIds: ['topic.personal-info'], ttsText: 'die Straße', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-telefonnummer', german: 'die Telefonnummer', base: 'Telefonnummer', turkish: 'telefon numarası', type: 'noun', article: 'die', topicIds: ['topic.personal-info'], ttsText: 'die Telefonnummer', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-familienstand', german: 'der Familienstand', base: 'Familienstand', turkish: 'medeni hal', type: 'noun', article: 'der', topicIds: ['topic.personal-info'], ttsText: 'der Familienstand', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-ledig', german: 'ledig', base: 'ledig', turkish: 'bekar', type: 'adjective', topicIds: ['topic.personal-info'], ttsText: 'ledig', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-verheiratet', german: 'verheiratet', base: 'verheiratet', turkish: 'evli', type: 'adjective', topicIds: ['topic.personal-info'], ttsText: 'verheiratet', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-email-adresse', german: 'die E-Mail-Adresse', base: 'E-Mail-Adresse', turkish: 'e-posta adresi', type: 'noun', article: 'die', topicIds: ['topic.personal-info'], ttsText: 'die E-Mail-Adresse', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-heimatland', german: 'das Heimatland', base: 'Heimatland', turkish: 'memleket', type: 'noun', article: 'das', topicIds: ['topic.personal-info'], ttsText: 'das Heimatland', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),

  /* ---------------- Sayılar (10) ---------------- */

  /* ---------------- Temel fiiller (22) ---------------- */
  v({ id: 'v-sein', german: 'sein', base: 'sein', turkish: 'olmak', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'sein', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-haben', german: 'haben', base: 'haben', turkish: 'sahip olmak', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'haben', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-heissen', german: 'heißen', base: 'heißen', turkish: 'isminde olmak', type: 'verb', topicIds: ['topic.verbs', 'topic.greetings'], ttsText: 'heißen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-kommen', german: 'kommen', base: 'kommen', turkish: 'gelmek', type: 'verb', topicIds: ['topic.verbs', 'topic.personal-info'], ttsText: 'kommen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-sagen', german: 'sagen', base: 'sagen', turkish: 'söylemek', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'sagen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-sprechen', german: 'sprechen', base: 'sprechen', turkish: 'konuşmak', type: 'verb', topicIds: ['topic.verbs', 'topic.greetings'], ttsText: 'sprechen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-kochen', german: 'kochen', base: 'kochen', turkish: 'pişirmek', type: 'verb', topicIds: ['topic.verbs', 'topic.food'], ttsText: 'kochen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-essen', german: 'essen', base: 'essen', turkish: 'yemek yemek', type: 'verb', topicIds: ['topic.verbs', 'topic.food'], ttsText: 'essen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-trinken', german: 'trinken', base: 'trinken', turkish: 'içmek', type: 'verb', topicIds: ['topic.verbs', 'topic.food'], ttsText: 'trinken', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-kennen', german: 'kennen', base: 'kennen', turkish: 'tanımak', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'kennen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-geben', german: 'geben', base: 'geben', turkish: 'vermek', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'geben', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-stellen', german: 'stellen', base: 'stellen', turkish: 'koymak', type: 'verb', topicIds: ['topic.verbs'], ttsText: 'stellen', source: 'Konu Özetleri.md › Fiiller ve Çekim' }),
  v({ id: 'v-leben', german: 'leben', base: 'leben', turkish: 'yaşamak', type: 'verb', topicIds: ['topic.verbs', 'topic.personal-info'], ttsText: 'leben', source: 'Konu Özetleri.md › Kişisel Bilgiler › leben' }),
  v({ id: 'v-wohnen', german: 'wohnen', base: 'wohnen', turkish: 'oturmak (ikamet etmek)', type: 'verb', topicIds: ['topic.verbs', 'topic.personal-info'], ttsText: 'wohnen', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-arbeiten', german: 'arbeiten', base: 'arbeiten', turkish: 'çalışmak', type: 'verb', topicIds: ['topic.verbs', 'topic.personal-info'], ttsText: 'arbeiten', source: 'Konu Özetleri.md › Kişisel Bilgiler' }),
  v({ id: 'v-machen', german: 'machen', base: 'machen', turkish: 'yapmak', type: 'verb', topicIds: ['topic.verbs', 'topic.sentence-building', 'topic.daily-routine'], ttsText: 'machen', source: 'Konu Özetleri.md › Cümle Kurma' }),
  v({ id: 'v-gehen', german: 'gehen', base: 'gehen', turkish: 'gitmek', type: 'verb', topicIds: ['topic.verbs', 'topic.sentence-building'], ttsText: 'gehen', source: 'Konu Özetleri.md › Cümle Kurma' }),
  v({ id: 'v-lesen', german: 'lesen', base: 'lesen', turkish: 'okumak', type: 'verb', topicIds: ['topic.verbs', 'topic.daily-routine', 'topic.vocabulary'], ttsText: 'lesen', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-schwimmen', german: 'schwimmen', base: 'schwimmen', turkish: 'yüzmek', type: 'verb', topicIds: ['topic.verbs', 'topic.vocabulary'], ttsText: 'schwimmen', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-hoeren', german: 'hören', base: 'hören', turkish: 'duymak / dinlemek', type: 'verb', topicIds: ['topic.verbs', 'topic.daily-routine'], ttsText: 'hören', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-lernen', german: 'lernen', base: 'lernen', turkish: 'öğrenmek', type: 'verb', topicIds: ['topic.verbs', 'topic.daily-routine'], ttsText: 'lernen', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-spielen', german: 'spielen', base: 'spielen', turkish: 'oynamak', type: 'verb', topicIds: ['topic.verbs', 'topic.daily-routine', 'topic.vocabulary'], ttsText: 'spielen', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),

  /* ---------------- Ayrılabilen fiiller (14) ---------------- */
  v({ id: 'v-aufstehen', german: 'aufstehen', base: 'aufstehen', turkish: 'yataktan kalkmak', type: 'separable-verb', topicIds: ['topic.separable-verbs', 'topic.daily-routine'], ttsText: 'aufstehen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-aufwachen', german: 'aufwachen', base: 'aufwachen', turkish: 'uyanmak', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'aufwachen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-anziehen', german: 'sich anziehen', base: 'anziehen', turkish: 'giyinmek', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'sich anziehen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-ausziehen', german: 'sich ausziehen', base: 'ausziehen', turkish: 'üstünü çıkarmak', type: 'separable-verb', topicIds: ['topic.separable-verbs', 'topic.daily-routine'], ttsText: 'sich ausziehen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-einkaufen', german: 'einkaufen', base: 'einkaufen', turkish: 'alışveriş yapmak', type: 'separable-verb', topicIds: ['topic.separable-verbs', 'topic.shopping'], ttsText: 'einkaufen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-aufraeumen', german: 'aufräumen', base: 'aufräumen', turkish: 'odayı toplamak', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'aufräumen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-anrufen', german: 'anrufen', base: 'anrufen', turkish: 'telefonla aramak', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'anrufen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-fernsehen', german: 'fernsehen', base: 'fernsehen', turkish: 'televizyon izlemek', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'fernsehen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-aufhoeren', german: 'aufhören', base: 'aufhören', turkish: 'bırakmak', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'aufhören', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-vorbereiten', german: 'vorbereiten', base: 'vorbereiten', turkish: 'hazırlamak', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'vorbereiten', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-einladen', german: 'einladen', base: 'einladen', turkish: 'davet etmek', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'einladen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-mitbringen', german: 'mitbringen', base: 'mitbringen', turkish: 'beraberinde getirmek', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'mitbringen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-zurueckkommen', german: 'zurückkommen', base: 'zurückkommen', turkish: 'geri dönmek', type: 'separable-verb', topicIds: ['topic.separable-verbs'], ttsText: 'zurückkommen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller' }),
  v({ id: 'v-besuchen', german: 'besuchen', base: 'besuchen', turkish: 'ziyaret etmek', type: 'verb', topicIds: ['topic.separable-verbs', 'topic.vocabulary'], ttsText: 'besuchen', source: 'Konu Özetleri.md › Ayrılabilen Fiiller (ayrılmayan karşıt örnek)' }),

  /* ---------------- Modalverben (8) ---------------- */
  v({ id: 'v-koennen', german: 'können', base: 'können', turkish: '-ebilmek', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'können', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-moechten', german: 'möchten', base: 'möchten', turkish: 'kibarca istemek', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'möchten', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-wollen', german: 'wollen', base: 'wollen', turkish: 'istemek (niyet/plan)', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'wollen', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-sollen', german: 'sollen', base: 'sollen', turkish: '-meli / -malı', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'sollen', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-duerfen', german: 'dürfen', base: 'dürfen', turkish: 'izinli olmak', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'dürfen', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-moegen', german: 'mögen', base: 'mögen', turkish: 'bir şeyi sevmek', type: 'modal-verb', topicIds: ['topic.modal-verbs', 'topic.likes'], ttsText: 'mögen', source: 'Konu Özetleri.md › Modalverben' }),
  v({ id: 'v-muessen', german: 'müssen', base: 'müssen', turkish: 'zorunluluk', type: 'modal-verb', topicIds: ['topic.modal-verbs'], ttsText: 'müssen', source: 'Konu Özetleri.md › Modalverben' }),

  /* ---------------- Essen und Trinken (32) ---------------- */
  v({ id: 'v-ei', german: 'das Ei', base: 'Ei', turkish: 'yumurta', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Ei', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-mehl', german: 'das Mehl', base: 'Mehl', turkish: 'un', type: 'noun', article: 'das', topicIds: ['topic.food', 'topic.shopping'], ttsText: 'das Mehl', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-pfannkuchen', german: 'der Pfannkuchen', base: 'Pfannkuchen', turkish: 'krep', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Pfannkuchen', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-kuchen', german: 'der Kuchen', base: 'Kuchen', turkish: 'kek / pasta', type: 'noun', article: 'der', topicIds: ['topic.food', 'topic.vocabulary'], ttsText: 'der Kuchen', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-broetchen', german: 'das Brötchen', base: 'Brötchen', turkish: 'küçük ekmek', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Brötchen', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-birne', german: 'die Birne', base: 'Birne', turkish: 'armut', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Birne', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-saft', german: 'der Saft', base: 'Saft', turkish: 'meyve suyu', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Saft', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-essen-n', german: 'das Essen', base: 'Essen', turkish: 'yemek', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Essen', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-pommes', german: 'die Pommes', base: 'Pommes', turkish: 'patates kızartması', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Pommes', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-pizza', german: 'die Pizza', base: 'Pizza', turkish: 'pizza', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Pizza', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-reis', german: 'der Reis', base: 'Reis', turkish: 'pirinç / pilav', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Reis', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-orangensaft', german: 'der Orangensaft', base: 'Orangensaft', turkish: 'portakal suyu', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Orangensaft', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-apfelsaft', german: 'der Apfelsaft', base: 'Apfelsaft', turkish: 'elma suyu', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Apfelsaft', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-milch', german: 'die Milch', base: 'Milch', turkish: 'süt', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Milch', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-limonade', german: 'die Limonade', base: 'Limonade', turkish: 'limonata', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Limonade', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-fleisch', german: 'das Fleisch', base: 'Fleisch', turkish: 'et', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Fleisch', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-wein', german: 'der Wein', base: 'Wein', turkish: 'şarap', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Wein', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-obst', german: 'das Obst', base: 'Obst', turkish: 'meyve', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Obst', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-gemuese', german: 'das Gemüse', base: 'Gemüse', turkish: 'sebze', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Gemüse', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-zwiebel', german: 'die Zwiebel', base: 'Zwiebel', turkish: 'soğan', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Zwiebel', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-fruehlingszwiebeln', german: 'die Frühlingszwiebeln', base: 'Frühlingszwiebeln', turkish: 'taze soğan', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Frühlingszwiebeln', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-salatgurke', german: 'die Salatgurke', base: 'Salatgurke', turkish: 'salatalık', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Salatgurke', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-essig', german: 'der Essig', base: 'Essig', turkish: 'sirke', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Essig', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-oel', german: 'das Öl', base: 'Öl', turkish: 'yağ', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Öl', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-pfeffer', german: 'der Pfeffer', base: 'Pfeffer', turkish: 'kara biber', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Pfeffer', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-haehnchen', german: 'das Hähnchen', base: 'Hähnchen', turkish: 'tavuk (yemek)', type: 'noun', article: 'das', topicIds: ['topic.food'], ttsText: 'das Hähnchen', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-gemuesesuppe', german: 'die Gemüsesuppe', base: 'Gemüsesuppe', turkish: 'sebze çorbası', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Gemüsesuppe', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-sahne', german: 'die Sahne', base: 'Sahne', turkish: 'krema', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Sahne', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-tomaten', german: 'die Tomaten', base: 'Tomaten', turkish: 'domatesler', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Tomaten', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-nuesse', german: 'die Nüsse', base: 'Nüsse', turkish: 'kuruyemiş', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Nüsse', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-kaese', german: 'der Käse', base: 'Käse', turkish: 'peynir', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Käse', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-suppe', german: 'die Suppe', base: 'Suppe', turkish: 'çorba', type: 'noun', article: 'die', topicIds: ['topic.food'], ttsText: 'die Suppe', source: 'Konu Özetleri.md › Essen und Trinken' }),
  v({ id: 'v-teller', german: 'der Teller', base: 'Teller', turkish: 'tabak', type: 'noun', article: 'der', topicIds: ['topic.food'], ttsText: 'der Teller', source: 'Konu Özetleri.md › Essen und Trinken' }),

  /* ---------------- Alışveriş ve Miktarlar (17) ---------------- */
  v({ id: 'v-kaufen', german: 'kaufen', base: 'kaufen', turkish: 'satın almak', type: 'verb', topicIds: ['topic.shopping'], ttsText: 'kaufen', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-verkaufen', german: 'verkaufen', base: 'verkaufen', turkish: 'satmak', type: 'verb', topicIds: ['topic.shopping'], ttsText: 'verkaufen', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-einkaufszettel', german: 'der Einkaufszettel', base: 'Einkaufszettel', turkish: 'alışveriş listesi', type: 'noun', article: 'der', topicIds: ['topic.shopping'], ttsText: 'der Einkaufszettel', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-einkaufswagen', german: 'der Einkaufswagen', base: 'Einkaufswagen', turkish: 'alışveriş arabası', type: 'noun', article: 'der', topicIds: ['topic.shopping'], ttsText: 'der Einkaufswagen', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-flasche', german: 'die Flasche', base: 'Flasche', turkish: 'şişe', type: 'noun', article: 'die', topicIds: ['topic.shopping', 'topic.food'], ttsText: 'die Flasche', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-packung', german: 'die Packung', base: 'Packung', turkish: 'paket', type: 'noun', article: 'die', topicIds: ['topic.shopping'], ttsText: 'die Packung', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-dose', german: 'die Dose', base: 'Dose', turkish: 'kutu (konserve)', type: 'noun', article: 'die', topicIds: ['topic.shopping'], ttsText: 'die Dose', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-becher', german: 'der Becher', base: 'Becher', turkish: 'kutu (yoğurt/krema kabı)', type: 'noun', article: 'der', topicIds: ['topic.shopping'], ttsText: 'der Becher', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-portion', german: 'die Portion', base: 'Portion', turkish: 'porsiyon', type: 'noun', article: 'die', topicIds: ['topic.shopping'], ttsText: 'die Portion', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-kosten', german: 'kosten', base: 'kosten', turkish: 'fiyatında olmak', type: 'verb', topicIds: ['topic.shopping'], ttsText: 'kosten', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-teuer', german: 'teuer', base: 'teuer', turkish: 'pahalı', type: 'adjective', topicIds: ['topic.shopping'], ttsText: 'teuer', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-brauchen', german: 'brauchen', base: 'brauchen', turkish: 'ihtiyaç duymak', type: 'verb', topicIds: ['topic.shopping'], ttsText: 'brauchen', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-immer', german: 'immer', base: 'immer', turkish: 'her zaman', type: 'adverb', topicIds: ['topic.shopping', 'topic.vocabulary'], ttsText: 'immer', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-oft', german: 'oft', base: 'oft', turkish: 'sık sık', type: 'adverb', topicIds: ['topic.shopping', 'topic.vocabulary'], ttsText: 'oft', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-manchmal', german: 'manchmal', base: 'manchmal', turkish: 'bazen', type: 'adverb', topicIds: ['topic.shopping'], ttsText: 'manchmal', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-nie', german: 'nie', base: 'nie', turkish: 'asla / hiç', type: 'adverb', topicIds: ['topic.shopping'], ttsText: 'nie', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),
  v({ id: 'v-meistens', german: 'meistens', base: 'meistens', turkish: 'çoğunlukla', type: 'adverb', topicIds: ['topic.shopping'], ttsText: 'meistens', source: 'Konu Özetleri.md › Alışveriş ve Fiyatlar' }),

  /* ---------------- Ev ve Mobilyalar (26) ---------------- */
  v({ id: 'v-wohnung', german: 'die Wohnung', base: 'Wohnung', turkish: 'ev / daire', type: 'noun', article: 'die', topicIds: ['topic.home'], ttsText: 'die Wohnung', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-zimmer', german: 'das Zimmer', base: 'Zimmer', turkish: 'oda', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Zimmer', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-bad', german: 'das Bad', base: 'Bad', turkish: 'banyo', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Bad', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-schlafzimmer', german: 'das Schlafzimmer', base: 'Schlafzimmer', turkish: 'yatak odası', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Schlafzimmer', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-flur', german: 'der Flur', base: 'Flur', turkish: 'koridor', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Flur', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-kueche', german: 'die Küche', base: 'Küche', turkish: 'mutfak', type: 'noun', article: 'die', topicIds: ['topic.home'], ttsText: 'die Küche', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-wohnzimmer', german: 'das Wohnzimmer', base: 'Wohnzimmer', turkish: 'salon', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Wohnzimmer', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-toilette', german: 'die Toilette', base: 'Toilette', turkish: 'tuvalet', type: 'noun', article: 'die', topicIds: ['topic.home'], ttsText: 'die Toilette', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-moebel', german: 'die Möbel', base: 'Möbel', turkish: 'mobilyalar', type: 'noun', article: 'die', topicIds: ['topic.home'], ttsText: 'die Möbel', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-schrank', german: 'der Schrank', base: 'Schrank', turkish: 'dolap', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Schrank', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-bett', german: 'das Bett', base: 'Bett', turkish: 'yatak', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Bett', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-sofa', german: 'das Sofa', base: 'Sofa', turkish: 'kanepe', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Sofa', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-sessel', german: 'der Sessel', base: 'Sessel', turkish: 'koltuk', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Sessel', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-fernseher', german: 'der Fernseher', base: 'Fernseher', turkish: 'televizyon', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Fernseher', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-teppich', german: 'der Teppich', base: 'Teppich', turkish: 'halı', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Teppich', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-regal', german: 'das Regal', base: 'Regal', turkish: 'raf', type: 'noun', article: 'das', topicIds: ['topic.home', 'topic.vocabulary'], ttsText: 'das Regal', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-herd', german: 'der Herd', base: 'Herd', turkish: 'ocak', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Herd', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-badewanne', german: 'die Badewanne', base: 'Badewanne', turkish: 'küvet', type: 'noun', article: 'die', topicIds: ['topic.home', 'topic.vocabulary'], ttsText: 'die Badewanne', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-waschbecken', german: 'das Waschbecken', base: 'Waschbecken', turkish: 'lavabo', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Waschbecken', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-fenster', german: 'das Fenster', base: 'Fenster', turkish: 'pencere', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Fenster', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-vorhang', german: 'der Vorhang', base: 'Vorhang', turkish: 'perde', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Vorhang', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-putzen', german: 'putzen', base: 'putzen', turkish: 'temizlemek', type: 'verb', topicIds: ['topic.home', 'topic.daily-routine'], ttsText: 'putzen', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-giessen', german: 'gießen', base: 'gießen', turkish: 'sulamak', type: 'verb', topicIds: ['topic.home'], ttsText: 'gießen', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-spuelen', german: 'spülen', base: 'spülen', turkish: '(bulaşık) yıkamak', type: 'verb', topicIds: ['topic.home'], ttsText: 'spülen', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-geschirr', german: 'das Geschirr', base: 'Geschirr', turkish: 'bulaşık', type: 'noun', article: 'das', topicIds: ['topic.home'], ttsText: 'das Geschirr', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),
  v({ id: 'v-balkon', german: 'der Balkon', base: 'Balkon', turkish: 'balkon', type: 'noun', article: 'der', topicIds: ['topic.home'], ttsText: 'der Balkon', source: 'Konu Özetleri.md › Ev ve Mobilyalar' }),

  /* ---------------- Sıfatlar (12) ---------------- */
  v({ id: 'v-hell', german: 'hell', base: 'hell', turkish: 'açık / ferah', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'hell', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-dunkel', german: 'dunkel', base: 'dunkel', turkish: 'koyu / karanlık', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'dunkel', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-gross', german: 'groß', base: 'groß', turkish: 'büyük', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'groß', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-klein', german: 'klein', base: 'klein', turkish: 'küçük', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'klein', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-breit', german: 'breit', base: 'breit', turkish: 'geniş', type: 'adjective', topicIds: ['topic.adjectives'], ttsText: 'breit', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-schmal', german: 'schmal', base: 'schmal', turkish: 'dar', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'schmal', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-kuehl', german: 'kühl', base: 'kühl', turkish: 'serin', type: 'adjective', topicIds: ['topic.adjectives'], ttsText: 'kühl', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-grau', german: 'grau', base: 'grau', turkish: 'gri', type: 'adjective', topicIds: ['topic.adjectives', 'topic.home'], ttsText: 'grau', source: 'Konu Özetleri.md › Sıfatlar' }),
  v({ id: 'v-schoen', german: 'schön', base: 'schön', turkish: 'güzel', type: 'adjective', topicIds: ['topic.adjectives', 'topic.vocabulary'], ttsText: 'schön', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-ruhig', german: 'ruhig', base: 'ruhig', turkish: 'sessiz / sakin', type: 'adjective', topicIds: ['topic.vocabulary', 'topic.home'], ttsText: 'ruhig', source: 'Konu Özetleri.md › Kelime Haznesi › Diğer Kelimeler' }),
  v({ id: 'v-frueh', german: 'früh', base: 'früh', turkish: 'erken', type: 'adjective', topicIds: ['topic.vocabulary', 'topic.daily-routine'], ttsText: 'früh', source: 'Konu Özetleri.md › Kelime Haznesi › Diğer Kelimeler' }),
  v({ id: 'v-lange', german: 'lange', base: 'lange', turkish: 'uzun (süre)', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'lange', source: 'Konu Özetleri.md › Kelime Haznesi › Diğer Kelimeler' }),

  /* ---------------- Zaman (12) ---------------- */
  v({ id: 'v-uhr', german: 'die Uhr', base: 'Uhr', turkish: 'saat (alet)', type: 'noun', article: 'die', topicIds: ['topic.time'], ttsText: 'die Uhr', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-stunde', german: 'die Stunde', base: 'Stunde', turkish: 'saat (süre)', type: 'noun', article: 'die', topicIds: ['topic.time'], ttsText: 'die Stunde', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-minute', german: 'die Minute', base: 'Minute', turkish: 'dakika', type: 'noun', article: 'die', topicIds: ['topic.time'], ttsText: 'die Minute', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-morgen-n', german: 'der Morgen', base: 'Morgen', turkish: 'sabah', type: 'noun', article: 'der', topicIds: ['topic.time', 'topic.daily-routine'], ttsText: 'der Morgen', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-abend', german: 'der Abend', base: 'Abend', turkish: 'akşam', type: 'noun', article: 'der', topicIds: ['topic.time', 'topic.daily-routine'], ttsText: 'der Abend', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-halb', german: 'halb', base: 'halb', turkish: 'buçuk', type: 'other', topicIds: ['topic.time'], ttsText: 'halb', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-viertel', german: 'das Viertel', base: 'Viertel', turkish: 'çeyrek', type: 'noun', article: 'das', topicIds: ['topic.time'], ttsText: 'das Viertel', source: 'Konu Özetleri.md › Saatler ve Zaman' }),
  v({ id: 'v-danach', german: 'danach', base: 'danach', turkish: 'ondan sonra', type: 'adverb', topicIds: ['topic.time', 'topic.sentence-building'], ttsText: 'danach', source: 'Konu Özetleri.md › Saatler ve Zaman' }),

  /* ---------------- Günlük rutin (10) ---------------- */
  v({ id: 'v-fruehstuecken', german: 'frühstücken', base: 'frühstücken', turkish: 'kahvaltı etmek', type: 'verb', topicIds: ['topic.daily-routine'], ttsText: 'frühstücken', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-gesicht', german: 'das Gesicht', base: 'Gesicht', turkish: 'yüz', type: 'noun', article: 'das', topicIds: ['topic.daily-routine'], ttsText: 'das Gesicht', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-zaehne', german: 'die Zähne', base: 'Zähne', turkish: 'dişler', type: 'noun', article: 'die', topicIds: ['topic.daily-routine'], ttsText: 'die Zähne', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-hausaufgaben', german: 'die Hausaufgaben', base: 'Hausaufgaben', turkish: 'ödevler', type: 'noun', article: 'die', topicIds: ['topic.daily-routine'], ttsText: 'die Hausaufgaben', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-ins-bett', german: 'ins Bett', base: 'ins Bett', turkish: 'yatağa', type: 'phrase', topicIds: ['topic.daily-routine', 'topic.places'], ttsText: 'ins Bett', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-spazieren', german: 'spazieren gehen', base: 'spazieren gehen', turkish: 'yürüyüş yapmak', type: 'phrase', topicIds: ['topic.daily-routine'], ttsText: 'spazieren gehen', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-kaffee', german: 'der Kaffee', base: 'Kaffee', turkish: 'kahve', type: 'noun', article: 'der', topicIds: ['topic.daily-routine', 'topic.food'], ttsText: 'der Kaffee', source: 'Konu Özetleri.md › Mein Tag' }),
  v({ id: 'v-buch', german: 'das Buch', base: 'Buch', turkish: 'kitap', type: 'noun', article: 'das', topicIds: ['topic.daily-routine', 'topic.articles'], ttsText: 'das Buch', source: 'Konu Özetleri.md › Artikeller ve Olumsuzluk' }),
  v({ id: 'v-schule', german: 'die Schule', base: 'Schule', turkish: 'okul', type: 'noun', article: 'die', topicIds: ['topic.daily-routine', 'topic.places'], ttsText: 'die Schule', source: 'Konu Özetleri.md › Cümle Kurma' }),
  v({ id: 'v-freunde', german: 'die Freunde', base: 'Freunde', turkish: 'arkadaşlar', type: 'noun', article: 'die', topicIds: ['topic.daily-routine', 'topic.places'], ttsText: 'die Freunde', source: 'Konu Özetleri.md › Mein Tag' }),

  /* ---------------- Hava / Hayvan / Hobi (12) ---------------- */
  v({ id: 'v-wetter', german: 'das Wetter', base: 'Wetter', turkish: 'hava (durumu)', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Wetter', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-warm', german: 'warm', base: 'warm', turkish: 'sıcak', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'warm', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-kalt', german: 'kalt', base: 'kalt', turkish: 'soğuk', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'kalt', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-katze', german: 'die Katze', base: 'Katze', turkish: 'kedi', type: 'noun', article: 'die', topicIds: ['topic.vocabulary', 'topic.home'], ttsText: 'die Katze', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-hund', german: 'der Hund', base: 'Hund', turkish: 'köpek', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Hund', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-tier', german: 'das Tier', base: 'Tier', turkish: 'hayvan', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Tier', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-lieblingstier', german: 'das Lieblingstier', base: 'Lieblingstier', turkish: 'en sevilen hayvan', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Lieblingstier', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-garten', german: 'der Garten', base: 'Garten', turkish: 'bahçe', type: 'noun', article: 'der', topicIds: ['topic.vocabulary', 'topic.home'], ttsText: 'der Garten', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-fussball', german: 'der Fußball', base: 'Fußball', turkish: 'futbol', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Fußball', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-fahrrad', german: 'das Fahrrad', base: 'Fahrrad', turkish: 'bisiklet', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Fahrrad', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-fotos', german: 'die Fotos', base: 'Fotos', turkish: 'fotoğraflar', type: 'noun', article: 'die', topicIds: ['topic.vocabulary'], ttsText: 'die Fotos', source: 'Konu Özetleri.md › Kelime Haznesi › Hava, Hayvanlar ve Hobiler' }),
  v({ id: 'v-tanzen', german: 'tanzen', base: 'tanzen', turkish: 'dans etmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'tanzen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),

  /* ---------------- Eşyalar, Yerler, İnsanlar (16) ---------------- */
  v({ id: 'v-tasche', german: 'die Tasche', base: 'Tasche', turkish: 'çanta', type: 'noun', article: 'die', topicIds: ['topic.vocabulary', 'topic.articles'], ttsText: 'die Tasche', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-brief', german: 'der Brief', base: 'Brief', turkish: 'mektup', type: 'noun', article: 'der', topicIds: ['topic.vocabulary', 'topic.akkusativ'], ttsText: 'der Brief', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-zeitung', german: 'die Zeitung', base: 'Zeitung', turkish: 'gazete', type: 'noun', article: 'die', topicIds: ['topic.vocabulary'], ttsText: 'die Zeitung', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-ticket', german: 'das Ticket', base: 'Ticket', turkish: 'bilet', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Ticket', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-schluessel', german: 'der Schlüssel', base: 'Schlüssel', turkish: 'anahtar', type: 'noun', article: 'der', topicIds: ['topic.vocabulary', 'topic.akkusativ'], ttsText: 'der Schlüssel', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-spielzeug', german: 'das Spielzeug', base: 'Spielzeug', turkish: 'oyuncak', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Spielzeug', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-seil', german: 'das Seil', base: 'Seil', turkish: 'ip', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Seil', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-maeppchen', german: 'das Mäppchen', base: 'Mäppchen', turkish: 'kalem kutusu', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Mäppchen', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-kleid', german: 'das Kleid', base: 'Kleid', turkish: 'elbise', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Kleid', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-lied', german: 'das Lied', base: 'Lied', turkish: 'şarkı', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Lied', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-museum', german: 'das Museum', base: 'Museum', turkish: 'müze', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Museum', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-baby', german: 'das Baby', base: 'Baby', turkish: 'bebek', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Baby', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-nachbar', german: 'der Nachbar', base: 'Nachbar', turkish: 'komşu', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Nachbar', source: 'Konu Özetleri.md › Kelime Haznesi › Eşyalar' }),
  v({ id: 'v-handy', german: 'das Handy', base: 'Handy', turkish: 'telefon', type: 'noun', article: 'das', topicIds: ['topic.vocabulary', 'topic.articles'], ttsText: 'das Handy', source: 'Konu Özetleri.md › Artikeller ve Olumsuzluk' }),
  v({ id: 'v-vater', german: 'der Vater', base: 'Vater', turkish: 'baba', type: 'noun', article: 'der', topicIds: ['topic.articles', 'topic.vocabulary'], ttsText: 'der Vater', source: 'Konu Özetleri.md › Artikeller ve Olumsuzluk' }),
  v({ id: 'v-mutter', german: 'die Mutter', base: 'Mutter', turkish: 'anne', type: 'noun', article: 'die', topicIds: ['topic.articles', 'topic.vocabulary'], ttsText: 'die Mutter', source: 'Konu Özetleri.md › Artikeller ve Olumsuzluk' }),

  /* ---------------- Yeni fiiller (12) ---------------- */
  v({ id: 'v-nehmen', german: 'nehmen', base: 'nehmen', turkish: 'almak', type: 'verb', topicIds: ['topic.vocabulary', 'topic.akkusativ'], ttsText: 'nehmen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-benutzen', german: 'benutzen', base: 'benutzen', turkish: 'kullanmak', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'benutzen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-schicken', german: 'schicken', base: 'schicken', turkish: 'göndermek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'schicken', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-warten', german: 'warten', base: 'warten', turkish: 'beklemek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'warten', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-wissen', german: 'wissen', base: 'wissen', turkish: 'bilmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'wissen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-halten', german: 'halten', base: 'halten', turkish: 'tutmak', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'halten', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-tragen', german: 'tragen', base: 'tragen', turkish: 'taşımak', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'tragen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-verlieren', german: 'verlieren', base: 'verlieren', turkish: 'kaybetmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'verlieren', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-reparieren', german: 'reparieren', base: 'reparieren', turkish: 'tamir etmek', type: 'verb', topicIds: ['topic.vocabulary', 'topic.home'], ttsText: 'reparieren', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-malen', german: 'malen', base: 'malen', turkish: 'resim yapmak', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'malen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-kontrollieren', german: 'kontrollieren', base: 'kontrollieren', turkish: 'kontrol etmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'kontrollieren', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),
  v({ id: 'v-schneiden', german: 'schneiden', base: 'schneiden', turkish: 'kesmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'schneiden', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),

  /* ---------------- Derste (12) ---------------- */
  v({ id: 'v-wort', german: 'das Wort', base: 'Wort', turkish: 'kelime', type: 'noun', article: 'das', topicIds: ['topic.vocabulary'], ttsText: 'das Wort', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-satz', german: 'der Satz', base: 'Satz', turkish: 'cümle', type: 'noun', article: 'der', topicIds: ['topic.vocabulary', 'topic.sentence-building'], ttsText: 'der Satz', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-frage', german: 'die Frage', base: 'Frage', turkish: 'soru', type: 'noun', article: 'die', topicIds: ['topic.vocabulary', 'topic.questions'], ttsText: 'die Frage', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-antwort', german: 'die Antwort', base: 'Antwort', turkish: 'cevap', type: 'noun', article: 'die', topicIds: ['topic.vocabulary'], ttsText: 'die Antwort', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-antworten', german: 'antworten', base: 'antworten', turkish: 'cevap vermek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'antworten', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-uebersetzen', german: 'übersetzen', base: 'übersetzen', turkish: 'çevirmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'übersetzen', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-wiederholen', german: 'wiederholen', base: 'wiederholen', turkish: 'tekrar etmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'wiederholen', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-erzaehlen', german: 'erzählen', base: 'erzählen', turkish: 'anlatmak (olayı)', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'erzählen', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-erklaeren', german: 'erklären', base: 'erklären', turkish: 'açıklamak', type: 'verb', topicIds: ['topic.vocabulary', 'topic.separable-verbs'], ttsText: 'erklären', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-fehler', german: 'der Fehler', base: 'Fehler', turkish: 'hata', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Fehler', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-falsch', german: 'falsch', base: 'falsch', turkish: 'yanlış', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'falsch', source: 'Konu Özetleri.md › Kelime Haznesi › Derste' }),
  v({ id: 'v-untersuchen', german: 'untersuchen', base: 'untersuchen', turkish: 'muayene etmek', type: 'verb', topicIds: ['topic.vocabulary'], ttsText: 'untersuchen', source: 'Konu Özetleri.md › Kelime Haznesi › Yeni Fiiller' }),

  /* ---------------- Faydalı küçük kelimeler (23) ---------------- */
  v({ id: 'v-leider', german: 'leider', base: 'leider', turkish: 'maalesef', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'leider', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-mehr', german: 'mehr', base: 'mehr', turkish: 'daha fazla', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'mehr', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-geschwister', german: 'die Geschwister', base: 'Geschwister', turkish: 'kardeşler', type: 'noun', article: 'die', topicIds: ['topic.vocabulary'], ttsText: 'die Geschwister', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-seit', german: 'seit', base: 'seit', turkish: '-den beri', type: 'preposition', topicIds: ['topic.vocabulary'], ttsText: 'seit', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-flughafen', german: 'der Flughafen', base: 'Flughafen', turkish: 'havaalanı', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Flughafen', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-moment', german: 'der Moment', base: 'Moment', turkish: 'an', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Moment', source: 'Konu Özetleri.md › Kelime Haznesi › Faydalı Küçük Kelimeler' }),
  v({ id: 'v-gluecklich', german: 'glücklich', base: 'glücklich', turkish: 'mutlu', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'glücklich', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-traum', german: 'der Traum', base: 'Traum', turkish: 'hayal / rüya', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Traum', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-gast', german: 'der Gast', base: 'Gast', turkish: 'misafir', type: 'noun', article: 'der', topicIds: ['topic.vocabulary'], ttsText: 'der Gast', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-leute', german: 'die Leute', base: 'Leute', turkish: 'insanlar', type: 'noun', article: 'die', topicIds: ['topic.vocabulary'], ttsText: 'die Leute', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-mensa', german: 'in der Mensa', base: 'in der Mensa', turkish: 'yemekhanede', type: 'phrase', topicIds: ['topic.vocabulary'], ttsText: 'in der Mensa', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-fuer', german: 'für', base: 'für', turkish: 'için', type: 'preposition', topicIds: ['topic.vocabulary'], ttsText: 'für', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-nur', german: 'nur', base: 'nur', turkish: 'sadece', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'nur', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-etwas', german: 'etwas', base: 'etwas', turkish: 'bir şey / biraz', type: 'other', topicIds: ['topic.vocabulary'], ttsText: 'etwas', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-viele', german: 'viele', base: 'viele', turkish: 'birçok', type: 'other', topicIds: ['topic.vocabulary'], ttsText: 'viele', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-fertig', german: 'fertig', base: 'fertig', turkish: 'hazır / bitmiş', type: 'adjective', topicIds: ['topic.vocabulary'], ttsText: 'fertig', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-schmeckt', german: 'schmeckt', base: 'schmeckt', turkish: 'tadı güzel (geliyor)', type: 'verb', topicIds: ['topic.vocabulary', 'topic.food'], ttsText: 'schmeckt', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-zusammen', german: 'zusammen', base: 'zusammen', turkish: 'birlikte', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'zusammen', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-dort', german: 'dort', base: 'dort', turkish: 'orada', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'dort', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-auch', german: 'auch', base: 'auch', turkish: 'de / da / ayrıca', type: 'adverb', topicIds: ['topic.vocabulary', 'topic.home'], ttsText: 'auch', source: 'Konu Özetleri.md › Kelime Haznesi › Günlük Hayattan Kelimeler' }),
  v({ id: 'v-beide', german: 'beide', base: 'beide', turkish: 'ikisi de', type: 'other', topicIds: ['topic.vocabulary'], ttsText: 'beide', source: 'Konu Özetleri.md › Kelime Haznesi › Diğer Kelimeler' }),
  v({ id: 'v-ziemlich', german: 'ziemlich', base: 'ziemlich', turkish: 'oldukça', type: 'adverb', topicIds: ['topic.vocabulary'], ttsText: 'ziemlich', source: 'Konu Özetleri.md › Kelime Haznesi › Diğer Kelimeler' }),
  v({ id: 'v-gern', german: 'gern', base: 'gern', turkish: 'severek', type: 'adverb', topicIds: ['topic.likes', 'topic.food', 'topic.vocabulary'], ttsText: 'gern', source: 'Konu Özetleri.md › Sevmek ve Beğenmek' }),
];

export const VOCAB_BY_ID = new Map(VOCABULARY.map((entry) => [entry.id, entry]));

/** Beklenen kanonik büyüklük (görev şartı). */
export const EXPECTED_VOCABULARY_SIZE = 244;

export function vocabById(id: string): VocabEntry | undefined {
  return VOCAB_BY_ID.get(id);
}

/** Almanca görünen biçime göre arama (artikel dahil tam eşleşme öncelikli). */
export function findVocabByGerman(german: string): VocabEntry | undefined {
  const needle = german.trim().toLocaleLowerCase('de');
  return (
    VOCABULARY.find((entry) => entry.german.toLocaleLowerCase('de') === needle) ??
    VOCABULARY.find((entry) => entry.base.toLocaleLowerCase('de') === needle)
  );
}
