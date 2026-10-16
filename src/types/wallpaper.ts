import type { ColorPalette, DeviceDimensions } from "./contributions";

export type LayoutModel =
  | "matrix-stream"
  | "topographic-wave"
  | "fibonacci-spiral"
  | "standard-grid";

export interface MatrixStreamParams {
  tiltAngle: number;
  columnWidth: number;
  scatterFactor: number;
  verticalStagger: number;
}

export interface TopographicWaveParams {
  waveAmplitude: number;
  waveFrequencyX: number;
  waveFrequencyZ: number;
  perspectiveFocal: number;
  cameraPitch: number;
  depthFogStart: number;
  elevationMultiplier: number;
}

export interface FibonacciSpiralParams {
  spiralTightness: number;
  innerRadius: number;
  outerRadiusScale: number;
  cellRotation: boolean;
  angularStep: "archimedean" | "golden-ratio";
}

export interface CornerHUDConfig {
  showHUD: boolean;
  showGitHubLogo: boolean;
  showCategoryLabel: boolean;
  showUsername: boolean;
  showYear: boolean;
  showTotalCommits: boolean;
  showTagline: boolean;
  taglineLine1: string;
  taglineLine2: string;
  showWeekdayLegend: boolean;
  hudColor: string;
  fontFamily: string;
}

export interface WallpaperConfig {
  device: DeviceDimensions;
  model: LayoutModel;
  cellSize: number;
  cellGap: number;
  borderRadius: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  palette: ColorPalette;
  enableBloom: boolean;
  bloomIntensity: number;
  enableGrain: boolean;
  grainOpacity: number;
  matrixStream: MatrixStreamParams;
  topographicWave: TopographicWaveParams;
  fibonacciSpiral: FibonacciSpiralParams;
  hud: CornerHUDConfig;
}
