import React, { useCallback, useMemo } from "react";
import type { DayContribution, ColorPalette, UserContributionData } from "../types/contributions";
import type { WallpaperConfig } from "../types/wallpaper";
import { useCanvas } from "../hooks/useCanvas";
import type { CanvasFrameInfo } from "../hooks/useCanvas";
import { clearCanvas } from "../engine/canvasContext";
import { renderMatrixStream } from "../engine/matrixStreamModel";
import { renderTopographicWave } from "../engine/topographicWaveModel";
import { renderFibonacciSpiral } from "../engine/fibonacciSpiralModel";
import { renderCornerHUD } from "../engine/cornerHudRenderer";
import { renderNoiseOverlay } from "../engine/noiseGenerator";
import { drawCellWithBloom } from "../engine/cellRenderer";

export interface RenderStandardGridOptions {
  days: DayContribution[];
  canvasWidth: number;
  canvasHeight: number;
  cellSize: number;
  cellGap: number;
  borderRadius: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  palette: ColorPalette;
  enableBloom: boolean;
  bloomIntensity: number;
  dpr: number;
  isMobile?: boolean;
}

export function renderStandardGrid(
  ctx: CanvasRenderingContext2D,
  options: RenderStandardGridOptions,
): void {
  const {
    days,
    canvasWidth,
    canvasHeight,
    cellSize,
    cellGap,
    borderRadius,
    scale,
    offsetX,
    offsetY,
    palette,
    enableBloom,
    bloomIntensity,
    dpr,
    isMobile = false,
  } = options;

  const columns = isMobile ? 14 : 53;
  const rows = isMobile ? Math.ceil(days.length / columns) : 7;

  const effectiveCellSize = Math.max(2, cellSize * scale);
  const effectiveGap = Math.max(0, cellGap * scale);

  const gridWidth = columns * effectiveCellSize + (columns - 1) * effectiveGap;
  const gridHeight = rows * effectiveCellSize + (rows - 1) * effectiveGap;

  const startX = (canvasWidth - gridWidth) / 2 + offsetX;
  const startY = (canvasHeight - gridHeight) / 2 + offsetY;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    let col: number;
    let row: number;

    if (isMobile) {
      col = i % columns;
      row = Math.floor(i / columns);
    } else {
      col = Math.floor(i / 7);
      row = i % 7;
    }

    const cellX = startX + col * (effectiveCellSize + effectiveGap);
    const cellY = startY + row * (effectiveCellSize + effectiveGap);
    const color = palette.levels[day.level] ?? palette.levels[0];
    const scaledRadius = Math.min(effectiveCellSize / 2, borderRadius * scale);

    drawCellWithBloom(ctx, {
      x: cellX,
      y: cellY,
      width: effectiveCellSize,
      height: effectiveCellSize,
      radius: scaledRadius,
      color,
      level: day.level,
      glowColor: palette.glowColor,
      enableBloom,
      bloomIntensity,
      dpr,
    });
  }
}

export interface CanvasPreviewProps {
  data: UserContributionData | null;
  config: WallpaperConfig;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onRenderComplete?: () => void;
  style?: React.CSSProperties;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  data,
  config,
  isLoading = false,
  error = null,
  className = "",
  onRenderComplete,
  style,
}) => {
  const width = config.device.width;
  const height = config.device.height;

  const drawWallpaper = useCallback(
    (ctx: CanvasRenderingContext2D, frameInfo: CanvasFrameInfo): void => {
      clearCanvas(ctx, frameInfo.width, frameInfo.height, config.palette.background);

      if (data && data.days.length > 0) {
        const isMobileDevice =
          config.device.category === "mobile" || frameInfo.height > frameInfo.width;

        switch (config.model) {
          case "matrix-stream":
            renderMatrixStream(ctx, {
              layoutOptions: {
                days: data.days,
                params: config.matrixStream,
                canvasWidth: frameInfo.width,
                canvasHeight: frameInfo.height,
                cellSize: config.cellSize,
                cellGap: config.cellGap,
                scale: config.scale,
                offsetX: config.offsetX,
                offsetY: config.offsetY,
              },
              palette: config.palette,
              borderRadius: config.borderRadius,
              enableBloom: config.enableBloom,
              bloomIntensity: config.bloomIntensity,
              dpr: frameInfo.dpr,
            });
            break;

          case "topographic-wave":
            renderTopographicWave(ctx, {
              layoutOptions: {
                days: data.days,
                params: config.topographicWave,
                canvasWidth: frameInfo.width,
                canvasHeight: frameInfo.height,
                cellSize: config.cellSize,
                cellGap: config.cellGap,
                scale: config.scale,
                offsetX: config.offsetX,
                offsetY: config.offsetY,
              },
              palette: config.palette,
              borderRadius: config.borderRadius,
              enableBloom: config.enableBloom,
              bloomIntensity: config.bloomIntensity,
              dpr: frameInfo.dpr,
            });
            break;

          case "fibonacci-spiral":
            renderFibonacciSpiral(ctx, {
              layoutOptions: {
                days: data.days,
                params: config.fibonacciSpiral,
                canvasWidth: frameInfo.width,
                canvasHeight: frameInfo.height,
                cellSize: config.cellSize,
                cellGap: config.cellGap,
                scale: config.scale,
                offsetX: config.offsetX,
                offsetY: config.offsetY,
              },
              palette: config.palette,
              borderRadius: config.borderRadius,
              enableBloom: config.enableBloom,
              bloomIntensity: config.bloomIntensity,
              dpr: frameInfo.dpr,
            });
            break;

          case "standard-grid":
          default:
            renderStandardGrid(ctx, {
              days: data.days,
              canvasWidth: frameInfo.width,
              canvasHeight: frameInfo.height,
              cellSize: config.cellSize,
              cellGap: config.cellGap,
              borderRadius: config.borderRadius,
              scale: config.scale,
              offsetX: config.offsetX,
              offsetY: config.offsetY,
              palette: config.palette,
              enableBloom: config.enableBloom,
              bloomIntensity: config.bloomIntensity,
              dpr: frameInfo.dpr,
              isMobile: isMobileDevice,
            });
            break;
        }
      }

      if (config.enableGrain && config.grainOpacity > 0) {
        renderNoiseOverlay(ctx, frameInfo.width, frameInfo.height, {
          enableGrain: true,
          grainOpacity: config.grainOpacity,
        });
      }

      if (config.hud.showHUD && data) {
        renderCornerHUD({
          ctx,
          width: frameInfo.width,
          height: frameInfo.height,
          dpr: frameInfo.dpr,
          config: config.hud,
          username: data.username,
          year: data.year,
          totalContributions: data.totalContributions,
          palette: config.palette,
        });
      }
    },
    [config, data],
  );

  const { canvasRef } = useCanvas({
    draw: drawWallpaper,
    width,
    height,
    autoClear: true,
    backgroundColor: config.palette.background,
    onRenderComplete,
    dependencies: [config, data],
  });

  const aspectRatioStyle = useMemo((): React.CSSProperties => {
    return {
      aspectRatio: `${width} / ${height}`,
      maxHeight: "100%",
      maxWidth: "100%",
    };
  }, [width, height]);

  return (
    <div
      data-testid="canvas-preview-container"
      className={`relative flex items-center justify-center w-full h-full overflow-hidden select-none bg-black/40 ${className}`}
      style={style}
    >
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={aspectRatioStyle}
      >
        <canvas
          ref={canvasRef}
          data-testid="wallpaper-canvas"
          aria-label="Preview do Wallpaper de Contribuicoes"
          className="w-full h-full object-contain rounded-md shadow-2xl"
        />

        {isLoading && (
          <div
            data-testid="loading-indicator"
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-md transition-opacity"
            role="status"
          >
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono tracking-wider text-emerald-400">
              CARREGANDO DADOS...
            </span>
          </div>
        )}

        {error && (
          <div
            data-testid="error-banner"
            className="absolute inset-x-4 bottom-4 p-3 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs font-mono shadow-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        {!data && !isLoading && !error && (
          <div
            data-testid="empty-indicator"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-xs font-mono tracking-wider text-zinc-500 px-4 py-2 rounded bg-zinc-900/60 border border-zinc-800">
              AGUARDANDO DADOS DE CONTRIBUICOES
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPreview;
