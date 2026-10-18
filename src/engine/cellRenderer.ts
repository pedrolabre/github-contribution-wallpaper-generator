import type { ContributionLevel } from "../types/contributions";

export interface DrawCellWithBloomOptions {
  x: number;
  y: number;
  width: number;
  height?: number;
  radius: number;
  color: string;
  level?: ContributionLevel;
  glowColor?: string;
  enableBloom?: boolean;
  dpr?: number;
  bloomIntensity?: number;
}

export function clampRadius(
  radius: number,
  width: number,
  height: number,
): number {
  if (!Number.isFinite(radius) || radius <= 0) {
    return 0;
  }
  const maxRadius = Math.min(width, height) / 2;
  return Math.min(radius, maxRadius);
}

export function drawRoundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const clamped = clampRadius(radius, width, height);

  ctx.beginPath();

  if (clamped <= 0) {
    ctx.rect(x, y, width, height);
    return;
  }

  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, clamped);
    return;
  }

  ctx.moveTo(x + clamped, y);
  ctx.arcTo(x + width, y, x + width, y + height, clamped);
  ctx.arcTo(x + width, y + height, x, y + height, clamped);
  ctx.arcTo(x, y + height, x, y, clamped);
  ctx.arcTo(x, y, x + width, y, clamped);
  ctx.closePath();
}

export function drawRoundedCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
  color: string,
): void;
export function drawRoundedCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void;
export function drawRoundedCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  widthOrSize: number,
  heightOrRadius: number,
  radiusOrColor: number | string,
  color?: string,
): void {
  let width: number;
  let height: number;
  let radius: number;
  let fillColor: string;

  if (typeof color === "string") {
    width = widthOrSize;
    height = heightOrRadius;
    radius = radiusOrColor as number;
    fillColor = color;
  } else {
    width = widthOrSize;
    height = widthOrSize;
    radius = heightOrRadius;
    fillColor = radiusOrColor as string;
  }

  if (width <= 0 || height <= 0) {
    return;
  }

  drawRoundedPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillColor;
  ctx.fill();
}

export function computeBloomBlur(
  level: ContributionLevel,
  dpr = 1,
  intensity = 1,
): number {
  if (level < 3) {
    return 0;
  }
  const baseBlur = level === 4 ? 14 : 8;
  return baseBlur * dpr * intensity;
}

export function drawCellWithBloom(
  ctx: CanvasRenderingContext2D,
  options: DrawCellWithBloomOptions,
): void {
  const width = options.width;
  const height = options.height ?? options.width;

  if (width <= 0 || height <= 0) {
    return;
  }

  const isBloomActive = Boolean(
    options.enableBloom &&
      options.level !== undefined &&
      options.level >= 3 &&
      options.glowColor,
  );

  if (isBloomActive) {
    const dpr = options.dpr ?? 1;
    const intensity = options.bloomIntensity ?? 1;
    const blur = computeBloomBlur(options.level!, dpr, intensity);

    ctx.save();
    ctx.shadowColor = options.glowColor!;
    ctx.shadowBlur = blur;
    drawRoundedCell(ctx, options.x, options.y, width, height, options.radius, options.color);
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    drawRoundedCell(ctx, options.x, options.y, width, height, options.radius, options.color);
    return;
  }

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  drawRoundedCell(ctx, options.x, options.y, width, height, options.radius, options.color);
}
