import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelSelector, MODEL_OPTIONS } from "../../src/components/ModelSelector";

describe("ModelSelector component", () => {
  it("renderiza o container com role region e titulo acessivel", () => {
    const onSelect = vi.fn();
    render(<ModelSelector selectedModel="matrix-stream" onSelectModel={onSelect} />);

    const container = screen.getByTestId("model-selector-container");
    expect(container).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /seletor de modelo de wallpaper/i })).toBeInTheDocument();
  });

  it("renderiza todas as 4 opcoes de modelos generativos", () => {
    const onSelect = vi.fn();
    render(<ModelSelector selectedModel="topographic-wave" onSelectModel={onSelect} />);

    expect(MODEL_OPTIONS).toHaveLength(4);
    for (const opt of MODEL_OPTIONS) {
      const optionBtn = screen.getByTestId(`model-option-${opt.id}`);
      expect(optionBtn).toBeInTheDocument();
      expect(screen.getByText(opt.name)).toBeInTheDocument();
      expect(screen.getByTestId(`model-badge-${opt.id}`)).toHaveTextContent(opt.badge);
    }
  });

  it("aplica atributos de acessibilidade aria-selected corretamente no modelo ativo", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <ModelSelector selectedModel="matrix-stream" onSelectModel={onSelect} />,
    );

    const matrixTab = screen.getByTestId("model-option-matrix-stream");
    const waveTab = screen.getByTestId("model-option-topographic-wave");

    expect(matrixTab).toHaveAttribute("aria-selected", "true");
    expect(waveTab).toHaveAttribute("aria-selected", "false");

    rerender(<ModelSelector selectedModel="fibonacci-spiral" onSelectModel={onSelect} />);
    const spiralTab = screen.getByTestId("model-option-fibonacci-spiral");

    expect(matrixTab).toHaveAttribute("aria-selected", "false");
    expect(spiralTab).toHaveAttribute("aria-selected", "true");
  });

  it("dispara callback onSelectModel ao clicar em uma opcao diferente", () => {
    const onSelect = vi.fn();
    render(<ModelSelector selectedModel="standard-grid" onSelectModel={onSelect} />);

    const waveTab = screen.getByTestId("model-option-topographic-wave");
    fireEvent.click(waveTab);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("topographic-wave");
  });

  it("desabilita botoes e impede interacao quando disabled for true", () => {
    const onSelect = vi.fn();
    render(
      <ModelSelector selectedModel="matrix-stream" onSelectModel={onSelect} disabled={true} />,
    );

    const spiralTab = screen.getByTestId("model-option-fibonacci-spiral");
    expect(spiralTab).toBeDisabled();

    fireEvent.click(spiralTab);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("aplica classes customizadas passadas via prop className", () => {
    const onSelect = vi.fn();
    render(
      <ModelSelector
        selectedModel="matrix-stream"
        onSelectModel={onSelect}
        className="custom-selector-class"
      />,
    );

    const container = screen.getByTestId("model-selector-container");
    expect(container).toHaveClass("custom-selector-class");
  });
});
