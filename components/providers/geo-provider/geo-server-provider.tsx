"use server";

import { headers } from "next/headers";
import GeoClientProvider from "./geo-client-provider";

export async function GeoServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();

  const country = headersList.get("x-vercel-ip-country") || "US";
  const city = headersList.get("x-vercel-ip-city") || "";
  const region = headersList.get("x-vercel-ip-region") || "";

  return (
    <GeoClientProvider country={country} city={city} region={region}>
      {children}
    </GeoClientProvider>
  );
}

export default GeoServerProvider;
