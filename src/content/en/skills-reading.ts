/**
 * İngilizce Reading — 1. hafta (B1 → erken B1+).
 * Orijinal IELTS tarzı içerik; telifli materyal kopyalanmaz.
 * Her soruda kanıt (evidence) cümlesi/paragrafı vardır.
 */

import { EN_READING_WEEK1 } from './skills-reading-week1.ts';

export type ReadingQuestionType =
  | 'multiple-choice'
  | 'true-false-notgiven'
  | 'matching-headings'
  | 'sentence-completion'
  | 'short-answer';

export interface ReadingQuestion {
  id: string;
  type: ReadingQuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  acceptedAnswers?: string[];
  /** Kanıt: pasajdan birebir cümle/paragraf. */
  evidence: string;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  /** short | normal | ielts-practice */
  size: 'short' | 'normal' | 'ielts-practice';
  level: string;
  topicTags: string[];
  /** IELTS tarzı mı? */
  ieltsStyle: boolean;
  text: string;
  wordCount: number;
  questions: ReadingQuestion[];
  /** Öne çıkarılan 5–10 kelime/öbek (otomatik eklenmez). */
  vocab: Array<{ en: string; tr: string }>;
  /** 1. hafta planındaki rolü (Session E çalışma pasajları, Session G testi). */
  weekRole?: 'week1-passage-1' | 'week1-passage-2' | 'week1-test';
}

const P = (id: string, title: string, size: ReadingPassage['size'], level: string, topicTags: string[], ieltsStyle: boolean, text: string, questions: ReadingQuestion[], vocab: ReadingPassage['vocab']): ReadingPassage => ({
  id, title, size, level, topicTags, ieltsStyle, text,
  wordCount: text.split(/\s+/).filter(Boolean).length,
  questions, vocab,
});

const BASE_PASSAGES: ReadingPassage[] = [
  P('en-read-1', 'My English Journey', 'short', 'B1', ['en.present-perfect', 'en.sentence-structure'], false,
    `My name is Elif and I have studied English for three years. I study English every evening because I want to study abroad. At first, lessons were difficult. I knew only a few words and I could not make full sentences. Now I can write short paragraphs and I understand simple stories. I have never visited an English-speaking country, but I practise with films and songs. I listen to English music every day and I try to sing along. My teacher says my grammar is better than last year. I have already finished two course books. I have not taken an IELTS test yet, but I plan to take one next year. My dream is to study computer science in London. If I had more free time, I would read English books every day. I pay attention to new collocations and I write them in my notebook. I believe in small steps because they bring big change.`,
    [
      { id: 'en-read-1-q1', type: 'multiple-choice', prompt: 'Elif ne kadar süredir İngilizce çalışıyor?', options: ['Üç yıldır', 'Bir yıldır', 'Beş yıldır', 'Bir aydır'], answer: 'Üç yıldır', evidence: 'I have studied English for three years.', explanation: 'for three years süreyi verir.' },
      { id: 'en-read-1-q2', type: 'true-false-notgiven', prompt: 'Elif İngilizce konuşulan bir ülkede bulundu.', options: ['True', 'False', 'Not Given'], answer: 'False', evidence: 'I have never visited an English-speaking country', explanation: 'never olumsuz deneyim bildirir.' },
      { id: 'en-read-1-q3', type: 'short-answer', prompt: 'Elif her akşam neden çalışıyor? (kısa cevap)', answer: 'because she wants to study abroad', acceptedAnswers: ['to study abroad', 'she wants to study abroad'], evidence: 'I study English every evening because I want to study abroad.', explanation: 'because cümlesi nedeni verir.' },
      { id: 'en-read-1-q4', type: 'sentence-completion', prompt: 'Elif şimdiye kadar ___ kurs kitabı bitirdi.', answer: 'two', acceptedAnswers: ['2', 'two course books'], evidence: 'I have already finished two course books.', explanation: 'already bitmiş işi gösterir.' },
      { id: 'en-read-1-q5', type: 'multiple-choice', prompt: 'Elif IELTS testi aldı mı?', options: ['Evet, aldı', 'Hayır, henüz almadı', 'İki kez aldı', 'Bıraktı'], answer: 'Hayır, henüz almadı', evidence: 'I have not taken an IELTS test yet', explanation: 'yet olumsuzda henüz demektir.' },
    ],
    [{ en: 'study abroad', tr: 'yurt dışında okumak' }, { en: 'practise with films', tr: 'filmlerle pratik yapmak' }, { en: 'course book', tr: 'ders kitabı' }, { en: 'take a test', tr: 'sınava girmek' }, { en: 'dream', tr: 'hayal' }, { en: 'improve', tr: 'geliştirmek' }]),
  P('en-read-2', 'A Busy Morning', 'short', 'B1', ['en.sentence-structure', 'en.past-perfect'], false,
    `Ali gets up at seven every morning. He has breakfast with his family at half past seven. Yesterday, he got up late. The bus had left before he arrived at the stop. He waited for the next bus for twenty minutes. By the time he arrived at school, the first lesson had started. His teacher asked where he was. Ali said he was sorry. Today, Ali gets up early. He leaves home at seven and he arrives at school on time. He pays attention to the teacher and he takes notes. He is good at maths and he enjoys solving problems. If he has free time in the evening, he will play football with his friends. He believes in hard work because he wants to become an engineer. He listens to English songs every night and he learns new words from them.`,
    [
      { id: 'en-read-2-q1', type: 'multiple-choice', prompt: 'Ali dün neden geç kaldı?', options: ['Otobüs erken kalktı', 'Kahvaltı yapmadı', 'Okul kapalıydı', 'Yağmur yağdı'], answer: 'Otobüs erken kalktı', evidence: 'The bus had left before he arrived at the stop.', explanation: 'had left önce olanı anlatır.' },
      { id: 'en-read-2-q2', type: 'true-false-notgiven', prompt: 'Ali okula vardığında ilk ders başlamıştı.', options: ['True', 'False', 'Not Given'], answer: 'True', evidence: 'By the time he arrived at school, the first lesson had started.', explanation: 'By the time + had started.' },
      { id: 'en-read-2-q3', type: 'short-answer', prompt: 'Ali otobüsü kaç dakika bekledi?', answer: 'twenty minutes', acceptedAnswers: ['for twenty minutes', '20 minutes'], evidence: 'He waited for the next bus for twenty minutes.', explanation: 'for süre verir.' },
      { id: 'en-read-2-q4', type: 'sentence-completion', prompt: 'Bugün Ali okula ___ varıyor.', answer: 'on time', acceptedAnswers: ['on time', 'early'], evidence: 'he arrives at school on time.', explanation: 'on time zamanında demektir.' },
    ],
    [{ en: 'get up', tr: 'kalkmak' }, { en: 'wait for', tr: 'beklemek' }, { en: 'pay attention to', tr: 'dikkat etmek' }, { en: 'take notes', tr: 'not almak' }, { en: 'on time', tr: 'zamanında' }]),
  P('en-read-3', 'Learning a Skill', 'normal', 'B1', ['en.gerund-infinitive', 'en.present-perfect'], false,
    `Everyone can learn a new skill, but most people stop too early. Deniz wanted to learn the guitar. At first, he enjoyed playing easy songs. He practised every day because he loved music. After two months, songs became harder and he wanted to stop. His teacher said, “Keep practising. Do not avoid difficult parts.” Deniz decided to practise thirty minutes every day. He looked forward to playing his favourite song at the school party. After three months, he played it without mistakes. Now he plans to learn the piano. He believes in himself because he knows hard work helps. If he had more free time, he would practise one hour every day. He listens to famous guitarists and he writes down new chords. He is good at rhythm now, but he still practises scales every morning.`,
    [
      { id: 'en-read-3-q1', type: 'multiple-choice', prompt: 'Deniz ilk başta neyi sevdi?', options: ['Kolay şarkılar çalmayı', 'Piyano çalmayı', 'Şarkı söylemeyi', 'Davul çalmayı'], answer: 'Kolay şarkılar çalmayı', evidence: 'he enjoyed playing easy songs.', explanation: 'enjoy + doing kalıbı.' },
      { id: 'en-read-3-q2', type: 'true-false-notgiven', prompt: 'Deniz iki ay sonra bırakmak istedi.', options: ['True', 'False', 'Not Given'], answer: 'True', evidence: 'he wanted to stop.', explanation: 'want + to do.' },
      { id: 'en-read-3-q3', type: 'short-answer', prompt: 'Deniz her gün kaç dakika pratik yapmaya karar verdi?', answer: 'thirty minutes', acceptedAnswers: ['30 minutes', 'thirty minutes every day'], evidence: 'He decided to practise thirty minutes every day.', explanation: 'decide + to do.' },
      { id: 'en-read-3-q4', type: 'sentence-completion', prompt: 'Deniz ___ çalmayı dört gözle bekledi.', answer: 'his favourite song', acceptedAnswers: ['his favourite song at the school party', 'favourite song'], evidence: 'He looked forward to playing his favourite song', explanation: 'look forward to + doing.' },
      { id: 'en-read-3-q5', type: 'multiple-choice', prompt: 'Şimdi ne planlıyor?', options: ['Piyano öğrenmek', 'Gitarı bırakmak', 'Şarkı söylemek', 'Okulu bırakmak'], answer: 'Piyano öğrenmek', evidence: 'Now he plans to learn the piano.', explanation: 'plan + to do.' },
    ],
    [{ en: 'enjoy doing', tr: 'yapmaktan hoşlanmak' }, { en: 'keep practising', tr: 'pratik yapmaya devam etmek' }, { en: 'decide to do', tr: 'yapmaya karar vermek' }, { en: 'look forward to doing', tr: 'dört gözle beklemek' }, { en: 'believe in oneself', tr: 'kendine inanmak' }, { en: 'without mistakes', tr: 'hatasız' }]),
  P('en-read-4', 'Rain and Plans', 'normal', 'B1', ['en.conditionals', 'en.prepositions-collocations'], false,
    `Mert loves football. He plays football with his friends in the park every Saturday. Last Saturday, it rained a lot. If it rains, they usually wait for one hour. This time the rain did not stop. Mert said, “If we had a sports hall, we would play inside.” His friend said, “If I were rich, I would build a hall for us.” They laughed and went to a café. They are good at table tennis, so they played it for two hours. Mert is interested in sports news. He listens to sports radio every morning. He believes in his team. Next Saturday, if the weather is good, they will play football again. He has invited his cousins too, and they look forward to joining the game. If they win, they will celebrate with tea at the café.`,
    [
      { id: 'en-read-4-q1', type: 'multiple-choice', prompt: 'Mert ne zaman futbol oynar?', options: ['Her cumartesi', 'Her pazar', 'Her akşam', 'Ayda bir'], answer: 'Her cumartesi', evidence: 'He plays football with his friends in the park every Saturday.', explanation: 'every Saturday rutini verir.' },
      { id: 'en-read-4-q2', type: 'true-false-notgiven', prompt: 'Yağmur bir saatte durdu.', options: ['True', 'False', 'Not Given'], answer: 'False', evidence: 'This time the rain did not stop.', explanation: 'did not stop olumsuzdur.' },
      { id: 'en-read-4-q3', type: 'short-answer', prompt: 'Spor salonları olsaydı ne yaparlardı?', answer: 'they would play inside', acceptedAnswers: ['play inside', 'would play inside'], evidence: 'If we had a sports hall, we would play inside.', explanation: 'Second Conditional hayali.' },
      { id: 'en-read-4-q4', type: 'sentence-completion', prompt: 'Kafede ___ oynadılar.', answer: 'table tennis', acceptedAnswers: ['table tennis for two hours'], evidence: 'they played it for two hours', explanation: 'it = table tennis (önceki cümle).' },
      { id: 'en-read-4-q5', type: 'multiple-choice', prompt: 'Gelecek cumartesi plan nedir?', options: ['Hava iyiyse futbol', 'Kesinlikle kafe', 'Spor salonu', 'Masa tenisi turnuvası'], answer: 'Hava iyiyse futbol', evidence: 'if the weather is good, they will play football again.', explanation: 'First Conditional planı.' },
    ],
    [{ en: 'wait for', tr: 'beklemek' }, { en: 'be good at', tr: 'iyi olmak' }, { en: 'be interested in', tr: 'ilgilenmek' }, { en: 'listen to', tr: 'dinlemek' }, { en: 'believe in', tr: 'inanmak' }, { en: 'sports hall', tr: 'spor salonu' }]),
  P('en-read-5', 'A Small Shop', 'normal', 'B1', ['en.prepositions-collocations', 'en.sentence-structure'], false,
    `Zeynep works in a small shop in the city centre. She is ready for work at nine every morning. She listens to customers carefully and she pays attention to their questions. Different people want different things. An old man waits for fresh bread every day. A young mother depends on the shop because it is near her home. Zeynep is good at remembering names. She believes in kind service. Yesterday, a customer was afraid of a big dog outside. Zeynep waited with her until the dog left. The customer said, “Thank you. You are different from other shops.” Zeynep smiled because she loves her job. If she has time on Sunday, she will visit her family. She has worked in the shop for two years and she knows every street around it.`,
    [
      { id: 'en-read-5-q1', type: 'multiple-choice', prompt: 'Zeynep saat kaçta hazırdır?', options: ['Dokuzda', 'Sekizde', 'Onda', 'Yedide'], answer: 'Dokuzda', evidence: 'She is ready for work at nine', explanation: 'ready for + saat.' },
      { id: 'en-read-5-q2', type: 'true-false-notgiven', prompt: 'Zeynep isimleri iyi hatırlar.', options: ['True', 'False', 'Not Given'], answer: 'True', evidence: 'She is good at remembering names.', explanation: 'good at + doing.' },
      { id: 'en-read-5-q3', type: 'short-answer', prompt: 'Genç anne neden dükkâna bağlı?', answer: 'because it is near her home', acceptedAnswers: ['it is near her home', 'near her home'], evidence: 'it is near her home.', explanation: 'because nedeni verir.' },
      { id: 'en-read-5-q4', type: 'sentence-completion', prompt: 'Müşteri köpekten ___.', answer: 'was afraid', acceptedAnswers: ['was afraid of a big dog', 'afraid'], evidence: 'a customer was afraid of a big dog', explanation: 'afraid of korkmak.' },
    ],
    [{ en: 'ready for', tr: 'hazır olmak' }, { en: 'pay attention to', tr: 'dikkat etmek' }, { en: 'wait for', tr: 'beklemek' }, { en: 'depend on', tr: 'bağlı olmak' }, { en: 'good at', tr: 'iyi olmak' }, { en: 'different from', tr: 'farklı olmak' }]),
  // IELTS tarzı 3 set
  P('en-read-ielts-1', 'IELTS Pratiği: City Libraries (tarz)', 'ielts-practice', 'B1+', ['en.present-perfect', 'en.conditionals'], true,
    `A. City libraries have changed a lot in the last ten years. They have become meeting places, not only shelves of books. Many people visit them every week because they are quiet and free. B. The central library opens at nine every morning. Students study there before exams. They wait for free tables in busy weeks. Workers read newspapers after lunch. Old people meet friends and talk about books. C. Libraries also teach skills. They have organised computer courses for three years. Young people learn to write emails and older people learn to use video calls. If libraries had more money, they would open longer hours. Many visitors say they would come in the evening. D. Some people think books will disappear. Librarians do not believe this. They say people still love paper books. They have bought new novels every month since 2021. Children borrow picture books and they look forward to story hours. E. If you have never visited your local library, try it this week. Take your notebook, pay attention to the rules, and enjoy reading. If it rains on Saturday, you will be happy inside.`,
    [
      { id: 'en-read-ielts-1-q1', type: 'matching-headings', prompt: 'Paragraf B için başlık seç:', options: ['A Day in the Library', 'Money Problems', 'The End of Books', 'Computer Courses'], answer: 'A Day in the Library', evidence: 'The central library opens at nine every morning. Students study there… Workers read… Old people meet…', explanation: 'B günü anlatır.' },
      { id: 'en-read-ielts-1-q2', type: 'matching-headings', prompt: 'Paragraf C için başlık seç:', options: ['Teaching New Skills', 'A Day in the Library', 'The End of Books', 'Rainy Days'], answer: 'Teaching New Skills', evidence: 'Libraries also teach skills. They have organised computer courses…', explanation: 'C beceri öğretir.' },
      { id: 'en-read-ielts-1-q3', type: 'true-false-notgiven', prompt: 'Kütüphaneler sadece kitap raflarıdır.', options: ['True', 'False', 'Not Given'], answer: 'False', evidence: 'They have become meeting places, not only shelves of books.', explanation: 'not only tersini söyler.' },
      { id: 'en-read-ielts-1-q4', type: 'sentence-completion', prompt: 'Kütüphaneler ___ yıldır bilgisayar kursu düzenliyor.', answer: 'three', acceptedAnswers: ['for three years', 'three years'], evidence: 'They have organised computer courses for three years.', explanation: 'for süre verir.' },
      { id: 'en-read-ielts-1-q5', type: 'short-answer', prompt: 'Daha çok para olsaydı kütüphaneler ne yapardı?', answer: 'they would open longer hours', acceptedAnswers: ['open longer hours', 'would open longer hours'], evidence: 'If libraries had more money, they would open longer hours.', explanation: 'Second hayali.' },
      { id: 'en-read-ielts-1-q6', type: 'multiple-choice', prompt: 'Kütüphaneciler neye inanıyor?', options: ['Kâğıt kitaplar sevilmeye devam ediyor', 'Kitaplar yok olacak', 'Kütüphaneler kapanacak', 'Kimse okumuyor'], answer: 'Kâğıt kitaplar sevilmeye devam ediyor', evidence: 'They say people still love paper books.', explanation: 'still devamı gösterir.' },
    ],
    [{ en: 'meeting place', tr: 'buluşma yeri' }, { en: 'wait for', tr: 'beklemek' }, { en: 'organise courses', tr: 'kurs düzenlemek' }, { en: 'look forward to', tr: 'dört gözle beklemek' }, { en: 'pay attention to', tr: 'dikkat etmek' }, { en: 'borrow', tr: 'ödünç almak' }, { en: 'disappear', tr: 'yok olmak' }]),
  P('en-read-ielts-2', 'IELTS Pratiği: Weekend Work (tarz)', 'ielts-practice', 'B1+', ['en.past-perfect', 'en.gerund-infinitive'], true,
    `A. Many students work at the weekend. They want to earn money and they plan to save it. Some enjoy serving customers, others prefer working outside. B. Selin started work last year. She had never worked before. In the first week, she was afraid of making mistakes. She listened to her manager and paid attention to every detail. C. One Saturday, Selin arrived late. The shop had opened before she came. Her manager had already given the morning jobs to others. Selin felt sorry. She decided to leave home earlier. Now she is never late. She looks forward to going to work because she likes her team. D. Weekend work teaches plans. If students save money, they will travel in summer. If Selin had more free time, she would study more English. She believes in hard work. E. If you want a weekend job, try to be on time, listen to advice, and keep learning. Different shops need different skills.`,
    [
      { id: 'en-read-ielts-2-q1', type: 'matching-headings', prompt: 'Paragraf C için başlık:', options: ['A Late Morning', 'Money Plans', 'Advice for All', 'The End of Work'], answer: 'A Late Morning', evidence: 'One Saturday, Selin arrived late. The shop had opened before she came.', explanation: 'C geç kalmayı anlatır.' },
      { id: 'en-read-ielts-2-q2', type: 'true-false-notgiven', prompt: 'Selin daha önce çalışmıştı.', options: ['True', 'False', 'Not Given'], answer: 'False', evidence: 'She had never worked before.', explanation: 'never olumsuzdur.' },
      { id: 'en-read-ielts-2-q3', type: 'sentence-completion', prompt: 'Dükkân Selin gelmeden ___.', answer: 'had opened', acceptedAnswers: ['had opened before she came', 'opened'], evidence: 'The shop had opened before she came.', explanation: 'önce olan had + V3.' },
      { id: 'en-read-ielts-2-q4', type: 'short-answer', prompt: 'Selin ne yapmaya karar verdi?', answer: 'to leave home earlier', acceptedAnswers: ['leave home earlier', 'to leave home earlier'], evidence: 'She decided to leave home earlier.', explanation: 'decide + to do.' },
      { id: 'en-read-ielts-2-q5', type: 'multiple-choice', prompt: 'Selin işe gitmeyi neden dört gözle bekliyor?', options: ['Ekibini seviyor', 'Para çok', 'İş kolay', 'Ev yakın'], answer: 'Ekibini seviyor', evidence: 'she likes her team.', explanation: 'because nedeni verir.' },
    ],
    [{ en: 'earn money', tr: 'para kazanmak' }, { en: 'plan to save', tr: 'biriktirmeyi planlamak' }, { en: 'be afraid of', tr: 'korkmak' }, { en: 'pay attention to', tr: 'dikkat etmek' }, { en: 'decide to do', tr: 'yapmaya karar vermek' }, { en: 'look forward to', tr: 'dört gözle beklemek' }]),
  P('en-read-ielts-3', 'IELTS Pratiği: Learning Languages (tarz)', 'ielts-practice', 'B1+', ['en.present-perfect', 'en.sentence-structure'], true,
    `A. Learning a language takes time. People who study every day improve faster. They have studied for months and they can see the change. B. Good learners use chunks. They do not learn single words only. They learn pay attention to, interested in, look forward to doing. These chunks help writing and speaking. C. Listening helps a lot. If you listen to English every day, you will understand more. Many learners enjoy watching films with subtitles. They keep watching and they learn new phrases. D. Speaking needs courage. If you were not afraid of mistakes, you would speak more. Try to speak one minute every day. Record yourself, listen again, and enjoy your progress. E. Reading is the easiest skill for many Turkish learners. If you have read three easy books, try a longer one. Do you know where the library is? Ask, borrow a book, and start tonight. Small steps every day bring big results.`,
    [
      { id: 'en-read-ielts-3-q1', type: 'matching-headings', prompt: 'Paragraf B için başlık:', options: ['Learn Chunks, Not Words', 'Listening Only', 'Fear of Speaking', 'Easy Reading'], answer: 'Learn Chunks, Not Words', evidence: 'Good learners use chunks. They do not learn single words only.', explanation: 'B öbekleri anlatır.' },
      { id: 'en-read-ielts-3-q2', type: 'true-false-notgiven', prompt: 'Her gün çalışmak daha hızlı geliştirir.', options: ['True', 'False', 'Not Given'], answer: 'True', evidence: 'People who study every day improve faster.', explanation: 'doğrudan ifade.' },
      { id: 'en-read-ielts-3-q3', type: 'sentence-completion', prompt: 'Öbek örneği: ___ to.', answer: 'pay attention', acceptedAnswers: ['pay attention to', 'Pay attention to'], evidence: 'They learn pay attention to, interested in', explanation: 'öbek listesi.' },
      { id: 'en-read-ielts-3-q4', type: 'short-answer', prompt: 'Konuşma için günlük öneri nedir?', answer: 'speak one minute every day', acceptedAnswers: ['one minute every day', 'try to speak one minute every day'], evidence: 'Try to speak one minute every day.', explanation: 'try + to do önerisi.' },
      { id: 'en-read-ielts-3-q5', type: 'multiple-choice', prompt: 'Okuma önerisi nedir?', options: ['Üç kolay kitaptan sonra daha uzunu dene', 'Sadece gramer çalış', 'Asla kütüphaneye gitme', 'Filmleri bırak'], answer: 'Üç kolay kitaptan sonra daha uzunu dene', evidence: 'If you have read three easy books, try a longer one.', explanation: 'koşul + öneri.' },
    ],
    [{ en: 'improve', tr: 'geliştirmek' }, { en: 'chunk', tr: 'öbek' }, { en: 'pay attention to', tr: 'dikkat etmek' }, { en: 'look forward to doing', tr: 'dört gözle beklemek' }, { en: 'courage', tr: 'cesaret' }, { en: 'subtitle', tr: 'altyazı' }]),
];

export const EN_READING_PASSAGES: ReadingPassage[] = [...BASE_PASSAGES, ...EN_READING_WEEK1];

export const EN_READING_BY_ID = new Map(EN_READING_PASSAGES.map((p) => [p.id, p]));
