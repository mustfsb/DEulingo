/**
 * Past Perfect — had + V3, önce olan olay, by the time.
 * Hedef: ≥80 benzersiz birincil alıştırma, üretim ağırlıklı.
 */

import { EN, EXACT_EN, listenEn, answerEn, enEx, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const T = 'en.past-perfect';
const TT = 'Past Perfect';
const F = 'ppf.formula.core';
const TL = 'ppf.timeline.earlier';
const VS = 'ppf.vs-past.arrived';
const BY = 'ppf.by-time.before';
const M = 'ppf.mistakes.has-had';

type R = Partial<Exercise> & { instruction: string };
const mk = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: R) =>
  enEx(T, TT, id, type, d, s, c, rest);

const S_F = 'past-perfect.formula';
const S_TL = 'past-perfect.timeline';
const S_VS = 'past-perfect.vs-past';
const S_BY = 'past-perfect.by-the-time';
const S_M = 'past-perfect.mistakes';

const PAIRS: Array<{ tr: string; en: string; past: string; trPast: string }> = [
  { tr: 'Biz vardığımızda film başlamıştı.', en: 'The film had started before we arrived.', past: 'We arrived.', trPast: 'Vardık.' },
  { tr: 'Ben aradığımda o çoktan gitmişti.', en: 'He had already left when I called.', past: 'I called.', trPast: 'Aradım.' },
  { tr: 'Yağmur durduktan sonra dışarı çıktık.', en: 'We went out after the rain had stopped.', past: 'We went out.', trPast: 'Dışarı çıktık.' },
  { tr: 'Ödevini bitirdikten sonra oynadı.', en: 'He played after he had finished his homework.', past: 'He played.', trPast: 'Oynadı.' },
  { tr: 'Tren biz gelmeden kalkmıştı.', en: 'The train had left before we came.', past: 'We came.', trPast: 'Geldik.' },
  { tr: 'Kapıyı açtığımda anahtarlarımı kaybettiğimi fark ettim.', en: 'I had lost my keys before I opened the door.', past: 'I opened the door.', trPast: 'Kapıyı açtım.' },
  { tr: 'Sınavdan önce çok çalışmıştı.', en: 'She had studied a lot before the exam.', past: 'The exam started.', trPast: 'Sınav başladı.' },
  { tr: 'Eve vardığımızda yemek hazırdı (pişmişti).', en: 'Dinner had been ready when we got home.', past: 'We got home.', trPast: 'Eve vardık.' },
  { tr: 'Polis gelmeden hırsız kaçmıştı.', en: 'The thief had escaped before the police came.', past: 'The police came.', trPast: 'Polis geldi.' },
  { tr: 'Toplantı başladığında raporu bitirmişti.', en: 'She had finished the report by the time the meeting started.', past: 'The meeting started.', trPast: 'Toplantı başladı.' },
  { tr: 'Ben uyumadan önce annem aramıştı.', en: 'My mother had called before I slept.', past: 'I slept.', trPast: 'Uyudum.' },
  { tr: 'Maç bitmeden iki gol atmıştı.', en: 'He had scored two goals before the match ended.', past: 'The match ended.', trPast: 'Maç bitti.' },
  { tr: 'Biz taşınmadan önce evi boyamışlardı.', en: 'They had painted the house before we moved.', past: 'We moved.', trPast: 'Taşındık.' },
  { tr: 'Restorana vardığımızda kapanmıştı.', en: 'It had closed by the time we arrived at the restaurant.', past: 'We arrived.', trPast: 'Vardık.' },
  { tr: 'Öğretmen sorduğunda cevabı biliyordu (öğrenmişti).', en: 'He had learned the answer before the teacher asked.', past: 'The teacher asked.', trPast: 'Öğretmen sordu.' },
];

const out: Exercise[] = [];

// formül MC + fill (12)
[['Had + ? hangisi formüldür?', 'had + V3', ['had + V3', 'have + V3', 'had + V2', 'has + V1']],
  ['Hangisi Past Perfect cümlesidir?', 'The film had started.', ['The film had started.', 'The film has started yesterday.', 'The film started already since.', 'The film have started.']],
  ['Hangisi önce olanı anlatır?', 'had started (önce)', ['had started (önce)', 'arrived (önce)', 'will start (önce)', 'starts (önce)']],
  ['had ne ile kullanılır?', 'tüm öznelerle had (I/you/he/she…)', ['tüm öznelerle had (I/you/he/she…)', 'he ile has, I ile had', 'she ile had, they ile have', 'sadece I ile had']],
].forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ppf-form-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [F], {
    instruction: 'Past Perfect formülü:', prompt: prompt as string, answer: ans as string, options: opts as string[], sectionId: S_F,
  }));
});
[['en-ppf-form-fill-had', 'The film ___ started before we arrived. (had)', 'had'],
  ['en-ppf-form-fill-v3', 'He had ___ (leave → left?) → doğru V3?', 'left'],
  ['en-ppf-form-fill-escaped', 'The thief had ___ before the police came. (escape → ?)', 'escaped'],
  ['en-ppf-form-fill-finished', 'She had ___ the report. (finish → ?)', 'finished'],
  ['en-ppf-form-fill-lost', 'I had ___ my keys. (lose → ?)', 'lost'],
  ['en-ppf-form-fill-studied', 'She had ___ a lot. (study → ?)', 'studied'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'fill-blank', 'easy', 'recall', [F], {
    instruction: 'Boşluğu doldur (had + V3):', prompt: prompt as string, answer: ans as string, validation: EXACT_EN, sectionId: S_F,
  }));
});
out.push(mk('en-ppf-form-listen', 'listen-choice', 'easy', 'recognition', [F], {
  instruction: 'Duyduğunu seç:', audioText: 'The film had started before we arrived.',
  answer: 'The film had started before we arrived.',
  options: ['The film had started before we arrived.', 'The film has started before we arrived.', 'The film started before we arrive.', 'The film have started before we arrived.'],
  audio: listenEn('The film had started before we arrived.'), sectionId: S_F,
}));
out.push(mk('en-ppf-form-dict', 'dictation', 'medium', 'recall', [F], {
  instruction: 'Duyduğunu yaz:', audioText: 'He had already left when I called.',
  answer: 'He had already left when I called.', validation: EN, audio: listenEn('He had already left when I called.'), sectionId: S_F,
}));

// timeline + ordering + wb + free (PAIRS * 3 = 45)
PAIRS.forEach((p, i) => {
  const tokens = p.en.split(' ');
  out.push(mk(`en-ppf-order-${i}`, 'ordering', 'medium', 'production', [TL], {
    instruction: 'Sırala (önce olan had + V3):', prompt: `${p.tr} → (${tokens.join(' / ')})`,
    answer: p.en, words: [...tokens.slice(1), tokens[0], 'has', 'have'].slice(0, tokens.length + 1),
    sectionId: S_TL,
  }));
  const seq = p.en.split(' ');
  out.push(mk(`en-ppf-wb-${i}`, 'word-bank-translation', 'medium', 'production', [TL, VS], {
    instruction: 'Kutucuklarla kur:', answer: p.en,
    wordBank: { direction: 'tr-to-en', sourceText: p.tr, targetLanguage: 'en',
      tokens: tok(...seq, 'has', 'have', 'starts'),
      acceptedSequences: [seq] },
    sectionId: S_TL,
  }));
  out.push(mk(`en-ppf-tr-${i}`, 'free-text', 'hard', 'production', [TL, VS], {
    instruction: 'Türkçeden çevir (önce olan had + V3):', prompt: `${p.tr} → ______`,
    answer: p.en, validation: EN, audio: answerEn(p.en), sectionId: S_TL,
  }));
});

// Simple Past vs Past Perfect MC (10)
const VS_MC: Array<[string, string, string[]]> = [
  ['We arrived. → ______ (tek olay, bitmiş)', 'We arrived.', ['We arrived.', 'We had arrived before.', 'We have arrived since.', 'We arrive.']],
  ['Önce olan hangisi? (film / varış)', 'The film had started. (önce)', ['The film had started. (önce)', 'We arrived. (önce)', 'We arrive. (önce)', 'The film starts. (önce)']],
  ['By the time we arrived, the film ___.', 'had started', ['had started', 'has started', 'starts', 'will start']],
  ['He had left ___ I called. (when)', 'when', ['when', 'since', 'for', 'yet']],
  ['After the rain ___, we went out.', 'had stopped', ['had stopped', 'has stopped', 'stops', 'stop']],
  ['Before the exam, she ___.', 'had studied a lot', ['had studied a lot', 'has studied a lot yesterday', 'studies a lot tomorrow', 'study a lot']],
  ['Hangisi doğru birleşimdir?', 'By the time we arrived, the film had started.', ['By the time we arrived, the film had started.', 'By the time we arrived, the film has started.', 'By the time we arrived, the film starts.', 'By the time we arrive, the film had started.']],
  ['Hangisi YANLIŞTIR?', 'By the time we arrived, the film has started. ❌', ['By the time we arrived, the film has started. ❌', 'By the time we arrived, the film had started. ✅', 'The film had started before we arrived. ✅', 'We arrived after the film had started. ✅']],
];
VS_MC.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ppf-vs-mc-${i}`, 'multiple-choice', i < 3 ? 'easy' : 'medium', 'recognition', [VS, BY], {
    instruction: 'Simple Past vs Past Perfect:', prompt, answer: ans, options: opts, sectionId: S_VS,
  }));
});

// by the time üretim (6)
[['en-ppf-by-free-arrived', 'Vardığımızda film başlamıştı. → ______', 'By the time we arrived, the film had started.'],
  ['en-ppf-by-free-left', 'Aradığımda çoktan gitmişti. → ______', 'He had already left when I called.'],
  ['en-ppf-by-free-rain', 'Yağmur durduktan sonra çıktık. → ______', 'We went out after the rain had stopped.'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'free-text', 'hard', 'production', [BY], {
    instruction: 'Türkçeden çevir (by the time / before / after):', prompt, answer: ans, validation: EN, audio: answerEn(ans), sectionId: S_BY,
  }));
});
out.push(mk('en-ppf-by-wb-film', 'word-bank-translation', 'medium', 'production', [BY], {
  instruction: 'Kutucuklarla kur — Vardığımızda film başlamıştı.',
  answer: 'By the time we arrived, the film had started.',
  wordBank: { direction: 'tr-to-en', sourceText: 'Vardığımızda film başlamıştı.', targetLanguage: 'en',
    tokens: tok('By', 'the', 'time', 'we', 'arrived,', 'the', 'film', 'had', 'started.', 'has', 'start'),
    acceptedSequences: [['By', 'the', 'time', 'we', 'arrived,', 'the', 'film', 'had', 'started.']] },
  sectionId: S_BY,
}));
out.push(mk('en-ppf-by-order-train', 'ordering', 'medium', 'production', [BY], {
  instruction: 'Sırala — Tren biz gelmeden kalkmıştı.',
  prompt: 'left / The / had / before / train / came. / we',
  answer: 'The train had left before we came.',
  words: ['came.', 'The', 'left', 'before', 'had', 'train', 'we'], sectionId: S_BY,
}));
out.push(mk('en-ppf-by-listen', 'listen-choice', 'medium', 'recognition', [BY], {
  instruction: 'Duyduğunu seç:', audioText: 'By the time we arrived, the film had started.',
  answer: 'By the time we arrived, the film had started.',
  options: ['By the time we arrived, the film had started.', 'By the time we arrived, the film has started.', 'By the time we arrive, the film had started.', 'By the time we arrived, the film starts.'],
  audio: listenEn('By the time we arrived, the film had started.'), sectionId: S_BY,
}));

// hata düzeltme (8) — bilinen hata: has started → had started
const ERRS: Array<[string, string, string, string]> = [
  ['en-ppf-err-has', 'By the time we arrived, the film has started.', 'By the time we arrived, the film had started.', 'İki geçmiş olayda önce olan had + V3 ister.'],
  ['en-ppf-err-have', 'We have arrived before the film started.', 'We arrived after the film had started.', 'Bitmiş tek olay Simple Past; önce olan Past Perfect.'],
  ['en-ppf-err-v2', 'The film had start before we arrived.', 'The film had started before we arrived.', 'had sonrası V3: started.'],
  ['en-ppf-err-since', 'The film had started since we arrived.', 'The film had started before we arrived.', 'Öncelik before/after/by the time ile kurulur.'],
  ['en-ppf-err-left', 'He had leave when I called.', 'He had left when I called.', 'leave → left (V3).'],
  ['en-ppf-err-lost', 'I had lose my keys.', 'I had lost my keys.', 'lose → lost (V3).'],
  ['en-ppf-err-went', 'After the rain had stop, we went out.', 'After the rain had stopped, we went out.', 'stop → stopped (V3).'],
  ['en-ppf-err-finish', 'He played after he had finish his homework.', 'He played after he had finished his homework.', 'finish → finished (V3).'],
];
ERRS.forEach(([id, prompt, ans, exp]) => {
  out.push(mk(id, 'error-correction', 'medium', 'correction', [M, F], {
    instruction: 'Past Perfect hatasını düzelt:', prompt, answer: ans, explanation: exp, validation: EN, sectionId: S_M,
  }));
});

// spoken + ek üretim (kalan)
out.push(mk('en-ppf-spoken-film', 'spoken', 'medium', 'production', [TL], {
  instruction: 'Yüksek sesle söyle:', prompt: 'The film had started before we arrived.',
  sampleAnswer: 'The film had started before we arrived.', requirements: ['had + V3', 'önce/sonra ilişkisi'], sectionId: S_TL,
}));
out.push(mk('en-ppf-spoken-personal', 'spoken', 'medium', 'production', [VS], {
  instruction: 'Kendinden anlat (yüksek sesle):', prompt: 'Dün geç kaldığın bir anı had ile anlat.',
  sampleAnswer: 'The bus had left before I arrived at the stop.',
  requirements: ['had + V3', 'before/after/by the time', 'iki geçmiş olay'], sectionId: S_VS,
}));
out.push(mk('en-ppf-dict-train', 'dictation', 'medium', 'recall', [TL], {
  instruction: 'Duyduğunu yaz:', audioText: 'The train had left before we came.',
  answer: 'The train had left before we came.', validation: EN, audio: listenEn('The train had left before we came.'), sectionId: S_TL,
}));
out.push(mk('en-ppf-free-personal', 'free-text', 'hard', 'production', [TL], {
  instruction: 'Kendin yaz — Sınavdan önce ne yapmıştın?',
  prompt: 'Sınavdan önce çok çalışmıştım. → ______',
  answer: 'I had studied a lot before the exam.', validation: EN, sectionId: S_TL,
}));

export const EN_EXERCISES_PAST_PERFECT: Exercise[] = out;
