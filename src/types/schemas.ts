import { z } from "zod";
import type {
  DayContribution,
  UserContributionData,
} from "./contributions";
import type {
  WallpaperConfig,
} from "./wallpaper";

export const contributionLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const dayContributionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().min(0),
  level: contributionLevelSchema,
  weekday: z.number().int().min(0).max(6),
  dayOfYear: z.number().int().min(1).max(366),
});

export const userContributionDataSchema = z.object({
  username: z.string().min(1),
  year: z.union([z.number().int().min(2008), z.literal("last365")]),
  totalContributions: z.number().int().min(0),
  days: z.array(dayContributionSchema),
});

export const deviceDimensionsSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: z.enum(["mobile", "desktop", "tablet", "ultrawide"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.string().min(1),
});

export const colorPaletteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  background: z.string().min(1),
  levels: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  textColor: z.string().min(1),
  glowColor: z.string().min(1),
});

export const layoutModelSchema = z.enum([
  "matrix-stream",
  "topographic-wave",
  "fibonacci-spiral",
  "standard-grid",
]);

export const matrixStreamParamsSchema = z.object({
  tiltAngle: z.number().min(-45).max(45),
  columnWidth: z.number().positive(),
  scatterFactor: z.number().min(0).max(1),
  verticalStagger: z.number(),
});

export const topographicWaveParamsSchema = z.object({
  waveAmplitude: z.number().min(0),
  waveFrequencyX: z.number().positive(),
  waveFrequencyZ: z.number().positive(),
  perspectiveFocal: z.number().positive(),
  cameraPitch: z.number(),
  depthFogStart: z.number().min(0).max(1),
  elevationMultiplier: z.number().min(0),
});

export const fibonacciSpiralParamsSchema = z.object({
  spiralTightness: z.number().positive(),
  innerRadius: z.number().min(0),
  outerRadiusScale: z.number().positive(),
  cellRotation: z.boolean(),
  angularStep: z.enum(["archimedean", "golden-ratio"]),
});

export const cornerHUDConfigSchema = z.object({
  showHUD: z.boolean(),
  showGitHubLogo: z.boolean(),
  showCategoryLabel: z.boolean(),
  showUsername: z.boolean(),
  showYear: z.boolean(),
  showTotalCommits: z.boolean(),
  showTagline: z.boolean(),
  taglineLine1: z.string(),
  taglineLine2: z.string(),
  showWeekdayLegend: z.boolean(),
  hudColor: z.string().min(1),
  fontFamily: z.string().min(1),
});

export const wallpaperConfigSchema = z.object({
  device: deviceDimensionsSchema,
  model: layoutModelSchema,
  cellSize: z.number().min(4).max(64),
  cellGap: z.number().min(0).max(30),
  borderRadius: z.number().min(0),
  offsetX: z.number(),
  offsetY: z.number(),
  scale: z.number().min(0.1).max(10),
  palette: colorPaletteSchema,
  enableBloom: z.boolean(),
  bloomIntensity: z.number().min(0),
  enableGrain: z.boolean(),
  grainOpacity: z.number().min(0).max(1),
  matrixStream: matrixStreamParamsSchema,
  topographicWave: topographicWaveParamsSchema,
  fibonacciSpiral: fibonacciSpiralParamsSchema,
  hud: cornerHUDConfigSchema,
});

export type DayContributionSchema = z.infer<typeof dayContributionSchema>;
export type UserContributionDataSchema = z.infer<typeof userContributionDataSchema>;
export type DeviceDimensionsSchema = z.infer<typeof deviceDimensionsSchema>;
export type ColorPaletteSchema = z.infer<typeof colorPaletteSchema>;
export type LayoutModelSchema = z.infer<typeof layoutModelSchema>;
export type MatrixStreamParamsSchema = z.infer<typeof matrixStreamParamsSchema>;
export type TopographicWaveParamsSchema = z.infer<typeof topographicWaveParamsSchema>;
export type FibonacciSpiralParamsSchema = z.infer<typeof fibonacciSpiralParamsSchema>;
export type CornerHUDConfigSchema = z.infer<typeof cornerHUDConfigSchema>;
export type WallpaperConfigSchema = z.infer<typeof wallpaperConfigSchema>;

export function parseWallpaperConfig(input: unknown): WallpaperConfig {
  return wallpaperConfigSchema.parse(input);
}

export function safeParseWallpaperConfig(input: unknown) {
  return wallpaperConfigSchema.safeParse(input);
}

export function parseUserContributionData(input: unknown): UserContributionData {
  return userContributionDataSchema.parse(input);
}

export function safeParseUserContributionData(input: unknown) {
  return userContributionDataSchema.safeParse(input);
}

export function parseDayContribution(input: unknown): DayContribution {
  return dayContributionSchema.parse(input);
}

export function safeParseDayContribution(input: unknown) {
  return dayContributionSchema.safeParse(input);
}
