import type {
  ContributionLevel,
  DayContribution,
  UserContributionData,
} from "../types/contributions";
import {
  formatDateUtc,
  getDaysInYear,
  parseDateUtc,
} from "./normalizer";

export interface MockGeneratorOptions {
  referenceDate?: string;
  activityDensity?: "low" | "medium" | "high";
}

export function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveActivityThreshold(
  density: "low" | "medium" | "high",
  isWeekend: boolean
): number {
  if (density === "low") {
    return isWeekend ? 0.15 : 0.45;
  }
  if (density === "high") {
    return isWeekend ? 0.45 : 0.85;
  }
  return isWeekend ? 0.28 : 0.68;
}

function sampleCommitStats(
  rng: () => number
): { count: number; level: ContributionLevel } {
  const roll = rng();

  if (roll < 0.5) {
    const count = 1 + Math.floor(rng() * 3);
    return { count, level: 1 };
  }
  if (roll < 0.8) {
    const count = 4 + Math.floor(rng() * 4);
    return { count, level: 2 };
  }
  if (roll < 0.95) {
    const count = 8 + Math.floor(rng() * 7);
    return { count, level: 3 };
  }

  const count = 15 + Math.floor(rng() * 11);
  return { count, level: 4 };
}

export function generateMockContributions(
  username: string,
  year: number | "last365" = "last365",
  options?: MockGeneratorOptions
): UserContributionData {
  const cleanUsername = username.trim() || "octocat";
  const density = options?.activityDensity ?? "medium";

  const seedKey = `${cleanUsername.toLowerCase()}:${year}:${density}`;
  const seed = fnv1a32(seedKey);
  const rng = createMulberry32(seed);

  const days: DayContribution[] = [];

  if (year === "last365") {
    let endDate: Date;
    if (options?.referenceDate) {
      endDate = parseDateUtc(options.referenceDate);
    } else {
      const now = new Date();
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const startDate = new Date(endDate.getTime() - 364 * 86_400_000);

    for (let dayIndex = 0; dayIndex < 365; dayIndex++) {
      const currentDate = new Date(startDate.getTime() + dayIndex * 86_400_000);
      const weekday = currentDate.getUTCDay();
      const isWeekend = weekday === 0 || weekday === 6;

      const activityThreshold = resolveActivityThreshold(density, isWeekend);
      const isDayActive = rng() < activityThreshold;

      let count = 0;
      let level: ContributionLevel = 0;

      if (isDayActive) {
        const stats = sampleCommitStats(rng);
        count = stats.count;
        level = stats.level;
      }

      days.push({
        date: formatDateUtc(currentDate),
        count,
        level,
        weekday,
        dayOfYear: dayIndex + 1,
      });
    }
  } else {
    const totalDays = getDaysInYear(year);
    const startOfYearUtc = Date.UTC(year, 0, 1);

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = new Date(startOfYearUtc + dayOffset * 86_400_000);
      const weekday = currentDate.getUTCDay();
      const isWeekend = weekday === 0 || weekday === 6;

      const activityThreshold = resolveActivityThreshold(density, isWeekend);
      const isDayActive = rng() < activityThreshold;

      let count = 0;
      let level: ContributionLevel = 0;

      if (isDayActive) {
        const stats = sampleCommitStats(rng);
        count = stats.count;
        level = stats.level;
      }

      days.push({
        date: formatDateUtc(currentDate),
        count,
        level,
        weekday,
        dayOfYear: dayOffset + 1,
      });
    }
  }

  const totalContributions = days.reduce((acc, curr) => acc + curr.count, 0);

  return {
    username: cleanUsername,
    year,
    totalContributions,
    days,
  };
}
