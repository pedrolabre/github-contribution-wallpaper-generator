export interface HighDPICanvasOptions {
  width: number;
  height: number;
  dpr?: number;
}

export function getDevicePixelRatio(customDpr?: number): number {
  if (typeof customDpr === "number" && customDpr > 0) {
    return customDpr;
  }
  if (typeof window !== "undefined" && window.devicePixelRatio) {
    return window.devicePixelRatio;
  }
  return 1;
}

export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr?: number,
): CanvasRenderingContext2D {
  const effectiveDpr = getDevicePixelRatio(dpr);

  canvas.width = Math.round(width * effectiveDpr);
  canvas.height = Math.round(height * effectiveDpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas");
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(effectiveDpr, effectiveDpr);

  return ctx;
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor?: string,
): void {
  if (backgroundColor) {
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  ctx.clearRect(0, 0, width, height);
}

export function resetCanvasTransform(
  ctx: CanvasRenderingContext2D,
  dpr = 1,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (dpr !== 1) {
    ctx.scale(dpr, dpr);
  }
}
