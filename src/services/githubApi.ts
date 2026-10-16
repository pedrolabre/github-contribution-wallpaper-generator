import { z } from "zod";
import type { ContributionLevel } from "../types/contributions";
import {
  getContributionsFromCache,
  setContributionsInCache,
} from "./cache";

export const GITHUB_CONTRIBUTIONS_API_BASE_URL =
  "https://github-contributions-api.jogruber.de/v4";

export class GitHubUserNotFoundError extends Error {
  public readonly username: string;

  constructor(username: string) {
    super(`GitHub user "${username}" was not found.`);
    this.name = "GitHubUserNotFoundError";
    this.username = username;
  }
}

export class GitHubApiError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.statusCode = statusCode;
  }
}

export const gitHubApiContributionDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().min(0),
  level: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
});

export const gitHubApiResponseSchema = z.object({
  total: z.record(z.string(), z.number()).optional().default({}),
  contributions: z.array(gitHubApiContributionDaySchema),
});

export type GitHubApiContributionDay = z.infer<typeof gitHubApiContributionDaySchema>;
export type GitHubApiResponse = z.infer<typeof gitHubApiResponseSchema>;

export interface GitHubContributionData {
  username: string;
  year: number | "last365";
  totalContributions: number;
  contributions: Array<{
    date: string;
    count: number;
    level: ContributionLevel;
  }>;
}

export interface FetchContributionsOptions {
  bypassCache?: boolean;
  fetchFn?: typeof fetch;
}

export function resolveYearParam(year?: number | "last365"): {
  normalizedYear: number | "last365";
  queryParam: string;
} {
  if (year === undefined || year === "last365") {
    return { normalizedYear: "last365", queryParam: "last" };
  }
  return { normalizedYear: year, queryParam: String(year) };
}

export function calculateTotalContributions(
  totalMap: Record<string, number>,
  contributions: GitHubApiContributionDay[],
  year: number | "last365"
): number {
  const primaryKey = year === "last365" ? "lastYear" : String(year);
  if (typeof totalMap[primaryKey] === "number") {
    return totalMap[primaryKey];
  }

  // Fallback para soma manual das contribuicoes caso a chave do ano nao esteja presente no mapa total
  return contributions.reduce((acc, curr) => acc + curr.count, 0);
}

export async function fetchGitHubContributions(
  username: string,
  year?: number | "last365",
  options?: FetchContributionsOptions
): Promise<GitHubContributionData> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new GitHubApiError("Username cannot be empty.");
  }

  const { normalizedYear, queryParam } = resolveYearParam(year);

  if (!options?.bypassCache) {
    const cached = getContributionsFromCache<GitHubContributionData>(
      trimmedUsername,
      normalizedYear
    );
    if (cached) {
      return cached;
    }
  }

  const fetchImplementation = options?.fetchFn ?? fetch;
  const url = `${GITHUB_CONTRIBUTIONS_API_BASE_URL}/${encodeURIComponent(trimmedUsername)}?y=${queryParam}`;

  let response: Response;
  try {
    response = await fetchImplementation(url);
  } catch (networkError) {
    const message =
      networkError instanceof Error ? networkError.message : "Unknown network error";
    throw new GitHubApiError(`Network failure while fetching GitHub contributions: ${message}`);
  }

  if (response.status === 404) {
    throw new GitHubUserNotFoundError(trimmedUsername);
  }

  if (!response.ok) {
    throw new GitHubApiError(
      `Failed to fetch GitHub contributions: HTTP ${response.status} ${response.statusText}`,
      response.status
    );
  }

  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch {
    throw new GitHubApiError("Failed to parse GitHub contributions response as JSON.");
  }

  const parseResult = gitHubApiResponseSchema.safeParse(rawJson);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new GitHubApiError(`Invalid GitHub contributions response format: ${errorDetails}`);
  }

  const totalContributions = calculateTotalContributions(
    parseResult.data.total,
    parseResult.data.contributions,
    normalizedYear
  );

  const resultData: GitHubContributionData = {
    username: trimmedUsername,
    year: normalizedYear,
    totalContributions,
    contributions: parseResult.data.contributions,
  };

  setContributionsInCache(trimmedUsername, normalizedYear, resultData);

  return resultData;
}
