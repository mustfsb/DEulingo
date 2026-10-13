/**
 * 1. hafta IELTS tarzı okuma: iki çalışma pasajı (Session E) + bir haftalık
 * test pasajı (Session G, daha önce hiç görülmeyen metin).
 *
 * Orijinal içerik; telifli materyal yok. Her sorunun `evidence` alanı
 * pasajdan BİREBİR alıntıdır (kanıt incelemesi bunu pasajda vurgular;
 * `week1.test.ts` birebirliği denetler). Paragraflar `[A]` etiketiyle
 * başlar; boş satırla ayrılır.
 */

import type { ReadingPassage, ReadingQuestion } from './skills-reading.ts';

const TFNG = ['True', 'False', 'Not Given'];

const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

function passage(
  base: Omit<ReadingPassage, 'wordCount' | 'size' | 'ieltsStyle' | 'level'> & { weekRole: NonNullable<ReadingPassage['weekRole']> },
): ReadingPassage {
  return { ...base, size: 'ielts-practice', level: 'B1+', ieltsStyle: true, wordCount: countWords(base.text) };
}

/* ------------------------------------------------------------------ */
/* Passage 1 — Green Roofs and Cooler Cities (MC + T/F/NG + kısa cevap) */
/* ------------------------------------------------------------------ */

const P1_TEXT = `[A] Cities have always been busy places, but in recent years many of them have become uncomfortably hot. Concrete, glass and dark roads absorb the heat of the sun during the day and release it slowly at night, so the centre of a large city can be several degrees warmer than the countryside around it. Scientists call this the urban heat island effect. As summers have become longer and hotter, city planners have started to look for simple ways to cool their streets.

[B] One of the most popular ideas is the green roof. A green roof is an ordinary roof that has been covered with soil and plants. The idea is not new: people in northern Europe built roofs covered with grass hundreds of years ago, mainly to keep their houses warm in winter. Today, however, engineers recommend green roofs for the opposite reason. Plants take in sunlight and release water vapour, which cools the air around them. A building with a green roof can be several degrees cooler inside in summer, and its owners often spend less money on air conditioning.

[C] Green roofs also help with a second problem: heavy rain. In a city with few gardens, rainwater cannot sink into the ground. It runs quickly into the drains, and when a storm is strong the drains may overflow. A green roof works like a sponge. It holds a large part of the water and lets it escape slowly, so the streets flood less often. Engineers have measured this effect in several cities, and they say that a well-planted roof can keep more than half of a short storm on the building instead of in the street.

[D] Not everyone is convinced. Green roofs are expensive to build, because the roof must be strong enough to carry the extra weight of wet soil. They also need regular care. Someone has to water the plants during dry weeks, remove weeds and check that the roof does not leak. Critics argue that the money would be better spent on planting trees along the streets, because trees give shade to people at ground level, something a roof garden cannot do.

[E] Supporters reply that cities need both. Trees cool the pavement, while green roofs cool the buildings and protect them from storms. In the town of Oakridge, the council has offered to pay a third of the cost for any owner who builds a green roof. Since the plan started six years ago, more than two hundred roofs have been planted, and a survey of residents showed that most of them had noticed cooler evenings in their neighbourhood.

[F] There are also benefits that few people expected. Birds and insects have returned to roofs where they had not been seen for decades. Some office workers have started to eat lunch on their roofs, and a few schools use them as outdoor classrooms. Planners now say that the aim is not simply to lower the temperature but to make cities more pleasant places to live in.

[G] Whether green roofs will become normal depends on the cost and on how quickly the law changes. In some countries, new buildings must already include plants on the roof; in others, owners decide for themselves. What is clear is that cities which ignore the problem of heat will find it harder and harder to ask people to live and work in them.`;

const P1_QUESTIONS: ReadingQuestion[] = [
  { id: 'en-read-w1-1-q1', type: 'multiple-choice', prompt: 'What is the main idea of the passage?', options: ['Green roofs are one way of making hot cities more comfortable.', 'Trees are always better than green roofs.', 'Northern Europe has the best roofs in the world.', 'Air conditioning will soon disappear.'], answer: 'Green roofs are one way of making hot cities more comfortable.', evidence: 'city planners have started to look for simple ways to cool their streets.', explanation: 'Pasajın tamamı şehirleri serinletme yollarını ve yeşil çatıyı anlatır; “main idea” tek bir ayrıntı değil, genel fikirdir.' },
  { id: 'en-read-w1-1-q2', type: 'multiple-choice', prompt: 'Why did people in northern Europe first build roofs covered with grass?', options: ['To keep their houses warm in winter', 'To cool the air in summer', 'To grow food for animals', 'To stop rain from falling'], answer: 'To keep their houses warm in winter', evidence: 'mainly to keep their houses warm in winter.', explanation: 'Bugünkü amaç (serinletme) ile ilk amaç (ısınma) farklıdır; “opposite reason” ipucudur.' },
  { id: 'en-read-w1-1-q3', type: 'multiple-choice', prompt: 'What does a green roof do in heavy rain?', options: ['It holds water and lets it escape slowly', 'It sends all the water into the drains', 'It makes the drains bigger', 'It stops the rain completely'], answer: 'It holds water and lets it escape slowly', evidence: 'It holds a large part of the water and lets it escape slowly', explanation: '“works like a sponge” benzetmesi su tutmayı anlatır.' },
  { id: 'en-read-w1-1-q4', type: 'multiple-choice', prompt: 'What is the main argument of the critics?', options: ['Trees give shade at street level, and roofs do not.', 'Plants are dangerous for buildings.', 'Rain is good for cities.', 'Nobody lives near green roofs.'], answer: 'Trees give shade at street level, and roofs do not.', evidence: 'trees give shade to people at ground level, something a roof garden cannot do.', explanation: 'Eleştirmenler parayı sokak ağaçlarına harcamayı önerir.' },
  { id: 'en-read-w1-1-q5', type: 'true-false-notgiven', prompt: 'The centre of a large city can be warmer than the countryside around it.', options: TFNG, answer: 'True', evidence: 'the centre of a large city can be several degrees warmer than the countryside around it.', explanation: 'Cümle birebir bunu söyler.' },
  { id: 'en-read-w1-1-q6', type: 'true-false-notgiven', prompt: 'Green roofs are a completely new idea.', options: TFNG, answer: 'False', evidence: 'The idea is not new', explanation: '“not new” ile pasaj bunun yeni olmadığını söyler → False.' },
  { id: 'en-read-w1-1-q7', type: 'true-false-notgiven', prompt: 'Green roofs are cheaper to build than planting trees along streets.', options: TFNG, answer: 'Not Given', evidence: 'Green roofs are expensive to build', explanation: 'Pasaj yeşil çatının pahalı olduğunu söyler ama ağaç dikmeyle maliyet karşılaştırması yapmaz → Not Given.' },
  { id: 'en-read-w1-1-q8', type: 'true-false-notgiven', prompt: 'Most residents of Oakridge noticed cooler evenings after the plan started.', options: TFNG, answer: 'True', evidence: 'a survey of residents showed that most of them had noticed cooler evenings in their neighbourhood.', explanation: 'Anket sonucu açıkça verilmiştir.' },
  { id: 'en-read-w1-1-q9', type: 'true-false-notgiven', prompt: 'All new buildings in every country must have plants on the roof.', options: TFNG, answer: 'False', evidence: 'in others, owners decide for themselves.', explanation: 'Bazı ülkelerde zorunlu, bazılarında sahip karar verir → “all … every” yanlış.' },
  { id: 'en-read-w1-1-q10', type: 'short-answer', prompt: 'What part of the cost does the council of Oakridge offer to pay? (one or two words)', answer: 'a third', acceptedAnswers: ['one third', 'third', '1/3', 'a third of the cost'], evidence: 'the council has offered to pay a third of the cost', explanation: 'Oran doğrudan verilmiştir: a third.' },
  { id: 'en-read-w1-1-q11', type: 'sentence-completion', prompt: 'Green roofs need regular care; for example, someone has to ___ the plants during dry weeks.', answer: 'water', acceptedAnswers: ['water the plants', 'watering'], evidence: 'Someone has to water the plants during dry weeks', explanation: 'Boşluk fiil ister: water (sulamak).' },
  { id: 'en-read-w1-1-q12', type: 'short-answer', prompt: 'Which animals have returned to some roofs after decades? (two words)', answer: 'birds and insects', acceptedAnswers: ['birds insects', 'insects and birds', 'birds, insects'], evidence: 'Birds and insects have returned to roofs where they had not been seen for decades.', explanation: 'Present Perfect (have returned) ile anlatılan sonuç.' },
];

/* ------------------------------------------------------------------ */
/* Passage 2 — Learning a Language as an Adult (başlık eşleştirme)      */
/* ------------------------------------------------------------------ */

const P2_TEXT = `[A] Many adults believe that learning a new language is something only children can do well. It is true that young children often copy sounds more easily, but adults have advantages that children do not have. Adults already understand how grammar works in their own language, they can plan their study, and they know why they are learning. Researchers who have followed adult learners for several years say that motivation is a better guide to success than age. Studies of language classes also show that adults who set clear goals, such as passing an exam or moving to another country, continue to study for longer than those who simply hope to improve one day.

[B] The best study plan is not always the longest one. Many busy learners try to study for three hours on Sunday and then do nothing for the rest of the week. By the next Sunday they have forgotten much of what they learned. Teachers now recommend twenty or thirty minutes every day. Short sessions are easier to fit into a working day, and the brain remembers new material better when it meets it again and again. A short session does not need special equipment: a phone, a notebook and a quiet corner are enough.

[C] Another common habit is to write long lists of single words and read them until the page is full of ticks. Unfortunately, a word that has been learned alone is difficult to use in a real sentence. Learners who study small groups of words, such as pay attention to, depend on or interested in, find that they speak more quickly because the phrase arrives in their head as one piece. Teachers sometimes call these groups chunks, and they are one reason why fluent speakers rarely stop to think about each small word.

[D] Classroom study is only the beginning. Learners who listen to the radio, watch films with subtitles or send messages to a friend abroad meet the language as people really use it. One student, for example, decided to read the news in English for ten minutes before breakfast. After a year she could follow a whole programme without stopping, even though she had never lived in an English-speaking country. Even simple activities, such as changing the language of a phone or writing a shopping list in English, give the brain extra chances to meet new words.

[E] Fear is the biggest enemy of speaking. Many learners say nothing because they are afraid of making a mistake in front of other people. Good teachers explain that a mistake is simply information: it shows exactly which part of the language needs more practice. Learners who accept their errors, write them down and try again usually improve faster than learners who wait until they are perfect. In the same way, a footballer does not learn to play by avoiding the ball.`;

const P2_PARAGRAPH_F = `[F] Finally, progress in a language is rarely smooth. After the first few weeks, most learners notice that they are improving quickly, and then, suddenly, nothing seems to change. This quiet period is normal, but many people read it as a sign of failure and give up too early. Learners who continue through it, even with only ten minutes a day, usually find that their listening and speaking improve again after a month or two. Patience, in other words, is as important as talent.`;

const P2_FULL_TEXT = `${P2_TEXT}

${P2_PARAGRAPH_F}`;

const P2_HEADINGS = [
  'Why age is not the main barrier',
  'A study routine that fits a busy life',
  'The problem with long word lists',
  'Using the language outside the classroom',
  'What happens when learners give up too early',
  'Seeing mistakes as useful information',
  'The high cost of private lessons',
];

const heading = (n: number, label: string, answer: string, evidence: string, explanation: string): ReadingQuestion => ({
  id: `en-read-w1-2-q${n}`, type: 'matching-headings', prompt: `Choose the best heading for paragraph ${label}.`, options: P2_HEADINGS, answer, evidence, explanation,
});

const P2_QUESTIONS: ReadingQuestion[] = [
  heading(1, 'A', 'Why age is not the main barrier', 'motivation is a better guide to success than age.', 'Paragraf, yaşın tek engel olmadığını ve yetişkinlerin avantajlarını anlatır.'),
  heading(2, 'B', 'A study routine that fits a busy life', 'Teachers now recommend twenty or thirty minutes every day.', 'Odak: günlük kısa çalışma rutini. “private lessons” ve “give up” bu paragrafta yok.'),
  heading(3, 'C', 'The problem with long word lists', 'a word that has been learned alone is difficult to use in a real sentence.', 'Tek kelime listeleri yerine öbek öğrenmek: paragrafın ana fikri.'),
  heading(4, 'D', 'Using the language outside the classroom', 'Learners who listen to the radio, watch films with subtitles or send messages to a friend abroad meet the language as people really use it.', 'Sınıf dışı kullanım örnekleri (radyo, film, mesaj).'),
  heading(5, 'E', 'Seeing mistakes as useful information', 'a mistake is simply information', 'Paragraf hata korkusunu ve hatanın bilgi olduğunu anlatır.'),
  heading(6, 'F', 'What happens when learners give up too early', 'many people read it as a sign of failure and give up too early.', 'Paragraf, ilerlemenin durağan göründüğü dönemi ve erken bırakmayı anlatır.'),
  { id: 'en-read-w1-2-q7', type: 'sentence-completion', prompt: 'Teachers recommend studying for twenty or thirty minutes every ___.', answer: 'day', acceptedAnswers: ['day.', 'each day'], evidence: 'Teachers now recommend twenty or thirty minutes every day.', explanation: 'Cümle birebir pasajdaki ifadeyi tamamlar.' },
  { id: 'en-read-w1-2-q8', type: 'sentence-completion', prompt: 'Learners who study small groups of words speak more quickly because the phrase arrives in their head as one ___.', answer: 'piece', acceptedAnswers: ['piece.'], evidence: 'the phrase arrives in their head as one piece.', explanation: 'Öbek, tek parça olarak hatırlanır.' },
  { id: 'en-read-w1-2-q9', type: 'sentence-completion', prompt: 'One student decided to read the news in English for ___ minutes before breakfast.', answer: 'ten', acceptedAnswers: ['10'], evidence: 'decided to read the news in English for ten minutes before breakfast.', explanation: 'Sayı doğrudan verilmiştir.' },
  { id: 'en-read-w1-2-q10', type: 'sentence-completion', prompt: 'Good teachers explain that a mistake is simply ___.', answer: 'information', acceptedAnswers: ['information.'], evidence: 'a mistake is simply information', explanation: 'Hata, neyin pratik gerektirdiğini gösteren bilgidir.' },
  { id: 'en-read-w1-2-q11', type: 'multiple-choice', prompt: 'According to paragraph B, why do learners forget what they studied on Sunday?', options: ['They do not study again until the next Sunday.', 'They study for less than ten minutes.', 'Their teachers change every week.', 'They only read, they never listen.'], answer: 'They do not study again until the next Sunday.', evidence: 'By the next Sunday they have forgotten much of what they learned.', explanation: 'Uzun ama seyrek çalışma unutmaya yol açar.' },
  { id: 'en-read-w1-2-q12', type: 'multiple-choice', prompt: 'What does the example of the student in paragraph D show?', options: ['Daily reading can build real understanding.', 'Living abroad is necessary.', 'News is too difficult for learners.', 'Only radio helps.'], answer: 'Daily reading can build real understanding.', evidence: 'After a year she could follow a whole programme without stopping', explanation: 'Her gün kısa okuma bir yıl sonra anlamayı getirdi; yurt dışında yaşamadı.' },
  { id: 'en-read-w1-2-q13', type: 'multiple-choice', prompt: 'Which learners usually improve faster, according to paragraph E?', options: ['Those who write down their errors and try again', 'Those who wait until they are perfect', 'Those who never speak in public', 'Those who avoid difficult phrases'], answer: 'Those who write down their errors and try again', evidence: 'Learners who accept their errors, write them down and try again usually improve faster', explanation: 'Hatayı kabul edip tekrar denemek ilerlemeyi hızlandırır.' },
];

/* ------------------------------------------------------------------ */
/* Haftalık test pasajı — Sleep and Learning (Session G, görülmemiş)    */
/* ------------------------------------------------------------------ */

const PT_TEXT = `[A] Most students know that sleep is important, but few of them realise how much it affects learning. During the day, the brain collects a great deal of new information. During the night, it sorts that information, keeps what seems useful and clears away the rest. A student who has slept badly therefore starts the next day with a less organised memory. This is why some universities now advise first-year students to protect their sleep as carefully as their study time.

[B] Researchers at a university in the north of England asked two groups of students to learn forty new words. The first group studied in the evening and then went to bed at their usual time. The second group studied in the morning and stayed awake all day. Before the test, the students in both groups had been asked to say how tired they felt, and the answers were almost identical. When both groups were tested the next day, the students who had slept remembered about a fifth more words than the others. The researchers did not test the students again a week later, so it is not known how long the difference lasted.

[C] Sleep is not only useful after studying. Students who sleep well before an exam usually concentrate better and make fewer careless mistakes. Many teachers have noticed that students who stay up all night before a test often read the questions too quickly and miss important words. For this reason, schools in several countries now start lessons later in the morning, because teenagers naturally go to sleep late. One head teacher explained that after her school moved the first lesson from eight o'clock to nine, pupils arrived calmer and fewer of them fell asleep in class.

[D] How much sleep is enough? Doctors suggest that most teenagers need between eight and ten hours a night, and adults between seven and nine. Drinking coffee late in the evening, using a phone in bed and studying until midnight can all make it harder to fall asleep. Simple habits help: going to bed at the same time every night, keeping the bedroom dark and quiet, and stopping work an hour before sleep. People who share a room with someone who goes to bed late may find this difficult, and earplugs or a simple eye mask can help.

[E] None of this means that students should stop studying and simply sleep more. The researchers stress that sleep can only help when there is something to remember. The best plan is to study carefully, rest properly and review the material briefly the following morning. A student who sleeps eight hours but never opens a book will not pass an exam either.

[F] Not everybody agrees about how strong the effect is. Some scientists point out that the experiment included only a small number of students and lasted a single night, so the results may not be the same for all age groups. They would like to see larger studies before schools change their timetables. Even so, most experts accept the main message: sleep is part of studying, not a waste of time.`;

const PT_QUESTIONS: ReadingQuestion[] = [
  { id: 'en-read-wt-1-q1', type: 'multiple-choice', prompt: 'What does the brain do with information during the night?', options: ['It sorts the information and keeps what is useful.', 'It deletes everything it learned.', 'It stops working completely.', 'It copies the information twice.'], answer: 'It sorts the information and keeps what is useful.', evidence: 'During the night, it sorts that information, keeps what seems useful and clears away the rest.', explanation: 'Gece beyin bilgiyi düzenler.' },
  { id: 'en-read-wt-1-q2', type: 'multiple-choice', prompt: 'In the experiment, which group remembered more words the next day?', options: ['The group that studied in the evening and then slept', 'The group that studied in the morning and stayed awake', 'Both groups remembered the same number', 'Neither group remembered anything'], answer: 'The group that studied in the evening and then slept', evidence: 'the students who had slept remembered about a fifth more words than the others.', explanation: 'Uyuyan grup yaklaşık beşte bir daha fazla kelime hatırladı.' },
  { id: 'en-read-wt-1-q3', type: 'multiple-choice', prompt: 'Why have some schools started lessons later in the morning?', options: ['Teenagers naturally go to sleep late.', 'Teachers prefer to sleep longer.', 'Exams are now in the afternoon.', 'Buses are slower in the morning.'], answer: 'Teenagers naturally go to sleep late.', evidence: 'because teenagers naturally go to sleep late.', explanation: 'Neden cümlesi “because” ile verilmiştir.' },
  { id: 'en-read-wt-1-q4', type: 'true-false-notgiven', prompt: 'The students in the experiment were tested again a week later.', options: TFNG, answer: 'False', evidence: 'The researchers did not test the students again a week later', explanation: 'Pasaj bunun yapılmadığını açıkça söyler → False.' },
  { id: 'en-read-wt-1-q5', type: 'true-false-notgiven', prompt: 'Students who sleep well before an exam usually concentrate better.', options: TFNG, answer: 'True', evidence: 'Students who sleep well before an exam usually concentrate better', explanation: 'Birebir ifade.' },
  { id: 'en-read-wt-1-q6', type: 'true-false-notgiven', prompt: 'Adults need more sleep than teenagers.', options: TFNG, answer: 'False', evidence: 'most teenagers need between eight and ten hours a night, and adults between seven and nine.', explanation: 'Gençler 8–10, yetişkinler 7–9 saat → yetişkinler daha az uyur.' },
  { id: 'en-read-wt-1-q7', type: 'true-false-notgiven', prompt: 'Coffee is the most common reason why teenagers cannot sleep.', options: TFNG, answer: 'Not Given', evidence: 'Drinking coffee late in the evening, using a phone in bed and studying until midnight can all make it harder to fall asleep.', explanation: 'Kahve bir neden olarak sayılır ama “en yaygın” olduğu söylenmez → Not Given.' },
  { id: 'en-read-wt-1-q8', type: 'short-answer', prompt: 'How many new words did the students in the experiment have to learn? (one or two words)', answer: 'forty', acceptedAnswers: ['40', 'forty words', '40 words'], evidence: 'to learn forty new words.', explanation: 'Sayı doğrudan verilmiştir.' },
  { id: 'en-read-wt-1-q9', type: 'short-answer', prompt: 'What should students do the morning after studying? (three or four words)', answer: 'review the material briefly', acceptedAnswers: ['review the material', 'review it briefly', 'review briefly'], evidence: 'review the material briefly the following morning.', explanation: 'Son paragraf öneriyi verir.' },
  { id: 'en-read-wt-1-q10', type: 'sentence-completion', prompt: 'Going to bed at the same time every night is one simple ___ that helps.', answer: 'habit', acceptedAnswers: ['habits', 'a habit'], evidence: 'Simple habits help: going to bed at the same time every night', explanation: 'Kelime “habits” tekil biçimde istenir.' },
];

export const EN_READING_WEEK1: ReadingPassage[] = [
  passage({
    id: 'en-read-w1-1', title: 'Hafta 1 · IELTS Passage 1: Green Roofs and Cooler Cities',
    topicTags: ['en.present-perfect', 'en.past-perfect'], text: P1_TEXT, questions: P1_QUESTIONS, weekRole: 'week1-passage-1',
    vocab: [
      { en: 'absorb', tr: 'emmek, çekmek' }, { en: 'overflow', tr: 'taşmak' }, { en: 'weigh more', tr: 'daha ağır olmak' },
      { en: 'regular care', tr: 'düzenli bakım' }, { en: 'pay a third of the cost', tr: 'maliyetin üçte birini ödemek' },
      { en: 'depend on', tr: '-e bağlı olmak' }, { en: 'pleasant', tr: 'hoş, keyifli' }, { en: 'ignore a problem', tr: 'sorunu görmezden gelmek' },
    ],
  }),
  passage({
    id: 'en-read-w1-2', title: 'Hafta 1 · IELTS Passage 2: Learning a Language as an Adult',
    topicTags: ['en.present-perfect', 'en.prepositions-collocations'], text: P2_FULL_TEXT, questions: P2_QUESTIONS, weekRole: 'week1-passage-2',
    vocab: [
      { en: 'motivation', tr: 'motivasyon' }, { en: 'fit into a busy day', tr: 'yoğun güne sığmak' }, { en: 'pay attention to', tr: 'dikkat etmek' },
      { en: 'depend on', tr: '-e bağlı olmak' }, { en: 'interested in', tr: '-e ilgi duymak' }, { en: 'meet the language', tr: 'dille karşılaşmak' },
      { en: 'be afraid of', tr: '-den korkmak' }, { en: 'try again', tr: 'tekrar denemek' },
    ],
  }),
  passage({
    id: 'en-read-wt-1', title: 'Hafta 1 · Okuma Testi: Sleep and Learning',
    topicTags: ['en.present-perfect', 'en.past-perfect'], text: PT_TEXT, questions: PT_QUESTIONS, weekRole: 'week1-test',
    vocab: [
      { en: 'organised', tr: 'düzenli' }, { en: 'concentrate on', tr: 'odaklanmak' }, { en: 'careless mistake', tr: 'dikkatsizlik hatası' },
      { en: 'stay up all night', tr: 'bütün gece uyumamak' }, { en: 'fall asleep', tr: 'uykuya dalmak' }, { en: 'review', tr: 'gözden geçirmek, tekrar etmek' },
    ],
  }),
];
