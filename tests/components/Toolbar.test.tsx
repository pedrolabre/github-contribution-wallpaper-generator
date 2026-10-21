import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar, type ToolbarProps } from "../../src/components/Toolbar";
import type { LockscreenConfig } from "../../src/components/LockscreenOverlay";

describe("Toolbar component", () => {
  const mockLockscreen: LockscreenConfig = {
    visible: false,
    style: "ios",
    opacity: 0.85,
    showSafeAreaGuides: true,
  };

  const defaultProps: ToolbarProps = {
    lockscreen: mockLockscreen,
    onLockscreenChange: vi.fn(),
  };

  it("renderiza o container com role toolbar e rotulo acessivel", () => {
    render(<Toolbar {...defaultProps} />);

    const toolbar = screen.getByRole("toolbar", {
      name: "Barra de Ferramentas de Visualizacao",
    });
    expect(toolbar).toBeDefined();
    expect(screen.getByTestId("visualization-toolbar")).toBeDefined();
  });

  it("renderiza o switch do simulador e alterna o estado visible ao clicar", () => {
    const onLockscreenChange = vi.fn();
    render(
      <Toolbar
        {...defaultProps}
        lockscreen={{ ...mockLockscreen, visible: false }}
        onLockscreenChange={onLockscreenChange}
      />
    );

    const toggle = screen.getByRole("switch", {
      name: "Alternar Simulador de Lockscreen",
    });
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(toggle);
    expect(onLockscreenChange).toHaveBeenCalledTimes(1);
    expect(onLockscreenChange).toHaveBeenCalledWith({
      ...mockLockscreen,
      visible: true,
    });
  });

  it("oculta controles adicionais de lockscreen quando visible for falso", () => {
    render(
      <Toolbar
        {...defaultProps}
        lockscreen={{ ...mockLockscreen, visible: false }}
      />
    );

    expect(screen.queryByTestId("toolbar-lockscreen-options")).toBeNull();
    expect(screen.queryByTestId("toolbar-opacity-slider")).toBeNull();
    expect(screen.queryByTestId("toolbar-style-ios")).toBeNull();
  });

  it("exibe e permite alternar estilo do dispositivo quando visible for verdadeiro", () => {
    const onLockscreenChange = vi.fn();
    render(
      <Toolbar
        {...defaultProps}
        lockscreen={{ ...mockLockscreen, visible: true, style: "ios" }}
        onLockscreenChange={onLockscreenChange}
      />
    );

    expect(screen.getByTestId("toolbar-lockscreen-options")).toBeDefined();

    const iosBtn = screen.getByRole("button", { name: "Estilo iOS" });
    const androidBtn = screen.getByRole("button", { name: "Estilo Android" });

    expect(iosBtn.getAttribute("aria-pressed")).toBe("true");
    expect(androidBtn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(androidBtn);
    expect(onLockscreenChange).toHaveBeenCalledWith({
      ...mockLockscreen,
      visible: true,
      style: "android",
    });
  });

  it("permite alterar a opacidade atraves do input range", () => {
    const onLockscreenChange = vi.fn();
    render(
      <Toolbar
        {...defaultProps}
        lockscreen={{ ...mockLockscreen, visible: true, opacity: 0.8 }}
        onLockscreenChange={onLockscreenChange}
      />
    );

    const slider = screen.getByLabelText(
      "Opacidade do Simulador de Lockscreen"
    ) as HTMLInputElement;
    expect(slider.value).toBe("80");
    expect(screen.getByText("80%")).toBeDefined();

    fireEvent.change(slider, { target: { value: "50" } });
    expect(onLockscreenChange).toHaveBeenCalledWith({
      ...mockLockscreen,
      visible: true,
      opacity: 0.5,
    });
  });

  it("permite alternar guias de safe area atraves do botao switch", () => {
    const onLockscreenChange = vi.fn();
    render(
      <Toolbar
        {...defaultProps}
        lockscreen={{ ...mockLockscreen, visible: true, showSafeAreaGuides: true }}
        onLockscreenChange={onLockscreenChange}
      />
    );

    const safeAreaToggle = screen.getByRole("switch", {
      name: "Alternar Guias de Safe Area",
    });
    expect(safeAreaToggle.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(safeAreaToggle);
    expect(onLockscreenChange).toHaveBeenCalledWith({
      ...mockLockscreen,
      visible: true,
      showSafeAreaGuides: false,
    });
  });

  it("renderiza controles de zoom quando fornecidos e dispara callbacks de incremento e decremento", () => {
    const onZoomChange = vi.fn();
    const onResetZoom = vi.fn();

    render(
      <Toolbar
        {...defaultProps}
        zoom={1}
        onZoomChange={onZoomChange}
        onResetZoom={onResetZoom}
      />
    );

    expect(screen.getByTestId("toolbar-zoom-controls")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();

    const zoomInBtn = screen.getByRole("button", { name: "Aumentar Zoom" });
    const zoomOutBtn = screen.getByRole("button", { name: "Diminuir Zoom" });
    const resetBtn = screen.getByRole("button", { name: "Restaurar Zoom" });

    fireEvent.click(zoomInBtn);
    expect(onZoomChange).toHaveBeenCalledWith(1.1);

    fireEvent.click(zoomOutBtn);
    expect(onZoomChange).toHaveBeenCalledWith(0.9);

    fireEvent.click(resetBtn);
    expect(onResetZoom).toHaveBeenCalledTimes(1);
  });

  it("desabilita botoes de zoom nos limites de 0.5 e 3.0", () => {
    const { rerender } = render(
      <Toolbar {...defaultProps} zoom={0.5} onZoomChange={vi.fn()} />
    );

    const zoomOutBtn = screen.getByRole("button", { name: "Diminuir Zoom" });
    expect(zoomOutBtn.getAttribute("disabled")).toBeDefined();

    rerender(<Toolbar {...defaultProps} zoom={3.0} onZoomChange={vi.fn()} />);

    const zoomInBtn = screen.getByRole("button", { name: "Aumentar Zoom" });
    expect(zoomInBtn.getAttribute("disabled")).toBeDefined();
  });

  it("aplica classes css personalizadas passadas via className", () => {
    render(<Toolbar {...defaultProps} className="custom-toolbar-class" />);

    const toolbar = screen.getByTestId("visualization-toolbar");
    expect(toolbar.className).toContain("custom-toolbar-class");
  });
});
