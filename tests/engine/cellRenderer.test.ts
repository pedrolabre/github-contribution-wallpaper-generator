import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  clampRadius,
  drawRoundedPath,
  drawRoundedCell,
  computeBloomBlur,
  drawCellWithBloom,
} from "../../src/engine/cellRenderer";

describe("cellRenderer", () => {
  describe("clampRadius", () => {
    it("retorna zero para valores negativos ou zero", () => {
      expect(clampRadius(-5, 20, 20)).toBe(0);
      expect(clampRadius(0, 20, 20)).toBe(0);
    });

    it("retorna zero para valores nao finitos ou NaN", () => {
      expect(clampRadius(NaN, 20, 20)).toBe(0);
      expect(clampRadius(Infinity, 20, 20)).toBe(0);
      expect(clampRadius(-Infinity, 20, 20)).toBe(0);
    });

    it("mantem raio valido dentro do limite geometrico", () => {
      expect(clampRadius(4, 20, 20)).toBe(4);
      expect(clampRadius(8, 20, 30)).toBe(8);
    });

    it("restringe raio ao valor maximo de metade da menor dimensao", () => {
      expect(clampRadius(15, 20, 20)).toBe(10);
      expect(clampRadius(25, 20, 50)).toBe(10);
      expect(clampRadius(30, 40, 10)).toBe(5);
    });
  });

  describe("drawRoundedPath", () => {
    let mockContext: {
      beginPath: ReturnType<typeof vi.fn>;
      rect: ReturnType<typeof vi.fn>;
      roundRect?: ReturnType<typeof vi.fn>;
      moveTo: ReturnType<typeof vi.fn>;
      arcTo: ReturnType<typeof vi.fn>;
      closePath: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockContext = {
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        moveTo: vi.fn(),
        arcTo: vi.fn(),
        closePath: vi.fn(),
      };
    });

    it("utiliza ctx.rect quando o raio for zero", () => {
      drawRoundedPath(
        mockContext as unknown as CanvasRenderingContext2D,
        10,
        20,
        30,
        40,
        0,
      );

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.rect).toHaveBeenCalledWith(10, 20, 30, 40);
      expect(mockContext.roundRect).not.toHaveBeenCalled();
    });

    it("invoca ctx.roundRect nativo quando disponivel e raio maior que zero", () => {
      drawRoundedPath(
        mockContext as unknown as CanvasRenderingContext2D,
        10,
        20,
        30,
        40,
        6,
      );

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.roundRect).toHaveBeenCalledWith(10, 20, 30, 40, 6);
      expect(mockContext.arcTo).not.toHaveBeenCalled();
    });

    it("executa fallback com arcTo quando roundRect nao estiver definido no contexto", () => {
      delete mockContext.roundRect;

      drawRoundedPath(
        mockContext as unknown as CanvasRenderingContext2D,
        10,
        20,
        30,
        40,
        5,
      );

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalledWith(15, 20);
      expect(mockContext.arcTo).toHaveBeenCalledTimes(4);
      expect(mockContext.closePath).toHaveBeenCalled();
    });
  });

  describe("drawRoundedCell", () => {
    let mockContext: {
      beginPath: ReturnType<typeof vi.fn>;
      rect: ReturnType<typeof vi.fn>;
      roundRect: ReturnType<typeof vi.fn>;
      fillStyle: string;
      fill: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockContext = {
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        fillStyle: "",
        fill: vi.fn(),
      };
    });

    it("desenha celula quadrada com assinatura simplificada de 6 parametros", () => {
      drawRoundedCell(
        mockContext as unknown as CanvasRenderingContext2D,
        10,
        15,
        20,
        4,
        "#00ff59",
      );

      expect(mockContext.roundRect).toHaveBeenCalledWith(10, 15, 20, 20, 4);
      expect(mockContext.fillStyle).toBe("#00ff59");
      expect(mockContext.fill).toHaveBeenCalled();
    });

    it("desenha celula retangular com assinatura completa de 7 parametros", () => {
      drawRoundedCell(
        mockContext as unknown as CanvasRenderingContext2D,
        5,
        10,
        25,
        30,
        5,
        "#00b348",
      );

      expect(mockContext.roundRect).toHaveBeenCalledWith(5, 10, 25, 30, 5);
      expect(mockContext.fillStyle).toBe("#00b348");
      expect(mockContext.fill).toHaveBeenCalled();
    });

    it("ignora renderizacao quando largura ou altura forem menores ou iguais a zero", () => {
      drawRoundedCell(
        mockContext as unknown as CanvasRenderingContext2D,
        0,
        0,
        0,
        2,
        "#00ff59",
      );

      expect(mockContext.beginPath).not.toHaveBeenCalled();
      expect(mockContext.fill).not.toHaveBeenCalled();
    });
  });

  describe("computeBloomBlur", () => {
    it("retorna 0 para niveis 0, 1 e 2", () => {
      expect(computeBloomBlur(0)).toBe(0);
      expect(computeBloomBlur(1)).toBe(0);
      expect(computeBloomBlur(2)).toBe(0);
    });

    it("calcula blur base de 8px para nivel 3", () => {
      expect(computeBloomBlur(3)).toBe(8);
      expect(computeBloomBlur(3, 2)).toBe(16);
      expect(computeBloomBlur(3, 2, 1.5)).toBe(24);
    });

    it("calcula blur base de 14px para nivel 4", () => {
      expect(computeBloomBlur(4)).toBe(14);
      expect(computeBloomBlur(4, 2)).toBe(28);
      expect(computeBloomBlur(4, 2, 0.5)).toBe(14);
    });
  });

  describe("drawCellWithBloom", () => {
    let mockContext: {
      beginPath: ReturnType<typeof vi.fn>;
      rect: ReturnType<typeof vi.fn>;
      roundRect: ReturnType<typeof vi.fn>;
      save: ReturnType<typeof vi.fn>;
      restore: ReturnType<typeof vi.fn>;
      fillStyle: string;
      fill: ReturnType<typeof vi.fn>;
      shadowColor: string;
      shadowBlur: number;
    };

    beforeEach(() => {
      mockContext = {
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillStyle: "",
        fill: vi.fn(),
        shadowColor: "",
        shadowBlur: 0,
      };
    });

    it("executa apenas um passe quando bloom estiver desativado", () => {
      drawCellWithBloom(mockContext as unknown as CanvasRenderingContext2D, {
        x: 0,
        y: 0,
        width: 16,
        radius: 3,
        color: "#00ff59",
        level: 4,
        glowColor: "#00ff59",
        enableBloom: false,
      });

      expect(mockContext.save).not.toHaveBeenCalled();
      expect(mockContext.restore).not.toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalledTimes(1);
      expect(mockContext.shadowBlur).toBe(0);
      expect(mockContext.shadowColor).toBe("transparent");
    });

    it("executa apenas um passe para niveis inferiores a 3 mesmo com bloom ativo", () => {
      drawCellWithBloom(mockContext as unknown as CanvasRenderingContext2D, {
        x: 0,
        y: 0,
        width: 16,
        radius: 3,
        color: "#005a24",
        level: 2,
        glowColor: "#00ff59",
        enableBloom: true,
      });

      expect(mockContext.save).not.toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalledTimes(1);
    });

    it("executa duplo pass para nivel 3 com sombra difusa e restauracao de contexto", () => {
      drawCellWithBloom(mockContext as unknown as CanvasRenderingContext2D, {
        x: 10,
        y: 20,
        width: 18,
        radius: 4,
        color: "#00b348",
        level: 3,
        glowColor: "#00ff59",
        enableBloom: true,
        dpr: 2,
        bloomIntensity: 1,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(1);
      expect(mockContext.restore).toHaveBeenCalledTimes(1);
      expect(mockContext.fill).toHaveBeenCalledTimes(2);
      expect(mockContext.shadowBlur).toBe(0);
      expect(mockContext.shadowColor).toBe("transparent");
    });

    it("executa duplo pass para nivel 4 aplicando blur correto de 14 * dpr", () => {
      drawCellWithBloom(mockContext as unknown as CanvasRenderingContext2D, {
        x: 10,
        y: 20,
        width: 18,
        height: 18,
        radius: 4,
        color: "#00ff59",
        level: 4,
        glowColor: "#00ff59",
        enableBloom: true,
        dpr: 2,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(1);
      expect(mockContext.restore).toHaveBeenCalledTimes(1);
      expect(mockContext.fill).toHaveBeenCalledTimes(2);
      expect(mockContext.shadowBlur).toBe(0);
      expect(mockContext.shadowColor).toBe("transparent");
    });

    it("ignora desenho quando dimensoes forem menores ou iguais a zero", () => {
      drawCellWithBloom(mockContext as unknown as CanvasRenderingContext2D, {
        x: 0,
        y: 0,
        width: 0,
        radius: 0,
        color: "#00ff59",
        level: 4,
        glowColor: "#00ff59",
        enableBloom: true,
      });

      expect(mockContext.fill).not.toHaveBeenCalled();
    });
  });
});
