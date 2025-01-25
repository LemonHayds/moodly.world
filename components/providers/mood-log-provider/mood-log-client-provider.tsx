"use client";

import { createContext, useContext, useState } from "react";
import type { MoodResponseType } from "../../../lib/types/mood-log.types";

type MoodLogContextType = {
  latestMoodLog: MoodResponseType | null;
  setLatestMoodLog: (log: MoodResponseType | null) => void;
};

const MoodLogContext = createContext<MoodLogContextType | undefined>(undefined);

export function MoodLogClientProvider({
  children,
  initialMoodLog,
}: {
  children: React.ReactNode;
  initialMoodLog?: MoodResponseType | null;
}) {
  const [latestMoodLog, setLatestMoodLog] = useState<MoodResponseType | null>(
    initialMoodLog ?? null
  );

  return (
    <MoodLogContext.Provider value={{ latestMoodLog, setLatestMoodLog }}>
      {children}
    </MoodLogContext.Provider>
  );
}

export function useMoodLog() {
  const context = useContext(MoodLogContext);
  if (context === undefined) {
    throw new Error("Error occured while using useMoodLog");
  }
  return context;
}

export default MoodLogClientProvider;
