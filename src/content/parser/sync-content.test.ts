import { describe, expect, it } from 'vitest';
import { assertNoContentErrors } from '../../../scripts/sync-content.ts';

describe('içerik senkronu güvenlik kapısı', () => {
  it('ciddi içerik hatası taşıyan paketi yazmadan önce durdurur', () => {
    expect(() => assertNoContentErrors({
      warnings: [{ level: 'error', code: 'near-duplicate-exercise', message: 'Tekrar', ref: 'd4-test' }],
    } as never)).toThrow(/near-duplicate-exercise/);
  });

  it('uyarı içeren ama ciddi hata taşımayan paket akışı bozmaz', () => {
    expect(() => assertNoContentErrors({
      warnings: [{ level: 'warn', code: 'concept-without-practice', message: 'Eksik pratik' }],
    } as never)).not.toThrow();
  });
});
