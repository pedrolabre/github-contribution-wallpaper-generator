import { describe, expect, it } from "vitest";
import {
  createMulberry32,
  fnv1a32,
  generateMockContributions,
} from "../../src/services/mockGenerator";

describe("mockGenerator service", () => {
  describe("fnv1a32 hash function", () => {
    it("returns consistent 32-bit unsigned integer hashes for identical input", () => {
      const hash1 = fnv1a32("test-username:2024:medium");
      const hash2 = fnv1a32("test-username:2024:medium");

      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThanOrEqual(0xffffffff);
    });

    it("generates different hashes for distinct inputs", () => {
      const hashA = fnv1a32("userA:2024:medium");
      const hashB = fnv1a32("userB:2024:medium");

      expect(hashA).not.toBe(hashB);
    });
  });

  describe("createMulberry32 PRNG", () => {
    it("generates identical sequence of floats for the same seed", () => {
      const rng1 = createMulberry32(12345);
      const rng2 = createMulberry32(12345);

      for (let i = 0; i < 10; i++) {
        const val1 = rng1();
        const val2 = rng2();
        expect(val1).toBe(val2);
        expect(val1).toBeGreaterThanOrEqual(0);
        expect(val1).toBeLessThan(1);
      }
    });

    it("generates distinct numbers across iterations", () => {
      const rng = createMulberry32(999);
      const set = new Set<number>();
      for (let i = 0; i < 20; i++) {
        set.add(rng());
      }
      expect(set.size).toBe(20);
    });
  });

  describe("generateMockContributions", () => {
    it("generates 100% deterministic results for the same username and year", () => {
      const run1 = generateMockContributions("pedrolabre", 2024);
      const run2 = generateMockContributions("pedrolabre", 2024);

      expect(run1).toEqual(run2);
      expect(run1.totalContributions).toBe(run2.totalContributions);
    });

    it("produces distinct contribution histories for different usernames", () => {
      const user1 = generateMockContributions("alice", 2024);
      const user2 = generateMockContributions("bob", 2024);

      expect(user1.totalContributions).not.toBe(user2.totalContributions);
      expect(user1.days[10].count).not.toBe(user2.days[10].count);
    });

    it("generates 366 days for leap years and 365 days for non-leap years", () => {
      const leap = generateMockContributions("alice", 2024);
      const regular = generateMockContributions("alice", 2023);
      const last365 = generateMockContributions("alice", "last365", {
        referenceDate: "2024-10-30",
      });

      expect(leap.days).toHaveLength(366);
      expect(regular.days).toHaveLength(365);
      expect(last365.days).toHaveLength(365);
      expect(last365.days[last365.days.length - 1].date).toBe("2024-10-30");
    });

    it("guarantees totalContributions matches the exact sum of daily counts", () => {
      const result = generateMockContributions("matrix_dev", 2023);
      const calculatedSum = result.days.reduce((acc, curr) => acc + curr.count, 0);

      expect(result.totalContributions).toBe(calculatedSum);
    });

    it("ensures level correlates with count according to specifications", () => {
      const result = generateMockContributions("power_user", 2024, {
        activityDensity: "high",
      });

      for (const day of result.days) {
        if (day.level === 0) {
          expect(day.count).toBe(0);
        } else if (day.level === 1) {
          expect(day.count).toBeGreaterThanOrEqual(1);
          expect(day.count).toBeLessThanOrEqual(3);
        } else if (day.level === 2) {
          expect(day.count).toBeGreaterThanOrEqual(4);
          expect(day.count).toBeLessThanOrEqual(7);
        } else if (day.level === 3) {
          expect(day.count).toBeGreaterThanOrEqual(8);
          expect(day.count).toBeLessThanOrEqual(14);
        } else if (day.level === 4) {
          expect(day.count).toBeGreaterThanOrEqual(15);
        }
      }
    });

    it("produces higher total contributions for high density than low density", () => {
      const low = generateMockContributions("dev", 2024, { activityDensity: "low" });
      const high = generateMockContributions("dev", 2024, { activityDensity: "high" });

      expect(high.totalContributions).toBeGreaterThan(low.totalContributions);
    });

    it("defaults to octocat if username is blank or whitespace", () => {
      const blank = generateMockContributions("   ", 2024);
      const octocat = generateMockContributions("octocat", 2024);

      expect(blank.username).toBe("octocat");
      expect(blank).toEqual(octocat);
    });
  });
});
