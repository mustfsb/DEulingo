/**
 * Genel Tekrar — Cümle Kurma (64).
 *
 * Öğrenilmiş kavramların YENİ kombinasyonları. Her cümle yalnızca
 * LEARNED_SO_FAR kelime + dilbilgisi kullanır; ama bu tam cümle kalıbı
 * hiçbir gün havuzunda aynen sorulmamıştır.
 *
 * Seviyeler: L1 özne+fiil → L2 nesne → L3 zaman/yer → L4 ayrılabilen →
 * L5 soru/olumsuz → L6 bağlı cümleler → L7 kısa paragraf.
 */

import type { AuthoredExercise } from '../types.ts';
import { DE_PROD, G, tok } from './generalReviewBase.ts';

const P1F = 'private.day1.fiil-cekimi';
const P2O = 'private.day2.cumle-olumlu';
const P2N = 'private.day2.cumle-olumsuz';
const P2S = 'private.day2.sorular';
const P2G = 'private.day2.gunluk-hayat';
const P2K = 'private.day2.artikel-kein-mein-dein';
const P3Y = 'private.day3.yer-yon';
const P3I = 'private.day3.iyelik';
const P3A = 'private.day3.ayrilabilen-fiiller';
const P3G = 'private.day3.gunluk-hayat';
const P3Z = 'private.day3.zaman';
const P5B = 'private.day5.baglaclar';
const P6I = 'private.day6.iyelik-tablo';
const P7E = 'private.day7.essen-trinken';
const P7T = 'private.day7.evi-tarif';
const P7M = 'private.day7.mobilyalar';
const P7Z = 'private.day7.artikel-zamir';
const P7A = 'private.day7.alisveris-siklik';
const P7Q = 'private.day7.miktar';
const P7V = 'private.day7.evimi-anlatiyorum';
const P10K = 'private.day10.kern-verben';
const P10S = 'private.day10.mein-tag-sabah';
const P10G = 'private.day10.mein-tag-gun';
const P10A = 'private.day10.mein-tag-aksam';
const P10D = 'private.day10.dann-danach';
const P10U = 'private.day10.um-uhr';
const P10T = 'private.day10.mein-tag-tam';

export const GENERAL_REVIEW_SENTENCES: AuthoredExercise[] = [
  /* ================= L1: özne + fiil (8) ================= */
  G('gr-cum-l1-ich-lerne', P10G, 'free-text', 'easy', 'production', ['private.day10.gun.lernen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğreniyorum.',
    answer: 'Ich lerne.', acceptedAnswers: ['Ich lerne'],
    validation: DE_PROD, pronounce: ['Ich lerne.'],
  }),
  G('gr-cum-l1-er-kommt', P1F, 'free-text', 'easy', 'production', ['private.day1.verben.kommen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) geliyor.',
    answer: 'Er kommt.', acceptedAnswers: ['Er kommt'],
    validation: DE_PROD, pronounce: ['Er kommt.'],
  }),
  G('gr-cum-l1-wir-spielen', P10G, 'free-text', 'easy', 'production', ['private.day10.gun.freunde'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Oynuyoruz.',
    answer: 'Wir spielen.', acceptedAnswers: ['Wir spielen'],
    validation: DE_PROD, pronounce: ['Wir spielen.'],
  }),
  G('gr-cum-l1-sie-liest', P2G, 'free-text', 'medium', 'production', ['private.day2.gunluk.kitap-okuma'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (kadın) okuyor.',
    answer: 'Sie liest.', acceptedAnswers: ['Sie liest'],
    validation: DE_PROD, hint: '`lesen` → `sie liest` (e → ie).',
    pronounce: ['Sie liest.'],
  }),
  G('gr-cum-l1-du-rufst-wb', P10K, 'word-bank-translation', 'medium', 'production', ['private.day10.verb.anrufen-cumle'], {
    instruction: 'Kutucuklarla kur — Beni arıyorsun (telefonla).',
    answer: 'Du rufst mich an.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Beni arıyorsun.', targetLanguage: 'de',
      tokens: [...tok('Du', 'rufst', 'mich', 'an.', 'anrufst', 'dich'), { id: 't7', text: 'mich', distractor: true }],
      acceptedSequences: [['Du', 'rufst', 'mich', 'an.']],
    },
    pronounce: ['Du rufst mich an.'],
  }),
  G('gr-cum-l1-ich-dusche-ord', P10S, 'ordering', 'easy', 'production', ['private.day10.sabah.duschen'], {
    instruction: 'Kelimeleri doğru sıraya diz — Duş alıyorum.',
    answer: 'Ich dusche.',
    pronounce: ['Ich dusche.'],
  }),
  G('gr-cum-l1-es-regnet', P3G, 'free-text', 'easy', 'production', ['private.day3.hava.ifadeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yağmur yağıyor.',
    answer: 'Es regnet.', acceptedAnswers: ['Es regnet'],
    validation: DE_PROD, pronounce: ['Es regnet.'],
  }),
  G('gr-cum-l1-wetter-gut-sb', P3G, 'sentence-builder', 'easy', 'production', ['private.day3.hava.ifadeler'], {
    instruction: 'Cümleyi kur:', prompt: 'Hava güzel.',
    answer: 'Das Wetter ist schön.',
    pronounce: ['Das Wetter ist schön.'],
  }),

  /* ================= L2: özne + fiil + nesne (14) ================= */
  G('gr-cum-l2-kaffee', P2G, 'free-text', 'easy', 'production', ['private.day2.gunluk.kahve-spor'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve içiyorum.',
    answer: 'Ich trinke Kaffee.', acceptedAnswers: ['Ich trinke Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke Kaffee.'],
  }),
  G('gr-cum-l2-buch', P2G, 'free-text', 'easy', 'production', ['private.day2.gunluk.kitap-okuma'], {
    instruction: 'Türkçeden Almancaya çevir (akşam başta):', prompt: 'Akşam bir kitap okuyorum.',
    answer: 'Am Abend lese ich ein Buch.', acceptedAnswers: ['Am Abend lese ich ein Buch'],
    validation: DE_PROD, pronounce: ['Am Abend lese ich ein Buch.'],
  }),
  G('gr-cum-l2-schwester-milch', P7E, 'free-text', 'medium', 'production', ['private.day7.trinken.frage', 'private.day7.evim.schwester'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kız kardeşim süt içmeyi sever.',
    answer: 'Meine Schwester trinkt gern Milch.', acceptedAnswers: ['Meine Schwester trinkt gern Milch'],
    validation: DE_PROD, pronounce: ['Meine Schwester trinkt gern Milch.'],
  }),
  G('gr-cum-l2-bruder-fussball', P6I, 'free-text', 'medium', 'production', ['private.day2.artikel.dein-deine'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erkek kardeşin futbol oynuyor.',
    answer: 'Dein Bruder spielt Fußball.', acceptedAnswers: ['Dein Bruder spielt Fußball'],
    validation: DE_PROD, pronounce: ['Dein Bruder spielt Fußball.'],
  }),
  G('gr-cum-l2-hund-garten', P3Y, 'free-text', 'medium', 'production', ['private.day3.hayvanlar.kelime', 'private.day3.ev-kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Köpeğimiz bahçede oynuyor.',
    answer: 'Unser Hund spielt im Garten.', acceptedAnswers: ['Unser Hund spielt im Garten'],
    validation: DE_PROD, pronounce: ['Unser Hund spielt im Garten.'],
  }),
  G('gr-cum-l2-katze-milch-wb', P3I, 'word-bank-translation', 'medium', 'production', ['private.day3.hayvanlar.kelime', 'private.day3.iyelik.unser'], {
    instruction: 'Kutucuklarla kur — Kedimiz süt içiyor.',
    answer: 'Unsere Katze trinkt Milch.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kedimiz süt içiyor.', targetLanguage: 'de',
      tokens: tok('Unsere', 'Katze', 'trinkt', 'Milch.', 'Unser', 'trinken', 'die'),
      acceptedSequences: [['Unsere', 'Katze', 'trinkt', 'Milch.']],
    },
    pronounce: ['Unsere Katze trinkt Milch.'],
  }),
  G('gr-cum-l2-kaufe-tomaten', P7A, 'free-text', 'medium', 'production', ['private.day7.kaufen.frage'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'İki kilo domates alıyorum.',
    answer: 'Ich kaufe zwei Kilo Tomaten.', acceptedAnswers: ['Ich kaufe zwei Kilo Tomaten'],
    validation: DE_PROD, pronounce: ['Ich kaufe zwei Kilo Tomaten.'],
  }),
  G('gr-cum-l2-packung-reis', P7Q, 'free-text', 'medium', 'production', ['private.day7.miktar.packung', 'private.day7.essen.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir paket pirinç alıyorum.',
    answer: 'Ich kaufe eine Packung Reis.', acceptedAnswers: ['Ich kaufe eine Packung Reis'],
    validation: DE_PROD, pronounce: ['Ich kaufe eine Packung Reis.'],
  }),
  G('gr-cum-l2-dose-tomaten', P7Q, 'free-text', 'medium', 'production', ['private.day7.miktar.dose', 'private.day7.yiyecek.sahne'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir kutu domatese ihtiyacım var.',
    answer: 'Ich brauche eine Dose Tomaten.', acceptedAnswers: ['Ich brauche eine Dose Tomaten'],
    validation: DE_PROD, pronounce: ['Ich brauche eine Dose Tomaten.'],
  }),
  G('gr-cum-l2-lieblingsessen', P7E, 'free-text', 'medium', 'production', ['private.day7.essen.lieblingsessen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'En sevdiğim yemek pizza.',
    answer: 'Mein Lieblingsessen ist Pizza.', acceptedAnswers: ['Mein Lieblingsessen ist Pizza'],
    validation: DE_PROD, pronounce: ['Mein Lieblingsessen ist Pizza.'],
  }),
  G('gr-cum-l2-kenne-lehrerin', P7M, 'free-text', 'medium', 'production', ['private.day7.fiil.kennen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğretmenini tanıyorum.',
    answer: 'Ich kenne deine Lehrerin.', acceptedAnswers: ['Ich kenne deine Lehrerin'],
    validation: DE_PROD, pronounce: ['Ich kenne deine Lehrerin.'],
  }),
  G('gr-cum-l2-putze-zaehne', P10S, 'free-text', 'easy', 'production', ['private.day10.sabah.zaehne'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dişlerimi fırçalıyorum.',
    answer: 'Ich putze meine Zähne.', acceptedAnswers: ['Ich putze meine Zähne'],
    validation: DE_PROD, pronounce: ['Ich putze meine Zähne.'],
  }),
  G('gr-cum-l2-mache-hausaufgaben', P10G, 'ordering', 'easy', 'production', ['private.day10.gun.hausaufgaben'], {
    instruction: 'Kelimeleri doğru sıraya diz — Ödevimi yapıyorum.',
    answer: 'Ich mache meine Hausaufgaben.',
    pronounce: ['Ich mache meine Hausaufgaben.'],
  }),
  G('gr-cum-l2-sehe-fern-sb', P10K, 'sentence-builder', 'medium', 'production', ['private.day10.verb.fernsehen-cumle'], {
    instruction: 'Cümleyi kur:', prompt: 'Akşam televizyon izliyoruz.',
    answer: 'Wir sehen am Abend fern.',
    pronounce: ['Wir sehen am Abend fern.'],
  }),

  /* ================= L3: zaman / yer (12) ================= */
  G('gr-cum-l3-heute-schule', P2O, 'free-text', 'easy', 'production', ['private.day2.cumle.olumlu-yapi', 'private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bugün okula gidiyorum.',
    answer: 'Ich gehe heute zur Schule.', acceptedAnswers: ['Ich gehe heute zur Schule'],
    validation: DE_PROD, pronounce: ['Ich gehe heute zur Schule.'],
  }),
  G('gr-cum-l3-abend-buch', P10A, 'free-text', 'medium', 'production', ['private.day10.aksam.buch', 'private.day3.zaman.am'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam sık sık kitap okuyorum.',
    answer: 'Ich lese am Abend oft ein Buch.', acceptedAnswers: ['Ich lese am Abend oft ein Buch'],
    validation: DE_PROD, explanation: 'Zaman başta da olabilir: `Am Abend lese ich ...`.',
    pronounce: ['Ich lese am Abend oft ein Buch.'],
  }),
  G('gr-cum-l3-morgen-fussball', P3Z, 'free-text', 'medium', 'production', ['private.day3.zaman.morgen-cift-anlam', 'private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yarın parkta futbol oynuyoruz.',
    answer: 'Morgen spielen wir im Park Fußball.', acceptedAnswers: ['Morgen spielen wir im Park Fußball', 'Wir spielen morgen im Park Fußball.'],
    validation: DE_PROD, pronounce: ['Morgen spielen wir im Park Fußball.'],
  }),
  G('gr-cum-l3-um-sieben-fruehstueck', P10U, 'free-text', 'medium', 'production', ['private.day10.um.kural', 'private.day10.sabah.fruehstuecken'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat yedide kahvaltı ediyorum.',
    answer: 'Ich frühstücke um sieben Uhr.', acceptedAnswers: ['Ich frühstücke um sieben Uhr', 'Um sieben Uhr frühstücke ich.'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um sieben Uhr.'],
  }),
  G('gr-cum-l3-um-neun-abendessen', P10A, 'free-text', 'medium', 'production', ['private.day10.aksam.abendessen', 'private.day10.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat dokuzda akşam yemeği yiyorum.',
    answer: 'Ich esse um neun Uhr Abendessen.', acceptedAnswers: ['Ich esse um neun Uhr Abendessen'],
    validation: DE_PROD, pronounce: ['Ich esse um neun Uhr Abendessen.'],
  }),
  G('gr-cum-l3-jeden-morgen-sport', P2G, 'free-text', 'easy', 'production', ['private.day2.gunluk.kahve-spor', 'private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah spor yapıyorum.',
    answer: 'Ich mache jeden Morgen Sport.', acceptedAnswers: ['Ich mache jeden Morgen Sport'],
    validation: DE_PROD, pronounce: ['Ich mache jeden Morgen Sport.'],
  }),
  G('gr-cum-l3-wo-spielt-bruder', P2S, 'free-text', 'medium', 'production', ['private.day2.sorular.evet-hayir-yapi'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erkek kardeşin nerede oynuyor?',
    answer: 'Wo spielt dein Bruder?', acceptedAnswers: ['Wo spielt dein Bruder'],
    validation: DE_PROD, pronounce: ['Wo spielt dein Bruder?'],
  }),
  G('gr-cum-l3-zu-hause-arbeite', P3Y, 'free-text', 'medium', 'production', ['private.day3.zu-hause'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bugün evde çalışıyorum.',
    answer: 'Ich arbeite heute zu Hause.', acceptedAnswers: ['Ich arbeite heute zu Hause', 'Heute arbeite ich zu Hause.'],
    validation: DE_PROD, pronounce: ['Ich arbeite heute zu Hause.'],
  }),
  G('gr-cum-l3-nach-hause-komme', P3Y, 'free-text', 'medium', 'production', ['private.day3.nach-hause'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam eve geliyorum.',
    answer: 'Am Abend komme ich nach Hause.', acceptedAnswers: ['Am Abend komme ich nach Hause', 'Ich komme am Abend nach Hause.'],
    validation: DE_PROD, pronounce: ['Am Abend komme ich nach Hause.'],
  }),
  G('gr-cum-l3-mit-freunden-wb', P3Y, 'word-bank-translation', 'hard', 'production', ['private.day3.mit-meinen-freunden'], {
    instruction: 'Kutucuklarla kur — Arkadaşlarımla futbol oynuyorum.',
    answer: 'Ich spiele mit meinen Freunden Fußball.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Arkadaşlarımla futbol oynuyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'spiele', 'mit', 'meinen', 'Freunden', 'Fußball.', 'meine', 'Freunde'),
      acceptedSequences: [['Ich', 'spiele', 'mit', 'meinen', 'Freunden', 'Fußball.']],
    },
    explanation: '`mit` Dativ ister; çoğulda `meinen Freunden`.',
    pronounce: ['Ich spiele mit meinen Freunden Fußball.'],
  }),
  G('gr-cum-l3-oft-pizza-ord', P7A, 'ordering', 'medium', 'production', ['private.day7.siklik.cumlede', 'private.day7.siklik.oft'], {
    instruction: 'Kelimeleri doğru sıraya diz — Sık sık pizza yiyorum.',
    answer: 'Ich esse oft Pizza.',
    explanation: 'Sıklık kelimesi fiilden hemen sonra gelir.',
    pronounce: ['Ich esse oft Pizza.'],
  }),
  G('gr-cum-l3-nie-fernsehen', P7A, 'free-text', 'medium', 'production', ['private.day7.siklik.nie'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Asla televizyon izlemem.',
    answer: 'Ich sehe nie fern.', acceptedAnswers: ['Ich sehe nie fern'],
    validation: DE_PROD, pronounce: ['Ich sehe nie fern.'],
  }),

  /* ================= L4: ayrılabilen fiil (12) ================= */
  G('gr-cum-l4-stehe-sieben-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufstehen', 'private.day10.um.ornek'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah saat yedide kalkıyorum.',
    answer: 'Ich stehe jeden Morgen um sieben Uhr auf.', acceptedAnswers: ['Ich stehe jeden Morgen um sieben Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich stehe jeden Morgen um sieben Uhr auf.'],
  }),
  G('gr-cum-l4-wache-sechs-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufwachen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat altıda uyanıyorum.',
    answer: 'Ich wache um sechs Uhr auf.', acceptedAnswers: ['Ich wache um sechs Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich wache um sechs Uhr auf.'],
  }),
  G('gr-cum-l4-ziehe-an', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.anziehen-chunk'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sabah giyiniyorum.',
    answer: 'Ich ziehe mich am Morgen an.', acceptedAnswers: ['Ich ziehe mich am Morgen an', 'Am Morgen ziehe ich mich an.'],
    validation: DE_PROD, pronounce: ['Ich ziehe mich am Morgen an.'],
  }),
  G('gr-cum-l4-kaufe-ein-sb', P10K, 'sentence-builder', 'medium', 'production', ['private.day10.verb.einkaufen-cumle'], {
    instruction: 'Cümleyi kur:', prompt: 'Bugün alışveriş yapıyoruz.',
    answer: 'Wir kaufen heute ein.',
    pronounce: ['Wir kaufen heute ein.'],
  }),
  G('gr-cum-l4-raeume-zimmer-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufraeumen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Odamı topluyorum.',
    answer: 'Ich räume mein Zimmer auf.', acceptedAnswers: ['Ich räume mein Zimmer auf'],
    validation: DE_PROD, pronounce: ['Ich räume mein Zimmer auf.'],
  }),
  G('gr-cum-l4-rufe-abend-an', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.anrufen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam seni arıyorum.',
    answer: 'Ich rufe dich am Abend an.', acceptedAnswers: ['Ich rufe dich am Abend an'],
    validation: DE_PROD, pronounce: ['Ich rufe dich am Abend an.'],
  }),
  G('gr-cum-l4-bereite-fruehstueck-vor', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.vorbereiten'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltıyı hazırlıyorum.',
    answer: 'Ich bereite das Frühstück vor.', acceptedAnswers: ['Ich bereite das Frühstück vor'],
    validation: DE_PROD, pronounce: ['Ich bereite das Frühstück vor.'],
  }),
  G('gr-cum-l4-lade-dich-ein', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.einladen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Seni davet ediyorum.',
    answer: 'Ich lade dich ein.', acceptedAnswers: ['Ich lade dich ein'],
    validation: DE_PROD, pronounce: ['Ich lade dich ein.'],
  }),
  G('gr-cum-l4-bringe-buch-mit', P10K, 'free-text', 'hard', 'production', ['private.day10.verb.mitbringen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir kitap getiriyorum (beraberimde).',
    answer: 'Ich bringe ein Buch mit.', acceptedAnswers: ['Ich bringe ein Buch mit'],
    validation: DE_PROD, pronounce: ['Ich bringe ein Buch mit.'],
  }),
  G('gr-cum-l4-hoere-auf', P10K, 'free-text', 'medium', 'production', ['private.day10.verb.aufhoeren'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat onda bırakıyorum.',
    answer: 'Ich höre um zehn Uhr auf.', acceptedAnswers: ['Ich höre um zehn Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich höre um zehn Uhr auf.'],
  }),
  G('gr-cum-l4-error-aufstehe', P3A, 'error-correction', 'medium', 'correction', ['private.day3.ayrilabilen.kural'], {
    instruction: 'Önek hatasını düzelt:', prompt: 'Ich aufstehe um 8 Uhr.',
    answer: 'Ich stehe um 8 Uhr auf.',
    explanation: 'Önek sona gider: `Ich stehe ... auf`.',
  }),
  G('gr-cum-l4-um-sieben-stehe-ord', P10U, 'ordering', 'medium', 'production', ['private.day10.trennbar.saat-basta'], {
    instruction: 'Kelimeleri doğru sıraya diz — Saat yedide kalkıyorum (saat başta).',
    answer: 'Um sieben Uhr stehe ich auf.',
    pronounce: ['Um sieben Uhr stehe ich auf.'],
  }),

  /* ================= L5: soru + olumsuzluk (10) ================= */
  G('gr-cum-l5-was-isst-gern', P7E, 'free-text', 'medium', 'production', ['private.day7.essen.frage'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ne yemeyi seversin?',
    answer: 'Was isst du gern?', acceptedAnswers: ['Was isst du gern'],
    validation: DE_PROD, pronounce: ['Was isst du gern?'],
  }),
  G('gr-cum-l5-gehst-schule', P2S, 'free-text', 'medium', 'production', ['private.day2.sorular.evet-hayir-yapi'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün okula gidiyor musun?',
    answer: 'Gehst du jeden Tag zur Schule?', acceptedAnswers: ['Gehst du jeden Tag zur Schule'],
    validation: DE_PROD, pronounce: ['Gehst du jeden Tag zur Schule?'],
  }),
  G('gr-cum-l5-ja-nein-voll', P2S, 'free-text', 'medium', 'production', ['private.day2.sorular.ja-nein-cevap'], {
    instruction: 'Tam cümleyle cevapla: `Trinkst du gern Milch?` → Evet, ...',
    prompt: 'Trinkst du gern Milch? → Ja, ...',
    answer: 'Ja, ich trinke gern Milch.', acceptedAnswers: ['Ja, ich trinke gern Milch'],
    validation: DE_PROD, pronounce: ['Ja, ich trinke gern Milch.'],
  }),
  G('gr-cum-l5-nein-orangensaft', P2S, 'free-text', 'medium', 'production', ['private.day2.sorular.ja-nein-cevap', 'private.day2.olumsuzluk.nicht'], {
    instruction: 'Tam cümleyle cevapla: `Trinkst du Orangensaft?` → Hayır, ...',
    prompt: 'Trinkst du Orangensaft? → Nein, ...',
    answer: 'Nein, ich trinke nicht Orangensaft.', acceptedAnswers: ['Nein, ich trinke nicht Orangensaft', 'Nein, ich trinke keinen Orangensaft.'],
    validation: DE_PROD, hint: 'İçecek isimleri artikellidir; `nicht` ile olumsuzlanır.',
  }),
  G('gr-cum-l5-nicht-heute', P2N, 'free-text', 'medium', 'production', ['private.day2.olumsuzluk.nicht'], {
    instruction: 'Olumsuza çevir:', prompt: 'Ich gehe heute zur Arbeit. → ______',
    answer: 'Ich gehe heute nicht zur Arbeit.', acceptedAnswers: ['Ich gehe heute nicht zur Arbeit'],
    validation: DE_PROD, pronounce: ['Ich gehe heute nicht zur Arbeit.'],
  }),
  G('gr-cum-l5-kein-auto', P2K, 'free-text', 'medium', 'production', ['private.day2.artikel.kein-keine'], {
    instruction: 'Olumsuza çevir:', prompt: 'Ich habe ein Auto. → ______',
    answer: 'Ich habe kein Auto.', acceptedAnswers: ['Ich habe kein Auto'],
    validation: DE_PROD, pronounce: ['Ich habe kein Auto.'],
  }),
  G('gr-cum-l5-keine-katze', P2K, 'free-text', 'medium', 'production', ['private.day2.artikel.kein-keine'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedim yok.',
    answer: 'Ich habe keine Katze.', acceptedAnswers: ['Ich habe keine Katze'],
    validation: DE_PROD, pronounce: ['Ich habe keine Katze.'],
  }),
  G('gr-cum-l5-trinkt-nicht-gern', P7E, 'free-text', 'medium', 'production', ['private.day7.essen.nicht-gern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Babam kahve içmeyi sevmez.',
    answer: 'Mein Vater trinkt nicht gern Kaffee.', acceptedAnswers: ['Mein Vater trinkt nicht gern Kaffee'],
    validation: DE_PROD, pronounce: ['Mein Vater trinkt nicht gern Kaffee.'],
  }),
  G('gr-cum-l5-error-nicht-stelle', P2N, 'error-correction', 'medium', 'correction', ['private.day2.olumsuzluk.nicht'], {
    instruction: 'Olumsuzluk hatasını düzelt:', prompt: 'Ich nicht gehe zur Schule.',
    answer: 'Ich gehe nicht zur Schule.',
    explanation: '`nicht` fiilden sonra gelir: `Ich gehe nicht ...`.',
  }),
  G('gr-cum-l5-was-kostet-brot', P7E, 'free-text', 'medium', 'production', ['private.day7.fiyat.was-kostet'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek kaç para? (Bu ne kadar?)',
    answer: 'Was kostet das Brot?', acceptedAnswers: ['Was kostet das Brot', 'Wie viel kostet das Brot?'],
    validation: DE_PROD, pronounce: ['Was kostet das Brot?'],
  }),

  /* ================= L6: bağlı cümleler (6) ================= */
  G('gr-cum-l6-dann-schule', P10D, 'free-text', 'hard', 'production', ['private.day10.dann.dann'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sonra okula gidiyorum.',
    answer: 'Dann gehe ich zur Schule.', acceptedAnswers: ['Dann gehe ich zur Schule'],
    validation: DE_PROD, pronounce: ['Dann gehe ich zur Schule.'],
  }),
  G('gr-cum-l6-danach-haus', P10D, 'free-text', 'hard', 'production', ['private.day10.dann.danach', 'private.day10.dann.v2'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Daha sonra eve geliyorum.',
    answer: 'Danach komme ich nach Hause.', acceptedAnswers: ['Danach komme ich nach Hause'],
    validation: DE_PROD, explanation: '`Danach` başta → fiil ikinci sırada.',
    pronounce: ['Danach komme ich nach Hause.'],
  }),
  G('gr-cum-l6-und-aber', P5B, 'free-text', 'hard', 'production', ['private.day5.baglac.und', 'private.day5.baglac.aber'], {
    instruction: 'Tek cümlede birleştir (`aber` ile):', prompt: 'Odam küçük. Odam aydınlık.',
    answer: 'Mein Zimmer ist klein, aber hell.', acceptedAnswers: ['Mein Zimmer ist klein, aber hell'],
    validation: DE_PROD, pronounce: ['Mein Zimmer ist klein, aber hell.'],
  }),
  G('gr-cum-l6-kueche-hell-wb', P7T, 'word-bank-translation', 'medium', 'production', ['private.day7.tarif.hell', 'private.day7.tarif.sein-sifat'], {
    instruction: 'Kutucuklarla kur — Mutfak aydınlık ve büyük.',
    answer: 'Die Küche ist hell und groß.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Mutfak aydınlık ve büyük.', targetLanguage: 'de',
      tokens: tok('Die', 'Küche', 'ist', 'hell', 'und', 'groß.', 'dunkel', 'der'),
      acceptedSequences: [['Die', 'Küche', 'ist', 'hell', 'und', 'groß.']],
    },
    pronounce: ['Die Küche ist hell und groß.'],
  }),
  G('gr-cum-l6-schrank-grau-er', P7Z, 'free-text', 'hard', 'production', ['private.day7.zamir.cumlede', 'private.day7.zamir.der-er'], {
    instruction: 'İki cümleyle anlat (zamir kullan):', prompt: 'Dolap büyük. O (dolap) gri.',
    answer: 'Der Schrank ist groß. Er ist grau.', acceptedAnswers: ['Der Schrank ist groß. Er ist grau'],
    validation: DE_PROD, explanation: '`der Schrank` → `er`.',
    pronounce: ['Der Schrank ist groß. Er ist grau.'],
  }),
  G('gr-cum-l6-fruehstueck-dann', P10D, 'free-text', 'hard', 'production', ['private.day10.tam.model', 'private.day10.dann.dann'], {
    instruction: 'İki cümleyle anlat:', prompt: 'Saat yedide kahvaltı ediyorum. Sonra okula gidiyorum.',
    answer: 'Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule.', acceptedAnswers: ['Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule.'],
  }),

  /* ================= L7: mini anlatım (2) ================= */
  G('gr-cum-l7-mini-tag', P10T, 'free-text', 'hard', 'production', ['private.day10.tam.uretim'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Sabah rutinin: uyan, kalk, giyin.',
    answer: 'Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.',
    acceptedAnswers: ['Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.',
    pronounce: ['Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.'],
  }),
  G('gr-cum-l7-mini-wohnzimmer', P7V, 'free-text', 'hard', 'production', ['private.day7.evim.model'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Salonun: var, büyük, kanepe + televizyon.',
    answer: 'Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher.',
    acceptedAnswers: ['Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher.',
    pronounce: ['Wir haben ein Wohnzimmer.'],
  }),
];
