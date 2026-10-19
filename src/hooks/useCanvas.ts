import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import {
  setupHighDPICanvas,
  clearCanvas,
  getDevicePixelRatio,
} from "../engine/canvasContext";

export interface CanvasFrameInfo {
  width: number;
  height: number;
  dpr: number;
  frameCount: number;
  timestamp: number;
}

export type CanvasDrawFunction = (
  ctx: CanvasRenderingContext2D,
  frameInfo: CanvasFrameInfo,
) => void;

export interface UseCanvasOptions {
  draw: CanvasDrawFunction;
  width: number;
  height: number;
  dpr?: number;
  enabled?: boolean;
  autoClear?: boolean;
  backgroundColor?: string;
  canvasRef?: RefObject<HTMLCanvasElement>;
  onRenderComplete?: () => void;
  dependencies?: unknown[];
}

export interface UseCanvasReturn {
  canvasRef: RefObject<HTMLCanvasElement>;
  requestRender: () => void;
  getFrameCount: () => number;
}

export function useCanvas(options: UseCanvasOptions): UseCanvasReturn {
  const {
    draw,
    width,
    height,
    dpr,
    enabled = true,
    autoClear = false,
    backgroundColor,
    canvasRef: externalCanvasRef,
    onRenderComplete,
    dependencies = [draw],
  } = options;

  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = externalCanvasRef ?? fallbackCanvasRef;

  const frameIdRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const drawRef = useRef<CanvasDrawFunction>(draw);
  drawRef.current = draw;

  const onRenderCompleteRef = useRef<(() => void) | undefined>(onRenderComplete);
  onRenderCompleteRef.current = onRenderComplete;

  const cancelPendingFrame = useCallback((): void => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  }, []);

  const requestRender = useCallback((): void => {
    if (!enabled) {
      cancelPendingFrame();
      return;
    }

    if (frameIdRef.current !== null) {
      return;
    }

    frameIdRef.current = requestAnimationFrame((timestamp) => {
      frameIdRef.current = null;

      if (!isMountedRef.current) {
        return;
      }

      const canvas = activeCanvasRef.current;
      if (!canvas) {
        return;
      }

      const effectiveDpr = getDevicePixelRatio(dpr);
      const ctx = setupHighDPICanvas(canvas, width, height, effectiveDpr);

      if (autoClear) {
        clearCanvas(ctx, width, height, backgroundColor);
      }

      frameCountRef.current += 1;
      const frameInfo: CanvasFrameInfo = {
        width,
        height,
        dpr: effectiveDpr,
        frameCount: frameCountRef.current,
        timestamp,
      };

      drawRef.current(ctx, frameInfo);

      if (typeof onRenderCompleteRef.current === "function") {
        onRenderCompleteRef.current();
      }
    });
  }, [
    enabled,
    cancelPendingFrame,
    activeCanvasRef,
    dpr,
    width,
    height,
    autoClear,
    backgroundColor,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      requestRender();
    } else {
      cancelPendingFrame();
    }

    return () => {
      isMountedRef.current = false;
      cancelPendingFrame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, requestRender, cancelPendingFrame, ...dependencies]);

  const getFrameCount = useCallback((): number => {
    return frameCountRef.current;
  }, []);

  return {
    canvasRef: activeCanvasRef,
    requestRender,
    getFrameCount,
  };
}
