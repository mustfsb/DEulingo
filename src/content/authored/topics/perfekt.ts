/**
 * Perfekt — Geçmiş Zaman — konu alıştırma bankası.
 *
 * Defterdeki A1 Perfekt dersi (haben/sein + Partizip II, ge-...-t, -et,
 * -ieren, ayrılabilen fiiller, kaynak düzeyinde düzensizler, soru/olumsuz,
 * Gestern rutini). Yeni gün açılmaz; bu konu `topic.perfekt` kimliğinde yaşar.
 *
 * Kaynak normalizasyonları (defter → kanonik):
 *   - `einkaufen` yardımcı fiili `haben`dir (Ich habe eingekauft).
 *   - `aufstehen / einschlafen / aufwachen / gehen / kommen / zurückkommen`
 *     yardımcı fiili `sein`dir (Ich bin aufgestanden).
 *   - `beantworten` ayrılmaz (`be-`): beantwortet, asla `gebeantwortet` değil.
 *   - `studieren / probieren / fotografieren` sonunda `-ieren` olduğu için
 *     `ge-` almaz: studiert (asla `gestudiert` değil).
 *   - Ayrılabilen fiilde `ge` önekin ARKASINA gelir: auf-ge-standen,
 *     ein-ge-kauft (asla `geaufstanden` / `geeinkauft` değil).
 *
 * A1 SINIRI: Präteritum, Plusquamperfekt, Futur, pasif, yan-cümle Perfekt,
 * tam düzensiz envanter ve vaka teorisi YOKTUR.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';

type Rest = Partial<AuthoredExercise> & { instruction: string };

function pf(
  id: string,
  type: AuthoredExercise['type'],
  difficulty: AuthoredExercise['difficulty'],
  skill: AuthoredExercise['skill'],
  conceptIds: string[],
  rest: Rest,
): AuthoredExercise {
  return { id, topicId: T.perfekt, type, difficulty, skill, conceptIds, ...rest };
}

const tok = (...texts: string[]) => texts.map((text, index) => ({ id: `t${index + 1}`, text }));
const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });

/** Almanca üretimde klavye toleransı (ä/ö/ü/ß için ASCII yazım kabulü). */
const DE = { keyboardTolerance: true } as const;
/** Tek sözcüklü biçim sorularında yazım hatası da hata sayılır. */
const EXACT = { noTypoTolerance: true } as const;
const EXACT_DE = { noTypoTolerance: true, keyboardTolerance: true } as const;

const FORMULA = 'perfekt.formula.kural';
const FORMULA_EX = 'perfekt.formula.ornek';
const HABEN_C = 'perfekt.haben.cekim';
const HABEN_S = 'perfekt.haben.cumle';
const SEIN_C = 'perfekt.sein.cekim';
const SEIN_S = 'perfekt.sein.cumle';
const CHOICE_H = 'perfekt.secim.haben-cogunluk';
const CHOICE_S = 'perfekt.secim.sein-hareket';
const REG_K = 'perfekt.duzenli.kural';
const REG_EX = 'perfekt.duzenli.ornekler';
const ET = 'perfekt.et.kural';
const IER_K = 'perfekt.ieren.kural';
const IER_EX = 'perfekt.ieren.ornek';
const TRENN_K = 'perfekt.ayrilabilen.kural';
const TRENN_AUF = 'perfekt.ayrilabilen.aufstehen';
const TRENN_EIN = 'perfekt.ayrilabilen.einkaufen';
const TRENN_H = 'perfekt.ayrilabilen.hata';
const URR_K = 'perfekt.duzensiz.genel';
const URR_ES = 'perfekt.duzensiz.essen-sprechen';
const URR_GK = 'perfekt.duzensiz.gehen-kommen';
const Q_YN = 'perfekt.soru.evet-hayir';
const Q_WAS = 'perfekt.soru.was';
const NEG_N = 'perfekt.olumsuz.nicht';
const NEG_K = 'perfekt.olumsuz.kein';
const Z_GEST = 'perfekt.zaman.gestern';
const Z_UM = 'perfekt.zaman.um';
const G_SAB = 'perfekt.gestern.sabah';
const G_TAM = 'perfekt.gestern.tam';
const G_URE = 'perfekt.gestern.uretim';

export const PERFEKT_EXERCISES: AuthoredExercise[] = [
  /* ================================================================
   * A. Temel formül: Özne + haben/sein + … + Partizip II (8)
   * ================================================================ */
  pf('pf-formula-mc-yapi', 'multiple-choice', 'easy', 'recognition', [FORMULA], {
    familyId: 'pf-formula-yapi',
    instruction: 'Perfekt cümlesinin iskeletini seç:',
    prompt: 'Ich ___ Sport ___.',
    answer: 'habe … gemacht (yardımcı fiil başta, Partizip II sonda)',
    options: [
      'habe … gemacht (yardımcı fiil başta, Partizip II sonda)',
      'gemacht … habe (Partizip II başta, yardımcı fiil sonda)',
      'mache … gemacht (iki fiil de çekimli)',
      'habe … machen (sonda mastar)',
    ],
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-visual-mc', 'multiple-choice', 'easy', 'recognition', [FORMULA, FORMULA_EX], {
    familyId: 'pf-formula-yapi',
    instruction: 'Vurgulu cümlede yardımcı fiil ve Partizip II nerededir?',
    prompt: 'Ich habe Sport gemacht.',
    answer: 'habe ikinci sırada, gemacht en sonda',
    options: [
      'habe ikinci sırada, gemacht en sonda',
      'habe en sonda, gemacht ikinci sırada',
      'ikisi de ikinci sırada',
      'ikisi de en sonda',
    ],
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-habe-fill', 'fill-blank', 'easy', 'recall', [FORMULA, HABEN_C], {
    familyId: 'pf-formula-habe',
    instruction: 'Yardımcı fiili yaz — Spor yaptım.',
    prompt: 'Ich ___ Sport gemacht.',
    answer: 'habe',
    validation: EXACT,
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-gemacht-fill', 'fill-blank', 'easy', 'recall', [FORMULA, REG_EX], {
    familyId: 'pf-formula-gemacht',
    instruction: 'Partizip II’yi yaz — Spor yaptım.',
    prompt: 'Ich habe Sport ___.',
    answer: 'gemacht',
    validation: EXACT,
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-order-sport', 'ordering', 'medium', 'production', [FORMULA, FORMULA_EX], {
    familyId: 'pf-formula-order',
    instruction: 'Kelimeleri doğru sıraya diz — Spor yaptım.',
    prompt: 'gemacht. / Sport / habe / Ich',
    answer: 'Ich habe Sport gemacht.',
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-error-machen', 'error-correction', 'medium', 'correction', [FORMULA, REG_EX, 'perfekt.mistakes.kutu'], {
    familyId: 'pf-formula-error',
    instruction: 'Sonda mastar duramaz — cümleyi düzelt:',
    prompt: 'Ich habe Sport machen.',
    answer: 'Ich habe Sport gemacht.',
    explanation: 'Perfekt geçmişi Partizip II ile anlatır: sonda `machen` değil `gemacht`.',
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-wb-sport', 'word-bank-translation', 'medium', 'production', [FORMULA_EX], {
    familyId: 'pf-formula-wb',
    instruction: 'Kutucuklarla kur — Spor yaptım.',
    answer: 'Ich habe Sport gemacht.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Spor yaptım.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'Sport', 'gemacht.', 'mache', 'machen', 'bin'),
      acceptedSequences: [['Ich', 'habe', 'Sport', 'gemacht.']],
    },
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-formula-listen-sport', 'listen-choice', 'easy', 'recognition', [FORMULA_EX], {
    familyId: 'pf-formula-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich habe Sport gemacht.',
    audioText: 'Ich habe Sport gemacht.',
    answer: 'Ich habe Sport gemacht.',
    options: ['Ich habe Sport gemacht.', 'Ich mache Sport.', 'Ich habe Sport machen.', 'Ich bin Sport gemacht.'],
    audio: listen('Ich habe Sport gemacht.'),
  }),

  /* ================================================================
   * B. haben çekimi + haben cümleleri (10)
   * ================================================================ */
  pf('pf-haben-table-match', 'matching', 'easy', 'recognition', [HABEN_C], {
    familyId: 'pf-haben-table',
    instruction: 'haben biçimini öznesiyle eşleştir.',
    pairs: [
      { left: 'ich', right: 'habe' },
      { left: 'du', right: 'hast' },
      { left: 'er / sie / es', right: 'hat' },
      { left: 'wir', right: 'haben' },
      { left: 'ihr', right: 'habt' },
      { left: 'sie / Sie', right: 'haben' },
    ],
    pronounce: ['haben'],
  }),
  pf('pf-haben-hat-fill', 'fill-blank', 'easy', 'recall', [HABEN_C], {
    familyId: 'pf-haben-hat',
    instruction: 'Yardımcı fiili yaz — Ahmet ödevini yaptı.',
    prompt: 'Ahmet ___ seine Hausaufgaben gemacht.',
    answer: 'hat',
    validation: EXACT,
    pronounce: ['Ahmet hat seine Hausaufgaben gemacht.'],
  }),
  pf('pf-haben-haben-fill', 'fill-blank', 'easy', 'recall', [HABEN_C], {
    familyId: 'pf-haben-haben',
    instruction: 'Yardımcı fiili yaz — Müzik dinledik.',
    prompt: 'Wir ___ Musik gehört.',
    answer: 'haben',
    validation: EXACT,
    pronounce: ['Wir haben Musik gehört.'],
  }),
  pf('pf-haben-hast-fill', 'fill-blank', 'easy', 'recall', [HABEN_C, Q_YN], {
    familyId: 'pf-haben-hast',
    instruction: 'Yardımcı fiili yaz — Sen spor yaptın mı?',
    prompt: '___ du Sport gemacht? (Hast …?)',
    answer: 'Hast',
    acceptedAnswers: ['hast'],
    validation: EXACT,
    pronounce: ['Hast du Sport gemacht?'],
  }),
  pf('pf-haben-musik-free', 'free-text', 'hard', 'production', [HABEN_S], {
    familyId: 'pf-haben-musik',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Müzik dinledim. → ______',
    answer: 'Ich habe Musik gehört.',
    validation: DE,
    pronounce: ['Ich habe Musik gehört.'],
  }),
  pf('pf-haben-mutter-kocht', 'free-text', 'hard', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-haben-mutter',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Annem dün akşam yemek yaptı. → ______',
    answer: 'Meine Mutter hat gestern Abend gekocht.',
    validation: DE,
    pronounce: ['Meine Mutter hat gestern Abend gekocht.'],
  }),
  pf('pf-haben-email-wb', 'word-bank-translation', 'medium', 'production', [HABEN_S, ET], {
    familyId: 'pf-haben-email',
    instruction: 'Kutucuklarla kur — Bu e-postayı yanıtladım.',
    answer: 'Ich habe diese E-Mail beantwortet.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Bu e-postayı yanıtladım.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'diese', 'E-Mail', 'beantwortet.', 'geantwortet.', 'beantworten.'),
      acceptedSequences: [['Ich', 'habe', 'diese', 'E-Mail', 'beantwortet.']],
    },
    pronounce: ['Ich habe diese E-Mail beantwortet.'],
  }),
  pf('pf-haben-freunde-order', 'ordering', 'medium', 'production', [HABEN_S], {
    familyId: 'pf-haben-freunde',
    instruction: 'Kelimeleri doğru sıraya diz — Dün arkadaşlarımla konuştum.',
    answer: 'Ich habe gestern mit meinen Freunden geredet.',
    pronounce: ['Ich habe gestern mit meinen Freunden geredet.'],
  }),
  pf('pf-haben-gesagt-free', 'free-text', 'hard', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-haben-gesagt',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Sana dün söyledim. → ______',
    answer: 'Ich habe dir gestern gesagt.',
    validation: DE,
    pronounce: ['Ich habe dir gestern gesagt.'],
  }),
  pf('pf-haben-listen-musik', 'listen-choice', 'easy', 'recognition', [HABEN_S], {
    familyId: 'pf-haben-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich habe Musik gehört.',
    audioText: 'Ich habe Musik gehört.',
    answer: 'Ich habe Musik gehört.',
    options: ['Ich habe Musik gehört.', 'Ich höre Musik.', 'Ich bin Musik gehört.', 'Ich habe Musik hören.'],
    audio: listen('Ich habe Musik gehört.'),
  }),

  /* ================================================================
   * C. sein çekimi + sein cümleleri (10)
   * ================================================================ */
  pf('pf-sein-table-match', 'matching', 'easy', 'recognition', [SEIN_C], {
    familyId: 'pf-sein-table',
    instruction: 'sein biçimini öznesiyle eşleştir.',
    pairs: [
      { left: 'ich', right: 'bin' },
      { left: 'du', right: 'bist' },
      { left: 'er / sie / es', right: 'ist' },
      { left: 'wir', right: 'sind' },
      { left: 'ihr', right: 'seid' },
      { left: 'sie / Sie', right: 'sind' },
    ],
    pronounce: ['sein'],
  }),
  pf('pf-sein-bin-fill', 'fill-blank', 'easy', 'recall', [SEIN_C, SEIN_S], {
    familyId: 'pf-sein-bin',
    instruction: 'Yardımcı fiili yaz — Okula gittim.',
    prompt: 'Ich ___ zur Schule gegangen.',
    answer: 'bin',
    validation: EXACT,
    pronounce: ['Ich bin zur Schule gegangen.'],
  }),
  pf('pf-sein-bist-fill', 'fill-blank', 'easy', 'recall', [SEIN_C, Q_YN], {
    familyId: 'pf-sein-bist',
    instruction: 'Yardımcı fiili yaz — Okula gittin mi?',
    prompt: '___ du zur Schule gegangen? (Bist …?)',
    answer: 'Bist',
    acceptedAnswers: ['bist'],
    validation: EXACT,
    pronounce: ['Bist du zur Schule gegangen?'],
  }),
  pf('pf-sein-schule-free', 'free-text', 'medium', 'production', [SEIN_S], {
    familyId: 'pf-sein-schule',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün okula gittim. → ______',
    answer: 'Ich bin gestern zur Schule gegangen.',
    validation: DE,
    pronounce: ['Ich bin gestern zur Schule gegangen.'],
  }),
  pf('pf-sein-aufgestanden-free', 'free-text', 'medium', 'production', [SEIN_S, Z_UM, TRENN_AUF], {
    familyId: 'pf-sein-aufgestanden',
    secondaryTopicIds: [T.time],
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Saat 8’de kalktım. → ______',
    answer: 'Ich bin um 8 Uhr aufgestanden.',
    acceptedAnswers: ['Ich bin um 8 Uhr aufgestanden'],
    validation: DE,
    pronounce: ['Ich bin um 8 Uhr aufgestanden.'],
  }),
  pf('pf-sein-zurueck-free', 'free-text', 'hard', 'production', [SEIN_S, TRENN_K], {
    familyId: 'pf-sein-zurueck',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Eve geri döndüm. → ______',
    answer: 'Ich bin nach Hause zurückgekommen.',
    validation: DE,
    pronounce: ['Ich bin nach Hause zurückgekommen.'],
  }),
  pf('pf-sein-bett-order', 'ordering', 'medium', 'production', [SEIN_S, G_TAM], {
    familyId: 'pf-sein-bett',
    instruction: 'Kelimeleri doğru sıraya diz — Yatağa gittim.',
    answer: 'Ich bin ins Bett gegangen.',
    pronounce: ['Ich bin ins Bett gegangen.'],
  }),
  pf('pf-sein-wb-schule', 'word-bank-translation', 'medium', 'production', [SEIN_S], {
    familyId: 'pf-sein-wb',
    instruction: 'Kutucuklarla kur — Okula gittim.',
    answer: 'Ich bin zur Schule gegangen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Okula gittim.', targetLanguage: 'de',
      tokens: tok('Ich', 'bin', 'zur', 'Schule', 'gegangen.', 'habe', 'geganen.'),
      acceptedSequences: [['Ich', 'bin', 'zur', 'Schule', 'gegangen.']],
    },
    pronounce: ['Ich bin zur Schule gegangen.'],
  }),
  pf('pf-sein-error-habe-gegangen', 'error-correction', 'medium', 'correction', [SEIN_S, CHOICE_S], {
    familyId: 'pf-sein-error',
    instruction: 'Yardımcı fiil yanlış — cümleyi düzelt:',
    prompt: 'Ich habe gestern zur Schule gegangen.',
    answer: 'Ich bin gestern zur Schule gegangen.',
    explanation: '`gehen` hareket fiilidir; Perfekt yardımcı fiili `sein` olur.',
    pronounce: ['Ich bin gestern zur Schule gegangen.'],
  }),
  pf('pf-sein-listen-schule', 'listen-choice', 'easy', 'recognition', [SEIN_S], {
    familyId: 'pf-sein-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich bin zur Schule gegangen.',
    audioText: 'Ich bin zur Schule gegangen.',
    answer: 'Ich bin zur Schule gegangen.',
    options: ['Ich bin zur Schule gegangen.', 'Ich gehe zur Schule.', 'Ich habe zur Schule gegangen.', 'Ich bin zur Schule gehen.'],
    audio: listen('Ich bin zur Schule gegangen.'),
  }),

  /* ================================================================
   * D. haben mı sein mı? — hızlı tur (12)
   * ================================================================ */
  pf('pf-choice-gehen-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_S, URR_GK], {
    familyId: 'pf-choice-gehen',
    instruction: 'Doğru yardımcı fiili seç — gehen:',
    prompt: 'gehen → ___ gegangen',
    answer: 'sein (Ich bin gegangen.)',
    options: ['sein (Ich bin gegangen.)', 'haben (Ich habe gegangen.)'],
    pronounce: ['Ich bin gegangen.'],
  }),
  pf('pf-choice-machen-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_H, REG_EX], {
    familyId: 'pf-choice-machen',
    instruction: 'Doğru yardımcı fiili seç — machen:',
    prompt: 'machen → ___ gemacht',
    answer: 'haben (Ich habe gemacht.)',
    options: ['haben (Ich habe gemacht.)', 'sein (Ich bin gemacht.)'],
    pronounce: ['Ich habe gemacht.'],
  }),
  pf('pf-choice-kommen-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_S, URR_GK], {
    familyId: 'pf-choice-kommen',
    instruction: 'Doğru yardımcı fiili seç — kommen:',
    prompt: 'kommen → ___ gekommen',
    answer: 'sein (Ich bin gekommen.)',
    options: ['sein (Ich bin gekommen.)', 'haben (Ich habe gekommen.)'],
    pronounce: ['Ich bin gekommen.'],
  }),
  pf('pf-choice-lernen-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_H, REG_EX], {
    familyId: 'pf-choice-lernen',
    instruction: 'Doğru yardımcı fiili seç — lernen:',
    prompt: 'lernen → ___ gelernt',
    answer: 'haben (Ich habe gelernt.)',
    options: ['haben (Ich habe gelernt.)', 'sein (Ich bin gelernt.)'],
    pronounce: ['Ich habe gelernt.'],
  }),
  pf('pf-choice-aufstehen-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_S, TRENN_AUF], {
    familyId: 'pf-choice-aufstehen',
    instruction: 'Doğru yardımcı fiili seç — aufstehen:',
    prompt: 'aufstehen → ___ aufgestanden',
    answer: 'sein (Ich bin aufgestanden.)',
    options: ['sein (Ich bin aufgestanden.)', 'haben (Ich habe aufgestanden.)'],
    pronounce: ['Ich bin aufgestanden.'],
  }),
  pf('pf-choice-hoeren-mc', 'multiple-choice', 'easy', 'recognition', [CHOICE_H, REG_EX], {
    familyId: 'pf-choice-hoeren',
    instruction: 'Doğru yardımcı fiili seç — hören:',
    prompt: 'hören → ___ gehört',
    answer: 'haben (Ich habe gehört.)',
    options: ['haben (Ich habe gehört.)', 'sein (Ich bin gehört.)'],
    pronounce: ['Ich habe gehört.'],
  }),
  pf('pf-choice-rapid-match', 'matching', 'medium', 'recognition', [CHOICE_H, CHOICE_S], {
    familyId: 'pf-choice-rapid',
    instruction: 'Fiili yardımcı fiiliyle eşleştir.',
    pairs: [
      { left: 'machen', right: 'haben' },
      { left: 'gehen', right: 'sein' },
      { left: 'lernen', right: 'haben' },
      { left: 'kommen', right: 'sein' },
      { left: 'aufstehen', right: 'sein' },
      { left: 'spielen', right: 'haben' },
    ],
    pronounce: ['machen', 'gehen', 'lernen', 'kommen', 'aufstehen', 'spielen'],
  }),
  pf('pf-choice-sein-verbs-mc', 'multiple-choice', 'medium', 'recognition', [CHOICE_S], {
    familyId: 'pf-choice-sein-list',
    instruction: 'Hangisi bu derste `sein` ile kullanılanlardandır?',
    prompt: 'sein + …',
    answer: 'zurückkommen',
    options: ['zurückkommen', 'machen', 'hören', 'lernen'],
    pronounce: ['zurückkommen'],
  }),
  pf('pf-choice-bin-gehoert-error', 'error-correction', 'medium', 'correction', [CHOICE_H, HABEN_S, 'perfekt.mistakes.kutu'], {
    familyId: 'pf-choice-error-hoeren',
    instruction: 'Yardımcı fiil yanlış — cümleyi düzelt:',
    prompt: 'Ich bin gestern Musik gehört.',
    answer: 'Ich habe gestern Musik gehört.',
    explanation: '`hören` hareket anlatmaz; yardımcı fiil `haben` olur.',
    pronounce: ['Ich habe gestern Musik gehört.'],
  }),
  pf('pf-choice-bin-hausaufgaben-error', 'error-correction', 'medium', 'correction', [CHOICE_H], {
    familyId: 'pf-choice-error-haus',
    instruction: 'Yardımcı fiil yanlış — cümleyi düzelt:',
    prompt: 'Ich bin meine Hausaufgaben gemacht.',
    answer: 'Ich habe meine Hausaufgaben gemacht.',
    explanation: '`machen` yardımcı fiil olarak `haben` ister.',
    pronounce: ['Ich habe meine Hausaufgaben gemacht.'],
  }),
  pf('pf-choice-vater-eingekauft-fill', 'fill-blank', 'medium', 'recall', [CHOICE_H, TRENN_EIN], {
    familyId: 'pf-choice-vater',
    instruction: 'Yardımcı fiili yaz — Babam yiyecek alışverişi yaptı.',
    prompt: 'Mein Vater ___ Lebensmittel eingekauft.',
    answer: 'hat',
    validation: EXACT,
    pronounce: ['Mein Vater hat Lebensmittel eingekauft.'],
  }),
  pf('pf-choice-wir-gehoert-fill', 'fill-blank', 'easy', 'recall', [CHOICE_H, HABEN_S], {
    familyId: 'pf-choice-wir',
    instruction: 'Yardımcı fiili yaz — Müzik dinledik.',
    prompt: 'Wir ___ Musik gehört. (haben / sind)',
    answer: 'haben',
    validation: EXACT,
    pronounce: ['Wir haben Musik gehört.'],
  }),

  /* ================================================================
   * E. Düzenli ge-...-t (16)
   * ================================================================ */
  pf('pf-reg-kural-mc', 'multiple-choice', 'easy', 'recognition', [REG_K], {
    familyId: 'pf-reg-kural',
    instruction: 'Düzenli Partizip II nasıl kurulur?',
    prompt: 'machen → gemacht',
    answer: 'ge + fiil kökü + t',
    options: ['ge + fiil kökü + t', 'fiil kökü + ge + t', 'ge + mastar', 'mastar + ge'],
    pronounce: ['gemacht'],
  }),
  pf('pf-reg-machen-fill', 'fill-blank', 'easy', 'recall', [REG_EX], {
    familyId: 'pf-reg-machen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'machen → ___ (Partizip II)',
    answer: 'gemacht',
    validation: EXACT,
    pronounce: ['gemacht'],
  }),
  pf('pf-reg-hoeren-fill', 'fill-blank', 'easy', 'recall', [REG_EX], {
    familyId: 'pf-reg-hoeren',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'hören → ___',
    answer: 'gehört',
    validation: EXACT_DE,
    pronounce: ['gehört'],
  }),
  pf('pf-reg-sagen-fill', 'fill-blank', 'easy', 'recall', [REG_EX], {
    familyId: 'pf-reg-sagen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'sagen → ___',
    answer: 'gesagt',
    validation: EXACT,
    pronounce: ['gesagt'],
  }),
  pf('pf-reg-kochen-fill', 'fill-blank', 'easy', 'recall', [REG_EX], {
    familyId: 'pf-reg-kochen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'kochen → ___',
    answer: 'gekocht',
    validation: EXACT,
    pronounce: ['gekocht'],
  }),
  pf('pf-reg-lernen-build', 'fill-blank', 'medium', 'recall', [REG_K, REG_EX], {
    familyId: 'pf-reg-build-lernen',
    instruction: 'Parçalardan kur — lernen:',
    prompt: 'ge + lern + t → ___',
    answer: 'gelernt',
    validation: EXACT,
    pronounce: ['gelernt'],
  }),
  pf('pf-reg-spielen-mc', 'multiple-choice', 'easy', 'recognition', [REG_EX], {
    familyId: 'pf-reg-spielen',
    instruction: 'Doğru Partizip II hangisi? — spielen',
    prompt: 'spielen → ?',
    answer: 'gespielt',
    options: ['gespielt', 'gespielen', 'gespieltet', 'spielt'],
    pronounce: ['gespielt'],
  }),
  pf('pf-reg-machen-mc', 'multiple-choice', 'easy', 'recognition', [REG_EX], {
    familyId: 'pf-reg-machen-mc',
    instruction: 'Doğru Partizip II hangisi? — machen',
    prompt: 'machen → ?',
    answer: 'gemacht',
    options: ['gemacht', 'gemachen', 'gemachtet', 'macht'],
    pronounce: ['gemacht'],
  }),
  pf('pf-reg-match-inf-part', 'matching', 'medium', 'recognition', [REG_EX], {
    familyId: 'pf-reg-match',
    instruction: 'Düzenli mastarı Partizip II ile eşleştir.',
    pairs: [
      { left: 'machen', right: 'gemacht' },
      { left: 'hören', right: 'gehört' },
      { left: 'sagen', right: 'gesagt' },
      { left: 'kochen', right: 'gekocht' },
      { left: 'lernen', right: 'gelernt' },
      { left: 'spielen', right: 'gespielt' },
    ],
    pronounce: ['gemacht', 'gehört', 'gesagt', 'gekocht', 'gelernt', 'gespielt'],
  }),
  pf('pf-reg-progression-free', 'free-text', 'medium', 'production', [REG_K, FORMULA_EX], {
    familyId: 'pf-reg-progression',
    instruction: 'Zinciri tamamla — machen:',
    prompt: 'machen → mach → ge + mach + t → ___ (Ich habe Sport gemacht.).',
    answer: 'gemacht',
    validation: EXACT,
    explanation: 'machen → mach → ge + mach + t → gemacht → Ich habe Sport gemacht.',
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-reg-gelernt-free', 'free-text', 'hard', 'production', [HABEN_S, REG_EX], {
    familyId: 'pf-reg-gelernt',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün Almanca öğrendim. → ______',
    answer: 'Ich habe gestern Deutsch gelernt.',
    validation: DE,
    pronounce: ['Ich habe gestern Deutsch gelernt.'],
  }),
  pf('pf-reg-gespielt-free', 'free-text', 'hard', 'production', [HABEN_S, REG_EX], {
    familyId: 'pf-reg-gespielt',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Arkadaşımla oynadım. → ______',
    answer: 'Ich habe mit meinem Freund gespielt.',
    validation: DE,
    pronounce: ['Ich habe mit meinem Freund gespielt.'],
  }),
  pf('pf-reg-gekocht-order', 'ordering', 'medium', 'production', [HABEN_S, REG_EX, Z_GEST], {
    familyId: 'pf-reg-gekocht',
    secondaryTopicIds: [T.dailyRoutine],
    instruction: 'Kelimeleri doğru sıraya diz — Dün akşam yemek yaptım.',
    answer: 'Ich habe gestern Abend gekocht.',
    pronounce: ['Ich habe gestern Abend gekocht.'],
  }),
  pf('pf-reg-error-gemachen', 'error-correction', 'medium', 'correction', [REG_EX], {
    familyId: 'pf-reg-error',
    instruction: 'Partizip yanlış — cümleyi düzelt:',
    prompt: 'Ich habe gestern Sport gemachen.',
    answer: 'Ich habe gestern Sport gemacht.',
    explanation: 'Düzenli Partizip II `-t` ile biter: `gemacht`.',
    pronounce: ['Ich habe gestern Sport gemacht.'],
  }),
  pf('pf-reg-error-hoeren-inf', 'error-correction', 'medium', 'correction', [REG_EX], {
    familyId: 'pf-reg-error-hoeren',
    instruction: 'Sonda mastar duramaz — cümleyi düzelt:',
    prompt: 'Ich habe gestern Musik hören.',
    answer: 'Ich habe gestern Musik gehört.',
    explanation: 'Sonda mastar değil Partizip II olur: `gehört`.',
    pronounce: ['Ich habe gestern Musik gehört.'],
  }),
  pf('pf-reg-wb-gelernt', 'word-bank-translation', 'medium', 'production', [REG_EX, HABEN_S], {
    familyId: 'pf-reg-wb',
    instruction: 'Kutucuklarla kur — Dün Almanca öğrendim.',
    answer: 'Ich habe gestern Deutsch gelernt.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Dün Almanca öğrendim.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'gestern', 'Deutsch', 'gelernt.', 'lerne', 'gelernen.'),
      acceptedSequences: [['Ich', 'habe', 'gestern', 'Deutsch', 'gelernt.']],
    },
    pronounce: ['Ich habe gestern Deutsch gelernt.'],
  }),

  /* ================================================================
   * F. -d / -t → -et: antworten, reden, arbeiten (8)
   * ================================================================ */
  pf('pf-et-kural-mc', 'multiple-choice', 'easy', 'recognition', [ET], {
    familyId: 'pf-et-kural',
    instruction: 'Neden `geantwortet` iki `e` ile yazılır?',
    prompt: 'antworten → geantwortet',
    answer: 'söylenişi kolaylaştırmak için araya e girer (-et)',
    options: [
      'söylenişi kolaylaştırmak için araya e girer (-et)',
      'her fiil -et alır',
      'antworten düzensizdir',
      'ge- iki kez gelir',
    ],
    pronounce: ['geantwortet'],
  }),
  pf('pf-et-antworten-fill', 'fill-blank', 'easy', 'recall', [ET], {
    familyId: 'pf-et-antworten',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'antworten → ___',
    answer: 'geantwortet',
    validation: EXACT,
    pronounce: ['geantwortet'],
  }),
  pf('pf-et-reden-fill', 'fill-blank', 'easy', 'recall', [ET], {
    familyId: 'pf-et-reden',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'reden → ___',
    answer: 'geredet',
    validation: EXACT,
    pronounce: ['geredet'],
  }),
  pf('pf-et-arbeiten-fill', 'fill-blank', 'easy', 'recall', [ET], {
    familyId: 'pf-et-arbeiten',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'arbeiten → ___',
    answer: 'gearbeitet',
    validation: EXACT,
    pronounce: ['gearbeitet'],
  }),
  pf('pf-et-arbeiten-build', 'fill-blank', 'medium', 'recall', [ET], {
    familyId: 'pf-et-build',
    instruction: 'Parçalardan kur — arbeiten:',
    prompt: 'ge + arbeit + et → ___',
    answer: 'gearbeitet',
    validation: EXACT,
    pronounce: ['gearbeitet'],
  }),
  pf('pf-et-match', 'matching', 'medium', 'recognition', [ET], {
    familyId: 'pf-et-match',
    instruction: '"-et" mastarını Partizip II ile eşleştir.',
    pairs: [
      { left: 'antworten', right: 'geantwortet' },
      { left: 'reden', right: 'geredet' },
      { left: 'arbeiten', right: 'gearbeitet' },
    ],
    pronounce: ['geantwortet', 'geredet', 'gearbeitet'],
  }),
  pf('pf-et-nicht-gearbeitet-free', 'free-text', 'medium', 'production', [ET, NEG_N], {
    familyId: 'pf-et-nicht',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Babam dün çalışmadı. → ______',
    answer: 'Mein Vater hat gestern nicht gearbeitet.',
    validation: DE,
    pronounce: ['Mein Vater hat gestern nicht gearbeitet.'],
  }),
  pf('pf-et-geredet-free', 'free-text', 'hard', 'production', [ET, HABEN_S], {
    familyId: 'pf-et-geredet',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün arkadaşlarımla konuştum. → ______',
    answer: 'Ich habe gestern mit meinen Freunden geredet.',
    validation: DE,
    pronounce: ['Ich habe gestern mit meinen Freunden geredet.'],
  }),

  /* ================================================================
   * G. -ieren → ge yok (8)
   * ================================================================ */
  pf('pf-ieren-kural-mc', 'multiple-choice', 'easy', 'recognition', [IER_K], {
    familyId: 'pf-ieren-kural',
    instruction: '-ieren ile biten fiillerde Partizip II nasıldır?',
    prompt: 'studieren → ?',
    answer: 'ge- yoktur: studiert',
    options: ['ge- yoktur: studiert', 'ge- vardır: gestudiert', 'önek + ge alır: stuge diert', '-en ile biter: studieren'],
    pronounce: ['studiert'],
  }),
  pf('pf-ieren-studiert-fill', 'fill-blank', 'easy', 'recall', [IER_EX], {
    familyId: 'pf-ieren-studiert',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'studieren → ___',
    answer: 'studiert',
    validation: EXACT,
    pronounce: ['studiert'],
  }),
  pf('pf-ieren-probiert-fill', 'fill-blank', 'easy', 'recall', [IER_EX], {
    familyId: 'pf-ieren-probiert',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'probieren → ___',
    answer: 'probiert',
    validation: EXACT,
    pronounce: ['probiert'],
  }),
  pf('pf-ieren-foto-fill', 'fill-blank', 'medium', 'recall', [IER_EX], {
    familyId: 'pf-ieren-foto',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'fotografieren → ___',
    answer: 'fotografiert',
    validation: EXACT,
    pronounce: ['fotografiert'],
  }),
  pf('pf-ieren-build', 'fill-blank', 'medium', 'recall', [IER_K, IER_EX], {
    familyId: 'pf-ieren-build',
    instruction: 'Parçalardan kur — studieren:',
    prompt: 'studier + t (ge YOK) → ___',
    answer: 'studiert',
    validation: EXACT,
    pronounce: ['studiert'],
  }),
  pf('pf-ieren-studiert-free', 'free-text', 'hard', 'production', [IER_EX, HABEN_S], {
    familyId: 'pf-ieren-studiert-cumle',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün iki saat Almanca çalıştım. → ______',
    answer: 'Ich habe zwei Stunden Deutsch studiert.',
    validation: DE,
    pronounce: ['Ich habe zwei Stunden Deutsch studiert.'],
  }),
  pf('pf-ieren-ayse-free', 'free-text', 'hard', 'production', [IER_EX, HABEN_S], {
    familyId: 'pf-ieren-ayse',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Ayşe elbiseyi denedi. → ______',
    answer: 'Ayşe hat das Kleid probiert.',
    validation: DE,
    pronounce: ['Ayşe hat das Kleid probiert.'],
  }),
  pf('pf-ieren-error-gestudiert', 'error-correction', 'hard', 'correction', [IER_K, 'perfekt.mistakes.kutu'], {
    familyId: 'pf-ieren-error',
    instruction: 'Fazladan `ge-` var — cümleyi düzelt:',
    prompt: 'Ich habe gestern Deutsch gestudiert.',
    answer: 'Ich habe gestern Deutsch studiert.',
    explanation: '`-ieren` fiilleri `ge-` almaz: `studiert`.',
    pronounce: ['Ich habe gestern Deutsch studiert.'],
  }),

  /* ================================================================
   * H. Ayrılabilen fiillerde Perfekt (16)
   * ================================================================ */
  pf('pf-trenn-kural-mc', 'multiple-choice', 'easy', 'recognition', [TRENN_K], {
    familyId: 'pf-trenn-kural',
    instruction: 'Ayrılabilen fiilde `ge` nereye gelir?',
    prompt: 'einkaufen → eingekauft',
    answer: 'önekin arkasına: önek + ge + fiil',
    options: [
      'önekin arkasına: önek + ge + fiil',
      'kelimenin en başına: geeinkauft',
      'kelimenin en sonuna: einkaufge',
      'hiç gelmez: einkauft',
    ],
    pronounce: ['eingekauft'],
  }),
  pf('pf-trenn-aufstehen-fill', 'fill-blank', 'medium', 'recall', [TRENN_AUF], {
    familyId: 'pf-trenn-aufstehen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'aufstehen → ___',
    answer: 'aufgestanden',
    validation: EXACT,
    pronounce: ['aufgestanden'],
  }),
  pf('pf-trenn-einkaufen-fill', 'fill-blank', 'medium', 'recall', [TRENN_EIN], {
    familyId: 'pf-trenn-einkaufen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'einkaufen → ___',
    answer: 'eingekauft',
    validation: EXACT,
    pronounce: ['eingekauft'],
  }),
  pf('pf-trenn-build-ein', 'fill-blank', 'medium', 'recall', [TRENN_K, TRENN_EIN], {
    familyId: 'pf-trenn-build',
    instruction: 'Parçalardan kur — einkaufen:',
    prompt: 'ein + ge + kauf + t → ___',
    answer: 'eingekauft',
    validation: EXACT,
    pronounce: ['eingekauft'],
  }),
  pf('pf-trenn-geaufstanden-error', 'error-correction', 'hard', 'correction', [TRENN_H, 'perfekt.mistakes.kutu'], {
    familyId: 'pf-trenn-error-ge',
    instruction: '`ge` yanlış yerde — cümleyi düzelt:',
    prompt: 'Ich habe um 8 Uhr geaufstanden.',
    answer: 'Ich bin um 8 Uhr aufgestanden.',
    explanation: '`ge` önekin arkasına gelir (`aufgestanden`) ve `aufstehen` yardımcı fiil olarak `sein` ister.',
    pronounce: ['Ich bin um 8 Uhr aufgestanden.'],
  }),
  pf('pf-trenn-geeinkauft-error', 'error-correction', 'hard', 'correction', [TRENN_H], {
    familyId: 'pf-trenn-error-gee',
    instruction: '`ge` yanlış yerde — cümleyi düzelt:',
    prompt: 'Ich habe gestern geeinkauft.',
    answer: 'Ich habe gestern eingekauft.',
    explanation: 'Doğrusu `ein-ge-kauft`: `eingekauft`.',
    pronounce: ['Ich habe gestern eingekauft.'],
  }),
  pf('pf-trenn-inf-error', 'error-correction', 'medium', 'correction', [TRENN_K], {
    familyId: 'pf-trenn-error-inf',
    instruction: 'Sonda mastar duramaz — cümleyi düzelt:',
    prompt: 'Ich habe gestern einkaufen.',
    answer: 'Ich habe gestern eingekauft.',
    explanation: 'Sonda mastar değil Partizip II olur: `eingekauft`.',
    pronounce: ['Ich habe gestern eingekauft.'],
  }),
  pf('pf-trenn-vater-order', 'ordering', 'medium', 'production', [TRENN_EIN, HABEN_S], {
    familyId: 'pf-trenn-vater',
    instruction: 'Kelimeleri doğru sıraya diz — Babam yiyecek alışverişi yaptı.',
    answer: 'Mein Vater hat Lebensmittel eingekauft.',
    pronounce: ['Mein Vater hat Lebensmittel eingekauft.'],
  }),
  pf('pf-trenn-auf-present-free', 'free-text', 'hard', 'production', [TRENN_AUF, SEIN_S], {
    familyId: 'pf-trenn-present-auf',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich stehe um 8 Uhr auf. → ______',
    answer: 'Ich bin um 8 Uhr aufgestanden.',
    validation: DE,
    explanation: 'Şimdiki zaman ikiye bölünür (`stehe … auf`); Perfekt sonda birleşir (`aufgestanden`).',
    pronounce: ['Ich bin um 8 Uhr aufgestanden.'],
  }),
  pf('pf-trenn-ein-present-free', 'free-text', 'hard', 'production', [TRENN_EIN, HABEN_S], {
    familyId: 'pf-trenn-present-ein',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich kaufe Lebensmittel ein. → ______',
    answer: 'Ich habe Lebensmittel eingekauft.',
    validation: DE,
    pronounce: ['Ich habe Lebensmittel eingekauft.'],
  }),
  pf('pf-trenn-anziehen-free', 'free-text', 'hard', 'production', [TRENN_K, G_SAB], {
    familyId: 'pf-trenn-anziehen',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich ziehe mich an. → ______',
    answer: 'Ich habe mich angezogen.',
    validation: DE,
    pronounce: ['Ich habe mich angezogen.'],
  }),
  pf('pf-trenn-vater-ein-present', 'free-text', 'hard', 'production', [TRENN_EIN, HABEN_S], {
    familyId: 'pf-trenn-vater-present',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Mein Vater kauft Lebensmittel ein. → ______',
    answer: 'Mein Vater hat Lebensmittel eingekauft.',
    validation: DE,
    pronounce: ['Mein Vater hat Lebensmittel eingekauft.'],
  }),
  pf('pf-trenn-wb-aufgestanden', 'word-bank-translation', 'medium', 'production', [TRENN_AUF, SEIN_S], {
    familyId: 'pf-trenn-wb-auf',
    instruction: 'Kutucuklarla kur — Saat 8’de kalktım.',
    answer: 'Ich bin um 8 Uhr aufgestanden.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Saat 8’de kalktım.', targetLanguage: 'de',
      tokens: tok('Ich', 'bin', 'um', '8', 'Uhr', 'aufgestanden.', 'habe', 'aufgestehen.'),
      acceptedSequences: [['Ich', 'bin', 'um', '8', 'Uhr', 'aufgestanden.']],
    },
    pronounce: ['Ich bin um 8 Uhr aufgestanden.'],
  }),
  pf('pf-trenn-beantwortet-mc', 'multiple-choice', 'medium', 'recognition', [TRENN_K, ET], {
    familyId: 'pf-trenn-beantwortet',
    instruction: 'Neden `beantwortet` başında `ge-` yoktur?',
    prompt: 'Ich habe diese E-Mail beantwortet.',
    answer: 'be- ile başlayan fiiller ayrılmaz, ge- almaz',
    options: [
      'be- ile başlayan fiiller ayrılmaz, ge- almaz',
      'beantworten -ieren ile bitiyor',
      'beantworten sein kullanıyor',
      'E-Mail olduğu için kısaltılıyor',
    ],
    pronounce: ['Ich habe diese E-Mail beantwortet.'],
  }),
  pf('pf-trenn-angezogen-mc', 'multiple-choice', 'medium', 'recognition', [TRENN_K], {
    familyId: 'pf-trenn-angezogen',
    instruction: 'Doğru Partizip II hangisi? — anziehen',
    prompt: 'anziehen → ?',
    answer: 'angezogen',
    options: ['angezogen', 'geanziehen', 'angezieht', 'anzieht'],
    pronounce: ['angezogen'],
  }),
  pf('pf-trenn-ausgezogen-fill', 'fill-blank', 'easy', 'recall', [TRENN_K], {
    familyId: 'pf-trenn-ausgezogen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'ausziehen → ___',
    answer: 'ausgezogen',
    validation: EXACT,
    pronounce: ['ausgezogen'],
  }),
  pf('pf-trenn-zurueck-free', 'free-text', 'hard', 'production', [TRENN_K, SEIN_S], {
    familyId: 'pf-trenn-zurueck-prod',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Sonra eve geri döndüm. → ______',
    answer: 'Danach bin ich nach Hause zurückgekommen.',
    acceptedAnswers: ['Danach bin ich nach Hause zurückgekommen'],
    validation: DE,
    pronounce: ['Danach bin ich nach Hause zurückgekommen.'],
  }),

  /* ================================================================
   * I. Düzensiz Partizipler — kaynak düzeyi (14)
   * ================================================================ */
  pf('pf-urr-kural-mc', 'multiple-choice', 'easy', 'recognition', [URR_K], {
    familyId: 'pf-urr-kural',
    instruction: 'Düzensiz Partizip II nasıl öğrenilir?',
    prompt: 'essen → gegessen, gehen → gegangen …',
    answer: 'düzensiz Partizip II ezberlenir, kurala indirgenmez',
    options: [
      'düzensiz Partizip II ezberlenir, kurala indirgenmez',
      'hepsi ge + kök + t ile kurulur',
      'hepsi -ieren gibi ge-siz olur',
      'hepsi sein kullanır',
    ],
    pronounce: ['gegessen'],
  }),
  pf('pf-urr-match-core', 'matching', 'medium', 'recognition', [URR_ES, URR_GK], {
    familyId: 'pf-urr-match',
    instruction: 'Düzensiz mastarı Partizip II ile eşleştir.',
    pairs: [
      { left: 'essen', right: 'gegessen' },
      { left: 'sprechen', right: 'gesprochen' },
      { left: 'treffen', right: 'getroffen' },
      { left: 'gehen', right: 'gegangen' },
      { left: 'kommen', right: 'gekommen' },
      { left: 'lesen', right: 'gelesen' },
    ],
    pronounce: ['gegessen', 'gesprochen', 'getroffen', 'gegangen', 'gekommen', 'gelesen'],
  }),
  pf('pf-urr-gegessen-fill', 'fill-blank', 'easy', 'recall', [URR_ES], {
    familyId: 'pf-urr-gegessen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'essen → ___',
    answer: 'gegessen',
    validation: EXACT,
    pronounce: ['gegessen'],
  }),
  pf('pf-urr-gegangen-fill', 'fill-blank', 'easy', 'recall', [URR_GK], {
    familyId: 'pf-urr-gegangen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'gehen → ___',
    answer: 'gegangen',
    validation: EXACT,
    pronounce: ['gegangen'],
  }),
  pf('pf-urr-gekommen-fill', 'fill-blank', 'easy', 'recall', [URR_GK], {
    familyId: 'pf-urr-gekommen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'kommen → ___',
    answer: 'gekommen',
    validation: EXACT,
    pronounce: ['gekommen'],
  }),
  pf('pf-urr-gesprochen-fill', 'fill-blank', 'medium', 'recall', [URR_ES], {
    familyId: 'pf-urr-gesprochen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'sprechen → ___ (Partizip II)',
    answer: 'gesprochen',
    validation: EXACT,
    pronounce: ['gesprochen'],
  }),
  pf('pf-urr-getroffen-fill', 'fill-blank', 'medium', 'recall', [URR_ES], {
    familyId: 'pf-urr-getroffen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'treffen → ___',
    answer: 'getroffen',
    validation: EXACT,
    pronounce: ['getroffen'],
  }),
  pf('pf-urr-gelesen-fill', 'fill-blank', 'medium', 'recall', [URR_ES], {
    familyId: 'pf-urr-gelesen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'lesen → ___',
    answer: 'gelesen',
    validation: EXACT,
    pronounce: ['gelesen'],
  }),
  pf('pf-urr-begonnen-fill', 'fill-blank', 'medium', 'recall', [URR_GK], {
    familyId: 'pf-urr-begonnen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'beginnen → ___',
    answer: 'begonnen',
    validation: EXACT,
    pronounce: ['begonnen'],
  }),
  pf('pf-urr-gewaschen-fill', 'fill-blank', 'medium', 'recall', [URR_ES, G_SAB], {
    familyId: 'pf-urr-gewaschen',
    instruction: 'Partizip II’yi yaz:',
    prompt: 'waschen → ___',
    answer: 'gewaschen',
    validation: EXACT,
    pronounce: ['gewaschen'],
  }),
  pf('pf-urr-gegessen-free', 'free-text', 'hard', 'production', [URR_ES, HABEN_S], {
    familyId: 'pf-urr-gegessen-cumle',
    secondaryTopicIds: [T.dailyRoutine],
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Öğle yemeği yedim. → ______',
    answer: 'Ich habe zu Mittag gegessen.',
    validation: DE,
    pronounce: ['Ich habe zu Mittag gegessen.'],
  }),
  pf('pf-urr-gelesen-free', 'free-text', 'hard', 'production', [URR_ES, HABEN_S], {
    familyId: 'pf-urr-gelesen-cumle',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Akşam bir kitap okudum. → ______',
    answer: 'Ich habe am Abend ein Buch gelesen.',
    validation: DE,
    pronounce: ['Ich habe am Abend ein Buch gelesen.'],
  }),
  pf('pf-urr-getroffen-free', 'free-text', 'hard', 'production', [URR_ES, HABEN_S], {
    familyId: 'pf-urr-getroffen-cumle',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün arkadaşlarımla buluştum. → ______',
    answer: 'Ich habe gestern meine Freunde getroffen.',
    validation: DE,
    pronounce: ['Ich habe gestern meine Freunde getroffen.'],
  }),
  pf('pf-urr-gesprochen-mc', 'multiple-choice', 'medium', 'recognition', [URR_ES], {
    familyId: 'pf-urr-gesprochen-mc',
    instruction: 'Doğru Partizip II hangisi? — sprechen',
    prompt: 'sprechen → ?',
    answer: 'gesprochen',
    options: ['gesprochen', 'gesprecht', 'gespracht', 'gesprechen'],
    pronounce: ['gesprochen'],
  }),

  /* ================================================================
   * J. Perfekt ile soru (10)
   * ================================================================ */
  pf('pf-q-kural-mc', 'multiple-choice', 'easy', 'recognition', [Q_YN], {
    familyId: 'pf-q-kural',
    instruction: 'Perfekt sorusunda kelime sırası nasıldır?',
    prompt: 'Du hast Sport gemacht. → ?',
    answer: 'Hast du Sport gemacht? (yardımcı fiil başa gelir)',
    options: [
      'Hast du Sport gemacht? (yardımcı fiil başa gelir)',
      'Du hast Sport gemacht? (sıra değişmez)',
      'Gemacht du hast Sport? (Partizip başa gelir)',
      'Du gemacht hast Sport? (hepsi karışır)',
    ],
    pronounce: ['Hast du Sport gemacht?'],
  }),
  pf('pf-q-hast-fill', 'fill-blank', 'easy', 'recall', [Q_YN, HABEN_C], {
    familyId: 'pf-q-hast',
    instruction: 'Soruyu tamamla — Spor yaptın mı?',
    prompt: '___ du Sport gemacht?',
    answer: 'Hast',
    acceptedAnswers: ['hast'],
    validation: EXACT,
    pronounce: ['Hast du Sport gemacht?'],
  }),
  pf('pf-q-bist-fill', 'fill-blank', 'easy', 'recall', [Q_YN, SEIN_C], {
    familyId: 'pf-q-bist',
    instruction: 'Soruyu tamamla — Okula gittin mi?',
    prompt: '___ du zur Schule gegangen?',
    answer: 'Bist',
    acceptedAnswers: ['bist'],
    validation: EXACT,
    pronounce: ['Bist du zur Schule gegangen?'],
  }),
  pf('pf-q-transform-sport', 'free-text', 'medium', 'production', [Q_YN], {
    familyId: 'pf-q-transform',
    instruction: 'Cümleyi soruya çevir:',
    prompt: 'Du hast Sport gemacht. → ______',
    answer: 'Hast du Sport gemacht?',
    validation: DE,
    pronounce: ['Hast du Sport gemacht?'],
  }),
  pf('pf-q-transform-schule', 'free-text', 'medium', 'production', [Q_YN], {
    familyId: 'pf-q-transform-schule',
    instruction: 'Cümleyi soruya çevir:',
    prompt: 'Du bist zur Schule gegangen. → ______',
    answer: 'Bist du zur Schule gegangen?',
    validation: DE,
    pronounce: ['Bist du zur Schule gegangen?'],
  }),
  pf('pf-q-was-fill', 'fill-blank', 'medium', 'recall', [Q_WAS], {
    familyId: 'pf-q-was',
    instruction: 'Merkez soruyu tamamla — Dün ne yaptın?',
    prompt: 'Was ___ du gestern gemacht?',
    answer: 'hast',
    validation: EXACT,
    pronounce: ['Was hast du gestern gemacht?'],
  }),
  pf('pf-q-was-free', 'free-text', 'medium', 'production', [Q_WAS], {
    familyId: 'pf-q-was-free',
    instruction: 'Soruyu Almanca yaz — Dün ne yaptın?',
    prompt: 'Dün ne yaptın? → ______',
    answer: 'Was hast du gestern gemacht?',
    validation: DE,
    pronounce: ['Was hast du gestern gemacht?'],
  }),
  pf('pf-q-wann-free', 'free-text', 'hard', 'production', [Q_WAS, Z_UM], {
    familyId: 'pf-q-wann',
    secondaryTopicIds: [T.time],
    instruction: 'Soruyu Almanca yaz — Saat kaçta kalktın?',
    prompt: 'Ne zaman kalktın? → ______',
    answer: 'Wann bist du aufgestanden?',
    validation: DE,
    pronounce: ['Wann bist du aufgestanden?'],
  }),
  pf('pf-q-dialog-hausaufgaben', 'free-text', 'hard', 'production', [Q_WAS, HABEN_S], {
    familyId: 'pf-q-dialog',
    instruction: 'Mini diyalog: B ne demeli?',
    prompt: 'A: Was hast du gestern gemacht?\nB: ______',
    answer: 'Ich habe meine Hausaufgaben gemacht.',
    validation: DE,
    openEnded: true,
    sampleAnswer: 'Ich habe meine Hausaufgaben gemacht.',
    pronounce: ['Ich habe meine Hausaufgaben gemacht.'],
  }),
  pf('pf-q-listen-was', 'listen-choice', 'medium', 'recognition', [Q_WAS], {
    familyId: 'pf-q-listen',
    instruction: 'Duyduğun soruyu seç:',
    prompt: 'Was hast du gestern gemacht?',
    audioText: 'Was hast du gestern gemacht?',
    answer: 'Was hast du gestern gemacht?',
    options: ['Was hast du gestern gemacht?', 'Was machst du gestern?', 'Was hast du heute gemacht?', 'Was bist du gestern gemacht?'],
    audio: listen('Was hast du gestern gemacht?'),
  }),

  /* ================================================================
   * K. Olumsuz Perfekt (8)
   * ================================================================ */
  pf('pf-neg-nicht-mc', 'multiple-choice', 'easy', 'recognition', [NEG_N], {
    familyId: 'pf-neg-nicht-mc',
    instruction: 'Doğru olumsuz cümle hangisi? — Babam dün çalışmadı.',
    prompt: 'Mein Vater hat gestern gearbeitet. → olumsuz?',
    answer: 'Mein Vater hat gestern nicht gearbeitet.',
    options: [
      'Mein Vater hat gestern nicht gearbeitet.',
      'Mein Vater hat gestern gearbeitet nicht.',
      'Mein Vater nicht hat gestern gearbeitet.',
      'Mein Vater hat nicht gestern gearbeitet nicht.',
    ],
    pronounce: ['Mein Vater hat gestern nicht gearbeitet.'],
  }),
  pf('pf-neg-kein-mc', 'multiple-choice', 'easy', 'recognition', [NEG_K], {
    familyId: 'pf-neg-kein-mc',
    instruction: 'Doğru olumsuz cümle hangisi? — Müzik dinlemedim.',
    prompt: 'Ich habe Musik gehört. → olumsuz (kein)?',
    answer: 'Ich habe keine Musik gehört.',
    options: [
      'Ich habe keine Musik gehört.',
      'Ich habe nicht Musik gehört.',
      'Ich habe kein Musik gehört.',
      'Ich keine habe Musik gehört.',
    ],
    pronounce: ['Ich habe keine Musik gehört.'],
  }),
  pf('pf-neg-nicht-free', 'free-text', 'hard', 'production', [NEG_N], {
    familyId: 'pf-neg-nicht',
    instruction: 'Olumsuza çevir:',
    prompt: 'Mein Vater hat gestern gearbeitet. → ______',
    answer: 'Mein Vater hat gestern nicht gearbeitet.',
    validation: DE,
    pronounce: ['Mein Vater hat gestern nicht gearbeitet.'],
  }),
  pf('pf-neg-kein-free', 'free-text', 'medium', 'production', [NEG_K], {
    familyId: 'pf-neg-kein',
    instruction: 'Olumsuza çevir:',
    prompt: 'Ich habe Musik gehört. → ______',
    answer: 'Ich habe keine Musik gehört.',
    validation: DE,
    pronounce: ['Ich habe keine Musik gehört.'],
  }),
  pf('pf-neg-schule-free', 'free-text', 'hard', 'production', [NEG_N, SEIN_S], {
    familyId: 'pf-neg-schule',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün okula gitmedim. → ______',
    answer: 'Ich bin gestern nicht zur Schule gegangen.',
    validation: DE,
    pronounce: ['Ich bin gestern nicht zur Schule gegangen.'],
  }),
  pf('pf-neg-arbeiten-fill', 'fill-blank', 'easy', 'recall', [NEG_N, ET], {
    familyId: 'pf-neg-arbeiten',
    instruction: 'Olumsuzluğu yaz — Dün çalışmadım.',
    prompt: 'Ich habe gestern ___ gearbeitet. (nicht)',
    answer: 'nicht',
    validation: EXACT,
    pronounce: ['Ich habe gestern nicht gearbeitet.'],
  }),
  pf('pf-neg-wb-kein', 'word-bank-translation', 'medium', 'production', [NEG_K], {
    familyId: 'pf-neg-wb',
    instruction: 'Kutucuklarla kur — Müzik dinlemedim.',
    answer: 'Ich habe keine Musik gehört.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Müzik dinlemedim.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'keine', 'Musik', 'gehört.', 'nicht', 'kein'),
      acceptedSequences: [['Ich', 'habe', 'keine', 'Musik', 'gehört.']],
    },
    pronounce: ['Ich habe keine Musik gehört.'],
  }),
  pf('pf-neg-error-nicht-stelle', 'error-correction', 'medium', 'correction', [NEG_N], {
    familyId: 'pf-neg-error',
    instruction: '`nicht` yanlış yerde — cümleyi düzelt:',
    prompt: 'Mein Vater hat nicht gestern gearbeitet.',
    answer: 'Mein Vater hat gestern nicht gearbeitet.',
    explanation: '`nicht` zaman bilgisinden sonra, Partizip II’den önce gelir.',
    pronounce: ['Mein Vater hat gestern nicht gearbeitet.'],
  }),

  /* ================================================================
   * L. Şimdiki zaman ↔ Perfekt + Gestern üretimi (20)
   * ================================================================ */
  pf('pf-pres-sport-free', 'free-text', 'hard', 'production', [FORMULA_EX], {
    familyId: 'pf-pres-sport',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich mache Sport. → ______',
    answer: 'Ich habe Sport gemacht.',
    validation: DE,
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-pres-schule-free', 'free-text', 'hard', 'production', [SEIN_S], {
    familyId: 'pf-pres-schule',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich gehe zur Schule. → ______',
    answer: 'Ich bin zur Schule gegangen.',
    validation: DE,
    pronounce: ['Ich bin zur Schule gegangen.'],
  }),
  pf('pf-pres-hausaufgaben-free', 'free-text', 'medium', 'production', [HABEN_S], {
    familyId: 'pf-pres-haus',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich mache meine Hausaufgaben. → ______',
    answer: 'Ich habe meine Hausaufgaben gemacht.',
    validation: DE,
    pronounce: ['Ich habe meine Hausaufgaben gemacht.'],
  }),
  pf('pf-pres-aufstehen-free', 'free-text', 'medium', 'production', [TRENN_AUF], {
    familyId: 'pf-pres-auf7',
    instruction: 'Şimdiki zamandan geçmişe çevir:',
    prompt: 'Ich stehe um 7 Uhr auf. → ______',
    answer: 'Ich bin um 7 Uhr aufgestanden.',
    validation: DE,
    pronounce: ['Ich bin um 7 Uhr aufgestanden.'],
  }),
  pf('pf-rev-perfekt-present', 'free-text', 'medium', 'production', [FORMULA_EX], {
    familyId: 'pf-rev-present',
    instruction: 'Geçmişten şimdiki zamana çevir (tanıma):',
    prompt: 'Ich habe Sport gemacht. → ______',
    answer: 'Ich mache Sport.',
    validation: DE,
    pronounce: ['Ich mache Sport.'],
  }),
  pf('pf-tr-odev-free', 'free-text', 'hard', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-tr-odev',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün ödevimi yaptım. → ______',
    answer: 'Ich habe gestern meine Hausaufgaben gemacht.',
    validation: DE,
    pronounce: ['Ich habe gestern meine Hausaufgaben gemacht.'],
  }),
  pf('pf-tr-kalktim-free', 'free-text', 'hard', 'production', [TRENN_AUF, Z_UM], {
    familyId: 'pf-tr-kalktim',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Dün saat 8’de kalktım. → ______',
    answer: 'Ich bin gestern um 8 Uhr aufgestanden.',
    validation: DE,
    pronounce: ['Ich bin gestern um 8 Uhr aufgestanden.'],
  }),
  pf('pf-tr-muzik-wb', 'word-bank-translation', 'medium', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-tr-muzik',
    instruction: 'Kutucuklarla kur — Dün müzik dinledim.',
    answer: 'Ich habe gestern Musik gehört.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Dün müzik dinledim.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'gestern', 'Musik', 'gehört.', 'höre', 'gehört'),
      acceptedSequences: [['Ich', 'habe', 'gestern', 'Musik', 'gehört.']],
    },
    pronounce: ['Ich habe gestern Musik gehört.'],
  }),
  pf('pf-tr-odev-wb', 'word-bank-translation', 'medium', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-tr-odev-wb',
    instruction: 'Kutucuklarla kur — Dün ödevimi yaptım.',
    answer: 'Ich habe gestern meine Hausaufgaben gemacht.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Dün ödevimi yaptım.', targetLanguage: 'de',
      tokens: tok('Ich', 'habe', 'gestern', 'meine', 'Hausaufgaben', 'gemacht.', 'mache'),
      acceptedSequences: [['Ich', 'habe', 'gestern', 'meine', 'Hausaufgaben', 'gemacht.']],
    },
    pronounce: ['Ich habe gestern meine Hausaufgaben gemacht.'],
  }),
  pf('pf-detr-sport-wb', 'word-bank-translation', 'easy', 'recognition', [FORMULA_EX], {
    familyId: 'pf-detr-sport',
    instruction: 'Almancadan Türkçeye kutucuklarla kur:',
    answer: 'Spor yaptım.',
    wordBank: {
      direction: 'de-to-tr', sourceText: 'Ich habe Sport gemacht.', targetLanguage: 'tr',
      tokens: tok('Spor', 'yaptım.', 'yapıyorum.', 'yaptın'),
      acceptedSequences: [['Spor', 'yaptım.']],
    },
    audio: listen('Ich habe Sport gemacht.'),
    pronounce: ['Ich habe Sport gemacht.'],
  }),
  pf('pf-sb-hausaufgaben', 'sentence-builder', 'hard', 'production', [HABEN_S], {
    familyId: 'pf-sb-haus',
    instruction: 'Cümleyi kur:',
    prompt: 'Ödevimi yaptım.',
    answer: 'Ich habe meine Hausaufgaben gemacht.',
    pronounce: ['Ich habe meine Hausaufgaben gemacht.'],
  }),
  pf('pf-sb-schule', 'sentence-builder', 'hard', 'production', [SEIN_S], {
    familyId: 'pf-sb-schule',
    instruction: 'Cümleyi kur:',
    prompt: 'Okula gittim.',
    answer: 'Ich bin zur Schule gegangen.',
    pronounce: ['Ich bin zur Schule gegangen.'],
  }),
  pf('pf-gestern-order-day', 'ordering', 'medium', 'production', [G_TAM, Z_GEST], {
    familyId: 'pf-gestern-order',
    instruction: 'Günü mantıklı sıraya diz (sabah → gece):',
    prompt: 'Ich bin ins Bett gegangen. / Ich habe gefrühstückt. / Ich bin aufgestanden. / Ich bin zur Schule gegangen.',
    answer: 'Ich bin aufgestanden. Ich habe gefrühstückt. Ich bin zur Schule gegangen. Ich bin ins Bett gegangen.',
    pronounce: ['Ich bin aufgestanden. Ich habe gefrühstückt.'],
  }),
  pf('pf-gestern-timeline-free', 'free-text', 'hard', 'production', [Z_UM, G_TAM], {
    familyId: 'pf-gestern-timeline',
    instruction: 'Zaman çizelgesine göre yaz — 07:00 aufstehen:',
    prompt: '07:00 + aufstehen → ______',
    answer: 'Um 7 Uhr bin ich aufgestanden.',
    acceptedAnswers: ['Ich bin um 7 Uhr aufgestanden.'],
    validation: DE,
    hint: 'Saat başa gelirse fiil ikinci sırada kalır: Um 7 Uhr bin ich …',
    pronounce: ['Ich bin um 7 Uhr aufgestanden.'],
  }),
  pf('pf-gestern-mini-cards', 'free-text', 'hard', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-gestern-cards',
    instruction: 'Karttaki durumla cümle kur — Ahmet + Hausaufgaben + gestern:',
    prompt: 'Ahmet + Hausaufgaben + gestern → ______',
    answer: 'Ahmet hat gestern seine Hausaufgaben gemacht.',
    validation: DE,
    pronounce: ['Ahmet hat gestern seine Hausaufgaben gemacht.'],
  }),
  pf('pf-gestern-mutter-card', 'free-text', 'hard', 'production', [HABEN_S, Z_GEST], {
    familyId: 'pf-gestern-mutter',
    instruction: 'Karttaki durumla cümle kur — Mutter + gestern Abend + kochen:',
    prompt: 'Meine Mutter + gestern Abend + kochen → ______',
    answer: 'Meine Mutter hat gestern Abend gekocht.',
    validation: DE,
    pronounce: ['Meine Mutter hat gestern Abend gekocht.'],
  }),
  pf('pf-dictation-musik', 'dictation', 'medium', 'production', [HABEN_S], {
    familyId: 'pf-dictation-musik',
    instruction: 'Müzik cümlesini duydun — aynen yaz:',
    audioText: 'Ich habe gestern Abend Musik gehört.',
    answer: 'Ich habe gestern Abend Musik gehört.',
    audio: listen('Ich habe gestern Abend Musik gehört.'),
    validation: DE,
    pronounce: ['Ich habe gestern Abend Musik gehört.'],
  }),
  pf('pf-dictation-aufgestanden', 'dictation', 'hard', 'production', [TRENN_AUF, Z_UM], {
    familyId: 'pf-dictation-auf',
    instruction: 'Kalkış cümlesini duydun — aynen yaz:',
    audioText: 'Ich bin gestern um sieben Uhr aufgestanden.',
    answer: 'Ich bin gestern um sieben Uhr aufgestanden.',
    audio: listen('Ich bin gestern um sieben Uhr aufgestanden.'),
    validation: DE,
    pronounce: ['Ich bin gestern um sieben Uhr aufgestanden.'],
  }),
  pf('pf-spoken-gestern', 'spoken', 'hard', 'speaking', [G_URE, Q_WAS], {
    familyId: 'pf-spoken-gestern',
    instruction: 'Sesli görev: dün ne yaptığını üç cümleyle anlat.',
    requirements: ['Was hast du gestern gemacht?', 'En az üç Perfekt cümlesi kur.', 'Partizip II sonda olsun.'],
    sampleAnswer: 'Ich bin um sieben Uhr aufgestanden. Ich habe gefrühstückt. Ich habe meine Hausaufgaben gemacht.',
    pronounce: ['Was hast du gestern gemacht?'],
  }),
  pf('pf-gestern-free-tam-anlatim', 'free-text', 'hard', 'production', [G_URE, G_TAM, G_SAB, Q_WAS, Z_UM], {
    familyId: 'pf-gestern-anlatim',
    instruction: 'Dününü Almanca anlat (Was hast du gestern gemacht?). En az sekiz kısa cümle yaz — ipuçları aşağıda.',
    prompt: 'Aufstehen:\nFrühstück:\nSchule:\nNach Hause:\nHausaufgaben:\nFreunde:\nAbend:\nBett:',
    hint: 'Her cümlede yardımcı fiil ikinci sırada, Partizip II en sonda olsun.',
    answer: 'Gestern bin ich um sieben Uhr aufgestanden. Ich habe meine Zähne geputzt. Ich habe mein Gesicht gewaschen. Ich habe geduscht. Ich habe gefrühstückt. Dann bin ich zur Schule gegangen. Ich habe Deutsch gelernt. Danach bin ich nach Hause zurückgekommen. Ich habe meine Hausaufgaben gemacht. Am Abend habe ich ein Buch gelesen. Dann bin ich ins Bett gegangen.',
    validation: DE,
    openEnded: true,
    sampleAnswer: 'Gestern bin ich um sieben Uhr aufgestanden. Ich habe meine Zähne geputzt. Ich habe mein Gesicht gewaschen. Ich habe geduscht. Ich habe gefrühstückt. Dann bin ich zur Schule gegangen. Ich habe Deutsch gelernt. Danach bin ich nach Hause zurückgekommen. Ich habe meine Hausaufgaben gemacht. Am Abend habe ich ein Buch gelesen. Dann bin ich ins Bett gegangen.',
    explanation: 'Kanonik A1 model: dokuz kısa cümle, haben/sein + Partizip II sonda, saatler um ile.',
    pronounce: ['Gestern bin ich um sieben Uhr aufgestanden.', 'Was hast du gestern gemacht?'],
  }),
];
