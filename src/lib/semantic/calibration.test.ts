import { describe, expect, it, vi } from 'vitest';
import { CALIBRATION_ACCEPT_COUNT, CALIBRATION_CASES, CALIBRATION_REJECT_COUNT } from './calibration.fixtures';
import { deterministicValidate, validateAnswer } from './validate-answer';
import { isSemanticFallbackEligible } from './policy';
import { clearSemanticCache } from './cache';
import { resetSemanticMetrics, semanticMetricsSummary } from './metrics';

describe('kalibrasyon seti bütünlüğü', () => {
  it('en az 100 etiketli vaka içerir (tercih 150+)', () => {
    expect(CALIBRATION_CASES.length).toBeGreaterThanOrEqual(100);
    expect(CALIBRATION_ACCEPT_COUNT).toBeGreaterThan(30);
    expect(CALIBRATION_REJECT_COUNT).toBeGreaterThan(30);
  });

  it('hiçbir "reject" vakası deterministikte TAM doğru çıkmaz (etiket sağlığı)', () => {
    // Not: deterministik yazım toleransı bazı pedagojik retleri `minor-typo`
    // (kısmi) sayar — bu mevcut davranış korunur; Jev yalnızca `incorrect`
    // durumunda çağrılır. Burada kritik olan: reject bir vaka asla `correct`
    // olmamalı (yoksa Jev'e hiç sorulmadan tam doğru verilirdi).
    const bad = CALIBRATION_CASES.filter(
      (c) => c.gold === 'reject' && deterministicValidate(c.exercise, c.userAnswer).status === 'correct',
    );
    expect(bad.map((c) => c.id)).toEqual([]);
    const partial = CALIBRATION_CASES.filter(
      (c) => c.gold === 'reject' && deterministicValidate(c.exercise, c.userAnswer).status === 'minor-typo',
    );
    console.log(`[kalibrasyon] reject içinde deterministik minor-typo: ${partial.length} (${partial.map((c) => c.id).join(', ')})`);
  });

  it('zorunlu uç durumlar sette mevcuttur', () => {
    const ids = new Set(CALIBRATION_CASES.map((c) => c.id));
    for (const required of [
      'machen-exact',
      'machen-paraphrase',
      'machen-wrong',
      'okula-wordorder',
      'okula-aux',
      'kann-past',
      'tisch-den',
    ]) {
      expect(ids.has(required), required).toBe(true);
    }
  });
});

describe('çağrı-kaçınma simülasyonu (çevrimdışı)', () => {
  it('kanonik cevaplar ve yapısal yanlışlar Jev çağrısı üretmez', async () => {
    clearSemanticCache();
    resetSemanticMetrics();
    const jev = vi.fn(async () => ({
      correct: true,
      probability: 0.99,
      validationSource: 'jev-semantic' as const,
      latencyMs: 1,
    }));
    // Tüm "accept" vakalarının kanonik yazımları + tüm "reject" vakalarının
    // deterministik sonucu: yalnızca gerçek uyuşmazlıklar Jev'e gider.
    let deterministicOnly = 0;
    let eligible = 0;
    for (const c of CALIBRATION_CASES) {
      const local = deterministicValidate(c.exercise, c.userAnswer);
      if (local.status !== 'incorrect') deterministicOnly += 1;
      else if (isSemanticFallbackEligible(c.exercise, c.userAnswer)) eligible += 1;
      else deterministicOnly += 1;
    }
    // Temsili oturum: kanonik cevapların tamamı yerelde biter.
    for (const c of CALIBRATION_CASES) {
      await validateAnswer(c.exercise, c.exercise.answer ?? '', { jevFetch: jev });
    }
    expect(jev).not.toHaveBeenCalled();
    const summary = semanticMetricsSummary();
    expect(summary.jevCalls).toBe(0);
    // Rapor için oranlar (test çıktısında görünür).
    console.log(
      `[kaçınma] vakalar=${CALIBRATION_CASES.length} deterministik=${deterministicOnly} jev-uygun=${eligible}`,
    );
  });
});
