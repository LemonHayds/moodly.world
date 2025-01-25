export type GlobePolygonType = {
  type: string;
  properties: {
    ISO_A2: string;
    ADMIN: string;
    [key: string]: any;
  };
  bbox?: number[];
  geometry: {
    type: string;
    coordinates: number[][][] | number[];
  };
};

export type EmojiGlobeLabel = {
  countryCode: string;
  lat: number;
  lng: number;
  text: string;
};
