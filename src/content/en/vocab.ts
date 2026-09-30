/**
 * İngilizce kelime/öbek envanteri — Almanca envanterden TAMAMEN ayrı.
 *
 * Bu görevde YALNIZCA Present Perfect konusunun öğrettiği işaret
 * kelimeleri, kalıplar ve V3 çağrışımları bulunur (~38 girdi). Genel B1
 * sözlüğü aktarılmaz; gelecek konular kendi girdilerini ekler.
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
];

export const EN_VOCAB_BY_ID = new Map(EN_VOCABULARY.map((entry) => [entry.id, entry]));
