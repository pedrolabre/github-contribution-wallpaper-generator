import React from "react";
import type { CornerHUDConfig } from "../types/wallpaper";
import { TaglineEditor } from "./TaglineEditor";
import { isValidHexColor, normalizeHexColor } from "../presets/colorPalettes";
import {
  RotateCcw,
  Eye,
  EyeOff,
  User,
  Calendar,
  Type,
  Palette,
  SlidersHorizontal,
} from "lucide-react";

export const DEFAULT_HUD_CONFIG: CornerHUDConfig = {
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

export const HUD_FONT_OPTIONS = [
  { value: "monospace", label: "Monospace (Padrao)" },
  { value: "sans-serif", label: "Sans-Serif" },
  { value: "serif", label: "Serif" },
  { value: "system-ui", label: "System UI" },
] as const;

interface QuadrantToggleItem {
  id: string;
  field: keyof CornerHUDConfig;
  label: string;
  description: string;
}

const TOP_LEFT_ITEMS: readonly QuadrantToggleItem[] = [
  { id: "hud-show-github-logo", field: "showGitHubLogo", label: "Icone Octocat", description: "Icone vetorial estilizado do GitHub" },
  { id: "hud-show-category-label", field: "showCategoryLabel", label: "Rotulo de Categoria", description: "Texto 'GITHUB CONTRIBUTIONS'" },
  { id: "hud-show-username", field: "showUsername", label: "Identificador do Usuario", description: "Handle @username do perfil" },
];

const TOP_RIGHT_ITEMS: readonly QuadrantToggleItem[] = [
  { id: "hud-show-year", field: "showYear", label: "Ano Civil", description: "Ano civil selecionado das contribuicoes" },
  { id: "hud-show-total-commits", field: "showTotalCommits", label: "Total de Contribuicoes", description: "Contagem formatada de commits no ano" },
  { id: "hud-show-weekday-legend", field: "showWeekdayLegend", label: "Legenda Semanal (Base Direita)", description: "Indicadores S M T W T F S e swatches" },
];

export interface HUDControlsProps {
  config: CornerHUDConfig;
  onChange: (updatedConfig: CornerHUDConfig) => void;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
}

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-oled-surface/30 border border-oled-border/60 hover:border-oled-border transition-colors">
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className={`block text-xs font-medium cursor-pointer ${disabled ? "text-oled-muted cursor-not-allowed" : "text-white"}`}>
        {label}
      </label>
      {description && <span className="block text-[10px] text-oled-muted truncate">{description}</span>}
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
        checked ? "bg-neon-emerald justify-end" : "bg-oled-surface border border-oled-border justify-start"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className={`w-4 h-4 rounded-full transition-transform ${checked ? "bg-black" : "bg-oled-muted"}`} />
    </button>
  </div>
);

export const HUDControls: React.FC<HUDControlsProps> = ({
  config,
  onChange,
  onReset,
  className = "",
  disabled = false,
}) => {
  const isHudEnabled = config.showHUD && !disabled;
  const updateField = <K extends keyof CornerHUDConfig>(field: K, value: CornerHUDConfig[K]) => {
    onChange({ ...config, [field]: value });
  };
  const handleColorChange = (color: string) => {
    if (isValidHexColor(color)) updateField("hudColor", normalizeHexColor(color));
  };

  return (
    <section role="region" aria-label="Controles do HUD de Borda" className={`space-y-5 rounded-2xl bg-oled-dark/60 border border-oled-border p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-oled-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-oled-surface border border-oled-border flex items-center justify-center text-neon-emerald">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">HUD de Borda e Metadados</h3>
            <p className="text-xs text-oled-muted">Controle granular dos elementos visuais distribuidos nos 4 quadrantes da tela</p>
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            aria-label="Restaurar configuracoes de HUD"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-oled-border text-oled-muted hover:text-white hover:border-oled-muted/80 transition-all ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-oled-surface/50 border border-oled-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {config.showHUD ? <Eye className="w-5 h-5 text-neon-emerald" /> : <EyeOff className="w-5 h-5 text-oled-muted" />}
          <div>
            <span className="block text-xs font-semibold text-white">Exibir HUD Global</span>
            <span className="block text-[11px] text-oled-muted">Ativa ou oculta todos os metadados dos quatro cantos do wallpaper</span>
          </div>
        </div>
        <button
          id="hud-master-toggle"
          type="button"
          role="switch"
          aria-checked={config.showHUD}
          aria-label="Exibir HUD Global"
          disabled={disabled}
          onClick={() => updateField("showHUD", !config.showHUD)}
          className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
            config.showHUD ? "bg-neon-emerald justify-end" : "bg-oled-surface border border-oled-border justify-start"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className={`w-5 h-5 rounded-full transition-transform ${config.showHUD ? "bg-black" : "bg-oled-muted"}`} />
        </button>
      </div>

      <div className={`space-y-5 transition-opacity ${!isHudEnabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-3.5 rounded-xl bg-oled-surface/20 border border-oled-border/60">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-oled-border/40">
              <User className="w-3.5 h-3.5 text-neon-emerald" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Topo Esquerdo: Identidade</h4>
            </div>
            {TOP_LEFT_ITEMS.map((item) => (
              <ToggleSwitch
                key={item.id}
                id={item.id}
                label={item.label}
                description={item.description}
                checked={Boolean(config[item.field])}
                onChange={(checked) => updateField(item.field, checked as unknown as CornerHUDConfig[typeof item.field])}
                disabled={!isHudEnabled}
              />
            ))}
          </div>

          <div className="space-y-2 p-3.5 rounded-xl bg-oled-surface/20 border border-oled-border/60">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-oled-border/40">
              <Calendar className="w-3.5 h-3.5 text-neon-emerald" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Topo Direito: Metricas</h4>
            </div>
            {TOP_RIGHT_ITEMS.map((item) => (
              <ToggleSwitch
                key={item.id}
                id={item.id}
                label={item.label}
                description={item.description}
                checked={Boolean(config[item.field])}
                onChange={(checked) => updateField(item.field, checked as unknown as CornerHUDConfig[typeof item.field])}
                disabled={!isHudEnabled}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 p-3.5 rounded-xl bg-oled-surface/20 border border-oled-border/60">
          <div className="flex items-center justify-between pb-1.5 border-b border-oled-border/40">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Base Esquerda: Manifesto</h4>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-oled-muted">Ativar Manifesto</span>
              <button
                id="hud-show-tagline-toggle"
                type="button"
                role="switch"
                aria-checked={config.showTagline}
                aria-label="Ativar Manifesto Inspiracional"
                disabled={!isHudEnabled}
                onClick={() => updateField("showTagline", !config.showTagline)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  config.showTagline ? "bg-neon-emerald justify-end" : "bg-oled-surface border border-oled-border justify-start"
                } ${!isHudEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`w-4 h-4 rounded-full transition-transform ${config.showTagline ? "bg-black" : "bg-oled-muted"}`} />
              </button>
            </div>
          </div>

          {config.showTagline && (
            <TaglineEditor
              line1={config.taglineLine1}
              line2={config.taglineLine2}
              onChange={(line1, line2) => onChange({ ...config, taglineLine1: line1, taglineLine2: line2 })}
              onReset={() => onChange({ ...config, taglineLine1: DEFAULT_HUD_CONFIG.taglineLine1, taglineLine2: DEFAULT_HUD_CONFIG.taglineLine2 })}
              disabled={!isHudEnabled}
            />
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-oled-surface/20 border border-oled-border/60">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3 pb-1.5 border-b border-oled-border/40">
            Tipografia e Estilo Visual
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hud-color-picker" className="flex items-center gap-1.5 text-xs font-medium text-oled-muted mb-1.5">
                <Palette className="w-3.5 h-3.5 text-neon-emerald" />
                <span>Cor do HUD</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="hud-color-picker"
                  type="color"
                  value={normalizeHexColor(config.hudColor, "#00ff59")}
                  disabled={!isHudEnabled}
                  onChange={(e) => handleColorChange(e.target.value)}
                  aria-label="Seletor de cor do HUD"
                  className="w-8 h-8 rounded-lg bg-transparent border border-oled-border cursor-pointer p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  id="hud-color-text"
                  type="text"
                  value={config.hudColor}
                  disabled={!isHudEnabled}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#00ff59"
                  aria-label="Codigo hexadecimal da cor do HUD"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-oled-dark/90 border border-oled-border text-xs font-mono text-white placeholder-oled-muted/50 focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/40 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hud-font-family" className="flex items-center gap-1.5 text-xs font-medium text-oled-muted mb-1.5">
                <Type className="w-3.5 h-3.5 text-neon-emerald" />
                <span>Familia Tipografica</span>
              </label>
              <select
                id="hud-font-family"
                value={config.fontFamily}
                disabled={!isHudEnabled}
                onChange={(e) => updateField("fontFamily", e.target.value)}
                aria-label="Familia tipografica do HUD"
                className="w-full px-3 py-1.5 rounded-lg bg-oled-dark/90 border border-oled-border text-xs font-mono text-white focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {HUD_FONT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-oled-dark text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
