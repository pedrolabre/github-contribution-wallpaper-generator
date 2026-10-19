import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCanvas } from "../../src/hooks/useCanvas";
import type { CanvasFrameInfo } from "../../src/hooks/useCanvas";

describe("useCanvas hook", () => {
  let mockContext: Record<string, ReturnType<typeof vi.fn>>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafIdCounter: number;

  beforeEach(() => {
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
      fill: vi.fn(),
      stroke: vi.fn(),
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

  it("retorna activeCanvasRef, requestRender e getFrameCount", () => {
    const draw = vi.fn();
    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 800,
        height: 600,
      }),
    );

    expect(result.current.canvasRef).toBeDefined();
    expect(typeof result.current.requestRender).toBe("function");
    expect(typeof result.current.getFrameCount).toBe("function");
    expect(result.current.getFrameCount()).toBe(0);
  });

  it("agenda e executa a funcao draw ao associar elemento canvas", () => {
    const draw = vi.fn();
    const onRenderComplete = vi.fn();
    const canvas = document.createElement("canvas");

    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 1000,
        height: 500,
        dpr: 2,
        onRenderComplete,
      }),
    );

    (result.current.canvasRef as { current: HTMLCanvasElement | null }).current = canvas;

    act(() => {
      triggerPendingRaf(1234);
    });

    expect(draw).toHaveBeenCalledTimes(1);
    expect(onRenderComplete).toHaveBeenCalledTimes(1);

    const callArgs = draw.mock.calls[0];
    expect(callArgs[0]).toBe(mockContext);

    const frameInfo = callArgs[1] as CanvasFrameInfo;
    expect(frameInfo.width).toBe(1000);
    expect(frameInfo.height).toBe(500);
    expect(frameInfo.dpr).toBe(2);
    expect(frameInfo.frameCount).toBe(1);
    expect(frameInfo.timestamp).toBe(1234);
    expect(result.current.getFrameCount()).toBe(1);
  });

  it("aplica autoClear limpando com a cor de fundo fornecida", () => {
    const draw = vi.fn();
    const canvas = document.createElement("canvas");

    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 400,
        height: 300,
        autoClear: true,
        backgroundColor: "#030504",
      }),
    );

    (result.current.canvasRef as { current: HTMLCanvasElement | null }).current = canvas;

    act(() => {
      triggerPendingRaf(500);
    });

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);
    expect(mockContext.restore).toHaveBeenCalled();
  });

  it("cancela frame pendente na desmontagem do componente", () => {
    const draw = vi.fn();
    const { unmount } = renderHook(() =>
      useCanvas({
        draw,
        width: 600,
        height: 400,
      }),
    );

    expect(rafCallbacks.size).toBe(1);

    unmount();

    expect(rafCallbacks.size).toBe(0);

    act(() => {
      triggerPendingRaf(2000);
    });

    expect(draw).not.toHaveBeenCalled();
  });

  it("nao agenda frame quando enabled for explicitamente falso", () => {
    const draw = vi.fn();
    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 600,
        height: 400,
        enabled: false,
      }),
    );

    expect(rafCallbacks.size).toBe(0);

    act(() => {
      result.current.requestRender();
    });

    expect(rafCallbacks.size).toBe(0);
    expect(draw).not.toHaveBeenCalled();
  });

  it("cancela frame pendente quando enabled transita para falso", () => {
    const draw = vi.fn();
    let enabled = true;

    const { rerender } = renderHook(
      (props: { isEnabled: boolean }) =>
        useCanvas({
          draw,
          width: 500,
          height: 500,
          enabled: props.isEnabled,
        }),
      {
        initialProps: { isEnabled: true },
      },
    );

    expect(rafCallbacks.size).toBe(1);

    enabled = false;
    rerender({ isEnabled: enabled });

    expect(rafCallbacks.size).toBe(0);
  });

  it("coalesce multiplas requisicoes requestRender no mesmo frame", () => {
    const draw = vi.fn();
    const canvas = document.createElement("canvas");

    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 800,
        height: 600,
      }),
    );

    (result.current.canvasRef as { current: HTMLCanvasElement | null }).current = canvas;

    expect(rafCallbacks.size).toBe(1);

    act(() => {
      result.current.requestRender();
      result.current.requestRender();
      result.current.requestRender();
    });

    expect(rafCallbacks.size).toBe(1);

    act(() => {
      triggerPendingRaf(3000);
    });

    expect(draw).toHaveBeenCalledTimes(1);
    expect(result.current.getFrameCount()).toBe(1);
  });

  it("utiliza canvasRef externo quando fornecido", () => {
    const draw = vi.fn();
    const externalCanvas = document.createElement("canvas");
    const externalRef = { current: externalCanvas };

    const { result } = renderHook(() =>
      useCanvas({
        draw,
        width: 1200,
        height: 800,
        canvasRef: externalRef,
      }),
    );

    expect(result.current.canvasRef).toBe(externalRef);

    act(() => {
      triggerPendingRaf(4000);
    });

    expect(draw).toHaveBeenCalledTimes(1);
  });

  it("redesenha automaticamente quando dimensoes sao alteradas", () => {
    const draw = vi.fn();
    const canvas = document.createElement("canvas");

    const { rerender, result } = renderHook(
      (props: { width: number; height: number }) =>
        useCanvas({
          draw,
          width: props.width,
          height: props.height,
        }),
      {
        initialProps: { width: 500, height: 500 },
      },
    );

    (result.current.canvasRef as { current: HTMLCanvasElement | null }).current = canvas;

    act(() => {
      triggerPendingRaf(5000);
    });
    expect(draw).toHaveBeenCalledTimes(1);

    rerender({ width: 700, height: 600 });

    act(() => {
      triggerPendingRaf(5016);
    });

    expect(draw).toHaveBeenCalledTimes(2);
    expect(draw.mock.calls[1][1].width).toBe(700);
    expect(draw.mock.calls[1][1].height).toBe(600);
  });
});
