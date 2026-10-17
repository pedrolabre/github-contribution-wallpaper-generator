import { describe, expect, it } from "vitest";
import type { DayContribution } from "../../src/types/contributions";
import { generateMockContributions } from "../../src/services/mockGenerator";
import { normalizeContributionDays } from "../../src/services/normalizer";
import {
  calculateActiveDays,
  calculateAnnualStats,
  calculateLevelDistribution,
  calculatePeakDay,
  calculateStreaks,
  calculateTotalContributions,
  calculateWeekdayDistribution,
  formatContributionNumber,
} from "../../src/services/statsCalculator";

function createDummyDay(
  date: string,
  count: number,
  weekday = 0,
  dayOfYear = 1,
  level: 0 | 1 | 2 | 3 | 4 = count > 0 ? 1 : 0
): DayContribution {
  return {
    date,
    count,
    level,
    weekday,
    dayOfYear,
  };
}

describe("statsCalculator", () => {
  describe("empty or zero-commit arrays", () => {
    it("handles an empty array gracefully", () => {
      const stats = calculateAnnualStats([]);

      expect(stats.totalContributions).toBe(0);
      expect(stats.totalDays).toBe(0);
      expect(stats.activeDays).toBe(0);
      expect(stats.inactiveDays).toBe(0);
      expect(stats.activeRatio).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.peakDay).toEqual({ date: null, count: 0 });
      expect(stats.averagePerDay).toBe(0);
      expect(stats.averagePerActiveDay).toBe(0);
      expect(stats.weekdayStats).toHaveLength(7);
      expect(stats.levelDistribution).toEqual({
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      });
    });

    it("handles an array with only zero-commit days", () => {
      const days: DayContribution[] = [
        createDummyDay("2024-01-01", 0, 1, 1),
        createDummyDay("2024-01-02", 0, 2, 2),
        createDummyDay("2024-01-03", 0, 3, 3),
      ];

      const stats = calculateAnnualStats(days);

      expect(stats.totalContributions).toBe(0);
      expect(stats.totalDays).toBe(3);
      expect(stats.activeDays).toBe(0);
      expect(stats.inactiveDays).toBe(3);
      expect(stats.activeRatio).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.peakDay).toEqual({ date: null, count: 0 });
      expect(stats.averagePerDay).toBe(0);
      expect(stats.averagePerActiveDay).toBe(0);
      expect(stats.levelDistribution[0]).toBe(3);
      expect(stats.levelDistribution[1]).toBe(0);
    });
  });

  describe("streak calculations", () => {
    it("computes single-day streak correctly", () => {
      const days = [
        createDummyDay("2024-01-01", 0),
        createDummyDay("2024-01-02", 5),
        createDummyDay("2024-01-03", 0),
      ];

      const { longestStreak, currentStreak } = calculateStreaks(days);
      expect(longestStreak).toBe(1);
      expect(currentStreak).toBe(0);
    });

    it("computes multiple streaks and identifies the longest", () => {
      const days = [
        createDummyDay("2024-01-01", 2),
        createDummyDay("2024-01-02", 3),
        createDummyDay("2024-01-03", 0),
        createDummyDay("2024-01-04", 1),
        createDummyDay("2024-01-05", 4),
        createDummyDay("2024-01-06", 6),
        createDummyDay("2024-01-07", 2),
        createDummyDay("2024-01-08", 0),
        createDummyDay("2024-01-09", 5),
        createDummyDay("2024-01-10", 3),
      ];

      const { longestStreak, currentStreak } = calculateStreaks(days);
      expect(longestStreak).toBe(4);
      expect(currentStreak).toBe(2);
    });

    it("reports full length when streak is unbroken across all days", () => {
      const days = [
        createDummyDay("2024-01-01", 1),
        createDummyDay("2024-01-02", 2),
        createDummyDay("2024-01-03", 3),
      ];

      const { longestStreak, currentStreak } = calculateStreaks(days);
      expect(longestStreak).toBe(3);
      expect(currentStreak).toBe(3);
    });

    it("sorts dates chronologically before evaluating streaks", () => {
      const days = [
        createDummyDay("2024-01-03", 1),
        createDummyDay("2024-01-01", 1),
        createDummyDay("2024-01-02", 1),
      ];

      const { longestStreak, currentStreak } = calculateStreaks(days);
      expect(longestStreak).toBe(3);
      expect(currentStreak).toBe(3);
    });
  });

  describe("peak day calculation", () => {
    it("identifies the single peak day", () => {
      const days = [
        createDummyDay("2024-01-01", 2),
        createDummyDay("2024-01-02", 18),
        createDummyDay("2024-01-03", 7),
      ];

      const peak = calculatePeakDay(days);
      expect(peak).toEqual({
        date: "2024-01-02",
        count: 18,
      });
    });

    it("breaks ties by returning the first chronological occurrence", () => {
      const days = [
        createDummyDay("2024-01-01", 5),
        createDummyDay("2024-01-02", 15),
        createDummyDay("2024-01-03", 10),
        createDummyDay("2024-01-04", 15),
      ];

      const peak = calculatePeakDay(days);
      expect(peak).toEqual({
        date: "2024-01-02",
        count: 15,
      });
    });
  });

  describe("weekday distribution", () => {
    it("groups all 7 weekdays and preserves sum consistency", () => {
      const days = [
        createDummyDay("2024-01-01", 4, 1),
        createDummyDay("2024-01-02", 2, 2),
        createDummyDay("2024-01-07", 6, 0),
        createDummyDay("2024-01-08", 10, 1),
      ];

      const distribution = calculateWeekdayDistribution(days);

      expect(distribution).toHaveLength(7);
      expect(distribution[0].weekday).toBe(0);
      expect(distribution[0].label).toBe("Sun");
      expect(distribution[0].shortLabel).toBe("S");
      expect(distribution[0].totalContributions).toBe(6);
      expect(distribution[0].dayCount).toBe(1);
      expect(distribution[0].activeDays).toBe(1);
      expect(distribution[0].averageContributions).toBe(6);

      expect(distribution[1].weekday).toBe(1);
      expect(distribution[1].label).toBe("Mon");
      expect(distribution[1].shortLabel).toBe("M");
      expect(distribution[1].totalContributions).toBe(14);
      expect(distribution[1].dayCount).toBe(2);
      expect(distribution[1].activeDays).toBe(2);
      expect(distribution[1].averageContributions).toBe(7);

      expect(distribution[2].weekday).toBe(2);
      expect(distribution[2].totalContributions).toBe(2);

      const totalFromDistribution = distribution.reduce(
        (sum, item) => sum + item.totalContributions,
        0
      );
      expect(totalFromDistribution).toBe(calculateTotalContributions(days));
    });

    it("ignores invalid weekday numbers safely", () => {
      const days = [
        createDummyDay("2024-01-01", 5, 8),
      ];

      const distribution = calculateWeekdayDistribution(days);
      const sum = distribution.reduce(
        (acc, item) => acc + item.totalContributions,
        0
      );
      expect(sum).toBe(0);
    });
  });

  describe("level distribution", () => {
    it("accumulates occurrences across all 5 levels", () => {
      const days = [
        createDummyDay("2024-01-01", 0, 1, 1, 0),
        createDummyDay("2024-01-02", 2, 2, 2, 1),
        createDummyDay("2024-01-03", 5, 3, 3, 2),
        createDummyDay("2024-01-04", 10, 4, 4, 3),
        createDummyDay("2024-01-05", 20, 5, 5, 4),
        createDummyDay("2024-01-06", 0, 6, 6, 0),
      ];

      const distribution = calculateLevelDistribution(days);
      expect(distribution[0]).toBe(2);
      expect(distribution[1]).toBe(1);
      expect(distribution[2]).toBe(1);
      expect(distribution[3]).toBe(1);
      expect(distribution[4]).toBe(1);
    });
  });

  describe("formatting helpers", () => {
    it("formats counts with standard thousand separators", () => {
      expect(formatContributionNumber(0)).toBe("0");
      expect(formatContributionNumber(42)).toBe("42");
      expect(formatContributionNumber(999)).toBe("999");
      expect(formatContributionNumber(1248)).toBe("1,248");
      expect(formatContributionNumber(1250000)).toBe("1,250,000");
    });
  });

  describe("integration with normalizer and mock generator", () => {
    it("calculates accurate annual stats on regular normalized year", () => {
      const normalizedDays = normalizeContributionDays({
        contributions: [
          { date: "2023-03-15", count: 12 },
          { date: "2023-03-16", count: 8 },
        ],
        year: 2023,
      });

      expect(normalizedDays).toHaveLength(365);

      const stats = calculateAnnualStats(normalizedDays);
      expect(stats.totalDays).toBe(365);
      expect(stats.totalContributions).toBe(20);
      expect(stats.activeDays).toBe(2);
      expect(stats.inactiveDays).toBe(363);
      expect(stats.longestStreak).toBe(2);
      expect(stats.currentStreak).toBe(0);
      expect(stats.peakDay).toEqual({
        date: "2023-03-15",
        count: 12,
      });
      expect(stats.activeRatio).toBe(0.005);
      expect(stats.averagePerDay).toBe(0.05);
      expect(stats.averagePerActiveDay).toBe(10);
    });

    it("calculates accurate annual stats on leap year (366 days)", () => {
      const normalizedDays = normalizeContributionDays({
        contributions: [
          { date: "2024-02-29", count: 14 },
        ],
        year: 2024,
      });

      expect(normalizedDays).toHaveLength(366);

      const stats = calculateAnnualStats(normalizedDays);
      expect(stats.totalDays).toBe(366);
      expect(stats.totalContributions).toBe(14);
      expect(stats.activeDays).toBe(1);
      expect(stats.peakDay.date).toBe("2024-02-29");
    });

    it("produces consistent stats with deterministic mock generation", () => {
      const mockData = generateMockContributions("torvalds", 2024);
      const stats = calculateAnnualStats(mockData.days);

      expect(stats.totalContributions).toBe(mockData.totalContributions);
      expect(stats.totalDays).toBe(366);
      expect(stats.activeDays).toBeGreaterThan(0);
      expect(stats.longestStreak).toBeGreaterThan(0);
      expect(stats.peakDay.count).toBeGreaterThan(0);
      expect(stats.peakDay.date).not.toBeNull();

      const sumLevelDays = Object.values(stats.levelDistribution).reduce(
        (a, b) => a + b,
        0
      );
      expect(sumLevelDays).toBe(366);

      const sumWeekdayTotals = stats.weekdayStats.reduce(
        (a, b) => a + b.totalContributions,
        0
      );
      expect(sumWeekdayTotals).toBe(mockData.totalContributions);
    });

    it("verifies activeDays helper standalone function", () => {
      const days = [
        createDummyDay("2024-01-01", 0),
        createDummyDay("2024-01-02", 3),
        createDummyDay("2024-01-03", 4),
      ];

      expect(calculateActiveDays(days)).toBe(2);
    });
  });
});
