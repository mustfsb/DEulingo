/**
 * Kanonik müfredat — KONU tabanlı tek doğruluk kaynağı.
 *
 * Müfredat artık "Hangi gün öğrendim?" sorusuna değil, "Neyi biliyorum?"
 * sorusuna göre düzenlenir. Aynı konu kimliği her yerde kullanılır:
 *
 *   Dersler (konu kartları) = Özet konuları = Alıştırma konu etiketleri
 *   = Genel Tekrar konu filtreleri = Ustalık kategorileri
 *
 * KİMLİK KURALI: `id` kararlıdır ve ASLA değişmez; kalıcı ilerleme, yer imleri
 * ve rotalar ona bağlıdır. Görünen Türkçe başlık (`title`) serbestçe
 * değiştirilebilir — değişince yalnızca `summaryTitles` güncellenir.
 *
 * Konular yaşayan modüllerdir: yeni bir ders bir konuyu genişletiyorsa yeni
 * "gün" açılmaz; aynı konuya yeni bölüm ve alıştırma eklenir.
 */

export interface CurriculumTopicDef {
  /** Kararlı kimlik: `topic.modal-verbs`. */
  id: string;
  /** URL parçası — kimlikten türetilir, kararlıdır: `modal-verbs`. */
  slug: string;
  /** UI başlığı (Türkçe ya da yerleşik Almanca terim). */
  title: string;
  emoji: string;
  /** Kısa Türkçe açıklama — konu kartının alt yazısı. */
  description: string;
  /** Kartta gösterilen örnek Almanca parçalar. */
  keywords: string;
  /** `Konu Özetleri.md` içindeki H1 başlık eşleşmeleri (emoji hariç). */
  summaryTitles: string[];
}

export interface SummarySectionDef {
  /** Kararlı bölüm kimliği: `modal-verbs.koennen`. */
  id: string;
  topicId: string;
  /** UI başlığı. */
  title: string;
  /** Kaynak H2 başlık eşleşmeleri (emoji hariç). */
  matchTitles: string[];
  /**
   * Bu bölümün alıştırmaları doğal olarak başka konuları da çalıştırır
   * (ör. "Tarif Sıfatları" → Ev ve Mobilyalar). Alıştırmalara ikincil konu
   * etiketi olarak yayılır.
   */
  relatedTopicIds?: string[];
}

function topic(slug: string, rest: Omit<CurriculumTopicDef, 'id' | 'slug' | 'summaryTitles'> & { summaryTitles?: string[] }): CurriculumTopicDef {
  return { id: `topic.${slug}`, slug, summaryTitles: rest.summaryTitles ?? [rest.title], ...rest };
}

/** Müfredat haritası — gösterim sırası bu listedir. */
export const TOPICS: CurriculumTopicDef[] = [
  topic('greetings', {
    title: 'Selamlaşma ve Tanışma',
    emoji: '👋',
    description: 'Selam vermek, adını sormak, tanışmak ve nezaket kalıpları.',
    keywords: 'Hallo · Guten Morgen · Wie heißt du? · Freut mich!',
  }),
  topic('personal-info', {
    title: 'Kişisel Bilgiler',
    emoji: '🪪',
    description: 'Yaş, köken, doğum yeri, ikamet, meslek ve form doldurma.',
    keywords: 'Wie alt bist du? · Ich komme aus … · Ich bin in … geboren.',
  }),
  topic('numbers', {
    title: 'Sayılar',
    emoji: '🔢',
    description: '10’dan 1000’e sayılar ve bileşik sayıların sırası.',
    keywords: 'dreizehn · dreißig · vierundfünfzig · zweihundertfünf',
  }),
  topic('verbs', {
    title: 'Fiiller ve Çekim',
    emoji: '🔧',
    description: 'Düzenli ekler, sein ve haben, düzensiz fiiller ve refleksifler.',
    keywords: 'ich bin · du hast · du isst · du gibst · sich duschen',
  }),
  topic('articles', {
    title: 'Artikeller ve Olumsuzluk',
    emoji: '🧩',
    description: 'der/die/das, ein/eine, kein/keine, çoğul ve nicht ile olumsuzluk.',
    keywords: 'der → ein → kein → mein · nicht / kein',
  }),
  topic('pronouns', {
    title: 'Zamirler ve İyelik',
    emoji: '👤',
    description: 'Kişi zamirleri, iyelik zamirleri ve artikelden zamire geçiş.',
    keywords: 'ich · du · er/sie/es · mein · sein · ihr · unser',
  }),
  topic('sentence-building', {
    title: 'Cümle Kurma',
    emoji: '🧱',
    description: 'Özne + fiil + nesne, fiil ikinci sırada, bağlaçlar ve 80 temel cümle.',
    keywords: 'Heute gehe ich … · und / aber · dann / danach',
  }),
  topic('questions', {
    title: 'Soru Kurma',
    emoji: '❓',
    description: 'Evet/hayır soruları, W-soruları ve tam cümleyle cevap.',
    keywords: 'Gehst du …? · Wo wohnst du? · Ja, ich … / Nein, ich …',
  }),
  topic('places', {
    title: 'Yer ve Yön',
    emoji: '🧭',
    description: 'zum/zur/im/ins/am, nach Hause ↔ zu Hause, mit + Dativ.',
    keywords: 'zur Schule · im Park · ins Kino · nach Hause',
  }),
  topic('likes', {
    title: 'Sevmek ve Beğenmek',
    emoji: '❤️',
    description: 'mögen ile isim sevmek, gern ile eylem sevmek, gefallen.',
    keywords: 'Ich mag Katzen. · Ich lese gern. · Das gefällt mir.',
  }),
  topic('food', {
    title: 'Essen und Trinken',
    emoji: '🍽️',
    description: 'Yiyecek ve içecekler, tercihler, açlık ve susuzluk.',
    keywords: 'Was isst du gern? · der Kuchen · die Suppe · Ich habe Hunger.',
  }),
  topic('shopping', {
    title: 'Alışveriş ve Fiyatlar',
    emoji: '🛒',
    description: 'Sıklık, miktar kalıpları, fiyat sormak ve brauchen.',
    keywords: 'Was kostet das? · eine Flasche · immer / oft / nie',
  }),
  topic('home', {
    title: 'Ev ve Mobilyalar',
    emoji: '🏠',
    description: 'Odalar, mobilyalar, evde işler ve kendi evini anlatmak.',
    keywords: 'die Küche · der Schrank · das Fenster · Wir haben …',
  }),
  topic('adjectives', {
    title: 'Sıfatlar',
    emoji: '🎨',
    description: 'sein + sıfat, isimden önce sıfat ekleri ve zıt çiftler.',
    keywords: 'hell ↔ dunkel · groß ↔ klein · ein neues T-Shirt',
  }),
  topic('akkusativ', {
    title: 'Akkusativ',
    emoji: '🎯',
    description: 'Nesne hâli: der → den, ein → einen, mein → meinen, es gibt.',
    keywords: 'Ich kaufe einen Kuchen. · Es gibt einen Tisch.',
  }),
  topic('time', {
    title: 'Saatler ve Zaman',
    emoji: '🕐',
    description: 'Saat sormak, resmî ve günlük saat, halb/Viertel, um ve zaman ifadeleri.',
    keywords: 'Wie spät ist es? · halb acht · um sieben Uhr · am Morgen',
  }),
  topic('daily-routine', {
    title: 'Mein Tag',
    emoji: '🌅',
    description: 'Sabahtan akşama gününü basit cümlelerle anlatmak.',
    keywords: 'Ich wache auf. · Ich frühstücke. · Danach gehe ich ins Bett.',
  }),
  topic('separable-verbs', {
    title: 'Ayrılabilen Fiiller',
    emoji: '✂️',
    description: 'Kök ikinci sırada, önek sonda — ve Modalverb ile tek parça.',
    keywords: 'aufstehen · einkaufen · anrufen · fernsehen',
  }),
  topic('modal-verbs', {
    title: 'Modalverben',
    emoji: '🗝️',
    description: 'können, möchten, wollen, sollen, dürfen + sonda mastar.',
    keywords: 'Ich kann Deutsch sprechen. · Hier darf man nicht parken.',
  }),
  topic('vocabulary', {
    title: 'Kelime Haznesi',
    emoji: '📚',
    description: 'Konulara sığmayan faydalı kelimeler: eşyalar, derste, yeni fiiller.',
    keywords: 'der Brief · der Schlüssel · die Frage · übersetzen',
  }),
];

/** Yazılmış içerikte kullanılan kısa konu sabitleri: `topicId: T.modalVerbs`. */
export const T = {
  greetings: 'topic.greetings',
  personalInfo: 'topic.personal-info',
  numbers: 'topic.numbers',
  verbs: 'topic.verbs',
  articles: 'topic.articles',
  pronouns: 'topic.pronouns',
  sentenceBuilding: 'topic.sentence-building',
  questions: 'topic.questions',
  places: 'topic.places',
  likes: 'topic.likes',
  food: 'topic.food',
  shopping: 'topic.shopping',
  home: 'topic.home',
  adjectives: 'topic.adjectives',
  akkusativ: 'topic.akkusativ',
  time: 'topic.time',
  dailyRoutine: 'topic.daily-routine',
  separableVerbs: 'topic.separable-verbs',
  modalVerbs: 'topic.modal-verbs',
  vocabulary: 'topic.vocabulary',
} as const;

export const TOPIC_BY_ID = new Map(TOPICS.map((entry) => [entry.id, entry]));
export const TOPIC_BY_SLUG = new Map(TOPICS.map((entry) => [entry.slug, entry]));
export const TOPIC_IDS = TOPICS.map((entry) => entry.id);

export function topicTitle(topicId: string): string {
  return TOPIC_BY_ID.get(topicId)?.title ?? topicId;
}

export function isTopicId(value: unknown): value is string {
  return typeof value === 'string' && TOPIC_BY_ID.has(value);
}

function section(
  topicSlug: string,
  name: string,
  title: string,
  extra: { matchTitles?: string[]; related?: string[] } = {},
): SummarySectionDef {
  return {
    id: `${topicSlug}.${name}`,
    topicId: `topic.${topicSlug}`,
    title,
    matchTitles: extra.matchTitles ?? [title],
    ...(extra.related?.length ? { relatedTopicIds: extra.related.map((slug) => `topic.${slug}`) } : {}),
  };
}

/**
 * `Konu Özetleri.md` H2 bölümlerinin kararlı kimlikleri.
 * Kavramların `sectionId` alanı bu listeye bağlanır; kapsam doğrulaması
 * her kavramın `anchor` metnini kendi bölümünde arar.
 */
export const SUMMARY_SECTIONS: SummarySectionDef[] = [
  // 👋 Selamlaşma ve Tanışma
  section('greetings', 'hello', 'Selamlaşma, Nezaket ve Diller'),
  section('greetings', 'introduce', 'İsim Sorma ve Tanışma'),
  section('greetings', 'wellbeing', 'Nasılsın? — Es geht mir gut'),

  // 🪪 Kişisel Bilgiler
  section('personal-info', 'age-origin', 'Yaş, Köken ve İkamet'),
  section('personal-info', 'birthplace', 'Memleket, Doğum Yeri ve İkamet'),
  section('personal-info', 'leben', 'leben — Yaşamak', { related: ['verbs'] }),
  section('personal-info', 'job', 'Meslek — Ne İş Yapıyorsun?'),
  section('personal-info', 'contact', 'İletişim — E-posta ve Telefon', { related: ['numbers'] }),
  section('personal-info', 'form', 'Form Alanları'),
  section('personal-info', 'marital', 'Familienstand — ledig / verheiratet'),
  section('personal-info', 'self-intro', 'Kendini Ayrıntılı Tanıtma', { related: ['greetings'] }),

  // 🔢 Sayılar
  section('numbers', 'teens-tens', 'Sayılar 10–100'),
  section('numbers', 'hundreds', 'Yüzler ve Bin'),

  // 🔧 Fiiller ve Çekim
  section('verbs', 'conjugation', 'Fiil Çekimi — Düzenli ve Düzensiz Fiiller'),
  section('verbs', 'haben-sein', 'haben ve sein'),
  section('verbs', 'more-verbs', 'Diğer Temel Fiiller — kennen, geben, stellen'),
  section('verbs', 'reflexive', 'Refleksif Fiiller', { related: ['daily-routine'] }),

  // 🧩 Artikeller ve Olumsuzluk
  section('articles', 'definite-indefinite', 'Belirli ve Belirsiz Artikeller — der, die, das / ein, eine'),
  section('articles', 'chain', 'Artikel Zinciri — kein, dein, mein', { related: ['pronouns'] }),
  section('articles', 'plural', 'Çoğul'),
  section('articles', 'negation', 'Olumsuz Cümle — nicht / kein', { related: ['sentence-building'] }),
  section('articles', 'nicht-position', 'nicht Nereye Gider?', { related: ['sentence-building'] }),

  // 👤 Zamirler ve İyelik
  section('pronouns', 'personal', 'Kişi Zamirleri', { related: ['verbs'] }),
  section('pronouns', 'possessive-table', 'İyelik Zamirleri — Tam Tablo'),
  section('pronouns', 'unser-ihr', 'İyelik Yapıları — unser, ihr'),
  section('pronouns', 'sentence', 'Kişi Zamiri + İyelik Zamiri ile Cümle Kurma', { related: ['sentence-building'] }),
  section('pronouns', 'article-to-pronoun', 'Artikelden Kişi Zamirine — der, die, das', { related: ['articles'] }),

  // 🧱 Cümle Kurma
  section('sentence-building', 'basic', 'Olumlu Cümle Kurma'),
  section('sentence-building', 'v2', 'Cümle Dizilişi — Fiil İkinci Sırada'),
  section('sentence-building', 'und-aber', 'und / aber — Bağlaçlar'),
  section('sentence-building', 'dann-danach', 'dann / danach — Sıralama', { related: ['daily-routine'] }),
  section('sentence-building', 'eight', '8 Temsilci Cümle — Detaylı Çözümleme'),
  section('sentence-building', 'eighty', '80 Temel Cümlenin Doğru Almancası'),

  // ❓ Soru Kurma
  section('questions', 'yes-no', 'Evet/Hayır Soruları'),
  section('questions', 'w-questions', 'W-Soruları'),

  // 🧭 Yer ve Yön
  section('places', 'prepositions', 'Yer, Yön ve Küçük Ama Önemli Kelimeler'),

  // ❤️ Sevmek ve Beğenmek
  section('likes', 'moegen-gern', 'mögen ve gern — Sevmek'),
  section('likes', 'gefallen', 'gefallen — Beğenmek'),

  // 🍽️ Essen und Trinken
  section('food', 'preferences', 'Essen und Trinken — gern / nicht gern', { related: ['likes'] }),
  section('food', 'words-basic', 'Yiyecek ve Mutfak Kelimeleri'),
  section('food', 'words-more', 'Diğer Yiyecek Kelimeleri'),
  section('food', 'meal-words', 'Sofrada — die Suppe, der Teller, der Kuchen'),

  // 🛒 Alışveriş ve Fiyatlar
  section('shopping', 'frequency', 'Alışveriş ve Sıklık'),
  section('shopping', 'quantities', 'Miktar ve Paket Kelimeleri', { related: ['food'] }),
  section('shopping', 'prices', 'Fiyat Sormak', { related: ['numbers'] }),
  section('shopping', 'brauchen', 'brauchen — İhtiyaç Duymak'),
  section('shopping', 'buy-sell', 'kaufen ↔ verkaufen'),

  // 🏠 Ev ve Mobilyalar
  section('home', 'rooms', 'Ev ve Odalar'),
  section('home', 'furniture', 'Mobilyalar ve Ev Eşyaları'),
  section('home', 'chores', 'Evde İşler — putzen, gießen, spülen, reparieren', { related: ['daily-routine'] }),
  section('home', 'my-home', 'Evimi Anlatıyorum — Meine Wohnung', { related: ['adjectives', 'pronouns'] }),
  section('home', 'patterns', 'Evimi Anlatmak İçin Cümle Kalıpları'),

  // 🎨 Sıfatlar
  section('adjectives', 'endings', 'Sıfatlar ve Ekler'),
  section('adjectives', 'describe', 'Tarif Sıfatları — hell, dunkel, groß, klein', { related: ['home'] }),

  // 🎯 Akkusativ
  section('akkusativ', 'basics', 'Akkusativ Nedir? — der → den, ein → einen'),
  section('akkusativ', 'possessive', 'mein → meinen, kein → keinen'),
  section('akkusativ', 'es-gibt', 'es gibt — Var / Yok'),

  // 🕐 Saatler ve Zaman
  section('time', 'question', 'Saat Kaç? — Wie spät ist es?'),
  section('time', 'official', 'Resmî Saatler'),
  section('time', 'everyday', 'Günlük Saatler'),
  section('time', 'halb', 'halb / Viertel / vor / nach'),
  section('time', 'um', '`um` ile Saat Söylemek', { related: ['daily-routine'] }),
  section('time', 'expressions', 'Zaman İfadeleri', { related: ['sentence-building'] }),

  // 🌅 Mein Tag
  section('daily-routine', 'everyday-sentences', 'Günlük Hayat Cümleleri'),
  section('daily-routine', 'routine-verbs', 'Günlük Rutin Fiilleri'),
  section('daily-routine', 'morning', 'Mein Tag — Sabah'),
  section('daily-routine', 'day', 'Mein Tag — Gün İçinde'),
  section('daily-routine', 'evening', 'Mein Tag — Akşam'),
  section('daily-routine', 'full', 'Mein Tag — Tam Anlatım', { related: ['time', 'separable-verbs'] }),
  section('daily-routine', 'plans', 'Yarın Ne Yapmak İstiyorsun? — Mein Tag + Modalverben', { related: ['modal-verbs'] }),

  // ✂️ Ayrılabilen Fiiller
  section('separable-verbs', 'what', 'Ayrılabilen Fiil Nedir?'),
  section('separable-verbs', 'rule', 'Temel Kural — Önek Cümlenin Sonuna'),
  section('separable-verbs', 'core', 'En Önemli Ayrılabilen Fiiller'),
  section('separable-verbs', 'anrufen', 'anrufen — Telefonla Aramak'),
  section('separable-verbs', 'question-negation', 'Soru ve Olumsuzluk', { related: ['questions', 'articles'] }),
  section('separable-verbs', 'compare', 'Ayrılan / Ayrılmayan Fiil Karşılaştırması'),
  section('separable-verbs', 'in-my-day', 'Mein Tag İçinde Kullanım', { related: ['daily-routine'] }),
  section('separable-verbs', 'with-modal', 'Modalverb ile Kullanım', { related: ['modal-verbs'] }),
  section('separable-verbs', 'mistakes', 'Sık Hatalar'),

  // 🗝️ Modalverben
  section('modal-verbs', 'what', 'Modalverben Nedir?'),
  section('modal-verbs', 'rule', 'Temel Kural — Modalverb İkinci Sırada, Mastar Sonda', { related: ['sentence-building'] }),
  section('modal-verbs', 'koennen', 'können — -ebilmek'),
  section('modal-verbs', 'moechten', 'möchten — kibarca istemek'),
  section('modal-verbs', 'wollen', 'wollen — istemek, niyet etmek'),
  section('modal-verbs', 'sollen', 'sollen — -meli / -malı'),
  section('modal-verbs', 'duerfen', 'dürfen — izin ve yasak'),
  section('modal-verbs', 'moegen-muessen', 'mögen ve müssen — Kısa Not'),
  section('modal-verbs', 'questions', 'Modalverb ile Soru', { related: ['questions'] }),
  section('modal-verbs', 'negation', 'Modalverb ile Olumsuzluk', { related: ['articles'] }),
  section('modal-verbs', 'separable', 'Modalverb + Ayrılabilen Fiil', { related: ['separable-verbs'] }),
  section('modal-verbs', 'akkusativ', 'Modalverb + Akkusativ', { related: ['akkusativ'] }),
  section('modal-verbs', 'mistakes', 'Sık Hatalar'),

  // 📚 Kelime Haznesi
  section('vocabulary', 'small-words', 'Faydalı Küçük Kelimeler'),
  section('vocabulary', 'daily-words', 'Günlük Hayattan Kelimeler'),
  section('vocabulary', 'more-words', 'Diğer Kelimeler — ruhig, beide, ziemlich'),
  section('vocabulary', 'weather-animals', 'Hava, Hayvanlar ve Hobiler'),
  section('vocabulary', 'things', 'Eşyalar, Yerler ve İnsanlar'),
  section('vocabulary', 'new-verbs', 'Yeni Fiiller — nehmen, schicken, wissen …'),
  section('vocabulary', 'classroom', 'Derste — Wort, Satz, Frage, Antwort'),
];

export const SECTION_BY_ID = new Map(SUMMARY_SECTIONS.map((entry) => [entry.id, entry]));

export function sectionsForTopic(topicId: string): SummarySectionDef[] {
  return SUMMARY_SECTIONS.filter((entry) => entry.topicId === topicId);
}

/* ------------------------------------------------------------------ */
/* Genel Tekrar Özeti (kümülatif, sıkıştırılmış) — aynı konu kimlikleri */
/* ------------------------------------------------------------------ */

export interface ReviewSectionDef {
  /** Kararlı kimlik (yer imi / okundu bilgisi buna bağlıdır). */
  id: string;
  title: string;
  matchTitles: string[];
  /** Bu tekrar bölümünün ait olduğu kanonik konu ("Bu Konuyu Çalış"). */
  topicId?: string;
  /** Konu yerine bir tekrar modu başlatan genel bölümler. */
  mode?: 'mixed' | 'vocab' | 'quick';
}

function review(id: string, title: string, target: { topic?: string; mode?: ReviewSectionDef['mode'] }, matchTitles?: string[]): ReviewSectionDef {
  return {
    id: `genel.${id}`,
    title,
    matchTitles: matchTitles ?? [title],
    ...(target.topic ? { topicId: `topic.${target.topic}` } : {}),
    ...(target.mode ? { mode: target.mode } : {}),
  };
}

export const REVIEW_SECTIONS: ReviewSectionDef[] = [
  review('nasil-kullanilir', 'Nasıl Kullanılır?', {}),
  review('tanisma', 'Selamlaşma ve Tanışma', { topic: 'greetings' }),
  review('kendini-tanitma', 'Kendimi Tanıtıyorum', { topic: 'greetings' }),
  review('kisi-zamirleri', 'Kişi Zamirleri', { topic: 'pronouns' }),
  review('artikeller', 'Artikeller', { topic: 'articles' }),
  review('kein-mein', 'ein / eine / kein / keine / mein / dein', { topic: 'articles' }),
  review('kisisel-bilgiler', 'Kişisel Bilgiler', { topic: 'personal-info' }),
  review('sayilar', 'Sayılar', { topic: 'numbers' }),
  review('soru-kurma', 'Soru Kurma', { topic: 'questions' }),
  review('cumle-kurma', 'Cümle Kurma', { topic: 'sentence-building' }),
  review('olumsuzluk', 'Olumsuzluk', { topic: 'articles' }, ['Olumsuzluk — nicht / kein', 'Olumsuzluk']),
  review('fiiller', 'Temel Fiiller', { topic: 'verbs' }),
  review('fiil-cekimi', 'Fiil Çekimleri', { topic: 'verbs' }),
  review('yiyecek', 'Essen und Trinken', { topic: 'food' }),
  review('gern', 'Sevmek ve Beğenmek', { topic: 'likes' }, ['Sevmek ve Beğenmek — gern / mögen / gefallen', 'Sevmek ve Beğenmek']),
  review('yer-yon', 'Yer ve Yön', { topic: 'places' }),
  review('alisveris', 'Alışveriş', { topic: 'shopping' }),
  review('miktar-fiyat', 'Miktarlar ve Fiyatlar', { topic: 'shopping' }),
  review('ev', 'Wohnung / Ev', { topic: 'home' }),
  review('mobilya', 'Mobilyalar', { topic: 'home' }),
  review('sifat', 'Sıfatlar', { topic: 'adjectives' }),
  review('akkusativ', 'Akkusativ', { topic: 'akkusativ' }, ['Akkusativ — der → den, ein → einen', 'Akkusativ']),
  review('saat', 'Saatler', { topic: 'time' }),
  review('ayrilabilen', 'Ayrılabilen Fiiller', { topic: 'separable-verbs' }, ['Ayrılabilen Fiiller — Toplu Tekrar']),
  review('mein-tag', 'Mein Tag', { topic: 'daily-routine' }),
  review('dann-danach', 'dann / danach / und / aber', { topic: 'sentence-building' }),
  review('modalverben', 'Modalverben', { topic: 'modal-verbs' }, ['Modalverben — können, möchten, wollen, sollen, dürfen', 'Modalverben']),
  review('kelimeler', 'En Önemli Kelimeler', { topic: 'vocabulary' }),
  review('kaliplar', 'Konuşma Kalıpları', { mode: 'mixed' }),
  review('hizli-tekrar', 'Hızlı Özet Turu', { mode: 'quick' }),
  review('kendine-sor', 'Kendini Test Et', { mode: 'mixed' }),
];

export const REVIEW_SECTION_BY_ID = new Map(REVIEW_SECTIONS.map((entry) => [entry.id, entry]));
