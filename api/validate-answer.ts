/**
 * Vercel Serverless: POST /api/validate-answer
 *
 * Dağıtımda `AI_GATEWAY_API_KEY` ortam değişkeni gerekir (anahtar asla
 * istemciye inmez). Yerel Vite geliştirmede aynı mantık
 * `vite.config.ts` içindeki dev ara katmanıyla sunulur.
 */

import { handleValidate } from '../server/validate-handler.ts';

interface NodeReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  on(event: 'data', fn: (chunk: Buffer) => void): void;
  on(event: 'end', fn: () => void): void;
}

interface NodeRes {
  writeHead(status: number, headers: Record<string, string>): void;
  end(body: string): void;
}

function clientIp(req: NodeReq): string {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return (first ?? req.socket?.remoteAddress ?? 'unknown').trim();
}

export default async function handler(req: NodeReq, res: NodeRes): Promise<void> {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Yalnızca POST desteklenir.' }));
    return;
  }
  let body = '';
  let oversized = false;
  await new Promise<void>((resolve) => {
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8');
      if (body.length > 8_192) oversized = true;
    });
    req.on('end', () => resolve());
  });
  if (oversized) {
    res.writeHead(413, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'İstek çok büyük.' }));
    return;
  }
  let parsed: unknown = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Geçersiz JSON isteği.' }));
    return;
  }
  const result = await handleValidate(
    parsed as { exerciseId?: unknown; userAnswer?: unknown },
    clientIp(req),
  );
  res.writeHead(result.status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(result.json));
}
