"use client";

import { Settings, RefreshCw, RefreshCwOff, Smile, Frown } from "lucide-react";
import { useGlobeAnalytics } from "./providers/globe-analytics-provider/globe-analytics-client-provider";

const SettingsPanel = () => {
  const { globeSettings, setGlobeSettings } = useGlobeAnalytics();

  const iconContainerClassNames =
    "flex items-center group-hover:h-5 w-5 mb-1 transition-all duration-300 ease-in-out";

  return (
    <div className="overflow-hidden group pointer-events-auto flex flex-col items-center p-2 hover:bg-gray-100/80 dark:hover:bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-transparent hover:border-border/80 transition-all duration-300 ease-in-out">
      <div className="transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 h-0 group-hover:h-14 w-fit flex flex-col items-center">
        <div
          className={iconContainerClassNames}
          onClick={() =>
            setGlobeSettings({
              ...globeSettings,
              spinningEnabled: !globeSettings.spinningEnabled,
            })
          }
        >
          {globeSettings.spinningEnabled ? (
            <RefreshCwOff className="dark:text-white h-5 w-5 transition-all opacity-50 group-hover:opacity-100" />
          ) : (
            <RefreshCw className="dark:text-white h-5 w-5 transition-all opacity-50 group-hover:opacity-100" />
          )}
        </div>
        <div
          className={iconContainerClassNames}
          onClick={() =>
            setGlobeSettings({
              ...globeSettings,
              emojisEnabled: !globeSettings.emojisEnabled,
            })
          }
        >
          {globeSettings.emojisEnabled ? (
            <Smile className="dark:text-white h-5 w-5 transition-all opacity-50 group-hover:opacity-100" />
          ) : (
            <Frown className="dark:text-white h-5 w-5 transition-all opacity-50 group-hover:opacity-100" />
          )}
        </div>
      </div>
      <Settings className="dark:text-white h-6 w-6 transition-all opacity-50 group-hover:opacity-100" />
    </div>
  );
};

export default SettingsPanel;
