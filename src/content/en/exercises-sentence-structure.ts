/**
 * Sentence Structure — cümle iskeleti (SVO, yer+zaman, soru, genişletme, bağlaç).
 * Hedef: ≥100 benzersiz birincil alıştırma, üretim ağırlıklı.
 */

import { EN, EXACT_EN, listenEn, answerEn, enEx, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const T = 'en.sentence-structure';
const TT = 'Sentence Structure';
const SVO = 'ss.svo.core';
const SVOT = 'ss.svo.time';
const PT = 'ss.place-time.order';
const QD = 'ss.questions.direct';
const QI = 'ss.questions.indirect';
const EXP = 'ss.expansion.steps';
const CON = 'ss.connectors.basic';
const MIST = 'ss.mistakes.order';

type R = Partial<Exercise> & { instruction: string };
const mk = (
  id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'],
  c: string[], rest: R,
) => enEx(T, TT, id, type, d, s, c, rest);

const S_SVO = 'sentence-structure.svo';
const S_PT = 'sentence-structure.place-time';
const S_Q = 'sentence-structure.questions';
const S_EXP = 'sentence-structure.expansion';
const S_CON = 'sentence-structure.connectors';
const S_M = 'sentence-structure.mistakes';

interface Sent { tr: string; en: string; chipExtra: string[]; sectionId: string; concepts: string[]; }

const CORE: Sent[] = [
  { tr: 'Her akşam İngilizce çalışırım.', en: 'I study English every evening.', chipExtra: ['studies', 'at'], sectionId: S_SVO, concepts: [SVO, SVOT] },
  { tr: 'O her gün kahve içer.', en: 'She drinks coffee every day.', chipExtra: ['drink', 'a'], sectionId: S_SVO, concepts: [SVO, SVOT] },
  { tr: 'Biz parkta futbol oynarız.', en: 'We play football in the park.', chipExtra: ['plays', 'at'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Onlar kütüphanede ders çalışır.', en: 'They study in the library every evening.', chipExtra: ['studies', 'on'], sectionId: S_PT, concepts: [PT, SVOT] },
  { tr: 'Annem lezzetli yemekler yapar.', en: 'My mother cooks delicious meals.', chipExtra: ['cook', 'meal'], sectionId: S_SVO, concepts: [SVO] },
  { tr: 'Babam işe otobüsle gider.', en: 'My father goes to work by bus.', chipExtra: ['go', 'with'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Kardeşim okulda İngilizce öğreniyor.', en: 'My brother learns English at school.', chipExtra: ['learn', 'in'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Her sabah kitap okurum.', en: 'I read books every morning.', chipExtra: ['reads', 'a'], sectionId: S_SVO, concepts: [SVO, SVOT] },
  { tr: 'Kedim bahçede uyur.', en: 'My cat sleeps in the garden.', chipExtra: ['sleep', 'on'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Arkadaşlarımla sinemada film izlerim.', en: 'I watch films with my friends at the cinema.', chipExtra: ['watches', 'in'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Öğretmenimiz bize her gün ödev verir.', en: 'Our teacher gives us homework every day.', chipExtra: ['give', 'a'], sectionId: S_SVO, concepts: [SVO, SVOT] },
  { tr: 'Hafta sonu ailemi ziyaret ederim.', en: 'I visit my family at the weekend.', chipExtra: ['visits', 'on'], sectionId: S_PT, concepts: [PT] },
  { tr: 'Çocuklar bahçede oynar.', en: 'The children play in the garden.', chipExtra: ['plays', 'at'], sectionId: S_SVO, concepts: [SVO] },
  { tr: 'Komşumuz bize yardım eder.', en: 'Our neighbour helps us every week.', chipExtra: ['help', 'helps'], sectionId: S_SVO, concepts: [SVO, SVOT] },
  { tr: 'Her akşam yürüyüşe çıkarız.', en: 'We go for a walk every evening.', chipExtra: ['goes', 'a'], sectionId: S_SVO, concepts: [SVOT] },
];

function shuffled(words: string[], seed: number): string[] {
  const a = [...words];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = (seed * 7 + i * 13) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const out: Exercise[] = [];
let n = 0;

// 1) CORE: her cümle için ordering + word-bank + free-text (45)
CORE.forEach((s, i) => {
  const tokens = s.en.split(' ');
  out.push(mk(`en-ss-order-${i}`, 'ordering', i % 3 === 0 ? 'easy' : 'medium', 'production', s.concepts, {
    instruction: 'Kelimeleri doğru sıraya diz:',
    prompt: `${s.tr} → (${tokens.join(' / ')})`,
    answer: s.en,
    words: shuffled([...tokens, ...s.chipExtra.slice(0, 1)], i + 3),
    sectionId: s.sectionId,
  }));
  n += 1;
  const seq = s.en.split(' ');
  out.push(mk(`en-ss-wb-${i}`, 'word-bank-translation', 'medium', 'production', s.concepts, {
    instruction: 'Kutucuklarla kur:',
    answer: s.en,
    wordBank: {
      direction: 'tr-to-en', sourceText: s.tr, targetLanguage: 'en',
      tokens: tok(...shuffled([...seq, ...s.chipExtra.slice(0, 2)], i + 11)),
      acceptedSequences: [seq],
    },
    sectionId: s.sectionId,
  }));
  n += 1;
  out.push(mk(`en-ss-tr-${i}`, 'free-text', 'hard', 'production', s.concepts, {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: `${s.tr} → ______`,
    answer: s.en,
    validation: EN,
    audio: answerEn(s.en),
    sectionId: s.sectionId,
  }));
  n += 1;
});

// 2) SVO MC (10)
const SVO_MC: Array<[string, string, string[]]> = [
  ['I ___ English.', 'study', ['study', 'studies', 'studying', 'studied']],
  ['She ___ coffee.', 'drinks', ['drinks', 'drink', 'drinking', 'drunk']],
  ['They ___ in the library.', 'study', ['study', 'studies', 'studying', 'studied']],
  ['He ___ to work by bus.', 'goes', ['goes', 'go', 'going', 'went']],
  ['We ___ football.', 'play', ['play', 'plays', 'playing', 'played']],
  ['My mother ___ meals.', 'cooks', ['cooks', 'cook', 'cooking', 'cooked']],
  ['The children ___ in the garden.', 'play', ['play', 'plays', 'playing', 'played']],
  ['Our teacher ___ us homework.', 'gives', ['gives', 'give', 'giving', 'gave']],
  ['I ___ books every morning.', 'read', ['read', 'reads', 'reading', 'red']],
  ['My cat ___ in the garden.', 'sleeps', ['sleeps', 'sleep', 'sleeping', 'slept']],
];
SVO_MC.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-svo-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [SVO], {
    instruction: 'Doğru fiili seç (özne-fiil uyumu):',
    prompt, answer: ans, options: opts, sectionId: S_SVO,
  }));
});

// 3) Yer+zaman MC + fill (12)
const PT_MC: Array<[string, string, string[]]> = [
  ['I study English ___ (every evening / in the evening every).', 'every evening', ['every evening', 'evening every', 'every evenings', 'an evening every']],
  ['We play football ___.', 'in the park', ['in the park', 'in park the', 'at the park in', 'park in the']],
  ['Doğru sıra hangisi?', 'I study English every evening.', ['I study English every evening.', 'I every evening study English.', 'I study every evening English.', 'Every I study English evening.']],
  ['Doğru sıra hangisi?', 'They study in the library every evening.', ['They study in the library every evening.', 'They study every evening in the library every.', 'They in the library study every evening.', 'They study library in every evening.']],
  ['Yer + zaman kuralı nedir?', 'place before time', ['place before time', 'time before place always', 'time only, no place', 'place after time always']],
  ['I visit my family ___.', 'at the weekend', ['at the weekend', 'at weekend the', 'in the weekend', 'on weekend']],
];
PT_MC.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-pt-mc-${i}`, 'multiple-choice', i < 2 ? 'easy' : 'medium', 'recognition', [PT], {
    instruction: 'Doğru sırayı seç (yer + zaman):',
    prompt, answer: ans, options: opts, sectionId: S_PT,
  }));
});
[['en-ss-pt-fill-park', 'They study ___ the library every evening. (in)', 'in'],
  ['en-ss-pt-fill-weekend', 'I visit my family ___ the weekend. (at)', 'at'],
  ['en-ss-pt-fill-evening', 'I study English ___ evening. (every)', 'every'],
  ['en-ss-pt-fill-garden', 'My cat sleeps ___ the garden. (in)', 'in'],
  ['en-ss-pt-fill-bus', 'He goes to work ___ bus. (by)', 'by'],
  ['en-ss-pt-fill-friends', 'I watch films ___ my friends. (with)', 'with'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'fill-blank', 'easy', 'recall', [PT], {
    instruction: 'Boşluğu doldur (yer/zaman):', prompt, answer: ans as string, validation: EXACT_EN, sectionId: S_PT,
  }));
});

// 4) Soru düzeni (16)
const QDIR: Array<[string, string, string[]]> = [
  ['Banka nerede? → ______', 'Where is the bank?', ['Where is the bank?', 'Where the bank is?', 'Where is bank the?', 'Where the bank it is?']],
  ['Okul nerede? → ______', 'Where is the school?', ['Where is the school?', 'Where the school is?', 'Where is school the?', 'Where the school it is?']],
  ['Ne zaman başlar? (ders) → ______', 'When does the lesson start?', ['When does the lesson start?', 'When the lesson starts?', 'When does start the lesson?', 'When start does the lesson?']],
  ['Ne yapıyorsun? → ______', 'What are you doing?', ['What are you doing?', 'What you are doing?', 'What do you doing?', 'What are you do?']],
];
QDIR.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-qdir-mc-${i}`, 'multiple-choice', 'medium', 'recognition', [QD], {
    instruction: 'Doğru soru hangisi?', prompt, answer: ans, options: opts, sectionId: S_Q,
  }));
});
out.push(mk('en-ss-qdir-fill-is', 'fill-blank', 'easy', 'recall', [QD], {
  instruction: 'Soruyu tamamla — Banka nerede?', prompt: 'Where ___ the bank? (is)', answer: 'is', validation: EXACT_EN, sectionId: S_Q,
}));
out.push(mk('en-ss-qdir-fill-does', 'fill-blank', 'medium', 'recall', [QD], {
  instruction: 'Soruyu tamamla — Ders ne zaman başlar?', prompt: 'When ___ the lesson start? (does)', answer: 'does', validation: EXACT_EN, sectionId: S_Q,
}));
const QIND: Array<[string, string, string[]]> = [
  ['Doğru dolaylı soru hangisi?', 'Do you know where the bank is?', ['Do you know where the bank is?', 'Do you know where is the bank?', 'Do you know where the bank it is?', 'Do you know where is bank?']],
  ['Doğru dolaylı soru hangisi?', 'Can you tell me where the station is?', ['Can you tell me where the station is?', 'Can you tell me where is the station?', 'Can you tell me where the station it is?', 'Can you tell me where is station?']],
  ['Hatalı olanı bul:', 'Do you know where is the bank? ❌', ['Do you know where is the bank? ❌', 'Do you know where the bank is? ✅', 'Can you tell me where it is? ✅', 'Do you know what time it is? ✅']],
  ['Hatalı olanı bul:', 'Do you know where the bank it is? ❌', ['Do you know where the bank it is? ❌', 'Do you know where the bank is? ✅', 'Do you know where she lives? ✅', 'Can you tell me where he works? ✅']],
];
QIND.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-qind-mc-${i}`, 'multiple-choice', 'medium', 'recognition', [QI], {
    instruction: 'Dolaylı soru düzeni:', prompt, answer: ans, options: opts, sectionId: S_Q,
  }));
});
out.push(mk('en-ss-qind-err-bank', 'error-correction', 'medium', 'correction', [QI, MIST], {
  instruction: 'Dolaylı soruyu düzelt:', prompt: 'Do you know where the bank it is?',
  answer: 'Do you know where the bank is?',
  explanation: 'Dolaylı soruda fiil sonda, fazladan “it” yok: where the bank is. ✅', validation: EN, sectionId: S_M,
}));
out.push(mk('en-ss-qind-err-is', 'error-correction', 'medium', 'correction', [QI, MIST], {
  instruction: 'Dolaylı soruyu düzelt:', prompt: 'Do you know where is the bank?',
  answer: 'Do you know where the bank is?',
  explanation: 'Dolaylı soruda devrik yapı yok.', validation: EN, sectionId: S_M,
}));
out.push(mk('en-ss-qind-free-bank', 'free-text', 'hard', 'production', [QI], {
  instruction: 'Türkçeden çevir — Bankanın nerede olduğunu biliyor musun?',
  prompt: 'Bankanın nerede olduğunu biliyor musun? → ______',
  answer: 'Do you know where the bank is?', validation: EN, audio: answerEn('Do you know where the bank is?'), sectionId: S_Q,
}));
out.push(mk('en-ss-qdir-free-school', 'free-text', 'medium', 'production', [QD], {
  instruction: 'Soruyu yaz — Okul nerede?', prompt: 'Okul nerede? → ______',
  answer: 'Where is the school?', validation: EN, sectionId: S_Q,
}));
// dinleme: soru düzeni
out.push(mk('en-ss-listen-bank', 'listen-choice', 'medium', 'recognition', [QD], {
  instruction: 'Duyduğun soruyu seç:', audioText: 'Where is the bank?',
  answer: 'Where is the bank?',
  options: ['Where is the bank?', 'Where the bank is?', 'Where the bank it is?', 'Where is bank the?'],
  audio: listenEn('Where is the bank?'), sectionId: S_Q,
}));
out.push(mk('en-ss-dict-svo', 'dictation', 'medium', 'recall', [SVO], {
  instruction: 'Duyduğunu yaz:', audioText: 'I study English every evening.',
  answer: 'I study English every evening.', validation: EN, audio: listenEn('I study English every evening.'), sectionId: S_SVO,
}));

// 5) Genişletme (10)
const EXPAND: Array<[string, string, string[]]> = [
  ['I study English. → zaman ekle:', 'I study English every day.', ['I study English every day.', 'I study every day English.', 'I every day study English.', 'I study English every days.']],
  ['I study English every day. → neden ekle:', 'I study English every day because I want to study abroad.', ['I study English every day because I want to study abroad.', 'I study English every day because I want study abroad.', 'I study English every day because want to study abroad.', 'I study English every day because to study abroad.']],
  ['Hangisi doğal genişletmedir?', 'I have studied English for two years because I love it.', ['I have studied English for two years because I love it.', 'I have studied English for two years because I love.', 'I have studied English since two years because I love it.', 'I have study English for two years because I love it.']],
];
EXPAND.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-exp-mc-${i}`, 'multiple-choice', 'medium', 'recognition', [EXP], {
    instruction: 'Cümleyi doğal biçimde genişlet:', prompt, answer: ans, options: opts, sectionId: S_EXP,
  }));
});
out.push(mk('en-ss-exp-free-day', 'free-text', 'hard', 'production', [EXP], {
  instruction: 'Cümleyi genişlet — I study English. + every day:',
  prompt: 'I study English. + every day → ______', answer: 'I study English every day.', validation: EN, sectionId: S_EXP,
}));
out.push(mk('en-ss-exp-free-because', 'free-text', 'hard', 'production', [EXP], {
  instruction: 'Cümleyi genişlet — …because I want to study abroad:',
  prompt: 'I study English every day + because … → ______',
  answer: 'I study English every day because I want to study abroad.', validation: EN, sectionId: S_EXP,
}));
out.push(mk('en-ss-exp-wb-because', 'word-bank-translation', 'medium', 'production', [EXP], {
  instruction: 'Kutucuklarla kur — Her gün İngilizce çalışırım çünkü yurt dışında okumak istiyorum.',
  answer: 'I study English every day because I want to study abroad.',
  wordBank: { direction: 'tr-to-en', sourceText: 'Her gün İngilizce çalışırım çünkü yurt dışında okumak istiyorum.', targetLanguage: 'en',
    tokens: tok('I', 'study', 'English', 'every', 'day', 'because', 'I', 'want', 'to', 'study', 'abroad.', 'studies', 'for'),
    acceptedSequences: [['I', 'study', 'English', 'every', 'day', 'because', 'I', 'want', 'to', 'study', 'abroad.']] },
  sectionId: S_EXP,
}));
out.push(mk('en-ss-exp-order-abroad', 'ordering', 'medium', 'production', [EXP], {
  instruction: 'Sırala — Her gün İngilizce çalışırım çünkü…',
  prompt: 'abroad. / study / I / day / because / to / want / every / English / I / study',
  answer: 'I study English every day because I want to study abroad.',
  words: ['study', 'I', 'abroad.', 'because', 'English', 'to', 'every', 'I', 'want', 'study', 'day'],
  sectionId: S_EXP,
}));
out.push(mk('en-ss-exp-spoken', 'spoken', 'medium', 'production', [EXP], {
  instruction: 'Yüksek sesle söyle — cümleni genişlet:', prompt: 'I study English. → every day → because…',
  sampleAnswer: 'I study English every day because I want to study abroad.',
  requirements: ['SVO iskelet', 'zaman (every day)', 'because cümlesi'], sectionId: S_EXP,
}));
out.push(mk('en-ss-exp-listen', 'listen-choice', 'easy', 'recognition', [EXP], {
  instruction: 'Duyduğunu seç:', audioText: 'I study English every day because I want to study abroad.',
  answer: 'I study English every day because I want to study abroad.',
  options: ['I study English every day because I want to study abroad.', 'I study English every day because I want study abroad.', 'I study English every day because want to study abroad.', 'I study every day English because I want to study abroad.'],
  audio: listenEn('I study English every day because I want to study abroad.'), sectionId: S_EXP,
}));

// 6) Bağlaçlar (12)
const CONJ: Array<[string, string, string[]]> = [
  ['Boşluğu doldur — … ___ it was raining.', 'but', ['but', 'and', 'because', 'so']],
  ['Boşluğu doldur — I study English ___ I want to study abroad.', 'because', ['because', 'but', 'however', 'and then']],
  ['Boşluğu doldur — It was late, ___ we went home.', 'so', ['so', 'because', 'but however', 'and because']],
  ['Hangisi zıtlık verir?', 'I like coffee, but my brother likes tea.', ['I like coffee, but my brother likes tea.', 'I like coffee, because my brother likes tea.', 'I like coffee, so my brother likes tea.', 'I like coffee, and but my brother likes tea.']],
  ['Hangisi sonuç verir?', 'It was raining, so we stayed at home.', ['It was raining, so we stayed at home.', 'It was raining, because we stayed at home.', 'It was raining, but we stayed at home however.', 'It was raining, and because we stayed at home.']],
];
CONJ.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-ss-conj-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [CON], {
    instruction: 'Doğru bağlacı seç:', prompt, answer: ans, options: opts, sectionId: S_CON,
  }));
});
[['en-ss-conj-fill-because', 'I study English ___ I want a better job. (because)', 'because'],
  ['en-ss-conj-fill-but', 'I like tea, ___ she likes coffee. (but)', 'but'],
  ['en-ss-conj-fill-so', 'I was tired, ___ I went to bed. (so)', 'so'],
  ['en-ss-conj-fill-however', 'It was expensive. ___, I bought it. (However)', 'However'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'fill-blank', 'easy', 'recall', [CON], {
    instruction: 'Bağlacı yaz:', prompt, answer: ans as string, validation: EXACT_EN, sectionId: S_CON,
  }));
});
out.push(mk('en-ss-conj-free-because', 'free-text', 'medium', 'production', [CON], {
  instruction: 'Türkçeden çevir — Yurt dışında okumak istediğim için İngilizce çalışıyorum.',
  prompt: '…çünkü… → ______', answer: 'I study English because I want to study abroad.', validation: EN, sectionId: S_CON,
}));
out.push(mk('en-ss-conj-err-however', 'error-correction', 'medium', 'correction', [CON], {
  instruction: 'Cümleyi düzelt (however cümle başında):', prompt: 'I like coffee however my brother likes tea.',
  answer: 'I like coffee. However, my brother likes tea.',
  explanation: 'however iki cümleyi tek başına bağlamaz; nokta + However, ile başla.', validation: EN, sectionId: S_CON,
}));
out.push(mk('en-ss-conj-wb-so', 'word-bank-translation', 'medium', 'production', [CON], {
  instruction: 'Kutucuklarla kur — Geçti, bu yüzden eve gittik.',
  answer: 'It was late, so we went home.',
  wordBank: { direction: 'tr-to-en', sourceText: 'Geçti, bu yüzden eve gittik.', targetLanguage: 'en',
    tokens: tok('It', 'was', 'late,', 'so', 'we', 'went', 'home.', 'because', 'but'),
    acceptedSequences: [['It', 'was', 'late,', 'so', 'we', 'went', 'home.']] },
  sectionId: S_CON,
}));

// 7) Hata düzeltme + karışık üretim (kalanı 100'e tamamla)
out.push(mk('en-ss-mist-err-order', 'error-correction', 'medium', 'correction', [MIST, SVO], {
  instruction: 'Sırayı düzelt:', prompt: 'I every evening study English.',
  answer: 'I study English every evening.', explanation: 'SVO korunur, zaman sonda: S + V + O + time.', validation: EN, sectionId: S_M,
}));
out.push(mk('en-ss-mist-err-place', 'error-correction', 'medium', 'correction', [MIST, PT], {
  instruction: 'Sırayı düzelt:', prompt: 'They study every evening in the library.',
  answer: 'They study in the library every evening.',
  explanation: 'Doğal sıra yer + zaman: place before time.', validation: EN, sectionId: S_M,
}));
out.push(mk('en-ss-spoken-svo', 'spoken', 'easy', 'production', [SVO], {
  instruction: 'Yüksek sesle söyle:', prompt: 'I study English every evening.',
  sampleAnswer: 'I study English every evening.', requirements: ['özne + fiil + nesne', 'zaman sonda'], sectionId: S_SVO,
}));
out.push(mk('en-ss-spoken-question', 'spoken', 'medium', 'production', [QD], {
  instruction: 'Soruyu yüksek sesle sor:', prompt: 'Where is the bank?',
  sampleAnswer: 'Where is the bank?', requirements: ['soru kelimesi başta', 'is + özne sırası'], sectionId: S_Q,
}));
// dinleme ekle
out.push(mk('en-ss-listen-park', 'listen-choice', 'easy', 'recognition', [PT], {
  instruction: 'Duyduğunu seç:', audioText: 'We play football in the park.',
  answer: 'We play football in the park.',
  options: ['We play football in the park.', 'We play football at the park in.', 'We football play in the park.', 'We play in the park football.'],
  audio: listenEn('We play football in the park.'), sectionId: S_PT,
}));
out.push(mk('en-ss-dict-bank', 'dictation', 'medium', 'recall', [QI], {
  instruction: 'Duyduğunu yaz:', audioText: 'Do you know where the bank is?',
  answer: 'Do you know where the bank is?', validation: EN, audio: listenEn('Do you know where the bank is?'), sectionId: S_Q,
}));

export const EN_EXERCISES_SENTENCE_STRUCTURE: Exercise[] = out;
