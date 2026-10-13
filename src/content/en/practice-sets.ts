/**
 * İngilizce odaklı pratik setleri (haftalık plan derin bağlantıları).
 *
 * Bir özet bölümü ("present-perfect.v3") tek başına yeterince dar olmayabilir:
 * "Past Perfect + Türkçe→İngilizce" yalnızca o konunun ÇEVİRİ alıştırmalarını
 * ister. Set, konu + bölüm + tür kesişiminden havuz üretir; `lesson` rotasında
 * `bolum` segmenti olarak taşınır (`set.` önekli, özet bölümü kimlikleriyle
 * çakışmaz). Havuz kimlik/bölüm bazlıdır: yalnızca başlık değiştirmez.
 */

import type { Exercise, ExerciseType } from '../types.ts';

export const PRACTICE_SET_PREFIX = 'set.';

export interface PracticeSetDef {
  /** Kararlı kimlik: `set.<kısa-ad>`. */
  id: string;
  topicId: string;
  title: string;
  /** Yalnızca bu özet bölümlerinden (boşsa tüm konu). */
  sectionIds?: string[];
  /** Yalnızca bu alıştırma türleri. */
  types?: ExerciseType[];
  /** Ek koşul (örn. Türkçe→İngilizce üretim). */
  where?: (exercise: Exercise) => boolean;
}

export function isPracticeSetId(id: string | undefined): boolean {
  return !!id && id.startsWith(PRACTICE_SET_PREFIX);
}

/** Türkçeden İngilizceye aktif üretim (kutucuk ya da serbest yazım). */
export function isTurkishToEnglish(exercise: Exercise): boolean {
  if (exercise.type === 'word-bank-translation') return exercise.wordBank?.direction === 'tr-to-en';
  if (exercise.type !== 'free-text') return false;
  return /Türkçe|çevir/i.test(exercise.instruction) || /→\s*_{3,}/.test(exercise.prompt ?? '');
}

const PP = 'en.present-perfect';
const SS = 'en.sentence-structure';
const PPF = 'en.past-perfect';
const GI = 'en.gerund-infinitive';
const COND = 'en.conditionals';
const PREP = 'en.prepositions-collocations';

/** Sentence Structure'ın "temel sıra" bölümleri (soru/genişletme/hata bölümleri ayrı aktivitedir). */
const SS_CORE = ['sentence-structure.svo', 'sentence-structure.place-time', 'sentence-structure.connectors'];
const PREP_CHUNKS = [
  'prepositions-collocations.chunks-a', 'prepositions-collocations.chunks-b', 'prepositions-collocations.chunks-c',
];
/** Bölüm etiketi olmayan çekirdek Present Perfect alıştırmaları (V3 ve for/since ayrı aktivitedir). */
const ppCore = (exercise: Exercise): boolean => exercise.sectionId === undefined;

/**
 * Hafta 1 setleri bir konunun havuzunu AYRIK parçalara böler: aynı soru iki
 * farklı aktivitede sayılmaz (`week-workload.test.ts` örtüşmeyi denetler).
 * Böylece her aktivitenin süresi gerçekten o aktiviteye ait işten türetilir.
 */
export const EN_PRACTICE_SETS: PracticeSetDef[] = [
  // Present Perfect (Session A)
  {
    id: 'set.pp.recognition', topicId: PP, title: 'Tanı + Kontrollü Pratik',
    types: ['multiple-choice', 'fill-blank', 'matching', 'listen-choice'], where: ppCore,
  },
  {
    id: 'set.pp.production', topicId: PP, title: 'Aktif Üretim',
    types: ['free-text', 'word-bank-translation', 'sentence-builder', 'ordering', 'dictation'], where: ppCore,
  },
  { id: 'set.pp.errors', topicId: PP, title: 'Error Correction', types: ['error-correction'] },
  // Sentence Structure (Session C)
  { id: 'set.ss.recognition', topicId: SS, title: 'Recognition', sectionIds: SS_CORE, types: ['multiple-choice', 'fill-blank', 'listen-choice'] },
  { id: 'set.ss.ordering', topicId: SS, title: 'Sentence Ordering', sectionIds: SS_CORE, types: ['ordering'] },
  { id: 'set.ss.tr-en', topicId: SS, title: 'Türkçe → İngilizce', sectionIds: SS_CORE, types: ['free-text', 'word-bank-translation', 'dictation'] },
  { id: 'set.ss.error-correction', topicId: SS, title: 'Error Correction', types: ['error-correction'] },
  // Past Perfect (Session D)
  {
    id: 'set.ppf.contrast', topicId: PPF, title: 'Formül + Past Simple vs Past Perfect',
    sectionIds: ['past-perfect.formula', 'past-perfect.vs-past', 'past-perfect.by-the-time', 'past-perfect.mistakes'],
  },
  {
    id: 'set.ppf.timeline-build', topicId: PPF, title: 'Zaman Çizgisi: Kur',
    sectionIds: ['past-perfect.timeline'], types: ['ordering', 'word-bank-translation', 'dictation'],
  },
  { id: 'set.ppf.tr-en', topicId: PPF, title: 'Türkçe → İngilizce', sectionIds: ['past-perfect.timeline'], types: ['free-text'] },
  // Gerund & Infinitive (Session D)
  {
    id: 'set.gi.patterns', topicId: GI, title: 'Verb Pattern Matching',
    sectionIds: ['gerund-infinitive.gerund', 'gerund-infinitive.infinitive', 'gerund-infinitive.look-forward'],
    types: ['matching', 'multiple-choice', 'fill-blank', 'listen-choice', 'dictation'],
  },
  { id: 'set.gi.build', topicId: GI, title: 'Kalıp Kurma', sectionIds: ['gerund-infinitive.production'], types: ['word-bank-translation', 'ordering'] },
  { id: 'set.gi.production', topicId: GI, title: 'Serbest Üretim', sectionIds: ['gerund-infinitive.production'], types: ['free-text'] },
  // Conditionals (Session F)
  {
    id: 'set.cond.second-structure', topicId: COND, title: 'Zero · First · Second Yapısı',
    sectionIds: ['conditionals.zero-first', 'conditionals.second'],
    types: ['multiple-choice', 'fill-blank', 'ordering', 'word-bank-translation', 'listen-choice', 'dictation'],
  },
  { id: 'set.cond.tr-en', topicId: COND, title: 'Türkçe → İngilizce', sectionIds: ['conditionals.zero-first', 'conditionals.second'], types: ['free-text'] },
  { id: 'set.cond.hypotheticals', topicId: COND, title: 'Kişisel Varsayımlar', sectionIds: ['conditionals.hypotheticals'], types: ['free-text'] },
  // Prepositions & Collocations (Session E + F)
  {
    id: 'set.prep.recognition', topicId: PREP, title: 'Chunk Recognition',
    types: ['multiple-choice', 'fill-blank', 'matching', 'listen-choice', 'dictation'],
  },
  { id: 'set.prep.chunk-writing', topicId: PREP, title: 'Öbekle Cümle Yaz', sectionIds: PREP_CHUNKS, types: ['free-text'] },
  {
    id: 'set.prep.production', topicId: PREP, title: 'Active Production',
    sectionIds: ['prepositions-collocations.production'], types: ['word-bank-translation', 'ordering', 'free-text'],
  },
  {
    id: 'set.pp.listen-speak', topicId: PP, title: 'Dinle + Konuş',
    types: ['listen-choice', 'dictation', 'spoken'],
  },
];

export const EN_PRACTICE_SET_BY_ID = new Map(EN_PRACTICE_SETS.map((set) => [set.id, set]));

/** Set havuzu: yalnızca konuya ait ders alıştırmaları (Genel Tekrar bankası hariç). */
export function exercisesForPracticeSet(setId: string, lesson: readonly Exercise[]): Exercise[] {
  const set = EN_PRACTICE_SET_BY_ID.get(setId);
  if (!set) return [];
  return lesson.filter(
    (exercise) =>
      exercise.topicId === set.topicId &&
      (!set.sectionIds || (exercise.sectionId !== undefined && set.sectionIds.includes(exercise.sectionId))) &&
      (!set.types || set.types.includes(exercise.type)) &&
      (!set.where || set.where(exercise)),
  );
}
