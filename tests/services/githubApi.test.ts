import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fetchGitHubContributions,
  resolveYearParam,
  calculateTotalContributions,
  GitHubUserNotFoundError,
  GitHubApiError,
  GITHUB_CONTRIBUTIONS_API_BASE_URL,
} from "../../src/services/githubApi";
import {
  getContributionsFromCache,
  setContributionsInCache,
} from "../../src/services/cache";

describe("githubApi service", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("resolveYearParam", () => {
    it("resolve undefined para last365 e parametro 'last'", () => {
      const resolved = resolveYearParam(undefined);
      expect(resolved).toEqual({
        normalizedYear: "last365",
        queryParam: "last",
      });
    });

    it("resolve 'last365' para last365 e parametro 'last'", () => {
      const resolved = resolveYearParam("last365");
      expect(resolved).toEqual({
        normalizedYear: "last365",
        queryParam: "last",
      });
    });

    it("resolve ano numerico para o valor correspondente e string de query", () => {
      const resolved = resolveYearParam(2023);
      expect(resolved).toEqual({
        normalizedYear: 2023,
        queryParam: "2023",
      });
    });
  });

  describe("calculateTotalContributions", () => {
    it("utiliza valor do mapa total quando presente para lastYear", () => {
      const total = calculateTotalContributions(
        { lastYear: 1420 },
        [{ date: "2026-01-01", count: 2, level: 1 }],
        "last365"
      );
      expect(total).toBe(1420);
    });

    it("utiliza valor do mapa total para ano numerico", () => {
      const total = calculateTotalContributions(
        { "2024": 890 },
        [{ date: "2024-01-01", count: 2, level: 1 }],
        2024
      );
      expect(total).toBe(890);
    });

    it("calcula soma dos counts quando a chave nao estiver presente no mapa total", () => {
      const total = calculateTotalContributions(
        {},
        [
          { date: "2024-01-01", count: 5, level: 2 },
          { date: "2024-01-02", count: 15, level: 4 },
        ],
        2024
      );
      expect(total).toBe(20);
    });
  });

  describe("fetchGitHubContributions", () => {
    it("rejeita chamada com username vazio", async () => {
      await expect(fetchGitHubContributions("   ")).rejects.toThrow(
        GitHubApiError
      );
      await expect(fetchGitHubContributions("   ")).rejects.toThrow(
        "Username cannot be empty."
      );
    });

    it("retorna dados em cache sem acionar fetch quando disponivel (cache hit)", async () => {
      const cachedData = {
        username: "octocat",
        year: "last365" as const,
        totalContributions: 50,
        contributions: [
          { date: "2026-01-01", count: 50, level: 3 as const },
        ],
      };
      setContributionsInCache("octocat", "last365", cachedData);

      const fetchSpy = vi.fn();

      const result = await fetchGitHubContributions("octocat", "last365", {
        fetchFn: fetchSpy as unknown as typeof fetch,
      });

      expect(result).toEqual(cachedData);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("realiza requisicao HTTP em caso de cache miss e persiste resposta em cache", async () => {
      const apiPayload = {
        total: { "2024": 12 },
        contributions: [
          { date: "2024-01-01", count: 4, level: 1 },
          { date: "2024-01-02", count: 8, level: 2 },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => apiPayload,
      });

      const result = await fetchGitHubContributions("torvalds", 2024, {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${GITHUB_CONTRIBUTIONS_API_BASE_URL}/torvalds?y=2024`
      );

      expect(result).toEqual({
        username: "torvalds",
        year: 2024,
        totalContributions: 12,
        contributions: apiPayload.contributions,
      });

      // Confere se foi persistido no cache do sessionStorage
      const stored = getContributionsFromCache("torvalds", 2024);
      expect(stored).toEqual(result);
    });

    it("ignora cache quando bypassCache for informado", async () => {
      const cachedData = {
        username: "gaearon",
        year: 2024 as const,
        totalContributions: 10,
        contributions: [{ date: "2024-01-01", count: 10, level: 2 as const }],
      };
      setContributionsInCache("gaearon", 2024, cachedData);

      const freshPayload = {
        total: { "2024": 99 },
        contributions: [{ date: "2024-01-01", count: 99, level: 4 }],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => freshPayload,
      });

      const result = await fetchGitHubContributions("gaearon", 2024, {
        bypassCache: true,
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.totalContributions).toBe(99);
    });

    it("lanca GitHubUserNotFoundError quando o status HTTP for 404", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        fetchGitHubContributions("usuario-inexistente-xyz", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toThrow(GitHubUserNotFoundError);

      await expect(
        fetchGitHubContributions("usuario-inexistente-xyz", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toMatchObject({
        username: "usuario-inexistente-xyz",
        name: "GitHubUserNotFoundError",
      });
    });

    it("lanca GitHubApiError com status quando a resposta HTTP indicar erro 500", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(
        fetchGitHubContributions("octocat", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toThrow(GitHubApiError);

      await expect(
        fetchGitHubContributions("octocat", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining("HTTP 500"),
      });
    });

    it("lanca GitHubApiError em caso de falha de conexao de rede", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

      await expect(
        fetchGitHubContributions("octocat", "last365", {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toThrow(GitHubApiError);

      await expect(
        fetchGitHubContributions("octocat", "last365", {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining("Network failure"),
      });
    });

    it("lanca GitHubApiError quando a resposta nao puder ser convertida em JSON", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("SyntaxError: Unexpected token");
        },
      });

      await expect(
        fetchGitHubContributions("octocat", "last365", {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toThrow(
        "Failed to parse GitHub contributions response as JSON."
      );
    });

    it("lanca GitHubApiError quando o payload violar o schema Zod", async () => {
      const invalidPayload = {
        total: "nao_e_objeto",
        contributions: [
          {
            date: "data-invalida",
            count: -5, // invalido: min(0)
            level: 9, // invalido: 0 | 1 | 2 | 3 | 4
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => invalidPayload,
      });

      await expect(
        fetchGitHubContributions("octocat", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toThrow(GitHubApiError);

      await expect(
        fetchGitHubContributions("octocat", 2024, {
          fetchFn: mockFetch as unknown as typeof fetch,
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining("Invalid GitHub contributions response format"),
      });
    });
  });
});
