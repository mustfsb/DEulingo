/** Gün 5 — artikel, çoğul, ein/eine ve kein/keine için küratörlü havuz. */

import type { AuthoredExercise } from '../types.ts';
import { translation } from './translations.ts';

const ART = 'day5.artikel-secimi';
const COG = 'day5.cogul-isimler';
const BEL = 'day5.belirli-belirsiz';

export const DAY5_EXERCISES: AuthoredExercise[] = [
  {
    id: 'd5-artikel-temel-match', day: 5, topicId: ART, type: 'matching', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day5.artikel.artikel-cogul-not'], familyId: 'd5-artikel-temel', instruction: 'İsmi doğru artikeliyle eşleştir.',
    pairs: [{ left: 'Tisch', right: 'der' }, { left: 'Tasche', right: 'die' }, { left: 'Buch', right: 'das' }, { left: 'Tag', right: 'der' }],
    pronounce: ['der Tisch', 'die Tasche', 'das Buch', 'der Tag'],
  },
  {
    id: 'd5-sozluk-kisaltma-match', day: 5, topicId: ART, type: 'matching', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.artikel.sozluk-kisaltmalari'], familyId: 'd5-sozluk-kisaltma', instruction: 'Sözlük kısaltmalarını anlamıyla eşleştir.',
    pairs: [{ left: 'm.', right: 'maskulin / der' }, { left: 'f.', right: 'feminin / die' }, { left: 'n.', right: 'nötr / das' }, { left: 'Pl.', right: 'çoğul' }],
  },
  {
    id: 'd5-artikel-cogul-not-mc', day: 5, topicId: ART, type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day5.artikel.artikel-cogul-not'], familyId: 'd5-artikel-not-et',
    instruction: 'Yeni bir ismi en yararlı hangi biçimde not edersin?', answer: 'der Tisch — die Tische',
    options: ['der Tisch — die Tische', 'Tisch', 'masa', 'die Tisch'],
    explanation: 'Yeni ismi artikeli ve çoğuluyla birlikte öğrenmek, hem cinsiyeti hem çoğulu kalıp halinde tutar.', pronounce: ['der Tisch', 'die Tische'],
  },
  {
    id: 'd5-cogul-die-fill', day: 5, topicId: COG, type: 'fill-blank', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.cogul.die'], familyId: 'd5-cogul-die', instruction: 'Çoğul artikeli yaz.', prompt: '___ Bücher', answer: 'die',
    explanation: 'Çoğulda ismin eski artikeli ne olursa olsun `die` kullanılır.', pronounce: ['die Bücher'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd5-buch-cogul-fill', day: 5, topicId: COG, type: 'fill-blank', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.cogul.ekler', 'day5.cogul.umlaut'], familyId: 'd5-buch-cogul', instruction: '`das Buch`un çoğulunu yaz.',
    prompt: 'das Buch → die ___', answer: 'Bücher', pronounce: ['die Bücher'],
  },
  {
    id: 'd5-tasche-cogul-fill', day: 5, topicId: COG, type: 'fill-blank', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.cogul.ekler'], familyId: 'd5-tasche-cogul', instruction: '`die Tasche`nin çoğulunu yaz.',
    prompt: 'die Tasche → die ___', answer: 'Taschen', pronounce: ['die Taschen'],
  },
  {
    id: 'd5-apfel-umlaut-fill', day: 5, topicId: COG, type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day5.cogul.umlaut'], familyId: 'd5-apfel-cogul', instruction: '`der Apfel`in çoğulunu yaz.',
    prompt: 'der Apfel → die ___', answer: 'Äpfel', acceptedAnswers: ['Aepfel'],
    explanation: 'Bu çoğulda yalnızca Umlaut görünür: `Apfel` → `Äpfel`.', pronounce: ['die Äpfel'],
  },
  {
    id: 'd5-cogul-kural-mc', day: 5, topicId: COG, type: 'multiple-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.cogul.kalip-ezber'], familyId: 'd5-cogul-ezber', instruction: 'Yeni bir ismin çoğulunu en güvenilir nasıl öğrenirsin?',
    answer: 'Kelimeyi çoğuluyla birlikte sözlükten not ederek',
    options: ['Kelimeyi çoğuluyla birlikte sözlükten not ederek', 'Her kelimeye otomatik `-e` ekleyerek', 'Her zaman `-s` ekleyerek', 'Sadece artikeline bakarak'],
    explanation: 'Yaygın kalıplar vardır ama çoğul biçimi güvenle tahmin edilmez; kelimeyi çoğuluyla öğren.',
  },
  {
    id: 'd5-belirli-mc', day: 5, topicId: BEL, type: 'multiple-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.belirli.anlam'], familyId: 'd5-belirli-belirsiz', instruction: 'Hangi cümle belli, daha önce söz edilen çantayı anlatır?',
    answer: 'Das ist die Tasche.', options: ['Das ist die Tasche.', 'Das ist eine Tasche.', 'Das sind Taschen.', 'Das sind keine Taschen.'],
    explanation: '`die Tasche` belli çantayı, `eine Tasche` ise herhangi bir çantayı anlatır.', pronounce: ['Das ist die Tasche.', 'Das ist eine Tasche.'],
  },
  {
    id: 'd5-ein-buch-fill', day: 5, topicId: BEL, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.belirsiz.ein-eine'], familyId: 'd5-ein-eine', instruction: 'Belirsiz artikeli yaz. (Bu bir kitap.)',
    prompt: 'Bir kitap için: Das ist ___ Buch.', answer: 'ein', explanation: '`Buch` nötrdür (`das Buch`); nötrde belirsiz artikel `ein` olur.', pronounce: ['Das ist ein Buch.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd5-eine-tasche-fill', day: 5, topicId: BEL, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.belirsiz.ein-eine'], familyId: 'd5-ein-eine', instruction: 'Belirsiz artikeli yaz. (Bu bir çanta.)',
    prompt: 'Das ist ___ Tasche.', answer: 'eine', explanation: '`Tasche` dişildir (`die Tasche`); dişilde belirsiz artikel `eine` olur.', pronounce: ['Das ist eine Tasche.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd5-keine-buecher-fill', day: 5, topicId: BEL, type: 'fill-blank', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.olumsuz.kein-keine'], familyId: 'd5-kein-keine', instruction: 'Çoğul olumsuzluğu yaz. (Bunlar kitap değil.)',
    prompt: 'Das sind ___ Bücher.', answer: 'keine', explanation: 'Çoğulda “hiç / yok” için `keine` kullanılır.', pronounce: ['Das sind keine Bücher.'], validation: { noTypoTolerance: true },
  },
  {
    id: 'd5-was-ist-das-free', day: 5, topicId: BEL, type: 'free-text', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.soru.was-ist-das', 'day5.belirsiz.ein-eine'], familyId: 'd5-was-ist-das-buch',
    instruction: 'Soruyu bir kitapla cevapla.', prompt: 'A: Was ist das?\nB: ___', answer: 'Das ist ein Buch.', acceptedAnswers: ['Das ist ein Buch'],
    pronounce: ['Was ist das?', 'Das ist ein Buch.'],
  },
  {
    id: 'd5-das-sind-builder', day: 5, topicId: BEL, type: 'sentence-builder', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.soru.was-ist-das', 'day5.cogul.die'], familyId: 'd5-das-sind-taschen',
    instruction: '“Bunlar çantalardır.” cümlesini kur.', prompt: 'Bunlar çantalardır.', answer: 'Das sind Taschen.', pronounce: ['Das sind Taschen.'],
  },
  {
    id: 'd5-keine-buecher-order', day: 5, topicId: BEL, type: 'ordering', difficulty: 'hard', skill: 'production',
    conceptIds: ['day5.olumsuz.kein-keine'], familyId: 'd5-kein-buch',
    instruction: '“Bu bir kitap değil.” cümlesini doğru sırayla kur.', prompt: 'Bu bir kitap değil.', answer: 'Das ist kein Buch.', pronounce: ['Das ist kein Buch.'],
  },
  {
    id: 'd5-dinle-ein-buch', day: 5, topicId: BEL, type: 'listen-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.soru.was-ist-das', 'day5.belirsiz.ein-eine'], familyId: 'd5-dinle-buch', instruction: 'Dinle: duyduğun cevabı seç.',
    audioText: 'Das ist ein Buch.', audio: { prompt: { text: 'Das ist ein Buch.', language: 'de-DE', role: 'prompt' } },
    answer: 'Das ist ein Buch.', options: ['Das ist ein Buch.', 'Das ist eine Tasche.', 'Das sind Bücher.', 'Das sind keine Bücher.'], pronounce: ['Das ist ein Buch.'],
  },
  {
    id: 'd5-dikte-was-ist-das', day: 5, topicId: BEL, type: 'dictation', difficulty: 'hard', skill: 'recall',
    conceptIds: ['day5.soru.was-ist-das'], familyId: 'd5-dinle-was', instruction: 'Dinle ve duyduğun soruyu Almanca yaz.',
    audioText: 'Was ist das?', audio: { prompt: { text: 'Was ist das?', language: 'de-DE', role: 'prompt' } },
    answer: 'Was ist das?', acceptedAnswers: ['Was ist das'], pronounce: ['Was ist das?'],
  },
  {
    id: 'd5-hata-eine-buecher', day: 5, topicId: BEL, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day5.cogul.die', 'day5.belirsiz.ein-eine'], familyId: 'd5-das-sind-buecher', instruction: 'Cümleyi düzelt.',
    prompt: 'Das ist eine Bücher.', answer: 'Das sind Bücher.', explanation: '`Bücher` çoğuldur: fiil `sind` olur ve çoğulda `eine` kullanılmaz.', pronounce: ['Das sind Bücher.'],
  },
  {
    id: 'd5-hata-ein-tasche', day: 5, topicId: BEL, type: 'error-correction', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day5.belirsiz.ein-eine'], familyId: 'd5-ein-eine', instruction: 'Cümleyi düzelt.',
    prompt: 'Das ist ein Tasche.', answer: 'Das ist eine Tasche.', explanation: '`Tasche` dişildir; belirsiz artikel `eine` olur.', pronounce: ['Das ist eine Tasche.'],
  },
  {
    id: 'd5-sesli-esya-tanit', day: 5, topicId: BEL, type: 'spoken', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day5.belirli.anlam', 'day5.belirsiz.ein-eine', 'day5.soru.was-ist-das'], familyId: 'd5-sesli-esya',
    instruction: 'Sesli görev: bir nesneyi önce belirsiz, sonra belirli olarak tanıt.',
    requirements: ['Bir kitap veya çanta seç.', '`Das ist ein/eine ...` ile ilk kez tanıt.', 'Aynı nesneyi `Das ist der/die/das ...` ile belli nesne olarak söyle.', '`Was ist das?` sorusunu sesli sor.'],
    sampleAnswer: 'Was ist das? Das ist ein Buch. Das ist das Buch.', pronounce: ['Was ist das?', 'Das ist ein Buch.', 'Das ist das Buch.'],
  },
  {
    id: 'd5-eier-free', day: 5, topicId: COG, type: 'free-text', difficulty: 'hard', skill: 'production',
    conceptIds: ['day5.cogul.ekler', 'day5.cogul.die'], familyId: 'd5-eier-cogul', instruction: '“Yumurtalar” ifadesini artikeliyle yaz.',
    answer: 'die Eier', acceptedAnswers: ['Die Eier'], explanation: '`das Ei` çoğulda `die Eier` olur.', pronounce: ['die Eier'],
  },

  translation({ id: 'd5-wb-tisch-tr', day: 5, topicId: ART, conceptIds: ['day5.artikel.artikel-cogul-not'], direction: 'de-to-tr', source: 'der Tisch', target: 'masa', difficulty: 'easy' }),
  translation({ id: 'd5-wb-tasche-de', day: 5, topicId: ART, conceptIds: ['day5.artikel.artikel-cogul-not'], direction: 'tr-to-de', source: 'çanta', target: 'die Tasche', difficulty: 'easy', distractors: ['der', 'Buch'] }),
  translation({ id: 'd5-wb-buecher-tr', day: 5, topicId: COG, conceptIds: ['day5.cogul.die', 'day5.cogul.umlaut'], direction: 'de-to-tr', source: 'die Bücher', target: 'kitaplar', difficulty: 'medium' }),
  translation({ id: 'd5-wb-apfel-de', day: 5, topicId: COG, conceptIds: ['day5.cogul.umlaut'], direction: 'tr-to-de', source: 'elmalar', target: 'die Äpfel', difficulty: 'hard', distractors: ['der', 'Apfel'] }),
  translation({ id: 'd5-wb-ein-buch-tr', day: 5, topicId: BEL, conceptIds: ['day5.belirsiz.ein-eine'], direction: 'de-to-tr', source: 'Das ist ein Buch.', target: 'Bu bir kitap.', alternatives: ['Bu bir kitaptır.'], difficulty: 'easy', distractors: ['çanta'] }),
  translation({ id: 'd5-wb-bir-canta-de', day: 5, topicId: BEL, conceptIds: ['day5.belirsiz.ein-eine'], direction: 'tr-to-de', source: 'Bu bir masa.', target: 'Das ist ein Tisch.', difficulty: 'medium', distractors: ['eine', 'Tasche'] }),
  translation({ id: 'd5-wb-belirli-tasche-tr', day: 5, topicId: BEL, conceptIds: ['day5.belirli.anlam'], direction: 'de-to-tr', source: 'Das ist die Tasche.', target: 'Bu çanta.', alternatives: ['O çanta.'], difficulty: 'medium', distractors: ['bir'] }),
  translation({ id: 'd5-wb-o-kitap-de', day: 5, topicId: BEL, conceptIds: ['day5.belirli.anlam'], direction: 'tr-to-de', source: 'Bu kitap.', target: 'Das ist das Buch.', difficulty: 'hard', distractors: ['ein', 'eine'] }),
  translation({ id: 'd5-wb-keine-tr', day: 5, topicId: BEL, conceptIds: ['day5.olumsuz.kein-keine'], direction: 'de-to-tr', source: 'Das sind keine Bücher.', target: 'Bunlar kitap değil.', difficulty: 'medium', distractors: ['kitaplardır'] }),
  translation({ id: 'd5-wb-kitap-degil-de', day: 5, topicId: BEL, conceptIds: ['day5.olumsuz.kein-keine'], direction: 'tr-to-de', source: 'Bu bir çanta değil.', target: 'Das ist keine Tasche.', difficulty: 'hard', distractors: ['ist', 'ein'] }),
  translation({ id: 'd5-wb-was-tr', day: 5, topicId: BEL, conceptIds: ['day5.soru.was-ist-das'], direction: 'de-to-tr', source: 'Was ist das?', target: 'Bu nedir?', alternatives: ['Bu ne?'], difficulty: 'easy', distractors: ['kim'] }),
  translation({ id: 'd5-wb-bunlar-kitap-de', day: 5, topicId: BEL, conceptIds: ['day5.soru.was-ist-das', 'day5.cogul.die'], direction: 'tr-to-de', source: 'Bunlar yumurtalardır.', target: 'Das sind Eier.', difficulty: 'medium', distractors: ['ist', 'ein'] }),
];
