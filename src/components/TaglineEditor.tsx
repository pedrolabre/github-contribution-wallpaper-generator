import React from "react";
import { Quote, RotateCcw, Sparkles } from "lucide-react";

export interface TaglinePreset {
  id: string;
  label: string;
  line1: string;
  line2: string;
}

export const TAGLINE_PRESETS: readonly TaglinePreset[] = [
  {
    id: "small-steps",
    label: "Small Steps",
    line1: "SMALL STEPS",
    line2: "BUILD BIG THINGS",
  },
  {
    id: "code-daily",
    label: "Code Daily",
    line1: "CODE DAILY",
    line2: "CREATE VALUE",
  },
  {
    id: "consistency",
    label: "Consistency",
    line1: "CONSISTENCY",
    line2: "OVER INTENSITY",
  },
  {
    id: "commit-today",
    label: "Compound",
    line1: "COMMIT TODAY",
    line2: "COMPOUND TOMORROW",
  },
  {
    id: "keep-shipping",
    label: "Keep Shipping",
    line1: "NEVER STOP",
    line2: "SHIPPING CODE",
  },
];

export interface TaglineEditorProps {
  line1: string;
  line2: string;
  onChange: (line1: string, line2: string) => void;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const TaglineEditor: React.FC<TaglineEditorProps> = ({
  line1,
  line2,
  onChange,
  onReset,
  className = "",
  disabled = false,
  maxLength = 32,
}) => {
  const handleLine1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.slice(0, maxLength);
    onChange(next, line2);
  };

  const handleLine2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.slice(0, maxLength);
    onChange(line1, next);
  };

  const handleApplyPreset = (preset: TaglinePreset) => {
    if (!disabled) {
      onChange(preset.line1, preset.line2);
    }
  };

  return (
    <div
      role="region"
      aria-label="Editor de Manifesto Inspiracional"
      className={`space-y-4 rounded-xl bg-oled-surface/40 border border-oled-border p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-neon-emerald" />
          <span className="text-xs font-semibold tracking-wide text-white uppercase font-mono">
            Manifesto do Wallpaper
          </span>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            aria-label="Restaurar manifesto padrao"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-oled-border text-oled-muted hover:text-white hover:border-oled-muted/60 transition-all ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label
              htmlFor="tagline-line-1"
              className="font-medium text-oled-muted"
            >
              Linha Superior
            </label>
            <span className="text-[10px] font-mono text-oled-muted">
              {line1.length}/{maxLength}
            </span>
          </div>
          <input
            id="tagline-line-1"
            type="text"
            value={line1}
            maxLength={maxLength}
            disabled={disabled}
            onChange={handleLine1Change}
            placeholder="Ex: SMALL STEPS"
            aria-label="Linha superior do manifesto"
            className="w-full px-3 py-2 rounded-lg bg-oled-dark/90 border border-oled-border text-xs font-mono text-white placeholder-oled-muted/50 focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/40 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label
              htmlFor="tagline-line-2"
              className="font-medium text-oled-muted"
            >
              Linha Inferior
            </label>
            <span className="text-[10px] font-mono text-oled-muted">
              {line2.length}/{maxLength}
            </span>
          </div>
          <input
            id="tagline-line-2"
            type="text"
            value={line2}
            maxLength={maxLength}
            disabled={disabled}
            onChange={handleLine2Change}
            placeholder="Ex: BUILD BIG THINGS"
            aria-label="Linha inferior do manifesto"
            className="w-full px-3 py-2 rounded-lg bg-oled-dark/90 border border-oled-border text-xs font-mono text-white placeholder-oled-muted/50 focus:outline-none focus:border-neon-emerald focus:ring-1 focus:ring-neon-emerald/40 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-oled-border/60">
        <div className="flex items-center gap-1.5 text-[11px] text-oled-muted mb-2">
          <Sparkles className="w-3 h-3 text-neon-emerald" />
          <span>Sugestoes rapidas:</span>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sugestoes de frases">
          {TAGLINE_PRESETS.map((preset) => {
            const isCurrent =
              line1.toUpperCase() === preset.line1 &&
              line2.toUpperCase() === preset.line2;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => handleApplyPreset(preset)}
                aria-pressed={isCurrent}
                aria-label={`Aplicar sugestao ${preset.label}`}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                  isCurrent
                    ? "bg-oled-surface border-neon-emerald text-neon-emerald ring-1 ring-neon-emerald/40"
                    : "bg-oled-dark/70 border-oled-border text-oled-muted hover:text-white hover:border-oled-muted/60"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
