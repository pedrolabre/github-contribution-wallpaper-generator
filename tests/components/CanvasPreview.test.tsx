import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CanvasPreview, renderStandardGrid } from "../../src/components/CanvasPreview";
import type { UserContributionData, DeviceDimensions, ColorPalette } from "../../src/types/contributions";
import type { WallpaperConfig } from "../../src/types/wallpaper";
import { generateMockContributions } from "../../src/services/mockGenerator";

describe("CanvasPreview component", () => {
  let mockContext: Record<string, ReturnType<typeof vi.fn>>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafIdCounter: number;

  const mockDevice: DeviceDimensions = {
    id: "iphone-14-pro",
    label: "iPhone 14 Pro",
    category: "mobile",
    width: 1179,
    height: 2556,
    aspectRatio: "9:19.5",
  };

  const mockPalette: ColorPalette = {
    id: "neon-emerald",
    name: "Neon Emerald",
    background: "#030504",
    levels: ["#0a1f12", "#00471b", "#008f37", "#00e659", "#39ff85"],
    textColor: "#e6edf3",
    glowColor: "#00e659",
  };

  const mockConfig: WallpaperConfig = {
    device: mockDevice,
    model: "matrix-stream",
    cellSize: 14,
    cellGap: 4,
    borderRadius: 3,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    palette: mockPalette,
    enableBloom: true,
    bloomIntensity: 1,
    enableGrain: true,
    grainOpacity: 0.03,
    matrixStream: {
      tiltAngle: 25,
      columnWidth: 12,
      scatterFactor: 0.3,
      verticalStagger: 8,
    },
    topographicWave: {
      waveAmplitude: 60,
      waveFrequencyX: 0.04,
      waveFrequencyZ: 0.08,
      perspectiveFocal: 800,
      cameraPitch: 0.43,
      depthFogStart: 0.5,
      elevationMultiplier: 1.5,
    },
    fibonacciSpiral: {
      spiralTightness: 2.5,
      innerRadius: 10,
      outerRadiusScale: 1.0,
      cellRotation: true,
      angularStep: "archimedean",
    },
    hud: {
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
      hudColor: "#00e659",
      fontFamily: "monospace",
    },
  };

  let sampleData: UserContributionData;

  beforeEach(() => {
    sampleData = generateMockContributions("pedrolabre", 2025);
    rafIdCounter = 0;
    rafCallbacks = new Map();

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback): number => {
      rafIdCounter += 1;
      rafCallbacks.set(rafIdCounter, cb);
      return rafIdCounter;
    });

    vi.stubGlobal("cancelAnimationFrame", (id: number): void => {
      rafCallbacks.delete(id);
    });

    mockContext = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 60 }),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createPattern: vi.fn().mockReturnValue({}),
      putImageData: vi.fn(),
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
      return mockContext as unknown as CanvasRenderingContext2D;
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function triggerPendingRaf(timestamp = 1000): void {
    const callbacks = Array.from(rafCallbacks.entries());
    rafCallbacks.clear();
    for (const [, cb] of callbacks) {
      cb(timestamp);
    }
  }

  it("renderiza o container de preview e o elemento canvas com aspecto proporcional", () => {
    render(<CanvasPreview data={sampleData} config={mockConfig} />);

    const container = screen.getByTestId("canvas-preview-container");
    expect(container).toBeInTheDocument();

    const canvas = screen.getByTestId("wallpaper-canvas");
    expect(canvas).toBeInTheDocument();

    const wrapper = canvas.parentElement;
    expect(wrapper).toHaveStyle({
      aspectRatio: "1179 / 2556",
    });
  });

  it("exibe indicador de carregamento quando isLoading for true", () => {
    render(<CanvasPreview data={sampleData} config={mockConfig} isLoading={true} />);

    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    expect(screen.getByText("CARREGANDO DADOS...")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando fornecida", () => {
    render(
      <CanvasPreview
        data={sampleData}
        config={mockConfig}
        error="Falha ao buscar contribuicoes da API"
      />,
    );

    const errorBanner = screen.getByTestId("error-banner");
    expect(errorBanner).toBeInTheDocument();
    expect(errorBanner).toHaveTextContent("Falha ao buscar contribuicoes da API");
  });

  it("exibe mensagem de estado vazio quando data for nulo e nao estiver carregando", () => {
    render(<CanvasPreview data={null} config={mockConfig} />);

    expect(screen.getByTestId("empty-indicator")).toBeInTheDocument();
    expect(
      screen.getByText("AGUARDANDO DADOS DE CONTRIBUICOES"),
    ).toBeInTheDocument();
  });

  it("executa pipeline completo para o modelo matrix-stream e dispara onRenderComplete", () => {
    const onRenderComplete = vi.fn();
    render(
      <CanvasPreview
        data={sampleData}
        config={mockConfig}
        onRenderComplete={onRenderComplete}
      />,
    );

    act(() => {
      triggerPendingRaf(100);
    });

    expect(mockContext.setTransform).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(onRenderComplete).toHaveBeenCalledTimes(1);
  });

  it("executa pipeline para o modelo topographic-wave", () => {
    const configTopographic: WallpaperConfig = {
      ...mockConfig,
      model: "topographic-wave",
    };

    render(<CanvasPreview data={sampleData} config={configTopographic} />);

    act(() => {
      triggerPendingRaf(200);
    });

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
  });

  it("executa pipeline para o modelo fibonacci-spiral", () => {
    const configSpiral: WallpaperConfig = {
      ...mockConfig,
      model: "fibonacci-spiral",
    };

    render(<CanvasPreview data={sampleData} config={configSpiral} />);

    act(() => {
      triggerPendingRaf(300);
    });

    expect(mockContext.translate).toHaveBeenCalled();
    expect(mockContext.rotate).toHaveBeenCalled();
  });

  it("executa pipeline para o modelo standard-grid", () => {
    const configStandard: WallpaperConfig = {
      ...mockConfig,
      model: "standard-grid",
    };

    render(<CanvasPreview data={sampleData} config={configStandard} />);

    act(() => {
      triggerPendingRaf(400);
    });

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it("desenha o HUD quando habilitado e omite quando desabilitado", () => {
    const configWithoutHUD: WallpaperConfig = {
      ...mockConfig,
      hud: {
        ...mockConfig.hud,
        showHUD: false,
      },
    };

    const { rerender } = render(
      <CanvasPreview data={sampleData} config={configWithoutHUD} />,
    );

    act(() => {
      triggerPendingRaf(500);
    });

    const callsWithoutHUD = mockContext.fillText.mock.calls.length;

    rerender(<CanvasPreview data={sampleData} config={mockConfig} />);

    act(() => {
      triggerPendingRaf(516);
    });

    const callsWithHUD = mockContext.fillText.mock.calls.length;
    expect(callsWithHUD).toBeGreaterThan(callsWithoutHUD);
  });

  describe("renderStandardGrid", () => {
    it("desenha 365 celulas em modo mobile com 14 colunas", () => {
      const fillCountBefore = mockContext.fill.mock.calls.length;

      renderStandardGrid(mockContext as unknown as CanvasRenderingContext2D, {
        days: sampleData.days,
        canvasWidth: 1000,
        canvasHeight: 2000,
        cellSize: 12,
        cellGap: 3,
        borderRadius: 2,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        palette: mockPalette,
        enableBloom: false,
        bloomIntensity: 1,
        dpr: 1,
        isMobile: true,
      });

      expect(mockContext.fill.mock.calls.length).toBeGreaterThan(fillCountBefore);
    });

    it("desenha 365 celulas em modo desktop com 53 colunas e bloom ativo", () => {
      renderStandardGrid(mockContext as unknown as CanvasRenderingContext2D, {
        days: sampleData.days,
        canvasWidth: 2000,
        canvasHeight: 1000,
        cellSize: 12,
        cellGap: 3,
        borderRadius: 2,
        scale: 1,
        offsetX: 10,
        offsetY: 20,
        palette: mockPalette,
        enableBloom: true,
        bloomIntensity: 1.5,
        dpr: 2,
        isMobile: false,
      });

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });
  });
});
