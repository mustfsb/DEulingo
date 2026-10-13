/**
 * 1. hafta planı için ek havuz içerikleri (Session C ve D).
 *
 * Haftalık plandaki her `Git` düğmesi yeterince geniş bir havuza inmelidir:
 * Sentence Ordering ≥ 20, Error Correction ≥ 10, Questions ≥ 20,
 * Expansion ≥ 15, Past Simple vs Past Perfect bağlamlı karşıtlık,
 * Gerund/Infinitive eşleştirme. Karıştırma sunum katmanındadır
 * (`presentExercise`): burada yazılan sıra yalnızca kanonik cevaptır.
 */

import { EN, EXACT_EN, answerEn, enEx } from './helpers.ts';
import type { Exercise } from '../types.ts';

const SS = 'en.sentence-structure';
const SS_T = 'Sentence Structure';
const PPF = 'en.past-perfect';
const PPF_T = 'Past Perfect';
const GI = 'en.gerund-infinitive';
const GI_T = 'Gerund & Infinitive';

const ss = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: Partial<Exercise> & { instruction: string }) =>
  enEx(SS, SS_T, id, type, d, s, c, rest);
const ppf = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: Partial<Exercise> & { instruction: string }) =>
  enEx(PPF, PPF_T, id, type, d, s, c, rest);
const gi = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: Partial<Exercise> & { instruction: string }) =>
  enEx(GI, GI_T, id, type, d, s, c, rest);

/* ------------------------------------------------------------------ */
/* Sentence Structure                                                  */
/* ------------------------------------------------------------------ */

const ORDERING: Array<[string, string, string, string[]]> = [
  ['because-rain', 'Yağmur yağdığı için evde kaldım.', 'I stayed at home because it was raining.', ['ss.connectors.basic']],
  ['but-tired', 'Yorgun ama işi bitirmek istiyor.', 'She is tired, but she wants to finish the work.', ['ss.connectors.basic']],
  ['so-taxi', 'Geç olmuştu, bu yüzden taksiye bindik.', 'It was late, so we took a taxi.', ['ss.connectors.basic']],
  ['q-lunch', 'Genellikle öğle yemeğini nerede yersin?', 'Where do you usually have lunch?', ['ss.questions.direct']],
  ['gym-monday', 'Kız kardeşim pazartesi akşamları spor salonuna gider.', 'My sister goes to the gym on Monday evenings.', ['ss.place-time.order']],
  ['indirect-train', 'Trenin saat kaçta kalktığını söyler misin?', 'Can you tell me what time the train leaves?', ['ss.questions.indirect']],
  ['cafe-after-work', 'İşten sonra arkadaşlarımızla kafede buluştuk.', 'We met our friends in the cafe after work.', ['ss.place-time.order']],
  ['party-ill', 'Hasta olduğu için partiye gelmedi.', "He didn't come to the party because he was ill.", ['ss.connectors.basic']],
];

const ORDERING_EX: Exercise[] = ORDERING.map(([key, tr, en, concepts]) =>
  ss(`en-ss-w1-order-${key}`, 'ordering', 'medium', 'production', concepts, {
    instruction: 'Kelimeleri doğru sıraya diz:',
    prompt: tr,
    answer: en,
    words: en.split(' '),
    sectionId: concepts[0] === 'ss.connectors.basic' ? 'sentence-structure.connectors'
      : concepts[0].startsWith('ss.questions') ? 'sentence-structure.questions' : 'sentence-structure.place-time',
  }));

const ERRORS: Array<[string, string, string, string, string[]?]> = [
  ['adverb', 'Always I drink tea in the morning.', 'I always drink tea in the morning.', 'Sıklık zarfı (always) özneden sonra, fiilden önce gelir.', ['In the morning I always drink tea.']],
  ['to-school', 'I go school by bus every day.', 'I go to school by bus every day.', 'go + to + yer: eksik edat (to).'],
  ['arrive-at', 'We arrived the station at six.', 'We arrived at the station at six.', 'arrive at + yer: eksik edat (at).'],
  ['double-subject-1', 'My brother he plays football every Saturday.', 'My brother plays football every Saturday.', 'Özne bir kez söylenir: “my brother he” çift öznedir.'],
  ['double-subject-2', 'The teacher she gives us homework every day.', 'The teacher gives us homework every day.', 'İsim özneyi zamirle tekrar etme.'],
  ['aux-where', 'Where you are going?', 'Where are you going?', 'Doğrudan soruda yardımcı fiil özneden önce: are you.'],
  ['aux-time', 'What time the lesson starts?', 'What time does the lesson start?', 'Soru kelimesinden sonra does + özne + V1.'],
  ['connector-so', 'He studied hard, but he passed the exam.', 'He studied hard, so he passed the exam.', 'Sonuç için so; but zıtlık içindir.'],
  ['indirect-does', 'Do you know where does she live?', 'Do you know where she lives?', 'Dolaylı soruda devrik yapı olmaz: where she lives.'],
];

const ERROR_EX: Exercise[] = ERRORS.map(([key, wrong, right, why, alt]) =>
  ss(`en-ss-w1-err-${key}`, 'error-correction', 'medium', 'correction', ['ss.mistakes.order', 'ss.svo.core'], {
    instruction: 'Cümledeki hatayı düzelt:',
    prompt: wrong,
    answer: right,
    ...(alt ? { acceptedAnswers: alt } : {}),
    explanation: why,
    validation: EN,
    sectionId: 'sentence-structure.mistakes',
  }));

const QUESTIONS_EX: Exercise[] = [
  ss('en-ss-w1-q-mc-school', 'multiple-choice', 'medium', 'recognition', ['ss.questions.direct'], {
    instruction: 'Doğru soru hangisi?',
    prompt: 'Okul saat kaçta başlıyor? → ______',
    answer: 'What time does school start?',
    options: ['What time does school start?', 'What time school starts?', 'What time does school starts?', 'What time starts school?'],
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-mc-toilet', 'multiple-choice', 'medium', 'recognition', ['ss.questions.indirect'], {
    instruction: 'Doğru dolaylı soru hangisi?',
    prompt: 'Tuvaletin nerede olduğunu söyler misiniz?',
    answer: 'Could you tell me where the toilet is?',
    options: ['Could you tell me where the toilet is?', 'Could you tell me where is the toilet?', 'Could you tell me where the toilet it is?', 'Could you tell me where toilet is the?'],
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-mc-find', 'multiple-choice', 'hard', 'recognition', ['ss.questions.indirect'], {
    instruction: 'Hatalı olanı bul:',
    prompt: 'Hangisi yanlış?',
    answer: 'Do you know what time is the lesson? ❌',
    options: ['Do you know what time is the lesson? ❌', 'Do you know what time the lesson is? ✅', 'What time is the lesson? ✅', 'Can you tell me when the lesson starts? ✅'],
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-fill-opens', 'fill-blank', 'medium', 'recall', ['ss.questions.indirect'], {
    instruction: 'Dolaylı soruyu tamamla:',
    prompt: 'Do you know what time the shop ___? (opens)',
    answer: 'opens',
    validation: EXACT_EN,
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-fill-do', 'fill-blank', 'easy', 'recall', ['ss.questions.direct'], {
    instruction: 'Soruyu tamamla:',
    prompt: 'Where ___ you live? (do)',
    answer: 'do',
    validation: EXACT_EN,
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-free-post', 'free-text', 'hard', 'production', ['ss.questions.indirect'], {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Postanenin nerede olduğunu söyleyebilir misin? → ______',
    answer: 'Can you tell me where the post office is?',
    acceptedAnswers: ['Could you tell me where the post office is?', 'Do you know where the post office is?'],
    validation: EN,
    audio: answerEn('Can you tell me where the post office is?'),
    sectionId: 'sentence-structure.questions',
  }),
  ss('en-ss-w1-q-free-going', 'free-text', 'medium', 'production', ['ss.questions.direct'], {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: 'Nereye gidiyorsun? → ______',
    answer: 'Where are you going?',
    validation: EN,
    audio: answerEn('Where are you going?'),
    sectionId: 'sentence-structure.questions',
  }),
];

const EXPANSION: Array<[string, string, string, string]> = [
  ['football-place', 'I play football.', 'in the park', 'I play football in the park.'],
  ['football-time', 'I play football in the park.', 'every Saturday', 'I play football in the park every Saturday.'],
  ['books-time', 'She reads books.', 'in the evening', 'She reads books in the evening.'],
  ['books-because', 'She reads books in the evening.', 'because she loves stories', 'She reads books in the evening because she loves stories.'],
  ['home-time', 'We went home.', 'after the lesson', 'We went home after the lesson.'],
  ['home-because', 'We went home after the lesson.', 'because we were tired', 'We went home after the lesson because we were tired.'],
  ['bank-place', 'My brother works.', 'in a bank', 'My brother works in a bank.'],
  ['bank-but', 'My brother works in a bank.', 'but he wants to change his job', 'My brother works in a bank, but he wants to change his job.'],
];

const EXPANSION_EX: Exercise[] = EXPANSION.map(([key, base, add, full]) =>
  ss(`en-ss-w1-exp-${key}`, 'free-text', 'hard', 'production', ['ss.expansion.steps', 'ss.svo.core'], {
    instruction: 'Cümleyi bir basamak genişlet:',
    prompt: `${base} + ${add} → ______`,
    answer: full,
    acceptedAnswers: full.includes(', but') ? [full.replace(', but', ' but')] : undefined,
    explanation: 'Önce SVO iskeleti, sonra yer/zaman, en son because/but cümlesi eklenir.',
    validation: EN,
    audio: answerEn(full),
    sectionId: 'sentence-structure.expansion',
  }));

/* ------------------------------------------------------------------ */
/* Past Perfect — bağlamı tense'i belirleyen karşıtlık                  */
/* ------------------------------------------------------------------ */

const CONTRAST_EX: Exercise[] = [
  ppf('en-ppf-w1-ctx-film', 'multiple-choice', 'medium', 'recognition', ['ppf.vs-past.arrived', 'ppf.timeline.earlier'], {
    instruction: 'Bağlama göre doğru zamanı seç:',
    prompt: 'Film 7.00’de başladı. Biz 7.15’te vardık. → By the time we arrived, the film ___.',
    answer: 'had started',
    options: ['had started', 'started', 'was starting', 'has started'],
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-shop', 'multiple-choice', 'medium', 'recognition', ['ppf.vs-past.arrived'], {
    instruction: 'Bağlama göre doğru zamanı seç (ardışık olaylar):',
    prompt: 'Dükkâna gittim ama kapanmıştı. → I ___ to the shop, but it had closed.',
    answer: 'went',
    options: ['went', 'had gone', 'have gone', 'go'],
    explanation: 'Anlatının ana olayı (gitmek) Simple Past; “önce olan” kapanmasıdır (had closed).',
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-exam', 'multiple-choice', 'medium', 'recognition', ['ppf.vs-past.arrived'], {
    instruction: 'Bağlama göre doğru zamanı seç:',
    prompt: 'O çok çalışmıştı, bu yüzden sınavı geçti. → She ___ the exam because she had studied hard.',
    answer: 'passed',
    options: ['passed', 'had passed', 'has passed', 'pass'],
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-first', 'multiple-choice', 'hard', 'recognition', ['ppf.timeline.earlier'], {
    instruction: 'Önce hangisi oldu?',
    prompt: 'When I got to the station, the train had left.',
    answer: 'The train left first.',
    options: ['The train left first.', 'I got to the station first.', 'Both happened together.', 'The sentence does not say.'],
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-lost', 'fill-blank', 'medium', 'recall', ['ppf.formula.core', 'ppf.timeline.earlier'], {
    instruction: 'Doğru biçimi yaz (önce olan olay):',
    prompt: 'She was sad because she ___ her keys. (lose)',
    answer: 'had lost',
    validation: EN,
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-ate', 'fill-blank', 'medium', 'recall', ['ppf.vs-past.arrived'], {
    instruction: 'Doğru biçimi yaz (iki ardışık olay, vurgu yok):',
    prompt: 'We ___ dinner, and then we watched TV. (eat)',
    answer: 'ate',
    validation: EXACT_EN,
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-written', 'fill-blank', 'medium', 'recall', ['ppf.formula.core', 'ppf.timeline.earlier'], {
    instruction: 'Doğru biçimi yaz (önce olan olay):',
    prompt: 'After he ___ the report, he sent it to his boss. (write)',
    answer: 'had written',
    validation: EN,
    sectionId: 'past-perfect.vs-past',
  }),
  ppf('en-ppf-w1-ctx-err-lesson', 'error-correction', 'medium', 'correction', ['ppf.mistakes.has-had', 'ppf.timeline.earlier'], {
    instruction: 'Hatayı düzelt (bağlam geçmiş):',
    prompt: 'When I arrived, the lesson already started.',
    answer: 'When I arrived, the lesson had already started.',
    explanation: 'Varıştan önce başlamış olan olay: had already started.',
    validation: EN,
    sectionId: 'past-perfect.vs-past',
  }),
];

/* ------------------------------------------------------------------ */
/* Gerund & Infinitive — kalıp eşleştirme                               */
/* ------------------------------------------------------------------ */

const MATCH_SETS: Array<[string, Array<[string, string]>]> = [
  ['core', [['enjoy', 'playing football'], ['decide', 'to study abroad'], ['avoid', 'making noise'], ['plan', 'to visit London'], ['finish', 'writing the report'], ['want', 'to learn English']]],
  ['more', [['look forward to', 'meeting you'], ['keep', 'practising every day'], ['hope', 'to pass the exam'], ['miss', 'seeing my friends'], ['need', 'to buy a ticket'], ['mind', 'waiting a few minutes']]],
  ['daily', [['stop', 'smoking'], ['promise', 'to call me'], ['suggest', 'going by train'], ['offer', 'to help you'], ['practise', 'speaking English'], ['agree', 'to meet at six']]],
  ['feelings', [['love', 'cooking dinner'], ['hate', 'getting up early'], ['can’t wait', 'to see you'], ['dream of', 'living abroad'], ['be interested in', 'learning languages'], ['be good at', 'solving problems']]],
  ['mixed', [['enjoy', 'swimming'], ['decide', 'to leave early'], ['avoid', 'eating late'], ['look forward to', 'the weekend'], ['want', 'to travel'], ['finish', 'reading the book']]],
];

const MATCHING_EX: Exercise[] = MATCH_SETS.map(([key, pairs]) =>
  gi(`en-gi-w1-match-${key}`, 'matching', 'medium', 'recognition',
    ['gi.gerund.chunks', 'gi.infinitive.chunks'], {
      instruction: 'Fiili doğru kalıpla eşleştir (doing / to do):',
      pairs: pairs.map(([left, right]) => ({ left, right })),
      explanation: 'enjoy/avoid/finish/keep/mind/miss + doing; want/decide/plan/hope/need/offer/promise + to do; look forward to + doing.',
      sectionId: key === 'mixed' || key === 'more' ? 'gerund-infinitive.look-forward' : 'gerund-infinitive.gerund',
    }));

export const EN_EXERCISES_WEEK1_PLAN: Exercise[] = [
  ...ORDERING_EX,
  ...ERROR_EX,
  ...QUESTIONS_EX,
  ...EXPANSION_EX,
  ...CONTRAST_EX,
  ...MATCHING_EX,
];
