import { GeoLocationType } from "./geo-location.types";

export type MoodLogType = {
  id: string;
  mood_id: string;
  mood_content?: string;
  user_id: string;
  spam_count: number;
  location: GeoLocationType;
  created_at: string;
};

export type MoodResponseType = {
  success: boolean;
  log?: MoodLogType & { emoji?: string };
  error?: string;
};
