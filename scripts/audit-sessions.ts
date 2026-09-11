/**
 * Oturum denetimi — konu tabanlı.
 *
 * Her kanonik konu × (Normal, Tam, Hızlı, Zor) ve her Genel Tekrar modu ×
 * 50 tohum için oturum kurar; birincil kuyrukta ID kopyası olmadığını,
 * hata tekrarlarının aralıklı planlandığını ve aynı ailenin art arda
 * gelmediğini raporlar.
 *
 * Kullanım: npm run audit:sessions
 */
import { readFileSync } from 'node:fs';
import { buildSessionPlan, type SessionMode } from '../src/lib/session.ts';
import { RETRY_GAP_MIN, scheduleRetry } from '../src/lib/lesson.ts';
import { createEmptyProgress } from '../src/lib/storage.ts';
import { auditExerciseContent } from '../src/lib/content-audit.ts';
import { reviewPoolFor, type ReviewMode } from '../src/lib/general-review.ts';
import type { ContentBundle, Exercise } from '../src/content/types.ts';

const bundle = JSON.parse(readFileSync(new URL('../generated/exercises.json', import.meta.url), 'utf8')) as ContentBundle;
const LESSON_MODES: SessionMode[] = ['normal', 'full', 'quick', 'challenge'];
const REVIEW_MODES: Array<[ReviewMode, SessionMode]> = [
  ['mixed', 'gr-mixed'],
  ['vocab', 'gr-vocab'],
  ['sentence', 'gr-sentence'],
  ['writing', 'gr-writing'],
  ['listening', 'gr-listening'],
  ['quick', 'gr-quick'],
  ['challenge', 'gr-challenge'],
];
const SEEDS = 50;
let failures = 0;

const lessonBank = bundle.exercises.filter((exercise) => !exercise.reviewOnly);
const reviewBank = bundle.exercises.filter((exercise) => exercise.reviewOnly);
const byId = new Map<string, Exercise>(bundle.exercises.map((exercise) => [exercise.id, exercise]));
const topicPool = (topicId: string) =>
  lessonBank.filter((exercise) => exercise.topicId === topicId || exercise.secondaryTopicIds?.includes(topicId));

interface AuditLine {
  label: string;
  averagePrimary: number;
  duplicateSessions: number;
  familyAdjacent: number;
  retries: number;
}

function auditPlans(label: string, pool: Exercise[], mode: SessionMode, topicId?: string): AuditLine {
  let totalPrimary = 0;
  let duplicateSessions = 0;
  let familyAdjacent = 0;
  let retries = 0;
  for (let seed = 0; seed < SEEDS; seed += 1) {
    const plan = buildSessionPlan({ pool, progress: createEmptyProgress(), mode, topicId, seed: `audit:${label}:${seed}` });
    const ids = plan.primaryQueue.map((item) => item.exerciseId);
    if (new Set(ids).size !== ids.length || plan.primaryQueue.some((item) => item.presentationReason !== 'primary')) {
      duplicateSessions += 1;
      failures += 1;
    }
    if (plan.retryQueue.length) failures += 1;
    totalPrimary += ids.length;
    for (let index = 1; index < ids.length; index += 1) {
      const family = byId.get(ids[index])?.familyId;
      if (family && family === byId.get(ids[index - 1])?.familyId) familyAdjacent += 1;
    }
    if (plan.primaryQueue.length > RETRY_GAP_MIN) {
      const scheduled = scheduleRetry(plan.primaryQueue, 0, plan.primaryQueue[0].exerciseId, {});
      const retryIndex = scheduled.queue.findIndex((item) => item.presentationReason === 'mistake-retry');
      const differentBetween = new Set(scheduled.queue.slice(1, retryIndex).map((item) => item.exerciseId));
      if (retryIndex < 0 || differentBetween.size < RETRY_GAP_MIN) failures += 1;
      else retries += 1;
    }
  }
  return { label, averagePrimary: totalPrimary / SEEDS, duplicateSessions, familyAdjacent, retries };
}

const print = (line: AuditLine) =>
  console.log(
    `  ${line.label.padEnd(22)} ${SEEDS} tohum · ort. birincil ${line.averagePrimary.toFixed(1).padStart(4)} · birincil kopyalı oturum ${line.duplicateSessions} · bitişik aile ${line.familyAdjacent} · hata retry ${line.retries}/${SEEDS}`,
  );

for (const topic of bundle.topics) {
  const pool = topicPool(topic.id);
  const content = auditExerciseContent(pool);
  console.log(
    `\n${topic.title} (${topic.id}) — havuz ${content.total} (birincil ${topic.exerciseIds.length} + bağlantılı ${topic.secondaryExerciseIds.length}), benzersiz ID ${content.uniqueIds}, normalize soru ${content.uniqueNormalizedPrompts}, olası yakın kopya ${content.nearDuplicates.length}`,
  );
  for (const mode of LESSON_MODES) print(auditPlans(`${mode}`, pool, mode, topic.id));
  const reviewTopicPool = reviewPoolFor(reviewBank, 'topic', topic.id, lessonBank);
  if (reviewTopicPool.length >= 6) print(auditPlans('Genel Tekrar · konu', reviewTopicPool, 'gr-topic', topic.id));
}

console.log('\nGenel Tekrar modları (konular arası)');
for (const [reviewMode, sessionMode] of REVIEW_MODES) {
  print(auditPlans(reviewMode, reviewPoolFor(reviewBank, reviewMode), sessionMode));
}

// Görevin açıkça istediği özet: 50 tohum × (Modalverben Normal/Full/Challenge, Genel Tekrar, Cümle Kurma).
console.log('\nİstenen özet — birincil ID kopyası');
const modal = topicPool('topic.modal-verbs');
for (const [label, pool, mode, topicId] of [
  ['Modalverben Normal', modal, 'normal', 'topic.modal-verbs'],
  ['Modalverben Full', modal, 'full', 'topic.modal-verbs'],
  ['Modalverben Challenge', modal, 'challenge', 'topic.modal-verbs'],
  ['Genel Tekrar', reviewPoolFor(reviewBank, 'mixed'), 'gr-mixed', undefined],
  ['Cümle Kurma', reviewPoolFor(reviewBank, 'sentence'), 'gr-sentence', undefined],
] as Array<[string, Exercise[], SessionMode, string | undefined]>) {
  const line = auditPlans(label, pool, mode, topicId);
  console.log(`  ${label.padEnd(22)} kopyalı oturum ${line.duplicateSessions}/${SEEDS}`);
}

if (failures) {
  console.error(`\n[session-audit] ${failures} doğrulama hatası bulundu.`);
  process.exit(1);
}
console.log('\n[session-audit] Birincil kuyruklar benzersiz; hata tekrarları sınırlı ve aralıklı.');
