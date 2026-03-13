import { describe, expect, it } from 'vitest';
import { computeViewportStartLine } from './canvas-renderer';

describe('computeViewportStartLine', () => {
  it('keeps top at zero when lines fit viewport', () => {
    expect(computeViewportStartLine(10, 4, 12)).toBe(0);
  });

  it('moves viewport down when cursor goes deep', () => {
    expect(computeViewportStartLine(40, 25, 12)).toBeGreaterThan(0);
  });

  it('clamps viewport near document end', () => {
    expect(computeViewportStartLine(30, 29, 10)).toBe(20);
  });
});

