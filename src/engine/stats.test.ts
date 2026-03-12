import { describe, expect, it } from 'vitest';
import { createInitialStats } from './stats-base';
import { recalculateLiveStats } from './stats';

describe('recalculateLiveStats', () => {
  it('calculates wpm and accuracy from typed chars', () => {
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

    expect(stats.rawWpm).toBe(10);
    expect(stats.wpm).toBe(8);
    expect(stats.accuracy).toBe(80);
    expect(stats.score).toBeGreaterThan(0);
  });
});
