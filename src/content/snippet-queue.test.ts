import { describe, expect, it } from 'vitest';
import { refillQueue, takeNextSnippet } from './snippet-queue';
import { SNIPPETS } from './snippets';

const deterministic = (() => {
  let x = 0;
  return () => {
    x = (x + 0.37) % 1;
    return x;
  };
})();

describe('snippet queue', () => {
  it('refills queue to expected size', () => {
    const source = SNIPPETS.filter((s) => s.language === 'typescript' && s.difficulty === 'easy');
    const state = refillQueue(source, { queueOfNextSnippets: [], recentSnippetIds: [] }, deterministic);
    expect(state.queueOfNextSnippets.length).toBe(8);
  });

  it('takeNextSnippet returns a snippet and keeps queue non-empty', () => {
    const source = SNIPPETS.filter((s) => s.language === 'python' && s.difficulty === 'medium');
    const next = takeNextSnippet(source, { queueOfNextSnippets: [], recentSnippetIds: [] }, deterministic);
    expect(next.snippet).toBeTruthy();
    expect(next.state.queueOfNextSnippets.length).toBeGreaterThan(0);
  });
});

