/**
 * Eşik kalibrasyonu: Jev-uygun kalibrasyon vakalarını canlı Jev ile
 * değerlendirir, aday eşiklerde FAR/FRR/doğruluk tablosu basar.
 *
 *   npm run jev:calibrate            # varsayılan alt küme (~40 vaka)
 *   npm run jev:calibrate -- --full  # tüm Jev-uygun vakalar
 *
 * AI_GATEWAY_API_KEY gerekir. Sonuçlar `docs/jev-calibration.local.json`
 * dosyasına yazılır (gitignored); rapordaki sayılar buradan alınır.
 */
import { writeFileSync } from 'node:fs';
import { loadLocalEnv } from '../server/env.ts';
import { getExercise } from '../server/exercise-store.ts';
import { evaluateSemantic, jevModelId } from '../server/jev-evaluate.ts';
import { CALIBRATION_CASES } from '../src/lib/semantic/calibration.fixtures.ts';
import { deterministicValidate } from '../src/lib/semantic/validate-answer.ts';
import { isSemanticFallbackEligible } from '../src/lib/semantic/policy.ts';
import { CANDIDATE_THRESHOLDS, evaluateThreshold } from '../src/lib/semantic/threshold.ts';

loadLocalEnv();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main(): Promise<void> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error('HATA: AI_GATEWAY_API_KEY yok (.env.local).');
    process.exit(2);
  }
  const full = process.argv.includes('--full');
  // Yalnızca Jev'in gerçekten göreceği vakalar (deterministik incorrect + uygun).
  const eligible = CALIBRATION_CASES.filter((c) => {
    const exercise = getExercise(c.exercise.id) ?? c.exercise;
    return (
      deterministicValidate(exercise, c.userAnswer).status === 'incorrect' &&
      isSemanticFallbackEligible(exercise, c.userAnswer)
    );
  });
  const selected = full ? eligible : eligible.filter((_, i) => i % 2 === 0);
  console.log(`model=${jevModelId()} eligible=${eligible.length} selected=${selected.length}`);

  const rows: Array<{ id: string; gold: string; probability: number; latencyMs: number }> = [];
  const latencies: number[] = [];
  for (const c of selected) {
    const exercise = getExercise(c.exercise.id) ?? c.exercise;
    const started = Date.now();
    try {
      const result = await evaluateSemantic(exercise, c.userAnswer);
      const ms = Date.now() - started;
      latencies.push(ms);
      rows.push({ id: c.id, gold: c.gold, probability: result.probability, latencyMs: ms });
      console.log(`${c.id} gold=${c.gold} prob=${result.probability.toFixed(2)} ${ms}ms`);
    } catch (error) {
      console.log(`ERROR ${c.id}: ${(error as Error).message}`);
    }
    await sleep(2500);
  }

  const stats = CANDIDATE_THRESHOLDS.map((t) =>
    evaluateThreshold(rows.map((r) => ({ gold: r.gold as 'accept' | 'reject', probability: r.probability })), t),
  );
  console.log('\neşik | doğruluk | FAR | FRR | kabul | ret');
  for (const s of stats) {
    console.log(
      `${s.threshold.toFixed(2)} | ${s.accuracy.toFixed(3)} | ${s.falseAcceptRate.toFixed(3)} | ` +
        `${s.falseRejectRate.toFixed(3)} | ${s.accepts} | ${s.rejects}`,
    );
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const pct = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : null);
  console.log(`\ngecikme: n=${sorted.length} medyan=${pct(50)}ms p95=${pct(95)}ms`);

  writeFileSync(
    'docs/jev-calibration.local.json',
    JSON.stringify({ model: jevModelId(), at: new Date().toISOString(), rows, stats, latencies }, null, 2),
  );
  console.log('docs/jev-calibration.local.json yazıldı (gitignored).');
}

void main();
