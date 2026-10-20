import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  GeometryControls,
  GEOMETRY_SLIDERS,
} from "../../src/components/GeometryControls";
import type { GeometryValues } from "../../src/components/GeometryControls";

describe("GeometryControls component", () => {
  const defaultValues: GeometryValues = {
    cellSize: 16,
    cellGap: 4,
    borderRadius: 6,
    scale: 1.25,
    offsetX: 20,
    offsetY: -30,
  };

  it("renderiza o container com role region e titulo acessivel", () => {
    const onChange = vi.fn();
    render(<GeometryControls values={defaultValues} onChange={onChange} />);

    const container = screen.getByTestId("geometry-controls-container");
    expect(container).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /controles de geometria/i })).toBeInTheDocument();
  });

  it("renderiza todos os 6 campos de slider geometricos com valores formatados", () => {
    const onChange = vi.fn();
    render(<GeometryControls values={defaultValues} onChange={onChange} />);

    expect(GEOMETRY_SLIDERS).toHaveLength(6);

    expect(screen.getByTestId("geometry-value-cellSize")).toHaveTextContent("16px");
    expect(screen.getByTestId("geometry-value-cellGap")).toHaveTextContent("4px");
    expect(screen.getByTestId("geometry-value-borderRadius")).toHaveTextContent("6px");
    expect(screen.getByTestId("geometry-value-scale")).toHaveTextContent("1.25x");
    expect(screen.getByTestId("geometry-value-offsetX")).toHaveTextContent("20px");
    expect(screen.getByTestId("geometry-value-offsetY")).toHaveTextContent("-30px");
  });

  it("dispara callback onChange com chave e valor numerico correto ao alterar slider", () => {
    const onChange = vi.fn();
    render(<GeometryControls values={defaultValues} onChange={onChange} />);

    const cellSizeInput = screen.getByLabelText("Tamanho da Celula");
    fireEvent.change(cellSizeInput, { target: { value: "24" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("cellSize", 24);

    const scaleInput = screen.getByLabelText("Escala Geral");
    fireEvent.change(scaleInput, { target: { value: "2.5" } });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith("scale", 2.5);
  });

  it("renderiza botao de reset quando prop onReset for fornecida e responde a cliques", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <GeometryControls values={defaultValues} onChange={onChange} onReset={onReset} />,
    );

    const resetBtn = screen.getByTestId("geometry-reset-button");
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("nao renderiza botao de reset quando prop onReset for omitida", () => {
    const onChange = vi.fn();
    render(<GeometryControls values={defaultValues} onChange={onChange} />);

    expect(screen.queryByTestId("geometry-reset-button")).not.toBeInTheDocument();
  });

  it("desabilita todos os inputs e botao de reset quando disabled for true", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <GeometryControls
        values={defaultValues}
        onChange={onChange}
        onReset={onReset}
        disabled={true}
      />,
    );

    const resetBtn = screen.getByTestId("geometry-reset-button");
    expect(resetBtn).toBeDisabled();

    const inputs = screen.getAllByRole("slider");
    expect(inputs).toHaveLength(6);
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("aplica classes adicionais repassadas via className", () => {
    const onChange = vi.fn();
    render(
      <GeometryControls
        values={defaultValues}
        onChange={onChange}
        className="custom-geom-class"
      />,
    );

    expect(screen.getByTestId("geometry-controls-container")).toHaveClass("custom-geom-class");
  });
});
