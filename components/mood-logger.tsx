"use client";

import { BorderBeam } from "@stianlarsen/border-beam";
import EmojiPicker from "./emoji-picker";
import AnimatedShinyText from "./ui/animated-shiny-text";
import { useMoodLog } from "./providers/mood-log-provider/mood-log-client-provider";
import CountryPicker from "./ui/country-picker";
import { useState, useEffect, useCallback } from "react";
import { useGeo } from "./providers/geo-provider/geo-client-provider";
import toast from "react-hot-toast";
import { storeMoodLogServer } from "../lib/utils/mood-log.utils";

const MoodLogger = (props: { className?: string }) => {
  const { className = "" } = props;

  const { latestMoodLog, setLatestMoodLog } = useMoodLog();
  const emoji = latestMoodLog?.log?.emoji;

  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const { geoData } = useGeo();

  const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ensure emoji is selected in the picker
  useEffect(() => {
    if (emoji && isOpen) {
      // Add a small delay to ensure shadow DOM is ready
      const timer = setTimeout(() => {
        const emojiPicker = document.querySelector("em-emoji-picker");
        const shadowRoot = emojiPicker?.shadowRoot;
        if (!shadowRoot) return;

        const buttons = shadowRoot.querySelectorAll("button");

        const matchingButtons = Array.from(buttons).filter(
          (button) => button.getAttribute("aria-label") === emoji
        );

        // Remove border from all buttons first
        buttons.forEach((button) => {
          button.style.border = "none";
        });

        // Add border to all matching buttons
        matchingButtons.forEach((button) => {
          button.style.border = "1px solid";
          button.style.borderRadius = "10px";
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [emoji, isOpen]);

  const handleMouseEnter = useCallback(() => setIsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsOpen(false), []);

  const handleStoreMoodLog = useCallback(
    async (moodId: string) => {
      if (selectedMoodId === moodId) {
        return;
      }

      const toastId = toast.loading("Logging", { id: "mood_log" });
      const previousMoodId = selectedMoodId;

      try {
        setSelectedMoodId(moodId);
        const latestMoodLog = await storeMoodLogServer(moodId, geoData);

        if (latestMoodLog?.success && latestMoodLog?.log) {
          setLatestMoodLog(latestMoodLog);
          toast.success(
            <div className="flex items-center gap-2">
              Mood logged:
              <span className="text-xl">{latestMoodLog.log.emoji}</span>
            </div>,
            { id: toastId }
          );
        } else {
          setSelectedMoodId(previousMoodId);
          throw new Error("Failed to log mood");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage, { id: toastId });
        setSelectedMoodId(previousMoodId);
      }
    },
    [selectedMoodId, geoData, setLatestMoodLog]
  );

  return (
    <div
      className={`mb-12 md:mb-2 2xl:mb-6 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-border hover:cursor-pointer transition-all duration-700 ease-in-out w-fit ${
        isOpen ? "" : "hover:cursor-pointer"
      } ${className}`}
      onClick={() => setIsOpen(true)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <BorderBeam
        size={80}
        duration={12}
        borderWidth={1}
        colorFrom="#000"
        colorTo="#fff"
        className="m-[-1px] opacity-20"
      />
      <div className="w-full">
        <div
          className={`
          transition-all ease-in-out duration-500 border-b border-border overflow-hidden rounded-t-xl
          ${
            isTemporarilyHidden
              ? "opacity-0 w-0 h-0"
              : isOpen
              ? "opacity-100 w-[313px] sm:w-[420px] md:w-[530px] lg:w-[600px] h-[400px]"
              : "opacity-0 w-0 h-0"
          }
        `}
        >
          <EmojiPicker onEmojiClick={handleStoreMoodLog} />
        </div>

        <div className="w-full flex items-center justify-between relative">
          <AnimatedShinyText
            className={`mx-2 whitespace-nowrap text-base sm:text-lg  p-2 text-center ${
              isOpen ? "w-fit" : ""
            }`}
          >
            {latestMoodLog ? "Update your mood" : "What's your mood?"}
          </AnimatedShinyText>
          <div
            className={` ${
              isOpen
                ? "transition-all duration-500 delay-100 opacity-100 w-fit absolute right-[2px]"
                : "opacity-0 w-0"
            }`}
          >
            <CountryPicker parentIsOpen={isOpen} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodLogger;
