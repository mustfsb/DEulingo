/**
 * 1. hafta havuz DERİNLİĞİ: haftalık plandaki her odaklı pratik, tek oturumda
 * tükenmeyecek kadar genişletildi. Ağırlık AKTİF ÜRETİMDE: Türkçe→İngilizce,
 * serbest yazım, cümle kurma/sıralama, hata düzeltme, dönüştürme, yazarak
 * tamamlama. Tanıma (çoktan seçmeli/eşleştirme) bilinçli olarak azınlıktadır.
 *
 * İçerik B1-/B1: İngilizce öğrenme, üniversite, teknoloji, iş/okul, seyahat,
 * hobi, günlük hayat. Her cümle ayrıdır — tek isim değiştirilmiş kopya yoktur
 * (`exercise-pools.test.ts` kopyaları denetler). Karıştırma sunum katmanındadır.
 */

import { EN, EXACT_EN, answerEn, enEx } from './helpers.ts';
import type { Exercise } from '../types.ts';

type Rest = Partial<Exercise> & { instruction: string };
type Maker = (id: string, type: Exercise['type'], d: Exercise['difficulty'], s: Exercise['skill'], c: string[], rest: Rest) => Exercise;

const SS: Maker = (id, type, d, s, c, rest) => enEx('en.sentence-structure', 'Sentence Structure', id, type, d, s, c, rest);
const PPF: Maker = (id, type, d, s, c, rest) => enEx('en.past-perfect', 'Past Perfect', id, type, d, s, c, rest);
const GI: Maker = (id, type, d, s, c, rest) => enEx('en.gerund-infinitive', 'Gerund & Infinitive', id, type, d, s, c, rest);
const CO: Maker = (id, type, d, s, c, rest) => enEx('en.conditionals', 'Conditionals', id, type, d, s, c, rest);
const PC: Maker = (id, type, d, s, c, rest) => enEx('en.prepositions-collocations', 'Prepositions & Collocations', id, type, d, s, c, rest);

/** Türkçeden İngilizceye serbest yazım. `alts`: zararsız doğru alternatifler. */
function trEn(make: Maker, id: string, section: string, concepts: string[], tr: string, en: string, alts: string[] = [], d: Exercise['difficulty'] = 'hard'): Exercise {
  return make(id, 'free-text', d, 'production', concepts, {
    instruction: 'Türkçeden İngilizceye çevir:',
    prompt: `${tr} → ______`,
    answer: en,
    ...(alts.length ? { acceptedAnswers: alts } : {}),
    validation: EN,
    audio: answerEn(en),
    sectionId: section,
  });
}

function order(make: Maker, id: string, section: string, concepts: string[], tr: string, en: string): Exercise {
  return make(id, 'ordering', 'medium', 'production', concepts, {
    instruction: 'Kelimeleri doğru sıraya diz:',
    prompt: tr,
    answer: en,
    words: en.split(' '),
    sectionId: section,
  });
}

function fix(make: Maker, id: string, section: string, concepts: string[], wrong: string, right: string, why: string, alts: string[] = []): Exercise {
  return make(id, 'error-correction', 'medium', 'correction', concepts, {
    instruction: 'Cümledeki hatayı düzelt:',
    prompt: wrong,
    answer: right,
    ...(alts.length ? { acceptedAnswers: alts } : {}),
    explanation: why,
    validation: EN,
    sectionId: section,
  });
}

/** Yazarak tamamlama: boşluğa YALNIZCA doğru biçim (parantezde fiil kökü). */
function fill(make: Maker, id: string, section: string, concepts: string[], prompt: string, answer: string, instruction = 'Doğru biçimi yaz:'): Exercise {
  return make(id, 'fill-blank', 'medium', 'recall', concepts, {
    instruction, prompt, answer, validation: EXACT_EN, sectionId: section,
  });
}

/* ================================================================== */
/* Sentence Structure                                                  */
/* ================================================================== */

const S_PT = 'sentence-structure.place-time';
const S_Q = 'sentence-structure.questions';
const S_EXP = 'sentence-structure.expansion';
const S_CON = 'sentence-structure.connectors';
const S_M = 'sentence-structure.mistakes';

const SS_ORDER: Exercise[] = [
  order(SS, 'en-w1d-ss-order-news', S_PT, ['ss.place-time.order'], 'Genellikle haberleri sabahları telefonundan okur.', 'She usually reads the news on her phone in the morning.'),
  order(SS, 'en-w1d-ss-order-why', S_Q, ['ss.questions.direct'], 'Neden bilgisayar mühendisliği okumaya karar verdin?', 'Why did you decide to study computer science?'),
  order(SS, 'en-w1d-ss-order-beach', S_CON, ['ss.connectors.basic'], 'Çok soğuk olduğu için plaja gidemiyoruz.', "We can't go to the beach because it is too cold."),
  order(SS, 'en-w1d-ss-order-cost', S_Q, ['ss.questions.indirect'], 'Bu kitabın ne kadar olduğunu söyler misiniz?', 'Could you tell me how much this book costs?'),
  order(SS, 'en-w1d-ss-order-library', S_PT, ['ss.place-time.order'], 'Arkadaşlarımla ders çıkışı sık sık kütüphanede buluşuruz.', 'My friends and I often meet at the library after class.'),
  order(SS, 'en-w1d-ss-order-tired', S_CON, ['ss.connectors.basic'], 'Çok yorgundu, bu yüzden erken yattı.', 'He was very tired, so he went to bed early.'),
];

const SS_TR: Exercise[] = [
  trEn(SS, 'en-w1d-ss-tr-news', S_PT, ['ss.place-time.order'], 'Genellikle haberleri sabahları telefonumdan okurum.', 'I usually read the news on my phone in the morning.'),
  trEn(SS, 'en-w1d-ss-tr-meeting', S_CON, ['ss.connectors.basic'], 'Yarın erken kalkmam gerekiyor çünkü sabah bir toplantım var.', 'I have to get up early tomorrow because I have a meeting in the morning.'),
  trEn(SS, 'en-w1d-ss-tr-class', S_PT, ['ss.place-time.order'], 'Ders bittikten sonra arkadaşlarımla kütüphanede buluşuyorum.', 'I meet my friends in the library after class.', ['After class I meet my friends in the library.']),
  trEn(SS, 'en-w1d-ss-tr-tv', S_CON, ['ss.connectors.basic'], 'Kardeşim akşamları televizyon izler ama ben kitap okurum.', 'My brother watches TV in the evenings, but I read books.', ['My brother watches TV in the evenings but I read books.']),
  trEn(SS, 'en-w1d-ss-tr-cold', S_CON, ['ss.connectors.basic'], 'Hava soğuktu, bu yüzden evde kaldık.', 'It was cold, so we stayed at home.', ['It was cold so we stayed at home.']),
  trEn(SS, 'en-w1d-ss-tr-cafe', S_PT, ['ss.place-time.order'], 'Yeni arkadaşım şehir merkezinde küçük bir kafede çalışıyor.', 'My new friend works in a small cafe in the city centre.', ['My new friend works at a small cafe in the city centre.']),
];

const SS_Q: Exercise[] = [
  trEn(SS, 'en-w1d-ss-q-getup', S_Q, ['ss.questions.direct'], 'Saat kaçta kalkıyorsun?', 'What time do you get up?', ['What time do you wake up?']),
  trEn(SS, 'en-w1d-ss-q-price', S_Q, ['ss.questions.direct'], 'Bu kitap ne kadar?', 'How much is this book?', ['How much does this book cost?']),
  trEn(SS, 'en-w1d-ss-q-exam', S_Q, ['ss.questions.indirect'], 'Sınavın ne zaman olduğunu biliyor musun?', 'Do you know when the exam is?'),
  trEn(SS, 'en-w1d-ss-q-why', S_Q, ['ss.questions.direct'], 'Neden İngilizce öğreniyorsun?', 'Why are you learning English?', ['Why do you learn English?', 'Why are you studying English?']),
  trEn(SS, 'en-w1d-ss-q-station', S_Q, ['ss.questions.indirect'], 'Otogarın nerede olduğunu söyler misiniz?', 'Could you tell me where the bus station is?', ['Can you tell me where the bus station is?', 'Do you know where the bus station is?']),
  trEn(SS, 'en-w1d-ss-q-age', S_Q, ['ss.questions.indirect'], 'Onun kaç yaşında olduğunu biliyor musun?', 'Do you know how old he is?', ['Do you know how old she is?']),
];

const EXPANSION: Array<[string, string, string, string, string[]?]> = [
  ['drive-place', 'He drives.', 'to work', 'He drives to work.'],
  ['drive-time', 'He drives to work.', 'every morning', 'He drives to work every morning.'],
  ['study-place', 'They are studying.', 'in the library', 'They are studying in the library.'],
  ['study-because', 'They are studying in the library.', 'because they have an exam tomorrow', 'They are studying in the library because they have an exam tomorrow.'],
  ['call-time', 'I called my mother.', 'last night', 'I called my mother last night.'],
  ['call-because', 'I called my mother last night.', 'because I missed her', 'I called my mother last night because I missed her.'],
  ['film-place', 'We watched a film.', 'at home', 'We watched a film at home.'],
  ['film-but', 'We watched a film at home.', 'but it was boring', 'We watched a film at home, but it was boring.', ['We watched a film at home but it was boring.']],
];

const SS_EXP: Exercise[] = EXPANSION.map(([key, base, add, full, alts]) =>
  SS(`en-w1d-ss-exp-${key}`, 'free-text', 'hard', 'production', ['ss.expansion.steps', 'ss.svo.core'], {
    instruction: 'Cümleyi bir basamak genişlet:',
    prompt: `${base} + ${add} → ______`,
    answer: full,
    ...(alts ? { acceptedAnswers: alts } : {}),
    explanation: 'SVO iskeleti sabit kalır; önce yer/zaman, sonra because/but cümlesi eklenir.',
    validation: EN,
    audio: answerEn(full),
    sectionId: S_EXP,
  }));

const SS_ERR: Exercise[] = [
  fix(SS, 'en-w1d-ss-err-doesnt', S_M, ['ss.mistakes.order', 'ss.svo.core'], "She don't like coffee in the morning.", "She doesn't like coffee in the morning.", 'she/he/it ile olumsuzda doesn’t kullanılır.', ['She does not like coffee in the morning.']),
  fix(SS, 'en-w1d-ss-err-music', S_M, ['ss.mistakes.order', 'ss.svo.core'], 'I like very much music.', 'I like music very much.', 'Fiil ile nesne arasına zarf girmez: S + V + O + zarf.', ['I like music a lot.']),
  fix(SS, 'en-w1d-ss-err-sunday', S_M, ['ss.mistakes.order', 'ss.place-time.order'], 'He plays every Sunday football.', 'He plays football every Sunday.', 'Nesne zamandan önce gelir.', ['Every Sunday he plays football.']),
  fix(SS, 'en-w1d-ss-err-parents', S_M, ['ss.mistakes.order', 'ss.svo.core'], 'My parents they live in Ankara.', 'My parents live in Ankara.', 'Özne bir kez söylenir; “my parents they” çift öznedir.'),
  fix(SS, 'en-w1d-ss-err-drink', S_M, ['ss.mistakes.order', 'ss.questions.direct'], 'What you want to drink?', 'What do you want to drink?', 'Soru kelimesinden sonra yardımcı fiil (do) + özne gelir.'),
  fix(SS, 'en-w1d-ss-err-library', S_M, ['ss.mistakes.order', 'ss.questions.indirect'], 'Can you tell me where is the library?', 'Can you tell me where the library is?', 'Dolaylı soruda düz sıra: where the post office is.'),
  fix(SS, 'en-w1d-ss-err-rain', S_M, ['ss.mistakes.order', 'ss.connectors.basic'], 'We cancelled the picnic, but it was raining.', 'We cancelled the picnic because it was raining.', 'Neden için because; but zıtlık içindir.', ['It was raining, so we cancelled the picnic.']),
  fix(SS, 'en-w1d-ss-err-coat', S_M, ['ss.mistakes.order', 'ss.connectors.basic'], 'It was cold, because I wore a coat.', 'It was cold, so I wore a coat.', 'Sonuç için so kullanılır.'),
  fix(SS, 'en-w1d-ss-err-bus', S_M, ['ss.mistakes.order', 'ss.place-time.order'], 'She is waiting the bus.', 'She is waiting for the bus.', 'wait + for: eksik edat.'),
  fix(SS, 'en-w1d-ss-err-discuss', S_M, ['ss.mistakes.order', 'ss.svo.core'], 'We discussed about the plan.', 'We discussed the plan.', 'discuss doğrudan nesne alır; about gerekmez.'),
  fix(SS, 'en-w1d-ss-err-home', S_M, ['ss.mistakes.order', 'ss.place-time.order'], "I'm going to home now.", "I'm going home now.", 'home ile to kullanılmaz: go home.', ['I am going home now.']),
];

/* ================================================================== */
/* Past Perfect                                                        */
/* ================================================================== */

const P_TL = 'past-perfect.timeline';
const P_VS = 'past-perfect.vs-past';
const P_M = 'past-perfect.mistakes';

const PPF_TR: Exercise[] = [
  trEn(PPF, 'en-w1d-ppf-tr-lesson', P_TL, ['ppf.timeline.earlier'], 'Sınıfa vardığımda ders çoktan başlamıştı.', 'The lesson had already begun when I got to class.', ['When I got to class, the lesson had already begun.', 'The lesson had already started when I got to class.', 'When I got to class, the lesson had already started.']),
  trEn(PPF, 'en-w1d-ppf-tr-clean', P_TL, ['ppf.timeline.earlier'], 'Misafirleri gelmeden önce evi temizlemişti.', 'She had cleaned the flat before her guests arrived.', ['Before her guests arrived, she had cleaned the flat.', 'She had cleaned the house before her guests arrived.', 'Before her guests arrived, she had cleaned the house.']),
  trEn(PPF, 'en-w1d-ppf-tr-wallet', P_TL, ['ppf.timeline.earlier'], 'Cüzdanımı evde unuttuğumu fark ettim.', 'I realised that I had left my wallet at home.', ['I realized that I had left my wallet at home.', 'I realised I had left my wallet at home.', 'I realized I had left my wallet at home.']),
  trEn(PPF, 'en-w1d-ppf-tr-eaten', P_TL, ['ppf.timeline.earlier'], 'Aradığımızda onlar çoktan yemek yemişlerdi.', 'They had already eaten when we called.', ['When we called, they had already eaten.']),
  trEn(PPF, 'en-w1d-ppf-tr-degree', P_TL, ['ppf.timeline.earlier'], 'Üniversiteyi bitirdikten sonra Londra’ya taşındı.', 'After he had finished university, he moved to London.', ['He moved to London after he had finished university.', 'After he had finished his degree, he moved to London.']),
  trEn(PPF, 'en-w1d-ppf-tr-bus', P_TL, ['ppf.timeline.earlier'], 'Geç uyandığımız için otobüsü kaçırdık.', 'We missed the bus because we had woken up late.', ['Because we had woken up late, we missed the bus.']),
  trEn(PPF, 'en-w1d-ppf-tr-shop', P_TL, ['ppf.by-time.before'], 'Ben vardığımda dükkân kapanmıştı.', 'The shop had closed by the time I arrived.', ['By the time I arrived, the shop had closed.', 'The shop had closed when I arrived.', 'When I arrived, the shop had closed.']),
  trEn(PPF, 'en-w1d-ppf-tr-sea', P_TL, ['ppf.timeline.earlier'], 'Bana hiç deniz görmediğini söyledi.', 'He told me that he had never seen the sea.', ['He told me he had never seen the sea.', 'He said that he had never seen the sea.']),
];

const PPF_ORDER: Exercise[] = [
  order(PPF, 'en-w1d-ppf-order-fly', P_TL, ['ppf.timeline.earlier'], 'Almanya’ya gitmeden önce hiç uçağa binmemişti.', 'She had never flown before she went to Germany.'),
  order(PPF, 'en-w1d-ppf-order-phone', P_TL, ['ppf.timeline.earlier'], 'Tam oturmuştuk ki telefon çaldı.', 'We had just sat down when the phone rang.'),
  order(PPF, 'en-w1d-ppf-order-clean', P_TL, ['ppf.by-time.before'], 'Saat sekize kadar bütün evi temizlemişti.', 'By eight o’clock, he had cleaned the whole house.'),
  order(PPF, 'en-w1d-ppf-order-key', P_TL, ['ppf.timeline.earlier'], 'Anahtarımı kaybettiğim için kapıyı açamadım.', "I couldn't open the door because I had lost my key."),
];

const PPF_CONTRAST: Exercise[] = [
  fill(PPF, 'en-w1d-ppf-ctx-test', P_VS, ['ppf.formula.core', 'ppf.by-time.before'], 'By the time the teacher came, the students ___ the test. (finish)', 'had finished'),
  fill(PPF, 'en-w1d-ppf-ctx-actor', P_VS, ['ppf.vs-past.arrived'], 'I ___ that actor in a cafe yesterday. (see)', 'saw'),
  PPF('en-w1d-ppf-ctx-weak', 'fill-blank', 'hard', 'recall', ['ppf.formula.core'], {
    instruction: 'Doğru biçimi yaz (olumsuz, önce olan olay):',
    prompt: 'She felt weak because she ___ anything before the exam. (not / eat)',
    answer: 'had not eaten',
    acceptedAnswers: ["hadn't eaten"],
    validation: EN,
    sectionId: P_VS,
  }),
  fill(PPF, 'en-w1d-ppf-ctx-door', P_VS, ['ppf.formula.core', 'ppf.timeline.earlier'], 'He opened the door after he ___ the key. (find)', 'had found'),
  fix(PPF, 'en-w1d-ppf-ctx-err-market', P_VS, ['ppf.mistakes.has-had', 'ppf.vs-past.arrived'], 'Yesterday I had gone to the market.', 'Yesterday I went to the market.', 'yesterday tek başına geçmişte bitmiş olayı anlatır: Simple Past.'),
  fix(PPF, 'en-w1d-ppf-ctx-err-flat', P_VS, ['ppf.mistakes.has-had', 'ppf.vs-past.arrived'], 'Last year, we had moved to a new flat.', 'Last year, we moved to a new flat.', 'Önce/sonra ilişkisi yoksa Past Perfect gerekmez.'),
];

const PPF_ERR: Exercise[] = [
  fix(PPF, 'en-w1d-ppf-err-parents', P_M, ['ppf.mistakes.has-had', 'ppf.by-time.before'], 'By the time I got home, my parents already went to bed.', 'By the time I got home, my parents had already gone to bed.', 'Önce olan olay: had already gone.'),
  fix(PPF, 'en-w1d-ppf-err-dinner', P_M, ['ppf.mistakes.has-had', 'ppf.formula.core'], 'After we had finish dinner, we watched a film.', 'After we had finished dinner, we watched a film.', 'had + V3: finished.'),
  fix(PPF, 'en-w1d-ppf-err-train', P_M, ['ppf.mistakes.has-had', 'ppf.formula.core'], 'The train had leaved before we reached the station.', 'The train had left before we reached the station.', 'leave – left – left: leaved yoktur.'),
  fix(PPF, 'en-w1d-ppf-err-phone', P_M, ['ppf.mistakes.has-had', 'ppf.timeline.earlier'], 'She said that she has lost her phone.', 'She said that she had lost her phone.', 'Geçmişte aktarılan, daha önce olmuş olay: had lost.'),
  fix(PPF, 'en-w1d-ppf-err-abroad', P_M, ['ppf.mistakes.has-had', 'ppf.formula.core'], 'Before he moved to Berlin, he never had lived abroad.', 'Before he moved to Berlin, he had never lived abroad.', 'never had + V3 değil, had never + V3.'),
  fix(PPF, 'en-w1d-ppf-err-rome', P_M, ['ppf.mistakes.has-had', 'ppf.vs-past.arrived'], 'I had visited Rome last summer.', 'I visited Rome last summer.', 'last summer tek başına Simple Past ister.'),
];

/* ================================================================== */
/* Gerund & Infinitive                                                 */
/* ================================================================== */

const G_G = 'gerund-infinitive.gerund';
const G_I = 'gerund-infinitive.infinitive';
const G_L = 'gerund-infinitive.look-forward';
const G_P = 'gerund-infinitive.production';
const G_M = 'gerund-infinitive.mistakes';

const GI_ERR: Exercise[] = [
  fix(GI, 'en-w1d-gi-err-cook', G_M, ['gi.mistakes.chunks', 'gi.gerund.chunks'], 'She enjoys to cook for her friends.', 'She enjoys cooking for her friends.', 'enjoy + doing.'),
  fix(GI, 'en-w1d-gi-err-meet', G_M, ['gi.mistakes.chunks', 'gi.look-forward.doing'], "I'm looking forward to meet you.", "I'm looking forward to meeting you.", 'look forward to + doing (to burada edat).', ['I am looking forward to meeting you.']),
  fix(GI, 'en-w1d-gi-err-move', G_M, ['gi.mistakes.chunks', 'gi.infinitive.chunks'], 'They decided moving to another city.', 'They decided to move to another city.', 'decide + to do.'),
  fix(GI, 'en-w1d-gi-err-train', G_M, ['gi.mistakes.chunks', 'gi.gerund.chunks'], 'He suggested to go by train.', 'He suggested going by train.', 'suggest + doing.'),
  fix(GI, 'en-w1d-gi-err-hope', G_M, ['gi.mistakes.chunks', 'gi.infinitive.chunks'], 'I hope see you soon.', 'I hope to see you soon.', 'hope + to do.'),
  fix(GI, 'en-w1d-gi-err-milk', G_M, ['gi.mistakes.chunks', 'gi.infinitive.chunks'], 'We need buy some milk.', 'We need to buy some milk.', 'need + to do.'),
  fix(GI, 'en-w1d-gi-err-answer', G_M, ['gi.mistakes.chunks', 'gi.gerund.chunks'], 'She avoided to answer the question.', 'She avoided answering the question.', 'avoid + doing.'),
  fix(GI, 'en-w1d-gi-err-cinema', G_M, ['gi.mistakes.chunks', 'gi.infinitive.chunks'], "I'd like going to the cinema tonight.", "I'd like to go to the cinema tonight.", "would like + to do.", ['I would like to go to the cinema tonight.']),
  fix(GI, 'en-w1d-gi-err-promise', G_M, ['gi.mistakes.chunks', 'gi.infinitive.chunks'], 'He promised helping me.', 'He promised to help me.', 'promise + to do.'),
  fix(GI, 'en-w1d-gi-err-window', G_M, ['gi.mistakes.chunks', 'gi.gerund.chunks'], 'Do you mind to open the window?', 'Do you mind opening the window?', 'mind + doing.'),
];

const GI_TR: Exercise[] = [
  trEn(GI, 'en-w1d-gi-tr-walk', G_P, ['gi.production.choice', 'gi.gerund.chunks'], 'Her gün yürümekten hoşlanıyorum.', 'I enjoy walking every day.', ['I like walking every day.', 'I like to walk every day.']),
  trEn(GI, 'en-w1d-gi-tr-cinema', G_P, ['gi.production.choice', 'gi.infinitive.chunks'], 'Bu akşam sinemaya gitmeyi planlıyoruz.', 'We plan to go to the cinema this evening.', ['We are planning to go to the cinema this evening.', 'This evening we plan to go to the cinema.']),
  trEn(GI, 'en-w1d-gi-tr-phone', G_P, ['gi.production.choice', 'gi.infinitive.chunks'], 'Yeni bir telefon almaya karar verdim.', 'I decided to buy a new phone.', ['I have decided to buy a new phone.']),
  trEn(GI, 'en-w1d-gi-tr-meeting', G_P, ['gi.production.choice', 'gi.look-forward.doing'], 'Sizinle tanışmayı dört gözle bekliyorum.', 'I look forward to meeting you.', ['I am looking forward to meeting you.', "I'm looking forward to meeting you."]),
  trEn(GI, 'en-w1d-gi-tr-sugar', G_P, ['gi.production.choice', 'gi.gerund.chunks'], 'Çok şeker yemekten kaçınıyor.', 'He avoids eating too much sugar.', ['He avoids eating a lot of sugar.']),
  trEn(GI, 'en-w1d-gi-tr-keep', G_P, ['gi.production.choice', 'gi.gerund.chunks'], 'Bilgisayarda çalışmaya devam ediyor.', 'She keeps working on the computer.', ['She keeps on working on the computer.', 'She is still working on the computer.']),
];

const GI_FILL: Exercise[] = [
  fill(GI, 'en-w1d-gi-fill-cook', G_G, ['gi.gerund.chunks'], 'She enjoys ___ dinner for her friends. (cook)', 'cooking'),
  fill(GI, 'en-w1d-gi-fill-write', G_G, ['gi.gerund.chunks'], 'He finished ___ his essay at midnight. (write)', 'writing'),
  fill(GI, 'en-w1d-gi-fill-walk', G_G, ['gi.gerund.chunks'], 'They avoid ___ in the rain. (walk)', 'walking'),
  fill(GI, 'en-w1d-gi-fill-buy', G_I, ['gi.infinitive.chunks'], 'I decided ___ a new phone. (buy)', 'to buy'),
  fill(GI, 'en-w1d-gi-fill-live', G_I, ['gi.infinitive.chunks'], 'She wants ___ in a bigger city. (live)', 'to live'),
  fill(GI, 'en-w1d-gi-fill-visit', G_I, ['gi.infinitive.chunks'], 'We plan ___ Spain next summer. (visit)', 'to visit'),
  fill(GI, 'en-w1d-gi-fill-see', G_L, ['gi.look-forward.doing'], "I'm looking forward to ___ my cousins. (see)", 'seeing'),
  fill(GI, 'en-w1d-gi-fill-start', G_L, ['gi.look-forward.doing'], 'She is looking forward to ___ at the new job. (start)', 'starting'),
];

/* ================================================================== */
/* Conditionals                                                        */
/* ================================================================== */

const C_2 = 'conditionals.second';
const C_M = 'conditionals.mistakes';

const COND_TRANSFORM: Array<[string, string, string, string[]?]> = [
  ['flat', 'If I (have) a bigger flat, I (invite) all my friends.', 'If I had a bigger flat, I would invite all my friends.', ['I would invite all my friends if I had a bigger flat.']],
  ['answer', 'If she (know) the answer, she (tell) us.', 'If she knew the answer, she would tell us.', ['She would tell us if she knew the answer.']],
  ['sea', 'If we (live) near the sea, we (swim) every day.', 'If we lived near the sea, we would swim every day.', ['We would swim every day if we lived near the sea.']],
  ['job', 'If he (speak) English better, he (get) the job.', 'If he spoke English better, he would get the job.', ['He would get the job if he spoke English better.']],
  ['doctor', 'If I (be) you, I (see) a doctor.', 'If I were you, I would see a doctor.', ['I would see a doctor if I were you.']],
  ['museum', 'If they (have) more time, they (visit) the museum.', 'If they had more time, they would visit the museum.', ['They would visit the museum if they had more time.']],
  ['expensive', 'If it (not / be) so expensive, I (buy) it.', "If it weren't so expensive, I would buy it.", ["If it wasn't so expensive, I would buy it.", "I would buy it if it weren't so expensive.", "I would buy it if it wasn't so expensive.", 'If it were not so expensive, I would buy it.']],
  ['exam', 'If you (study) harder, you (pass) the exam.', 'If you studied harder, you would pass the exam.', ['You would pass the exam if you studied harder.']],
];

const COND_STRUCTURE: Exercise[] = COND_TRANSFORM.map(([key, prompt, answer, alts]) =>
  CO(`en-w1d-cond-form-${key}`, 'free-text', 'medium', 'production', ['cond.second.formula'], {
    instruction: 'Fiilleri doğru biçime koy ve cümleyi yaz (Second Conditional):',
    prompt,
    answer,
    ...(alts ? { acceptedAnswers: alts } : {}),
    explanation: 'If + Past Simple (were), would + V1. If içinde would kullanılmaz.',
    validation: EN,
    sectionId: C_2,
  }));

const COND_TR: Exercise[] = [
  trEn(CO, 'en-w1d-cond-tr-laptop', C_2, ['cond.second.formula'], 'Daha çok param olsaydı yeni bir bilgisayar alırdım.', 'If I had more money, I would buy a new computer.', ['I would buy a new computer if I had more money.', 'If I had more money, I would buy a new laptop.']),
  trEn(CO, 'en-w1d-cond-tr-abroad', C_2, ['cond.second.formula'], 'Yurt dışında yaşasaydım İngilizcem daha hızlı gelişirdi.', 'If I lived abroad, my English would improve faster.', ['My English would improve faster if I lived abroad.']),
  trEn(CO, 'en-w1d-cond-tr-room', C_2, ['cond.second.hypotheticals'], 'Kendi odam olsaydı orada daha rahat çalışırdım.', 'If I had my own room, I would study more comfortably there.', ['I would study more comfortably there if I had my own room.', 'If I had my own room, I would study there more comfortably.']),
  trEn(CO, 'en-w1d-cond-tr-advice', C_2, ['cond.second.formula'], 'Senin yerinde olsam öğretmenle konuşurdum.', 'If I were you, I would talk to the teacher.', ['I would talk to the teacher if I were you.', 'If I were in your place, I would talk to the teacher.']),
  trEn(CO, 'en-w1d-cond-tr-weather', C_2, ['cond.second.formula'], 'Hava güzel olsaydı parka giderdik.', 'If the weather were nice, we would go to the park.', ['If the weather was nice, we would go to the park.', 'We would go to the park if the weather were nice.', 'We would go to the park if the weather was nice.']),
  trEn(CO, 'en-w1d-cond-tr-fluent', C_2, ['cond.second.hypotheticals'], 'İngilizceyi mükemmel konuşabilseydim yurt dışında çalışırdım.', 'If I could speak English perfectly, I would work abroad.', ['I would work abroad if I could speak English perfectly.']),
];

const COND_ERR: Exercise[] = [
  fix(CO, 'en-w1d-cond-err-know', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If I would know the answer, I would tell you.', 'If I knew the answer, I would tell you.', 'If bölümünde Past Simple: knew.'),
  fix(CO, 'en-w1d-cond-err-drive', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If she had a car, she will drive to work.', 'If she had a car, she would drive to work.', 'Second Conditional: would + V1.'),
  fix(CO, 'en-w1d-cond-err-metro', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If we would live in the city, we would use the metro.', 'If we lived in the city, we would use the metro.', 'If içinde would olmaz.'),
  fix(CO, 'en-w1d-cond-err-rich', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If I am rich, I would buy an island.', 'If I were rich, I would buy an island.', 'Hayali durumda If I were.'),
  fix(CO, 'en-w1d-cond-err-abroad', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'I would go abroad if I would have more money.', 'I would go abroad if I had more money.', 'If cümlesinde would yok.'),
  fix(CO, 'en-w1d-cond-err-harder', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If he studies harder, he would pass.', 'If he studied harder, he would pass.', 'would ile birlikte if bölümü Past Simple olur.'),
  fix(CO, 'en-w1d-cond-err-lottery', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'What would you do if you will win the lottery?', 'What would you do if you won the lottery?', 'If bölümünde will olmaz: won.'),
  fix(CO, 'en-w1d-cond-err-to', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If we had a garden, we would to grow vegetables.', 'If we had a garden, we would grow vegetables.', 'would + V1 (to yok).'),
  fix(CO, 'en-w1d-cond-err-invited', C_M, ['cond.mistakes.would', 'cond.second.formula'], 'If they had a bigger house, they would invited friends.', 'If they had a bigger house, they would invite friends.', 'would + V1: invite.'),
];

/* ================================================================== */
/* Prepositions & Collocations                                         */
/* ================================================================== */

const PA = 'prepositions-collocations.chunks-a';
const PB = 'prepositions-collocations.chunks-b';
const PCc = 'prepositions-collocations.chunks-c';
const PP_M = 'prepositions-collocations.mistakes';
const PP_P = 'prepositions-collocations.production';

const PREP_FILL: Exercise[] = [
  fill(PC, 'en-w1d-pc-fill-drawing', PA, ['pc.chunks-a.core'], 'She is good ___ drawing. (at)', 'at', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-results', PB, ['pc.chunks-b.core'], 'We are waiting ___ the results. (for)', 'for', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-traffic', PB, ['pc.chunks-b.core'], 'It depends ___ the traffic. (on)', 'on', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-flying', PCc, ['pc.chunks-c.core'], 'He is afraid ___ flying. (of)', 'of', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-test', PCc, ['pc.chunks-c.core'], 'Are you ready ___ the test? (for)', 'for', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-instructions', PA, ['pc.chunks-a.core'], 'Please listen ___ the instructions. (to)', 'to', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-hardwork', PB, ['pc.chunks-b.core'], 'I believe ___ hard work. (in)', 'in', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-accent', PCc, ['pc.chunks-c.core'], 'Your accent is different ___ mine. (from)', 'from', 'Edatı yaz:'),
  fill(PC, 'en-w1d-pc-fill-photo', PA, ['pc.chunks-a.core'], 'They are interested ___ photography. (in)', 'in', 'Edatı yaz:'),
];

const PREP_TR: Exercise[] = [
  trEn(PC, 'en-w1d-pc-tr-podcast', PP_P, ['pc.production.choice', 'pc.chunks-a.core'], 'Yolda podcast dinliyorum.', 'I listen to podcasts on the way.', ['I listen to podcasts on my way.']),
  trEn(PC, 'en-w1d-pc-tr-programming', PP_P, ['pc.production.choice', 'pc.chunks-a.core'], 'Programlamayla ilgileniyorum.', "I'm interested in programming.", ['I am interested in programming.']),
  trEn(PC, 'en-w1d-pc-tr-drawing', PP_P, ['pc.production.choice', 'pc.chunks-a.core'], 'Kız kardeşim resim yapmakta çok iyi.', 'My sister is very good at drawing.', ['My sister is really good at drawing.']),
  trEn(PC, 'en-w1d-pc-tr-doctor', PP_P, ['pc.production.choice', 'pc.chunks-b.core'], 'Doktoru bekliyorum.', "I'm waiting for the doctor.", ['I am waiting for the doctor.']),
  trEn(PC, 'en-w1d-pc-tr-price', PP_P, ['pc.production.choice', 'pc.chunks-b.core'], 'Fiyata bağlı.', 'It depends on the price.'),
  trEn(PC, 'en-w1d-pc-tr-team', PP_P, ['pc.production.choice', 'pc.chunks-b.core'], 'Takımımıza inanıyorum.', 'I believe in our team.'),
  trEn(PC, 'en-w1d-pc-tr-class', PP_P, ['pc.production.choice', 'pc.chunks-c.core'], 'Derste öğretmene dikkat etmelisin.', 'You should pay attention to the teacher in class.', ['In class you should pay attention to the teacher.']),
  trEn(PC, 'en-w1d-pc-tr-dogs', PP_P, ['pc.production.choice', 'pc.chunks-c.core'], 'Köpeklerden korkmuyorum.', "I'm not afraid of dogs.", ['I am not afraid of dogs.']),
  trEn(PC, 'en-w1d-pc-tr-exam', PP_P, ['pc.production.choice', 'pc.chunks-c.core'], 'Sınava hazır mısın?', 'Are you ready for the exam?'),
  trEn(PC, 'en-w1d-pc-tr-phone', PP_P, ['pc.production.choice', 'pc.chunks-c.core'], 'Bu telefon eskisinden farklı.', 'This phone is different from the old one.', ['This phone is different from the old phone.']),
];

const PREP_ERR: Exercise[] = [
  fix(PC, 'en-w1d-pc-err-sports', PP_M, ['pc.mistakes.chunks', 'pc.chunks-a.core'], "I'm not interested to sports.", "I'm not interested in sports.", 'interested in.', ['I am not interested in sports.']),
  fix(PC, 'en-w1d-pc-err-drawing', PP_M, ['pc.mistakes.chunks', 'pc.chunks-a.core'], 'She is very good in drawing.', 'She is very good at drawing.', 'good at.'),
  fix(PC, 'en-w1d-pc-err-train', PP_M, ['pc.mistakes.chunks', 'pc.chunks-b.core'], 'They are waiting the train.', 'They are waiting for the train.', 'wait for.'),
  fix(PC, 'en-w1d-pc-err-price', PP_M, ['pc.mistakes.chunks', 'pc.chunks-b.core'], 'That depends of your answer.', 'That depends on your answer.', 'depend on.'),
  fix(PC, 'en-w1d-pc-err-team', PP_M, ['pc.mistakes.chunks', 'pc.chunks-b.core'], 'We believe to our team.', 'We believe in our team.', 'believe in.'),
  fix(PC, 'en-w1d-pc-err-mistakes', PP_M, ['pc.mistakes.chunks', 'pc.chunks-c.core'], "Don't be afraid from making mistakes.", "Don't be afraid of making mistakes.", 'afraid of.', ['Do not be afraid of making mistakes.']),
  fix(PC, 'en-w1d-pc-err-interview', PP_M, ['pc.mistakes.chunks', 'pc.chunks-c.core'], "I'm ready to the interview.", "I'm ready for the interview.", 'ready for.', ['I am ready for the interview.']),
  fix(PC, 'en-w1d-pc-err-instructions', PP_M, ['pc.mistakes.chunks', 'pc.chunks-c.core'], 'Please pay attention the instructions.', 'Please pay attention to the instructions.', 'pay attention to: to öbeğin parçasıdır.'),
  fix(PC, 'en-w1d-pc-err-radio', PP_M, ['pc.mistakes.chunks', 'pc.chunks-a.core'], 'He listened the radio all night.', 'He listened to the radio all night.', 'listen to.'),
  fix(PC, 'en-w1d-pc-err-phone', PP_M, ['pc.mistakes.chunks', 'pc.chunks-c.core'], 'My phone is different than yours.', 'My phone is different from yours.', 'different from.'),
];

const matchEx = (id: string, section: string, instruction: string, pairs: Array<[string, string]>, explanation: string): Exercise =>
  PC(id, 'matching', 'medium', 'recognition', ['pc.production.choice'], {
    instruction, pairs: pairs.map(([left, right]) => ({ left, right })), explanation, sectionId: section,
  });

const PREP_MATCH: Exercise[] = [
  matchEx('en-w1d-pc-match-meaning-a', PA, 'Anlamı öbekle eşleştir:', [['ilgilenmek', 'be interested in'], ['…de iyi olmak', 'be good at'], ['dinlemek', 'listen to'], ['beklemek', 'wait for'], ['bağlı olmak', 'depend on'], ['inanmak', 'believe in']], 'Öbek bütün hâlinde öğrenilir: edat değişmez.'),
  matchEx('en-w1d-pc-match-stems-a', PB, 'Cümle başını doğru devamıyla eşleştir:', [["I'm interested", 'in cooking'], ['She is good', 'at maths'], ['Please listen', 'to me'], ["We're waiting", 'for the bus'], ['It depends', 'on the weather'], ['I believe', 'in you']], 'Her fiil/sıfat kendi edatını taşır.'),
  matchEx('en-w1d-pc-match-stems-b', PCc, 'Cümle başını doğru devamıyla eşleştir:', [["Don't be afraid", 'of mistakes'], ['Are you ready', 'for the trip'], ['This road is different', 'from that one'], ['Please pay attention', 'to the teacher'], ['He is interested', 'in history'], ['They are good', 'at football']], 'afraid of · ready for · different from · pay attention to.'),
  matchEx('en-w1d-pc-match-meaning-c', PCc, 'Anlamı öbekle eşleştir:', [['dikkat etmek', 'pay attention to'], ['korkmak', 'be afraid of'], ['hazır olmak', 'be ready for'], ['farklı olmak', 'be different from'], ['şuna bağlı olmak', 'depend on'], ['yurt dışında çalışmak', 'work abroad']], 'Öbekleri bütün olarak hatırla.'),
];

/* ------------------------------------------------------------------ */

export const EN_EXERCISES_WEEK1_DEPTH: Exercise[] = [
  ...SS_ORDER, ...SS_TR, ...SS_Q, ...SS_EXP, ...SS_ERR,
  ...PPF_TR, ...PPF_ORDER, ...PPF_CONTRAST, ...PPF_ERR,
  ...GI_ERR, ...GI_TR, ...GI_FILL,
  ...COND_STRUCTURE, ...COND_TR, ...COND_ERR,
  ...PREP_FILL, ...PREP_TR, ...PREP_ERR, ...PREP_MATCH,
];

