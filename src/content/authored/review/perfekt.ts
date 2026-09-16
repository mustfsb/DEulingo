/**
 * Genel Tekrar — Perfekt ile kümülatif tekrar.
 *
 * Ders bankasındaki cümlelerin kopyası değildir (yeni birleşimler):
 * Perfekt + saat, Perfekt + Mein Tag, Perfekt + ayrılabilen fiil.
 * Hepsi `reviewOnly`: konu ders havuzlarına girmez.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G, tok } from './base.ts';

const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });

export const GENERAL_REVIEW_PERFEKT: AuthoredExercise[] = [
  /* ================= CÜMLE KURMA (10) ================= */
  G('gr-pf-gestern-sport', T.perfekt, 'free-text', 'medium', 'production', ['perfekt.haben.cumle', 'perfekt.zaman.gestern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün spor yaptık.',
    answer: 'Wir haben gestern Sport gemacht.', acceptedAnswers: ['Wir haben gestern Sport gemacht'],
    validation: DE_PROD, pronounce: ['Wir haben gestern Sport gemacht.'],
  }),
  G('gr-pf-morgen-schule', T.perfekt, 'free-text', 'medium', 'production', ['perfekt.sein.cumle', 'perfekt.zaman.gestern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün sabah okula gittik.',
    answer: 'Wir sind gestern Morgen zur Schule gegangen.', acceptedAnswers: ['Wir sind gestern Morgen zur Schule gegangen'],
    validation: DE_PROD, pronounce: ['Wir sind gestern Morgen zur Schule gegangen.'],
  }),
  G('pf-gr-abend-buch', T.perfekt, 'free-text', 'medium', 'production', ['perfekt.duzensiz.essen-sprechen', 'perfekt.zaman.gestern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün akşam bir film izlemedim, kitap okudum.',
    answer: 'Ich habe gestern Abend ein Buch gelesen.', acceptedAnswers: ['Ich habe gestern Abend ein Buch gelesen'],
    validation: DE_PROD, pronounce: ['Ich habe gestern Abend ein Buch gelesen.'],
  }),
  G('gr-pf-oma-einkaufen', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.ayrilabilen.einkaufen', 'perfekt.zaman.gestern'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün akşam annemle alışveriş yaptım.',
    answer: 'Ich habe gestern Abend mit meiner Mutter eingekauft.', acceptedAnswers: ['Ich habe gestern Abend mit meiner Mutter eingekauft'],
    validation: DE_PROD, pronounce: ['Ich habe gestern Abend mit meiner Mutter eingekauft.'],
  }),
  G('gr-pf-um-acht-gefruehstueckt', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.zaman.um', 'perfekt.gestern.sabah'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün saat sekizde kahvaltı ettik.',
    answer: 'Wir haben gestern um acht Uhr gefrühstückt.', acceptedAnswers: ['Wir haben gestern um acht Uhr gefrühstückt'],
    validation: DE_PROD, pronounce: ['Wir haben gestern um acht Uhr gefrühstückt.'],
  }),
  G('gr-pf-letzte-woche-film', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.zaman.gestern', 'perfekt.duzensiz.essen-sprechen'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Geçen hafta arkadaşlarımla buluştum.',
    answer: 'Letzte Woche habe ich meine Freunde getroffen.', acceptedAnswers: ['Letzte Woche habe ich meine Freunde getroffen'],
    validation: DE_PROD, pronounce: ['Letzte Woche habe ich meine Freunde getroffen.'],
  }),
  G('gr-pf-zuhause-nicht-schule-wb', T.perfekt, 'word-bank-translation', 'medium', 'production', ['perfekt.olumsuz.nicht', 'perfekt.zaman.gestern'], {
    instruction: 'Kutucuklarla kur — Dün evde kaldım, okula gitmedim.',
    answer: 'Ich bin gestern nicht zur Schule gegangen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Dün okula gitmedim.', targetLanguage: 'de',
      tokens: tok('Ich', 'bin', 'gestern', 'nicht', 'zur', 'Schule', 'gegangen.', 'habe'),
      acceptedSequences: [['Ich', 'bin', 'gestern', 'nicht', 'zur', 'Schule', 'gegangen.']],
    },
    pronounce: ['Ich bin gestern nicht zur Schule gegangen.'],
  }),
  G('gr-pf-ord-gestern-hausaufgaben', T.perfekt, 'ordering', 'medium', 'production', ['perfekt.haben.cumle', 'perfekt.zaman.gestern'], {
    instruction: 'Kelimeleri doğru sıraya diz — Dün akşam ödevimi bitirdim.',
    answer: 'Ich habe gestern Abend meine Hausaufgaben gemacht.',
    pronounce: ['Ich habe gestern Abend meine Hausaufgaben gemacht.'],
  }),
  G('gr-pf-frage-wo-gegessen', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.soru.was', 'perfekt.duzensiz.essen-sprechen'], {
    instruction: 'Soruyu cevapla: `Wo hast du gestern gegessen?` → Evde.',
    prompt: 'Wo hast du gestern gegessen? → ______',
    answer: 'Ich habe gestern zu Hause gegessen.', acceptedAnswers: ['Ich habe gestern zu Hause gegessen'],
    validation: DE_PROD, pronounce: ['Ich habe gestern zu Hause gegessen.'],
  }),
  G('gr-pf-deutsch-gelernt-wb', T.perfekt, 'word-bank-translation', 'medium', 'production', ['perfekt.duzenli.ornekler', 'perfekt.zaman.gestern'], {
    instruction: 'Kutucuklarla kur — Dün okulda çok Almanca öğrendik.',
    answer: 'Wir haben gestern in der Schule viel Deutsch gelernt.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Dün okulda çok Almanca öğrendik.', targetLanguage: 'de',
      tokens: tok('Wir', 'haben', 'gestern', 'in', 'der', 'Schule', 'viel', 'Deutsch', 'gelernt.', 'lernen.'),
      acceptedSequences: [['Wir', 'haben', 'gestern', 'in', 'der', 'Schule', 'viel', 'Deutsch', 'gelernt.']],
    },
    pronounce: ['Wir haben gestern in der Schule viel Deutsch gelernt.'],
  }),

  /* ================= WRITING (4) ================= */
  G('gr-yaz-pf-gestern', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.gestern.uretim', 'perfekt.soru.was'], {
    instruction: 'Dününü 4 cümleyle anlat (Was hast du gestern gemacht?).',
    prompt: '4 cümle yaz: sabah, okul, akşam, gece (`gestern` kullan).',
    answer: 'Gestern bin ich um sieben Uhr aufgestanden. Ich habe gefrühstückt. Ich habe meine Hausaufgaben gemacht. Dann bin ich ins Bett gegangen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Yardımcı fiil ikinci sırada, Partizip II en sonda.',
    sampleAnswer: 'Gestern bin ich um sieben Uhr aufgestanden. Ich habe gefrühstückt. Ich habe meine Hausaufgaben gemacht. Dann bin ich ins Bett gegangen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-pf-wochenende', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.gestern.uretim', 'perfekt.zaman.gestern'], {
    instruction: 'Geçen haftanı 3 cümleyle anlat (`letzte Woche`).',
    prompt: '3 cümle: geçen hafta ne yaptın?',
    answer: 'Letzte Woche habe ich viel Deutsch gelernt. Ich habe meine Freunde getroffen. Wir haben zusammen Fußball gespielt.',
    validation: DE_PROD, openEnded: true,
    hint: 'En az bir `haben`, bir `sein` cümlesi kur.',
    sampleAnswer: 'Letzte Woche habe ich viel Deutsch gelernt. Ich habe meine Freunde getroffen. Wir haben zusammen Fußball gespielt.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-pf-morgen', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.gestern.sabah', 'perfekt.zaman.um'], {
    instruction: 'Dünkü sabahını 3 cümleyle anlat (saat + Perfekt).',
    prompt: '3 cümle: kalkış saati, kahvaltı, evden çıkış.',
    answer: 'Ich bin gestern um sieben Uhr aufgestanden. Ich habe um acht Uhr gefrühstückt. Dann bin ich zur Schule gegangen.',
    validation: DE_PROD, openEnded: true,
    hint: 'Saatleri `um` ile söyle.',
    sampleAnswer: 'Ich bin gestern um sieben Uhr aufgestanden. Ich habe um acht Uhr gefrühstückt. Dann bin ich zur Schule gegangen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  G('gr-yaz-pf-fehlerfrei', T.perfekt, 'free-text', 'hard', 'production', ['perfekt.ayrilabilen.hata', 'perfekt.olumsuz.nicht'], {
    instruction: 'Dün yapMADIĞın iki şeyi yaz (olumsuz Perfekt).',
    prompt: '2 cümle: `Ich habe gestern nicht …` / `Ich bin gestern nicht …`',
    answer: 'Ich habe gestern nicht gearbeitet. Ich bin gestern nicht ins Kino gegangen.',
    validation: DE_PROD, openEnded: true,
    hint: '`nicht` Partizip II’den önce gelir.',
    sampleAnswer: 'Ich habe gestern nicht gearbeitet. Ich bin gestern nicht ins Kino gegangen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),

  /* ================= DİNLEME (4) ================= */
  G('gr-pf-listen-gestern', T.perfekt, 'listen-choice', 'medium', 'recognition', ['perfekt.haben.cumle'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich habe gestern meine Hausaufgaben gemacht.',
    audioText: 'Ich habe gestern meine Hausaufgaben gemacht.',
    answer: 'Ich habe gestern meine Hausaufgaben gemacht.',
    options: ['Ich habe gestern meine Hausaufgaben gemacht.', 'Ich mache gestern meine Hausaufgaben.', 'Ich habe gestern meine Hausaufgaben machen.', 'Ich bin gestern meine Hausaufgaben gemacht.'],
    audio: listen('Ich habe gestern meine Hausaufgaben gemacht.'),
  }),
  G('gr-pf-listen-aufgestanden', T.perfekt, 'listen-choice', 'medium', 'recognition', ['perfekt.ayrilabilen.aufstehen'], {
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich bin um sieben Uhr aufgestanden.',
    audioText: 'Ich bin um sieben Uhr aufgestanden.',
    answer: 'Ich bin um sieben Uhr aufgestanden.',
    options: ['Ich bin um sieben Uhr aufgestanden.', 'Ich stehe um sieben Uhr auf.', 'Ich habe um sieben Uhr aufgestanden.', 'Ich bin um sieben Uhr geaufstanden.'],
    audio: listen('Ich bin um sieben Uhr aufgestanden.'),
  }),
  G('gr-pf-dictation-gekocht', T.perfekt, 'dictation', 'hard', 'production', ['perfekt.haben.cumle'], {
    instruction: 'Annemle ilgili cümleyi duydun — aynen yaz:',
    audioText: 'Meine Mutter hat gestern Abend gekocht.',
    answer: 'Meine Mutter hat gestern Abend gekocht.',
    validation: DE_PROD,
    audio: listen('Meine Mutter hat gestern Abend gekocht.'),
  }),
  G('gr-pf-dictation-schule', T.perfekt, 'dictation', 'hard', 'production', ['perfekt.sein.cumle'], {
    instruction: 'Okul cümlesini duydun — aynen yaz:',
    audioText: 'Ich bin gestern zur Schule gegangen.',
    answer: 'Ich bin gestern zur Schule gegangen.',
    validation: DE_PROD,
    audio: listen('Ich bin gestern zur Schule gegangen.'),
  }),
];
