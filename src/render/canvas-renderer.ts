import type { Snippet } from '../types';
import { normalizeSnippetText } from '../content/snippet-filter';
import { canvasTheme } from './theme';

export type DrawParams = {
  canvas: HTMLCanvasElement;
  snippet: Snippet;
  currentIndex: number;
  mistakesByIndex: Record<number, number>;
};

type IndexedLine = {
  text: string;
  startIndex: number;
  endIndex: number;
  hasTrailingNewline: boolean;
};

const indexLines = (text: string): IndexedLine[] => {
  const rawLines = text.split('\n');
  let startIndex = 0;

  return rawLines.map((line, idx) => {
    const endIndex = startIndex + line.length;
    const hasTrailingNewline = idx < rawLines.length - 1;
    const indexed: IndexedLine = { text: line, startIndex, endIndex, hasTrailingNewline };
    startIndex = endIndex + (hasTrailingNewline ? 1 : 0);
    return indexed;
  });
};

const findCursorLine = (lines: IndexedLine[], currentIndex: number): number => {
  for (let i = 0; i < lines.length; i += 1) {
    if (currentIndex <= lines[i].endIndex) {
      return i;
    }
  }
  return Math.max(0, lines.length - 1);
};

export const computeViewportStartLine = (
  totalLines: number,
  cursorLine: number,
  maxVisibleLines: number
): number => {
  if (totalLines <= maxVisibleLines) {
    return 0;
  }

  const preferredTop = Math.max(0, cursorLine - Math.floor(maxVisibleLines * 0.6));
  return Math.min(preferredTop, totalLines - maxVisibleLines);
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
  const lines = indexLines(text);
  const lineHeight = 28;
  const originX = 20;
  const originY = 24;
  const maxVisibleLines = Math.max(5, Math.floor((height - originY * 2 - 48) / lineHeight));
  const cursorLine = findCursorLine(lines, currentIndex);
  const viewportStartLine =
    snippet.language === 'english' ? computeViewportStartLine(lines.length, cursorLine, maxVisibleLines) : 0;
  const viewportEndLine = Math.min(lines.length, viewportStartLine + maxVisibleLines);

  let cursorX = originX;
  let cursorY = originY;

  lines.slice(viewportStartLine, viewportEndLine).forEach((line, visibleIdx) => {
    let x = originX;
    const y = originY + visibleIdx * lineHeight;

    for (let charOffset = 0; charOffset < line.text.length; charOffset += 1) {
      const charIndex = line.startIndex + charOffset;
      const char = line.text[charOffset];
      const isCorrect = charIndex < currentIndex;
      const isCurrent = charIndex === currentIndex;
      const isWrong = !isCorrect && (mistakesByIndex[charIndex] ?? 0) > 0;

      if (isCurrent) {
        cursorX = x;
        cursorY = y;
      }

      ctx.fillStyle = isCorrect ? canvasTheme.correct : isWrong ? canvasTheme.wrong : canvasTheme.text;
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width;
    }

    if (line.text.length === 0 && line.startIndex === currentIndex) {
      cursorX = originX;
      cursorY = y;
    }

    if (line.hasTrailingNewline && line.endIndex === currentIndex) {
      cursorX = x;
      cursorY = y;
    }
  });

  ctx.fillStyle = canvasTheme.cursor;
  ctx.fillRect(cursorX, cursorY, 2, 22);

  ctx.fillStyle = canvasTheme.meta;
  const scrollMeta = snippet.language === 'english' ? ` · line ${cursorLine + 1}/${lines.length}` : '';
  ctx.fillText(`[${snippet.language}] ${snippet.title}${scrollMeta}`, originX, height - 32);
};

