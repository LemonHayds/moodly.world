"use server";

import { DEFAULT_ANALYTICS_TIME_PERIOD } from "../../../lib/contants";
import { fetchGlobalMoodsByTimePeriod } from "../../../lib/utils/analytics.utils";
import GlobeAnalyticsClientProvider from "./globe-analytics-client-provider";
import type { TimePeriodType } from "../../../lib/types/filter-time-periods.types";

export async function GlobeAnalyticsServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalMoods = await fetchGlobalMoodsByTimePeriod(
    DEFAULT_ANALYTICS_TIME_PERIOD.value as TimePeriodType
  );

  return (
    <GlobeAnalyticsClientProvider initialGlobalMoods={globalMoods}>
      {children}
    </GlobeAnalyticsClientProvider>
  );
}

export default GlobeAnalyticsServerProvider;
