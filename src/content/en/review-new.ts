/**
 * İngilizce Genel Tekrar bankası — yeni konular (reviewOnly).
 * Her yeni konu için temsil + beceri karışımı.
 */

import { EN, EXACT_EN, listenEn, enEx } from './helpers.ts';
import type { Exercise } from '../types.ts';

type R = Partial<Exercise> & { instruction: string };
function gr(
  topicId: string, topic: string, id: string, type: Exercise['type'],
  d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: R,
): Exercise {
  return enEx(topicId, topic, id, type, d, s, c, { ...rest, reviewOnly: true });
}

export const EN_REVIEW_EXERCISES_NEW: Exercise[] = [
  gr('en.sentence-structure', 'Sentence Structure', 'gr-en-ss-svo', 'multiple-choice', 'easy', 'recognition', ['ss.svo.core'], {
    instruction: 'Doğru sıra hangisi?', prompt: 'SVO → ?',
    answer: 'I study English every evening.', options: ['I study English every evening.', 'I every evening study English.', 'I study every evening English.', 'Every I study English evening.'],
  }),
  gr('en.sentence-structure', 'Sentence Structure', 'gr-en-ss-qind', 'multiple-choice', 'medium', 'recognition', ['ss.questions.indirect'], {
    instruction: 'Doğru dolaylı soru?', prompt: 'banka → ?',
    answer: 'Do you know where the bank is?', options: ['Do you know where the bank is?', 'Do you know where is the bank?', 'Do you know where the bank it is?', 'Do you know where is bank?'],
  }),
  gr('en.sentence-structure', 'Sentence Structure', 'gr-en-ss-tr', 'free-text', 'hard', 'production', ['ss.svo.core'], {
    instruction: 'Çevir:', prompt: 'Her akşam İngilizce çalışırım. → ______',
    answer: 'I study English every evening.', validation: EN,
  }),
  gr('en.sentence-structure', 'Sentence Structure', 'gr-en-ss-err', 'error-correction', 'medium', 'correction', ['ss.mistakes.order'], {
    instruction: 'Düzelt:', prompt: 'Do you know where the bank it is?',
    answer: 'Do you know where the bank is?', validation: EN,
  }),
  gr('en.sentence-structure', 'Sentence Structure', 'gr-en-ss-listen', 'listen-choice', 'medium', 'recognition', ['ss.questions.direct'], {
    instruction: 'Dinle ve seç:', audioText: 'Where is the bank?',
    answer: 'Where is the bank?', options: ['Where is the bank?', 'Where the bank is?', 'Where the bank it is?', 'Where is bank the?'],
    audio: listenEn('Where is the bank?'),
  }),
  gr('en.past-perfect', 'Past Perfect', 'gr-en-ppf-mc', 'multiple-choice', 'medium', 'recognition', ['ppf.formula.core'], {
    instruction: 'Önce olan hangisi?', prompt: 'film / varış → ?',
    answer: 'The film had started.', options: ['The film had started.', 'The film has started.', 'The film starts.', 'The film have started.'],
  }),
  gr('en.past-perfect', 'Past Perfect', 'gr-en-ppf-tr', 'free-text', 'hard', 'production', ['ppf.timeline.earlier'], {
    instruction: 'Çevir:', prompt: 'Vardığımızda film başlamıştı. → ______',
    answer: 'By the time we arrived, the film had started.', validation: EN,
  }),
  gr('en.past-perfect', 'Past Perfect', 'gr-en-ppf-err', 'error-correction', 'medium', 'correction', ['ppf.mistakes.has-had'], {
    instruction: 'Düzelt:', prompt: 'By the time we arrived, the film has started.',
    answer: 'By the time we arrived, the film had started.', validation: EN,
  }),
  gr('en.past-perfect', 'Past Perfect', 'gr-en-ppf-fill', 'fill-blank', 'easy', 'recall', ['ppf.formula.core'], {
    instruction: 'Doldur:', prompt: 'The film ___ started. (had)', answer: 'had', validation: EXACT_EN,
  }),
  gr('en.gerund-infinitive', 'Gerund & Infinitive', 'gr-en-gi-enjoy', 'multiple-choice', 'easy', 'recognition', ['gi.gerund.chunks'], {
    instruction: 'enjoy sonrası?', prompt: 'enjoy → ?',
    answer: 'visiting', options: ['visiting', 'to visit', 'visit', 'to visiting'],
  }),
  gr('en.gerund-infinitive', 'Gerund & Infinitive', 'gr-en-gi-decide', 'multiple-choice', 'easy', 'recognition', ['gi.infinitive.chunks'], {
    instruction: 'decide sonrası?', prompt: 'decide → ?',
    answer: 'to take', options: ['to take', 'taking', 'take', 'to taking'],
  }),
  gr('en.gerund-infinitive', 'Gerund & Infinitive', 'gr-en-gi-tr', 'free-text', 'hard', 'production', ['gi.look-forward.doing'], {
    instruction: 'Çevir:', prompt: 'Seni görmeyi dört gözle bekliyorum. → ______',
    answer: 'I look forward to seeing you.', validation: EN,
  }),
  gr('en.gerund-infinitive', 'Gerund & Infinitive', 'gr-en-gi-err', 'error-correction', 'medium', 'correction', ['gi.mistakes.chunks'], {
    instruction: 'Düzelt:', prompt: 'I enjoy to visit museums.',
    answer: 'I enjoy visiting museums.', validation: EN,
  }),
  gr('en.conditionals', 'Conditionals', 'gr-en-cond-second', 'multiple-choice', 'medium', 'recognition', ['cond.second.formula'], {
    instruction: 'Doğru Second?', prompt: 'zaman → ?',
    answer: 'If I had more time, I would study more.', options: ['If I had more time, I would study more.', 'If I would have more time, I would study more.', 'If I have more time, I will study more.', 'If I had more time, I will study more.'],
  }),
  gr('en.conditionals', 'Conditionals', 'gr-en-cond-tr', 'free-text', 'hard', 'production', ['cond.second.formula'], {
    instruction: 'Çevir:', prompt: 'Daha çok zamanım olsaydı daha çok çalışırdım. → ______',
    answer: 'If I had more time, I would study more.', validation: EN,
  }),
  gr('en.conditionals', 'Conditionals', 'gr-en-cond-err', 'error-correction', 'medium', 'correction', ['cond.mistakes.would'], {
    instruction: 'Düzelt:', prompt: 'If I would have more time, I would study.',
    answer: 'If I had more time, I would study.', validation: EN,
  }),
  gr('en.conditionals', 'Conditionals', 'gr-en-cond-fill', 'fill-blank', 'easy', 'recall', ['cond.second.formula'], {
    instruction: 'Doldur:', prompt: 'If I ___ more time… (had)', answer: 'had', validation: EXACT_EN,
  }),
  gr('en.prepositions-collocations', 'Prepositions & Collocations', 'gr-en-pc-interested', 'multiple-choice', 'easy', 'recognition', ['pc.chunks-a.core'], {
    instruction: 'interested sonrası?', prompt: 'interested ___ ?',
    answer: 'in', options: ['in', 'for', 'at', 'on'],
  }),
  gr('en.prepositions-collocations', 'Prepositions & Collocations', 'gr-en-pc-attention', 'multiple-choice', 'easy', 'recognition', ['pc.chunks-c.core'], {
    instruction: 'dikkat etmek?', prompt: '___ attention to ?',
    answer: 'Pay', options: ['Pay', 'Give', 'Take', 'Make'],
  }),
  gr('en.prepositions-collocations', 'Prepositions & Collocations', 'gr-en-pc-tr', 'free-text', 'hard', 'production', ['pc.production.choice'], {
    instruction: 'Çevir:', prompt: 'Müzikle ilgileniyorum. → ______',
    answer: 'I am interested in music.', validation: EN,
  }),
  gr('en.prepositions-collocations', 'Prepositions & Collocations', 'gr-en-pc-err', 'error-correction', 'medium', 'correction', ['pc.mistakes.chunks'], {
    instruction: 'Düzelt:', prompt: 'I am interested for music.',
    answer: 'I am interested in music.', validation: EN,
  }),
  gr('en.prepositions-collocations', 'Prepositions & Collocations', 'gr-en-pc-listen', 'listen-choice', 'medium', 'recognition', ['pc.chunks-c.core'], {
    instruction: 'Dinle ve seç:', audioText: 'Pay attention to the teacher.',
    answer: 'Pay attention to the teacher.',
    options: ['Pay attention to the teacher.', 'Give attention to the teacher.', 'Pay attention for the teacher.', 'Pay the attention to teacher.'],
    audio: listenEn('Pay attention to the teacher.'),
  }),
  // karma dinleme/yazma
  gr('en.present-perfect', 'Present Perfect', 'gr-en-mix-dict', 'dictation', 'medium', 'recall', ['pp.for-since.states'], {
    instruction: 'Duyduğunu yaz:', audioText: 'I have studied English for two years.',
    answer: 'I have studied English for two years.', validation: EN, audio: listenEn('I have studied English for two years.'),
  }),
  gr('en.present-perfect', 'Present Perfect', 'gr-en-mix-write', 'free-text', 'medium', 'production', ['pp.formula.core'], {
    instruction: 'Kendin hakkında 3 Present Perfect cümlesi yaz.',
    prompt: '3 cümle: 1 for/since, 1 never.',
    openEnded: true,
    requirements: ['3 cümle', '1 for/since', '1 never'],
    sampleAnswer: 'I have studied English for two years. I have never visited London. I have lived here since 2023.',
    validation: EN,
  }),
];
