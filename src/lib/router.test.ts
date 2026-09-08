import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './router';

describe('tek mufredat rotalari', () => {
  it('gun rotasini izleksiz uretir ve cozer', () => {
    const route = { name: 'day' as const, day: 3 };
    expect(hrefFor(route)).toBe('#/gun/3');
    expect(parseHash('#/gun/3')).toEqual(route);
  });

  it('ders rotasini (normal calisma) izleksiz uretir ve cozer', () => {
    const route = { name: 'lesson' as const, day: 3, mode: 'normal' as const };
    expect(hrefFor(route)).toBe('#/ders/3/normal');
    expect(parseHash('#/ders/3/normal')).toEqual(route);
  });

  it('zor sorular (challenge) rotasini uretir ve cozer', () => {
    const route = { name: 'lesson' as const, day: 10, mode: 'challenge' as const };
    expect(hrefFor(route)).toBe('#/ders/10/zor');
    expect(parseHash('#/ders/10/zor')).toEqual(route);
  });

  it('konu bazli calisma rotasini uretir ve cozer', () => {
    const route = { name: 'lesson' as const, day: 2, mode: 'topic' as const, topicId: 'private.day2.artikel-kein-mein-dein' };
    expect(hrefFor(route)).toBe(`#/ders/2/konu/${encodeURIComponent('private.day2.artikel-kein-mein-dein')}`);
    expect(parseHash(hrefFor(route))).toEqual(route);
  });

  it('ozet rotasini uretir ve cozer', () => {
    const route = { name: 'summary' as const, day: 2, topicId: 'private.day2.sorular' };
    expect(hrefFor(route)).toBe('#/ozet/2/private.day2.sorular');
    expect(parseHash(hrefFor(route))).toEqual(route);
  });

  it('genel ozet rotasini uretir ve cozer', () => {
    expect(hrefFor({ name: 'summary', day: 0 })).toBe('#/ozet/genel');
    expect(parseHash('#/ozet/genel')).toEqual({ name: 'summary', day: 0, topicId: undefined });
    expect(parseHash('#/ozet/genel/genel.saat')).toEqual({ name: 'summary', day: 0, topicId: 'genel.saat' });
  });

  it('genel tekrar ana rotasini uretir ve cozer', () => {
    expect(hrefFor({ name: 'general-review' })).toBe('#/genel-tekrar');
    expect(parseHash('#/genel-tekrar')).toEqual({ name: 'general-review' });
  });

  it('hata tekrari rotasini gune ozel cozer', () => {
    expect(parseHash('#/hata-tekrari/2')).toEqual({ name: 'mistake-review', day: 2 });
    expect(parseHash('#/hata-tekrari')).toEqual({ name: 'mistake-review', day: undefined });
  });
});

describe('gecmis izlekli baglantilar (uyumluluk)', () => {
  it('eski private gun baglantisi kanonik gune duser', () => {
    expect(parseHash('#/gun/private/3')).toEqual({ name: 'day', day: 3 });
  });

  it('eski normal gun baglantisi kanonik gune duser', () => {
    expect(parseHash('#/gun/1')).toEqual({ name: 'day', day: 1 });
  });

  it('eski private ders baglantisi kanonik derse duser', () => {
    expect(parseHash('#/ders/private/2/zor')).toEqual({ name: 'lesson', day: 2, mode: 'challenge' });
  });

  it('eski izlekli ozet baglantisi kanonik ozete duser', () => {
    expect(parseHash('#/ozet/private/2')).toEqual({ name: 'summary', day: 2, topicId: undefined });
  });

  it('eski izlekli tekrar baglantilari calisir', () => {
    expect(parseHash('#/tekrar/private')).toEqual({ name: 'review' });
    expect(parseHash('#/hata-tekrari/private/2')).toEqual({ name: 'mistake-review', day: 2 });
    expect(parseHash('#/hatalarim/private')).toEqual({ name: 'mistakes' });
    expect(parseHash('#/istatistik/normal')).toEqual({ name: 'stats' });
  });

  it('uretilen URL hicbir izlek icermez', () => {
    const hrefs = [
      hrefFor({ name: 'day', day: 3 }),
      hrefFor({ name: 'lesson', day: 3, mode: 'full' }),
      hrefFor({ name: 'summary', day: 3 }),
      hrefFor({ name: 'general-review' }),
    ];
    for (const href of hrefs) {
      expect(href).not.toContain('private');
      expect(href).not.toContain('normal');
    }
  });
});

describe('alistirma seti rotalari', () => {
  it('set rotasını kayıpsız üretir ve çözer', () => {
    const route = { name: 'lesson' as const, day: 2, mode: 'set' as const, exerciseSetId: 'set-2' as const };
    expect(hrefFor(route)).toBe('#/ders/2/set/2');
    expect(parseHash('#/ders/2/set/2')).toEqual(route);
  });

  it('geçersiz set numarasını kırık bir derse dönüştürmez', () => {
    expect(parseHash('#/ders/2/set/99')).toEqual({ name: 'lesson', day: 2, mode: 'normal' });
  });
});
