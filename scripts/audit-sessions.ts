import { readFileSync } from 'node:fs';
import { buildSessionPlan, type SessionMode } from '../src/lib/session.ts';
import { RETRY_GAP_MIN, scheduleRetry } from '../src/lib/lesson.ts';
import { createEmptyProgress } from '../src/lib/storage.ts';
import { auditExerciseContent } from '../src/lib/content-audit.ts';
import type { ContentBundle, Exercise, LearningTrack } from '../src/content/types.ts';

const bundle = JSON.parse(readFileSync(new URL('../generated/exercises.json', import.meta.url), 'utf8')) as ContentBundle;
const modes: SessionMode[] = ['normal', 'full', 'quick', 'challenge'];
const seeds = 50;
let failures = 0;

const trackOf = (item: { track?: LearningTrack }): LearningTrack => item.track ?? 'normal';
const dayTrackPairs = [...new Set(bundle.days.map((item) => `${trackOf(item)}:${item.day}`))]
  .map((key) => {
    const [track, day] = key.split(':');
    return { track: track as LearningTrack, day: Number(day) };
  });

for (const { day, track } of dayTrackPairs) {
  const pool = bundle.exercises.filter((exercise) => exercise.day === day && trackOf(exercise) === track);
  const previous = bundle.exercises.filter((exercise) => exercise.day < day && trackOf(exercise) === track);
  const content = auditExerciseContent(pool);
  console.log(`\n[${track}] ${day}. Gün — toplam ${content.total}, benzersiz ID ${content.uniqueIds}, normalize soru ${content.uniqueNormalizedPrompts}, aile ${content.familyCount}`);
  if (content.largestFamily) console.log(`  En büyük aile: ${content.largestFamily.id} (${content.largestFamily.count}) · olası yakın kopya: ${content.nearDuplicates.length}`);

  for (const mode of modes) {
    let totalPrimary = 0;
    let familyAdjacent = 0;
    let scheduledRetries = 0;
    for (let seed = 0; seed < seeds; seed += 1) {
      const plan = buildSessionPlan({ pool, previous, progress: createEmptyProgress(), mode, seed: `audit:${day}:${mode}:${seed}` });
      const ids = plan.primaryQueue.map((item) => item.exerciseId);
      if (new Set(ids).size !== ids.length || plan.primaryQueue.some((item) => item.presentationReason !== 'primary')) {
        failures += 1;
      }
      totalPrimary += ids.length;
      const byId = new Map<string, Exercise>([...pool, ...previous].map((exercise) => [exercise.id, exercise]));
      for (let index = 1; index < ids.length; index += 1) {
        const family = byId.get(ids[index])?.familyId;
        if (family && family === byId.get(ids[index - 1])?.familyId) familyAdjacent += 1;
      }
      if (plan.primaryQueue.length > RETRY_GAP_MIN) {
        const scheduled = scheduleRetry(plan.primaryQueue, 0, plan.primaryQueue[0].exerciseId, {});
        const retryIndex = scheduled.queue.findIndex((item) => item.presentationReason === 'mistake-retry');
        const differentBetween = new Set(scheduled.queue.slice(1, retryIndex).map((item) => item.exerciseId));
        if (retryIndex < 0 || differentBetween.size < RETRY_GAP_MIN) failures += 1;
        else scheduledRetries += 1;
      }
    }
    console.log(`  ${mode.padEnd(9)} ${seeds} tohum · ort. birincil ${(totalPrimary / seeds).toFixed(1)} · birincil kopya 0 · bitişik aile ${familyAdjacent} · zorunlu hata retry ${scheduledRetries}/${seeds}`);
  }
}

console.log('\nAlıştırma setleri — 50 tohumlu tam havuz denetimi');
for (const day of [1, 2, 3]) {
  const pool = bundle.exercises.filter((exercise) => exercise.day === day && trackOf(exercise) === 'normal');
  for (const exerciseSetId of ['set-1', 'set-2', 'set-3'] as const) {
    const expected = pool.filter((exercise) => exercise.exerciseSetId === exerciseSetId);
    const expectedIds = new Set(expected.map((exercise) => exercise.id));
    const orders = new Set<string>();
    for (let seed = 0; seed < seeds; seed += 1) {
      const plan = buildSessionPlan({
        pool,
        previous: bundle.exercises.filter((exercise) => exercise.day < day && trackOf(exercise) === 'normal'),
        progress: createEmptyProgress(),
        mode: 'set',
        exerciseSetId,
        seed: `audit:${day}:${exerciseSetId}:${seed}`,
      });
      const ids = plan.primaryQueue.map((item) => item.exerciseId);
      const exactSet = ids.length === expectedIds.size && ids.every((id) => expectedIds.has(id));
      if (!expected.length || new Set(ids).size !== ids.length || !exactSet || plan.retryQueue.length) failures += 1;
      orders.add(ids.join('|'));
    }
    if (orders.size < 2) failures += 1;
    console.log(`  ${day}. Gün ${exerciseSetId} · ${expected.length} soru · ${orders.size}/${seeds} farklı sıra · birincil kopya 0`);
  }
}

if (failures) {
  console.error(`\n[session-audit] ${failures} doğrulama hatası bulundu.`);
  process.exit(1);
}
console.log('\n[session-audit] Birincil kuyruklar benzersiz; hata tekrarları sınırlı ve aralıklı.');
