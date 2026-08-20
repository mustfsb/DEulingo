import { describe, expect, it } from 'vitest';
import { applyAttemptToStreak, milestoneCopy, STREAK_MILESTONES } from './streak';
import type { AttemptResult, PresentationReason, StreakState } from './storage';

function run(
  attempts: Array<[AttemptResult, PresentationReason?]>,
): { state: StreakState; milestones: number[] } {
  let state: StreakState | undefined;
  const milestones: number[] = [];
  for (const [result, reason] of attempts) {
    const step = applyAttemptToStreak(state, result, reason ?? 'primary');
    state = step.state;
    if (step.milestone) milestones.push(step.milestone);
  }
  return { state: state ?? { current: 0, best: 0, firedMilestones: [] }, milestones };
}

const correct = (count: number): Array<[AttemptResult]> =>
  Array.from({ length: count }, () => ['correct'] as [AttemptResult]);

describe('ders ici dogru serisi', () => {
  it('5 tam dogruda 5 esigi tam olarak bir kez atesler', () => {
    const { milestones, state } = run(correct(5));
    expect(milestones).toEqual([5]);
    expect(state.current).toBe(5);
  });

  it('6. dogruda 5 esigi tekrar atesleMEZ', () => {
    expect(run(correct(6)).milestones).toEqual([5]);
  });

  it('uzun oturumda 10 ve 15 esikleri sirayla gelir', () => {
    expect(run(correct(15)).milestones).toEqual([5, 10, 15]);
  });

  it('yanlis cevap seriyi sifirlar', () => {
    const { state } = run([...correct(4), ['incorrect']]);
    expect(state.current).toBe(0);
    expect(state.best).toBe(4);
  });

  it('atlanan soru da seriyi sifirlar', () => {
    expect(run([...correct(3), ['skipped']]).state.current).toBe(0);
  });

  it('kucuk yazim hatasi seriyi surdurur', () => {
    const { state, milestones } = run([
      ['correct'],
      ['minor-typo'],
      ['correct'],
      ['correct'],
      ['minor-typo'],
    ]);
    expect(state.current).toBe(5);
    expect(milestones).toEqual([5]);
  });

  it('seri sifirlandiktan sonra ayni esik yeniden kutlanmaz', () => {
    const { milestones } = run([...correct(5), ['incorrect'], ...correct(5)]);
    expect(milestones).toEqual([5]);
  });

  it('ders ici hata tekrari seriyi sismez (gameable degil)', () => {
    const { state, milestones } = run([
      ...correct(4),
      ['correct', 'mistake-retry'],
      ['correct', 'mistake-retry'],
    ]);
    expect(state.current).toBe(4);
    expect(milestones).toEqual([]);
  });

  it('sesli gorevin oz degerlendirmesi seriyi ne kirar ne buyutur', () => {
    const { state } = run([...correct(3), ['self-assessed']]);
    expect(state.current).toBe(3);
  });

  it('esik metni ve efekti buyudukce degisir', () => {
    expect(milestoneCopy(5).effect).toBe('streak-5');
    expect(milestoneCopy(10).effect).toBe('streak-10');
    expect(milestoneCopy(5).title).toContain('5');
    expect(STREAK_MILESTONES[0]).toBe(5);
  });
});
