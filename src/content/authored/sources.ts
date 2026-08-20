/**
 * Gün 4–6 kaynak envanteri.
 *
 * Kayıtlar, 2026-08-17 tarihinde `İlk 3 Hafta İlerleme.md` içindeki gerçek
 * atamalardan çıkarıldı. `tr-orig` otomatik YouTube altyazıları `yt-dlp` ile
 * indirildi; altyazısı olmayan video yalnızca başlık/açıklama düzeyinde
 * işaretlendi. Bu dosya öğrenme içeriği üretmez: hangi özet konusunun hangi
 * videoya dayandığını denetlenebilir kılar.
 */

export type TranscriptEvidence = 'automatic-turkish-captions' | 'video-description';

export interface LearningSourceVideo {
  id: string;
  day: 4 | 5 | 6;
  playlist: 'A' | 'B';
  title: string;
  url: string;
  duration: string;
  transcriptAvailable: boolean;
  transcriptSource?: TranscriptEvidence;
  /** Altyazı/açıklamada doğrudan görülen, bu projede kullanılan başlıklar. */
  identifiedTopics: string[];
}

export interface SourceTopicMapping {
  day: 4 | 5 | 6;
  topicId: string;
  sourceIds: string[];
}

export const DAY_4_6_SOURCE_INVENTORY: LearningSourceVideo[] = [
  {
    id: 'yt-FcFYDmYngaE', day: 4, playlist: 'A', duration: '32:10',
    title: '16. Ders | [A1] | Almanca Aylar, Doğum Günü Söyleme ve Sıra Sayıları',
    url: 'https://www.youtube.com/watch?v=FcFYDmYngaE',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['yaş sorma ve söyleme', 'sıra sayıları', 'aylar', 'doğum günü kalıpları'],
  },
  {
    id: 'yt-QaWYcOmchyI', day: 4, playlist: 'A', duration: '20:38',
    title: '17. Ders | [A1] | Almanca Günler, Aylar ve Mevsimler - die Tage, Monate, Jahreszeiten',
    url: 'https://www.youtube.com/watch?v=QaWYcOmchyI',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['günler', 'aylar', 'mevsimler', 'Welcher Tag ist heute?', 'bugünün tarihi'],
  },
  {
    id: 'yt-mAkiR0TLZCE', day: 4, playlist: 'A', duration: '8:04',
    title: '18. Ders | [A1] | Almanca Aylar, Günler, Doğum Günü Alıştırma Videosu',
    url: 'https://www.youtube.com/watch?v=mAkiR0TLZCE',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['gün-ay-mevsim eşleştirmesi', 'tarih söyleme', 'doğum günü pratiği', 'sıra sayıları'],
  },
  {
    id: 'yt-Ksp7ojaZ16Y', day: 4, playlist: 'B', duration: '16:20',
    title: 'Almanca Temel A1/A2 Ders - 13 Almanca Günler- Die Tage - Wann?, Bis wann?, Von wann bis wann?',
    url: 'https://www.youtube.com/watch?v=Ksp7ojaZ16Y',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['haftanın günleri', 'am Montag', 'Wann?', 'von ... bis ...', 'günle zaman ifadesi'],
  },
  {
    id: 'yt-TDo7S7JyoTU', day: 4, playlist: 'B', duration: '21:20',
    title: 'Almanca Temel A1/A2 Ders - 21 Almanca Aylar - Die Monate, Sıralama Sayıları, Doğum Gününü Söyleme',
    url: 'https://www.youtube.com/watch?v=TDo7S7JyoTU',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['im Januar', 'sıra sayıları', 'am dritten Mai', 'Wann hast du Geburtstag?'],
  },
  {
    id: 'yt-IQVCLqP2vhI', day: 5, playlist: 'A', duration: '22:00',
    title: '19. Ders | [A1] | Almanca Artikel Kuralları ve Artikel Ezberleme',
    url: 'https://www.youtube.com/watch?v=IQVCLqP2vhI',
    transcriptAvailable: false, transcriptSource: 'video-description',
    identifiedTopics: ['der, die, das kullanımı', 'artikel ezberleme', 'örnek cümleler'],
  },
  {
    id: 'yt-5dx-x8k35G0', day: 5, playlist: 'A', duration: '9:58',
    title: '20. Ders | [A1] | Almanca Kelimeleri Çoğul Yapma Kuralları',
    url: 'https://www.youtube.com/watch?v=5dx-x8k35G0',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['çoğulda die', '-e', '-(e)n', '-er', '-s', 'Umlaut', 'sözlükte çoğul'],
  },
  {
    id: 'yt-0unZQgXhVW0', day: 5, playlist: 'A', duration: '14:57',
    title: '21. Ders | [A1] | Almanca Belirli ve Belirsiz Artikeller "Der Die Das / Ein Eine"',
    url: 'https://www.youtube.com/watch?v=0unZQgXhVW0',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['belirli artikel', 'belirsiz artikel', 'ein/eine', 'Was ist das?', 'Wer ist das?'],
  },
  {
    id: 'yt-A8lYxyu1ktE', day: 5, playlist: 'B', duration: '22:01',
    title: 'Almanca Temel A1/A2 Ders - 7 Ein Eine Kein Keine Bölüm - 1 Almanca "Was ist das?" Sorusu, Cevapları',
    url: 'https://www.youtube.com/watch?v=A8lYxyu1ktE',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['Was ist das?', 'ein/eine', 'kein/keine', 'nesne tanıtma'],
  },
  {
    id: 'yt-JQ2Ce-UA714', day: 5, playlist: 'B', duration: '13:59',
    title: 'Almanca Temel A1/A2 Ders - 8 Ein Eine Kein Keine Bölüm - 2 Almanca Soru Cümleleri - Almanca Cevaplar',
    url: 'https://www.youtube.com/watch?v=JQ2Ce-UA714',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['kein/keine', 'Was ist das?', 'Wer ist das?', 'tekil-çoğul cevaplar'],
  },
  {
    id: 'yt-oAglnd1f-Xk', day: 6, playlist: 'A', duration: '22:14',
    title: '22. Ders | [A1] | Almanca A1 Önemli Fiiller ve Cümleler',
    url: 'https://www.youtube.com/watch?v=oAglnd1f-Xk',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['kommen', 'sein', 'sprechen', 'Woher kommst du?', 'Welche Sprache sprichst du?'],
  },
  {
    id: 'yt-8hSkhFuddJg', day: 6, playlist: 'A', duration: '17:14',
    title: '23. Ders | [A1] | Almanca Ülkeler, Uyruklar ve Diller',
    url: 'https://www.youtube.com/watch?v=8hSkhFuddJg',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['ülkeler', 'artikel alan ülkeler', 'uyruklar', 'diller', 'aus der Türkei'],
  },
  {
    id: 'yt-bJ0KZZoTuzI', day: 6, playlist: 'A', duration: '17:08',
    title: '24. Ders | [A1] | Almanca "sprechen" - "konuşmak" Fiil Çekimi ve Diller',
    url: 'https://www.youtube.com/watch?v=bJ0KZZoTuzI',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['sprechen çekimi', 'du sprichst', 'diller', 'Sprechen Sie Deutsch?'],
  },
  {
    id: 'yt-mUtfrhCYXqY', day: 6, playlist: 'B', duration: '22:54',
    title: 'Almanca Temel A1/A2 Ders - 22 Almanca Ülkeler Uyruklar - Die Länder, Die Nationalität',
    url: 'https://www.youtube.com/watch?v=mUtfrhCYXqY',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['ülkeler', 'uyruklar', 'Ich komme aus ...', 'Ich bin ...'],
  },
  {
    id: 'yt-MmHCUePC_lg', day: 6, playlist: 'B', duration: '17:47',
    title: 'Almanca Temel A1/A2 Ders - 23 Almanca Ülkeler ve Dilleri - Die Länder - Die Sprachen',
    url: 'https://www.youtube.com/watch?v=MmHCUePC_lg',
    transcriptAvailable: true, transcriptSource: 'automatic-turkish-captions',
    identifiedTopics: ['ülkeler', 'diller', 'Welche Sprache?', 'Ich spreche ...'],
  },
];

export const DAY_4_6_SOURCE_TOPICS: SourceTopicMapping[] = [
  { day: 4, topicId: 'day4.takvim-kelimeleri', sourceIds: ['yt-QaWYcOmchyI', 'yt-mAkiR0TLZCE', 'yt-Ksp7ojaZ16Y'] },
  { day: 4, topicId: 'day4.takvim-sorulari', sourceIds: ['yt-QaWYcOmchyI', 'yt-Ksp7ojaZ16Y', 'yt-TDo7S7JyoTU'] },
  { day: 4, topicId: 'day4.dogum-gunu-yas', sourceIds: ['yt-FcFYDmYngaE', 'yt-mAkiR0TLZCE', 'yt-TDo7S7JyoTU'] },
  { day: 5, topicId: 'day5.artikel-secimi', sourceIds: ['yt-IQVCLqP2vhI', 'yt-0unZQgXhVW0'] },
  { day: 5, topicId: 'day5.cogul-isimler', sourceIds: ['yt-5dx-x8k35G0', 'yt-JQ2Ce-UA714'] },
  { day: 5, topicId: 'day5.belirli-belirsiz', sourceIds: ['yt-0unZQgXhVW0', 'yt-A8lYxyu1ktE', 'yt-JQ2Ce-UA714'] },
  { day: 6, topicId: 'day6.onemli-fiiller', sourceIds: ['yt-oAglnd1f-Xk', 'yt-bJ0KZZoTuzI'] },
  { day: 6, topicId: 'day6.ulkeler-aus', sourceIds: ['yt-oAglnd1f-Xk', 'yt-8hSkhFuddJg', 'yt-mUtfrhCYXqY'] },
  { day: 6, topicId: 'day6.uyruklar-diller', sourceIds: ['yt-8hSkhFuddJg', 'yt-bJ0KZZoTuzI', 'yt-MmHCUePC_lg'] },
];

export function sourcesForDay(day: number): LearningSourceVideo[] {
  return DAY_4_6_SOURCE_INVENTORY.filter((source) => source.day === day);
}

/** Kaynak envanterinin özet ve kavram kaydıyla kopmadığını senkron sırasında doğrular. */
export function validateSourceMappings({
  sources,
  mappings,
  concepts,
  summaries,
}: {
  sources: LearningSourceVideo[];
  mappings: SourceTopicMapping[];
  concepts: Array<{ id: string; day: number; topicId: string }>;
  summaries: Array<{ day: number; topics: Array<{ id: string }> }>;
}): Array<import('../types.ts').ContentWarning> {
  const warnings: Array<import('../types.ts').ContentWarning> = [];
  const sourceById = new Map<string, LearningSourceVideo>();
  const summaryDays = new Map<string, number>();
  for (const day of summaries) for (const topic of day.topics) summaryDays.set(topic.id, day.day);

  for (const source of sources) {
    if (sourceById.has(source.id)) {
      warnings.push({ level: 'error', code: 'duplicate-source-id', message: 'Kaynak video kimliği tekrar ediyor.', ref: source.id });
      continue;
    }
    sourceById.set(source.id, source);
    if (!source.title || !source.url || !source.duration || !source.identifiedTopics.length) {
      warnings.push({ level: 'error', code: 'malformed-source', message: 'Kaynak video başlık, URL, süre ve konu taşımalı.', ref: source.id });
    }
    if (source.transcriptAvailable && !source.transcriptSource) {
      warnings.push({ level: 'error', code: 'malformed-source', message: 'Mevcut altyazının kaynağı belirtilmeli.', ref: source.id });
    }
  }

  const mappedSourceIds = new Set<string>();
  const mappedTopicIds = new Set<string>();
  for (const mapping of mappings) {
    mappedTopicIds.add(mapping.topicId);
    const summaryDay = summaryDays.get(mapping.topicId);
    if (summaryDay === undefined) {
      warnings.push({ level: 'error', code: 'source-topic-missing', message: 'Kaynak eşlemesi kayıtlı olmayan özet konusuna işaret ediyor.', ref: mapping.topicId });
    } else if (summaryDay !== mapping.day) {
      warnings.push({ level: 'error', code: 'source-topic-day-mismatch', message: 'Kaynak eşlemesinin gün numarası özet konusuyla uyuşmuyor.', ref: mapping.topicId });
    }
    if (!mapping.sourceIds.length) {
      warnings.push({ level: 'error', code: 'source-topic-empty', message: 'Özet konusu en az bir kaynak videoya bağlanmalı.', ref: mapping.topicId });
    }
    for (const sourceId of mapping.sourceIds) {
      mappedSourceIds.add(sourceId);
      const source = sourceById.get(sourceId);
      if (!source) {
        warnings.push({ level: 'error', code: 'source-video-missing', message: 'Özet konusu kayıtlı olmayan kaynak videoya işaret ediyor.', ref: sourceId });
      } else if (source.day !== mapping.day) {
        warnings.push({ level: 'error', code: 'source-video-day-mismatch', message: 'Özet konusu başka güne ait videoya bağlanmış.', ref: `${mapping.topicId}:${sourceId}` });
      }
    }
  }

  for (const source of sources) {
    if (!mappedSourceIds.has(source.id)) {
      warnings.push({ level: 'error', code: 'source-video-unmapped', message: 'Kaynak video hiçbir özet konusuna bağlanmamış.', ref: source.id });
    }
  }
  for (const concept of concepts.filter((item) => item.day >= 4 && item.day <= 6)) {
    if (!mappedTopicIds.has(concept.topicId)) {
      warnings.push({ level: 'error', code: 'source-concept-unmapped', message: 'Yeni gün kavramının kaynak özet eşlemesi yok.', ref: concept.id });
    }
  }
  return warnings;
}
