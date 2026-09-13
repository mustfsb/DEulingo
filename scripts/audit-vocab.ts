#!/usr/bin/env node
/**
 * Kelime oturum denetimi: çeşitlilik + 244 erişilebilirlik.
 *
 *   50 tohum × {mixed, topic, trde, match, type} → yinelenme oranları
 *   Yeterli oturum simülasyonu → 244/244 erişilebilirlik (öksüz liste)
 *
 * Kullanım: tsx scripts/audit-vocab.ts
 */

import { VOCABULARY } from '../src/content/vocabulary/inventory.ts';
import {
  assertWhitelist,
  balancedGroups,
  buildVocabSession,
  normalizeTurkish,
  type VocabKind,
} from '../src/lib/vocab/questions.ts';

const SEEDS = 50;
const KINDS: VocabKind[] = ['mixed', 'topic', 'trde', 'match', 'type'];
const TOPIC = 'topic.home';

let failures = 0;
const fail = (message: string) => {
  failures += 1;
  console.error(`  ✕ ${message}`);
};

console.log('\n[audit:vocab] çeşitlilik (50 tohum × tür)');
for (const kind of KINDS) {
  const signatures = new Set<string>();
  let dupQuestions = 0;
  let totalQuestions = 0;
  let ambiguousSets = 0;
  let totalSets = 0;
  let badSizes = 0;
  for (let seed = 0; seed < SEEDS; seed++) {
    const session = buildVocabSession({
      kind,
      topicId: kind === 'topic' ? TOPIC : undefined,
      seed: `audit:${kind}:${seed}`,
    });
    const seen = new Set<string>();
    for (const q of session) {
      totalQuestions += 1;
      if (seen.has(q.exercise.id)) dupQuestions += 1;
      seen.add(q.exercise.id);
      if (q.exercise.type === 'matching') {
        totalSets += 1;
        const pairs = q.exercise.pairs ?? [];
        if (pairs.length < 4 || pairs.length > 8) badSizes += 1;
        const rights = pairs.map((p) => normalizeTurkish(p.right));
        if (new Set(rights).size !== rights.length) ambiguousSets += 1;
        // Karıştırma eşlemeyi bozmamalı: her solun sağı envanterle tutarlı.
        for (const pair of pairs) {
          const owner = VOCABULARY.find((e) =>
            [e.german, e.turkish].includes(pair.left) || [e.german, e.turkish].includes(pair.right),
          );
          if (!owner) fail(`eşleştirme çifti envanter dışı: ${pair.left} ↔ ${pair.right}`);
        }
      }
    }
    signatures.add(session.map((q) => q.exercise.id).join('|'));
  }
  const dupRate = totalQuestions ? (dupQuestions / totalQuestions) * 100 : 0;
  console.log(
    `  ${kind}: ${signatures.size}/${SEEDS} benzersiz oturum · soru-içi yinelenme %${dupRate.toFixed(1)} · ` +
      `eşleştirme: ${totalSets} set, ${badSizes} hatalı boy, ${ambiguousSets} belirsiz`,
  );
  if (signatures.size < SEEDS) fail(`${kind}: tohumlar aynı oturumu üretti (${signatures.size}/${SEEDS})`);
  if (badSizes > 0) fail(`${kind}: 4–8 dışı eşleştirme seti var`);
  if (ambiguousSets > 0) fail(`${kind}: belirsiz (yinelenen anlamlı) eşleştirme seti var`);
}

console.log('\n[audit:vocab] erişilebilirlik (244 hedef)');
const reachable = new Set<string>();
for (const kind of ['mixed', 'detr', 'trde', 'match', 'type', 'listen', 'weak', 'marathon'] as VocabKind[]) {
  for (let seed = 0; seed < SEEDS; seed++) {
    for (const q of buildVocabSession({ kind, seed: `reach:${kind}:${seed}` })) {
      q.vocabIds.forEach((id) => reachable.add(id));
    }
  }
}
// Konu oturumları da tara (öksüz konu üyesi kalmasın).
for (const topicId of [...new Set(VOCABULARY.flatMap((e) => e.topicIds))]) {
  for (let seed = 0; seed < 10; seed++) {
    for (const q of buildVocabSession({ kind: 'topic', topicId, seed: `reach:topic:${topicId}:${seed}` })) {
      q.vocabIds.forEach((id) => reachable.add(id));
    }
  }
}
const orphans = VOCABULARY.filter((e) => !reachable.has(e.id));
console.log(`  erişilebilir: ${reachable.size} / ${VOCABULARY.length}`);
if (orphans.length) fail(`öksüz kelime: ${orphans.map((e) => e.id).join(', ')}`);

console.log('\n[audit:vocab] whitelist');
let violations = 0;
for (const kind of ['mixed', 'detr', 'trde', 'match', 'type', 'listen', 'weak', 'flash', 'marathon', 'topic'] as VocabKind[]) {
  for (let seed = 0; seed < 10; seed++) {
    violations += assertWhitelist(
      buildVocabSession({ kind, topicId: kind === 'topic' ? TOPIC : undefined, seed: `wl:${kind}:${seed}` }),
    ).length;
  }
}
console.log(`  havuz dışı hedef: ${violations} (hedef 0)`);
if (violations > 0) fail('whitelist ihlali var');

console.log('\n[audit:vocab] grup dengeleme');
for (const n of [2, 4, 5, 6, 9, 10, 11, 22, 25, 30]) {
  const groups = balancedGroups(Array.from({ length: n }, (_, i) => i));
  const sizes = groups.map((g) => g.length).join('+');
  const ok = groups.every((g) => g.length >= 2 && g.length <= 8);
  console.log(`  n=${n}: ${sizes} ${ok ? '✓' : '✕'}`);
  if (!ok) fail(`dengesiz grup n=${n}: ${sizes}`);
}

if (failures > 0) {
  console.error(`\n[audit:vocab] BAŞARISIZ: ${failures} sorun\n`);
  process.exit(1);
}
console.log('\n[audit:vocab] TAMAM ✓\n');
