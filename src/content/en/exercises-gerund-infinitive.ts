/**
 * Gerund & Infinitive — yüksek frekanslı kalıplar (chunk).
 * Hedef: ≥100 benzersiz birincil alıştırma.
 */

import { EN, EXACT_EN, listenEn, answerEn, enEx, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const T = 'en.gerund-infinitive';
const TT = 'Gerund & Infinitive';
const G = 'gi.gerund.chunks';
const I = 'gi.infinitive.chunks';
const LF = 'gi.look-forward.doing';
const P = 'gi.production.choice';
const M = 'gi.mistakes.chunks';

type R = Partial<Exercise> & { instruction: string };
const mk = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: R) =>
  enEx(T, TT, id, type, d, s, c, rest);

const S_G = 'gerund-infinitive.gerund';
const S_I = 'gerund-infinitive.infinitive';
const S_LF = 'gerund-infinitive.look-forward';
const S_P = 'gerund-infinitive.production';
const S_M = 'gerund-infinitive.mistakes';

const GERUND: Array<[string, string, string]> = [
  ['Futbol oynamayı severim.', 'I enjoy playing football.', 'enjoy'],
  ['Ödevini bitirdi.', 'She finished doing her homework.', 'finish'],
  ['Sigaradan kaçınır.', 'He avoids smoking.', 'avoid'],
  ['Çalışmaya devam et.', 'Keep studying.', 'keep'],
  ['Yüzmeyi sever misin?', 'Do you enjoy swimming?', 'enjoy'],
  ['Bahane uydurmayı bırak.', 'Stop making excuses.', 'stop'],
  ['Geç kalmaktan nefret ederim.', 'I hate being late.', 'hate'],
  ['Kitap okumayı sever.', 'She loves reading books.', 'love'],
  ['Yeni diller öğrenmeyi severim.', 'I like learning new languages.', 'like'],
  ['Koşmayı bıraktı.', 'He stopped running.', 'stop'],
  ['Film izlemeyi özledim.', 'I miss watching films.', 'miss'],
  ['Tartışmayı bitirdiler.', 'They finished arguing.', 'finish'],
];

const INFINITIVE: Array<[string, string, string]> = [
  ['Sana yardım etmek istiyorum.', 'I want to help you.', 'want'],
  ['Erken kalkmaya karar verdi.', 'She decided to get up early.', 'decide'],
  ['Yeni bir telefona ihtiyacım var (almaya).', 'I need to buy a new phone.', 'need'],
  ['Yurt dışında okumayı planlıyorum.', 'I plan to study abroad.', 'plan'],
  ['Yağmurun durmasını umuyoruz.', 'We hope to finish soon.', 'hope'],
  ['İngilizce öğrenmek istiyor.', 'He wants to learn English.', 'want'],
  ['Doktor olmayı hayal ediyor.', 'She dreams to be a doctor.', 'dream'],
  ['Söz vermeyi unuttu.', 'He promised to call.', 'promise'],
  ['Erken gelmeye çalış.', 'Try to come early.', 'try'],
  ['Bana yardım etmeyi teklif etti.', 'She offered to help me.', 'offer'],
  ['Kalp kırmamaya dikkat et.', 'Be careful not to be late.', 'careful'],
  ['Yarın aramaya söz verdi.', 'He agreed to call tomorrow.', 'agree'],
];

const out: Exercise[] = [];

// kalıp tanıma MC (16)
GERUND.slice(0, 8).forEach(([tr, en, verb], i) => {
  const doing = en.split(' ').find((w) => w.endsWith('ing')) ?? 'doing';
  out.push(mk(`en-gi-g-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [G], {
    instruction: `“${verb}” sonrası hangisi gelir? — ${tr}`,
    prompt: `${verb} → ?`, answer: doing.replace(/[.?!]$/, ''),
    options: [doing.replace(/[.?!]$/, ''), `to ${doing.replace(/[.?!]$/, '').replace(/ing$/, '')}`, doing.replace(/ing$/, ''), `to ${doing.replace(/[.?!]$/, '')}`],
    sectionId: S_G,
  }));
});
INFINITIVE.slice(0, 8).forEach(([tr, en, verb], i) => {
  const m = en.match(/to (\w+)/);
  const inf = m ? `to ${m[1]}` : 'to do';
  const base = m ? m[1] : 'do';
  out.push(mk(`en-gi-i-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [I], {
    instruction: `“${verb}” sonrası hangisi gelir? — ${tr}`,
    prompt: `${verb} → ?`, answer: inf,
    options: [inf, `${base}ing`, base, `to ${base}ing`],
    sectionId: S_I,
  }));
});

// fill (16)
GERUND.forEach(([tr, en], i) => {
  const doing = (en.split(' ').find((w) => /ing[.]?$/.test(w)) ?? 'doing').replace(/[.?!]$/, '');
  out.push(mk(`en-gi-g-fill-${i}`, 'fill-blank', 'easy', 'recall', [G], {
    instruction: `Boşluğu doldur — ${tr}`, prompt: en.replace(doing, '___'), answer: doing, validation: EXACT_EN, sectionId: S_G,
  }));
});
INFINITIVE.forEach(([tr, en], i) => {
  const m = en.match(/to \w+/);
  const inf = (m?.[0] ?? 'to do').replace(/[.?!]$/, '');
  out.push(mk(`en-gi-i-fill-${i}`, 'fill-blank', 'easy', 'recall', [I], {
    instruction: `Boşluğu doldur — ${tr}`, prompt: en.replace(inf, '___'), answer: inf, validation: EXACT_EN, sectionId: S_I,
  }));
});

// look forward (8)
const LF_S: Array<[string, string]> = [
  ['Seni görmeyi dört gözle bekliyorum.', 'I look forward to seeing you.'],
  ['Cevabını bekliyorum.', 'I look forward to hearing from you.'],
  ['Onunla çalışmayı bekliyorum.', 'I look forward to working with him.'],
  ['Tatili dört gözle bekliyoruz.', 'We look forward to going on holiday.'],
];
LF_S.forEach(([tr, en], i) => {
  const wrongTo = en.replace(/seeing|hearing|working|going/, 'to see').replace('to seeing', 'to see').replace('to hearing', 'to hear').replace('to working', 'to work').replace('to going', 'to go');
  const wrongNoTo = en.replace('look forward to ', 'look forward ');
  const wrongDouble = en.replace('look forward to', 'look forward to to');
  const opts = [...new Set([en, wrongTo, wrongNoTo, wrongDouble])];
  // tekillik garantisi: çakışırsa anlamlı dördüncü çeldirici
  const fillers = ['I look forward to meeting you.', 'We look forward to working together.', 'She looks forward to seeing us.', 'They look forward to hearing from you.'];
  let fi = 0;
  while (opts.length < 4 && fi < fillers.length) {
    if (!opts.includes(fillers[fi]) && fillers[fi] !== en) opts.push(fillers[fi]);
    fi += 1;
  }
  out.push(mk(`en-gi-lf-mc-${i}`, 'multiple-choice', 'medium', 'recognition', [LF], {
    instruction: 'Doğru “look forward to” hangisi?',
    prompt: tr, answer: en,
    options: opts.slice(0, 4),
    sectionId: S_LF,
  }));
  out.push(mk(`en-gi-lf-fill-${i}`, 'fill-blank', 'medium', 'recall', [LF], {
    instruction: `Boşluğu doldur — ${tr}`,
    prompt: en.replace(/seeing|hearing|working|going/, '___'),
    answer: (en.match(/seeing|hearing|working|going/)?.[0] ?? 'seeing'),
    validation: EXACT_EN, sectionId: S_LF,
  }));
});

// üretim: free-text + wb + ordering (her kalıp için)
[...GERUND.map(([tr, en]) => ({ tr, en, c: [G, P], s: S_P })), ...INFINITIVE.map(([tr, en]) => ({ tr, en, c: [I, P], s: S_P }))].forEach(({ tr, en, c, s }, i) => {
  out.push(mk(`en-gi-tr-${i}`, 'free-text', 'hard', 'production', c, {
    instruction: 'Türkçeden çevir (kalıba dikkat):', prompt: `${tr} → ______`,
    answer: en, validation: EN, audio: answerEn(en), sectionId: s,
  }));
});
[...GERUND.slice(0, 6).map(([tr, en]) => ({ tr, en })), ...INFINITIVE.slice(0, 6).map(([tr, en]) => ({ tr, en }))].forEach(({ tr, en }, i) => {
  const seq = en.split(' ');
  out.push(mk(`en-gi-wb-${i}`, 'word-bank-translation', 'medium', 'production', [P], {
    instruction: 'Kutucuklarla kur:', answer: en,
    wordBank: { direction: 'tr-to-en', sourceText: tr, targetLanguage: 'en',
      tokens: tok(...seq, 'to', 'doing', 'to do'),
      acceptedSequences: [seq] },
    sectionId: S_P,
  }));
});
[...GERUND.slice(6, 10).map(([tr, en]) => ({ tr, en })), ...INFINITIVE.slice(6, 10).map(([tr, en]) => ({ tr, en }))].forEach(({ tr, en }, i) => {
  const tokens = en.split(' ');
  const padded = tokens.length >= 4 ? [...tokens.slice(1), tokens[0]] : [...tokens, 'every', 'day', 'now', 'today'].slice(0, 4).sort(() => 0);
  // deterministik karıştırma + en az 4 çip
  const words = [...tokens];
  for (const extra of ['every', 'day', 'to', 'now']) {
    if (words.length >= Math.max(4, tokens.length + 1)) break;
    if (!words.includes(extra)) words.push(extra);
  }
  const mixed = [...words.slice(1), words[0]];
  void padded;
  out.push(mk(`en-gi-order-${i}`, 'ordering', 'medium', 'production', [P], {
    instruction: 'Sırala (kalıba dikkat):', prompt: `${tr} → (${tokens.join(' / ')})`,
    answer: en, words: mixed.length >= 4 ? mixed : [...mixed, 'now', 'today'].slice(0, 4),
    sectionId: S_P,
  }));
});

// hata düzeltme (10) — bilinen hatalar
const ERRS: Array<[string, string, string]> = [
  ['en-gi-err-enjoy', 'I enjoy to visit museums.', 'I enjoy visiting museums.'],
  ['en-gi-err-decide', 'She decide take the bus.', 'She decided to take the bus.'],
  ['en-gi-err-look', 'I look forward to see you.', 'I look forward to seeing you.'],
  ['en-gi-err-avoid', 'He avoids to smoke.', 'He avoids smoking.'],
  ['en-gi-err-keep', 'Keep to study every day.', 'Keep studying every day.'],
  ['en-gi-err-want', 'I want learn English.', 'I want to learn English.'],
  ['en-gi-err-plan', 'I plan study abroad.', 'I plan to study abroad.'],
  ['en-gi-err-finish', 'She finished to do her homework.', 'She finished doing her homework.'],
  ['en-gi-err-hope', 'We hope finish soon.', 'We hope to finish soon.'],
  ['en-gi-err-stop', 'He stopped to run every morning. (alışkanlığı bıraktı)', 'He stopped running every morning.'],
];
ERRS.forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'error-correction', 'medium', 'correction', [M, P], {
    instruction: 'Kalıp hatasını düzelt (chunk olarak ezberle):', prompt, answer: ans,
    explanation: 'Yüksek frekanslı kalıplar bütün hâlinde öğrenilir.',
    validation: EN, sectionId: S_M,
  }));
});

// dinleme + dikte + spoken
out.push(mk('en-gi-listen-enjoy', 'listen-choice', 'easy', 'recognition', [G], {
  instruction: 'Duyduğunu seç:', audioText: 'I enjoy playing football.',
  answer: 'I enjoy playing football.',
  options: ['I enjoy playing football.', 'I enjoy to play football.', 'I enjoy play football.', 'I enjoys playing football.'],
  audio: listenEn('I enjoy playing football.'), sectionId: S_G,
}));
out.push(mk('en-gi-listen-decide', 'listen-choice', 'easy', 'recognition', [I], {
  instruction: 'Duyduğunu seç:', audioText: 'She decided to get up early.',
  answer: 'She decided to get up early.',
  options: ['She decided to get up early.', 'She decided getting up early.', 'She decide to get up early.', 'She decided get up early.'],
  audio: listenEn('She decided to get up early.'), sectionId: S_I,
}));
out.push(mk('en-gi-dict-look', 'dictation', 'medium', 'recall', [LF], {
  instruction: 'Duyduğunu yaz:', audioText: 'I look forward to seeing you.',
  answer: 'I look forward to seeing you.', validation: EN, audio: listenEn('I look forward to seeing you.'), sectionId: S_LF,
}));
out.push(mk('en-gi-dict-want', 'dictation', 'medium', 'recall', [I], {
  instruction: 'Duyduğunu yaz:', audioText: 'I want to learn English.',
  answer: 'I want to learn English.', validation: EN, audio: listenEn('I want to learn English.'), sectionId: S_I,
}));
out.push(mk('en-gi-spoken-enjoy', 'spoken', 'medium', 'production', [G], {
  instruction: 'Yüksek sesle söyle (kalıp):', prompt: 'I enjoy playing football.',
  sampleAnswer: 'I enjoy playing football.', requirements: ['enjoy + doing', 'tam cümle'], sectionId: S_G,
}));
out.push(mk('en-gi-spoken-plan', 'spoken', 'medium', 'production', [I], {
  instruction: 'Kendinden söyle:', prompt: 'I plan to study abroad.',
  sampleAnswer: 'I plan to study abroad because I love English.',
  requirements: ['plan + to do', 'neden cümlesi'], sectionId: S_I,
}));
// kişisel üretim serbest
out.push(mk('en-gi-free-personal-1', 'free-text', 'hard', 'production', [G], {
  instruction: 'Kendin yaz — Boş zamanında ne yapmaktan hoşlanırsın?',
  prompt: 'Boş zamanımda … yapmaktan hoşlanırım. → ______',
  answer: 'I enjoy reading books in my free time.', validation: EN, sectionId: S_P,
}));
out.push(mk('en-gi-free-personal-2', 'free-text', 'hard', 'production', [I], {
  instruction: 'Kendin yaz — Gelecek yıl ne yapmaya karar verdin?',
  prompt: 'Gelecek yıl … yapmaya karar verdim. → ______',
  answer: 'I decided to study English every day next year.', validation: EN, sectionId: S_P,
}));

export const EN_EXERCISES_GERUND_INFINITIVE: Exercise[] = out;
