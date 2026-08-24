/** Yazilmis icerik katmaninin tek giris noktasi. */

import { CONCEPTS, SUMMARY_TOPICS } from './concepts.ts';
import { VAULT_TAGS } from './vault-tags.ts';
import { DAY1_EXERCISES } from './exercises/day1.ts';
import { DAY2_EXERCISES } from './exercises/day2.ts';
import { DAY3_EXERCISES } from './exercises/day3.ts';
import { DAY4_EXERCISES } from './exercises/day4.ts';
import { DAY5_EXERCISES } from './exercises/day5.ts';
import { DAY6_EXERCISES } from './exercises/day6.ts';
import { TRANSLATION_EXERCISES } from './exercises/translations.ts';
import { PRIVATE_DAY1_EXERCISES } from './exercises/privateDay1.ts';
import { PRIVATE_DAY2_EXERCISES } from './exercises/privateDay2.ts';
import { DAY_4_6_SOURCE_INVENTORY, DAY_4_6_SOURCE_TOPICS } from './sources.ts';
import type { AuthoredExercise } from './types.ts';

export const AUTHORED_EXERCISES: AuthoredExercise[] = [
  ...DAY1_EXERCISES,
  ...DAY2_EXERCISES,
  ...DAY3_EXERCISES,
  ...DAY4_EXERCISES,
  ...DAY5_EXERCISES,
  ...DAY6_EXERCISES,
  ...TRANSLATION_EXERCISES,
  ...PRIVATE_DAY1_EXERCISES,
  ...PRIVATE_DAY2_EXERCISES,
];

export const AUTHORED_LAYER = {
  concepts: CONCEPTS,
  exercises: AUTHORED_EXERCISES,
  vaultTags: VAULT_TAGS,
  sources: DAY_4_6_SOURCE_INVENTORY,
  sourceTopics: DAY_4_6_SOURCE_TOPICS,
};

/** Konu ID → UI basligi. */
export const TOPIC_TITLES: Record<string, string> = Object.fromEntries(
  SUMMARY_TOPICS.map((topic) => [topic.id, topic.title]),
);

export { CONCEPTS, SUMMARY_TOPICS, VAULT_TAGS, DAY_4_6_SOURCE_INVENTORY, DAY_4_6_SOURCE_TOPICS };
export type { AuthoredExercise };
