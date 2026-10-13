/**
 * Hafta 1 — GERÇEK (insan sesi) dış dinleme görevleri.
 *
 * Kaynaklar British Council LearnEnglish B1 dinleme sayfalarıdır. Ses ve
 * transkript KOPYALANMAZ: uygulama yalnızca orijinal sayfaya bağlantı verir
 * (gömme izni belirtilmediği için gömme yok) ve buradaki tüm sorular özgündür.
 *
 * Doğrulama (11.10.2026, sayfalar tek tek açılıp transkript okunarak):
 *   - URL açılıyor, başlık ve B1 seviye etiketi sayfada yazıyor,
 *   - transkript sayfada mevcut; sorular transkriptteki olgulara dayanır.
 * Doğrulanamayan: sayfalar ses SÜRESİNİ yazmıyor. Bu yüzden `mediaSeconds`
 * `null` kalır; iş yükü modeli süreyi transkript kelime sayısından TAHMİN eder
 * (`estimatedMediaSeconds`) ve arayüz bunu "tahmini" diye gösterir.
 * Bağlantıların canlılığı normal test paketinde ağ çağrısıyla sınanmaz;
 * `scripts/verify-week-resources.ts` elle çalıştırılır.
 */

export type ExternalQuestionType = 'mc' | 'tf' | 'short';

export interface ExternalQuestion {
  id: string;
  type: ExternalQuestionType;
  prompt: string;
  options?: string[];
  answer: string;
  acceptedAnswers?: string[];
  /** Cevap sonrası Türkçe açıklama (transkriptten alıntı değildir). */
  explanation: string;
}

export interface ExternalListeningTask {
  /** Kararlı kimlik: `en-lx-<kısa-ad>`. */
  id: string;
  title: string;
  provider: string;
  url: string;
  level: string;
  /** Sayfadaki transkriptin yaklaşık kelime sayısı (konuşmacı etiketleri hariç). */
  transcriptWords: number;
  /** Sağlayıcının yazdığı gerçek süre (sn). Sayfada yoksa `null` — uydurulmaz. */
  mediaSeconds: number | null;
  /** Kaynağın en son elle doğrulandığı gün. */
  verifiedOn: string;
  topicTags: string[];
  /** Görevin tek cümlelik Türkçe tanımı. */
  about: string;
  /** Dinlemeden önce düşünülecek sorular. */
  prep: string[];
  /** 1. dinleme: genel fikir. */
  gist: ExternalQuestion[];
  /** 2. dinleme: ayrıntı. */
  detail: ExternalQuestion[];
  /** Bu konuyu anlatırken işe yarayan öbekler (öğrenci seçerse kelime sistemine girer). */
  chunks: Array<{ en: string; tr: string }>;
  speaking: { prompt: string; promptTr: string; points: string[]; seconds: number };
  writing: { prompt: string; promptTr: string; minWords: number; maxWords: number };
}

/** Doğal konuşma hızı varsayımı (kelime/dk) — yalnızca süre sayfada yoksa kullanılır. */
export const ASSUMED_SPEECH_WPM = 150;

/** Sağlayıcı süresi varsa o; yoksa transkript uzunluğundan tahmin. */
export function estimatedMediaSeconds(task: ExternalListeningTask): number {
  return task.mediaSeconds ?? Math.round((task.transcriptWords / ASSUMED_SPEECH_WPM) * 60);
}

const TF = ['True', 'False'];
const BC = 'British Council LearnEnglish';
const base = 'https://learnenglish.britishcouncil.org/free-resources/listening/b1';
const VERIFIED = '2026-10-11';

type Q = [type: ExternalQuestionType, prompt: string, answer: string, explanation: string, extra?: string[]];

/** `mc`: extra = çeldiriciler; `short`: extra = kabul edilen diğer yazımlar. */
function qs(taskId: string, stage: 'g' | 'd', rows: Q[]): ExternalQuestion[] {
  return rows.map(([type, prompt, answer, explanation, extra], index) => ({
    id: `${taskId}-${stage}${index + 1}`,
    type,
    prompt,
    answer,
    explanation,
    ...(type === 'mc' ? { options: [answer, ...(extra ?? [])] } : {}),
    ...(type === 'tf' ? { options: TF } : {}),
    ...(type === 'short' && extra ? { acceptedAnswers: extra } : {}),
  }));
}

export const EN_EXTERNAL_LISTENING: ExternalListeningTask[] = [
  {
    id: 'en-lx-old-friend', title: 'Meeting an old friend', provider: BC, url: `${base}/meeting-old-friend`, level: 'B1',
    transcriptWords: 240, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.present-perfect'],
    about: 'Yıllardır görüşmeyen iki arkadaş tesadüfen karşılaşır ve hayatlarında neler değiştiğini anlatır.',
    prep: [
      'Uzun süredir görmediğin bir arkadaşınla karşılaşsan ilk ne sorardın?',
      'Son yıllarda hayatında neler değişti? (şehir, iş, okul) — İngilizce 2 cümle düşün.',
      '“It didn’t work out” ne anlama gelebilir? Tahmin et, dinlerken kontrol et.',
    ],
    gist: qs('en-lx-old-friend', 'g', [
      ['mc', 'What is happening in this conversation?', 'Two old friends meet by chance and catch up.', 'Selina, Patrick’i tanır; yıllar sonra tesadüfen karşılaşıp hâl hatır sorarlar.', ['Two colleagues are planning a work trip.', 'A woman is interviewing a man for a job.', 'Two strangers are asking for directions.']],
      ['mc', 'How does Selina react to Patrick’s news about his family?', 'She is surprised, and happy for him.', 'Şaşırır, zamanın hızına hayret eder ve onun adına sevinir.', ['She is angry that he did not tell her.', 'She already knew everything.', 'She is not interested.']],
    ]),
    detail: qs('en-lx-old-friend', 'd', [
      ['mc', 'How long is it since they last saw each other?', 'At least fifteen years', 'En az on beş yıldır görüşmemişler: “haven’t seen each other for …”.', ['About five years', 'Exactly ten years', 'More than twenty years']],
      ['tf', 'Selina still lives in London.', 'False', 'Londra’da birkaç yıl yaşadı ama geri döndü.'],
      ['mc', 'Why did London not work out for Selina?', 'The job was not what she had hoped for, and the city was expensive.', '“Hayalindeki iş” öyle çıkmadı; Londra — özellikle kira — çok pahalıydı.', ['She could not find any job at all.', 'She did not like the weather.', 'Her family asked her to come back.']],
      ['short', 'Who does Selina live with now? (two or three words)', 'with her parents', 'Yaklaşık beş ay önce geri taşındı ve ailesiyle yaşıyor.', ['her parents', 'with parents', 'parents', 'with her mum and dad']],
      ['tf', 'Patrick has lived in several different towns.', 'False', 'Patrick kasabadan hiç ayrılmamış: “has never left”.'],
      ['mc', 'Which wedding anniversary has Patrick just celebrated?', 'His tenth', 'Evliliğinin onuncu yılını yeni kutlamış (has just celebrated).', ['His first', 'His fifth', 'His fifteenth']],
      ['short', 'How many children does Patrick have? (one word)', 'two', 'İki çocuğu var.', ['2', 'two children']],
      ['mc', 'How old are Patrick’s children?', 'Five and eight', 'Çocuklar beş ve sekiz yaşında.', ['Three and six', 'Eight and ten', 'Two and five']],
      ['mc', 'What do they agree to do at the end?', 'Exchange phone numbers so that Selina can visit.', 'Patrick onu evine davet eder; numaralarını alıp verirler.', ['Have lunch together immediately.', 'Travel to London next month.', 'Meet again in fifteen years.']],
    ]),
    chunks: [
      { en: 'catch up with a friend', tr: 'bir arkadaşla hasret gidermek' },
      { en: 'it didn’t work out', tr: 'yolunda gitmedi, olmadı' },
      { en: 'move back', tr: 'geri taşınmak' },
      { en: 'keep in touch', tr: 'iletişimi sürdürmek' },
      { en: 'time flies', tr: 'zaman su gibi akıyor' },
      { en: 'celebrate an anniversary', tr: 'yıl dönümü kutlamak' },
    ],
    speaking: {
      prompt: 'Retell the conversation in your own words, then say whether you keep in touch with old friends.',
      promptTr: 'Konuşmayı kendi cümlelerinle anlat; sonra eski arkadaşlarınla görüşüp görüşmediğini söyle.',
      points: ['Who are the two people and how long is it since they met?', 'What has happened in Selina’s life?', 'What has happened in Patrick’s life?', 'You: Have you kept in touch with old friends?'],
      seconds: 75,
    },
    writing: {
      prompt: 'Write about an old friend you haven’t seen for a long time. What has changed in your life since then? Use the Present Perfect at least twice.',
      promptTr: 'Uzun süredir görmediğin bir arkadaşını yaz. O zamandan beri hayatında ne değişti? En az iki Present Perfect cümlesi kullan.',
      minWords: 50, maxWords: 80,
    },
  },
  {
    id: 'en-lx-listening-skills', title: 'An interview about listening skills', provider: BC, url: `${base}/interview-about-listening-skills`, level: 'B1',
    transcriptWords: 410, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.present-perfect', 'en.sentence-structure'],
    about: 'Bir sunucu, üniversitede İngilizce öğreten Gabriella ile dinlemenin neden zor olduğunu ve iki pratik stratejiyi konuşur.',
    prep: [
      'Senin için hangisi daha zor: dinleme mi, konuşma mı? Neden?',
      'Birini anlamadığında ne yaparsın? İngilizce bir cümleyle söylemeyi dene.',
      '“My mind goes blank” ne demek olabilir? Dinlerken bağlamdan çıkar.',
    ],
    gist: qs('en-lx-listening-skills', 'g', [
      ['mc', 'What is the interview mainly about?', 'Why listening is difficult and what you can do in real conversations.', 'Konu: dinlemenin zorluğu ve gerçek hayatta işe yarayan stratejiler.', ['How to pass a German grammar exam.', 'The history of language teaching in Leeds.', 'Why speaking is the hardest skill.']],
      ['mc', 'What is Gabriella’s job?', 'She teaches English at a university.', 'Gabriella, Leeds’te bir üniversitede İngilizce öğretmeni.', ['She is a radio presenter.', 'She works in a bank.', 'She writes exam papers for the government.']],
    ]),
    detail: qs('en-lx-listening-skills', 'd', [
      ['mc', 'Which skill does the presenter say is his weakest?', 'Listening', 'Sunucu en zayıf becerisinin dinleme olduğunu söyler.', ['Speaking', 'Reading', 'Writing']],
      ['short', 'Which language is the presenter learning? (one word)', 'German', 'B1 düzeyinde Almancası var.', ['german language']],
      ['mc', 'Why does he find speaking less stressful than listening?', 'Because he controls what he says.', 'Konuşurken ne söyleyeceğini kendisi belirler; dinlerken hız karşı taraftadır.', ['Because he speaks very fast.', 'Because nobody corrects him.', 'Because he only speaks to friends.']],
      ['tf', 'According to Gabriella, most people get better exam results in listening than in speaking.', 'False', 'Tam tersi: çoğu kişi konuşmada dinlemeden daha iyi sonuç alır.'],
      ['mc', 'Why is listening in an exam different from real life?', 'You cannot ask the speaker to repeat or explain.', 'Sınavda tekrar ya da açıklama isteyemezsin; kayıt bir ya da iki kez çalınır.', ['The speakers always talk more slowly.', 'You can read the transcript first.', 'The topics are always about work.']],
      ['tf', 'The presenter says that asking people to repeat makes him feel foolish.', 'True', 'Tekrar istemek onu aptal gibi hissettirir; aynı hızda tekrar da çoğu zaman yardımcı olmaz.'],
      ['mc', 'When is “pretending to understand” a risky strategy?', 'When the information is important, for example at a bank or a government office.', 'Otobüs durağındaki sohbette sorun olmaz; bankada ya da resmî dairede bilgi önemlidir.', ['When you are talking to a stranger at a bus stop.', 'When you are watching a film.', 'When the speaker is a teacher.']],
      ['mc', 'What is the second strategy Gabriella recommends?', 'Summarise what you heard and turn it into a question.', 'Duyduğunu özetleyip soruya çevir: “So first I need to …, is that right?”', ['Ask the person to write everything down.', 'Record the conversation on your phone.', 'Change the subject quickly.']],
    ]),
    chunks: [
      { en: 'my mind goes blank', tr: 'aklım duruyor, kafam boşalıyor' },
      { en: 'ask someone to repeat', tr: 'birinden tekrar etmesini istemek' },
      { en: 'pretend to understand', tr: 'anlamış gibi yapmak' },
      { en: 'summarise what you heard', tr: 'duyduğunu özetlemek' },
      { en: 'is that right?', tr: 'doğru mu (anladım)?' },
      { en: 'keep control of the conversation', tr: 'konuşmanın kontrolünü elde tutmak' },
    ],
    speaking: {
      prompt: 'Explain the two strategies from the interview and say which one you use when you don’t understand someone.',
      promptTr: 'Röportajdaki iki stratejiyi açıkla; birini anlamadığında hangisini kullandığını söyle.',
      points: ['Why is listening hard for the presenter?', 'Strategy 1 and when it is risky', 'Strategy 2 with an example question', 'Your own habit'],
      seconds: 90,
    },
    writing: {
      prompt: 'What do you do when you don’t understand someone who is speaking English? Describe one real situation and what you will try next time.',
      promptTr: 'İngilizce konuşan birini anlamadığında ne yapıyorsun? Gerçek bir durumu ve bir dahaki sefere ne deneyeceğini yaz.',
      minWords: 60, maxWords: 90,
    },
  },
  {
    id: 'en-lx-work-life', title: 'Work–life balance', provider: BC, url: `${base}/work-life-balance`, level: 'B1',
    transcriptWords: 370, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.sentence-structure', 'en.prepositions-collocations'],
    about: 'Bir radyo röportajı: yazar Chris Svensson, teknolojinin iş ve özel hayat arasındaki sınırı nasıl değiştirdiğini anlatır.',
    prep: [
      'Akşamları ya da hafta sonu iş/okul mesajlarına bakar mısın?',
      '“Nine to five” ifadesi sence neyi anlatır?',
      'Esnek çalışmanın bir iyi, bir kötü yanını İngilizce düşün.',
    ],
    gist: qs('en-lx-work-life', 'g', [
      ['mc', 'What is the interview mainly about?', 'How technology has changed the line between work and private life.', 'Ana fikir: telefon ve dizüstü bilgisayar iş ile özel hayatın sınırını bulanıklaştırdı.', ['How to find a better-paid job.', 'Why people should stop using email.', 'The best hobbies for the weekend.']],
      ['mc', 'What is Chris’s overall opinion?', 'There are problems, but people also have more flexibility.', 'Chris sakıncayı kabul eder ama esnekliğin avantaj olduğunu söyler.', ['Modern working life is completely negative.', 'Nothing has really changed.', 'Everybody should work from nine to five again.']],
    ]),
    detail: qs('en-lx-work-life', 'd', [
      ['mc', 'Who is Chris Svensson?', 'The author of a book about work–life balance.', 'Chris, çok satan bir kitabın yazarı.', ['A manager at a phone company.', 'A doctor who studies sleep.', 'The presenter of the programme.']],
      ['mc', 'What is his book called?', 'No more nine to five', 'Kitabın adı: “No more nine to five”.', ['Working from home', 'The overtime problem', 'Balance your day']],
      ['mc', 'In a traditional workplace, when did people usually work?', 'From nine until five or six', 'Geleneksel düzende mesai dokuzdan beşe ya da altıya kadardı.', ['From seven until three', 'Only in the afternoon', 'From nine until nine']],
      ['short', 'What was it called when people stayed late at work? (one or two words)', 'overtime', 'Geç saate kalmak “working overtime” olarak adlandırılır.', ['working overtime', 'over time']],
      ['tf', 'In traditional workplaces, people often worked at weekends.', 'False', 'Hafta sonu ya da tatilde çalışmak alışılmış değildi.'],
      ['mc', 'What has changed, according to Chris?', 'Most people can read work email on their phones.', 'İş e-postasına telefondan ulaşılabildiği için akşam ve hafta sonu da cevap veriliyor.', ['Offices are open for longer hours.', 'Holidays have become shorter by law.', 'People no longer use laptops.']],
      ['tf', 'The presenter says this sounds more like “all work” than balance.', 'True', 'Sunucu bunun dengeden çok “hep iş” gibi göründüğünü söyler.'],
      ['mc', 'Which advantage does Chris give as an example?', 'You can leave early to be with your family and finish the work later.', 'Erken çıkıp ailenle vakit geçirir, işi sonra evden tamamlarsın.', ['You get a higher salary.', 'You never have to answer email.', 'You can take longer holidays.']],
    ]),
    chunks: [
      { en: 'work–life balance', tr: 'iş-özel hayat dengesi' },
      { en: 'work overtime', tr: 'fazla mesai yapmak' },
      { en: 'work from home', tr: 'evden çalışmak' },
      { en: 'catch up on work', tr: 'biriken işi yetiştirmek' },
      { en: 'reply to an email', tr: 'e-postaya cevap vermek' },
      { en: 'spend time with family', tr: 'aileyle vakit geçirmek' },
    ],
    speaking: {
      prompt: 'Explain how working life has changed according to Chris, then describe your own balance between study or work and free time.',
      promptTr: 'Chris’e göre çalışma hayatı nasıl değişti? Sonra kendi iş/okul ve boş zaman dengeni anlat.',
      points: ['Traditional workplaces: hours, weekends', 'What phones and laptops have changed', 'One advantage and one disadvantage', 'Your own routine'],
      seconds: 90,
    },
    writing: {
      prompt: 'How do you balance study or work and free time? Give one thing that works for you and one thing you would like to change.',
      promptTr: 'Ders/iş ile boş zamanını nasıl dengeliyorsun? İşe yarayan bir şeyi ve değiştirmek istediğin bir şeyi yaz.',
      minWords: 60, maxWords: 90,
    },
  },
  {
    id: 'en-lx-late-class', title: 'Arriving late to class', provider: BC, url: `${base}/arriving-late-class`, level: 'B1',
    transcriptWords: 265, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.sentence-structure', 'en.past-perfect'],
    about: 'Derse geç gelen bir öğrenci yanındakine fısıldayarak sorular sorar — ve sonunda bir sürpriz ortaya çıkar.',
    prep: [
      'Derse geç kalınca yanındakine İngilizce ne sorardın? (2 soru kur)',
      '“What have we missed?” — bu soruda hangi zaman kullanılmış?',
      'Dinlerken şuna odaklan: hangi ders, hangi sayfa, hangi gün?',
    ],
    gist: qs('en-lx-late-class', 'g', [
      ['mc', 'Where are the speakers?', 'In a lecture, whispering while the lecturer is talking.', 'İki öğrenci ders sırasında fısıldaşarak konuşuyor.', ['In a café after class.', 'In a library, studying for a test.', 'On the phone.']],
      ['mc', 'What does the late student discover at the end?', 'He is in the wrong class.', 'Yanlış derse girmiştir.', ['He has lost his phone.', 'The lecture has been cancelled.', 'He has failed the mid-term test.']],
    ]),
    detail: qs('en-lx-late-class', 'd', [
      ['mc', 'How long ago did the lecturer start?', 'About five minutes ago', 'Hoca yaklaşık beş dakika önce başlamış.', ['About half an hour ago', 'One hour ago', 'She has not started yet']],
      ['mc', 'When will the students get their mid-term tests back?', 'Next Tuesday', 'Sınavlar gelecek salı dağıtılacak; öğrenci günü duymayıp tekrar sorar.', ['This Thursday', 'Next Monday', 'At the end of term']],
      ['short', 'Which page is the class on? (number)', '34', 'Sınıf 34. sayfada.', ['thirty-four', 'thirty four', 'page 34']],
      ['tf', 'The late student has brought his textbook.', 'False', 'Kitabı yoktur; yanındakinin kitabına birlikte bakmak ister.'],
      ['mc', 'What does “SEO” stand for?', 'Search engine optimisation', 'SEO = search engine optimisation: internet aramalarında görünür olmak.', ['Software engineering office', 'Student examination order', 'Simple early outline']],
      ['tf', 'The lecturer had already explained “SEO” before the late student arrived.', 'True', 'Hoca terimi o gelmeden açıklamıştı — Past Perfect ile anlatılan “önce olan” olay.'],
      ['mc', 'What is this class really about?', 'Software engineering', 'Ders yazılım mühendisliği dersidir.', ['Early American History', 'Marketing', 'English literature']],
      ['short', 'Which class was the late student looking for? (three words)', 'Early American History', 'Amerikan Devrimi’ni sorması bundandır.', ['american history', 'early american history class', 'history']],
    ]),
    chunks: [
      { en: 'What have we missed?', tr: 'Ne kaçırdık?' },
      { en: 'get the tests back', tr: 'sınav kâğıtlarını geri almak' },
      { en: 'share a textbook', tr: 'ders kitabını paylaşmak' },
      { en: 'What does … mean?', tr: '… ne demek?' },
      { en: 'follow the lecture', tr: 'dersi takip etmek' },
      { en: 'be in the wrong class', tr: 'yanlış derste olmak' },
    ],
    speaking: {
      prompt: 'Tell the story of the late student from beginning to end. Use past tenses, and at least one sentence with “had”.',
      promptTr: 'Geç kalan öğrencinin hikâyesini baştan sona anlat. Geçmiş zaman kullan; en az bir “had + V3” cümlesi kur.',
      points: ['He arrived late — what had already happened?', 'What did he ask about?', 'What did he not understand?', 'How did it end?'],
      seconds: 75,
    },
    writing: {
      prompt: 'Write about a time when you were late or in the wrong place. What had already happened when you arrived?',
      promptTr: 'Geç kaldığın ya da yanlış yerde olduğun bir anı yaz. Sen vardığında neler olmuştu?',
      minWords: 50, maxWords: 80,
    },
  },
  {
    id: 'en-lx-lecture-intro', title: 'An introduction to a lecture', provider: BC, url: `${base}/introduction-lecture`, level: 'B1',
    transcriptWords: 420, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.sentence-structure', 'en.gerund-infinitive'],
    about: 'Bir pozitif psikoloji dersinin açılışı: mutlu bir hayat nedir ve “flow” (akış) kuramı ne söyler?',
    prep: [
      'Sence mutlu bir hayatı ne mutlu yapar? İngilizce 2 fikir yaz.',
      'Bir işe dalıp zamanın nasıl geçtiğini anlamadığın oldu mu?',
      'Üniversite dersleri çoğu zaman bir “yol haritası” ile başlar: dinlerken dersin kalan kısmında neler anlatılacağını not et.',
    ],
    gist: qs('en-lx-lecture-intro', 'g', [
      ['mc', 'What course is this lecture part of?', 'Positive Psychology', 'Yeni bir Pozitif Psikoloji dersinin ilk dersi.', ['Art History', 'Business Management', 'Sports Science']],
      ['mc', 'What is the main idea of the introduction?', 'People are happiest when they are completely absorbed in what they are doing.', 'Akış kuramı: yaptığın işe tamamen daldığında en mutlu anlarını yaşarsın.', ['Happiness depends mostly on money.', 'Artists are happier than other people.', 'Psychology cannot explain happiness.']],
    ]),
    detail: qs('en-lx-lecture-intro', 'd', [
      ['tf', 'This is the first lecture of the course.', 'True', 'Konuşmacı öğrencileri yeni dersin ilk dersine karşılar.'],
      ['tf', 'The speaker says psychology is only about people’s problems.', 'False', 'Psikoloji yalnızca sorunlarla ilgili değildir; pozitif psikoloji mutluluğa odaklanır.'],
      ['mc', 'Whose work is the lecture based on?', 'Mihaly Csikszentmihalyi', 'Kuram psikolog Mihaly Csikszentmihalyi’ye aittir.', ['Sigmund Freud', 'Daniel Kahneman', 'Jean Piaget']],
      ['mc', 'According to this psychologist, what decides whether we feel happy?', 'How we see and interpret events', 'Mutluluk dış olaylardan değil, onları nasıl algılayıp yorumladığımızdan doğar.', ['The events themselves', 'How much free time we have', 'The people we work with']],
      ['mc', 'When are we in a state of “flow”?', 'When we are totally involved in what we are doing', 'Akış: yaptığın işe tamamen odaklanmış, dalmış olmak.', ['When we are resting after work', 'When we finish a job quickly', 'When we do several things at once']],
      ['mc', 'Where did the psychologist get the idea?', 'From watching artists at work in a studio', 'Fikir, atölyede çalışan sanatçıları gözlemlerken doğmuş.', ['From his own university students', 'From a famous sports team', 'From reading old books']],
      ['mc', 'What happened to the artists while they worked?', 'They lost track of time and forgot that they were hungry or tired.', 'Zamanı unutur, açlığı ve yorgunluğu fark etmezler.', ['They argued with each other.', 'They became bored after an hour.', 'They worked only in the mornings.']],
      ['mc', 'What does the speaker compare “flow” to?', 'Being carried along by a river', 'Akış, bir nehrin akıntısıyla sürüklenmeye benzetilir.', ['Climbing a mountain', 'Driving a fast car', 'Sleeping deeply']],
      ['mc', 'Which topic is NOT part of the rest of the lecture?', 'The history of the university', 'Kalan kısım: psikoloğun hayatı, akışın koşulları ve akışa götüren etkinlikler.', ['The psychologist’s life', 'The conditions of flow', 'Activities that help people reach flow']],
    ]),
    chunks: [
      { en: 'be absorbed in something', tr: 'bir şeye dalmak, kendini kaptırmak' },
      { en: 'lose track of time', tr: 'zamanın nasıl geçtiğini anlamamak' },
      { en: 'focus on', tr: '-e odaklanmak' },
      { en: 'be involved in', tr: '-e dahil olmak, içinde olmak' },
      { en: 'look for happiness', tr: 'mutluluğu aramak' },
      { en: 'in everyday life', tr: 'gündelik hayatta' },
    ],
    speaking: {
      prompt: 'Explain the idea of “flow” in your own words, then describe an activity in which you lose track of time.',
      promptTr: '“Flow” fikrini kendi cümlelerinle açıkla; sonra zamanın nasıl geçtiğini anlamadığın bir etkinliği anlat.',
      points: ['What is the lecture about?', 'What is flow? Where did the idea come from?', 'An activity you enjoy doing', 'How you feel while doing it'],
      seconds: 90,
    },
    writing: {
      prompt: 'Have you ever been in a state of flow? Describe the activity and explain why you enjoy doing it.',
      promptTr: 'Hiç “akış” hâlinde oldun mu? Etkinliği anlat ve onu yapmaktan neden hoşlandığını açıkla.',
      minWords: 60, maxWords: 90,
    },
  },
  {
    id: 'en-lx-student-discussion', title: 'A student discussion', provider: BC, url: `${base}/student-discussion`, level: 'B1',
    transcriptWords: 400, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.conditionals', 'en.sentence-structure'],
    about: 'İki öğrenci derste Mars ile Dünya’yı karşılaştırır: benzerlikler, farklar ve bol sayı.',
    prep: [
      'Mars hakkında bildiğin iki şeyi İngilizce söyle.',
      'Sayıları dinlerken not al: sıcaklık, uzaklık, yüzde. IELTS Listening’de sayılar sık sorulur.',
      '“Both … / … while … / … whereas …” kalıplarını karşılaştırma için hazırla.',
    ],
    gist: qs('en-lx-student-discussion', 'g', [
      ['mc', 'What are the two students doing?', 'Comparing Mars and Earth.', 'Öğretmenin verdiği sürede Mars ile Dünya’nın benzerlik ve farklarını tartışırlar.', ['Planning a trip to a museum.', 'Preparing for a history exam.', 'Describing the Moon.']],
      ['mc', 'Do the students agree about everything?', 'No — one student corrects several of the other’s ideas.', 'Bir öğrenci “benzer” der, diğeri sayılarla düzeltir (sıcaklık, uzaklık).', ['Yes, they agree about every point.', 'No — they refuse to talk to each other.', 'They do not discuss any facts.']],
    ]),
    detail: qs('en-lx-student-discussion', 'd', [
      ['mc', 'What temperature is Mars most of the time?', 'About minus 55 degrees', 'Mars çoğu zaman yaklaşık eksi 55 derecedir.', ['About minus 5 degrees', 'About 15 degrees', 'About minus 155 degrees']],
      ['short', 'How far is Earth from the Sun, in million kilometres? (number)', '150', 'Dünya yaklaşık 150 milyon km uzaklıktadır.', ['150 million', '150 million km', 'one hundred and fifty', '150 million kilometres']],
      ['mc', 'How far is Mars from the Sun?', 'About 228 million kilometres', 'Mars yaklaşık 228 milyon km uzaklıktadır.', ['About 128 million kilometres', 'About 780 million kilometres', 'About 28 million kilometres']],
      ['short', 'What does “AU” stand for? (two words)', 'astronomical unit', 'AU = astronomical unit; Dünya Güneş’ten 1 AU uzaktadır.', ['astronomical units', 'an astronomical unit']],
      ['mc', 'How big is Mars compared with Earth?', 'About half the size', 'Mars, Dünya’nın yaklaşık yarısı büyüklüğündedir.', ['About the same size', 'Twice as big', 'About a tenth of the size']],
      ['mc', 'How long is a day on Mars?', 'About half an hour longer than a day on Earth', 'Günler neredeyse aynı: Mars’ta yaklaşık yarım saat daha uzun.', ['About half as long as a day on Earth', 'Exactly the same as a day on Earth', 'About two days on Earth']],
      ['short', 'How much of the Earth is water? (number, per cent)', '70', 'Dünya’nın yüzde 70’i sudur.', ['70 per cent', '70%', 'seventy', 'seventy per cent', '70 percent']],
      ['tf', 'The air on Mars is mostly oxygen.', 'False', 'Mars’ın havası çoğunlukla karbondioksittir ve Dünya’dakinin yaklaşık yüzde biri kadardır.'],
      ['mc', 'How strong is gravity on Mars?', 'About 38 per cent of Earth’s gravity', 'Ay’dakinden yüksek ama Dünya’dakinden çok düşük: yaklaşık yüzde 38.', ['About 83 per cent of Earth’s gravity', 'The same as on the Moon', 'Stronger than on Earth']],
    ]),
    chunks: [
      { en: 'have something in common', tr: 'ortak bir yönü olmak' },
      { en: 'be similar to', tr: '-e benzemek' },
      { en: 'be different from', tr: '-den farklı olmak' },
      { en: 'compared with', tr: '-e kıyasla' },
      { en: 'be known as', tr: '… olarak bilinmek' },
      { en: 'twice as … as / half the size of', tr: 'iki katı … / yarısı büyüklüğünde' },
    ],
    speaking: {
      prompt: 'Compare Mars and Earth. Give two similarities and three differences, with numbers where you can.',
      promptTr: 'Mars ile Dünya’yı karşılaştır: iki benzerlik, üç fark; mümkünse sayılarla.',
      points: ['Both planets … (day length, water)', 'Mars is … while Earth is … (temperature, size, colour)', 'Air and gravity', 'Would you like to go there?'],
      seconds: 90,
    },
    writing: {
      prompt: 'Would you like to live on Mars? Use the Second Conditional: If I lived on Mars, I would … / I wouldn’t …',
      promptTr: 'Mars’ta yaşamak ister miydin? Second Conditional kullan: If I lived on Mars, I would … / I wouldn’t …',
      minWords: 60, maxWords: 90,
    },
  },
  {
    id: 'en-lx-decision', title: 'Making a decision', provider: BC, url: `${base}/making-decision`, level: 'B1',
    transcriptWords: 470, mediaSeconds: null, verifiedOn: VERIFIED, topicTags: ['en.conditionals', 'en.sentence-structure'],
    about: 'Hafta testi: dört iş arkadaşı yeni bir projenin takvimi için toplantıda karar vermeye çalışır.',
    prep: [
      'Bu bir TEST dinlemesidir: ipucu yok. Dört konuşmacı var — isimleri ve kimin ne istediğini not al.',
      'Bir grupta karar verirken hangisi daha iyi: önce her şeyi planlamak mı, hemen başlamak mı?',
    ],
    gist: qs('en-lx-decision', 'g', [
      ['mc', 'What is the purpose of the meeting?', 'To decide the timeline for a new project.', 'Toplantı yeni projenin zaman planını belirlemek içindir.', ['To choose a new project leader.', 'To discuss a problem with a customer.', 'To plan the office party.']],
      ['mc', 'What do they decide in the end?', 'To start phase one as soon as possible and plan the later phases as they go.', 'Birinci aşama hemen başlar; sonraki aşamalar arka planda planlanıp uyarlanır.', ['To finish the whole plan before starting anything.', 'To cancel the project.', 'To meet again next month without a decision.']],
    ]),
    detail: qs('en-lx-decision', 'd', [
      ['short', 'Who is the project leader? (name)', 'Jani', 'Toplantıyı Jani açar; diğerleri kararı proje lideri olarak ona bırakır.', ['jani is']],
      ['mc', 'What does David want the group to agree on first?', 'How they are going to make the decision.', 'David önce karar verme yönteminde anlaşmak ister.', ['Who will pay for the project.', 'Where the next meeting will be.', 'How many people will join the team.']],
      ['mc', 'What does Emiko suggest?', 'Starting phase one as soon as possible.', 'Emiko: birinci aşamaya hemen başlayalım, gerisini ilerledikçe planlarız.', ['Waiting for a month.', 'Asking another department to decide.', 'Dividing the team into two groups.']],
      ['mc', 'Why does David disagree with Emiko’s idea?', 'The rest of the project is unclear, so they could waste time on a wrong decision.', 'Projenin geri kalanı belirsizken başlamak, yanlış karar ve zaman kaybı riskidir.', ['He thinks phase one is too expensive.', 'He does not like Emiko.', 'He wants to lead the project himself.']],
      ['mc', 'How does Jani explain an “agile” approach?', 'You start quickly and adapt as you go.', 'Agile: hızlı başla, ilerledikçe uyarla.', ['You plan every detail before you start.', 'You let the customer make every decision.', 'You work only in small offices.']],
      ['short', 'Which person has been quiet, listening and thinking? (name)', 'Carolina', 'Jani, Carolina’nın sessiz kaldığını fark eder.', ['carolina has']],
      ['mc', 'What is Carolina’s opinion?', 'Plans change often, so the team must be flexible and move quickly.', 'İyi plan önemlidir ama planlar ve iş sık değişir; esnek ve hızlı olmak gerekir.', ['The plan must be finished before phase one starts.', 'The project is not necessary.', 'She has no opinion at all.']],
      ['tf', 'In the end, David agrees that the decision is the right one.', 'False', 'Hâlâ yanlış olduğunu düşünür ama çoğunluğun kararını kabul eder.'],
      ['mc', 'What does David ask for at the end?', 'Extra time in the schedule.', 'Esnekliğin getireceği ek iş için takvimde fazladan zaman ister; Jani kabul eder.', ['A bigger budget.', 'A different project leader.', 'A written apology.']],
    ]),
    chunks: [
      { en: 'make a decision', tr: 'karar vermek' },
      { en: 'as soon as possible', tr: 'mümkün olan en kısa sürede' },
      { en: 'waste time', tr: 'zaman kaybetmek' },
      { en: 'agree with someone', tr: 'biriyle aynı fikirde olmak' },
      { en: 'accept the majority view', tr: 'çoğunluğun görüşünü kabul etmek' },
      { en: 'be flexible', tr: 'esnek olmak' },
    ],
    speaking: {
      prompt: 'Summarise the meeting: who wanted what, and what was decided? Then say what you would do if you were the project leader.',
      promptTr: 'Toplantıyı özetle: kim ne istedi, ne kararlaştırıldı? Sonra proje lideri sen olsaydın ne yapardın, söyle.',
      points: ['The purpose of the meeting', 'Emiko’s and David’s positions', 'Carolina’s opinion and the final decision', 'If I were the project leader, I would …'],
      seconds: 90,
    },
    writing: {
      prompt: 'Do you prefer planning everything first or starting quickly and changing the plan later? Explain with an example from your studies or work.',
      promptTr: 'Önce her şeyi planlamayı mı, yoksa hemen başlayıp planı sonradan değiştirmeyi mi tercih edersin? Okul ya da iş hayatından bir örnekle açıkla.',
      minWords: 60, maxWords: 90,
    },
  },
];

export const EN_EXTERNAL_LISTENING_BY_ID = new Map(EN_EXTERNAL_LISTENING.map((task) => [task.id, task]));
