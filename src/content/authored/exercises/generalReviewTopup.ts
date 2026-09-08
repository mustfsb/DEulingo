/**
 * Genel Tekrar — konu grubu dengeleme (12).
 *
 * Konu kartlarının tamamı (tanışma, artikeller, iyelik, es gibt, yer-yön,
 * sıfatlar, zaman, bağlaçlar) en az 6 soruluk havuza sahip olmalıdır.
 * Tümü LEARNED_SO_FAR içindedir; yeni dilbilgisi yoktur.
 */

import type { AuthoredExercise } from '../types.ts';
import { DE_PROD, G } from './generalReviewBase.ts';

const DIL = 'private.day1.diller-selamlasma';
const ALT = 'private.day1.alter-herkunft-wohnort';
const P3E = 'private.day3.es-gibt';
const P3Y = 'private.day3.yer-yon';
const P3Z = 'private.day3.zaman';
const P3S = 'private.day3.sifat-ekleri';
const P5B = 'private.day5.baglaclar';
const P5Y = 'private.day5.yiyecek';
const P1K = 'private.day1.kontakt-formular';
const P3G = 'private.day3.gunluk-hayat';
const P7A = 'private.day7.alisveris-siklik';
const P7M = 'private.day7.mobilyalar';
const P7O = 'private.day7.ev-odalar';
const P10G = 'private.day10.mein-tag-gun';
const P10W = 'private.day10.wortschatz';

export const GENERAL_REVIEW_TOPUP: AuthoredExercise[] = [
  /* Tanışma + kişisel (4) */
  G('gr-kisi-wie-alt-zwanzig', ALT, 'fill-blank', 'easy', 'recall', ['private.day1.alter.wie-alt', 'private.day5.sayilar.onluklar'], {
    instruction: 'Yaşı tamamla:', prompt: 'Du bist ___ Jahre alt. (20)',
    answer: 'zwanzig', explanation: '20 = `zwanzig`. Yaş `sein` iledir: `Du bist ...`.',
    pronounce: ['Du bist zwanzig Jahre alt.'],
  }),
  G('gr-kisi-aus-sakarya-wohne', ALT, 'free-text', 'medium', 'production', ['private.day1.herkunft.aus', 'private.day1.wohnort.in'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sakaryalıyım ve Sakarya’da oturuyorum.',
    answer: 'Ich komme aus Sakarya. Ich wohne in Sakarya.', acceptedAnswers: ['Ich komme aus Sakarya. Ich wohne in Sakarya'],
    validation: DE_PROD, pronounce: ['Ich komme aus Sakarya. Ich wohne in Sakarya.'],
  }),
  G('gr-tanisma-sprachen-frage', DIL, 'free-text', 'medium', 'production', ['private.day1.sprachen.welche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hangi dilleri konuşuyorsun? (samimi)',
    answer: 'Welche Sprachen sprichst du?', acceptedAnswers: ['Welche Sprachen sprichst du'],
    validation: DE_PROD, pronounce: ['Welche Sprachen sprichst du?'],
  }),
  G('gr-tanisma-entschuldigung-mc', DIL, 'multiple-choice', 'easy', 'recognition', ['private.day1.nezaket.entschuldigung'], {
    instruction: 'Anlamını seç:', prompt: 'Entschuldigung!',
    answer: 'Pardon! / Affedersin!',
    options: ['Pardon! / Affedersin!', 'Teşekkürler!', 'Memnun oldum!', 'Hoşça kal!'],
    pronounce: ['Entschuldigung!'],
  }),
  G('gr-tanisma-guten-abend-mc', DIL, 'multiple-choice', 'easy', 'recognition', ['private.day1.selamlasma.hallo'], {
    instruction: 'Doğru selamı seç:', prompt: 'Akşam birine selam veriyorsun.',
    answer: 'Guten Abend!',
    options: ['Guten Morgen!', 'Guten Tag!', 'Guten Abend!', 'Gute Nacht!'],
    pronounce: ['Guten Abend!'],
  }),

  /* es gibt (2) */
  G('gr-esgibt-hund-katze', P3E, 'free-text', 'medium', 'production', ['private.day3.esgibt.temel', 'private.day3.esgibt.akkusativ'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bahçede bir köpek ve bir kedi var.',
    answer: 'Es gibt einen Hund und eine Katze im Garten.', acceptedAnswers: ['Es gibt einen Hund und eine Katze im Garten'],
    validation: DE_PROD, explanation: '`es gibt` Akkusativ ister: `einen Hund`, `eine Katze`.',
    pronounce: ['Es gibt einen Hund und eine Katze im Garten.'],
  }),
  G('gr-esgibt-drei-buecher', P3E, 'free-text', 'medium', 'production', ['private.day3.esgibt.temel', 'private.day3.cogul.umlaut'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Rafta üç kitap var.',
    answer: 'Es gibt drei Bücher auf dem Regal.', acceptedAnswers: ['Es gibt drei Bücher auf dem Regal'],
    validation: DE_PROD, hint: '`Buch → Bücher` (Umlaut çoğul).',
    pronounce: ['Es gibt drei Bücher auf dem Regal.'],
  }),

  /* yer-yön (2) */
  G('gr-yon-jeden-tag-arbeit', P3Y, 'free-text', 'medium', 'production', ['private.day3.kontraksiyon.zur', 'private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün işe gidiyorum.',
    answer: 'Ich gehe jeden Tag zur Arbeit.', acceptedAnswers: ['Ich gehe jeden Tag zur Arbeit'],
    validation: DE_PROD, pronounce: ['Ich gehe jeden Tag zur Arbeit.'],
  }),
  G('gr-yon-wir-spielen-park', P3Y, 'free-text', 'easy', 'production', ['private.day3.kontraksiyon.im'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Parkta oynuyoruz.',
    answer: 'Wir spielen im Park.', acceptedAnswers: ['Wir spielen im Park'],
    validation: DE_PROD, pronounce: ['Wir spielen im Park.'],
  }),

  /* zaman (2) */
  G('gr-zaman-wochenende-park', P3Z, 'free-text', 'medium', 'production', ['private.day3.zaman.am'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hafta sonu parkta oynuyoruz.',
    answer: 'Am Wochenende spielen wir im Park.', acceptedAnswers: ['Am Wochenende spielen wir im Park'],
    validation: DE_PROD, pronounce: ['Am Wochenende spielen wir im Park.'],
  }),
  G('gr-zaman-jeden-abend', P3Z, 'free-text', 'medium', 'production', ['private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her akşam kitap okuyorum.',
    answer: 'Ich lese jeden Abend ein Buch.', acceptedAnswers: ['Ich lese jeden Abend ein Buch'],
    validation: DE_PROD, pronounce: ['Ich lese jeden Abend ein Buch.'],
  }),

  /* bağlaç + sıfat (2) */
  G('gr-baglac-kaffee-milch', P5B, 'free-text', 'easy', 'production', ['private.day5.baglac.und'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve ve süt alıyorum.',
    answer: 'Ich kaufe Kaffee und Milch.', acceptedAnswers: ['Ich kaufe Kaffee und Milch'],
    validation: DE_PROD, pronounce: ['Ich kaufe Kaffee und Milch.'],
  }),
  G('gr-sifat-kleines-zimmer', P3S, 'free-text', 'hard', 'production', ['private.day3.sifat.ein-notr'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Küçük bir odam var.',
    answer: 'Ich habe ein kleines Zimmer.', acceptedAnswers: ['Ich habe ein kleines Zimmer'],
    validation: DE_PROD, explanation: '`ein` + nötr isim + sıfat → `-es`: `ein kleines Zimmer`.',
    pronounce: ['Ich habe ein kleines Zimmer.'],
  }),

  /* Yüksek değerli kelimeler: yiyecek, giyim, ev eşyası, hobi (12) */
  G('gr-yemek-mehl-brauche', P5Y, 'free-text', 'easy', 'production', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Una ihtiyacım var.',
    answer: 'Ich brauche Mehl.', acceptedAnswers: ['Ich brauche Mehl'],
    validation: DE_PROD, pronounce: ['Ich brauche Mehl.'],
  }),
  G('gr-yemek-wein-flasche', P5Y, 'free-text', 'medium', 'production', ['private.day5.yiyecek.kelimeler', 'private.day7.miktar.flasche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir şişe şarap alıyorum.',
    answer: 'Ich kaufe eine Flasche Wein.', acceptedAnswers: ['Ich kaufe eine Flasche Wein'],
    validation: DE_PROD, pronounce: ['Ich kaufe eine Flasche Wein.'],
  }),
  G('gr-yemek-birne-esse', P5Y, 'free-text', 'easy', 'production', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Armut yiyorum.',
    answer: 'Ich esse eine Birne.', acceptedAnswers: ['Ich esse eine Birne'],
    validation: DE_PROD, pronounce: ['Ich esse eine Birne.'],
  }),
  G('gr-yemek-pommes-mag', P5Y, 'free-text', 'easy', 'production', ['private.day5.yiyecek.kelimeler', 'private.day3.mogen.cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Patates kızartmasını severim.',
    answer: 'Ich mag Pommes.', acceptedAnswers: ['Ich mag Pommes'],
    validation: DE_PROD, pronounce: ['Ich mag Pommes.'],
  }),
  G('gr-alis-hose-preis', P7A, 'free-text', 'medium', 'production', ['private.day3.alisveris.kelime', 'private.day7.fiyat.wie-viel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Pantolon kaç para?',
    answer: 'Wie viel kostet die Hose?', acceptedAnswers: ['Wie viel kostet die Hose', 'Was kostet die Hose?'],
    validation: DE_PROD, pronounce: ['Wie viel kostet die Hose?'],
  }),
  G('gr-alis-schuhe-brauche', P7A, 'free-text', 'easy', 'production', ['private.day3.alisveris.kelime', 'private.day7.brauchen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ayakkabıya ihtiyacım var.',
    answer: 'Ich brauche Schuhe.', acceptedAnswers: ['Ich brauche Schuhe'],
    validation: DE_PROD, pronounce: ['Ich brauche Schuhe.'],
  }),
  G('gr-ev-tisch-gross', P7M, 'free-text', 'easy', 'production', ['private.day2.wortschatz.nesneler', 'private.day3.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Masa büyük.',
    answer: 'Der Tisch ist groß.', acceptedAnswers: ['Der Tisch ist groß'],
    validation: DE_PROD, pronounce: ['Der Tisch ist groß.'],
  }),
  G('gr-ev-tasche-klein', P7O, 'free-text', 'easy', 'production', ['private.day2.wortschatz.nesneler', 'private.day3.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çantam küçük.',
    answer: 'Meine Tasche ist klein.', acceptedAnswers: ['Meine Tasche ist klein'],
    validation: DE_PROD, pronounce: ['Meine Tasche ist klein.'],
  }),
  G('gr-kisi-punkt-mail', P1K, 'fill-blank', 'easy', 'recall', ['private.day1.kontakt.punkt'], {
    instruction: 'Boşluğu tamamla:', prompt: 'E-postada nokta ___ demektir.',
    answer: 'Punkt', explanation: '`Punkt` = nokta.',
    pronounce: ['Punkt'],
  }),
  G('gr-bos-mathe-deutsch', P10G, 'free-text', 'easy', 'production', ['private.day10.gun.lernen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Matematik ve Almanca öğreniyorum.',
    answer: 'Ich lerne Mathe und Deutsch.', acceptedAnswers: ['Ich lerne Mathe und Deutsch'],
    validation: DE_PROD, pronounce: ['Ich lerne Mathe und Deutsch.'],
  }),
  G('gr-bos-musik-hoeren', P3G, 'free-text', 'easy', 'production', ['private.day3.gunluk-rutin', 'private.day3.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Müzik dinlemeyi severim.',
    answer: 'Ich höre gern Musik.', acceptedAnswers: ['Ich höre gern Musik'],
    validation: DE_PROD, pronounce: ['Ich höre gern Musik.'],
  }),
  G('gr-ev-quadratmeter', P10W, 'free-text', 'medium', 'production', ['private.day10.wort.zimmer-satz'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Odam on iki metrekare.',
    answer: 'Mein Zimmer ist zwölf Quadratmeter groß.', acceptedAnswers: ['Mein Zimmer ist zwölf Quadratmeter groß'],
    validation: DE_PROD, pronounce: ['Mein Zimmer ist zwölf Quadratmeter groß.'],
  }),
];
