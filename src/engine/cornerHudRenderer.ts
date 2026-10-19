import type { ColorPalette } from "../types/contributions";
import type { CornerHUDConfig } from "../types/wallpaper";
import { formatContributionNumber } from "../services/statsCalculator";
import { drawRoundedCell } from "./cellRenderer";

export interface CornerHUDRenderOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr?: number;
  hudScale?: number;
  paddingX?: number;
  paddingY?: number;
  config: CornerHUDConfig;
  username: string;
  year: number | string;
  totalContributions: number;
  palette: ColorPalette;
  weekdayLevels?: number[];
}

export const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DEFAULT_WEEKDAY_LEVEL_PATTERN = [0, 1, 2, 3, 4, 2, 4];

export function computeHudScale(
  width: number,
  height: number,
  customScale?: number,
): number {
  if (typeof customScale === "number" && customScale > 0) {
    return customScale;
  }
  const minDim = Math.min(width, height);
  return Math.max(0.65, minDim / 1000);
}

export function drawOctocatIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();

  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.42;

  ctx.arc(cx, cy + size * 0.05, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - size * 0.38, cy - size * 0.05);
  ctx.lineTo(cx - size * 0.32, cy - size * 0.48);
  ctx.lineTo(cx - size * 0.05, cy - size * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + size * 0.38, cy - size * 0.05);
  ctx.lineTo(cx + size * 0.32, cy - size * 0.48);
  ctx.lineTo(cx + size * 0.05, cy - size * 0.32);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawTopLeftQuadrant(
  ctx: CanvasRenderingContext2D,
  options: CornerHUDRenderOptions,
  scale: number,
  paddingX: number,
  paddingY: number,
  color: string,
): void {
  const { config, username } = options;
  const showLogo = config.showGitHubLogo;
  const showCategory = config.showCategoryLabel;
  const showUser = config.showUsername;

  if (!showLogo && !showCategory && !showUser) {
    return;
  }

  const iconSize = Math.round(18 * scale);
  const smallFontSize = Math.round(11 * scale);
  const largeFontSize = Math.round(18 * scale);
  const fontFamily = config.fontFamily || "monospace";

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  let currentX = paddingX;
  const topY = paddingY + iconSize / 2;

  if (showLogo) {
    drawOctocatIcon(ctx, currentX, paddingY, iconSize, color);
    currentX += iconSize + Math.round(8 * scale);
  }

  if (showCategory) {
    ctx.font = `600 ${smallFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText("GITHUB CONTRIBUTIONS", currentX, topY);
  }

  const dividerY = paddingY + iconSize + Math.round(8 * scale);
  const dividerWidth = Math.max(160 * scale, 140);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, 0.75 * scale);
  ctx.beginPath();
  ctx.moveTo(paddingX, dividerY);
  ctx.lineTo(paddingX + dividerWidth, dividerY);
  ctx.stroke();

  if (showUser) {
    ctx.globalAlpha = 1.0;
    ctx.font = `700 ${largeFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    const userY = dividerY + Math.round(8 * scale);
    ctx.fillText(username || "developer", paddingX, userY);
  }

  ctx.restore();
}

export function drawTopRightQuadrant(
  ctx: CanvasRenderingContext2D,
  options: CornerHUDRenderOptions,
  scale: number,
  paddingX: number,
  paddingY: number,
  color: string,
): void {
  const { config, year, totalContributions, width } = options;
  const showYear = config.showYear;
  const showTotal = config.showTotalCommits;

  if (!showYear && !showTotal) {
    return;
  }

  const smallFontSize = Math.round(12 * scale);
  const largeFontSize = Math.round(18 * scale);
  const fontFamily = config.fontFamily || "monospace";
  const rightX = width - paddingX;

  ctx.save();
  ctx.textAlign = "right";

  let currentY = paddingY;

  if (showYear) {
    ctx.font = `700 ${largeFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.fillText(String(year), rightX, currentY);
    currentY += largeFontSize + Math.round(8 * scale);
  } else {
    currentY += Math.round(20 * scale);
  }

  const dividerWidth = Math.max(140 * scale, 120);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, 0.75 * scale);
  ctx.beginPath();
  ctx.moveTo(rightX - dividerWidth, currentY);
  ctx.lineTo(rightX, currentY);
  ctx.stroke();

  if (showTotal) {
    ctx.globalAlpha = 1.0;
    ctx.font = `500 ${smallFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    const totalY = currentY + Math.round(8 * scale);
    const label = `${formatContributionNumber(totalContributions)} ${
      totalContributions === 1 ? "contribution" : "contributions"
    }`;
    ctx.fillText(label, rightX, totalY);
  }

  ctx.restore();
}

export function drawBottomLeftQuadrant(
  ctx: CanvasRenderingContext2D,
  options: CornerHUDRenderOptions,
  scale: number,
  paddingX: number,
  paddingY: number,
  color: string,
): void {
  const { config, height } = options;
  if (!config.showTagline) {
    return;
  }

  const largeFontSize = Math.round(16 * scale);
  const fontFamily = config.fontFamily || "monospace";
  const line1 = config.taglineLine1 || "SMALL STEPS";
  const line2 = config.taglineLine2 || "BUILD BIG THINGS";

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = color;

  const bottomY = height - paddingY;
  const dividerWidth = Math.max(140 * scale, 120);

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, 0.75 * scale);
  ctx.beginPath();
  ctx.moveTo(paddingX, bottomY);
  ctx.lineTo(paddingX + dividerWidth, bottomY);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
  ctx.font = `700 ${largeFontSize}px ${fontFamily}`;
  ctx.textBaseline = "bottom";

  const line2Y = bottomY - Math.round(8 * scale);
  const line1Y = line2Y - largeFontSize - Math.round(4 * scale);

  ctx.fillText(line2, paddingX, line2Y);
  ctx.fillText(line1, paddingX, line1Y);

  ctx.restore();
}

export function drawBottomRightQuadrant(
  ctx: CanvasRenderingContext2D,
  options: CornerHUDRenderOptions,
  scale: number,
  paddingX: number,
  paddingY: number,
  color: string,
): void {
  const { config, palette, width, height, weekdayLevels } = options;
  if (!config.showWeekdayLegend) {
    return;
  }

  const squareSize = Math.max(8, Math.round(11 * scale));
  const gap = Math.max(3, Math.round(4 * scale));
  const fontSize = Math.max(9, Math.round(11 * scale));
  const fontFamily = config.fontFamily || "monospace";
  const count = WEEKDAY_LETTERS.length;
  const totalWidth = count * squareSize + (count - 1) * gap;

  const startX = width - paddingX - totalWidth;
  const bottomY = height - paddingY;
  const squareY = bottomY - squareSize;
  const textY = squareY - Math.round(6 * scale);

  ctx.save();
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = color;

  const levels = weekdayLevels ?? DEFAULT_WEEKDAY_LEVEL_PATTERN;

  for (let i = 0; i < count; i++) {
    const letter = WEEKDAY_LETTERS[i];
    const cellX = startX + i * (squareSize + gap);
    const centerX = cellX + squareSize / 2;

    ctx.fillText(letter, centerX, textY);

    const levelIndex = levels[i] ?? 0;
    const cellColor = palette.levels[levelIndex] ?? palette.levels[0];
    const radius = Math.max(1, Math.round(squareSize * 0.22));

    drawRoundedCell(ctx, cellX, squareY, squareSize, radius, cellColor);
  }

  ctx.restore();
}

export function renderCornerHUD(options: CornerHUDRenderOptions): void {
  const { ctx, width, height, config, palette } = options;
  if (!config.showHUD) {
    return;
  }

  const scale = computeHudScale(width, height, options.hudScale);
  const paddingX = options.paddingX ?? Math.max(20, Math.round(width * 0.045));
  const paddingY = options.paddingY ?? Math.max(20, Math.round(height * 0.045));
  const color = config.hudColor || palette.textColor || "#ffffff";

  ctx.save();
  try {
    drawTopLeftQuadrant(ctx, options, scale, paddingX, paddingY, color);
    drawTopRightQuadrant(ctx, options, scale, paddingX, paddingY, color);
    drawBottomLeftQuadrant(ctx, options, scale, paddingX, paddingY, color);
    drawBottomRightQuadrant(ctx, options, scale, paddingX, paddingY, color);
  } finally {
    ctx.restore();
  }
}
