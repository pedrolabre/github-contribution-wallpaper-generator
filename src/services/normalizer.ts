import type {
  ContributionLevel,
  DayContribution,
  UserContributionData,
} from "../types/contributions";

export interface RawContributionInput {
  date: string;
  count: number;
  level?: ContributionLevel;
}

export interface NormalizeOptions {
  contributions: RawContributionInput[];
  year: number | "last365";
  referenceDate?: string;
}

export interface NormalizeUserOptions extends NormalizeOptions {
  username: string;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function parseDateUtc(dateString: string): Date {
  const parts = dateString.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    throw new Error(`Invalid date format "${dateString}". Expected YYYY-MM-DD.`);
  }
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateLevelFromCount(count: number): ContributionLevel {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 14) return 3;
  return 4;
}

export function normalizeContributionDays(
  options: NormalizeOptions
): DayContribution[] {
  const { contributions, year, referenceDate } = options;

  const contributionMap = new Map<string, { count: number; level: ContributionLevel }>();
  for (const item of contributions) {
    const level =
      item.level !== undefined ? item.level : calculateLevelFromCount(item.count);
    contributionMap.set(item.date, {
      count: Math.max(0, item.count),
      level,
    });
  }

  const result: DayContribution[] = [];

  if (year === "last365") {
    let endDate: Date;
    if (referenceDate) {
      endDate = parseDateUtc(referenceDate);
    } else if (contributions.length > 0) {
      const sortedDates = contributions
        .map((c) => c.date)
        .sort((a, b) => a.localeCompare(b));
      endDate = parseDateUtc(sortedDates[sortedDates.length - 1]);
    } else {
      const now = new Date();
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const startDate = new Date(endDate.getTime() - 364 * 86_400_000);

    for (let dayIndex = 0; dayIndex < 365; dayIndex++) {
      const currentDate = new Date(startDate.getTime() + dayIndex * 86_400_000);
      const dateString = formatDateUtc(currentDate);
      const entry = contributionMap.get(dateString);

      result.push({
        date: dateString,
        count: entry ? entry.count : 0,
        level: entry ? entry.level : 0,
        weekday: currentDate.getUTCDay(),
        dayOfYear: dayIndex + 1,
      });
    }

    return result;
  }

  const totalDays = getDaysInYear(year);
  const startOfYearUtc = Date.UTC(year, 0, 1);

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDate = new Date(startOfYearUtc + dayOffset * 86_400_000);
    const dateString = formatDateUtc(currentDate);
    const entry = contributionMap.get(dateString);

    result.push({
      date: dateString,
      count: entry ? entry.count : 0,
      level: entry ? entry.level : 0,
      weekday: currentDate.getUTCDay(),
      dayOfYear: dayOffset + 1,
    });
  }

  return result;
}

export function normalizeUserContributions(
  options: NormalizeUserOptions
): UserContributionData {
  const days = normalizeContributionDays(options);
  const totalContributions = days.reduce((acc, curr) => acc + curr.count, 0);

  return {
    username: options.username.trim(),
    year: options.year,
    totalContributions,
    days,
  };
}
