import React from "react";
import type { LockscreenConfig, LockscreenStyle } from "./LockscreenOverlay";
import {
  Smartphone,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
} from "lucide-react";

export interface ToolbarProps {
  lockscreen: LockscreenConfig;
  onLockscreenChange: (updatedConfig: LockscreenConfig) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onResetZoom?: () => void;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  lockscreen,
  onLockscreenChange,
  zoom = 1,
  onZoomChange,
  onResetZoom,
  className = "",
}) => {
  const handleToggleVisible = () => {
    onLockscreenChange({
      ...lockscreen,
      visible: !lockscreen.visible,
    });
  };

  const handleStyleChange = (style: LockscreenStyle) => {
    onLockscreenChange({
      ...lockscreen,
      style,
    });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFloat(e.target.value);
    const normalized = Math.max(0, Math.min(1, rawValue / 100));
    onLockscreenChange({
      ...lockscreen,
      opacity: normalized,
    });
  };

  const handleToggleSafeArea = () => {
    onLockscreenChange({
      ...lockscreen,
      showSafeAreaGuides: !lockscreen.showSafeAreaGuides,
    });
  };

  const handleZoomIn = () => {
    if (onZoomChange) {
      const nextZoom = Math.min(3, Math.round((zoom + 0.1) * 10) / 10);
      onZoomChange(nextZoom);
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      const nextZoom = Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10);
      onZoomChange(nextZoom);
    }
  };

  const opacityPercentage = Math.round(lockscreen.opacity * 100);

  return (
    <div
      role="toolbar"
      aria-label="Barra de Ferramentas de Visualizacao"
      data-testid="visualization-toolbar"
      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-oled-surface border border-oled-border text-xs text-oled-muted select-none ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={lockscreen.visible}
          aria-label="Alternar Simulador de Lockscreen"
          data-testid="toolbar-lockscreen-toggle"
          onClick={handleToggleVisible}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            lockscreen.visible
              ? "bg-neon-emerald/10 border-neon-emerald text-neon-emerald"
              : "bg-oled-dark border-oled-border text-oled-muted hover:text-white hover:border-neutral-700"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulador de Lockscreen</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              lockscreen.visible ? "bg-neon-emerald animate-pulse" : "bg-neutral-600"
            }`}
          />
        </button>

        {lockscreen.visible && (
          <div
            data-testid="toolbar-lockscreen-options"
            className="flex items-center gap-2 pl-2 border-l border-oled-border/60"
          >
            <div
              role="group"
              aria-label="Estilo do Dispositivo"
              className="flex items-center p-0.5 rounded-lg bg-oled-dark border border-oled-border"
            >
              <button
                type="button"
                aria-pressed={lockscreen.style === "ios"}
                aria-label="Estilo iOS"
                data-testid="toolbar-style-ios"
                onClick={() => handleStyleChange("ios")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wide transition-colors ${
                  lockscreen.style === "ios"
                    ? "bg-oled-surface text-white font-semibold shadow-sm"
                    : "text-oled-muted hover:text-white"
                }`}
              >
                iOS
              </button>
              <button
                type="button"
                aria-pressed={lockscreen.style === "android"}
                aria-label="Estilo Android"
                data-testid="toolbar-style-android"
                onClick={() => handleStyleChange("android")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wide transition-colors ${
                  lockscreen.style === "android"
                    ? "bg-oled-surface text-white font-semibold shadow-sm"
                    : "text-oled-muted hover:text-white"
                }`}
              >
                Android
              </button>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-oled-dark border border-oled-border">
              <label
                htmlFor="lockscreen-opacity-slider"
                className="text-[11px] font-mono text-oled-muted"
              >
                Opacidade
              </label>
              <input
                id="lockscreen-opacity-slider"
                type="range"
                min={0}
                max={100}
                step={5}
                value={opacityPercentage}
                onChange={handleOpacityChange}
                aria-label="Opacidade do Simulador de Lockscreen"
                data-testid="toolbar-opacity-slider"
                className="w-16 h-1 accent-neon-emerald bg-neutral-800 rounded cursor-pointer"
              />
              <span className="font-mono text-[10px] text-neutral-300 w-7 text-right">
                {opacityPercentage}%
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={lockscreen.showSafeAreaGuides}
              aria-label="Alternar Guias de Safe Area"
              data-testid="toolbar-safe-area-toggle"
              onClick={handleToggleSafeArea}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                lockscreen.showSafeAreaGuides
                  ? "bg-oled-surface border-neon-emerald/50 text-neon-emerald"
                  : "bg-oled-dark border-oled-border text-oled-muted hover:text-white"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Safe Area</span>
            </button>
          </div>
        )}
      </div>

      {(onZoomChange || onResetZoom) && (
        <div
          data-testid="toolbar-zoom-controls"
          className="flex items-center gap-1.5 pl-2 border-l border-oled-border/60"
        >
          {onZoomChange && (
            <>
              <button
                type="button"
                aria-label="Diminuir Zoom"
                data-testid="toolbar-zoom-out"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1 rounded bg-oled-dark border border-oled-border hover:text-white hover:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span
                data-testid="toolbar-zoom-display"
                className="font-mono text-[11px] text-neutral-300 min-w-[40px] text-center"
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Aumentar Zoom"
                data-testid="toolbar-zoom-in"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1 rounded bg-oled-dark border border-oled-border hover:text-white hover:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {onResetZoom && (
            <button
              type="button"
              aria-label="Restaurar Zoom"
              data-testid="toolbar-zoom-reset"
              onClick={onResetZoom}
              className="p-1 rounded bg-oled-dark border border-oled-border hover:text-white hover:border-neutral-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
