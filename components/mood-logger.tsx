"use client";

import { SendHorizonal } from "lucide-react";
import { BorderBeam } from "@stianlarsen/border-beam";
import EmojiPicker from "./emoji-picker";
import AnimatedShinyText from "./ui/animated-shiny-text";
import { useMoodLog } from "./providers/mood-log-provider/mood-log-client-provider";
import { useState, useEffect, useCallback } from "react";
import { useGeo } from "./providers/geo-provider/geo-client-provider";
import toast from "react-hot-toast";
import { TOAST_CLASSNAMES } from "../lib/contants";
import { ChevronDown } from "lucide-react";
import { storeMoodLogServer } from "../lib/utils/mood-log.utils";

import ExpandableTextArea from "./expandable-text-area";

const MoodLogger = (props: { className?: string }) => {
  const { className = "" } = props;

  const { latestMoodLog, setLatestMoodLog } = useMoodLog();

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(
    latestMoodLog?.log?.mood_id || null
  );
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(
    latestMoodLog?.log?.emoji || null
  );
  const hasLatestMoodLog = latestMoodLog?.success === true;

  const { geoData } = useGeo();

  const [pickerExpanded, setPickerExpanded] = useState(false);
  const [moodContent, setMoodContent] = useState(
    latestMoodLog?.log?.mood_content || ""
  );
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (selectedMoodId) {
      setShouldAnimate(true);
    }
  }, [selectedMoodId]);

  const handleStoreMoodLog = useCallback(
    async (moodId: string) => {
      const toastId = toast.loading("Logging", {
        id: "mood_log",
        className: TOAST_CLASSNAMES,
      });

      if (!selectedMoodId) {
        toast.error("No mood selected", { id: toastId });
        return;
      }

      if (!moodContent) {
        toast.error("No mood content", { id: toastId });
        return;
      }

      const previousMoodId = selectedMoodId;

      try {
        const response = await storeMoodLogServer(moodId, geoData, moodContent);

        if (response.success && response.log) {
          setLatestMoodLog(response);
          setIsHovering(false);
          setPickerExpanded(false);
          toast.success(
            <div className="flex items-center gap-2">
              Mood logged:
              <span className="text-xl">{response.log.emoji}</span>
            </div>,
            { id: toastId }
          );
        } else {
          setSelectedMoodId(previousMoodId);
          throw new Error(response.error || "Failed to log mood");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage, { id: toastId });
        setSelectedMoodId(previousMoodId);
      }
    },
    [moodContent, selectedMoodId, geoData, setLatestMoodLog]
  );

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        if (hasLatestMoodLog) {
          const createdAt = new Date(latestMoodLog?.log?.created_at || "");
          const now = new Date();
          const timeDiff = 24 * 60 * 60 * 1000;
          const nextLogTime = new Date(createdAt.getTime() + timeDiff);
          const timeRemaining = Math.max(
            0,
            nextLogTime.getTime() - now.getTime()
          );
          const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutesRemaining = Math.floor(
            (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
          );

          toast.error(
            `You can't update your mood. You can log again in ${hoursRemaining} hours and ${minutesRemaining} minutes.`,
            {
              id: "mood_log",
              className: TOAST_CLASSNAMES,
            }
          );
          return;
        }
        setIsHovering(true);
      }}
      className={`mb-12 md:mb-2 2xl:mb-6 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-border transition-all duration-700 ease-in-out w-fit ${className} ${
        hasLatestMoodLog ? "" : "hover:cursor-pointer"
      }`}
    >
      <div className="w-full flex flex-col rounded-xl overflow-hidden shadow-xl">
        <BorderBeam
          size={80}
          duration={12}
          borderWidth={1}
          colorFrom="#000"
          colorTo="#fff"
          className="m-[-1px] opacity-20 absolute inset-0 rounded-xl"
        />
        <div
          className={`
          z-[3] relative transition-all ease-in-out duration-500 border-b border-border overflow-hidden rounded-t-xl
    
          ${
            pickerExpanded
              ? "opacity-100 w-[313px] sm:w-[420px] md:w-[530px] lg:w-[600px] h-[400px]"
              : "opacity-0 w-[313px] sm:w-[420px] md:w-[530px] lg:w-[600px] h-0 mb-[-1px]"
          }
        `}
        >
          <EmojiPicker
            onEmojiClick={(mood) => {
              setSelectedMoodId(mood.id);
              setSelectedMoodEmoji(mood.emoji);
            }}
          />
        </div>
        <div className="bg-zinc-100/90 dark:bg-zinc-900/90 z-[20] overflow-hidden w-full relative flex items-stretch justify-between">
          <div
            key={selectedMoodId}
            className={`h-full ${
              shouldAnimate ? "animate-scale-in-out" : ""
            } text-2xl flex items-stretch my-auto z-[20]`}
          >
            <div
              className={`select-none mt-[1px] ml-[2px] py-2 h-full flex items-stretch justify-center text-center leading-[0.4] ${
                selectedMoodId ? "px-3" : "px-2"
              }`}
            >
              {latestMoodLog?.log?.emoji || selectedMoodEmoji}
            </div>
          </div>
          <div className="flex items-stretch justify-between relative w-full h-full z-[20]">
            <AnimatedShinyText
              className={`select-none hover:pointer-events-none cursor-text absolute left-0 top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap text-base sm:text-lg pr-2 text-center ${
                pickerExpanded ? "w-fit" : ""
              }
            ${moodContent ? "hidden" : ""}
            `}
            >
              {hasLatestMoodLog ? "Update your mood" : "What's your mood?"}
            </AnimatedShinyText>

            <ExpandableTextArea
              disabled={hasLatestMoodLog ? true : false}
              className="pl-0"
              value={moodContent}
              onChange={(e) => setMoodContent(e.target.value)}
              singleLine={hasLatestMoodLog}
            />

            <div
              className={`bg-white dark:bg-[#151617] border-l border-border flex items-stretch ${
                pickerExpanded ? "rounded-br-xl" : "rounded-r-xl"
              }`}
              onMouseEnter={() => setIsHovering(false)}
              onMouseLeave={() => setIsHovering(true)}
            >
              <button
                disabled={hasLatestMoodLog ? true : false}
                className="w-10 py-2 transition-all duration-300 rounded-r-xl group h-full disabled:opacity-50 flex items-center justify-center"
                onClick={() => {
                  handleStoreMoodLog(selectedMoodId || "");
                }}
              >
                <SendHorizonal
                  className={`${
                    hasLatestMoodLog ? "opacity-50" : "group-hover:opacity-100"
                  } size-5 transition-all opacity-50 duration-300 ease-in-out stroke-[1.5]`}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${
            isHovering && !hasLatestMoodLog
              ? "opacity-100 top-[-33px]"
              : "opacity-0 top-0"
          } z-[2] absolute transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 w-10 h-[32px] flex items-center justify-center bg-[#ffffff] dark:bg-[#151617] border-x border-t border-border rounded-t-xl self-center group`}
          onClick={() => {
            setPickerExpanded(!pickerExpanded);
          }}
        >
          <ChevronDown
            className={`size-8 opacity-50 group-hover:opacity-100 transition-all duration-300 ease-in-out stroke-[1.5] ${
              pickerExpanded ? "" : "rotate-180"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodLogger;
