/**
 * Kapsam denetimi — gün tabanlı müfredattan konu tabanlı müfredata geçiş.
 *
 * `src/content/curriculum/legacy-inventory.json` (geçiş öncesi paketin
 * envanteri) ile güncel paketi karşılaştırır:
 *   - tarihî kavramlar → eşlenen / bilinçli emekli / eşlenmemiş
 *   - tarihî alıştırmalar → taşınan / bilinçli kaldırılan / kayıp
 *   - tarihî özet konuları → yeni bölüm / emekli hedef bildirimi
 *   - özet kapsamı (her kavramın özet açıklaması)
 *   - tek taksonomi (Genel Tekrar dahil hiçbir yerde ikinci konu sistemi yok)
 *
 * Eşlenmemiş kavram, kayıp alıştırma ya da ikinci taksonomi varsa çıkış kodu 1.
 * Kullanım: npm run audit:coverage
 */
import { readFileSync } from 'node:fs';
import type { ContentBundle } from '../src/content/types.ts';
import {
  LEGACY_CONCEPT_MAP,
  LEGACY_SECTION_MAP,
  RETIRED_LEGACY_CONCEPTS,
  RETIRED_LEGACY_EXERCISES,
} from '../src/content/curriculum/legacy.ts';
import { REVIEW_SECTIONS, SECTION_BY_ID, TOPIC_BY_ID, TOPICS } from '../src/content/curriculum/topics.ts';

interface Inventory {
  capturedFromContentVersion: string;
  exercises: Array<{ id: string; day: number; topicId: string; reviewOnly: boolean }>;
  concepts: Array<{ id: string; day: number; topicId: string }>;
  summaryTopics: Array<{ day: number; id: string; title: string }>;
}

const bundle = JSON.parse(readFileSync(new URL('../generated/exercises.json', import.meta.url), 'utf8')) as ContentBundle;
const inventory = JSON.parse(
  readFileSync(new URL('../src/content/curriculum/legacy-inventory.json', import.meta.url), 'utf8'),
) as Inventory;

const conceptIds = new Set(bundle.concepts.map((concept) => concept.id));
const exerciseById = new Map(bundle.exercises.map((exercise) => [exercise.id, exercise]));
const problems: string[] = [];
const pct = (part: number, whole: number) => (whole ? `%${((part / whole) * 100).toFixed(1)}` : '—');

/* 1) Tarihî kavramlar ------------------------------------------------ */
const mappedConcepts = inventory.concepts.filter((concept) => {
  const target = LEGACY_CONCEPT_MAP[concept.id];
  return Boolean(target && conceptIds.has(target));
});
const retiredConcepts = inventory.concepts.filter((concept) => RETIRED_LEGACY_CONCEPTS[concept.id]);
const unmappedConcepts = inventory.concepts.filter(
  (concept) => !mappedConcepts.includes(concept) && !retiredConcepts.includes(concept),
);
if (unmappedConcepts.length) problems.push(`Eşlenmemiş tarihî kavram: ${unmappedConcepts.map((concept) => concept.id).join(', ')}`);
const newConcepts = bundle.concepts.filter((concept) => !Object.values(LEGACY_CONCEPT_MAP).includes(concept.id));

/* 2) Tarihî alıştırmalar --------------------------------------------- */
const migrated = inventory.exercises.filter((exercise) => exerciseById.has(exercise.id));
const retired = inventory.exercises.filter((exercise) => !exerciseById.has(exercise.id) && RETIRED_LEGACY_EXERCISES[exercise.id]);
const lost = inventory.exercises.filter((exercise) => !exerciseById.has(exercise.id) && !RETIRED_LEGACY_EXERCISES[exercise.id]);
if (lost.length) problems.push(`Kaybolan tarihî alıştırma: ${lost.map((exercise) => exercise.id).join(', ')}`);
const retiredStillPresent = Object.keys(RETIRED_LEGACY_EXERCISES).filter((id) => exerciseById.has(id));
if (retiredStillPresent.length) problems.push(`Emekli sayılan ama pakette duran alıştırma: ${retiredStillPresent.join(', ')}`);

const legacyDayMismatch = migrated.filter((exercise) => !exercise.reviewOnly && exerciseById.get(exercise.id)!.legacyDay !== exercise.day);
if (legacyDayMismatch.length) problems.push(`legacyDay izi eksik/yanlış: ${legacyDayMismatch.map((exercise) => exercise.id).join(', ')}`);

// Gün → konu dağılımı (birincil konu).
const matrix = new Map<number, Map<string, number>>();
for (const exercise of migrated) {
  const day = exercise.reviewOnly ? 0 : exercise.day;
  const topicId = exerciseById.get(exercise.id)!.topicId;
  const row = matrix.get(day) ?? new Map<string, number>();
  row.set(topicId, (row.get(topicId) ?? 0) + 1);
  matrix.set(day, row);
}

/* 3) Tarihî özet konuları ------------------------------------------- */
const daySummaryTopics = inventory.summaryTopics.filter((topic) => topic.day !== 0);
const reviewSummaryTopics = inventory.summaryTopics.filter((topic) => topic.day === 0);
const sectionMapped = daySummaryTopics.filter((topic) => {
  const target = LEGACY_SECTION_MAP[topic.id];
  return Boolean(target && SECTION_BY_ID.has(target));
});
const sectionRetired = daySummaryTopics.filter((topic) => LEGACY_SECTION_MAP[topic.id] === null);
const sectionUnmapped = daySummaryTopics.filter((topic) => !sectionMapped.includes(topic) && !sectionRetired.includes(topic));
if (sectionUnmapped.length) problems.push(`Eşlenmemiş tarihî özet konusu: ${sectionUnmapped.map((topic) => topic.id).join(', ')}`);
const reviewIds = new Set((bundle.reviewSummary?.sections ?? []).map((section) => section.id));
const reviewLost = reviewSummaryTopics.filter((topic) => !reviewIds.has(topic.id));
if (reviewLost.length) problems.push(`Genel Tekrar özet kimliği kayboldu: ${reviewLost.map((topic) => topic.id).join(', ')}`);

/* 4) Özet kapsamı ---------------------------------------------------- */
const covered = (bundle.coverage ?? []).filter((item) => item.summaryCovered).length;
const practiced = (bundle.coverage ?? []).filter((item) => item.exercises.easy + item.exercises.medium + item.exercises.hard > 0).length;
if (covered !== bundle.concepts.length) problems.push(`Özet açıklaması doğrulanamayan kavram var (${bundle.concepts.length - covered}).`);
const topicsWithoutSummary = TOPICS.filter((topic) => !bundle.summaries.some((summary) => summary.topicId === topic.id));
if (topicsWithoutSummary.length) problems.push(`Özeti olmayan konu: ${topicsWithoutSummary.map((topic) => topic.id).join(', ')}`);

/* 5) Tek taksonomi --------------------------------------------------- */
const foreignExerciseTopics = bundle.exercises.filter(
  (exercise) => !TOPIC_BY_ID.has(exercise.topicId) || (exercise.secondaryTopicIds ?? []).some((id) => !TOPIC_BY_ID.has(id)),
);
const foreignReviewSections = REVIEW_SECTIONS.filter((section) => section.topicId && !TOPIC_BY_ID.has(section.topicId));
const legacyShape = ['days'].filter((key) => key in (bundle as unknown as Record<string, unknown>));
if (foreignExerciseTopics.length) problems.push(`Kanonik olmayan konu etiketi: ${foreignExerciseTopics.map((exercise) => exercise.id).join(', ')}`);
if (foreignReviewSections.length) problems.push(`Genel Tekrar özetinde kanonik olmayan konu: ${foreignReviewSections.map((section) => section.id).join(', ')}`);
if (legacyShape.length) problems.push(`Pakette gün yapısı duruyor: ${legacyShape.join(', ')}`);

/* Rapor -------------------------------------------------------------- */
const lessonCount = bundle.exercises.filter((exercise) => !exercise.reviewOnly).length;
const reviewCount = bundle.exercises.length - lessonCount;
console.log(`Kapsam denetimi — eski paket ${inventory.capturedFromContentVersion} → yeni paket ${bundle.contentVersion}\n`);
console.log('Tarihî kavramlar');
console.log(`  toplam ${inventory.concepts.length} · eşlenen ${mappedConcepts.length} · bilinçli emekli ${retiredConcepts.length} · eşlenmemiş ${unmappedConcepts.length}`);
for (const concept of retiredConcepts) console.log(`    emekli: ${concept.id} — ${RETIRED_LEGACY_CONCEPTS[concept.id]}`);
console.log(`  güncel kavram: ${bundle.concepts.length} (tarihî ${mappedConcepts.length} + yeni ${newConcepts.length})`);

console.log('\nTarihî alıştırmalar');
console.log(
  `  toplam ${inventory.exercises.length} (ders ${inventory.exercises.filter((exercise) => !exercise.reviewOnly).length} + Genel Tekrar ${inventory.exercises.filter((exercise) => exercise.reviewOnly).length})` +
    ` · taşınan ${migrated.length} · bilinçli kaldırılan ${retired.length} · kayıp ${lost.length}`,
);
for (const exercise of retired) console.log(`    kaldırıldı: ${exercise.id} — ${RETIRED_LEGACY_EXERCISES[exercise.id]}`);
console.log(`  güncel paket: ${bundle.exercises.length} alıştırma (ders ${lessonCount} + Genel Tekrar ${reviewCount}); yeni: ${bundle.exercises.length - migrated.length}`);

console.log('\nEski gün → kanonik konu (birincil etiket; 0 = Genel Tekrar bankası)');
for (const [day, row] of [...matrix].sort((a, b) => a[0] - b[0])) {
  const cells = [...row].sort((a, b) => b[1] - a[1]).map(([topicId, count]) => `${TOPIC_BY_ID.get(topicId)?.title ?? topicId} ${count}`);
  console.log(`  ${String(day).padStart(2)} → ${cells.join(' · ')}`);
}

console.log('\nTarihî özet konuları');
console.log(`  gün özetleri: ${daySummaryTopics.length} · yeni bölüme taşınan ${sectionMapped.length} · emekli hedef bildirimi ${sectionRetired.length} · eşlenmemiş ${sectionUnmapped.length}`);
console.log(`  Genel Tekrar özet bölümleri: ${reviewSummaryTopics.length} · kimliği korunan ${reviewSummaryTopics.length - reviewLost.length}`);

console.log('\nÖzet kapsamı');
console.log(`  özet açıklaması doğrulanan kavram: ${covered}/${bundle.concepts.length} (${pct(covered, bundle.concepts.length)})`);
console.log(`  en az bir alıştırması olan kavram: ${practiced}/${bundle.concepts.length} (${pct(practiced, bundle.concepts.length)})`);
console.log(`  özeti olan konu: ${TOPICS.length - topicsWithoutSummary.length}/${TOPICS.length}`);

console.log('\nTek taksonomi');
console.log(`  kanonik olmayan alıştırma konusu: ${foreignExerciseTopics.length} · kanonik olmayan Genel Tekrar bölüm konusu: ${foreignReviewSections.length} · pakette gün yapısı: ${legacyShape.length ? 'VAR' : 'yok'}`);

if (problems.length) {
  console.error(`\n[coverage-audit] ${problems.length} sorun:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\n[coverage-audit] Tarihî içeriğin tamamı konu modeline eşlendi; ikinci taksonomi yok.');
