import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  TaglineEditor,
  TAGLINE_PRESETS,
  type TaglineEditorProps,
} from "../../src/components/TaglineEditor";

describe("TaglineEditor component", () => {
  const defaultProps: TaglineEditorProps = {
    line1: "SMALL STEPS",
    line2: "BUILD BIG THINGS",
    onChange: vi.fn(),
  };

  it("renderiza o container com role region e titulo acessivel", () => {
    render(<TaglineEditor {...defaultProps} />);

    const region = screen.getByRole("region", {
      name: "Editor de Manifesto Inspiracional",
    });
    expect(region).toBeDefined();
    expect(screen.getByText("Manifesto do Wallpaper")).toBeDefined();
  });

  it("renderiza os campos de texto com os valores fornecidos e contadores de caracteres", () => {
    render(<TaglineEditor {...defaultProps} maxLength={32} />);

    const input1 = screen.getByLabelText("Linha superior do manifesto") as HTMLInputElement;
    const input2 = screen.getByLabelText("Linha inferior do manifesto") as HTMLInputElement;

    expect(input1.value).toBe("SMALL STEPS");
    expect(input2.value).toBe("BUILD BIG THINGS");

    expect(screen.getByText("11/32")).toBeDefined();
    expect(screen.getByText("16/32")).toBeDefined();
  });

  it("dispara onChange com novo valor da linha 1 mantendo a linha 2 inalterada", () => {
    const onChange = vi.fn();
    render(<TaglineEditor {...defaultProps} onChange={onChange} />);

    const input1 = screen.getByLabelText("Linha superior do manifesto");
    fireEvent.change(input1, { target: { value: "DAILY CODE" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("DAILY CODE", "BUILD BIG THINGS");
  });

  it("dispara onChange com novo valor da linha 2 mantendo a linha 1 inalterada", () => {
    const onChange = vi.fn();
    render(<TaglineEditor {...defaultProps} onChange={onChange} />);

    const input2 = screen.getByLabelText("Linha inferior do manifesto");
    fireEvent.change(input2, { target: { value: "CREATE VALUE" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("SMALL STEPS", "CREATE VALUE");
  });

  it("trunca valores que ultrapassam o limite de caracteres maxLength", () => {
    const onChange = vi.fn();
    render(<TaglineEditor {...defaultProps} maxLength={10} onChange={onChange} />);

    const input1 = screen.getByLabelText("Linha superior do manifesto");
    fireEvent.change(input1, { target: { value: "1234567890EXTRA" } });

    expect(onChange).toHaveBeenCalledWith("1234567890", "BUILD BIG THINGS");
  });

  it("renderiza catalogo de sugestoes rapidas e destaca a combinacao ativa", () => {
    render(
      <TaglineEditor
        line1={TAGLINE_PRESETS[0].line1}
        line2={TAGLINE_PRESETS[0].line2}
        onChange={vi.fn()}
      />,
    );

    const activeBtn = screen.getByRole("button", {
      name: `Aplicar sugestao ${TAGLINE_PRESETS[0].label}`,
    });
    expect(activeBtn.getAttribute("aria-pressed")).toBe("true");

    const otherBtn = screen.getByRole("button", {
      name: `Aplicar sugestao ${TAGLINE_PRESETS[1].label}`,
    });
    expect(otherBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("aplica sugestao rapida ao clicar no botao de preset", () => {
    const onChange = vi.fn();
    render(<TaglineEditor {...defaultProps} onChange={onChange} />);

    const preset = TAGLINE_PRESETS[1]; // Code Daily
    const btn = screen.getByRole("button", {
      name: `Aplicar sugestao ${preset.label}`,
    });

    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(preset.line1, preset.line2);
  });

  it("aciona onReset ao clicar no botao de restauracao", () => {
    const onReset = vi.fn();
    render(<TaglineEditor {...defaultProps} onReset={onReset} />);

    const resetBtn = screen.getByRole("button", {
      name: "Restaurar manifesto padrao",
    });
    fireEvent.click(resetBtn);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("nao renderiza o botao de restauracao quando onReset for omitido", () => {
    render(<TaglineEditor {...defaultProps} onReset={undefined} />);

    expect(
      screen.queryByRole("button", { name: "Restaurar manifesto padrao" }),
    ).toBeNull();
  });

  it("desabilita campos de texto e botoes quando disabled for true", () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <TaglineEditor
        {...defaultProps}
        disabled={true}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    const input1 = screen.getByLabelText("Linha superior do manifesto");
    const input2 = screen.getByLabelText("Linha inferior do manifesto");
    const resetBtn = screen.getByRole("button", {
      name: "Restaurar manifesto padrao",
    });
    const presetBtn = screen.getByRole("button", {
      name: `Aplicar sugestao ${TAGLINE_PRESETS[0].label}`,
    });

    expect(input1.hasAttribute("disabled")).toBe(true);
    expect(input2.hasAttribute("disabled")).toBe(true);
    expect(resetBtn.hasAttribute("disabled")).toBe(true);
    expect(presetBtn.hasAttribute("disabled")).toBe(true);

    fireEvent.click(presetBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("aplica classe CSS customizada passada via prop", () => {
    render(<TaglineEditor {...defaultProps} className="custom-test-class" />);

    const region = screen.getByRole("region", {
      name: "Editor de Manifesto Inspiracional",
    });
    expect(region.className).toContain("custom-test-class");
  });
});
