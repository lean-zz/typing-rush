import { describe, expect, it } from 'vitest';
import { applyBackspace, applyTypingInput } from './input-judge';
import { createInitialStats } from './stats-base';

describe('input judge', () => {
  it('keeps index when wrong character is typed', () => {
    const result = applyTypingInput('x', 'abc', 0, {}, createInitialStats(), Date.now());
    expect(result.nextIndex).toBe(0);
    expect(result.stats.wrongChars).toBe(1);
  });

  it('moves index when correct character is typed', () => {
    const result = applyTypingInput('a', 'abc', 0, {}, createInitialStats(), Date.now());
    expect(result.nextIndex).toBe(1);
    expect(result.stats.correctChars).toBe(1);
  });

  it('supports backspace correction', () => {
    const stats = { ...createInitialStats(), correctChars: 2 };
    const result = applyBackspace(2, stats);
    expect(result.nextIndex).toBe(1);
    expect(result.stats.correctChars).toBe(1);
  });
});
