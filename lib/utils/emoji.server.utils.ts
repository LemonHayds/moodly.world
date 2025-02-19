"use server";

import { init } from "emoji-mart";
import data from "@emoji-mart/data";
import { unstable_cache } from "next/cache";

// Create a promise to track initialization
let initializationPromise: Promise<void> | null = null;

const initializeEmojiData = async () => {
  if (!initializationPromise) {
    initializationPromise = init({ data }).catch((error) => {
      // Reset the promise if initialization fails
      initializationPromise = null;
      console.error("Failed to initialize emoji data:", error);
      throw error;
    });
  }
  return initializationPromise;
};

export const getEmojiById = (id: string) =>
  unstable_cache(
    async () => {
      try {
        // Wait for initialization
        await initializeEmojiData();

        //@ts-ignore
        const natives = data.natives;
        if (!natives) {
          console.error(
            "Emoji natives data is not available after initialization"
          );
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
