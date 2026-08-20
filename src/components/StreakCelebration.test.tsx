import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComboIndicator, StreakCelebration } from './StreakCelebration';
import { celebrationHoldMs, MOTION } from '../lib/motion';

const doms: JSDOM[] = [];

afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
  vi.useRealTimers();
});

function setup(reducedMotion: boolean) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  doms.push(dom);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(dom.window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} }),
  });
  return { dom, root: createRoot(dom.window.document.getElementById('root')!) };
}

describe('seri kutlaması', () => {
  it('kısa süre görünür ve kendi kendine kapanır', () => {
    vi.useFakeTimers();
    const { dom, root } = setup(false);
    const done = vi.fn();
    act(() => root.render(createElement(StreakCelebration, { streak: 5, onDone: done })));

    expect(dom.window.document.body.textContent).toContain('5 doğru üst üste!');
    expect(dom.window.document.querySelectorAll('.celebration-spark').length).toBeGreaterThan(0);
    expect(done).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(MOTION.celebrationHold + 20));
    expect(done).toHaveBeenCalledTimes(1);
    // Bekleme birkac saniye degil, bir saniyenin biraz uzeri.
    expect(MOTION.celebrationHold).toBeLessThanOrEqual(1500);
    expect(MOTION.celebrationHold).toBeGreaterThanOrEqual(800);
    act(() => root.unmount());
  });

  it('öğrenci hemen devam ederse beklemeden kapanır', () => {
    vi.useFakeTimers();
    const { dom, root } = setup(false);
    const done = vi.fn();
    act(() => root.render(createElement(StreakCelebration, { streak: 5, onDone: done })));

    act(() => {
      dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(done).toHaveBeenCalledTimes(1);

    // Zamanlayici sonradan dolsa bile ikinci kez kapanis bildirilmez.
    act(() => void vi.advanceTimersByTime(MOTION.celebrationHold + 20));
    expect(done).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
  });

  it('azaltılmış harekette parçacıkları düşürür ama metni korur', () => {
    const { dom, root } = setup(true);
    act(() => root.render(createElement(StreakCelebration, { streak: 5, onDone: () => undefined })));

    expect(dom.window.document.querySelectorAll('.celebration-spark')).toHaveLength(0);
    expect(dom.window.document.querySelectorAll('.celebration-ring')).toHaveLength(0);
    expect(dom.window.document.body.textContent).toContain('5 doğru üst üste!');
    expect(celebrationHoldMs(true)).toBeLessThan(MOTION.celebrationHold);
    act(() => root.unmount());
  });

  it('15 ve üzeri eşikte tam ekran yerine küçük bir onay gösterir', () => {
    const { dom, root } = setup(false);
    act(() => root.render(createElement(StreakCelebration, { streak: 15, onDone: () => undefined })));

    expect(dom.window.document.querySelector('.celebration')).toBeNull();
    expect(dom.window.document.querySelector('.streak-toast')?.textContent).toContain('15');
    act(() => root.unmount());
  });
});

describe('kombo göstergesi', () => {
  it('seri 2 altındayken hiç görünmez', () => {
    const { dom, root } = setup(false);
    act(() => root.render(createElement(ComboIndicator, { streak: 1 })));
    expect(dom.window.document.querySelector('.combo-chip')).toBeNull();

    act(() => root.render(createElement(ComboIndicator, { streak: 4 })));
    expect(dom.window.document.querySelector('.combo-chip')?.textContent).toContain('4');
    act(() => root.unmount());
  });
});
