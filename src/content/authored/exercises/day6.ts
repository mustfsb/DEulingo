/** Gün 6 — sprechen, ülkeler, uyruklar ve diller için küratörlü havuz. */

import type { AuthoredExercise } from '../types.ts';
import { translation } from './translations.ts';

const FII = 'day6.onemli-fiiller';
const ULK = 'day6.ulkeler-aus';
const UYR = 'day6.uyruklar-diller';

export const DAY6_EXERCISES: AuthoredExercise[] = [
  {
    id: 'd6-sprechen-cekimi-match', day: 6, topicId: FII, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day6.sprechen.anlam-cekim'], familyId: 'd6-sprechen-cekimi', instruction: '`sprechen` çekimlerini zamirleriyle eşleştir.',
    pairs: [{ left: 'ich', right: 'spreche' }, { left: 'wir', right: 'sprechen' }, { left: 'ihr', right: 'sprecht' }, { left: 'Sie', right: 'sprechen' }],
    pronounce: ['ich spreche', 'wir sprechen', 'ihr sprecht', 'Sie sprechen'],
  },
  {
    id: 'd6-sprechen-anlam-mc', day: 6, topicId: FII, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day6.sprechen.anlam-cekim'], familyId: 'd6-sprechen-anlam', instruction: '`sprechen` ne demektir?',
    answer: 'konuşmak', options: ['konuşmak', 'gelmek', 'olmak', 'yaşamak'], pronounce: ['sprechen'],
  },
  {
    id: 'd6-du-sprichst-fill', day: 6, topicId: FII, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-du-sprichst', instruction: '`sprechen` fiilini `du` ile doğru çek.',
    prompt: 'Du ___ Deutsch.', answer: 'sprichst', explanation: '`du` ile kökte `e → i` değişir: `du sprichst`.', pronounce: ['Du sprichst Deutsch.'],
  },
  {
    id: 'd6-er-spricht-fill', day: 6, topicId: FII, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-er-spricht', instruction: '`sprechen` fiilini `er` ile doğru çek.',
    prompt: 'Er ___ Deutsch.', answer: 'spricht', explanation: '`er` ile de kökte `e → i` değişir: `er spricht`.', pronounce: ['Er spricht Deutsch.'],
  },
  {
    id: 'd6-sprechen-sie-mc', day: 6, topicId: FII, type: 'multiple-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day6.sprechen.resmi-soru'], familyId: 'd6-sprechen-resmi', instruction: 'Bir yetişkine resmî biçimde “Almanca konuşuyor musunuz?” diye sor.',
    answer: 'Sprechen Sie Deutsch?', options: ['Sprechen Sie Deutsch?', 'Sprichst du Deutsch?', 'Sprecht ihr Deutsch?', 'Welche Sprache sprichst du?'],
    pronounce: ['Sprechen Sie Deutsch?'],
  },
  {
    id: 'd6-welche-sprache-fill', day: 6, topicId: FII, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-welche-sprache', instruction: 'Dili soran soruyu tamamla.',
    prompt: 'Arkadaşına sor: Welche Sprache ___ du?', answer: 'sprichst', pronounce: ['Welche Sprache sprichst du?'],
  },
  {
    id: 'd6-woher-mc', day: 6, topicId: ULK, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day6.ulkeler.woher-kommen'], familyId: 'd6-woher', instruction: 'Birinin nereli olduğunu hangi soruyla öğrenirsin?',
    answer: 'Woher kommst du?', options: ['Woher kommst du?', 'Wo wohnst du?', 'Wie alt bist du?', 'Welche Sprache sprichst du?'], pronounce: ['Woher kommst du?'],
  },
  {
    id: 'd6-ulkeler-match', day: 6, topicId: ULK, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day6.ulkeler.artikelsiz', 'day6.ulkeler.artikelli'], familyId: 'd6-ulkeler', instruction: 'Ülkeleri Türkçe karşılıklarıyla eşleştir.',
    pairs: [{ left: 'Deutschland', right: 'Almanya' }, { left: 'Frankreich', right: 'Fransa' }, { left: 'die Türkei', right: 'Türkiye' }, { left: 'die Schweiz', right: 'İsviçre' }],
    pronounce: ['Deutschland', 'Frankreich', 'die Türkei', 'die Schweiz'],
  },
  {
    id: 'd6-aus-deutschland-fill', day: 6, topicId: ULK, type: 'fill-blank', difficulty: 'easy', skill: 'production',
    conceptIds: ['day6.ulkeler.artikelsiz'], familyId: 'd6-aus-artikelsiz', instruction: 'Boşluğu doğru edatla doldur. (Almanya’dan geliyorum.)',
    prompt: 'Ich komme ___ Deutschland.', answer: 'aus', pronounce: ['Ich komme aus Deutschland.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd6-aus-der-tuerkei-fill', day: 6, topicId: ULK, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.ulkeler.artikelli'], familyId: 'd6-aus-artikelli', instruction: 'Türkiye kalıbını tamamla.',
    prompt: 'Ich komme aus ___ Türkei.', answer: 'der', explanation: 'Bu günün kalıbı `aus der Türkei`dir.', pronounce: ['Ich komme aus der Türkei.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd6-aus-den-usa-fill', day: 6, topicId: ULK, type: 'fill-blank', difficulty: 'hard', skill: 'production',
    conceptIds: ['day6.ulkeler.usa'], familyId: 'd6-aus-usa', instruction: 'ABD kalıbını tamamla.',
    prompt: 'Ich komme aus ___ USA.', answer: 'den', explanation: 'Bu günün güvenli kalıbı `aus den USA`dır.', pronounce: ['Ich komme aus den USA.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd6-ulke-dil-buyuk-mc', day: 6, topicId: UYR, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day6.yazim.ulke-dil-buyuk'], familyId: 'd6-buyuk-harf', instruction: 'Hangi yazım doğrudur?',
    answer: 'Ich spreche Deutsch.', options: ['Ich spreche Deutsch.', 'Ich spreche deutsch.', 'Ich Spreche Deutsch.', 'Ich spreche DEUTSCH.'],
    explanation: 'Dil adları isimdir; Almancada büyük harfle yazılır.', pronounce: ['Ich spreche Deutsch.'], validation: { caseSensitive: true },
  },
  {
    id: 'd6-uyruk-dil-match', day: 6, topicId: UYR, type: 'matching', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day6.uyruk.ich-bin', 'day6.diller.ich-spreche'], familyId: 'd6-uyruk-dil', instruction: 'Uyruk/dil biçimlerini doğru ülkeyle eşleştir.',
    pairs: [{ left: 'Deutsche / Deutsch', right: 'Deutschland' }, { left: 'Türkin / Türkisch', right: 'die Türkei' }, { left: 'Französin / Französisch', right: 'Frankreich' }, { left: 'Spanierin / Spanisch', right: 'Spanien' }],
    pronounce: ['Deutsche', 'Deutsch', 'Türkin', 'Türkisch', 'Französin', 'Französisch', 'Spanierin', 'Spanisch'],
  },
  {
    id: 'd6-turkin-fill', day: 6, topicId: UYR, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.uyruk.erkek-kadin'], familyId: 'd6-uyruk-turk', instruction: 'Türk bir kadın için uyruk biçimini yaz.',
    prompt: 'Türk bir kadın: Ich bin ___.', answer: 'Türkin', pronounce: ['Ich bin Türkin.'],
  },
  {
    id: 'd6-deutscher-fill', day: 6, topicId: UYR, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.uyruk.erkek-kadin'], familyId: 'd6-uyruk-deutsch', instruction: 'Alman bir erkek için uyruk biçimini yaz.',
    prompt: 'Alman bir erkek: Ich bin ___.', answer: 'Deutscher', pronounce: ['Ich bin Deutscher.'],
  },
  {
    id: 'd6-dil-cumlesi-builder', day: 6, topicId: UYR, type: 'sentence-builder', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.diller.ich-spreche'], familyId: 'd6-ich-spreche', instruction: '“Türkçe ve Almanca konuşuyorum.” cümlesini kur.',
    prompt: 'Türkçe ve Almanca konuşuyorum.', answer: 'Ich spreche Türkisch und Deutsch.', pronounce: ['Ich spreche Türkisch und Deutsch.'],
  },
  {
    id: 'd6-uyruk-dil-free', day: 6, topicId: UYR, type: 'free-text', difficulty: 'hard', skill: 'production',
    conceptIds: ['day6.uyruk.ich-bin', 'day6.diller.ich-spreche'], familyId: 'd6-ich-spreche',
    instruction: 'Türk bir kadın olduğunu ve Türkçe konuştuğunu iki kısa cümleyle söyle.', answer: 'Ich bin Türkin. Ich spreche Türkisch.',
    acceptedAnswers: ['Ich bin Türkin. Ich spreche Türkisch', 'Ich spreche Türkisch. Ich bin Türkin.'], openEnded: true,
    pronounce: ['Ich bin Türkin.', 'Ich spreche Türkisch.'],
  },
  {
    id: 'd6-dinle-sprichst', day: 6, topicId: FII, type: 'listen-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-dinle-sprichst', instruction: 'Dinle: duyduğun soruyu seç.',
    audioText: 'Sprichst du Deutsch?', audio: { prompt: { text: 'Sprichst du Deutsch?', language: 'de-DE', role: 'prompt' } },
    answer: 'Sprichst du Deutsch?', options: ['Sprichst du Deutsch?', 'Sprechen Sie Deutsch?', 'Woher kommst du?', 'Wie alt bist du?'], pronounce: ['Sprichst du Deutsch?'],
  },
  {
    id: 'd6-dikte-aus-der-tuerkei', day: 6, topicId: ULK, type: 'dictation', difficulty: 'hard', skill: 'recall',
    conceptIds: ['day6.ulkeler.artikelli'], familyId: 'd6-dinle-tuerkei', instruction: 'Dinle ve duyduğun cümleyi Almanca yaz.',
    audioText: 'Ich komme aus der Türkei.', audio: { prompt: { text: 'Ich komme aus der Türkei.', language: 'de-DE', role: 'prompt' } },
    answer: 'Ich komme aus der Türkei.', acceptedAnswers: ['Ich komme aus der Türkei'], pronounce: ['Ich komme aus der Türkei.'],
  },
  {
    id: 'd6-hata-sprechst', day: 6, topicId: FII, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-du-sprichst', instruction: 'Cümleyi düzelt.',
    prompt: 'Du sprechst Deutsch.', answer: 'Du sprichst Deutsch.', explanation: '`sprechen` düzensizdir: `du` ile `sprichst` olur.', pronounce: ['Du sprichst Deutsch.'],
  },
  {
    id: 'd6-hata-aus-turkei', day: 6, topicId: ULK, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day6.ulkeler.artikelli'], familyId: 'd6-aus-artikelli', instruction: 'Türkiye kalıbını düzelt.',
    prompt: 'Ich komme aus Türkei.', answer: 'Ich komme aus der Türkei.', explanation: 'Bu günün öğrenilen kalıbı `aus der Türkei`dir.', pronounce: ['Ich komme aus der Türkei.'],
  },
  {
    id: 'd6-sesli-kimlik', day: 6, topicId: UYR, type: 'spoken', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day6.ulkeler.woher-kommen', 'day6.uyruk.ich-bin', 'day6.diller.ich-spreche'], familyId: 'd6-sesli-kimlik',
    instruction: 'Sesli görev: kendini ülke, uyruk ve dil bilgisiyle tanıt.',
    requirements: ['`Woher kommst du?` sorusuna cevap ver.', 'Uyruk için `Ich bin ...` cümlesi kur.', 'En az bir dili `Ich spreche ...` ile söyle.', 'Bir arkadaşına `Welche Sprache sprichst du?` sorusunu sor.'],
    sampleAnswer: 'Ich komme aus der Türkei. Ich bin Türkin. Ich spreche Türkisch und Deutsch.',
    pronounce: ['Ich komme aus der Türkei.', 'Ich bin Türkin.', 'Ich spreche Türkisch und Deutsch.', 'Welche Sprache sprichst du?'],
  },

  translation({ id: 'd6-wb-spreche-tr', day: 6, topicId: FII, conceptIds: ['day6.sprechen.anlam-cekim'], direction: 'de-to-tr', source: 'Ich spreche Deutsch.', target: 'Almanca konuşuyorum.', difficulty: 'easy', distractors: ['Türkçe'] }),
  translation({ id: 'd6-wb-dil-de', day: 6, topicId: FII, conceptIds: ['day6.sprechen.anlam-cekim'], direction: 'tr-to-de', source: 'Türkçe konuşuyorum.', target: 'Ich spreche Türkisch.', difficulty: 'medium', distractors: ['sprichst', 'Du'] }),
  translation({ id: 'd6-wb-sprichst-tr', day: 6, topicId: FII, conceptIds: ['day6.sprechen.du-sprichst'], direction: 'de-to-tr', source: 'Sprichst du Deutsch?', target: 'Almanca konuşuyor musun?', difficulty: 'medium', distractors: ['resmî'] }),
  translation({ id: 'd6-wb-resmi-de', day: 6, topicId: FII, conceptIds: ['day6.sprechen.resmi-soru'], direction: 'tr-to-de', source: 'Almanca konuşuyor musunuz?', target: 'Sprechen Sie Deutsch?', difficulty: 'hard', distractors: ['Sprichst', 'du'] }),
  translation({ id: 'd6-wb-woher-tr', day: 6, topicId: ULK, conceptIds: ['day6.ulkeler.woher-kommen'], direction: 'de-to-tr', source: 'Woher kommst du?', target: 'Nerelisin?', alternatives: ['Nereden geliyorsun?'], difficulty: 'easy', distractors: ['Nerede', 'yaşıyorsun'] }),
  translation({ id: 'd6-wb-almanya-de', day: 6, topicId: ULK, conceptIds: ['day6.ulkeler.artikelsiz'], direction: 'tr-to-de', source: 'Almanya’dan geliyorum.', target: 'Ich komme aus Deutschland.', difficulty: 'medium', distractors: ['der', 'Türkei'] }),
  translation({ id: 'd6-wb-turkiye-tr', day: 6, topicId: ULK, conceptIds: ['day6.ulkeler.artikelli'], direction: 'de-to-tr', source: 'Ich komme aus der Türkei.', target: 'Türkiye’den geliyorum.', alternatives: ["Türkiye'den geliyorum."], difficulty: 'easy', distractors: ['Almanya'] }),
  translation({ id: 'd6-wb-abd-de', day: 6, topicId: ULK, conceptIds: ['day6.ulkeler.usa'], direction: 'tr-to-de', source: 'ABD’den geliyorum.', target: 'Ich komme aus den USA.', difficulty: 'hard', distractors: ['der', 'die'] }),
  translation({ id: 'd6-wb-turkin-tr', day: 6, topicId: UYR, conceptIds: ['day6.uyruk.erkek-kadin'], direction: 'de-to-tr', source: 'Ich bin Türkin.', target: 'Türküm.', difficulty: 'easy', distractors: ['Türkçe', 'konuşuyorum'] }),
  translation({ id: 'd6-wb-alman-kadin-de', day: 6, topicId: UYR, conceptIds: ['day6.uyruk.erkek-kadin'], direction: 'tr-to-de', source: 'Almanım. (kadın)', target: 'Ich bin Deutsche.', difficulty: 'medium', distractors: ['Deutscher', 'spreche'] }),
  translation({ id: 'd6-wb-fransizca-tr', day: 6, topicId: UYR, conceptIds: ['day6.diller.ich-spreche'], direction: 'de-to-tr', source: 'Ich spreche Französisch.', target: 'Fransızca konuşuyorum.', difficulty: 'medium', distractors: ['İspanyolca'] }),
  translation({ id: 'd6-wb-ispanyolca-de', day: 6, topicId: UYR, conceptIds: ['day6.diller.ich-spreche'], direction: 'tr-to-de', source: 'İspanyolca konuşuyorum.', target: 'Ich spreche Spanisch.', difficulty: 'hard', distractors: ['Spanien', 'bin'] }),
];
