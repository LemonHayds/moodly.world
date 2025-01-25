"use server";

import { createClient } from "./supabase/server";
import { getEmojiById } from "../emoji.utils";
import { ONE_DAY_MILLISECONDS, MAX_DAILY_UPDATES } from "../contants";
import type { GeoLocationType } from "../types/geo-location.types";

export async function storeMoodLogServer(
  moodId: string,
  geoData: GeoLocationType
) {
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

  const spamCount = previousLog?.[previousLog.length - 1]?.spam_count || 0;
  if (spamCount >= MAX_DAILY_UPDATES) {
    // Get the earliest log's timestamp
    const earliestLog = previousLog?.[0];
    if (earliestLog?.created_at) {
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
        error: `You've reached the maximum number of mood updates for today (${MAX_DAILY_UPDATES}). You can log your mood again in ${hoursRemaining}h ${minutesRemaining}m.`,
      };
    }
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
    mood_content: "",
    spam_count: spamCount + 1,
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

  return {
    success,
    remainingUpdates: MAX_DAILY_UPDATES - (spamCount + 1),
    log: { ...insertedLog, emoji: await getEmojiById(insertedLog.mood_id) },
  };
}

export async function fetchLatestMoodLogServer(userId: string) {
  const supabase = createClient();

  const { data: latestLog, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", userId)
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
    remainingUpdates: MAX_DAILY_UPDATES - (latestLog?.spam_count || 0),
    log: log,
  };
}
