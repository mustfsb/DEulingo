import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './router';

describe('alıştırma seti rotaları', () => {
  it('set rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, track: 'normal' as const, day: 2, mode: 'set' as const, exerciseSetId: 'set-2' as const };
    expect(hrefFor(route)).toBe('#/ders/2/set/2');
    expect(parseHash('#/ders/2/set/2')).toEqual(route);
  });

  it('geçersiz set numarasını kırık bir derse dönüştürmez', () => {
    expect(parseHash('#/ders/2/set/99')).toEqual({ name: 'lesson', track: 'normal', day: 2, mode: 'normal' });
  });
});

describe('Özel Ders (private) 2. Gün rotaları', () => {
  it('gün rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'day' as const, track: 'private' as const, day: 2 };
    expect(hrefFor(route)).toBe('#/gun/private/2');
    expect(parseHash('#/gun/private/2')).toEqual(route);
  });

  it('ders rotasını (normal çalışma) kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, track: 'private' as const, day: 2, mode: 'normal' as const };
    expect(hrefFor(route)).toBe('#/ders/private/2/normal');
    expect(parseHash('#/ders/private/2/normal')).toEqual(route);
  });

  it('zor sorular (challenge) rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, track: 'private' as const, day: 2, mode: 'challenge' as const };
    expect(hrefFor(route)).toBe('#/ders/private/2/zor');
    expect(parseHash('#/ders/private/2/zor')).toEqual(route);
  });

  it('konu bazlı çalışma rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, track: 'private' as const, day: 2, mode: 'topic' as const, topicId: 'private.day2.artikel-kein-mein-dein' };
    expect(hrefFor(route)).toBe(`#/ders/private/2/konu/${encodeURIComponent('private.day2.artikel-kein-mein-dein')}`);
    expect(parseHash(hrefFor(route))).toEqual(route);
  });

  it('özet rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'summary' as const, track: 'private' as const, day: 2, topicId: 'private.day2.sorular' };
    expect(hrefFor(route)).toBe('#/ozet/private/2/private.day2.sorular');
    expect(parseHash(hrefFor(route))).toEqual(route);
  });

  it('hata tekrarı rotası private 2. Güne özel olarak çözülür', () => {
    expect(parseHash('#/hata-tekrari/private/2')).toEqual({ name: 'mistake-review', track: 'private', day: 2 });
  });

  it('private ve normal 2. Gün rotaları birbirinden farklı URL üretir', () => {
    const privateHref = hrefFor({ name: 'day', track: 'private', day: 2 });
    const normalHref = hrefFor({ name: 'day', track: 'normal', day: 2 });
    expect(privateHref).not.toBe(normalHref);
    expect(parseHash(normalHref)).toEqual({ name: 'day', track: 'normal', day: 2 });
  });
});
