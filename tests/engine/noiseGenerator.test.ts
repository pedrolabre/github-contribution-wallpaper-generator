import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DEFAULT_GRAIN_OPACITY,
  DEFAULT_GRAIN_SEED,
  DEFAULT_GRAIN_TILE_SIZE,
  createLinearCongruentialGenerator,
  generateNoisePixels,
  createNoiseImageData,
  renderNoiseOverlay,
} from "../../src/engine/noiseGenerator";

describe("noiseGenerator", () => {
  describe("constantes padrao", () => {
    it("expoe constantes canonicas esperadas", () => {
      expect(DEFAULT_GRAIN_OPACITY).toBe(0.03);
      expect(DEFAULT_GRAIN_SEED).toBe(1337);
      expect(DEFAULT_GRAIN_TILE_SIZE).toBe(256);
    });
  });

  describe("createLinearCongruentialGenerator", () => {
    it("gera valores normalizados no intervalo [0, 1)", () => {
      const rng = createLinearCongruentialGenerator(42);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it("e 100% deterministico para a mesma semente", () => {
      const rng1 = createLinearCongruentialGenerator(999);
      const rng2 = createLinearCongruentialGenerator(999);

      const seq1 = Array.from({ length: 50 }, () => rng1());
      const seq2 = Array.from({ length: 50 }, () => rng2());

      expect(seq1).toEqual(seq2);
    });

    it("gera sequencias distintas para sementes diferentes", () => {
      const rng1 = createLinearCongruentialGenerator(101);
      const rng2 = createLinearCongruentialGenerator(202);

      const seq1 = Array.from({ length: 20 }, () => rng1());
      const seq2 = Array.from({ length: 20 }, () => rng2());

      expect(seq1).not.toEqual(seq2);
    });

    it("utiliza a semente padrao quando omitida ou zero", () => {
      const rngDefault = createLinearCongruentialGenerator();
      const rngExplicit = createLinearCongruentialGenerator(DEFAULT_GRAIN_SEED);

      expect(rngDefault()).toBe(rngExplicit());
    });
  });

  describe("generateNoisePixels", () => {
    it("gera buffer com tamanho compativel com largura e altura", () => {
      const buffer = generateNoisePixels(10, 10);
      expect(buffer).toBeInstanceOf(Uint8ClampedArray);
      expect(buffer.length).toBe(10 * 10 * 4);
    });

    it("produz canais R, G e B identicos no modo monocromatico padrao", () => {
      const buffer = generateNoisePixels(8, 8, { monochrome: true });
      for (let i = 0; i < buffer.length; i += 4) {
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];

        expect(r).toBe(g);
        expect(g).toBe(b);
        expect(a).toBe(255);
      }
    });

    it("permite geracao policromatica quando monochrome e falso", () => {
      const buffer = generateNoisePixels(16, 16, { monochrome: false, seed: 1234 });
      let hasDifference = false;

      for (let i = 0; i < buffer.length; i += 4) {
        if (buffer[i] !== buffer[i + 1] || buffer[i + 1] !== buffer[i + 2]) {
          hasDifference = true;
          break;
        }
      }

      expect(hasDifference).toBe(true);
    });

    it("gera buffers identicos para a mesma configuracao e semente", () => {
      const buf1 = generateNoisePixels(12, 12, { seed: 777 });
      const buf2 = generateNoisePixels(12, 12, { seed: 777 });

      expect(buf1).toEqual(buf2);
    });

    it("trata dimensoes fracionarias ou menores que 1 com seguranca", () => {
      const buffer = generateNoisePixels(0, -5);
      expect(buffer.length).toBe(1 * 1 * 4);
    });
  });

  describe("createNoiseImageData", () => {
    it("retorna estrutura ImageData valida", () => {
      const imgData = createNoiseImageData(20, 15);
      expect(imgData.width).toBe(20);
      expect(imgData.height).toBe(15);
      expect(imgData.data.length).toBe(20 * 15 * 4);
    });

    it("utiliza ctx.createImageData quando fornecido", () => {
      const mockSet = vi.fn();
      const mockCtx = {
        createImageData: vi.fn().mockReturnValue({
          width: 10,
          height: 10,
          data: { set: mockSet },
        }),
      } as unknown as CanvasRenderingContext2D;

      const result = createNoiseImageData(10, 10, undefined, mockCtx);
      expect(mockCtx.createImageData).toHaveBeenCalledWith(10, 10);
      expect(mockSet).toHaveBeenCalled();
      expect(result.width).toBe(10);
    });
  });

  describe("renderNoiseOverlay", () => {
    let mockCtx: {
      save: ReturnType<typeof vi.fn>;
      restore: ReturnType<typeof vi.fn>;
      fillRect: ReturnType<typeof vi.fn>;
      drawImage: ReturnType<typeof vi.fn>;
      createPattern: ReturnType<typeof vi.fn>;
      createImageData: ReturnType<typeof vi.fn>;
      globalAlpha: number;
      globalCompositeOperation: string;
      fillStyle: unknown;
    };

    let mockTileCtx: {
      putImageData: ReturnType<typeof vi.fn>;
      createImageData: ReturnType<typeof vi.fn>;
    };
    let mockTileCanvas: { width: number; height: number };

    beforeEach(() => {
      mockTileCtx = {
        putImageData: vi.fn(),
        createImageData: vi.fn().mockImplementation((w: number, h: number) => ({
          width: w,
          height: h,
          data: new Uint8ClampedArray(w * h * 4),
        })),
      };
      mockTileCanvas = { width: 256, height: 256 };

      mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        createPattern: vi.fn().mockReturnValue({}),
        createImageData: vi.fn().mockImplementation((w: number, h: number) => ({
          width: w,
          height: h,
          data: new Uint8ClampedArray(w * h * 4),
        })),
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        fillStyle: "",
      };
    });

    it("nao executa operacoes quando enableGrain for falso", () => {
      renderNoiseOverlay(mockCtx as unknown as CanvasRenderingContext2D, 800, 600, {
        enableGrain: false,
        createTileCanvas: () => ({ canvas: mockTileCanvas, ctx: mockTileCtx }),
      });

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.restore).not.toHaveBeenCalled();
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it("nao executa operacoes quando grainOpacity for menor ou igual a zero", () => {
      renderNoiseOverlay(mockCtx as unknown as CanvasRenderingContext2D, 800, 600, {
        enableGrain: true,
        grainOpacity: 0,
        createTileCanvas: () => ({ canvas: mockTileCanvas, ctx: mockTileCtx }),
      });

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it("aplica configuracoes de opacidade e composicao screen no contexto", () => {
      renderNoiseOverlay(mockCtx as unknown as CanvasRenderingContext2D, 400, 300, {
        enableGrain: true,
        grainOpacity: 0.04,
        createTileCanvas: () => ({ canvas: mockTileCanvas, ctx: mockTileCtx }),
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.globalAlpha).toBe(0.04);
      expect(mockCtx.globalCompositeOperation).toBe("screen");
      expect(mockTileCtx.putImageData).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it("permite operacao de composicao customizada", () => {
      renderNoiseOverlay(mockCtx as unknown as CanvasRenderingContext2D, 400, 300, {
        enableGrain: true,
        grainOpacity: 0.02,
        compositeOperation: "overlay",
        createTileCanvas: () => ({ canvas: mockTileCanvas, ctx: mockTileCtx }),
      });

      expect(mockCtx.globalCompositeOperation).toBe("overlay");
    });
  });
});
