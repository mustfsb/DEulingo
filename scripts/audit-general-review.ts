#!/usr/bin/env node
/**
 * Genel Tekrar kapsam denetimi.
 *
 * Kanonik konu haritasını üç tekrar yapıtıyla karşılaştırır: Genel Tekrar
 * Özeti (paketteki `reviewSummary`), `Genel Tekrar Alıştırma.md` (çalışma
 * kağıdı) ve uygulama bankası (`reviewOnly`). Genel Tekrar ikinci bir
 * taksonomi kullanmaz: her bölüm ve her soru kanonik bir `topic.*` taşır.
 *
 * Kullanım: npx tsx scripts/audit-general-review.ts [--quiet]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentBundle } from '../src/content/types.ts';
import { reviewPoolFor, MIN_TOPIC_POOL, type ReviewMode } from '../src/lib/general-review.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = JSON.parse(readFileSync(join(root, 'generated/exercises.json'), 'utf8')) as ContentBundle;
const config = JSON.parse(readFileSync(join(root, 'content.config.json'), 'utf8')) as { vaultPath: string };
const worksheetPath = join(config.vaultPath, 'Genel Tekrar Alıştırma.md');
const worksheet = existsSync(worksheetPath) ? readFileSync(worksheetPath, 'utf8').normalize('NFC') : '';

const topicIds = new Set(bundle.topics.map((topic) => topic.id));
const lessonBank = bundle.exercises.filter((exercise) => !exercise.reviewOnly);
const bank = bundle.exercises.filter((exercise) => exercise.reviewOnly);
const touches = (topicId: string) => (exercise: { topicId: string; secondaryTopicIds?: string[] }) =>
  exercise.topicId === topicId || Boolean(exercise.secondaryTopicIds?.includes(topicId));

const norm = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('tr');

/* 1) Tek taksonomi: bankadaki her soru ve özetin her konu bölümü kanonik konu taşır. */
const foreignTopic = bank.filter((exercise) => !topicIds.has(exercise.topicId));
const sections = bundle.reviewSummary?.sections ?? [];
const foreignSection = sections.filter((section) => section.topicId && !topicIds.has(section.topicId));

/* 2) Konu kapsamı: her konu hem özette hem bankada temsil ediliyor mu? */
const summaryTopics = new Set(sections.map((section) => section.topicId).filter(Boolean));
const rows = bundle.topics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  inSummary: summaryTopics.has(topic.id),
  bank: bank.filter(touches(topic.id)).length,
  topicPool: reviewPoolFor(bank, 'topic', topic.id, lessonBank).length,
}));

/* 3) Modalverben: konular arası modlarda (Cümle Kurma, Writing) var mı? */
const modeCounts = (['sentence', 'writing', 'vocab', 'listening', 'mixed'] as ReviewMode[]).map((mode) => ({
  mode,
  total: reviewPoolFor(bank, mode).length,
  modal: reviewPoolFor(bank, mode).filter(touches('topic.modal-verbs')).length,
}));

/* 4) Çalışma kağıdı. */
const worksheetSections = (worksheet.match(/^## .+$/gm) ?? []).length;
const worksheetModal = norm(worksheet).includes('modalverb');

/* 5) Kopya: ders/banka normalize soru+cevap çifti kesişimi. */
const pair = (prompt: string, answer: string) => `${norm(prompt)}|${norm(answer)}`;
const lessonPairs = new Set(lessonBank.filter((e) => e.prompt && e.answer).map((e) => pair(e.prompt!, e.answer!)));
const copies = bank.filter((e) => e.prompt && e.answer && lessonPairs.has(pair(e.prompt!, e.answer!)));

const quiet = process.argv.includes('--quiet');
const line = (text: string) => {
  if (!quiet) console.log(text);
};
line(`banka: ${bank.length} soru | kanonik olmayan konu etiketi: ${foreignTopic.length}`);
line(`özet: ${sections.length} bölüm | kanonik olmayan bölüm konusu: ${foreignSection.length}`);
line('konu kapsamı (özet / banka / konu kartı havuzu):');
for (const row of rows) {
  line(`  ${row.title.padEnd(26)} ${row.inSummary ? '✓' : '✕'}  ${String(row.bank).padStart(3)}  ${String(row.topicPool).padStart(4)}${row.topicPool < MIN_TOPIC_POOL ? '  (kart kapalı)' : ''}`);
}
line(`Modalverben modlarda: ${modeCounts.map((item) => `${item.mode} ${item.modal}/${item.total}`).join(' · ')}`);
line(`çalışma kağıdı: ${worksheetSections} H2 bölüm · Modalverben ${worksheetModal ? 'var' : 'YOK'}`);
line(`ders/banka kopya çift: ${copies.length}${copies.length ? ' ' + copies.map((e) => e.id).join(', ') : ''}`);

const missingSummary = rows.filter((row) => !row.inSummary);
const closedCards = rows.filter((row) => row.topicPool < MIN_TOPIC_POOL);
const modalMissing = modeCounts.filter((item) => (item.mode === 'sentence' || item.mode === 'writing') && item.modal === 0);
if (
  foreignTopic.length ||
  foreignSection.length ||
  missingSummary.length ||
  closedCards.length ||
  modalMissing.length ||
  copies.length ||
  (worksheet && !worksheetModal)
) {
  process.exitCode = 1;
}
