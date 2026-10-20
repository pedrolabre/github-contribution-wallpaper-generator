import React from "react";
import { Sliders, RotateCcw } from "lucide-react";

export interface GeometryValues {
  cellSize: number;
  cellGap: number;
  borderRadius: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface GeometrySliderConfig {
  key: keyof GeometryValues;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

export const GEOMETRY_SLIDERS: readonly GeometrySliderConfig[] = [
  {
    key: "cellSize",
    label: "Tamanho da Celula",
    min: 4,
    max: 64,
    step: 1,
    unit: "px",
    description: "Dimensao base de cada bloco de contribuicao",
  },
  {
    key: "cellGap",
    label: "Espacamento",
    min: 0,
    max: 30,
    step: 1,
    unit: "px",
    description: "Distancia entre celulas adjacentes",
  },
  {
    key: "borderRadius",
    label: "Arredondamento",
    min: 0,
    max: 32,
    step: 1,
    unit: "px",
    description: "Curvatura dos cantos do squircle das celulas",
  },
  {
    key: "scale",
    label: "Escala Geral",
    min: 0.1,
    max: 5,
    step: 0.05,
    unit: "x",
    description: "Multiplicador de zoom e escala do modelo",
  },
  {
    key: "offsetX",
    label: "Deslocamento X",
    min: -500,
    max: 500,
    step: 1,
    unit: "px",
    description: "Posicao horizontal relativa ao centro do canvas",
  },
  {
    key: "offsetY",
    label: "Deslocamento Y",
    min: -500,
    max: 500,
    step: 1,
    unit: "px",
    description: "Posicao vertical relativa ao centro do canvas",
  },
];

export interface GeometryControlsProps {
  values: GeometryValues;
  onChange: <K extends keyof GeometryValues>(key: K, value: GeometryValues[K]) => void;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
}

export const GeometryControls: React.FC<GeometryControlsProps> = ({
  values,
  onChange,
  onReset,
  className = "",
  disabled = false,
}) => {
  return (
    <div
      data-testid="geometry-controls-container"
      className={`w-full rounded-2xl bg-oled-dark/60 border border-oled-border p-5 ${className}`}
      role="region"
      aria-label="Controles de Geometria do Wallpaper"
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-oled-surface">
        <div className="flex items-center gap-2 text-gray-200">
          <div className="w-6 h-6 rounded-md bg-oled-surface border border-oled-border flex items-center justify-center text-neon-emerald">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Geometria Geral
            </h3>
            <p className="text-[11px] text-oled-muted">
              Dimensoes base, espacamento e alinhamento no canvas
            </p>
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            data-testid="geometry-reset-button"
            aria-label="Restaurar geometria padrao"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-oled-muted hover:text-white bg-oled-surface hover:bg-oled-surface/80 border border-oled-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resetar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GEOMETRY_SLIDERS.map((config) => {
          const currentValue = values[config.key];
          const inputId = `geometry-slider-${config.key}`;
          const formattedValue =
            config.unit === "x"
              ? `${Number(currentValue).toFixed(2)}${config.unit}`
              : `${Math.round(currentValue)}${config.unit}`;

          return (
            <div
              key={config.key}
              data-testid={`geometry-field-${config.key}`}
              className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface hover:border-oled-border/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor={inputId}
                  className="text-xs font-medium text-gray-300"
                >
                  {config.label}
                </label>
                <span
                  data-testid={`geometry-value-${config.key}`}
                  className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
                >
                  {formattedValue}
                </span>
              </div>

              <input
                id={inputId}
                name={config.key}
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={currentValue}
                disabled={disabled}
                aria-label={config.label}
                aria-valuemin={config.min}
                aria-valuemax={config.max}
                aria-valuenow={currentValue}
                onChange={(e) => {
                  const numVal = parseFloat(e.target.value);
                  if (!Number.isNaN(numVal)) {
                    onChange(config.key, numVal);
                  }
                }}
                className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none focus:ring-1 focus:ring-neon-emerald/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-oled-muted">
                <span>
                  {config.min}
                  {config.unit}
                </span>
                <span className="truncate max-w-[120px] text-right">
                  {config.description}
                </span>
                <span>
                  {config.max}
                  {config.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeometryControls;
