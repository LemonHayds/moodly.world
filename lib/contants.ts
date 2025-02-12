import type { GlobeSettingsType } from "./types/settings.types";

// Milliseconds
export const ONE_HOUR_MILLISECONDS = 60 * 60 * 1000;
export const ONE_DAY_MILLISECONDS = 24 * ONE_HOUR_MILLISECONDS;
export const ONE_WEEK_MILLISECONDS = 7 * ONE_DAY_MILLISECONDS;
export const ONE_MONTH_MILLISECONDS = 30 * ONE_DAY_MILLISECONDS;
export const ONE_YEAR_MILLISECONDS = 365 * ONE_DAY_MILLISECONDS;

// Seconds
export const FIVE_MINUTES_IN_SECONDS = 5 * 60;
export const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

// Analytics Constants
export const ANALYTICS_FILTER_TABS = [
  { value: "1hr", label: "1hr" },
  { value: "24hr", label: "24hr" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];
export const DEFAULT_ANALYTICS_TIME_PERIOD = ANALYTICS_FILTER_TABS[0];

// Globe Constants
export const COUNTRY_CENTER_POSITIONS: Record<
  string,
  { lat: number; lng: number }
> = {
  US: { lat: 39.8283, lng: -98.5795 },
  CA: { lat: 55.0, lng: -105.0 },
  RU: { lat: 61.524, lng: 105.3188 },
  FR: { lat: 46.2276, lng: 2.2137 },
  BR: { lat: -15.7801, lng: -47.8825 },
  IN: { lat: 20.5937, lng: 78.9629 },
  JP: { lat: 36.2048, lng: 138.2529 },
  AU: { lat: -25.2744, lng: 133.7751 },
};

export const DEFAULT_GLOBE_SETTINGS: GlobeSettingsType = {
  spinningEnabled: true,
  emojisEnabled: true,
};

export const TOAST_CLASSNAMES =
  "w-fit bg-zinc-100/90 dark:bg-zinc-900/90 text-black dark:text-white backdrop-blur-sm";
