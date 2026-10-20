import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelSpecificControls } from "../../src/components/ModelSpecificControls";
import type {
  MatrixStreamParams,
  TopographicWaveParams,
  FibonacciSpiralParams,
} from "../../src/types/wallpaper";

describe("ModelSpecificControls component", () => {
  const defaultMatrix: MatrixStreamParams = {
    tiltAngle: 25,
    columnWidth: 28,
    scatterFactor: 0.35,
    verticalStagger: 12,
  };

  const defaultWave: TopographicWaveParams = {
    waveAmplitude: 60,
    waveFrequencyX: 0.04,
    waveFrequencyZ: 0.08,
    perspectiveFocal: 700,
    cameraPitch: 0.45,
    depthFogStart: 0.2,
    elevationMultiplier: 2.5,
  };

  const defaultSpiral: FibonacciSpiralParams = {
    spiralTightness: 1.5,
    innerRadius: 20,
    outerRadiusScale: 1.2,
    cellRotation: true,
    angularStep: "archimedean",
  };

  it("renderiza apenas os controles de matrix-stream quando model for matrix-stream", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="matrix-stream"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    expect(screen.getByTestId("matrix-stream-controls")).toBeInTheDocument();
    expect(screen.queryByTestId("topographic-wave-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fibonacci-spiral-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("standard-grid-controls")).not.toBeInTheDocument();

    expect(screen.getByTestId("matrix-value-tiltAngle")).toHaveTextContent("25deg");
    expect(screen.getByTestId("matrix-value-columnWidth")).toHaveTextContent("28px");
    expect(screen.getByTestId("matrix-value-scatterFactor")).toHaveTextContent("0.35");
    expect(screen.getByTestId("matrix-value-verticalStagger")).toHaveTextContent("12px");
  });

  it("dispara callback onMatrixStreamChange ao modificar parametros do matrix-stream", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="matrix-stream"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    const tiltInput = screen.getByLabelText("Inclinacao do Feixe");
    fireEvent.change(tiltInput, { target: { value: "-15" } });
    expect(onMatrix).toHaveBeenCalledWith("tiltAngle", -15);

    const widthInput = screen.getByLabelText("Largura da Coluna");
    fireEvent.change(widthInput, { target: { value: "32" } });
    expect(onMatrix).toHaveBeenCalledWith("columnWidth", 32);

    const scatterInput = screen.getByLabelText("Fator de Dispersao");
    fireEvent.change(scatterInput, { target: { value: "0.5" } });
    expect(onMatrix).toHaveBeenCalledWith("scatterFactor", 0.5);

    const staggerInput = screen.getByLabelText("Passo Vertical");
    fireEvent.change(staggerInput, { target: { value: "8" } });
    expect(onMatrix).toHaveBeenCalledWith("verticalStagger", 8);
  });

  it("renderiza apenas os controles de topographic-wave quando model for topographic-wave", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="topographic-wave"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    expect(screen.getByTestId("topographic-wave-controls")).toBeInTheDocument();
    expect(screen.queryByTestId("matrix-stream-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fibonacci-spiral-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("standard-grid-controls")).not.toBeInTheDocument();

    expect(screen.getByTestId("wave-value-amplitude")).toHaveTextContent("60px");
    expect(screen.getByTestId("wave-value-freqX")).toHaveTextContent("0.040");
    expect(screen.getByTestId("wave-value-perspective")).toHaveTextContent("700px");
  });

  it("dispara callback onTopographicWaveChange ao modificar parametros da onda 3d", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="topographic-wave"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    const ampInput = screen.getByLabelText("Amplitude da Onda");
    fireEvent.change(ampInput, { target: { value: "85" } });
    expect(onWave).toHaveBeenCalledWith("waveAmplitude", 85);

    const perspectiveInput = screen.getByLabelText("Distancia Focal");
    fireEvent.change(perspectiveInput, { target: { value: "900" } });
    expect(onWave).toHaveBeenCalledWith("perspectiveFocal", 900);
  });

  it("renderiza controles de fibonacci-spiral e alterna rotacao e passo angular", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="fibonacci-spiral"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    expect(screen.getByTestId("fibonacci-spiral-controls")).toBeInTheDocument();
    expect(screen.queryByTestId("matrix-stream-controls")).not.toBeInTheDocument();

    expect(screen.getByTestId("fib-value-tightness")).toHaveTextContent("1.50");
    expect(screen.getByTestId("fib-value-innerRadius")).toHaveTextContent("20px");
    expect(screen.getByTestId("fib-value-outerScale")).toHaveTextContent("1.20x");

    // Toggle cellRotation
    const rotationBtn = screen.getByTestId("fib-cellRotation-toggle");
    expect(rotationBtn).toHaveAttribute("aria-checked", "true");
    fireEvent.click(rotationBtn);
    expect(onSpiral).toHaveBeenCalledWith("cellRotation", false);

    // Toggle angularStep
    const goldenBtn = screen.getByTestId("fib-step-golden-ratio");
    fireEvent.click(goldenBtn);
    expect(onSpiral).toHaveBeenCalledWith("angularStep", "golden-ratio");

    const archimedeanBtn = screen.getByTestId("fib-step-archimedean");
    fireEvent.click(archimedeanBtn);
    expect(onSpiral).toHaveBeenCalledWith("angularStep", "archimedean");
  });

  it("renderiza painel informativo para standard-grid", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="standard-grid"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
      />,
    );

    expect(screen.getByTestId("standard-grid-controls")).toBeInTheDocument();
    expect(screen.queryByTestId("matrix-stream-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("topographic-wave-controls")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fibonacci-spiral-controls")).not.toBeInTheDocument();
    expect(screen.getByText(/Grade Canonica Ativa/i)).toBeInTheDocument();
  });

  it("desabilita campos interativos quando disabled for true", () => {
    const onMatrix = vi.fn();
    const onWave = vi.fn();
    const onSpiral = vi.fn();

    render(
      <ModelSpecificControls
        model="fibonacci-spiral"
        matrixStreamParams={defaultMatrix}
        topographicWaveParams={defaultWave}
        fibonacciSpiralParams={defaultSpiral}
        onMatrixStreamChange={onMatrix}
        onTopographicWaveChange={onWave}
        onFibonacciSpiralChange={onSpiral}
        disabled={true}
      />,
    );

    const rotationBtn = screen.getByTestId("fib-cellRotation-toggle");
    expect(rotationBtn).toBeDisabled();

    const tightnessInput = screen.getByLabelText("Aperto da Espiral");
    expect(tightnessInput).toBeDisabled();
  });
});
