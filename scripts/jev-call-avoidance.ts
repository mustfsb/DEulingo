/**
 * Çağrı-kaçınma simülasyonu (çevrimdışı, anahtar gerekmez).
 *
 *   npm run jev:avoidance
 *
 * Mevcut 1440 alıştırmalık pakette, her alıştırma için iki temsili
 * kontrol çalıştırır: (1) kanonik cevap, (2) genel yanlış cevap.
 * Hangilerinin Jev'e gideceğini (uygunluk) raporlar.
 */
import { readFileSync } from 'node:fs';
import { isSemanticFallbackEligible, semanticPolicyFor } from '../src/lib/semantic/policy.ts';
import { deterministicValidate } from '../src/lib/semantic/validate-answer.ts';
import type { Exercise } from '../src/content/types.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as { exercises: Exercise[] };

const WRONG = 'tamamen yanlış cevap xyz';

let canonicalOk = 0;
let wrongDeterministic = 0;
let wrongEligible = 0;
const eligibleByType = new Map<string, number>();
const totalByType = new Map<string, number>();

for (const exercise of bundle.exercises) {
  totalByType.set(exercise.type, (totalByType.get(exercise.type) ?? 0) + 1);
  const canonical = exercise.answer ?? '';
  if (canonical) {
    const local = deterministicValidate(exercise, canonical);
    if (local.status === 'correct' || local.status === 'minor-typo') canonicalOk += 1;
  }
  const wrong = deterministicValidate(exercise, WRONG);
  if (wrong.status !== 'incorrect') {
    wrongDeterministic += 1;
  } else if (typeof WRONG === 'string' && isSemanticFallbackEligible(exercise, WRONG)) {
    wrongEligible += 1;
    eligibleByType.set(exercise.type, (eligibleByType.get(exercise.type) ?? 0) + 1);
  } else {
    wrongDeterministic += 1;
  }
  void semanticPolicyFor;
}

const total = bundle.exercises.length;
console.log(`alıştırma=${total} kanonik-yerel-başarı=${canonicalOk}`);
console.log(`yanlış-cevap: deterministik=${wrongDeterministic} jev-uygun=${wrongEligible}`);
console.log(`semantik-geri-dönüş-oranı(yanlışlarda)=${((100 * wrongEligible) / total).toFixed(1)}%`);
console.log('tip bazında jev-uygun (yanlış cevapta):');
for (const [type, count] of [...totalByType.entries()].sort()) {
  console.log(`  ${type}: ${eligibleByType.get(type) ?? 0}/${count}`);
}
