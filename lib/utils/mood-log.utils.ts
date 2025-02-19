"use server";

import { createClient } from "./supabase/server";
import { getEmojiById } from "./emoji.server.utils";
import { ONE_DAY_MILLISECONDS } from "../contants";
import { revalidateTag, unstable_cache } from "next/cache";
import { createServiceClient } from "./supabase/service-role";

import type { GeoLocationType } from "../types/geo-location.types";
import type { TimePeriodType } from "../types/filter-time-periods.types";

export async function storeMoodLogServer(
  moodId: string,
  geoData: GeoLocationType,
  moodContent: string
) {
  // Add character limit validation
  if (moodContent.length > 350) {
    return {
      success: false,
      error: "Mood content cannot exceed 350 characters",
    };
  }

  if (!geoData?.country) {
    return {
      success: false,
      error: "Error locating your mood",
    };
  }

  const supabase = createClient();

  // Get current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      success: false,
      error: "You must be logged in to log your mood",
    };
  }

  // Calculate timestamp from 24 hours ago
  const twentyFourHoursAgo = new Date(
    Date.now() - ONE_DAY_MILLISECONDS
  ).toISOString();

  // Get current mood log to check spam_count
  const { data: previousLog, error: fetchError } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("created_at", twentyFourHoursAgo)
    .order("created_at", { ascending: true });

  if (fetchError) {
    return {
      success: false,
      error: "An error occured, please try again",
    };
  }

  let success = true;

  // Get the earliest log's timestamp
  const earliestLog = previousLog?.[0];
  if (earliestLog && earliestLog?.created_at) {
    const earliestTime = new Date(earliestLog.created_at);
    const timeUntilReset = new Date(
      earliestTime.getTime() + ONE_DAY_MILLISECONDS
    );
    const hoursRemaining = Math.ceil(
      (timeUntilReset.getTime() - Date.now()) / (1000 * 60 * 60)
    );
    const minutesRemaining =
      Math.ceil((timeUntilReset.getTime() - Date.now()) / (1000 * 60)) % 60;

    success = false;

    return {
      success,
      error: `You can log your mood again in ${hoursRemaining}h ${minutesRemaining}m.`,
    };
  }

  // Delete existing log from the last 24 hours
  const { error: deleteError } = await supabase
    .from("mood_logs")
    .delete()
    .eq("user_id", session.user.id)
    .gte("created_at", twentyFourHoursAgo);

  if (deleteError) {
    console.log(deleteError);
    throw new Error("Failed to delete mood log");
  }

  // Create new mood log with incremented spam_count
  const moodLogObj = {
    mood_id: moodId,
    user_id: session.user.id,
    location: {
      ...geoData,
    },
    mood_content: moodContent || "",
  };

  const { data: insertedLog, error: insertError } = await supabase
    .from("mood_logs")
    .insert(moodLogObj)
    .select()
    .single();

  if (insertError) {
    console.log(insertError);
    throw new Error("Failed to store mood log");
  }

  revalidateTag("global-moods-hour");

  return {
    success,
    log: { ...insertedLog, emoji: await getEmojiById(insertedLog.mood_id) },
  };
}

export async function fetchLatestMoodLogServer(userId: string) {
  const supabase = createClient();

  const twentyFourHoursAgo = new Date(
    Date.now() - ONE_DAY_MILLISECONDS
  ).toISOString();

  const { data: latestLog, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", twentyFourHoursAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  let log = latestLog;
  if (log) {
    log.emoji = await getEmojiById(log.mood_id);
  }

  return {
    success: true,
    log: log,
  };
}

//function to get mood logs for a user but with pagination
export async function fetchUserMoodLogs(
  timePeriod: TimePeriodType,
  page: number,
  pageSize: number = 10,
  selectedCountry: string
) {
  const supabase = createClient();
  const serviceClient = createServiceClient();

  return unstable_cache(
    async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const now = new Date();
      let timeAgo = new Date();

      switch (timePeriod) {
        case "1hr":
          timeAgo.setHours(timeAgo.getHours() - 1);
          break;
        case "24hr":
          timeAgo.setDate(timeAgo.getDate() - 1);
          break;
        case "week":
          timeAgo.setDate(timeAgo.getDate() - 7);
          break;
        case "month":
          timeAgo.setMonth(timeAgo.getMonth() - 1);
          break;
        case "year":
          timeAgo.setFullYear(timeAgo.getFullYear() - 1);
          break;
      }

      const {
        data: logs,
        error,
        count,
      } = await supabase
        .from("mood_logs")
        .select("*", { count: "exact" })
        .eq("location->>country", selectedCountry)
        .gte("created_at", timeAgo.toISOString())
        .lt("created_at", now.toISOString())
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.log(error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Map logs with user data using service client
      const logsWithEmoji = await Promise.all(
        logs?.map(async (log) => {
          const {
            data: { user },
          } = await serviceClient.auth.admin.getUserById(log.user_id);

          return {
            ...log,
            emoji: await getEmojiById(log.mood_id),
            full_name: user?.user_metadata?.full_name || "Anonymous",
          };
        }) || []
      );

      return {
        success: true,
        logs: logsWithEmoji,
        hasMore: count ? from + pageSize < count : false,
        totalCount: count,
      };
    },
    [`mood-logs-${timePeriod}-${page}-${pageSize}-${selectedCountry}`],
    {
      revalidate: 300,
      tags: [`mood-logs-${selectedCountry}`],
    }
  )();
}
