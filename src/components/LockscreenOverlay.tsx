import React from "react";
import {
  Wifi,
  Battery,
  Flashlight,
  Camera,
  Lock,
  Signal,
} from "lucide-react";

export type LockscreenStyle = "ios" | "android";

export interface LockscreenConfig {
  visible: boolean;
  style: LockscreenStyle;
  opacity: number;
  showSafeAreaGuides: boolean;
  customTime?: string;
  customDate?: string;
}

export const DEFAULT_LOCKSCREEN_CONFIG: LockscreenConfig = {
  visible: false,
  style: "ios",
  opacity: 0.85,
  showSafeAreaGuides: true,
};

export interface LockscreenOverlayProps {
  visible?: boolean;
  style?: LockscreenStyle;
  opacity?: number;
  showSafeAreaGuides?: boolean;
  customTime?: string;
  customDate?: string;
  className?: string;
}

export const LockscreenOverlay: React.FC<LockscreenOverlayProps> = ({
  visible = DEFAULT_LOCKSCREEN_CONFIG.visible,
  style = DEFAULT_LOCKSCREEN_CONFIG.style,
  opacity = DEFAULT_LOCKSCREEN_CONFIG.opacity,
  showSafeAreaGuides = DEFAULT_LOCKSCREEN_CONFIG.showSafeAreaGuides,
  customTime,
  customDate,
  className = "",
}) => {
  if (!visible) {
    return null;
  }

  const effectiveTime = customTime || "09:41";
  const effectiveDate = customDate || (
    style === "ios" ? "Quarta-feira, 5 de novembro" : "Qua., 5 de nov."
  );

  return (
    <div
      role="region"
      aria-label="Simulador de Lockscreen"
      data-testid="lockscreen-overlay"
      className={`pointer-events-none absolute inset-0 flex flex-col justify-between select-none overflow-hidden text-white font-sans ${className}`}
      style={{ opacity }}
    >
      <div className="relative pt-3 px-6 flex flex-col items-center">
        {showSafeAreaGuides && (
          <div
            data-testid="lockscreen-safe-area-top"
            className="absolute top-0 left-0 right-0 h-44 border-b border-dashed border-neon-emerald/40 bg-neon-emerald/5 flex items-start justify-end p-1.5"
          >
            <span className="text-[10px] font-mono tracking-wider text-neon-emerald uppercase bg-black/60 px-1.5 py-0.5 rounded border border-neon-emerald/30">
              Safe Area Top
            </span>
          </div>
        )}

        <div
          data-testid="lockscreen-status-bar"
          className="w-full flex items-center justify-between text-xs font-semibold tracking-tight relative z-10"
        >
          {style === "ios" ? (
            <>
              <span className="w-14 text-center font-semibold text-sm">
                {effectiveTime}
              </span>
              <div
                data-testid="lockscreen-dynamic-island"
                className="w-28 h-7 bg-black rounded-full border border-neutral-800 flex items-center justify-between px-3 shadow-inner"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
                <span className="w-2 h-2 rounded-full bg-neutral-950" />
              </div>
              <div className="w-14 flex items-center justify-end gap-1.5 text-neutral-200">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{effectiveTime}</span>
              </div>
              <div
                data-testid="lockscreen-punch-hole"
                className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner"
              />
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Wifi className="w-3.5 h-3.5" />
                <Signal className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center text-center relative z-10">
          {style === "ios" ? (
            <>
              <span
                data-testid="lockscreen-date"
                className="text-sm font-medium tracking-wide text-neutral-200 drop-shadow-sm mb-1"
              >
                {effectiveDate}
              </span>
              <h1
                data-testid="lockscreen-clock"
                className="text-6xl sm:text-7xl font-semibold tracking-tighter text-white drop-shadow-lg leading-none"
              >
                {effectiveTime}
              </h1>
            </>
          ) : (
            <>
              <h1
                data-testid="lockscreen-clock"
                className="text-6xl sm:text-7xl font-light tracking-tight text-white drop-shadow-lg leading-none"
              >
                {effectiveTime}
              </h1>
              <span
                data-testid="lockscreen-date"
                className="text-sm font-normal tracking-wide text-neutral-300 drop-shadow-sm mt-2"
              >
                {effectiveDate}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="relative pb-4 px-6 flex flex-col items-center">
        {showSafeAreaGuides && (
          <div
            data-testid="lockscreen-safe-area-bottom"
            className="absolute bottom-0 left-0 right-0 h-28 border-t border-dashed border-neon-emerald/40 bg-neon-emerald/5 flex items-end justify-start p-1.5"
          >
            <span className="text-[10px] font-mono tracking-wider text-neon-emerald uppercase bg-black/60 px-1.5 py-0.5 rounded border border-neon-emerald/30">
              Safe Area Bottom
            </span>
          </div>
        )}

        <div className="w-full relative z-10">
          {style === "ios" ? (
            <div className="w-full flex items-center justify-between mb-6 px-4">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Lanterna"
                data-testid="lockscreen-flashlight-btn"
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg"
              >
                <Flashlight className="w-5 h-5" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Camera"
                data-testid="lockscreen-camera-btn"
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center mb-4 gap-1.5">
              <div
                data-testid="lockscreen-lock-icon"
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-neutral-300 shadow"
              >
                <Lock className="w-4 h-4" />
              </div>
              <span
                data-testid="lockscreen-swipe-text"
                className="text-xs text-neutral-300 font-light tracking-wide"
              >
                Deslize para cima para desbloquear
              </span>
            </div>
          )}

          <div
            data-testid="lockscreen-home-bar"
            className={
              style === "ios"
                ? "w-36 h-1.5 bg-white/90 rounded-full mx-auto shadow-sm"
                : "w-28 h-1 bg-white/70 rounded-full mx-auto shadow-sm"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LockscreenOverlay;
