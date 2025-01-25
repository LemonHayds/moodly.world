"use client";

import { COUNTRY_CENTER_POSITIONS } from "../contants";
import geoJson from "../../assets/globe/geo.json";
import type { GlobalMoodsTypeWithEmoji } from "../types/analytics.types";
import type { EmojiGlobeLabel } from "../types/globe.types";

export const generateGlobeLabels = (
  globalMoods: GlobalMoodsTypeWithEmoji
): EmojiGlobeLabel[] => {
  return Object.entries(globalMoods)
    .map(([countryCode, mood]) => {
      // Use custom position if available
      if (COUNTRY_CENTER_POSITIONS[countryCode]) {
        return {
          ...COUNTRY_CENTER_POSITIONS[countryCode],
          countryCode,
          text: mood.emoji,
        };
      }

      // Find the country in geoJson
      const country = geoJson[0].features.find(
        (f: any) => f.properties.ISO_A2 === countryCode
      );

      if (!country) {
        return null;
      }

      // Use bbox (bounding box) to find center
      const bbox = country.bbox;
      if (!bbox) return null;

      // Calculate center point from bounding box
      const centerLng = (bbox[0] + bbox[2]) / 2;
      const centerLat = (bbox[1] + bbox[3]) / 2;

      return {
        countryCode,
        lat: centerLat,
        lng: centerLng,
        text: mood.emoji,
      };
    })
    .filter((label): label is EmojiGlobeLabel => label !== null);
};
