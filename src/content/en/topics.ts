/**
 * İngilizce müfredat — Almanca müfredatla aynı felsefe (KONU tabanlı).
 *
 * Kimlik kuralı Almancayla aynıdır: `id` kararlıdır ve ASLA değişmez.
 * İngilizce konular `en.` öneki taşır; Almanca `topic.` kayıtlarıyla
 * çakışmaz. Bu görevde yalnızca BİR konu vardır: Present Perfect.
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
  return { id: `${topicId === 'en.present-perfect' ? 'present-perfect' : topicId}.${name}`, topicId, title };
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
];

export const EN_TOPIC_BY_ID = new Map(EN_TOPICS.map((entry) => [entry.id, entry]));
export const EN_TOPIC_BY_SLUG = new Map(EN_TOPICS.map((entry) => [entry.slug, entry]));

/**
 * `en.present-perfect` özet bölümleri. Kavramların `sectionId` alanı bu
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
  { id: 'genel-en.kaliplar', title: 'Konuşma Kalıpları', mode: 'mixed' },
  { id: 'genel-en.hizli-tekrar', title: 'Hızlı Özet Turu', mode: 'quick' },
];

export const EN_REVIEW_SECTION_BY_ID = new Map(EN_REVIEW_SECTIONS.map((entry) => [entry.id, entry]));
