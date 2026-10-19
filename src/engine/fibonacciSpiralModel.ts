import type { DayContribution, ColorPalette } from "../types/contributions";
import type { FibonacciSpiralParams } from "../types/wallpaper";
import { drawCellWithBloom } from "./cellRenderer";

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const DEFAULT_SPIRAL_TIGHTNESS = 2.5;
export const DEFAULT_INNER_RADIUS = 10;
export const DEFAULT_OUTER_RADIUS_SCALE = 1.0;

export interface FibonacciSpiralCellLayout {
  index: number;
  day: DayContribution;
  theta: number;
  radius: number;
  tangentAngle: number;
  rotation: number;
  x: number;
  y: number;
  size: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface FibonacciSpiralLayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  maxRadius: number;
}

export interface FibonacciSpiralLayoutResult {
  cells: FibonacciSpiralCellLayout[];
  centerX: number;
  centerY: number;
  bounds: FibonacciSpiralLayoutBounds;
}

export interface FibonacciSpiralLayoutOptions {
  days: DayContribution[];
  params: FibonacciSpiralParams;
  canvasWidth: number;
  canvasHeight: number;
  cellSize: number;
  cellGap?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface RenderFibonacciSpiralOptions {
  layout?: FibonacciSpiralLayoutResult;
  layoutOptions?: FibonacciSpiralLayoutOptions;
  palette: ColorPalette;
  borderRadius?: number;
  enableBloom?: boolean;
  bloomIntensity?: number;
  dpr?: number;
}

export function computeExpansionRate(
  spiralTightness: number,
  outerRadiusScale: number,
): number {
  const t = Number.isFinite(spiralTightness) && spiralTightness > 0 ? spiralTightness : DEFAULT_SPIRAL_TIGHTNESS;
  const s = Number.isFinite(outerRadiusScale) && outerRadiusScale > 0 ? outerRadiusScale : DEFAULT_OUTER_RADIUS_SCALE;
  return Math.max(0.001, t * s);
}

export function computeArchimedeanTheta(
  k: number,
  arcStep: number,
  b: number,
): number {
  if (k <= 0 || arcStep <= 0 || b <= 0) {
    return 0;
  }
  return Math.sqrt((2 * k * arcStep) / b);
}

export function computeArchimedeanRadius(
  innerRadius: number,
  b: number,
  theta: number,
): number {
  const baseInner = Math.max(0, innerRadius);
  return baseInner + b * Math.max(0, theta);
}

export function computeArchimedeanTangent(
  theta: number,
  radius: number,
  b: number,
): number {
  if (b <= 0) {
    return theta + Math.PI / 2;
  }
  return theta + Math.atan2(Math.max(0, radius), b);
}

export function computeGoldenRatioCoords(
  k: number,
  innerRadius: number,
  b: number,
  arcStep: number,
): { theta: number; radius: number; tangent: number } {
  const theta = k * GOLDEN_ANGLE;
  const baseInner = Math.max(0, innerRadius);
  const sqrtK = Math.sqrt(Math.max(0, k));
  const stepFactor = Math.sqrt(Math.max(0.001, arcStep));
  const radius = baseInner + b * sqrtK * stepFactor;
  const tangent = theta + Math.PI / 2;
  return { theta, radius, tangent };
}

export function calculatePolarPosition(
  centerX: number,
  centerY: number,
  radius: number,
  theta: number,
  offsetX = 0,
  offsetY = 0,
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(theta) + offsetX,
    y: centerY + radius * Math.sin(theta) + offsetY,
  };
}

export function calculateFibonacciSpiralLayout(
  options: FibonacciSpiralLayoutOptions,
): FibonacciSpiralLayoutResult {
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
  } = options;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const totalDays = days.length;

  const validScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const scaledCellSize = Math.max(1, cellSize * validScale);
  const scaledGap = Math.max(0, cellGap * validScale);
  const arcStep = scaledCellSize + scaledGap;

  const b = computeExpansionRate(params.spiralTightness, params.outerRadiusScale);
  const scaledInnerRadius = Math.max(0, params.innerRadius * validScale);

  const cells: FibonacciSpiralCellLayout[] = [];
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxRadius = 0;

  for (let k = 0; k < totalDays; k++) {
    const day = days[k];

    let theta: number;
    let radius: number;
    let tangentAngle: number;

    if (params.angularStep === "golden-ratio") {
      const coords = computeGoldenRatioCoords(k, scaledInnerRadius, b, arcStep);
      theta = coords.theta;
      radius = coords.radius;
      tangentAngle = coords.tangent;
    } else {
      theta = computeArchimedeanTheta(k, arcStep, b);
      radius = computeArchimedeanRadius(scaledInnerRadius, b, theta);
      tangentAngle = computeArchimedeanTangent(theta, radius, b);
    }

    const pos = calculatePolarPosition(centerX, centerY, radius, theta, offsetX, offsetY);
    const rotation = params.cellRotation ? tangentAngle : 0;

    cells.push({
      index: k,
      day,
      theta,
      radius,
      tangentAngle,
      rotation,
      x: pos.x,
      y: pos.y,
      size: scaledCellSize,
      width: scaledCellSize,
      height: scaledCellSize,
      visible: true,
    });

    if (radius > maxRadius) {
      maxRadius = radius;
    }

    const boundRadius = (scaledCellSize * Math.SQRT2) / 2;
    minX = Math.min(minX, pos.x - boundRadius);
    maxX = Math.max(maxX, pos.x + boundRadius);
    minY = Math.min(minY, pos.y - boundRadius);
    maxY = Math.max(maxY, pos.y + boundRadius);
  }

  const hasVisible = cells.length > 0 && Number.isFinite(minX);
  const bounds: FibonacciSpiralLayoutBounds = {
    minX: hasVisible ? minX : centerX,
    maxX: hasVisible ? maxX : centerX,
    minY: hasVisible ? minY : centerY,
    maxY: hasVisible ? maxY : centerY,
    width: hasVisible ? maxX - minX : 0,
    height: hasVisible ? maxY - minY : 0,
    maxRadius,
  };

  return { cells, centerX, centerY, bounds };
}

export function renderFibonacciSpiral(
  ctx: CanvasRenderingContext2D,
  options: RenderFibonacciSpiralOptions,
): FibonacciSpiralLayoutResult {
  const layout = options.layout ?? (options.layoutOptions
    ? calculateFibonacciSpiralLayout(options.layoutOptions)
    : undefined);

  if (!layout) {
    throw new Error("renderFibonacciSpiral requires either layout or layoutOptions");
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
    if (!cell.visible) {
      continue;
    }

    const color = palette.levels[cell.day.level];

    ctx.save();
    ctx.translate(cell.x, cell.y);
    if (cell.rotation !== 0) {
      ctx.rotate(cell.rotation);
    }

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
