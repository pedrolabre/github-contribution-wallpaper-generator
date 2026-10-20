import React from "react";
import { SlidersHorizontal, Info } from "lucide-react";
import type {
  LayoutModel,
  MatrixStreamParams,
  TopographicWaveParams,
  FibonacciSpiralParams,
} from "../types/wallpaper";

export interface ModelSpecificControlsProps {
  model: LayoutModel;
  matrixStreamParams: MatrixStreamParams;
  topographicWaveParams: TopographicWaveParams;
  fibonacciSpiralParams: FibonacciSpiralParams;
  onMatrixStreamChange: <K extends keyof MatrixStreamParams>(
    key: K,
    value: MatrixStreamParams[K],
  ) => void;
  onTopographicWaveChange: <K extends keyof TopographicWaveParams>(
    key: K,
    value: TopographicWaveParams[K],
  ) => void;
  onFibonacciSpiralChange: <K extends keyof FibonacciSpiralParams>(
    key: K,
    value: FibonacciSpiralParams[K],
  ) => void;
  className?: string;
  disabled?: boolean;
}

export const ModelSpecificControls: React.FC<ModelSpecificControlsProps> = ({
  model,
  matrixStreamParams,
  topographicWaveParams,
  fibonacciSpiralParams,
  onMatrixStreamChange,
  onTopographicWaveChange,
  onFibonacciSpiralChange,
  className = "",
  disabled = false,
}) => {
  return (
    <div
      data-testid="model-specific-controls-container"
      className={`w-full rounded-2xl bg-oled-dark/60 border border-oled-border p-5 ${className}`}
      role="region"
      aria-label="Parametros Especificos do Modelo Generativo"
    >
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-oled-surface text-gray-200">
        <div className="w-6 h-6 rounded-md bg-oled-surface border border-oled-border flex items-center justify-center text-neon-emerald">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Parametros do Modelo
          </h3>
          <p className="text-[11px] text-oled-muted">
            Ajustes parametricos contextuais para o modelo generativo selecionado
          </p>
        </div>
      </div>

      {model === "matrix-stream" && (
        <div
          data-testid="matrix-stream-controls"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="matrix-tiltAngle" className="text-xs font-medium text-gray-300">
                Inclinacao do Feixe
              </label>
              <span
                data-testid="matrix-value-tiltAngle"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {matrixStreamParams.tiltAngle}deg
              </span>
            </div>
            <input
              id="matrix-tiltAngle"
              type="range"
              min={-45}
              max={45}
              step={1}
              value={matrixStreamParams.tiltAngle}
              disabled={disabled}
              aria-label="Inclinacao do Feixe"
              aria-valuemin={-45}
              aria-valuemax={45}
              aria-valuenow={matrixStreamParams.tiltAngle}
              onChange={(e) => onMatrixStreamChange("tiltAngle", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>-45deg</span>
              <span>+45deg</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="matrix-columnWidth" className="text-xs font-medium text-gray-300">
                Largura da Coluna
              </label>
              <span
                data-testid="matrix-value-columnWidth"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {matrixStreamParams.columnWidth}px
              </span>
            </div>
            <input
              id="matrix-columnWidth"
              type="range"
              min={4}
              max={80}
              step={1}
              value={matrixStreamParams.columnWidth}
              disabled={disabled}
              aria-label="Largura da Coluna"
              aria-valuemin={4}
              aria-valuemax={80}
              aria-valuenow={matrixStreamParams.columnWidth}
              onChange={(e) => onMatrixStreamChange("columnWidth", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>4px</span>
              <span>80px</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="matrix-scatterFactor" className="text-xs font-medium text-gray-300">
                Fator de Dispersao
              </label>
              <span
                data-testid="matrix-value-scatterFactor"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {matrixStreamParams.scatterFactor.toFixed(2)}
              </span>
            </div>
            <input
              id="matrix-scatterFactor"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={matrixStreamParams.scatterFactor}
              disabled={disabled}
              aria-label="Fator de Dispersao"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={matrixStreamParams.scatterFactor}
              onChange={(e) => onMatrixStreamChange("scatterFactor", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.00</span>
              <span>1.00</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="matrix-verticalStagger" className="text-xs font-medium text-gray-300">
                Passo Vertical
              </label>
              <span
                data-testid="matrix-value-verticalStagger"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {matrixStreamParams.verticalStagger}px
              </span>
            </div>
            <input
              id="matrix-verticalStagger"
              type="range"
              min={-50}
              max={50}
              step={1}
              value={matrixStreamParams.verticalStagger}
              disabled={disabled}
              aria-label="Passo Vertical"
              aria-valuemin={-50}
              aria-valuemax={50}
              aria-valuenow={matrixStreamParams.verticalStagger}
              onChange={(e) => onMatrixStreamChange("verticalStagger", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>-50px</span>
              <span>+50px</span>
            </div>
          </div>
        </div>
      )}

      {model === "topographic-wave" && (
        <div
          data-testid="topographic-wave-controls"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-amplitude" className="text-xs font-medium text-gray-300">
                Amplitude da Onda
              </label>
              <span
                data-testid="wave-value-amplitude"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.waveAmplitude}px
              </span>
            </div>
            <input
              id="wave-amplitude"
              type="range"
              min={0}
              max={150}
              step={1}
              value={topographicWaveParams.waveAmplitude}
              disabled={disabled}
              aria-label="Amplitude da Onda"
              aria-valuemin={0}
              aria-valuemax={150}
              aria-valuenow={topographicWaveParams.waveAmplitude}
              onChange={(e) => onTopographicWaveChange("waveAmplitude", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0px</span>
              <span>150px</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-freqX" className="text-xs font-medium text-gray-300">
                Frequencia X
              </label>
              <span
                data-testid="wave-value-freqX"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.waveFrequencyX.toFixed(3)}
              </span>
            </div>
            <input
              id="wave-freqX"
              type="range"
              min={0.005}
              max={0.15}
              step={0.005}
              value={topographicWaveParams.waveFrequencyX}
              disabled={disabled}
              aria-label="Frequencia X"
              aria-valuemin={0.005}
              aria-valuemax={0.15}
              aria-valuenow={topographicWaveParams.waveFrequencyX}
              onChange={(e) => onTopographicWaveChange("waveFrequencyX", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.005</span>
              <span>0.150</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-freqZ" className="text-xs font-medium text-gray-300">
                Frequencia Z
              </label>
              <span
                data-testid="wave-value-freqZ"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.waveFrequencyZ.toFixed(3)}
              </span>
            </div>
            <input
              id="wave-freqZ"
              type="range"
              min={0.005}
              max={0.2}
              step={0.005}
              value={topographicWaveParams.waveFrequencyZ}
              disabled={disabled}
              aria-label="Frequencia Z"
              aria-valuemin={0.005}
              aria-valuemax={0.2}
              aria-valuenow={topographicWaveParams.waveFrequencyZ}
              onChange={(e) => onTopographicWaveChange("waveFrequencyZ", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.005</span>
              <span>0.200</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-perspective" className="text-xs font-medium text-gray-300">
                Distancia Focal
              </label>
              <span
                data-testid="wave-value-perspective"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.perspectiveFocal}px
              </span>
            </div>
            <input
              id="wave-perspective"
              type="range"
              min={200}
              max={1500}
              step={20}
              value={topographicWaveParams.perspectiveFocal}
              disabled={disabled}
              aria-label="Distancia Focal"
              aria-valuemin={200}
              aria-valuemax={1500}
              aria-valuenow={topographicWaveParams.perspectiveFocal}
              onChange={(e) => onTopographicWaveChange("perspectiveFocal", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>200px</span>
              <span>1500px</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-pitch" className="text-xs font-medium text-gray-300">
                Inclinacao Camera
              </label>
              <span
                data-testid="wave-value-pitch"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.cameraPitch.toFixed(2)}rad
              </span>
            </div>
            <input
              id="wave-pitch"
              type="range"
              min={-0.5}
              max={1.2}
              step={0.02}
              value={topographicWaveParams.cameraPitch}
              disabled={disabled}
              aria-label="Inclinacao Camera"
              aria-valuemin={-0.5}
              aria-valuemax={1.2}
              aria-valuenow={topographicWaveParams.cameraPitch}
              onChange={(e) => onTopographicWaveChange("cameraPitch", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>-0.5rad</span>
              <span>+1.2rad</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-fog" className="text-xs font-medium text-gray-300">
                Nevoa de Distancia
              </label>
              <span
                data-testid="wave-value-fog"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.depthFogStart.toFixed(2)}
              </span>
            </div>
            <input
              id="wave-fog"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={topographicWaveParams.depthFogStart}
              disabled={disabled}
              aria-label="Nevoa de Distancia"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={topographicWaveParams.depthFogStart}
              onChange={(e) => onTopographicWaveChange("depthFogStart", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.00</span>
              <span>1.00</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="wave-elevation" className="text-xs font-medium text-gray-300">
                Elevacao por Commits
              </label>
              <span
                data-testid="wave-value-elevation"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {topographicWaveParams.elevationMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              id="wave-elevation"
              type="range"
              min={0}
              max={6}
              step={0.2}
              value={topographicWaveParams.elevationMultiplier}
              disabled={disabled}
              aria-label="Elevacao por Commits"
              aria-valuemin={0}
              aria-valuemax={6}
              aria-valuenow={topographicWaveParams.elevationMultiplier}
              onChange={(e) => onTopographicWaveChange("elevationMultiplier", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.0x</span>
              <span>6.0x</span>
            </div>
          </div>
        </div>
      )}

      {model === "fibonacci-spiral" && (
        <div
          data-testid="fibonacci-spiral-controls"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="fib-tightness" className="text-xs font-medium text-gray-300">
                Aperto da Espiral
              </label>
              <span
                data-testid="fib-value-tightness"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {fibonacciSpiralParams.spiralTightness.toFixed(2)}
              </span>
            </div>
            <input
              id="fib-tightness"
              type="range"
              min={0.2}
              max={5}
              step={0.1}
              value={fibonacciSpiralParams.spiralTightness}
              disabled={disabled}
              aria-label="Aperto da Espiral"
              aria-valuemin={0.2}
              aria-valuemax={5}
              aria-valuenow={fibonacciSpiralParams.spiralTightness}
              onChange={(e) => onFibonacciSpiralChange("spiralTightness", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.2</span>
              <span>5.0</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="fib-innerRadius" className="text-xs font-medium text-gray-300">
                Raio Inicial
              </label>
              <span
                data-testid="fib-value-innerRadius"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {fibonacciSpiralParams.innerRadius}px
              </span>
            </div>
            <input
              id="fib-innerRadius"
              type="range"
              min={0}
              max={120}
              step={1}
              value={fibonacciSpiralParams.innerRadius}
              disabled={disabled}
              aria-label="Raio Inicial"
              aria-valuemin={0}
              aria-valuemax={120}
              aria-valuenow={fibonacciSpiralParams.innerRadius}
              onChange={(e) => onFibonacciSpiralChange("innerRadius", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0px</span>
              <span>120px</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div className="flex items-center justify-between">
              <label htmlFor="fib-outerScale" className="text-xs font-medium text-gray-300">
                Escala Externa
              </label>
              <span
                data-testid="fib-value-outerScale"
                className="text-[11px] font-mono text-neon-emerald px-1.5 py-0.5 rounded bg-oled-surface border border-oled-border/60"
              >
                {fibonacciSpiralParams.outerRadiusScale.toFixed(2)}x
              </span>
            </div>
            <input
              id="fib-outerScale"
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={fibonacciSpiralParams.outerRadiusScale}
              disabled={disabled}
              aria-label="Escala Externa"
              aria-valuemin={0.2}
              aria-valuemax={3}
              aria-valuenow={fibonacciSpiralParams.outerRadiusScale}
              onChange={(e) => onFibonacciSpiralChange("outerRadiusScale", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-oled-surface rounded-lg appearance-none cursor-pointer accent-[#00ff59] focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-oled-muted">
              <span>0.2x</span>
              <span>3.0x</span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div>
              <span className="text-xs font-medium text-gray-300 block mb-1">
                Rotacao Tangencial
              </span>
              <p className="text-[10px] text-oled-muted">
                Rotaciona celulas no eixo da espiral
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={fibonacciSpiralParams.cellRotation}
              data-testid="fib-cellRotation-toggle"
              disabled={disabled}
              onClick={() => onFibonacciSpiralChange("cellRotation", !fibonacciSpiralParams.cellRotation)}
              className={`mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                fibonacciSpiralParams.cellRotation
                  ? "bg-neon-emerald/15 border-neon-emerald/50 text-neon-emerald font-semibold"
                  : "bg-oled-surface border-oled-border text-oled-muted hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>Rotacao</span>
              <span>{fibonacciSpiralParams.cellRotation ? "ATIVA" : "DESLIGADA"}</span>
            </button>
          </div>

          <div className="flex flex-col justify-between p-3 rounded-xl bg-oled-deep/40 border border-oled-surface">
            <div>
              <span className="text-xs font-medium text-gray-300 block mb-1">
                Passo Angular
              </span>
              <p className="text-[10px] text-oled-muted">
                Curvatura da distribuicao polar
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                data-testid="fib-step-archimedean"
                disabled={disabled}
                onClick={() => onFibonacciSpiralChange("angularStep", "archimedean")}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${
                  fibonacciSpiralParams.angularStep === "archimedean"
                    ? "bg-neon-emerald/15 border-neon-emerald/50 text-neon-emerald font-semibold"
                    : "bg-oled-surface border-oled-border text-oled-muted hover:text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Linear
              </button>
              <button
                type="button"
                data-testid="fib-step-golden-ratio"
                disabled={disabled}
                onClick={() => onFibonacciSpiralChange("angularStep", "golden-ratio")}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${
                  fibonacciSpiralParams.angularStep === "golden-ratio"
                    ? "bg-neon-emerald/15 border-neon-emerald/50 text-neon-emerald font-semibold"
                    : "bg-oled-surface border-oled-border text-oled-muted hover:text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Aureo
              </button>
            </div>
          </div>
        </div>
      )}

      {model === "standard-grid" && (
        <div
          data-testid="standard-grid-controls"
          className="flex items-center gap-3 p-4 rounded-xl bg-oled-deep/40 border border-oled-surface text-oled-muted"
        >
          <div className="w-8 h-8 rounded-lg bg-oled-surface border border-oled-border flex items-center justify-center text-neon-emerald shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-200 mb-0.5">
              Grade Canonica Ativa
            </h4>
            <p className="text-[11px] leading-relaxed">
              O modelo de grade tradicional do GitHub e governado diretamente pelos parametros de Geometria Geral (tamanho da celula, espacamento, escala e arredondamento) com disposicao automatica adaptada ao formato do dispositivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSpecificControls;
