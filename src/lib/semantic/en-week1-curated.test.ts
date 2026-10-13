/**
 * Hafta 1 İngilizce serbest yazım: küratörlü Jev/politika vakaları.
 *
 * CANLI Jev ÇAĞRILMAZ. Jev, her zaman "kabul" diyen bir sahteyle değiştirilir;
 * böylece şu iki şey ölçülür:
 *   1. Geçerli alternatifler (cümle sırası, kısaltma, eşanlamlı içerik) kabul edilir —
 *      yerelde ya da Jev'e sorulup (sahte kabul eder).
 *   2. Hedeflenen dilbilgisi hatası, Jev AŞIRI HOŞGÖRÜLÜ olsa bile REDDEDİLİR ve
 *      Jev'e hiç sorulmaz (yerel koruma). Yanlış-kabul sayısı 0 olmalı.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../content/types';
import { EN_LESSON_EXERCISES } from '../../content/en/index';
import { clearSemanticCache } from './cache';
import { validateAnswer } from './validate-answer';
import { isSemanticFallbackEligible } from './policy';

const permissiveJev = vi.fn(async () => ({
  correct: true, probability: 0.99, validationSource: 'jev-semantic' as const, latencyMs: 1,
}));

beforeEach(() => {
  clearSemanticCache();
  permissiveJev.mockClear();
});

let counter = 0;
function exercise(topicId: string, answer: string, acceptedAnswers: string[] = [], concept = 'x'): Exercise {
  counter += 1;
  return {
    id: `en-curated-${counter}`, topicId, topic: topicId, type: 'free-text',
    instruction: 'Türkçeden İngilizceye çevir:', prompt: 'x → ______', answer,
    ...(acceptedAnswers.length ? { acceptedAnswers } : {}),
    difficulty: 'hard', skill: 'production', conceptIds: [concept], origin: 'authored',
    source: { file: 'curated', naturalKey: String(counter) }, validation: { englishContractions: true },
  } as Exercise;
}

async function judge(e: Exercise, user: string) {
  const before = permissiveJev.mock.calls.length;
  const result = await validateAnswer(e, user, { jevFetch: permissiveJev });
  return { correct: result.correct, jevCalled: permissiveJev.mock.calls.length - before };
}

const PPF = 'en.past-perfect';
const GI = 'en.gerund-infinitive';
const CO = 'en.conditionals';
const PC = 'en.prepositions-collocations';
const SS = 'en.sentence-structure';

/** [konu, beklenen, kabul edilen cevap] */
const ACCEPT: Array<[string, string, string]> = [
  // Past Perfect — cümle sırası, kısaltma, eşanlamlı içerik sözcüğü
  [PPF, 'The film had started before we arrived.', 'Before we arrived, the film had started.'],
  [PPF, 'The film had started before we arrived.', 'The movie had started before we arrived.'],
  [PPF, 'She had cleaned the flat before her guests arrived.', 'Before her guests arrived, she had cleaned the flat.'],
  [PPF, 'They had already eaten when we called.', 'When we called, they had already eaten.'],
  [PPF, 'I realised that I had left my wallet at home.', 'I realised I had left my wallet at home.'],
  [PPF, 'He had never seen the sea before.', "He'd never seen the sea before."],
  [PPF, 'The shop had closed by the time I arrived.', 'By the time I arrived, the shop had closed.'],
  // Gerund / Infinitive
  [GI, 'I enjoy playing football.', 'I enjoy playing football.'],
  [GI, 'I enjoy playing football.', 'I really enjoy playing football.'],
  [GI, 'I decided to study.', 'I have decided to study.'],
  [GI, 'We plan to go to the cinema this evening.', 'This evening we plan to go to the cinema.'],
  [GI, 'She keeps working on the computer.', 'She keeps working on her computer.'],
  [GI, 'I look forward to meeting you.', "I'm looking forward to meeting you."],
  // Conditionals
  [CO, 'If I had more time, I would study English.', 'I would study English if I had more time.'],
  [CO, 'If I had more time, I would study English.', "If I had more time, I'd study English."],
  [CO, 'If I lived abroad, my English would improve faster.', 'My English would improve faster if I lived abroad.'],
  [CO, 'If I were you, I would talk to the teacher.', 'I would talk to the teacher if I were you.'],
  [CO, 'If I could speak English perfectly, I would work abroad.', 'I would work abroad if I could speak English perfectly.'],
  // Collocations
  [PC, "I'm interested in programming.", 'I am interested in programming.'],
  [PC, "I'm interested in programming.", 'I am really interested in programming.'],
  [PC, 'It depends on the price.', 'It depends on the price!'],
  [PC, 'You should pay attention to the teacher in class.', 'In class you should pay attention to the teacher.'],
  // Sentence Structure
  [SS, 'I usually read the news on my phone in the morning.', 'In the morning I usually read the news on my phone.'],
  [SS, 'Do you know where the bank is?', 'Do you know where the bank is?'],
];

/** [konu, beklenen, REDDEDİLECEK cevap] — hedeflenen dilbilgisi hatası. */
const REJECT: Array<[string, string, string]> = [
  // Past Perfect
  [PPF, 'The film had started before we arrived.', 'The film has started before we arrived.'],
  [PPF, 'The film had started before we arrived.', 'The film have started before we arrived.'],
  [PPF, 'The film had started before we arrived.', 'The film had start before we arrived.'],
  [PPF, 'The film had started before we arrived.', 'The film started before we arrived.'],
  [PPF, 'She had cleaned the flat before her guests arrived.', 'She has cleaned the flat before her guests arrived.'],
  [PPF, 'They had already eaten when we called.', 'They have already eaten when we called.'],
  [PPF, 'The train had left before we reached the station.', 'The train had leaved before we reached the station.'],
  [PPF, 'The shop had closed by the time I arrived.', 'The shop has closed by the time I arrived.'],
  [PPF, 'After he had finished university, he moved to London.', 'After he had finish university, he moved to London.'],
  // Gerund
  [GI, 'I enjoy playing football.', 'I enjoy to play football.'],
  [GI, 'I enjoy playing football.', 'I enjoy play football.'],
  [GI, 'She enjoys cooking for her friends.', 'She enjoys to cook for her friends.'],
  [GI, 'He avoids eating too much sugar.', 'He avoids to eat too much sugar.'],
  [GI, 'He avoids eating too much sugar.', 'He avoids eat too much sugar.'],
  [GI, 'I look forward to meeting you.', 'I look forward to meet you.'],
  [GI, 'He suggested going by train.', 'He suggested to go by train.'],
  [GI, 'Do you mind opening the window?', 'Do you mind to open the window?'],
  // Infinitive
  [GI, 'I decided to study.', 'I decided study.'],
  [GI, 'I decided to study.', 'I decided studying.'],
  [GI, 'I decided to buy a new phone.', 'I decided buy a new phone.'],
  [GI, 'We plan to go to the cinema this evening.', 'We plan going to the cinema this evening.'],
  [GI, 'I hope to see you soon.', 'I hope see you soon.'],
  [GI, 'We need to buy some milk.', 'We need buy some milk.'],
  [GI, 'He promised to help me.', 'He promised helping me.'],
  // Conditionals
  [CO, 'If I had more time, I would study English.', 'If I would have more time, I would study English.'],
  [CO, 'If I had more time, I would study English.', 'If I have more time, I would study English.'],
  [CO, 'If I had more time, I would study English.', 'If I had more time, I will study English.'],
  [CO, 'If I had more time, I would study English.', 'If I had more time, I would studied English.'],
  [CO, 'If I lived abroad, my English would improve faster.', 'If I would live abroad, my English would improve faster.'],
  [CO, 'If I were you, I would talk to the teacher.', 'If I am you, I would talk to the teacher.'],
  [CO, 'If she had a car, she would drive to work.', 'If she had a car, she will drive to work.'],
  [CO, 'If I knew the answer, I would tell you.', 'If I would know the answer, I would tell you.'],
  [CO, 'What would you do if you won the lottery?', 'What would you do if you will win the lottery?'],
  // Collocations
  [PC, "I'm interested in programming.", "I'm interested for programming."],
  [PC, "I'm interested in programming.", "I'm interested at programming."],
  [PC, 'She is good at drawing.', 'She is good in drawing.'],
  [PC, "I'm waiting for the doctor.", "I'm waiting the doctor."],
  [PC, 'It depends on the price.', 'It depends of the price.'],
  [PC, 'I believe in our team.', 'I believe to our team.'],
  [PC, "I'm not afraid of dogs.", "I'm not afraid from dogs."],
  [PC, 'Are you ready for the exam?', 'Are you ready to the exam?'],
  [PC, 'This phone is different from the old one.', 'This phone is different than the old one.'],
  [PC, 'You should pay attention to the teacher.', 'You should give attention to the teacher.'],
  [PC, 'I listen to podcasts on the way.', 'I listen podcasts on the way.'],
  // Present Perfect (regresyon)
  ['en.present-perfect', "I haven't seen it.", "I haven't see it."],
  // Sentence Structure
  [SS, 'Do you know where the bank is?', 'Do you know where the bank it is?'],
  [SS, 'Do you know where the bank is?', 'Do you know where is the bank?'],
  [SS, 'What time do you get up?', 'What time you get up?'],
];

describe('Hafta 1 küratörlü Jev vakaları (canlı Jev YOK; sahte Jev)', () => {
  it(`geçerli alternatifler kabul edilir (${ACCEPT.length} vaka)`, async () => {
    const failures: string[] = [];
    for (const [topic, expected, user] of ACCEPT) {
      const { correct } = await judge(exercise(topic, expected), user);
      if (!correct) failures.push(`${expected} ⟵ ${user}`);
    }
    expect(failures).toEqual([]);
  });

  it(`hedeflenen dilbilgisi hatası, Jev aşırı hoşgörülü olsa bile reddedilir ve Jev'e sorulmaz (${REJECT.length} vaka)`, async () => {
    const falseAccepts: string[] = [];
    const leaked: string[] = [];
    for (const [topic, expected, user] of REJECT) {
      const { correct, jevCalled } = await judge(exercise(topic, expected), user);
      if (correct) falseAccepts.push(`${expected} ⟵ ${user}`);
      if (jevCalled) leaked.push(`${expected} ⟵ ${user}`);
    }
    expect(falseAccepts, 'yanlış-kabul').toEqual([]);
    expect(leaked, 'Jev çağrılan').toEqual([]);
  });

  it('spesifik örnekler: Past Perfect / Gerund / Infinitive / Conditionals / Collocations', async () => {
    const pp = exercise(PPF, 'The film had started before we arrived.');
    expect((await judge(pp, 'Before we arrived, the film had started.')).correct).toBe(true);
    expect((await judge(pp, 'The film has started before we arrived.')).correct).toBe(false);
    const ger = exercise(GI, 'I enjoy playing football.');
    expect((await judge(ger, 'I enjoy to play football.')).correct).toBe(false);
    const inf = exercise(GI, 'I decided to study.');
    expect((await judge(inf, 'I decided study.')).correct).toBe(false);
    const cond = exercise(CO, 'If I had more time, I would study English.');
    expect((await judge(cond, 'I would study English if I had more time.')).correct).toBe(true);
    expect((await judge(cond, 'If I would have more time, I would study English.')).correct).toBe(false);
    const col = exercise(PC, "I'm interested in programming.");
    expect((await judge(col, "I'm interested for programming.")).correct).toBe(false);
  });

  it('geçerli alternatif için politika Jev’e sormaya izin verir (yerel koruma yanlış-ret üretmez)', () => {
    for (const [topic, expected, user] of ACCEPT) {
      const e = exercise(topic, expected);
      expect(isSemanticFallbackEligible(e, user), `${expected} ⟵ ${user}`).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Gerçek içerik üzerinde otomatik bozma (mutasyon) taraması            */
/* ------------------------------------------------------------------ */

type Mutation = (answer: string) => string | null;

const swap = (from: RegExp, to: string): Mutation => (answer) => (from.test(answer) ? answer.replace(from, to) : null);

const MUTATIONS: Record<string, Mutation[]> = {
  'en.past-perfect': [
    swap(/\bhad\b/, 'has'),
    swap(/\bhad (\w+ed)\b/, '$1'), // had kaybı → Simple Past
    swap(/\bhad (\w+)ed\b/, 'had $1'), // yalın fiil (had arrive)
  ],
  'en.gerund-infinitive': [
    swap(/\b(enjoy|enjoys|avoid|avoids|finished|keeps|keep|suggested|mind|like|love) (\w+)ing\b/, '$1 to $2'),
    swap(/\b(decided|plan|want|wants|need|hope|promised|offered|decide) to (\w+)\b/, '$1 $2'),
    swap(/\b(decided|plan|want|wants|need|hope|promised|offered|decide) to (\w+)\b/, '$1 $2ing'),
  ],
  'en.conditionals': [
    swap(/\bIf I had\b/, 'If I would have'),
    swap(/\bIf I (\w+)ed\b/, 'If I would $1'),
    swap(/, (?:I|we|they|she|he) would\b/, ', I will'),
  ],
  'en.prepositions-collocations': [
    swap(/\binterested in\b/, 'interested for'),
    swap(/\bgood at\b/, 'good in'),
    swap(/\bwaiting for\b/, 'waiting'),
    swap(/\bdepends on\b/, 'depends of'),
    swap(/\bbelieve in\b/, 'believe to'),
    swap(/\bafraid of\b/, 'afraid from'),
    swap(/\bready for\b/, 'ready to'),
    swap(/\bdifferent from\b/, 'different than'),
    swap(/\bpay attention to\b/, 'give attention to'),
    swap(/\blisten to\b/, 'listen'),
  ],
};

const FREE_TEXT = EN_LESSON_EXERCISES.filter(
  (e) => e.type === 'free-text' && e.answer && MUTATIONS[e.topicId],
);

describe('mutasyon taraması: bozulmuş cevap hiçbir gerçek alıştırmada kabul edilmez', () => {
  it('Past Perfect / Gerund / Infinitive / Conditionals / Collocations (Jev aşırı hoşgörülü)', async () => {
    let tested = 0;
    const falseAccepts: string[] = [];
    for (const e of FREE_TEXT) {
      const accepted = [e.answer!, ...(e.acceptedAnswers ?? [])];
      for (const mutate of MUTATIONS[e.topicId]) {
        const broken = mutate(e.answer!);
        if (!broken || broken === e.answer || accepted.includes(broken)) continue;
        tested += 1;
        clearSemanticCache();
        const { correct } = await judge({ ...e, id: `${e.id}-m${tested}` }, broken);
        if (correct) falseAccepts.push(`${e.id}: ${broken}`);
      }
    }
    expect(tested, 'taranan bozuk cevap sayısı').toBeGreaterThan(150);
    expect(falseAccepts).toEqual([]);
  });
});
