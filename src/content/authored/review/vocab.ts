/**
 * Genel Tekrar — Kelime Çalışması (48).
 *
 * Tüm söz varlığı öğrenilmiş konulardan gelir (bkz. curriculum/topics.ts).
 * İsimlerde her zaman artikel + isim sorulur/öğretilir.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G } from './base.ts';

export const GENERAL_REVIEW_VOCAB: AuthoredExercise[] = [
  /* ---------- Almanca → Türkçe (tanıma, 12) ---------- */
  G('gr-kelime-pfannkuchen-tr', T.food, 'multiple-choice', 'easy', 'recognition', ['food.yiyecek.kelimeler'], {
    instruction: 'Anlamını seç:', prompt: 'der Pfannkuchen',
    answer: 'krep',
    options: ['krep', 'kek', 'un', 'meyve suyu'],
    pronounce: ['der Pfannkuchen'],
  }),
  G('gr-kelime-geschwister-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.geschwister'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Meine Geschwister wohnen in Sakarya.',
    answer: 'Kardeşlerim Sakarya’da oturuyor.',
    options: ['Kardeşlerim Sakarya’da oturuyor.', 'Misafirlerim Sakarya’da oturuyor.', 'Kardeşim Sakarya’da oturuyor.', 'Ailem Sakarya’da oturuyor.'],
    pronounce: ['Meine Geschwister wohnen in Sakarya.'],
  }),
  G('gr-kelime-flughafen-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.flughafen'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Ich bin am Flughafen.',
    answer: 'Havaalanındayım.',
    options: ['Havaalanındayım.', 'Havaalanına gidiyorum.', 'Uçaktayım.', 'Gardayım.'],
    pronounce: ['Ich bin am Flughafen.'],
  }),
  G('gr-kelime-einkaufswagen-tr', T.shopping, 'multiple-choice', 'easy', 'recognition', ['shopping.alisveris.einkaufswagen'], {
    instruction: 'Bu kelime ne demek?', prompt: 'der Einkaufswagen',
    answer: 'alışveriş arabası',
    options: ['alışveriş arabası', 'alışveriş listesi', 'alışveriş çantası', 'kasa'],
    pronounce: ['der Einkaufswagen'],
  }),
  G('gr-kelime-badewanne-tr', T.home, 'multiple-choice', 'easy', 'recognition', ['home.wort.badewanne'], {
    instruction: 'Anlamını seç:', prompt: 'die Badewanne',
    answer: 'küvet',
    options: ['küvet', 'lavabo', 'duş', 'ocak'],
    pronounce: ['die Badewanne'],
  }),
  G('gr-kelime-traum-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.gluecklich'], {
    instruction: 'Bu kelime ne demek?', prompt: 'der Traum',
    answer: 'hayal / rüya',
    options: ['hayal / rüya', 'misafir', 'an', 'tat'],
    pronounce: ['der Traum'],
  }),
  G('gr-kelime-leute-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.gast-leute'], {
    instruction: 'Anlamını seç:', prompt: 'die Leute',
    answer: 'insanlar',
    options: ['insanlar', 'misafirler', 'kardeşler', 'eşyalar'],
    pronounce: ['die Leute'],
  }),
  G('gr-kelime-leider-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.leider'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Leider komme ich heute nicht.',
    answer: 'Maalesef bugün gelmiyorum.',
    options: ['Maalesef bugün gelmiyorum.', 'Neyse ki bugün geliyorum.', 'Maalesef dün geldim.', 'Bugün birlikte gelmiyoruz.'],
    pronounce: ['Leider komme ich heute nicht.'],
  }),
  G('gr-kelime-seit-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.seit'], {
    instruction: 'Cümleye göre anlamını seç:', prompt: 'Ich wohne seit 2019 in Sakarya.',
    answer: '2019’dan beri Sakarya’da oturuyorum.',
    options: ['2019’dan beri Sakarya’da oturuyorum.', '2019’da Sakarya’ya taşındım.', 'Sakarya’da 2019 gün oturuyorum.', '2019 için Sakarya’dayım.'],
    pronounce: ['Ich wohne seit 2019 in Sakarya.'],
  }),
  G('gr-kelime-zusammen-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.zusammen-dort'], {
    instruction: 'Bu kelime ne demek?', prompt: 'zusammen',
    answer: 'birlikte',
    options: ['birlikte', 'orada', 'hazır', 'sadece'],
    pronounce: ['zusammen'],
  }),
  G('gr-kelime-fertig-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.kelime.dazu-fertig-schmeckt'], {
    instruction: 'Anlamını seç:', prompt: 'fertig',
    answer: 'hazır / bitmiş',
    options: ['hazır / bitmiş', 'lezzetli', 'pahalı', 'serin'],
    pronounce: ['fertig'],
  }),
  G('gr-kelime-ziemlich-tr', T.vocabulary, 'multiple-choice', 'easy', 'recognition', ['vocabulary.wort.ziemlich'], {
    instruction: 'Bu kelime ne demek?', prompt: 'ziemlich',
    answer: 'oldukça',
    options: ['oldukça', 'sadece', 'asla', 'hemen'],
    pronounce: ['ziemlich'],
  }),

  /* ---------- Türkçe → Almanca (üretim, 12) ---------- */
  G('gr-kelime-sandvic-de', T.food, 'free-text', 'medium', 'production', ['food.yiyecek.kelimeler'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'küçük ekmek',
    answer: 'das Brötchen', acceptedAnswers: ['Brötchen'],
    validation: DE_PROD, pronounce: ['das Brötchen'],
  }),
  G('gr-kelime-kardesler-de', T.vocabulary, 'free-text', 'medium', 'production', ['vocabulary.kelime.geschwister'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'kardeşler',
    answer: 'die Geschwister', acceptedAnswers: ['Geschwister'],
    validation: DE_PROD, pronounce: ['die Geschwister'],
  }),
  G('gr-kelime-havaalani-de', T.vocabulary, 'free-text', 'medium', 'production', ['vocabulary.kelime.flughafen'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'havaalanı',
    answer: 'der Flughafen', acceptedAnswers: ['Flughafen'],
    validation: DE_PROD, pronounce: ['der Flughafen'],
  }),
  G('gr-kelime-kuvet-de', T.home, 'free-text', 'medium', 'production', ['home.wort.badewanne'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'küvet',
    answer: 'die Badewanne', acceptedAnswers: ['Badewanne'],
    validation: DE_PROD, pronounce: ['die Badewanne'],
  }),
  G('gr-kelime-misafir-de', T.vocabulary, 'free-text', 'medium', 'production', ['vocabulary.kelime.gast-leute'], {
    instruction: 'Almancasını artikeliyle yaz (tekil):', prompt: 'misafir',
    answer: 'der Gast', acceptedAnswers: ['Gast'],
    validation: DE_PROD, pronounce: ['der Gast'],
  }),
  G('gr-kelime-insanlar-de', T.vocabulary, 'free-text', 'medium', 'production', ['vocabulary.kelime.gast-leute'], {
    instruction: 'Almancasını artikeliyle yaz (çoğul):', prompt: 'insanlar',
    answer: 'die Leute', acceptedAnswers: ['Leute'],
    validation: DE_PROD, pronounce: ['die Leute'],
  }),
  G('gr-kelime-mutfak-de', T.home, 'free-text', 'easy', 'production', ['home.ev.kueche'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'mutfak',
    answer: 'die Küche', acceptedAnswers: ['Küche'],
    validation: DE_PROD, pronounce: ['die Küche'],
  }),
  G('gr-kelime-koltuk-de', T.home, 'free-text', 'easy', 'production', ['home.moebel.sessel'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'koltuk',
    answer: 'der Sessel', acceptedAnswers: ['Sessel'],
    validation: DE_PROD, pronounce: ['der Sessel'],
  }),
  G('gr-kelime-kanepe-de', T.home, 'free-text', 'easy', 'production', ['home.moebel.sofa'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'kanepe',
    answer: 'das Sofa', acceptedAnswers: ['Sofa'],
    validation: DE_PROD, pronounce: ['das Sofa'],
  }),
  G('gr-kelime-hali-de', T.home, 'free-text', 'easy', 'production', ['home.moebel.teppich-regal'], {
    instruction: 'Almancasını artikeliyle yaz:', prompt: 'halı',
    answer: 'der Teppich', acceptedAnswers: ['Teppich'],
    validation: DE_PROD, pronounce: ['der Teppich'],
  }),
  G('gr-kelime-sise-de', T.shopping, 'free-text', 'easy', 'production', ['shopping.miktar.flasche'], {
    instruction: 'Almancasını artikeliyle yaz (bir şişe):', prompt: 'şişe',
    answer: 'eine Flasche', acceptedAnswers: ['die Flasche', 'Flasche'],
    validation: DE_PROD, pronounce: ['eine Flasche'],
  }),
  G('gr-kelime-paket-de', T.shopping, 'free-text', 'easy', 'production', ['shopping.miktar.packung'], {
    instruction: 'Almancasını artikeliyle yaz (bir paket):', prompt: 'paket',
    answer: 'eine Packung', acceptedAnswers: ['die Packung', 'Packung'],
    validation: DE_PROD, pronounce: ['eine Packung'],
  }),

  /* ---------- Artikel seçimi (8) ---------- */
  G('gr-artikel-wohnung-mc', T.articles, 'multiple-choice', 'easy', 'recognition', ['home.ev.wohnung'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Wohnung (ev, daire)',
    answer: 'die', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-schlafzimmer-mc', T.articles, 'multiple-choice', 'easy', 'recognition', ['home.ev.schlafzimmer'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Schlafzimmer ist groß. (Yatak odası büyük.)',
    answer: 'Das', options: ['Der', 'Die', 'Das'],
  }),
  G('gr-artikel-flur-mc', T.articles, 'multiple-choice', 'easy', 'recognition', ['home.ev.flur'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Flur ist schmal. (Koridor dar.)',
    answer: 'Der', options: ['Der', 'Die', 'Das'],
  }),
  G('gr-artikel-kaese-mc', T.food, 'multiple-choice', 'easy', 'recognition', ['food.yiyecek.sahne'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Käse (peynir)',
    answer: 'der', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-sahne-mc', T.food, 'multiple-choice', 'easy', 'recognition', ['food.yiyecek.sahne'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Sahne (krema)',
    answer: 'die', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-hahnchen-mc', T.food, 'multiple-choice', 'easy', 'recognition', ['food.yiyecek.haehnchen'], {
    instruction: 'Doğru artikeli seç:', prompt: '___ Hähnchen (tavuk)',
    answer: 'das', options: ['der', 'die', 'das'],
  }),
  G('gr-artikel-vater-fb', T.articles, 'fill-blank', 'easy', 'recall', ['articles.artikel.der-die-das-die-pl'], {
    instruction: 'Artikeli tamamla:', prompt: '___ Vater ist Lehrer.',
    answer: 'der', validation: { noTypoTolerance: true },
  }),
  G('gr-artikel-milch-fb', T.food, 'fill-blank', 'easy', 'recall', ['food.getraenke.kelimeler'], {
    instruction: 'Artikeli tamamla:', prompt: '___ Milch ist kalt.',
    answer: 'die', validation: { noTypoTolerance: true },
  }),

  /* ---------- Eşleştirme (6) ---------- */
  G('gr-esleme-odalar', T.home, 'matching', 'easy', 'recognition', ['home.ev.kueche', 'home.ev.bad', 'home.ev.wohnzimmer', 'home.ev.schlafzimmer'], {
    instruction: 'Odayı Türkçesiyle eşleştir:',
    pairs: [
      { left: 'die Küche', right: 'mutfak' },
      { left: 'das Bad', right: 'banyo' },
      { left: 'das Wohnzimmer', right: 'salon' },
      { left: 'das Schlafzimmer', right: 'yatak odası' },
    ],
    pronounce: ['die Küche', 'das Bad', 'das Wohnzimmer', 'das Schlafzimmer'],
  }),
  G('gr-esleme-mobilya', T.home, 'matching', 'easy', 'recognition', ['home.moebel.sessel', 'home.moebel.sofa', 'home.moebel.schrank', 'home.moebel.bett'], {
    instruction: 'Mobilyayı Türkçesiyle eşleştir:',
    pairs: [
      { left: 'der Sessel', right: 'koltuk' },
      { left: 'das Sofa', right: 'kanepe' },
      { left: 'der Schrank', right: 'dolap' },
      { left: 'das Bett', right: 'yatak' },
    ],
    pronounce: ['der Sessel', 'das Sofa', 'der Schrank', 'das Bett'],
  }),
  G('gr-esleme-icecek', T.food, 'matching', 'easy', 'recognition', ['food.getraenke.kelimeler', 'food.essen.kelimeler'], {
    instruction: 'İçeceği Türkçesiyle eşleştir:',
    pairs: [
      { left: 'der Orangensaft', right: 'portakal suyu' },
      { left: 'der Apfelsaft', right: 'elma suyu' },
      { left: 'die Milch', right: 'süt' },
      { left: 'die Limonade', right: 'limonata' },
    ],
    pronounce: ['der Orangensaft', 'der Apfelsaft', 'die Milch', 'die Limonade'],
  }),
  G('gr-esleme-siklik', T.shopping, 'matching', 'easy', 'recognition', ['shopping.siklik.immer', 'shopping.siklik.oft', 'shopping.siklik.manchmal', 'shopping.siklik.nie'], {
    instruction: 'Sıklık kelimesini Türkçesiyle eşleştir:',
    pairs: [
      { left: 'immer', right: 'her zaman' },
      { left: 'oft', right: 'sık sık' },
      { left: 'manchmal', right: 'bazen' },
      { left: 'nie', right: 'asla' },
    ],
    pronounce: ['immer', 'oft', 'manchmal', 'nie'],
  }),
  G('gr-esleme-hayvan', T.vocabulary, 'matching', 'easy', 'recognition', ['vocabulary.hayvanlar.kelime', 'home.ev-kelime'], {
    instruction: 'Kelimeyi Türkçesiyle eşleştir:',
    pairs: [
      { left: 'die Katze', right: 'kedi' },
      { left: 'der Hund', right: 'köpek' },
      { left: 'das Tier', right: 'hayvan' },
      { left: 'der Garten', right: 'bahçe' },
    ],
    pronounce: ['die Katze', 'der Hund', 'das Tier', 'der Garten'],
  }),
  G('gr-esleme-form', T.personalInfo, 'matching', 'easy', 'recognition', ['personal-info.formular.felder', 'personal-info.form.alanlar'], {
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
  G('gr-dinle-kueche', T.home, 'listen-choice', 'easy', 'recognition', ['home.ev.kueche'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'die Küche',
    audioText: 'die Küche',
    answer: 'die Küche',
    options: ['die Küche', 'die Kirche', 'der Kuchen', 'die Kühe'],
    audio: { prompt: { text: 'die Küche', language: 'de-DE', role: 'prompt' } },
    pronounce: ['die Küche'],
  }),
  G('gr-dinle-maedchen-nein', T.food, 'listen-choice', 'easy', 'recognition', ['food.yiyecek.sahne'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'der Käse',
    audioText: 'der Käse',
    answer: 'der Käse',
    options: ['der Käse', 'die Kasse', 'der Kuchen', 'die Käthe'],
    audio: { prompt: { text: 'der Käse', language: 'de-DE', role: 'prompt' } },
    pronounce: ['der Käse'],
  }),
  G('gr-dinle-moment', T.vocabulary, 'listen-choice', 'easy', 'recognition', ['vocabulary.kelime.moment'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'Moment!',
    audioText: 'Moment!',
    answer: 'Moment!',
    options: ['Moment!', 'Morgen!', 'Monat!', 'Montag!'],
    audio: { prompt: { text: 'Moment!', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Moment!'],
  }),
  G('gr-dinle-leute', T.vocabulary, 'listen-choice', 'easy', 'recognition', ['vocabulary.kelime.gast-leute'], {
    instruction: 'Duyduğun kelimeyi seç:',
    prompt: 'die Leute',
    audioText: 'die Leute',
    answer: 'die Leute',
    options: ['die Leute', 'die Leiter', 'die Liebe', 'die Läden'],
    audio: { prompt: { text: 'die Leute', language: 'de-DE', role: 'prompt' } },
    pronounce: ['die Leute'],
  }),

  /* ---------- Dikte ile kelime (3) ---------- */
  G('gr-dikte-wohnung', T.home, 'dictation', 'medium', 'production', ['home.ev.wohnung'], {
    instruction: 'Duyduğun ev kelimesini artikeliyle yaz:',
    audioText: 'die Wohnung',
    answer: 'die Wohnung',
    audio: { prompt: { text: 'die Wohnung', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['die Wohnung'],
  }),
  G('gr-dikte-broetchen', T.food, 'dictation', 'medium', 'production', ['food.yiyecek.kelimeler'], {
    instruction: 'Duyduğun yiyecek kelimesini artikeliyle yaz:',
    audioText: 'das Brötchen',
    answer: 'das Brötchen',
    audio: { prompt: { text: 'das Brötchen', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['das Brötchen'],
  }),
  G('gr-dikte-telefonnummer', T.personalInfo, 'dictation', 'medium', 'production', ['personal-info.kontakt.telefon'], {
    instruction: 'Duyduğun kelimeyi yaz:',
    audioText: 'die Telefonnummer',
    answer: 'die Telefonnummer',
    audio: { prompt: { text: 'die Telefonnummer', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['die Telefonnummer'],
  }),

  /* ---------- Kategori tanıma (3) ---------- */
  G('gr-kat-oda-mi', T.home, 'multiple-choice', 'medium', 'recognition', ['home.ev.wohnung', 'home.moebel.sofa'], {
    instruction: 'Hangisi oda adı DEĞİLDİR?', prompt: 'Oda olmayanı bul.',
    answer: 'das Sofa',
    options: ['die Küche', 'das Bad', 'das Sofa', 'der Flur'],
  }),
  G('gr-kat-icecek-mi', T.food, 'multiple-choice', 'medium', 'recognition', ['food.getraenke.kelimeler', 'food.essen.kelimeler'], {
    instruction: 'Hangisi içecek DEĞİLDİR?', prompt: 'İçecek olmayanı bul.',
    answer: 'die Pizza',
    options: ['die Milch', 'die Pizza', 'der Apfelsaft', 'die Limonade'],
  }),
  G('gr-kat-miktar-mi', T.shopping, 'multiple-choice', 'medium', 'recognition', ['shopping.miktar.flasche', 'shopping.miktar.packung', 'shopping.miktar.dose'], {
    instruction: 'Hangisi miktar/paket kelimesi DEĞİLDİR?', prompt: 'Paket kelimesi olmayanı bul.',
    answer: 'die Sahne',
    options: ['die Flasche', 'die Packung', 'die Sahne', 'die Dose'],
  }),
];
