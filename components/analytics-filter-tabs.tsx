"use client";

import { ANALYTICS_FILTER_TABS } from "@/lib/contants";

import { useGlobeAnalytics } from "./providers/globe-analytics-provider/globe-analytics-client-provider";
import SlidingTabs from "./sliding-tabs";
import type { TimePeriodType } from "../lib/types/filter-time-periods.types";

const AnalyticsFilterTabs = (props: { className?: string }) => {
  const { className = "" } = props;

  const { activeFilter, setActiveFilter } = useGlobeAnalytics();

  return (
    <div className={`w-full relative z-10 pointer-events-none ${className}`}>
      <SlidingTabs
        tabs={ANALYTICS_FILTER_TABS}
        activeTab={activeFilter}
        setActiveTab={(value) => setActiveFilter(value as TimePeriodType)}
      />
    </div>
  );
};

export default AnalyticsFilterTabs;
