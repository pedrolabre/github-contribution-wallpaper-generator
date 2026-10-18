import type { DayContribution, ColorPalette } from "../types/contributions";
import type { MatrixStreamParams } from "../types/wallpaper";
import { drawCellWithBloom } from "./cellRenderer";

export const DEFAULT_MATRIX_STREAM_COLUMNS = 12;

export interface MatrixStreamCellLayout {
  index: number;
  day: DayContribution;
  column: number;
  row: number;
  xLoc: number;
  yLoc: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fadeFactor: number;
  opacity: number;
  visible: boolean;
}

export interface MatrixStreamLayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface MatrixStreamLayoutResult {
  cells: MatrixStreamCellLayout[];
  columns: number;
  rows: number;
  centerX: number;
  centerY: number;
  bounds: MatrixStreamLayoutBounds;
}

export interface MatrixStreamLayoutOptions {
  days: DayContribution[];
  params: MatrixStreamParams;
  canvasWidth: number;
  canvasHeight: number;
  cellSize: number;
  cellGap?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  columns?: number;
  seed?: number;
  rotateCells?: boolean;
}

export interface RenderMatrixStreamOptions {
  layout?: MatrixStreamLayoutResult;
  layoutOptions?: MatrixStreamLayoutOptions;
  palette: ColorPalette;
  borderRadius?: number;
  enableBloom?: boolean;
  bloomIntensity?: number;
  dpr?: number;
}

export function computeColumnStagger(
  col: number,
  totalCols: number,
  verticalStagger: number,
  centered = true,
): number {
  if (verticalStagger === 0) {
    return 0;
  }
  const val = centered
    ? (col - (totalCols - 1) / 2) * verticalStagger
    : col * verticalStagger;
  return val === 0 ? 0 : val;
}

export function rotate2D(
  x: number,
  y: number,
  angleRad: number,
): { x: number; y: number } {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

export function computeGaussianFade(
  distanceFromAxis: number,
  halfBeamWidth: number,
  scatterFactor: number,
): number {
  if (scatterFactor <= 0 || halfBeamWidth <= 0) {
    return 1;
  }
  const normalizedDist = Math.abs(distanceFromAxis) / halfBeamWidth;
  const decayRate = 1.5 * scatterFactor;
  const fade = Math.exp(-decayRate * normalizedDist * normalizedDist);
  return Math.max(0, Math.min(1, fade));
}

export function deterministicUnitNoise(
  seed: number,
  index: number,
  salt: number,
): number {
  let h = ((index * 374761393) ^ (salt * 668265263) ^ (seed * 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function calculateMatrixStreamLayout(
  options: MatrixStreamLayoutOptions,
): MatrixStreamLayoutResult {
  const {
    days,
    params,
    canvasWidth,
    canvasHeight,
    cellSize,
    cellGap = 4,
    scale = 1,
    offsetX = 0,
    offsetY = 0,
    columns = DEFAULT_MATRIX_STREAM_COLUMNS,
    seed = 42,
    rotateCells = true,
  } = options;

  const validColumns = Math.max(1, Math.floor(columns));
  const totalDays = days.length;
  const rows = totalDays === 0 ? 0 : Math.ceil(totalDays / validColumns);

  const cellWidth = params.columnWidth > 0 ? params.columnWidth : cellSize;
  const cellHeight = cellSize;
  const stepX = cellWidth + cellGap;
  const stepY = cellHeight + cellGap;

  const halfCols = (validColumns - 1) / 2;
  const halfRows = (rows - 1) / 2;
  const halfBeamWidth = halfCols * stepX;

  const angleRad = (params.tiltAngle * Math.PI) / 180;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const cells: MatrixStreamCellLayout[] = [];
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let k = 0; k < totalDays; k++) {
    const day = days[k];
    const col = k % validColumns;
    const row = Math.floor(k / validColumns);

    const xBase = (col - halfCols) * stepX;
    const yBase = (row - halfRows) * stepY;
    const stagger = computeColumnStagger(col, validColumns, params.verticalStagger, true);

    let jitterX = 0;
    let jitterY = 0;
    if (params.scatterFactor > 0) {
      jitterX = (deterministicUnitNoise(seed, k, 1) - 0.5) * stepX * params.scatterFactor * 0.5;
      jitterY = (deterministicUnitNoise(seed, k, 2) - 0.5) * stepY * params.scatterFactor * 0.5;
    }

    const xLoc = (xBase + jitterX) * scale;
    const yLoc = (yBase + stagger + jitterY) * scale;
    const rotated = rotate2D(xLoc, yLoc, angleRad);
    const x = centerX + rotated.x + offsetX;
    const y = centerY + rotated.y + offsetY;

    const fadeFactor = computeGaussianFade(xBase, halfBeamWidth, params.scatterFactor);
    const opacity = Math.max(0, Math.min(1, fadeFactor));
    const visible = opacity >= 0.02;

    const w = cellWidth * scale;
    const h = cellHeight * scale;
    const rotation = rotateCells ? angleRad : 0;

    cells.push({
      index: k,
      day,
      column: col,
      row,
      xLoc,
      yLoc,
      x,
      y,
      width: w,
      height: h,
      rotation,
      fadeFactor,
      opacity,
      visible,
    });

    if (visible) {
      const radius = Math.sqrt((w * w + h * h) / 4);
      minX = Math.min(minX, x - radius);
      maxX = Math.max(maxX, x + radius);
      minY = Math.min(minY, y - radius);
      maxY = Math.max(maxY, y + radius);
    }
  }

  const hasVisible = Number.isFinite(minX);
  const bounds: MatrixStreamLayoutBounds = {
    minX: hasVisible ? minX : centerX,
    maxX: hasVisible ? maxX : centerX,
    minY: hasVisible ? minY : centerY,
    maxY: hasVisible ? maxY : centerY,
    width: hasVisible ? maxX - minX : 0,
    height: hasVisible ? maxY - minY : 0,
  };

  return { cells, columns: validColumns, rows, centerX, centerY, bounds };
}

export function renderMatrixStream(
  ctx: CanvasRenderingContext2D,
  options: RenderMatrixStreamOptions,
): MatrixStreamLayoutResult {
  const layout = options.layout ?? (options.layoutOptions
    ? calculateMatrixStreamLayout(options.layoutOptions)
    : undefined);

  if (!layout) {
    throw new Error("renderMatrixStream requires either layout or layoutOptions");
  }

  const {
    palette,
    borderRadius = 4,
    enableBloom = false,
    bloomIntensity = 1,
    dpr = 1,
  } = options;

  for (let i = 0; i < layout.cells.length; i++) {
    const cell = layout.cells[i];
    if (!cell.visible || cell.opacity <= 0) {
      continue;
    }

    const color = palette.levels[cell.day.level];

    ctx.save();
    ctx.translate(cell.x, cell.y);
    if (cell.rotation !== 0) {
      ctx.rotate(cell.rotation);
    }
    ctx.globalAlpha = cell.opacity;

    drawCellWithBloom(ctx, {
      x: -cell.width / 2,
      y: -cell.height / 2,
      width: cell.width,
      height: cell.height,
      radius: borderRadius,
      color,
      level: cell.day.level,
      glowColor: palette.glowColor,
      enableBloom,
      bloomIntensity,
      dpr,
    });

    ctx.restore();
  }

  return layout;
}
