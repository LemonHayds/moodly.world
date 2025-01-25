"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import { EmojiType } from "../lib/types/emoji.types";
import { useState, useEffect } from "react";

const EmojiPicker = (props: { onEmojiClick: (moodId: string) => void }) => {
  const { onEmojiClick } = props;
  const { theme } = useTheme();
  const [key, setKey] = useState(0);
  const [perLineCount, setPerLineCount] = useState(16);

  useEffect(() => {
    const handleResize = () => {
      setKey((prev) => prev + 1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updatePerLine = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // xs
        setPerLineCount(8);
      } else if (width >= 640 && width < 768) {
        // sm
        setPerLineCount(11);
      } else if (width >= 768 && width < 1024) {
        // md
        setPerLineCount(14);
      } else {
        // lg (>= 1024)
        setPerLineCount(16);
      }
    };

    // Initial check
    updatePerLine();

    // Add resize listener
    window.addEventListener("resize", updatePerLine);
    return () => window.removeEventListener("resize", updatePerLine);
  }, []);

  return (
    <Picker
      key={key}
      data={data}
      onEmojiSelect={(emoji: EmojiType) => {
        const emojiId = emoji?.id;

        if (!emojiId || !onEmojiClick) return;

        onEmojiClick(emojiId);
      }}
      categories={[
        // "frequent",
        "people",
        "nature",
        "foods",
        "activity",
        "places",
        "objects",
      ]}
      dynamicWidth={false}
      perLine={perLineCount}
      emojiButtonRadius={"10px"}
      emojiSize={28}
      maxFrequentRows={0}
      searchPosition={"none"}
      skinTonePosition={"none"}
      noCountryFlags={true}
      className="bg-transparent opacity-15"
      theme={theme === "dark" ? "dark" : "light"}
      previewPosition={"none"}
    />
  );
};

export default EmojiPicker;
