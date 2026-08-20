/** Tam Çalışma için yalnızca ilk üç günde öğretilmiş kalıplardan kelime-bankası çevirileri. */
import type { AuthoredExercise } from '../types.ts';
import type { TranslationDirection } from '../../types.ts';

export type TranslationSpec = {
  id: string;
  day: number;
  topicId: string;
  conceptIds: string[];
  direction: TranslationDirection;
  source: string;
  target: string;
  difficulty: 'easy' | 'medium' | 'hard';
  distractors?: string[];
  alternatives?: string[];
};

function words(text: string) {
  return text.trim().replace(/[.!?]+$/u, '').split(/\s+/u).filter(Boolean);
}

/** Alternatif Türkçe cevabı kurmak için gereken yeni tile'ları ekler. */
function alternativeTokens(sequence: string[], alternatives: string[]): string[] {
  const seen = new Set(sequence.map((token) => token.toLocaleLowerCase('tr')));
  return alternatives.flatMap(words).filter((token) => {
    const key = token.toLocaleLowerCase('tr');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function translation(spec: TranslationSpec): AuthoredExercise {
  const targetTokens = words(spec.target);
  const distractors = spec.distractors ?? [];
  const sequence = targetTokens;
  const alternatives = spec.alternatives ?? [];
  const alternativeTileTokens = alternativeTokens(sequence, alternatives);
  const directionLabel = spec.direction === 'de-to-tr' ? 'Almancayı Türkçe oluştur.' : 'Türkçesini Almanca oluştur.';
  return {
    id: spec.id,
    day: spec.day,
    topicId: spec.topicId,
    type: 'word-bank-translation',
    difficulty: spec.difficulty,
    skill: spec.direction === 'tr-to-de' ? 'production' : 'recognition',
    masteryWeight: spec.direction === 'tr-to-de' ? 1.15 : 0.8,
    conceptIds: spec.conceptIds,
    familyId: `wb-${spec.source.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '-')}`,
    instruction: directionLabel,
    prompt: spec.source,
    answer: spec.target,
    wordBank: {
      direction: spec.direction,
      sourceText: spec.source,
      targetLanguage: spec.direction === 'de-to-tr' ? 'tr' : 'de',
      tokens: [...sequence, ...alternativeTileTokens, ...distractors].map((text, index) => ({
        id: `${spec.id}-token-${index + 1}`,
        text,
        distractor: index >= sequence.length + alternativeTileTokens.length || undefined,
      })),
      acceptedSequences: [sequence, ...alternatives.map(words)],
    },
    audio: spec.direction === 'de-to-tr'
      ? { prompt: { text: spec.source, language: 'de-DE', role: 'prompt' } }
      : { canonicalAnswer: { text: spec.target, language: 'de-DE', role: 'canonical-answer' } },
    // `pronounce` alanı Almanca olduğunu açıkça belirtir; ses metadata'sı buradan kurulur.
    pronounce: [spec.direction === 'de-to-tr' ? spec.source : spec.target],
  };
}

const D1_SEL = 'day1.selamlasma-vedalasma';
const D2_KON = 'day2.fiil-cekimi';
const D2_SEIN = 'day2.sein-haben';
const D2_ART = 'day2.artikel';
const D3_TAN = 'day3.kendini-tanitma';
const D3_NASIL = 'day3.nasilsin';

export const TRANSLATION_EXERCISES: AuthoredExercise[] = [
  // 1. Gün — 6 de→tr, 6 tr→de: selamlaşma ve vedalaşma.
  translation({ id: 'd1-wb-hallo-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.hallo'], direction: 'de-to-tr', source: 'Hallo!', target: 'Merhaba!', alternatives: ['Selam!'], difficulty: 'easy' }),
  translation({ id: 'd1-wb-morgen-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.guten-morgen'], direction: 'tr-to-de', source: 'Günaydın!', target: 'Guten Morgen!', difficulty: 'easy' }),
  translation({ id: 'd1-wb-tag-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.guten-tag'], direction: 'de-to-tr', source: 'Guten Tag!', target: 'İyi günler!', difficulty: 'easy' }),
  translation({ id: 'd1-wb-abend-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.guten-abend'], direction: 'tr-to-de', source: 'İyi akşamlar!', target: 'Guten Abend!', difficulty: 'easy' }),
  translation({ id: 'd1-wb-nacht-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.gute-nacht'], direction: 'de-to-tr', source: 'Gute Nacht!', target: 'İyi geceler!', difficulty: 'medium', distractors: ['İyi', 'günler'] }),
  translation({ id: 'd1-wb-tschuess-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.vedalasma.tschuess'], direction: 'tr-to-de', source: 'Hoşça kal!', target: 'Tschüss!', difficulty: 'medium', distractors: ['Hallo'] }),
  translation({ id: 'd1-wb-wiedersehen-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.vedalasma.auf-wiedersehen'], direction: 'de-to-tr', source: 'Auf Wiedersehen!', target: 'Görüşürüz!', alternatives: ['Hoşça kalın!'], difficulty: 'medium', distractors: ['Merhaba'] }),
  translation({ id: 'd1-wb-wiederhoeren-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.vedalasma.auf-wiederhoeren'], direction: 'tr-to-de', source: 'Telefonda görüşürüz!', target: 'Auf Wiederhören!', difficulty: 'medium', distractors: ['Auf', 'Wiedersehen'] }),
  translation({ id: 'd1-wb-bald-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.vedalasma.bis-kaliplari'], direction: 'de-to-tr', source: 'Bis bald!', target: 'Yakında görüşürüz!', alternatives: ['Yakında görüşmek üzere!'], difficulty: 'hard', distractors: ['Hemen'] }),
  translation({ id: 'd1-wb-gleich-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.vedalasma.bis-kaliplari'], direction: 'tr-to-de', source: 'Hemen görüşürüz!', target: 'Bis gleich!', difficulty: 'hard', distractors: ['bald', 'Auf'] }),
  translation({ id: 'd1-wb-morgen-tr', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.guten-morgen'], direction: 'de-to-tr', source: 'Guten Morgen!', target: 'Günaydın!', difficulty: 'medium', distractors: ['İyi', 'akşamlar'] }),
  translation({ id: 'd1-wb-nacht-de', day: 1, topicId: D1_SEL, conceptIds: ['day1.selamlasma.gute-nacht'], direction: 'tr-to-de', source: 'İyi geceler!', target: 'Gute Nacht!', difficulty: 'hard', distractors: ['Guten', 'Morgen'] }),

  // 2. Gün — çekim, sein/haben ve artikel ile 7'şer yön.
  translation({ id: 'd2-wb-lehrer-tr', day: 2, topicId: D2_SEIN, conceptIds: ['day2.sein.cekim'], direction: 'de-to-tr', source: 'Ich bin Lehrer.', target: 'Ben öğretmenim.', alternatives: ['Öğretmenim.'], difficulty: 'easy' }),
  translation({ id: 'd2-wb-auto-de', day: 2, topicId: D2_SEIN, conceptIds: ['day2.sein-haben.ayrim'], direction: 'tr-to-de', source: 'Benim bir arabam var.', target: 'Ich habe ein Auto.', difficulty: 'medium', distractors: ['bin', 'du'] }),
  translation({ id: 'd2-wb-wasser-tr', day: 2, topicId: D2_KON, conceptIds: ['day2.konjugation.wir-en', 'day2.konjugation.ornek-cumleler'], direction: 'de-to-tr', source: 'Wir trinken Wasser.', target: 'Biz su içiyoruz.', alternatives: ['Su içiyoruz.'], difficulty: 'medium', distractors: ['Sen', 'içiyorsun'] }),
  translation({ id: 'd2-wb-haus-de', day: 2, topicId: D2_KON, conceptIds: ['day2.konjugation.du-st', 'day2.konjugation.ornek-cumleler'], direction: 'tr-to-de', source: 'Sen eve gidiyorsun.', target: 'Du gehst nach Hause.', difficulty: 'hard', distractors: ['gehen', 'Ich'] }),
  translation({ id: 'd2-wb-zeit-tr', day: 2, topicId: D2_SEIN, conceptIds: ['day2.haben.var-yok', 'day2.haben.cekim'], direction: 'de-to-tr', source: 'Ich habe Zeit.', target: 'Zamanım var.', alternatives: ['Vaktim var.'], difficulty: 'easy' }),
  translation({ id: 'd2-wb-deutschland-de', day: 2, topicId: D2_KON, conceptIds: ['day2.konjugation.du-st'], direction: 'tr-to-de', source: 'Sen Almanya’dan geliyorsun.', target: 'Du kommst aus Deutschland.', difficulty: 'hard', distractors: ['kommen', 'Du', 'kommt'] }),
  translation({ id: 'd2-wb-er-kommt-tr', day: 2, topicId: D2_KON, conceptIds: ['day2.konjugation.er-t'], direction: 'de-to-tr', source: 'Er kommt aus Deutschland.', target: 'O Almanya’dan geliyor.', alternatives: ["O Almanya'dan geliyor.", 'Almanya’dan geliyor.', "Almanya'dan geliyor."], difficulty: 'medium', distractors: ['Sen', 'geliyorsun'] }),
  translation({ id: 'd2-wb-hunger-de', day: 2, topicId: D2_SEIN, conceptIds: ['day2.haben.var-yok', 'day2.haben.cekim'], direction: 'tr-to-de', source: 'Açım.', target: 'Ich habe Hunger.', difficulty: 'medium', distractors: ['bin', 'Du'] }),
  translation({ id: 'd2-wb-muede-tr', day: 2, topicId: D2_SEIN, conceptIds: ['day2.sein.cekim'], direction: 'de-to-tr', source: 'Ihr seid müde.', target: 'Siz yorgunsunuz.', alternatives: ['Yorgunsunuz.'], difficulty: 'hard', distractors: ['Biz', 'yorgunuz'] }),
  translation({ id: 'd2-wb-vater-de', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.isim-buyuk-harf'], direction: 'tr-to-de', source: 'Babam öğretmen.', target: 'Mein Vater ist Lehrer.', difficulty: 'hard', distractors: ['sind', 'Du'] }),
  translation({ id: 'd2-wb-tisch-tr', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'], direction: 'de-to-tr', source: 'der Tisch', target: 'masa', difficulty: 'easy' }),
  translation({ id: 'd2-wb-lampe-de', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'], direction: 'tr-to-de', source: 'lamba', target: 'die Lampe', difficulty: 'medium', distractors: ['der', 'Tisch'] }),
  translation({ id: 'd2-wb-buch-tr', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'], direction: 'de-to-tr', source: 'das Buch', target: 'kitap', difficulty: 'easy' }),
  translation({ id: 'd2-wb-buch-de', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'], direction: 'tr-to-de', source: 'kitap', target: 'das Buch', difficulty: 'hard', distractors: ['die', 'Lampe'] }),
  translation({ id: 'd2-wb-du-bist-tr', day: 2, topicId: D2_SEIN, conceptIds: ['day2.sein.cekim'], direction: 'de-to-tr', source: 'Du bist müde.', target: 'Sen yorgunsun.', alternatives: ['Yorgunsun.'], difficulty: 'easy' }),
  translation({ id: 'd2-wb-zamanimiz-de', day: 2, topicId: D2_SEIN, conceptIds: ['day2.haben.var-yok', 'day2.haben.cekim'], direction: 'tr-to-de', source: 'Zamanımız var.', target: 'Wir haben Zeit.', difficulty: 'medium', distractors: ['habt', 'Du'] }),
  translation({ id: 'd2-wb-vater-tr', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.isim-buyuk-harf'], direction: 'de-to-tr', source: 'Mein Vater ist Lehrer.', target: 'Babam öğretmen.', alternatives: ['Benim babam öğretmen.'], difficulty: 'medium' }),
  translation({ id: 'd2-wb-siz-yorgun-de', day: 2, topicId: D2_SEIN, conceptIds: ['day2.sein.cekim'], direction: 'tr-to-de', source: 'Siz yorgunsunuz.', target: 'Ihr seid müde.', difficulty: 'hard', distractors: ['sind', 'Wir'] }),
  translation({ id: 'd2-wb-eve-tr', day: 2, topicId: D2_KON, conceptIds: ['day2.konjugation.du-st', 'day2.konjugation.ornek-cumleler'], direction: 'de-to-tr', source: 'Du gehst nach Hause.', target: 'Sen eve gidiyorsun.', alternatives: ['Eve gidiyorsun.'], difficulty: 'medium', distractors: ['Biz', 'gidiyoruz'] }),
  translation({ id: 'd2-wb-masa-de', day: 2, topicId: D2_ART, conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'], direction: 'tr-to-de', source: 'masa', target: 'der Tisch', difficulty: 'hard', distractors: ['die', 'das', 'Lampe'] }),

  // 3. Gün — kendini tanıtma ve nasılsın kalıpları, 7'şer yön.
  translation({ id: 'd3-wb-heisst-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.soru.wie-heisst-du'], direction: 'de-to-tr', source: 'Wie heißt du?', target: 'Adın ne?', alternatives: ['Adın nedir?'], difficulty: 'easy' }),
  translation({ id: 'd3-wb-adin-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.soru.wie-heisst-du'], direction: 'tr-to-de', source: 'Adın ne?', target: 'Wie heißt du?', difficulty: 'medium', distractors: ['Wo', 'wohnst'] }),
  translation({ id: 'd3-wb-gehts-tr', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.wie-gehts-dir'], direction: 'de-to-tr', source: "Wie geht's dir?", target: 'Nasılsın?', difficulty: 'easy' }),
  translation({ id: 'd3-wb-oturuyorsun-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.soru.wo-wohnst-du'], direction: 'tr-to-de', source: 'Nerede oturuyorsun?', target: 'Wo wohnst du?', difficulty: 'hard', distractors: ['Woher', 'kommst'] }),
  translation({ id: 'd3-wb-woher-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.soru.woher-kommst-du'], direction: 'de-to-tr', source: 'Woher kommst du?', target: 'Nerelisin?', alternatives: ['Nereden geliyorsun?'], difficulty: 'medium', distractors: ['Nerede', 'oturuyorsun'] }),
  translation({ id: 'd3-wb-turkiye-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.kommen-aus', 'day3.cevap.aus-der-tuerkei'], direction: 'tr-to-de', source: 'Türkiye’den geliyorum.', target: 'Ich komme aus der Türkei.', difficulty: 'hard', distractors: ['kommst', 'Du'] }),
  translation({ id: 'd3-wb-istanbul-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.wohnen-in'], direction: 'de-to-tr', source: 'Ich wohne in Istanbul.', target: 'İstanbul’da oturuyorum.', alternatives: ["İstanbul'da yaşıyorum.", 'İstanbul’da yaşıyorum.'], difficulty: 'medium', distractors: ['geliyorum'] }),
  translation({ id: 'd3-wb-mustafa-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.ich-bin'], direction: 'tr-to-de', source: "Ben Mustafa'yım.", target: 'Ich bin Mustafa.', difficulty: 'hard', distractors: ['bist', 'du'] }),
  translation({ id: 'd3-wb-heisse-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.ich-heisse'], direction: 'de-to-tr', source: 'Ich heiße Mustafa.', target: 'Benim adım Mustafa.', alternatives: ['Adım Mustafa.'], difficulty: 'medium', distractors: ['Senin', 'adın'] }),
  translation({ id: 'd3-wb-iyiyim-de', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.es-oznesi'], direction: 'tr-to-de', source: 'İyiyim.', target: 'Mir geht es gut.', difficulty: 'hard', distractors: ['dir', 'Wie'] }),
  translation({ id: 'd3-wb-ihnen-tr', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.wie-geht-es-ihnen'], direction: 'de-to-tr', source: 'Wie geht es Ihnen?', target: 'Nasılsınız?', difficulty: 'medium', distractors: ['Nasılsın'] }),
  translation({ id: 'd3-wb-nasilsiniz-de', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.wie-geht-es-ihnen'], direction: 'tr-to-de', source: 'Nasılsınız?', target: 'Wie geht es Ihnen?', difficulty: 'hard', distractors: ['dir', 'du'] }),
  translation({ id: 'd3-wb-woher-sie-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.soru.woher-kommst-du', 'day3.soru.du-sie-ayrimi'], direction: 'de-to-tr', source: 'Woher kommen Sie?', target: 'Nerelisiniz?', difficulty: 'hard', distractors: ['Nerelisin'] }),
  translation({ id: 'd3-wb-super-de', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.cevaplar'], direction: 'tr-to-de', source: 'Süperim!', target: 'Super!', difficulty: 'easy', distractors: ['Schlecht'] }),
  translation({ id: 'd3-wb-mustafa-tr', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.ich-bin'], direction: 'de-to-tr', source: 'Ich bin Mustafa.', target: "Ben Mustafa'yım.", alternatives: ["Mustafa'yım."], difficulty: 'easy', distractors: ['Sen', 'değilim'] }),
  translation({ id: 'd3-wb-benim-adim-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.ich-heisse'], direction: 'tr-to-de', source: 'Benim adım Mustafa.', target: 'Ich heiße Mustafa.', difficulty: 'medium', distractors: ['bin', 'Du'] }),
  translation({ id: 'd3-wb-gut-tr', day: 3, topicId: D3_NASIL, conceptIds: ['day3.nasilsin.es-oznesi'], direction: 'de-to-tr', source: 'Mir geht es gut.', target: 'İyiyim.', difficulty: 'medium', distractors: ['Süperim'] }),
  translation({ id: 'd3-wb-istanbul-de', day: 3, topicId: D3_TAN, conceptIds: ['day3.cevap.wohnen-in'], direction: 'tr-to-de', source: 'İstanbul’da oturuyorum.', target: 'Ich wohne in Istanbul.', difficulty: 'hard', distractors: ['aus', 'komme'] }),
];
