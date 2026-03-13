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

type MeasureText = (text: string) => number;

export const indexLines = (text: string): IndexedLine[] => {
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

const findWrapBreakPoint = (line: string): number => {
  for (let i = line.length - 1; i >= 0; i -= 1) {
    if (line[i] === ' ') {
      return i;
    }
  }

  return line.length;
};

const splitLineByWidth = (line: string, maxWidth: number, measure: MeasureText): string[] => {
  if (line.length === 0 || measure(line) <= maxWidth) {
    return [line];
  }

  const parts: string[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    if (measure(remaining) <= maxWidth) {
      parts.push(remaining);
      break;
    }

    let fit = 1;
    for (let end = 1; end <= remaining.length; end += 1) {
      if (measure(remaining.slice(0, end)) <= maxWidth) {
        fit = end;
      } else {
        break;
      }
    }

    const fittedChunk = remaining.slice(0, fit);
    const softBreak = findWrapBreakPoint(fittedChunk);
    const useSoftBreak = softBreak > 0 && softBreak < fittedChunk.length;
    const splitAt = useSoftBreak ? softBreak : fit;
    const chunk = remaining.slice(0, splitAt);

    parts.push(chunk);

    const consumed = useSoftBreak ? splitAt + 1 : splitAt;
    remaining = remaining.slice(consumed);
  }

  return parts;
};

export const wrapEnglishLinesByWidth = (
  lines: IndexedLine[],
  maxWidth: number,
  measure: MeasureText
): IndexedLine[] => {
  const wrapped: IndexedLine[] = [];
  const safeWidth = Math.max(40, maxWidth);

  for (const line of lines) {
    const parts = splitLineByWidth(line.text, safeWidth, measure);
    let offset = 0;

    parts.forEach((part, index) => {
      const startIndex = line.startIndex + offset;
      const isLast = index === parts.length - 1;
      wrapped.push({
        text: part,
        startIndex,
        endIndex: startIndex + part.length,
        hasTrailingNewline: isLast ? line.hasTrailingNewline : false
      });
      offset += part.length;
      if (!isLast && line.text[offset] === ' ') {
        offset += 1;
      }
    });
  }

  return wrapped;
};

export const findCursorVisualLine = (lines: IndexedLine[], currentIndex: number): number => {
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (lines[i].endIndex === currentIndex && lines[i + 1].startIndex === currentIndex) {
      continue;
    }
    if (currentIndex <= lines[i].endIndex) {
      return i;
    }
  }

  if (lines.length > 0 && currentIndex <= lines[lines.length - 1].endIndex) {
    return lines.length - 1;
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

const computeCursorXInLine = (line: IndexedLine, currentIndex: number, measure: MeasureText): number => {
  if (currentIndex <= line.startIndex) {
    return 0;
  }

  if (currentIndex <= line.endIndex) {
    return measure(line.text.slice(0, currentIndex - line.startIndex));
  }

  return measure(line.text);
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
  const indexedLines = indexLines(text);
  const lineHeight = 28;
  const originX = 20;
  const originY = 24;
  const maxTextWidth = Math.max(80, width - originX * 2);
  const lines =
    snippet.language === 'english'
      ? wrapEnglishLinesByWidth(indexedLines, maxTextWidth, (value) => ctx.measureText(value).width)
      : indexedLines;
  const maxVisibleLines = Math.max(5, Math.floor((height - originY * 2 - 48) / lineHeight));
  const cursorLine = findCursorVisualLine(lines, currentIndex);
  let viewportStartLine = computeViewportStartLine(lines.length, cursorLine, maxVisibleLines);
  let viewportEndLine = Math.min(lines.length, viewportStartLine + maxVisibleLines);

  if (cursorLine < viewportStartLine || cursorLine >= viewportEndLine) {
    const keepCursorVisibleTop = Math.max(0, cursorLine - maxVisibleLines + 1);
    viewportStartLine = Math.min(keepCursorVisibleTop, Math.max(0, lines.length - maxVisibleLines));
    viewportEndLine = Math.min(lines.length, viewportStartLine + maxVisibleLines);
  }

  const cursorLineInViewport = cursorLine >= viewportStartLine && cursorLine < viewportEndLine;
  let cursorX = originX;
  let cursorY = originY + Math.max(0, cursorLine - viewportStartLine) * lineHeight;

  if (lines.length > 0 && cursorLineInViewport) {
    const line = lines[cursorLine];
    cursorX = originX + computeCursorXInLine(line, currentIndex, (value) => ctx.measureText(value).width);
    cursorY = originY + (cursorLine - viewportStartLine) * lineHeight;
  }

  lines.slice(viewportStartLine, viewportEndLine).forEach((line, visibleIdx) => {
    let x = originX;
    const y = originY + visibleIdx * lineHeight;

    for (let charOffset = 0; charOffset < line.text.length; charOffset += 1) {
      const charIndex = line.startIndex + charOffset;
      const char = line.text[charOffset];
      const isCorrect = charIndex < currentIndex;
      const isWrong = !isCorrect && (mistakesByIndex[charIndex] ?? 0) > 0;

      ctx.fillStyle = isCorrect ? canvasTheme.correct : isWrong ? canvasTheme.wrong : canvasTheme.text;
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width;
    }
  });

  ctx.fillStyle = canvasTheme.cursor;
  ctx.fillRect(cursorX, cursorY, 2, 22);

  ctx.fillStyle = canvasTheme.meta;
  const scrollMeta = snippet.language === 'english' ? ` · line ${cursorLine + 1}/${lines.length}` : '';
  ctx.fillText(`[${snippet.language}] ${snippet.title}${scrollMeta}`, originX, height - 32);
};

