"use client";

import { getCountryFlag } from "./ui/country-picker";
import { useGeo } from "./providers/geo-provider/geo-client-provider";
import { getCountryName } from "./ui/country-picker";

const CurrentCountryFlag = () => {
  const { geoData } = useGeo();

  if (!geoData?.country) return null;
  return (
    <div
      className="select-none text-2xl pointer-events-auto opacity-75"
      aria-label={`Your country: ${getCountryName(geoData?.country)}`}
      title={`Your country: ${getCountryName(geoData?.country)}`}
    >
      {getCountryFlag(geoData?.country)}
    </div>
  );
};

export default CurrentCountryFlag;
