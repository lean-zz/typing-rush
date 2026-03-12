import type { Difficulty, Language, Snippet } from '../types';

export const normalizeSnippetText = (content: string): string => content.replace(/\t/g, '  ');

export const filterSnippets = (snippets: Snippet[], language: Language, difficulty: Difficulty): Snippet[] =>
  snippets.filter((snippet) => snippet.language === language && snippet.difficulty === difficulty);
