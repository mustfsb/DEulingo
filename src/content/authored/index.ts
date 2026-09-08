/** Yazilmis icerik katmaninin tek giris noktasi. Tek müfredat: Özel Ders günleri. */

import { CONCEPTS, SUMMARY_TOPICS } from './concepts.ts';
import { PRIVATE_DAY1_EXERCISES } from './exercises/privateDay1.ts';
import { PRIVATE_DAY2_EXERCISES } from './exercises/privateDay2.ts';
import { PRIVATE_DAY3_EXERCISES } from './exercises/privateDay3.ts';
import { PRIVATE_DAY5_EXERCISES } from './exercises/privateDay5.ts';
import { PRIVATE_DAY6_EXERCISES } from './exercises/privateDay6.ts';
import { PRIVATE_DAY7_EXERCISES } from './exercises/privateDay7.ts';
import { PRIVATE_DAY10_EXERCISES } from './exercises/privateDay10.ts';
import { GENERAL_REVIEW_EXERCISES } from './exercises/generalReview.ts';
import type { AuthoredExercise } from './types.ts';

export const AUTHORED_EXERCISES: AuthoredExercise[] = [
  ...PRIVATE_DAY1_EXERCISES,
  ...PRIVATE_DAY2_EXERCISES,
  ...PRIVATE_DAY3_EXERCISES,
  ...PRIVATE_DAY5_EXERCISES,
  ...PRIVATE_DAY6_EXERCISES,
  ...PRIVATE_DAY7_EXERCISES,
  ...PRIVATE_DAY10_EXERCISES,
  ...GENERAL_REVIEW_EXERCISES,
];

export const AUTHORED_LAYER = {
  concepts: CONCEPTS,
  exercises: AUTHORED_EXERCISES,
  vaultTags: {},
  sources: [],
  sourceTopics: [],
};

/** Konu ID → UI basligi. */
export const TOPIC_TITLES: Record<string, string> = Object.fromEntries(
  SUMMARY_TOPICS.map((topic) => [topic.id, topic.title]),
);

export { CONCEPTS, SUMMARY_TOPICS };
export type { AuthoredExercise };
