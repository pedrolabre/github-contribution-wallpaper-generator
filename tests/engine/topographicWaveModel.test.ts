import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DayContribution, ColorPalette } from "../../src/types/contributions";
import type { TopographicWaveParams } from "../../src/types/wallpaper";
import {
  DEFAULT_CAMERA_PITCH_RAD,
  DEFAULT_PERSPECTIVE_FOCAL,
  DEFAULT_WAVE_AMPLITUDE,
  DEFAULT_FREQUENCY_X,
  DEFAULT_FREQUENCY_Z,
  DEFAULT_ELEVATION_MULTIPLIER,
  DEFAULT_DEPTH_FOG_START,
  WEEKS_IN_GRID,
  DAYS_IN_WEEK,
  CENTER_WEEK_INDEX,
  CENTER_WEEKDAY_INDEX,
  pitchToRadians,
  calculateWorldCoordinates,
  calculateWaveRelief,
  projectPerspective,
  computePerspectiveScale,
  computeDepthFog,
  calculateTopographicWaveLayout,
  renderTopographicWave,
} from "../../src/engine/topographicWaveModel";

function createMockDays(count: number, startWeekday = 0): DayContribution[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2025-01-${String((i % 28) + 1).padStart(2, "0")}`,
    count: i % 5,
    level: (i % 5) as 0 | 1 | 2 | 3 | 4,
    weekday: (startWeekday + i) % 7,
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

const testParams: TopographicWaveParams = {
  waveAmplitude: 60,
  waveFrequencyX: 0.04,
  waveFrequencyZ: 0.08,
  perspectiveFocal: 800,
  cameraPitch: 0.45,
  depthFogStart: 0.5,
  elevationMultiplier: 1.5,
};

describe("topographicWaveModel", () => {
  describe("constantes padrao", () => {
    it("expoe constantes canonicas da especificacao", () => {
      expect(DEFAULT_CAMERA_PITCH_RAD).toBeCloseTo(0.43633, 4);
      expect(DEFAULT_PERSPECTIVE_FOCAL).toBe(800);
      expect(DEFAULT_WAVE_AMPLITUDE).toBe(60);
      expect(DEFAULT_FREQUENCY_X).toBe(0.04);
      expect(DEFAULT_FREQUENCY_Z).toBe(0.08);
      expect(DEFAULT_ELEVATION_MULTIPLIER).toBe(1.5);
      expect(DEFAULT_DEPTH_FOG_START).toBe(0.5);
      expect(WEEKS_IN_GRID).toBe(52);
      expect(DAYS_IN_WEEK).toBe(7);
      expect(CENTER_WEEK_INDEX).toBe(26);
      expect(CENTER_WEEKDAY_INDEX).toBe(3);
    });
  });

  describe("pitchToRadians", () => {
    it("preserva angulos ja expressos em radianos", () => {
      expect(pitchToRadians(0)).toBe(0);
      expect(pitchToRadians(0.45)).toBe(0.45);
      expect(pitchToRadians(-0.8)).toBe(-0.8);
      expect(pitchToRadians(Math.PI)).toBe(Math.PI);
    });

    it("converte graus em radianos quando o valor absoluto for superior a PI", () => {
      expect(pitchToRadians(25)).toBeCloseTo((25 * Math.PI) / 180, 5);
      expect(pitchToRadians(45)).toBeCloseTo(Math.PI / 4, 5);
      expect(pitchToRadians(90)).toBeCloseTo(Math.PI / 2, 5);
      expect(pitchToRadians(-30)).toBeCloseTo((-30 * Math.PI) / 180, 5);
    });
  });

  describe("calculateWorldCoordinates", () => {
    it("calcula coordenadas de mundo simetricas e centradas", () => {
      const center = calculateWorldCoordinates(0, 0, 16, 4, 0);
      expect(center.xw).toBe(0);
      expect(center.zw).toBe(4 * 20 * 1.8);

      const left = calculateWorldCoordinates(-10, 0, 16, 4, 0);
      const right = calculateWorldCoordinates(10, 0, 16, 4, 0);
      expect(left.xw).toBe(-right.xw);
      expect(left.zw).toBe(right.zw);
    });

    it("garante zw estritamente positivo para todas as linhas da semana", () => {
      for (let v = -3; v <= 3; v++) {
        const { zw } = calculateWorldCoordinates(0, v, 16, 4, 0);
        expect(zw).toBeGreaterThan(0);
      }
    });

    it("aplica deslocamento adicional zOffset", () => {
      const base = calculateWorldCoordinates(0, 0, 10, 2, 0);
      const withOffset = calculateWorldCoordinates(0, 0, 10, 2, 50);
      expect(withOffset.zw).toBe(base.zw + 50);
    });
  });

  describe("calculateWaveRelief", () => {
    it("gera relevo puramente por elevacao de commits quando amplitude for zero", () => {
      const flatParams = { ...testParams, waveAmplitude: 0 };
      const yw0 = calculateWaveRelief(100, 200, 0, flatParams, 16);
      const yw1 = calculateWaveRelief(100, 200, 1, flatParams, 16);
      const yw4 = calculateWaveRelief(100, 200, 4, flatParams, 16);

      expect(yw0).toBe(0);
      expect(yw1).toBe(-1 * 1.5 * (16 * 0.5));
      expect(yw4).toBe(-4 * 1.5 * (16 * 0.5));
    });

    it("eleva cristas lumionsas reduzindo o valor de yw para niveis maiores", () => {
      const ywLevel0 = calculateWaveRelief(50, 50, 0, testParams, 16);
      const ywLevel4 = calculateWaveRelief(50, 50, 4, testParams, 16);
      expect(ywLevel4).toBeLessThan(ywLevel0);
    });

    it("suporta harmonico secundario customizado", () => {
      const defaultRelief = calculateWaveRelief(100, 100, 2, testParams, 16);
      const customRelief = calculateWaveRelief(100, 100, 2, testParams, 16, 30, 0.1);
      expect(customRelief).not.toBe(defaultRelief);
    });
  });

  describe("projectPerspective", () => {
    it("preserva coordenadas com pitch zero", () => {
      const { yPrime, zPrime } = projectPerspective(50, 150, 0);
      expect(yPrime).toBeCloseTo(50, 5);
      expect(zPrime).toBeCloseTo(150, 5);
    });

    it("rotaciona 90 graus no plano YZ", () => {
      const { yPrime, zPrime } = projectPerspective(50, 150, Math.PI / 2);
      expect(yPrime).toBeCloseTo(-150, 5);
      expect(zPrime).toBeCloseTo(50, 5);
    });

    it("conserva a norma do vetor 2D YZ", () => {
      const yw = 42;
      const zw = 180;
      const pitch = (25 * Math.PI) / 180;
      const { yPrime, zPrime } = projectPerspective(yw, zw, pitch);

      const originalNorm = Math.hypot(yw, zw);
      const rotatedNorm = Math.hypot(yPrime, zPrime);
      expect(rotatedNorm).toBeCloseTo(originalNorm, 5);
    });
  });

  describe("computePerspectiveScale", () => {
    it("retorna escala unitaria quando zPrime for zero", () => {
      expect(computePerspectiveScale(800, 0)).toBe(1);
    });

    it("reduz monotonicamente a escala conforme a profundidade aumenta", () => {
      const sNear = computePerspectiveScale(800, 100);
      const sMid = computePerspectiveScale(800, 400);
      const sFar = computePerspectiveScale(800, 900);

      expect(sNear).toBeGreaterThan(sMid);
      expect(sMid).toBeGreaterThan(sFar);
    });

    it("protege contra singularidade quando zPrime for muito negativo", () => {
      const s = computePerspectiveScale(800, -900);
      expect(Number.isFinite(s)).toBe(true);
      expect(s).toBe(800);
    });
  });

  describe("computeDepthFog", () => {
    it("retorna opacidade 1 quando profundidades minima e maxima coincidirem", () => {
      expect(computeDepthFog(100, 100, 100, 0.5)).toBe(1);
      expect(computeDepthFog(50, 100, 50, 0.5)).toBe(1);
    });

    it("retorna 1.0 para o plano mais proximo minZ", () => {
      expect(computeDepthFog(100, 100, 500, 0)).toBe(1);
      expect(computeDepthFog(100, 100, 500, 0.5)).toBe(1);
    });

    it("retorna 0.25 para o plano mais distante maxZ com fogStart zero", () => {
      expect(computeDepthFog(500, 100, 500, 0)).toBeCloseTo(0.25, 4);
    });

    it("preserva opacidade total enquanto profundidade estiver abaixo de depthFogStart", () => {
      const fogMid = computeDepthFog(200, 100, 500, 0.5);
      expect(fogMid).toBe(1);

      const fogThreshold = computeDepthFog(300, 100, 500, 0.5);
      expect(fogThreshold).toBe(1);
    });

    it("atenua opacidade progressivamente apos o limiar de depthFogStart", () => {
      const fogBefore = computeDepthFog(300, 100, 500, 0.5);
      const fogBeyond = computeDepthFog(400, 100, 500, 0.5);
      const fogEnd = computeDepthFog(500, 100, 500, 0.5);

      expect(fogBefore).toBe(1);
      expect(fogBeyond).toBeLessThan(1);
      expect(fogBeyond).toBeGreaterThan(fogEnd);
      expect(fogEnd).toBeCloseTo(0.25, 4);
    });

    it("respeita piso de 0.15 e teto de 1.0", () => {
      expect(computeDepthFog(1000, 0, 100, 0)).toBe(0.25);
      expect(computeDepthFog(-100, 0, 100, 0)).toBe(1);
    });
  });

  describe("calculateTopographicWaveLayout", () => {
    it("retorna layout vazio e bounds centralizados para array vazio de dias", () => {
      const result = calculateTopographicWaveLayout({
        days: [],
        params: testParams,
        canvasWidth: 1200,
        canvasHeight: 800,
        cellSize: 16,
      });

      expect(result.cells).toEqual([]);
      expect(result.totalWeeks).toBe(0);
      expect(result.centerX).toBe(600);
      expect(result.centerY).toBe(400);
      expect(result.bounds.width).toBe(0);
      expect(result.bounds.height).toBe(0);
    });

    it("dispoe 365 dias na malha 3D e calcula limites validos", () => {
      const days = createMockDays(365, 0);
      const result = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1920,
        canvasHeight: 1080,
        cellSize: 16,
        cellGap: 4,
      });

      expect(result.cells).toHaveLength(365);
      expect(result.totalWeeks).toBeGreaterThanOrEqual(52);
      expect(result.bounds.width).toBeGreaterThan(0);
      expect(result.bounds.height).toBeGreaterThan(0);
      expect(result.bounds.minZ).toBeLessThan(result.bounds.maxZ);
    });

    it("aplica rigorosamente o Algoritmo do Pintor com ordenacao por zPrime decrescente", () => {
      const days = createMockDays(365, 0);
      const result = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1920,
        canvasHeight: 1080,
        cellSize: 16,
      });

      for (let i = 0; i < result.cells.length - 1; i++) {
        expect(result.cells[i].zPrime).toBeGreaterThanOrEqual(result.cells[i + 1].zPrime);
      }
    });

    it("atribui tamanho projetado maior para celulas mais proximas do que distantes", () => {
      const days = createMockDays(365, 0);
      const result = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1920,
        canvasHeight: 1080,
        cellSize: 16,
      });

      const farthest = result.cells[0];
      const closest = result.cells[result.cells.length - 1];

      expect(farthest.zPrime).toBeGreaterThan(closest.zPrime);
      expect(closest.size).toBeGreaterThan(farthest.size);
    });

    it("aplica translacoes de offset e multiplicador de escala", () => {
      const days = createMockDays(10, 0);
      const base = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      const shifted = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        offsetX: 50,
        offsetY: -30,
        scale: 1.5,
      });

      const baseCell = base.cells.find((c) => c.index === 0)!;
      const shiftedCell = shifted.cells.find((c) => c.index === 0)!;

      expect(shiftedCell.size).toBeCloseTo(baseCell.size * 1.5, 4);
      expect(shiftedCell.x).not.toBe(baseCell.x);
      expect(shiftedCell.y).not.toBe(baseCell.y);
    });

    it("opera em modo index sequencial alternativo", () => {
      const days = createMockDays(35, 3);
      const calLayout = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        gridMode: "calendar",
      });

      const idxLayout = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
        gridMode: "index",
      });

      expect(calLayout.cells).toHaveLength(35);
      expect(idxLayout.cells).toHaveLength(35);
      const firstCal = calLayout.cells.find((c) => c.index === 0)!;
      const firstIdx = idxLayout.cells.find((c) => c.index === 0)!;
      expect(firstCal.weekdayIndex).toBe(3);
      expect(firstIdx.weekdayIndex).toBe(0);
    });
  });

  describe("renderTopographicWave", () => {
    let mockContext: {
      save: ReturnType<typeof vi.fn>;
      restore: ReturnType<typeof vi.fn>;
      translate: ReturnType<typeof vi.fn>;
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
        renderTopographicWave(mockContext as unknown as CanvasRenderingContext2D, {
          palette: testPalette,
        });
      }).toThrow("renderTopographicWave requires either layout or layoutOptions");
    });

    it("renderiza celulas a partir de layout pre-calculado", () => {
      const days = createMockDays(14, 0);
      const layout = calculateTopographicWaveLayout({
        days,
        params: testParams,
        canvasWidth: 1000,
        canvasHeight: 1000,
        cellSize: 16,
      });

      renderTopographicWave(mockContext as unknown as CanvasRenderingContext2D, {
        layout,
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(14);
      expect(mockContext.restore).toHaveBeenCalledTimes(14);
      expect(mockContext.translate).toHaveBeenCalledTimes(14);
      expect(mockContext.fill).toHaveBeenCalledTimes(14);
    });

    it("renderiza calculando layout internamente a partir de layoutOptions", () => {
      const days = createMockDays(7, 0);
      renderTopographicWave(mockContext as unknown as CanvasRenderingContext2D, {
        layoutOptions: {
          days,
          params: testParams,
          canvasWidth: 800,
          canvasHeight: 600,
          cellSize: 16,
        },
        palette: testPalette,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(7);
      expect(mockContext.restore).toHaveBeenCalledTimes(7);
      expect(mockContext.translate).toHaveBeenCalledTimes(7);
    });

    it("configura bloom para niveis altos de contribuicao", () => {
      const days: DayContribution[] = [
        { date: "2025-01-01", count: 0, level: 0, weekday: 0, dayOfYear: 1 },
        { date: "2025-01-02", count: 20, level: 4, weekday: 1, dayOfYear: 2 },
      ];

      renderTopographicWave(mockContext as unknown as CanvasRenderingContext2D, {
        layoutOptions: {
          days,
          params: testParams,
          canvasWidth: 800,
          canvasHeight: 600,
          cellSize: 16,
        },
        palette: testPalette,
        enableBloom: true,
        bloomIntensity: 1.5,
        dpr: 2,
      });

      expect(mockContext.save).toHaveBeenCalledTimes(3);
      expect(mockContext.restore).toHaveBeenCalledTimes(3);
    });
  });
});
