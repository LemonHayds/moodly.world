"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { getEmojiById } from "../emoji.utils";
import type {
  AnalyticsDataType,
  GlobalMoodsType,
  GlobalMoodsTypeWithEmoji,
  CountryMoodsType,
  CountryAnalyticsType,
} from "../types/analytics.types";
import type { MoodLogType } from "../types/mood-log.types";
import type { TimePeriodType } from "../types/filter-time-periods.types";
import {
  ONE_DAY_MILLISECONDS,
  FIVE_MINUTES_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_MILLISECONDS,
} from "../contants";
import { createClient } from "./supabase/server";
import { unstable_cache } from "next/cache";

// Create a new analytics row
export async function createNewAnalyticsRow(
  supabase: SupabaseClient,
  analytics: AnalyticsDataType,
  timeWindow: "24h",
  logsCount: number,
  lastProcessedLogTimestamp?: string | null
) {
  const { error: insertError } = await supabase.from("mood_analytics").insert({
    time_window: timeWindow,
    analytics,
    last_log_processed_at: lastProcessedLogTimestamp,
    logs_count: logsCount,
  });

  if (insertError) {
    console.error(`❌ Error inserting ${timeWindow} analytics:`, insertError);
    throw insertError;
  }

  console.log(`📝 Created new ${timeWindow} analytics`);
}

// Fetch mood logs
export async function fetchMoodLogs(
  supabase: SupabaseClient,
  now: Date,
  lastProcessedLogTimestamp?: string,
  countryCode?: string
): Promise<MoodLogType[]> {
  let query = supabase
    .from("mood_logs")
    .select("id, mood_id, location, created_at")
    .gt(
      "created_at",
      lastProcessedLogTimestamp ||
        new Date(Date.now() - ONE_DAY_MILLISECONDS).toISOString()
    )
    .lt("created_at", now.toISOString());

  if (countryCode) {
    query = query.eq("location->>country", countryCode);
  }

  const { data: moodLogs, error: moodLogsError } = await query;

  if (moodLogsError) {
    console.error("❌ Error fetching mood logs:", moodLogsError);
    throw moodLogsError;
  }

  return moodLogs as MoodLogType[];
}

// Get the last processed analytics timestamp
export async function fetchLastProcessedAnalyticsTimestamp(
  supabase: SupabaseClient
): Promise<string> {
  const { data, error } = await supabase
    .from("mood_analytics")
    .select("last_log_processed_at")
    .order("last_log_processed_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.log(
      "❌ No last processed log timestamp found, using default value"
    );
    return new Date(Date.now() - ONE_DAY_MILLISECONDS).toISOString();
  }

  console.log(
    "✅ Found last processed log timestamp:",
    data.last_log_processed_at
  );

  return data.last_log_processed_at;
}

// Calculate analytics
export async function calculateAnalytics(
  moodLogs: MoodLogType[],
  latestLogTimestamp: string
): Promise<{
  analytics: AnalyticsDataType;
  logsCount: number;
  latestLogTimestamp: string;
}> {
  const analytics: AnalyticsDataType = {};
  let logsCount = 0;
  let rawLatestTimestamp = null;

  for (const log of moodLogs) {
    const country = log.location?.country || "UNKNOWN";

    if (!analytics[country]) {
      analytics[country] = {
        moodCounts: {},
        total: 0,
      };
    }

    analytics[country].moodCounts[log.mood_id] =
      (analytics[country].moodCounts[log.mood_id] || 0) + 1;
    analytics[country].total += 1;
    logsCount += 1;

    if (!rawLatestTimestamp || log.created_at > rawLatestTimestamp) {
      rawLatestTimestamp = log.created_at;
    }
  }

  return {
    analytics,
    logsCount,
    // Fallback to latest log timestamp from previous analytics if rawLatestTimestamp is null
    latestLogTimestamp: rawLatestTimestamp || latestLogTimestamp,
  };
}

// Fetch global moods (most common mood for each country)
export async function fetchGlobalMoodsByTimePeriod(
  timePeriod: TimePeriodType
): Promise<GlobalMoodsTypeWithEmoji | null> {
  const supabase = createClient();
  let globalMoods: GlobalMoodsTypeWithEmoji | null = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  console.log("Fetching global moods for time period:", timePeriod);

  while (attempts < MAX_ATTEMPTS) {
    try {
      switch (timePeriod) {
        case "1hr":
          globalMoods = await fetchGlobalMoodsLastHour(supabase);
          break;
        case "24hr":
          globalMoods = await fetchGlobalMoodsLast24Hours(supabase);
          break;
        case "week":
          globalMoods = await fetchGlobalMoodsLastWeek(supabase);
          break;
        case "month":
          globalMoods = await fetchGlobalMoodsLastMonth(supabase);
          break;
        case "year":
          globalMoods = await fetchGlobalMoodsLastYear(supabase);
          break;
      }

      if (globalMoods) {
        return globalMoods;
      }

      attempts++;
    } catch (error) {
      attempts++;
      if (attempts === MAX_ATTEMPTS) {
        console.log("Failed to fetch country moods after 3 attempts", error);
        return null;
      }
    }
  }

  return null;
}

export const fetchGlobalMoodsLastHour = unstable_cache(
  async (supabase: SupabaseClient): Promise<GlobalMoodsTypeWithEmoji> => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const moodLogs = await fetchMoodLogs(
      supabase,
      now,
      oneHourAgo.toISOString()
    );

    const { analytics } = await calculateAnalytics(
      moodLogs,
      oneHourAgo.toISOString()
    );

    const globalMoods = transformAnalyticsToGlobalMoods(analytics);
    return addEmojiToGlobalMoods(globalMoods);
  },
  ["global-moods-hour"],
  {
    revalidate: FIVE_MINUTES_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchGlobalMoodsLast24Hours = unstable_cache(
  async (supabase: SupabaseClient): Promise<GlobalMoodsTypeWithEmoji> => {
    const { data: latestAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .eq("time_window", "24h")
      .gt(
        "created_at",
        new Date(Date.now() - ONE_DAY_MILLISECONDS).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !latestAnalytics) {
      console.error("Error fetching 24h analytics or no recent data:", error);
      return {};
    }

    const globalMoods = transformAnalyticsToGlobalMoods(
      latestAnalytics.analytics
    );
    return addEmojiToGlobalMoods(globalMoods);
  },
  ["global-moods-24hr"],
  {
    revalidate: FIVE_MINUTES_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchGlobalMoodsLastWeek = unstable_cache(
  async (supabase: SupabaseClient): Promise<GlobalMoodsTypeWithEmoji> => {
    const { data: weekAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(7);

    if (error || !weekAnalytics || weekAnalytics.length === 0) {
      console.error("Error fetching week analytics:", error);
      return {};
    }

    const mergedAnalytics = mergeAnalyticsRows(weekAnalytics);

    const globalMoods = transformAnalyticsToGlobalMoods(mergedAnalytics);
    return addEmojiToGlobalMoods(globalMoods);
  },
  ["global-moods-week"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchGlobalMoodsLastMonth = unstable_cache(
  async (supabase: SupabaseClient): Promise<GlobalMoodsTypeWithEmoji> => {
    const { data: monthAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !monthAnalytics || monthAnalytics.length === 0) {
      console.error("Error fetching month analytics:", error);
      return {};
    }

    const mergedAnalytics = mergeAnalyticsRows(monthAnalytics);

    const globalMoods = transformAnalyticsToGlobalMoods(mergedAnalytics);
    return addEmojiToGlobalMoods(globalMoods);
  },
  ["global-moods-month"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchGlobalMoodsLastYear = unstable_cache(
  async (supabase: SupabaseClient): Promise<GlobalMoodsTypeWithEmoji> => {
    const { data: yearAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(365);

    if (error || !yearAnalytics || yearAnalytics.length === 0) {
      console.error("Error fetching year analytics:", error);
      return {};
    }

    const mergedAnalytics = mergeAnalyticsRows(yearAnalytics);

    const globalMoods = transformAnalyticsToGlobalMoods(mergedAnalytics);
    return addEmojiToGlobalMoods(globalMoods);
  },
  ["global-moods-year"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

// Fetch all logged moods for a specific country
export async function fetchCountryMoodsByTimePeriod(
  timePeriod: TimePeriodType,
  countryCode: string
): Promise<CountryMoodsType | null> {
  const supabase = createClient();
  let countryMoods: CountryMoodsType | null = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  console.log("Fetching country moods for time period:", timePeriod);

  while (attempts < MAX_ATTEMPTS) {
    try {
      switch (timePeriod) {
        case "1hr":
          countryMoods = await fetchCountryMoodsLastHour(supabase, countryCode);
          break;
        case "24hr":
          countryMoods = await fetchCountryMoodsLast24Hours(
            supabase,
            countryCode
          );
          break;
        case "week":
          countryMoods = await fetchCountryMoodsLastWeek(supabase, countryCode);
          break;
        case "month":
          countryMoods = await fetchCountryMoodsLastMonth(
            supabase,
            countryCode
          );
          break;
        case "year":
          countryMoods = await fetchCountryMoodsLastYear(supabase, countryCode);
          break;
      }

      if (countryMoods && countryMoods?.length > 0) {
        return countryMoods;
      }

      attempts++;
    } catch (error) {
      attempts++;
      if (attempts === MAX_ATTEMPTS) {
        console.log("Failed to fetch country moods after 3 attempts", error);
        return null;
      }
    }
  }

  return null;
}

export const fetchCountryMoodsLastHour = unstable_cache(
  async (
    supabase: SupabaseClient,
    countryCode: string
  ): Promise<CountryMoodsType | null> => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - ONE_HOUR_MILLISECONDS);

    const moodLogs = await fetchMoodLogs(
      supabase,
      now,
      oneHourAgo.toISOString(),
      countryCode
    );

    if (!moodLogs || moodLogs.length === 0) {
      return null;
    }

    return await transformLogsToCountryMoods(moodLogs);
  },
  ["country-moods-hour"],
  {
    revalidate: FIVE_MINUTES_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchCountryMoodsLast24Hours = unstable_cache(
  async (
    supabase: SupabaseClient,
    countryCode: string
  ): Promise<CountryMoodsType | null> => {
    const { data: latestAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .eq("time_window", "24h")
      .gt(
        "created_at",
        new Date(Date.now() - ONE_DAY_MILLISECONDS).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !latestAnalytics) {
      console.error("Error fetching 24h analytics or no recent data:", error);
      return null;
    }

    const countryAnalytics = latestAnalytics.analytics[countryCode];
    console.log("Country analytics:", countryAnalytics);
    if (!countryAnalytics) {
      return null;
    }

    const countryMoods = await transformAnalyticsToCountryMoods(
      countryAnalytics
    );

    return countryMoods;
  },
  ["country-moods-24hr"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchCountryMoodsLastWeek = unstable_cache(
  async (
    supabase: SupabaseClient,
    countryCode: string
  ): Promise<CountryMoodsType | null> => {
    const { data: weekAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(7);

    if (error || !weekAnalytics || weekAnalytics.length === 0) {
      console.error("Error fetching week analytics:", error);
      return null;
    }

    const mergedAnalytics = mergeAnalyticsRows(weekAnalytics);
    const countryAnalytics = mergedAnalytics[countryCode];

    if (!countryAnalytics) {
      return null;
    }

    const countryMoods = await transformAnalyticsToCountryMoods(
      countryAnalytics
    );

    return countryMoods;
  },
  ["country-moods-week"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchCountryMoodsLastMonth = unstable_cache(
  async (
    supabase: SupabaseClient,
    countryCode: string
  ): Promise<CountryMoodsType | null> => {
    const { data: monthAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !monthAnalytics || monthAnalytics.length === 0) {
      console.error("Error fetching month analytics:", error);
      return null;
    }

    const mergedAnalytics = mergeAnalyticsRows(monthAnalytics);
    const countryAnalytics = mergedAnalytics[countryCode];

    if (!countryAnalytics) {
      return null;
    }

    const countryMoods = await transformAnalyticsToCountryMoods(
      countryAnalytics
    );

    return countryMoods;
  },
  ["country-moods-month"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

export const fetchCountryMoodsLastYear = unstable_cache(
  async (
    supabase: SupabaseClient,
    countryCode: string
  ): Promise<CountryMoodsType | null> => {
    const { data: yearAnalytics, error } = await supabase
      .from("mood_analytics")
      .select("analytics")
      .order("created_at", { ascending: false })
      .limit(365);

    if (error || !yearAnalytics || yearAnalytics.length === 0) {
      console.error("Error fetching year analytics:", error);
      return null;
    }

    const mergedAnalytics = mergeAnalyticsRows(yearAnalytics);
    const countryAnalytics = mergedAnalytics[countryCode];

    if (!countryAnalytics) {
      return null;
    }

    const countryMoods = await transformAnalyticsToCountryMoods(
      countryAnalytics
    );

    return countryMoods;
  },
  ["country-moods-year"],
  {
    revalidate: ONE_DAY_IN_SECONDS,
    tags: ["analytics"],
  }
);

async function transformLogsToCountryMoods(
  moodLogs: MoodLogType[]
): Promise<CountryMoodsType> {
  // Group logs by mood_id to count occurrences
  const moodCounts: Record<string, number> = {};
  moodLogs.forEach((log) => {
    moodCounts[log.mood_id] = (moodCounts[log.mood_id] || 0) + 1;
  });

  // Convert to array of CountryMoodType
  const countryMoods: CountryMoodsType = await Promise.all(
    Object.entries(moodCounts).map(async ([mood_id, total]) => ({
      mood_id,
      total,
      emoji: (await getEmojiById(mood_id)) || "",
    }))
  );

  return countryMoods;
}

function mergeAnalyticsRows(
  analyticsRows: { analytics: AnalyticsDataType }[]
): AnalyticsDataType {
  // Merge analytics from all days
  const mergedAnalytics: AnalyticsDataType = {};

  analyticsRows.forEach((row) => {
    if (!row.analytics) return;

    Object.entries(row.analytics).forEach(([country, countryData]) => {
      if (!mergedAnalytics[country]) {
        mergedAnalytics[country] = {
          moodCounts: {},
          total: 0,
        };
      }

      // Sum up mood counts
      Object.entries(countryData.moodCounts).forEach(([moodId, count]) => {
        mergedAnalytics[country].moodCounts[moodId] =
          (mergedAnalytics[country].moodCounts[moodId] || 0) + count;
      });

      // Sum up total
      mergedAnalytics[country].total += countryData.total;
    });
  });

  return mergedAnalytics;
}

function transformAnalyticsToGlobalMoods(
  analytics: AnalyticsDataType
): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(analytics).forEach(([country, data]) => {
    const [[mostCommonMoodId]] = Object.entries(data.moodCounts).sort(
      ([, a], [, b]) => b - a
    );
    result[country] = mostCommonMoodId;
  });

  return result;
}

async function transformAnalyticsToCountryMoods(
  countryAnalytics: CountryAnalyticsType
): Promise<CountryMoodsType> {
  const moodPromises = Object.entries(countryAnalytics.moodCounts).map(
    async ([mood_id, total]) => ({
      mood_id,
      total,
      emoji: (await getEmojiById(mood_id)) || "",
    })
  );

  return Promise.all(moodPromises);
}

async function addEmojiToGlobalMoods(globalMoods: GlobalMoodsType) {
  const result: GlobalMoodsTypeWithEmoji = {};
  for (const [country, mood_id] of Object.entries(globalMoods)) {
    const emoji = await getEmojiById(mood_id);
    result[country] = {
      mood_id,
      emoji: emoji || "",
    };
  }

  return result;
}
