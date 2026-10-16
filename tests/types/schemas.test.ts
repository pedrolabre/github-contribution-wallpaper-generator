import { describe, expect, it } from "vitest";
import {
  colorPaletteSchema,
  cornerHUDConfigSchema,
  dayContributionSchema,
  deviceDimensionsSchema,
  fibonacciSpiralParamsSchema,
  layoutModelSchema,
  matrixStreamParamsSchema,
  parseDayContribution,
  parseUserContributionData,
  parseWallpaperConfig,
  safeParseDayContribution,
  safeParseUserContributionData,
  safeParseWallpaperConfig,
  topographicWaveParamsSchema,
  userContributionDataSchema,
  wallpaperConfigSchema,
} from "../../src/types/schemas";

describe("dayContributionSchema", () => {
  const validDay = {
    date: "2025-06-15",
    count: 7,
    level: 3,
    weekday: 0,
    dayOfYear: 166,
  };

  it("valida objeto valido de contribuicao diaria", () => {
    const result = dayContributionSchema.safeParse(validDay);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2025-06-15");
      expect(result.data.level).toBe(3);
    }
  });

  it("rejeita datas fora do formato YYYY-MM-DD", () => {
    expect(dayContributionSchema.safeParse({ ...validDay, date: "15-06-2025" }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, date: "2025/06/15" }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, date: "invalid-date" }).success).toBe(false);
  });

  it("rejeita contagens negativas ou decimais", () => {
    expect(dayContributionSchema.safeParse({ ...validDay, count: -1 }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, count: 2.5 }).success).toBe(false);
  });

  it("rejeita niveis fora do intervalo de 0 a 4", () => {
    expect(dayContributionSchema.safeParse({ ...validDay, level: -1 }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, level: 5 }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, level: 2.5 }).success).toBe(false);
  });

  it("rejeita dias da semana fora de 0 a 6", () => {
    expect(dayContributionSchema.safeParse({ ...validDay, weekday: -1 }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, weekday: 7 }).success).toBe(false);
  });

  it("rejeita dia do ano fora de 1 a 366", () => {
    expect(dayContributionSchema.safeParse({ ...validDay, dayOfYear: 0 }).success).toBe(false);
    expect(dayContributionSchema.safeParse({ ...validDay, dayOfYear: 367 }).success).toBe(false);
  });
});

describe("userContributionDataSchema", () => {
  const validData = {
    username: "pedrolabre",
    year: 2025,
    totalContributions: 1420,
    days: [
      {
        date: "2025-01-01",
        count: 5,
        level: 2,
        weekday: 3,
        dayOfYear: 1,
      },
    ],
  };

  it("valida payload completo com ano numerico", () => {
    expect(userContributionDataSchema.safeParse(validData).success).toBe(true);
  });

  it("valida ano com string literal last365", () => {
    expect(userContributionDataSchema.safeParse({ ...validData, year: "last365" }).success).toBe(true);
  });

  it("rejeita anos anteriores ao lancamento do GitHub", () => {
    expect(userContributionDataSchema.safeParse({ ...validData, year: 2005 }).success).toBe(false);
  });

  it("rejeita username vazio ou ausente", () => {
    expect(userContributionDataSchema.safeParse({ ...validData, username: "" }).success).toBe(false);
  });

  it("rejeita total de contribuicoes negativo", () => {
    expect(userContributionDataSchema.safeParse({ ...validData, totalContributions: -10 }).success).toBe(false);
  });

  it("rejeita colecao de dias com elementos invalidos", () => {
    const invalidDays = [{ ...validData.days[0], level: 99 }];
    expect(userContributionDataSchema.safeParse({ ...validData, days: invalidDays }).success).toBe(false);
  });
});

describe("deviceDimensionsSchema", () => {
  it("valida dimensoes e categorias suportadas", () => {
    const mobileDevice = {
      id: "iphone-15-pro",
      label: "iPhone 15 Pro",
      category: "mobile",
      width: 1179,
      height: 2556,
      aspectRatio: "19.5:9",
    };
    expect(deviceDimensionsSchema.safeParse(mobileDevice).success).toBe(true);
  });

  it("rejeita categorias nao suportadas ou dimensoes nao positivas", () => {
    const invalidCategory = {
      id: "apple-watch",
      label: "Apple Watch",
      category: "wearable",
      width: 410,
      height: 502,
      aspectRatio: "1:1",
    };
    expect(deviceDimensionsSchema.safeParse(invalidCategory).success).toBe(false);

    const nonPositive = {
      id: "screen",
      label: "Screen",
      category: "desktop",
      width: -1920,
      height: 1080,
      aspectRatio: "16:9",
    };
    expect(deviceDimensionsSchema.safeParse(nonPositive).success).toBe(false);
  });
});

describe("colorPaletteSchema", () => {
  const validPalette = {
    id: "neon-emerald",
    name: "Neon Emerald",
    background: "#030504",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ff59"] as [string, string, string, string, string],
    textColor: "#c9d1d9",
    glowColor: "#00ff59",
  };

  it("valida paleta com 5 niveis de intensidade", () => {
    expect(colorPaletteSchema.safeParse(validPalette).success).toBe(true);
  });

  it("rejeita paletas com quantidade diferente de 5 niveis", () => {
    const fewerLevels = { ...validPalette, levels: ["#000", "#111", "#222"] };
    expect(colorPaletteSchema.safeParse(fewerLevels).success).toBe(false);
  });
});

describe("layoutModelSchema", () => {
  it("valida os tres modelos generativos e o modo grade", () => {
    expect(layoutModelSchema.safeParse("matrix-stream").success).toBe(true);
    expect(layoutModelSchema.safeParse("topographic-wave").success).toBe(true);
    expect(layoutModelSchema.safeParse("fibonacci-spiral").success).toBe(true);
    expect(layoutModelSchema.safeParse("standard-grid").success).toBe(true);
  });

  it("rejeita identificadores desconhecidos", () => {
    expect(layoutModelSchema.safeParse("hexagonal-honeycomb").success).toBe(false);
  });
});

describe("matrixStreamParamsSchema", () => {
  const validParams = {
    tiltAngle: 25,
    columnWidth: 16,
    scatterFactor: 0.35,
    verticalStagger: 12,
  };

  it("valida parametros dentro dos limites permitidos", () => {
    expect(matrixStreamParamsSchema.safeParse(validParams).success).toBe(true);
  });

  it("rejeita angulo alem de 45 graus ou scatter fora de 0 a 1", () => {
    expect(matrixStreamParamsSchema.safeParse({ ...validParams, tiltAngle: 60 }).success).toBe(false);
    expect(matrixStreamParamsSchema.safeParse({ ...validParams, tiltAngle: -50 }).success).toBe(false);
    expect(matrixStreamParamsSchema.safeParse({ ...validParams, scatterFactor: 1.5 }).success).toBe(false);
    expect(matrixStreamParamsSchema.safeParse({ ...validParams, columnWidth: 0 }).success).toBe(false);
  });
});

describe("topographicWaveParamsSchema", () => {
  const validParams = {
    waveAmplitude: 60,
    waveFrequencyX: 0.04,
    waveFrequencyZ: 0.08,
    perspectiveFocal: 800,
    cameraPitch: 0.45,
    depthFogStart: 0.5,
    elevationMultiplier: 1.5,
  };

  it("valida parametros de projecao 3D", () => {
    expect(topographicWaveParamsSchema.safeParse(validParams).success).toBe(true);
  });

  it("rejeita valores negativos em grandezas fisicas", () => {
    expect(topographicWaveParamsSchema.safeParse({ ...validParams, waveAmplitude: -10 }).success).toBe(false);
    expect(topographicWaveParamsSchema.safeParse({ ...validParams, depthFogStart: 1.2 }).success).toBe(false);
  });
});

describe("fibonacciSpiralParamsSchema", () => {
  const validParams = {
    spiralTightness: 2.5,
    innerRadius: 10,
    outerRadiusScale: 1.2,
    cellRotation: true,
    angularStep: "archimedean" as const,
  };

  it("valida passos angular e polar suportados", () => {
    expect(fibonacciSpiralParamsSchema.safeParse(validParams).success).toBe(true);
    expect(
      fibonacciSpiralParamsSchema.safeParse({ ...validParams, angularStep: "golden-ratio" }).success,
    ).toBe(true);
  });

  it("rejeita passo angular desconhecido ou raio negativo", () => {
    expect(
      fibonacciSpiralParamsSchema.safeParse({ ...validParams, angularStep: "custom-angle" }).success,
    ).toBe(false);
    expect(fibonacciSpiralParamsSchema.safeParse({ ...validParams, innerRadius: -5 }).success).toBe(false);
  });
});

describe("cornerHUDConfigSchema", () => {
  const validHUD = {
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
    fontFamily: "monospace",
  };

  it("valida configuracao completa do HUD de borda", () => {
    expect(cornerHUDConfigSchema.safeParse(validHUD).success).toBe(true);
  });

  it("rejeita configuracao com campos de estilo vazios", () => {
    expect(cornerHUDConfigSchema.safeParse({ ...validHUD, hudColor: "" }).success).toBe(false);
  });
});

describe("wallpaperConfigSchema e funcoes de parsing", () => {
  const validConfig = {
    device: {
      id: "desktop-4k",
      label: "4K Monitor",
      category: "desktop" as const,
      width: 3840,
      height: 2160,
      aspectRatio: "16:9",
    },
    model: "matrix-stream" as const,
    cellSize: 18,
    cellGap: 4,
    borderRadius: 3,
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
    palette: {
      id: "neon-emerald",
      name: "Neon Emerald",
      background: "#030504",
      levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ff59"] as [string, string, string, string, string],
      textColor: "#c9d1d9",
      glowColor: "#00ff59",
    },
    enableBloom: true,
    bloomIntensity: 1.0,
    enableGrain: true,
    grainOpacity: 0.03,
    matrixStream: {
      tiltAngle: 25,
      columnWidth: 16,
      scatterFactor: 0.35,
      verticalStagger: 12,
    },
    topographicWave: {
      waveAmplitude: 60,
      waveFrequencyX: 0.04,
      waveFrequencyZ: 0.08,
      perspectiveFocal: 800,
      cameraPitch: 0.45,
      depthFogStart: 0.5,
      elevationMultiplier: 1.5,
    },
    fibonacciSpiral: {
      spiralTightness: 2.5,
      innerRadius: 10,
      outerRadiusScale: 1.2,
      cellRotation: true,
      angularStep: "archimedean" as const,
    },
    hud: {
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
      fontFamily: "monospace",
    },
  };

  it("valida arvore completa de configuracao do wallpaper", () => {
    expect(wallpaperConfigSchema.safeParse(validConfig).success).toBe(true);
  });

  it("rejeita configuracao com celula ou escala fora dos limites", () => {
    expect(wallpaperConfigSchema.safeParse({ ...validConfig, cellSize: 2 }).success).toBe(false);
    expect(wallpaperConfigSchema.safeParse({ ...validConfig, cellSize: 100 }).success).toBe(false);
    expect(wallpaperConfigSchema.safeParse({ ...validConfig, scale: 0.05 }).success).toBe(false);
  });

  it("executa parseWallpaperConfig e safeParseWallpaperConfig", () => {
    const parsed = parseWallpaperConfig(validConfig);
    expect(parsed.model).toBe("matrix-stream");
    expect(safeParseWallpaperConfig(validConfig).success).toBe(true);
    expect(safeParseWallpaperConfig({ invalid: true }).success).toBe(false);
  });

  it("executa parseUserContributionData e safeParseUserContributionData", () => {
    const data = {
      username: "octocat",
      year: 2024,
      totalContributions: 50,
      days: [],
    };
    expect(parseUserContributionData(data).username).toBe("octocat");
    expect(safeParseUserContributionData(data).success).toBe(true);
  });

  it("executa parseDayContribution e safeParseDayContribution", () => {
    const day = {
      date: "2025-10-28",
      count: 12,
      level: 4,
      weekday: 2,
      dayOfYear: 301,
    };
    expect(parseDayContribution(day).count).toBe(12);
    expect(safeParseDayContribution(day).success).toBe(true);
  });
});
