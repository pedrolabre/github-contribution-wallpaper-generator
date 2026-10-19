import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DayContribution, ColorPalette } from "../../src/types/contributions";
import type { FibonacciSpiralParams } from "../../src/types/wallpaper";
import {
  GOLDEN_ANGLE,
  DEFAULT_SPIRAL_TIGHTNESS,
  DEFAULT_INNER_RADIUS,
  DEFAULT_OUTER_RADIUS_SCALE,
  computeExpansionRate,
  computeArchimedeanTheta,
  computeArchimedeanRadius,
  computeArchimedeanTangent,
  computeGoldenRatioCoords,
  calculatePolarPosition,
  calculateFibonacciSpiralLayout,
  renderFibonacciSpiral,
} from "../../src/engine/fibonacciSpiralModel";

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
  id: "neon-emerald",
  name: "Neon Emerald",
  background: "#030504",
  levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ff59"],
  textColor: "#c9d1d9",
  glowColor: "#00ff59",
};

const defaultTestParams: FibonacciSpiralParams = {
  spiralTightness: 2.5,
  innerRadius: 10,
  outerRadiusScale: 1.0,
  cellRotation: true,
  angularStep: "archimedean",
};

describe("fibonacciSpiralModel", () => {
  describe("constantes padrao", () => {
    it("expoe o angulo aureo e constantes canonicas", () => {
      expect(GOLDEN_ANGLE).toBeCloseTo(2.399963, 5);
      expect(DEFAULT_SPIRAL_TIGHTNESS).toBe(2.5);
      expect(DEFAULT_INNER_RADIUS).toBe(10);
      expect(DEFAULT_OUTER_RADIUS_SCALE).toBe(1.0);
    });
  });

  describe("computeExpansionRate", () => {
    it("calcula taxa de expansao como produto de tightness e scale", () => {
      expect(computeExpansionRate(2.5, 1.2)).toBeCloseTo(3.0, 5);
      expect(computeExpansionRate(3.0, 0.5)).toBeCloseTo(1.5, 5);
    });

    it("utiliza valores padrao quando parametros forem invalidos ou nao positivos", () => {
      expect(computeExpansionRate(0, 1.0)).toBeCloseTo(DEFAULT_SPIRAL_TIGHTNESS * 1.0, 5);
      expect(computeExpansionRate(2.0, -1)).toBeCloseTo(2.0 * DEFAULT_OUTER_RADIUS_SCALE, 5);
      expect(computeExpansionRate(Number.NaN, Number.POSITIVE_INFINITY)).toBeCloseTo(
        DEFAULT_SPIRAL_TIGHTNESS * DEFAULT_OUTER_RADIUS_SCALE,
        5,
      );
    });

    it("assegura piso positivo minimo de 0.001", () => {
      expect(computeExpansionRate(0.00001, 0.00001)).toBeGreaterThanOrEqual(0.001);
    });
  });

  describe("computeArchimedeanTheta", () => {
    it("retorna 0 para k <= 0 ou parametros invalidos", () => {
      expect(computeArchimedeanTheta(0, 16, 2.5)).toBe(0);
      expect(computeArchimedeanTheta(-5, 16, 2.5)).toBe(0);
      expect(computeArchimedeanTheta(10, 0, 2.5)).toBe(0);
      expect(computeArchimedeanTheta(10, 16, 0)).toBe(0);
    });

    it("cresce proporcionalmente a raiz quadrada do indice k", () => {
      const b = 2.5;
      const arcStep = 18;
      const theta1 = computeArchimedeanTheta(1, arcStep, b);
      const theta4 = computeArchimedeanTheta(4, arcStep, b);
      const theta9 = computeArchimedeanTheta(9, arcStep, b);

      expect(theta1).toBeGreaterThan(0);
      expect(theta4).toBeCloseTo(theta1 * 2, 5);
      expect(theta9).toBeCloseTo(theta1 * 3, 5);
    });

    it("apresenta crescimento monotono estrito para k crescente", () => {
      let prevTheta = -1;
      for (let k = 1; k <= 50; k++) {
        const theta = computeArchimedeanTheta(k, 16, 2.5);
        expect(theta).toBeGreaterThan(prevTheta);
        prevTheta = theta;
      }
    });
  });

  describe("computeArchimedeanRadius", () => {
    it("inicia em innerRadius para theta = 0", () => {
      expect(computeArchimedeanRadius(15, 2.5, 0)).toBe(15);
    });

    it("cresce linearmente com theta", () => {
      const inner = 20;
      const b = 3.0;
      expect(computeArchimedeanRadius(inner, b, 2.0)).toBeCloseTo(20 + 3.0 * 2.0, 5);
      expect(computeArchimedeanRadius(inner, b, 5.0)).toBeCloseTo(20 + 3.0 * 5.0, 5);
    });

    it("trata valores negativos de forma segura", () => {
      expect(computeArchimedeanRadius(-10, 2.0, 4.0)).toBeCloseTo(8.0, 5);
      expect(computeArchimedeanRadius(10, 2.0, -3.0)).toBe(10);
    });
  });

  describe("computeArchimedeanTangent", () => {
    it("calcula angulo tangente alinhado com a derivada da curva polar", () => {
      const theta = 1.0;
      const radius = 25;
      const b = 2.5;
      const tangent = computeArchimedeanTangent(theta, radius, b);

      expect(tangent).toBeCloseTo(theta + Math.atan2(radius, b), 5);
      expect(tangent).toBeGreaterThan(theta);
    });

    it("retorna theta + PI/2 como fallback se b for menor ou igual a zero", () => {
      const theta = 0.5;
      expect(computeArchimedeanTangent(theta, 20, 0)).toBeCloseTo(theta + Math.PI / 2, 5);
      expect(computeArchimedeanTangent(theta, 20, -1)).toBeCloseTo(theta + Math.PI / 2, 5);
    });
  });

  describe("computeGoldenRatioCoords", () => {
    it("avanca o angulo exatamente pelo angulo aureo a cada passo", () => {
      const b = 2.5;
      const arcStep = 16;
      const c0 = computeGoldenRatioCoords(0, 10, b, arcStep);
      const c1 = computeGoldenRatioCoords(1, 10, b, arcStep);
      const c2 = computeGoldenRatioCoords(2, 10, b, arcStep);

      expect(c0.theta).toBe(0);
      expect(c1.theta).toBeCloseTo(GOLDEN_ANGLE, 5);
      expect(c2.theta).toBeCloseTo(2 * GOLDEN_ANGLE, 5);
    });

    it("expande o raio proporcionalmente a raiz de k", () => {
      const inner = 10;
      const b = 2.0;
      const arcStep = 16;
      const c0 = computeGoldenRatioCoords(0, inner, b, arcStep);
      const c4 = computeGoldenRatioCoords(4, inner, b, arcStep);
      const c16 = computeGoldenRatioCoords(16, inner, b, arcStep);

      expect(c0.radius).toBe(inner);
      const delta4 = c4.radius - inner;
      const delta16 = c16.radius - inner;
      expect(delta16).toBeCloseTo(delta4 * 2, 5);
    });

    it("calcula angulo tangente perpendicular ao raio polar", () => {
      const coords = computeGoldenRatioCoords(5, 10, 2.0, 16);
      expect(coords.tangent).toBeCloseTo(coords.theta + Math.PI / 2, 5);
    });
  });

  describe("calculatePolarPosition", () => {
    it("calcula posicao nos quatro quadrantes eixos cardeais", () => {
      const cx = 500;
      const cy = 400;
      const r = 100;

      const p0 = calculatePolarPosition(cx, cy, r, 0);
      expect(p0.x).toBeCloseTo(600, 5);
      expect(p0.y).toBeCloseTo(400, 5);

      const pPiOver2 = calculatePolarPosition(cx, cy, r, Math.PI / 2);
      expect(pPiOver2.x).toBeCloseTo(500, 5);
      expect(pPiOver2.y).toBeCloseTo(500, 5);

      const pPi = calculatePolarPosition(cx, cy, r, Math.PI);
      expect(pPi.x).toBeCloseTo(400, 5);
      expect(pPi.y).toBeCloseTo(400, 5);

      const p3PiOver2 = calculatePolarPosition(cx, cy, r, (3 * Math.PI) / 2);
      expect(p3PiOver2.x).toBeCloseTo(500, 5);
      expect(p3PiOver2.y).toBeCloseTo(300, 5);
    });

    it("aplica offsets globais corretamente", () => {
      const p = calculatePolarPosition(200, 200, 50, 0, 30, -20);
      expect(p.x).toBeCloseTo(280, 5);
      expect(p.y).toBeCloseTo(180, 5);
    });
  });

  describe("calculateFibonacciSpiralLayout", () => {
    it("retorna layout vazio com bounds centralizados quando lista de dias for vazia", () => {
      const result = calculateFibonacciSpiralLayout({
        days: [],
        params: defaultTestParams,
        canvasWidth: 1000,
        canvasHeight: 800,
        cellSize: 16,
      });

      expect(result.cells).toHaveLength(0);
      expect(result.centerX).toBe(500);
      expect(result.centerY).toBe(400);
      expect(result.bounds.width).toBe(0);
      expect(result.bounds.height).toBe(0);
    });

    it("gera 365 celulas com expansao arquimediana polar", () => {
      const days = createMockDays(365);
      const result = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 1200,
        canvasHeight: 1200,
        cellSize: 12,
        cellGap: 3,
      });

      expect(result.cells).toHaveLength(365);
      expect(result.centerX).toBe(600);
      expect(result.centerY).toBe(600);
      expect(result.bounds.maxRadius).toBeGreaterThan(0);

      const firstCell = result.cells[0];
      expect(firstCell.index).toBe(0);
      expect(firstCell.theta).toBe(0);
      expect(firstCell.radius).toBe(defaultTestParams.innerRadius);
      expect(firstCell.x).toBeCloseTo(600 + defaultTestParams.innerRadius, 5);
      expect(firstCell.y).toBeCloseTo(600, 5);

      let prevRadius = firstCell.radius;
      let prevTheta = firstCell.theta;
      for (let i = 1; i < result.cells.length; i++) {
        const c = result.cells[i];
        expect(c.radius).toBeGreaterThan(prevRadius);
        expect(c.theta).toBeGreaterThan(prevTheta);
        expect(c.visible).toBe(true);
        prevRadius = c.radius;
        prevTheta = c.theta;
      }
    });

    it("aplica rotacao tangencial quando cellRotation for verdadeiro", () => {
      const days = createMockDays(30);
      const result = calculateFibonacciSpiralLayout({
        days,
        params: { ...defaultTestParams, cellRotation: true },
        canvasWidth: 800,
        canvasHeight: 800,
        cellSize: 10,
      });

      for (let i = 1; i < result.cells.length; i++) {
        const cell = result.cells[i];
        expect(cell.rotation).toBe(cell.tangentAngle);
        expect(cell.rotation).not.toBe(0);
      }
    });

    it("anula a rotacao de celulas quando cellRotation for falso", () => {
      const days = createMockDays(30);
      const result = calculateFibonacciSpiralLayout({
        days,
        params: { ...defaultTestParams, cellRotation: false },
        canvasWidth: 800,
        canvasHeight: 800,
        cellSize: 10,
      });

      for (const cell of result.cells) {
        expect(cell.rotation).toBe(0);
        expect(cell.tangentAngle).toBeGreaterThan(0);
      }
    });

    it("suporta o passo angular de razao aurea (golden-ratio)", () => {
      const days = createMockDays(100);
      const result = calculateFibonacciSpiralLayout({
        days,
        params: { ...defaultTestParams, angularStep: "golden-ratio" },
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 14,
      });

      expect(result.cells).toHaveLength(100);
      for (let i = 0; i < result.cells.length; i++) {
        const cell = result.cells[i];
        expect(cell.theta).toBeCloseTo(i * GOLDEN_ANGLE, 5);
        if (i > 0) {
          expect(cell.radius).toBeGreaterThan(result.cells[i - 1].radius);
        }
      }
    });

    it("escala proporcionalmente tamanho das celulas e espacamento", () => {
      const days = createMockDays(20);
      const baseResult = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 10,
        cellGap: 2,
        scale: 1,
      });

      const scaledResult = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 10,
        cellGap: 2,
        scale: 2,
      });

      expect(scaledResult.cells[0].size).toBe(baseResult.cells[0].size * 2);
      expect(scaledResult.bounds.maxRadius).toBeGreaterThan(baseResult.bounds.maxRadius);
    });

    it("desloca as coordenadas da espiral com offsetX e offsetY", () => {
      const days = createMockDays(10);
      const baseResult = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 800,
        canvasHeight: 600,
        cellSize: 12,
        offsetX: 0,
        offsetY: 0,
      });

      const offsetResult = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 800,
        canvasHeight: 600,
        cellSize: 12,
        offsetX: 50,
        offsetY: -30,
      });

      for (let i = 0; i < days.length; i++) {
        expect(offsetResult.cells[i].x).toBeCloseTo(baseResult.cells[i].x + 50, 5);
        expect(offsetResult.cells[i].y).toBeCloseTo(baseResult.cells[i].y - 30, 5);
      }
    });

    it("produz bounds que contem todas as celulas da espiral", () => {
      const days = createMockDays(50);
      const result = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      for (const cell of result.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(result.bounds.minX);
        expect(cell.x).toBeLessThanOrEqual(result.bounds.maxX);
        expect(cell.y).toBeGreaterThanOrEqual(result.bounds.minY);
        expect(cell.y).toBeLessThanOrEqual(result.bounds.maxY);
      }
      expect(result.bounds.width).toBe(result.bounds.maxX - result.bounds.minX);
      expect(result.bounds.height).toBe(result.bounds.maxY - result.bounds.minY);
    });

    it("e 100% deterministico para entradas identicas", () => {
      const days = createMockDays(120);
      const opts = {
        days,
        params: defaultTestParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 14,
        cellGap: 3,
        scale: 1.5,
        offsetX: 20,
        offsetY: -15,
      };

      const result1 = calculateFibonacciSpiralLayout(opts);
      const result2 = calculateFibonacciSpiralLayout(opts);

      expect(result1.cells).toHaveLength(result2.cells.length);
      for (let i = 0; i < result1.cells.length; i++) {
        expect(result1.cells[i].x).toBe(result2.cells[i].x);
        expect(result1.cells[i].y).toBe(result2.cells[i].y);
        expect(result1.cells[i].theta).toBe(result2.cells[i].theta);
        expect(result1.cells[i].radius).toBe(result2.cells[i].radius);
        expect(result1.cells[i].rotation).toBe(result2.cells[i].rotation);
      }
      expect(result1.bounds).toEqual(result2.bounds);
    });
  });

  describe("renderFibonacciSpiral", () => {
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
        renderFibonacciSpiral(mockContext as unknown as CanvasRenderingContext2D, {
          palette: testPalette,
        });
      }).toThrow("renderFibonacciSpiral requires either layout or layoutOptions");
    });

    it("renderiza celulas a partir de layout pre-calculado", () => {
      const days = createMockDays(15);
      const layout = calculateFibonacciSpiralLayout({
        days,
        params: defaultTestParams,
        canvasWidth: 800,
        canvasHeight: 800,
        cellSize: 12,
      });

      const returned = renderFibonacciSpiral(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
      });

      expect(returned).toBe(layout);
      expect(mockContext.save).toHaveBeenCalledTimes(15);
      expect(mockContext.restore).toHaveBeenCalledTimes(15);
      expect(mockContext.translate).toHaveBeenCalledTimes(15);
      expect(mockContext.fill).toHaveBeenCalledTimes(15);
    });

    it("renderiza calculando layout internamente a partir de layoutOptions", () => {
      const days = createMockDays(10);
      renderFibonacciSpiral(mockContext as unknown as CanvasRenderingContext2D, {
        layoutOptions: {
          days,
          params: defaultTestParams,
          canvasWidth: 800,
          canvasHeight: 800,
          cellSize: 12,
        },
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(10);
      expect(mockContext.restore).toHaveBeenCalledTimes(10);
      expect(mockContext.translate).toHaveBeenCalledTimes(10);
    });

    it("aplica ctx.rotate somente quando rotation for diferente de zero", () => {
      const days = createMockDays(5);
      const layout = calculateFibonacciSpiralLayout({
        days,
        params: { ...defaultTestParams, cellRotation: false },
        canvasWidth: 800,
        canvasHeight: 800,
        cellSize: 12,
      });

      renderFibonacciSpiral(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
      });

      expect(mockContext.rotate).not.toHaveBeenCalled();
    });

    it("configura bloom para niveis altos de contribuicao", () => {
      const days: DayContribution[] = [
        { date: "2025-01-01", count: 0, level: 0, weekday: 0, dayOfYear: 1 },
        { date: "2025-01-02", count: 12, level: 4, weekday: 1, dayOfYear: 2 },
      ];

      renderFibonacciSpiral(mockContext as unknown as CanvasRenderingContext2D, {
        layoutOptions: {
          days,
          params: defaultTestParams,
          canvasWidth: 600,
          canvasHeight: 600,
          cellSize: 14,
        },
        palette: testPalette,
        enableBloom: true,
      });

      expect(mockContext.fill).toHaveBeenCalled();
    });
  });
});
