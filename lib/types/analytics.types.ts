export type AnalyticsDataType = {
  [countryCode: string]: CountryAnalyticsType;
};

export type CountryAnalyticsType = {
  moodCounts: Record<string, number>;
  total: number;
};

export type GlobalMoodsType = {
  [countryCode: string]: string;
};

export type GlobalMoodsTypeWithEmoji = {
  [countryCode: string]: GlobalMoodType;
};

export type GlobalMoodType = {
  mood_id: string;
  emoji: string;
};

export type CountryMoodsType = CountryMoodType[];

export type CountryMoodType = {
  mood_id: string;
  emoji: string;
  total: number;
};
