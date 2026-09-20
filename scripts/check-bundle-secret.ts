/**
 * Üretim paketi gizli-anahtar taraması (anahtarı YAZDIRMAZ).
 *
 *   npm run build && npm run security:scan
 *
 * `.env.local` içindeki AI_GATEWAY_API_KEY değerinin `dist/` çıktısında
 * geçip geçmediğini denetler. Bulunursa 1 ile çıkar.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadLocalEnv } from '../server/env.ts';

loadLocalEnv();

function files(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files(full, out);
    else out.push(full);
  }
  return out;
}

function main(): void {
  const key = process.env.AI_GATEWAY_API_KEY;
  try {
    const all = files('dist');
    let leaked = false;
    for (const file of all) {
      if (!/\.(js|css|html|json|map)$/.test(file)) continue;
      const content = readFileSync(file, 'utf8');
      if (content.includes('AI_GATEWAY_API_KEY')) {
        console.error(`SIZINTI: ${file} içinde anahtar ADI geçiyor.`);
        leaked = true;
      }
      if (key && key.length >= 8 && content.includes(key)) {
        console.error(`SIZINTI: ${file} içinde anahtar DEĞERİ geçiyor.`);
        leaked = true;
      }
    }
    if (leaked) process.exit(1);
    console.log(`PASS: dist/ içinde anahtar adı/değeri yok (${all.length} dosya tarandı).`);
  } catch (error) {
    console.error(`Tarama hatası: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
