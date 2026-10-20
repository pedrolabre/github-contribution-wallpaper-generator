import { describe, it, expect } from "vitest";
import {
  COLOR_PALETTES,
  DEFAULT_PALETTE,
  NEON_EMERALD_PALETTE,
  GITHUB_DARK_PALETTE,
  MONOCHROME_PALETTE,
  CYBERPUNK_PALETTE,
  SOLARIZED_PALETTE,
  getPaletteById,
  isPresetPalette,
  isValidHexColor,
  normalizeHexColor,
  createCustomPalette,
} from "../../src/presets/colorPalettes";
import { colorPaletteSchema } from "../../src/types/schemas";

describe("colorPalettes preset module", () => {
  describe("catalogo de presets", () => {
    it("expoe exatamente os 5 presets definidos no SPEC", () => {
      expect(COLOR_PALETTES).toHaveLength(5);
      const ids = COLOR_PALETTES.map((p) => p.id);
      expect(ids).toEqual([
        "neon-emerald",
        "github-dark",
        "monochrome",
        "cyberpunk",
        "solarized",
      ]);
    });

    it("valida todos os 5 presets contra o schema Zod de ColorPalette", () => {
      COLOR_PALETTES.forEach((palette) => {
        const parseResult = colorPaletteSchema.safeParse(palette);
        expect(parseResult.success).toBe(true);
      });
    });

    it("garante imutabilidade em runtime de cada preset e de suas tuplas de niveis", () => {
      expect(Object.isFrozen(COLOR_PALETTES)).toBe(true);
      COLOR_PALETTES.forEach((palette) => {
        expect(Object.isFrozen(palette)).toBe(true);
        expect(Object.isFrozen(palette.levels)).toBe(true);
        expect(() => {
          Object.assign(palette, { name: "Mutated" });
        }).toThrow();
        expect(() => {
          (palette.levels as string[])[0] = "#ff0000";
        }).toThrow();
      });
    });

    it("define DEFAULT_PALETTE como Neon Emerald", () => {
      expect(DEFAULT_PALETTE.id).toBe("neon-emerald");
      expect(DEFAULT_PALETTE).toBe(NEON_EMERALD_PALETTE);
    });

    it("contem valores hexadecimais esperados para Neon Emerald", () => {
      expect(NEON_EMERALD_PALETTE.background).toBe("#030504");
      expect(NEON_EMERALD_PALETTE.glowColor).toBe("#00ff59");
      expect(NEON_EMERALD_PALETTE.textColor).toBe("#c9d1d9");
      expect(NEON_EMERALD_PALETTE.levels).toEqual([
        "#161b22",
        "#0e4429",
        "#006d32",
        "#26a641",
        "#00ff59",
      ]);
    });

    it("contem valores hexadecimais esperados para GitHub Dark", () => {
      expect(GITHUB_DARK_PALETTE.background).toBe("#0d1117");
      expect(GITHUB_DARK_PALETTE.glowColor).toBe("#39d353");
      expect(GITHUB_DARK_PALETTE.levels[4]).toBe("#39d353");
    });

    it("contem valores hexadecimais esperados para Monochrome", () => {
      expect(MONOCHROME_PALETTE.background).toBe("#000000");
      expect(MONOCHROME_PALETTE.glowColor).toBe("#ffffff");
      expect(MONOCHROME_PALETTE.levels[4]).toBe("#ffffff");
    });

    it("contem valores hexadecimais esperados para Cyberpunk", () => {
      expect(CYBERPUNK_PALETTE.background).toBe("#05050a");
      expect(CYBERPUNK_PALETTE.glowColor).toBe("#00f0ff");
      expect(CYBERPUNK_PALETTE.levels).toEqual([
        "#151226",
        "#3d1c5a",
        "#7e1e9c",
        "#ff007f",
        "#00f0ff",
      ]);
    });

    it("contem valores hexadecimais esperados para Solarized", () => {
      expect(SOLARIZED_PALETTE.background).toBe("#002b36");
      expect(SOLARIZED_PALETTE.glowColor).toBe("#b58900");
      expect(SOLARIZED_PALETTE.levels).toEqual([
        "#073642",
        "#094d5d",
        "#2aa198",
        "#859900",
        "#b58900",
      ]);
    });
  });

  describe("getPaletteById", () => {
    it("retorna o preset correspondente quando o id for valido", () => {
      const palette = getPaletteById("cyberpunk");
      expect(palette).toBeDefined();
      expect(palette?.id).toBe("cyberpunk");
      expect(palette?.name).toBe("Cyberpunk");
    });

    it("retorna undefined para id inexistente", () => {
      expect(getPaletteById("inexistente")).toBeUndefined();
      expect(getPaletteById("")).toBeUndefined();
    });
  });

  describe("isPresetPalette", () => {
    it("retorna true para todos os presets conhecidos", () => {
      expect(isPresetPalette("neon-emerald")).toBe(true);
      expect(isPresetPalette("github-dark")).toBe(true);
      expect(isPresetPalette("monochrome")).toBe(true);
      expect(isPresetPalette("cyberpunk")).toBe(true);
      expect(isPresetPalette("solarized")).toBe(true);
    });

    it("retorna false para ids customizados ou invalidos", () => {
      expect(isPresetPalette("custom-123")).toBe(false);
      expect(isPresetPalette("custom")).toBe(false);
      expect(isPresetPalette("")).toBe(false);
    });
  });

  describe("isValidHexColor", () => {
    it("valida codigos hexadecimais de 6 digitos com hashtag", () => {
      expect(isValidHexColor("#00ff59")).toBe(true);
      expect(isValidHexColor("#ffffff")).toBe(true);
      expect(isValidHexColor("#000000")).toBe(true);
      expect(isValidHexColor("#1A2B3C")).toBe(true);
    });

    it("valida codigos hexadecimais curtos de 3 digitos com hashtag", () => {
      expect(isValidHexColor("#fff")).toBe(true);
      expect(isValidHexColor("#0f5")).toBe(true);
      expect(isValidHexColor("#123")).toBe(true);
    });

    it("aceita strings com espacos nas bordas", () => {
      expect(isValidHexColor("  #00ff59  ")).toBe(true);
    });

    it("rejeita formatos invalidos", () => {
      expect(isValidHexColor("00ff59")).toBe(false);
      expect(isValidHexColor("#1234")).toBe(false);
      expect(isValidHexColor("#12345")).toBe(false);
      expect(isValidHexColor("#1234567")).toBe(false);
      expect(isValidHexColor("#xyz123")).toBe(false);
      expect(isValidHexColor("")).toBe(false);
      // @ts-expect-error teste com tipo invalido
      expect(isValidHexColor(null)).toBe(false);
      // @ts-expect-error teste com tipo invalido
      expect(isValidHexColor(undefined)).toBe(false);
    });
  });

  describe("normalizeHexColor", () => {
    it("retorna codigo de 6 digitos em caixa baixa", () => {
      expect(normalizeHexColor("#00FF59")).toBe("#00ff59");
      expect(normalizeHexColor("#AABBCC")).toBe("#aabbcc");
    });

    it("adiciona hashtag quando omitida em string valida", () => {
      expect(normalizeHexColor("00ff59")).toBe("#00ff59");
      expect(normalizeHexColor("fff")).toBe("#ffffff");
    });

    it("expande formato curto de 3 digitos para 6 digitos", () => {
      expect(normalizeHexColor("#fff")).toBe("#ffffff");
      expect(normalizeHexColor("#0f5")).toBe("#00ff55");
      expect(normalizeHexColor("123")).toBe("#112233");
    });

    it("retorna fallback para entradas invalidas", () => {
      expect(normalizeHexColor("invalido")).toBe("#000000");
      expect(normalizeHexColor("invalido", "#ffffff")).toBe("#ffffff");
      // @ts-expect-error teste com tipo invalido
      expect(normalizeHexColor(null)).toBe("#000000");
    });
  });

  describe("createCustomPalette", () => {
    it("cria paleta customizada valida baseada na padrao quando nenhum parametro for fornecido", () => {
      const custom = createCustomPalette();
      expect(custom.id).toMatch(/^custom-\d+$/);
      expect(custom.name).toBe("Custom Palette");
      expect(custom.background).toBe(DEFAULT_PALETTE.background);
      expect(custom.levels).toEqual(DEFAULT_PALETTE.levels);
      expect(colorPaletteSchema.safeParse(custom).success).toBe(true);
    });

    it("sobrescreve campos especificados e normaliza valores hexadecimais", () => {
      const custom = createCustomPalette({
        name: "Minha Paleta",
        background: "000",
        glowColor: "f0f",
        levels: ["111", "222", "333", "444", "555"],
      });

      expect(custom.name).toBe("Minha Paleta");
      expect(custom.background).toBe("#000000");
      expect(custom.glowColor).toBe("#ff00ff");
      expect(custom.levels).toEqual([
        "#111111",
        "#222222",
        "#333333",
        "#444444",
        "#555555",
      ]);
    });

    it("gera novo id customizado se o id base for um preset imutavel", () => {
      const custom = createCustomPalette({ id: "neon-emerald" });
      expect(custom.id).not.toBe("neon-emerald");
      expect(custom.id).toMatch(/^custom-\d+$/);
    });

    it("preserva id customizado preexistente que nao seja preset", () => {
      const custom = createCustomPalette({ id: "meu-id-proprio" });
      expect(custom.id).toBe("meu-id-proprio");
    });
  });
});
