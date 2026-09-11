/**
 * Yazilmis icerik katmaninin tek giris noktasi.
 *
 * Alistirma bankalari KONU bazlidir (`topics/<slug>.ts`); Genel Tekrar
 * bankasi (`review/`) ayni kanonik konu etiketlerini tasir.
 */

import { CONCEPTS } from './concepts.ts';
import { GREETINGS_EXERCISES } from './topics/greetings.ts';
import { PERSONAL_INFO_EXERCISES } from './topics/personal-info.ts';
import { NUMBERS_EXERCISES } from './topics/numbers.ts';
import { VERBS_EXERCISES } from './topics/verbs.ts';
import { ARTICLES_EXERCISES } from './topics/articles.ts';
import { PRONOUNS_EXERCISES } from './topics/pronouns.ts';
import { SENTENCE_BUILDING_EXERCISES } from './topics/sentence-building.ts';
import { QUESTIONS_EXERCISES } from './topics/questions.ts';
import { PLACES_EXERCISES } from './topics/places.ts';
import { LIKES_EXERCISES } from './topics/likes.ts';
import { FOOD_EXERCISES } from './topics/food.ts';
import { SHOPPING_EXERCISES } from './topics/shopping.ts';
import { HOME_EXERCISES } from './topics/home.ts';
import { ADJECTIVES_EXERCISES } from './topics/adjectives.ts';
import { AKKUSATIV_EXERCISES } from './topics/akkusativ.ts';
import { TIME_EXERCISES } from './topics/time.ts';
import { DAILY_ROUTINE_EXERCISES } from './topics/daily-routine.ts';
import { SEPARABLE_VERBS_EXERCISES } from './topics/separable-verbs.ts';
import { MODAL_VERBS_EXERCISES } from './topics/modal-verbs.ts';
import { VOCABULARY_EXERCISES } from './topics/vocabulary.ts';
import { GENERAL_REVIEW_EXERCISES } from './review/index.ts';
import type { AuthoredExercise } from './types.ts';

/** Konu ders bankaları (müfredat haritası sırasıyla). */
export const TOPIC_EXERCISES: AuthoredExercise[] = [
  ...GREETINGS_EXERCISES,
  ...PERSONAL_INFO_EXERCISES,
  ...NUMBERS_EXERCISES,
  ...VERBS_EXERCISES,
  ...ARTICLES_EXERCISES,
  ...PRONOUNS_EXERCISES,
  ...SENTENCE_BUILDING_EXERCISES,
  ...QUESTIONS_EXERCISES,
  ...PLACES_EXERCISES,
  ...LIKES_EXERCISES,
  ...FOOD_EXERCISES,
  ...SHOPPING_EXERCISES,
  ...HOME_EXERCISES,
  ...ADJECTIVES_EXERCISES,
  ...AKKUSATIV_EXERCISES,
  ...TIME_EXERCISES,
  ...DAILY_ROUTINE_EXERCISES,
  ...SEPARABLE_VERBS_EXERCISES,
  ...MODAL_VERBS_EXERCISES,
  ...VOCABULARY_EXERCISES,
];

export const AUTHORED_EXERCISES: AuthoredExercise[] = [...TOPIC_EXERCISES, ...GENERAL_REVIEW_EXERCISES];

export const AUTHORED_LAYER = {
  concepts: CONCEPTS,
  exercises: AUTHORED_EXERCISES,
};

export { CONCEPTS };
export type { AuthoredExercise };
