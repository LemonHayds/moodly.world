"use server";

import Globe from "../components/globe/globe";
import MoodLogger from "../components/mood-logger";
import AnalyticsFilterTabs from "../components/analytics-filter-tabs";

export default async function Moodly() {
  return (
    <div className="min-h-[100dvh] max-w-screen w-full overflow-hidden">
      <div className="relative w-full h-[100dvh] min-w-full flex items-center justify-center">
        <div className="absolute top-[90px] sm:top-[95px] left-1/2 -translate-x-1/2 z-[10] md:hidden">
          <AnalyticsFilterTabs />
        </div>
        <Globe />
        <MoodLogger className="z-[10] absolute bottom-[30px] sm:bottom-[48px] left-1/2 transform -translate-x-1/2" />
      </div>
    </div>
  );
}
