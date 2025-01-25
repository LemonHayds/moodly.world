"use client";

import { createContext, useContext, useState } from "react";
import type { GeoLocationType } from "../../../lib/types/geo-location.types";

interface GeoContextType {
  geoData: GeoLocationType;
  setGeoData: (data: GeoLocationType) => void;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

export function GeoClientProvider({
  country,
  city,
  region,
  children,
}: {
  country: string;
  city: string;
  region: string;
  children: React.ReactNode;
}) {
  const [geoData, setGeoData] = useState<GeoLocationType>({
    country,
    city,
    region,
  });

  console.log("GeoData:", geoData);
  return (
    <GeoContext.Provider value={{ geoData, setGeoData }}>
      {children}
    </GeoContext.Provider>
  );
}

export default GeoClientProvider;

export function useGeo() {
  const context = useContext(GeoContext);
  if (context === undefined) {
    throw new Error("useGeo must be used within a GeoProvider");
  }
  return context;
}
