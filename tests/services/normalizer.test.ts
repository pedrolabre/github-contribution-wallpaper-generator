import { describe, expect, it } from "vitest";
import {
  calculateLevelFromCount,
  formatDateUtc,
  getDaysInYear,
  isLeapYear,
  normalizeContributionDays,
  normalizeUserContributions,
  parseDateUtc,
} from "../../src/services/normalizer";

describe("normalizer service", () => {
  describe("isLeapYear and getDaysInYear", () => {
    it("identifies standard leap years correctly", () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2021)).toBe(false);
    });

    it("handles secular century leap year rules", () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
    });

    it("returns 366 for leap years and 365 for regular years", () => {
      expect(getDaysInYear(2024)).toBe(366);
      expect(getDaysInYear(2023)).toBe(365);
      expect(getDaysInYear(2000)).toBe(366);
      expect(getDaysInYear(1900)).toBe(365);
    });
  });

  describe("parseDateUtc and formatDateUtc", () => {
    it("parses valid YYYY-MM-DD strings to UTC dates", () => {
      const date = parseDateUtc("2024-02-29");
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(1);
      expect(date.getUTCDate()).toBe(29);
      expect(date.getUTCHours()).toBe(0);
    });

    it("formats UTC dates into padded YYYY-MM-DD strings", () => {
      const date = new Date(Date.UTC(2023, 4, 9));
      expect(formatDateUtc(date)).toBe("2023-05-09");
    });

    it("throws an error when parsing an invalid date string", () => {
      expect(() => parseDateUtc("invalid-date")).toThrowError(
        'Invalid date format "invalid-date". Expected YYYY-MM-DD.'
      );
      expect(() => parseDateUtc("2024-13")).toThrowError(
        'Invalid date format "2024-13". Expected YYYY-MM-DD.'
      );
    });
  });

  describe("calculateLevelFromCount", () => {
    it("maps commit counts to corresponding contribution levels", () => {
      expect(calculateLevelFromCount(0)).toBe(0);
      expect(calculateLevelFromCount(-5)).toBe(0);
      expect(calculateLevelFromCount(1)).toBe(1);
      expect(calculateLevelFromCount(3)).toBe(1);
      expect(calculateLevelFromCount(4)).toBe(2);
      expect(calculateLevelFromCount(7)).toBe(2);
      expect(calculateLevelFromCount(8)).toBe(3);
      expect(calculateLevelFromCount(14)).toBe(3);
      expect(calculateLevelFromCount(15)).toBe(4);
      expect(calculateLevelFromCount(100)).toBe(4);
    });
  });

  describe("normalizeContributionDays", () => {
    it("normalizes a regular year into continuous 365 days", () => {
      const raw = [
        { date: "2023-01-01", count: 5, level: 2 as const },
        { date: "2023-12-31", count: 12, level: 3 as const },
      ];

      const days = normalizeContributionDays({
        contributions: raw,
        year: 2023,
      });

      expect(days).toHaveLength(365);
      expect(days[0].date).toBe("2023-01-01");
      expect(days[0].count).toBe(5);
      expect(days[0].level).toBe(2);
      expect(days[0].dayOfYear).toBe(1);
      expect(days[0].weekday).toBe(0);

      expect(days[364].date).toBe("2023-12-31");
      expect(days[364].count).toBe(12);
      expect(days[364].level).toBe(3);
      expect(days[364].dayOfYear).toBe(365);
      expect(days[364].weekday).toBe(0);

      // Empty in-between days are filled with zeroes
      expect(days[1].date).toBe("2023-01-02");
      expect(days[1].count).toBe(0);
      expect(days[1].level).toBe(0);
      expect(days[1].dayOfYear).toBe(2);
      expect(days[1].weekday).toBe(1);
    });

    it("normalizes a leap year into continuous 366 days including February 29", () => {
      const raw = [
        { date: "2024-02-29", count: 20, level: 4 as const },
      ];

      const days = normalizeContributionDays({
        contributions: raw,
        year: 2024,
      });

      expect(days).toHaveLength(366);
      expect(days[0].date).toBe("2024-01-01");
      expect(days[days.length - 1].date).toBe("2024-12-31");
      expect(days[days.length - 1].dayOfYear).toBe(366);

      // February 29 is the 60th day of a leap year (31 in Jan + 29 in Feb)
      const feb29 = days.find((d) => d.date === "2024-02-29");
      expect(feb29).toBeDefined();
      expect(feb29?.count).toBe(20);
      expect(feb29?.level).toBe(4);
      expect(feb29?.dayOfYear).toBe(60);
      expect(feb29?.weekday).toBe(4);
    });

    it("calculates level automatically if not present in input", () => {
      const raw = [
        { date: "2023-06-15", count: 9 },
      ];

      const days = normalizeContributionDays({
        contributions: raw,
        year: 2023,
      });

      const day = days.find((d) => d.date === "2023-06-15");
      expect(day?.level).toBe(3);
    });

    it("normalizes last365 with explicit referenceDate", () => {
      const raw = [
        { date: "2024-10-30", count: 7, level: 2 as const },
      ];

      const days = normalizeContributionDays({
        contributions: raw,
        year: "last365",
        referenceDate: "2024-10-30",
      });

      expect(days).toHaveLength(365);
      expect(days[days.length - 1].date).toBe("2024-10-30");
      expect(days[days.length - 1].count).toBe(7);
      expect(days[days.length - 1].dayOfYear).toBe(365);

      expect(days[0].dayOfYear).toBe(1);
      expect(days[0].date).toBe("2023-11-01");
    });

    it("normalizes last365 inferring referenceDate from contributions if not provided", () => {
      const raw = [
        { date: "2024-05-01", count: 2 },
        { date: "2024-08-10", count: 5 },
      ];

      const days = normalizeContributionDays({
        contributions: raw,
        year: "last365",
      });

      expect(days).toHaveLength(365);
      expect(days[days.length - 1].date).toBe("2024-08-10");
    });
  });

  describe("normalizeUserContributions", () => {
    it("returns UserContributionData with calculated total and normalized days", () => {
      const raw = [
        { date: "2023-03-01", count: 3 },
        { date: "2023-03-02", count: 10 },
      ];

      const result = normalizeUserContributions({
        username: "  alice  ",
        year: 2023,
        contributions: raw,
      });

      expect(result.username).toBe("alice");
      expect(result.year).toBe(2023);
      expect(result.totalContributions).toBe(13);
      expect(result.days).toHaveLength(365);
    });
  });
});
