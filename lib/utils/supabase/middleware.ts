import { CookieOptions, createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // Get geo data from request
  const { geo } = request;
  const country = geo?.country || "US";
  const city = geo?.city || "";
  const region = geo?.region || "";

  // Clone and update headers with geo data
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-country", country);
  requestHeaders.set("x-city", city);
  requestHeaders.set("x-region", region);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: requestHeaders, // Use our updated headers
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: requestHeaders, // Use our updated headers
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
