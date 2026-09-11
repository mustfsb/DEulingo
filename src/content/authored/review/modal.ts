/**
 * Genel Tekrar — Modalverben ile konular arası kümülatif tekrar.
 *
 * Her soru Modalverbi daha önce öğrenilmiş bir konuyla birleştirir:
 * saat + Modalverb + ayrılabilen fiil, yemek + Modalverb + Akkusativ,
 * dil + können, izin/yasak (dürfen). Konu ders bankasındaki cümlelerin
 * kopyası değildir (yeni birleşimler).
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G, tok } from './base.ts';

const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });

export const GENERAL_REVIEW_MODAL: AuthoredExercise[] = [
  /* ================= CÜMLE KURMA (12) ================= */
  G('gr-mv-um-sechs-aufstehen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.trennbar', 'time.um.kural', 'daily-routine.plans'], {
    instruction: 'Türkçeden Almancaya çevir (saat + Modalverb + ayrılabilen fiil):',
    prompt: 'Yarın saat altıda kalkmak istiyorum.',
    answer: 'Ich will morgen um sechs Uhr aufstehen.',
    acceptedAnswers: ['Morgen will ich um sechs Uhr aufstehen.'],
    pronounce: ['Ich will morgen um sechs Uhr aufstehen.'],
  }),
  G('gr-mv-wochenende-kuchen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.akkusativ', 'akkusativ.ein-einen', 'time.zaman.am'], {
    instruction: 'Türkçeden Almancaya çevir (zaman başta + Akkusativ):',
    prompt: 'Hafta sonu bir kek almak istiyorum. (Am Wochenende …)',
    answer: 'Am Wochenende möchte ich einen Kuchen kaufen.',
    acceptedAnswers: ['Am Wochenende will ich einen Kuchen kaufen.'],
    validation: DE_PROD,
    pronounce: ['Am Wochenende möchte ich einen Kuchen kaufen.'],
  }),
  G('gr-mv-bisschen-deutsch', T.modalVerbs, 'free-text', 'medium', 'production', ['modal-verbs.koennen.kullanim', 'greetings.sprachen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Türkçe ve biraz Almanca konuşabiliyorum.',
    answer: 'Ich kann Türkisch und ein bisschen Deutsch sprechen.',
    validation: DE_PROD,
    pronounce: ['Ich kann Türkisch und ein bisschen Deutsch sprechen.'],
  }),
  G('gr-mv-zimmer-rauchen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.duerfen.verbot', 'modal-verbs.man', 'home.evim.mein-zimmer'], {
    instruction: 'Türkçeden Almancaya çevir (izin / yasak):',
    prompt: 'Odamda sigara içmek yasak.',
    answer: 'In meinem Zimmer darf man nicht rauchen.',
    hint: '`In meinem Zimmer` başta → Modalverb ikinci sırada.',
    pronounce: ['In meinem Zimmer darf man nicht rauchen.'],
  }),
  G('gr-mv-heute-einkaufen', T.modalVerbs, 'free-text', 'medium', 'production', ['modal-verbs.sollen.kullanim', 'modal-verbs.trennbar', 'separable-verbs.verb.einkaufen'], {
    instruction: 'Türkçeden Almancaya çevir (sollen):',
    prompt: 'Bugün alışveriş yapmalıyım.',
    answer: 'Ich soll heute einkaufen.',
    acceptedAnswers: ['Heute soll ich einkaufen.'],
    pronounce: ['Ich soll heute einkaufen.'],
  }),
  G('gr-mv-abend-fernsehen-wb', T.modalVerbs, 'word-bank-translation', 'hard', 'production', ['modal-verbs.koennen.kullanim', 'modal-verbs.trennbar', 'separable-verbs.verb.fernsehen'], {
    instruction: 'Kutucuklarla kur — Akşam televizyon izleyebiliriz.',
    answer: 'Am Abend können wir fernsehen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Akşam televizyon izleyebiliriz.', targetLanguage: 'de',
      tokens: tok('Am', 'Abend', 'können', 'wir', 'fernsehen.', 'sehen', 'fern.', 'könnt'),
      acceptedSequences: [['Am', 'Abend', 'können', 'wir', 'fernsehen.']],
    },
    pronounce: ['Am Abend können wir fernsehen.'],
  }),
  G('gr-mv-zusammen-kaffee-wb', T.modalVerbs, 'word-bank-translation', 'medium', 'production', ['modal-verbs.frage', 'modal-verbs.moechten.kullanim', 'daily-routine.gunluk.kahve-spor'], {
    instruction: 'Kutucuklarla kur — Birlikte kahve içmek ister misin?',
    answer: 'Möchtest du zusammen Kaffee trinken?',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Birlikte kahve içmek ister misin?', targetLanguage: 'de',
      tokens: tok('Möchtest', 'du', 'zusammen', 'Kaffee', 'trinken?', 'trinkst', 'möchte'),
      acceptedSequences: [['Möchtest', 'du', 'zusammen', 'Kaffee', 'trinken?']],
    },
    pronounce: ['Möchtest du zusammen Kaffee trinken?'],
  }),
  G('gr-mv-heute-nicht-kochen', T.modalVerbs, 'free-text', 'medium', 'production', ['modal-verbs.nicht', 'modal-verbs.moechten.kullanim', 'verbs.verben.kochen'], {
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Bugün yemek pişirmek istemiyorum.',
    answer: 'Ich möchte heute nicht kochen.',
    acceptedAnswers: ['Heute möchte ich nicht kochen.', 'Ich will heute nicht kochen.'],
    validation: DE_PROD,
    pronounce: ['Ich möchte heute nicht kochen.'],
  }),
  G('gr-mv-schwester-aufraeumen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.sollen.kullanim', 'modal-verbs.trennbar', 'pronouns.iyelik.ihr'], {
    instruction: 'Türkçeden Almancaya çevir (sollen + iyelik):',
    prompt: 'Kız kardeşim odasını toplamalı.',
    answer: 'Meine Schwester soll ihr Zimmer aufräumen.',
    validation: DE_PROD,
    pronounce: ['Meine Schwester soll ihr Zimmer aufräumen.'],
  }),
  G('gr-mv-brot-flaschen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.moechten.kullanim', 'shopping.miktar.sise'], {
    instruction: 'Türkçeden Almancaya çevir (markette):',
    prompt: 'Bir ekmek ve iki şişe su almak istiyorum.',
    answer: 'Ich möchte ein Brot und zwei Flaschen Wasser kaufen.',
    validation: DE_PROD,
    pronounce: ['Ich möchte ein Brot und zwei Flaschen Wasser kaufen.'],
  }),
  G('gr-mv-apfel-essen', T.modalVerbs, 'free-text', 'medium', 'production', ['modal-verbs.akkusativ', 'akkusativ.ein-einen', 'verbs.verben.essen'], {
    instruction: 'Türkçeden Almancaya çevir (der Apfel):',
    prompt: 'Bir elma yemek istiyorum.',
    answer: 'Ich möchte einen Apfel essen.',
    acceptedAnswers: ['Ich will einen Apfel essen.'],
    validation: DE_PROD,
    pronounce: ['Ich möchte einen Apfel essen.'],
  }),
  G('gr-mv-freundin-anrufen-ord', T.modalVerbs, 'ordering', 'hard', 'production', ['modal-verbs.trennbar', 'separable-verbs.verb.anrufen', 'sentence-building.dann.danach'], {
    instruction: 'Kelimeleri doğru sıraya diz — Sonra arkadaşımı (kız) aramak istiyorum.',
    prompt: 'Sonra arkadaşımı aramak istiyorum. (Danach …)',
    answer: 'Danach will ich meine Freundin anrufen.',
    pronounce: ['Danach will ich meine Freundin anrufen.'],
  }),

  /* ================= WRITING (4) ================= */
  G('gr-yaz-mv-koennen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.koennen.kullanim', 'modal-verbs.nicht'], {
    instruction: 'Neler yapabildiğini 4 cümleyle anlat.',
    prompt: '4 cümle yaz: `Ich kann …` (en az biri `nicht` ile).',
    answer: 'Ich kann Deutsch sprechen. Ich kann gut Fußball spielen. Ich kann kochen. Ich kann nicht tanzen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Modalverb ikinci sırada, mastar en sonda: `Ich kann … spielen.`',
    sampleAnswer: 'Ich kann Deutsch sprechen. Ich kann gut Fußball spielen. Ich kann kochen. Ich kann nicht tanzen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-mv-wuensche', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.moechten.kullanim', 'modal-verbs.wollen.kullanim'], {
    instruction: 'Neler yapmak istediğini yaz (3 cümle, `möchten` / `wollen`).',
    prompt: '3 cümle: istediğin ya da planladığın şeyler.',
    answer: 'Ich möchte eine Pizza essen. Ich will ein Fahrrad kaufen. Ich möchte ein Buch lesen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Kibar istek `möchte`, kararlı plan `will`.',
    sampleAnswer: 'Ich möchte eine Pizza essen. Ich will ein Fahrrad kaufen. Ich möchte ein Buch lesen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-mv-morgen', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.wollen.kullanim', 'modal-verbs.trennbar', 'daily-routine.plans'], {
    instruction: 'Yarın yapmak istediğin üç şeyi yaz.',
    prompt: '3 cümle: yarın ne yapmak istiyorsun? (en az bir ayrılabilen fiil)',
    answer: 'Ich will morgen früh aufstehen. Ich möchte Lebensmittel einkaufen. Ich will meine Schwester anrufen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Ayrılabilen fiil Modalverb ile bölünmez: `Ich will … einkaufen.`',
    sampleAnswer: 'Ich will morgen früh aufstehen. Ich möchte Lebensmittel einkaufen. Ich will meine Schwester anrufen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-mv-regeln', T.modalVerbs, 'free-text', 'hard', 'production', ['modal-verbs.duerfen.verbot', 'modal-verbs.sollen.kullanim'], {
    instruction: 'Evinin iki kuralını yaz: ne yasak, ne yapmalısın? (`dürfen` / `sollen`)',
    prompt: '2–3 cümle: `Hier darf man nicht …` / `Ich soll …`',
    answer: 'Hier darf man nicht rauchen. Ich soll mein Zimmer aufräumen. Ich soll das Geschirr spülen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Yasak için `man` gerekir: `Hier darf man nicht …`',
    sampleAnswer: 'Hier darf man nicht rauchen. Ich soll mein Zimmer aufräumen. Ich soll das Geschirr spülen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),

  /* ================= DİNLEME (3) ================= */
  G('gr-mv-listen-darf-rauchen', T.modalVerbs, 'listen-choice', 'medium', 'recognition', ['modal-verbs.duerfen.frage'], {
    instruction: 'Duyduğun izin sorusunu seç:',
    prompt: 'Darf ich hier rauchen?',
    audioText: 'Darf ich hier rauchen?',
    answer: 'Darf ich hier rauchen?',
    options: ['Darf ich hier rauchen?', 'Kann ich hier rauchen?', 'Darf ich hier parken?', 'Soll ich hier rauchen?'],
    audio: listen('Darf ich hier rauchen?'),
  }),
  G('gr-mv-dictation-kuchen', T.modalVerbs, 'dictation', 'hard', 'production', ['modal-verbs.akkusativ', 'akkusativ.ein-einen'], {
    instruction: 'Duyduğun cümleyi aynen yaz (Akkusativ\'e dikkat):',
    audioText: 'Mein Bruder möchte einen Kuchen kaufen.',
    answer: 'Mein Bruder möchte einen Kuchen kaufen.',
    validation: DE_PROD,
    audio: listen('Mein Bruder möchte einen Kuchen kaufen.'),
  }),
  G('gr-mv-dictation-anrufen', T.modalVerbs, 'dictation', 'hard', 'production', ['modal-verbs.trennbar', 'separable-verbs.verb.anrufen'], {
    instruction: 'Duyduğun cümleyi aynen yaz (ayrılabilen fiil + Modalverb):',
    audioText: 'Ich will dich morgen anrufen.',
    answer: 'Ich will dich morgen anrufen.',
    audio: listen('Ich will dich morgen anrufen.'),
  }),

  /* ================= KELİME / TANIMA (2) ================= */
  G('gr-mv-anlam-match', T.modalVerbs, 'matching', 'easy', 'recognition', ['modal-verbs.anlamlar'], {
    instruction: 'Modalverb biçimini anlamıyla eşleştir.',
    pairs: [
      { left: 'ich kann', right: 'yapabilirim' },
      { left: 'ich möchte', right: 'isterim (kibar)' },
      { left: 'ich will', right: 'istiyorum (plan)' },
      { left: 'ich soll', right: 'yapmalıyım' },
      { left: 'ich darf', right: 'iznim var' },
    ],
  }),
  G('gr-mv-duerfen-fernsehen-fill', T.modalVerbs, 'fill-blank', 'medium', 'recall', ['modal-verbs.duerfen.cekim', 'modal-verbs.trennbar'], {
    instruction: 'Boşluğu doldur (dürfen) — Bugün televizyon izleyemeyiz (iznimiz yok).',
    prompt: 'Wir ___ heute nicht fernsehen.',
    answer: 'dürfen',
    validation: { noTypoTolerance: true, keyboardTolerance: true },
    pronounce: ['Wir dürfen heute nicht fernsehen.'],
  }),

  /* ================= ZOR / HATA (2) ================= */
  G('gr-mv-error-einkaufen', T.modalVerbs, 'error-correction', 'hard', 'correction', ['modal-verbs.trennbar', 'separable-verbs.verb.einkaufen'], {
    instruction: 'Hatayı düzelt:',
    prompt: 'Ich möchte heute kaufe ein.',
    answer: 'Ich möchte heute einkaufen.',
    validation: DE_PROD,
    explanation: 'Modalverb varsa asıl fiil mastar ve bölünmez: `einkaufen`.',
    pronounce: ['Ich möchte heute einkaufen.'],
  }),
  G('gr-mv-error-apfel', T.modalVerbs, 'error-correction', 'medium', 'correction', ['modal-verbs.akkusativ', 'akkusativ.ein-einen'], {
    instruction: 'Hatayı düzelt:',
    prompt: 'Ich will ein Apfel essen.',
    answer: 'Ich will einen Apfel essen.',
    explanation: '`der Apfel` eril: nesne olunca `einen Apfel`.',
    pronounce: ['Ich will einen Apfel essen.'],
  }),
];
