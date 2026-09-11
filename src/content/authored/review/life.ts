/**
 * Genel Tekrar — Günlük Yaşam: Essen/Trinken/Alışveriş (22) + Ev (18) +
 * Ayrılabilen/Mein Tag ek (22) + Kişisel/Aile (12) + Writing (8).
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G, tok } from './base.ts';

export const GENERAL_REVIEW_LIFE: AuthoredExercise[] = [
  /* ================= ESSEN / TRINKEN / ALIŞVERİŞ (22) ================= */
  G('gr-yemek-suppe-gern', T.food, 'free-text', 'medium', 'production', ['food.essen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çorbayı severek yiyorum. (Çorbayı severim.)',
    answer: 'Ich esse gern Suppe.', acceptedAnswers: ['Ich esse gern Suppe'],
    validation: DE_PROD, pronounce: ['Ich esse gern Suppe.'],
  }),
  G('gr-yemek-essen-schmeckt', T.food, 'free-text', 'medium', 'production', ['vocabulary.kelime.dazu-fertig-schmeckt'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yemeğin tadı güzel.',
    answer: 'Das Essen schmeckt gut.', acceptedAnswers: ['Das Essen schmeckt gut'],
    validation: DE_PROD, pronounce: ['Das Essen schmeckt gut.'],
  }),
  G('gr-yemek-lieblingsgetraenk', T.food, 'free-text', 'medium', 'production', ['food.trinken.lieblingsgetraenk'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'En sevdiğim içecek portakal suyu.',
    answer: 'Mein Lieblingsgetränk ist Orangensaft.', acceptedAnswers: ['Mein Lieblingsgetränk ist Orangensaft'],
    validation: DE_PROD, pronounce: ['Mein Lieblingsgetränk ist Orangensaft.'],
  }),
  G('gr-yemek-hunger-kueche', T.food, 'free-text', 'easy', 'production', ['food.essen.hunger-durst'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Açım ve susadım.',
    answer: 'Ich habe Hunger und Durst.', acceptedAnswers: ['Ich habe Hunger und Durst'],
    validation: DE_PROD, pronounce: ['Ich habe Hunger und Durst.'],
  }),
  G('gr-yemek-obst-gemuese', T.food, 'free-text', 'easy', 'production', ['food.yiyecek.temel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Meyve ve sebze alıyorum.',
    answer: 'Ich kaufe Obst und Gemüse.', acceptedAnswers: ['Ich kaufe Obst und Gemüse'],
    validation: DE_PROD, pronounce: ['Ich kaufe Obst und Gemüse.'],
  }),
  G('gr-yemek-haehnchen-reis', T.food, 'free-text', 'medium', 'production', ['food.yiyecek.haehnchen', 'food.essen.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Tavuk ve pilav yiyorum.',
    answer: 'Ich esse Hähnchen und Reis.', acceptedAnswers: ['Ich esse Hähnchen und Reis'],
    validation: DE_PROD, pronounce: ['Ich esse Hähnchen und Reis.'],
  }),
  G('gr-yemek-ei-fruehstueck', T.food, 'free-text', 'easy', 'production', ['food.yiyecek.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltıda yumurta yiyorum.',
    answer: 'Ich esse zum Frühstück ein Ei.', acceptedAnswers: ['Ich esse zum Frühstück ein Ei'],
    validation: DE_PROD, hint: '`zum Frühstück` = kahvaltıda (hazır kalıp).',
    pronounce: ['Ich esse zum Frühstück ein Ei.'],
  }),
  G('gr-yemek-mensa-esse', T.food, 'free-text', 'medium', 'production', ['vocabulary.kelime.gast-leute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğlen kantinde yiyorum.',
    answer: 'Ich esse zu Mittag in der Mensa.', acceptedAnswers: ['Ich esse zu Mittag in der Mensa'],
    validation: DE_PROD, pronounce: ['Ich esse zu Mittag in der Mensa.'],
  }),
  G('gr-alis-flasche-milch-preis', T.shopping, 'free-text', 'hard', 'production', ['shopping.fiyat.wie-viel', 'shopping.miktar.flasche'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir şişe süt kaç para?',
    answer: 'Wie viel kostet eine Flasche Milch?', acceptedAnswers: ['Wie viel kostet eine Flasche Milch', 'Was kostet eine Flasche Milch?'],
    validation: DE_PROD, pronounce: ['Wie viel kostet eine Flasche Milch?'],
  }),
  G('gr-alis-kostet-zehn', T.shopping, 'free-text', 'easy', 'production', ['shopping.fiyat.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'On Euro.',
    answer: 'Das kostet zehn Euro.', acceptedAnswers: ['Das kostet zehn Euro', 'Das ist zehn Euro.'],
    validation: DE_PROD, pronounce: ['Das kostet zehn Euro.'],
  }),
  G('gr-alis-teuer-nicht', T.shopping, 'free-text', 'medium', 'production', ['shopping.fiyat.teuer'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek pahalı değil.',
    answer: 'Das Brot ist nicht teuer.', acceptedAnswers: ['Das Brot ist nicht teuer'],
    validation: DE_PROD, pronounce: ['Das Brot ist nicht teuer.'],
  }),
  G('gr-alis-brauche-kein-brot', T.shopping, 'free-text', 'medium', 'production', ['shopping.brauchen.kein'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hayır, ekmeğe ihtiyacım yok.',
    answer: 'Nein, ich brauche kein Brot.', acceptedAnswers: ['Nein, ich brauche kein Brot'],
    validation: DE_PROD, pronounce: ['Nein, ich brauche kein Brot.'],
  }),
  G('gr-alis-zettel-mache', T.shopping, 'free-text', 'medium', 'production', ['shopping.alisveris.einkaufszettel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir alışveriş listesi hazırlıyorum.',
    answer: 'Ich mache einen Einkaufszettel.', acceptedAnswers: ['Ich mache einen Einkaufszettel'],
    validation: DE_PROD, pronounce: ['Ich mache einen Einkaufszettel.'],
  }),
  G('gr-alis-oft-obst', T.shopping, 'ordering', 'medium', 'production', ['shopping.siklik.cumlede', 'shopping.siklik.oft'], {
    instruction: 'Kelimeleri doğru sıraya diz — Sık sık meyve alıyorum.',
    answer: 'Ich kaufe oft Obst.',
    pronounce: ['Ich kaufe oft Obst.'],
  }),
  G('gr-alis-manchmal-mensa-wb', T.shopping, 'word-bank-translation', 'medium', 'production', ['shopping.siklik.manchmal'], {
    instruction: 'Kutucuklarla kur — Bazen kantinde yiyorum.',
    answer: 'Ich esse manchmal in der Mensa.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Bazen kantinde yiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'esse', 'manchmal', 'in', 'der', 'Mensa.', 'oft', 'die'),
      acceptedSequences: [['Ich', 'esse', 'manchmal', 'in', 'der', 'Mensa.']],
    },
    pronounce: ['Ich esse manchmal in der Mensa.'],
  }),
  G('gr-alis-meistens-kaffee', T.shopping, 'free-text', 'medium', 'production', ['shopping.siklik.meistens'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Çoğunlukla kahve içiyorum.',
    answer: 'Ich trinke meistens Kaffee.', acceptedAnswers: ['Ich trinke meistens Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke meistens Kaffee.'],
  }),
  G('gr-alis-immer-brot', T.shopping, 'free-text', 'easy', 'production', ['shopping.siklik.immer'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her zaman ekmek alıyorum.',
    answer: 'Ich kaufe immer Brot.', acceptedAnswers: ['Ich kaufe immer Brot'],
    validation: DE_PROD, pronounce: ['Ich kaufe immer Brot.'],
  }),
  G('gr-alis-sonst-frage', T.shopping, 'multiple-choice', 'medium', 'recognition', ['shopping.alisveris.ifadeler'], {
    instruction: 'Manav “Başka bir şey?” diye soruyor. Hangisi doğrudur?',
    prompt: 'Başka bir şey ister misin? (kalıp)',
    answer: 'Sonst noch etwas?',
    options: ['Sonst noch etwas?', 'Noch sonst was?', 'Etwas noch sonst?', 'Sonst was noch etwas?'],
    pronounce: ['Sonst noch etwas?'],
  }),
  G('gr-alis-natuerlich', T.shopping, 'multiple-choice', 'easy', 'recognition', ['shopping.alisveris.ifadeler'], {
    instruction: '“Tabii ki” demek istiyorsun. Hangisi doğrudur?', prompt: 'Tabii ki. (kalıp)',
    answer: 'Natürlich.',
    options: ['Natürlich.', 'Naturlich.', 'Gernlich.', 'Sicherlich gern.'],
    pronounce: ['Natürlich.'],
  }),
  G('gr-alis-dinle-preis', T.shopping, 'listen-choice', 'medium', 'recognition', ['shopping.fiyat.antwort'], {
    instruction: 'Duyduğun fiyatı seç:',
    prompt: 'Das kostet drei Euro.',
    audioText: 'Das kostet drei Euro.',
    answer: 'Das kostet drei Euro.',
    options: ['Das kostet drei Euro.', 'Das kostet dreizehn Euro.', 'Das kostet dreißig Euro.', 'Das kostet vier Euro.'],
    audio: { prompt: { text: 'Das kostet drei Euro.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Das kostet drei Euro.'],
  }),
  G('gr-yemek-dikte-kaffee', T.food, 'dictation', 'medium', 'production', ['food.essen.antwort'], {
    instruction: 'Duyduğun sevme cümlesini aynen yaz:',
    audioText: 'Ich trinke gern Kaffee.',
    answer: 'Ich trinke gern Kaffee.',
    audio: { prompt: { text: 'Ich trinke gern Kaffee.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Ich trinke gern Kaffee.'],
  }),
  G('gr-yemek-error-mag-gern', T.likes, 'error-correction', 'medium', 'correction', ['likes.mogen-gern-farki'], {
    instruction: 'Sevme hatasını düzelt:', prompt: 'Ich mag gern Pizza.',
    answer: 'Ich esse gern Pizza.',
    acceptedAnswers: ['Ich esse gern Pizza', 'Ich mag Pizza.'],
    explanation: '`mögen` ve `gern` aynı cümlede kullanılmaz: ya `Ich mag Pizza.` ya `Ich esse gern Pizza.`.',
  }),

  /* ================= EV (18) ================= */
  G('gr-ev-drei-zimmer', T.home, 'free-text', 'easy', 'production', ['articles.miktar.oda'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Üç odamız var.',
    answer: 'Wir haben drei Zimmer.', acceptedAnswers: ['Wir haben drei Zimmer'],
    validation: DE_PROD, explanation: '`Zimmer` sayıdan sonra değişmez.',
    pronounce: ['Wir haben drei Zimmer.'],
  }),
  G('gr-ev-bad-klein-dunkel', T.home, 'free-text', 'medium', 'production', ['home.ev.bad', 'adjectives.tarif.dunkel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Banyomuz küçük ve koyu renkli.',
    answer: 'Unser Bad ist klein und dunkel.', acceptedAnswers: ['Unser Bad ist klein und dunkel'],
    validation: DE_PROD, pronounce: ['Unser Bad ist klein und dunkel.'],
  }),
  G('gr-ev-sofa-grau', T.home, 'free-text', 'medium', 'production', ['home.moebel.sofa', 'adjectives.tarif.grau', 'adjectives.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kanepe gri.',
    answer: 'Das Sofa ist grau.', acceptedAnswers: ['Das Sofa ist grau'],
    validation: DE_PROD, pronounce: ['Das Sofa ist grau.'],
  }),
  G('gr-ev-teppich-gross', T.home, 'free-text', 'medium', 'production', ['home.moebel.teppich-regal', 'adjectives.sifat.yuklem'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Halı büyük.',
    answer: 'Der Teppich ist groß.', acceptedAnswers: ['Der Teppich ist groß'],
    validation: DE_PROD, pronounce: ['Der Teppich ist groß.'],
  }),
  G('gr-ev-garten-gibt', T.akkusativ, 'free-text', 'medium', 'production', ['akkusativ.esgibt.temel', 'home.ev-kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bahçe var.',
    answer: 'Es gibt einen Garten.', acceptedAnswers: ['Es gibt einen Garten'],
    validation: DE_PROD, explanation: '`es gibt` Akkusativ ister: `einen Garten`.',
    pronounce: ['Es gibt einen Garten.'],
  }),
  G('gr-ev-gefaellt-wohnzimmer', T.likes, 'free-text', 'medium', 'production', ['likes.gefallen.kalip'], {
    instruction: 'Türkçeden Almancaya çevir (`gefallen` ile):', prompt: 'Salon hoşuma gidiyor.',
    answer: 'Das Wohnzimmer gefällt mir.', acceptedAnswers: ['Das Wohnzimmer gefällt mir'],
    validation: DE_PROD, pronounce: ['Das Wohnzimmer gefällt mir.'],
  }),
  G('gr-ev-katze-sessel', T.home, 'free-text', 'medium', 'production', ['home.moebel.auf-dem-sessel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedi koltukta.',
    answer: 'Die Katze ist auf dem Sessel.', acceptedAnswers: ['Die Katze ist auf dem Sessel'],
    validation: DE_PROD, pronounce: ['Die Katze ist auf dem Sessel.'],
  }),
  G('gr-ev-bett-gross', T.home, 'free-text', 'easy', 'production', ['home.moebel.bett'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yatağım büyük.',
    answer: 'Mein Bett ist groß.', acceptedAnswers: ['Mein Bett ist groß'],
    validation: DE_PROD, pronounce: ['Mein Bett ist groß.'],
  }),
  G('gr-ev-flur-schmal', T.home, 'free-text', 'medium', 'production', ['home.ev.flur', 'adjectives.tarif.schmal'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Koridor dar.',
    answer: 'Der Flur ist schmal.', acceptedAnswers: ['Der Flur ist schmal'],
    validation: DE_PROD, pronounce: ['Der Flur ist schmal.'],
  }),
  G('gr-ev-toilette-wo', T.home, 'free-text', 'medium', 'production', ['home.ev.toilette'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Tuvalet nerede?',
    answer: 'Wo ist die Toilette?', acceptedAnswers: ['Wo ist die Toilette'],
    validation: DE_PROD, pronounce: ['Wo ist die Toilette?'],
  }),
  G('gr-ev-regal-buecher', T.home, 'free-text', 'medium', 'production', ['home.moebel.teppich-regal', 'articles.cogul.umlaut', 'adjectives.sifat.cogul-artikelsiz'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Rafta kitaplar var.',
    answer: 'Es gibt Bücher auf dem Regal.', acceptedAnswers: ['Es gibt Bücher auf dem Regal'],
    validation: DE_PROD, hint: '`Buch → Bücher` (Umlaut çoğul).',
    pronounce: ['Es gibt Bücher auf dem Regal.'],
  }),
  G('gr-ev-sie-hell-wb', T.pronouns, 'word-bank-translation', 'medium', 'production', ['pronouns.zamir.die-sie'], {
    instruction: 'Kutucuklarla kur — Mutfak aydınlık. O (mutfak) büyük.',
    answer: 'Die Küche ist hell. Sie ist groß.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Mutfak aydınlık. O büyük.', targetLanguage: 'de',
      tokens: tok('Die', 'Küche', 'ist', 'hell.', 'Sie', 'ist', 'groß.', 'Er', 'das'),
      acceptedSequences: [['Die', 'Küche', 'ist', 'hell.', 'Sie', 'ist', 'groß.']],
    },
    pronounce: ['Die Küche ist hell. Sie ist groß.'],
  }),
  G('gr-ev-model-cumle', T.home, 'free-text', 'hard', 'production', ['home.evim.model', 'home.kalip.sira'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Evin: daire, 3 oda, mutfak aydınlık.',
    answer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell.',
    acceptedAnswers: ['Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell.',
  }),
  G('gr-ev-kuehl-schlafzimmer', T.adjectives, 'multiple-choice', 'medium', 'recognition', ['adjectives.tarif.kuehl'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Yatak odası serin.”',
    answer: 'Das Schlafzimmer ist kühl.',
    options: ['Das Schlafzimmer ist kühl.', 'Das Schlafzimmer ist kühl Zimmer.', 'Der Schlafzimmer ist kühl.', 'Das Schlafzimmer kühl ist.'],
    pronounce: ['Das Schlafzimmer ist kühl.'],
  }),
  G('gr-ev-breit-schmal-mc', T.adjectives, 'multiple-choice', 'easy', 'recognition', ['adjectives.tarif.gross-klein'], {
    instruction: 'Zıt anlamlı çifti seç:', prompt: 'geniş ↔ dar',
    answer: 'breit ↔ schmal',
    options: ['breit ↔ schmal', 'breit ↔ groß', 'hell ↔ groß', 'klein ↔ schmal'],
  }),
  G('gr-ev-dinle-kueche-gross', T.adjectives, 'listen-choice', 'medium', 'recognition', ['adjectives.tarif.hell'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Die Küche ist groß.',
    audioText: 'Die Küche ist groß.',
    answer: 'Die Küche ist groß.',
    options: ['Die Küche ist groß.', 'Die Küche ist hell.', 'Die Kirche ist groß.', 'Die Küche ist klein.'],
    audio: { prompt: { text: 'Die Küche ist groß.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Die Küche ist groß.'],
  }),
  G('gr-ev-dikte-wohnzimmer', T.home, 'dictation', 'medium', 'production', ['home.ev.wohnzimmer'], {
    instruction: 'Duyduğun ev cümlesini aynen yaz:',
    audioText: 'Das Wohnzimmer ist groß.',
    answer: 'Das Wohnzimmer ist groß.',
    audio: { prompt: { text: 'Das Wohnzimmer ist groß.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Das Wohnzimmer ist groß.'],
  }),
  G('gr-ev-error-gross-klein', T.adjectives, 'error-correction', 'easy', 'correction', ['adjectives.tarif.gross-klein'], {
    instruction: 'Sıfat hatasını düzelt:', prompt: 'Mein Zimmer ist klein, aber dunkel und hell.',
    answer: 'Mein Zimmer ist klein, aber hell.',
    acceptedAnswers: ['Mein Zimmer ist klein, aber hell'],
    explanation: 'Bir oda aynı anda hem koyu hem açık renkli olamaz; zıt çiftlerden biri seçilir.',
  }),

  /* ================= AYRILABILEN / MEIN TAG EK (22) ================= */
  G('gr-tm-stehst-auf', T.separableVerbs, 'fill-blank', 'medium', 'recall', ['separable-verbs.verb.aufstehen'], {
    instruction: '`aufstehen` fiilini çek:', prompt: 'Wann ___ du auf?',
    answer: 'stehst', explanation: '`du` → `stehst ... auf`.',
    pronounce: ['Wann stehst du auf?'],
  }),
  G('gr-tm-er-wacht-auf', T.separableVerbs, 'fill-blank', 'medium', 'recall', ['separable-verbs.verb.aufwachen'], {
    instruction: '`aufwachen` fiilini çek:', prompt: 'Er ___ um sechs Uhr auf.',
    answer: 'wacht', explanation: '`er` → `wacht ... auf`.',
  }),
  G('gr-tm-wir-ziehen-uns-an', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.anziehen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Hızlıca giyiniyoruz. (Giyiniyoruz.)',
    answer: 'Wir ziehen uns an.', acceptedAnswers: ['Wir ziehen uns an'],
    validation: DE_PROD, explanation: '`wir` → `uns`: `Wir ziehen uns an.`.',
    pronounce: ['Wir ziehen uns an.'],
  }),
  G('gr-tm-sie-kauft-ein', T.separableVerbs, 'fill-blank', 'medium', 'recall', ['separable-verbs.verb.einkaufen'], {
    instruction: '`einkaufen` fiilini çek:', prompt: 'Sie ___ oft ein. (O, sık sık alışveriş yapar.)',
    answer: 'kauft', explanation: '`sie` → `kauft ... ein`.',
  }),
  G('gr-tm-er-raeumt-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufraeumen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) odasını topluyor.',
    answer: 'Er räumt sein Zimmer auf.', acceptedAnswers: ['Er räumt sein Zimmer auf'],
    validation: DE_PROD, pronounce: ['Er räumt sein Zimmer auf.'],
  }),
  G('gr-tm-sie-sieht-fern', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.fernsehen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (kadın) akşam televizyon izliyor.',
    answer: 'Sie sieht am Abend fern.', acceptedAnswers: ['Sie sieht am Abend fern'],
    validation: DE_PROD, pronounce: ['Sie sieht am Abend fern.'],
  }),
  G('gr-tm-wache-aber-stehe', T.sentenceBuilding, 'free-text', 'hard', 'production', ['separable-verbs.verb.uyanma-farki', 'sentence-building.baglac.aber'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Uyanıyorum ama kalkmıyorum.',
    answer: 'Ich wache auf, aber ich stehe nicht auf.', acceptedAnswers: ['Ich wache auf, aber ich stehe nicht auf'],
    validation: DE_PROD, pronounce: ['Ich wache auf, aber ich stehe nicht auf.'],
  }),
  G('gr-tm-wann-wachst-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufwachen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat kaçta uyanıyorsun?',
    answer: 'Wann wachst du auf?', acceptedAnswers: ['Wann wachst du auf', 'Um wie viel Uhr wachst du auf?'],
    validation: DE_PROD, pronounce: ['Wann wachst du auf?'],
  }),
  G('gr-tm-komme-zurueck', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.zurueckkommen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat altıda geri dönüyorum.',
    answer: 'Ich komme um sechs Uhr zurück.', acceptedAnswers: ['Ich komme um sechs Uhr zurück'],
    validation: DE_PROD, pronounce: ['Ich komme um sechs Uhr zurück.'],
  }),
  G('gr-tm-lade-freunde-ein', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.einladen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Arkadaşlarımı davet ediyorum.',
    answer: 'Ich lade meine Freunde ein.', acceptedAnswers: ['Ich lade meine Freunde ein'],
    validation: DE_PROD, pronounce: ['Ich lade meine Freunde ein.'],
  }),
  G('gr-tm-bringe-brot-mit', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.mitbringen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek getiriyorum (beraberimde).',
    answer: 'Ich bringe Brot mit.', acceptedAnswers: ['Ich bringe Brot mit'],
    validation: DE_PROD, pronounce: ['Ich bringe Brot mit.'],
  }),
  G('gr-tm-er-setzt-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufsetzen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) gözlüğünü takıyor.',
    answer: 'Er setzt die Brille auf.', acceptedAnswers: ['Er setzt die Brille auf'],
    validation: DE_PROD, pronounce: ['Er setzt die Brille auf.'],
  }),
  G('gr-tm-wir-geben-acht', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.achtgeben'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dikkat ediyoruz.',
    answer: 'Wir geben acht.', acceptedAnswers: ['Wir geben acht'],
    validation: DE_PROD, pronounce: ['Wir geben acht.'],
  }),
  G('gr-tm-bereiten-essen-vor', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.vorbereiten'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yemeği hazırlıyoruz.',
    answer: 'Wir bereiten das Essen vor.', acceptedAnswers: ['Wir bereiten das Essen vor'],
    validation: DE_PROD, pronounce: ['Wir bereiten das Essen vor.'],
  }),
  G('gr-tm-er-hoert-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufhoeren'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) saat onda bırakıyor.',
    answer: 'Er hört um zehn Uhr auf.', acceptedAnswers: ['Er hört um zehn Uhr auf'],
    validation: DE_PROD, pronounce: ['Er hört um zehn Uhr auf.'],
  }),
  G('gr-tm-ziehe-abend-aus', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.ausziehen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam üstümü çıkarıyorum.',
    answer: 'Ich ziehe mich am Abend aus.', acceptedAnswers: ['Ich ziehe mich am Abend aus'],
    validation: DE_PROD, pronounce: ['Ich ziehe mich am Abend aus.'],
  }),
  G('gr-tm-besuchen-nicht', T.separableVerbs, 'multiple-choice', 'medium', 'recognition', ['separable-verbs.karsi.besuchen'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Seni ziyaret ediyorum.” (`besuchen` ayrılmaz!)',
    answer: 'Ich besuche dich.',
    options: ['Ich besuche dich.', 'Ich suche dich be.', 'Ich be dich suche.', 'Ich dich besuche.'],
    explanation: '`besuchen` ayrılmaz: önek hep fiilin yanında kalır.',
    pronounce: ['Ich besuche dich.'],
  }),
  G('gr-tm-vergessen-mc', T.separableVerbs, 'multiple-choice', 'medium', 'recognition', ['separable-verbs.karsi.liste'], {
    instruction: 'Hangisi AYRILMAZ fiildir?', prompt: 'Ayrılmayan öneki bul.',
    answer: 'vergessen',
    options: ['vergessen', 'aufstehen', 'einkaufen', 'anrufen'],
    explanation: '`ver-` ile başlayanlar ayrılmaz.',
  }),
  G('gr-tm-spiele-abend-freunden', T.dailyRoutine, 'free-text', 'hard', 'production', ['daily-routine.gun.freunde', 'sentence-building.dizilisi.zaman-basta'], {
    instruction: 'Türkçeden Almancaya çevir (akşam başta):', prompt: 'Akşam arkadaşlarımla oynuyorum.',
    answer: 'Am Abend spiele ich mit meinen Freunden.', acceptedAnswers: ['Am Abend spiele ich mit meinen Freunden'],
    validation: DE_PROD, pronounce: ['Am Abend spiele ich mit meinen Freunden.'],
  }),
  G('gr-tm-gehe-zehn-ins-bett', T.dailyRoutine, 'free-text', 'medium', 'production', ['daily-routine.aksam.bett', 'time.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat onda yatağa gidiyorum.',
    answer: 'Ich gehe um zehn Uhr ins Bett.', acceptedAnswers: ['Ich gehe um zehn Uhr ins Bett'],
    validation: DE_PROD, pronounce: ['Ich gehe um zehn Uhr ins Bett.'],
  }),
  G('gr-tm-dikte-wohnzimmer-auf', T.separableVerbs, 'dictation', 'hard', 'production', ['separable-verbs.verb.aufraeumen-cumle'], {
    instruction: 'Duyduğun toplama cümlesini aynen yaz:',
    audioText: 'Wir räumen das Wohnzimmer auf.',
    answer: 'Wir räumen das Wohnzimmer auf.',
    audio: { prompt: { text: 'Wir räumen das Wohnzimmer auf.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Wir räumen das Wohnzimmer auf.'],
  }),
  G('gr-tm-dinle-rufe-an', T.separableVerbs, 'listen-choice', 'medium', 'recognition', ['separable-verbs.verb.anrufen-cumle'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich rufe dich am Abend an.',
    audioText: 'Ich rufe dich am Abend an.',
    answer: 'Ich rufe dich am Abend an.',
    options: ['Ich rufe dich am Abend an.', 'Ich rufe dich am Morgen an.', 'Ich rufe dich am Abend auf.', 'Du rufst mich am Abend an.'],
    audio: { prompt: { text: 'Ich rufe dich am Abend an.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Ich rufe dich am Abend an.'],
  }),

  /* ================= KİŞİSEL / AİLE (12) ================= */
  G('gr-kisi-schwester-vor', T.pronouns, 'free-text', 'medium', 'production', ['home.evim.schwester'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bu benim kız kardeşim.',
    answer: 'Das ist meine Schwester.', acceptedAnswers: ['Das ist meine Schwester'],
    validation: DE_PROD, pronounce: ['Das ist meine Schwester.'],
  }),
  G('gr-kisi-vater-lehrer', T.pronouns, 'free-text', 'medium', 'production', ['pronouns.cumle.kalip'], {
    instruction: 'Türkçeden Almancaya çevir (kalıp: zamir + fiil + iyelik + isim):', prompt: 'Babam öğretmen.',
    answer: 'Mein Vater ist Lehrer.', acceptedAnswers: ['Mein Vater ist Lehrer'],
    validation: DE_PROD, pronounce: ['Mein Vater ist Lehrer.'],
  }),
  G('gr-kisi-sein-vater', T.pronouns, 'free-text', 'medium', 'production', ['pronouns.iyelik.sein-onun'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Onun (erkeğin) babası öğretmen.',
    answer: 'Sein Vater ist Lehrer.', acceptedAnswers: ['Sein Vater ist Lehrer'],
    validation: DE_PROD, pronounce: ['Sein Vater ist Lehrer.'],
  }),
  G('gr-kisi-unsere-katze', T.pronouns, 'free-text', 'medium', 'production', ['home.evim.katze', 'pronouns.iyelik.unser'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedimiz küçük ve gri.',
    answer: 'Unsere Katze ist klein und grau.', acceptedAnswers: ['Unsere Katze ist klein und grau'],
    validation: DE_PROD, pronounce: ['Unsere Katze ist klein und grau.'],
  }),
  G('gr-kisi-zwei-geschwister', T.vocabulary, 'free-text', 'medium', 'production', ['vocabulary.kelime.geschwister'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'İki kardeşim var.',
    answer: 'Ich habe zwei Geschwister.', acceptedAnswers: ['Ich habe zwei Geschwister'],
    validation: DE_PROD, pronounce: ['Ich habe zwei Geschwister.'],
  }),
  G('gr-kisi-geboren-sakarya', T.personalInfo, 'free-text', 'medium', 'production', ['personal-info.dogum.soru-cevap'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sakarya’da doğdum.',
    answer: 'Ich bin in Sakarya geboren.', acceptedAnswers: ['Ich bin in Sakarya geboren'],
    validation: DE_PROD, pronounce: ['Ich bin in Sakarya geboren.'],
  }),
  G('gr-kisi-wo-geboren', T.personalInfo, 'free-text', 'medium', 'production', ['personal-info.dogum.soru-cevap'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nerede doğdun? (samimi)',
    answer: 'Wo bist du geboren?', acceptedAnswers: ['Wo bist du geboren'],
    validation: DE_PROD, pronounce: ['Wo bist du geboren?'],
  }),
  G('gr-kisi-ledig', T.personalInfo, 'free-text', 'easy', 'production', ['personal-info.medeni-hal.ledig-verheiratet'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bekarım.',
    answer: 'Ich bin ledig.', acceptedAnswers: ['Ich bin ledig'],
    validation: DE_PROD, pronounce: ['Ich bin ledig.'],
  }),
  G('gr-kisi-familienname', T.personalInfo, 'free-text', 'easy', 'production', ['personal-info.form.alanlar'], {
    instruction: 'Formu tamamla (örnek kişi):', prompt: 'Soyadım Yılmaz.',
    answer: 'Mein Familienname ist Yılmaz.', acceptedAnswers: ['Mein Familienname ist Yılmaz'],
    validation: DE_PROD, pronounce: ['Mein Familienname ist Yılmaz.'],
  }),
  G('gr-kisi-arbeite-lehrer', T.personalInfo, 'free-text', 'medium', 'production', ['personal-info.beruf.als-bei'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğretmen olarak çalışıyorum.',
    answer: 'Ich arbeite als Lehrer.', acceptedAnswers: ['Ich arbeite als Lehrer', 'Ich arbeite als Lehrerin.'],
    validation: DE_PROD, pronounce: ['Ich arbeite als Lehrer.'],
  }),
  G('gr-kisi-vorstellen-bitte', T.greetings, 'free-text', 'medium', 'production', ['greetings.vorstellung.sich-vorstellen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kendini tanıtır mısın lütfen? (samimi)',
    answer: 'Kannst du dich bitte vorstellen?', acceptedAnswers: ['Kannst du dich bitte vorstellen'],
    validation: DE_PROD, pronounce: ['Kannst du dich bitte vorstellen?'],
  }),
  G('gr-kisi-dinle-wer-bist-du', T.greetings, 'listen-choice', 'easy', 'recognition', ['greetings.vorstellung.wer-bist-du'], {
    instruction: 'Duyduğun soruyu seç:',
    prompt: 'Wer bist du?',
    audioText: 'Wer bist du?',
    answer: 'Wer bist du?',
    options: ['Wer bist du?', 'Wie heißt du?', 'Wo wohnst du?', 'Wie ist dein Name?'],
    audio: { prompt: { text: 'Wer bist du?', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Wer bist du?'],
  }),

  /* ================= WRITING (8) ================= */
  G('gr-yaz-tanit-bes', T.personalInfo, 'free-text', 'hard', 'production', ['personal-info.tanitma.model'], {
    instruction: 'Kendini 5 cümleyle tanıt (ad, yaş, şehir, meslek, dil).',
    prompt: '5 cümle yaz: adın, yaşın, şehrin, mesleğin, dillerin.',
    answer: 'Ich heiße Mustafa. Ich bin achtzehn Jahre alt. Ich wohne in Sakarya. Ich bin Student. Ich spreche Türkisch und Englisch.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich heiße ...`, `Ich bin ... Jahre alt`, `Ich wohne in ...`, `Ich bin ...`, `Ich spreche ...`.',
    sampleAnswer: 'Ich heiße Mustafa. Ich bin achtzehn Jahre alt. Ich wohne in Sakarya. Ich bin Student. Ich spreche Türkisch und Englisch.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-aile', T.pronouns, 'free-text', 'hard', 'production', ['pronouns.cumle.kalip'], {
    instruction: 'Aileni 4 cümleyle anlat (anne, baba, kardeş, kedi).',
    prompt: '4 cümle yaz: annen, baban, kardeşin, evcil hayvanın.',
    answer: 'Meine Mutter ist Lehrerin. Mein Vater ist Lehrer. Ich habe zwei Geschwister. Unsere Katze ist klein.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıp: `Mein/Meine ... ist ...`, `Ich habe ...`.',
    sampleAnswer: 'Meine Mutter ist Lehrerin. Mein Vater ist Lehrer. Ich habe zwei Geschwister. Unsere Katze ist klein.',
  }),
  G('gr-yaz-yemek-sevme', T.food, 'free-text', 'hard', 'production', ['food.essen.antwort', 'food.essen.nicht-gern'], {
    instruction: 'Ne yemeyi/içmeyi sevdiğini 4 cümleyle anlat.',
    prompt: '4 cümle yaz: sevdiğin yemek, sevdiğin içecek, sevmediğin bir şey, en sevdiğin yemek.',
    answer: 'Ich esse gern Pizza. Ich trinke gern Milch. Ich esse nicht gern Reis. Mein Lieblingsessen ist Hähnchen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich esse/trinke gern ...`, `Ich esse nicht gern ...`, `Mein Lieblingsessen ist ...`.',
    sampleAnswer: 'Ich esse gern Pizza. Ich trinke gern Milch. Ich esse nicht gern Reis. Mein Lieblingsessen ist Hähnchen.',
  }),
  G('gr-yaz-ev-anlat', T.home, 'free-text', 'hard', 'production', ['home.evim.model'], {
    instruction: 'Evini 5 cümleyle anlat.',
    prompt: '5 cümle yaz: dairen, odalar, mutfak, salon, sevdiğin oda.',
    answer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell. Das Wohnzimmer ist groß. Das gefällt mir.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Wir haben ...`, `... ist hell/groß`, `Das gefällt mir.`.',
    sampleAnswer: 'Wir haben eine Wohnung. Wir haben drei Zimmer. Unsere Küche ist hell. Das Wohnzimmer ist groß. Das gefällt mir.',
  }),
  G('gr-yaz-gun-anlat', T.dailyRoutine, 'free-text', 'hard', 'production', ['daily-routine.tam.uretim'], {
    instruction: 'Gününü 6 cümleyle anlat (saat + `dann/danach` kullan).',
    prompt: '6 cümle yaz: kalkış, kahvaltı, okul, öğlen, akşam, yatış.',
    answer: 'Ich stehe um sieben Uhr auf. Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule. Ich esse zu Mittag. Danach komme ich nach Hause zurück. Ich gehe um zehn Uhr ins Bett.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıplar: `Ich stehe um ... auf`, `Dann ...`, `Danach ...`, `Ich gehe um ... ins Bett`.',
    sampleAnswer: 'Ich stehe um sieben Uhr auf. Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule. Ich esse zu Mittag. Danach komme ich nach Hause zurück. Ich gehe um zehn Uhr ins Bett.',
  }),
  G('gr-yaz-sabah-rutin', T.dailyRoutine, 'free-text', 'hard', 'production', ['daily-routine.tam.sablon'], {
    instruction: 'Sabah rutinini 5 cümleyle anlat.',
    prompt: '5 cümle yaz: uyan, kalk, yıkan, giyin, kahvaltı.',
    answer: 'Ich wache um sechs Uhr auf. Ich stehe um sechs Uhr auf. Ich wasche mein Gesicht. Ich ziehe mich an. Ich frühstücke.',
    validation: DE_PROD, openEnded: true,
    hint: 'Fiiller: `aufwachen`, `aufstehen`, `waschen`, `sich anziehen`, `frühstücken`.',
    sampleAnswer: 'Ich wache um sechs Uhr auf. Ich stehe um sechs Uhr auf. Ich wasche mein Gesicht. Ich ziehe mich an. Ich frühstücke.',
  }),
  G('gr-yaz-alisveris-liste', T.shopping, 'free-text', 'hard', 'production', ['shopping.alisveris.einkaufszettel'], {
    instruction: 'Bir alışveriş listesi oluştur (5 kalem + miktar).',
    prompt: '5 kalem yaz: ekmek, süt, domates, peynir, pirinç.',
    answer: 'Ich brauche Brot. Ich brauche Milch. Ich brauche Tomaten. Ich brauche Käse. Ich brauche Reis.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kalıp: `Ich brauche ...`. Miktar ekleyebilirsin: `ein Kilo ...`, `eine Packung ...`.',
    sampleAnswer: 'Ich brauche Brot. Ich brauche Milch. Ich brauche Tomaten. Ich brauche Käse. Ich brauche Reis.',
  }),
  G('gr-yaz-gunluk-kisa', T.dailyRoutine, 'free-text', 'hard', 'production', ['daily-routine.tam.uretim'], {
    instruction: 'Kısa bir günlük yaz (bugün neler yaptın, 5 cümle).',
    prompt: '5 cümle yaz: sabah, öğlen, akşam, sevdiğin an, yarın planı.',
    answer: 'Heute stehe ich um sieben Uhr auf. Ich esse zu Mittag in der Mensa. Am Abend sehe ich fern. Das gefällt mir. Morgen kaufe ich ein.',
    validation: DE_PROD, openEnded: true,
    hint: '`Heute ...`, `Morgen ...` ile başla. Bildiğin fiilleri kullan.',
    sampleAnswer: 'Heute stehe ich um sieben Uhr auf. Ich esse zu Mittag in der Mensa. Am Abend sehe ich fern. Das gefällt mir. Morgen kaufe ich ein.',
  }),
];
