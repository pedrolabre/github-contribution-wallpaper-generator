export interface NoiseGeneratorOptions {
  seed?: number;
  monochrome?: boolean;
}

export interface RenderNoiseOptions {
  enableGrain?: boolean;
  grainOpacity?: number;
  seed?: number;
  tileSize?: number;
  compositeOperation?: GlobalCompositeOperation;
  createTileCanvas?: (
    width: number,
    height: number,
  ) => {
    canvas: unknown;
    ctx: unknown;
  } | null;
}

export const DEFAULT_GRAIN_OPACITY = 0.03;
export const DEFAULT_GRAIN_SEED = 1337;
export const DEFAULT_GRAIN_TILE_SIZE = 256;

export function createLinearCongruentialGenerator(
  seed: number = DEFAULT_GRAIN_SEED,
): () => number {
  let state = (seed >>> 0) || 1;
  const a = 1664525;
  const c = 1013904223;
  const m = 4294967296;

  return function next(): number {
    state = (Math.imul(a, state) + c) >>> 0;
    return state / m;
  };
}

export function generateNoisePixels(
  width: number,
  height: number,
  options?: NoiseGeneratorOptions,
): Uint8ClampedArray {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));
  const totalPixels = safeWidth * safeHeight;
  const buffer = new Uint8ClampedArray(totalPixels * 4);

  const rng = createLinearCongruentialGenerator(options?.seed ?? DEFAULT_GRAIN_SEED);
  const isMonochrome = options?.monochrome !== false;

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    if (isMonochrome) {
      const luminance = Math.floor(rng() * 256);
      buffer[offset] = luminance;
      buffer[offset + 1] = luminance;
      buffer[offset + 2] = luminance;
    } else {
      buffer[offset] = Math.floor(rng() * 256);
      buffer[offset + 1] = Math.floor(rng() * 256);
      buffer[offset + 2] = Math.floor(rng() * 256);
    }
    buffer[offset + 3] = 255;
  }

  return buffer;
}

export function createNoiseImageData(
  width: number,
  height: number,
  options?: NoiseGeneratorOptions,
  ctx?: CanvasRenderingContext2D,
): ImageData {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeHeight = Math.max(1, Math.floor(height));
  const pixels = generateNoisePixels(safeWidth, safeHeight, options);

  if (ctx && typeof ctx.createImageData === "function") {
    const imageData = ctx.createImageData(safeWidth, safeHeight);
    imageData.data.set(pixels);
    return imageData;
  }

  if (typeof ImageData !== "undefined") {
    return new ImageData(pixels as unknown as ImageData["data"], safeWidth, safeHeight);
  }

  return {
    width: safeWidth,
    height: safeHeight,
    data: pixels,
    colorSpace: "srgb",
  } as ImageData;
}

export function renderNoiseOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options?: RenderNoiseOptions,
): void {
  const enableGrain = options?.enableGrain ?? true;
  if (!enableGrain) {
    return;
  }

  const rawOpacity = options?.grainOpacity ?? DEFAULT_GRAIN_OPACITY;
  if (rawOpacity <= 0) {
    return;
  }
  const opacity = Math.min(1, Math.max(0, rawOpacity));

  const tileSize = Math.max(16, options?.tileSize ?? DEFAULT_GRAIN_TILE_SIZE);
  const tileWidth = Math.min(width, tileSize);
  const tileHeight = Math.min(height, tileSize);

  let tileCanvas: CanvasImageSource | unknown = null;
  let tileCtx: { putImageData?: (data: ImageData, x: number, y: number) => void } | null = null;

  if (typeof options?.createTileCanvas === "function") {
    const custom = options.createTileCanvas(tileWidth, tileHeight);
    if (custom) {
      tileCanvas = custom.canvas;
      tileCtx = custom.ctx as { putImageData?: (data: ImageData, x: number, y: number) => void };
    }
  } else if (typeof OffscreenCanvas !== "undefined") {
    const offscreen = new OffscreenCanvas(tileWidth, tileHeight);
    tileCanvas = offscreen;
    tileCtx = offscreen.getContext("2d");
  } else if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = tileWidth;
    canvas.height = tileHeight;
    tileCanvas = canvas;
    tileCtx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  const noiseData = createNoiseImageData(tileWidth, tileHeight, {
    seed: options?.seed ?? DEFAULT_GRAIN_SEED,
    monochrome: true,
  }, tileCtx as CanvasRenderingContext2D | undefined);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = options?.compositeOperation ?? "screen";

  if (tileCtx && tileCanvas && typeof tileCtx.putImageData === "function") {
    tileCtx.putImageData(noiseData, 0, 0);

    let pattern: CanvasPattern | null = null;
    if (typeof ctx.createPattern === "function") {
      pattern = ctx.createPattern(tileCanvas as CanvasImageSource, "repeat");
    }

    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    } else if (typeof ctx.drawImage === "function") {
      for (let x = 0; x < width; x += tileWidth) {
        for (let y = 0; y < height; y += tileHeight) {
          ctx.drawImage(tileCanvas as CanvasImageSource, x, y);
        }
      }
    }
  }

  ctx.restore();
}
