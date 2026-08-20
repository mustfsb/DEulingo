import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './router';

describe('alıştırma seti rotaları', () => {
  it('set rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, day: 2, mode: 'set' as const, exerciseSetId: 'set-2' as const };
    expect(hrefFor(route)).toBe('#/ders/2/set/2');
    expect(parseHash('#/ders/2/set/2')).toEqual(route);
  });

  it('geçersiz set numarasını kırık bir derse dönüştürmez', () => {
    expect(parseHash('#/ders/2/set/99')).toEqual({ name: 'lesson', day: 2, mode: 'normal' });
  });
});
