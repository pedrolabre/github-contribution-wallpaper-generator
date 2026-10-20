import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  HUDControls,
  DEFAULT_HUD_CONFIG,
  type HUDControlsProps,
} from "../../src/components/HUDControls";
import type { CornerHUDConfig } from "../../src/types/wallpaper";

describe("HUDControls component", () => {
  const mockConfig: CornerHUDConfig = {
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

  const defaultProps: HUDControlsProps = {
    config: mockConfig,
    onChange: vi.fn(),
  };

  it("renderiza o container com role region e titulo acessivel", () => {
    render(<HUDControls {...defaultProps} />);

    const region = screen.getByRole("region", {
      name: "Controles do HUD de Borda",
    });
    expect(region).toBeDefined();
    expect(screen.getByText("HUD de Borda e Metadados")).toBeDefined();
  });

  it("renderiza o switch master e altera showHUD ao clicar", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const masterSwitch = screen.getByRole("switch", {
      name: "Exibir HUD Global",
    });
    expect(masterSwitch.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(masterSwitch);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showHUD: false,
    });
  });

  it("aplica estilo desabilitado e bloqueia interacoes quando showHUD for falso", () => {
    const onChange = vi.fn();
    render(
      <HUDControls
        {...defaultProps}
        config={{ ...mockConfig, showHUD: false }}
        onChange={onChange}
      />,
    );

    const octocatSwitch = screen.getByRole("switch", {
      name: "Icone Octocat",
    });
    expect(octocatSwitch.hasAttribute("disabled")).toBe(true);

    fireEvent.click(octocatSwitch);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("dispara onChange ao alternar os switches do quadrante superior esquerdo", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    // Octocat logo
    const logoSwitch = screen.getByRole("switch", { name: "Icone Octocat" });
    fireEvent.click(logoSwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showGitHubLogo: false,
    });

    // Category label
    const categorySwitch = screen.getByRole("switch", { name: "Rotulo de Categoria" });
    fireEvent.click(categorySwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showCategoryLabel: false,
    });

    // Username
    const userSwitch = screen.getByRole("switch", { name: "Identificador do Usuario" });
    fireEvent.click(userSwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showUsername: false,
    });
  });

  it("dispara onChange ao alternar os switches do quadrante superior direito", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    // Year
    const yearSwitch = screen.getByRole("switch", { name: "Ano Civil" });
    fireEvent.click(yearSwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showYear: false,
    });

    // Total commits
    const totalSwitch = screen.getByRole("switch", { name: "Total de Contribuicoes" });
    fireEvent.click(totalSwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showTotalCommits: false,
    });
  });

  it("dispara onChange ao alternar a legenda semanal no quadrante inferior direito", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const legendSwitch = screen.getByRole("switch", {
      name: "Legenda Semanal (Base Direita)",
    });
    fireEvent.click(legendSwitch);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showWeekdayLegend: false,
    });
  });

  it("alterna a visibilidade do manifesto e renderiza o TaglineEditor condicionalmente", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <HUDControls {...defaultProps} onChange={onChange} />,
    );

    expect(
      screen.getByRole("region", { name: "Editor de Manifesto Inspiracional" }),
    ).toBeDefined();

    const taglineToggle = screen.getByRole("switch", {
      name: "Ativar Manifesto Inspiracional",
    });
    fireEvent.click(taglineToggle);
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      showTagline: false,
    });

    rerender(
      <HUDControls
        {...defaultProps}
        config={{ ...mockConfig, showTagline: false }}
        onChange={onChange}
      />,
    );
    expect(
      screen.queryByRole("region", { name: "Editor de Manifesto Inspiracional" }),
    ).toBeNull();
  });

  it("propaga alteracoes de linhas do manifesto vindas do TaglineEditor", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const line1Input = screen.getByLabelText("Linha superior do manifesto");
    fireEvent.change(line1Input, { target: { value: "CONSISTENCY" } });

    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      taglineLine1: "CONSISTENCY",
    });
  });

  it("restaura as linhas de manifesto padrao ao disparar o reset do TaglineEditor", () => {
    const onChange = vi.fn();
    render(
      <HUDControls
        {...defaultProps}
        config={{
          ...mockConfig,
          taglineLine1: "CUSTOM 1",
          taglineLine2: "CUSTOM 2",
        }}
        onChange={onChange}
      />,
    );

    const resetManifestoBtn = screen.getByRole("button", {
      name: "Restaurar manifesto padrao",
    });
    fireEvent.click(resetManifestoBtn);

    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      taglineLine1: DEFAULT_HUD_CONFIG.taglineLine1,
      taglineLine2: DEFAULT_HUD_CONFIG.taglineLine2,
    });
  });

  it("atualiza hudColor atraves do seletor nativo e do campo hexadecimal", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const colorPicker = screen.getByLabelText("Seletor de cor do HUD");
    fireEvent.change(colorPicker, { target: { value: "#39d353" } });
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      hudColor: "#39d353",
    });

    const hexInput = screen.getByLabelText("Codigo hexadecimal da cor do HUD");
    fireEvent.change(hexInput, { target: { value: "#00f0ff" } });
    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      hudColor: "#00f0ff",
    });
  });

  it("ignora valores invalidos no campo de texto de hudColor", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const hexInput = screen.getByLabelText("Codigo hexadecimal da cor do HUD");
    fireEvent.change(hexInput, { target: { value: "invalid-color" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("atualiza fontFamily atraves do seletor tipografico", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} onChange={onChange} />);

    const fontSelect = screen.getByLabelText("Familia tipografica do HUD");
    fireEvent.change(fontSelect, { target: { value: "sans-serif" } });

    expect(onChange).toHaveBeenCalledWith({
      ...mockConfig,
      fontFamily: "sans-serif",
    });
  });

  it("aciona onReset global ao clicar no botao de restaurar do cabecalho", () => {
    const onReset = vi.fn();
    render(<HUDControls {...defaultProps} onReset={onReset} />);

    const resetBtn = screen.getByRole("button", {
      name: "Restaurar configuracoes de HUD",
    });
    fireEvent.click(resetBtn);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("nao renderiza botao de restaurar no cabecalho quando onReset for omitido", () => {
    render(<HUDControls {...defaultProps} onReset={undefined} />);

    expect(
      screen.queryByRole("button", { name: "Restaurar configuracoes de HUD" }),
    ).toBeNull();
  });

  it("desabilita todos os controles quando disabled for true", () => {
    const onChange = vi.fn();
    render(<HUDControls {...defaultProps} disabled={true} onChange={onChange} />);

    const masterSwitch = screen.getByRole("switch", {
      name: "Exibir HUD Global",
    });
    expect(masterSwitch.hasAttribute("disabled")).toBe(true);

    const octocatSwitch = screen.getByRole("switch", {
      name: "Icone Octocat",
    });
    expect(octocatSwitch.hasAttribute("disabled")).toBe(true);

    const colorPicker = screen.getByLabelText("Seletor de cor do HUD");
    expect(colorPicker.hasAttribute("disabled")).toBe(true);

    const fontSelect = screen.getByLabelText("Familia tipografica do HUD");
    expect(fontSelect.hasAttribute("disabled")).toBe(true);
  });
});
