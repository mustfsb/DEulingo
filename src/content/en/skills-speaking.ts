/**
 * İngilizce Speaking — 40+ istem (read aloud, shadowing, short answer,
 * topic speaking, IELTS Part 1). Kayıt + tekrar + (varsa) STT.
 */

export type SpeakingKind =
  | 'read-aloud'
  | 'shadowing'
  | 'short-answer'
  | 'topic'
  | 'ielts-part1';

export interface SpeakingPrompt {
  id: string;
  kind: SpeakingKind;
  title: string;
  level: string;
  /** Ekranda gösterilen metin/soru. */
  prompt: string;
  promptTr?: string;
  /** Referans cümle (read-aloud/shadowing) veya örnek cevap. */
  reference?: string;
  sampleAnswer?: string;
  /** Dilbilgisi hedefleri (bounded değerlendirme). */
  targets?: string[];
  topicTags: string[];
  /** Alt odak (haftalık plan derin bağlantısı): 'pp-shadowing', 'second-conditional'… */
  focusTags?: string[];
  /** Uzun konuşma (monolog) için değinilecek noktalar — IELTS Part 2 kartı gibi. */
  points?: string[];
  /** Hedef konuşma süresi (sn); yalnızca uzun konuşmalarda. */
  seconds?: number;
}

const S = (p: SpeakingPrompt): SpeakingPrompt => p;

export const EN_SPEAKING_PROMPTS: SpeakingPrompt[] = [
  // read aloud (8)
  S({ id: 'en-spk-ra-1', kind: 'read-aloud', title: 'Read Aloud 1', level: 'B1', prompt: 'I have studied English for three years.', reference: 'I have studied English for three years.', targets: ['Present Perfect', 'for + süre'], topicTags: ['en.present-perfect'], focusTags: ['pp-read'] }),
  S({ id: 'en-spk-ra-2', kind: 'read-aloud', title: 'Read Aloud 2', level: 'B1', prompt: 'I study English every evening.', reference: 'I study English every evening.', targets: ['SVO', 'zaman sonda'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-ra-3', kind: 'read-aloud', title: 'Read Aloud 3', level: 'B1', prompt: 'The film had started before we arrived.', reference: 'The film had started before we arrived.', targets: ['had + V3'], topicTags: ['en.past-perfect'] }),
  S({ id: 'en-spk-ra-4', kind: 'read-aloud', title: 'Read Aloud 4', level: 'B1', prompt: 'I enjoy playing football.', reference: 'I enjoy playing football.', targets: ['enjoy + doing'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-ra-5', kind: 'read-aloud', title: 'Read Aloud 5', level: 'B1', prompt: 'If I had more time, I would study more English.', reference: 'If I had more time, I would study more English.', targets: ['Second'], topicTags: ['en.conditionals'] }),
  S({ id: 'en-spk-ra-6', kind: 'read-aloud', title: 'Read Aloud 6', level: 'B1', prompt: 'I am interested in music.', reference: 'I am interested in music.', targets: ['interested in'], topicTags: ['en.prepositions-collocations'] }),
  S({ id: 'en-spk-ra-7', kind: 'read-aloud', title: 'Read Aloud 7', level: 'B1', prompt: 'Do you know where the bank is?', reference: 'Do you know where the bank is?', targets: ['dolaylı soru'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-ra-8', kind: 'read-aloud', title: 'Read Aloud 8', level: 'B1', prompt: 'Pay attention to the teacher.', reference: 'Pay attention to the teacher.', targets: ['pay attention to'], topicTags: ['en.prepositions-collocations'] }),
  // shadowing (8)
  S({ id: 'en-spk-sh-1', kind: 'shadowing', title: 'Shadowing 1', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'I have lived here since 2020.', targets: ['since + başlangıç'], topicTags: ['en.present-perfect'], focusTags: ['pp-shadowing'] }),
  S({ id: 'en-spk-sh-2', kind: 'shadowing', title: 'Shadowing 2', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'They study in the library every evening.', targets: ['place before time'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-sh-3', kind: 'shadowing', title: 'Shadowing 3', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'By the time we arrived, the film had started.', targets: ['By the time'], topicTags: ['en.past-perfect'] }),
  S({ id: 'en-spk-sh-4', kind: 'shadowing', title: 'Shadowing 4', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'I look forward to seeing you.', targets: ['to + doing'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-sh-5', kind: 'shadowing', title: 'Shadowing 5', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'If I were you, I would go.', targets: ['If I were…'], topicTags: ['en.conditionals'] }),
  S({ id: 'en-spk-sh-6', kind: 'shadowing', title: 'Shadowing 6', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'I believe in myself.', targets: ['believe in'], topicTags: ['en.prepositions-collocations'] }),
  S({ id: 'en-spk-sh-7', kind: 'shadowing', title: 'Shadowing 7', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'Have you ever been to Germany?', targets: ['Have you ever…?'], topicTags: ['en.present-perfect'], focusTags: ['pp-shadowing'] }),
  S({ id: 'en-spk-sh-8', kind: 'shadowing', title: 'Shadowing 8', level: 'B1', prompt: 'Dinle ve tekrarla:', reference: 'I study English every day because I want to study abroad.', targets: ['because'], topicTags: ['en.sentence-structure'] }),
  // short answer (10) — haftanın grameriyle bağlı
  S({ id: 'en-spk-sa-1', kind: 'short-answer', title: 'How long…?', level: 'B1', prompt: 'How long have you studied English?', promptTr: 'Ne kadar süredir İngilizce çalışıyorsun?', sampleAnswer: 'I have studied English for three years.', targets: ['Present Perfect + for/since'], topicTags: ['en.present-perfect'], focusTags: ['pp-personal'] }),
  S({ id: 'en-spk-sa-2', kind: 'short-answer', title: 'Ever abroad?', level: 'B1', prompt: 'Have you ever travelled abroad?', promptTr: 'Hiç yurt dışına çıktın mı?', sampleAnswer: 'I have never travelled abroad, but I want to visit London.', targets: ['ever/never'], topicTags: ['en.present-perfect'], focusTags: ['pp-personal'] }),
  S({ id: 'en-spk-sa-3', kind: 'short-answer', title: 'Recently learned?', level: 'B1', prompt: 'What have you learned recently?', promptTr: 'Son zamanlarda ne öğrendin?', sampleAnswer: 'I have learned the Past Perfect. The film had started before we arrived.', targets: ['Present Perfect'], topicTags: ['en.present-perfect', 'en.past-perfect'], focusTags: ['pp-personal'] }),
  S({ id: 'en-spk-sa-4', kind: 'short-answer', title: 'Abroad dream?', level: 'B1', prompt: 'What would you do if you lived in another country?', promptTr: 'Başka ülkede yaşasaydın ne yapardın?', sampleAnswer: 'If I lived abroad, I would visit museums every day.', targets: ['Second'], topicTags: ['en.conditionals'], focusTags: ['second-conditional'] }),
  S({ id: 'en-spk-sa-5', kind: 'short-answer', title: 'Free time?', level: 'B1', prompt: 'What do you enjoy doing in your free time?', promptTr: 'Boş zamanında ne yapmaktan hoşlanırsın?', sampleAnswer: 'I enjoy playing football and reading books.', targets: ['enjoy + doing'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-sa-6', kind: 'short-answer', title: 'Future plan?', level: 'B1', prompt: 'What do you plan to do next year?', promptTr: 'Gelecek yıl ne yapmayı planlıyorsun?', sampleAnswer: 'I plan to study English every day and take an IELTS course.', targets: ['plan + to do'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-sa-7', kind: 'short-answer', title: 'Good at?', level: 'B1', prompt: 'What are you good at?', promptTr: 'Nede iyisin?', sampleAnswer: 'I am good at English and playing football.', targets: ['good at'], topicTags: ['en.prepositions-collocations'] }),
  S({ id: 'en-spk-sa-8', kind: 'short-answer', title: 'Bank?', level: 'B1', prompt: 'Do you know where the bank is? Answer and explain.', promptTr: 'Bankanın yerini tarif et.', sampleAnswer: 'The bank is next to the station. Do you know where the station is?', targets: ['dolaylı soru'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-sa-9', kind: 'short-answer', title: 'Yesterday late?', level: 'B1', prompt: 'Tell me about a time you were late. Use had.', promptTr: 'Geç kaldığın bir anı had ile anlat.', sampleAnswer: 'The bus had left before I arrived at the stop.', targets: ['had + V3'], topicTags: ['en.past-perfect'] }),
  S({ id: 'en-spk-sa-10', kind: 'short-answer', title: 'Free time wish?', level: 'B1', prompt: 'What would you do if you had more free time?', promptTr: 'Daha çok boş zamanın olsaydı?', sampleAnswer: 'If I had more free time, I would read books every day.', targets: ['Second'], topicTags: ['en.conditionals'], focusTags: ['second-conditional'] }),
  // topic speaking (6)
  S({ id: 'en-spk-tp-1', kind: 'topic', title: 'My Learning Journey (1 dk)', level: 'B1', prompt: 'Talk for 1 minute: how long, what you learned, what is difficult.', sampleAnswer: 'I have studied English for three years. I have learned many verbs. Listening is difficult, but I practise every day.', targets: ['for/since', 'but/however'], topicTags: ['en.present-perfect'] }),
  S({ id: 'en-spk-tp-2', kind: 'topic', title: 'My Daily Routine (1 dk)', level: 'B1', prompt: 'Talk for 1 minute about your daily routine (place + time).', sampleAnswer: 'I study in the library every evening. I play football in the park at the weekend.', targets: ['place before time'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-tp-3', kind: 'topic', title: 'A Late Day (1 dk)', level: 'B1', prompt: 'Talk about a day you were late (use had).', sampleAnswer: 'The bus had left before I arrived. By the time I got to school, the lesson had started.', targets: ['had + V3'], topicTags: ['en.past-perfect'] }),
  S({ id: 'en-spk-tp-4', kind: 'topic', title: 'My Hobbies (1 dk)', level: 'B1', prompt: 'Talk about hobbies with enjoy/plan/decide.', sampleAnswer: 'I enjoy playing football. I plan to learn the guitar. I decided to practise every day.', targets: ['gerund/infinitive'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-tp-5', kind: 'topic', title: 'My Dreams (1 dk)', level: 'B1', prompt: 'Talk about dreams with Second Conditional.', sampleAnswer: 'If I lived abroad, I would travel every weekend. If I had more money, I would buy a house.', targets: ['Second'], topicTags: ['en.conditionals'], focusTags: ['second-conditional'] }),
  S({ id: 'en-spk-tp-6', kind: 'topic', title: 'My Favourite Place (1 dk)', level: 'B1', prompt: 'Describe your favourite place with 3 collocations.', sampleAnswer: 'I am interested in books. I pay attention to new novels. The library is different from other places.', targets: ['collocations'], topicTags: ['en.prepositions-collocations'] }),
  // IELTS Part 1 (10)
  S({ id: 'en-spk-ielts-1', kind: 'ielts-part1', title: 'IELTS: Study', level: 'B1', prompt: 'Do you study or work?', sampleAnswer: 'I study computer science. I have studied for two years.', targets: ['Present Perfect'], topicTags: ['en.present-perfect'] }),
  S({ id: 'en-spk-ielts-2', kind: 'ielts-part1', title: 'IELTS: Hobbies', level: 'B1', prompt: 'What do you enjoy doing in your free time?', sampleAnswer: 'I enjoy playing football and reading books.', targets: ['enjoy + doing'], topicTags: ['en.gerund-infinitive'] }),
  S({ id: 'en-spk-ielts-3', kind: 'ielts-part1', title: 'IELTS: Home', level: 'B1', prompt: 'Describe your home. Where do you live?', sampleAnswer: 'I live in a flat in the city centre. I have lived there for three years.', targets: ['SVO', 'for/since'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-ielts-4', kind: 'ielts-part1', title: 'IELTS: Daily routine', level: 'B1', prompt: 'What is your daily routine?', sampleAnswer: 'I get up at seven. I study in the library every evening.', targets: ['place + time'], topicTags: ['en.sentence-structure'] }),
  S({ id: 'en-spk-ielts-5', kind: 'ielts-part1', title: 'IELTS: Technology', level: 'B1', prompt: 'How do you use technology to learn English?', sampleAnswer: 'I listen to lessons every day. I look forward to new videos.', targets: ['listen to'], topicTags: ['en.prepositions-collocations'] }),
  S({ id: 'en-spk-ielts-6', kind: 'ielts-part1', title: 'IELTS: English learning', level: 'B1', prompt: 'How long have you studied English?', sampleAnswer: 'I have studied English for three years.', targets: ['for + süre'], topicTags: ['en.present-perfect'] }),
  S({ id: 'en-spk-ielts-7', kind: 'ielts-part1', title: 'IELTS: Travel', level: 'B1', prompt: 'Have you ever travelled abroad?', sampleAnswer: 'I have never travelled abroad, but I want to visit London.', targets: ['ever/never'], topicTags: ['en.present-perfect'] }),
  S({ id: 'en-spk-ielts-8', kind: 'ielts-part1', title: 'IELTS: Dreams', level: 'B1', prompt: 'What would you do if you had more free time?', sampleAnswer: 'If I had more free time, I would travel.', targets: ['Second'], topicTags: ['en.conditionals'] }),
  S({ id: 'en-spk-ielts-9', kind: 'ielts-part1', title: 'IELTS: Past event', level: 'B1', prompt: 'Tell me about a late day. What had happened?', sampleAnswer: 'The bus had left before I arrived.', targets: ['had + V3'], topicTags: ['en.past-perfect'] }),
  S({ id: 'en-spk-ielts-10', kind: 'ielts-part1', title: 'IELTS: Future', level: 'B1', prompt: 'What do you plan to do next year?', sampleAnswer: 'I plan to take an IELTS course and study abroad.', targets: ['plan + to do'], topicTags: ['en.gerund-infinitive'] }),

  // Session B: Present Perfect gölgeleme (10 + sh-1, sh-7)
  ...([
    ["01", "I've lived here for three years.", ["for + süre"]],
    ["02", "She has worked here since January.", ["since + başlangıç"]],
    ["03", "I've never seen that film.", ["never + V3"]],
    ["04", "We've already eaten, thanks.", ["already"]],
    ["05", "I haven't finished my homework yet.", ["haven't … yet"]],
    ["06", "He's just left the office.", ["just"]],
    ["07", "How long have you studied English?", ["How long have you…?"]],
    ["08", "They've known each other since school.", ["since + başlangıç"]],
    ["09", "I've learned a lot of new words this week.", ["have + V3"]],
    ["10", "Has she ever been to Italy?", ["Has she ever…?"]],
  ] as Array<[string, string, string[]]>).map(([n, reference, targets]) => S({
    id: `en-spk-sh-pp-${n}`, kind: 'shadowing', title: `PP Shadowing ${Number(n)}`, level: 'B1',
    prompt: 'Dinle ve tekrarla:', reference, targets, topicTags: ['en.present-perfect'], focusTags: ['pp-shadowing'],
  })),
  // Session B: Present Perfect sesli okuma (8 + ra-1)
  ...([
    ["01", "I have worked here since 2022.", ["since"]],
    ["02", "She has never travelled by plane.", ["never"]],
    ["03", "We have already booked the tickets.", ["already"]],
    ["04", "Have you finished the report yet?", ["yet"]],
    ["05", "They have lived in this street for ten years.", ["for"]],
    ["06", "I have just read a very interesting article.", ["just"]],
    ["07", "He hasn't called me since Monday.", ["hasn't … since"]],
    ["08", "My brother has been to Spain twice.", ["been to"]],
  ] as Array<[string, string, string[]]>).map(([n, reference, targets]) => S({
    id: `en-spk-ra-pp-${n}`, kind: 'read-aloud', title: `PP Read Aloud ${Number(n)}`, level: 'B1',
    prompt: reference, reference, targets, topicTags: ['en.present-perfect'], focusTags: ['pp-read'],
  })),
  // Session B: kişisel Present Perfect soruları (7 + sa-1..3)
  ...([
    ["04", "What haven't you finished yet?", "Henüz neyi bitirmedin?", "I haven't finished my English homework yet. I haven't cleaned my room either.", ["haven't … yet"]],
    ["05", "What have you already done today?", "Bugün şimdiye kadar neler yaptın?", "I have already had breakfast and I have studied for an hour.", ["already", "have + V3"]],
    ["06", "How long have you lived in your city?", "Şehrinde ne kadar süredir yaşıyorsun?", "I have lived in my city for ten years. I have lived in the same flat since 2020.", ["for / since"]],
    ["07", "What is the most interesting place you have ever visited?", "Şimdiye kadar gittiğin en ilginç yer neresi?", "The most interesting place I have ever visited is Istanbul. I have been there three times.", ["ever", "have been"]],
    ["08", "Have you ever tried a new hobby? What was it?", "Hiç yeni bir hobi denedin mi?", "Yes, I have. I have tried photography. I have taken many photos this year.", ["Have you ever…?"]],
    ["09", "What new words have you learned this week?", "Bu hafta hangi yeni kelimeleri öğrendin?", "I have learned some useful words, for example collocation and depend on.", ["have learned"]],
    ["10", "What have you never done, but would like to try?", "Hiç yapmadığın ama denemek istediğin şey ne?", "I have never travelled by train across Europe, but I would like to try it.", ["have never"]],
  ] as Array<[string, string, string, string, string[]]>).map(([n, prompt, promptTr, sampleAnswer, targets]) => S({
    id: `en-spk-sa-pp-${n}`, kind: 'short-answer', title: `PP Soru ${Number(n)}`, level: 'B1',
    prompt, promptTr, sampleAnswer, targets, topicTags: ['en.present-perfect'], focusTags: ['pp-personal'],
  })),
  // Session F: Second Conditional konuşma (6 + sa-4, sa-10, tp-5)
  ...([
    ["01", "What would you buy if you had more money?", "Daha çok paran olsaydı ne alırdın?", "If I had more money, I would buy a new laptop. I would also save some for a trip."],
    ["02", "What would you do if you won a lot of money?", "Çok para kazansaydın ne yapardın?", "If I won a lot of money, I would travel around the world and help my family."],
    ["03", "Where would you live if you could live anywhere?", "Dilediğin yerde yaşayabilseydin nerede yaşardın?", "If I could live anywhere, I would live near the sea because I love the weather there."],
    ["04", "What would you change if you were the mayor of your city?", "Şehrinin belediye başkanı olsaydın neyi değiştirirdin?", "If I were the mayor, I would build more parks and improve public transport."],
    ["05", "What would you say if you met your favourite singer?", "En sevdiğin şarkıcıyla tanışsaydın ne söylerdin?", "If I met my favourite singer, I would say thank you for the music."],
    ["06", "If you could speak any language perfectly, which would you choose?", "Herhangi bir dili mükemmel konuşabilseydin hangisini seçerdin?", "If I could speak any language perfectly, I would choose Spanish because many people speak it."],
    ["07", "What would you do if you could travel anywhere tomorrow?", "Yarın istediğin yere seyahat edebilseydin ne yapardın?", "If I could travel anywhere tomorrow, I would go to Japan because I love the food."],
    ["08", "What would you do if you didn't have to work or study tomorrow?", "Yarın çalışmak ya da ders çalışmak zorunda olmasaydın ne yapardın?", "If I didn't have to study tomorrow, I would sleep late and then meet my friends."],
    ["09", "If you could meet any famous person, who would it be?", "Herhangi bir ünlüyle tanışabilseydin kim olurdu?", "If I could meet any famous person, I would choose a scientist and ask about her work."],
    ["10", "What would you do if you found a wallet on the street?", "Sokakta bir cüzdan bulsaydın ne yapardın?", "If I found a wallet on the street, I would take it to the police station."],
  ] as Array<[string, string, string, string]>).map(([n, prompt, promptTr, sampleAnswer]) => S({
    id: `en-spk-cond-${n}`, kind: 'short-answer', title: `Second Conditional ${Number(n)}`, level: 'B1',
    prompt, promptTr, sampleAnswer, targets: ['If + Past Simple', 'would + V1'], topicTags: ['en.conditionals'], focusTags: ['second-conditional'],
  })),
  // Session G: haftalık konuşma testi (6; ipucu yok)
  ...([
    ["01", "Have you ever tried to learn something difficult? What happened?", "Hiç zor bir şey öğrenmeye çalıştın mı? Ne oldu?", ['en.present-perfect']],
    ["02", "How long have you been studying English, and what is the hardest part for you?", "Ne zamandır İngilizce çalışıyorsun, senin için en zor kısmı ne?", ['en.present-perfect']],
    ["03", "What would you do if you had a completely free week?", "Tamamen boş bir haftan olsaydı ne yapardın?", ['en.conditionals']],
    ["04", "Tell me about your usual weekday, from the morning to the evening.", "Sıradan bir hafta içi gününü sabahtan akşama anlat.", ['en.sentence-structure']],
    ["05", "What do you enjoy doing, and what are you looking forward to this month?", "Ne yapmaktan hoşlanırsın ve bu ay neyi dört gözle bekliyorsun?", ['en.gerund-infinitive']],
    ["06", "Describe a time when you arrived late. What had already happened?", "Geç kaldığın bir anı anlat. Sen vardığında neler olmuştu?", ['en.past-perfect']],
  ] as Array<[string, string, string, string[]]>).map(([n, prompt, promptTr, topicTags]) => S({
    id: `en-spk-wt-${n}`, kind: 'short-answer', title: `Hafta Testi ${Number(n)}`, level: 'B1',
    prompt, promptTr, topicTags, focusTags: ['week1-test'],
  })),

  /* ---------------- Hafta 1 derinleştirme: gerçek konuşma çıktısı ---------------- */

  // Session B: ek gölgeleme (pp-shadowing → 16)
  ...([
    ["11", "I've been here since nine o'clock this morning.", ["since + başlangıç"]],
    ["12", "We haven't decided where to go yet.", ["haven't … yet"]],
    ["13", "She's already sent the email, so you don't need to worry.", ["already", "so"]],
    ["14", "Have you ever thought about studying abroad?", ["Have you ever…?"]],
  ] as Array<[string, string, string[]]>).map(([n, reference, targets]) => S({
    id: `en-spk-sh-pp-${n}`, kind: 'shadowing', title: `PP Shadowing ${Number(n)}`, level: 'B1',
    prompt: 'Dinle ve tekrarla:', reference, targets, topicTags: ['en.present-perfect'], focusTags: ['pp-shadowing'],
  })),
  // Session B: paragraf sesli okuma (cümle değil, bağlı metin)
  ...([
    ["p1", "I have lived in this city for almost ten years. I moved here when I was a student, and I have never wanted to leave. I have made a lot of friends, and I have found a job that I really enjoy. The city has changed a lot since I arrived, but it still feels like home."],
    ["p2", "My sister has just come back from Spain. She has been there three times, but this was her first visit to the south. She has brought presents for everyone, and she hasn't stopped talking about the food. I have never been abroad, so I have decided to go with her next year."],
    ["p3", "I have studied English since primary school, but I haven't always enjoyed it. For a long time I only learned grammar rules. Recently I have started to listen to podcasts and to speak with other learners online. My listening has already improved, and I haven't felt so motivated for years."],
  ] as Array<[string, string]>).map(([n, reference], index) => S({
    id: `en-spk-ra-pp-${n}`, kind: 'read-aloud', title: `PP Paragraf ${index + 1}`, level: 'B1',
    prompt: reference, reference, targets: ['bağlı metin', 'have/has + V3 vurgusu'], topicTags: ['en.present-perfect'], focusTags: ['pp-read'],
  })),
  // Session B: ek kişisel sorular (pp-personal → 14)
  ...([
    ["11", "What is the best film or series you have seen this year? Why?", "Bu yıl izlediğin en iyi film ya da dizi hangisi? Neden?", "The best series I have seen this year is a crime drama. I have watched every episode twice because the story is so clever.", ["have seen", "because"]],
    ["12", "Have you ever lost something important? What happened?", "Hiç önemli bir şeyini kaybettin mi? Ne oldu?", "Yes, I have. I have lost my wallet once. I left it on a bus, but someone found it and called me.", ["Have you ever…?", "Present Perfect → Past Simple geçişi"]],
    ["13", "How has your life changed since you started studying English seriously?", "İngilizceye ciddi çalışmaya başladığından beri hayatın nasıl değişti?", "Since I started studying seriously, I have become more confident. I have started to watch videos without subtitles.", ["since + cümle", "have become"]],
    ["14", "What haven't you done for a long time that you would like to do again?", "Uzun süredir yapmadığın ama yeniden yapmak istediğin şey ne?", "I haven't played basketball for two years. I would like to play again because I miss my team.", ["haven't … for", "would like to"]],
  ] as Array<[string, string, string, string, string[]]>).map(([n, prompt, promptTr, sampleAnswer, targets]) => S({
    id: `en-spk-sa-pp-${n}`, kind: 'short-answer', title: `PP Soru ${Number(n)}`, level: 'B1',
    prompt, promptTr, sampleAnswer, targets, topicTags: ['en.present-perfect'], focusTags: ['pp-personal'],
  })),
  // Session A: Present Perfect mini monologlar (60–90 sn)
  ...([
    ["01", "My English so far", "Talk about your English so far.", "Şimdiye kadarki İngilizce serüvenini anlat.", ["How long have you studied English?", "What have you learned well?", "What haven't you learned yet?", "What have you done recently to improve?"]],
    ["02", "A place I have visited", "Talk about a place you have visited more than once.", "Birden fazla kez gittiğin bir yeri anlat.", ["Where is it and how many times have you been there?", "What have you seen or done there?", "What has changed since your first visit?", "Would you go again?"]],
    ["03", "This year in my life", "Talk about what you have done this year.", "Bu yıl neler yaptığını anlat.", ["Something you have already done", "Something you haven't done yet", "Something you have just started", "Something you have never tried"]],
  ] as Array<[string, string, string, string, string[]]>).map(([n, title, prompt, promptTr, points]) => S({
    id: `en-spk-mono-pp-${n}`, kind: 'topic', title: `${title} (60–90 sn)`, level: 'B1',
    prompt, promptTr, points, seconds: 75, targets: ['have/has + V3', 'for / since', 'already / yet / just / never'],
    topicTags: ['en.present-perfect'], focusTags: ['pp-monologue'],
  })),
  // Session B: uzun konuşma (IELTS Part 2 tarzı kart, 1,5–2 dk)
  ...([
    ["01", "A skill I have learned", "Describe a skill you have learned.", "Öğrendiğin bir beceriyi anlat.", ["what the skill is", "how long you have had it and how you learned it", "what you have done with it", "and explain why it is useful for you"]],
    ["02", "A person I have known for a long time", "Describe a person you have known for a long time.", "Uzun süredir tanıdığın birini anlat.", ["who the person is", "how long you have known them and how you met", "what you have done together", "and explain why this person is important to you"]],
  ] as Array<[string, string, string, string, string[]]>).map(([n, title, prompt, promptTr, points]) => S({
    id: `en-spk-long-pp-${n}`, kind: 'topic', title: `${title} (1,5–2 dk)`, level: 'B1',
    prompt, promptTr, points, seconds: 105, targets: ['Present Perfect', 'because / so / but'],
    topicTags: ['en.present-perfect'], focusTags: ['pp-long-turn'],
  })),
  // Session D: Past Perfect + Gerund/Infinitive konuşma
  ...([
    ["01", "Think of a time you arrived somewhere late. What had already happened?", "Bir yere geç kaldığın bir anı düşün. Sen vardığında ne olmuştu?", "When I arrived at the station, the train had already left, so I had to wait for an hour.", ["had already + V3"], ['en.past-perfect']],
    ["02", "Before you started school, what had you already learned to do?", "Okula başlamadan önce ne yapmayı öğrenmiştin?", "Before I started school, I had already learned to read a little, but I had never written a full sentence.", ["Before + Past Simple, had + V3"], ['en.past-perfect']],
    ["03", "Tell me about a surprise: something had changed when you came back.", "Bir sürprizi anlat: geri döndüğünde bir şey değişmişti.", "When I came back from holiday, my neighbours had painted their house bright yellow.", ["had + V3"], ['en.past-perfect']],
    ["04", "What had you never done before you were fifteen?", "On beş yaşından önce hiç yapmadığın şey neydi?", "I had never travelled by plane before I was fifteen. I had never been abroad either.", ["had never + V3"], ['en.past-perfect']],
    ["05", "What do you enjoy doing at the weekend, and what do you avoid doing?", "Hafta sonu ne yapmaktan hoşlanırsın, neyi yapmaktan kaçınırsın?", "I enjoy cooking for my friends at the weekend, but I avoid working on Sundays.", ["enjoy + doing", "avoid + doing"], ['en.gerund-infinitive']],
    ["06", "What have you decided to do this month, and what do you hope to finish?", "Bu ay ne yapmaya karar verdin, neyi bitirmeyi umuyorsun?", "I have decided to study for an hour every day, and I hope to finish my grammar book.", ["decide + to do", "hope + to do"], ['en.gerund-infinitive']],
    ["07", "What are you looking forward to doing this year?", "Bu yıl neyi dört gözle bekliyorsun?", "I am looking forward to visiting my cousins in the summer and to starting a new course.", ["look forward to + doing"], ['en.gerund-infinitive']],
    ["08", "Is there something you keep forgetting to do? What do you plan to do about it?", "Sürekli yapmayı unuttuğun bir şey var mı? Bu konuda ne yapmayı planlıyorsun?", "I keep forgetting to call my grandmother, so I plan to set a reminder on my phone.", ["keep + doing", "forget / plan + to do"], ['en.gerund-infinitive']],
  ] as Array<[string, string, string, string, string[], string[]]>).map(([n, prompt, promptTr, sampleAnswer, targets, topicTags]) => S({
    id: `en-spk-d-${n}`, kind: 'short-answer', title: `Session D Soru ${Number(n)}`, level: 'B1',
    prompt, promptTr, sampleAnswer, targets, topicTags, focusTags: ['ppf-gi'],
  })),
  S({
    id: 'en-spk-d-mono-01', kind: 'topic', title: 'A day when everything went wrong (60–90 sn)', level: 'B1',
    prompt: 'Tell the story of a day when everything went wrong.', promptTr: 'Her şeyin ters gittiği bir günün hikâyesini anlat.',
    points: ['What had you planned to do?', 'What had already happened before you noticed the problem?', 'What did you decide to do?', 'What do you avoid doing now?'],
    seconds: 75, targets: ['had + V3', 'decide to / avoid + doing'], topicTags: ['en.past-perfect', 'en.gerund-infinitive'], focusTags: ['ppf-gi'],
  }),
  // Session E: okuduğunu anlat (pasajlara dönmeden, aklında kalanla)
  ...([
    ["01", "Green roofs: explain the idea", "Explain what a green roof is and why some cities want more of them. Then give one argument against them.", "Yeşil çatının ne olduğunu ve şehirlerin neden istediğini anlat; sonra bir karşı argüman ver.", ["What is a green roof?", "Two benefits (heat, rain)", "What do critics say?", "Your opinion: would it work in your city?"]],
    ["02", "Learning a language as an adult: give advice", "Using the ideas from the passage, give advice to an adult who is starting to learn English.", "Pasajdaki fikirlerle, İngilizceye yeni başlayan bir yetişkine tavsiye ver.", ["Is age the main problem?", "How often and how long to study", "Words or chunks?", "What to do about mistakes"]],
  ] as Array<[string, string, string, string, string[]]>).map(([n, title, prompt, promptTr, points]) => S({
    id: `en-spk-read-${n}`, kind: 'topic', title: `${title} (60–90 sn)`, level: 'B1+',
    prompt, promptTr, points, seconds: 80, targets: ['pasajdaki fikirleri kendi cümlelerinle', 'because / however / so'],
    topicTags: ['en.sentence-structure'], focusTags: ['reading-talk'],
  })),
  // Session G: haftalık test — uzun konuşma (ipucu yok; yalnızca kart)
  ...([
    ["07", "Describe something you have learned to do that you are proud of. You should say what it is, how you learned it, what had been difficult before, and what you would do next if you had more time.", "Öğrendiğin ve gurur duyduğun bir şeyi anlat (1,5–2 dk).", ['en.present-perfect', 'en.past-perfect', 'en.conditionals']],
    ["08", "Describe a plan for your future. You should say what you want to do, what you have already done about it, what you are looking forward to, and what you would change if you could.", "Geleceğe dair bir planını anlat (1,5–2 dk).", ['en.gerund-infinitive', 'en.present-perfect', 'en.conditionals']],
  ] as Array<[string, string, string, string[]]>).map(([n, prompt, promptTr, topicTags]) => S({
    id: `en-spk-wt-${n}`, kind: 'topic', title: `Hafta Testi ${Number(n)} — uzun konuşma`, level: 'B1',
    prompt, promptTr, seconds: 105, topicTags, focusTags: ['week1-test'],
  })),
];

export const EN_SPEAKING_BY_ID = new Map(EN_SPEAKING_PROMPTS.map((p) => [p.id, p]));

export const EN_SPEAKING_FOCUS_TAGS: string[] = [
  ...new Set(EN_SPEAKING_PROMPTS.flatMap((p) => p.focusTags ?? [])),
];

/**
 * Konu + tür + odak kesişimi (Speaking ekranı ve haftalık plan denetimi
 * AYNI süzgeci kullanır).
 */
export function speakingPool(scope: { topicId?: string; kind?: SpeakingKind; focus?: string }): SpeakingPrompt[] {
  return EN_SPEAKING_PROMPTS.filter(
    (prompt) =>
      (!scope.topicId || prompt.topicTags.includes(scope.topicId)) &&
      (!scope.focus || (prompt.focusTags ?? []).includes(scope.focus)) &&
      (!scope.kind || prompt.kind === scope.kind),
  );
}
