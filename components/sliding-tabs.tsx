"use client";

import { useEffect, useRef, useState } from "react";

const SlidingTabs = (props: {
  tabs: { label: string; value: string }[];
  className?: string;
  activeTab: string;
  tabClassName?: string;
  indicatorIsLine?: boolean;
  setActiveTab: (value: string) => void;
  customInitialClassName?: string;
}) => {
  const {
    tabs,
    className,
    activeTab,
    setActiveTab,
    tabClassName,
    indicatorIsLine = false,
    customInitialClassName,
  } = props;

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
      updateIndicator(activeTab);
    }

    const handleResize = () => hasInteracted && updateIndicator(activeTab);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, hasInteracted]);

  return (
    <div
      className={`relative ${
        indicatorIsLine
          ? ""
          : "bg-gray-100/80 dark:bg-zinc-800/80 border border-border/80 dark:border-border backdrop-blur-sm rounded-lg"
      } h-[40px] flex items-center px-[11px] pointer-events-auto ${className}`}
      ref={tabsRef}
    >
      <div
        className={`absolute ${
          !hasInteracted
            ? `left-[3px] ${
                customInitialClassName ? customInitialClassName : "w-[51px]"
              }`
            : ""
        }  rounded-md pointer-events-none ${
          indicatorIsLine
            ? "dark:bg-white/60 bg-black/50 h-[1px] bottom-0 mt-auto"
            : "h-8 bg-white dark:bg-zinc-900 shadow-sm"
        }`}
        style={indicatorStyle}
      />

      <div className="relative z-10 flex justify-between w-full items-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            data-value={tab.value}
            onClick={() => {
              if (tab.value !== activeTab) {
                setHasInteracted(true);
                setActiveTab(tab.value);
              }
            }}
            className={`focus:outline-none relative h-8 flex items-center justify-center group hover:cursor-pointer ${tabClassName}`}
          >
            <span
              className={`
            relative z-10 text-xs sm:text-sm font-medium px-2 transition-colors duration-300 ease-in-out
            ${
              activeTab !== tab.value
                ? "group-hover:text-black group-hover:dark:text-white"
                : ""
            }
            ${
              activeTab === tab.value
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
  );
};

export default SlidingTabs;
