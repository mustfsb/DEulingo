/**
 * Hafta 1 dış kaynak doğrulaması — ELLE çalıştırılır: `npm run verify:resources`.
 *
 * Normal test paketi ağa çıkmaz (kırılgan olur). Bu betik her dış dinleme
 * sayfasını açar ve şunları raporlar: HTTP durumu, sayfa başlığında görev
 * adının geçmesi, sayfada "Transcript" bölümünün bulunması. Ses süresi
 * sayfada yazmadığı için DOĞRULANAMAZ; betik bunu açıkça belirtir.
 * Bazı ağlar/CDN'ler betik isteklerini reddeder: o durumda "ERİŞİLEMEDİ"
 * yazılır ve bağlantı tarayıcıdan elle kontrol edilmelidir.
 */
import { EN_EXTERNAL_LISTENING, estimatedMediaSeconds } from '../src/content/en/skills-listening-external.ts';

let failed = 0;
for (const task of EN_EXTERNAL_LISTENING) {
  try {
    const response = await fetch(task.url, {
      headers: { 'user-agent': 'Mozilla/5.0 (resource check)', accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });
    const html = response.ok ? await response.text() : '';
    const titleOk = html.toLowerCase().includes(task.title.toLowerCase().replace('–', '–'));
    const transcriptOk = /transcript/i.test(html);
    const ok = response.ok && titleOk && transcriptOk;
    if (!ok) failed += 1;
    console.log(`${ok ? 'TAMAM ' : 'SORUN '} ${response.status} başlık:${titleOk ? '✓' : '✗'} transkript:${transcriptOk ? '✓' : '✗'}  ${task.id}  ${task.url}`);
  } catch (error) {
    failed += 1;
    console.log(`ERİŞİLEMEDİ  ${task.id}  ${task.url}  (${error instanceof Error ? error.message : String(error)})`);
  }
  console.log(`        süre: ${task.mediaSeconds === null ? `sayfada belirtilmiyor → ~${estimatedMediaSeconds(task)} sn TAHMİN (${task.transcriptWords} kelime)` : `${task.mediaSeconds} sn (sağlayıcı)`} · son elle doğrulama ${task.verifiedOn}`);
}
console.log(failed ? `\n${failed} kaynak elle kontrol edilmeli.` : '\nTüm kaynaklar erişilebilir.');
process.exit(failed ? 1 : 0);
