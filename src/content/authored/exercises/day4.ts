/** Gün 4 — takvim, tarih, doğum günü ve yaş için küratörlü havuz. */

import type { AuthoredExercise } from '../types.ts';
import { translation } from './translations.ts';

const KEL = 'day4.takvim-kelimeleri';
const SOR = 'day4.takvim-sorulari';
const DOG = 'day4.dogum-gunu-yas';

export const DAY4_EXERCISES: AuthoredExercise[] = [
  {
    id: 'd4-gunler-match', day: 4, topicId: KEL, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.hafta-gunleri'], familyId: 'd4-gunler',
    instruction: 'Haftanın günlerini Türkçe karşılıklarıyla eşleştir.',
    pairs: [{ left: 'Montag', right: 'pazartesi' }, { left: 'Mittwoch', right: 'çarşamba' }, { left: 'Freitag', right: 'cuma' }, { left: 'Sonntag', right: 'pazar' }],
    pronounce: ['Montag', 'Mittwoch', 'Freitag', 'Sonntag'],
  },
  {
    id: 'd4-aylar-match', day: 4, topicId: KEL, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.aylar'], familyId: 'd4-aylar',
    instruction: 'Ayları Türkçe karşılıklarıyla eşleştir.',
    pairs: [{ left: 'Januar', right: 'ocak' }, { left: 'März', right: 'mart' }, { left: 'Mai', right: 'mayıs' }, { left: 'Dezember', right: 'aralık' }],
    pronounce: ['Januar', 'März', 'Mai', 'Dezember'],
  },
  {
    id: 'd4-mevsimler-match', day: 4, topicId: KEL, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.mevsimler'], familyId: 'd4-mevsimler',
    instruction: 'Mevsimleri Türkçe karşılıklarıyla eşleştir.',
    pairs: [{ left: 'der Winter', right: 'kış' }, { left: 'der Frühling', right: 'ilkbahar' }, { left: 'der Sommer', right: 'yaz' }, { left: 'der Herbst', right: 'sonbahar' }],
    pronounce: ['der Winter', 'der Frühling', 'der Sommer', 'der Herbst'],
  },
  {
    id: 'd4-tag-wochentag-mc', day: 4, topicId: KEL, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.gun-hafta'], familyId: 'd4-takvim-sozcukleri',
    instruction: '`die Woche` ne demektir?', answer: 'hafta', options: ['hafta', 'gün', 'ay', 'mevsim'], pronounce: ['die Woche'],
  },
  {
    id: 'd4-gun-isim-buyuk-mc', day: 4, topicId: KEL, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.buyuk-harf'], familyId: 'd4-buyuk-harf',
    instruction: 'Hangi gün adı yazım açısından doğrudur?', answer: 'Montag', options: ['Montag', 'montag', 'MONtag', 'MonTag'],
    explanation: 'Gün ve ay adları Almancada isimdir; büyük harfle başlar.', pronounce: ['Montag'], validation: { caseSensitive: true },
  },
  {
    id: 'd4-welcher-tag-mc', day: 4, topicId: SOR, type: 'multiple-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day4.soru.welcher-tag'], familyId: 'd4-welcher-tag',
    instruction: '“Bugün hangi gün?” sorusu hangisidir?', answer: 'Welcher Tag ist heute?',
    options: ['Welcher Tag ist heute?', 'Wann hast du Geburtstag?', 'Wie alt bist du?', 'Welche Sprache sprichst du?'], pronounce: ['Welcher Tag ist heute?'],
  },
  {
    id: 'd4-heute-ist-fill', day: 4, topicId: SOR, type: 'fill-blank', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day4.soru.welcher-tag'], familyId: 'd4-welcher-tag',
    instruction: 'Boşluğu gün adıyla doldur. (Bugün çarşamba.)', prompt: 'Heute ist ___.', answer: 'Mittwoch', pronounce: ['Heute ist Mittwoch.'],
  },
  {
    id: 'd4-am-montag-fill', day: 4, topicId: SOR, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.zaman.am-im'], familyId: 'd4-am-im',
    instruction: 'Boşluğu gün için kullanılan kısa kalıpla doldur.', prompt: 'Ich habe ___ Montag Geburtstag.', answer: 'am',
    explanation: 'Bir olayın hangi gün olduğunu söylerken `am` kullanılır: `am Montag`.', pronounce: ['am Montag'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd4-im-mai-fill', day: 4, topicId: SOR, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.zaman.am-im'], familyId: 'd4-am-im',
    instruction: 'Boşluğu ay için kullanılan kısa kalıpla doldur.', prompt: 'Mein Geburtstag ist ___ Mai.', answer: 'im',
    explanation: 'Bir olayın hangi ayda olduğunu söylerken `im` kullanılır: `im Mai`.', pronounce: ['im Mai'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd4-ordinal-dritte-fill', day: 4, topicId: DOG, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day4.sira-sayisi.temel'], familyId: 'd4-ordinal-temel',
    instruction: '“Üçüncü” sıra sayısını Almanca yaz.', prompt: '3. = ___', answer: 'dritte', pronounce: ['dritte'],
  },
  {
    id: 'd4-ordinal-zwanzigste-fill', day: 4, topicId: DOG, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day4.sira-sayisi.temel'], familyId: 'd4-ordinal-yirmi',
    instruction: '“Yirminci” sıra sayısını Almanca yaz.', prompt: '20. = ___', answer: 'zwanzigste', pronounce: ['zwanzigste'],
  },
  {
    id: 'd4-geburtstag-fill', day: 4, topicId: DOG, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.dogum-gunu.wann', 'day4.tarih.am-en'], familyId: 'd4-geburtstag-dritte-mai',
    instruction: 'Boşluğu doğum günü kalıbıyla tamamla. (3 Mayıs)', prompt: 'Doğum günüm 3 Mayıs: Ich habe am ___ Mai Geburtstag.', answer: 'dritten',
    explanation: 'Tarih kalıbında `am dritten Mai` denir; `dritte` burada `-en` biçimine girer.', pronounce: ['Ich habe am dritten Mai Geburtstag.'],
  },
  {
    id: 'd4-geburtstag-wann-free', day: 4, topicId: DOG, type: 'free-text', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.dogum-gunu.wann', 'day4.tarih.am-en'], familyId: 'd4-geburtstag-dritte-mai',
    instruction: 'Mini diyaloga 3 Mayıs bilgisiyle cevap ver.', prompt: 'A: Wann hast du Geburtstag?\nB: ___',
    answer: 'Ich habe am dritten Mai Geburtstag.', acceptedAnswers: ['Ich habe am dritten Mai Geburtstag'],
    explanation: 'Doğum günü için `Ich habe am ... Geburtstag.` kalıbını kullan.', pronounce: ['Wann hast du Geburtstag?', 'Ich habe am dritten Mai Geburtstag.'],
  },
  {
    id: 'd4-wie-alt-fill', day: 4, topicId: DOG, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day4.yas.wie-alt'], familyId: 'd4-wie-alt',
    instruction: '`sein` fiilini doğru çek. (Sen kaç yaşındasın?)', prompt: 'Soru: Wie alt ___ du?', answer: 'bist', pronounce: ['Wie alt bist du?'],
  },
  {
    id: 'd4-yas-free', day: 4, topicId: DOG, type: 'free-text', difficulty: 'hard', skill: 'production',
    conceptIds: ['day4.yas.wie-alt'], familyId: 'd4-wie-alt',
    instruction: 'Yirmi yaşında olduğunu tam cümleyle söyle.', answer: 'Ich bin zwanzig Jahre alt.',
    acceptedAnswers: ['Ich bin zwanzig Jahre alt', 'Ich bin zwanzig.'], openEnded: true,
    explanation: 'Tam biçim `Ich bin zwanzig Jahre alt.`tır; günlük konuşmada `Ich bin zwanzig.` de duyulur.', pronounce: ['Ich bin zwanzig Jahre alt.'],
  },
  {
    id: 'd4-heute-mittwoch-builder', day: 4, topicId: SOR, type: 'sentence-builder', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.soru.welcher-tag'], familyId: 'd4-welcher-tag',
    instruction: '“Bugün çarşamba.” cümlesini kur.', prompt: 'Bugün çarşamba.', answer: 'Heute ist Mittwoch.', pronounce: ['Heute ist Mittwoch.'],
  },
  {
    id: 'd4-am-freitag-builder', day: 4, topicId: SOR, type: 'sentence-builder', difficulty: 'hard', skill: 'production',
    conceptIds: ['day4.zaman.am-im'], familyId: 'd4-am-im',
    instruction: '“Doğum günüm cuma günü.” cümlesini kur.', prompt: 'Doğum günüm cuma günü.', answer: 'Ich habe am Freitag Geburtstag.', pronounce: ['Ich habe am Freitag Geburtstag.'],
  },
  {
    id: 'd4-dinle-heute-montag', day: 4, topicId: SOR, type: 'listen-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day4.soru.welcher-tag'], familyId: 'd4-dinle-heute', instruction: 'Dinle: duyduğun cümleyi seç.',
    audioText: 'Heute ist Montag.', audio: { prompt: { text: 'Heute ist Montag.', language: 'de-DE', role: 'prompt' } },
    answer: 'Heute ist Montag.', options: ['Heute ist Montag.', 'Heute ist Mai.', 'Ich habe am Montag Geburtstag.', 'Wie alt bist du?'],
    pronounce: ['Heute ist Montag.'],
  },
  {
    id: 'd4-dikte-geburtstag', day: 4, topicId: DOG, type: 'dictation', difficulty: 'hard', skill: 'recall',
    conceptIds: ['day4.dogum-gunu.wann'], familyId: 'd4-dinle-geburtstag', instruction: 'Dinle ve duyduğun soruyu Almanca yaz.',
    audioText: 'Wann hast du Geburtstag?', audio: { prompt: { text: 'Wann hast du Geburtstag?', language: 'de-DE', role: 'prompt' } },
    answer: 'Wann hast du Geburtstag?', acceptedAnswers: ['Wann hast du Geburtstag'], pronounce: ['Wann hast du Geburtstag?'],
  },
  {
    id: 'd4-hata-heute-am', day: 4, topicId: SOR, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day4.soru.welcher-tag', 'day4.zaman.am-im'], familyId: 'd4-welcher-tag', instruction: 'Cümleyi düzelt.',
    prompt: 'Heute ist am Montag.', answer: 'Heute ist Montag.', explanation: 'Bugünün gününü cevap verirken gün adı tek başına gelir; `am` olay zamanı için kullanılır.', pronounce: ['Heute ist Montag.'],
  },
  {
    id: 'd4-hata-geburtstag-im', day: 4, topicId: DOG, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day4.tarih.am-en'], familyId: 'd4-geburtstag-dritte-mai', instruction: 'Tarih kalıbını düzelt.',
    prompt: 'Ich habe im dritte Mai Geburtstag.', answer: 'Ich habe am dritten Mai Geburtstag.', explanation: 'Tarih için `am` ve sıra sayısının `-en` biçimi kullanılır.', pronounce: ['Ich habe am dritten Mai Geburtstag.'],
  },
  {
    id: 'd4-sesli-takvim', day: 4, topicId: DOG, type: 'spoken', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day4.takvim.hafta-gunleri', 'day4.dogum-gunu.wann', 'day4.yas.wie-alt'], familyId: 'd4-sesli-takvim',
    instruction: 'Sesli görev: takvim bilgisini kısa bir konuşmada kullan.',
    requirements: ['Bugünün gününü söyle.', 'Doğum gününü `Ich habe am ... Geburtstag.` ile söyle.', 'Kendine `Wie alt bist du?` sorusunu sorup cevapla.'],
    sampleAnswer: 'Heute ist Montag. Ich habe am dritten Mai Geburtstag. Ich bin zwanzig Jahre alt.',
    pronounce: ['Heute ist Montag.', 'Ich habe am dritten Mai Geburtstag.', 'Ich bin zwanzig Jahre alt.'],
  },

  // Tam Çalışma için iki yönlü, yalnızca bu günün kalıplarını kullanan çeviriler.
  translation({ id: 'd4-wb-montag-tr', day: 4, topicId: SOR, conceptIds: ['day4.soru.welcher-tag'], direction: 'de-to-tr', source: 'Heute ist Montag.', target: 'Bugün pazartesi.', alternatives: ['Bugün günlerden pazartesi.'], difficulty: 'easy', distractors: ['çarşamba'] }),
  translation({ id: 'd4-wb-mittwoch-de', day: 4, topicId: SOR, conceptIds: ['day4.soru.welcher-tag'], direction: 'tr-to-de', source: 'Bugün pazar.', target: 'Heute ist Sonntag.', difficulty: 'easy', distractors: ['Montag', 'bin'] }),
  translation({ id: 'd4-wb-am-freitag-tr', day: 4, topicId: SOR, conceptIds: ['day4.zaman.am-im'], direction: 'de-to-tr', source: 'am Freitag', target: 'cuma günü', alternatives: ['cuma'], difficulty: 'easy' }),
  translation({ id: 'd4-wb-im-mai-de', day: 4, topicId: SOR, conceptIds: ['day4.zaman.am-im'], direction: 'tr-to-de', source: 'mayısta', target: 'im Mai', difficulty: 'medium', distractors: ['am', 'Montag'] }),
  translation({ id: 'd4-wb-geburtstag-tr', day: 4, topicId: DOG, conceptIds: ['day4.dogum-gunu.wann'], direction: 'de-to-tr', source: 'Wann hast du Geburtstag?', target: 'Doğum günün ne zaman?', difficulty: 'medium', distractors: ['kaç', 'yaşındasın'] }),
  translation({ id: 'd4-wb-dritter-mai-de', day: 4, topicId: DOG, conceptIds: ['day4.tarih.am-en'], direction: 'tr-to-de', source: 'Doğum günüm 3 Mayıs.', target: 'Ich habe am dritten Mai Geburtstag.', difficulty: 'hard', distractors: ['im', 'dritte'] }),
  translation({ id: 'd4-wb-wie-alt-tr', day: 4, topicId: DOG, conceptIds: ['day4.yas.wie-alt'], direction: 'de-to-tr', source: 'Wie alt bist du?', target: 'Kaç yaşındasın?', alternatives: ['Yaşın kaç?'], difficulty: 'easy', distractors: ['Doğum', 'günün'] }),
  translation({ id: 'd4-wb-yirmi-de', day: 4, topicId: DOG, conceptIds: ['day4.yas.wie-alt'], direction: 'tr-to-de', source: 'Yirmi yaşındayım.', target: 'Ich bin zwanzig Jahre alt.', difficulty: 'hard', distractors: ['bist', 'du'] }),
  translation({ id: 'd4-wb-sommer-tr', day: 4, topicId: KEL, conceptIds: ['day4.takvim.mevsimler'], direction: 'de-to-tr', source: 'der Sommer', target: 'yaz', difficulty: 'easy' }),
  translation({ id: 'd4-wb-aralik-de', day: 4, topicId: KEL, conceptIds: ['day4.takvim.aylar'], direction: 'tr-to-de', source: 'aralık', target: 'Dezember', difficulty: 'medium', distractors: ['November'] }),
  translation({ id: 'd4-wb-achte-august-tr', day: 4, topicId: DOG, conceptIds: ['day4.tarih.am-en'], direction: 'de-to-tr', source: 'am achten August', target: '8 Ağustos', difficulty: 'hard', distractors: ['3', 'Mayıs'] }),
  translation({ id: 'd4-wb-kis-de', day: 4, topicId: KEL, conceptIds: ['day4.takvim.mevsimler'], direction: 'tr-to-de', source: 'kış', target: 'der Winter', difficulty: 'medium', distractors: ['Sommer'] }),
];
