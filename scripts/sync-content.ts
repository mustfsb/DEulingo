#!/usr/bin/env node
/**
 * Obsidian kasasindaki Markdown dosyalarini okur, ayristirir ve
 * `generated/exercises.json` dosyasini uretir.
 *
 * Kasa SALT OKUNUR kullanilir — bu betik oraya hicbir sey yazmaz.
 *
 * Kullanim:  node scripts/sync-content.ts [--quiet]
 * Kasa yolu: content.config.json → ALMANCA_VAULT ortam degiskeniyle ezilebilir.
 */

import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContent, type SourceFile } from '../src/content/parser/index.ts';
import { AUTHORED_LAYER, TOPIC_TITLES } from '../src/content/authored/index.ts';
import type { ContentBundle } from '../src/content/types.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface ContentConfig {
  vaultPath: string;
  files: Array<{ path: string; role: SourceFile['role'] }>;
  output: string;
}

/** Ciddi içerik bozulmalarında eski geçerli paketi koru ve süreci kırmızıya çevir. */
export function assertNoContentErrors(bundle: Pick<ContentBundle, 'warnings'>): void {
  const errors = bundle.warnings.filter((warning) => warning.level === 'error');
  if (!errors.length) return;
  const detail = errors
    .map((warning) => `[${warning.code}] ${warning.message} (${warning.ref ?? '-'})`)
    .join('\n  ');
  throw new Error(`İçerik doğrulaması başarısız; paket yazılmadı:\n  ${detail}`);
}

/** macOS dosya adlarini NFD/NFC farkindan bagimsiz karsilastirir. */
const norm = (value: string) => value.normalize('NFC').toLocaleLowerCase('tr');

async function listMarkdown(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listMarkdown(full, base)));
    else if (entry.name.endsWith('.md')) files.push(relative(base, full));
  }
  return files;
}

export async function loadConfig(): Promise<ContentConfig> {
  const raw = await readFile(join(projectRoot, 'content.config.json'), 'utf8');
  const config = JSON.parse(raw) as ContentConfig;
  const override = process.env.ALMANCA_VAULT;
  if (override) config.vaultPath = override;
  return config;
}

/** Kasada izlenen (okunan) mutlak dosya yollari — dev sunucusu bunlari izler. */
export async function resolveSourcePaths(config: ContentConfig): Promise<
  Array<{ absolute: string; name: string; role: SourceFile['role'] }>
> {
  const available = await listMarkdown(config.vaultPath);
  const resolved: Array<{ absolute: string; name: string; role: SourceFile['role'] }> = [];

  for (const wanted of config.files) {
    const match =
      available.find((candidate) => norm(candidate) === norm(wanted.path)) ??
      available.find((candidate) => norm(candidate).endsWith(norm(wanted.path)));
    if (!match) {
      throw new Error(
        `Kaynak dosya bulunamadı: "${wanted.path}"\n` +
          `Kasadaki Markdown dosyaları:\n  ${available.join('\n  ')}`,
      );
    }
    resolved.push({
      absolute: join(config.vaultPath, match),
      name: match.split('/').pop()!.normalize('NFC'),
      role: wanted.role,
    });
  }
  return resolved;
}

export async function syncContent({ quiet = false } = {}): Promise<ContentBundle> {
  const config = await loadConfig();
  await stat(config.vaultPath).catch(() => {
    throw new Error(`Obsidian klasörü bulunamadı: ${config.vaultPath}`);
  });

  const sources = await resolveSourcePaths(config);
  const files: SourceFile[] = [];
  for (const source of sources) {
    files.push({
      name: source.name,
      role: source.role,
      markdown: (await readFile(source.absolute, 'utf8')).normalize('NFC'),
    });
  }

  const bundle = parseContent(files, {
    authored: AUTHORED_LAYER,
    topicTitles: TOPIC_TITLES,
  });
  assertNoContentErrors(bundle);
  const outPath = join(projectRoot, config.output);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  if (!quiet) report(bundle, config.output);
  return bundle;
}

function report(bundle: ContentBundle, output: string): void {
  const byDay = bundle.days
    .map((day) => `  ${day.day}. Gün → ${day.exerciseIds.length} alıştırma`)
    .join('\n');
  const types = new Map<string, number>();
  for (const exercise of bundle.exercises) {
    types.set(exercise.type, (types.get(exercise.type) ?? 0) + 1);
  }

  console.log(`\n[sync] ${bundle.exercises.length} alıştırma → ${output}`);
  console.log(byDay);
  console.log(
    `  Tipler: ${[...types.entries()].map(([type, count]) => `${type}=${count}`).join(', ')}`,
  );

  const errors = bundle.warnings.filter((warning) => warning.level === 'error');
  const warns = bundle.warnings.filter((warning) => warning.level === 'warn');
  for (const warning of errors) console.error(`  ✕ [${warning.code}] ${warning.message} (${warning.ref ?? '-'})`);
  for (const warning of warns) console.warn(`  ! [${warning.code}] ${warning.message} (${warning.ref ?? '-'})`);
  if (!bundle.warnings.length) console.log('  Uyarı yok.');
  console.log('');
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  syncContent({ quiet: process.argv.includes('--quiet') }).catch((error: unknown) => {
    console.error(`\n[sync] HATA: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}
