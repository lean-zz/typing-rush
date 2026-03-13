import { describe, expect, it } from 'vitest';
import { filterSnippets } from './snippet-filter';
import { SNIPPETS } from './snippets';

describe('snippet filter', () => {
  it('filters english snippets by language and difficulty', () => {
    const englishHard = filterSnippets(SNIPPETS, 'english', 'hard');
    expect(englishHard.length).toBeGreaterThanOrEqual(20);
    expect(englishHard.every((snippet) => snippet.language === 'english' && snippet.difficulty === 'hard')).toBe(true);
  });

  it('builds english article snippets as continuous paragraphs', () => {
    const englishAll = SNIPPETS.filter((snippet) => snippet.language === 'english');
    expect(englishAll.length).toBeGreaterThan(0);
    expect(englishAll.every((snippet) => !snippet.content.includes('\n'))).toBe(true);
  });
});

