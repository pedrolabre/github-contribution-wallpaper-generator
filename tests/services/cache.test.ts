import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  DEFAULT_CACHE_TTL_MS,
  CACHE_PREFIX,
  buildContributionCacheKey,
  getStoredItem,
  setStoredItem,
  removeStoredItem,
  clearContributionCache,
  getContributionsFromCache,
  setContributionsInCache,
} from "../../src/services/cache";

describe("cache service", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("buildContributionCacheKey", () => {
    it("gera chave normalizada com username e ano", () => {
      const key = buildContributionCacheKey("Octocat", 2024);
      expect(key).toBe(`${CACHE_PREFIX}octocat:2024`);
    });

    it("aplica trim e lowercase em username com espacos", () => {
      const key = buildContributionCacheKey("  JohnDoe  ", "last365");
      expect(key).toBe(`${CACHE_PREFIX}johndoe:last365`);
    });
  });

  describe("getStoredItem e setStoredItem", () => {
    it("persiste e recupera objeto serializavel dentro do TTL", () => {
      const payload = { commits: 150, user: "developer" };
      setStoredItem("test-key", payload, 60000);

      const retrieved = getStoredItem<typeof payload>("test-key");
      expect(retrieved).toEqual(payload);
    });

    it("retorna null para chave inexistente", () => {
      const result = getStoredItem("chave-inexistente");
      expect(result).toBeNull();
    });

    it("retorna null e remove item quando o TTL estiver expirado", () => {
      vi.useFakeTimers();
      const startTime = new Date("2026-01-01T12:00:00Z");
      vi.setSystemTime(startTime);

      const payload = { value: "temporario" };
      setStoredItem("expiring-key", payload, 1000);

      expect(getStoredItem("expiring-key")).toEqual(payload);

      // Avanca o tempo alem do TTL
      vi.advanceTimersByTime(1001);

      expect(getStoredItem("expiring-key")).toBeNull();
      expect(window.sessionStorage.getItem("expiring-key")).toBeNull();
    });

    it("retorna null e limpa o registro quando o conteudo for JSON corrompido", () => {
      window.sessionStorage.setItem("corrupted-key", "{invalid_json:");

      const result = getStoredItem("corrupted-key");
      expect(result).toBeNull();
      expect(window.sessionStorage.getItem("corrupted-key")).toBeNull();
    });

    it("retorna null e limpa o registro quando a estrutura do envelope for invalida", () => {
      window.sessionStorage.setItem(
        "invalid-envelope",
        JSON.stringify({ notAnEnvelope: true })
      );

      const result = getStoredItem("invalid-envelope");
      expect(result).toBeNull();
      expect(window.sessionStorage.getItem("invalid-envelope")).toBeNull();
    });

    it("trata falha de cota de armazenamento sem lancar excecao no caller", () => {
      const setItemSpy = vi
        .spyOn(window.sessionStorage, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });

      expect(() => {
        setStoredItem("quota-test", { large: "data" });
      }).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe("removeStoredItem", () => {
    it("remove chave especifica do sessionStorage", () => {
      setStoredItem("item-a", "valor-a");
      setStoredItem("item-b", "valor-b");

      removeStoredItem("item-a");

      expect(getStoredItem("item-a")).toBeNull();
      expect(getStoredItem("item-b")).toBe("valor-b");
    });
  });

  describe("clearContributionCache", () => {
    it("remove apenas chaves com o prefixo do cache de contribuicoes", () => {
      setContributionsInCache("user1", 2024, { total: 10 });
      setContributionsInCache("user2", "last365", { total: 20 });
      window.sessionStorage.setItem("outro_app:key", "manter");

      clearContributionCache();

      expect(getContributionsFromCache("user1", 2024)).toBeNull();
      expect(getContributionsFromCache("user2", "last365")).toBeNull();
      expect(window.sessionStorage.getItem("outro_app:key")).toBe("manter");
    });
  });

  describe("getContributionsFromCache e setContributionsInCache", () => {
    it("armazena e recupera dados utilizando a chave canônica do usuario", () => {
      const data = { username: "torvalds", total: 999 };
      setContributionsInCache("torvalds", 2024, data);

      const cached = getContributionsFromCache<typeof data>("torvalds", 2024);
      expect(cached).toEqual(data);
    });

    it("utiliza DEFAULT_CACHE_TTL_MS de 30 minutos por padrao", () => {
      vi.useFakeTimers();
      const startTime = new Date("2026-01-01T10:00:00Z");
      vi.setSystemTime(startTime);

      const data = { status: "cached" };
      setContributionsInCache("tester", 2025, data);

      // Avanca 29 minutos: deve continuar disponivel
      vi.advanceTimersByTime(29 * 60 * 1000);
      expect(getContributionsFromCache("tester", 2025)).toEqual(data);

      // Avanca mais 2 minutos (total 31 min, > 30 min): deve expirar
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(getContributionsFromCache("tester", 2025)).toBeNull();
      expect(DEFAULT_CACHE_TTL_MS).toBe(1800000);
    });
  });
});
