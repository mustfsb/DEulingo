/**
 * Present Perfect — üretim alıştırma bankası, bölüm 2.
 *
 * D. olumsuz/soru (15) · E. ever/never/already/yet/just (15) ·
 * G. Türkçe → İngilizce (22)
 */

import { EN, EXACT_EN, answerEn, pp, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const NEG = 'pp.neg.havent';
const Q = 'pp.q.have-has';
const QSHORT = 'pp.q.short-answers';
const EVER = 'pp.ever-never.use';
const MARK = 'pp.markers.already-yet-just';
const FORMULA = 'pp.formula.core';
const TABLE = 'pp.have-has.table';
const V3 = 'pp.v3.irregular-core';
const STATES = 'pp.states.know-live';
const FORSINCE_S = 'pp.for-since.states';

export const EN_EXERCISES_PRODUCTION: Exercise[] = [
  /* ================================================================
   * D. olumsuz / soru (15)
   * ================================================================ */
  pp('en-pp-neg-mc-i', 'multiple-choice', 'easy', 'recognition', [NEG], {
    familyId: 'en-pp-neg-mc',
    instruction: 'Doğru olumsuz cümle hangisi? — Bitirdim.',
    prompt: 'I have finished. → olumsuz?',
    answer: "I haven't finished.",
    options: ["I haven't finished.", 'I have finished not.', 'I not have finished.', 'I haven finished.'],
  }),
  pp('en-pp-neg-mc-she', 'multiple-choice', 'easy', 'recognition', [NEG], {
    familyId: 'en-pp-neg-mc',
    instruction: 'Doğru olumsuz cümle hangisi? — Bitirdi.',
    prompt: 'She has finished. → olumsuz?',
    answer: "She hasn't finished.",
    options: ["She hasn't finished.", 'She haven\'t finished.', 'She has finished not.', 'She hasn finished.'],
  }),
  pp('en-pp-neg-free-homework', 'free-text', 'hard', 'production', [NEG], {
    familyId: 'en-pp-neg-homework',
    instruction: 'Olumsuza çevir:',
    prompt: 'I have finished my homework. → ______',
    answer: "I haven't finished my homework.",
    acceptedAnswers: ['I have not finished my homework.'],
    validation: EN,
    audio: answerEn("I haven't finished my homework."),
  }),
  pp('en-pp-neg-free-she', 'free-text', 'medium', 'production', [NEG], {
    familyId: 'en-pp-neg-she',
    instruction: 'Olumsuza çevir:',
    prompt: 'She has finished. → ______',
    answer: "She hasn't finished.",
    acceptedAnswers: ['She has not finished.'],
    validation: EN,
  }),
  pp('en-pp-neg-free-they', 'free-text', 'medium', 'production', [NEG], {
    familyId: 'en-pp-neg-they',
    instruction: 'Olumsuza çevir:',
    prompt: 'They have seen this film. → ______',
    answer: "They haven't seen this film.",
    acceptedAnswers: ['They have not seen this film.'],
    validation: EN,
  }),
  pp('en-pp-q-free-film', 'free-text', 'medium', 'production', [Q], {
    familyId: 'en-pp-q-film',
    instruction: 'Cümleyi soruya çevir:',
    prompt: 'You have seen this film. → ______',
    answer: 'Have you seen this film?',
    validation: EN,
    audio: answerEn('Have you seen this film?'),
  }),
  pp('en-pp-q-free-she', 'free-text', 'medium', 'production', [Q], {
    familyId: 'en-pp-q-she',
    instruction: 'Cümleyi soruya çevir:',
    prompt: 'She has finished. → ______',
    answer: 'Has she finished?',
    validation: EN,
  }),
  pp('en-pp-q-free-they', 'free-text', 'hard', 'production', [Q], {
    familyId: 'en-pp-q-they',
    instruction: 'Cümleyi soruya çevir:',
    prompt: 'They have lived here since 2020. → ______',
    answer: 'Have they lived here since 2020?',
    validation: EN,
  }),
  pp('en-pp-q-mc-short-yes', 'multiple-choice', 'easy', 'recognition', [QSHORT], {
    familyId: 'en-pp-q-short',
    instruction: 'Olumlu kısa cevap hangisi?',
    prompt: 'Have you seen this film? → ______',
    answer: 'Yes, I have.',
    options: ['Yes, I have.', 'Yes, I have seen.', 'Yes, I do.', 'Yes, I has.'],
  }),
  pp('en-pp-q-mc-short-no', 'multiple-choice', 'easy', 'recognition', [QSHORT], {
    familyId: 'en-pp-q-short',
    instruction: 'Olumsuz kısa cevap hangisi?',
    prompt: 'Has she finished? → ______',
    answer: "No, she hasn't.",
    options: ["No, she hasn't.", 'No, she haven\'t.', 'No, she has not finished.', 'No, she don\'t.'],
  }),
  pp('en-pp-q-fill-have', 'fill-blank', 'easy', 'recall', [Q], {
    familyId: 'en-pp-q-have',
    instruction: 'Soruyu tamamla — Hiç Almanya’da bulundun mu?',
    prompt: '___ you ever been to Germany? (Have …)',
    answer: 'Have',
    acceptedAnswers: ['have'],
    validation: EXACT_EN,
  }),
  pp('en-pp-q-fill-has', 'fill-blank', 'easy', 'recall', [Q], {
    familyId: 'en-pp-q-has',
    instruction: 'Soruyu tamamla — Ödevini bitirdi mi?',
    prompt: '___ she finished her homework? (Has …)',
    answer: 'Has',
    acceptedAnswers: ['has'],
    validation: EXACT_EN,
  }),
  pp('en-pp-q-wb-film', 'word-bank-translation', 'medium', 'production', [Q], {
    familyId: 'en-pp-q-wb',
    instruction: 'Kutucuklarla kur — Bu filmi gördün mü?',
    answer: 'Have you seen this film?',
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Bu filmi gördün mü?', targetLanguage: 'en',
      tokens: tok('Have', 'you', 'seen', 'this', 'film?', 'Has', 'see', 'saw'),
      acceptedSequences: [['Have', 'you', 'seen', 'this', 'film?']],
    },
  }),
  pp('en-pp-neg-wb-homework', 'word-bank-translation', 'medium', 'production', [NEG], {
    familyId: 'en-pp-neg-wb',
    instruction: 'Kutucuklarla kur — Ödevimi bitirmedim.',
    answer: "I haven't finished my homework.",
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Ödevimi bitirmedim.', targetLanguage: 'en',
      tokens: tok('I', "haven't", 'finished', 'my', 'homework.', "hasn't", 'finish', 'not'),
      acceptedSequences: [['I', "haven't", 'finished', 'my', 'homework.']],
    },
  }),
  pp('en-pp-q-free-ever-germany', 'free-text', 'hard', 'production', [Q, EVER], {
    familyId: 'en-pp-q-ever-germany',
    instruction: 'Soruyu İngilizce yaz — Hiç Almanya’ya gittin mi?',
    prompt: 'Hiç Almanya’ya gittin mi? → ______',
    answer: 'Have you ever been to Germany?',
    validation: EN,
    audio: answerEn('Have you ever been to Germany?'),
  }),

  /* ================================================================
   * E. ever / never / already / yet / just (15)
   * ================================================================ */
  pp('en-pp-ever-mc-meaning', 'multiple-choice', 'easy', 'recognition', [EVER], {
    familyId: 'en-pp-ever-meaning',
    instruction: 'ever ne demektir?',
    prompt: 'Have you ever…?',
    answer: 'hayatında herhangi bir zamanda',
    options: ['hayatında herhangi bir zamanda', 'her zaman', 'asla', 'az önce'],
  }),
  pp('en-pp-never-mc-meaning', 'multiple-choice', 'easy', 'recognition', [EVER], {
    familyId: 'en-pp-never-meaning',
    instruction: 'never ne demektir?',
    prompt: 'I have never…',
    answer: 'hiçbir zaman',
    options: ['hiçbir zaman', 'zaten', 'henüz', 'her zaman'],
  }),
  pp('en-pp-already-mc-sentence', 'multiple-choice', 'medium', 'recognition', [MARK], {
    familyId: 'en-pp-already-sent',
    instruction: 'Hangisi “çoktan bitirdim” demektir?',
    prompt: 'already → ?',
    answer: "I've already finished.",
    options: ["I've already finished.", "I haven't finished yet.", "I've just finished.", 'I finish already.'],
  }),
  pp('en-pp-yet-mc-sentence', 'multiple-choice', 'medium', 'recognition', [MARK], {
    familyId: 'en-pp-yet-sent',
    instruction: 'Hangisi “henüz bitirmedim” demektir?',
    prompt: 'yet → ?',
    answer: "I haven't finished yet.",
    options: ["I haven't finished yet.", "I've already finished.", "I've just finished.", 'I haven\'t already finished.'],
  }),
  pp('en-pp-ever-fill-germany', 'fill-blank', 'easy', 'recall', [EVER], {
    familyId: 'en-pp-ever-fill',
    instruction: 'Boşluğu doldur — Hiç Almanya’da bulundun mu?',
    prompt: 'Have you ___ visited Germany? (ever)',
    answer: 'ever',
    validation: EXACT_EN,
  }),
  pp('en-pp-never-fill-poland', 'fill-blank', 'easy', 'recall', [EVER], {
    familyId: 'en-pp-never-fill',
    instruction: 'Boşluğu doldur — Polonya’da hiç bulunmadım.',
    prompt: 'I have ___ been to Poland. (never)',
    answer: 'never',
    validation: EXACT_EN,
  }),
  pp('en-pp-already-fill-finished', 'fill-blank', 'medium', 'recall', [MARK], {
    familyId: 'en-pp-already-fill',
    instruction: 'Boşluğu doldur — Çoktan bitirdim.',
    prompt: "I've ___ finished. (already)",
    answer: 'already',
    validation: EXACT_EN,
  }),
  pp('en-pp-yet-fill-finished', 'fill-blank', 'medium', 'recall', [MARK], {
    familyId: 'en-pp-yet-fill',
    instruction: 'Boşluğu doldur — Henüz bitirmedim.',
    prompt: "I haven't finished ___. (yet)",
    answer: 'yet',
    validation: EXACT_EN,
  }),
  pp('en-pp-just-fill-finished', 'fill-blank', 'medium', 'recall', [MARK], {
    familyId: 'en-pp-just-fill',
    instruction: 'Boşluğu doldur — Demin bitirdim.',
    prompt: "I've ___ finished. (just)",
    answer: 'just',
    validation: EXACT_EN,
  }),
  pp('en-pp-never-free-film', 'free-text', 'hard', 'production', [EVER], {
    familyId: 'en-pp-never-film',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Bu filmi hiç görmedim. → ______',
    answer: 'I have never seen this film.',
    acceptedAnswers: ["I've never seen this film."],
    validation: EN,
    audio: answerEn('I have never seen this film.'),
  }),
  pp('en-pp-yet-free-homework', 'free-text', 'hard', 'production', [MARK, NEG], {
    familyId: 'en-pp-yet-homework',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Ödevimi henüz bitirmedim. → ______',
    answer: "I haven't finished my homework yet.",
    acceptedAnswers: ['I have not finished my homework yet.'],
    validation: EN,
    audio: answerEn("I haven't finished my homework yet."),
  }),
  pp('en-pp-already-free-eaten', 'free-text', 'hard', 'production', [MARK], {
    familyId: 'en-pp-already-eaten',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'O zaten yemek yedi. → ______',
    answer: 'He has already eaten.',
    acceptedAnswers: ["He's already eaten."],
    validation: EN,
    audio: answerEn('He has already eaten.'),
  }),
  pp('en-pp-ever-free-sushi', 'free-text', 'hard', 'production', [EVER, Q], {
    familyId: 'en-pp-ever-sushi',
    instruction: 'Soruyu İngilizce yaz — Hiç suşi denedin mi?',
    prompt: 'Hiç suşi denedin mi? → ______',
    answer: 'Have you ever tried sushi?',
    validation: EN,
    audio: answerEn('Have you ever tried sushi?'),
  }),
  pp('en-pp-ever-wb-abroad', 'word-bank-translation', 'medium', 'production', [EVER, Q], {
    familyId: 'en-pp-ever-wb',
    instruction: 'Kutucuklarla kur — Hayatında hiç yurt dışına çıktın mı?',
    answer: 'Have you ever travelled abroad?',
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Hayatında hiç yurt dışına çıktın mı?', targetLanguage: 'en',
      tokens: tok('Have', 'you', 'ever', 'travelled', 'abroad?', 'Has', 'never', 'travel'),
      acceptedSequences: [['Have', 'you', 'ever', 'travelled', 'abroad?']],
    },
  }),
  pp('en-pp-just-wb-work', 'word-bank-translation', 'medium', 'production', [MARK], {
    familyId: 'en-pp-just-wb',
    instruction: 'Kutucuklarla kur — Az önce işimi bitirdim.',
    answer: "I've just finished my work.",
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Az önce işimi bitirdim.', targetLanguage: 'en',
      tokens: tok("I've", 'just', 'finished', 'my', 'work.', 'already', 'I', 'have'),
      acceptedSequences: [["I've", 'just', 'finished', 'my', 'work.'], ['I', 'have', 'just', 'finished', 'my', 'work.']],
    },
  }),

  /* ================================================================
   * G. Türkçe → İngilizce (22)
   * ================================================================ */
  pp('en-pp-tr-free-known', 'free-text', 'hard', 'production', [STATES, FORSINCE_S], {
    familyId: 'en-pp-tr-known',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Onu üç yıldır tanıyorum. → ______',
    answer: 'I have known him for three years.',
    acceptedAnswers: ["I've known him for three years.", 'I have known her for three years.'],
    validation: EN,
  }),
  pp('en-pp-tr-free-lived-since', 'free-text', 'hard', 'production', [FORSINCE_S], {
    familyId: 'en-pp-tr-lived-since',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: '2024’ten beri burada yaşıyorum. → ______',
    answer: 'I have lived here since 2024.',
    acceptedAnswers: ["I've lived here since 2024."],
    validation: EN,
  }),
  pp('en-pp-tr-free-seen-before', 'free-text', 'medium', 'production', [FORMULA], {
    familyId: 'en-pp-tr-seen-before',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Bu filmi daha önce gördüm. → ______',
    answer: 'I have seen this film before.',
    acceptedAnswers: ["I've seen this film before."],
    validation: EN,
  }),
  pp('en-pp-tr-free-studied', 'free-text', 'hard', 'production', [STATES], {
    familyId: 'en-pp-tr-studied',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Üç yıldır İngilizce çalışıyorum. → ______',
    answer: 'I have studied English for three years.',
    acceptedAnswers: ["I've studied English for three years."],
    validation: EN,
  }),
  pp('en-pp-tr-free-london', 'free-text', 'hard', 'production', [EVER], {
    familyId: 'en-pp-tr-london',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Hiç Londra’da bulunmadım. → ______',
    answer: 'I have never visited London.',
    acceptedAnswers: ["I've never visited London.", 'I have never been to London.', "I've never been to London."],
    validation: EN,
  }),
  pp('en-pp-tr-free-homework-done', 'free-text', 'medium', 'production', [TABLE], {
    familyId: 'en-pp-tr-homework-done',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Ödevini bitirdi. (She …) → ______',
    answer: 'She has finished her homework.',
    acceptedAnswers: ["She's finished her homework."],
    validation: EN,
  }),
  pp('en-pp-tr-free-called', 'free-text', 'medium', 'production', [NEG, V3], {
    familyId: 'en-pp-tr-called',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Beni aramadı. (He …) → ______',
    answer: "He hasn't called me.",
    acceptedAnswers: ['He has not called me.'],
    validation: EN,
  }),
  pp('en-pp-tr-free-three-times', 'free-text', 'hard', 'production', [FORMULA, 'pp.vs-past.experience-count'], {
    familyId: 'en-pp-tr-three-times',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Onu üç kez gördüm. → ______',
    answer: 'I have seen him three times.',
    acceptedAnswers: ["I've seen him three times.", 'I have seen her three times.'],
    validation: EN,
  }),
  pp('en-pp-tr-free-programming', 'free-text', 'hard', 'production', [STATES], {
    familyId: 'en-pp-tr-programming',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'İki yıldır programlama çalışıyorum. → ______',
    answer: 'I have studied programming for two years.',
    acceptedAnswers: ["I've studied programming for two years."],
    validation: EN,
  }),
  pp('en-pp-tr-free-projects', 'free-text', 'hard', 'production', [FORMULA], {
    familyId: 'en-pp-tr-projects',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Birkaç yazılım projesinde çalıştım. → ______',
    answer: 'I have worked on several software projects.',
    acceptedAnswers: ["I've worked on several software projects."],
    validation: EN,
  }),
  pp('en-pp-tr-free-abroad', 'free-text', 'hard', 'production', [EVER], {
    familyId: 'en-pp-tr-abroad',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Hiç yurt dışında okumadım. → ______',
    answer: 'I have never studied abroad.',
    acceptedAnswers: ["I've never studied abroad."],
    validation: EN,
  }),
  pp('en-pp-tr-free-improved', 'free-text', 'medium', 'production', [FORMULA], {
    familyId: 'en-pp-tr-improved',
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'İngilizcemi geliştirdim. → ______',
    answer: 'I have improved my English.',
    acceptedAnswers: ["I've improved my English."],
    validation: EN,
  }),
  pp('en-pp-tr-free-yesterday-email', 'free-text', 'hard', 'production', ['pp.vs-past.time-words'], {
    familyId: 'en-pp-tr-yesterday',
    instruction: 'Türkçeden İngilizceye çevir (zamana dikkat: dün!):',
    prompt: 'Dün bir e-posta yazdım. → ______',
    answer: 'I wrote an email yesterday.',
    validation: EN,
    explanation: 'yesterday bitmiş zamandır → Simple Past (wrote).',
  }),
  pp('en-pp-tr-free-saw-film', 'free-text', 'hard', 'production', ['pp.vs-past.time-words'], {
    familyId: 'en-pp-tr-saw',
    instruction: 'Türkçeden İngilizceye çevir (zamana dikkat: dün!):',
    prompt: 'Bu filmi dün gördüm. → ______',
    answer: 'I saw this film yesterday.',
    validation: EN,
    explanation: 'yesterday bitmiş zamandır → Simple Past (saw).',
  }),
  pp('en-pp-tr-wb-studied', 'word-bank-translation', 'hard', 'production', [STATES], {
    familyId: 'en-pp-tr-wb-studied',
    instruction: 'Kutucuklarla kur — Üç yıldır İngilizce çalışıyorum.',
    answer: 'I have studied English for three years.',
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Üç yıldır İngilizce çalışıyorum.', targetLanguage: 'en',
      tokens: tok('I', 'have', 'studied', 'English', 'for', 'three', 'years.', 'study', 'has', 'since'),
      acceptedSequences: [['I', 'have', 'studied', 'English', 'for', 'three', 'years.']],
    },
  }),
  pp('en-pp-tr-wb-lived', 'word-bank-translation', 'hard', 'production', [FORSINCE_S], {
    familyId: 'en-pp-tr-wb-lived',
    instruction: 'Kutucuklarla kur — 2024’ten beri burada yaşıyorum.',
    answer: 'I have lived here since 2024.',
    wordBank: {
      direction: 'tr-to-en', sourceText: '2024’ten beri burada yaşıyorum.', targetLanguage: 'en',
      tokens: tok('I', 'have', 'lived', 'here', 'since', '2024.', 'for', 'live', 'has'),
      acceptedSequences: [['I', 'have', 'lived', 'here', 'since', '2024.']],
    },
  }),
  pp('en-pp-tr-wb-yet', 'word-bank-translation', 'medium', 'production', [MARK, NEG], {
    familyId: 'en-pp-tr-wb-yet',
    instruction: 'Kutucuklarla kur — Ödevimi henüz bitirmedim.',
    answer: "I haven't finished my homework yet.",
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Ödevimi henüz bitirmedim.', targetLanguage: 'en',
      tokens: tok('I', "haven't", 'finished', 'my', 'homework', 'yet.', "hasn't", 'finish', 'already'),
      acceptedSequences: [['I', "haven't", 'finished', 'my', 'homework', 'yet.']],
    },
  }),
  pp('en-pp-tr-wb-ever', 'word-bank-translation', 'medium', 'production', [EVER, Q], {
    familyId: 'en-pp-tr-wb-ever',
    instruction: 'Kutucuklarla kur — Hiç suşi denedin mi?',
    answer: 'Have you ever tried sushi?',
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Hiç suşi denedin mi?', targetLanguage: 'en',
      tokens: tok('Have', 'you', 'ever', 'tried', 'sushi?', 'Has', 'never', 'try'),
      acceptedSequences: [['Have', 'you', 'ever', 'tried', 'sushi?']],
    },
  }),
  pp('en-pp-tr-sb-studied', 'sentence-builder', 'hard', 'production', [STATES], {
    familyId: 'en-pp-tr-sb-studied',
    instruction: 'Çiplerle kur — Üç yıldır İngilizce çalışıyorum.',
    prompt: 'Üç yıldır İngilizce çalışıyorum.',
    answer: 'I have studied English for three years.',
    words: ['three', 'I', 'studied', 'years.', 'have', 'for', 'English', 'has'],
  }),
  pp('en-pp-tr-sb-worked', 'sentence-builder', 'hard', 'production', [STATES], {
    familyId: 'en-pp-tr-sb-worked',
    instruction: 'Çiplerle kur — Ocak’tan beri burada çalışıyor. (She …)',
    prompt: 'Ocak’tan beri burada çalışıyor.',
    answer: 'She has worked here since January.',
    words: ['since', 'She', 'worked', 'January.', 'has', 'here', 'have', 'for'],
  }),
  pp('en-pp-tr-sb-never', 'sentence-builder', 'medium', 'production', [EVER], {
    familyId: 'en-pp-tr-sb-never',
    instruction: 'Çiplerle kur — Londra’da hiç bulunmadım.',
    prompt: 'Londra’da hiç bulunmadım.',
    answer: 'I have never visited London.',
    words: ['never', 'I', 'visited', 'London.', 'have', 'ever', 'visit'],
  }),
  pp('en-pp-tr-sb-yet', 'sentence-builder', 'medium', 'production', [NEG, MARK], {
    familyId: 'en-pp-tr-sb-yet',
    instruction: 'Çiplerle kur — Ödevimi henüz bitirmedim.',
    prompt: 'Ödevimi henüz bitirmedim.',
    answer: "I haven't finished my homework yet.",
    words: ['finished', 'I', "haven't", 'yet.', 'homework', "hasn't", 'my'],
  }),
];
