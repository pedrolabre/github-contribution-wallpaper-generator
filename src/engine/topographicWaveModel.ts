import type { DayContribution, ColorPalette, ContributionLevel } from "../types/contributions";
import type { TopographicWaveParams } from "../types/wallpaper";
import { drawCellWithBloom } from "./cellRenderer";

export const DEFAULT_CAMERA_PITCH_RAD = 0.43633;
export const DEFAULT_PERSPECTIVE_FOCAL = 800;
export const DEFAULT_WAVE_AMPLITUDE = 60;
export const DEFAULT_FREQUENCY_X = 0.04;
export const DEFAULT_FREQUENCY_Z = 0.08;
export const DEFAULT_ELEVATION_MULTIPLIER = 1.5;
export const DEFAULT_DEPTH_FOG_START = 0.5;
export const WEEKS_IN_GRID = 52;
export const DAYS_IN_WEEK = 7;
export const CENTER_WEEK_INDEX = 26;
export const CENTER_WEEKDAY_INDEX = 3;

export interface TopographicWaveCellLayout {
  index: number;
  day: DayContribution;
  weekIndex: number;
  weekdayIndex: number;
  u: number;
  v: number;
  xw: number;
  yw: number;
  zw: number;
  yPrime: number;
  zPrime: number;
  scaleFactor: number;
  x: number;
  y: number;
  size: number;
  width: number;
  height: number;
  fogFactor: number;
  opacity: number;
  visible: boolean;
}

export interface TopographicWaveLayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  width: number;
  height: number;
}

export interface TopographicWaveLayoutResult {
  cells: TopographicWaveCellLayout[];
  totalWeeks: number;
  centerX: number;
  centerY: number;
  bounds: TopographicWaveLayoutBounds;
}

export interface TopographicWaveLayoutOptions {
  days: DayContribution[];
  params: TopographicWaveParams;
  canvasWidth: number;
  canvasHeight: number;
  cellSize: number;
  cellGap?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  zOffset?: number;
  gridMode?: "calendar" | "index";
  secondaryAmplitude?: number;
  secondaryFrequencyX?: number;
}

export interface RenderTopographicWaveOptions {
  layout?: TopographicWaveLayoutResult;
  layoutOptions?: TopographicWaveLayoutOptions;
  palette: ColorPalette;
  borderRadius?: number;
  enableBloom?: boolean;
  bloomIntensity?: number;
  dpr?: number;
}

export function pitchToRadians(pitch: number): number {
  return Math.abs(pitch) > Math.PI ? (pitch * Math.PI) / 180 : pitch;
}

export function calculateWorldCoordinates(
  u: number,
  v: number,
  cellSize: number,
  cellGap: number,
  zOffset = 0,
): { xw: number; zw: number } {
  const step = cellSize + cellGap;
  return {
    xw: u * step,
    zw: (v + 4) * step * 1.8 + zOffset,
  };
}

export function calculateWaveRelief(
  xw: number,
  zw: number,
  level: ContributionLevel,
  params: Pick<
    TopographicWaveParams,
    "waveAmplitude" | "waveFrequencyX" | "waveFrequencyZ" | "elevationMultiplier"
  >,
  cellSize: number,
  secondaryAmplitude?: number,
  secondaryFrequencyX?: number,
): number {
  const ampA = params.waveAmplitude;
  const omegaX = params.waveFrequencyX;
  const omegaZ = params.waveFrequencyZ;
  const ampB = secondaryAmplitude ?? ampA * 0.3;
  const omega2 = secondaryFrequencyX ?? omegaX * 1.5;
  const elevationStep = params.elevationMultiplier * (cellSize * 0.5);
  const wave = ampA * Math.sin(omegaX * xw + omegaZ * zw) + ampB * Math.cos(omega2 * xw);
  return wave - level * elevationStep;
}

export function projectPerspective(
  yw: number,
  zw: number,
  pitchRad: number,
): { yPrime: number; zPrime: number } {
  const cosPitch = Math.cos(pitchRad);
  const sinPitch = Math.sin(pitchRad);
  return {
    yPrime: yw * cosPitch - zw * sinPitch,
    zPrime: yw * sinPitch + zw * cosPitch,
  };
}

export function computePerspectiveScale(focal: number, zPrime: number): number {
  return focal / Math.max(1, focal + zPrime);
}

export function computeDepthFog(
  zPrime: number,
  minZ: number,
  maxZ: number,
  depthFogStart = 0,
): number {
  if (maxZ <= minZ) return 1;
  const depthRatio = Math.max(0, Math.min(1, (zPrime - minZ) / (maxZ - minZ)));
  if (depthFogStart > 0) {
    if (depthRatio <= depthFogStart) return 1;
    const progress = (depthRatio - depthFogStart) / (1 - depthFogStart);
    return Math.max(0.15, Math.min(1.0, 1.0 - progress * 0.75));
  }
  return Math.max(0.15, Math.min(1.0, 1.0 - depthRatio * 0.75));
}

export function calculateTopographicWaveLayout(
  options: TopographicWaveLayoutOptions,
): TopographicWaveLayoutResult {
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
    zOffset = 0,
    gridMode = "calendar",
    secondaryAmplitude,
    secondaryFrequencyX,
  } = options;

  const totalDays = days.length;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  if (totalDays === 0) {
    return {
      cells: [],
      totalWeeks: 0,
      centerX,
      centerY,
      bounds: {
        minX: centerX,
        maxX: centerX,
        minY: centerY,
        maxY: centerY,
        minZ: 0,
        maxZ: 0,
        width: 0,
        height: 0,
      },
    };
  }

  const pitchRad = pitchToRadians(params.cameraPitch);
  const firstWeekday = days[0]?.weekday ?? 0;
  type PreItem = Omit<TopographicWaveCellLayout, "fogFactor" | "opacity" | "visible" | "width" | "height">;
  const preCells: PreItem[] = [];
  let maxWeekIndex = 0;
  let minZPrime = Number.POSITIVE_INFINITY;
  let maxZPrime = Number.NEGATIVE_INFINITY;

  for (let k = 0; k < totalDays; k++) {
    const day = days[k];
    const isCal = gridMode === "calendar";
    const weekIndex = isCal ? Math.floor((k + firstWeekday) / DAYS_IN_WEEK) : Math.floor(k / DAYS_IN_WEEK);
    const weekdayIndex = isCal ? (day.weekday ?? (k % DAYS_IN_WEEK)) : (k % DAYS_IN_WEEK);

    if (weekIndex > maxWeekIndex) maxWeekIndex = weekIndex;

    const u = weekIndex - CENTER_WEEK_INDEX;
    const v = weekdayIndex - CENTER_WEEKDAY_INDEX;

    const { xw, zw } = calculateWorldCoordinates(u, v, cellSize, cellGap, zOffset);
    const yw = calculateWaveRelief(xw, zw, day.level, params, cellSize, secondaryAmplitude, secondaryFrequencyX);
    const { yPrime, zPrime } = projectPerspective(yw, zw, pitchRad);
    const s = computePerspectiveScale(params.perspectiveFocal, zPrime);
    const effectiveScale = s * scale;

    const x = centerX + xw * effectiveScale + offsetX;
    const y = centerY + yPrime * effectiveScale + offsetY;
    const size = cellSize * effectiveScale;

    if (zPrime < minZPrime) minZPrime = zPrime;
    if (zPrime > maxZPrime) maxZPrime = zPrime;

    preCells.push({
      index: k,
      day,
      weekIndex,
      weekdayIndex,
      u,
      v,
      xw,
      yw,
      zw,
      yPrime,
      zPrime,
      scaleFactor: effectiveScale,
      x,
      y,
      size,
    });
  }

  const fogStart = params.depthFogStart ?? DEFAULT_DEPTH_FOG_START;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const cells: TopographicWaveCellLayout[] = preCells.map((cell) => {
    const fogFactor = computeDepthFog(cell.zPrime, minZPrime, maxZPrime, fogStart);
    const opacity = fogFactor;
    const visible = opacity >= 0.02 && cell.size >= 0.5;

    if (visible) {
      const half = cell.size / 2;
      minX = Math.min(minX, cell.x - half);
      maxX = Math.max(maxX, cell.x + half);
      minY = Math.min(minY, cell.y - half);
      maxY = Math.max(maxY, cell.y + half);
    }

    return {
      ...cell,
      width: cell.size,
      height: cell.size,
      fogFactor,
      opacity,
      visible,
    };
  });

  cells.sort((a, b) => b.zPrime - a.zPrime);

  const hasVisible = Number.isFinite(minX);
  return {
    cells,
    totalWeeks: maxWeekIndex + 1,
    centerX,
    centerY,
    bounds: {
      minX: hasVisible ? minX : centerX,
      maxX: hasVisible ? maxX : centerX,
      minY: hasVisible ? minY : centerY,
      maxY: hasVisible ? maxY : centerY,
      minZ: Number.isFinite(minZPrime) ? minZPrime : 0,
      maxZ: Number.isFinite(maxZPrime) ? maxZPrime : 0,
      width: hasVisible ? maxX - minX : 0,
      height: hasVisible ? maxY - minY : 0,
    },
  };
}

export function renderTopographicWave(
  ctx: CanvasRenderingContext2D,
  options: RenderTopographicWaveOptions,
): TopographicWaveLayoutResult {
  const layout = options.layout ?? (options.layoutOptions
    ? calculateTopographicWaveLayout(options.layoutOptions)
    : undefined);

  if (!layout) {
    throw new Error("renderTopographicWave requires either layout or layoutOptions");
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
    if (!cell.visible || cell.opacity <= 0) continue;

    const color = palette.levels[cell.day.level];

    ctx.save();
    ctx.translate(cell.x, cell.y);
    ctx.globalAlpha = cell.opacity;

    const scaledRadius = Math.max(0, Math.min(cell.size / 2, borderRadius * (cell.scaleFactor || 1)));

    drawCellWithBloom(ctx, {
      x: -cell.width / 2,
      y: -cell.height / 2,
      width: cell.width,
      height: cell.height,
      radius: scaledRadius,
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
