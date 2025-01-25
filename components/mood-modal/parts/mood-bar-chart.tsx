"use client";

import { useCallback, useMemo } from "react";
import { Frown } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import Loader from "../../loader";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useGlobeAnalytics } from "../../providers/globe-analytics-provider/globe-analytics-client-provider";

export default function MoodBarChart() {
  const { countryMoods, isFetchingCountryMoods, activeFilter } =
    useGlobeAnalytics();

  const { chartData, chartConfig } = useMemo(() => {
    if (!countryMoods?.length) return { chartData: [], chartConfig: {} };

    const sortedMoods = [...countryMoods].sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.mood_id.localeCompare(b.mood_id);
    });

    const config: Record<string, { label: string; color: string }> = {
      total: { label: "Total", color: "" },
    };

    const data = sortedMoods.map((mood, index) => ({
      mood: mood.mood_id,
      total: mood.total,
      fill: `hsl(var(--chart-${index + 1}))`,
      emoji: mood.emoji,
    }));

    return { chartData: data, chartConfig: config };
  }, [countryMoods]);

  // Memoize the tooltip render function
  const tooltipContent = useCallback(({ payload }: any) => {
    if (payload?.[0]) {
      const data = payload[0].payload;
      return (
        <div className="flex items-center gap-2 p-2 bg-background border rounded-lg text-xl">
          <span>{data.emoji}</span>
          <span>{data.total}</span>
        </div>
      );
    }
    return null;
  }, []);

  // Memoize the custom tick component
  const CustomTick = useCallback(
    ({ x, y, payload }: any) => {
      const mood = chartData.find((m) => m.mood === payload.value);
      return (
        <text
          x={x}
          y={y}
          dy={6}
          dx={0}
          textAnchor="end"
          className="text-xl"
          fill="currentColor"
        >
          {mood?.emoji || "..."}
        </text>
      );
    },
    [chartData]
  );

  return (
    <div className="-mt-2">
      {isFetchingCountryMoods ? (
        <Loader size={20} />
      ) : (
        <>
          {!chartConfig || Object?.keys(chartConfig)?.length === 0 ? (
            <span className="flex items-center gap-2">
              No data here <Frown className="h-5 w-5" />
            </span>
          ) : (
            <>
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    left: 5,
                    right: 0,
                    top: 3,
                    bottom: 0,
                  }}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <YAxis
                    dataKey="mood"
                    type="category"
                    tickLine={false}
                    tickMargin={3}
                    axisLine={false}
                    width={24}
                    interval={0}
                    ticks={chartData.map((d) => d.mood)}
                    tick={CustomTick}
                  />
                  <XAxis type="number" hide domain={[0, "dataMax"]} />
                  <ChartTooltip cursor={false} content={tooltipContent} />
                  <Bar
                    dataKey="total"
                    radius={[0, 5, 5, 0]}
                    fill="currentColor"
                  />
                </BarChart>
              </ChartContainer>
              {activeFilter && (
                <div className="text-xs mt-3 w-full text-center text-muted-foreground">
                  {(() => {
                    const refreshMessages = {
                      "1hr":
                        "Last hour analytics are refreshed every 5 minutes",
                      "24hr": "Daily analytics are refreshed every 24 hours",
                      week: "Weekly analytics are refreshed every 24 hours",
                      month: "Monthly analytics are refreshed every 24 hours",
                      year: "Yearly analytics are refreshed every 24 hours",
                    };
                    return (
                      refreshMessages[
                        activeFilter as keyof typeof refreshMessages
                      ] || refreshMessages.year
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
