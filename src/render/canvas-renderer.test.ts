import { describe, expect, it } from 'vitest';
import { computeViewportStartLine, findCursorVisualLine, indexLines, wrapEnglishLinesByWidth } from './canvas-renderer';

const monoMeasure = (text: string): number => text.length * 10;

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

  it('keeps cursor line inside viewport after scrolling', () => {
    const totalLines = 60;
    const cursorLine = 37;
    const maxVisibleLines = 12;
    const top = computeViewportStartLine(totalLines, cursorLine, maxVisibleLines);

    expect(top).toBeGreaterThan(0);
    expect(cursorLine).toBeGreaterThanOrEqual(top);
    expect(cursorLine).toBeLessThan(top + maxVisibleLines);
  });
});

describe('wrapEnglishLinesByWidth', () => {
  it('wraps long english line by width', () => {
    const indexed = indexLines('alpha beta gamma delta');
    const wrapped = wrapEnglishLinesByWidth(indexed, 60, monoMeasure);

    expect(wrapped.length).toBeGreaterThan(1);
    expect(wrapped.every((line) => line.text.length > 0)).toBe(true);
    expect(wrapped.map((line) => line.text)).toEqual(['alpha', 'beta', 'gamma', 'delta']);
  });

  it('falls back to character wrapping for long words', () => {
    const indexed = indexLines('superlongword');
    const wrapped = wrapEnglishLinesByWidth(indexed, 40, monoMeasure);

    expect(wrapped.map((line) => line.text)).toEqual(['supe', 'rlon', 'gwor', 'd']);
  });

  it('preserves continuous source index mapping after wrap', () => {
    const indexed = indexLines('alpha beta\ngamma');
    const wrapped = wrapEnglishLinesByWidth(indexed, 60, monoMeasure);

    expect(wrapped.map((line) => [line.startIndex, line.endIndex])).toEqual([
      [0, 5],
      [6, 10],
      [11, 16]
    ]);
    expect(wrapped.map((line) => line.text).join('')).toBe('alphabetagamma');
  });
});

describe('findCursorVisualLine', () => {
  it('maps cursor at soft-wrap boundary to next visual line', () => {
    const indexed = indexLines('superlongword');
    const wrapped = wrapEnglishLinesByWidth(indexed, 40, monoMeasure);
    const cursorAtSoftBoundary = 4;

    expect(findCursorVisualLine(wrapped, cursorAtSoftBoundary)).toBe(1);
  });

  it('maps cursor after hard newline to next source line', () => {
    const lines = indexLines('abc\ndef');

    expect(findCursorVisualLine(lines, 3)).toBe(0);
    expect(findCursorVisualLine(lines, 4)).toBe(1);
  });

  it('keeps soft-wrap boundary behavior stable', () => {
    const indexed = indexLines('superlongword');
    const wrapped = wrapEnglishLinesByWidth(indexed, 60, monoMeasure);

    expect(findCursorVisualLine(wrapped, wrapped[0].endIndex)).toBe(1);
  });
});
