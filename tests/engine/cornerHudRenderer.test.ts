import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ColorPalette } from "../../src/types/contributions";
import type { CornerHUDConfig } from "../../src/types/wallpaper";
import {
  WEEKDAY_LETTERS,
  DEFAULT_WEEKDAY_LEVEL_PATTERN,
  computeHudScale,
  drawOctocatIcon,
  drawTopLeftQuadrant,
  drawTopRightQuadrant,
  drawBottomLeftQuadrant,
  drawBottomRightQuadrant,
  renderCornerHUD,
  type CornerHUDRenderOptions,
} from "../../src/engine/cornerHudRenderer";

const testPalette: ColorPalette = {
  id: "neon-emerald",
  name: "Neon Emerald",
  background: "#030504",
  levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ff59"],
  textColor: "#c9d1d9",
  glowColor: "#00ff59",
};

const fullHUDConfig: CornerHUDConfig = {
  showHUD: true,
  showGitHubLogo: true,
  showCategoryLabel: true,
  showUsername: true,
  showYear: true,
  showTotalCommits: true,
  showTagline: true,
  taglineLine1: "SMALL STEPS",
  taglineLine2: "BUILD BIG THINGS",
  showWeekdayLegend: true,
  hudColor: "#00ff59",
  fontFamily: "JetBrains Mono, monospace",
};

describe("cornerHudRenderer", () => {
  let mockCtx: {
    save: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    beginPath: ReturnType<typeof vi.fn>;
    closePath: ReturnType<typeof vi.fn>;
    arc: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    lineTo: ReturnType<typeof vi.fn>;
    stroke: ReturnType<typeof vi.fn>;
    fill: ReturnType<typeof vi.fn>;
    fillText: ReturnType<typeof vi.fn>;
    roundRect: ReturnType<typeof vi.fn>;
    rect: ReturnType<typeof vi.fn>;
    arcTo: ReturnType<typeof vi.fn>;
    textAlign: string;
    textBaseline: string;
    font: string;
    fillStyle: unknown;
    strokeStyle: unknown;
    globalAlpha: number;
    lineWidth: number;
  };

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      arcTo: vi.fn(),
      textAlign: "start",
      textBaseline: "alphabetic",
      font: "10px sans-serif",
      fillStyle: "",
      strokeStyle: "",
      globalAlpha: 1.0,
      lineWidth: 1.0,
    };
  });

  function createOptions(
    overrides?: Partial<CornerHUDRenderOptions>,
  ): CornerHUDRenderOptions {
    return {
      ctx: mockCtx as unknown as CanvasRenderingContext2D,
      width: 1200,
      height: 800,
      config: { ...fullHUDConfig },
      username: "audibert.dev",
      year: 2025,
      totalContributions: 1248,
      palette: testPalette,
      ...overrides,
    };
  }

  describe("constantes e utilitarios", () => {
    it("expoe as letras canonicas dos dias da semana", () => {
      expect(WEEKDAY_LETTERS).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
      expect(DEFAULT_WEEKDAY_LEVEL_PATTERN).toHaveLength(7);
    });

    it("calcula escala base do HUD proporcional as dimensoes do canvas", () => {
      expect(computeHudScale(1000, 1000)).toBe(1.0);
      expect(computeHudScale(2000, 2000)).toBe(2.0);
      expect(computeHudScale(400, 400)).toBe(0.65);
    });

    it("respeita escala customizada quando fornecida", () => {
      expect(computeHudScale(1000, 1000, 1.8)).toBe(1.8);
      expect(computeHudScale(1000, 1000, 0)).toBe(1.0);
    });
  });

  describe("drawOctocatIcon", () => {
    it("desenha silhueta vetorial com arcos, orelhas e preenchimento", () => {
      drawOctocatIcon(
        mockCtx as unknown as CanvasRenderingContext2D,
        20,
        30,
        24,
        "#00ff59",
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillStyle).toBe("#00ff59");
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe("drawTopLeftQuadrant", () => {
    it("renderiza logo, label e username quando todos estao ativos", () => {
      const opts = createOptions();
      drawTopLeftQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "GITHUB CONTRIBUTIONS",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "audibert.dev",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it("nao desenha nada quando todos os switches do quadrante estao desligados", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showGitHubLogo: false,
          showCategoryLabel: false,
          showUsername: false,
        },
      });

      drawTopLeftQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it("oculta seletivamente apenas a logo quando showGitHubLogo for falso", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showGitHubLogo: false,
        },
      });

      drawTopLeftQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.arc).not.toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "GITHUB CONTRIBUTIONS",
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe("drawTopRightQuadrant", () => {
    it("renderiza ano, divisor e total formatado", () => {
      const opts = createOptions();
      drawTopRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "2025",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "1,248 contributions",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it("formata singular para contagem de 1 contribuicao", () => {
      const opts = createOptions({ totalContributions: 1 });
      drawTopRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "1 contribution",
        expect.any(Number),
        expect.any(Number),
      );
    });

    it("retorna imediatamente se ano e metricas estiverem desligados", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showYear: false,
          showTotalCommits: false,
        },
      });

      drawTopRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });
  });

  describe("drawBottomLeftQuadrant", () => {
    it("renderiza as duas linhas do manifesto e linha divisoria", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          taglineLine1: "PERSIST AND EXPLORE",
          taglineLine2: "SOLVE DIFFICULT PROBLEMS",
        },
      });

      drawBottomLeftQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "PERSIST AND EXPLORE",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "SOLVE DIFFICULT PROBLEMS",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it("retorna sem desenhar quando showTagline for falso", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showTagline: false,
        },
      });

      drawBottomLeftQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).not.toHaveBeenCalled();
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });
  });

  describe("drawBottomRightQuadrant", () => {
    it("renderiza as 7 letras da semana e 7 mini-quadrados com niveis da paleta", () => {
      const opts = createOptions();
      drawBottomRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      for (const letter of WEEKDAY_LETTERS) {
        expect(mockCtx.fillText).toHaveBeenCalledWith(
          letter,
          expect.any(Number),
          expect.any(Number),
        );
      }
      expect(mockCtx.fill).toHaveBeenCalledTimes(7);
    });

    it("respeita vetor customizado de weekdayLevels", () => {
      const opts = createOptions({
        weekdayLevels: [4, 4, 3, 2, 1, 0, 0],
      });

      drawBottomRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fill).toHaveBeenCalledTimes(7);
    });

    it("retorna sem desenhar quando showWeekdayLegend for falso", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showWeekdayLegend: false,
        },
      });

      drawBottomRightQuadrant(
        mockCtx as unknown as CanvasRenderingContext2D,
        opts,
        1.0,
        40,
        40,
        "#00ff59",
      );

      expect(mockCtx.fillText).not.toHaveBeenCalled();
      expect(mockCtx.fill).not.toHaveBeenCalled();
    });
  });

  describe("renderCornerHUD", () => {
    it("interrompe imediatamente sem alterar contexto quando showHUD for falso", () => {
      const opts = createOptions({
        config: {
          ...fullHUDConfig,
          showHUD: false,
        },
      });

      renderCornerHUD(opts);

      expect(mockCtx.save).not.toHaveBeenCalled();
      expect(mockCtx.restore).not.toHaveBeenCalled();
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it("renderiza todos os quadrantes e restaura o contexto com seguranca", () => {
      const opts = createOptions();

      renderCornerHUD(opts);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "GITHUB CONTRIBUTIONS",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "2025",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "SMALL STEPS",
        expect.any(Number),
        expect.any(Number),
      );
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        "S",
        expect.any(Number),
        expect.any(Number),
      );
    });

    it("utiliza padding e hudScale customizados quando informados", () => {
      const opts = createOptions({
        paddingX: 50,
        paddingY: 60,
        hudScale: 1.5,
      });

      renderCornerHUD(opts);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });
});
