/** Yerel geliştirme için `.env.local` yükleyici (Vercel'de gerekmez). */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadLocalEnv(): void {
  if (process.env.AI_GATEWAY_API_KEY) return;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const file = join(here, '..', '.env.local');
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local yoksa sessizce geç (canlı testler açıkça hata verir).
  }
}
