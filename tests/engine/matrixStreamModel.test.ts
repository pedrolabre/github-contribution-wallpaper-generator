import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DayContribution, ColorPalette } from "../../src/types/contributions";
import type { MatrixStreamParams } from "../../src/types/wallpaper";
import {
  DEFAULT_MATRIX_STREAM_COLUMNS,
  computeColumnStagger,
  rotate2D,
  computeGaussianFade,
  deterministicUnitNoise,
  calculateMatrixStreamLayout,
  renderMatrixStream,
} from "../../src/engine/matrixStreamModel";

function createMockDays(count: number): DayContribution[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`,
    count: i % 5,
    level: (i % 5) as 0 | 1 | 2 | 3 | 4,
    weekday: i % 7,
    dayOfYear: i + 1,
  }));
}

const testPalette: ColorPalette = {
  id: "test",
  name: "Test",
  background: "#0d1117",
  levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  textColor: "#ffffff",
  glowColor: "#39d353",
};

const testParams: MatrixStreamParams = {
  tiltAngle: 25,
  columnWidth: 14,
  scatterFactor: 0.3,
  verticalStagger: 12,
};

describe("matrixStreamModel", () => {
  describe("computeColumnStagger", () => {
    it("calcula stagger vertical centralizado simetricamente", () => {
      const stagger = computeColumnStagger(0, 5, 10, true);
      expect(stagger).toBe(-20);

      const center = computeColumnStagger(2, 5, 10, true);
      expect(center).toBe(0);

      const end = computeColumnStagger(4, 5, 10, true);
      expect(end).toBe(20);
    });

    it("calcula stagger linear nao centralizado a partir do indice zero", () => {
      expect(computeColumnStagger(0, 5, 10, false)).toBe(0);
      expect(computeColumnStagger(2, 5, 10, false)).toBe(20);
      expect(computeColumnStagger(4, 5, 10, false)).toBe(40);
    });

    it("retorna zero quando verticalStagger for zero", () => {
      expect(computeColumnStagger(0, 12, 0, true)).toBe(0);
      expect(computeColumnStagger(5, 12, 0, true)).toBe(0);
      expect(computeColumnStagger(11, 12, 0, true)).toBe(0);
    });

    it("suporta valores negativos de stagger", () => {
      expect(computeColumnStagger(0, 5, -10, true)).toBe(20);
      expect(computeColumnStagger(4, 5, -10, true)).toBe(-20);
    });
  });

  describe("rotate2D", () => {
    it("retorna as mesmas coordenadas para angulo zero", () => {
      const result = rotate2D(10, 20, 0);
      expect(result.x).toBeCloseTo(10);
      expect(result.y).toBeCloseTo(20);
    });

    it("rotaciona vetor em 90 graus radianos", () => {
      const result = rotate2D(1, 0, Math.PI / 2);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it("rotaciona vetor em 180 graus radianos", () => {
      const result = rotate2D(5, -3, Math.PI);
      expect(result.x).toBeCloseTo(-5);
      expect(result.y).toBeCloseTo(3);
    });

    it("preserva a norma euclidiana do vetor sob qualquer rotacao", () => {
      const x = 14.5;
      const y = -8.2;
      const originalNorm = Math.hypot(x, y);

      const angles = [0.1, 0.45, 1.2, 2.5, -0.7];
      for (const angle of angles) {
        const rotated = rotate2D(x, y, angle);
        expect(Math.hypot(rotated.x, rotated.y)).toBeCloseTo(originalNorm, 5);
      }
    });
  });

  describe("computeGaussianFade", () => {
    it("retorna 1.0 no eixo central onde a distancia e zero", () => {
      expect(computeGaussianFade(0, 100, 0.5)).toBe(1);
    });

    it("retorna 1.0 quando scatterFactor for zero ou negativo", () => {
      expect(computeGaussianFade(50, 100, 0)).toBe(1);
      expect(computeGaussianFade(50, 100, -0.2)).toBe(1);
    });

    it("retorna 1.0 quando halfBeamWidth for zero ou negativo", () => {
      expect(computeGaussianFade(50, 0, 0.5)).toBe(1);
      expect(computeGaussianFade(50, -10, 0.5)).toBe(1);
    });

    it("apresenta decaimento estritamente monotono com o aumento da distancia", () => {
      const fade1 = computeGaussianFade(20, 100, 0.5);
      const fade2 = computeGaussianFade(50, 100, 0.5);
      const fade3 = computeGaussianFade(90, 100, 0.5);

      expect(fade1).toBeLessThan(1);
      expect(fade2).toBeLessThan(fade1);
      expect(fade3).toBeLessThan(fade2);
      expect(fade3).toBeGreaterThan(0);
    });

    it("atenua mais fortemente quando scatterFactor e maior", () => {
      const fadeLow = computeGaussianFade(80, 100, 0.2);
      const fadeHigh = computeGaussianFade(80, 100, 0.8);

      expect(fadeHigh).toBeLessThan(fadeLow);
    });

    it("permanece restrito ao intervalo unitario de 0 a 1", () => {
      const fade = computeGaussianFade(500, 100, 1);
      expect(fade).toBeGreaterThanOrEqual(0);
      expect(fade).toBeLessThanOrEqual(1);
    });
  });

  describe("deterministicUnitNoise", () => {
    it("produz saidas identicas para sementes e indices iguais", () => {
      const val1 = deterministicUnitNoise(42, 10, 1);
      const val2 = deterministicUnitNoise(42, 10, 1);
      expect(val1).toBe(val2);
    });

    it("produz valores distintos para indices diferentes", () => {
      const valA = deterministicUnitNoise(42, 0, 1);
      const valB = deterministicUnitNoise(42, 1, 1);
      expect(valA).not.toBe(valB);
    });

    it("produz valores restritos ao intervalo de 0 a 1", () => {
      for (let i = 0; i < 20; i++) {
        const val = deterministicUnitNoise(1234, i, 2);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("calculateMatrixStreamLayout", () => {
    it("trata lista vazia de contribuicoes retornando zero celulas", () => {
      const result = calculateMatrixStreamLayout({
        days: [],
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      expect(result.cells).toHaveLength(0);
      expect(result.rows).toBe(0);
      expect(result.columns).toBe(DEFAULT_MATRIX_STREAM_COLUMNS);
      expect(result.bounds.width).toBe(0);
      expect(result.bounds.height).toBe(0);
    });

    it("distribui 365 dias em 12 colunas e 31 linhas por padrao", () => {
      const days = createMockDays(365);
      const result = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 1080,
        canvasHeight: 1920,
        cellSize: 16,
      });

      expect(result.cells).toHaveLength(365);
      expect(result.columns).toBe(12);
      expect(result.rows).toBe(31);

      expect(result.cells[0].column).toBe(0);
      expect(result.cells[0].row).toBe(0);

      expect(result.cells[11].column).toBe(11);
      expect(result.cells[11].row).toBe(0);

      expect(result.cells[12].column).toBe(0);
      expect(result.cells[12].row).toBe(1);

      expect(result.cells[364].column).toBe(364 % 12);
      expect(result.cells[364].row).toBe(Math.floor(364 / 12));
    });

    it("respeita quantidade customizada de colunas", () => {
      const days = createMockDays(365);
      const result = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        columns: 14,
      });

      expect(result.columns).toBe(14);
      expect(result.rows).toBe(27);
    });

    it("mantem posicoes centralizadas quando tiltAngle e zero", () => {
      const days = createMockDays(12);
      const result = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, tiltAngle: 0, verticalStagger: 0, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        cellGap: 4,
        columns: 12,
      });

      expect(result.cells[0].rotation).toBe(0);
      const avgY = result.cells.reduce((acc, c) => acc + c.y, 0) / result.cells.length;
      expect(avgY).toBeCloseTo(500, 1);
    });

    it("calcula coordenadas rotacionadas com tiltAngle positivo", () => {
      const days = createMockDays(12);
      const result = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, tiltAngle: 25, verticalStagger: 0, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        columns: 12,
      });

      const angleRad = (25 * Math.PI) / 180;
      expect(result.cells[0].rotation).toBeCloseTo(angleRad);
    });

    it("aplica multiplicador de escala proporcionalmente as celulas", () => {
      const days = createMockDays(10);
      const resultBase = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        scale: 1,
      });

      const resultScaled = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        scale: 2,
      });

      expect(resultScaled.cells[0].width).toBe(resultBase.cells[0].width * 2);
      expect(resultScaled.cells[0].height).toBe(resultBase.cells[0].height * 2);
    });

    it("desloca centro pelas propriedades offsetX e offsetY", () => {
      const days = createMockDays(5);
      const resultZero = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        offsetX: 0,
        offsetY: 0,
      });

      const resultOffset = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        offsetX: 50,
        offsetY: -30,
      });

      expect(resultOffset.cells[0].x).toBeCloseTo(resultZero.cells[0].x + 50);
      expect(resultOffset.cells[0].y).toBeCloseTo(resultZero.cells[0].y - 30);
    });

    it("mantem opacidade plena em todas as celulas quando scatterFactor for zero", () => {
      const days = createMockDays(50);
      const result = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      for (const cell of result.cells) {
        expect(cell.fadeFactor).toBe(1);
        expect(cell.opacity).toBe(1);
        expect(cell.visible).toBe(true);
      }
    });

    it("atribui menor fadeFactor e opacidade para celulas perifericas quando scatterFactor for positivo", () => {
      const days = createMockDays(12);
      const result = calculateMatrixStreamLayout({
        days,
        params: { ...testParams, scatterFactor: 0.8 },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        columns: 12,
      });

      const edgeCell = result.cells[0];
      const centerCell = result.cells[5];

      expect(centerCell.fadeFactor).toBeGreaterThan(edgeCell.fadeFactor);
      expect(centerCell.opacity).toBeGreaterThan(edgeCell.opacity);
    });

    it("e 100% deterministico para sementes e parametros identicos", () => {
      const days = createMockDays(365);
      const opts = {
        days,
        params: testParams,
        canvasWidth: 1080,
        canvasHeight: 1920,
        cellSize: 14,
        seed: 777,
      };

      const run1 = calculateMatrixStreamLayout(opts);
      const run2 = calculateMatrixStreamLayout(opts);

      expect(run1.cells.length).toBe(run2.cells.length);
      for (let i = 0; i < run1.cells.length; i++) {
        expect(run1.cells[i].x).toBe(run2.cells[i].x);
        expect(run1.cells[i].y).toBe(run2.cells[i].y);
        expect(run1.cells[i].opacity).toBe(run2.cells[i].opacity);
        expect(run1.cells[i].fadeFactor).toBe(run2.cells[i].fadeFactor);
      }
    });

    it("calcula bounding box valida contendo as celulas visiveis", () => {
      const days = createMockDays(100);
      const result = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      expect(result.bounds.minX).toBeLessThan(result.bounds.maxX);
      expect(result.bounds.minY).toBeLessThan(result.bounds.maxY);
      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);
    });
  });

  describe("renderMatrixStream", () => {
    let mockContext: {
      save: ReturnType<typeof vi.fn>;
      restore: ReturnType<typeof vi.fn>;
      translate: ReturnType<typeof vi.fn>;
      rotate: ReturnType<typeof vi.fn>;
      beginPath: ReturnType<typeof vi.fn>;
      rect: ReturnType<typeof vi.fn>;
      roundRect: ReturnType<typeof vi.fn>;
      fill: ReturnType<typeof vi.fn>;
      globalAlpha: number;
      fillStyle: string;
      shadowColor: string;
      shadowBlur: number;
    };

    beforeEach(() => {
      mockContext = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1,
        fillStyle: "",
        shadowColor: "",
        shadowBlur: 0,
      };
    });

    it("lanca erro quando nem layout nem layoutOptions forem informados", () => {
      expect(() => {
        renderMatrixStream(mockContext as unknown as CanvasRenderingContext2D, {
          palette: testPalette,
        });
      }).toThrow("renderMatrixStream requires either layout or layoutOptions");
    });

    it("renderiza celulas a partir de layout pre-calculado", () => {
      const days = createMockDays(10);
      const layout = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      renderMatrixStream(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(10);
      expect(mockContext.restore).toHaveBeenCalledTimes(10);
      expect(mockContext.translate).toHaveBeenCalledTimes(10);
      expect(mockContext.fill).toHaveBeenCalledTimes(10);
    });

    it("renderiza calculando layout internamente a partir de layoutOptions", () => {
      const days = createMockDays(5);
      renderMatrixStream(mockContext as unknown as CanvasRenderingContext2D, {
        layoutOptions: {
          days,
          params: testParams,
          canvasWidth: 800,
          canvasHeight: 600,
          cellSize: 16,
        },
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(5);
      expect(mockContext.restore).toHaveBeenCalledTimes(5);
    });

    it("desconsidera celulas marcadas como invisiveis ou com opacidade nula", () => {
      const days = createMockDays(3);
      const layout = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 800,
        canvasHeight: 600,
        cellSize: 16,
      });

      layout.cells[1].visible = false;
      layout.cells[2].opacity = 0;

      renderMatrixStream(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(1);
      expect(mockContext.restore).toHaveBeenCalledTimes(1);
    });

    it("aplica bloom em celulas com niveis 3 e 4 quando enableBloom estiver ativado", () => {
      const days: DayContribution[] = [
        { date: "2025-01-01", count: 0, level: 0, weekday: 0, dayOfYear: 1 },
        { date: "2025-01-02", count: 12, level: 4, weekday: 1, dayOfYear: 2 },
      ];

      const layout = calculateMatrixStreamLayout({
        days,
        params: testParams,
        canvasWidth: 800,
        canvasHeight: 600,
        cellSize: 16,
      });

      renderMatrixStream(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
        enableBloom: true,
      });

      expect(mockContext.fill).toHaveBeenCalledTimes(3);
    });
  });
});
