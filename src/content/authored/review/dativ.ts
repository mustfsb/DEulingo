/**
 * Genel Tekrar — Dativ ile kümülatif tekrar.
 *
 * Ders bankasındaki cümlelerin kopyası değildir (yeni birleşimler):
 * Dativ + saat, Dativ + Modalverb, Dativ + Perfekt, Dativ + Akkusativ,
 * Dativ + ayrılabilen fiil, Dativ + Mein Tag. Hepsi `reviewOnly`: konu ders
 * havuzlarına girmez. Cümle Kurma havuzunda Dativ azınlıkta kalır (~%5);
 * her oturum bir Dativ sorusuna dönüşmez.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { finalizeDativ } from '../topics/dativ.ts';
import { DE_PROD, G, tok } from './base.ts';

const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });
const EXACT = { noTypoTolerance: true } as const;
const TR = 'Türkçeden Almancaya çevir:';

const BANK: AuthoredExercise[] = [
  /* ================= CÜMLE KURMA (12) ================= */
  G('gr-dat-card-freund', T.dativ, 'free-text', 'medium', 'production', ['dativ.mit.kural', 'dativ.iyelik.meinem', 'dativ.cumle.merdiven'], {
    instruction: 'Kartlarla tam cümle kur (ich):',
    prompt: 'mit + Freund + gehen → ______',
    answer: 'Ich gehe mit meinem Freund.',
    hint: '`mein Freund` → `mit meinem Freund`.',
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  G('gr-dat-card-arzt', T.dativ, 'free-text', 'medium', 'production', ['dativ.zu.zum', 'dativ.cumle.merdiven'], {
    instruction: 'Kartlarla tam cümle kur (ich):',
    prompt: 'Arzt + gehen → ______',
    answer: 'Ich gehe zum Arzt.',
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  G('gr-dat-card-tuerkei', T.dativ, 'free-text', 'medium', 'production', ['dativ.aus.tuerkei', 'dativ.cumle.merdiven'], {
    instruction: 'Kartlarla tam cümle kur (ich):',
    prompt: 'Türkei + kommen → ______',
    answer: 'Ich komme aus der Türkei.',
    validation: DE_PROD,
    pronounce: ['Ich komme aus der Türkei.'],
  }),
  G('gr-dat-um-acht-bus', T.dativ, 'free-text', 'hard', 'production', ['dativ.mit.arac', 'dativ.zu.zur', 'time.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir (saat + Dativ):',
    prompt: 'Saat sekizde otobüsle okula gidiyorum.',
    answer: 'Ich fahre um acht Uhr mit dem Bus zur Schule.',
    acceptedAnswers: ['Um acht Uhr fahre ich mit dem Bus zur Schule.'],
    pronounce: ['Ich fahre um acht Uhr mit dem Bus zur Schule.'],
  }),
  G('gr-dat-modal-arzt', T.dativ, 'free-text', 'medium', 'production', ['dativ.zu.zum', 'modal-verbs.moechten-infinitiv'], {
    instruction: 'Türkçeden Almancaya çevir (Modalverb + Dativ):',
    prompt: 'Doktora gitmek istiyorum.',
    answer: 'Ich möchte zum Arzt gehen.',
    acceptedAnswers: ['Ich will zum Arzt gehen.'],
    validation: DE_PROD,
    pronounce: ['Ich möchte zum Arzt gehen.'],
  }),
  G('gr-dat-perfekt-fussball', T.dativ, 'free-text', 'hard', 'production', ['dativ.iyelik.meinen', 'perfekt.duzenli.ornekler'], {
    instruction: 'Türkçeden Almancaya çevir (Perfekt + Dativ):',
    prompt: 'Dün arkadaşlarımla futbol oynadım.',
    answer: 'Ich habe gestern mit meinen Freunden Fußball gespielt.',
    acceptedAnswers: ['Gestern habe ich mit meinen Freunden Fußball gespielt.'],
    validation: DE_PROD,
    pronounce: ['Ich habe gestern mit meinen Freunden Fußball gespielt.'],
  }),
  G('gr-dat-akk-kuchen', T.dativ, 'free-text', 'hard', 'production', ['dativ.akk-dat.kural', 'dativ.mit.kisi', 'akkusativ.ein-einen'], {
    instruction: 'Türkçeden Almancaya çevir (Akkusativ + Dativ aynı cümlede):',
    prompt: 'Annemle bir kek alıyorum.',
    answer: 'Ich kaufe mit meiner Mutter einen Kuchen.',
    acceptedAnswers: ['Ich kaufe einen Kuchen mit meiner Mutter.'],
    pronounce: ['Ich kaufe mit meiner Mutter einen Kuchen.'],
  }),
  G('gr-dat-einkaufen-schwester', T.dativ, 'free-text', 'hard', 'production', ['dativ.iyelik.meiner', 'separable-verbs.verb.einkaufen'], {
    instruction: 'Türkçeden Almancaya çevir (ayrılabilen fiil + Dativ):',
    prompt: 'Kız kardeşimle alışveriş yapıyorum.',
    answer: 'Ich kaufe mit meiner Schwester ein.',
    pronounce: ['Ich kaufe mit meiner Schwester ein.'],
  }),
  G('gr-dat-abend-nach-hause', T.dativ, 'free-text', 'medium', 'production', ['dativ.mit.arac', 'dativ.nach.hause', 'time.zaman.am'], {
    instruction: TR,
    prompt: 'Akşam otobüsle eve gidiyorum.',
    answer: 'Am Abend fahre ich mit dem Bus nach Hause.',
    acceptedAnswers: ['Ich fahre am Abend mit dem Bus nach Hause.'],
    pronounce: ['Am Abend fahre ich mit dem Bus nach Hause.'],
  }),
  G('gr-dat-wb-tante', T.dativ, 'word-bank-translation', 'medium', 'production', ['dativ.bei.kural', 'dativ.iyelik.meiner'], {
    instruction: 'Kutucuklarla kur — Hafta sonu teyzemin yanındayım.',
    answer: 'Am Wochenende bin ich bei meiner Tante.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Hafta sonu teyzemin yanındayım.', targetLanguage: 'de',
      tokens: tok('Am', 'Wochenende', 'bin', 'ich', 'bei', 'meiner', 'Tante.', 'meine', 'zu'),
      acceptedSequences: [['Am', 'Wochenende', 'bin', 'ich', 'bei', 'meiner', 'Tante.']],
    },
    pronounce: ['Am Wochenende bin ich bei meiner Tante.'],
  }),
  G('gr-dat-ord-seit', T.dativ, 'ordering', 'medium', 'production', ['dativ.seit.monaten', 'dativ.cumle.sira'], {
    instruction: 'Kelimeleri doğru sıraya diz — Bir yıldır Almanya’da oturuyorum.',
    answer: 'Ich wohne seit einem Jahr in Deutschland.',
    pronounce: ['Ich wohne seit einem Jahr in Deutschland.'],
  }),
  G('gr-dat-frage-mit-mir', T.dativ, 'free-text', 'medium', 'production', ['dativ.zamir.cekirdek', 'questions.sorular.evet-hayir-yapi'], {
    instruction: 'Türkçeden Almancaya soru kur:',
    prompt: 'Benimle sinemaya geliyor musun?',
    answer: 'Kommst du mit mir ins Kino?',
    pronounce: ['Kommst du mit mir ins Kino?'],
  }),

  /* ================= WRITING (4) ================= */
  G('gr-yaz-dat-kiminle', T.dativ, 'free-text', 'hard', 'production', ['dativ.cumle.baglam', 'dativ.iyelik.bes-kalip'], {
    instruction: 'Kimlerle vakit geçiriyorsun? 3 kısa cümle yaz (`mit` + Dativ).',
    prompt: '3 cümle: kiminle konuşuyorsun, oynuyorsun, bir yere gidiyorsun?',
    answer: 'Ich spreche oft mit meiner Mutter. Ich spiele mit meinen Freunden. Am Wochenende gehe ich mit meinem Bruder in den Park.',
    validation: DE_PROD, openEnded: true,
    hint: '`meinem` (eril), `meiner` (dişil), `meinen … -n` (çoğul).',
    sampleAnswer: 'Ich spreche oft mit meiner Mutter. Ich spiele mit meinen Freunden. Am Wochenende gehe ich mit meinem Bruder in den Park.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-dat-okul', T.dativ, 'free-text', 'hard', 'production', ['dativ.mit.arac', 'dativ.zu.zur'], {
    instruction: 'Okula nasıl gidiyorsun? 2–3 kısa cümle yaz.',
    prompt: 'Araç (`mit dem …`) + nereye (`zur Schule`) + kiminle?',
    answer: 'Ich fahre mit dem Bus zur Schule. Manchmal fahre ich mit dem Fahrrad. Ich fahre mit meinem Freund.',
    validation: DE_PROD, openEnded: true,
    hint: '`der Bus` / `das Fahrrad` → `mit dem …`; `die Schule` → `zur Schule`.',
    sampleAnswer: 'Ich fahre mit dem Bus zur Schule. Manchmal fahre ich mit dem Fahrrad. Ich fahre mit meinem Freund.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-dat-konusma', T.dativ, 'free-text', 'hard', 'production', ['dativ.mit.kisi', 'dativ.zamir.cekirdek'], {
    instruction: 'Kiminle konuşuyorsun? 2–3 kısa cümle yaz (kişi ve zamir).',
    prompt: 'Örn. annenle, öğretmeninle, bir arkadaşınla — bir cümlede zamir kullan (`mit ihm / mit ihr`).',
    answer: 'Ich spreche jeden Tag mit meiner Mutter. Ich spreche auch mit dem Lehrer. Mein Freund heißt Ali. Ich spreche oft mit ihm.',
    validation: DE_PROD, openEnded: true,
    hint: '`mit` + Dativ: `mit meiner Mutter`, `mit dem Lehrer`, `mit ihm`.',
    sampleAnswer: 'Ich spreche jeden Tag mit meiner Mutter. Ich spreche auch mit dem Lehrer. Mein Freund heißt Ali. Ich spreche oft mit ihm.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-dat-nereye', T.dativ, 'free-text', 'hard', 'production', ['dativ.zu.kural', 'dativ.nach.hause', 'dativ.bei.kural'], {
    instruction: 'Bugün nereye gidiyorsun? 3 kısa cümle yaz.',
    prompt: '`zum / zur` + bir `bei` + `nach Hause`',
    answer: 'Heute gehe ich zum Supermarkt. Dann bin ich bei meiner Tante. Am Abend gehe ich nach Hause.',
    validation: DE_PROD, openEnded: true,
    hint: 'Yön: `zum / zur / nach`. Konum: `bei`.',
    sampleAnswer: 'Heute gehe ich zum Supermarkt. Dann bin ich bei meiner Tante. Am Abend gehe ich nach Hause.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),

  /* ================= DİNLEME (3) ================= */
  G('gr-dat-listen-fahrrad', T.dativ, 'listen-choice', 'medium', 'recognition', ['dativ.mit.arac'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich fahre mit dem Fahrrad zur Schule.',
    audioText: 'Ich fahre mit dem Fahrrad zur Schule.',
    answer: 'Ich fahre mit dem Fahrrad zur Schule.',
    options: ['Ich fahre mit dem Fahrrad zur Schule.', 'Ich fahre mit dem Fahrrad zum Supermarkt.', 'Ich fahre mit den Fahrrad zur Schule.', 'Ich fahre mit dem Bus zur Schule.'],
    audio: listen('Ich fahre mit dem Fahrrad zur Schule.'),
  }),
  G('gr-dat-dictation-bei', T.dativ, 'dictation', 'hard', 'production', ['dativ.bei.kural', 'dativ.iyelik.meiner'], {
    instruction: 'Akşam cümlesini duydun — aynen yaz:',
    audioText: 'Am Abend bin ich bei meiner Mutter.',
    answer: 'Am Abend bin ich bei meiner Mutter.',
    audio: listen('Am Abend bin ich bei meiner Mutter.'),
  }),
  G('gr-dat-listen-helfen', T.dativ, 'listen-choice', 'medium', 'recognition', ['dativ.fiil.helfen'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich helfe meiner Mutter.',
    audioText: 'Ich helfe meiner Mutter.',
    answer: 'Ich helfe meiner Mutter.',
    options: ['Ich helfe meiner Mutter.', 'Ich helfe meine Mutter.', 'Ich helfe meinem Vater.', 'Ich spreche mit meiner Mutter.'],
    audio: listen('Ich helfe meiner Mutter.'),
  }),

  /* ================= KELİME / HIZLI (4) ================= */
  G('gr-dat-mc-bruder', T.dativ, 'multiple-choice', 'easy', 'recognition', ['dativ.iyelik.meinem'], {
    instruction: 'Doğru biçimi seç (mein Bruder):',
    prompt: 'Am Wochenende spiele ich mit ___ Bruder.',
    answer: 'meinem',
    options: ['meinem', 'meinen', 'mein', 'meiner'],
    pronounce: ['Am Wochenende spiele ich mit meinem Bruder.'],
  }),
  G('gr-dat-fill-zur-arbeit', T.dativ, 'fill-blank', 'easy', 'recall', ['dativ.zu.zur'], {
    instruction: 'Kısaltmayla yaz (die Arbeit):',
    prompt: 'Wir fahren am Morgen ___ Arbeit.',
    answer: 'zur',
    validation: EXACT,
    pronounce: ['Wir fahren am Morgen zur Arbeit.'],
  }),
  G('gr-dat-fill-den-kindern', T.dativ, 'fill-blank', 'medium', 'recall', ['dativ.cogul.kural'], {
    instruction: 'Dativ artikelini yaz (die Kinder):',
    prompt: 'Die Lehrerin spricht mit ___ Kindern.',
    answer: 'den',
    validation: EXACT,
    pronounce: ['Die Lehrerin spricht mit den Kindern.'],
  }),
  G('gr-dat-mc-anrufen', T.dativ, 'multiple-choice', 'medium', 'recognition', ['dativ.akk-dat.meinen-meinem', 'separable-verbs.fiil.anrufen-ayrilabilen'], {
    instruction: 'Akkusativ mı Dativ mi? Doğru biçimi seç (mein Bruder):',
    prompt: 'Ich rufe ___ Bruder an.',
    answer: 'meinen',
    options: ['meinen', 'meinem', 'mein'],
    pronounce: ['Ich rufe meinen Bruder an.'],
  }),
];

export const GENERAL_REVIEW_DATIV: AuthoredExercise[] = BANK.map(finalizeDativ);
