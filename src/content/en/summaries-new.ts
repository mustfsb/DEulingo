/**
 * 1. hafta yeni konuların özetleri (Sentence Structure, Past Perfect,
 * Gerund & Infinitive, Conditionals, Prepositions & Collocations).
 * Açıklamalar Türkçe, örnekler İngilizce. Her kavramın `anchor` dizesi
 * kendi bölüm metninde geçer.
 */

import type { TopicSummary } from '../types.ts';

export const EN_SENTENCE_STRUCTURE_SUMMARY: TopicSummary = {
  topicId: 'en.sentence-structure',
  title: 'Sentence Structure',
  intro: [
    'İngilizce cümle Türkçe gibi kurulmaz: önce kim, sonra ne yapıyor, sonra neye. Bu özet seni doğal SVO sırasına taşır.',
    'Önce iskelet (I study English), sonra zaman (every evening), sonra yer+zaman (place before time). Sorularda devrik yapı yok, dolaylı soruda fiil sonda.',
  ],
  estimatedReadingMinutes: 22,
  sections: [
    {
      id: 'sentence-structure.svo', topicId: 'en.sentence-structure', title: 'SVO — Özne + Fiil + Nesne',
      conceptIds: ['ss.svo.core', 'ss.svo.time'],
      blocks: [
        { kind: 'paragraph', text: 'İngilizce çekirdek sıra her zaman SVO: özne + fiil + nesne. Örnek: I study English. She drinks coffee. Zaman eklersen sona gelir: I study English every evening. every evening cümlenin sonundadır, ortaya girmez.' },
        { kind: 'code', lines: ['I study English.', 'I study English every evening.', 'She drinks coffee every day.'] },
        { kind: 'callout', text: 'Türkçe esnekliği İngilizcede yok: I every evening study English YANLIŞTIR.' },
      ],
      warnings: ['Özne-fiil uyumu: I study ama She drinks.'],
      examples: [
        { german: 'I study English.', turkish: 'İngilizce çalışırım.' },
        { german: 'I study English every evening.', turkish: 'Her akşam İngilizce çalışırım.' },
      ],
      pronunciation: [],
    },
    {
      id: 'sentence-structure.place-time', topicId: 'en.sentence-structure', title: 'Yer + Zaman Sırası',
      conceptIds: ['ss.place-time.order'],
      blocks: [
        { kind: 'paragraph', text: 'Yer ve zaman ikisi de varsa doğal sıra: yer + zaman, yani place before time. Örnek: They study in the library every evening. We play football in the park. I visit my family at the weekend.' },
        { kind: 'code', lines: ['They study in the library every evening.', 'We play football in the park.'] },
      ],
      warnings: ['They study every evening in the library kulağa terstir; place before time kuralını uygula.'],
      examples: [{ german: 'They study in the library every evening.', turkish: 'Her akşam kütüphanede ders çalışırlar.' }],
      pronunciation: [],
    },
    {
      id: 'sentence-structure.questions', topicId: 'en.sentence-structure', title: 'Soru Düzeni ve Dolaylı Sorular',
      conceptIds: ['ss.questions.direct', 'ss.questions.indirect'],
      blocks: [
        { kind: 'paragraph', text: 'Doğrudan soru: Where is the bank? When does the lesson start? What are you doing? Dolaylı soruda devrik yapı KALKAR: Do you know where the bank is? Can you tell me where the station is? Yani: Do you know where the bank is doğrudur.' },
        { kind: 'code', lines: ['Where is the bank?', 'Do you know where the bank is?', 'Can you tell me where the station is?'] },
        { kind: 'callout', text: 'where the bank it is YANLIŞTIR: fazladan it yok. where the bank is doğrudur.' },
      ],
      warnings: ['Do you know where is the bank? ❌ → Do you know where the bank is? ✅'],
      examples: [
        { german: 'Where is the bank?', turkish: 'Banka nerede?' },
        { german: 'Do you know where the bank is?', turkish: 'Bankanın nerede olduğunu biliyor musun?' },
      ],
      pronunciation: [],
    },
    {
      id: 'sentence-structure.expansion', topicId: 'en.sentence-structure', title: 'Cümle Genişletme',
      conceptIds: ['ss.expansion.steps'],
      blocks: [
        { kind: 'paragraph', text: 'Basitten zengine: I study English. → I study English every day. → I study English every day because I want to study abroad. because I want cümleyi doğal büyütür; bilinen dilbilgisi dışına çıkma.' },
        { kind: 'code', lines: ['I study English.', 'I study English every day.', 'I study English every day because I want to study abroad.', 'I have studied English for two years because I love it.'] },
      ],
      warnings: [],
      examples: [{ german: 'I study English every day because I want to study abroad.', turkish: 'Yurt dışında okumak istediğim için her gün İngilizce çalışırım.' }],
      pronunciation: [],
    },
    {
      id: 'sentence-structure.connectors', topicId: 'en.sentence-structure', title: 'Bağlaçlar — and/but/because/so/however',
      conceptIds: ['ss.connectors.basic'],
      blocks: [
        { kind: 'paragraph', text: 'Bu hafta beş bağlaç yeter: and (ve), but (ama), because (çünkü), so (bu yüzden), however (ancak). Örnek: I like tea, but she likes coffee. It was late, so we went home. however cümle başında nokta ile başlar: However, my brother likes tea.' },
        { kind: 'code', lines: ['I study English because I want a better job.', 'It was late, so we went home.', 'I like coffee. However, my brother likes tea.'] },
      ],
      warnings: ['however iki cümleyi virgülle tek başına bağlamaz.'],
      examples: [{ german: 'I study English because I want to study abroad.', turkish: 'Yurt dışında okumak istediğim için İngilizce çalışıyorum.' }],
      pronunciation: [],
    },
    {
      id: 'sentence-structure.mistakes', topicId: 'en.sentence-structure', title: 'Sık Hatalar',
      conceptIds: ['ss.mistakes.order'],
      blocks: [
        { kind: 'paragraph', text: 'Bu konunun üç klasik hatası: sıra (I every evening study), yer-zaman tersliği ve dolaylı soruda where the bank is yerine where is the bank ya da where the bank it is yazmak. Doğrusu her zaman where the bank is.' },
        { kind: 'table', head: ['Yanlış ❌', 'Doğru ✅', 'Neden'], rows: [
          ['I every evening study English.', 'I study English every evening.', 'SVO + zaman sonda'],
          ['They study every evening in the library.', 'They study in the library every evening.', 'place before time'],
          ['Do you know where is the bank?', 'Do you know where the bank is?', 'dolaylı soruda devrik yok'],
          ['Do you know where the bank it is?', 'Do you know where the bank is?', 'fazladan it yok'],
        ] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'SVO: I study English.',
    'Zaman sonda: I study English every evening.',
    'Yer + zaman: place before time.',
    'Doğrudan: Where is the bank? Dolaylı: Do you know where the bank is?',
    'where the bank it is ❌ → where the bank is ✅',
    'Genişletme: because I want ile büyüt.',
    'Bağlaçlar: and/but/because/so/however.',
  ],
  recallQuestions: [
    { question: 'SVO nedir?', answer: 'Özne + fiil + nesne: I study English.' },
    { question: 'Yer + zaman sırası nedir?', answer: 'place before time: in the library every evening.' },
    { question: 'Dolaylı soru nasıl kurulur?', answer: 'Do you know where the bank is?' },
    { question: 'however nasıl yazılır?', answer: 'Nokta + However, ile yeni cümle.' },
  ],
};

export const EN_PAST_PERFECT_SUMMARY: TopicSummary = {
  topicId: 'en.past-perfect',
  title: 'Past Perfect',
  intro: [
    'Geçmişte iki olay varsa önce olanı Past Perfect ile anlatırsın: had + V3. Formül: had + V3.',
    'Önce film başladı (The film had started), sonra vardık (We arrived). Birleşimi: By the time we arrived, the film had started.',
  ],
  estimatedReadingMinutes: 18,
  sections: [
    {
      id: 'past-perfect.formula', topicId: 'en.past-perfect', title: 'Formül — had + V3',
      conceptIds: ['ppf.formula.core'],
      blocks: [
        { kind: 'paragraph', text: 'Formül herkes için aynıdır: had + V3. I had, you had, he had, she had — özne fark etmez. Örnek: The film had started. He had left. I had lost my keys.' },
        { kind: 'code', lines: ['The film had started.', 'He had already left.', 'I had lost my keys.'] },
      ],
      warnings: [],
      examples: [{ german: 'The film had started.', turkish: 'Film başlamıştı.' }],
      pronunciation: [],
    },
    {
      id: 'past-perfect.timeline', topicId: 'en.past-perfect', title: 'Zaman Çizgisi — Önce Olan',
      conceptIds: ['ppf.timeline.earlier'],
      blocks: [
        { kind: 'paragraph', text: 'İki geçmiş olayı çizgiye diz: önce olan had + V3 alır. The film had started (önce) → We arrived (sonra). He had already left (önce) → I called (sonra).' },
        { kind: 'code', lines: ['The film had started before we arrived.', 'He had already left when I called.'] },
      ],
      warnings: [],
      examples: [{ german: 'The film had started before we arrived.', turkish: 'Biz vardığımızda film başlamıştı.' }],
      pronunciation: [],
    },
    {
      id: 'past-perfect.vs-past', topicId: 'en.past-perfect', title: 'Simple Past vs Past Perfect',
      conceptIds: ['ppf.vs-past.arrived'],
      blocks: [
        { kind: 'paragraph', text: 'Tek bitmiş olay Simple Past: We arrived. Önce olan Past Perfect: The film had started. İkisi birleşir: The film had started before we arrived. We arrived tek başına önce olan değildir.' },
        { kind: 'code', lines: ['We arrived.', 'The film had started.', 'The film had started before we arrived.'] },
      ],
      warnings: [],
      examples: [{ german: 'We arrived.', turkish: 'Vardık. (tek olay)' }],
      pronunciation: [],
    },
    {
      id: 'past-perfect.by-the-time', topicId: 'en.past-perfect', title: 'by the time / before / after',
      conceptIds: ['ppf.by-time.before'],
      blocks: [
        { kind: 'paragraph', text: 'Önceliği kuran üç bağlaç: By the time (…-dığında), before (…-den önce), after (…-den sonra). Örnek: By the time we arrived, the film had started. We went out after the rain had stopped.' },
        { kind: 'code', lines: ['By the time we arrived, the film had started.', 'We went out after the rain had stopped.'] },
      ],
      warnings: [],
      examples: [{ german: 'By the time we arrived, the film had started.', turkish: 'Vardığımızda film başlamıştı.' }],
      pronunciation: [],
    },
    {
      id: 'past-perfect.mistakes', topicId: 'en.past-perfect', title: 'Sık Hatalar',
      conceptIds: ['ppf.mistakes.has-had'],
      blocks: [
        { kind: 'paragraph', text: 'En yaygın hata geçmişte has kullanmaktır: the film has started geçmişte önce olanı anlatmaz. Doğrusu the film has started değil, The film had started. Ayrıca had sonrası V3 gelir: had start değil had started.' },
        { kind: 'table', head: ['Yanlış ❌', 'Doğru ✅', 'Neden'], rows: [
          ['By the time we arrived, the film has started.', 'By the time we arrived, the film had started.', 'önce olan had + V3'],
          ['The film had start.', 'The film had started.', 'had sonrası V3'],
          ['He had leave.', 'He had left.', 'leave → left'],
        ] },
      ],
      warnings: ['By the time + Simple Past, sonuç had + V3.'],
      examples: [],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'Formül: had + V3 (tüm öznelerde had).',
    'Önce olan: The film had started.',
    'Sonra olan: We arrived.',
    'Birleşim: By the time we arrived, the film had started.',
    'the film has started geçmişte önce olanı anlatmaz.',
  ],
  recallQuestions: [
    { question: 'Past Perfect formülü nedir?', answer: 'had + V3.' },
    { question: 'Önce olan hangisidir?', answer: 'had + V3 olan: The film had started.' },
    { question: 'By the time ne demektir?', answer: '…-dığında: By the time we arrived…' },
  ],
};

export const EN_GERUND_SUMMARY: TopicSummary = {
  topicId: 'en.gerund-infinitive',
  title: 'Gerund & Infinitive',
  intro: [
    'Bu konuyu tablo ezberiyle değil CHUNK ile öğren: enjoy doing, decide to do. Fiil + devamı bir bütündür.',
    'Özel yıldız: look forward to doing — to görüp to do yazma, doing yaz.',
  ],
  estimatedReadingMinutes: 16,
  sections: [
    {
      id: 'gerund-infinitive.gerund', topicId: 'en.gerund-infinitive', title: 'Gerund Kalıpları — enjoy doing',
      conceptIds: ['gi.gerund.chunks'],
      blocks: [
        { kind: 'paragraph', text: 'Bunları bütün hâlinde ezberle: enjoy doing, finish doing, avoid doing, keep doing. Örnek: I enjoy playing football. She finished doing her homework. He avoids smoking.' },
        { kind: 'code', lines: ['I enjoy playing football.', 'She finished doing her homework.', 'Keep studying.'] },
      ],
      warnings: [],
      examples: [{ german: 'I enjoy playing football.', turkish: 'Futbol oynamayı severim.' }],
      pronunciation: [],
    },
    {
      id: 'gerund-infinitive.infinitive', topicId: 'en.gerund-infinitive', title: 'Infinitive Kalıpları — decide to do',
      conceptIds: ['gi.infinitive.chunks'],
      blocks: [
        { kind: 'paragraph', text: 'Bunlar da chunk: want to do, decide to do, need to do, plan to do, hope to do. Örnek: I want to help you. She decided to get up early. I plan to study abroad.' },
        { kind: 'code', lines: ['I want to help you.', 'She decided to get up early.', 'I plan to study abroad.'] },
      ],
      warnings: [],
      examples: [{ german: 'She decided to get up early.', turkish: 'Erken kalkmaya karar verdi.' }],
      pronunciation: [],
    },
    {
      id: 'gerund-infinitive.look-forward', topicId: 'en.gerund-infinitive', title: 'look forward to doing',
      conceptIds: ['gi.look-forward.doing'],
      blocks: [
        { kind: 'paragraph', text: 'Yüksek değerli istisna: look forward to doing. to edattır, devamı doing ister. Örnek: I look forward to seeing you. I look forward to hearing from you.' },
        { kind: 'code', lines: ['I look forward to seeing you.', 'I look forward to hearing from you.'] },
        { kind: 'callout', text: 'look forward to see YANLIŞTIR; look forward to seeing doğrudur.' },
      ],
      warnings: [],
      examples: [{ german: 'I look forward to seeing you.', turkish: 'Seni görmeyi dört gözle bekliyorum.' }],
      pronunciation: [],
    },
    {
      id: 'gerund-infinitive.production', topicId: 'en.gerund-infinitive', title: 'Aktif Üretim — Kalıp Seçimi',
      conceptIds: ['gi.production.choice'],
      blocks: [
        { kind: 'paragraph', text: 'Soruda kendine sor: doing mi to do mu? Fiili tanı: enjoy → doing, decide → to do. Kalıbı bilmiyorsan cümleyi kurma, önce kalıbı seç. Bu bölüm doing mi to do mu kararını hızlandırır.' },
        { kind: 'code', lines: ['enjoy doing / decide to do', 'look forward to doing'] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
    {
      id: 'gerund-infinitive.mistakes', topicId: 'en.gerund-infinitive', title: 'Sık Hatalar',
      conceptIds: ['gi.mistakes.chunks'],
      blocks: [
        { kind: 'paragraph', text: 'Üç hatayı kapat: enjoy to visit değil enjoy visiting; decide take değil decide to take; look forward to see değil look forward to seeing. Yani: enjoy to visit ❌, decide take ❌, look forward to see ❌.' },
        { kind: 'table', head: ['Yanlış ❌', 'Doğru ✅', 'Neden'], rows: [
          ['I enjoy to visit museums.', 'I enjoy visiting museums.', 'enjoy + doing'],
          ['She decide take the bus.', 'She decided to take the bus.', 'decide + to do'],
          ['I look forward to see you.', 'I look forward to seeing you.', 'to + doing'],
        ] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'enjoy doing / finish doing / avoid doing / keep doing.',
    'want to do / decide to do / need to do / plan to do / hope to do.',
    'look forward to doing (to + doing).',
    'enjoy to visit ❌ → enjoy visiting ✅.',
    'Kalıbı chunk olarak ezberle, kural tablosu yapma.',
  ],
  recallQuestions: [
    { question: 'enjoy sonrası ne gelir?', answer: 'doing: enjoy visiting.' },
    { question: 'decide sonrası ne gelir?', answer: 'to do: decide to take.' },
    { question: 'look forward to sonrası?', answer: 'doing: look forward to seeing.' },
  ],
};

export const EN_CONDITIONALS_SUMMARY: TopicSummary = {
  topicId: 'en.conditionals',
  title: 'Conditionals',
  intro: [
    'Bu hafta Zero/First hızlı geçilir, Second derinden çalışılır. Formül: If + Past, would + V1. Örnek: If I had more time, I would study more English.',
    'If içinde would olmaz: If I would have YANLIŞTIR; If I had doğrudur.',
  ],
  estimatedReadingMinutes: 18,
  sections: [
    {
      id: 'conditionals.zero-first', topicId: 'en.conditionals', title: 'Zero & First Conditional',
      conceptIds: ['cond.zero-first.rule'],
      blocks: [
        { kind: 'paragraph', text: 'Zero genel doğru: If you heat water, it boils. If you heat ice, it melts. First gelecek plan: If it rains, I will stay at home. If it rains tomorrow, we will cancel.' },
        { kind: 'code', lines: ['If you heat water, it boils.', 'If it rains, I will stay at home.'] },
      ],
      warnings: [],
      examples: [{ german: 'If you heat water, it boils.', turkish: 'Suyu ısıtırsan kaynar.' }],
      pronunciation: [],
    },
    {
      id: 'conditionals.second', topicId: 'en.conditionals', title: 'Second Conditional — If + Past, would + V1',
      conceptIds: ['cond.second.formula'],
      blocks: [
        { kind: 'paragraph', text: 'Hayal formülü: If + Past, would + V1. Örnek: If I had more time, I would study more English. If I lived abroad, my English would improve. If I were you, I would study harder.' },
        { kind: 'code', lines: ['If I had more time, I would study more English.', 'If I lived abroad, my English would improve.', 'If I were you, I would study harder.'] },
        { kind: 'callout', text: 'If I had more time cümlesi hayali anlatır; will değil would gelir.' },
      ],
      warnings: [],
      examples: [{ german: 'If I had more time, I would study more English.', turkish: 'Daha çok zamanım olsaydı daha çok çalışırdım.' }],
      pronunciation: [],
    },
    {
      id: 'conditionals.hypotheticals', topicId: 'en.conditionals', title: 'Kişisel Hayaller — If I lived…',
      conceptIds: ['cond.second.hypotheticals'],
      blocks: [
        { kind: 'paragraph', text: 'Kendinden kur: If I lived abroad, I would visit museums every day. If I had more money, I would travel. If I could speak English fluently, I would work abroad. Kelimeler B1’de kalır.' },
        { kind: 'code', lines: ['If I lived abroad, I would visit museums every day.', 'If I had more money, I would travel.', 'If I could speak English fluently, I would work abroad.'] },
      ],
      warnings: [],
      examples: [{ german: 'If I lived abroad, I would visit museums every day.', turkish: 'Yurt dışında yaşasaydım her gün müzeye giderdim.' }],
      pronunciation: [],
    },
    {
      id: 'conditionals.mistakes', topicId: 'en.conditionals', title: 'Sık Hatalar',
      conceptIds: ['cond.mistakes.would'],
      blocks: [
        { kind: 'paragraph', text: 'En pahalı hata If içinde would kullanmaktır: If I would have YANLIŞTIR; doğrusu If I had. Sonuçta will değil would: If I had time, I would study (will değil).' },
        { kind: 'table', head: ['Yanlış ❌', 'Doğru ✅', 'Neden'], rows: [
          ['If I would have more time, I would study.', 'If I had more time, I would study.', 'If içinde would yok'],
          ['If I had time, I will study.', 'If I had time, I would study.', 'Second sonuçta would'],
          ['If I have money, I would travel.', 'If I had money, I would travel.', 'Second If + Past'],
        ] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'Zero: If you heat water, it boils.',
    'First: If it rains, I will stay.',
    'Second: If I had more time, I would study more English.',
    'If I would have ❌ → If I had ✅.',
    'If I lived abroad kişisel hayallerle pratik yap.',
  ],
  recallQuestions: [
    { question: 'Second formülü nedir?', answer: 'If + Past, would + V1.' },
    { question: 'If içinde would olur mu?', answer: 'Hayır: If I had… ✅' },
    { question: 'If I were you sonrası?', answer: 'I would…: If I were you, I would go.' },
  ],
};

export const EN_PREPOSITIONS_SUMMARY: TopicSummary = {
  topicId: 'en.prepositions-collocations',
  title: 'Prepositions & Collocations',
  intro: [
    'Rastgele edat değil, hazır öbek öğren: interested in, pay attention to. Edat öbeğin parçasıdır.',
    'Yazma ve konuşmada bu öbekler cümleni doğal yapar.',
  ],
  estimatedReadingMinutes: 15,
  sections: [
    {
      id: 'prepositions-collocations.chunks-a', topicId: 'en.prepositions-collocations', title: 'Öbekler A — interested in, good at, listen to',
      conceptIds: ['pc.chunks-a.core'],
      blocks: [
        { kind: 'paragraph', text: 'İlk üç öbek: interested in (ilgilenmek), good at (iyi olmak), listen to (dinlemek). Örnek: I am interested in music. She is good at English. I listen to music every day.' },
        { kind: 'code', lines: ['I am interested in music.', 'She is good at English.', 'I listen to music every day.'] },
      ],
      warnings: ['interested for ❌ → interested in ✅'],
      examples: [{ german: 'I am interested in music.', turkish: 'Müzikle ilgileniyorum.' }],
      pronunciation: [],
    },
    {
      id: 'prepositions-collocations.chunks-b', topicId: 'en.prepositions-collocations', title: 'Öbekler B — wait for, depend on, believe in',
      conceptIds: ['pc.chunks-b.core'],
      blocks: [
        { kind: 'paragraph', text: 'İkinci üçlü: wait for (beklemek), depend on (bağlı olmak), believe in (inanmak). Örnek: We waited for the bus. It depends on the weather. I believe in myself.' },
        { kind: 'code', lines: ['We waited for the bus.', 'It depends on the weather.', 'I believe in myself.'] },
      ],
      warnings: ['believe myself ❌ → believe in myself ✅'],
      examples: [{ german: 'I believe in myself.', turkish: 'Kendime inanıyorum.' }],
      pronunciation: [],
    },
    {
      id: 'prepositions-collocations.chunks-c', topicId: 'en.prepositions-collocations', title: 'Öbekler C — pay attention to, afraid of, ready for',
      conceptIds: ['pc.chunks-c.core'],
      blocks: [
        { kind: 'paragraph', text: 'Üçüncü grup: pay attention to (dikkat etmek), afraid of (korkmak), ready for (hazır olmak), different from (farklı olmak). Örnek: Pay attention to the teacher. He is afraid of dogs. We are ready for the exam.' },
        { kind: 'code', lines: ['Pay attention to the teacher.', 'He is afraid of dogs.', 'We are ready for the exam.'] },
      ],
      warnings: ['give attention ❌ → pay attention ✅'],
      examples: [{ german: 'Pay attention to the teacher.', turkish: 'Öğretmene dikkat et.' }],
      pronunciation: [],
    },
    {
      id: 'prepositions-collocations.production', topicId: 'en.prepositions-collocations', title: 'Aktif Üretim — Öbek Seçimi',
      conceptIds: ['pc.production.choice'],
      blocks: [
        { kind: 'paragraph', text: 'Soruda kendine sor: in mi for mu? Öbeği bütün hâlinde çağır. I am interested in music cümlesinde in öbeğin parçasıdır; for ile değişmez. Bu bölüm in mi for mu kararını hızlandırır.' },
        { kind: 'code', lines: ['interested in / good at / listen to', 'wait for / depend on / believe in'] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
    {
      id: 'prepositions-collocations.mistakes', topicId: 'en.prepositions-collocations', title: 'Sık Hatalar',
      conceptIds: ['pc.mistakes.chunks'],
      blocks: [
        { kind: 'paragraph', text: 'Üç hatayı kapat: interested for değil interested in; give attention değil pay attention; believe myself değil believe in myself. Yani: interested for ❌, give attention ❌, believe myself ❌.' },
        { kind: 'table', head: ['Yanlış ❌', 'Doğru ✅', 'Neden'], rows: [
          ['I am interested for music.', 'I am interested in music.', 'öbek: interested in'],
          ['Give attention to the teacher.', 'Pay attention to the teacher.', 'öbek: pay attention to'],
          ['I believe myself.', 'I believe in myself.', 'öbek: believe in'],
        ] },
      ],
      warnings: [],
      examples: [],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'interested in / good at / listen to.',
    'wait for / depend on / believe in.',
    'pay attention to / afraid of / ready for / different from.',
    'interested for ❌ → interested in ✅.',
    'Öbekleri bütün hâlinde ezberle: pay attention to = dikkat etmek.',
  ],
  recallQuestions: [
    { question: 'interested sonrası?', answer: 'in: interested in music.' },
    { question: 'dikkat etmek öbeği?', answer: 'pay attention to.' },
    { question: 'believe sonrası (kendine)?', answer: 'believe in myself.' },
  ],
};
