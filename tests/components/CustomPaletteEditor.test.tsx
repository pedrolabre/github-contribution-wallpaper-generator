import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomPaletteEditor } from "../../src/components/CustomPaletteEditor";
import type { ColorPalette } from "../../src/types/contributions";

describe("CustomPaletteEditor component", () => {
  const testPalette: ColorPalette = {
    id: "custom-test",
    name: "Minha Paleta Teste",
    background: "#030504",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ff59"],
    textColor: "#c9d1d9",
    glowColor: "#00ff59",
  };

  it("renderiza o container com role region e titulo acessivel", () => {
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
      />
    );

    const region = screen.getByRole("region", {
      name: "Editor de paleta customizada",
    });
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Editor de Cores Customizadas")).toBeInTheDocument();
  });

  it("renderiza o campo de nome da paleta e dispara onChange ao editar", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const nameInput = screen.getByLabelText("Nome da paleta customizada");
    expect(nameInput).toHaveValue("Minha Paleta Teste");

    fireEvent.change(nameInput, { target: { value: "Novo Nome" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      name: "Novo Nome",
    });
  });

  it("renderiza a barra de pre-visualizacao cromatica", () => {
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
      />
    );

    const previewBar = screen.getByLabelText("Barra de pre-visualizacao cromatica");
    expect(previewBar).toBeInTheDocument();
    expect(previewBar).toHaveStyle({ backgroundColor: "#030504" });
    expect(screen.getByText("HUD")).toHaveStyle({ color: "#c9d1d9" });
  });

  it("dispara onChange ao alterar a cor de fundo via seletor visual", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const bgPicker = screen.getByLabelText("Seletor visual de cor para Fundo OLED");
    fireEvent.change(bgPicker, { target: { value: "#101010" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      background: "#101010",
    });
  });

  it("dispara onChange ao alterar a cor de bloom via seletor visual", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const glowPicker = screen.getByLabelText("Seletor visual de cor para Bloom / Glow");
    fireEvent.change(glowPicker, { target: { value: "#ff00ff" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      glowColor: "#ff00ff",
    });
  });

  it("dispara onChange ao alterar a cor de texto via seletor visual", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const textPicker = screen.getByLabelText("Seletor visual de cor para HUD / Texto");
    fireEvent.change(textPicker, { target: { value: "#ffffff" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      textColor: "#ffffff",
    });
  });

  it("dispara onChange ao alterar o nivel 0 e o nivel 4 via seletor visual", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const level0Picker = screen.getByLabelText("Seletor visual de cor para Nivel 0");
    fireEvent.change(level0Picker, { target: { value: "#111111" } });

    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      levels: ["#111111", "#0e4429", "#006d32", "#26a641", "#00ff59"],
    });

    const level4Picker = screen.getByLabelText("Seletor visual de cor para Nivel 4");
    fireEvent.change(level4Picker, { target: { value: "#00ffff" } });

    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#00ffff"],
    });
  });

  it("permite digitar codigo hex valido no input textual e dispara onChange normalizado", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const textInput = screen.getByLabelText("Entrada hexadecimal para Bloom / Glow");
    fireEvent.change(textInput, { target: { value: "#00f0ff" } });

    expect(handleChange).toHaveBeenCalledWith({
      ...testPalette,
      glowColor: "#00f0ff",
    });
  });

  it("nao dispara onChange quando o texto digitado for incompleto ou invalido", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const textInput = screen.getByLabelText("Entrada hexadecimal para Bloom / Glow");
    fireEvent.change(textInput, { target: { value: "#12" } });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("restaura valor anterior no blur se o valor digitado for invalido", () => {
    const handleChange = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={handleChange}
      />
    );

    const textInput = screen.getByLabelText("Entrada hexadecimal para Bloom / Glow");
    fireEvent.change(textInput, { target: { value: "#xyz" } });
    fireEvent.blur(textInput);

    expect(textInput).toHaveValue("#00ff59");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("aciona onReset ao clicar no botao de restaurar", () => {
    const handleReset = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
        onReset={handleReset}
      />
    );

    const resetButton = screen.getByRole("button", {
      name: "Restaurar paleta original",
    });
    fireEvent.click(resetButton);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it("aciona onClose ao clicar no botao de fechar", () => {
    const handleClose = vi.fn();
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole("button", {
      name: "Fechar editor de cores",
    });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("desabilita todos os inputs e botoes quando disabled for true", () => {
    render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
        onReset={vi.fn()}
        onClose={vi.fn()}
        disabled={true}
      />
    );

    const nameInput = screen.getByLabelText("Nome da paleta customizada");
    expect(nameInput).toBeDisabled();

    const resetButton = screen.getByRole("button", {
      name: "Restaurar paleta original",
    });
    expect(resetButton).toBeDisabled();

    const closeButton = screen.getByRole("button", {
      name: "Fechar editor de cores",
    });
    expect(closeButton).toBeDisabled();
  });

  it("aplica classe CSS customizada no container raiz", () => {
    const { container } = render(
      <CustomPaletteEditor
        palette={testPalette}
        onChange={vi.fn()}
        className="classe-de-custom-editor"
      />
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("classe-de-custom-editor");
  });
});
