import type { Metadata } from "next";
import "./globals.css";
import { Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "../components/providers/theme-provider";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

import GeoServerProvider from "../components/providers/geo-provider/geo-server-provider";
import AuthServerProvider from "../components/providers/auth-provider/auth-server-provider";
import GlobeAnalyticsServerProvider from "../components/providers/globe-analytics-provider/globe-analytics-server-provider";

const rubik = Rubik({ weight: "400", subsets: ["latin"] });

const META_TITLE = "Moodly";
const META_DESCRIPTION = "Visualize the world's moods with emojis globally.";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: "https://moodly.world",
    siteName: META_TITLE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubik.className} relative antialiased w-full text-slate-800 dark:text-zinc-100 text-sm sm:text-base min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            toastOptions={{
              duration: 5000,
              className:
                "border border-border z-[9999] bg-zinc-100/90 dark:bg-zinc-900/90 text-black dark:text-white backdrop-blur-sm",
              style: {
                paddingInline: "8px",
                paddingBlock: "4px",
              },
            }}
            position="top-center"
          />
          <AuthServerProvider>
            <GeoServerProvider>
              <GlobeAnalyticsServerProvider>
                <Navbar />
                {children}
                <Footer />
              </GlobeAnalyticsServerProvider>
            </GeoServerProvider>
          </AuthServerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
