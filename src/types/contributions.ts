export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface DayContribution {
  date: string;
  count: number;
  level: ContributionLevel;
  weekday: number;
  dayOfYear: number;
}

export interface UserContributionData {
  username: string;
  year: number | "last365";
  totalContributions: number;
  days: DayContribution[];
}

export interface DeviceDimensions {
  id: string;
  label: string;
  category: "mobile" | "desktop" | "tablet" | "ultrawide";
  width: number;
  height: number;
  aspectRatio: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  background: string;
  levels: [string, string, string, string, string];
  textColor: string;
  glowColor: string;
}
