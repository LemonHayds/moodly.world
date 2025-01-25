"use client";

import { useEffect, useRef, useState } from "react";
import { useMoodLog } from "./providers/mood-log-provider/mood-log-client-provider";

const CurrentMoodEmoji = () => {
  const { latestMoodLog } = useMoodLog();
  const emoji = latestMoodLog?.log?.emoji;
  const prevEmojiRef = useRef(emoji);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (prevEmojiRef.current !== emoji && prevEmojiRef.current !== undefined) {
      setShouldAnimate(true);
    }
    prevEmojiRef.current = emoji;
  }, [emoji]);

  if (!latestMoodLog) return <></>;

  return (
    <div className="flex items-center gap-x-3">
      <div className="flex flex-col items-start">
        <span
          key={emoji}
          className={`rounded-md flex items-center justify-center w-fit text-3xl ${
            shouldAnimate ? "animate-scale-in-out" : ""
          }`}
        >
          {emoji} 👈
        </span>
      </div>
    </div>
  );
};

export default CurrentMoodEmoji;
