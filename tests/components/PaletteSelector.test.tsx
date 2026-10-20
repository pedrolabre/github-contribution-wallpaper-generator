import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaletteSelector } from "../../src/components/PaletteSelector";
import {
  NEON_EMERALD_PALETTE,
  CYBERPUNK_PALETTE,
} from "../../src/presets/colorPalettes";
import type { ColorPalette } from "../../src/types/contributions";

describe("PaletteSelector component", () => {
  it("renderiza o container com role region e titulo acessivel", () => {
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
      />
    );

    const region = screen.getByRole("region", { name: "Paletas de cores OLED" });
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Paletas de Cores OLED")).toBeInTheDocument();
  });

  it("renderiza todos os 5 presets em um radiogroup", () => {
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
      />
    );

    const radiogroup = screen.getByRole("radiogroup", { name: "Catalogo de paletas OLED" });
    expect(radiogroup).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(screen.getByText("Neon Emerald")).toBeInTheDocument();
    expect(screen.getByText("GitHub Dark")).toBeInTheDocument();
    expect(screen.getByText("Monochrome")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk")).toBeInTheDocument();
    expect(screen.getByText("Solarized")).toBeInTheDocument();
  });

  it("indica corretamente qual paleta esta selecionada via aria-checked", () => {
    render(
      <PaletteSelector
        selectedPaletteId="cyberpunk"
        onSelectPalette={vi.fn()}
      />
    );

    const cyberpunkRadio = screen.getByRole("radio", { name: "Paleta Cyberpunk" });
    expect(cyberpunkRadio).toHaveAttribute("aria-checked", "true");

    const emeraldRadio = screen.getByRole("radio", { name: "Paleta Neon Emerald" });
    expect(emeraldRadio).toHaveAttribute("aria-checked", "false");
  });

  it("dispara onSelectPalette com o objeto da paleta ao clicar em um cartao", () => {
    const handleSelect = vi.fn();
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={handleSelect}
      />
    );

    const cyberpunkRadio = screen.getByRole("radio", { name: "Paleta Cyberpunk" });
    fireEvent.click(cyberpunkRadio);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(CYBERPUNK_PALETTE);
  });

  it("nao dispara onSelectPalette quando disabled for true", () => {
    const handleSelect = vi.fn();
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={handleSelect}
        disabled={true}
      />
    );

    const cyberpunkRadio = screen.getByRole("radio", { name: "Paleta Cyberpunk" });
    fireEvent.click(cyberpunkRadio);

    expect(handleSelect).not.toHaveBeenCalled();
    expect(cyberpunkRadio).toBeDisabled();
  });

  it("renderiza o botao de edicao customizada quando onOpenCustomEditor for fornecido", () => {
    const handleOpenCustom = vi.fn();
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
        onOpenCustomEditor={handleOpenCustom}
      />
    );

    const customButton = screen.getByRole("button", {
      name: "Abrir editor de cores customizadas",
    });
    expect(customButton).toBeInTheDocument();

    fireEvent.click(customButton);
    expect(handleOpenCustom).toHaveBeenCalledTimes(1);
  });

  it("desmarca presets e destaca estado customizado quando isCustom for true", () => {
    render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
        onOpenCustomEditor={vi.fn()}
        isCustom={true}
      />
    );

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("aria-checked", "false");
    });
  });

  it("aplica lista customizada de paletas quando fornecida via props", () => {
    const customList: ColorPalette[] = [NEON_EMERALD_PALETTE];
    render(
      <PaletteSelector
        palettes={customList}
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
      />
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(screen.getByText("Neon Emerald")).toBeInTheDocument();
    expect(screen.queryByText("Cyberpunk")).not.toBeInTheDocument();
  });

  it("aplica classe CSS customizada no container raiz", () => {
    const { container } = render(
      <PaletteSelector
        selectedPaletteId="neon-emerald"
        onSelectPalette={vi.fn()}
        className="classe-de-teste"
      />
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("classe-de-teste");
  });
});
