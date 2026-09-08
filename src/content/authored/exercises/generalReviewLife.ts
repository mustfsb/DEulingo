/**
 * Genel Tekrar — Günlük Yaşam: Essen/Trinken/Alışveriş (22) + Ev (18) +
 * Ayrılabilen/Mein Tag ek (22) + Kişisel/Aile (12) + Writing (8).
 */

import type { AuthoredExercise } from '../types.ts';
import { DE_PROD, G, tok } from './generalReviewBase.ts';

const VOR = 'private.day1.vorstellung';
const P1B = 'private.day1.beruf';
const P3M = 'private.day3.mogen-moechten-gern';
const P3I = 'private.day3.iyelik';
const P3E = 'private.day3.es-gibt';
const P5B = 'private.day5.baglaclar';
const P5D = 'private.day5.dogum-yeri';
const P5F = 'private.day5.kisisel-bilgiler';
const P5K = 'private.day5.kelimeler';
const P5M = 'private.day5.medeni-hal';
const P5T = 'private.day5.kendini-tanitma';
const P6C = 'private.day6.cumle-kurma';
const P6I = 'private.day6.iyelik-tablo';
const P7E = 'private.day7.essen-trinken';
const P7A = 'private.day7.alisveris-siklik';
const P7F = 'private.day7.fiyat';
const P7B = 'private.day7.brauchen';
const P7O = 'private.day7.ev-odalar';
const P7M = 'private.day7.mobilyalar';
const P7T = 'private.day7.evi-tarif';
const P7Z = 'private.day7.artikel-zamir';
const P7G = 'private.day7.gefallen';
const P7V = 'private.day7.evimi-anlatiyorum';
const P10K = 'private.day10.kern-verben';
const P10S = 'private.day10.mein-tag-sabah';
const P10G = 'private.day10.mein-tag-gun';
const P10A = 'private.day10.mein-tag-aksam';
const P10T = 'private.day10.mein-tag-tam';
const P10N = 'private.day10.trennbar-nicht';

export const GENERAL_REVIEW_LIFE: AuthoredExercise[] = [
  /* ================= ESSEN / TRINKEN / ALIŞVERİŞ (22) ================= */
  G('gr-yemek-suppe-gern', P7E, 'free-text', 'medium', 'production', ['private.day7.essen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çorbayı severek yiyorum. (Çorbayı severim.)',
    answer: 'Ich esse gern Suppe.', acceptedAnswers: ['Ich esse gern Suppe'],
    validation: DE_PROD, pronounce: ['Ich esse gern Suppe.'],
  }),
  G('gr-yemek-essen-schmeckt', P7E, 'free-text', 'medium', 'production', ['private.day7.kelime.dazu-fertig-schmeckt'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yemeğin tadı güzel.',
    answer: 'Das Essen schmeckt gut.', acceptedAnswers: ['Das Essen schmeckt gut'],
    validation: DE_PROD, pronounce: ['Das Essen schmeckt gut.'],
  }),
  G('gr-yemek-lieblingsgetraenk', P7E, 'free-text', 'medium', 'production', ['private.day7.trinken.lieblingsgetraenk'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'En sevdiğim içecek portakal suyu.',
    answer: 'Mein Lieblingsgetränk ist Orangensaft.', acceptedAnswers: ['Mein Lieblingsgetränk ist Orangensaft'],
    validation: DE_PROD, pronounce: ['Mein Lieblingsgetränk ist Orangensaft.'],
  }),
  G('gr-yemek-hunger-kueche', P7E, 'free-text', 'easy', 'production', ['private.day7.essen.hunger-durst'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Açım ve susadım.',
    answer: 'Ich habe Hunger und Durst.', acceptedAnswers: ['Ich habe Hunger und Durst'],
    validation: DE_PROD, pronounce: ['Ich habe Hunger und Durst.'],
  }),
  G('gr-yemek-obst-gemuese', P7E, 'free-text', 'easy', 'production', ['private.day7.yiyecek.temel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Meyve ve sebze alıyorum.',
    answer: 'Ich kaufe Obst und Gemüse.', acceptedAnswers: ['Ich kaufe Obst und Gemüse'],
    validation: DE_PROD, pronounce: ['Ich kaufe Obst und Gemüse.'],
  }),
  G('gr-yemek-haehnchen-reis', P7E, 'free-text', 'medium', 'production', ['private.day7.yiyecek.haehnchen', 'private.day7.essen.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Tavuk ve pilav yiyorum.',
    answer: 'Ich esse Hähnchen und Reis.', acceptedAnswers: ['Ich esse Hähnchen und Reis'],
    validation: DE_PROD, pronounce: ['Ich esse Hähnchen und Reis.'],
  }),
  G('gr-yemek-ei-fruehstueck', P7E, 'free-text', 'easy', 'production', ['private.day5.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltıda yumurta yiyorum.',
    answer: 'Ich esse zum Frühstück ein Ei.', acceptedAnswers: ['Ich esse zum Frühstück ein Ei'],
    validation: DE_PROD, hint: '`zum Frühstück` = kahvaltıda (hazır kalıp).',
    pronounce: ['Ich esse zum Frühstück ein Ei.'],
  }),
  G('gr-yemek-mensa-esse', P7E, 'free-text', 'medium', 'production', ['private.day7.kelime.gast-leute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğlen kantinde yiyorum.',
    answer: 'Ich esse zu Mittag in der Mensa.', acceptedAnswers: ['Ich esse zu Mittag in der Mensa'],
    validation: DE_PROD, pronounce: ['Ich esse zu Mittag in der Mensa.'],
  }),
  G('gr-alis-flasche-milch-preis', P7F, 'free-text', 'hard', 'production', ['private.day7.fiyat.wie-viel', 'private.day7.miktar.flasche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir şişe süt kaç para?',
    answer: 'Wie viel kostet eine Flasche Milch?', acceptedAnswers: ['Wie viel kostet eine Flasche Milch', 'Was kostet eine Flasche Milch?'],
    validation: DE_PROD, pronounce: ['Wie viel kostet eine Flasche Milch?'],
  }),
  G('gr-alis-kostet-zehn', P7F, 'free-text', 'easy', 'production', ['private.day7.fiyat.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'On Euro.',
    answer: 'Das kostet zehn Euro.', acceptedAnswers: ['Das kostet zehn Euro', 'Das ist zehn Euro.'],
    validation: DE_PROD, pronounce: ['Das kostet zehn Euro.'],
  }),
  G('gr-alis-teuer-nicht', P7F, 'free-text', 'medium', 'production', ['private.day7.fiyat.teuer'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek pahalı değil.',
    answer: 'Das Brot ist nicht teuer.', acceptedAnswers: ['Das Brot ist nicht teuer'],
    validation: DE_PROD, pronounce: ['Das Brot ist nicht teuer.'],
  }),
  G('gr-alis-brauche-kein-brot', P7B, 'free-text', 'medium', 'production', ['private.day7.brauchen.kein'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hayır, ekmeğe ihtiyacım yok.',
    answer: 'Nein, ich brauche kein Brot.', acceptedAnswers: ['Nein, ich brauche kein Brot'],
    validation: DE_PROD, pronounce: ['Nein, ich brauche kein Brot.'],
  }),
  G('gr-alis-zettel-mache', P7A, 'free-text', 'medium', 'production', ['private.day7.alisveris.einkaufszettel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir alışveriş listesi hazırlıyorum.',
    answer: 'Ich mache einen Einkaufszettel.', acceptedAnswers: ['Ich mache einen Einkaufszettel'],
    validation: DE_PROD, pronounce: ['Ich mache einen Einkaufszettel.'],
  }),
  G('gr-alis-oft-obst', P7A, 'ordering', 'medium', 'production', ['private.day7.siklik.cumlede', 'private.day7.siklik.oft'], {
    instruction: 'Kelimeleri doğru sıraya diz — Sık sık meyve alıyorum.',
    answer: 'Ich kaufe oft Obst.',
    pronounce: ['Ich kaufe oft Obst.'],
  }),
  G('gr-alis-manchmal-mensa-wb', P7A, 'word-bank-translation', 'medium', 'production', ['private.day7.siklik.manchmal'], {
    instruction: 'Kutucuklarla kur — Bazen kantinde yiyorum.',
    answer: 'Ich esse manchmal in der Mensa.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Bazen kantinde yiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'esse', 'manchmal', 'in', 'der', 'Mensa.', 'oft', 'die'),
      acceptedSequences: [['Ich', 'esse', 'manchmal', 'in', 'der', 'Mensa.']],
    },
    pronounce: ['Ich esse manchmal in der Mensa.'],
  }),
  G('gr-alis-meistens-kaffee', P7A, 'free-text', 'medium', 'production', ['private.day7.siklik.meistens'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çoğunlukla kahve içiyorum.',
    answer: 'Ich trinke meistens Kaffee.', acceptedAnswers: ['Ich trinke meistens Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke meistens Kaffee.'],
  }),
  G('gr-alis-immer-brot', P7A, 'free-text', 'easy', 'production', ['private.day7.siklik.immer'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her zaman ekmek alıyorum.',
    answer: 'Ich kaufe immer Brot.', acceptedAnswers: ['Ich kaufe immer Brot'],
    validation: DE_PROD, pronounce: ['Ich kaufe immer Brot.'],
  }),
  G('gr-alis-sonst-frage', P7A, 'multiple-choice', 'medium', 'recognition', ['private.day7.alisveris.ifadeler'], {
    instruction: 'Manav “Başka bir şey?” diye soruyor. Hangisi doğrudur?',
    prompt: 'Başka bir şey ister misin? (kalıp)',
    answer: 'Sonst noch etwas?',
    options: ['Sonst noch etwas?', 'Noch sonst was?', 'Etwas noch sonst?', 'Sonst was noch etwas?'],
    pronounce: ['Sonst noch etwas?'],
  }),
  G('gr-alis-natuerlich', P7A, 'multiple-choice', 'easy', 'recognition', ['private.day7.alisveris.ifadeler'], {
    instruction: '“Tabii ki” demek istiyorsun. Hangisi doğrudur?', prompt: 'Tabii ki. (kalıp)',
    answer: 'Natürlich.',
    options: ['Natürlich.', 'Naturlich.', 'Gernlich.', 'Sicherlich gern.'],
    pronounce: ['Natürlich.'],
  }),
  G('gr-alis-dinle-preis', P7F, 'listen-choice', 'medium', 'recognition', ['private.day7.fiyat.antwort'], {
    instruction: 'Duyduğun fiyatı seç:',
    prompt: 'Das kostet drei Euro.',
    audioText: 'Das kostet drei Euro.',
    answer: 'Das kostet drei Euro.',
    options: ['Das kostet drei Euro.', 'Das kostet dreizehn Euro.', 'Das kostet dreißig Euro.', 'Das kostet vier Euro.'],
    audio: { prompt: { text: 'Das kostet drei Euro.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Das kostet drei Euro.'],
  }),
  G('gr-yemek-dikte-kaffee', P7E, 'dictation', 'medium', 'production', ['private.day7.essen.antwort'], {
    instruction: 'Duyduğun sevme cümlesini aynen yaz:',
    audioText: 'Ich trinke gern Kaffee.',
    answer: 'Ich trinke gern Kaffee.',
    audio: { prompt: { text: 'Ich trinke gern Kaffee.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Ich trinke gern Kaffee.'],
  }),
  G('gr-yemek-error-mag-gern', P3M, 'error-correction', 'medium', 'correction', ['private.day3.mogen-gern-farki'], {
    instruction: 'Sevme hatasını düzelt:', prompt: 'Ich mag gern Pizza.',
    answer: 'Ich esse gern Pizza.',
    acceptedAnswers: ['Ich esse gern Pizza', 'Ich mag Pizza.'],
    explanation: '`mögen` ve `gern` aynı cümlede kullanılmaz: ya `Ich mag Pizza.` ya `Ich esse gern Pizza.`.',
  }),

  /* ================= EV (18) ================= */
  G('gr-ev-drei-zimmer', P7O, 'free-text', 'easy', 'production', ['private.day3.miktar.oda'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Üç odamız var.',
    answer: 'Wir haben drei Zimmer.', acceptedAnswers: ['Wir haben drei Zimmer'],
    validation: DE_PROD, explanation: '`Zimmer` sayıdan sonra değişmez.',
    pronounce: ['Wir haben drei Zimmer.'],
  }),
  G('gr-ev-bad-klein-dunkel', P7O, 'free-text', 'medium', 'production', ['private.day7.ev.bad', 'private.day7.tarif.dunkel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Banyomuz küçük ve koyu renkli.',
    answer: 'Unser Bad ist klein und dunkel.', acceptedAnswers: ['Unser Bad ist klein und dunkel'],
    validation: DE_PROD, pronounce: ['Unser Bad ist klein und dunkel.'],
  }),
  G('gr-ev-sofa-grau', P7M, 'free-text', 'medium', 'production', ['private.day7.moebel.sofa', 'private.day7.tarif.grau', 'private.day3.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kanepe gri.',
    answer: 'Das Sofa ist grau.', acceptedAnswers: ['Das Sofa ist grau'],
    validation: DE_PROD, pronounce: ['Das Sofa ist grau.'],
  }),
  G('gr-ev-teppich-gross', P7M, 'free-text', 'medium', 'production', ['private.day7.moebel.teppich-regal', 'private.day3.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Halı büyük.',
    answer: 'Der Teppich ist groß.', acceptedAnswers: ['Der Teppich ist groß'],
    validation: DE_PROD, pronounce: ['Der Teppich ist groß.'],
  }),
  G('gr-ev-garten-gibt', P3E, 'free-text', 'medium', 'production', ['private.day3.esgibt.temel', 'private.day3.ev-kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bahçe var.',
    answer: 'Es gibt einen Garten.', acceptedAnswers: ['Es gibt einen Garten'],
    validation: DE_PROD, explanation: '`es gibt` Akkusativ ister: `einen Garten`.',
    pronounce: ['Es gibt einen Garten.'],
  }),
  G('gr-ev-gefaellt-wohnzimmer', P7G, 'free-text', 'medium', 'production', ['private.day7.gefallen.kalip'], {
    instruction: 'Türkçeden Almancaya çevir (`gefallen` ile):', prompt: 'Salon hoşuma gidiyor.',
    answer: 'Das Wohnzimmer gefällt mir.', acceptedAnswers: ['Das Wohnzimmer gefällt mir'],
    validation: DE_PROD, pronounce: ['Das Wohnzimmer gefällt mir.'],
  }),
  G('gr-ev-katze-sessel', P7M, 'free-text', 'medium', 'production', ['private.day7.moebel.auf-dem-sessel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedi koltukta.',
    answer: 'Die Katze ist auf dem Sessel.', acceptedAnswers: ['Die Katze ist auf dem Sessel'],
    validation: DE_PROD, pronounce: ['Die Katze ist auf dem Sessel.'],
  }),
  G('gr-ev-bett-gross', P7M, 'free-text', 'easy', 'production', ['private.day7.moebel.bett'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yatağım büyük.',
    answer: 'Mein Bett ist groß.', acceptedAnswers: ['Mein Bett ist groß'],
    validation: DE_PROD, pronounce: ['Mein Bett ist groß.'],
  }),
  G('gr-ev-flur-schmal', P7O, 'free-text', 'medium', 'production', ['private.day7.ev.flur', 'private.day7.tarif.schmal'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Koridor dar.',
    answer: 'Der Flur ist schmal.', acceptedAnswers: ['Der Flur ist schmal'],
    validation: DE_PROD, pronounce: ['Der Flur ist schmal.'],
  }),
  G('gr-ev-toilette-wo', P7O, 'free-text', 'medium', 'production', ['private.day7.ev.toilette'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Tuvalet nerede?',
    answer: 'Wo ist die Toilette?', acceptedAnswers: ['Wo ist die Toilette'],
    validation: DE_PROD, pronounce: ['Wo ist die Toilette?'],
  }),
  G('gr-ev-regal-buecher', P7M, 'free-text', 'medium', 'production', ['private.day7.moebel.teppich-regal', 'private.day3.cogul.umlaut', 'private.day3.sifat.cogul-artikelsiz'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Rafta kitaplar var.',
    answer: 'Es gibt Bücher auf dem Regal.', acceptedAnswers: ['Es gibt Bücher auf dem Regal'],
    validation: DE_PROD, hint: '`Buch → Bücher` (Umlaut çoğul).',
    pronounce: ['Es gibt Bücher auf dem Regal.'],
  }),
  G('gr-ev-sie-hell-wb', P7Z, 'word-bank-translation', 'medium', 'production', ['private.day7.zamir.die-sie'], {
    instruction: 'Kutucuklarla kur — Mutfak aydınlık. O (mutfak) büyük.',
    answer: 'Die Küche ist hell. Sie ist groß.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Mutfak aydınlık. O büyük.', targetLanguage: 'de',
      tokens: tok('Die', 'Küche', 'ist', 'hell.', 'Sie', 'ist', 'groß.', 'Er', 'das'),
      acceptedSequences: [['Die', 'Küche', 'ist', 'hell.', 'Sie', 'ist', 'groß.']],
    },
    pronounce: ['Die Küche ist hell. Sie ist groß.'],
  }),
  G('gr-ev-model-cumle', P7V, 'free-text', 'hard', 'production', ['private.day7.evim.model', 'private.day7.kalip.sira'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Evin: daire, 3 oda, mutfak aydınlık.',
    answer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell.',
    acceptedAnswers: ['Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell.',
  }),
  G('gr-ev-kuehl-schlafzimmer', P7T, 'multiple-choice', 'medium', 'recognition', ['private.day7.tarif.kuehl'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Yatak odası serin.”',
    answer: 'Das Schlafzimmer ist kühl.',
    options: ['Das Schlafzimmer ist kühl.', 'Das Schlafzimmer ist kühl Zimmer.', 'Der Schlafzimmer ist kühl.', 'Das Schlafzimmer kühl ist.'],
    pronounce: ['Das Schlafzimmer ist kühl.'],
  }),
  G('gr-ev-breit-schmal-mc', P7T, 'multiple-choice', 'easy', 'recognition', ['private.day7.tarif.gross-klein'], {
    instruction: 'Zıt anlamlı çifti seç:', prompt: 'geniş ↔ dar',
    answer: 'breit ↔ schmal',
    options: ['breit ↔ schmal', 'breit ↔ groß', 'hell ↔ groß', 'klein ↔ schmal'],
  }),
  G('gr-ev-dinle-kueche-gross', P7T, 'listen-choice', 'medium', 'recognition', ['private.day7.tarif.hell'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Die Küche ist groß.',
    audioText: 'Die Küche ist groß.',
    answer: 'Die Küche ist groß.',
    options: ['Die Küche ist groß.', 'Die Küche ist hell.', 'Die Kirche ist groß.', 'Die Küche ist klein.'],
    audio: { prompt: { text: 'Die Küche ist groß.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Die Küche ist groß.'],
  }),
  G('gr-ev-dikte-wohnzimmer', P7O, 'dictation', 'medium', 'production', ['private.day7.ev.wohnzimmer'], {
    instruction: 'Duyduğun ev cümlesini aynen yaz:',
    audioText: 'Das Wohnzimmer ist groß.',
    answer: 'Das Wohnzimmer ist groß.',
    audio: { prompt: { text: 'Das Wohnzimmer ist groß.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Das Wohnzimmer ist groß.'],
  }),
  G('gr-ev-error-gross-klein', P7T, 'error-correction', 'easy', 'correction', ['private.day7.tarif.gross-klein'], {
    instruction: 'Sıfat hatasını düzelt:', prompt: 'Mein Zimmer ist klein, aber dunkel und hell.',
    answer: 'Mein Zimmer ist klein, aber hell.',
    acceptedAnswers: ['Mein Zimmer ist klein, aber hell'],
    explanation: 'Bir oda aynı anda hem koyu hem açık renkli olamaz; zıt çiftlerden biri seçilir.',
  }),

  /* ================= AYRILABILEN / MEIN TAG EK (22) ================= */
  G('gr-tm-stehst-auf', P10K, 'fill-blank', 'medium', 'recall', ['private.day10.verb.aufstehen'], {
    instruction: '`aufstehen` fiilini çek:', prompt: 'Wann ___ du auf?',
    answer: 'stehst', explanation: '`du` → `stehst ... auf`.',
    pronounce: ['Wann stehst du auf?'],
  }),
  G('gr-tm-er-wacht-auf', P10K, 'fill-blank', 'medium', 'recall', ['private.day10.verb.aufwachen'], {
    instruction: '`aufwachen` fiilini çek:', prompt: 'Er ___ um sechs Uhr auf.',
    answer: 'wacht', explanation: '`er` → `wacht ... auf`.',
  }),
  G('gr-tm-wir-ziehen-uns-an', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.anziehen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hızlıca giyiniyoruz. (Giyiniyoruz.)',
    answer: 'Wir ziehen uns an.', acceptedAnswers: ['Wir ziehen uns an'],
    validation: DE_PROD, explanation: '`wir` → `uns`: `Wir ziehen uns an.`.',
    pronounce: ['Wir ziehen uns an.'],
  }),
  G('gr-tm-sie-kauft-ein', P10K, 'fill-blank', 'medium', 'recall', ['private.day10.verb.einkaufen'], {
    instruction: '`einkaufen` fiilini çek:', prompt: 'Sie ___ oft ein. (O, sık sık alışveriş yapar.)',
    answer: 'kauft', explanation: '`sie` → `kauft ... ein`.',
  }),
  G('gr-tm-er-raeumt-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufraeumen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) odasını topluyor.',
    answer: 'Er räumt sein Zimmer auf.', acceptedAnswers: ['Er räumt sein Zimmer auf'],
    validation: DE_PROD, pronounce: ['Er räumt sein Zimmer auf.'],
  }),
  G('gr-tm-sie-sieht-fern', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.fernsehen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (kadın) akşam televizyon izliyor.',
    answer: 'Sie sieht am Abend fern.', acceptedAnswers: ['Sie sieht am Abend fern'],
    validation: DE_PROD, pronounce: ['Sie sieht am Abend fern.'],
  }),
  G('gr-tm-wache-aber-stehe', P5B, 'free-text', 'hard', 'production', ['private.day10.verb.uyanma-farki', 'private.day5.baglac.aber'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Uyanıyorum ama kalkmıyorum.',
    answer: 'Ich wache auf, aber ich stehe nicht auf.', acceptedAnswers: ['Ich wache auf, aber ich stehe nicht auf'],
    validation: DE_PROD, pronounce: ['Ich wache auf, aber ich stehe nicht auf.'],
  }),
  G('gr-tm-wann-wachst-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufwachen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat kaçta uyanıyorsun?',
    answer: 'Wann wachst du auf?', acceptedAnswers: ['Wann wachst du auf', 'Um wie viel Uhr wachst du auf?'],
    validation: DE_PROD, pronounce: ['Wann wachst du auf?'],
  }),
  G('gr-tm-komme-zurueck', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.zurueckkommen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat altıda geri dönüyorum.',
    answer: 'Ich komme um sechs Uhr zurück.', acceptedAnswers: ['Ich komme um sechs Uhr zurück'],
    validation: DE_PROD, pronounce: ['Ich komme um sechs Uhr zurück.'],
  }),
  G('gr-tm-lade-freunde-ein', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.einladen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Arkadaşlarımı davet ediyorum.',
    answer: 'Ich lade meine Freunde ein.', acceptedAnswers: ['Ich lade meine Freunde ein'],
    validation: DE_PROD, pronounce: ['Ich lade meine Freunde ein.'],
  }),
  G('gr-tm-bringe-brot-mit', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.mitbringen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek getiriyorum (beraberimde).',
    answer: 'Ich bringe Brot mit.', acceptedAnswers: ['Ich bringe Brot mit'],
    validation: DE_PROD, pronounce: ['Ich bringe Brot mit.'],
  }),
  G('gr-tm-er-setzt-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufsetzen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) gözlüğünü takıyor.',
    answer: 'Er setzt die Brille auf.', acceptedAnswers: ['Er setzt die Brille auf'],
    validation: DE_PROD, pronounce: ['Er setzt die Brille auf.'],
  }),
  G('gr-tm-wir-geben-acht', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.achtgeben'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dikkat ediyoruz.',
    answer: 'Wir geben acht.', acceptedAnswers: ['Wir geben acht'],
    validation: DE_PROD, pronounce: ['Wir geben acht.'],
  }),
  G('gr-tm-bereiten-essen-vor', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.vorbereiten'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yemeği hazırlıyoruz.',
    answer: 'Wir bereiten das Essen vor.', acceptedAnswers: ['Wir bereiten das Essen vor'],
    validation: DE_PROD, pronounce: ['Wir bereiten das Essen vor.'],
  }),
  G('gr-tm-er-hoert-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufhoeren'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) saat onda bırakıyor.',
    answer: 'Er hört um zehn Uhr auf.', acceptedAnswers: ['Er hört um zehn Uhr auf'],
    validation: DE_PROD, pronounce: ['Er hört um zehn Uhr auf.'],
  }),
  G('gr-tm-ziehe-abend-aus', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.ausziehen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam üstümü çıkarıyorum.',
    answer: 'Ich ziehe mich am Abend aus.', acceptedAnswers: ['Ich ziehe mich am Abend aus'],
    validation: DE_PROD, pronounce: ['Ich ziehe mich am Abend aus.'],
  }),
  G('gr-tm-besuchen-nicht', P10N, 'multiple-choice', 'medium', 'recognition', ['private.day10.karsi.besuchen'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Seni ziyaret ediyorum.” (`besuchen` ayrılmaz!)',
    answer: 'Ich besuche dich.',
    options: ['Ich besuche dich.', 'Ich suche dich be.', 'Ich be dich suche.', 'Ich dich besuche.'],
    explanation: '`besuchen` ayrılmaz: önek hep fiilin yanında kalır.',
    pronounce: ['Ich besuche dich.'],
  }),
  G('gr-tm-vergessen-mc', P10N, 'multiple-choice', 'medium', 'recognition', ['private.day10.karsi.liste'], {
    instruction: 'Hangisi AYRILMAZ fiildir?', prompt: 'Ayrılmayan öneki bul.',
    answer: 'vergessen',
    options: ['vergessen', 'aufstehen', 'einkaufen', 'anrufen'],
    explanation: '`ver-` ile başlayanlar ayrılmaz.',
  }),
  G('gr-tm-spiele-abend-freunden', P10G, 'free-text', 'hard', 'production', ['private.day10.gun.freunde', 'private.day3.dizilisi.zaman-basta'], {
    instruction: 'Türkçeden Almancaya çevir (akşam başta):', prompt: 'Akşam arkadaşlarımla oynuyorum.',
    answer: 'Am Abend spiele ich mit meinen Freunden.', acceptedAnswers: ['Am Abend spiele ich mit meinen Freunden'],
    validation: DE_PROD, pronounce: ['Am Abend spiele ich mit meinen Freunden.'],
  }),
  G('gr-tm-gehe-zehn-ins-bett', P10A, 'free-text', 'medium', 'production', ['private.day10.aksam.bett', 'private.day10.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat onda yatağa gidiyorum.',
    answer: 'Ich gehe um zehn Uhr ins Bett.', acceptedAnswers: ['Ich gehe um zehn Uhr ins Bett'],
    validation: DE_PROD, pronounce: ['Ich gehe um zehn Uhr ins Bett.'],
  }),
  G('gr-tm-dikte-wohnzimmer-auf', P10K, 'dictation', 'hard', 'production', ['private.day10.verb.aufraeumen-cumle'], {
    instruction: 'Duyduğun toplama cümlesini aynen yaz:',
    audioText: 'Wir räumen das Wohnzimmer auf.',
    answer: 'Wir räumen das Wohnzimmer auf.',
    audio: { prompt: { text: 'Wir räumen das Wohnzimmer auf.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Wir räumen das Wohnzimmer auf.'],
  }),
  G('gr-tm-dinle-rufe-an', P10K, 'listen-choice', 'medium', 'recognition', ['private.day10.verb.anrufen-cumle'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich rufe dich am Abend an.',
    audioText: 'Ich rufe dich am Abend an.',
    answer: 'Ich rufe dich am Abend an.',
    options: ['Ich rufe dich am Abend an.', 'Ich rufe dich am Morgen an.', 'Ich rufe dich am Abend auf.', 'Du rufst mich am Abend an.'],
    audio: { prompt: { text: 'Ich rufe dich am Abend an.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Ich rufe dich am Abend an.'],
  }),

  /* ================= KİŞİSEL / AİLE (12) ================= */
  G('gr-kisi-schwester-vor', P6I, 'free-text', 'medium', 'production', ['private.day7.evim.schwester'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bu benim kız kardeşim.',
    answer: 'Das ist meine Schwester.', acceptedAnswers: ['Das ist meine Schwester'],
    validation: DE_PROD, pronounce: ['Das ist meine Schwester.'],
  }),
  G('gr-kisi-vater-lehrer', P6I, 'free-text', 'medium', 'production', ['private.day6.cumle.kalip'], {
    instruction: 'Türkçeden Almancaya çevir (kalıp: zamir + fiil + iyelik + isim):', prompt: 'Babam öğretmen.',
    answer: 'Mein Vater ist Lehrer.', acceptedAnswers: ['Mein Vater ist Lehrer'],
    validation: DE_PROD, pronounce: ['Mein Vater ist Lehrer.'],
  }),
  G('gr-kisi-sein-vater', P6I, 'free-text', 'medium', 'production', ['private.day6.iyelik.sein-onun'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Onun (erkeğin) babası öğretmen.',
    answer: 'Sein Vater ist Lehrer.', acceptedAnswers: ['Sein Vater ist Lehrer'],
    validation: DE_PROD, pronounce: ['Sein Vater ist Lehrer.'],
  }),
  G('gr-kisi-unsere-katze', P3I, 'free-text', 'medium', 'production', ['private.day7.evim.katze', 'private.day3.iyelik.unser'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedimiz küçük ve gri.',
    answer: 'Unsere Katze ist klein und grau.', acceptedAnswers: ['Unsere Katze ist klein und grau'],
    validation: DE_PROD, pronounce: ['Unsere Katze ist klein und grau.'],
  }),
  G('gr-kisi-zwei-geschwister', P5K, 'free-text', 'medium', 'production', ['private.day5.kelime.geschwister'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'İki kardeşim var.',
    answer: 'Ich habe zwei Geschwister.', acceptedAnswers: ['Ich habe zwei Geschwister'],
    validation: DE_PROD, pronounce: ['Ich habe zwei Geschwister.'],
  }),
  G('gr-kisi-geboren-sakarya', P5D, 'free-text', 'medium', 'production', ['private.day5.dogum.soru-cevap'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sakarya’da doğdum.',
    answer: 'Ich bin in Sakarya geboren.', acceptedAnswers: ['Ich bin in Sakarya geboren'],
    validation: DE_PROD, pronounce: ['Ich bin in Sakarya geboren.'],
  }),
  G('gr-kisi-wo-geboren', P5D, 'free-text', 'medium', 'production', ['private.day5.dogum.soru-cevap'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nerede doğdun? (samimi)',
    answer: 'Wo bist du geboren?', acceptedAnswers: ['Wo bist du geboren'],
    validation: DE_PROD, pronounce: ['Wo bist du geboren?'],
  }),
  G('gr-kisi-ledig', P5M, 'free-text', 'easy', 'production', ['private.day5.medeni-hal.ledig-verheiratet'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bekarım.',
    answer: 'Ich bin ledig.', acceptedAnswers: ['Ich bin ledig'],
    validation: DE_PROD, pronounce: ['Ich bin ledig.'],
  }),
  G('gr-kisi-familienname', P5F, 'free-text', 'easy', 'production', ['private.day5.form.alanlar'], {
    instruction: 'Formu tamamla (örnek kişi):', prompt: 'Soyadım Yılmaz.',
    answer: 'Mein Familienname ist Yılmaz.', acceptedAnswers: ['Mein Familienname ist Yılmaz'],
    validation: DE_PROD, pronounce: ['Mein Familienname ist Yılmaz.'],
  }),
  G('gr-kisi-arbeite-lehrer', P1B, 'free-text', 'medium', 'production', ['private.day1.beruf.als-bei'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğretmen olarak çalışıyorum.',
    answer: 'Ich arbeite als Lehrer.', acceptedAnswers: ['Ich arbeite als Lehrer', 'Ich arbeite als Lehrerin.'],
    validation: DE_PROD, pronounce: ['Ich arbeite als Lehrer.'],
  }),
  G('gr-kisi-vorstellen-bitte', VOR, 'free-text', 'medium', 'production', ['private.day1.vorstellung.sich-vorstellen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kendini tanıtır mısın lütfen? (samimi)',
    answer: 'Kannst du dich bitte vorstellen?', acceptedAnswers: ['Kannst du dich bitte vorstellen'],
    validation: DE_PROD, pronounce: ['Kannst du dich bitte vorstellen?'],
  }),
  G('gr-kisi-dinle-wer-bist-du', VOR, 'listen-choice', 'easy', 'recognition', ['private.day1.vorstellung.wer-bist-du'], {
    instruction: 'Duyduğun soruyu seç:',
    prompt: 'Wer bist du?',
    audioText: 'Wer bist du?',
    answer: 'Wer bist du?',
    options: ['Wer bist du?', 'Wie heißt du?', 'Wo wohnst du?', 'Wie ist dein Name?'],
    audio: { prompt: { text: 'Wer bist du?', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Wer bist du?'],
  }),

  /* ================= WRITING (8) ================= */
  G('gr-yaz-tanit-bes', P5T, 'free-text', 'hard', 'production', ['private.day5.tanitma.model'], {
    instruction: 'Kendini 5 cümleyle tanıt (ad, yaş, şehir, meslek, dil).',
    prompt: '5 cümle yaz: adın, yaşın, şehrin, mesleğin, dillerin.',
    answer: 'Ich heiße Mustafa. Ich bin achtzehn Jahre alt. Ich wohne in Sakarya. Ich bin Student. Ich spreche Türkisch und Englisch.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich heiße ...`, `Ich bin ... Jahre alt`, `Ich wohne in ...`, `Ich bin ...`, `Ich spreche ...`.',
    sampleAnswer: 'Ich heiße Mustafa. Ich bin achtzehn Jahre alt. Ich wohne in Sakarya. Ich bin Student. Ich spreche Türkisch und Englisch.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-aile', P6C, 'free-text', 'hard', 'production', ['private.day6.cumle.kalip'], {
    instruction: 'Aileni 4 cümleyle anlat (anne, baba, kardeş, kedi).',
    prompt: '4 cümle yaz: annen, baban, kardeşin, evcil hayvanın.',
    answer: 'Meine Mutter ist Lehrerin. Mein Vater ist Lehrer. Ich habe zwei Geschwister. Unsere Katze ist klein.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıp: `Mein/Meine ... ist ...`, `Ich habe ...`.',
    sampleAnswer: 'Meine Mutter ist Lehrerin. Mein Vater ist Lehrer. Ich habe zwei Geschwister. Unsere Katze ist klein.',
  }),
  G('gr-yaz-yemek-sevme', P7E, 'free-text', 'hard', 'production', ['private.day7.essen.antwort', 'private.day7.essen.nicht-gern'], {
    instruction: 'Ne yemeyi/içmeyi sevdiğini 4 cümleyle anlat.',
    prompt: '4 cümle yaz: sevdiğin yemek, sevdiğin içecek, sevmediğin bir şey, en sevdiğin yemek.',
    answer: 'Ich esse gern Pizza. Ich trinke gern Milch. Ich esse nicht gern Reis. Mein Lieblingsessen ist Hähnchen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich esse/trinke gern ...`, `Ich esse nicht gern ...`, `Mein Lieblingsessen ist ...`.',
    sampleAnswer: 'Ich esse gern Pizza. Ich trinke gern Milch. Ich esse nicht gern Reis. Mein Lieblingsessen ist Hähnchen.',
  }),
  G('gr-yaz-ev-anlat', P7V, 'free-text', 'hard', 'production', ['private.day7.evim.model'], {
    instruction: 'Evini 5 cümleyle anlat.',
    prompt: '5 cümle yaz: dairen, odalar, mutfak, salon, sevdiğin oda.',
    answer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell. Das Wohnzimmer ist groß. Das gefällt mir.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Wir haben ...`, `... ist hell/groß`, `Das gefällt mir.`.',
    sampleAnswer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell. Das Wohnzimmer ist groß. Das gefällt mir.',
  }),
  G('gr-yaz-gun-anlat', P10T, 'free-text', 'hard', 'production', ['private.day10.tam.uretim'], {
    instruction: 'Gününü 6 cümleyle anlat (saat + `dann/danach` kullan).',
    prompt: '6 cümle yaz: kalkış, kahvaltı, okul, öğlen, akşam, yatış.',
    answer: 'Ich stehe um sieben Uhr auf. Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule. Ich esse zu Mittag. Danach komme ich nach Hause zurück. Ich gehe um zehn Uhr ins Bett.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich stehe um ... auf`, `Dann ...`, `Danach ...`, `Ich gehe um ... ins Bett`.',
    sampleAnswer: 'Ich stehe um sieben Uhr auf. Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule. Ich esse zu Mittag. Danach komme ich nach Hause zurück. Ich gehe um zehn Uhr ins Bett.',
  }),
  G('gr-yaz-sabah-rutin', P10S, 'free-text', 'hard', 'production', ['private.day10.tam.sablon'], {
    instruction: 'Sabah rutinini 5 cümleyle anlat.',
    prompt: '5 cümle yaz: uyan, kalk, yıkan, giyin, kahvaltı.',
    answer: 'Ich wache um sechs Uhr auf. Ich stehe um sechs Uhr auf. Ich wasche mein Gesicht. Ich ziehe mich an. Ich frühstücke.',
    validation: DE_PROD, openEnded: true,
    hint: 'Fiiller: `aufwachen`, `aufstehen`, `waschen`, `sich anziehen`, `frühstücken`.',
    sampleAnswer: 'Ich wache um sechs Uhr auf. Ich stehe um sechs Uhr auf. Ich wasche mein Gesicht. Ich ziehe mich an. Ich frühstücke.',
  }),
  G('gr-yaz-alisveris-liste', P7A, 'free-text', 'hard', 'production', ['private.day7.alisveris.einkaufszettel'], {
    instruction: 'Bir alışveriş listesi oluştur (5 kalem + miktar).',
    prompt: '5 kalem yaz: ekmek, süt, domates, peynir, pirinç.',
    answer: 'Ich brauche Brot. Ich brauche Milch. Ich brauche Tomaten. Ich brauche Käse. Ich brauche Reis.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıp: `Ich brauche ...`. Miktar ekleyebilirsin: `ein Kilo ...`, `eine Packung ...`.',
    sampleAnswer: 'Ich brauche Brot. Ich brauche Milch. Ich brauche Tomaten. Ich brauche Käse. Ich brauche Reis.',
  }),
  G('gr-yaz-gunluk-kisa', P10T, 'free-text', 'hard', 'production', ['private.day10.tam.uretim'], {
    instruction: 'Kısa bir günlük yaz (bugün neler yaptın, 5 cümle).',
    prompt: '5 cümle yaz: sabah, öğlen, akşam, sevdiğin an, yarın planı.',
    answer: 'Heute stehe ich um sieben Uhr auf. Ich esse zu Mittag in der Mensa. Am Abend sehe ich fern. Das gefällt mir. Morgen kaufe ich ein.',
    validation: DE_PROD, openEnded: true,
    hint: '`Heute ...`, `Morgen ...` ile başla. Bildiğin fiilleri kullan.',
    sampleAnswer: 'Heute stehe ich um sieben Uhr auf. Ich esse zu Mittag in der Mensa. Am Abend sehe ich fern. Das gefällt mir. Morgen kaufe ich ein.',
  }),
];
