import React from "react";
import { Terminal, Waves, Disc, Grid } from "lucide-react";
import type { LayoutModel } from "../types/wallpaper";

export interface ModelOption {
  id: LayoutModel;
  name: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MODEL_OPTIONS: readonly ModelOption[] = [
  {
    id: "matrix-stream",
    name: "Matrix Stream",
    description: "Feixe ascendente com corte diagonal e dispersao suave",
    badge: "Stream Diagonal",
    icon: Terminal,
  },
  {
    id: "topographic-wave",
    name: "Topographic Wave",
    description: "Paisagem de relevo senoidal 3D com projecao em perspectiva",
    badge: "Onda 3D",
    icon: Waves,
  },
  {
    id: "fibonacci-spiral",
    name: "Fibonacci Spiral",
    description: "Vortice polar arquimediano com rotacao tangencial das celulas",
    badge: "Espiral Polar",
    icon: Disc,
  },
  {
    id: "standard-grid",
    name: "Standard Grid",
    description: "Disposicao canônica da matriz GitHub com escala balanceada",
    badge: "Matriz Base",
    icon: Grid,
  },
];

export interface ModelSelectorProps {
  selectedModel: LayoutModel;
  onSelectModel: (model: LayoutModel) => void;
  className?: string;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  className = "",
  disabled = false,
}) => {
  return (
    <div
      data-testid="model-selector-container"
      className={`w-full ${className}`}
      role="region"
      aria-label="Seletor de Modelo de Wallpaper"
    >
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-200">
          Modelo Generativo
        </label>
        <span className="text-[11px] font-mono text-oled-muted">
          4 modelos disponiveis
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Modelos de disposicao"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {MODEL_OPTIONS.map((option) => {
          const isSelected = selectedModel === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              role="tab"
              type="button"
              id={`model-tab-${option.id}`}
              aria-selected={isSelected}
              aria-controls={`model-panel-${option.id}`}
              data-testid={`model-option-${option.id}`}
              disabled={disabled}
              onClick={() => onSelectModel(option.id)}
              className={`group relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-emerald ${
                isSelected
                  ? "bg-oled-surface border-neon-emerald shadow-[0_0_15px_rgba(0,255,89,0.15)] ring-1 ring-neon-emerald/40"
                  : "bg-oled-dark/60 border-oled-border hover:border-oled-muted/50 hover:bg-oled-dark/90 text-gray-300"
              } ${
                disabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-neon-emerald/10 text-neon-emerald"
                      : "bg-oled-surface border border-oled-border text-oled-muted group-hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  data-testid={`model-badge-${option.id}`}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border transition-colors ${
                    isSelected
                      ? "bg-neon-emerald/15 border-neon-emerald/40 text-neon-emerald font-semibold"
                      : "bg-oled-surface/80 border-oled-border text-oled-muted"
                  }`}
                >
                  {option.badge}
                </span>
              </div>

              <span
                className={`text-sm font-semibold mb-1 transition-colors ${
                  isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
                }`}
              >
                {option.name}
              </span>

              <p className="text-[11px] leading-relaxed text-oled-muted group-hover:text-gray-400 line-clamp-2">
                {option.description}
              </p>

              {isSelected && (
                <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-12 h-[2px] bg-neon-emerald rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
