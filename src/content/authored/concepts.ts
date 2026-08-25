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
  track?: import('../types.ts').LearningTrack;
  /** UI'da gosterilen kisa ad. */
  title: string;
  /** Kaynak Ozet dosyasindaki H2 basliklariyla eslestirme adaylari. */
  matchTitles: string[];
}

export const SUMMARY_TOPICS: SummaryTopicDef[] = [
  {
    id: 'day1.alfabe-telaffuz',
    day: 1,
    track: 'normal',
    title: 'Alfabe ve Telaffuz',
    matchTitles: ['Alfabe ve Telaffuz'],
  },
  {
    id: 'day1.selamlasma-vedalasma',
    day: 1,
    track: 'normal',
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
  // Private track — 1. Gün
  {
    id: 'private.day1.vorstellung',
    day: 1,
    track: 'private',
    title: 'Kendini Tanıtma',
    matchTitles: ['Kendini Tanıtma — İsim ve Tanışma', 'Kendini Tanıtma'],
  },
  {
    id: 'private.day1.alter-herkunft-wohnort',
    day: 1,
    track: 'private',
    title: 'Yaş, Köken ve İkamet',
    matchTitles: ['Yaş, Köken ve İkamet'],
  },
  {
    id: 'private.day1.beruf',
    day: 1,
    track: 'private',
    title: 'Meslek',
    matchTitles: ['Meslek — Ne İş Yapıyorsun?', 'Meslek'],
  },
  {
    id: 'private.day1.kontakt-formular',
    day: 1,
    track: 'private',
    title: 'İletişim ve Form',
    matchTitles: ['İletişim ve Form — Kişisel Bilgiler', 'İletişim ve Form'],
  },
  {
    id: 'private.day1.fiil-cekimi',
    day: 1,
    track: 'private',
    title: 'Fiil Çekimi',
    matchTitles: ['Fiil Çekimi — Düzenli ve Düzensiz Fiiller', 'Fiil Çekimi'],
  },
  {
    id: 'private.day1.diller-selamlasma',
    day: 1,
    track: 'private',
    title: 'Diller ve Selamlaşma',
    matchTitles: ['Diller ve Selamlaşma'],
  },
  // Private track — 2. Gün
  {
    id: 'private.day2.artikel-belirli-belirsiz',
    day: 2,
    track: 'private',
    title: 'Belirli ve Belirsiz Artikeller',
    matchTitles: ['Belirli ve Belirsiz Artikeller — der, die, das, die (Pl.) / ein, eine', 'Belirli ve Belirsiz Artikeller'],
  },
  {
    id: 'private.day2.artikel-kein-mein-dein',
    day: 2,
    track: 'private',
    title: 'Olumsuz ve İyelik Artikelleri',
    matchTitles: ['Olumsuz ve İyelik Artikelleri — kein, dein, mein', 'Olumsuz ve İyelik Artikelleri'],
  },
  {
    id: 'private.day2.cumle-olumlu',
    day: 2,
    track: 'private',
    title: 'Olumlu Cümle Kurma',
    matchTitles: ['Olumlu Cümle Kurma'],
  },
  {
    id: 'private.day2.cumle-olumsuz',
    day: 2,
    track: 'private',
    title: 'Olumsuz Cümle Kurma',
    matchTitles: ['Olumsuz Cümle Kurma — nicht / kein', 'Olumsuz Cümle Kurma'],
  },
  {
    id: 'private.day2.sorular',
    day: 2,
    track: 'private',
    title: 'Evet/Hayır Soruları',
    matchTitles: ['Evet/Hayır Soruları'],
  },
  {
    id: 'private.day2.haben-sein',
    day: 2,
    track: 'private',
    title: 'haben ve sein — Kısa Tekrar',
    matchTitles: ['haben ve sein — Kısa Tekrar'],
  },
  {
    id: 'private.day2.gunluk-hayat',
    day: 2,
    track: 'private',
    title: 'Günlük Hayat Cümleleri',
    matchTitles: ['Günlük Hayat Cümleleri'],
  },
  // Private track — 3. Gün
  {
    id: 'private.day3.hedef',
    day: 3,
    track: 'private',
    title: 'Bugünün Hedefi',
    matchTitles: ['Bugünün Hedefi'],
  },
  {
    id: 'private.day3.mogen-moechten-gern',
    day: 3,
    track: 'private',
    title: 'Sevmek ve İstemek',
    matchTitles: ['Sevmek ve İstemek — mögen, gern, möchten', 'Sevmek ve İstemek'],
  },
  {
    id: 'private.day3.es-gibt',
    day: 3,
    track: 'private',
    title: 'es gibt — Var / Yok',
    matchTitles: ['es gibt — Var / Yok', 'es gibt'],
  },
  {
    id: 'private.day3.yer-yon',
    day: 3,
    track: 'private',
    title: 'Yer, Yön ve Küçük Ama Önemli Kelimeler',
    matchTitles: ['Yer, Yön ve Küçük Ama Önemli Kelimeler'],
  },
  {
    id: 'private.day3.ayrilabilen-fiiller',
    day: 3,
    track: 'private',
    title: 'Ayrılabilen Fiiller',
    matchTitles: ['Ayrılabilen Fiiller'],
  },
  {
    id: 'private.day3.refleksif',
    day: 3,
    track: 'private',
    title: 'Refleksif Fiiller',
    matchTitles: ['Refleksif Fiiller'],
  },
  {
    id: 'private.day3.sifat-ekleri',
    day: 3,
    track: 'private',
    title: 'Sıfatlar ve Ekler',
    matchTitles: ['Sıfatlar ve Ekler'],
  },
  {
    id: 'private.day3.iyelik',
    day: 3,
    track: 'private',
    title: 'İyelik Yapıları',
    matchTitles: ['İyelik Yapıları — mein, dein, unser, ihr', 'İyelik Yapıları'],
  },
  {
    id: 'private.day3.miktar-cogul',
    day: 3,
    track: 'private',
    title: 'Sayılar, Miktarlar ve Çoğullar',
    matchTitles: ['Sayılar, Miktarlar ve Çoğullar'],
  },
  {
    id: 'private.day3.zaman',
    day: 3,
    track: 'private',
    title: 'Zaman İfadeleri',
    matchTitles: ['Zaman İfadeleri'],
  },
  {
    id: 'private.day3.cumle-dizilisi',
    day: 3,
    track: 'private',
    title: 'Cümle Dizilişi',
    matchTitles: ['Cümle Dizilişi — Verb İkinci Sırada', 'Cümle Dizilişi'],
  },
  {
    id: 'private.day3.gunluk-hayat',
    day: 3,
    track: 'private',
    title: 'Günlük Hayat, Hava, Hayvanlar ve Alışveriş',
    matchTitles: ['Günlük Hayat, Hava, Hayvanlar ve Alışveriş'],
  },
  {
    id: 'private.day3.master-cumleler',
    day: 3,
    track: 'private',
    title: '8 Temsilci Cümle',
    matchTitles: ['8 Temsilci Cümle — Detaylı Çözümleme', '8 Temsilci Cümle'],
  },
  {
    id: 'private.day3.tum-cumleler',
    day: 3,
    track: 'private',
    title: '80 Cümlenin Doğru Almancası',
    matchTitles: ['80 Cümlenin Doğru Almancası'],
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
  return buildTrack(day, 'normal', specs);
}

function buildTrack(
  day: number,
  track: import('../types.ts').LearningTrack,
  specs: ConceptSpec[],
): Array<Concept & { anchor: string }> {
  return specs.map((spec) => ({
    id: spec.id,
    day,
    track: track === 'normal' ? undefined : track,
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
const PV = 'private.day1.vorstellung';
const PA = 'private.day1.alter-herkunft-wohnort';
const PB = 'private.day1.beruf';
const PK = 'private.day1.kontakt-formular';
const PF = 'private.day1.fiil-cekimi';
const PD = 'private.day1.diller-selamlasma';
const P2_ART = 'private.day2.artikel-belirli-belirsiz';
const P2_KMD = 'private.day2.artikel-kein-mein-dein';
const P2_POS = 'private.day2.cumle-olumlu';
const P2_NEG = 'private.day2.cumle-olumsuz';
const P2_SOR = 'private.day2.sorular';
const P2_HS = 'private.day2.haben-sein';
const P2_GUN = 'private.day2.gunluk-hayat';
const P3_HED = 'private.day3.hedef';
const P3_MG = 'private.day3.mogen-moechten-gern';
const P3_EG = 'private.day3.es-gibt';
const P3_YY = 'private.day3.yer-yon';
const P3_AF = 'private.day3.ayrilabilen-fiiller';
const P3_RF = 'private.day3.refleksif';
const P3_SF = 'private.day3.sifat-ekleri';
const P3_IY = 'private.day3.iyelik';
const P3_MK = 'private.day3.miktar-cogul';
const P3_ZI = 'private.day3.zaman';
const P3_CD = 'private.day3.cumle-dizilisi';
const P3_GH = 'private.day3.gunluk-hayat';

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

  /* ---------------------------------------------------------------- */
  /* Özel Ders — 1. Gün                                                */
  /* ---------------------------------------------------------------- */
  ...buildTrack(1, 'private', [
    { id: 'private.day1.vorstellung.wie-heisst-du', topicId: PV, label: 'Wie heißt du? / Wie heißen Sie?', anchor: 'Wie heißt du?' },
    { id: 'private.day1.vorstellung.wie-ist-dein-name', topicId: PV, label: 'Wie ist dein Name? / Ihr Name?', anchor: 'Wie ist dein Name?' },
    { id: 'private.day1.vorstellung.wer-bist-du', topicId: PV, label: 'Wer bist du? / Wer sind Sie?', anchor: 'Wer bist du?' },
    { id: 'private.day1.vorstellung.freut-mich', topicId: PV, label: 'Freut mich! / Ich habe mich gefreut!', anchor: 'Freut mich!' },
    { id: 'private.day1.vorstellung.sich-vorstellen', topicId: PV, label: 'Kannst du dich bitte vorstellen?', anchor: 'Kannst du dich bitte vorstellen?' },

    { id: 'private.day1.alter.wie-alt', topicId: PA, label: 'Wie alt bist du? / Wie alt sind Sie?', anchor: 'Wie alt bist du?' },
    { id: 'private.day1.herkunft.woher', topicId: PA, label: 'Woher kommst du? / Woher kommen Sie?', anchor: 'Woher kommst du?' },
    { id: 'private.day1.wohnort.wo-wohnst', topicId: PA, label: 'Wo wohnst du? / Wo wohnen Sie?', anchor: 'Wo wohnst du?' },
    { id: 'private.day1.herkunft.aus', topicId: PA, label: 'Ich komme aus ...', anchor: 'Ich komme aus Sakarya' },
    { id: 'private.day1.wohnort.in', topicId: PA, label: 'Ich wohne in ...', anchor: 'Ich wohne in Sakarya' },

    { id: 'private.day1.beruf.frage', topicId: PB, label: 'Was machst du beruflich?', anchor: 'Was machst du beruflich?' },
    { id: 'private.day1.beruf.antwort-bin', topicId: PB, label: 'Ich bin Student.', anchor: 'Ich bin Student' },
    { id: 'private.day1.beruf.als-bei', topicId: PB, label: 'Ich arbeite als / bei ...', anchor: 'Ich arbeite als Lehrerin' },

    { id: 'private.day1.kontakt.email', topicId: PK, label: 'Wie ist deine E-Mail-Adresse?', anchor: 'Wie ist deine E-Mail-Adresse?' },
    { id: 'private.day1.kontakt.punkt', topicId: PK, label: 'Punkt (e-posta nokta)', anchor: 'Punkt' },
    { id: 'private.day1.kontakt.telefon', topicId: PK, label: 'Wie ist deine Telefonnummer?', anchor: 'Wie ist deine Telefonnummer?' },
    { id: 'private.day1.kontakt.antwort-telefon', topicId: PK, label: 'Meine Telefonnummer ist ...', anchor: 'Meine Telefonnummer ist' },
    { id: 'private.day1.formular.felder', topicId: PK, label: 'Form alanları: Vorname, Nachname...', anchor: 'Vorname' },
    { id: 'private.day1.formular.familienstand', topicId: PK, label: 'Familienstand: ledig', anchor: 'Familienstand' },
    { id: 'private.day1.formular.kinder', topicId: PK, label: 'Ich habe keine Kinder.', anchor: 'Ich habe keine Kinder' },
    { id: 'private.day1.formular.heimat', topicId: PK, label: 'Heimat: Türkei', anchor: 'Heimat' },

    { id: 'private.day1.verben.sein', topicId: PF, label: 'sein: ich bin, du bist ...', anchor: 'ich bin' },
    { id: 'private.day1.verben.heissen', topicId: PF, label: 'heißen: ich heiße ...', anchor: 'ich heiße' },
    { id: 'private.day1.verben.kommen', topicId: PF, label: 'kommen: ich komme ...', anchor: 'ich komme' },
    { id: 'private.day1.verben.essen', topicId: PF, label: 'essen: ich esse, du isst', anchor: 'ich esse' },
    { id: 'private.day1.verben.sagen', topicId: PF, label: 'sagen: ich sage ...', anchor: 'ich sage' },
    { id: 'private.day1.verben.sprechen', topicId: PF, label: 'sprechen: ich spreche, du sprichst', anchor: 'ich spreche' },
    { id: 'private.day1.verben.kochen', topicId: PF, label: 'kochen: ich koche ...', anchor: 'ich koche' },

    { id: 'private.day1.sprachen.welche', topicId: PD, label: 'Welche Sprachen sprichst du?', anchor: 'Welche Sprachen sprichst du?' },
    { id: 'private.day1.sprachen.antwort', topicId: PD, label: 'Ich spreche Englisch, Türkisch ...', anchor: 'Ich spreche Englisch' },
    { id: 'private.day1.selamlasma.hallo', topicId: PD, label: 'Hallo!, Guten Morgen ...', anchor: 'Hallo!' },
    { id: 'private.day1.nezaket.entschuldigung', topicId: PD, label: 'Entschuldigung, Danke schön, Bitte', anchor: 'Entschuldigung' },
  ]),

  /* ---------------------------------------------------------------- */
  /* Özel Ders — 2. Gün                                                */
  /* ---------------------------------------------------------------- */
  ...buildTrack(2, 'private', [
    { id: 'private.day2.artikel.der-die-das-die-pl', topicId: P2_ART, label: 'der / die / das / die (Pl.)', anchor: 'der, die, das, die (Pl.)' },
    { id: 'private.day2.artikel.ein-eine', topicId: P2_ART, label: 'ein / eine', anchor: 'ein, eine' },
    { id: 'private.day2.artikel.cogul-belirsiz-yok', topicId: P2_ART, label: 'çoğulda belirsiz artikel yok', anchor: 'çoğulda belirsiz artikel yoktur' },
    { id: 'private.day2.artikel.was-ist-das', topicId: P2_ART, label: 'Was ist das? → Das ist ein/eine ...', anchor: 'Was ist das?' },
    { id: 'private.day2.wortschatz.nesneler', topicId: P2_ART, label: '2. Gün nesne kelimeleri (der Vater, die Mutter ...)', anchor: 'der Vater' },

    { id: 'private.day2.artikel.kein-keine', topicId: P2_KMD, label: 'kein / keine', anchor: 'kein, keine', prerequisites: ['private.day2.artikel.ein-eine'] },
    { id: 'private.day2.artikel.mein-meine', topicId: P2_KMD, label: 'mein / meine', anchor: 'mein, meine', prerequisites: ['private.day2.artikel.kein-keine'] },
    { id: 'private.day2.artikel.dein-deine', topicId: P2_KMD, label: 'dein / deine', anchor: 'dein, deine', prerequisites: ['private.day2.artikel.kein-keine'] },
    { id: 'private.day2.artikel.zincir', topicId: P2_KMD, label: 'artikel zinciri: der/das → ein → kein → dein → mein', anchor: 'Artikel zinciri', prerequisites: ['private.day2.artikel.ein-eine', 'private.day2.artikel.kein-keine', 'private.day2.artikel.mein-meine', 'private.day2.artikel.dein-deine'] },
    { id: 'private.day2.artikel.wie-ist-dein', topicId: P2_KMD, label: 'Wie ist dein/deine ...?', anchor: 'Wie ist dein', prerequisites: ['private.day2.artikel.dein-deine', 'private.day2.artikel.mein-meine'] },

    { id: 'private.day2.cumle.olumlu-yapi', topicId: P2_POS, label: 'Özne + Fiil + Nesne + diğer bilgiler', anchor: 'Özne + Fiil + Nesne' },
    { id: 'private.day2.verben.machen', topicId: P2_POS, label: 'machen = yapmak', anchor: 'machen = yapmak', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.verben.gehen-zur', topicId: P2_POS, label: 'gehen + zur Schule / zur Arbeit', anchor: 'zur Schule', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.zaman.jeden-tag-heute', topicId: P2_POS, label: 'jeden Tag, heute, jeden Morgen, um ... Uhr', anchor: 'jeden Morgen', prerequisites: ['private.day2.cumle.olumlu-yapi'] },

    { id: 'private.day2.olumsuzluk.nicht', topicId: P2_NEG, label: 'nicht: fiili/diğer bilgiyi olumsuzlar', anchor: 'fiili ya da zaman/yer bilgisini olumsuzlar', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.olumsuzluk.kein-haben', topicId: P2_NEG, label: 'kein/keine: haben + nesneyi olumsuzlar', anchor: 'haben + isim kalıbında nesneyi olumsuzlamak', prerequisites: ['private.day2.artikel.kein-keine', 'private.day1.formular.kinder'] },
    { id: 'private.day2.olumsuzluk.donusum', topicId: P2_NEG, label: 'olumlu → olumsuz cümle dönüşümü', anchor: 'Sie geht heute nicht zur Schule', prerequisites: ['private.day2.olumsuzluk.nicht', 'private.day2.olumsuzluk.kein-haben'] },

    { id: 'private.day2.sorular.evet-hayir-yapi', topicId: P2_SOR, label: 'Fiil + Özne + ... ? yapısı', anchor: 'Fiil + Özne + Nesne + (diğer bilgiler) ?', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.sorular.donusum', topicId: P2_SOR, label: 'cümle → soru dönüşümü', anchor: 'Cümle → Soru dönüşümü', prerequisites: ['private.day2.sorular.evet-hayir-yapi'] },
    { id: 'private.day2.sorular.ja-nein-cevap', topicId: P2_SOR, label: 'Ja / Nein tam cümle cevap', anchor: 'Soru + Ja/Nein cevabı', prerequisites: ['private.day2.sorular.donusum', 'private.day2.olumsuzluk.kein-haben'] },

    { id: 'private.day2.haben.tablo', topicId: P2_HS, label: 'haben çekimi: habe, hast, hat, haben, habt', anchor: 'haben — sahip olmak' },
    { id: 'private.day2.sein.tekrar', topicId: P2_HS, label: 'sein çekimi tekrar', anchor: 'sein çekimi (tekrar)', prerequisites: ['private.day1.verben.sein'] },
    { id: 'private.day2.haben.kein-ile', topicId: P2_HS, label: 'haben + kein/keine kalıbı (pekiştirme)', anchor: 'Ich habe kein Geld', prerequisites: ['private.day2.haben.tablo', 'private.day2.artikel.kein-keine'] },

    { id: 'private.day2.gunluk.okul-is', topicId: P2_GUN, label: 'zur Schule / zur Arbeit gitmek', anchor: 'Okul ve iş', prerequisites: ['private.day2.verben.gehen-zur'] },
    { id: 'private.day2.gunluk.kahve-spor', topicId: P2_GUN, label: 'Kaffee trinken, Sport machen', anchor: 'Kaffee trinken, Sport machen', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.gunluk.kitap-okuma', topicId: P2_GUN, label: 'ein Buch lesen', anchor: 'ein Buch lesen', prerequisites: ['private.day2.cumle.olumlu-yapi'] },
    { id: 'private.day2.gunluk.mini-dialog', topicId: P2_GUN, label: 'mini diyalog: soru + Ja/Nein cevap', anchor: 'Mini diyalog', prerequisites: ['private.day2.sorular.ja-nein-cevap'] },
  ]),

  /* ---------------------------------------------------------------- */
  /* Özel Ders — 3. Gün                                                */
  /* ---------------------------------------------------------------- */
  ...buildTrack(3, 'private', [
    { id: 'private.day3.hedef.giris', topicId: P3_HED, label: '4. Gün hedefi: 80 cümleyi üretmek', anchor: '80 Türkçe cümle' },

    { id: 'private.day3.mogen.cekim', topicId: P3_MG, label: 'mögen çekimi: ich mag, du magst ...', anchor: 'ich mag' },
    { id: 'private.day3.moechten.cekim', topicId: P3_MG, label: 'möchten çekimi: ich möchte, du möchtest ...', anchor: 'ich möchte' },
    { id: 'private.day3.gern.kullanim', topicId: P3_MG, label: 'Fiil + gern kalıbı', anchor: 'Fiil + gern' },
    { id: 'private.day3.mogen-gern-farki', topicId: P3_MG, label: 'mag (isim ister) ↔ gern (fiilden sonra gelir)', anchor: 'mag bir ismi doğrudan sever' },

    { id: 'private.day3.esgibt.temel', topicId: P3_EG, label: 'es gibt = var', anchor: 'Es gibt' },
    { id: 'private.day3.esgibt.akkusativ', topicId: P3_EG, label: 'es gibt + Akkusativ (der → einen)', anchor: 'es gibt her zaman Akkusativ ister', prerequisites: ['private.day3.esgibt.temel'] },
    { id: 'private.day3.esgibt.genel-cogul', topicId: P3_EG, label: 'genel ifadede çoğul isim artikelsiz kullanılır', anchor: 'Genel ve sayılamayan durumlarda' },

    { id: 'private.day3.kontraksiyon.zum', topicId: P3_YY, label: 'zum = zu + dem', anchor: 'zum = zu + dem' },
    { id: 'private.day3.kontraksiyon.zur', topicId: P3_YY, label: 'zur = zu + der', anchor: 'zur = zu + der' },
    { id: 'private.day3.kontraksiyon.im', topicId: P3_YY, label: 'im = in + dem', anchor: 'im = in + dem' },
    { id: 'private.day3.kontraksiyon.ins', topicId: P3_YY, label: 'ins = in + das', anchor: 'ins = in + das' },
    { id: 'private.day3.kontraksiyon.am', topicId: P3_YY, label: 'am = an + dem', anchor: 'am = an + dem' },
    { id: 'private.day3.kontraksiyon.ans', topicId: P3_YY, label: 'ans = an + das (bonus)', anchor: 'ans = an + das' },
    { id: 'private.day3.im-ins-farki', topicId: P3_YY, label: 'im (yerde) ↔ ins (yöne) farkı', anchor: 'im yerde kalmayı, ins ise bir yöne gitmeyi anlatır', prerequisites: ['private.day3.kontraksiyon.im', 'private.day3.kontraksiyon.ins'] },
    { id: 'private.day3.nach-hause', topicId: P3_YY, label: 'nach Hause = eve (yöne)', anchor: 'nach Hause' },
    { id: 'private.day3.zu-hause', topicId: P3_YY, label: 'zu Hause = evde', anchor: 'zu Hause' },
    { id: 'private.day3.mit-dativ', topicId: P3_YY, label: 'mit + Dativ ister', anchor: 'mit her zaman Dativ ister' },
    { id: 'private.day3.mit-meinen-freunden', topicId: P3_YY, label: 'mit meinen Freunden — Dativ çoğulda -n', anchor: 'meinen Freunden', prerequisites: ['private.day3.mit-dativ'] },
    { id: 'private.day3.der-den-dem', topicId: P3_YY, label: 'der (Nominativ) / den (Akkusativ) / dem (Dativ)', anchor: 'der / den / dem' },
    { id: 'private.day3.in-akkusativ-yon', topicId: P3_YY, label: 'in + Akkusativ (yöne giderken): in den Park', anchor: 'in den Park', prerequisites: ['private.day3.der-den-dem'] },
    { id: 'private.day3.auf-dem', topicId: P3_YY, label: 'auf + dem (üzerinde)', anchor: 'auf dem' },
    { id: 'private.day3.bei-der', topicId: P3_YY, label: 'bei + Dativ (yanında)', anchor: 'bei der Schule' },

    { id: 'private.day3.ayrilabilen.kural', topicId: P3_AF, label: 'ayrılabilen fiil kuralı: önek cümlenin sonuna gider', anchor: 'önek cümlenin en sonuna gider' },
    { id: 'private.day3.aufstehen', topicId: P3_AF, label: 'aufstehen = kalkmak', anchor: 'aufstehen = kalkmak', prerequisites: ['private.day3.ayrilabilen.kural'] },
    { id: 'private.day3.aufraeumen', topicId: P3_AF, label: 'aufräumen = toplamak/düzenlemek', anchor: 'aufräumen = toplamak', prerequisites: ['private.day3.ayrilabilen.kural'] },
    { id: 'private.day3.zurueckkommen', topicId: P3_AF, label: 'zurückkommen = geri dönmek', anchor: 'zurückkommen = geri dönmek', prerequisites: ['private.day3.ayrilabilen.kural'] },

    { id: 'private.day3.refleksif.temel', topicId: P3_RF, label: 'refleksif zamirler: mich, dich, sich, uns, euch, sich', anchor: 'mich, dich, sich' },
    { id: 'private.day3.sich-duschen', topicId: P3_RF, label: 'sich duschen = duş almak', anchor: 'sich duschen', prerequisites: ['private.day3.refleksif.temel'] },
    { id: 'private.day3.sich-ausruhen', topicId: P3_RF, label: 'sich ausruhen = dinlenmek', anchor: 'sich ausruhen', prerequisites: ['private.day3.refleksif.temel'] },
    { id: 'private.day3.refleksif-ayrilabilen', topicId: P3_RF, label: 'refleksif + ayrılabilen birlikte: ruhe mich ... aus', anchor: 'ruhe mich', prerequisites: ['private.day3.sich-ausruhen', 'private.day3.ayrilabilen.kural'] },

    { id: 'private.day3.sifat.yuklem', topicId: P3_SF, label: 'sein + sıfat → ek almaz', anchor: 'sein fiilinden sonra sıfat ek almaz' },
    { id: 'private.day3.sifat.ein-notr', topicId: P3_SF, label: 'ein + nötr isim + sıfat → -es', anchor: 'ein neues T-Shirt' },
    { id: 'private.day3.sifat.cogul-artikelsiz', topicId: P3_SF, label: 'artikelsiz çoğul + sıfat → -e', anchor: 'schwarze Schuhe' },

    { id: 'private.day3.iyelik.unser', topicId: P3_IY, label: 'unser / unsere = bizim', anchor: 'unser / unsere' },
    { id: 'private.day3.iyelik.ihr', topicId: P3_IY, label: 'ihr / ihre = onun (kadın) / onların', anchor: 'ihr / ihre' },
    { id: 'private.day3.iyelik.dativ-cogul', topicId: P3_IY, label: 'iyelik + Dativ çoğul: meinen, deinen ...', anchor: 'meinen, deinen', prerequisites: ['private.day3.mit-meinen-freunden'] },

    { id: 'private.day3.miktar.sise', topicId: P3_MK, label: 'Zahl + Flasche(n) + Nomen: zwei Flaschen Wasser', anchor: 'zwei Flaschen' },
    { id: 'private.day3.miktar.oda', topicId: P3_MK, label: 'Zahl + Zimmer (çoğulu değişmez)', anchor: 'drei Zimmer' },
    { id: 'private.day3.cogul.genel', topicId: P3_MK, label: 'genel ifadelerde çoğul isim artikelsiz', anchor: 'Genel ifadelerde' },
    { id: 'private.day3.cogul.umlaut', topicId: P3_MK, label: 'Buch → Bücher (Umlaut çoğul, tekrar)', anchor: 'Bücher' },

    { id: 'private.day3.zaman.um-uhr', topicId: P3_ZI, label: 'um + saat', anchor: 'um 7 Uhr' },
    { id: 'private.day3.zaman.am', topicId: P3_ZI, label: 'am Morgen / am Abend / am Wochenende', anchor: 'am Morgen', prerequisites: ['private.day3.kontraksiyon.am'] },
    { id: 'private.day3.zaman.im-mevsim', topicId: P3_ZI, label: 'im Winter / im Sommer', anchor: 'im Winter', prerequisites: ['private.day3.kontraksiyon.im'] },
    { id: 'private.day3.zaman.dann', topicId: P3_ZI, label: 'dann / danach = sonra', anchor: 'Dann' },
    { id: 'private.day3.zaman.morgen-cift-anlam', topicId: P3_ZI, label: 'morgen (yarın, küçük harf) ↔ der Morgen (sabah, isim)', anchor: 'morgen küçük harfle' },

    { id: 'private.day3.dizilisi.verb-ikinci', topicId: P3_CD, label: 'fiil her zaman ikinci sırada (V2)', anchor: 'fiil her zaman ikinci sırada' },
    { id: 'private.day3.dizilisi.zaman-basta', topicId: P3_CD, label: 'zaman ifadesi başa geldiğinde fiil hemen arkasından gelir', anchor: 'Zaman ifadesi cümle başına', prerequisites: ['private.day3.dizilisi.verb-ikinci'] },
    { id: 'private.day3.moechten-infinitiv', topicId: P3_CD, label: 'möchte + ... + fiil (mastar) cümle sonunda', anchor: 'mastar halinde cümlenin en sonuna gider', prerequisites: ['private.day3.moechten.cekim'] },

    { id: 'private.day3.hava.ifadeler', topicId: P3_GH, label: 'Wetter ifadeleri: schön, warm, kalt', anchor: 'Das Wetter ist' },
    { id: 'private.day3.hayvanlar.kelime', topicId: P3_GH, label: 'Hayvan kelimeleri: die Katze, der Hund, das Tier', anchor: 'die Katze' },
    { id: 'private.day3.hobiler.kelime', topicId: P3_GH, label: 'Hobi kelimeleri: schwimmen, Fußball, lesen, fotografieren', anchor: 'gern Fußball' },
    { id: 'private.day3.alisveris.kelime', topicId: P3_GH, label: 'Alışveriş kelimeleri: kaufen, T-Shirt, Schuhe, Hose', anchor: 'kaufen' },
    { id: 'private.day3.ev-kelime', topicId: P3_GH, label: 'Ev kelimeleri: die Wohnung, das Zimmer, der Balkon, der Garten', anchor: 'die Wohnung' },
    { id: 'private.day3.gunluk-rutin', topicId: P3_GH, label: 'Günlük rutin fiilleri: frühstücken, putzen, gießen, hören', anchor: 'frühstücken' },
    { id: 'private.day3.es-geht-mir', topicId: P3_GH, label: 'Es geht mir gut = iyiyim', anchor: 'Es geht mir gut' },
  ]),
];

export const CONCEPT_INDEX = new Map(CONCEPTS.map((item) => [item.id, item]));

export function conceptsForDay(day: number): Concept[] {
  return CONCEPTS.filter((item) => item.day === day);
}

export function conceptsForTopic(topicId: string): Concept[] {
  return CONCEPTS.filter((item) => item.topicId === topicId);
}
