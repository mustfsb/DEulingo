/**
 * İngilizce Writing — 10 görev (80–150 kelime, B1 üretim).
 * Draft → feedback → rewrite akışı için rubrik kategorileri.
 */

export interface WritingTask {
  id: string;
  title: string;
  level: string;
  /** short | grammar | guided | ielts-intro */
  kind: 'short' | 'grammar' | 'guided' | 'ielts-intro' | 'weekly-test';
  prompt: string;
  promptTr: string;
  minWords: number;
  maxWords: number;
  grammarFocus: string[];
  requirements: string[];
  sampleAnswer: string;
  /** geri bildirimde kontrol edilecek noktalar */
  checklist: string[];
  /** Rehberli yazma iskeleti (paragraf paragraf). */
  outline?: string[];
}

export const EN_WRITING_TASKS: WritingTask[] = [
  {
    id: 'en-write-1', title: 'Why I Want to Improve My English', level: 'B1', kind: 'short',
    prompt: 'Why do you want to improve your English? Write 80–100 words.',
    promptTr: 'Neden İngilizceni geliştirmek istiyorsun? 80–100 kelime yaz.',
    minWords: 80, maxWords: 100,
    grammarFocus: ['Present Perfect', 'because', 'want to do'],
    requirements: ['80–100 kelime', 'en az 2 because cümlesi', 'en az 1 Present Perfect'],
    sampleAnswer: 'I want to improve my English because I want a better job. I have studied English for two years. I study every evening because I love learning. I listen to music and I watch films. I have never travelled abroad, but I want to visit London. If I had more time, I would read books every day.',
    checklist: ['because cümlesi var mı?', 'Present Perfect doğru mu?', 'SVO sırası doğal mı?', 'kelime tekrarı az mı?'],
  },
  {
    id: 'en-write-2', title: 'My English Learning Journey', level: 'B1', kind: 'guided',
    prompt: 'Describe your English journey: how long, what you learned, what is difficult. 100–120 words.',
    promptTr: 'İngilizce yolculuğunu anlat: ne kadar süredir, neler öğrendin, ne zor. 100–120 kelime.',
    minWords: 100, maxWords: 120,
    grammarFocus: ['for/since', 'have/has + V3', 'but/however'],
    requirements: ['100–120 kelime', 'en az 1 for + 1 since', 'en az 2 düzensiz V3'],
    sampleAnswer: 'I have studied English for three years. I have lived in the same city since 2020. I have learned many verbs and I have finished two books. Listening is difficult for me, but I practise every day. I have never given up. However, writing is still hard. I plan to write one paragraph every week.',
    checklist: ['for/since doğru mu?', 'V3 doğru mu?', 'however kullanımı doğru mu?'],
  },
  {
    id: 'en-write-3', title: 'A Skill I Have Learned', level: 'B1', kind: 'grammar',
    prompt: 'Write about a skill you have learned (cooking, guitar, football). 80–120 words.',
    promptTr: 'Öğrendiğin bir beceriyi anlat. 80–120 kelime.',
    minWords: 80, maxWords: 120,
    grammarFocus: ['Present Perfect', 'enjoy doing', 'keep doing'],
    requirements: ['80–120 kelime', 'en az 2 Present Perfect', 'en az 1 enjoy/keep + doing'],
    sampleAnswer: 'I have learned to cook. I enjoy cooking Turkish food. I finished learning basic dishes last year. I have cooked for my family many times. I keep practising new recipes. I look forward to cooking a big dinner next month.',
    checklist: ['enjoy + doing doğru mu?', 'zaman sözcükleri doğru mu?', 'cümle sırası doğal mı?'],
  },
  {
    id: 'en-write-4', title: 'My Daily Routine', level: 'B1', kind: 'short',
    prompt: 'Describe your daily routine with place + time order. 80–100 words.',
    promptTr: 'Günlük rutinini yer+zaman sırasıyla anlat. 80–100 kelime.',
    minWords: 80, maxWords: 100,
    grammarFocus: ['SVO', 'place before time', 'every day'],
    requirements: ['80–100 kelime', 'en az 3 yer+zaman cümlesi', 'SVO korunmuş'],
    sampleAnswer: 'I get up at seven every morning. I have breakfast with my family at home. I study in the library every evening. I play football in the park at the weekend. I listen to music in my room every night.',
    checklist: ['place before time doğru mu?', 'özne-fiil uyumu doğru mu?'],
  },
  {
    id: 'en-write-5', title: 'What I Did Yesterday (Past Focus)', level: 'B1', kind: 'grammar',
    prompt: 'Write what happened yesterday. Use Simple Past + one Past Perfect sentence. 100–130 words.',
    promptTr: 'Dün ne olduğunu anlat. Simple Past + bir Past Perfect cümlesi kullan.',
    minWords: 100, maxWords: 130,
    grammarFocus: ['Simple Past', 'had + V3', 'before/after'],
    requirements: ['100–130 kelime', 'en az 4 Simple Past', 'en az 1 had + V3'],
    sampleAnswer: 'Yesterday I got up late. The bus had left before I arrived. I waited for twenty minutes. By the time I arrived at school, the lesson had started. After school, I studied in the library. I went home and watched a film.',
    checklist: ['önce olan had + V3 mi?', 'yesterday Simple Past mı?', 'before/after doğru mu?'],
  },
  {
    id: 'en-write-6', title: 'Things I Enjoy Doing', level: 'B1', kind: 'grammar',
    prompt: 'Write about free-time activities with gerunds. 80–120 words.',
    promptTr: 'Boş zaman aktivitelerini gerund ile anlat. 80–120 kelime.',
    minWords: 80, maxWords: 120,
    grammarFocus: ['enjoy doing', 'avoid/keep + doing'],
    requirements: ['80–120 kelime', 'en az 3 gerund kalıbı', 'chunk doğru'],
    sampleAnswer: 'I enjoy playing football and watching films. I avoid watching horror films. I keep reading English books. I miss travelling with my friends. I love learning new words.',
    checklist: ['enjoy + doing mi?', 'to visit hatası var mı?'],
  },
  {
    id: 'en-write-7', title: 'My Plans for Next Year', level: 'B1', kind: 'guided',
    prompt: 'Write your plans with want/decide/plan/hope + to do. 100–130 words.',
    promptTr: 'Gelecek yıl planlarını infinitive kalıplarla yaz.',
    minWords: 100, maxWords: 130,
    grammarFocus: ['want/decide/plan/hope + to do'],
    requirements: ['100–130 kelime', 'en az 3 infinitive kalıbı'],
    sampleAnswer: 'Next year I want to improve my English. I decided to study every day. I plan to take an IELTS course. I hope to visit London. I promised to help my brother with his lessons.',
    checklist: ['to eksik mi?', 'decide take hatası var mı?'],
  },
  {
    id: 'en-write-8', title: 'What Would I Do Abroad?', level: 'B1', kind: 'guided',
    prompt: 'If you studied abroad, what would you do? Use Second Conditional. 100–140 words.',
    promptTr: 'Yurt dışında okusaydın ne yapardın? Second ile yaz.',
    minWords: 100, maxWords: 140,
    grammarFocus: ['If + Past, would + V1'],
    requirements: ['100–140 kelime', 'en az 3 Second cümlesi', 'If içinde would yok'],
    sampleAnswer: 'If I studied abroad, I would live in London. If I had more money, I would travel every weekend. If I could speak fluently, I would work part-time. I would visit museums and I would make foreign friends.',
    checklist: ['If + Past doğru mu?', 'would + V1 mi?', 'If I would hatası var mı?'],
  },
  {
    id: 'en-write-9', title: 'My Favourite Place (Collocations)', level: 'B1', kind: 'guided',
    prompt: 'Describe your favourite place with 3 collocations (interested in, good at, pay attention…). 100–130 words.',
    promptTr: 'En sevdiğin yeri 3 öbekle anlat.',
    minWords: 100, maxWords: 130,
    grammarFocus: ['collocations', 'SVO'],
    requirements: ['100–130 kelime', 'en az 3 doğru öbek'],
    sampleAnswer: 'My favourite place is the library. I am interested in books. I listen to quiet music there. I pay attention to new novels. The staff is different from other shops. I wait for new books every month.',
    checklist: ['öbek bütün mü?', 'interested for hatası var mı?'],
  },
  {
    id: 'en-write-10', title: 'IELTS Intro: Study or Work (tarz)', level: 'B1+', kind: 'ielts-intro',
    prompt: 'IELTS tarzı giriş: Do you study or work? What do you enjoy? 120–150 words, clean B1 sentences.',
    promptTr: 'IELTS tarzı giriş sorusuna B1 cümlelerle cevap ver. 120–150 kelime.',
    minWords: 120, maxWords: 150,
    grammarFocus: ['Present Perfect', 'SVO', 'because/so'],
    requirements: ['120–150 kelime', 'soruya tam cevap', 'en az 2 bağlaç'],
    sampleAnswer: 'I study computer science at university. I have studied for two years. I enjoy learning programming because it is creative. I study in the library every evening. I listen to English lessons because I want to work abroad. If I had more time, I would join an English club. I believe in hard work.',
    checklist: ['soruya cevap var mı?', 'cümleler temiz mi?', 'bağlaç doğru mu?'],
  },
  {
    id: 'en-write-w1-guided', title: 'Why I Want to Improve My English (Guided)', level: 'B1', kind: 'guided',
    prompt: 'Why do you want to improve your English? Write 120–150 words. Follow the five-part plan below.',
    promptTr: 'Neden İngilizceni geliştirmek istiyorsun? 120–150 kelime yaz; aşağıdaki 5 bölümlü iskeleti izle.',
    minWords: 120, maxWords: 150,
    grammarFocus: ['because / so', 'cümle sırası (SVO + yer + zaman)', 'Present Perfect'],
    requirements: ['120–150 kelime', '5 bölüm (iskelet)', 'en az 2 because/so cümlesi', 'en az 1 Present Perfect'],
    outline: [
      'Introduction — bu yazıda ne anlatacaksın? (1–2 cümle)',
      'Current English — şu an İngilizcen nasıl, ne kadar süredir çalışıyorsun?',
      'Why English matters — İngilizce senin için neden önemli? (because / so)',
      'What I want to improve — hangi becerini geliştirmek istiyorsun?',
      'Future goal — hedefin ne, ne yapmayı planlıyorsun?',
    ],
    sampleAnswer: 'In this text I will explain why I want to improve my English. I have studied English for three years, and I can read simple articles and write short messages. However, speaking is still difficult for me. English matters because I want to study abroad, so I need a good level for the exam. It also helps me to find a better job. I want to improve my speaking and my writing most of all. I practise with films every evening because I enjoy learning new phrases. My goal is to pass the IELTS exam next year. I plan to speak English for ten minutes every day, and I hope to live in London one day.',
    checklist: ['5 bölüm var mı?', 'because/so doğru mu?', 'Present Perfect doğru mu?', 'cümle sırası doğal mı?'],
  },
  {
    id: 'en-write-wt-1', title: 'Hafta 1 Yazma Testi: Something I Want to Get Better At', level: 'B1', kind: 'weekly-test',
    prompt: 'Write about something you want to get better at (a skill, a subject or a habit). Explain why it matters to you and what you are doing about it. 120–150 words.',
    promptTr: 'Daha iyi olmak istediğin bir şeyi (beceri, ders ya da alışkanlık) anlat. Neden önemli ve bunun için ne yapıyorsun? 120–150 kelime.',
    minWords: 120, maxWords: 150,
    grammarFocus: [],
    requirements: ['120–150 kelime', 'doğal, akıcı B1 cümleleri'],
    sampleAnswer: 'I want to get better at speaking English. It matters to me because I would like to study abroad, and I will need to talk to people every day. I have studied English for three years, but I have never lived in an English-speaking country. When I started the course, I had only learned a few hundred words. Now I enjoy watching films in English, and I try to repeat the sentences aloud. I am interested in learning new phrases, so I write them in a notebook. If I had more free time, I would join a conversation club. I look forward to speaking more confidently next year.',
    checklist: ['soruya tam cevap var mı?', 'cümleler temiz mi?'],
  },
  {
    id: 'en-write-w1-story', title: 'A Day That Went Wrong (Past Perfect Story)', level: 'B1', kind: 'guided',
    prompt: 'Tell the story of a day when something went wrong. Show clearly what had happened BEFORE the main event. Write 110–140 words.',
    promptTr: 'Bir şeylerin ters gittiği bir günü anlat. Ana olaydan ÖNCE ne olduğunu açıkça göster. 110–140 kelime.',
    minWords: 110, maxWords: 140,
    grammarFocus: ['Past Simple (olay sırası)', 'had + V3 (önce olan)', 'decide to / avoid + doing'],
    requirements: ['110–140 kelime', 'en az 3 had + V3 cümlesi', 'en az 1 by the time / before / after', 'en az 1 gerund ya da infinitive kalıbı'],
    outline: [
      'Setting — ne zaman, neredeydin, planın neydi?',
      'Problem — vardığında / fark ettiğinde ne olmuştu? (had + V3)',
      'Reaction — ne yapmaya karar verdin? (decided to …)',
      'Ending — nasıl bitti, şimdi neyi yapmaktan kaçınıyorsun? (avoid + doing)',
    ],
    sampleAnswer: 'Last month I had an important interview in the city centre. I had prepared everything the night before, and I had set two alarms. However, when I woke up, my phone had died and I had already missed my bus. By the time I got to the station, the next train had left as well. I decided to take a taxi, although it was expensive. When I finally arrived, the manager had gone into another meeting, so I had to wait for an hour. Fortunately, she had read my email and she was very kind. The interview went well in the end. Since that day I have avoided leaving things to the last minute, and I always plan to arrive early.',
    checklist: ['Önce olan olaylar had + V3 ile mi?', 'Ana olaylar Past Simple mı?', 'before / after / by the time doğru mu?', 'decide + to do, avoid + doing doğru mu?', 'Hikâyenin sonu var mı?'],
  },
  {
    id: 'en-write-w1-response', title: 'Reading Response: How Adults Learn Languages', level: 'B1+', kind: 'guided',
    prompt: 'Summarise two ideas from “Learning a Language as an Adult” in your own words, then say which idea you will use in your own study and why. Write 100–130 words. Do not copy sentences from the passage.',
    promptTr: '“Learning a Language as an Adult” pasajından iki fikri kendi cümlelerinle özetle; sonra hangisini kendi çalışmanda kullanacağını ve nedenini yaz. 100–130 kelime. Pasajdan cümle kopyalama.',
    minWords: 100, maxWords: 130,
    grammarFocus: ['özetleme (The passage says that …)', 'because / so / however', 'öbekler (pay attention to, depend on …)'],
    requirements: ['100–130 kelime', '2 fikir özeti + 1 kişisel karar', 'en az 2 öbek (collocation)', 'kopya cümle yok'],
    outline: [
      'Summary 1 — pasajın bir fikri (The passage explains that …)',
      'Summary 2 — ikinci fikir (It also says that …)',
      'My choice — hangisini kullanacaksın? (I am going to … because …)',
      'Plan — bu hafta somut olarak ne yapacaksın?',
    ],
    sampleAnswer: 'The passage explains that age is not the main barrier for adult learners, because motivation and clear goals matter more. It also says that short daily sessions work better than one long session at the weekend, since the brain needs to meet new language again and again. I am going to use the second idea, because I usually study for three hours on Sunday and then forget most of it. I am interested in learning chunks, so I will pay attention to phrases instead of single words. This week I plan to study for twenty-five minutes every evening after dinner. I will write my mistakes down and try again the next day. I think my progress will depend on this habit.',
    checklist: ['İki fikir pasajla uyumlu mu?', 'Kendi cümlelerin mi (kopya yok)?', 'Kişisel karar ve nedeni var mı?', 'En az iki öbek doğru mu?', 'because / so / however doğru mu?'],
  },
  {
    id: 'en-write-w1-if', title: 'If I Could Change One Thing (Second Conditional)', level: 'B1', kind: 'guided',
    prompt: 'If you could change one thing about your city, your school or your job, what would you change? Explain what would be different. Write 110–140 words.',
    promptTr: 'Şehrinde, okulunda ya da işinde tek bir şeyi değiştirebilseydin neyi değiştirirdin? Nelerin farklı olacağını açıkla. 110–140 kelime.',
    minWords: 110, maxWords: 140,
    grammarFocus: ['If + Past Simple, would + V1', 'öbekler: depend on, be interested in, pay attention to, be good at'],
    requirements: ['110–140 kelime', 'en az 4 Second Conditional cümlesi', 'If yan cümlesinde would yok', 'en az 3 doğru öbek'],
    outline: [
      'The change — neyi değiştirirdin? (If I could …, I would …)',
      'Result 1 — insanlar için ne değişirdi?',
      'Result 2 — senin günlük hayatın nasıl olurdu?',
      'Problem — bir zorluk olur muydu? (It would depend on …)',
    ],
    sampleAnswer: 'If I could change one thing about my city, I would improve public transport. If there were more buses in the evening, people would not depend on their cars so much. The streets would be quieter, and children would be able to walk to school safely. If I were the mayor, I would also pay attention to cycling, because many young people are interested in it. If the city built safe bike lanes, I would cycle to work every day, and I would probably be better at getting up early. Of course, everything would depend on money. If the council did not have enough, it would need to ask for help. Even so, I believe in small changes, and I would start with one new bus line.',
    checklist: ['If + Past Simple doğru mu (If I would … yok)?', 'Ana cümlede would + V1 mi?', 'If I were … kullandın mı?', 'Öbekler edatıyla birlikte doğru mu?', 'Fikirler birbirine bağlı mı?'],
  },
];

export const EN_WRITING_BY_ID = new Map(EN_WRITING_TASKS.map((t) => [t.id, t]));

/** Yazı geri bildirimi kategorileri (duvar metin yok, 3–5 öncelik). */
export const WRITING_FEEDBACK_CATEGORIES = [
  'Grammar',
  'Vocabulary',
  'Collocations',
  'Sentence Structure',
  'Word Choice',
  'Spelling',
  'Task Completion',
] as const;

export interface WritingFeedbackItem {
  category: (typeof WRITING_FEEDBACK_CATEGORIES)[number];
  message: string;
  suggestion?: string;
}

/** Kural tabanlı hafif yazı denetimi (Jev essay notu vermez; bounded kontroller). */
export function analyzeWriting(text: string, task: WritingTask): WritingFeedbackItem[] {
  const out: WritingFeedbackItem[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < task.minWords) {
    out.push({ category: 'Task Completion', message: `Metin kısa: ${words.length} kelime (hedef ${task.minWords}–${task.maxWords}).`, suggestion: 'Birkaç cümle daha ekle.' });
  } else if (words.length > task.maxWords + 40) {
    out.push({ category: 'Task Completion', message: `Metin uzun: ${words.length} kelime.`, suggestion: 'Gereksiz tekrarları çıkar.' });
  }
  const lower = ` ${text.toLowerCase()} `;
  void lower;
  const patterns: Array<[RegExp, WritingFeedbackItem]> = [
    [/enjoy to /i, { category: 'Collocations', message: '“enjoy to …” bulundu.', suggestion: 'enjoy + doing: enjoy visiting.' }],
    [/decide (take|study|go|come|learn|work)\b/i, { category: 'Grammar', message: '“decide + V1” bulundu.', suggestion: 'decide + to do: decide to take.' }],
    [/look forward to (see|go|hear|work)\b/i, { category: 'Collocations', message: '“look forward to + V1” bulundu.', suggestion: 'look forward to + doing: seeing.' }],
    [/interested for/i, { category: 'Collocations', message: '“interested for” bulundu.', suggestion: 'interested in.' }],
    [/give attention/i, { category: 'Collocations', message: '“give attention” bulundu.', suggestion: 'pay attention to.' }],
    [/where the bank it is/i, { category: 'Sentence Structure', message: 'Fazla “it” var.', suggestion: 'where the bank is.' }],
    [/if i would have/i, { category: 'Grammar', message: '“If I would have” bulundu.', suggestion: 'If I had…' }],
    [/since (three|two|five|ten) years/i, { category: 'Grammar', message: '“since + süre” bulundu.', suggestion: 'for three years.' }],
  ];
  for (const [re, item] of patterns) {
    if (re.test(text)) out.push(item);
  }
  if (!/because|so|but|however/i.test(text) && task.requirements.some((r) => /bağlaç/i.test(r))) {
    out.push({ category: 'Sentence Structure', message: 'Bağlaç yok.', suggestion: 'because/so/but ile iki cümleyi bağla.' });
  }
  void lower;
  // cümle sayısı kontrolü
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length < 4) {
    out.push({ category: 'Task Completion', message: `Cümle sayısı az (${sentences.length}).`, suggestion: 'Fikrini 5+ cümleyle aç.' });
  }
  return out.slice(0, 5);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Hafta 1 yapıları ne kadar doğal kullanıldı? Yalnızca haftalık yazma
 * testinde, geri bildirimle BİRLİKTE (test sırasında ipucu verilmez).
 */
export function week1GrammarUse(text: string): Array<{ label: string; used: boolean }> {
  const checks: Array<[string, RegExp]> = [
    ['Present Perfect (have/has + V3)', /\b(have|has|haven't|hasn't|I've|you've|we've|they've|she's|he's)\s+(\w+ed|been|done|seen|gone|made|taken|written|known|had|learned|learnt|lived|studied|worked)\b/i],
    ['for / since', /\b(for|since)\s+(\d+|a|an|the|one|two|three|four|five|six|ten|several|last|this|january|monday|\w+day)\b/i],
    ['Past Perfect (had + V3)', /\bhad\s+(\w+ed|been|done|seen|gone|made|taken|written|known|learned|learnt|only)\b/i],
    ['Gerund / Infinitive kalıbı', /\b(enjoy|avoid|finish|keep|look forward to)\s+\w+ing\b|\b(want|decide|decided|plan|hope|need|would like)\s+to\s+\w+/i],
    ['Second Conditional', /\bif\s+i\s+(had|were|could|lived|won|knew|\w+ed)\b[^.]*\bwould\b/i],
    ['Öbek (interested in, depend on…)', /\b(interested in|good at|depend on|believe in|pay attention to|wait for|listen to|afraid of|ready for)\b/i],
    ['Bağlaç (because / so / but / however)', /\b(because|so|but|however)\b/i],
  ];
  return checks.map(([label, re]) => ({ label, used: re.test(text) }));
}
