import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDevicePixelRatio,
  setupHighDPICanvas,
  clearCanvas,
  resetCanvasTransform,
} from "../../src/engine/canvasContext";

describe("canvasContext", () => {
  describe("getDevicePixelRatio", () => {
    const originalDpr = window.devicePixelRatio;

    afterEach(() => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: originalDpr,
        writable: true,
      });
    });

    it("retorna dpr customizado quando fornecido e maior que zero", () => {
      expect(getDevicePixelRatio(2.5)).toBe(2.5);
      expect(getDevicePixelRatio(3)).toBe(3);
    });

    it("ignora dpr customizado quando menor ou igual a zero", () => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        writable: true,
      });
      expect(getDevicePixelRatio(0)).toBe(2);
      expect(getDevicePixelRatio(-1)).toBe(2);
    });

    it("utiliza window.devicePixelRatio do ambiente", () => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: 1.5,
        writable: true,
      });
      expect(getDevicePixelRatio()).toBe(1.5);
    });

    it("retorna fallback 1 quando window.devicePixelRatio nao estiver definido", () => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: undefined,
        writable: true,
      });
      expect(getDevicePixelRatio()).toBe(1);
    });
  });

  describe("setupHighDPICanvas", () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: Record<string, unknown>;

    beforeEach(() => {
      mockContext = {
        setTransform: vi.fn(),
        scale: vi.fn(),
      };

      mockCanvas = {
        width: 0,
        height: 0,
        style: {
          width: "",
          height: "",
        },
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement;
    });

    it("configura dimensoes fisicas de buffer e estilos CSS com dpr customizado", () => {
      const ctx = setupHighDPICanvas(mockCanvas, 800, 600, 2);

      expect(mockCanvas.width).toBe(1600);
      expect(mockCanvas.height).toBe(1200);
      expect(mockCanvas.style.width).toBe("800px");
      expect(mockCanvas.style.height).toBe("600px");
      expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
      expect(ctx).toBe(mockContext);
    });

    it("arredonda dimensoes fisicas fracionarias", () => {
      setupHighDPICanvas(mockCanvas, 800.4, 600.6, 1.5);

      expect(mockCanvas.width).toBe(Math.round(800.4 * 1.5));
      expect(mockCanvas.height).toBe(Math.round(600.6 * 1.5));
    });

    it("lanca erro quando getContext('2d') retornar nulo", () => {
      const brokenCanvas = {
        width: 0,
        height: 0,
        style: { width: "", height: "" },
        getContext: vi.fn().mockReturnValue(null),
      } as unknown as HTMLCanvasElement;

      expect(() => setupHighDPICanvas(brokenCanvas, 400, 300)).toThrow(
        "Failed to get 2D context from canvas",
      );
    });
  });

  describe("clearCanvas", () => {
    let mockContext: {
      save: ReturnType<typeof vi.fn>;
      restore: ReturnType<typeof vi.fn>;
      fillRect: ReturnType<typeof vi.fn>;
      clearRect: ReturnType<typeof vi.fn>;
      fillStyle: string;
    };

    beforeEach(() => {
      mockContext = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        fillStyle: "",
      };
    });

    it("limpa retangulo transparente quando cor de fundo nao for fornecida", () => {
      clearCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        1920,
        1080,
      );

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
      expect(mockContext.fillRect).not.toHaveBeenCalled();
    });

    it("preenche com cor de fundo preservando estado do contexto quando fornecida", () => {
      clearCanvas(
        mockContext as unknown as CanvasRenderingContext2D,
        1920,
        1080,
        "#030504",
      );

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.fillStyle).toBe("#030504");
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
      expect(mockContext.restore).toHaveBeenCalled();
      expect(mockContext.clearRect).not.toHaveBeenCalled();
    });
  });

  describe("resetCanvasTransform", () => {
    it("redefine matriz de transformacao para identidade com dpr 1", () => {
      const mockContext = {
        setTransform: vi.fn(),
        scale: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      resetCanvasTransform(mockContext);

      expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      expect(mockContext.scale).not.toHaveBeenCalled();
    });

    it("aplica scale quando dpr for diferente de 1", () => {
      const mockContext = {
        setTransform: vi.fn(),
        scale: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      resetCanvasTransform(mockContext, 2);

      expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
    });
  });
});
