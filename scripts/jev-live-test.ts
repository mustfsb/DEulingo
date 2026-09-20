/**
 * Canlı Jev entegrasyon duman testi (küçük alt küme, maliyet sınırlı).
 *
 *   npm run test:jev-live
 *
 * AI_GATEWAY_API_KEY gerekir (.env.local). Gerçek Vercel AI Gateway +
 * typesafe-ai/jev çağrısı yapar; accept/reject kararlarını altın
 * etiketlerle karşılaştırır.
 */
import { loadLocalEnv } from '../server/env.ts';
import { getExercise } from '../server/exercise-store.ts';
import { evaluateSemantic, jevModelId, jevThreshold } from '../server/jev-evaluate.ts';
import { deterministicValidate } from '../src/lib/semantic/validate-answer.ts';
import { CALIBRATION_CASES } from '../src/lib/semantic/calibration.fixtures.ts';

loadLocalEnv();

const SUBSET = [
  'machen-paraphrase',
  'machen-wrong',
  'okula-wordorder',
  'okula-aux',
  'kann-past',
  'schluessel-paraphrase',
  'kalktim-digit',
  'kalktim-present',
];

async function main(): Promise<void> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error('HATA: AI_GATEWAY_API_KEY yok (.env.local). Canlı test atlandı.');
    process.exit(2);
  }
  console.log(`model=${jevModelId()} threshold=${jevThreshold()}`);
  let failures = 0;
  for (const id of SUBSET) {
    const found = CALIBRATION_CASES.find((c) => c.id === id);
    if (!found) continue;
    const canonical = getExercise(found.exercise.id) ?? found.exercise;
    const local = deterministicValidate(canonical, found.userAnswer);
    const started = Date.now();
    try {
      const result = await evaluateSemantic(canonical, found.userAnswer);
      const ms = Date.now() - started;
      const predicted = result.probability >= jevThreshold() ? 'accept' : 'reject';
      const ok = predicted === found.gold;
      if (!ok) failures += 1;
      console.log(
        `${ok ? 'PASS' : 'FAIL'} ${id} gold=${found.gold} prob=${result.probability.toFixed(2)} ` +
          `local=${local.status} latency=${ms}ms`,
      );
    } catch (error) {
      failures += 1;
      console.log(`ERROR ${id}: ${(error as Error).message}`);
    }
  }
  if (failures > 0) {
    console.error(`${failures} canlı vaka başarısız.`);
    process.exit(1);
  }
  console.log('Canlı duman testi geçti.');
}

void main();
