import { describe, expect, it } from 'vitest';
import { formatEnglishTimestamp } from './date-time';

describe('formatEnglishTimestamp', () => {
  it('formats timestamp into YYYY-MM-DD HH:MM in 24-hour style', () => {
    const formatted = formatEnglishTimestamp('2026-03-13T10:46:49');
    expect(formatted).toBe('2026-03-13 10:46');
  });

  it('returns original value when input is invalid', () => {
    expect(formatEnglishTimestamp('invalid-date')).toBe('invalid-date');
  });
});
