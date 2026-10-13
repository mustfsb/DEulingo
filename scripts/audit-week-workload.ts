/**
 * Hafta 1 iş yükü denetimi (geliştirici aracı): `npm run audit:week`.
 * Her aktivite için içerikten türetilen süre dökümünü ve üç profilin
 * toplamlarını yazar. `--detail` bileşenleri de gösterir.
 */
import { EN_WEEK_1_PLAN, formatMinutes } from '../src/content/en/skills-weekly.ts';
import { weekLinkLabel } from '../src/lib/week-destination.ts';

const detail = process.argv.includes('--detail');
const m = (seconds: number) => (seconds / 60).toFixed(1).padStart(5);
const total = { fast: 0, typical: 0, slow: 0 };
const extra = { fast: 0, typical: 0, slow: 0 };

for (const session of EN_WEEK_1_PLAN) {
  const core = session.activities.filter((a) => a.tier === 'core');
  console.log(`\n== ${session.title} — ${core.length} çekirdek aktivite — ${session.hours}`);
  console.log('   hızlı tipik yavaş  öğe   gösterilen   aktivite');
  for (const a of session.activities) {
    const s = a.workload.seconds;
    const bucket = a.tier === 'core' ? total : extra;
    bucket.fast += s.fast; bucket.typical += s.typical; bucket.slow += s.slow;
    const flags = [a.tier === 'extra' ? 'EK' : '', a.workload.reachable ? '' : 'İÇERİK YOK', a.workload.variable ? 'değişken' : '', a.workload.mediaUrl ? (a.workload.mediaVerified ? 'medya süresi doğrulanmış' : 'medya süresi tahmini') : ''].filter(Boolean).join(', ');
    console.log(`  ${m(s.fast)} ${m(s.typical)} ${m(s.slow)} ${String(a.workload.items).padStart(4)} ${a.duration.padStart(11)}   ${a.id}  ${a.label}${flags ? `  [${flags}]` : ''}`);
    if (detail) {
      console.log(`        → ${weekLinkLabel(a.link)}`);
      for (const c of a.workload.components) console.log(`        · ${c.label}: ${c.units} ${c.unit} → ${m(c.seconds.fast)} / ${m(c.seconds.typical)} / ${m(c.seconds.slow)} dk`);
    }
  }
}
const h = (seconds: number) => formatMinutes(Math.round(seconds / 60));
console.log(`\nÇEKİRDEK TOPLAM  hızlı ${h(total.fast)} · tipik ${h(total.typical)} · yavaş ${h(total.slow)}`);
console.log(`EK PRATİK        hızlı ${h(extra.fast)} · tipik ${h(extra.typical)} · yavaş ${h(extra.slow)}`);
console.log(`Hedef: hızlı öğrenci için 15–20 saat → ${total.fast / 3600 >= 15 && total.fast / 3600 <= 20 ? 'ARALIKTA' : 'ARALIK DIŞI'} (${(total.fast / 3600).toFixed(1)} sa)`);
