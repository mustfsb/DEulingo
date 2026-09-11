/**
 * Genel Tekrar — konu grubu dengeleme (12).
 *
 * Konu kartlarının tamamı (tanışma, artikeller, iyelik, es gibt, yer-yön,
 * sıfatlar, zaman, bağlaçlar) en az 6 soruluk havuza sahip olmalıdır.
 * Tümü LEARNED_SO_FAR içindedir; yeni dilbilgisi yoktur.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G } from './base.ts';

export const GENERAL_REVIEW_TOPUP: AuthoredExercise[] = [
  /* Tanışma + kişisel (4) */
  G('gr-kisi-wie-alt-zwanzig', T.personalInfo, 'fill-blank', 'easy', 'recall', ['personal-info.alter.wie-alt', 'numbers.sayilar.onluklar'], {
    instruction: 'Yaşı tamamla:', prompt: 'Du bist ___ Jahre alt. (20)',
    answer: 'zwanzig', explanation: '20 = `zwanzig`. Yaş `sein` iledir: `Du bist ...`.',
    pronounce: ['Du bist zwanzig Jahre alt.'],
  }),
  G('gr-kisi-aus-sakarya-wohne', T.personalInfo, 'free-text', 'medium', 'production', ['personal-info.herkunft.aus', 'personal-info.wohnort.in'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sakaryalıyım ve Sakarya’da oturuyorum.',
    answer: 'Ich komme aus Sakarya. Ich wohne in Sakarya.', acceptedAnswers: ['Ich komme aus Sakarya. Ich wohne in Sakarya'],
    validation: DE_PROD, pronounce: ['Ich komme aus Sakarya. Ich wohne in Sakarya.'],
  }),
  G('gr-tanisma-sprachen-frage', T.greetings, 'free-text', 'medium', 'production', ['greetings.sprachen.welche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hangi dilleri konuşuyorsun? (samimi)',
    answer: 'Welche Sprachen sprichst du?', acceptedAnswers: ['Welche Sprachen sprichst du'],
    validation: DE_PROD, pronounce: ['Welche Sprachen sprichst du?'],
  }),
  G('gr-tanisma-entschuldigung-mc', T.greetings, 'multiple-choice', 'easy', 'recognition', ['greetings.nezaket.entschuldigung'], {
    instruction: 'Anlamını seç:', prompt: 'Entschuldigung!',
    answer: 'Pardon! / Affedersin!',
    options: ['Pardon! / Affedersin!', 'Teşekkürler!', 'Memnun oldum!', 'Hoşça kal!'],
    pronounce: ['Entschuldigung!'],
  }),
  G('gr-tanisma-guten-abend-mc', T.greetings, 'multiple-choice', 'easy', 'recognition', ['greetings.selamlasma.hallo'], {
    instruction: 'Doğru selamı seç:', prompt: 'Akşam birine selam veriyorsun.',
    answer: 'Guten Abend!',
    options: ['Guten Morgen!', 'Guten Tag!', 'Guten Abend!', 'Gute Nacht!'],
    pronounce: ['Guten Abend!'],
  }),

  /* es gibt (2) */
  G('gr-esgibt-hund-katze', T.akkusativ, 'free-text', 'medium', 'production', ['akkusativ.esgibt.temel', 'akkusativ.esgibt.akkusativ'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bahçede bir köpek ve bir kedi var.',
    answer: 'Es gibt einen Hund und eine Katze im Garten.', acceptedAnswers: ['Es gibt einen Hund und eine Katze im Garten'],
    validation: DE_PROD, explanation: '`es gibt` Akkusativ ister: `einen Hund`, `eine Katze`.',
    pronounce: ['Es gibt einen Hund und eine Katze im Garten.'],
  }),
  G('gr-esgibt-drei-buecher', T.akkusativ, 'free-text', 'medium', 'production', ['akkusativ.esgibt.temel', 'articles.cogul.umlaut'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Rafta üç kitap var.',
    answer: 'Es gibt drei Bücher auf dem Regal.', acceptedAnswers: ['Es gibt drei Bücher auf dem Regal'],
    validation: DE_PROD, hint: '`Buch → Bücher` (Umlaut çoğul).',
    pronounce: ['Es gibt drei Bücher auf dem Regal.'],
  }),

  /* yer-yön (2) */
  G('gr-yon-jeden-tag-arbeit', T.places, 'free-text', 'medium', 'production', ['places.kontraksiyon.zur', 'sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün işe gidiyorum.',
    answer: 'Ich gehe jeden Tag zur Arbeit.', acceptedAnswers: ['Ich gehe jeden Tag zur Arbeit'],
    validation: DE_PROD, pronounce: ['Ich gehe jeden Tag zur Arbeit.'],
  }),
  G('gr-yon-wir-spielen-park', T.places, 'free-text', 'easy', 'production', ['places.kontraksiyon.im'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Parkta oynuyoruz.',
    answer: 'Wir spielen im Park.', acceptedAnswers: ['Wir spielen im Park'],
    validation: DE_PROD, pronounce: ['Wir spielen im Park.'],
  }),

  /* zaman (2) */
  G('gr-zaman-wochenende-park', T.time, 'free-text', 'medium', 'production', ['time.zaman.am'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hafta sonu parkta oynuyoruz.',
    answer: 'Am Wochenende spielen wir im Park.', acceptedAnswers: ['Am Wochenende spielen wir im Park'],
    validation: DE_PROD, pronounce: ['Am Wochenende spielen wir im Park.'],
  }),
  G('gr-zaman-jeden-abend', T.time, 'free-text', 'medium', 'production', ['sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her akşam kitap okuyorum.',
    answer: 'Ich lese jeden Abend ein Buch.', acceptedAnswers: ['Ich lese jeden Abend ein Buch'],
    validation: DE_PROD, pronounce: ['Ich lese jeden Abend ein Buch.'],
  }),

  /* bağlaç + sıfat (2) */
  G('gr-baglac-kaffee-milch', T.sentenceBuilding, 'free-text', 'easy', 'production', ['sentence-building.baglac.und'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve ve süt alıyorum.',
    answer: 'Ich kaufe Kaffee und Milch.', acceptedAnswers: ['Ich kaufe Kaffee und Milch'],
    validation: DE_PROD, pronounce: ['Ich kaufe Kaffee und Milch.'],
  }),
  G('gr-sifat-kleines-zimmer', T.adjectives, 'free-text', 'hard', 'production', ['adjectives.sifat.ein-notr'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Küçük bir odam var.',
    answer: 'Ich habe ein kleines Zimmer.', acceptedAnswers: ['Ich habe ein kleines Zimmer'],
    validation: DE_PROD, explanation: '`ein` + nötr isim + sıfat → `-es`: `ein kleines Zimmer`.',
    pronounce: ['Ich habe ein kleines Zimmer.'],
  }),

  /* Yüksek değerli kelimeler: yiyecek, giyim, ev eşyası, hobi (12) */
  G('gr-yemek-mehl-brauche', T.food, 'free-text', 'easy', 'production', ['food.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Una ihtiyacım var.',
    answer: 'Ich brauche Mehl.', acceptedAnswers: ['Ich brauche Mehl'],
    validation: DE_PROD, pronounce: ['Ich brauche Mehl.'],
  }),
  G('gr-yemek-wein-flasche', T.food, 'free-text', 'medium', 'production', ['food.yiyecek.kelimeler', 'shopping.miktar.flasche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir şişe şarap alıyorum.',
    answer: 'Ich kaufe eine Flasche Wein.', acceptedAnswers: ['Ich kaufe eine Flasche Wein'],
    validation: DE_PROD, pronounce: ['Ich kaufe eine Flasche Wein.'],
  }),
  G('gr-yemek-birne-esse', T.food, 'free-text', 'easy', 'production', ['food.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Armut yiyorum.',
    answer: 'Ich esse eine Birne.', acceptedAnswers: ['Ich esse eine Birne'],
    validation: DE_PROD, pronounce: ['Ich esse eine Birne.'],
  }),
  G('gr-yemek-pommes-mag', T.food, 'free-text', 'easy', 'production', ['food.yiyecek.kelimeler', 'likes.mogen.cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Patates kızartmasını severim.',
    answer: 'Ich mag Pommes.', acceptedAnswers: ['Ich mag Pommes'],
    validation: DE_PROD, pronounce: ['Ich mag Pommes.'],
  }),
  G('gr-alis-hose-preis', T.shopping, 'free-text', 'medium', 'production', ['shopping.alisveris.kelime', 'shopping.fiyat.wie-viel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Pantolon kaç para?',
    answer: 'Wie viel kostet die Hose?', acceptedAnswers: ['Wie viel kostet die Hose', 'Was kostet die Hose?'],
    validation: DE_PROD, pronounce: ['Wie viel kostet die Hose?'],
  }),
  G('gr-alis-schuhe-brauche', T.shopping, 'free-text', 'easy', 'production', ['shopping.alisveris.kelime', 'shopping.brauchen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ayakkabıya ihtiyacım var.',
    answer: 'Ich brauche Schuhe.', acceptedAnswers: ['Ich brauche Schuhe'],
    validation: DE_PROD, pronounce: ['Ich brauche Schuhe.'],
  }),
  G('gr-ev-tisch-gross', T.home, 'free-text', 'easy', 'production', ['articles.wortschatz.nesneler', 'adjectives.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Masa büyük.',
    answer: 'Der Tisch ist groß.', acceptedAnswers: ['Der Tisch ist groß'],
    validation: DE_PROD, pronounce: ['Der Tisch ist groß.'],
  }),
  G('gr-ev-tasche-klein', T.home, 'free-text', 'easy', 'production', ['articles.wortschatz.nesneler', 'adjectives.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çantam küçük.',
    answer: 'Meine Tasche ist klein.', acceptedAnswers: ['Meine Tasche ist klein'],
    validation: DE_PROD, pronounce: ['Meine Tasche ist klein.'],
  }),
  G('gr-kisi-punkt-mail', T.personalInfo, 'fill-blank', 'easy', 'recall', ['personal-info.kontakt.punkt'], {
    instruction: 'Boşluğu tamamla:', prompt: 'E-postada nokta ___ demektir.',
    answer: 'Punkt', explanation: '`Punkt` = nokta.',
    pronounce: ['Punkt'],
  }),
  G('gr-bos-mathe-deutsch', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gun.lernen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Matematik ve Almanca öğreniyorum.',
    answer: 'Ich lerne Mathe und Deutsch.', acceptedAnswers: ['Ich lerne Mathe und Deutsch'],
    validation: DE_PROD, pronounce: ['Ich lerne Mathe und Deutsch.'],
  }),
  G('gr-bos-musik-hoeren', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gunluk-rutin', 'likes.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Müzik dinlemeyi severim.',
    answer: 'Ich höre gern Musik.', acceptedAnswers: ['Ich höre gern Musik'],
    validation: DE_PROD, pronounce: ['Ich höre gern Musik.'],
  }),
  G('gr-ev-quadratmeter', T.home, 'free-text', 'medium', 'production', ['home.wort.zimmer-satz'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Odam on iki metrekare.',
    answer: 'Mein Zimmer ist zwölf Quadratmeter groß.', acceptedAnswers: ['Mein Zimmer ist zwölf Quadratmeter groß'],
    validation: DE_PROD, pronounce: ['Mein Zimmer ist zwölf Quadratmeter groß.'],
  }),
];
