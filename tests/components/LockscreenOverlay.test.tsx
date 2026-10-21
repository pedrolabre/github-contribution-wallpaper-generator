import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LockscreenOverlay,
  DEFAULT_LOCKSCREEN_CONFIG,
} from "../../src/components/LockscreenOverlay";

describe("LockscreenOverlay component", () => {
  it("nao renderiza nada quando visible for falso", () => {
    const { container } = render(
      <LockscreenOverlay visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza o container com role region e titulo acessivel quando visible for verdadeiro", () => {
    render(<LockscreenOverlay visible={true} />);

    const region = screen.getByRole("region", {
      name: "Simulador de Lockscreen",
    });
    expect(region).toBeDefined();
    expect(screen.getByTestId("lockscreen-overlay")).toBeDefined();
  });

  it("renderiza os elementos caracteristicos do estilo iOS por padrao", () => {
    render(<LockscreenOverlay visible={true} style="ios" />);

    expect(screen.getByTestId("lockscreen-dynamic-island")).toBeDefined();
    expect(screen.getByTestId("lockscreen-flashlight-btn")).toBeDefined();
    expect(screen.getByTestId("lockscreen-camera-btn")).toBeDefined();
    expect(screen.getByTestId("lockscreen-home-bar")).toBeDefined();

    const clock = screen.getByTestId("lockscreen-clock");
    expect(clock.textContent).toBe("09:41");

    const date = screen.getByTestId("lockscreen-date");
    expect(date.textContent).toBe("Quarta-feira, 5 de novembro");
  });

  it("renderiza os elementos caracteristicos do estilo Android", () => {
    render(<LockscreenOverlay visible={true} style="android" />);

    expect(screen.getByTestId("lockscreen-punch-hole")).toBeDefined();
    expect(screen.getByTestId("lockscreen-lock-icon")).toBeDefined();
    expect(screen.getByTestId("lockscreen-swipe-text")).toBeDefined();
    expect(
      screen.getByText("Deslize para cima para desbloquear")
    ).toBeDefined();

    expect(screen.queryByTestId("lockscreen-dynamic-island")).toBeNull();
    expect(screen.queryByTestId("lockscreen-flashlight-btn")).toBeNull();
    expect(screen.queryByTestId("lockscreen-camera-btn")).toBeNull();

    const date = screen.getByTestId("lockscreen-date");
    expect(date.textContent).toBe("Qua., 5 de nov.");
  });

  it("renderiza as guias de safe area no topo e na base quando showSafeAreaGuides for verdadeiro", () => {
    render(
      <LockscreenOverlay visible={true} showSafeAreaGuides={true} />
    );

    expect(screen.getByTestId("lockscreen-safe-area-top")).toBeDefined();
    expect(screen.getByTestId("lockscreen-safe-area-bottom")).toBeDefined();
    expect(screen.getByText("Safe Area Top")).toBeDefined();
    expect(screen.getByText("Safe Area Bottom")).toBeDefined();
  });

  it("oculta as guias de safe area quando showSafeAreaGuides for falso", () => {
    render(
      <LockscreenOverlay visible={true} showSafeAreaGuides={false} />
    );

    expect(screen.queryByTestId("lockscreen-safe-area-top")).toBeNull();
    expect(screen.queryByTestId("lockscreen-safe-area-bottom")).toBeNull();
  });

  it("aplica estilo de opacidade customizado na camada", () => {
    render(<LockscreenOverlay visible={true} opacity={0.5} />);

    const overlay = screen.getByTestId("lockscreen-overlay");
    expect(overlay.style.opacity).toBe("0.5");
  });

  it("renderiza horario e data customizados quando fornecidos", () => {
    render(
      <LockscreenOverlay
        visible={true}
        customTime="18:30"
        customDate="Sexta-feira, 7 de novembro"
      />
    );

    const clock = screen.getByTestId("lockscreen-clock");
    expect(clock.textContent).toBe("18:30");

    const date = screen.getByTestId("lockscreen-date");
    expect(date.textContent).toBe("Sexta-feira, 7 de novembro");
  });

  it("aplica classes css adicionais fornecidas via className", () => {
    render(
      <LockscreenOverlay visible={true} className="custom-test-class" />
    );

    const overlay = screen.getByTestId("lockscreen-overlay");
    expect(overlay.className).toContain("custom-test-class");
  });

  it("utiliza os valores de DEFAULT_LOCKSCREEN_CONFIG quando props forem omitidas", () => {
    expect(DEFAULT_LOCKSCREEN_CONFIG.visible).toBe(false);
    expect(DEFAULT_LOCKSCREEN_CONFIG.style).toBe("ios");
    expect(DEFAULT_LOCKSCREEN_CONFIG.opacity).toBe(0.85);
    expect(DEFAULT_LOCKSCREEN_CONFIG.showSafeAreaGuides).toBe(true);
  });
});
