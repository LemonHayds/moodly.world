import { createServiceClient } from "@/lib/utils/supabase/service-role";
import { NextResponse } from "next/server";

import {
  calculateAnalytics,
  createNewAnalyticsRow,
  fetchLastProcessedAnalyticsTimestamp,
  fetchMoodLogs,
} from "../../../lib/utils/analytics.utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Verify Cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("❌ Unauthorized request - invalid CRON_SECRET");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting daily analytics generation");

    const supabase = createServiceClient();
    const now = new Date();

    // Step 1: Fetch the last processed analytics timestamp
    const lastProcessedLogTimestamp =
      await fetchLastProcessedAnalyticsTimestamp(supabase);

    console.log(
      `🔍 Last processed analytics timestamp: ${lastProcessedLogTimestamp}`
    );

    // Step 2: Fetch mood logs from the last processed timestamp to now
    const moodLogs = await fetchMoodLogs(
      supabase,
      now,
      lastProcessedLogTimestamp
    );
    console.log(
      `🔍 Querying mood logs from ${lastProcessedLogTimestamp} to ${now.toISOString()}. Found: ${
        moodLogs?.length || 0
      } logs)`
    );

    // Step 3: Calculate analytics
    const { analytics, logsCount, latestLogTimestamp } =
      await calculateAnalytics(moodLogs, lastProcessedLogTimestamp);

    console.log("🔍 Analytics:", analytics);

    // Step 4: Create new daily analytics record
    await createNewAnalyticsRow(
      supabase,
      analytics,
      "24h",
      logsCount,
      latestLogTimestamp
    );

    console.log("✅ Successfully ran daily analytics");

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("❌ Analytics generation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
