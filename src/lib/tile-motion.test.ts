import { describe, expect, it } from 'vitest';
import { getTileReflowDelta } from './tile-motion';

describe('getTileReflowDelta', () => {
  it('returns the inverse movement needed to smoothly settle a tile into its new slot', () => {
    expect(
      getTileReflowDelta(
        { left: 248, top: 132 },
        { left: 84, top: 84 },
      ),
    ).toEqual({ x: 164, y: 48 });
  });

  it('does not animate a tile that has no previous position or did not move', () => {
    expect(getTileReflowDelta(undefined, { left: 84, top: 84 })).toBeUndefined();
    expect(getTileReflowDelta({ left: 84, top: 84 }, { left: 84, top: 84 })).toBeUndefined();
  });
});
