import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateReferenceNumber } from './refNumber';

describe('generateReferenceNumber', () => {
  it('starts with the LN- prefix', () => {
    expect(generateReferenceNumber()).toMatch(/^LN-/);
  });

  it('matches the LN-YYYYMMDD-NNNN shape', () => {
    expect(generateReferenceNumber()).toMatch(/^LN-\d{8}-\d{4}$/);
  });

  it('includes the current date in the prefix', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'));
    const ref = generateReferenceNumber();
    // Allow either UTC or local-time padding so the test is timezone-stable.
    expect(ref).toMatch(/^LN-2026(0428|0429|0430)-\d{4}$/);
    vi.useRealTimers();
  });

  it('produces a different number across consecutive calls', () => {
    // Random 4-digit suffix → effectively unique. We tolerate the rare collision
    // by sampling 5 calls and asserting at least 2 distinct values.
    const samples = new Set([
      generateReferenceNumber(),
      generateReferenceNumber(),
      generateReferenceNumber(),
      generateReferenceNumber(),
      generateReferenceNumber(),
    ]);
    expect(samples.size).toBeGreaterThan(1);
  });

  describe('with mocked Math.random', () => {
    let randomSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    });
    afterEach(() => {
      randomSpy.mockRestore();
    });

    it('produces the floor 1000 suffix when Math.random returns 0', () => {
      expect(generateReferenceNumber()).toMatch(/-1000$/);
    });
  });
});
