/**
 * Kavram kaydi.
 *
 * Her alistirma en az bir kavrama, her kavram bir ozet konusuna baglanir.
 * Bu dosya "neyin ogretilmis sayildiginin" tek kaynagidir: burada olmayan bir
 * kavram alistirmada kullanilamaz (senkron HATA verir).
 *
 * ANCHOR: Her kavram, ogretildigi ozet konusunun metninde gecmesi GEREKEN kisa
 * bir dize tasir. Senkron sirasinda bu dize aranir; bulunamazsa kapsam hatasi
 * verilir. Boylece "alistirma X kavramini soruyor ama ozet onu anlatmiyor"
 * durumu kaynak metin degistiginde de yakalanir (§24).
 *
 * Kavramlar YALNIZCA su iki kaynaktan turetilmistir:
 *   - İlk 3 Hafta Özet.md
 *   - İlk 3 Hafta Alıştırma.md
 * Kaynakta gecmeyen dilbilgisi buraya eklenmez.
 */

import type { Concept } from '../types.ts';

/**
 * Ozet dosyasindaki H2 bolumlerinin kararli ID'leri.
 * `matchTitles` kaynak baslikla eslesmeyi saglar; baslik yeniden yazilirsa
 * yalnizca bu liste guncellenir, ID (ve dolayisiyla yer imleri) sabit kalir.
 */
export interface SummaryTopicDef {
  id: string;
  day: number;
  /** UI'da gosterilen kisa ad. */
  title: string;
  /** Kaynak Ozet dosyasindaki H2 basliklariyla eslestirme adaylari. */
  matchTitles: string[];
}

export const SUMMARY_TOPICS: SummaryTopicDef[] = [
  {
    id: 'day1.alfabe-telaffuz',
    day: 1,
    title: 'Alfabe ve Telaffuz',
    matchTitles: ['Alfabe ve Telaffuz'],
  },
  {
    id: 'day1.selamlasma-vedalasma',
    day: 1,
    title: 'Selamlaşma ve Vedalaşma',
    matchTitles: ['Selamlaşma ve Vedalaşma'],
  },
  {
    id: 'day2.kisi-zamirleri',
    day: 2,
    title: 'Kişi Zamirleri',
    matchTitles: ['Kişi Zamirleri (Personalpronomen)', 'Kişi Zamirleri'],
  },
  {
    id: 'day2.fiil-cekimi',
    day: 2,
    title: 'Fiil Çekimi',
    matchTitles: ['Fiil Çekimi (Konjugation)', 'Fiil Çekimi'],
  },
  {
    id: 'day2.sein-haben',
    day: 2,
    title: 'sein / haben',
    matchTitles: ['sein ve haben Fiilleri', 'sein ve haben'],
  },
  {
    id: 'day2.artikel',
    day: 2,
    title: 'Artikel',
    matchTitles: ['Artikel — der, die, das', 'Artikel'],
  },
  {
    id: 'day3.kendini-tanitma',
    day: 3,
    title: 'Kendini Tanıtma',
    matchTitles: ['Kendini Tanıtma Soruları', 'Kendini Tanıtma'],
  },
  {
    id: 'day3.nasilsin',
    day: 3,
    title: 'Nasılsın?',
    matchTitles: ['Nasılsın?'],
  },
  {
    id: 'day3.sayilar',
    day: 3,
    title: 'Sayılar',
    matchTitles: ['Sayılar (0–20)', 'Sayılar'],
  },
  {
    id: 'day4.takvim-kelimeleri',
    day: 4,
    title: 'Takvim Kelimeleri',
    matchTitles: ['Takvim Kelimeleri: Günler, Aylar, Mevsimler', 'Takvim Kelimeleri'],
  },
  {
    id: 'day4.takvim-sorulari',
    day: 4,
    title: 'Takvim Soruları',
    matchTitles: ['Takvim Soruları ve Zaman İfadeleri', 'Takvim Soruları'],
  },
  {
    id: 'day4.dogum-gunu-yas',
    day: 4,
    title: 'Doğum Günü, Yaş ve Sıra Sayıları',
    matchTitles: ['Doğum Günü, Yaş ve Sıra Sayıları'],
  },
  {
    id: 'day5.artikel-secimi',
    day: 5,
    title: 'Artikel Seçimi',
    matchTitles: ['Artikel Seçimi ve Sözlükle Öğrenme', 'Artikel Seçimi'],
  },
  {
    id: 'day5.cogul-isimler',
    day: 5,
    title: 'Çoğul İsimler',
    matchTitles: ['Çoğul İsimler'],
  },
  {
    id: 'day5.belirli-belirsiz',
    day: 5,
    title: 'Belirli / Belirsiz Artikel',
    matchTitles: ['Belirli / Belirsiz Artikel: der/die/das – ein/eine', 'Belirli / Belirsiz Artikel'],
  },
  {
    id: 'day6.onemli-fiiller',
    day: 6,
    title: 'Önemli Fiiller',
    matchTitles: ['Önemli Fiiller: kommen, sein, sprechen', 'Önemli Fiiller'],
  },
  {
    id: 'day6.ulkeler-aus',
    day: 6,
    title: 'Ülkeler ve aus',
    matchTitles: ['Ülkeler ve `aus` ile Nereli Olma', 'Ülkeler ve aus ile Nereli Olma'],
  },
  {
    id: 'day6.uyruklar-diller',
    day: 6,
    title: 'Uyruklar ve Diller',
    matchTitles: ['Uyruklar ve Diller'],
  },
];

export const SUMMARY_TOPIC_IDS = new Set(SUMMARY_TOPICS.map((topic) => topic.id));

interface ConceptSpec {
  id: string;
  topicId: string;
  label: string;
  /** Ozet konusu metninde gecmesi gereken dize. */
  anchor: string;
  prerequisites?: string[];
}

function build(day: number, specs: ConceptSpec[]): Array<Concept & { anchor: string }> {
  return specs.map((spec) => ({
    id: spec.id,
    day,
    topicId: spec.topicId,
    label: spec.label,
    anchor: spec.anchor,
    ...(spec.prerequisites?.length ? { prerequisites: spec.prerequisites } : {}),
  }));
}

const TEL = 'day1.alfabe-telaffuz';
const SEL = 'day1.selamlasma-vedalasma';
const ZAM = 'day2.kisi-zamirleri';
const KON = 'day2.fiil-cekimi';
const SNH = 'day2.sein-haben';
const ART = 'day2.artikel';
const TAN = 'day3.kendini-tanitma';
const NAS = 'day3.nasilsin';
const SAY = 'day3.sayilar';
const D4_KEL = 'day4.takvim-kelimeleri';
const D4_SOR = 'day4.takvim-sorulari';
const D4_DOG = 'day4.dogum-gunu-yas';
const D5_ART = 'day5.artikel-secimi';
const D5_COG = 'day5.cogul-isimler';
const D5_BEL = 'day5.belirli-belirsiz';
const D6_FII = 'day6.onemli-fiiller';
const D6_ULK = 'day6.ulkeler-aus';
const D6_UYR = 'day6.uyruklar-diller';

export const CONCEPTS: Array<Concept & { anchor: string }> = [
  /* ---------------------------------------------------------------- */
  /* 1. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(1, [
    { id: 'day1.alfabe.ozel-harfler', topicId: TEL, label: 'ä, ö, ü, ß harfleri', anchor: 'Almancaya özel 4 harf' },
    { id: 'day1.alfabe.eszett', topicId: TEL, label: 'ß (Eszett) = ss', anchor: 'Eszett' },
    { id: 'day1.kombinasyon.ei', topicId: TEL, label: '`ei` → "ay"', anchor: 'nein (hayır)' },
    { id: 'day1.kombinasyon.ie', topicId: TEL, label: '`ie` → uzun "i"', anchor: 'wie (nasıl)' },
    { id: 'day1.kombinasyon.eu-aeu', topicId: TEL, label: '`eu` / `äu` → "oy"', anchor: 'Oyropa' },
    { id: 'day1.kombinasyon.au', topicId: TEL, label: '`au` → "au"', anchor: 'Haus (ev)' },
    { id: 'day1.kombinasyon.sch', topicId: TEL, label: '`sch` → "ş"', anchor: 'Schule (okul)' },
    { id: 'day1.kombinasyon.sp-st', topicId: TEL, label: 'kelime başında `sp-` / `st-`', anchor: 'Sport, Stuhl' },
    { id: 'day1.kombinasyon.tsch', topicId: TEL, label: '`tsch` → "ç"', anchor: 'Deutschland, tschüss' },
    { id: 'day1.kombinasyon.ch-sert', topicId: TEL, label: '`ch` (a, o, u sonrası) → sert "h"', anchor: 'boğazdan gelen kaba bir "h"' },
    { id: 'day1.kombinasyon.ch-yumusak', topicId: TEL, label: '`ch` (e, i, ä, ö, ü sonrası) → yumuşak "ih"', anchor: 'yanakları çekerek' },
    { id: 'day1.telaffuz.sessiz-h', topicId: TEL, label: 'sesliden sonra `h` okunmaz, uzatır', anchor: 'sadece kendinden önceki sesli harfi uzatır' },
    { id: 'day1.telaffuz.z-ts', topicId: TEL, label: '`z` her zaman "ts"', anchor: 'her zaman **"ts"**' },
    { id: 'day1.telaffuz.s-z', topicId: TEL, label: 'kelime başında sesliden önce `s` → "z"', anchor: 'sagen' },
    { id: 'day1.telaffuz.kelime-sonu', topicId: TEL, label: 'kelime sonu `-e` → "ı", `-er` → "a"', anchor: 'Lehra' },
    { id: 'day1.alfabe.buchstabieren', topicId: TEL, label: 'Buchstabieren — ismi harf harf kodlama', anchor: 'Ich buchstabiere' },
    { id: 'day1.wortschatz.gunluk', topicId: TEL, label: '1. Gün kelime dağarcığı', anchor: 'Schule (okul)' },

    { id: 'day1.selamlasma.hallo', topicId: SEL, label: 'Hallo / Hi / Moin / Grüß Gott', anchor: 'Hallo / Hi' },
    { id: 'day1.selamlasma.guten-morgen', topicId: SEL, label: 'Guten Morgen (sabah)', anchor: 'Guten Morgen' },
    { id: 'day1.selamlasma.guten-tag', topicId: SEL, label: 'Guten Tag (gündüz)', anchor: 'Guten Tag' },
    { id: 'day1.selamlasma.guten-abend', topicId: SEL, label: 'Guten Abend (akşam)', anchor: 'Guten Abend' },
    { id: 'day1.selamlasma.gute-nacht', topicId: SEL, label: 'Gute Nacht — `Guten` değil `Gute`', anchor: 'Gute Nacht' },
    { id: 'day1.vedalasma.tschuess', topicId: SEL, label: 'Tschüss / Ciao', anchor: 'Tschüss' },
    { id: 'day1.vedalasma.auf-wiedersehen', topicId: SEL, label: 'Auf Wiedersehen (yüz yüze)', anchor: 'Auf Wiedersehen' },
    { id: 'day1.vedalasma.auf-wiederhoeren', topicId: SEL, label: 'Auf Wiederhören (telefonda)', anchor: 'Auf Wiederhören' },
    { id: 'day1.vedalasma.bis-kaliplari', topicId: SEL, label: 'Bis bald / Bis dann / Bis Montag', anchor: 'Bis bald' },
  ]),

  /* ---------------------------------------------------------------- */
  /* 2. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(2, [
    { id: 'day2.zamir.ich', topicId: ZAM, label: 'ich = ben', anchor: 'ich' },
    { id: 'day2.zamir.du', topicId: ZAM, label: 'du = sen', anchor: 'du' },
    { id: 'day2.zamir.er-sie-es', topicId: ZAM, label: 'er / sie / es = o', anchor: 'er / sie / es' },
    { id: 'day2.zamir.wir', topicId: ZAM, label: 'wir = biz', anchor: 'wir' },
    { id: 'day2.zamir.ihr', topicId: ZAM, label: 'ihr = siz (samimi, 2+ kişi)', anchor: 'samimi hitap' },
    { id: 'day2.zamir.sie-onlar', topicId: ZAM, label: 'sie = onlar', anchor: 'onlar' },
    { id: 'day2.zamir.Sie-resmi', topicId: ZAM, label: 'Sie = siz (resmî, büyük harf)', anchor: 'resmî, büyük harfle' },
    { id: 'day2.zamir.du-ihr-farki', topicId: ZAM, label: '`du` ↔ `ihr` farkı', anchor: 'Arkadaş grubuna', prerequisites: ['day2.zamir.du', 'day2.zamir.ihr'] },
    { id: 'day2.zamir.sie-Sie-farki', topicId: ZAM, label: '`sie` ↔ `Sie` büyük harf farkı', anchor: 'tek fark büyük/küçük harf', prerequisites: ['day2.zamir.sie-onlar', 'day2.zamir.Sie-resmi'] },

    { id: 'day2.konjugation.kok', topicId: KON, label: 'fiil kökü: mastardan `-en` atılır', anchor: 'kök: `komm`' },
    { id: 'day2.konjugation.ich-e', topicId: KON, label: 'ich + `-e`', anchor: 'ich komme', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.du-st', topicId: KON, label: 'du + `-st`', anchor: 'du kommst', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.er-t', topicId: KON, label: 'er/sie/es + `-t`', anchor: 'er kommt', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.wir-en', topicId: KON, label: 'wir + `-en`', anchor: 'wir kommen', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.ihr-t', topicId: KON, label: 'ihr + `-t`', anchor: 'ihr kommt', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.sie-en', topicId: KON, label: 'sie/Sie + `-en`', anchor: 'sie kommen', prerequisites: ['day2.konjugation.kok'] },
    { id: 'day2.konjugation.duzenli-fiiller', topicId: KON, label: 'kommen, gehen, wohnen, heißen, trinken', anchor: 'trinken' },
    { id: 'day2.konjugation.simdiki-genis', topicId: KON, label: 'tek çekim = şimdiki + geniş zaman', anchor: 'geniş zaman' },
    { id: 'day2.konjugation.ornek-cumleler', topicId: KON, label: 'çekimli fiille kısa cümleler', anchor: 'Wir trinken Wasser.' },
    { id: 'day2.wortschatz.gunluk', topicId: KON, label: '2. Gün kelime dağarcığı', anchor: 'gehen' },

    { id: 'day2.sein.cekim', topicId: SNH, label: 'sein çekimi (bin, bist, ist, sind, seid)', anchor: 'seid' },
    { id: 'day2.haben.cekim', topicId: SNH, label: 'haben çekimi (habe, hast, hat, haben, habt)', anchor: 'habt' },
    { id: 'day2.sein-haben.ayrim', topicId: SNH, label: 'tanımlama → sein, sahiplik → haben', anchor: 'sahip olduğunu belirtirken', prerequisites: ['day2.sein.cekim', 'day2.haben.cekim'] },
    { id: 'day2.haben.var-yok', topicId: SNH, label: '`haben` kalıpları: Hunger / Zeit → "var"', anchor: 'Ich habe Hunger', prerequisites: ['day2.haben.cekim'] },

    { id: 'day2.artikel.der-die-das', topicId: ART, label: 'der (eril) / die (dişil) / das (nötr)', anchor: '`der` eril, `die` dişil, `das` nötr' },
    { id: 'day2.artikel.cogul-die', topicId: ART, label: 'çoğulda her zaman `die`', anchor: 'Çoğul isimlerde' },
    { id: 'day2.artikel.ezber', topicId: ART, label: 'her isim artikeliyle birlikte ezberlenir', anchor: 'artikeliyle birlikte' },
    { id: 'day2.artikel.isim-buyuk-harf', topicId: ART, label: 'isimler cümle içinde büyük harfle başlar', anchor: '**büyük harfle** başlar' },
    { id: 'day2.artikel.kelimeler', topicId: ART, label: 'der Tisch, die Lampe, das Buch', anchor: 'die Lampe', prerequisites: ['day2.artikel.der-die-das'] },
    // Kaynak Ozet'te YOK; Alistirma cevap anahtarindan geliyor → augmentation ile ogretilir.
    { id: 'day2.yazim.cumle-buyuk-harf', topicId: ART, label: 'cümleler büyük harfle başlar', anchor: 'Cümleler her zaman büyük harfle başlar' },
  ]),

  /* ---------------------------------------------------------------- */
  /* 3. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(3, [
    { id: 'day3.soru.wie-heisst-du', topicId: TAN, label: 'Wie heißt du?', anchor: 'Wie heißt du?' },
    { id: 'day3.soru.wie-heissen-sie', topicId: TAN, label: 'Wie heißen Sie? (resmî)', anchor: 'Wie heißen Sie?', prerequisites: ['day2.zamir.Sie-resmi'] },
    { id: 'day3.soru.wie-ist-dein-name', topicId: TAN, label: 'Wie ist dein Name? / Ihr Name?', anchor: 'Wie ist dein Name?' },
    { id: 'day3.soru.wer-bist-du', topicId: TAN, label: 'Wer bist du? / Wer sind Sie?', anchor: 'Wer bist du?', prerequisites: ['day2.sein.cekim'] },
    { id: 'day3.soru.wo-wohnst-du', topicId: TAN, label: 'Wo wohnst du?', anchor: 'Wo wohnst du?', prerequisites: ['day2.konjugation.du-st'] },
    { id: 'day3.soru.woher-kommst-du', topicId: TAN, label: 'Woher kommst du?', anchor: 'Woher kommst du?', prerequisites: ['day2.konjugation.du-st'] },
    { id: 'day3.soru.du-sie-ayrimi', topicId: TAN, label: 'samimi `du` ↔ resmî `Sie` soruları', anchor: 'Soru (resmî — Sie)', prerequisites: ['day2.zamir.Sie-resmi'] },
    { id: 'day3.cevap.ich-heisse', topicId: TAN, label: 'Ich heiße …', anchor: 'Ich heiße Mustafa.' },
    { id: 'day3.cevap.ich-bin', topicId: TAN, label: 'Ich bin …', anchor: 'Ich bin Mustafa.', prerequisites: ['day2.sein.cekim'] },
    { id: 'day3.cevap.wohnen-in', topicId: TAN, label: '`wohnen` + `in` + şehir', anchor: '`in` edatı' },
    { id: 'day3.cevap.kommen-aus', topicId: TAN, label: '`kommen` + `aus` + ülke', anchor: '`aus` edatı' },
    { id: 'day3.cevap.aus-der-tuerkei', topicId: TAN, label: 'aus der Türkei (kalıp)', anchor: 'aus der Türkei', prerequisites: ['day3.cevap.kommen-aus'] },

    { id: 'day3.nasilsin.wie-gehts-dir', topicId: NAS, label: "Wie geht's dir? (samimi)", anchor: "Wie geht's dir?" },
    { id: 'day3.nasilsin.wie-geht-es-ihnen', topicId: NAS, label: 'Wie geht es Ihnen? (resmî)', anchor: 'Wie geht es Ihnen?', prerequisites: ['day2.zamir.Sie-resmi'] },
    { id: 'day3.nasilsin.cevaplar', topicId: NAS, label: 'Super! / Gut. / Es geht. / Schlecht.', anchor: 'Es geht.' },
    { id: 'day3.nasilsin.es-oznesi', topicId: NAS, label: 'özne `es`: Es geht mir gut.', anchor: 'Es geht mir gut.' },
    { id: 'day3.wortschatz.gunluk', topicId: NAS, label: '3. Gün kelime dağarcığı', anchor: 'Nicht so gut.' },

    { id: 'day3.sayilar.0-10', topicId: SAY, label: 'null – zehn', anchor: 'zehn' },
    // Kaynak Ozet'te YOK ama kendi kontrol listesi 0–12 sayabilmeyi istiyor → augmentation.
    { id: 'day3.sayilar.11-12', topicId: SAY, label: 'elf, zwölf', anchor: 'zwölf' },
    { id: 'day3.sayilar.13-19', topicId: SAY, label: 'birler + zehn (dreizehn)', anchor: 'dreizehn', prerequisites: ['day3.sayilar.0-10'] },
    { id: 'day3.sayilar.16-17-istisna', topicId: SAY, label: 'sechzehn / siebzehn istisnası', anchor: 'sechzehn', prerequisites: ['day3.sayilar.13-19'] },
    // Ozet yalnizca `einundzwanzig` / `fünfunddreißig` icinde geciyor → augmentation ile acikca ogretilir.
    { id: 'day3.sayilar.onluklar', topicId: SAY, label: 'zwanzig, dreißig', anchor: '`zwanzig` = 20' },
    { id: 'day3.sayilar.und-yapisi', topicId: SAY, label: 'birler + `und` + onlar (einundzwanzig)', anchor: 'einundzwanzig', prerequisites: ['day3.sayilar.onluklar'] },
  ]),

  /* ---------------------------------------------------------------- */
  /* 4. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(4, [
    { id: 'day4.takvim.gun-hafta', topicId: D4_KEL, label: 'der Tag / die Woche', anchor: 'der Tag', prerequisites: ['day2.artikel.der-die-das'] },
    { id: 'day4.takvim.hafta-gunleri', topicId: D4_KEL, label: 'haftanın günleri', anchor: 'Montag, Dienstag, Mittwoch' },
    { id: 'day4.takvim.aylar', topicId: D4_KEL, label: 'ay adları', anchor: 'Januar, Februar, März', prerequisites: ['day2.artikel.isim-buyuk-harf'] },
    { id: 'day4.takvim.mevsimler', topicId: D4_KEL, label: 'der Winter, Frühling, Sommer, Herbst', anchor: 'der Winter' },
    { id: 'day4.takvim.buyuk-harf', topicId: D4_KEL, label: 'gün ve ay adları büyük harfle yazılır', anchor: 'Günler, aylar ve mevsimler Almancada isimdir', prerequisites: ['day2.artikel.isim-buyuk-harf'] },
    { id: 'day4.soru.welcher-tag', topicId: D4_SOR, label: 'Welcher Tag ist heute?', anchor: 'Welcher Tag ist heute?' },
    { id: 'day4.zaman.am-im', topicId: D4_SOR, label: 'am Montag / im Mai', anchor: 'am Montag', prerequisites: ['day4.takvim.hafta-gunleri', 'day4.takvim.aylar'] },
    { id: 'day4.dogum-gunu.wann', topicId: D4_DOG, label: 'Wann hast du Geburtstag?', anchor: 'Wann hast du Geburtstag?', prerequisites: ['day2.haben.cekim'] },
    { id: 'day4.sira-sayisi.temel', topicId: D4_DOG, label: 'erste, zweite, dritte sıra sayıları', anchor: 'erste', prerequisites: ['day3.sayilar.0-10'] },
    { id: 'day4.tarih.am-en', topicId: D4_DOG, label: 'am dritten Mai tarih kalıbı', anchor: 'am ersten Mai', prerequisites: ['day4.sira-sayisi.temel', 'day4.zaman.am-im'] },
    { id: 'day4.yas.wie-alt', topicId: D4_DOG, label: 'Wie alt bist du? / Ich bin zwanzig.', anchor: 'Wie alt bist du?', prerequisites: ['day2.sein.cekim', 'day3.sayilar.onluklar'] },
  ]),

  /* ---------------------------------------------------------------- */
  /* 5. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(5, [
    { id: 'day5.artikel.artikel-cogul-not', topicId: D5_ART, label: 'ismi artikeli ve çoğuluyla öğrenme', anchor: 'artikeli ve çoğuluyla', prerequisites: ['day2.artikel.ezber'] },
    { id: 'day5.artikel.sozluk-kisaltmalari', topicId: D5_ART, label: 'm. / f. / n. / Pl. sözlük kısaltmaları', anchor: 'm. = maskulin' },
    { id: 'day5.cogul.die', topicId: D5_COG, label: 'çoğulda die', anchor: 'Çoğulda artikel her zaman', prerequisites: ['day2.artikel.cogul-die'] },
    { id: 'day5.cogul.ekler', topicId: D5_COG, label: 'yaygın çoğul ekleri', anchor: 'altı yaygın çoğul görünümü' },
    { id: 'day5.cogul.umlaut', topicId: D5_COG, label: 'Umlaut ile çoğul', anchor: 'Umlaut =', prerequisites: ['day5.cogul.die'] },
    { id: 'day5.cogul.kalip-ezber', topicId: D5_COG, label: 'çoğulu kelimeyle birlikte öğrenme', anchor: 'tahmin etmeye çalışma', prerequisites: ['day5.artikel.artikel-cogul-not'] },
    { id: 'day5.belirli.anlam', topicId: D5_BEL, label: 'belirli artikel: belli nesne', anchor: 'Belirli artikel', prerequisites: ['day2.artikel.der-die-das'] },
    { id: 'day5.belirsiz.ein-eine', topicId: D5_BEL, label: 'ein / eine ile bir nesne', anchor: 'ein eril ve nötrde', prerequisites: ['day2.artikel.der-die-das'] },
    { id: 'day5.olumsuz.kein-keine', topicId: D5_BEL, label: 'kein / keine', anchor: 'kein Mann', prerequisites: ['day5.belirsiz.ein-eine'] },
    { id: 'day5.soru.was-ist-das', topicId: D5_BEL, label: 'Was ist das? / Das ist ...', anchor: 'Was ist das?', prerequisites: ['day2.sein.cekim'] },
  ]),

  /* ---------------------------------------------------------------- */
  /* 6. Gün                                                            */
  /* ---------------------------------------------------------------- */
  ...build(6, [
    { id: 'day6.sprechen.anlam-cekim', topicId: D6_FII, label: 'sprechen = konuşmak', anchor: 'sprechen = konuşmak', prerequisites: ['day2.konjugation.duzenli-fiiller'] },
    { id: 'day6.sprechen.du-sprichst', topicId: D6_FII, label: 'du sprichst / er spricht', anchor: 'du sprichst', prerequisites: ['day6.sprechen.anlam-cekim', 'day2.konjugation.du-st'] },
    { id: 'day6.sprechen.resmi-soru', topicId: D6_FII, label: 'Sprechen Sie Deutsch?', anchor: 'Sprechen Sie Deutsch?', prerequisites: ['day2.zamir.Sie-resmi'] },
    { id: 'day6.ulkeler.woher-kommen', topicId: D6_ULK, label: 'Woher kommst du? / Ich komme aus ...', anchor: 'Woher kommst du?', prerequisites: ['day3.soru.woher-kommst-du', 'day3.cevap.kommen-aus'] },
    { id: 'day6.ulkeler.artikelsiz', topicId: D6_ULK, label: 'aus Deutschland / Frankreich', anchor: 'Çoğu ülke adı artikelsiz', prerequisites: ['day6.ulkeler.woher-kommen'] },
    { id: 'day6.ulkeler.artikelli', topicId: D6_ULK, label: 'aus der Türkei / Schweiz', anchor: 'aus der Türkei', prerequisites: ['day3.cevap.aus-der-tuerkei'] },
    { id: 'day6.ulkeler.usa', topicId: D6_ULK, label: 'aus den USA', anchor: 'aus den USA', prerequisites: ['day6.ulkeler.artikelli'] },
    { id: 'day6.uyruk.ich-bin', topicId: D6_UYR, label: 'Ich bin Türke / Türkin', anchor: 'Ich bin ...', prerequisites: ['day2.sein.cekim'] },
    { id: 'day6.uyruk.erkek-kadin', topicId: D6_UYR, label: 'uyrukta erkek / kadın biçimi', anchor: 'Türke / Türkin', prerequisites: ['day6.uyruk.ich-bin'] },
    { id: 'day6.diller.ich-spreche', topicId: D6_UYR, label: 'Ich spreche Deutsch / Türkisch', anchor: 'Ich spreche ...', prerequisites: ['day6.sprechen.anlam-cekim'] },
    { id: 'day6.yazim.ulke-dil-buyuk', topicId: D6_UYR, label: 'ülke ve dil adları büyük harfle yazılır', anchor: 'Ülke adları ve dil adları isim olduğu için büyük harfle', prerequisites: ['day2.artikel.isim-buyuk-harf'] },
  ]),
];

export const CONCEPT_INDEX = new Map(CONCEPTS.map((item) => [item.id, item]));

export function conceptsForDay(day: number): Concept[] {
  return CONCEPTS.filter((item) => item.day === day);
}

export function conceptsForTopic(topicId: string): Concept[] {
  return CONCEPTS.filter((item) => item.topicId === topicId);
}
