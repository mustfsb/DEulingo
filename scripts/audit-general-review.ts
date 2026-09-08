#!/usr/bin/env node
/**
 * Genel Tekrar kapsam denetimi.
 *
 * LEARNED_SO_FAR (özel müfredat kavramları) ile üç tekrar yapıtını
 * karşılaştırır: Genel Tekrar Özet (paketteki 0. gün), Genel Tekrar
 * Alıştırma.md (çalışma kağıdı) ve uygulama bankası (reviewOnly).
 *
 * Kullanım: npx tsx scripts/audit-general-review.ts [--quiet]
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentBundle } from '../src/content/types.ts';
import { REVIEW_GROUPS } from '../src/lib/general-review.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(readFileSync(join(root, 'generated/exercises.json'), 'utf8')) as ContentBundle;

const VAULT = '/Users/mustafa/Library/Mobile Documents/iCloud~md~obsidian/Documents/almanca';
const worksheet = readFileSync(join(VAULT, 'Genel Tekrar Alıştırma.md'), 'utf8').normalize('NFC');

const dayPool = bundle.exercises.filter((e) => !e.reviewOnly);
const bank = bundle.exercises.filter((e) => e.reviewOnly);
const generalSummary = bundle.summaries.find((s) => s.day === 0);
const summaryText = (generalSummary?.topics ?? [])
  .map((t) => [t.title, ...t.blocks.map((b) => JSON.stringify(b)), ...t.warnings, ...t.examples.map((e) => e.german)].join('\n'))
  .join('\n')
  .toLocaleLowerCase('tr');

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr');

/* --- 1) kavram grupları (konu başlığı düzeyi) --- */
/* `*.hedef` konuları ders-hedef bildirimidir (öğretilebilir içerik değil). */
const TEACHABLE = (topicId: string) => !/^private\.day\d+\.hedef$/.test(topicId);
const dayTopics = [...new Set(dayPool.map((e) => e.topicId))].filter(TEACHABLE).sort();
const bankTopics = new Set(bank.map((e) => e.topicId));
const bankConcepts = new Set(bank.flatMap((e) => e.conceptIds));
const topicConceptCovered = (topicId: string) =>
  bundle.concepts.some((c) => c.topicId === topicId && bankConcepts.has(c.id));

let topicCovered = 0;
const topicMissing: string[] = [];
for (const topicId of dayTopics) {
  if (bankTopics.has(topicId) || topicConceptCovered(topicId)) topicCovered += 1;
  else topicMissing.push(topicId);
}

/* --- 2) özet kapsamı: her gün konusunun çekirdek kelimesi genel özette mi --- */
const summaryTopics = new Set((generalSummary?.topics ?? []).map((t) => t.id));
const summaryHits = dayTopics.filter((t) => {
  const core = t.split('.').slice(-1)[0].replace(/-/g, ' ');
  return norm(summaryText).includes(norm(core.split(' ')[0]));
});

/* --- 3) çalışma kağıdı: bölüm sayısı + soru sayısı --- */
const worksheetSections = (worksheet.match(/^## \d+\. /gm) ?? []).length;
const worksheetQuestions = (worksheet.match(/^\d+\. .*(→|______|\?)/gm) ?? []).length;

/* --- 4) kelime envanteri: gün havuzundaki Almanca cevaplar bankada/özette mi --- */
const germanWords = new Set<string>();
for (const e of dayPool) {
  for (const text of [e.answer ?? '', ...(e.options ?? [])]) {
    for (const m of text.matchAll(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\b/g)) germanWords.add(m[1]);
  }
}
const bankGerman = bank.map((e) => [e.answer ?? '', e.prompt ?? '', ...(e.options ?? [])].join('\n')).join('\n').toLocaleLowerCase('de');
const summaryGerman = summaryText;
let vocabCovered = 0;
for (const w of germanWords) {
  if (bankGerman.includes(w.toLocaleLowerCase('de')) || summaryGerman.includes(w.toLocaleLowerCase('tr'))) vocabCovered += 1;
}

/* --- 5) grup havuzları --- */
const groupSizes = REVIEW_GROUPS.map((g) => ({
  id: g.id,
  size: bank.filter((e) => g.topicIds.includes(e.topicId)).length,
}));

/* --- 6) kopya: gün/banka normalize çift kesişimi --- */
const pair = (p: string, a: string) => `${norm(p)}|${norm(a)}`;
const dayPairs = new Set(dayPool.filter((e) => e.prompt && e.answer).map((e) => pair(e.prompt!, e.answer!)));
const copies = bank.filter((e) => e.prompt && e.answer && dayPairs.has(pair(e.prompt!, e.answer!)));

const quiet = process.argv.includes('--quiet');
const line = (s: string) => { if (!quiet) console.log(s); };
line(`kavram-üstü konular: ${dayTopics.length} | banka-kapsanan: ${topicCovered} (${Math.round((topicCovered / dayTopics.length) * 100)}%)`);
if (topicMissing.length) line(`  eksik: ${topicMissing.join(', ')}`);
line(`özet konu girişi: ${summaryTopics.size} | gün-konu çekirdek eşleşme: ${summaryHits.length}/${dayTopics.length}`);
line(`çalışma kağıdı: ${worksheetSections} bölüm, ~${worksheetQuestions} soru`);
line(`kelime envanteri: ${germanWords.size} tekil Almanca ad | kapsanan: ${vocabCovered} (${Math.round((vocabCovered / germanWords.size) * 100)}%)`);
line(`banka: ${bank.length} | kopya çift: ${copies.length}${copies.length ? ' ' + copies.map((e) => e.id).join(', ') : ''}`);
line(`grup havuzları: ${groupSizes.map((g) => `${g.id}=${g.size}`).join(' ')}`);

if (copies.length > 0 || topicCovered < dayTopics.length) process.exitCode = 1;
