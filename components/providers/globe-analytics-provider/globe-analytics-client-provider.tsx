"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  DEFAULT_ANALYTICS_TIME_PERIOD,
  DEFAULT_GLOBE_SETTINGS,
} from "../../../lib/contants";
import {
  fetchGlobalMoodsByTimePeriod,
  fetchCountryMoodsByTimePeriod,
} from "../../../lib/utils/analytics.utils";
import type { TimePeriodType } from "../../../lib/types/filter-time-periods.types";

import type {
  GlobalMoodsTypeWithEmoji,
  CountryMoodsType,
} from "../../../lib/types/analytics.types";
import type { GlobeSettingsType } from "../../../lib/types/settings.types";
import MoodModal from "../../mood-modal/mood-modal";

type GlobeAnalyticsContextType = {
  activeFilter: TimePeriodType;
  setActiveFilter: (value: TimePeriodType) => void;
  countryMoods: CountryMoodsType | null;
  globalMoods: GlobalMoodsTypeWithEmoji | null;
  isFetchingGlobalMoods: boolean;
  selectedCountry: string | null;
  setSelectedCountry: (value: string | null) => void;
  isFetchingCountryMoods: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  globeSettings: GlobeSettingsType;
  setGlobeSettings: (value: GlobeSettingsType) => void;
  refetchCountryMoods: () => void;
};

const GlobeAnalyticsContext = createContext<
  GlobeAnalyticsContextType | undefined
>(undefined);

export function GlobeAnalyticsClientProvider({
  initialGlobalMoods,
  children,
}: {
  initialGlobalMoods: GlobalMoodsTypeWithEmoji | null;
  children: React.ReactNode;
}) {
  const [globeSettings, setGlobeSettings] = useState<GlobeSettingsType>(
    DEFAULT_GLOBE_SETTINGS
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimePeriodType>(
    DEFAULT_ANALYTICS_TIME_PERIOD.value as TimePeriodType
  );

  const [isFetchingGlobalMoods, setIsFetchingGlobalMoods] = useState(false);
  const [globalMoods, setGlobalMoods] =
    useState<GlobalMoodsTypeWithEmoji | null>(initialGlobalMoods);

  const [isFetchingCountryMoods, setIsFetchingCountryMoods] = useState(false);
  const [countryMoods, setCountryMoods] = useState<CountryMoodsType | null>(
    null
  );

  const fetchCountryMoods = async (withDelay = false) => {
    setIsFetchingCountryMoods(true);
    setCountryMoods(null);

    const countryMoods = await fetchCountryMoodsByTimePeriod(
      activeFilter as TimePeriodType,
      selectedCountry || "",
      withDelay
    );

    console.log("fetching after mood logged");

    if (countryMoods) {
      setCountryMoods(countryMoods);
    }

    setIsFetchingCountryMoods(false);
  };

  // Every time the modal is opened, fetch the specific country analytics using selected country and active filter
  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    fetchCountryMoods();
  }, [isModalOpen]);

  // Active filter country moods control
  useEffect(() => {
    if (activeFilter === DEFAULT_ANALYTICS_TIME_PERIOD.value) {
      setGlobalMoods(initialGlobalMoods);
      return;
    }

    const fetchGlobalMoods = async () => {
      setIsFetchingGlobalMoods(true);
      setGlobalMoods(null);
      const globalMoods = await fetchGlobalMoodsByTimePeriod(
        activeFilter as TimePeriodType
      );

      if (globalMoods) {
        setGlobalMoods(globalMoods);
      }

      setIsFetchingGlobalMoods(false);
    };
    fetchGlobalMoods();
  }, [activeFilter, initialGlobalMoods]);

  return (
    <GlobeAnalyticsContext.Provider
      value={{
        activeFilter,
        setActiveFilter,
        countryMoods,
        globalMoods,
        isFetchingGlobalMoods,
        isFetchingCountryMoods,
        selectedCountry,
        setSelectedCountry,
        isModalOpen,
        setIsModalOpen,
        globeSettings,
        setGlobeSettings,
        refetchCountryMoods: () => fetchCountryMoods(true),
      }}
    >
      {children}
      <MoodModal />
    </GlobeAnalyticsContext.Provider>
  );
}

export default GlobeAnalyticsClientProvider;

export function useGlobeAnalytics() {
  const context = useContext(GlobeAnalyticsContext);
  if (context === undefined) {
    throw new Error("Error");
  }
  return context;
}
