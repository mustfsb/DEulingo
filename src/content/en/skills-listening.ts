/**
 * İngilizce Listening — 40+ parça + 10+ dikte + uzun setler.
 * Orijinal IELTS tarzı kayıt metinleri (telifli materyal yok).
 * TTS: en-GB (yerel Piper; yoksa Web Speech). Transcript gönderimden önce gösterilmez.
 */

export type ListeningKind =
  | 'mc' // audio → multiple choice
  | 'short' // audio → short answer
  | 'ordering' // audio → sentence ordering
  | 'dictation'
  | 'missing-word'
  | 'meaning';

export interface ListeningItem {
  id: string;
  title: string;
  kind: ListeningKind;
  level: string;
  /** TTS ile okutulacak metin (en-GB). */
  audioText: string;
  prompt: string;
  options?: string[];
  answer: string;
  acceptedAnswers?: string[];
  /** Cevap sonrası gösterilen kanıt/alıntı. */
  evidence: string;
  transcript: string;
  topicTags: string[];
  /** Alt konu odagi (orn. 'for-since'): filtreli giris icin. */
  focusTags?: string[];
}

const L = (item: ListeningItem): ListeningItem => item;

const SHORT_DIALOGS: ListeningItem[] = [
  L({ id: 'en-lis-01', title: 'At the Station', kind: 'mc', level: 'B1', audioText: 'Where is the bank? It is next to the station.', prompt: 'Banka nerede?', options: ['Next to the station', 'Far from the station', 'In the station', 'Behind the park'], answer: 'Next to the station', evidence: 'It is next to the station.', transcript: 'Where is the bank? It is next to the station.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-02', title: 'Evening Study', kind: 'short', level: 'B1', audioText: 'I study English every evening because I want to study abroad.', prompt: 'Neden her akşam çalışıyor? (kısa)', answer: 'because he wants to study abroad', acceptedAnswers: ['to study abroad', 'study abroad'], evidence: 'because I want to study abroad.', transcript: 'I study English every evening because I want to study abroad.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-03', title: 'Late Bus', kind: 'mc', level: 'B1', audioText: 'The bus had left before I arrived at the stop.', prompt: 'Ne oldu?', options: ['Otobüs erken kalktı', 'Otobüs bekledi', 'Otobüs gelmedi hiç', 'Yolcu uyudu'], answer: 'Otobüs erken kalktı', evidence: 'had left before I arrived', transcript: 'The bus had left before I arrived at the stop.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-04', title: 'Guitar Plan', kind: 'mc', level: 'B1', audioText: 'I enjoy playing football, but I decided to learn the guitar.', prompt: 'Hangisi doğru?', options: ['Futbolu sever, gitar öğrenmeye karar verdi', 'Futboldan nefret eder', 'Gitarı bıraktı', 'Futbolu bıraktı'], answer: 'Futbolu sever, gitar öğrenmeye karar verdi', evidence: 'enjoy playing / decided to learn', transcript: 'I enjoy playing football, but I decided to learn the guitar.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-05', title: 'Dream Job', kind: 'short', level: 'B1', audioText: 'If I could speak English fluently, I would work abroad.', prompt: 'Akıcı konuşsaydı ne yapardı?', answer: 'he would work abroad', acceptedAnswers: ['work abroad', 'would work abroad'], evidence: 'I would work abroad.', transcript: 'If I could speak English fluently, I would work abroad.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-06', title: 'Music Interest', kind: 'mc', level: 'B1', audioText: 'I am interested in music. I listen to pop every day.', prompt: 'Hangisi doğru öbek?', options: ['interested in', 'interested for', 'interested at', 'interest in'], answer: 'interested in', evidence: 'I am interested in music.', transcript: 'I am interested in music. I listen to pop every day.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-07', title: 'Three Years', kind: 'short', level: 'B1', audioText: 'I have lived here for three years.', prompt: 'Ne kadar süredir burada? (İngilizce kısa)', answer: 'for three years', acceptedAnswers: ['three years'], evidence: 'for three years.', transcript: 'I have lived here for three years.', topicTags: ['en.present-perfect'], focusTags: ['pp-short', 'for-since'] }),
  L({ id: 'en-lis-08', title: 'Never Been', kind: 'mc', level: 'B1', audioText: 'I have never been to London.', prompt: 'Anlam nedir?', options: ['Hiç Londra’da bulunmadı', 'Londra’da yaşıyor', 'Londra’ya gidiyor şimdi', 'Londra’yı sevmez'], answer: 'Hiç Londra’da bulunmadı', evidence: 'have never been', transcript: 'I have never been to London.', topicTags: ['en.present-perfect'], focusTags: ['pp-short'] }),
  L({ id: 'en-lis-09', title: 'Library Evening', kind: 'ordering', level: 'B1', audioText: 'They study in the library every evening.', prompt: 'Duyduğun cümleyi sırala:', answer: 'They study in the library every evening.', evidence: 'in the library every evening (place before time).', transcript: 'They study in the library every evening.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-10', title: 'By The Time', kind: 'mc', level: 'B1', audioText: 'By the time we arrived, the film had started.', prompt: 'Film ne zaman başladı?', options: ['Bizden önce', 'Bizden sonra', 'Şimdi', 'Yarın'], answer: 'Bizden önce', evidence: 'had started (önce).', transcript: 'By the time we arrived, the film had started.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-11', title: 'Look Forward', kind: 'mc', level: 'B1', audioText: 'I look forward to seeing you tomorrow.', prompt: 'Doğru devam hangisi?', options: ['seeing you', 'to see you', 'see you', 'to seeing you'], answer: 'seeing you', evidence: 'look forward to + doing.', transcript: 'I look forward to seeing you tomorrow.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-12', title: 'Second Wish', kind: 'short', level: 'B1', audioText: 'If I had more money, I would travel the world.', prompt: 'Parası olsaydı ne yapardı?', answer: 'he would travel the world', acceptedAnswers: ['travel the world'], evidence: 'would travel.', transcript: 'If I had more money, I would travel the world.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-13', title: 'Pay Attention', kind: 'mc', level: 'B1', audioText: 'Pay attention to the teacher, please.', prompt: 'Doğru öbek?', options: ['Pay attention to', 'Give attention to', 'Pay attention for', 'Take attention to'], answer: 'Pay attention to', evidence: 'Pay attention to.', transcript: 'Pay attention to the teacher, please.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-14', title: 'Just Finished', kind: 'short', level: 'B1', audioText: 'I have just finished my homework.', prompt: 'Ne zaman bitirdi? (İngilizce)', answer: 'just', acceptedAnswers: ['just now', 'just finished'], evidence: 'just = az önce.', transcript: 'I have just finished my homework.', topicTags: ['en.present-perfect'], focusTags: ['pp-short'] }),
  L({ id: 'en-lis-15', title: 'Park Football', kind: 'mc', level: 'B1', audioText: 'We play football in the park every Saturday.', prompt: 'Nerede, ne zaman?', options: ['Parkta, her cumartesi', 'Okulda, her gün', 'Evde, her akşam', 'Parkta, dün'], answer: 'Parkta, her cumartesi', evidence: 'in the park every Saturday.', transcript: 'We play football in the park every Saturday.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-16', title: 'Rain Stopped', kind: 'short', level: 'B1', audioText: 'We went out after the rain had stopped.', prompt: 'Ne durduktan sonra çıktılar?', answer: 'the rain', acceptedAnswers: ['rain', 'after the rain had stopped'], evidence: 'after the rain had stopped.', transcript: 'We went out after the rain had stopped.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-17', title: 'Avoid Smoking', kind: 'meaning', level: 'B1', audioText: 'He avoids smoking.', prompt: '“avoids smoking” ne demek?', options: ['Sigaradan kaçınır', 'Sigara içer', 'Sigarayı sever', 'Sigarayı bırakamaz'], answer: 'Sigaradan kaçınır', evidence: 'avoid + doing.', transcript: 'He avoids smoking.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-18', title: 'Were You', kind: 'mc', level: 'B1', audioText: 'If I were you, I would study harder.', prompt: 'Tavsiye nedir?', options: ['Daha çok çalış', 'Bırak', 'Uyku', 'Seyahat'], answer: 'Daha çok çalış', evidence: 'would study harder.', transcript: 'If I were you, I would study harder.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-19', title: 'Good At', kind: 'missing-word', level: 'B1', audioText: 'She is good at English.', prompt: 'She is good ___ English. (dinle ve yaz)', answer: 'at', evidence: 'good at.', transcript: 'She is good at English.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-20', title: 'Since 2023', kind: 'short', level: 'B1', audioText: 'I have known her since 2023.', prompt: 'Ne zamandan beri tanıyor?', answer: 'since 2023', acceptedAnswers: ['2023', 'since 2023'], evidence: 'since 2023.', transcript: 'I have known her since 2023.', topicTags: ['en.present-perfect'], focusTags: ['pp-short', 'for-since'] }),
  L({ id: 'en-lis-21', title: 'Indirect Question', kind: 'mc', level: 'B1', audioText: 'Do you know where the bank is?', prompt: 'Duyduğun soru?', options: ['Do you know where the bank is?', 'Do you know where is the bank?', 'Do you know where the bank it is?', 'Do you know where is bank?'], answer: 'Do you know where the bank is?', evidence: 'where the bank is (devrik yok).', transcript: 'Do you know where the bank is?', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-22', title: 'Homework Done', kind: 'short', level: 'B1', audioText: 'She had finished her homework before dinner.', prompt: 'Ödev ne zaman bitti?', answer: 'before dinner', acceptedAnswers: ['before dinner', 'had finished before dinner'], evidence: 'before dinner.', transcript: 'She had finished her homework before dinner.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-23', title: 'Plan Abroad', kind: 'mc', level: 'B1', audioText: 'I plan to study abroad next year.', prompt: 'Plan nedir?', options: ['Yurt dışında okumak', 'İşi bırakmak', 'Tatile gitmek', 'Ev almak'], answer: 'Yurt dışında okumak', evidence: 'plan to study abroad.', transcript: 'I plan to study abroad next year.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-24', title: 'Heat Boils', kind: 'meaning', level: 'B1', audioText: 'If you heat water, it boils.', prompt: 'Bu hangi conditional?', options: ['Zero', 'Second', 'Third', 'Karma'], answer: 'Zero', evidence: 'genel doğru.', transcript: 'If you heat water, it boils.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-25', title: 'Believe Self', kind: 'missing-word', level: 'B1', audioText: 'I believe in myself.', prompt: 'I believe ___ myself. (dinle ve yaz)', answer: 'in', evidence: 'believe in.', transcript: 'I believe in myself.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-26', title: 'Ever Tried', kind: 'mc', level: 'B1', audioText: 'Have you ever tried sushi?', prompt: 'Soru ne hakkında?', options: ['Deneyim', 'Günlük rutin', 'Hava', 'Fiyat'], answer: 'Deneyim', evidence: 'Have you ever…?', transcript: 'Have you ever tried sushi?', topicTags: ['en.present-perfect'], focusTags: ['pp-short'] }),
  L({ id: 'en-lis-27', title: 'Because Abroad', kind: 'ordering', level: 'B1', audioText: 'I study English every day because I want to study abroad.', prompt: 'Cümleyi sırala:', answer: 'I study English every day because I want to study abroad.', evidence: 'because nedeni verir.', transcript: 'I study English every day because I want to study abroad.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-28', title: 'Already Left', kind: 'short', level: 'B1', audioText: 'He had already left when I called.', prompt: 'Aradığında ne olmuştu?', answer: 'he had already left', acceptedAnswers: ['already left', 'had left'], evidence: 'had already left.', transcript: 'He had already left when I called.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-29', title: 'Keep Studying', kind: 'mc', level: 'B1', audioText: 'Keep studying every day.', prompt: 'Doğru devam?', options: ['studying', 'to study', 'study', 'to studying'], answer: 'studying', evidence: 'keep + doing.', transcript: 'Keep studying every day.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-30', title: 'Rain Tomorrow', kind: 'mc', level: 'B1', audioText: 'If it rains tomorrow, we will stay at home.', prompt: 'Plan nedir?', options: ['Evde kalmak', 'Dışarı çıkmak', 'Seyahat', 'Yüzmek'], answer: 'Evde kalmak', evidence: 'will stay at home.', transcript: 'If it rains tomorrow, we will stay at home.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-31', title: 'Wait Bus', kind: 'missing-word', level: 'B1', audioText: 'We waited for the bus for twenty minutes.', prompt: 'We waited ___ the bus. (dinle ve yaz)', answer: 'for', evidence: 'waited for.', transcript: 'We waited for the bus for twenty minutes.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-32', title: 'Yet Finished', kind: 'short', level: 'B1', audioText: 'I have not finished my homework yet.', prompt: 'Ödev durumu? (İngilizce kısa)', answer: 'not finished yet', acceptedAnswers: ['yet', 'has not finished yet', 'have not finished yet'], evidence: 'yet = henüz.', transcript: 'I have not finished my homework yet.', topicTags: ['en.present-perfect'], focusTags: ['pp-short'] }),
  L({ id: 'en-lis-33', title: 'However Tea', kind: 'mc', level: 'B1', audioText: 'I like coffee. However, my brother likes tea.', prompt: 'İlişki nedir?', options: ['Zıtlık', 'Neden', 'Sonuç', 'Zaman'], answer: 'Zıtlık', evidence: 'However = ancak.', transcript: 'I like coffee. However, my brother likes tea.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-34', title: 'Lost Keys', kind: 'short', level: 'B1', audioText: 'I had lost my keys before I opened the door.', prompt: 'Kapıyı açmadan önce ne oldu?', answer: 'he had lost his keys', acceptedAnswers: ['lost keys', 'had lost keys', 'had lost my keys'], evidence: 'had lost.', transcript: 'I had lost my keys before I opened the door.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-35', title: 'Want Help', kind: 'mc', level: 'B1', audioText: 'I want to help you.', prompt: 'Doğru kalıp?', options: ['want to help', 'want helping', 'want help to', 'want to helping'], answer: 'want to help', evidence: 'want + to do.', transcript: 'I want to help you.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-36', title: 'Lived Abroad', kind: 'short', level: 'B1', audioText: 'If I lived abroad, my English would improve.', prompt: 'Yurt dışında yaşasaydı ne olurdu?', answer: 'his English would improve', acceptedAnswers: ['would improve', 'english would improve'], evidence: 'would improve.', transcript: 'If I lived abroad, my English would improve.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-37', title: 'Afraid Dogs', kind: 'mc', level: 'B1', audioText: 'He is afraid of dogs.', prompt: 'Doğru öbek?', options: ['afraid of', 'afraid from', 'afraid at', 'afraid for'], answer: 'afraid of', evidence: 'afraid of.', transcript: 'He is afraid of dogs.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-38', title: 'Seen Three Times', kind: 'short', level: 'B1', audioText: 'I have seen this film three times.', prompt: 'Kaç kez gördü? (İngilizce)', answer: 'three times', acceptedAnswers: ['3 times', 'three times'], evidence: 'three times = deneyim.', transcript: 'I have seen this film three times.', topicTags: ['en.present-perfect'], focusTags: ['pp-short'] }),
  L({ id: 'en-lis-39', title: 'Different Shop', kind: 'mc', level: 'B1', audioText: 'This shop is different from other shops.', prompt: 'Doğru edat?', options: ['from', 'than', 'to', 'of'], answer: 'from', evidence: 'different from.', transcript: 'This shop is different from other shops.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-40', title: 'Ready Exam', kind: 'short', level: 'B1', audioText: 'We are ready for the exam.', prompt: 'Ne için hazırlar? (İngilizce)', answer: 'for the exam', acceptedAnswers: ['the exam', 'ready for the exam'], evidence: 'ready for.', transcript: 'We are ready for the exam.', topicTags: ['en.prepositions-collocations'] }),
];

const DICTATION: ListeningItem[] = [
  L({ id: 'en-lis-d1', title: 'Dikte 1', kind: 'dictation', level: 'B1', audioText: 'I study English every evening.', prompt: 'Duyduğunu yaz:', answer: 'I study English every evening.', evidence: 'SVO + zaman.', transcript: 'I study English every evening.', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-d2', title: 'Dikte 2', kind: 'dictation', level: 'B1', audioText: 'Do you know where the bank is?', prompt: 'Duyduğunu yaz:', answer: 'Do you know where the bank is?', evidence: 'dolaylı soru.', transcript: 'Do you know where the bank is?', topicTags: ['en.sentence-structure'] }),
  L({ id: 'en-lis-d3', title: 'Dikte 3', kind: 'dictation', level: 'B1', audioText: 'The film had started before we arrived.', prompt: 'Duyduğunu yaz:', answer: 'The film had started before we arrived.', evidence: 'had + V3.', transcript: 'The film had started before we arrived.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-d4', title: 'Dikte 4', kind: 'dictation', level: 'B1', audioText: 'I enjoy playing football.', prompt: 'Duyduğunu yaz:', answer: 'I enjoy playing football.', evidence: 'enjoy + doing.', transcript: 'I enjoy playing football.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-d5', title: 'Dikte 5', kind: 'dictation', level: 'B1', audioText: 'She decided to get up early.', prompt: 'Duyduğunu yaz:', answer: 'She decided to get up early.', evidence: 'decide + to do.', transcript: 'She decided to get up early.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-d6', title: 'Dikte 6', kind: 'dictation', level: 'B1', audioText: 'If I had more time, I would study more.', prompt: 'Duyduğunu yaz:', answer: 'If I had more time, I would study more.', evidence: 'Second.', transcript: 'If I had more time, I would study more.', topicTags: ['en.conditionals'] }),
  L({ id: 'en-lis-d7', title: 'Dikte 7', kind: 'dictation', level: 'B1', audioText: 'I am interested in music.', prompt: 'Duyduğunu yaz:', answer: 'I am interested in music.', evidence: 'interested in.', transcript: 'I am interested in music.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-d8', title: 'Dikte 8', kind: 'dictation', level: 'B1', audioText: 'Pay attention to the teacher.', prompt: 'Duyduğunu yaz:', answer: 'Pay attention to the teacher.', evidence: 'pay attention to.', transcript: 'Pay attention to the teacher.', topicTags: ['en.prepositions-collocations'] }),
  L({ id: 'en-lis-d9', title: 'Dikte 9', kind: 'dictation', level: 'B1', audioText: 'I have lived here since 2020.', prompt: 'Duyduğunu yaz:', answer: 'I have lived here since 2020.', acceptedAnswers: ["I've lived here since 2020."], evidence: 'since + başlangıç.', transcript: 'I have lived here since 2020.', topicTags: ['en.present-perfect'], focusTags: ['for-since'] }),
  L({ id: 'en-lis-d10', title: 'Dikte 10', kind: 'dictation', level: 'B1', audioText: 'I look forward to seeing you.', prompt: 'Duyduğunu yaz:', answer: 'I look forward to seeing you.', evidence: 'to + doing.', transcript: 'I look forward to seeing you.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-d11', title: 'Dikte 11', kind: 'dictation', level: 'B1', audioText: 'By the time we arrived, the film had started.', prompt: 'Duyduğunu yaz:', answer: 'By the time we arrived, the film had started.', evidence: 'By the time + had.', transcript: 'By the time we arrived, the film had started.', topicTags: ['en.past-perfect'] }),
  L({ id: 'en-lis-d12', title: 'Dikte 12', kind: 'dictation', level: 'B1', audioText: 'If I were you, I would go.', prompt: 'Duyduğunu yaz:', answer: 'If I were you, I would go.', evidence: 'If I were…', transcript: 'If I were you, I would go.', topicTags: ['en.conditionals'] }),
];

/**
 * Session B: karışık dikte. Tek cümlelik eski dikteler (for/since hariç) +
 * iki yan cümleli daha uzun yeni cümleler; hepsi `mixed-dictation` odağında.
 */
const LONG_DICTATION: ListeningItem[] = ([
  ['01', 'I have never been abroad, but I would like to visit Scotland one day.', 'never + but', ['en.present-perfect']],
  ['02', 'When we got to the cinema, the film had already started.', 'had already + V3', ['en.past-perfect']],
  ['03', 'She decided to change her job because she wanted to travel more.', 'decide + to do / because', ['en.gerund-infinitive']],
  ['04', 'If I had a car, I would drive to the coast every weekend.', 'Second Conditional', ['en.conditionals']],
  ['05', 'Could you tell me what time the library closes on Sundays?', 'dolaylı soru', ['en.sentence-structure']],
  ['06', 'He is not very good at maths, but he is interested in science.', 'good at / interested in', ['en.prepositions-collocations']],
  ['07', 'We have been friends since we were at primary school.', 'since + başlangıç', ['en.present-perfect']],
  ['08', 'I am looking forward to hearing from you as soon as possible.', 'look forward to + doing', ['en.gerund-infinitive']],
] as Array<[string, string, string, string[]]>).map(([n, text, evidence, topicTags]) => L({
  id: `en-lis-d-long-${n}`, title: `Uzun Dikte ${Number(n)}`, kind: 'dictation', level: 'B1',
  audioText: text, prompt: 'Duyduğunu yaz:', answer: text, evidence, transcript: text, topicTags, focusTags: ['mixed-dictation'],
}));

for (const item of DICTATION) {
  if (!item.focusTags) item.focusTags = ['mixed-dictation'];
}

const LONG_SETS: ListeningItem[] = [
  L({ id: 'en-lis-long-1', title: 'IELTS tarzı: Weekend Plan (uzun)', kind: 'mc', level: 'B1+', audioText: 'On Saturday, if the weather is good, we will play football in the park. We have played there for two years. If it rains, we will stay at home and watch films. I enjoy watching old films. Do you know where the cinema is? It is next to the library. Pay attention to the time because the film had started before we arrived last week.', prompt: 'Hafta sonu planı nedir?', options: ['Hava iyiyse parkta futbol', 'Kesinlikle sinema', 'Her durumda ev', 'Spor salonu'], answer: 'Hava iyiyse parkta futbol', evidence: 'if the weather is good, we will play football in the park.', transcript: 'On Saturday, if the weather is good, we will play football in the park. We have played there for two years. If it rains, we will stay at home and watch films. I enjoy watching old films. Do you know where the cinema is? It is next to the library. Pay attention to the time because the film had started before we arrived last week.', topicTags: ['en.conditionals', 'en.present-perfect'] }),
  L({ id: 'en-lis-long-2', title: 'IELTS tarzı: New Course (uzun)', kind: 'short', level: 'B1+', audioText: 'I decided to take an English course because I want to study abroad. I have studied for three years. The course starts in the evening. I wait for the bus every day. If I had more money, I would take a private course. I look forward to meeting new friends.', prompt: 'Kursa neden yazıldı? (kısa)', answer: 'because he wants to study abroad', acceptedAnswers: ['to study abroad'], evidence: 'because I want to study abroad.', transcript: 'I decided to take an English course because I want to study abroad. I have studied for three years. The course starts in the evening. I wait for the bus every day. If I had more money, I would take a private course. I look forward to meeting new friends.', topicTags: ['en.gerund-infinitive'] }),
  L({ id: 'en-lis-long-3', title: 'IELTS tarzı: At Work (uzun)', kind: 'mc', level: 'B1+', audioText: 'She had finished the report by the time the meeting started. She is good at planning. She pays attention to details. If she has time, she will help you. She believes in teamwork. She is interested in new projects.', prompt: 'Rapor ne zaman bitti?', options: ['Toplantıdan önce', 'Toplantıdan sonra', 'Şimdi', 'Yarın'], answer: 'Toplantıdan önce', evidence: 'had finished … by the time the meeting started.', transcript: 'She had finished the report by the time the meeting started. She is good at planning. She pays attention to details. If she has time, she will help you. She believes in teamwork. She is interested in new projects.', topicTags: ['en.past-perfect', 'en.prepositions-collocations'] }),
];


/** Session B: Present Perfect kısa dinleme (have/has V3, for, since, ever, never, already, yet). */
const PP_SHORT: ListeningItem[] = [
  L({ id: "en-lis-pp-01", title: "Since January", kind: "mc", level: "B1", audioText: "She has worked here since January.", prompt: "Burada ne zamandan beri çalışıyor?", options: ["Ocak ayından beri", "Ocak ayına kadar", "Her Ocak ayında", "Ocak ayında üç kez"], answer: "Ocak ayından beri", evidence: "since January = başlangıç noktası.", transcript: "She has worked here since January.", topicTags: ["en.present-perfect"], focusTags: ["pp-short", "for-since"] }),
  L({ id: "en-lis-pp-02", title: "Already Eaten", kind: "meaning", level: "B1", audioText: "We have already eaten.", prompt: "“already” burada ne ifade eder?", options: ["Zaten / çoktan", "Henüz", "Hiç", "Yarın"], answer: "Zaten / çoktan", evidence: "already = iş beklenenden önce bitti.", transcript: "We have already eaten.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-03", title: "Homework Yet?", kind: "short", level: "B1", audioText: "Have you finished your homework yet?", prompt: "Neyin bitip bitmediği soruluyor? (İngilizce kısa)", answer: "homework", acceptedAnswers: ["your homework", "the homework", "my homework"], evidence: "Have you finished your homework yet?", transcript: "Have you finished your homework yet?", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-04", title: "Never Eaten", kind: "mc", level: "B1", audioText: "I have never eaten sushi.", prompt: "Doğru çıkarım hangisi?", options: ["Hiç sushi yemedi", "Sushiyi çok sever", "Dün sushi yedi", "Sushi yemeyi planlıyor"], answer: "Hiç sushi yemedi", evidence: "have never + V3 = hiç yapmadım.", transcript: "I have never eaten sushi.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-05", title: "Just Left", kind: "missing-word", level: "B1", audioText: "He has just left the office.", prompt: "He has ___ left the office. (dinle ve yaz)", answer: "just", evidence: "just = az önce.", transcript: "He has just left the office.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-06", title: "Ten Years", kind: "mc", level: "B1", audioText: "They have lived in Ankara for ten years.", prompt: "Kaç yıldır Ankara’da yaşıyorlar?", options: ["On yıl", "Beş yıl", "Yirmi yıl", "İki yıl"], answer: "On yıl", evidence: "for ten years = süre.", transcript: "They have lived in Ankara for ten years.", topicTags: ["en.present-perfect"], focusTags: ["pp-short", "for-since"] }),
  L({ id: "en-lis-pp-07", title: "Not Yet", kind: "missing-word", level: "B1", audioText: "She hasn't called me yet.", prompt: "She hasn't called me ___. (dinle ve yaz)", answer: "yet", evidence: "olumsuzda yet = henüz.", transcript: "She hasn't called me yet.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-08", title: "Broken Phone", kind: "short", level: "B1", audioText: "My brother has broken his phone.", prompt: "Ne bozulmuş? (İngilizce kısa)", answer: "his phone", acceptedAnswers: ["phone", "the phone", "a phone"], evidence: "has broken his phone.", transcript: "My brother has broken his phone.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-09", title: "Ever Italy", kind: "mc", level: "B1", audioText: "Has she ever been to Italy?", prompt: "Hangi yapıyı duydun?", options: ["Present Perfect sorusu", "Past Simple sorusu", "Future sorusu", "Past Perfect sorusu"], answer: "Present Perfect sorusu", evidence: "Has + özne + ever + V3 (been).", transcript: "Has she ever been to Italy?", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-10", title: "Since 2019", kind: "mc", level: "B1", audioText: "We have known each other since 2019.", prompt: "Ne zamandan beri tanışıyorlar?", options: ["2019’dan beri", "2019’da bir kez tanıştılar", "2019’a kadar", "On yıldır"], answer: "2019’dan beri", evidence: "since 2019 = başlangıç.", transcript: "We have known each other since 2019.", topicTags: ["en.present-perfect"], focusTags: ["pp-short", "for-since"] }),
  L({ id: "en-lis-pp-11", title: "Germany Twice", kind: "short", level: "B1", audioText: "I have been to Germany twice.", prompt: "Almanya’ya kaç kez gitti? (İngilizce)", answer: "twice", acceptedAnswers: ["two times", "2 times"], evidence: "twice = iki kez.", transcript: "I have been to Germany twice.", topicTags: ["en.present-perfect"], focusTags: ["pp-short"] }),
  L({ id: "en-lis-pp-12", title: "For a Week", kind: "meaning", level: "B1", audioText: "I haven't seen him for a week.", prompt: "“for a week” ne demek?", options: ["Bir haftadır", "Bir haftaya kadar", "Haftada bir", "Hafta sonu"], answer: "Bir haftadır", evidence: "for + süre.", transcript: "I haven't seen him for a week.", topicTags: ["en.present-perfect"], focusTags: ["pp-short", "for-since"] }),
];

/** Session B: for / since dikte (13 parça, d9 ile birlikte). */
const FS_DICTATION: ListeningItem[] = [
  ["01", "I have lived here for three years."],
  ["02", "She has worked here since January."],
  ["03", "We have studied English for two hours."],
  ["04", "He has been in London since last Monday."],
  ["05", "They have been married for ten years."],
  ["06", "I have known Maria since 2018."],
  ["07", "My sister has played the piano for six years."],
  ["08", "It has rained since this morning."],
  ["09", "We have waited for the bus for twenty minutes."],
  ["10", "She hasn't eaten anything since breakfast."],
  ["11", "I haven't seen him for a long time."],
  ["12", "The shop has been closed since Friday."],
].map(([n, text]) => L({
  id: `en-lis-d-fs-${n}`, title: `For / Since ${Number(n)}`, kind: "dictation", level: "B1",
  audioText: text, prompt: "Duyduğunu yaz:", answer: text,
  evidence: /\bfor\b/.test(text) && !/\bsince\b/.test(text) ? "for + süre." : /\bsince\b/.test(text) && !/\bfor\b/.test(text) ? "since + başlangıç noktası." : "for = süre, since = başlangıç.",
  transcript: text, topicTags: ["en.present-perfect"], focusTags: ["for-since"],
}));

/** Session B: V3 dinleme tanıma. */
const V3_LISTENING: ListeningItem[] = [
  ["01", "I have seen that film before.", "I have ___ that film before.", "seen", "see – saw – seen"],
  ["02", "She has written three emails today.", "She has ___ three emails today.", "written", "write – wrote – written"],
  ["03", "He has taken my umbrella.", "He has ___ my umbrella.", "taken", "take – took – taken"],
  ["04", "We have spoken to the manager.", "We have ___ to the manager.", "spoken", "speak – spoke – spoken"],
  ["05", "I have known him since school.", "I have ___ him since school.", "known", "know – knew – known"],
  ["06", "They have been here for an hour.", "They have ___ here for an hour.", "been", "be – was/were – been"],
  ["07", "She has gone to the market.", "She has ___ to the market.", "gone", "go – went – gone"],
  ["08", "I have eaten breakfast already.", "I have ___ breakfast already.", "eaten", "eat – ate – eaten"],
  ["09", "He has driven for five hours.", "He has ___ for five hours.", "driven", "drive – drove – driven"],
  ["10", "We have chosen a new teacher.", "We have ___ a new teacher.", "chosen", "choose – chose – chosen"],
  ["11", "I have forgotten my password.", "I have ___ my password.", "forgotten", "forget – forgot – forgotten"],
  ["12", "She has given me some advice.", "She has ___ me some advice.", "given", "give – gave – given"],
].map(([n, text, prompt, answer, evidence]) => L({
  id: `en-lis-v3-${n}`, title: `V3: ${answer}`, kind: "missing-word", level: "B1",
  audioText: text, prompt: `${prompt} (dinle ve yaz — V3)`, answer, evidence,
  transcript: text, topicTags: ["en.present-perfect"], focusTags: ["v3"],
}));
V3_LISTENING.push(
  L({ id: "en-lis-v3-13", title: "V3: done", kind: "mc", level: "B1", audioText: "They have done their homework.", prompt: "Hangi V3 formunu duydun?", options: ["done", "did", "do", "doing"], answer: "done", evidence: "do – did – done.", transcript: "They have done their homework.", topicTags: ["en.present-perfect"], focusTags: ["v3"] }),
  L({ id: "en-lis-v3-14", title: "V3: begun", kind: "short", level: "B1", audioText: "My friend has begun a new course.", prompt: "Duyduğun V3 formunu yaz:", answer: "begun", evidence: "begin – began – begun.", transcript: "My friend has begun a new course.", topicTags: ["en.present-perfect"], focusTags: ["v3"] }),
);

/** Session G: haftalık dinleme testi (daha önce çalışılmamış cümleler, 1. hafta karışımı). */
const WEEK1_TEST: ListeningItem[] = [
  L({ id: "en-lis-wt-01", title: "Hafta Testi 1", kind: "mc", level: "B1", audioText: "I have studied English for four years, but I haven't taken an exam yet.", prompt: "Sınav durumu nedir?", options: ["Henüz sınava girmedi", "Sınava girdi ve geçti", "Üç kez girdi", "Sınavı iptal etti"], answer: "Henüz sınava girmedi", evidence: "haven't taken an exam yet.", transcript: "I have studied English for four years, but I haven't taken an exam yet.", topicTags: ["en.present-perfect"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-02", title: "Hafta Testi 2", kind: "short", level: "B1", audioText: "She has lived in Izmir since 2021.", prompt: "Ne zamandan beri İzmir’de? (İngilizce)", answer: "since 2021", acceptedAnswers: ["2021"], evidence: "since 2021.", transcript: "She has lived in Izmir since 2021.", topicTags: ["en.present-perfect"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-03", title: "Hafta Testi 3", kind: "mc", level: "B1", audioText: "When I got to the station, the train had already left.", prompt: "Ne oldu?", options: ["Tren istasyondan ayrılmıştı", "Tren geç kaldı", "Tren hâlâ oradaydı", "Tren bozuldu"], answer: "Tren istasyondan ayrılmıştı", evidence: "had already left.", transcript: "When I got to the station, the train had already left.", topicTags: ["en.past-perfect"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-04", title: "Hafta Testi 4", kind: "dictation", level: "B1", audioText: "He avoids eating late at night.", prompt: "Duyduğunu yaz:", answer: "He avoids eating late at night.", evidence: "avoid + doing.", transcript: "He avoids eating late at night.", topicTags: ["en.gerund-infinitive"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-05", title: "Hafta Testi 5", kind: "meaning", level: "B1", audioText: "They are looking forward to visiting us.", prompt: "“look forward to” ne demek?", options: ["Dört gözle beklemek", "Hatırlamak", "Kaçınmak", "Pişman olmak"], answer: "Dört gözle beklemek", evidence: "look forward to + doing.", transcript: "They are looking forward to visiting us.", topicTags: ["en.gerund-infinitive"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-06", title: "Hafta Testi 6", kind: "mc", level: "B1", audioText: "If I had a bigger flat, I would invite you all.", prompt: "Gerçek durum nedir?", options: ["Dairesi küçük", "Dairesi büyük", "Herkesi davet etti", "Taşındı"], answer: "Dairesi küçük", evidence: "If I had… = şu an öyle değil.", transcript: "If I had a bigger flat, I would invite you all.", topicTags: ["en.conditionals"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-07", title: "Hafta Testi 7", kind: "missing-word", level: "B1", audioText: "My sister is very interested in photography.", prompt: "My sister is very interested ___ photography. (dinle ve yaz)", answer: "in", evidence: "interested in.", transcript: "My sister is very interested in photography.", topicTags: ["en.prepositions-collocations"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-08", title: "Hafta Testi 8", kind: "dictation", level: "B1", audioText: "Can you tell me where the post office is?", prompt: "Duyduğunu yaz:", answer: "Can you tell me where the post office is?", evidence: "dolaylı soru: where the post office is.", transcript: "Can you tell me where the post office is?", topicTags: ["en.sentence-structure"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-09", title: "Hafta Testi 9", kind: "short", level: "B1", audioText: "I depend on public transport because I don't have a car.", prompt: "Neye bağımlı? (İngilizce)", answer: "public transport", acceptedAnswers: ["transport"], evidence: "depend on public transport.", transcript: "I depend on public transport because I don't have a car.", topicTags: ["en.prepositions-collocations"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-10", title: "Hafta Testi 10", kind: "dictation", level: "B1", audioText: "I haven't seen my cousin since last summer.", prompt: "Duyduğunu yaz:", answer: "I haven't seen my cousin since last summer.", evidence: "haven't + V3 + since.", transcript: "I haven't seen my cousin since last summer.", topicTags: ["en.present-perfect"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-11", title: "Hafta Testi 11", kind: "short", level: "B1", audioText: "By the time I arrived, they had finished dinner.", prompt: "Ne bitirmişlerdi? (İngilizce)", answer: "dinner", acceptedAnswers: ["finished dinner", "had finished dinner"], evidence: "had finished dinner.", transcript: "By the time I arrived, they had finished dinner.", topicTags: ["en.past-perfect"], focusTags: ["week1-test"] }),
  L({ id: "en-lis-wt-12", title: "Hafta Testi 12", kind: "mc", level: "B1", audioText: "She decided to apply for a job abroad.", prompt: "Ne karar verdi?", options: ["Yurt dışında iş başvurusu yapmaya", "İşten ayrılmaya", "Eve dönmeye", "Okula başlamaya"], answer: "Yurt dışında iş başvurusu yapmaya", evidence: "decided to apply.", transcript: "She decided to apply for a job abroad.", topicTags: ["en.gerund-infinitive"], focusTags: ["week1-test"] }),
];

export const EN_LISTENING_ITEMS: ListeningItem[] = [
  ...SHORT_DIALOGS, ...DICTATION, ...LONG_DICTATION, ...LONG_SETS,
  ...PP_SHORT, ...FS_DICTATION, ...V3_LISTENING, ...WEEK1_TEST,
];
export const EN_LISTENING_BY_ID = new Map(EN_LISTENING_ITEMS.map((i) => [i.id, i]));
/** Filtrede kullanilabilir odak etiketleri (icerikten turetilir). */
export const EN_LISTENING_FOCUS_TAGS: string[] = [
  ...new Set(EN_LISTENING_ITEMS.flatMap((i) => i.focusTags ?? [])),
];

export type ListeningKindScope = 'short' | 'dictation' | 'ielts';

/**
 * Konu + tür + odak kesişimi (Listening ekranı ve haftalık plan denetimi
 * AYNI süzgeci kullanır; ekran başlığı değil havuz değişir).
 */
export function listeningPool(scope: { topicId?: string; kind?: ListeningKindScope; focus?: string }): ListeningItem[] {
  return EN_LISTENING_ITEMS.filter((item) => {
    if (scope.topicId && !item.topicTags.includes(scope.topicId)) return false;
    if (scope.focus && !(item.focusTags ?? []).includes(scope.focus)) return false;
    if (scope.kind === 'dictation') return item.kind === 'dictation';
    if (scope.kind === 'ielts') return item.level === 'B1+';
    if (scope.kind === 'short') return item.kind !== 'dictation' && item.level !== 'B1+';
    return true;
  });
}
