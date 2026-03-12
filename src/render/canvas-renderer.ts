import type { Snippet } from '../types';
import { normalizeSnippetText } from '../content/snippet-filter';
import { canvasTheme } from './theme';

export type DrawParams = {
  canvas: HTMLCanvasElement;
  snippet: Snippet;
  currentIndex: number;
  mistakesByIndex: Record<number, number>;
};

export const drawPractice = ({ canvas, snippet, currentIndex, mistakesByIndex }: DrawParams): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = canvasTheme.background;
  ctx.fillRect(0, 0, width, height);

  ctx.font = "18px 'Consolas', 'Cascadia Mono', monospace";
  ctx.textBaseline = 'top';

  const text = normalizeSnippetText(snippet.content);
  const lines = text.split('\n');
  const lineHeight = 28;
  const originX = 20;
  const originY = 24;

  let globalIndex = 0;
  let cursorX = originX;
  let cursorY = originY;

  lines.forEach((line, lineIdx) => {
    let x = originX;
    const y = originY + lineIdx * lineHeight;

    for (const char of line) {
      const isCorrect = globalIndex < currentIndex;
      const isCurrent = globalIndex === currentIndex;
      const isWrong = !isCorrect && (mistakesByIndex[globalIndex] ?? 0) > 0;

      if (isCurrent) {
        cursorX = x;
        cursorY = y;
      }

      ctx.fillStyle = isCorrect ? canvasTheme.correct : isWrong ? canvasTheme.wrong : canvasTheme.text;
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width;
      globalIndex += 1;
    }

    if (line.length === 0 && globalIndex === currentIndex) {
      cursorX = originX;
      cursorY = y;
    }

    globalIndex += 1;
  });

  ctx.fillStyle = canvasTheme.cursor;
  ctx.fillRect(cursorX, cursorY, 2, 22);

  ctx.fillStyle = canvasTheme.meta;
  ctx.fillText(`[${snippet.language}] ${snippet.title}`, originX, height - 32);
};
