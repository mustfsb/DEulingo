#!/usr/bin/env node
/**
 * Kelime notları üretici — uygulamadan Obsidian'a TEK YÖNLÜ senkron.
 *
 * `src/content/vocabulary/inventory.ts` TEK doğruluk kaynağıdır; bu betik
 * yalnızca insan-okunur YANSIMALARI üretir:
 *   - `Kelime Havuzu.md` (konulara göre 244 öğe)
 *   - `Kelime Alıştırmaları.md` (örnek alıştırmalar, temsilî seçki)
 *
 * Elle iki kopya tutulmaz: içerik değişince betik yeniden çalıştırılır.
 *
 * Kullanım: tsx scripts/generate-vocab-notes.ts [--check]
 *   --check: dosyaları yazmadan güncel olup olmadığını denetler.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOCABULARY } from '../src/content/vocabulary/inventory.ts';
import { TOPIC_BY_ID } from '../src/content/curriculum/topics.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function vaultPath(): Promise<string> {
  const raw = await readFile(join(projectRoot, 'content.config.json'), 'utf8');
  const config = JSON.parse(raw) as { vaultPath: string };
  return process.env.ALMANCA_VAULT ?? config.vaultPath;
}

function topicGroups(): Array<{ id: string; title: string; entries: typeof VOCABULARY }> {
  const byTopic = new Map<string, typeof VOCABULARY>();
  for (const entry of VOCABULARY) {
    for (const topicId of entry.topicIds.slice(0, 1)) {
      byTopic.set(topicId, [...(byTopic.get(topicId) ?? []), entry]);
    }
  }
  const order = [...TOPIC_BY_ID.keys()];
  return [...byTopic.entries()]
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([id, entries]) => ({ id, title: TOPIC_BY_ID.get(id)?.title ?? id, entries }));
}

function havuzu(): string {
  const groups = topicGroups();
  const lines: string[] = [
    '# 📚 Kelime Havuzu',
    '',
    '> Uygulamadaki kanonik kelime envanterinin insan-okunur yansımasıdır.',
    '> Tek doğruluk kaynağı `src/content/vocabulary/inventory.ts` — burayı elle düzenleme;',
    '> içerik değişince `npm run vocab:notes` yeniden çalıştırılır.',
    '',
    `Toplam: ${VOCABULARY.length}`,
    '',
  ];
  for (const group of groups) {
    lines.push(`## ${group.title} (${group.entries.length})`, '');
    for (const entry of group.entries) {
      lines.push(`- ${entry.german} — ${entry.turkish}`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}

function alistirmalar(): string {
  const pick = (ids: string[]) => ids.map((id) => VOCABULARY.find((e) => e.id === id)!).filter(Boolean);
  const detr = pick(['v-schluessel', 'v-tasche', 'v-brief', 'v-zeitung', 'v-kuchen', 'v-ruhig', 'v-verkaufen', 'v-malen']);
  const trde = pick(['v-schluessel', 'v-tasche', 'v-fenster', 'v-kaese', 'v-wohnung', 'v-aufstehen', 'v-wissen', 'v-frage']);
  const artikel = VOCABULARY.filter((e) => e.type === 'noun').slice(0, 8);
  const m1 = pick(['v-schluessel', 'v-tasche', 'v-brief', 'v-zeitung', 'v-kuchen']);
  const m2 = pick(['v-katze', 'v-hund', 'v-tier', 'v-garten', 'v-buch']);
  const lines: string[] = [
    '# ✏️ Kelime Alıştırmaları',
    '',
    '> Temsilî seçki — tamamı uygulamada interaktif çalışılır (Kelime Çalışması).',
    '> Hedeflerin tamamı kapalı 244 kelimelik havuzdandır; dış kelime YOKTUR.',
    '',
    '## Almanca → Türkçe',
    '',
  ];
  detr.forEach((e, i) => lines.push(`${i + 1}. \`${e.german}\` → ${e.turkish}`));
  lines.push('', '## Türkçe → Almanca (isimlerde ARTİKELLE)', '');
  trde.forEach((e, i) => lines.push(`${i + 1}. ${e.turkish} → \`${e.german}\``));
  lines.push('', '## Artikel', '');
  artikel.forEach((e, i) => lines.push(`${i + 1}. ___ ${e.base} → \`${e.article}\` (${e.turkish})`));
  lines.push('', '## Eşleştirme A', '');
  m1.forEach((e) => lines.push(`- ${e.german} ↔ ${e.turkish}`));
  lines.push('', '## Eşleştirme B (tersten)', '');
  m2.forEach((e) => lines.push(`- ${e.turkish} ↔ ${e.german}`));
  lines.push('', '## Karışık Tekrar (uygulamada)', '');
  lines.push(
    '- Tüm Kelimeler (karışık) → Konulara Göre → Türkçe→Almanca → Eşleştirme → Yazma → Dinleme → Zayıf Kelimeler',
    '- 244 Kelime Taraması: her kelime bir kez, ara sıra yapılan havuz denetimi.',
    '',
  );
  return `${lines.join('\n').trim()}\n`;
}

const isCheck = process.argv.includes('--check');
const vault = await vaultPath();
const targets: Array<[string, string]> = [
  ['Kelime Havuzu.md', havuzu()],
  ['Kelime Alıştırmaları.md', alistirmalar()],
];
let stale = 0;
for (const [name, content] of targets) {
  const path = join(vault, name);
  let current: string | null = null;
  try {
    current = await readFile(path, 'utf8');
  } catch {
    current = null;
  }
  if (current === content) {
    console.log(`[vocab:notes] güncel: ${name}`);
    continue;
  }
  stale += 1;
  if (isCheck) {
    console.log(`[vocab:notes] GÜNCEL DEĞİL: ${name}`);
    continue;
  }
  await writeFile(path, content, 'utf8');
  console.log(`[vocab:notes] yazıldı: ${path}`);
}
if (isCheck && stale > 0) process.exit(1);
