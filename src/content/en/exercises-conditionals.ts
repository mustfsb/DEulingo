/**
 * Conditionals — Zero/First + özellikle Second Conditional.
 * Hedef: ≥100 benzersiz birincil alıştırma, Second ağırlıklı.
 */

import { EN, EXACT_EN, listenEn, answerEn, enEx, tok } from './helpers.ts';
import type { Exercise } from '../types.ts';

const T = 'en.conditionals';
const TT = 'Conditionals';
const ZF = 'cond.zero-first.rule';
const SC = 'cond.second.formula';
const HY = 'cond.second.hypotheticals';
const M = 'cond.mistakes.would';

type R = Partial<Exercise> & { instruction: string };
const mk = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: R) =>
  enEx(T, TT, id, type, d, s, c, rest);

const S_ZF = 'conditionals.zero-first';
const S_SC = 'conditionals.second';
const S_HY = 'conditionals.hypotheticals';
const S_M = 'conditionals.mistakes';

const out: Exercise[] = [];

// Zero/First MC (12)
const ZF_MC: Array<[string, string, string[]]> = [
  ['Su 100 derecede kaynar. → ______', 'If you heat water, it boils.', ['If you heat water, it boils.', 'If you heat water, it will boil tomorrow maybe.', 'If you heated water, it would boil.', 'If you will heat water, it boils.']],
  ['Yağmur yağarsa evde kalırım. → ______', 'If it rains, I will stay at home.', ['If it rains, I will stay at home.', 'If it rains, I would stay at home.', 'If it rained, I will stay at home.', 'If it will rain, I stay at home.']],
  ['Zero hangisidir?', 'If you heat ice, it melts.', ['If you heat ice, it melts.', 'If you heated ice, it would melt.', 'If it rains, I will stay.', 'If I had time, I would study.']],
  ['First hangisidir?', 'If it rains tomorrow, we will cancel.', ['If it rains tomorrow, we will cancel.', 'If it rained, we would cancel.', 'If you heat water, it boils.', 'If I were you, I would go.']],
  ['First formülü nedir?', 'If + Present, will + V1', ['If + Present, will + V1', 'If + Past, would + V1', 'If + Past Perfect, would have + V3', 'If + will, would + V1']],
  ['Zero formülü nedir?', 'If + Present, Present', ['If + Present, Present', 'If + Past, would + V1', 'If + will, will', 'If + would, would']],
];
ZF_MC.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-cond-zf-mc-${i}`, 'multiple-choice', 'easy', 'recognition', [ZF], {
    instruction: 'Zero / First seç:', prompt, answer: ans, options: opts, sectionId: S_ZF,
  }));
});
[['en-cond-zf-fill-boils', 'If you heat water, it ___. (boils)', 'boils'],
  ['en-cond-zf-fill-will', 'If it rains, I ___ stay at home. (will)', 'will'],
  ['en-cond-zf-fill-heat', 'If you ___ ice, it melts. (heat)', 'heat'],
  ['en-cond-zf-fill-rains', 'If it ___ tomorrow, we will cancel. (rains)', 'rains'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'fill-blank', 'easy', 'recall', [ZF], {
    instruction: 'Boşluğu doldur (Zero/First):', prompt, answer: ans as string, validation: EXACT_EN, sectionId: S_ZF,
  }));
});
out.push(mk('en-cond-zf-free-rain', 'free-text', 'medium', 'production', [ZF], {
  instruction: 'Türkçeden çevir — Yağmur yağarsa evde kalırım.',
  prompt: 'Yağmur yağarsa evde kalırım. → ______',
  answer: 'If it rains, I will stay at home.', validation: EN, sectionId: S_ZF,
}));
out.push(mk('en-cond-zf-free-heat', 'free-text', 'medium', 'production', [ZF], {
  instruction: 'Türkçeden çevir — Suyu ısıtırsan kaynar.',
  prompt: 'Suyu ısıtırsan kaynar. → ______',
  answer: 'If you heat water, it boils.', validation: EN, sectionId: S_ZF,
}));

// Second Conditional çekirdek (en büyük blok)
const SECOND: Array<[string, string]> = [
  ['Daha çok zamanım olsaydı daha çok İngilizce çalışırdım.', 'If I had more time, I would study more English.'],
  ['Başka bir ülkede yaşasaydım İngilizcem gelişirdi.', 'If I lived abroad, my English would improve.'],
  ['Daha çok param olsaydı seyahat ederdim.', 'If I had more money, I would travel.'],
  ['Daha çok boş zamanım olsaydı kitap okurdum.', 'If I had more free time, I would read books.'],
  ['Akıcı İngilizce konuşabilseydim yurt dışında çalışırdım.', 'If I could speak English fluently, I would work abroad.'],
  ['Arabam olsaydı işe arabayla giderdim.', 'If I had a car, I would drive to work.'],
  ['Sen olsaydım daha çok çalışırdım.', 'If I were you, I would study harder.'],
  ['Zengin olsaydım ev alırdım.', 'If I were rich, I would buy a house.'],
  ['İngilizce bilseydim bu işi alırdım.', 'If I knew English well, I would get this job.'],
  ['Erken kalksaydım otobüsü kaçırmazdım (kaçırmazdım değil: yakalardım).', 'If I got up early, I would catch the bus.'],
  ['Cesur olsaydım ona sorardım.', 'If I were brave, I would ask her.'],
  ['Sınav yarın olmasaydı dinlenirdim.', 'If the exam were not tomorrow, I would rest.'],
  ['Daha uzun yaşasaydım dünyayı gezerdim.', 'If I lived longer, I would travel the world.'],
  ['Bilgisayarım olsaydı programlama öğrenirdim.', 'If I had a computer, I would learn programming.'],
  ['Zamanım olsaydı sana yardım ederdim.', 'If I had time, I would help you.'],
  ['Hasta olmasaydım partiye gelirdim.', 'If I were not ill, I would come to the party.'],
  ['Türkçe bilseydin işin kolaylaşırdı.', 'If you knew Turkish, your job would be easier.'],
  ['Londra’da yaşasaydım her gün müzeye giderdim.', 'If I lived in London, I would visit museums every day.'],
];

SECOND.forEach(([tr, en], i) => {
  const d = i % 4 === 0 ? 'medium' : 'hard';
  out.push(mk(`en-cond-second-tr-${i}`, 'free-text', d, 'production', [SC, HY], {
    instruction: 'Türkçeden çevir (Second — If + Past, would + V1):', prompt: `${tr} → ______`,
    answer: en, validation: EN, audio: answerEn(en), sectionId: i < 6 ? S_SC : S_HY,
  }));
});
SECOND.slice(0, 10).forEach(([tr, en], i) => {
  const seq = en.split(' ');
  out.push(mk(`en-cond-second-wb-${i}`, 'word-bank-translation', 'medium', 'production', [SC], {
    instruction: 'Kutucuklarla kur (Second):', answer: en,
    wordBank: { direction: 'tr-to-en', sourceText: tr, targetLanguage: 'en',
      tokens: tok(...seq, 'will', 'would have', 'had'),
      acceptedSequences: [seq] },
    sectionId: S_SC,
  }));
});
SECOND.slice(10).forEach(([tr, en], i) => {
  const tokens = en.split(' ');
  out.push(mk(`en-cond-second-order-${i}`, 'ordering', 'medium', 'production', [SC], {
    instruction: 'Sırala (Second):', prompt: `${tr} → (${tokens.join(' / ')})`,
    answer: en, words: [...tokens.slice(1), tokens[0]],
    sectionId: S_SC,
  }));
});
// Second MC (12) — will/would, had/have ayrımı
const SECOND_MC: Array<[string, string, string[]]> = [
  ['Doğru Second hangisi?', 'If I had more time, I would study more.', ['If I had more time, I would study more.', 'If I have more time, I will study more tomorrow.', 'If I would have more time, I would study more.', 'If I had more time, I will study more.']],
  ['Doğru Second hangisi?', 'If I lived abroad, I would learn fast.', ['If I lived abroad, I would learn fast.', 'If I live abroad, I will learn fast next year.', 'If I would live abroad, I would learn fast.', 'If I lived abroad, I will learn fast.']],
  ['If cümlesinde hangisi doğrudur?', 'If I had (Past)', ['If I had (Past)', 'If I would have', 'If I will have', 'If I have would']],
  ['Sonuç cümlesinde hangisi doğrudur?', 'I would study (would + V1)', ['I would study (would + V1)', 'I will study (Second içinde)', 'I would studied', 'I would have study']],
  ['Hangisi hayal (Second) anlatır?', 'If I were you, I would go.', ['If I were you, I would go.', 'If you are tired, rest.', 'If it rains, I will stay.', 'I go when I can.']],
  ['“If I would have…” neden yanlıştır?', 'If içinde would olmaz; If I had… ✅', ['If içinde would olmaz; If I had… ✅', 'would her yerde olur', 'had hiç olmaz', 'will ile would aynıdır']],
];
SECOND_MC.forEach(([prompt, ans, opts], i) => {
  out.push(mk(`en-cond-second-mc-${i}`, 'multiple-choice', i < 2 ? 'medium' : 'easy', 'recognition', [SC], {
    instruction: 'Second Conditional seç:', prompt, answer: ans, options: opts, sectionId: S_SC,
  }));
});
// fill (8)
[['en-cond-second-fill-had', 'If I ___ more time, I would study. (had)', 'had'],
  ['en-cond-second-fill-would', 'If I had time, I ___ study. (would)', 'would'],
  ['en-cond-second-fill-lived', 'If I ___ abroad, I would learn fast. (lived)', 'lived'],
  ['en-cond-second-fill-were', 'If I ___ you, I would go. (were)', 'were'],
  ['en-cond-second-fill-knew', 'If I ___ English, I would get the job. (knew)', 'knew'],
  ['en-cond-second-fill-could', 'If I ___ speak fluently, I would work abroad. (could)', 'could'],
].forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'fill-blank', 'medium', 'recall', [SC], {
    instruction: 'Boşluğu doldur (Second):', prompt, answer: ans as string, validation: EXACT_EN, sectionId: S_SC,
  }));
});

// kişisel hayaller (8)
const HYPO_Q = [
  'If you had more money, what would you do?',
  'If you lived abroad, where would you live?',
  'If you had more free time, what would you do?',
  'If you could speak English fluently, what would you do?',
  'If you were rich, what would you buy?',
  'If you had a car, where would you go?',
];
HYPO_Q.forEach((q, i) => {
  out.push(mk(`en-cond-hypo-spoken-${i}`, 'spoken', 'medium', 'production', [HY], {
    instruction: 'Yüksek sesle cevapla (Second kullan):', prompt: q,
    sampleAnswer: 'If I had more money, I would travel around the world.',
    requirements: ['If + Past', 'would + V1', 'kişisel cevap'], sectionId: S_HY,
  }));
});
out.push(mk('en-cond-hypo-free-money', 'free-text', 'hard', 'production', [HY], {
  instruction: 'Kendin yaz — Daha çok paran olsaydı ne yapardın?',
  prompt: 'Daha çok param olsaydı dünyayı gezerdim. → ______',
  answer: 'If I had more money, I would travel the world.', validation: EN, sectionId: S_HY,
}));
out.push(mk('en-cond-hypo-free-time', 'free-text', 'hard', 'production', [HY], {
  instruction: 'Kendin yaz — Daha çok boş zamanın olsaydı?',
  prompt: 'Daha çok boş zamanım olsaydı her gün kitap okurdum. → ______',
  answer: 'If I had more free time, I would read books every day.', validation: EN, sectionId: S_HY,
}));

// hata düzeltme (10) — If I would have → If I had
const ERRS: Array<[string, string, string]> = [
  ['en-cond-err-would-have', 'If I would have more time, I would study more.', 'If I had more time, I would study more.'],
  ['en-cond-err-will', 'If I had more time, I will study more.', 'If I had more time, I would study more.'],
  ['en-cond-err-live', 'If I would live abroad, I would learn fast.', 'If I lived abroad, I would learn fast.'],
  ['en-cond-err-have', 'If I have more money, I would travel.', 'If I had more money, I would travel.'],
  ['en-cond-err-would-study', 'If I had time, I would studied.', 'If I had time, I would study.'],
  ['en-cond-err-were', 'If I was you, I would go. (resmi)', 'If I were you, I would go.'],
  ['en-cond-err-will-rain', 'If it will rain, I would stay.', 'If it rained, I would stay.'],
  ['en-cond-err-double-would', 'If I had money, I would have travel.', 'If I had money, I would travel.'],
  ['en-cond-err-knows', 'If I knows English, I would get the job.', 'If I knew English, I would get the job.'],
  ['en-cond-err-could', 'If I can speak fluently, I would work abroad.', 'If I could speak fluently, I would work abroad.'],
];
ERRS.forEach(([id, prompt, ans]) => {
  out.push(mk(id, 'error-correction', 'medium', 'correction', [M, SC], {
    instruction: 'Conditional hatasını düzelt (özellikle If + would YASAK):', prompt, answer: ans,
    explanation: 'If içinde would/will olmaz; sonuçta would + V1.',
    validation: EN, sectionId: S_M,
  }));
});

// dinleme/dikte
out.push(mk('en-cond-listen-second', 'listen-choice', 'medium', 'recognition', [SC], {
  instruction: 'Duyduğunu seç:', audioText: 'If I had more time, I would study more English.',
  answer: 'If I had more time, I would study more English.',
  options: ['If I had more time, I would study more English.', 'If I would have more time, I would study more English.', 'If I have more time, I will study more English.', 'If I had more time, I will study more English.'],
  audio: listenEn('If I had more time, I would study more English.'), sectionId: S_SC,
}));

// ek Second üretim (özne çeşitliliği: he/she/they/we) — 100 barajı için
const SECOND_EXTRA: Array<[string, string]> = [
  ['O daha çok çalışsaydı sınavı geçerdi.', 'If he studied harder, he would pass the exam.'],
  ['O Londra’da yaşasaydı mutlu olurdu.', 'If she lived in London, she would be happy.'],
  ['Onlar erken gelseydi filmi kaçırmazlardı.', 'If they came early, they would not miss the film.'],
  ['Biz zengin olsaydık dünyayı gezerdik.', 'If we were rich, we would travel the world.'],
  ['Sen Türkçe bilseydin işin kolay olurdu.', 'If you knew Turkish, your job would be easy.'],
  ['Çocuklar uslu dursaydı parka giderdik.', 'If the children were good, we would go to the park.'],
  ['Hava güzel olsaydı dışarı çıkardık.', 'If the weather were nice, we would go out.'],
  ['Bilgisayarım olsaydı her gün yazardım.', 'If I had a computer, I would write every day.'],
  ['O cesur olsaydı ona sorardı.', 'If he were brave, he would ask her.'],
  ['Bizim arabamız olsaydı köye giderdik.', 'If we had a car, we would visit the village.'],
];
SECOND_EXTRA.forEach(([tr, en], i) => {
  out.push(mk(`en-cond-second-extra-tr-${i}`, 'free-text', 'hard', 'production', [SC, HY], {
    instruction: 'Türkçeden çevir (Second):', prompt: `${tr} → ______`,
    answer: en, validation: EN, audio: answerEn(en), sectionId: S_HY,
  }));
  const seq = en.split(' ');
  out.push(mk(`en-cond-second-extra-wb-${i}`, 'word-bank-translation', 'medium', 'production', [SC], {
    instruction: 'Kutucuklarla kur (Second):', answer: en,
    wordBank: { direction: 'tr-to-en', sourceText: tr, targetLanguage: 'en',
      tokens: tok(...seq, 'will', 'would have'),
      acceptedSequences: [seq] },
    sectionId: S_SC,
  }));
});
out.push(mk('en-cond-listen-were', 'listen-choice', 'medium', 'recognition', [SC], {
  instruction: 'Duyduğunu seç:', audioText: 'If I were you, I would study harder.',
  answer: 'If I were you, I would study harder.',
  options: ['If I were you, I would study harder.', 'If I was you, I will study harder.', 'If I would be you, I would study harder.', 'If I am you, I would study harder.'],
  audio: listenEn('If I were you, I would study harder.'), sectionId: S_SC,
}));
out.push(mk('en-cond-dict-time', 'dictation', 'medium', 'recall', [SC], {
  instruction: 'Duyduğunu yaz:', audioText: 'If I had more time, I would study more.',
  answer: 'If I had more time, I would study more.', validation: EN, audio: listenEn('If I had more time, I would study more.'), sectionId: S_SC,
}));
out.push(mk('en-cond-dict-were', 'dictation', 'medium', 'recall', [SC], {
  instruction: 'Duyduğunu yaz:', audioText: 'If I were you, I would go.',
  answer: 'If I were you, I would go.', validation: EN, audio: listenEn('If I were you, I would go.'), sectionId: S_SC,
}));

export const EN_EXERCISES_CONDITIONALS: Exercise[] = out;
