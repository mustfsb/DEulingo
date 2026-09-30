/**
 * Present Perfect — karşıtlık, düzeltme, dinleme ve üretim bankası, bölüm 3.
 *
 * F. Present Perfect vs Simple Past (14) · H. hata düzeltme (8) ·
 * I. dinleme/dikte (8) · J. kişisel üretim (6) · K. yazma (2)
 */

import { EN, listenEn, pp } from './helpers.ts';
import type { Exercise } from '../types.ts';

const VSTIME = 'pp.vs-past.time-words';
const VSEXP = 'pp.vs-past.experience-count';
const FORMULA = 'pp.formula.core';
const MISTV3 = 'pp.mistakes.v3';
const MISTFS = 'pp.mistakes.for-since';
const NEG = 'pp.neg.havent';
const Q = 'pp.q.have-has';
const EVER = 'pp.ever-never.use';
const STATES = 'pp.states.know-live';
const FORSINCE_S = 'pp.for-since.states';
const TABLE = 'pp.have-has.table';

export const EN_EXERCISES_CONTRAST: Exercise[] = [
  /* ================================================================
   * F. Present Perfect vs Simple Past (14)
   * ================================================================ */
  pp('en-pp-vs-mc-yesterday', 'multiple-choice', 'easy', 'recognition', [VSTIME], {
    familyId: 'en-pp-vs-yesterday',
    instruction: 'Bitmiş zaman (yesterday) hangisini ister?',
    prompt: 'I ___ this film yesterday. (saw / have seen)',
    answer: 'saw',
    options: ['saw', 'have seen'],
    explanation: 'yesterday bitmiş zamandır → Simple Past.',
  }),
  pp('en-pp-vs-mc-three-times', 'multiple-choice', 'easy', 'recognition', [VSEXP], {
    familyId: 'en-pp-vs-three-times',
    instruction: 'Deneyim sayarken (three times) hangisi doğrudur?',
    prompt: 'I ___ this film three times. (saw / have seen)',
    answer: 'have seen',
    options: ['saw', 'have seen'],
    explanation: 'Kaç kez sorusu deneyimdir → Present Perfect.',
  }),
  pp('en-pp-vs-mc-since', 'multiple-choice', 'medium', 'recognition', [VSEXP, STATES], {
    familyId: 'en-pp-vs-since',
    instruction: 'Süregelen durum (since 2022) hangisini ister?',
    prompt: 'She ___ here since 2022. (lived / has lived)',
    answer: 'has lived',
    options: ['lived', 'has lived'],
  }),
  pp('en-pp-vs-mc-called', 'multiple-choice', 'easy', 'recognition', [VSTIME], {
    familyId: 'en-pp-vs-called',
    instruction: 'Bitmiş zaman hangisini ister?',
    prompt: 'He ___ me yesterday. (called / has called)',
    answer: 'called',
    options: ['called', 'has called'],
  }),
  pp('en-pp-vs-mc-been', 'multiple-choice', 'medium', 'recognition', [VSEXP, EVER], {
    familyId: 'en-pp-vs-been',
    instruction: 'Üç kez bulunmak (deneyim) hangisiyle anlatılır?',
    prompt: 'We ___ in Germany three times. (were / have been)',
    answer: 'have been',
    options: ['were', 'have been'],
  }),
  pp('en-pp-vs-mc-went', 'multiple-choice', 'easy', 'recognition', [VSTIME], {
    familyId: 'en-pp-vs-went',
    instruction: 'Bitmiş zaman hangisini ister?',
    prompt: 'They ___ home last night. (went / have gone)',
    answer: 'went',
    options: ['went', 'have gone'],
  }),
  pp('en-pp-vs-mc-tried', 'multiple-choice', 'medium', 'recognition', [VSEXP], {
    familyId: 'en-pp-vs-tried',
    instruction: 'İki kez denemek (deneyim) hangisiyle anlatılır?',
    prompt: 'I ___ sushi twice. (tried / have tried)',
    answer: 'have tried',
    options: ['tried', 'have tried'],
  }),
  pp('en-pp-vs-mc-already', 'multiple-choice', 'medium', 'recognition', [VSEXP, 'pp.markers.already-yet-just'], {
    familyId: 'en-pp-vs-already',
    instruction: 'already işareti hangisini ister?',
    prompt: 'She ___ her homework already. (finished / has finished)',
    answer: 'has finished',
    options: ['finished', 'has finished'],
  }),
  pp('en-pp-vs-err-yesterday', 'error-correction', 'medium', 'correction', [VSTIME], {
    familyId: 'en-pp-vs-err-yesterday',
    instruction: 'Zaman yanlış — cümleyi düzelt:',
    prompt: 'I have seen him yesterday.',
    answer: 'I saw him yesterday.',
    explanation: 'yesterday ile Present Perfect kullanılmaz → Simple Past.',
    validation: EN,
  }),
  pp('en-pp-vs-err-three-times', 'error-correction', 'medium', 'correction', [VSEXP], {
    familyId: 'en-pp-vs-err-three-times',
    instruction: 'Deneyim sayarken hangi zaman gerekir? — cümleyi düzelt:',
    prompt: 'I went to Germany three times.',
    answer: 'I have been to Germany three times.',
    explanation: 'Üç kez = deneyim sayısı → Present Perfect (have been to).',
    validation: EN,
  }),
  pp('en-pp-vs-err-since', 'error-correction', 'hard', 'correction', [VSEXP, STATES], {
    familyId: 'en-pp-vs-err-since',
    instruction: 'Süregelen durum — cümleyi düzelt:',
    prompt: 'She lived here since 2022.',
    answer: 'She has lived here since 2022.',
    explanation: 'since 2022 ile durum hâlâ sürüyor → Present Perfect.',
    validation: EN,
  }),
  pp('en-pp-vs-free-saw', 'free-text', 'hard', 'production', [VSTIME], {
    familyId: 'en-pp-vs-saw',
    instruction: 'Türkçeden İngilizceye çevir (zamana dikkat: dün!):',
    prompt: 'Onu dün gördüm. → ______',
    answer: 'I saw him yesterday.',
    validation: EN,
  }),
  pp('en-pp-vs-free-seen-times', 'free-text', 'hard', 'production', [VSEXP], {
    familyId: 'en-pp-vs-seen-times',
    instruction: 'Türkçeden İngilizceye çevir (kaç kez?):',
    prompt: 'Bu filmi üç kez gördüm. → ______',
    answer: 'I have seen this film three times.',
    acceptedAnswers: ["I've seen this film three times."],
    validation: EN,
  }),
  pp('en-pp-vs-free-lived-since', 'free-text', 'hard', 'production', [VSEXP, STATES], {
    familyId: 'en-pp-vs-lived-since',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: '2022’den beri burada yaşıyor. (She …) → ______',
    answer: 'She has lived here since 2022.',
    acceptedAnswers: ["She's lived here since 2022."],
    validation: EN,
  }),

  /* ================================================================
   * H. hata düzeltme (8)
   * ================================================================ */
  pp('en-pp-err-see', 'error-correction', 'medium', 'correction', [MISTV3, NEG], {
    familyId: 'en-pp-err-v3-see',
    instruction: 'V3 yanlış — cümleyi düzelt:',
    prompt: 'I have see it.',
    answer: 'I have seen it.',
    explanation: 'have sonrası HER ZAMAN V3: seen.',
    validation: EN,
  }),
  pp('en-pp-err-went', 'error-correction', 'hard', 'correction', [MISTV3], {
    familyId: 'en-pp-err-v3-went',
    instruction: 'V3 yanlış (went V2’dir) — cümleyi düzelt:',
    prompt: 'She has went home.',
    answer: 'She has gone home.',
    explanation: 'went V2’dir; V3 gone olur.',
    validation: EN,
  }),
  pp('en-pp-err-wrote', 'error-correction', 'hard', 'correction', [MISTV3], {
    familyId: 'en-pp-err-v3-wrote',
    instruction: 'V3 yanlış (wrote V2’dir) — cümleyi düzelt:',
    prompt: 'I have wrote an email.',
    answer: 'I have written an email.',
    explanation: 'wrote V2’dir; V3 written olur.',
    validation: EN,
  }),
  pp('en-pp-err-took', 'error-correction', 'hard', 'correction', [MISTV3], {
    familyId: 'en-pp-err-v3-took',
    instruction: 'V3 yanlış (took V2’dir) — cümleyi düzelt:',
    prompt: 'He has took the bus.',
    answer: 'He has taken the bus.',
    explanation: 'took V2’dir; V3 taken olur.',
    validation: EN,
  }),
  pp('en-pp-err-since-three', 'error-correction', 'medium', 'correction', [MISTFS], {
    familyId: 'en-pp-err-fs-since',
    instruction: 'for/since yanlış — cümleyi düzelt:',
    prompt: 'I have lived here since three years.',
    answer: 'I have lived here for three years.',
    explanation: 'Üç yıl SÜREDİR → for.',
    validation: EN,
  }),
  pp('en-pp-err-for-2024', 'error-correction', 'medium', 'correction', [MISTFS], {
    familyId: 'en-pp-err-fs-for',
    instruction: 'for/since yanlış — cümleyi düzelt:',
    prompt: 'I have studied English for 2024.',
    answer: 'I have studied English since 2024.',
    explanation: '2024 bir BAŞLANGIÇTIR → since.',
    validation: EN,
  }),
  pp('en-pp-err-ever-went', 'error-correction', 'hard', 'correction', [MISTV3, EVER], {
    familyId: 'en-pp-err-struct-went',
    instruction: 'Soruda V3 gerekir — cümleyi düzelt:',
    prompt: 'Have you ever went to Germany?',
    answer: 'Have you ever been to Germany?',
    explanation: 'Soruda da V3 gerekir: been.',
    validation: EN,
  }),
  pp('en-pp-err-havent-she', 'error-correction', 'easy', 'correction', [MISTV3, TABLE], {
    familyId: 'en-pp-err-struct-she',
    instruction: 'Yardımcı yanlış — cümleyi düzelt:',
    prompt: "She haven't finished.",
    answer: "She hasn't finished.",
    explanation: 'she ile has gelir: hasn\'t.',
    validation: EN,
  }),

  /* ================================================================
   * I. dinleme / dikte (8)
   * ================================================================ */
  pp('en-pp-listen-for-since', 'listen-choice', 'medium', 'recognition', [FORSINCE_S], {
    familyId: 'en-pp-listen-for-since',
    instruction: 'Dinle ve duyduğun cümleyi seç:',
    audioText: 'I have lived here for three years.',
    answer: 'I have lived here for three years.',
    options: [
      'I have lived here for three years.',
      'I have lived here since three years.',
      'I lived here for three years.',
      'I live here for three years.',
    ],
    audio: listenEn('I have lived here for three years.'),
  }),
  pp('en-pp-listen-havent', 'listen-choice', 'medium', 'recognition', [NEG], {
    familyId: 'en-pp-listen-havent',
    instruction: 'Dinle ve duyduğun cümleyi seç:',
    audioText: "She hasn't finished her homework yet.",
    answer: "She hasn't finished her homework yet.",
    options: [
      "She hasn't finished her homework yet.",
      'She haven\'t finished her homework yet.',
      'She has finished her homework yet.',
      'She didn\'t finish her homework yet.',
    ],
    audio: listenEn("She hasn't finished her homework yet."),
  }),
  pp('en-pp-listen-ever', 'listen-choice', 'medium', 'recognition', [Q, EVER], {
    familyId: 'en-pp-listen-ever',
    instruction: 'Dinle ve duyduğun soruyu seç:',
    audioText: 'Have you ever visited London?',
    answer: 'Have you ever visited London?',
    options: [
      'Have you ever visited London?',
      'Have you never visited London?',
      'Did you ever visit London?',
      'Has you ever visited London?',
    ],
    audio: listenEn('Have you ever visited London?'),
  }),
  pp('en-pp-listen-for-long', 'listen-choice', 'easy', 'recognition', [FORSINCE_S, STATES], {
    familyId: 'en-pp-listen-for-long',
    instruction: 'Dinle ve duyduğun cümleyi seç:',
    audioText: 'I have known him for a long time.',
    answer: 'I have known him for a long time.',
    options: [
      'I have known him for a long time.',
      'I have known him since a long time.',
      'I know him for a long time.',
      'I have knew him for a long time.',
    ],
    audio: listenEn('I have known him for a long time.'),
  }),
  pp('en-pp-listen-already', 'listen-choice', 'easy', 'recognition', ['pp.markers.already-yet-just'], {
    familyId: 'en-pp-listen-already',
    instruction: 'Dinle ve duyduğun cümleyi seç:',
    audioText: 'He has already eaten.',
    answer: 'He has already eaten.',
    options: [
      'He has already eaten.',
      'He have already eaten.',
      'He has already ate.',
      'He already eats.',
    ],
    audio: listenEn('He has already eaten.'),
  }),
  pp('en-pp-dict-never', 'dictation', 'hard', 'recall', [EVER], {
    familyId: 'en-pp-dict-never',
    instruction: 'Duyduğunu yaz:',
    audioText: "I've never been to Germany.",
    answer: "I've never been to Germany.",
    acceptedAnswers: ['I have never been to Germany.'],
    validation: EN,
    audio: listenEn("I've never been to Germany."),
  }),
  pp('en-pp-dict-yet', 'dictation', 'hard', 'recall', [NEG], {
    familyId: 'en-pp-dict-yet',
    instruction: 'Duyduğunu yaz:',
    audioText: "I haven't finished my homework yet.",
    answer: "I haven't finished my homework yet.",
    acceptedAnswers: ['I have not finished my homework yet.'],
    validation: EN,
    audio: listenEn("I haven't finished my homework yet."),
  }),
  pp('en-pp-dict-just', 'dictation', 'hard', 'recall', ['pp.markers.already-yet-just'], {
    familyId: 'en-pp-dict-just',
    instruction: 'Duyduğunu yaz:',
    audioText: "I've just finished my work.",
    answer: "I've just finished my work.",
    acceptedAnswers: ['I have just finished my work.'],
    validation: EN,
    audio: listenEn("I've just finished my work."),
  }),

  /* ================================================================
   * J. kişisel üretim — konuşma (6)
   * ================================================================ */
  pp('en-pp-say-studied', 'spoken', 'medium', 'speaking', [STATES], {
    familyId: 'en-pp-say-studied',
    instruction: 'Süreyle tamamla ve SESLİ söyle: I have studied English for …',
    prompt: 'I have studied English for ______.',
    requirements: ['have + studied', 'for + süre'],
    sampleAnswer: 'I have studied English for three years.',
  }),
  pp('en-pp-say-lived', 'spoken', 'medium', 'speaking', [STATES], {
    familyId: 'en-pp-say-lived',
    instruction: 'Tamamla ve SESLİ söyle: I have lived in … since …',
    prompt: 'I have lived in ______ since ______.',
    requirements: ['have + lived', 'since + başlangıç'],
    sampleAnswer: 'I have lived in Istanbul since 2020.',
  }),
  pp('en-pp-say-never', 'spoken', 'medium', 'speaking', [EVER], {
    familyId: 'en-pp-say-never',
    instruction: 'Gerçek bir deneyimini SESLİ söyle: I have never …',
    prompt: 'I have never ______.',
    requirements: ['have + never + V3'],
    sampleAnswer: 'I have never studied abroad.',
  }),
  pp('en-pp-say-already', 'spoken', 'hard', 'speaking', ['pp.markers.already-yet-just'], {
    familyId: 'en-pp-say-already',
    instruction: 'Bugün yaptığın bir şeyi SESLİ söyle: I have already … today.',
    prompt: 'I have already ______ today.',
    requirements: ['have + already + V3'],
    sampleAnswer: 'I have already finished my homework today.',
  }),
  pp('en-pp-say-yet', 'spoken', 'hard', 'speaking', [NEG], {
    familyId: 'en-pp-say-yet',
    instruction: 'Henüz yapmadığın bir şeyi SESLİ söyle: I haven’t … yet.',
    prompt: "I haven't ______ yet.",
    requirements: ["haven't + V3", 'cümle sonunda yet'],
    sampleAnswer: "I haven't finished my project yet.",
  }),
  pp('en-pp-say-ever', 'spoken', 'hard', 'speaking', [Q, EVER], {
    familyId: 'en-pp-say-ever',
    instruction: 'Gerçek bir soru kur ve SESLİ sor: Have you ever …?',
    prompt: 'Have you ever ______?',
    requirements: ['Have + özne + ever + V3'],
    sampleAnswer: 'Have you ever been to Germany?',
  }),

  /* ================================================================
   * K. yazma (2)
   * ================================================================ */
  pp('en-pp-write-experience', 'free-text', 'hard', 'production', [FORMULA, FORSINCE_S, EVER], {
    familyId: 'en-pp-write-experience',
    instruction: 'My Experience So Far — 8–10 cümle yaz (hepsi Present Perfect).',
    prompt: 'My Experience So Far: hayatından, projelerinden, İngilizcenden bahset.',
    openEnded: true,
    requirements: [
      'En az 2 for/since cümlesi',
      'En az 2 düzensiz V3 (seen, known, written …)',
      'En az 1 never cümlesi',
      'En az 1 already/yet cümlesi',
    ],
    sampleAnswer: 'I have studied English for three years. I have known my best friend since 2022. I have never studied abroad. I have already finished three software projects. I have seen many English films. I have lived in the same city since I was a child. I have just started a new project. I have not improved my writing yet.',
    validation: EN,
    explanation: 'Her cümlede have/has + V3 iskeletini kontrol et; for/since seçimini yazmadan önce sor: süre mi, başlangıç mı?',
  }),
  pp('en-pp-write-journey', 'free-text', 'hard', 'production', [STATES, FORSINCE_S, NEG], {
    familyId: 'en-pp-write-journey',
    instruction: 'My English Learning Journey — yaklaşık 120–150 kelime yaz.',
    prompt: 'Ne kadar süredir çalıştığın, neler öğrendiğin, neyin zor geldiği, neyi henüz geliştiremediğin ve sırada ne olduğu.',
    openEnded: true,
    requirements: [
      'Ne kadar süredir çalıştığın (for/since)',
      'Neler öğrendiğin (Present Perfect)',
      'Neyi henüz geliştiremediğin (haven’t … yet)',
      'Sırada ne olduğu',
    ],
    sampleAnswer: 'I have studied English for three years. I have learned many new words and I have improved my reading. Grammar has been difficult for me. I have not improved my writing yet, but I have just started writing short texts. I have never spoken with a native speaker. I want to improve my speaking next.',
    validation: EN,
    explanation: 'Resmî makale yapısı gerekmez; hedef cümle kalitesidir. Her cümlede have/has + V3 kullanmaya çalış.',
  }),
];
