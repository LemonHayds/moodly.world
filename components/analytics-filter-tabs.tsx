"use client";

import { ANALYTICS_FILTER_TABS } from "@/lib/contants";
import { useEffect, useRef, useState } from "react";

import { useGlobeAnalytics } from "./providers/globe-analytics-provider/globe-analytics-client-provider";

const AnalyticsFilterTabs = (props: { className?: string }) => {
  const { className = "" } = props;

  const { activeFilter, setActiveFilter } = useGlobeAnalytics();

  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const updateIndicator = (value: string) => {
    const tabElement = tabsRef.current?.querySelector(
      `[data-value="${value}"]`
    ) as HTMLElement;
    if (tabElement) {
      const textWidth = tabElement.getBoundingClientRect().width;
      const padding = 16;

      setIndicatorStyle({
        transform: `translateX(${tabElement.offsetLeft - padding / 2}px)`,
        width: `${textWidth + padding}px`,
        transition: "all 300ms ease-in-out",
      });
    }
  };

  useEffect(() => {
    if (hasInteracted) {
      updateIndicator(activeFilter);
    }

    const handleResize = () => hasInteracted && updateIndicator(activeFilter);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeFilter, hasInteracted]);

  return (
    <div className={`w-full relative z-10 pointer-events-none ${className}`}>
      <div
        className="relative bg-gray-100/80 dark:bg-zinc-800/80 border border-border/80 dark:border-border backdrop-blur-sm rounded-lg h-[40px] flex items-center px-[11px] pointer-events-auto"
        ref={tabsRef}
      >
        <div
          className={`absolute ${
            !hasInteracted ? "left-[3px] w-[51px]" : ""
          }  bg-white dark:bg-zinc-900 rounded-md shadow-sm h-8 pointer-events-none`}
          style={indicatorStyle}
        />

        <div className="relative z-10 flex items-center gap-4">
          {ANALYTICS_FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              data-value={tab.value}
              onClick={() => {
                if (tab.value !== activeFilter) {
                  setHasInteracted(true);
                  setActiveFilter(tab.value);
                }
              }}
              className="relative h-8 flex items-center justify-center group hover:cursor-pointer"
            >
              <span
                className={`
                  relative z-10 text-xs sm:text-sm font-medium px-2 transition-colors duration-300 ease-in-out
                  ${
                    activeFilter !== tab.value
                      ? "group-hover:text-black group-hover:dark:text-white"
                      : ""
                  }
                  ${
                    activeFilter === tab.value
                      ? "text-black dark:text-white"
                      : "text-zinc-600 dark:text-zinc-400"
                  }
                `}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilterTabs;
