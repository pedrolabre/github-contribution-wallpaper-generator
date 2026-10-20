import React from "react";
import type { ColorPalette } from "../types/contributions";
import { COLOR_PALETTES } from "../presets/colorPalettes";
import { Check, SlidersHorizontal } from "lucide-react";

export interface PaletteSelectorProps {
  palettes?: readonly ColorPalette[];
  selectedPaletteId: string;
  onSelectPalette: (palette: ColorPalette) => void;
  onOpenCustomEditor?: () => void;
  isCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  palettes = COLOR_PALETTES,
  selectedPaletteId,
  onSelectPalette,
  onOpenCustomEditor,
  isCustom = false,
  className = "",
  disabled = false,
}) => {
  return (
    <section
      role="region"
      aria-label="Paletas de cores OLED"
      className={`space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">
            Paletas de Cores OLED
          </h3>
          <p className="text-xs text-oled-muted">
            Selecione uma combinacao cromatica otimizada para alto contraste e telas pretas absolutas
          </p>
        </div>

        {onOpenCustomEditor && (
          <button
            type="button"
            onClick={onOpenCustomEditor}
            disabled={disabled}
            aria-label="Abrir editor de cores customizadas"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isCustom
                ? "bg-oled-surface border-neon-emerald text-neon-emerald ring-1 ring-neon-emerald/40"
                : "bg-oled-dark/80 border-oled-border text-oled-muted hover:text-white hover:border-oled-border/80"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Personalizar</span>
            {isCustom && <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald" />}
          </button>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Catalogo de paletas OLED"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {palettes.map((palette) => {
          const isSelected = !isCustom && selectedPaletteId === palette.id;

          return (
            <button
              key={palette.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Paleta ${palette.name}`}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onSelectPalette(palette);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 group ${
                isSelected
                  ? "bg-oled-surface border-neon-emerald ring-1 ring-neon-emerald/40"
                  : "bg-oled-dark/60 border-oled-border hover:border-oled-muted/50 hover:bg-oled-surface/40"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium tracking-wide text-white font-mono">
                  {palette.name}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-oled-border/60"
                    style={{ backgroundColor: palette.background }}
                    title={`Fundo: ${palette.background}`}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: palette.glowColor,
                      boxShadow: `0 0 6px ${palette.glowColor}`,
                    }}
                    title={`Bloom: ${palette.glowColor}`}
                  />

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-neon-emerald/20 flex items-center justify-center text-neon-emerald ml-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              <div
                className="w-full flex items-center gap-1 p-1.5 rounded-lg border border-oled-border/40"
                style={{ backgroundColor: palette.background }}
                aria-label={`Amostra de 5 niveis de ${palette.name}`}
              >
                {palette.levels.map((levelColor, index) => (
                  <span
                    key={`${palette.id}-level-${index}`}
                    className="h-3.5 flex-1 rounded-sm transition-transform group-hover:scale-y-110"
                    style={{
                      backgroundColor: levelColor,
                      boxShadow:
                        index >= 3
                          ? `0 0 4px ${palette.glowColor}80`
                          : undefined,
                    }}
                    title={`Nivel ${index}: ${levelColor}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
