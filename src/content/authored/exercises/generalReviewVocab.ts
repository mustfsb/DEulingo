/**
 * Genel Tekrar — Kelime Çalışması (48).
 *
 * Tüm söz varlığı genuinely learned: Özel Ders 1, 2, 3, 5, 7, 10. günler.
 * İsimlerde her zaman artikel + isim sorulur/öğretilir.
 */

import type { AuthoredExercise } from '../types.ts';
import { DE_PROD, G } from './generalReviewBase.ts';

const KON = 'private.day1.kontakt-formular';
const P2A = 'private.day2.artikel-belirli-belirsiz';
const P3G = 'private.day3.gunluk-hayat';
const P5K = 'private.day5.kelimeler';
const P5Y = 'private.day5.yiyecek';
const P7E = 'private.day7.essen-trinken';
const P7Y = 'private.day7.yeni-yiyecek';
const P7M = 'private.day7.mobilyalar';
const P7O = 'private.day7.ev-odalar';
const P7F = 'private.day7.faydali-kelimeler';
const P7Q = 'private.day7.miktar';
const P7A = 'private.day7.alisveris-siklik';
const P10W = 'private.day10.wortschatz';

export const GENERAL_REVIEW_VOCAB: AuthoredExercise[] = [
  /* ---------- Almanca → Türkçe (tanıma, 12) ---------- */
  G('gr-kelime-pfannkuchen-tr', P5Y, 'multiple-choice', 'easy', 'recognition', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Anlamını seç:', prompt: 'der Pfannkuchen',
    answer: 'krep',
    options: ['krep', 'kek', 'un', 'meyve suyu'],
    pronounce: ['der Pfannkuchen'],
  }),
  G('gr-kelime-geschwister-tr', P5K, 'multiple-choice', 'easy', 'recognition', ['private.day5.kelime.geschwister'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Meine Geschwister wohnen in Sakarya.',
    answer: 'Kardeşlerim Sakarya’da oturuyor.',
    options: ['Kardeşlerim Sakarya’da oturuyor.', 'Misafirlerim Sakarya’da oturuyor.', 'Kardeşim Sakarya’da oturuyor.', 'Ailem Sakarya’da oturuyor.'],
    pronounce: ['Meine Geschwister wohnen in Sakarya.'],
  }),
  G('gr-kelime-flughafen-tr', P5K, 'multiple-choice', 'easy', 'recognition', ['private.day5.kelime.flughafen'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Ich bin am Flughafen.',
    answer: 'Havaalanındayım.',
    options: ['Havaalanındayım.', 'Havaalanına gidiyorum.', 'Uçaktayım.', 'Gardayım.'],
    pronounce: ['Ich bin am Flughafen.'],
  }),
  G('gr-kelime-einkaufswagen-tr', P7A, 'multiple-choice', 'easy', 'recognition', ['private.day7.alisveris.einkaufswagen'], {
    instruction: 'Bu kelime ne demek?', prompt: 'der Einkaufswagen',
    answer: 'alışveriş arabası',
    options: ['alışveriş arabası', 'alışveriş listesi', 'alışveriş çantası', 'kasa'],
    pronounce: ['der Einkaufswagen'],
  }),
  G('gr-kelime-badewanne-tr', P10W, 'multiple-choice', 'easy', 'recognition', ['private.day10.wort.badewanne'], {
    instruction: 'Anlamını seç:', prompt: 'die Badewanne',
    answer: 'küvet',
    options: ['küvet', 'lavabo', 'duş', 'ocak'],
    pronounce: ['die Badewanne'],
  }),
  G('gr-kelime-traum-tr', P7F, 'multiple-choice', 'easy', 'recognition', ['private.day7.kelime.gluecklich'], {
    instruction: 'Bu kelime ne demek?', prompt: 'der Traum',
    answer: 'hayal / rüya',
    options: ['hayal / rüya', 'misafir', 'an', 'tat'],
    pronounce: ['der Traum'],
  }),
  G('gr-kelime-leute-tr', P7F, 'multiple-choice', 'easy', 'recognition', ['private.day7.kelime.gast-leute'], {
    instruction: 'Anlamını seç:', prompt: 'die Leute',
    answer: 'insanlar',
    options: ['insanlar', 'misafirler', 'kardeşler', 'eşyalar'],
    pronounce: ['die Leute'],
  }),
  G('gr-kelime-leider-tr', P5K, 'multiple-choice', 'easy', 'recognition', ['private.day5.kelime.leider'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Leider komme ich heute nicht.',
    answer: 'Maalesef bugün gelmiyorum.',
    options: ['Maalesef bugün gelmiyorum.', 'Neyse ki bugün geliyorum.', 'Maalesef dün geldim.', 'Bugün birlikte gelmiyoruz.'],
    pronounce: ['Leider komme ich heute nicht.'],
  }),
  G('gr-kelime-seit-tr', P5K, 'multiple-choice', 'easy', 'recognition', ['private.day5.kelime.seit'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Ich wohne seit 2019 in Sakarya.',
    answer: '2019’dan beri Sakarya’da oturuyorum.',
    options: ['2019’dan beri Sakarya’da oturuyorum.', '2019’da Sakarya’ya taşındım.', 'Sakarya’da 2019 gün oturuyorum.', '2019 için Sakarya’dayım.'],
    pronounce: ['Ich wohne seit 2019 in Sakarya.'],
  }),
  G('gr-kelime-zusammen-tr', P7F, 'multiple-choice', 'easy', 'recognition', ['private.day7.kelime.zusammen-dort'], {
    instruction: 'Bu kelime ne demek?', prompt: 'zusammen',
    answer: 'birlikte',
    options: ['birlikte', 'orada', 'hazır', 'sadece'],
    pronounce: ['zusammen'],
  }),
  G('gr-kelime-fertig-tr', P7F, 'multiple-choice', 'easy', 'recognition', ['private.day7.kelime.dazu-fertig-schmeckt'], {
    instruction: 'Anlamını seç:', prompt: 'fertig',
    answer: 'hazır / bitmiş',
    options: ['hazır / bitmiş', 'lezzetli', 'pahalı', 'serin'],
    pronounce: ['fertig'],
  }),
  G('gr-kelime-ziemlich-tr', P10W, 'multiple-choice', 'easy', 'recognition', ['private.day10.wort.ziemlich'], {
    instruction: 'Bu kelime ne demek?', prompt: 'ziemlich',
    answer: 'oldukça',
    options: ['oldukça', 'sadece', 'asla', 'hemen'],
    pronounce: ['ziemlich'],
  }),

  /* ---------- Türkçe → Almanca (üretim, 12) ---------- */
  G('gr-kelime-sandvic-de', P5Y, 'free-text', 'medium', 'production', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'küçük ekmek',
    answer: 'das Brötchen', acceptedAnswers: ['Brötchen'],
    validation: DE_PROD, pronounce: ['das Brötchen'],
  }),
  G('gr-kelime-kardesler-de', P5K, 'free-text', 'medium', 'production', ['private.day5.kelime.geschwister'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'kardeşler',
    answer: 'die Geschwister', acceptedAnswers: ['Geschwister'],
    validation: DE_PROD, pronounce: ['die Geschwister'],
  }),
  G('gr-kelime-havaalani-de', P5K, 'free-text', 'medium', 'production', ['private.day5.kelime.flughafen'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'havaalanı',
    answer: 'der Flughafen', acceptedAnswers: ['Flughafen'],
    validation: DE_PROD, pronounce: ['der Flughafen'],
  }),
  G('gr-kelime-kuvet-de', P10W, 'free-text', 'medium', 'production', ['private.day10.wort.badewanne'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'küvet',
    answer: 'die Badewanne', acceptedAnswers: ['Badewanne'],
    validation: DE_PROD, pronounce: ['die Badewanne'],
  }),
  G('gr-kelime-misafir-de', P7F, 'free-text', 'medium', 'production', ['private.day7.kelime.gast-leute'], {
    instruction: 'Almancasını artikeliyle yaz (tekil):', prompt: 'misafir',
    answer: 'der Gast', acceptedAnswers: ['Gast'],
    validation: DE_PROD, pronounce: ['der Gast'],
  }),
  G('gr-kelime-insanlar-de', P7F, 'free-text', 'medium', 'production', ['private.day7.kelime.gast-leute'], {
    instruction: 'Almancasını artikeliyle yaz (çoğul):', prompt: 'insanlar',
    answer: 'die Leute', acceptedAnswers: ['Leute'],
    validation: DE_PROD, pronounce: ['die Leute'],
  }),
  G('gr-kelime-mutfak-de', P7O, 'free-text', 'easy', 'production', ['private.day7.ev.kueche'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'mutfak',
    answer: 'die Küche', acceptedAnswers: ['Küche'],
    validation: DE_PROD, pronounce: ['die Küche'],
  }),
  G('gr-kelime-koltuk-de', P7M, 'free-text', 'easy', 'production', ['private.day7.moebel.sessel'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'koltuk',
    answer: 'der Sessel', acceptedAnswers: ['Sessel'],
    validation: DE_PROD, pronounce: ['der Sessel'],
  }),
  G('gr-kelime-kanepe-de', P7M, 'free-text', 'easy', 'production', ['private.day7.moebel.sofa'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'kanepe',
    answer: 'das Sofa', acceptedAnswers: ['Sofa'],
    validation: DE_PROD, pronounce: ['das Sofa'],
  }),
  G('gr-kelime-hali-de', P7M, 'free-text', 'easy', 'production', ['private.day7.moebel.teppich-regal'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'halı',
    answer: 'der Teppich', acceptedAnswers: ['Teppich'],
    validation: DE_PROD, pronounce: ['der Teppich'],
  }),
  G('gr-kelime-sise-de', P7Q, 'free-text', 'easy', 'production', ['private.day7.miktar.flasche'], {
    instruction: 'Almancasını artikeliyle yaz (bir şişe):', prompt: 'şişe',
    answer: 'eine Flasche', acceptedAnswers: ['die Flasche', 'Flasche'],
    validation: DE_PROD, pronounce: ['eine Flasche'],
  }),
  G('gr-kelime-paket-de', P7Q, 'free-text', 'easy', 'production', ['private.day7.miktar.packung'], {
    instruction: 'Almancasını artikeliyle yaz (bir paket):', prompt: 'paket',
    answer: 'eine Packung', acceptedAnswers: ['die Packung', 'Packung'],
    validation: DE_PROD, pronounce: ['eine Packung'],
  }),

  /* ---------- Artikel seçimi (8) ---------- */
  G('gr-artikel-wohnung-mc', P2A, 'multiple-choice', 'easy', 'recognition', ['private.day7.ev.wohnung'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Wohnung (ev, daire)',
    answer: 'die', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-schlafzimmer-mc', P2A, 'multiple-choice', 'easy', 'recognition', ['private.day7.ev.schlafzimmer'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Schlafzimmer ist groß. (Yatak odası büyük.)',
    answer: 'Das', options: ['Der', 'Die', 'Das'],
  }),
  G('gr-artikel-flur-mc', P2A, 'multiple-choice', 'easy', 'recognition', ['private.day7.ev.flur'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Flur ist schmal. (Koridor dar.)',
    answer: 'Der', options: ['Der', 'Die', 'Das'],
  }),
  G('gr-artikel-kaese-mc', P7Y, 'multiple-choice', 'easy', 'recognition', ['private.day7.yiyecek.sahne'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Käse (peynir)',
    answer: 'der', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-sahne-mc', P7Y, 'multiple-choice', 'easy', 'recognition', ['private.day7.yiyecek.sahne'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Sahne (krema)',
    answer: 'die', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-hahnchen-mc', P7Y, 'multiple-choice', 'easy', 'recognition', ['private.day7.yiyecek.haehnchen'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Hähnchen (tavuk)',
    answer: 'das', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-vater-fb', P2A, 'fill-blank', 'easy', 'recall', ['private.day2.artikel.der-die-das-die-pl'], {
    instruction: 'Artikeli tamamla:', prompt: '___ Vater ist Lehrer.',
    answer: 'der', validation: { noTypoTolerance: true },
  }),
  G('gr-artikel-milch-fb', P7E, 'fill-blank', 'easy', 'recall', ['private.day7.getraenke.kelimeler'], {
    instruction: 'Artikeli tamamla:', prompt: '___ Milch ist kalt.',
    answer: 'die', validation: { noTypoTolerance: true },
  }),

  /* ---------- Eşleştirme (6) ---------- */
  G('gr-esleme-odalar', P7O, 'matching', 'easy', 'recognition', ['private.day7.ev.kueche', 'private.day7.ev.bad', 'private.day7.ev.wohnzimmer', 'private.day7.ev.schlafzimmer'], {
    instruction: 'Odayı Türkçesiyle eşleştir:',
    pairs: [
      { left: 'die Küche', right: 'mutfak' },
      { left: 'das Bad', right: 'banyo' },
      { left: 'das Wohnzimmer', right: 'salon' },
      { left: 'das Schlafzimmer', right: 'yatak odası' },
    ],
    pronounce: ['die Küche', 'das Bad', 'das Wohnzimmer', 'das Schlafzimmer'],
  }),
  G('gr-esleme-mobilya', P7M, 'matching', 'easy', 'recognition', ['private.day7.moebel.sessel', 'private.day7.moebel.sofa', 'private.day7.moebel.schrank', 'private.day7.moebel.bett'], {
    instruction: 'Mobilyayı Türkçesiyle eşleştir:',
    pairs: [
      { left: 'der Sessel', right: 'koltuk' },
      { left: 'das Sofa', right: 'kanepe' },
      { left: 'der Schrank', right: 'dolap' },
      { left: 'das Bett', right: 'yatak' },
    ],
    pronounce: ['der Sessel', 'das Sofa', 'der Schrank', 'das Bett'],
  }),
  G('gr-esleme-icecek', P7E, 'matching', 'easy', 'recognition', ['private.day7.getraenke.kelimeler', 'private.day7.essen.kelimeler'], {
    instruction: 'İçeceği Türkçesiyle eşleştir:',
    pairs: [
      { left: 'der Orangensaft', right: 'portakal suyu' },
      { left: 'der Apfelsaft', right: 'elma suyu' },
      { left: 'die Milch', right: 'süt' },
      { left: 'die Limonade', right: 'limonata' },
    ],
    pronounce: ['der Orangensaft', 'der Apfelsaft', 'die Milch', 'die Limonade'],
  }),
  G('gr-esleme-siklik', P7A, 'matching', 'easy', 'recognition', ['private.day7.siklik.immer', 'private.day7.siklik.oft', 'private.day7.siklik.manchmal', 'private.day7.siklik.nie'], {
    instruction: 'Sıklık kelimesini Türkçesiyle eşleştir:',
    pairs: [
      { left: 'immer', right: 'her zaman' },
      { left: 'oft', right: 'sık sık' },
      { left: 'manchmal', right: 'bazen' },
      { left: 'nie', right: 'asla' },
    ],
    pronounce: ['immer', 'oft', 'manchmal', 'nie'],
  }),
  G('gr-esleme-hayvan', P3G, 'matching', 'easy', 'recognition', ['private.day3.hayvanlar.kelime', 'private.day3.ev-kelime'], {
    instruction: 'Kelimeyi Türkçesiyle eşleştir:',
    pairs: [
      { left: 'die Katze', right: 'kedi' },
      { left: 'der Hund', right: 'köpek' },
      { left: 'das Tier', right: 'hayvan' },
      { left: 'der Garten', right: 'bahçe' },
    ],
    pronounce: ['die Katze', 'der Hund', 'das Tier', 'der Garten'],
  }),
  G('gr-esleme-form', KON, 'matching', 'easy', 'recognition', ['private.day1.formular.felder', 'private.day5.form.alanlar'], {
    instruction: 'Form alanını Türkçesiyle eşleştir:',
    pairs: [
      { left: 'der Vorname', right: 'ad' },
      { left: 'der Familienname', right: 'soyad' },
      { left: 'der Geburtsort', right: 'doğum yeri' },
      { left: 'der Wohnort', right: 'ikamet yeri' },
    ],
    pronounce: ['der Vorname', 'der Familienname', 'der Geburtsort', 'der Wohnort'],
  }),

  /* ---------- Dinleyerek kelime (4) ---------- */
  G('gr-dinle-kueche', P7O, 'listen-choice', 'easy', 'recognition', ['private.day7.ev.kueche'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'die Küche',
    audioText: 'die Küche',
    answer: 'die Küche',
    options: ['die Küche', 'die Kirche', 'der Kuchen', 'die Kühe'],
    audio: { prompt: { text: 'die Küche', language: 'de-DE', role: 'prompt' } },
    pronounce: ['die Küche'],
  }),
  G('gr-dinle-maedchen-nein', P7Y, 'listen-choice', 'easy', 'recognition', ['private.day7.yiyecek.sahne'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'der Käse',
    audioText: 'der Käse',
    answer: 'der Käse',
    options: ['der Käse', 'die Kasse', 'der Kuchen', 'die Käthe'],
    audio: { prompt: { text: 'der Käse', language: 'de-DE', role: 'prompt' } },
    pronounce: ['der Käse'],
  }),
  G('gr-dinle-moment', P5K, 'listen-choice', 'easy', 'recognition', ['private.day5.kelime.moment'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'Moment!',
    audioText: 'Moment!',
    answer: 'Moment!',
    options: ['Moment!', 'Morgen!', 'Monat!', 'Montag!'],
    audio: { prompt: { text: 'Moment!', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Moment!'],
  }),
  G('gr-dinle-leute', P7F, 'listen-choice', 'easy', 'recognition', ['private.day7.kelime.gast-leute'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'die Leute',
    audioText: 'die Leute',
    answer: 'die Leute',
    options: ['die Leute', 'die Leiter', 'die Liebe', 'die Läden'],
    audio: { prompt: { text: 'die Leute', language: 'de-DE', role: 'prompt' } },
    pronounce: ['die Leute'],
  }),

  /* ---------- Dikte ile kelime (3) ---------- */
  G('gr-dikte-wohnung', P7O, 'dictation', 'medium', 'production', ['private.day7.ev.wohnung'], {
    instruction: 'Duyduğun ev kelimesini artikeliyle yaz:',
    audioText: 'die Wohnung',
    answer: 'die Wohnung',
    audio: { prompt: { text: 'die Wohnung', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['die Wohnung'],
  }),
  G('gr-dikte-broetchen', P5Y, 'dictation', 'medium', 'production', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Duyduğun yiyecek kelimesini artikeliyle yaz:',
    audioText: 'das Brötchen',
    answer: 'das Brötchen',
    audio: { prompt: { text: 'das Brötchen', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['das Brötchen'],
  }),
  G('gr-dikte-telefonnummer', KON, 'dictation', 'medium', 'production', ['private.day1.kontakt.telefon'], {
    instruction: 'Duyduğun kelimeyi yaz:',
    audioText: 'die Telefonnummer',
    answer: 'die Telefonnummer',
    audio: { prompt: { text: 'die Telefonnummer', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['die Telefonnummer'],
  }),

  /* ---------- Kategori tanıma (3) ---------- */
  G('gr-kat-oda-mi', P7O, 'multiple-choice', 'medium', 'recognition', ['private.day7.ev.wohnung', 'private.day7.moebel.sofa'], {
    instruction: 'Hangisi oda adı DEĞİLDİR?', prompt: 'Oda olmayanı bul.',
    answer: 'das Sofa',
    options: ['die Küche', 'das Bad', 'das Sofa', 'der Flur'],
  }),
  G('gr-kat-icecek-mi', P7E, 'multiple-choice', 'medium', 'recognition', ['private.day7.getraenke.kelimeler', 'private.day7.essen.kelimeler'], {
    instruction: 'Hangisi içecek DEĞİLDİR?', prompt: 'İçecek olmayanı bul.',
    answer: 'die Pizza',
    options: ['die Milch', 'die Pizza', 'der Apfelsaft', 'die Limonade'],
  }),
  G('gr-kat-miktar-mi', P7Q, 'multiple-choice', 'medium', 'recognition', ['private.day7.miktar.flasche', 'private.day7.miktar.packung', 'private.day7.miktar.dose'], {
    instruction: 'Hangisi miktar/paket kelimesi DEĞİLDİR?', prompt: 'Paket kelimesi olmayanı bul.',
    answer: 'die Sahne',
    options: ['die Flasche', 'die Packung', 'die Sahne', 'die Dose'],
  }),
];
