import { describe, expect, it } from 'vitest';
import { createInitialStats } from './stats-base';
import { recalculateLiveStats } from './stats';

describe('recalculateLiveStats', () => {
  it('calculates lpm and accuracy from typed chars', () => {
    const base = createInitialStats();
    const stats = recalculateLiveStats(
      {
        ...base,
        totalTypedChars: 50,
        correctChars: 40,
        wrongChars: 10,
        maxCombo: 8
      },
      60000
    );

    expect(stats.rawLpm).toBe(50);
    expect(stats.lpm).toBe(40);
    expect(stats.accuracy).toBe(80);
    expect(stats.score).toBeGreaterThan(0);
  });
});

