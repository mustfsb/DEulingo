import { describe, expect, it } from 'vitest';
import { hrefFor, isLegacyHash, parseHash, type Route } from './router';
import { T } from '../content/curriculum/topics';

describe('konu rotalari', () => {
  it('konu sayfasini kararli slug ile uretir ve cozer', () => {
    const route: Route = { name: 'topic', topicId: T.modalVerbs };
    expect(hrefFor(route)).toBe('#/konu/modal-verbs');
    expect(parseHash('#/konu/modal-verbs')).toEqual(route);
    // Kanonik kimlik de kabul edilir.
    expect(parseHash('#/konu/topic.modal-verbs')).toEqual(route);
  });

  it('bilinmeyen konu slugi ana sayfaya duser', () => {
    expect(parseHash('#/konu/olmayan-konu')).toEqual({ name: 'home' });
  });

  it('ders rotalarini (normal/tam/hizli/zor) uretir ve cozer', () => {
    const cases: Array<[Route, string]> = [
      [{ name: 'lesson', topicId: T.time, mode: 'normal' }, '#/ders/time/normal'],
      [{ name: 'lesson', topicId: T.time, mode: 'full' }, '#/ders/time/tam'],
      [{ name: 'lesson', topicId: T.separableVerbs, mode: 'quick' }, '#/ders/separable-verbs/hizli'],
      [{ name: 'lesson', topicId: T.modalVerbs, mode: 'challenge' }, '#/ders/modal-verbs/zor'],
    ];
    for (const [route, href] of cases) {
      expect(hrefFor(route)).toBe(href);
      expect(parseHash(href)).toEqual(route);
    }
  });

  it('bolum pratigi rotasini uretir ve cozer; baska konunun bolumu kabul edilmez', () => {
    const route: Route = { name: 'lesson', topicId: T.modalVerbs, mode: 'section', sectionId: 'modal-verbs.duerfen' };
    expect(hrefFor(route)).toBe('#/ders/modal-verbs/bolum/modal-verbs.duerfen');
    expect(parseHash(hrefFor(route))).toEqual(route);
    expect(parseHash('#/ders/modal-verbs/bolum/time.um')).toEqual({ name: 'topic', topicId: T.modalVerbs });
  });

  it('konu ozeti ve bolum capasi rotasini uretir ve cozer', () => {
    const route: Route = { name: 'summary', topicId: T.modalVerbs, sectionId: 'modal-verbs.rule' };
    expect(hrefFor(route)).toBe('#/ozet/modal-verbs/modal-verbs.rule');
    expect(parseHash(hrefFor(route))).toEqual(route);
    expect(parseHash('#/ozet/modal-verbs')).toEqual({ name: 'summary', topicId: T.modalVerbs });
  });

  it('Genel Tekrar ozeti rotasini uretir ve cozer', () => {
    expect(hrefFor({ name: 'review-summary' })).toBe('#/ozet/genel');
    expect(parseHash('#/ozet/genel')).toEqual({ name: 'review-summary', sectionId: undefined });
    expect(parseHash('#/ozet/genel/genel.saat')).toEqual({ name: 'review-summary', sectionId: 'genel.saat' });
  });

  it('genel tekrar ana rotasini uretir ve cozer', () => {
    expect(hrefFor({ name: 'general-review' })).toBe('#/genel-tekrar');
    expect(parseHash('#/genel-tekrar')).toEqual({ name: 'general-review' });
  });

  it('uretilen hicbir URL gun ya da izlek icermez', () => {
    const hrefs = [
      hrefFor({ name: 'topic', topicId: T.home }),
      hrefFor({ name: 'lesson', topicId: T.home, mode: 'full' }),
      hrefFor({ name: 'summary', topicId: T.home }),
      hrefFor({ name: 'mistake-review' }),
      hrefFor({ name: 'general-review' }),
    ];
    for (const href of hrefs) {
      expect(href).not.toMatch(/\/\d+(\/|$)/);
      expect(href).not.toContain('private');
      expect(href).not.toContain('gun');
    }
  });
});

describe('gun tabanli eski baglantilar (yonlendirme)', () => {
  it('eski gun sayfasi o gunun ana konusuna yonlenir', () => {
    expect(parseHash('#/gun/10')).toEqual({ name: 'topic', topicId: T.separableVerbs });
    expect(parseHash('#/gun/7')).toEqual({ name: 'topic', topicId: T.home });
    expect(parseHash('#/gun/private/3')).toEqual({ name: 'topic', topicId: T.sentenceBuilding });
    expect(parseHash('#/gun/99')).toEqual({ name: 'topic', topicId: T.greetings });
  });

  it('eski ders baglantisi ayni modla konu dersine yonlenir', () => {
    expect(parseHash('#/ders/10/zor')).toEqual({ name: 'lesson', topicId: T.separableVerbs, mode: 'challenge' });
    expect(parseHash('#/ders/private/7/tam')).toEqual({ name: 'lesson', topicId: T.home, mode: 'full' });
    // Kaldirilan set modu normal calismaya duser.
    expect(parseHash('#/ders/1/set/2')).toEqual({ name: 'lesson', topicId: T.greetings, mode: 'normal' });
  });

  it('eski gun ici konu calismasi yeni bolum pratigine yonlenir', () => {
    expect(parseHash(`#/ders/10/konu/${encodeURIComponent('private.day10.um-uhr')}`)).toEqual({
      name: 'lesson',
      topicId: T.time,
      mode: 'section',
      sectionId: 'time.um',
    });
  });

  it('eski ozet baglantilari yeni konu ozetine ve bolumune yonlenir', () => {
    expect(parseHash('#/ozet/3/private.day3.yer-yon')).toEqual({ name: 'summary', topicId: T.places, sectionId: 'places.prepositions' });
    expect(parseHash('#/ozet/private/2/private.day2.sorular')).toEqual({
      name: 'summary',
      topicId: T.questions,
      sectionId: 'questions.yes-no',
    });
    expect(parseHash('#/ozet/10')).toEqual({ name: 'summary', topicId: T.separableVerbs });
  });

  it('eski gune ozel hata tekrari genel hata tekrarina yonlenir', () => {
    expect(parseHash('#/hata-tekrari/2')).toEqual({ name: 'mistake-review' });
    expect(parseHash('#/hata-tekrari/private/2')).toEqual({ name: 'mistake-review' });
  });

  it('eski izlekli tekrar baglantilari calisir', () => {
    expect(parseHash('#/tekrar/private')).toEqual({ name: 'review' });
    expect(parseHash('#/hatalarim/private')).toEqual({ name: 'mistakes' });
    expect(parseHash('#/istatistik/normal')).toEqual({ name: 'stats' });
  });

  it('yalnizca gun tabanli eski adresler yeniden yazilir', () => {
    expect(isLegacyHash('#/gun/3')).toBe(true);
    expect(isLegacyHash('#/ders/private/7/tam')).toBe(true);
    expect(isLegacyHash('#/ozet/3/private.day3.yer-yon')).toBe(true);
    expect(isLegacyHash('#/hata-tekrari/2')).toBe(true);
    expect(isLegacyHash('#/konu/modal-verbs')).toBe(false);
    expect(isLegacyHash('#/ders/modal-verbs/zor')).toBe(false);
    expect(isLegacyHash('#/ozet/genel/genel.saat')).toBe(false);
    // Yeni kanonik adres, yonlendirmeden sonra kendisiyle tutarlidir.
    expect(isLegacyHash(hrefFor(parseHash('#/gun/10')))).toBe(false);
  });
});
