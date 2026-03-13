import type { Snippet } from '../types';

export type QueueState = {
  queueOfNextSnippets: Snippet[];
  recentSnippetIds: string[];
};

const RECENT_SIZE = 12;
const QUEUE_SIZE = 8;

const pickOne = (pool: Snippet[], random: () => number): Snippet => {
  const index = Math.floor(random() * pool.length);
  return pool[index];
};

export const refillQueue = (
  source: Snippet[],
  state: QueueState,
  random: () => number = Math.random
): QueueState => {
  if (source.length === 0) {
    throw new Error('No snippets available for selected language and difficulty.');
  }

  const queue = [...state.queueOfNextSnippets];
  const recent = [...state.recentSnippetIds];

  while (queue.length < QUEUE_SIZE) {
    const available = source.filter((snippet) => !recent.includes(snippet.id));
    const pool = available.length > 0 ? available : source;
    const selected = pickOne(pool, random);
    queue.push(selected);
    recent.push(selected.id);
    if (recent.length > RECENT_SIZE) {
      recent.shift();
    }
  }

  return { queueOfNextSnippets: queue, recentSnippetIds: recent };
};

export const takeNextSnippet = (
  source: Snippet[],
  state: QueueState,
  random: () => number = Math.random
): { snippet: Snippet; state: QueueState } => {
  const filled = refillQueue(source, state, random);
  const [snippet, ...rest] = filled.queueOfNextSnippets;
  const nextState = refillQueue(source, { queueOfNextSnippets: rest, recentSnippetIds: filled.recentSnippetIds }, random);

  return { snippet, state: nextState };
};

