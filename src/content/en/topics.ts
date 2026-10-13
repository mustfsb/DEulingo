/**
 * İngilizce müfredat — Almanca müfredatla aynı felsefe (KONU tabanlı).
 *
 * Kimlik kuralı Almancayla aynıdır: `id` kararlıdır ve ASLA değişmez.
 * İngilizce konular `en.` öneki taşır; Almanca `topic.` kayıtlarıyla
 * çakışmaz. 1. Hafta: 6 konu (Present Perfect + 5 yeni).
 */

export interface EnTopicDef {
  /** Kararlı kimlik: `en.present-perfect`. */
  id: string;
  /** URL parçası: `present-perfect`. */
  slug: string;
  /** UI başlığı (Türkçe arayüzde gösterilir). */
  title: string;
  emoji: string;
  description: string;
  keywords: string;
}

export interface EnSectionDef {
  /** Kararlı bölüm kimliği: `present-perfect.formula`. */
  id: string;
  topicId: string;
  title: string;
}

function section(topicId: string, name: string, title: string): EnSectionDef {
  const prefix = topicId === 'en.present-perfect' ? 'present-perfect' : topicId.replace(/^en\./, '');
  return { id: `${prefix}.${name}`, topicId, title };
}

export const EN_TOPICS: EnTopicDef[] = [
  {
    id: 'en.present-perfect',
    slug: 'present-perfect',
    title: 'Present Perfect',
    emoji: '✅',
    description: 'have/has + V3: deneyimi, süregelen durumları ve for/since ile süreleri anlatmak.',
    keywords: 'I have seen · She has finished · for three years · since 2023',
  },
  {
    id: 'en.sentence-structure',
    slug: 'sentence-structure',
    title: 'Sentence Structure',
    emoji: '🧱',
    description: 'SVO iskelet, yer-zaman sırası, soru düzeni, genişletme ve bağlaçlar.',
    keywords: 'SVO · place before time · Where is · Do you know where · because so however',
  },
  {
    id: 'en.past-perfect',
    slug: 'past-perfect',
    title: 'Past Perfect',
    emoji: '⏪',
    description: 'had + V3: geçmişte iki olayda önce olanı anlatmak, by the time kalıbı.',
    keywords: 'had started · before we arrived · By the time · Simple Past vs Past Perfect',
  },
  {
    id: 'en.gerund-infinitive',
    slug: 'gerund-infinitive',
    title: 'Gerund & Infinitive',
    emoji: '🔗',
    description: 'enjoy doing / decide to do gibi yüksek frekanslı kalıplar; look forward to doing.',
    keywords: 'enjoy doing · decide to do · look forward to doing · avoid keep want need plan hope',
  },
  {
    id: 'en.conditionals',
    slug: 'conditionals',
    title: 'Conditionals',
    emoji: '🔀',
    description: 'Zero/First ve özellikle Second Conditional: If I had…, I would…',
    keywords: 'If I had · I would · Zero First Second · hypothetical',
  },
  {
    id: 'en.prepositions-collocations',
    slug: 'prepositions-collocations',
    title: 'Prepositions & Collocations',
    emoji: '📌',
    description: 'interested in, listen to, depend on, pay attention to gibi hazır öbekler.',
    keywords: 'interested in · good at · listen to · wait for · depend on · pay attention to',
  },
];

export const EN_TOPIC_BY_ID = new Map(EN_TOPICS.map((entry) => [entry.id, entry]));
export const EN_TOPIC_BY_SLUG = new Map(EN_TOPICS.map((entry) => [entry.slug, entry]));

/**
 * Özet bölümleri. Kavramların `sectionId` alanı bu
 * listeye bağlanır; her kavramın çapası (`anchor`) özet metninde geçer.
 */
export const EN_SUMMARY_SECTIONS: EnSectionDef[] = [
  section('en.present-perfect', 'formula', 'Temel Formül — Özne + have/has + V3'),
  section('en.present-perfect', 'have-has', 'have / has ve Kısaltmalar'),
  section('en.present-perfect', 'negatives', 'Olumsuz Cümle — haven\'t / hasn\'t'),
  section('en.present-perfect', 'questions', 'Soru ve Kısa Cevaplar'),
  section('en.present-perfect', 'v3', 'V3 — En Önemli Üçüncü Hâller'),
  section('en.present-perfect', 'for-since', 'for / since — Süre mi, Başlangıç mı?'),
  section('en.present-perfect', 'states', 'Süregelen Durumlar — know, live, work'),
  section('en.present-perfect', 'ever-never', 'Deneyim — ever / never'),
  section('en.present-perfect', 'markers', 'already / yet / just'),
  section('en.present-perfect', 'vs-past', 'Present Perfect vs Simple Past'),
  section('en.present-perfect', 'mistakes', 'Sık Hatalar'),
  section('en.present-perfect', 'writing', 'Yazma Görevleri'),
  // Sentence Structure
  section('en.sentence-structure', 'svo', 'SVO — Özne + Fiil + Nesne'),
  section('en.sentence-structure', 'place-time', 'Yer + Zaman Sırası'),
  section('en.sentence-structure', 'questions', 'Soru Düzeni ve Dolaylı Sorular'),
  section('en.sentence-structure', 'expansion', 'Cümle Genişletme'),
  section('en.sentence-structure', 'connectors', 'Bağlaçlar — and/but/because/so/however'),
  section('en.sentence-structure', 'mistakes', 'Sık Hatalar'),
  // Past Perfect
  section('en.past-perfect', 'formula', 'Formül — had + V3'),
  section('en.past-perfect', 'timeline', 'Zaman Çizgisi — Önce Olan'),
  section('en.past-perfect', 'vs-past', 'Simple Past vs Past Perfect'),
  section('en.past-perfect', 'by-the-time', 'by the time / before / after'),
  section('en.past-perfect', 'mistakes', 'Sık Hatalar'),
  // Gerund & Infinitive
  section('en.gerund-infinitive', 'gerund', 'Gerund Kalıpları — enjoy doing'),
  section('en.gerund-infinitive', 'infinitive', 'Infinitive Kalıpları — decide to do'),
  section('en.gerund-infinitive', 'look-forward', 'look forward to doing'),
  section('en.gerund-infinitive', 'production', 'Aktif Üretim — Kalıp Seçimi'),
  section('en.gerund-infinitive', 'mistakes', 'Sık Hatalar'),
  // Conditionals
  section('en.conditionals', 'zero-first', 'Zero & First Conditional'),
  section('en.conditionals', 'second', 'Second Conditional — If + Past, would + V1'),
  section('en.conditionals', 'hypotheticals', 'Kişisel Hayaller — If I lived…'),
  section('en.conditionals', 'mistakes', 'Sık Hatalar'),
  // Prepositions & Collocations
  section('en.prepositions-collocations', 'chunks-a', 'Öbekler A — interested in, good at, listen to'),
  section('en.prepositions-collocations', 'chunks-b', 'Öbekler B — wait for, depend on, believe in'),
  section('en.prepositions-collocations', 'chunks-c', 'Öbekler C — pay attention to, afraid of, ready for'),
  section('en.prepositions-collocations', 'production', 'Aktif Üretim — Öbek Seçimi'),
  section('en.prepositions-collocations', 'mistakes', 'Sık Hatalar'),
];

export const EN_SECTION_BY_ID = new Map(EN_SUMMARY_SECTIONS.map((entry) => [entry.id, entry]));

export function enSectionsForTopic(topicId: string): EnSectionDef[] {
  return EN_SUMMARY_SECTIONS.filter((entry) => entry.topicId === topicId);
}

/* ------------------------------------------------------------------ */
/* İngilizce Genel Tekrar özeti bölümleri                              */
/* ------------------------------------------------------------------ */

export interface EnReviewSectionDef {
  id: string;
  title: string;
  topicId?: string;
  mode?: 'mixed' | 'vocab' | 'quick';
}

export const EN_REVIEW_SECTIONS: EnReviewSectionDef[] = [
  { id: 'genel-en.nasil-kullanilir', title: 'Nasıl Kullanılır?' },
  { id: 'genel-en.present-perfect', title: 'Present Perfect', topicId: 'en.present-perfect' },
  { id: 'genel-en.sentence-structure', title: 'Sentence Structure', topicId: 'en.sentence-structure' },
  { id: 'genel-en.past-perfect', title: 'Past Perfect', topicId: 'en.past-perfect' },
  { id: 'genel-en.gerund-infinitive', title: 'Gerund & Infinitive', topicId: 'en.gerund-infinitive' },
  { id: 'genel-en.conditionals', title: 'Conditionals', topicId: 'en.conditionals' },
  { id: 'genel-en.prepositions', title: 'Prepositions & Collocations', topicId: 'en.prepositions-collocations' },
  { id: 'genel-en.kaliplar', title: 'Konuşma Kalıpları', mode: 'mixed' },
  { id: 'genel-en.hizli-tekrar', title: 'Hızlı Özet Turu', mode: 'quick' },
];

export const EN_REVIEW_SECTION_BY_ID = new Map(EN_REVIEW_SECTIONS.map((entry) => [entry.id, entry]));
