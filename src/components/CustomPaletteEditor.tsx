import React, { useState, useEffect } from "react";
import type { ColorPalette } from "../types/contributions";
import { isValidHexColor, normalizeHexColor } from "../presets/colorPalettes";
import { RotateCcw, X, Palette as PaletteIcon } from "lucide-react";

export interface CustomPaletteEditorProps {
  palette: ColorPalette;
  onChange: (palette: ColorPalette) => void;
  onReset?: () => void;
  onClose?: () => void;
  className?: string;
  disabled?: boolean;
}

interface ColorFieldProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

const ColorField: React.FC<ColorFieldProps> = ({
  id,
  label,
  description,
  value,
  onColorChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputValue(next);
    if (isValidHexColor(next)) {
      onColorChange(normalizeHexColor(next));
    }
  };

  const handleBlur = () => {
    if (isValidHexColor(inputValue)) {
      const normalized = normalizeHexColor(inputValue);
      setInputValue(normalized);
      onColorChange(normalized);
    } else {
      setInputValue(value);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputValue(next);
    onColorChange(next);
  };

  const normalizedPickerValue = normalizeHexColor(value, "#000000");

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-oled-surface/50 border border-oled-border">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="block text-xs font-medium text-white truncate"
        >
          {label}
        </label>
        {description && (
          <span className="block text-[10px] text-oled-muted truncate">
            {description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor={`${id}-picker`}
          className="relative w-7 h-7 rounded-md cursor-pointer border border-oled-border overflow-hidden shrink-0 flex items-center justify-center transition-transform hover:scale-105"
          style={{ backgroundColor: normalizedPickerValue }}
          title={`Seletor visual para ${label}`}
        >
          <input
            id={`${id}-picker`}
            type="color"
            value={normalizedPickerValue}
            onChange={handlePickerChange}
            disabled={disabled}
            aria-label={`Seletor visual de cor para ${label}`}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          disabled={disabled}
          maxLength={7}
          placeholder="#000000"
          aria-label={`Entrada hexadecimal para ${label}`}
          className={`w-20 px-2 py-1 text-xs font-mono rounded bg-oled-dark border border-oled-border text-white text-center focus:outline-none focus:border-neon-emerald transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
};

export const CustomPaletteEditor: React.FC<CustomPaletteEditorProps> = ({
  palette,
  onChange,
  onReset,
  onClose,
  className = "",
  disabled = false,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...palette,
      name: e.target.value,
    });
  };

  const handleLevelChange = (index: number, color: string) => {
    const updatedLevels = [...palette.levels] as [string, string, string, string, string];
    updatedLevels[index] = color;
    onChange({
      ...palette,
      levels: updatedLevels,
    });
  };

  const handleBackgroundChange = (color: string) => {
    onChange({
      ...palette,
      background: color,
    });
  };

  const handleGlowChange = (color: string) => {
    onChange({
      ...palette,
      glowColor: color,
    });
  };

  const handleTextColorChange = (color: string) => {
    onChange({
      ...palette,
      textColor: color,
    });
  };

  return (
    <section
      role="region"
      aria-label="Editor de paleta customizada"
      className={`p-4 rounded-xl bg-oled-dark/90 border border-oled-border space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-oled-border/60 pb-3">
        <div className="flex items-center gap-2">
          <PaletteIcon className="w-4 h-4 text-neon-emerald" />
          <h3 className="text-sm font-semibold tracking-wide text-white">
            Editor de Cores Customizadas
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              aria-label="Restaurar paleta original"
              className={`p-1.5 rounded-lg border border-oled-border text-oled-muted hover:text-white hover:border-oled-border/80 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              title="Restaurar valores padrao"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              aria-label="Fechar editor de cores"
              className={`p-1.5 rounded-lg border border-oled-border text-oled-muted hover:text-white hover:border-oled-border/80 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              title="Fechar editor"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="custom-palette-name"
          className="block text-xs font-medium text-oled-muted"
        >
          Nome da Paleta
        </label>
        <input
          id="custom-palette-name"
          type="text"
          value={palette.name}
          onChange={handleNameChange}
          disabled={disabled}
          placeholder="Minha Paleta"
          aria-label="Nome da paleta customizada"
          className={`w-full px-3 py-1.5 text-xs rounded-lg bg-oled-surface border border-oled-border text-white placeholder:text-oled-muted/50 focus:outline-none focus:border-neon-emerald transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-medium text-oled-muted">
          Pre-visualizacao ao Vivo
        </span>
        <div
          className="p-3 rounded-lg border border-oled-border/60 flex items-center justify-between gap-2"
          style={{ backgroundColor: palette.background }}
          aria-label="Barra de pre-visualizacao cromatica"
        >
          <div className="flex items-center gap-1.5 flex-1">
            {palette.levels.map((color, index) => (
              <span
                key={`preview-level-${index}`}
                className="h-5 flex-1 rounded-sm"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    index >= 3
                      ? `0 0 8px ${palette.glowColor}`
                      : undefined,
                }}
                title={`Nivel ${index}: ${color}`}
              />
            ))}
          </div>

          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-oled-border/40 shrink-0"
            style={{ color: palette.textColor }}
          >
            HUD
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-oled-muted">
          Cores Globais e de Efeito
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ColorField
            id="field-background"
            label="Fundo OLED"
            description="Preto absoluto"
            value={palette.background}
            onColorChange={handleBackgroundChange}
            disabled={disabled}
          />
          <ColorField
            id="field-glow"
            label="Bloom / Glow"
            description="Halos nos commits altos"
            value={palette.glowColor}
            onColorChange={handleGlowChange}
            disabled={disabled}
          />
          <ColorField
            id="field-text"
            label="HUD / Texto"
            description="Metadados dos 4 cantos"
            value={palette.textColor}
            onColorChange={handleTextColorChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-oled-muted">
          Niveis de Intensidade de Contribuicao
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <ColorField
            id="field-level-0"
            label="Nivel 0"
            description="Sem commits"
            value={palette.levels[0]}
            onColorChange={(color) => handleLevelChange(0, color)}
            disabled={disabled}
          />
          <ColorField
            id="field-level-1"
            label="Nivel 1"
            description="Baixo volume"
            value={palette.levels[1]}
            onColorChange={(color) => handleLevelChange(1, color)}
            disabled={disabled}
          />
          <ColorField
            id="field-level-2"
            label="Nivel 2"
            description="Medio volume"
            value={palette.levels[2]}
            onColorChange={(color) => handleLevelChange(2, color)}
            disabled={disabled}
          />
          <ColorField
            id="field-level-3"
            label="Nivel 3"
            description="Alto (com bloom)"
            value={palette.levels[3]}
            onColorChange={(color) => handleLevelChange(3, color)}
            disabled={disabled}
          />
          <ColorField
            id="field-level-4"
            label="Nivel 4"
            description="Pico de atividade"
            value={palette.levels[4]}
            onColorChange={(color) => handleLevelChange(4, color)}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
};
