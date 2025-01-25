"use server";

import MoodLogClientProvider from "./mood-log-client-provider";
import { fetchLatestMoodLogServer } from "../../../lib/utils/mood-log.utils";
import type { MoodResponseType } from "../../../lib/types/mood-log.types";
import type { User } from "@supabase/supabase-js";

export async function MoodLogServerProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User;
}) {
  const log = initialUser
    ? await fetchLatestMoodLogServer(initialUser?.id)
    : null;

  return (
    <MoodLogClientProvider initialMoodLog={log as MoodResponseType}>
      {children}
    </MoodLogClientProvider>
  );
}

export default MoodLogServerProvider;
