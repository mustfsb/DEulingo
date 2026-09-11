/**
 * Modalverben — konu alıştırma bankası.
 *
 * Özel ders notlarından taşınan alıştırmalar; `legacyDay` yalnızca kaynak
 * izidir ve hiçbir davranışı sürmez. Kimlikler kalıcı ilerleme için korunur.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { NEW_MODAL_VERBS_EXERCISES } from './modal-verbs-bank.ts';

/** Daha önce öğrenilmiş `möchten` alıştırmaları (konu artık Modalverben). */
const EARLIER_MOECHTEN_EXERCISES: AuthoredExercise[] = [
  /* ---- Temel Kural — Modalverb İkinci Sırada, Mastar Sonda (2) ---- */
  {
    id: 'p3-cd-moechten-infinitiv-mc',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'multiple-choice', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['modal-verbs.moechten-infinitiv'],
    familyId: 'p3-cd-moechten-infinitiv',
    instruction: '"Ich möchte ein Brot kaufen." cümlesinde "kaufen" nerede durur?',
    prompt: 'möchte + ... + fiil (mastar)',
    answer: 'cümlenin en sonunda',
    options: ['cümlenin en sonunda', 'möchte\'den hemen önce', 'cümlenin başında', 'özneden hemen sonra'],
  },
  {
    id: 'p3-cd-moechten-order',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'ordering', difficulty: 'hard', skill: 'production',
    conceptIds: ['modal-verbs.moechten-infinitiv'],
    familyId: 'p3-cd-moechten-order',
    instruction: 'Kelime kartlarını doğru sıraya koy:',
    prompt: 'Ich / möchte / ein / Brot / kaufen.',
    answer: 'Ich möchte ein Brot kaufen.',
    words: ['Ich', 'möchte', 'ein', 'Brot', 'kaufen'],
    pronounce: ['Ich möchte ein Brot kaufen.'],
  },

  /* ---- möchten — kibarca istemek (5) ---- */
  {
    id: 'p3-mg-moechte-cekim-fill',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'fill-blank', difficulty: 'easy', skill: 'recall',
    conceptIds: ['modal-verbs.moechten.cekim'],
    familyId: 'p3-mg-moechte-cekim',
    instruction: 'möchten çekimi:',
    prompt: 'ich ___ (möchten)',
    answer: 'möchte',
    pronounce: ['ich möchte'],
  },
  {
    id: 'p3-mg-moechtest-mc',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'multiple-choice', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['modal-verbs.moechten.cekim'],
    familyId: 'p3-mg-moechtest',
    instruction: 'möchten çekimi — doğru formu seç:',
    prompt: 'du ___ (möchten)',
    answer: 'möchtest',
    options: ['möchtest', 'möchte', 'magst', 'mögt'],
    pronounce: ['du möchtest'],
  },
  {
    id: 'p3-mg-brot-fill',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'fill-blank', difficulty: 'medium', skill: 'recall',
    conceptIds: ['modal-verbs.moechten.cekim'],
    familyId: 'p3-mg-brot',
    instruction: 'Boşluğu doldur:',
    prompt: 'Ich ___ ein Brot kaufen. (bir ekmek almak istiyorum)',
    answer: 'möchte',
    pronounce: ['Ich möchte ein Brot kaufen.'],
  },
  {
    id: 'p3-mg-schuhe-free-tr',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'free-text', difficulty: 'hard', skill: 'production',
    conceptIds: ['modal-verbs.moechten.cekim'],
    familyId: 'p3-mg-schuhe',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Ben siyah ayakkabı istiyorum. → ______',
    answer: 'Ich möchte schwarze Schuhe.',
    pronounce: ['Ich möchte schwarze Schuhe.'],
  },
  {
    id: 'p3-mg-wb-brot-tr-de',
    topicId: T.modalVerbs, legacyDay: 3,
    type: 'word-bank-translation', difficulty: 'medium', skill: 'production',
    conceptIds: ['modal-verbs.moechten.cekim', 'modal-verbs.moechten-infinitiv'],
    familyId: 'p3-mg-brot',
    instruction: 'Türkçeden Almancaya kur — Bir ekmek almak istiyorum.',
    wordBank: {
      direction: 'tr-to-de',
      sourceText: 'Bir ekmek almak istiyorum.',
      targetLanguage: 'de',
      tokens: [
        { id: 't1', text: 'Ich' }, { id: 't2', text: 'möchte' }, { id: 't3', text: 'ein' },
        { id: 't4', text: 'Brot' }, { id: 't5', text: 'kaufen.' }, { id: 't6', text: 'mag' },
      ],
      acceptedSequences: [['Ich', 'möchte', 'ein', 'Brot', 'kaufen.']],
    },
    answer: 'Ich möchte ein Brot kaufen.',
    pronounce: ['Ich möchte ein Brot kaufen.'],
  },
];

export const MODAL_VERBS_EXERCISES: AuthoredExercise[] = [...EARLIER_MOECHTEN_EXERCISES, ...NEW_MODAL_VERBS_EXERCISES];
