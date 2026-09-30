/**
 * İngilizce Genel Tekrar bankası — tamamı `reviewOnly`.
 *
 * Konu ders havuzlarına girmez; kümülatif İngilizce Genel Tekrar
 * modlarında ve konu kartı tekrarında kullanılır. Kimlikler `gr-en-`
 * önekli olduğu için ders kayıtlarından (`gr-` kuralı) ayrı tutulur ve
 * Almanca kayıtlarla çakışmaz.
 */

import { EN, EXACT_EN, listenEn, pp, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

function gr(
  id: string,
  type: Exercise['type'],
  difficulty: Exercise['difficulty'],
  skill: Exercise['skill'],
  conceptIds: string[],
  rest: Partial<Exercise> & { instruction: string },
): Exercise {
  return pp(id, type, difficulty, skill, conceptIds, { ...rest, reviewOnly: true });
}

export const EN_REVIEW_EXERCISES: Exercise[] = [
  gr('gr-en-have-fill', 'fill-blank', 'easy', 'recall', ['pp.have-has.table'], {
    instruction: 'Yardımcıyı yaz — Bitirdi. (He …)',
    prompt: 'He ___ finished.',
    answer: 'has',
    validation: EXACT_EN,
  }),
  gr('gr-en-v3-mc', 'multiple-choice', 'easy', 'recognition', ['pp.v3.irregular-core'], {
    instruction: 'Doğru V3 hangisi? — go',
    prompt: 'go → ?',
    answer: 'gone',
    options: ['gone', 'went', 'goes', 'going'],
  }),
  gr('gr-en-for-since-mc', 'multiple-choice', 'easy', 'recognition', ['pp.for-since.rule'], {
    instruction: 'Hızlı tanıma — hangisi gelir?',
    prompt: '___ last year',
    answer: 'since',
    options: ['for', 'since', 'from', 'at'],
  }),
  gr('gr-en-vs-mc', 'multiple-choice', 'medium', 'recognition', ['pp.vs-past.time-words'], {
    instruction: 'Bitmiş zaman hangisini ister?',
    prompt: 'I ___ her yesterday. (saw / have seen)',
    answer: 'saw',
    options: ['saw', 'have seen'],
  }),
  gr('gr-en-tr-known', 'free-text', 'hard', 'production', ['pp.states.know-live', 'pp.for-since.states'], {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Onu iki yıldır tanıyorum. → ______',
    answer: 'I have known him for two years.',
    acceptedAnswers: ["I've known him for two years.", 'I have known her for two years.'],
    validation: EN,
  }),
  gr('gr-en-tr-never', 'free-text', 'hard', 'production', ['pp.ever-never.use'], {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Hiç suşi denemedim. → ______',
    answer: 'I have never tried sushi.',
    acceptedAnswers: ["I've never tried sushi."],
    validation: EN,
  }),
  gr('gr-en-v3-fill', 'fill-blank', 'medium', 'recall', ['pp.v3.irregular-core'], {
    instruction: 'V3’ü yaz:',
    prompt: 'take → ___',
    answer: 'taken',
    validation: EXACT_EN,
  }),
  gr('gr-en-for-fill', 'fill-blank', 'easy', 'recall', ['pp.for-since.rule'], {
    instruction: 'for mu since mi?',
    prompt: 'We have waited ___ three years.',
    answer: 'for',
    validation: EXACT_EN,
  }),
  gr('gr-en-err', 'error-correction', 'medium', 'correction', ['pp.mistakes.v3'], {
    instruction: 'V3 yanlış — cümleyi düzelt:',
    prompt: 'We have see it.',
    answer: 'We have seen it.',
    explanation: 'have sonrası HER ZAMAN V3: seen.',
    validation: EN,
  }),
  gr('gr-en-listen', 'listen-choice', 'medium', 'recognition', ['pp.for-since.states'], {
    instruction: 'Dinle ve duyduğun cümleyi seç:',
    audioText: 'She has worked here since January.',
    answer: 'She has worked here since January.',
    options: [
      'She has worked here since January.',
      'She has worked here for January.',
      'She worked here since January.',
      'She works here since January.',
    ],
    audio: listenEn('She has worked here since January.'),
  }),
  gr('gr-en-wb', 'word-bank-translation', 'medium', 'production', ['pp.markers.already-yet-just'], {
    instruction: 'Kutucuklarla kur — Az önce bitirdim.',
    answer: "I've just finished.",
    wordBank: {
      direction: 'tr-to-en', sourceText: 'Az önce bitirdim.', targetLanguage: 'en',
      tokens: tok("I've", 'just', 'finished.', 'already', 'yet', 'I', 'have'),
      acceptedSequences: [["I've", 'just', 'finished.'], ['I', 'have', 'just', 'finished.']],
    },
  }),
  gr('gr-en-dict', 'dictation', 'medium', 'recall', ['pp.for-since.states'], {
    instruction: 'Duyduğunu yaz:',
    audioText: 'I have lived here since 2020.',
    answer: 'I have lived here since 2020.',
    acceptedAnswers: ["I've lived here since 2020."],
    validation: EN,
    audio: listenEn('I have lived here since 2020.'),
  }),
  gr('gr-en-write', 'free-text', 'medium', 'production', ['pp.formula.core'], {
    instruction: 'Kendin hakkında 5 Present Perfect cümlesi yaz.',
    prompt: '5 cümle: en az 1 for/since, en az 1 never.',
    openEnded: true,
    requirements: ['5 cümle', 'en az 1 for/since', 'en az 1 never'],
    sampleAnswer: 'I have studied English for two years. I have never visited London. I have lived here since 2020. I have already finished my homework. I have just started a new book.',
    validation: EN,
  }),
];
