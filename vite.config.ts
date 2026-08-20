import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { loadConfig, resolveSourcePaths, syncContent } from './scripts/sync-content.ts';
import { AUDIO_CACHE_DIRECTORY, createTtsService, ttsHealth, voiceFileFor } from './scripts/tts-service.ts';
import { germanVoiceProfile, validateSpeechRequest, type GermanVoiceId } from './src/lib/audio/tts.ts';

/**
 * Obsidian icerigini dev sunucusu baslarken ve build oncesi senkronlar;
 * gelistirme sirasinda kaynak Markdown degisirse otomatik yeniler.
 * Kasa dosyalari yalnizca OKUNUR.
 */
function obsidianContent(): Plugin {
  let watched: string[] = [];

  return {
    name: 'almanca-obsidian-content',
    async buildStart() {
      try {
        await syncContent({ quiet: true });
      } catch (error) {
        this.warn(`Obsidian senkronu başarısız: ${(error as Error).message}`);
      }
    },
    async configureServer(server) {
      try {
        const config = await loadConfig();
        watched = (await resolveSourcePaths(config)).map((source) => source.absolute);
        server.watcher.add(watched);
      } catch (error) {
        server.config.logger.warn(`[içerik] Kaynak izlenemedi: ${(error as Error).message}`);
        return;
      }

      const onChange = async (file: string) => {
        if (!watched.includes(file)) return;
        try {
          const bundle = await syncContent({ quiet: true });
          server.config.logger.info(
            `[içerik] güncellendi — ${bundle.exercises.length} alıştırma, ${bundle.warnings.length} uyarı`,
          );
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(`[içerik] senkron hatası: ${(error as Error).message}`);
        }
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
    },
  };
}

/**
 * Piper tarayicida calismaz; bu yalnizca yerel Vite sunucusuna eklenen kucuk
 * bir koprudur. Metin asla shell'e birlestirilmez; servis spawn argumanlariyla
 * calisir ve WAV sadece proje-ici cache'ten okunur.
 */
function localTts(): Plugin {
  const services = new Map<GermanVoiceId, ReturnType<typeof createTtsService>>();
  const serviceFor = (voice: GermanVoiceId) => {
    const existing = services.get(voice);
    if (existing) return existing;
    const profile = germanVoiceProfile(voice);
    const service = createTtsService({
      voice: profile.model,
      voiceVersion: profile.version,
      voiceFile: voiceFileFor(voice),
      voiceId: profile.id,
      speaker: 'speaker' in profile ? profile.speaker : undefined,
    });
    services.set(voice, service);
    return service;
  };
  const json = (response: import('node:http').ServerResponse, status: number, value: unknown) => {
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify(value));
  };

  return {
    name: 'almanca-local-piper-tts',
    async configureServer(server) {
      const health = await ttsHealth();
      server.config.logger.info(
        health.ready
          ? `[piper] ready · voice: ${health.voice} · cache: ${health.cacheDirectory}`
          : `[piper] unavailable · ${health.diagnostics}`,
      );

      server.middlewares.use('/api/tts/health', async (request, response) => {
        if (request.method !== 'GET') return json(response, 405, { error: 'Yalnızca GET desteklenir.' });
        return json(response, 200, await ttsHealth());
      });

      server.middlewares.use('/api/tts/speak', async (request, response) => {
        if (request.method !== 'POST') return json(response, 405, { error: 'Yalnızca POST desteklenir.' });
        let body = '';
        let oversized = false;
        request.setEncoding('utf8');
        request.on('data', (chunk) => {
          body += chunk;
          if (body.length > 2_048) oversized = true;
        });
        request.on('end', async () => {
          if (oversized) return json(response, 413, { error: 'Telaffuz isteği çok büyük.' });
          let parsed: unknown;
          try {
            parsed = JSON.parse(body);
          } catch {
            return json(response, 400, { error: 'Geçersiz JSON isteği.' });
          }
          const checked = validateSpeechRequest(parsed);
          if (!checked.ok) return json(response, 400, { error: checked.error });
          try {
            const generated = await serviceFor(checked.value.voice).generate(checked.value);
            return json(response, 200, { key: generated.key, cached: generated.cached, url: `/api/tts/audio/${generated.key}` });
          } catch (error) {
            server.config.logger.warn(`[piper] üretim hatası: ${(error as Error).message}`);
            return json(response, 503, { error: 'Telaffuz şu anda kullanılamıyor.' });
          }
        });
      });

      server.middlewares.use('/api/tts/audio', async (request, response) => {
        if (request.method !== 'GET') return json(response, 405, { error: 'Yalnızca GET desteklenir.' });
        const key = (request.url ?? '').replace(/^\//, '').split('?')[0];
        if (!/^[a-f0-9]{64}$/.test(key)) return json(response, 400, { error: 'Geçersiz ses anahtarı.' });
        const file = join(AUDIO_CACHE_DIRECTORY, `${key}.wav`);
        try {
          if ((await stat(file)).size < 1) return json(response, 404, { error: 'Ses bulunamadı.' });
          response.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'public, max-age=31536000, immutable' });
          createReadStream(file).pipe(response);
        } catch {
          return json(response, 404, { error: 'Ses bulunamadı.' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), obsidianContent(), localTts()],
  server: { host: '127.0.0.1', port: 5183, open: false },
});
