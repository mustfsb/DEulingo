/**
 * Prepositions & Collocations — hazır öbekler (chunk).
 * Hedef: ≥100 yüksek kaliteli alıştırma, ezber değil üretim.
 */

import { EN, EXACT_EN, listenEn, answerEn, enEx, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const T = 'en.prepositions-collocations';
const TT = 'Prepositions & Collocations';
const A = 'pc.chunks-a.core';
const B = 'pc.chunks-b.core';
const C = 'pc.chunks-c.core';
const P = 'pc.production.choice';
const M = 'pc.mistakes.chunks';

type R = Partial<Exercise> & { instruction: string };
const mk = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: R) =>
  enEx(T, TT, id, type, d, s, c, rest);

const S_A = 'prepositions-collocations.chunks-a';
const S_B = 'prepositions-collocations.chunks-b';
const S_C = 'prepositions-collocations.chunks-c';
const S_P = 'prepositions-collocations.production';
const S_M = 'prepositions-collocations.mistakes';

const CHUNKS: Array<{ chunk: string; tr: string; ex: string; exTr: string; concept: string; section: string }> = [
  { chunk: 'interested in', tr: 'ilgilenmek', ex: 'I am interested in music.', exTr: 'Müzikle ilgileniyorum.', concept: A, section: S_A },
  { chunk: 'good at', tr: 'iyi olmak', ex: 'She is good at English.', exTr: 'İngilizcede iyidir.', concept: A, section: S_A },
  { chunk: 'listen to', tr: 'dinlemek', ex: 'I listen to music every day.', exTr: 'Her gün müzik dinlerim.', concept: A, section: S_A },
  { chunk: 'wait for', tr: 'beklemek', ex: 'We waited for the bus.', exTr: 'Otobüsü bekledik.', concept: B, section: S_B },
  { chunk: 'depend on', tr: 'bağlı olmak', ex: 'It depends on the weather.', exTr: 'Havaya bağlı.', concept: B, section: S_B },
  { chunk: 'believe in', tr: 'inanmak', ex: 'I believe in myself.', exTr: 'Kendime inanıyorum.', concept: B, section: S_B },
  { chunk: 'pay attention to', tr: 'dikkat etmek', ex: 'Pay attention to the teacher.', exTr: 'Öğretmene dikkat et.', concept: C, section: S_C },
  { chunk: 'afraid of', tr: 'korkmak', ex: 'He is afraid of dogs.', exTr: 'Köpeklerden korkar.', concept: C, section: S_C },
  { chunk: 'ready for', tr: 'hazır olmak', ex: 'We are ready for the exam.', exTr: 'Sınava hazırız.', concept: C, section: S_C },
  { chunk: 'different from', tr: 'farklı olmak', ex: 'This is different from that.', exTr: 'Bu ondan farklı.', concept: C, section: S_C },
];

const out: Exercise[] = [];

// her öbek: MC + fill + free (30)
CHUNKS.forEach((c, i) => {
  const prep = c.chunk.split(' ').slice(-1)[0];
  const head = c.chunk.split(' ').slice(0, -1).join(' ');
  const wrongs = ['for', 'in', 'at', 'on', 'to', 'of', 'from', 'with'].filter((w) => w !== prep).slice(0, 3);
  out.push(mk(`en-pc-chunk-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [c.concept], {
    instruction: `Doğru öbeği seç — ${c.tr}:`,
    prompt: `${head} ___ ?`, answer: prep, options: [prep, ...wrongs],
    sectionId: c.section,
  }));
  out.push(mk(`en-pc-chunk-fill-${i}`, 'fill-blank', 'easy', 'recall', [c.concept], {
    instruction: `Boşluğu doldur — ${c.exTr}`,
    prompt: c.ex.replace(c.chunk, `${head} ___`), answer: prep, validation: EXACT_EN, sectionId: c.section,
  }));
  out.push(mk(`en-pc-chunk-tr-${i}`, 'free-text', 'medium', 'production', [c.concept, P], {
    instruction: 'Türkçeden çevir (öbek bütün hâlinde):', prompt: `${c.exTr} → ______`,
    answer: c.ex, validation: EN, audio: answerEn(c.ex), sectionId: c.section,
  }));
});

// üretim wb + ordering (20)
CHUNKS.forEach((c, i) => {
  const seq = c.ex.split(' ');
  if (i % 2 === 0) {
    out.push(mk(`en-pc-wb-${i}`, 'word-bank-translation', 'medium', 'production', [P], {
      instruction: 'Kutucuklarla kur (öbek):', answer: c.ex,
      wordBank: { direction: 'tr-to-en', sourceText: c.exTr, targetLanguage: 'en',
        tokens: tok(...seq, 'for', 'in', 'at'),
        acceptedSequences: [seq] },
      sectionId: S_P,
    }));
  } else {
    const tokens = c.ex.split(' ');
    out.push(mk(`en-pc-order-${i}`, 'ordering', 'medium', 'production', [P], {
      instruction: 'Sırala (öbek):', prompt: `${c.exTr} → (${tokens.join(' / ')})`,
      answer: c.ex, words: [...tokens.slice(1), tokens[0]],
      sectionId: S_P,
    }));
  }
});

// öbek seçimi MC ek (20)
const CHOICE: Array<[string, string, string[]]> = [
  ['I am interested ___ music. (in/for)', 'in', ['in', 'for', 'at', 'on']],
  ['She is good ___ English. (at/in)', 'at', ['at', 'in', 'for', 'on']],
  ['Listen ___ me! (to/for)', 'to', ['to', 'for', 'at', 'in']],
  ['We waited ___ the bus. (for/since)', 'for', ['for', 'since', 'at', 'to']],
  ['It depends ___ the weather. (on/at)', 'on', ['on', 'at', 'in', 'for']],
  ['I believe ___ myself. (in/for)', 'in', ['in', 'for', 'to', 'at']],
  ['___ attention to the teacher! (Pay/Give)', 'Pay', ['Pay', 'Give', 'Take', 'Make']],
  ['He is afraid ___ dogs. (of/from)', 'of', ['of', 'from', 'at', 'by']],
  ['We are ready ___ the exam. (for/to)', 'for', ['for', 'to', 'at', 'in']],
  ['This is different ___ that. (from/than)', 'from', ['from', 'than', 'to', 'of']],
];
CHOICE.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-pc-choice-mc-${i}`, 'multiple-choice', i < 5 ? 'easy' : 'medium', 'recognition', [P], {
    instruction: 'Doğru edatı seç (in mi for mu?):', prompt, answer: ans, options: opts, sectionId: S_P,
  }));
});
CHUNKS.forEach((c, i) => {
  const prep = c.chunk.split(' ').slice(-1)[0];
  const alt = prep === 'for' ? 'since' : prep === 'in' ? 'at' : prep === 'at' ? 'in' : prep === 'to' ? 'for' : 'for';
  const wrongChunk = `${c.chunk.split(' ')[0]} ${alt}`;
  const wrongs = [CHUNKS[(i + 1) % CHUNKS.length].ex, CHUNKS[(i + 2) % CHUNKS.length].ex, c.ex.replace(c.chunk, wrongChunk)];
  const opts = [...new Set([c.ex, ...wrongs])];
  const fillers = ['I study English every evening.', 'They study in the library every evening.', 'If I had more time, I would study.'];
  let fi = 0;
  while (opts.length < 4 && fi < fillers.length) {
    if (!opts.includes(fillers[fi])) opts.push(fillers[fi]);
    fi += 1;
  }
  out.push(mk(`en-pc-sent-mc-${i}`, 'multiple-choice', 'medium', 'recognition', [P], {
    instruction: `Doğru cümle hangisi? — ${c.tr}:`, prompt: c.tr, answer: c.ex,
    options: opts.slice(0, 4),
    sectionId: S_P,
  }));
});

// hata düzeltme (10) — bilinen hatalar
const ERRS: Array<[string, string, string]> = [
  ['en-pc-err-interested', 'I am interested for music.', 'I am interested in music.'],
  ['en-pc-err-attention', 'Give attention to the teacher.', 'Pay attention to the teacher.'],
  ['en-pc-err-believe', 'I believe myself.', 'I believe in myself.'],
  ['en-pc-err-good', 'She is good in English.', 'She is good at English.'],
  ['en-pc-err-listen', 'Listen me carefully.', 'Listen to me carefully.'],
  ['en-pc-err-wait', 'We waited the bus since an hour.', 'We waited for the bus for an hour.'],
  ['en-pc-err-depend', 'It depends from the weather.', 'It depends on the weather.'],
  ['en-pc-err-afraid', 'He is afraid from dogs.', 'He is afraid of dogs.'],
  ['en-pc-err-ready', 'We are ready to the exam.', 'We are ready for the exam.'],
  ['en-pc-err-different', 'This is different than that. (BrE hedef)', 'This is different from that.'],
];
ERRS.forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'error-correction', 'medium', 'correction', [M, P], {
    instruction: 'Öbek hatasını düzelt (bütün hâlinde ezberle):', prompt, answer: ans,
    explanation: 'Edat öbeğin parçasıdır; tek başına çevrilmez.',
    validation: EN, sectionId: S_M,
  }));
});

// dinleme/dikte/spoken + ek üretim
out.push(mk('en-pc-listen-interested', 'listen-choice', 'easy', 'recognition', [A], {
  instruction: 'Duyduğunu seç:', audioText: 'I am interested in music.',
  answer: 'I am interested in music.',
  options: ['I am interested in music.', 'I am interested for music.', 'I am interested at music.', 'I am interest in music.'],
  audio: listenEn('I am interested in music.'), sectionId: S_A,
}));
out.push(mk('en-pc-listen-attention', 'listen-choice', 'easy', 'recognition', [C], {
  instruction: 'Duyduğunu seç:', audioText: 'Pay attention to the teacher.',
  answer: 'Pay attention to the teacher.',
  options: ['Pay attention to the teacher.', 'Give attention to the teacher.', 'Pay attention for the teacher.', 'Pay the attention to teacher.'],
  audio: listenEn('Pay attention to the teacher.'), sectionId: S_C,
}));
out.push(mk('en-pc-dict-listen', 'dictation', 'medium', 'recall', [A], {
  instruction: 'Duyduğunu yaz:', audioText: 'I listen to music every day.',
  answer: 'I listen to music every day.', validation: EN, audio: listenEn('I listen to music every day.'), sectionId: S_A,
}));
out.push(mk('en-pc-dict-depend', 'dictation', 'medium', 'recall', [B], {
  instruction: 'Duyduğunu yaz:', audioText: 'It depends on the weather.',
  answer: 'It depends on the weather.', validation: EN, audio: listenEn('It depends on the weather.'), sectionId: S_B,
}));
out.push(mk('en-pc-spoken-chunk', 'spoken', 'medium', 'production', [P], {
  instruction: 'Yüksek sesle söyle (öbek):', prompt: 'I am interested in music.',
  sampleAnswer: 'I am interested in music. I listen to pop every day.',
  requirements: ['interested in öbeği', 'tam cümle'], sectionId: S_P,
}));
out.push(mk('en-pc-spoken-personal', 'spoken', 'medium', 'production', [P], {
  instruction: 'Kendinden söyle:', prompt: 'What are you good at? What are you afraid of?',
  sampleAnswer: 'I am good at English. I am afraid of spiders.',
  requirements: ['good at', 'afraid of'], sectionId: S_P,
}));
// kişisel free
out.push(mk('en-pc-free-personal-1', 'free-text', 'hard', 'production', [P], {
  instruction: 'Kendin yaz — Neye ilgi duyarsın?',
  prompt: 'Müzikle ilgileniyorum. → ______',
  answer: 'I am interested in music.', validation: EN, sectionId: S_P,
}));
out.push(mk('en-pc-free-personal-2', 'free-text', 'hard', 'production', [P], {
  instruction: 'Kendin yaz — Kendine inanmak:',
  prompt: 'Kendime inanıyorum. → ______',
  answer: 'I believe in myself.', validation: EN, sectionId: S_P,
}));
out.push(mk('en-pc-free-personal-3', 'free-text', 'hard', 'production', [P], {
  instruction: 'Kendin yaz — Sınava hazır olmak:',
  prompt: 'Sınava hazırız. → ______',
  answer: 'We are ready for the exam.', validation: EN, sectionId: S_P,
}));
out.push(mk('en-pc-dict-ready', 'dictation', 'medium', 'recall', [C], {
  instruction: 'Duyduğunu yaz:', audioText: 'We are ready for the exam.',
  answer: 'We are ready for the exam.', validation: EN, audio: listenEn('We are ready for the exam.'), sectionId: S_C,
}));

// ek üretim turu (100 barajı): ikinci cümle varyantları + fill
const EXTRA_SENT: Array<[string, string, string, string, string]> = [
  ['en-pc-x-interested', 'Sporla ilgileniyor musun?', 'Are you interested in sports?', S_A, A],
  ['en-pc-x-good', 'Matematikte iyiyim.', 'I am good at maths.', S_A, A],
  ['en-pc-x-listen', 'Öğretmeni dinle.', 'Listen to the teacher.', S_A, A],
  ['en-pc-x-wait', 'Beni bekle!', 'Wait for me!', S_B, B],
  ['en-pc-x-depend', 'Sonuç sana bağlı.', 'It depends on you.', S_B, B],
  ['en-pc-x-believe', 'Hayallerine inan.', 'Believe in your dreams.', S_B, B],
  ['en-pc-x-attention', 'Derse dikkat et.', 'Pay attention to the lesson.', S_C, C],
  ['en-pc-x-afraid', 'Karanlıktan korkarım.', 'I am afraid of the dark.', S_C, C],
  ['en-pc-x-ready', 'Yarın için hazır mısın?', 'Are you ready for tomorrow?', S_C, C],
  ['en-pc-x-different', 'Benim fikrim seninkinden farklı.', 'My idea is different from yours.', S_C, C],
];
EXTRA_SENT.forEach(([id, tr, en, sec, con]) => {
  out.push(mk(id, 'free-text', 'hard', 'production', [con, P], {
    instruction: 'Türkçeden çevir (öbek):', prompt: `${tr} → ______`,
    answer: en, validation: EN, audio: answerEn(en), sectionId: sec,
  }));
  const seq = en.split(' ');
  out.push(mk(`${id}-wb`, 'word-bank-translation', 'medium', 'production', [P], {
    instruction: 'Kutucuklarla kur (öbek):', answer: en,
    wordBank: { direction: 'tr-to-en', sourceText: tr, targetLanguage: 'en',
      tokens: tok(...seq, 'for', 'in', 'at'),
      acceptedSequences: [seq] },
    sectionId: S_P,
  }));
});

export const EN_EXERCISES_PREPOSITIONS: Exercise[] = out;
