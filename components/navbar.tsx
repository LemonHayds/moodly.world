"use client";

import LoginLogoutButton from "./login-logout-button";
import ThemeToggle from "./theme-toggle";
import MoodlyText from "./moodly-text";
import AnalyticsFilterTabs from "./analytics-filter-tabs";

export default function Navbar() {
  return (
    <nav className="pointer-events-none">
      <header className="z-[998] py-8 pl-7 sm:pl-10 fixed left-0 top-0 w-full flex items-center justify-between min-w-screen mix-blend-difference">
        <div className="relative">
          <MoodlyText>
            <h1 className="mt-[2px] sm:mt-0 text-[32px] sm:text-4xl md:text-5xl select-none text-white">
              Moodly
            </h1>
          </MoodlyText>
        </div>
      </header>

      <div className="z-[999] fixed right-7 sm:right-10 top-7 sm:top-9 flex gap-3 items-center pointer-events-auto">
        <AnalyticsFilterTabs className="hidden md:block" />
        <LoginLogoutButton className="h-9 px-3 sm:h-10" />
        <div className="flex-none">
          <ThemeToggle className="h-9 w-9 sm:h-10 sm:w-10" />
        </div>
      </div>
    </nav>
  );
}
