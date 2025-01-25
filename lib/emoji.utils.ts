"use server";

import { init } from "emoji-mart";
import data from "@emoji-mart/data";
import { unstable_cache } from "next/cache";

const initializeEmojiData = () => {
  let initialized = false;
  return async () => {
    if (!initialized) {
      await init({ data });
      initialized = true;
    }
  };
};

const initEmoji = initializeEmojiData();

export const getEmojiById = (id: string) =>
  unstable_cache(
    async () => {
      try {
        await initEmoji();
        //@ts-ignore
        const natives = data.natives;
        if (!natives) {
          console.error("Emoji natives data is not available");
          return null;
        }

        const entry = Object.entries(natives).find(
          ([emoji, emojiId]) => emojiId === id
        );
        return entry ? entry[0] : null;
      } catch (error) {
        console.error("Error getting emoji:", error);
        return null;
      }
    },
    [`emoji-${id}`],
    {
      revalidate: false,
      tags: ["emoji"],
    }
  )();
