import type { ContributionLevel, DayContribution } from "../types/contributions";

export interface PeakDayInfo {
  date: string | null;
  count: number;
}

export interface WeekdayStats {
  weekday: number;
  label: string;
  shortLabel: string;
  totalContributions: number;
  dayCount: number;
  activeDays: number;
  averageContributions: number;
}

export interface AnnualStats {
  totalContributions: number;
  totalDays: number;
  activeDays: number;
  inactiveDays: number;
  activeRatio: number;
  longestStreak: number;
  currentStreak: number;
  peakDay: PeakDayInfo;
  averagePerDay: number;
  averagePerActiveDay: number;
  weekdayStats: WeekdayStats[];
  levelDistribution: Record<ContributionLevel, number>;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_SHORT_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function calculateTotalContributions(days: DayContribution[]): number {
  return days.reduce((sum, d) => sum + d.count, 0);
}

export function calculateActiveDays(days: DayContribution[]): number {
  return days.filter((d) => d.count > 0).length;
}

export function calculateStreaks(days: DayContribution[]): {
  longestStreak: number;
  currentStreak: number;
} {
  if (days.length === 0) {
    return { longestStreak: 0, currentStreak: 0 };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of sorted) {
    if (day.count > 0) {
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    longestStreak,
    currentStreak,
  };
}

export function calculatePeakDay(days: DayContribution[]): PeakDayInfo {
  if (days.length === 0) {
    return { date: null, count: 0 };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let maxCount = 0;
  let peakDate: string | null = null;

  for (const day of sorted) {
    if (day.count > maxCount) {
      maxCount = day.count;
      peakDate = day.date;
    }
  }

  return {
    date: peakDate,
    count: maxCount,
  };
}

export function calculateWeekdayDistribution(
  days: DayContribution[]
): WeekdayStats[] {
  const result: WeekdayStats[] = WEEKDAY_LABELS.map((label, index) => ({
    weekday: index,
    label,
    shortLabel: WEEKDAY_SHORT_LABELS[index],
    totalContributions: 0,
    dayCount: 0,
    activeDays: 0,
    averageContributions: 0,
  }));

  for (const day of days) {
    const wd = day.weekday;
    if (wd >= 0 && wd <= 6) {
      result[wd].dayCount += 1;
      result[wd].totalContributions += day.count;
      if (day.count > 0) {
        result[wd].activeDays += 1;
      }
    }
  }

  for (const entry of result) {
    entry.averageContributions =
      entry.dayCount > 0
        ? Math.round((entry.totalContributions / entry.dayCount) * 100) / 100
        : 0;
  }

  return result;
}

export function calculateLevelDistribution(
  days: DayContribution[]
): Record<ContributionLevel, number> {
  const distribution: Record<ContributionLevel, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  for (const day of days) {
    if (day.level in distribution) {
      distribution[day.level] += 1;
    }
  }

  return distribution;
}

export function formatContributionNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function calculateAnnualStats(days: DayContribution[]): AnnualStats {
  const totalDays = days.length;
  const totalContributions = calculateTotalContributions(days);
  const activeDays = calculateActiveDays(days);
  const inactiveDays = totalDays - activeDays;
  const activeRatio =
    totalDays > 0 ? Math.round((activeDays / totalDays) * 1000) / 1000 : 0;

  const streaks = calculateStreaks(days);
  const peakDay = calculatePeakDay(days);
  const weekdayStats = calculateWeekdayDistribution(days);
  const levelDistribution = calculateLevelDistribution(days);

  const averagePerDay =
    totalDays > 0
      ? Math.round((totalContributions / totalDays) * 100) / 100
      : 0;
  const averagePerActiveDay =
    activeDays > 0
      ? Math.round((totalContributions / activeDays) * 100) / 100
      : 0;

  return {
    totalContributions,
    totalDays,
    activeDays,
    inactiveDays,
    activeRatio,
    longestStreak: streaks.longestStreak,
    currentStreak: streaks.currentStreak,
    peakDay,
    averagePerDay,
    averagePerActiveDay,
    weekdayStats,
    levelDistribution,
  };
}
