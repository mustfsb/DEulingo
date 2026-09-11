/**
 * Genel Tekrar — Cümle Kurma (64).
 *
 * Öğrenilmiş kavramların YENİ kombinasyonları. Her cümle yalnızca
 * LEARNED_SO_FAR kelime + dilbilgisi kullanır; ama bu tam cümle kalıbı
 * hiçbir konu bankasında aynen sorulmamıştır.
 *
 * Seviyeler: L1 özne+fiil → L2 nesne → L3 zaman/yer → L4 ayrılabilen →
 * L5 soru/olumsuz → L6 bağlı cümleler → L7 kısa paragraf.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G, tok } from './base.ts';

export const GENERAL_REVIEW_SENTENCES: AuthoredExercise[] = [
  /* ================= L1: özne + fiil (8) ================= */
  G('gr-cum-l1-ich-lerne', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gun.lernen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğreniyorum.',
    answer: 'Ich lerne.', acceptedAnswers: ['Ich lerne'],
    validation: DE_PROD, pronounce: ['Ich lerne.'],
  }),
  G('gr-cum-l1-er-kommt', T.verbs, 'free-text', 'easy', 'production', ['verbs.verben.kommen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (erkek) geliyor.',
    answer: 'Er kommt.', acceptedAnswers: ['Er kommt'],
    validation: DE_PROD, pronounce: ['Er kommt.'],
  }),
  G('gr-cum-l1-wir-spielen', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gun.freunde'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Oynuyoruz.',
    answer: 'Wir spielen.', acceptedAnswers: ['Wir spielen'],
    validation: DE_PROD, pronounce: ['Wir spielen.'],
  }),
  G('gr-cum-l1-sie-liest', T.dailyRoutine, 'free-text', 'medium', 'production', ['daily-routine.gunluk.kitap-okuma'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'O (kadın) okuyor.',
    answer: 'Sie liest.', acceptedAnswers: ['Sie liest'],
    validation: DE_PROD, hint: '`lesen` → `sie liest` (e → ie).',
    pronounce: ['Sie liest.'],
  }),
  G('gr-cum-l1-du-rufst-wb', T.separableVerbs, 'word-bank-translation', 'medium', 'production', ['separable-verbs.verb.anrufen-cumle'], {
    instruction: 'Kutucuklarla kur — Beni arıyorsun (telefonla).',
    answer: 'Du rufst mich an.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Beni arıyorsun.', targetLanguage: 'de',
      tokens: [...tok('Du', 'rufst', 'mich', 'an.', 'anrufst', 'dich'), { id: 't7', text: 'mich', distractor: true }],
      acceptedSequences: [['Du', 'rufst', 'mich', 'an.']],
    },
    pronounce: ['Du rufst mich an.'],
  }),
  G('gr-cum-l1-ich-dusche-ord', T.dailyRoutine, 'ordering', 'easy', 'production', ['daily-routine.sabah.duschen'], {
    instruction: 'Kelimeleri doğru sıraya diz — Duş alıyorum.',
    answer: 'Ich dusche.',
    pronounce: ['Ich dusche.'],
  }),
  G('gr-cum-l1-es-regnet', T.vocabulary, 'free-text', 'easy', 'production', ['vocabulary.hava.ifadeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yağmur yağıyor.',
    answer: 'Es regnet.', acceptedAnswers: ['Es regnet'],
    validation: DE_PROD, pronounce: ['Es regnet.'],
  }),
  G('gr-cum-l1-wetter-gut-sb', T.vocabulary, 'sentence-builder', 'easy', 'production', ['vocabulary.hava.ifadeler'], {
    instruction: 'Cümleyi kur:', prompt: 'Hava güzel.',
    answer: 'Das Wetter ist schön.',
    pronounce: ['Das Wetter ist schön.'],
  }),

  /* ================= L2: özne + fiil + nesne (14) ================= */
  G('gr-cum-l2-kaffee', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gunluk.kahve-spor'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve içiyorum.',
    answer: 'Ich trinke Kaffee.', acceptedAnswers: ['Ich trinke Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke Kaffee.'],
  }),
  G('gr-cum-l2-buch', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gunluk.kitap-okuma'], {
    instruction: 'Türkçeden Almancaya çevir (akşam başta):', prompt: 'Akşam bir kitap okuyorum.',
    answer: 'Am Abend lese ich ein Buch.', acceptedAnswers: ['Am Abend lese ich ein Buch'],
    validation: DE_PROD, pronounce: ['Am Abend lese ich ein Buch.'],
  }),
  G('gr-cum-l2-schwester-milch', T.food, 'free-text', 'medium', 'production', ['food.trinken.frage', 'home.evim.schwester'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kız kardeşim süt içmeyi sever.',
    answer: 'Meine Schwester trinkt gern Milch.', acceptedAnswers: ['Meine Schwester trinkt gern Milch'],
    validation: DE_PROD, pronounce: ['Meine Schwester trinkt gern Milch.'],
  }),
  G('gr-cum-l2-bruder-fussball', T.pronouns, 'free-text', 'medium', 'production', ['articles.artikel.dein-deine'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erkek kardeşin futbol oynuyor.',
    answer: 'Dein Bruder spielt Fußball.', acceptedAnswers: ['Dein Bruder spielt Fußball'],
    validation: DE_PROD, pronounce: ['Dein Bruder spielt Fußball.'],
  }),
  G('gr-cum-l2-hund-garten', T.places, 'free-text', 'medium', 'production', ['vocabulary.hayvanlar.kelime', 'home.ev-kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Köpeğimiz bahçede oynuyor.',
    answer: 'Unser Hund spielt im Garten.', acceptedAnswers: ['Unser Hund spielt im Garten'],
    validation: DE_PROD, pronounce: ['Unser Hund spielt im Garten.'],
  }),
  G('gr-cum-l2-katze-milch-wb', T.pronouns, 'word-bank-translation', 'medium', 'production', ['vocabulary.hayvanlar.kelime', 'pronouns.iyelik.unser'], {
    instruction: 'Kutucuklarla kur — Kedimiz süt içiyor.',
    answer: 'Unsere Katze trinkt Milch.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kedimiz süt içiyor.', targetLanguage: 'de',
      tokens: tok('Unsere', 'Katze', 'trinkt', 'Milch.', 'Unser', 'trinken', 'die'),
      acceptedSequences: [['Unsere', 'Katze', 'trinkt', 'Milch.']],
    },
    pronounce: ['Unsere Katze trinkt Milch.'],
  }),
  G('gr-cum-l2-kaufe-tomaten', T.shopping, 'free-text', 'medium', 'production', ['shopping.kaufen.frage'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'İki kilo domates alıyorum.',
    answer: 'Ich kaufe zwei Kilo Tomaten.', acceptedAnswers: ['Ich kaufe zwei Kilo Tomaten'],
    validation: DE_PROD, pronounce: ['Ich kaufe zwei Kilo Tomaten.'],
  }),
  G('gr-cum-l2-packung-reis', T.shopping, 'free-text', 'medium', 'production', ['shopping.miktar.packung', 'food.essen.kelimeler'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir paket pirinç alıyorum.',
    answer: 'Ich kaufe eine Packung Reis.', acceptedAnswers: ['Ich kaufe eine Packung Reis'],
    validation: DE_PROD, pronounce: ['Ich kaufe eine Packung Reis.'],
  }),
  G('gr-cum-l2-dose-tomaten', T.shopping, 'free-text', 'medium', 'production', ['shopping.miktar.dose', 'food.yiyecek.sahne'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir kutu domatese ihtiyacım var.',
    answer: 'Ich brauche eine Dose Tomaten.', acceptedAnswers: ['Ich brauche eine Dose Tomaten'],
    validation: DE_PROD, pronounce: ['Ich brauche eine Dose Tomaten.'],
  }),
  G('gr-cum-l2-lieblingsessen', T.food, 'free-text', 'medium', 'production', ['food.essen.lieblingsessen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'En sevdiğim yemek pizza.',
    answer: 'Mein Lieblingsessen ist Pizza.', acceptedAnswers: ['Mein Lieblingsessen ist Pizza'],
    validation: DE_PROD, pronounce: ['Mein Lieblingsessen ist Pizza.'],
  }),
  G('gr-cum-l2-kenne-lehrerin', T.home, 'free-text', 'medium', 'production', ['verbs.fiil.kennen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Öğretmenini tanıyorum.',
    answer: 'Ich kenne deine Lehrerin.', acceptedAnswers: ['Ich kenne deine Lehrerin'],
    validation: DE_PROD, pronounce: ['Ich kenne deine Lehrerin.'],
  }),
  G('gr-cum-l2-putze-zaehne', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.sabah.zaehne'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dişlerimi fırçalıyorum.',
    answer: 'Ich putze meine Zähne.', acceptedAnswers: ['Ich putze meine Zähne'],
    validation: DE_PROD, pronounce: ['Ich putze meine Zähne.'],
  }),
  G('gr-cum-l2-mache-hausaufgaben', T.dailyRoutine, 'ordering', 'easy', 'production', ['daily-routine.gun.hausaufgaben'], {
    instruction: 'Kelimeleri doğru sıraya diz — Ödevimi yapıyorum.',
    answer: 'Ich mache meine Hausaufgaben.',
    pronounce: ['Ich mache meine Hausaufgaben.'],
  }),
  G('gr-cum-l2-sehe-fern-sb', T.separableVerbs, 'sentence-builder', 'medium', 'production', ['separable-verbs.verb.fernsehen-cumle'], {
    instruction: 'Cümleyi kur:', prompt: 'Akşam televizyon izliyoruz.',
    answer: 'Wir sehen am Abend fern.',
    pronounce: ['Wir sehen am Abend fern.'],
  }),

  /* ================= L3: zaman / yer (12) ================= */
  G('gr-cum-l3-heute-schule', T.sentenceBuilding, 'free-text', 'easy', 'production', ['sentence-building.cumle.olumlu-yapi', 'sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bugün okula gidiyorum.',
    answer: 'Ich gehe heute zur Schule.', acceptedAnswers: ['Ich gehe heute zur Schule'],
    validation: DE_PROD, pronounce: ['Ich gehe heute zur Schule.'],
  }),
  G('gr-cum-l3-abend-buch', T.dailyRoutine, 'free-text', 'medium', 'production', ['daily-routine.aksam.buch', 'time.zaman.am'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam sık sık kitap okuyorum.',
    answer: 'Ich lese am Abend oft ein Buch.', acceptedAnswers: ['Ich lese am Abend oft ein Buch'],
    validation: DE_PROD, explanation: 'Zaman başta da olabilir: `Am Abend lese ich ...`.',
    pronounce: ['Ich lese am Abend oft ein Buch.'],
  }),
  G('gr-cum-l3-morgen-fussball', T.time, 'free-text', 'medium', 'production', ['time.zaman.morgen-cift-anlam', 'sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yarın parkta futbol oynuyoruz.',
    answer: 'Morgen spielen wir im Park Fußball.', acceptedAnswers: ['Morgen spielen wir im Park Fußball', 'Wir spielen morgen im Park Fußball.'],
    validation: DE_PROD, pronounce: ['Morgen spielen wir im Park Fußball.'],
  }),
  G('gr-cum-l3-um-sieben-fruehstueck', T.time, 'free-text', 'medium', 'production', ['time.um.kural', 'daily-routine.sabah.fruehstuecken'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat yedide kahvaltı ediyorum.',
    answer: 'Ich frühstücke um sieben Uhr.', acceptedAnswers: ['Ich frühstücke um sieben Uhr', 'Um sieben Uhr frühstücke ich.'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um sieben Uhr.'],
  }),
  G('gr-cum-l3-um-neun-abendessen', T.dailyRoutine, 'free-text', 'medium', 'production', ['daily-routine.aksam.abendessen', 'time.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat dokuzda akşam yemeği yiyorum.',
    answer: 'Ich esse um neun Uhr Abendessen.', acceptedAnswers: ['Ich esse um neun Uhr Abendessen'],
    validation: DE_PROD, pronounce: ['Ich esse um neun Uhr Abendessen.'],
  }),
  G('gr-cum-l3-jeden-morgen-sport', T.dailyRoutine, 'free-text', 'easy', 'production', ['daily-routine.gunluk.kahve-spor', 'sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah spor yapıyorum.',
    answer: 'Ich mache jeden Morgen Sport.', acceptedAnswers: ['Ich mache jeden Morgen Sport'],
    validation: DE_PROD, pronounce: ['Ich mache jeden Morgen Sport.'],
  }),
  G('gr-cum-l3-wo-spielt-bruder', T.questions, 'free-text', 'medium', 'production', ['questions.sorular.evet-hayir-yapi'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erkek kardeşin nerede oynuyor?',
    answer: 'Wo spielt dein Bruder?', acceptedAnswers: ['Wo spielt dein Bruder'],
    validation: DE_PROD, pronounce: ['Wo spielt dein Bruder?'],
  }),
  G('gr-cum-l3-zu-hause-arbeite', T.places, 'free-text', 'medium', 'production', ['places.zu-hause'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bugün evde çalışıyorum.',
    answer: 'Ich arbeite heute zu Hause.', acceptedAnswers: ['Ich arbeite heute zu Hause', 'Heute arbeite ich zu Hause.'],
    validation: DE_PROD, pronounce: ['Ich arbeite heute zu Hause.'],
  }),
  G('gr-cum-l3-nach-hause-komme', T.places, 'free-text', 'medium', 'production', ['places.nach-hause'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam eve geliyorum.',
    answer: 'Am Abend komme ich nach Hause.', acceptedAnswers: ['Am Abend komme ich nach Hause', 'Ich komme am Abend nach Hause.'],
    validation: DE_PROD, pronounce: ['Am Abend komme ich nach Hause.'],
  }),
  G('gr-cum-l3-mit-freunden-wb', T.places, 'word-bank-translation', 'hard', 'production', ['places.mit-meinen-freunden'], {
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
  G('gr-cum-l3-oft-pizza-ord', T.shopping, 'ordering', 'medium', 'production', ['shopping.siklik.cumlede', 'shopping.siklik.oft'], {
    instruction: 'Kelimeleri doğru sıraya diz — Sık sık pizza yiyorum.',
    answer: 'Ich esse oft Pizza.',
    explanation: 'Sıklık kelimesi fiilden hemen sonra gelir.',
    pronounce: ['Ich esse oft Pizza.'],
  }),
  G('gr-cum-l3-nie-fernsehen', T.shopping, 'free-text', 'medium', 'production', ['shopping.siklik.nie'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Asla televizyon izlemem.',
    answer: 'Ich sehe nie fern.', acceptedAnswers: ['Ich sehe nie fern'],
    validation: DE_PROD, pronounce: ['Ich sehe nie fern.'],
  }),

  /* ================= L4: ayrılabilen fiil (12) ================= */
  G('gr-cum-l4-stehe-sieben-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufstehen', 'time.um.ornek'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah saat yedide kalkıyorum.',
    answer: 'Ich stehe jeden Morgen um sieben Uhr auf.', acceptedAnswers: ['Ich stehe jeden Morgen um sieben Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich stehe jeden Morgen um sieben Uhr auf.'],
  }),
  G('gr-cum-l4-wache-sechs-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufwachen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat altıda uyanıyorum.',
    answer: 'Ich wache um sechs Uhr auf.', acceptedAnswers: ['Ich wache um sechs Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich wache um sechs Uhr auf.'],
  }),
  G('gr-cum-l4-ziehe-an', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.anziehen-chunk'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sabah giyiniyorum.',
    answer: 'Ich ziehe mich am Morgen an.', acceptedAnswers: ['Ich ziehe mich am Morgen an', 'Am Morgen ziehe ich mich an.'],
    validation: DE_PROD, pronounce: ['Ich ziehe mich am Morgen an.'],
  }),
  G('gr-cum-l4-kaufe-ein-sb', T.separableVerbs, 'sentence-builder', 'medium', 'production', ['separable-verbs.verb.einkaufen-cumle'], {
    instruction: 'Cümleyi kur:', prompt: 'Bugün alışveriş yapıyoruz.',
    answer: 'Wir kaufen heute ein.',
    pronounce: ['Wir kaufen heute ein.'],
  }),
  G('gr-cum-l4-raeume-zimmer-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufraeumen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Odamı topluyorum.',
    answer: 'Ich räume mein Zimmer auf.', acceptedAnswers: ['Ich räume mein Zimmer auf'],
    validation: DE_PROD, pronounce: ['Ich räume mein Zimmer auf.'],
  }),
  G('gr-cum-l4-rufe-abend-an', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.anrufen-cumle'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Akşam seni arıyorum.',
    answer: 'Ich rufe dich am Abend an.', acceptedAnswers: ['Ich rufe dich am Abend an'],
    validation: DE_PROD, pronounce: ['Ich rufe dich am Abend an.'],
  }),
  G('gr-cum-l4-bereite-fruehstueck-vor', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.vorbereiten'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltıyı hazırlıyorum.',
    answer: 'Ich bereite das Frühstück vor.', acceptedAnswers: ['Ich bereite das Frühstück vor'],
    validation: DE_PROD, pronounce: ['Ich bereite das Frühstück vor.'],
  }),
  G('gr-cum-l4-lade-dich-ein', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.einladen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Seni davet ediyorum.',
    answer: 'Ich lade dich ein.', acceptedAnswers: ['Ich lade dich ein'],
    validation: DE_PROD, pronounce: ['Ich lade dich ein.'],
  }),
  G('gr-cum-l4-bringe-buch-mit', T.separableVerbs, 'free-text', 'hard', 'production', ['separable-verbs.verb.mitbringen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir kitap getiriyorum (beraberimde).',
    answer: 'Ich bringe ein Buch mit.', acceptedAnswers: ['Ich bringe ein Buch mit'],
    validation: DE_PROD, pronounce: ['Ich bringe ein Buch mit.'],
  }),
  G('gr-cum-l4-hoere-auf', T.separableVerbs, 'free-text', 'medium', 'production', ['separable-verbs.verb.aufhoeren'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat onda bırakıyorum.',
    answer: 'Ich höre um zehn Uhr auf.', acceptedAnswers: ['Ich höre um zehn Uhr auf'],
    validation: DE_PROD, pronounce: ['Ich höre um zehn Uhr auf.'],
  }),
  G('gr-cum-l4-error-aufstehe', T.separableVerbs, 'error-correction', 'medium', 'correction', ['separable-verbs.ayrilabilen.kural'], {
    instruction: 'Önek hatasını düzelt:', prompt: 'Ich aufstehe um 8 Uhr.',
    answer: 'Ich stehe um 8 Uhr auf.',
    explanation: 'Önek sona gider: `Ich stehe ... auf`.',
  }),
  G('gr-cum-l4-um-sieben-stehe-ord', T.time, 'ordering', 'medium', 'production', ['separable-verbs.trennbar.saat-basta'], {
    instruction: 'Kelimeleri doğru sıraya diz — Saat yedide kalkıyorum (saat başta).',
    answer: 'Um sieben Uhr stehe ich auf.',
    pronounce: ['Um sieben Uhr stehe ich auf.'],
  }),

  /* ================= L5: soru + olumsuzluk (10) ================= */
  G('gr-cum-l5-was-isst-gern', T.food, 'free-text', 'medium', 'production', ['food.essen.frage'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ne yemeyi seversin?',
    answer: 'Was isst du gern?', acceptedAnswers: ['Was isst du gern'],
    validation: DE_PROD, pronounce: ['Was isst du gern?'],
  }),
  G('gr-cum-l5-gehst-schule', T.questions, 'free-text', 'medium', 'production', ['questions.sorular.evet-hayir-yapi'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün okula gidiyor musun?',
    answer: 'Gehst du jeden Tag zur Schule?', acceptedAnswers: ['Gehst du jeden Tag zur Schule'],
    validation: DE_PROD, pronounce: ['Gehst du jeden Tag zur Schule?'],
  }),
  G('gr-cum-l5-ja-nein-voll', T.questions, 'free-text', 'medium', 'production', ['questions.sorular.ja-nein-cevap'], {
    instruction: 'Tam cümleyle cevapla: `Trinkst du gern Milch?` → Evet, ...',
    prompt: 'Trinkst du gern Milch? → Ja, ...',
    answer: 'Ja, ich trinke gern Milch.', acceptedAnswers: ['Ja, ich trinke gern Milch'],
    validation: DE_PROD, pronounce: ['Ja, ich trinke gern Milch.'],
  }),
  G('gr-cum-l5-nein-orangensaft', T.questions, 'free-text', 'medium', 'production', ['questions.sorular.ja-nein-cevap', 'articles.olumsuzluk.nicht'], {
    instruction: 'Tam cümleyle cevapla: `Trinkst du Orangensaft?` → Hayır, ...',
    prompt: 'Trinkst du Orangensaft? → Nein, ...',
    answer: 'Nein, ich trinke nicht Orangensaft.', acceptedAnswers: ['Nein, ich trinke nicht Orangensaft', 'Nein, ich trinke keinen Orangensaft.'],
    validation: DE_PROD, hint: 'İçecek isimleri artikellidir; `nicht` ile olumsuzlanır.',
  }),
  G('gr-cum-l5-nicht-heute', T.articles, 'free-text', 'medium', 'production', ['articles.olumsuzluk.nicht'], {
    instruction: 'Olumsuza çevir:', prompt: 'Ich gehe heute zur Arbeit. → ______',
    answer: 'Ich gehe heute nicht zur Arbeit.', acceptedAnswers: ['Ich gehe heute nicht zur Arbeit'],
    validation: DE_PROD, pronounce: ['Ich gehe heute nicht zur Arbeit.'],
  }),
  G('gr-cum-l5-kein-auto', T.articles, 'free-text', 'medium', 'production', ['articles.artikel.kein-keine'], {
    instruction: 'Olumsuza çevir:', prompt: 'Ich habe ein Auto. → ______',
    answer: 'Ich habe kein Auto.', acceptedAnswers: ['Ich habe kein Auto'],
    validation: DE_PROD, pronounce: ['Ich habe kein Auto.'],
  }),
  G('gr-cum-l5-keine-katze', T.articles, 'free-text', 'medium', 'production', ['articles.artikel.kein-keine'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kedim yok.',
    answer: 'Ich habe keine Katze.', acceptedAnswers: ['Ich habe keine Katze'],
    validation: DE_PROD, pronounce: ['Ich habe keine Katze.'],
  }),
  G('gr-cum-l5-trinkt-nicht-gern', T.food, 'free-text', 'medium', 'production', ['food.essen.nicht-gern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Babam kahve içmeyi sevmez.',
    answer: 'Mein Vater trinkt nicht gern Kaffee.', acceptedAnswers: ['Mein Vater trinkt nicht gern Kaffee'],
    validation: DE_PROD, pronounce: ['Mein Vater trinkt nicht gern Kaffee.'],
  }),
  G('gr-cum-l5-error-nicht-stelle', T.articles, 'error-correction', 'medium', 'correction', ['articles.olumsuzluk.nicht'], {
    instruction: 'Olumsuzluk hatasını düzelt:', prompt: 'Ich nicht gehe zur Schule.',
    answer: 'Ich gehe nicht zur Schule.',
    explanation: '`nicht` fiilden sonra gelir: `Ich gehe nicht ...`.',
  }),
  G('gr-cum-l5-was-kostet-brot', T.food, 'free-text', 'medium', 'production', ['shopping.fiyat.was-kostet'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Ekmek kaç para? (Bu ne kadar?)',
    answer: 'Was kostet das Brot?', acceptedAnswers: ['Was kostet das Brot', 'Wie viel kostet das Brot?'],
    validation: DE_PROD, pronounce: ['Was kostet das Brot?'],
  }),

  /* ================= L6: bağlı cümleler (6) ================= */
  G('gr-cum-l6-dann-schule', T.sentenceBuilding, 'free-text', 'hard', 'production', ['sentence-building.dann.dann'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Sonra okula gidiyorum.',
    answer: 'Dann gehe ich zur Schule.', acceptedAnswers: ['Dann gehe ich zur Schule'],
    validation: DE_PROD, pronounce: ['Dann gehe ich zur Schule.'],
  }),
  G('gr-cum-l6-danach-haus', T.sentenceBuilding, 'free-text', 'hard', 'production', ['sentence-building.dann.danach', 'sentence-building.dann.v2'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Daha sonra eve geliyorum.',
    answer: 'Danach komme ich nach Hause.', acceptedAnswers: ['Danach komme ich nach Hause'],
    validation: DE_PROD, explanation: '`Danach` başta → fiil ikinci sırada.',
    pronounce: ['Danach komme ich nach Hause.'],
  }),
  G('gr-cum-l6-und-aber', T.sentenceBuilding, 'free-text', 'hard', 'production', ['sentence-building.baglac.und', 'sentence-building.baglac.aber'], {
    instruction: 'Tek cümlede birleştir (`aber` ile):', prompt: 'Odam küçük. Odam aydınlık.',
    answer: 'Mein Zimmer ist klein, aber hell.', acceptedAnswers: ['Mein Zimmer ist klein, aber hell'],
    validation: DE_PROD, pronounce: ['Mein Zimmer ist klein, aber hell.'],
  }),
  G('gr-cum-l6-kueche-hell-wb', T.adjectives, 'word-bank-translation', 'medium', 'production', ['adjectives.tarif.hell', 'adjectives.tarif.sein-sifat'], {
    instruction: 'Kutucuklarla kur — Mutfak aydınlık ve büyük.',
    answer: 'Die Küche ist hell und groß.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Mutfak aydınlık ve büyük.', targetLanguage: 'de',
      tokens: tok('Die', 'Küche', 'ist', 'hell', 'und', 'groß.', 'dunkel', 'der'),
      acceptedSequences: [['Die', 'Küche', 'ist', 'hell', 'und', 'groß.']],
    },
    pronounce: ['Die Küche ist hell und groß.'],
  }),
  G('gr-cum-l6-schrank-grau-er', T.pronouns, 'free-text', 'hard', 'production', ['pronouns.zamir.cumlede', 'pronouns.zamir.der-er'], {
    instruction: 'İki cümleyle anlat (zamir kullan):', prompt: 'Dolap büyük. O (dolap) gri.',
    answer: 'Der Schrank ist groß. Er ist grau.', acceptedAnswers: ['Der Schrank ist groß. Er ist grau'],
    validation: DE_PROD, explanation: '`der Schrank` → `er`.',
    pronounce: ['Der Schrank ist groß. Er ist grau.'],
  }),
  G('gr-cum-l6-fruehstueck-dann', T.sentenceBuilding, 'free-text', 'hard', 'production', ['daily-routine.tam.model', 'sentence-building.dann.dann'], {
    instruction: 'İki cümleyle anlat:', prompt: 'Saat yedide kahvaltı ediyorum. Sonra okula gidiyorum.',
    answer: 'Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule.', acceptedAnswers: ['Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um sieben Uhr. Dann gehe ich zur Schule.'],
  }),

  /* ================= L7: mini anlatım (2) ================= */
  G('gr-cum-l7-mini-tag', T.dailyRoutine, 'free-text', 'hard', 'production', ['daily-routine.tam.uretim'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Sabah rutinin: uyan, kalk, giyin.',
    answer: 'Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.',
    acceptedAnswers: ['Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.',
    pronounce: ['Ich wache um sieben Uhr auf. Ich stehe um sieben Uhr auf. Ich ziehe mich an.'],
  }),
  G('gr-cum-l7-mini-wohnzimmer', T.home, 'free-text', 'hard', 'production', ['home.evim.model'], {
    instruction: 'Üç cümleyle anlat:', prompt: 'Salonun: var, büyük, kanepe + televizyon.',
    answer: 'Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher.',
    acceptedAnswers: ['Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher'],
    validation: DE_PROD, openEnded: true,
    sampleAnswer: 'Wir haben ein Wohnzimmer. Das Wohnzimmer ist groß. Es gibt ein Sofa und einen Fernseher.',
    pronounce: ['Wir haben ein Wohnzimmer.'],
  }),
];
