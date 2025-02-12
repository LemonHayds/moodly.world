"use client";

import { useEffect, useState } from "react";
import Modal from "../modal";
import { useGlobeAnalytics } from "../providers/globe-analytics-provider/globe-analytics-client-provider";
import SlidingTabs from "../sliding-tabs";
import { getCountryFlag, getCountryName } from "../ui/country-picker";
import MoodBarChart from "./parts/mood-bar-chart";
import { fetchUserMoodLogs } from "../../lib/utils/mood-log.utils";
import Loader from "../loader";

const MoodModal = () => {
  const { isModalOpen, setIsModalOpen, selectedCountry, activeFilter } =
    useGlobeAnalytics();

  const [activeTab, setActiveTab] = useState("mood-distribution");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab("mood-distribution");
      setPage(0);
      setLogs([]);
      setHasMore(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isModalOpen]);

  useEffect(() => {
    if (activeTab !== "logs") {
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      const response = await fetchUserMoodLogs(
        activeFilter,
        page,
        20,
        selectedCountry || ""
      );
      if (response.success) {
        setLogs((prev) =>
          page === 0 ? response.logs || [] : [...prev, ...(response.logs || [])]
        );
        setHasMore(response.hasMore || false);
      }
      setIsLoading(false);
    };
    fetchLogs();
  }, [activeFilter, page, activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      !isLoading &&
      hasMore
    ) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title={
        <>
          <SlidingTabs
            indicatorIsLine={true}
            tabs={[
              { label: "Mood Distribution", value: "mood-distribution" },
              { label: "Logs", value: "logs" },
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            customInitialClassName="w-1/2"
            className="-mt-4 -ml-2 mr-6 mb-4"
            tabClassName="w-1/2"
          />
        </>
      }
      setIsOpen={() => setIsModalOpen(!isModalOpen)}
      className="sm:max-w-[370px] pb-0"
      contents={
        <div className="min-h-[200px] -mt-4">
          {activeTab === "mood-distribution" ? (
            <div className="pb-6">
              <div className="leading-[1.35] mb-2 font-semibold">
                Mood distribution in the last{" "}
                {activeFilter === "1hr"
                  ? "hour"
                  : activeFilter === "24hr"
                  ? "24 hours"
                  : activeFilter}
              </div>
              <span className="leading-[1.35] flex items-center gap-2 pb-2">
                <span className="text-md">
                  {getCountryFlag(selectedCountry || " ")}
                </span>
                <span className="text-sm">
                  {getCountryName(selectedCountry || " ")}
                </span>
              </span>

              <div className="mt-2 h-full">
                <MoodBarChart />
              </div>
            </div>
          ) : (
            <div
              className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300"
              onScroll={handleScroll}
            >
              {logs.map((log, index) => (
                <div
                  key={`${log.id}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-gray-100/80 dark:bg-zinc-800/20"
                >
                  <span className="text-2xl">{log.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm">{log.mood_content}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {log.full_name || "Anonymous"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pb-4">
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader size={30} />
                  </div>
                )}
                {!isLoading && !hasMore && logs.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No more logs to load
                  </div>
                )}
                {!isLoading && logs.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    No logs found for this time period
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default MoodModal;
