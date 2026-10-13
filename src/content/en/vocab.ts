/**
 * İngilizce kelime/öbek envanteri — Almanca envanterden TAMAMEN ayrı.
 *
 * 1. hafta kapsamı: Present Perfect işaret kelimeleri + Sentence Structure,
 * Past Perfect, Gerund/Infinitive chunk'ları, Conditionals iskeletleri,
 * Prepositions & Collocations öbekleri ve genel B1 okuma sözlüğü.
 * Kategoriler içerikten türetilir (General, Collocations, Grammar Chunks,
 * Irregular Verbs, Reading Vocabulary).
 *
 * `german` alanı hedef-dil (İngilizce) biçimini taşır; `lang: 'en'` ses ve
 * yönerge seçimini yönlendirir. Kimlikler `en-v-` önekli olduğu için
 * ilerleme kayıtları Almancayla asla çakışmaz.
 */

import type { VocabEntry } from '../vocabulary/inventory.ts';

function v(entry: VocabEntry): VocabEntry {
  return { ...entry, lang: 'en' as const };
}

export const EN_VOCABULARY: VocabEntry[] = [
  /* ---------------- İşaret kelimeleri (9) ---------------- */
  v({ id: 'en-v-for', german: 'for', base: 'for', turkish: '-dır/-dir (süre: üç yıldır)', type: 'preposition', topicIds: ['en.present-perfect'], ttsText: 'for', source: 'Present Perfect › for / since' }),
  v({ id: 'en-v-since', german: 'since', base: 'since', turkish: '-den beri (başlangıç: 2023\'ten beri)', type: 'preposition', topicIds: ['en.present-perfect'], ttsText: 'since', source: 'Present Perfect › for / since' }),
  v({ id: 'en-v-ever', german: 'ever', base: 'ever', turkish: 'hiç (hayatında herhangi bir zamanda)', type: 'adverb', topicIds: ['en.present-perfect'], ttsText: 'ever', source: 'Present Perfect › ever / never' }),
  v({ id: 'en-v-never', german: 'never', base: 'never', turkish: 'hiçbir zaman / asla', type: 'adverb', topicIds: ['en.present-perfect'], ttsText: 'never', source: 'Present Perfect › ever / never' }),
  v({ id: 'en-v-already', german: 'already', base: 'already', turkish: 'zaten (çoktan)', type: 'adverb', topicIds: ['en.present-perfect'], ttsText: 'already', source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-yet', german: 'yet', base: 'yet', turkish: 'henüz (olumsuz/soru)', type: 'adverb', topicIds: ['en.present-perfect'], ttsText: 'yet', source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-just', german: 'just', base: 'just', turkish: 'az önce / demin', type: 'adverb', topicIds: ['en.present-perfect'], ttsText: 'just', source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-for-a-long-time', german: 'for a long time', base: 'for a long time', turkish: 'uzun zamandır', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'for a long time', source: 'Present Perfect › for / since' }),
  v({ id: 'en-v-since-last-year', german: 'since last year', base: 'since last year', turkish: 'geçen yıldan beri', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'since last year', source: 'Present Perfect › for / since' }),

  /* ---------------- Çekirdek kalıplar (12) ---------------- */
  v({ id: 'en-v-have-known', german: 'have known', base: 'have known', turkish: 'tanıyorum (uzun süredir)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have known', source: 'Present Perfect › Süregelen Durumlar' }),
  v({ id: 'en-v-have-lived', german: 'have lived', base: 'have lived', turkish: 'yaşıyorum (uzun süredir)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have lived', source: 'Present Perfect › Süregelen Durumlar' }),
  v({ id: 'en-v-have-studied', german: 'have studied', base: 'have studied', turkish: 'çalışıyorum (uzun süredir)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have studied', source: 'Present Perfect › Süregelen Durumlar' }),
  v({ id: 'en-v-have-worked', german: 'have worked', base: 'have worked', turkish: 'çalışıyorum (bir yerde, uzun süredir)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have worked', source: 'Present Perfect › Süregelen Durumlar' }),
  v({ id: 'en-v-have-never-been', german: 'have never been', base: 'have never been', turkish: 'hiç bulunmadım / hiç gitmedim', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have never been', source: 'Present Perfect › ever / never' }),
  v({ id: 'en-v-have-already-finished', german: 'have already finished', base: 'have already finished', turkish: 'çoktan bitirdim', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have already finished', source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-havent-finished-yet', german: "haven't finished yet", base: "haven't finished yet", turkish: 'henüz bitirmedim', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: "haven't finished yet", source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-have-just-finished', german: 'have just finished', base: 'have just finished', turkish: 'demin bitirdim', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have just finished', source: 'Present Perfect › already / yet / just' }),
  v({ id: 'en-v-have-seen', german: 'have seen', base: 'have seen', turkish: 'gördüm (deneyim)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have seen', source: 'Present Perfect › Deneyim' }),
  v({ id: 'en-v-has-finished', german: 'has finished', base: 'has finished', turkish: 'bitirdi (o)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'has finished', source: 'Present Perfect › have / has' }),
  v({ id: 'en-v-have-been-to', german: 'have been to', base: 'have been to', turkish: '-e gittim (bulundum)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have been to', source: 'Present Perfect › Deneyim' }),
  v({ id: 'en-v-have-had', german: 'have had', base: 'have had', turkish: 'sahip oldum / yaşadım (deneyim)', type: 'phrase', topicIds: ['en.present-perfect'], ttsText: 'have had', source: 'Present Perfect › V3' }),

  /* ---------------- Düzensiz V3 çağrışımları (12) ---------------- */
  v({ id: 'en-v-see-seen', german: 'see → seen', base: 'see → seen', turkish: 'görmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'see, seen', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-know-known', german: 'know → known', base: 'know → known', turkish: 'tanımak / bilmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'know, known', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-be-been', german: 'be → been', base: 'be → been', turkish: 'olmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'be, been', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-go-gone', german: 'go → gone', base: 'go → gone', turkish: 'gitmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'go, gone', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-do-done', german: 'do → done', base: 'do → done', turkish: 'yapmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'do, done', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-make-made', german: 'make → made', base: 'make → made', turkish: 'yapmak / üretmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'make, made', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-take-taken', german: 'take → taken', base: 'take → taken', turkish: 'almak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'take, taken', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-write-written', german: 'write → written', base: 'write → written', turkish: 'yazmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'write, written', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-speak-spoken', german: 'speak → spoken', base: 'speak → spoken', turkish: 'konuşmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'speak, spoken', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-eat-eaten', german: 'eat → eaten', base: 'eat → eaten', turkish: 'yemek yemek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'eat, eaten', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-come-come', german: 'come → come', base: 'come → come', turkish: 'gelmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'come, come', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-meet-met', german: 'meet → met', base: 'meet → met', turkish: 'tanışmak / buluşmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'meet, met', source: 'Present Perfect › V3' }),

  /* ---------------- Düzenli V3 çağrışımları (5) ---------------- */
  v({ id: 'en-v-work-worked', german: 'work → worked', base: 'work → worked', turkish: 'çalışmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'work, worked', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-study-studied', german: 'study → studied', base: 'study → studied', turkish: 'ders çalışmak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'study, studied', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-finish-finished', german: 'finish → finished', base: 'finish → finished', turkish: 'bitirmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'finish, finished', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-visit-visited', german: 'visit → visited', base: 'visit → visited', turkish: 'ziyaret etmek', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'visit, visited', source: 'Present Perfect › V3' }),
  v({ id: 'en-v-live-lived', german: 'live → lived', base: 'live → lived', turkish: 'yaşamak', type: 'verb', topicIds: ['en.present-perfect'], ttsText: 'live, lived', source: 'Present Perfect › V3' }),

  /* ---------------- Sentence Structure (8) ---------------- */
  v({ id: 'en-v-every-evening', german: 'every evening', base: 'every evening', turkish: 'her akşam', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'every evening', source: 'Sentence Structure › SVO + zaman' }),
  v({ id: 'en-v-in-the-library', german: 'in the library', base: 'in the library', turkish: 'kütüphanede', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'in the library', source: 'Sentence Structure › yer + zaman' }),
  v({ id: 'en-v-where-is-bank', german: 'Where is the bank?', base: 'Where is the bank?', turkish: 'Banka nerede?', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'Where is the bank?', source: 'Sentence Structure › soru düzeni' }),
  v({ id: 'en-v-know-where', german: 'Do you know where the bank is?', base: 'Do you know where the bank is?', turkish: 'Bankanın nerede olduğunu biliyor musun?', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'Do you know where the bank is?', source: 'Sentence Structure › dolaylı soru' }),
  v({ id: 'en-v-because', german: 'because', base: 'because', turkish: 'çünkü', type: 'conjunction', topicIds: ['en.sentence-structure'], ttsText: 'because', source: 'Sentence Structure › bağlaçlar' }),
  v({ id: 'en-v-however', german: 'however', base: 'however', turkish: 'ancak', type: 'adverb', topicIds: ['en.sentence-structure'], ttsText: 'however', source: 'Sentence Structure › bağlaçlar' }),
  v({ id: 'en-v-place-before-time', german: 'place before time', base: 'place before time', turkish: 'önce yer, sonra zaman', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'place before time', source: 'Sentence Structure › yer + zaman' }),
  v({ id: 'en-v-study-abroad', german: 'study abroad', base: 'study abroad', turkish: 'yurt dışında okumak', type: 'phrase', topicIds: ['en.sentence-structure'], ttsText: 'study abroad', source: 'Sentence Structure › genişletme' }),

  /* ---------------- Past Perfect (8) ---------------- */
  v({ id: 'en-v-had-started', german: 'had started', base: 'had started', turkish: 'başlamıştı (önce)', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'had started', source: 'Past Perfect › had + V3' }),
  v({ id: 'en-v-by-the-time', german: 'by the time', base: 'by the time', turkish: '-dığında (o zamana kadar)', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'by the time', source: 'Past Perfect › by the time' }),
  v({ id: 'en-v-before-we-arrived', german: 'before we arrived', base: 'before we arrived', turkish: 'biz varmadan önce', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'before we arrived', source: 'Past Perfect › before' }),
  v({ id: 'en-v-had-left', german: 'had left', base: 'had left', turkish: 'gitmişti (önce)', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'had left', source: 'Past Perfect › had + V3' }),
  v({ id: 'en-v-had-finished', german: 'had finished', base: 'had finished', turkish: 'bitirmişti (önce)', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'had finished', source: 'Past Perfect › had + V3' }),
  v({ id: 'en-v-after-rain', german: 'after the rain had stopped', base: 'after the rain had stopped', turkish: 'yağmur durduktan sonra', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'after the rain had stopped', source: 'Past Perfect › after' }),
  v({ id: 'en-v-had-lost', german: 'had lost', base: 'had lost', turkish: 'kaybetmişti', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'had lost', source: 'Past Perfect › V3' }),
  v({ id: 'en-v-had-studied', german: 'had studied', base: 'had studied', turkish: 'çalışmıştı (önce)', type: 'phrase', topicIds: ['en.past-perfect'], ttsText: 'had studied', source: 'Past Perfect › had + V3' }),

  /* ---------------- Gerund & Infinitive chunks (16) ---------------- */
  v({ id: 'en-v-enjoy-doing', german: 'enjoy doing', base: 'enjoy doing', turkish: 'yapmaktan hoşlanmak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'enjoy doing', source: 'Gerund › enjoy doing' }),
  v({ id: 'en-v-finish-doing', german: 'finish doing', base: 'finish doing', turkish: 'yapmayı bitirmek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'finish doing', source: 'Gerund › finish doing' }),
  v({ id: 'en-v-avoid-doing', german: 'avoid doing', base: 'avoid doing', turkish: 'yapmaktan kaçınmak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'avoid doing', source: 'Gerund › avoid doing' }),
  v({ id: 'en-v-keep-doing', german: 'keep doing', base: 'keep doing', turkish: 'yapmaya devam etmek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'keep doing', source: 'Gerund › keep doing' }),
  v({ id: 'en-v-want-to-do', german: 'want to do', base: 'want to do', turkish: 'yapmak istemek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'want to do', source: 'Infinitive › want to do' }),
  v({ id: 'en-v-decide-to-do', german: 'decide to do', base: 'decide to do', turkish: 'yapmaya karar vermek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'decide to do', source: 'Infinitive › decide to do' }),
  v({ id: 'en-v-need-to-do', german: 'need to do', base: 'need to do', turkish: 'yapması gerekmek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'need to do', source: 'Infinitive › need to do' }),
  v({ id: 'en-v-plan-to-do', german: 'plan to do', base: 'plan to do', turkish: 'yapmayı planlamak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'plan to do', source: 'Infinitive › plan to do' }),
  v({ id: 'en-v-hope-to-do', german: 'hope to do', base: 'hope to do', turkish: 'yapmayı ummak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'hope to do', source: 'Infinitive › hope to do' }),
  v({ id: 'en-v-look-forward-doing', german: 'look forward to doing', base: 'look forward to doing', turkish: 'dört gözle beklemek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'look forward to doing', source: 'Gerund › look forward to doing' }),
  v({ id: 'en-v-stop-doing', german: 'stop doing', base: 'stop doing', turkish: 'yapmayı bırakmak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'stop doing', source: 'Gerund › stop doing' }),
  v({ id: 'en-v-miss-doing', german: 'miss doing', base: 'miss doing', turkish: 'yapmayı özlemek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'miss doing', source: 'Gerund › miss doing' }),
  v({ id: 'en-v-promise-to-do', german: 'promise to do', base: 'promise to do', turkish: 'yapmaya söz vermek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'promise to do', source: 'Infinitive › promise' }),
  v({ id: 'en-v-try-to-do', german: 'try to do', base: 'try to do', turkish: 'yapmaya çalışmak', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'try to do', source: 'Infinitive › try' }),
  v({ id: 'en-v-offer-to-do', german: 'offer to do', base: 'offer to do', turkish: 'yapmayı teklif etmek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'offer to do', source: 'Infinitive › offer' }),
  v({ id: 'en-v-hate-doing', german: 'hate doing', base: 'hate doing', turkish: 'yapmaktan nefret etmek', type: 'phrase', topicIds: ['en.gerund-infinitive'], ttsText: 'hate doing', source: 'Gerund › hate doing' }),

  /* ---------------- Conditionals (8) ---------------- */
  v({ id: 'en-v-if-had-would', german: 'If I had…, I would…', base: 'If I had…, I would…', turkish: 'Second Conditional iskeleti', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If I had, I would', source: 'Conditionals › Second' }),
  v({ id: 'en-v-if-lived', german: 'If I lived abroad…', base: 'If I lived abroad…', turkish: 'yurt dışında yaşasaydım…', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If I lived abroad', source: 'Conditionals › hayaller' }),
  v({ id: 'en-v-if-were-you', german: 'If I were you…', base: 'If I were you…', turkish: 'senin yerinde olsaydım…', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If I were you', source: 'Conditionals › Second' }),
  v({ id: 'en-v-would-study', german: 'I would study…', base: 'I would study…', turkish: 'çalışırdım… (hayal sonucu)', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'I would study', source: 'Conditionals › Second' }),
  v({ id: 'en-v-if-heat-boils', german: 'If you heat water, it boils.', base: 'If you heat water, it boils.', turkish: 'Suyu ısıtırsan kaynar. (Zero)', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If you heat water, it boils', source: 'Conditionals › Zero' }),
  v({ id: 'en-v-if-rains-will', german: 'If it rains, I will stay.', base: 'If it rains, I will stay.', turkish: 'Yağmur yağarsa kalırım. (First)', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If it rains, I will stay', source: 'Conditionals › First' }),
  v({ id: 'en-v-could-speak', german: 'If I could speak fluently…', base: 'If I could speak fluently…', turkish: 'akıcı konuşabilseydim…', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'If I could speak fluently', source: 'Conditionals › Second' }),
  v({ id: 'en-v-would-travel', german: 'I would travel…', base: 'I would travel…', turkish: 'seyahat ederdim…', type: 'phrase', topicIds: ['en.conditionals'], ttsText: 'I would travel', source: 'Conditionals › Second' }),

  /* ---------------- Prepositions & Collocations (20) ---------------- */
  v({ id: 'en-v-interested-in', german: 'interested in', base: 'interested in', turkish: 'ilgilenmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'interested in', source: 'Prepositions › interested in' }),
  v({ id: 'en-v-good-at', german: 'good at', base: 'good at', turkish: '…de iyi olmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'good at', source: 'Prepositions › good at' }),
  v({ id: 'en-v-listen-to', german: 'listen to', base: 'listen to', turkish: 'dinlemek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'listen to', source: 'Prepositions › listen to' }),
  v({ id: 'en-v-wait-for', german: 'wait for', base: 'wait for', turkish: 'beklemek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'wait for', source: 'Prepositions › wait for' }),
  v({ id: 'en-v-depend-on', german: 'depend on', base: 'depend on', turkish: 'bağlı olmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'depend on', source: 'Prepositions › depend on' }),
  v({ id: 'en-v-believe-in', german: 'believe in', base: 'believe in', turkish: 'inanmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'believe in', source: 'Prepositions › believe in' }),
  v({ id: 'en-v-believe-myself', german: 'believe in myself', base: 'believe in myself', turkish: 'kendime inanmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'believe in myself', source: 'Prepositions › believe in myself' }),
  v({ id: 'en-v-pay-attention', german: 'pay attention to', base: 'pay attention to', turkish: 'dikkat etmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'pay attention to', source: 'Prepositions › pay attention to' }),
  v({ id: 'en-v-afraid-of', german: 'afraid of', base: 'afraid of', turkish: 'korkmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'afraid of', source: 'Prepositions › afraid of' }),
  v({ id: 'en-v-ready-for', german: 'ready for', base: 'ready for', turkish: 'hazır olmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'ready for', source: 'Prepositions › ready for' }),
  v({ id: 'en-v-different-from', german: 'different from', base: 'different from', turkish: 'farklı olmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'different from', source: 'Prepositions › different from' }),
  v({ id: 'en-v-for-years', german: 'for three years', base: 'for three years', turkish: 'üç yıldır', type: 'phrase', topicIds: ['en.prepositions-collocations', 'en.present-perfect'], ttsText: 'for three years', source: 'Prepositions › for (süre)' }),
  v({ id: 'en-v-since-2023', german: 'since 2023', base: 'since 2023', turkish: '2023’ten beri', type: 'phrase', topicIds: ['en.prepositions-collocations', 'en.present-perfect'], ttsText: 'since 2023', source: 'Prepositions › since (başlangıç)' }),
  v({ id: 'en-v-travel-abroad', german: 'travel abroad', base: 'travel abroad', turkish: 'yurt dışına seyahat', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'travel abroad', source: 'Prepositions › travel' }),
  v({ id: 'en-v-help-you', german: 'help you', base: 'help you', turkish: 'sana yardım etmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'help you', source: 'Prepositions › help' }),
  v({ id: 'en-v-take-bus', german: 'take the bus', base: 'take the bus', turkish: 'otobüse binmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'take the bus', source: 'Prepositions › take' }),
  v({ id: 'en-v-get-up', german: 'get up early', base: 'get up early', turkish: 'erken kalkmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'get up early', source: 'Prepositions › get up' }),
  v({ id: 'en-v-work-abroad', german: 'work abroad', base: 'work abroad', turkish: 'yurt dışında çalışmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'work abroad', source: 'Prepositions › work' }),
  v({ id: 'en-v-museums-day', german: 'visit museums every day', base: 'visit museums every day', turkish: 'her gün müze gezmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'visit museums every day', source: 'Prepositions › visit' }),
  v({ id: 'en-v-world-travel', german: 'travel the world', base: 'travel the world', turkish: 'dünyayı gezmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'travel the world', source: 'Prepositions › travel' }),
  v({ id: 'en-v-make-decision', german: 'make a decision', base: 'make a decision', turkish: 'karar vermek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'make a decision', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-take-break', german: 'take a break', base: 'take a break', turkish: 'mola vermek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'take a break', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-do-homework', german: 'do homework', base: 'do homework', turkish: 'ödev yapmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'do homework', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-make-mistake', german: 'make a mistake', base: 'make a mistake', turkish: 'hata yapmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'make a mistake', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-take-part', german: 'take part in', base: 'take part in', turkish: 'katılmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'take part in', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-look-for', german: 'look for', base: 'look for', turkish: 'aramak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'look for', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-look-after', german: 'look after', base: 'look after', turkish: 'bakmak (özen göstermek)', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'look after', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-late-for', german: 'be late for', base: 'be late for', turkish: '…e geç kalmak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'be late for', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-proud-of', german: 'be proud of', base: 'be proud of', turkish: 'gurur duymak', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'be proud of', source: 'Prepositions › öbek genişletme' }),
  v({ id: 'en-v-worry-about', german: 'worry about', base: 'worry about', turkish: 'endişelenmek', type: 'phrase', topicIds: ['en.prepositions-collocations'], ttsText: 'worry about', source: 'Prepositions › öbek genişletme' }),

  /* ---------------- Reading / genel B1 (10) ---------------- */
  v({ id: 'en-v-improve', german: 'improve', base: 'improve', turkish: 'geliştirmek', type: 'verb', topicIds: ['en.present-perfect', 'en.prepositions-collocations'], ttsText: 'improve', source: 'Reading › genel B1' }),
  v({ id: 'en-v-experience', german: 'experience', base: 'experience', turkish: 'deneyim', type: 'noun', topicIds: ['en.present-perfect'], ttsText: 'experience', source: 'Reading › genel B1' }),
  v({ id: 'en-v-journey', german: 'journey', base: 'journey', turkish: 'yolculuk / serüven', type: 'noun', topicIds: ['en.present-perfect'], ttsText: 'journey', source: 'Reading › genel B1' }),
  v({ id: 'en-v-abroad', german: 'abroad', base: 'abroad', turkish: 'yurt dışında', type: 'adverb', topicIds: ['en.conditionals', 'en.prepositions-collocations'], ttsText: 'abroad', source: 'Reading › genel B1' }),
  v({ id: 'en-v-fluent', german: 'fluent', base: 'fluent', turkish: 'akıcı', type: 'adjective', topicIds: ['en.conditionals'], ttsText: 'fluent', source: 'Reading › genel B1' }),
  v({ id: 'en-v-brave', german: 'brave', base: 'brave', turkish: 'cesur', type: 'adjective', topicIds: ['en.conditionals'], ttsText: 'brave', source: 'Reading › genel B1' }),
  v({ id: 'en-v-escape', german: 'escape', base: 'escape', turkish: 'kaçmak', type: 'verb', topicIds: ['en.past-perfect'], ttsText: 'escape', source: 'Reading › genel B1' }),
  v({ id: 'en-v-decide-verb', german: 'decide', base: 'decide', turkish: 'karar vermek', type: 'verb', topicIds: ['en.gerund-infinitive'], ttsText: 'decide', source: 'Reading › genel B1' }),
  v({ id: 'en-v-avoid-verb', german: 'avoid', base: 'avoid', turkish: 'kaçınmak', type: 'verb', topicIds: ['en.gerund-infinitive'], ttsText: 'avoid', source: 'Reading › genel B1' }),
  v({ id: 'en-v-weather', german: 'weather', base: 'weather', turkish: 'hava (durumu)', type: 'noun', topicIds: ['en.prepositions-collocations'], ttsText: 'weather', source: 'Reading › genel B1' }),
];

export const EN_VOCAB_BY_ID = new Map(EN_VOCABULARY.map((entry) => [entry.id, entry]));
