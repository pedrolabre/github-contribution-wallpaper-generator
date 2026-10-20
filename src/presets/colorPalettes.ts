import type { ColorPalette } from "../types/contributions";

export const NEON_EMERALD_PALETTE: ColorPalette = Object.freeze({
  id: "neon-emerald",
  name: "Neon Emerald",
  background: "#030504",
  levels: Object.freeze([
    "#161b22",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#00ff59",
  ]) as unknown as [string, string, string, string, string],
  textColor: "#c9d1d9",
  glowColor: "#00ff59",
});

export const GITHUB_DARK_PALETTE: ColorPalette = Object.freeze({
  id: "github-dark",
  name: "GitHub Dark",
  background: "#0d1117",
  levels: Object.freeze([
    "#161b22",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
  ]) as unknown as [string, string, string, string, string],
  textColor: "#e6edf3",
  glowColor: "#39d353",
});

export const MONOCHROME_PALETTE: ColorPalette = Object.freeze({
  id: "monochrome",
  name: "Monochrome",
  background: "#000000",
  levels: Object.freeze([
    "#161616",
    "#3e3e3e",
    "#707070",
    "#b0b0b0",
    "#ffffff",
  ]) as unknown as [string, string, string, string, string],
  textColor: "#f0f0f0",
  glowColor: "#ffffff",
});

export const CYBERPUNK_PALETTE: ColorPalette = Object.freeze({
  id: "cyberpunk",
  name: "Cyberpunk",
  background: "#05050a",
  levels: Object.freeze([
    "#151226",
    "#3d1c5a",
    "#7e1e9c",
    "#ff007f",
    "#00f0ff",
  ]) as unknown as [string, string, string, string, string],
  textColor: "#f3e8ff",
  glowColor: "#00f0ff",
});

export const SOLARIZED_PALETTE: ColorPalette = Object.freeze({
  id: "solarized",
  name: "Solarized",
  background: "#002b36",
  levels: Object.freeze([
    "#073642",
    "#094d5d",
    "#2aa198",
    "#859900",
    "#b58900",
  ]) as unknown as [string, string, string, string, string],
  textColor: "#93a1a1",
  glowColor: "#b58900",
});

export const COLOR_PALETTES: readonly ColorPalette[] = Object.freeze([
  NEON_EMERALD_PALETTE,
  GITHUB_DARK_PALETTE,
  MONOCHROME_PALETTE,
  CYBERPUNK_PALETTE,
  SOLARIZED_PALETTE,
]);

export const DEFAULT_PALETTE: ColorPalette = NEON_EMERALD_PALETTE;

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find((palette) => palette.id === id);
}

export function isPresetPalette(id: string): boolean {
  return COLOR_PALETTES.some((palette) => palette.id === id);
}

export function isValidHexColor(color: string): boolean {
  if (typeof color !== "string") {
    return false;
  }
  const trimmed = color.trim();
  return HEX_COLOR_REGEX.test(trimmed);
}

export function normalizeHexColor(color: string, fallback = "#000000"): string {
  if (typeof color !== "string") {
    return fallback;
  }

  let sanitized = color.trim().toLowerCase();
  if (!sanitized.startsWith("#")) {
    sanitized = `#${sanitized}`;
  }

  if (!HEX_COLOR_REGEX.test(sanitized)) {
    return fallback;
  }

  if (sanitized.length === 4) {
    const r = sanitized[1];
    const g = sanitized[2];
    const b = sanitized[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return sanitized;
}

export function createCustomPalette(base?: Partial<ColorPalette>): ColorPalette {
  const seed = base ?? DEFAULT_PALETTE;
  const isBasePreset = seed.id ? isPresetPalette(seed.id) : false;
  const id = seed.id && !isBasePreset ? seed.id : `custom-${Date.now()}`;
  const name = seed.name && !isBasePreset ? seed.name : "Custom Palette";
  const background = normalizeHexColor(seed.background ?? DEFAULT_PALETTE.background);
  const textColor = normalizeHexColor(seed.textColor ?? DEFAULT_PALETTE.textColor);
  const glowColor = normalizeHexColor(seed.glowColor ?? DEFAULT_PALETTE.glowColor);

  const baseLevels = seed.levels ?? DEFAULT_PALETTE.levels;
  const levels: [string, string, string, string, string] = [
    normalizeHexColor(baseLevels[0] ?? DEFAULT_PALETTE.levels[0]),
    normalizeHexColor(baseLevels[1] ?? DEFAULT_PALETTE.levels[1]),
    normalizeHexColor(baseLevels[2] ?? DEFAULT_PALETTE.levels[2]),
    normalizeHexColor(baseLevels[3] ?? DEFAULT_PALETTE.levels[3]),
    normalizeHexColor(baseLevels[4] ?? DEFAULT_PALETTE.levels[4]),
  ];

  return {
    id,
    name,
    background,
    levels,
    textColor,
    glowColor,
  };
}
