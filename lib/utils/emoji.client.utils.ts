import data from "@emoji-mart/data";

export const getEmojiByIdClient = (id?: string): string | null => {
  if (!id) return "";

  try {
    //@ts-ignore
    const natives = data.natives;
    if (!natives) {
      console.error("Emoji natives data is not available");
      return null;
    }

    const entry = Object.entries(natives).find(
      ([emoji, emojiId]) => emojiId === id
    );
    return entry ? entry[0] : "";
  } catch (error) {
    console.error("Error getting emoji:", error);
    return "";
  }
};
