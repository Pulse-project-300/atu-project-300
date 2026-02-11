"use client";

import { useEffect, useState } from "react";
import {
  getWeeklyVolume,
  type WeeklyVolume,
} from "@/app/(app)/analytics/actions";

export function VolumeChart() {
  const [weekData, setWeekData] = useState<WeeklyVolume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyVolume()
      .then(setWeekData)
      .finally(() => setLoading(false));
  }, []);

  const currentWeekIndex = weekData.length - 1;
  const maxVolume = Math.max(...weekData.map((w) => w.volume), 1);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Weekly Volume</h3>
          <p className="text-sm text-muted-foreground">
            Total volume (kg) per week
          </p>
        </div>
        <div
          className="flex items-end justify-between gap-4 px-2 animate-pulse"
          style={{ height: "300px" }}
        >
          {[120, 80, 160, 100, 140, 60, 180, 110].map((h, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-3 h-full justify-end"
            >
              <div
                className="w-full bg-muted-foreground/10 rounded-t-xl"
                style={{ height: `${h}px` }}
              />
              <div className="h-3 w-10 bg-muted-foreground/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = weekData.some((w) => w.volume > 0);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Weekly Volume</h3>
        <p className="text-sm text-muted-foreground">
          Total volume (kg) per week
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No volume data yet
          </p>
          <p className="text-xs text-muted-foreground">
            Complete workouts with weights to see volume here
          </p>
        </div>
      ) : (
        <>
          <div
            className="flex items-end justify-between gap-4 px-2"
            style={{ height: "300px" }}
            role="img"
            aria-label={`Weekly volume chart. ${weekData.filter(w => w.volume > 0).length} of ${weekData.length} weeks had volume data.`}
          >
            {weekData.map((week, index) => {
              const heightInPx = (week.volume / maxVolume) * 260;
              const isCurrentWeek = index === currentWeekIndex;

              return (
                <div
                  key={week.week}
                  className="group flex-1 flex flex-col items-center gap-3 h-full justify-end"
                >
                  <div
                    className="relative w-full flex flex-col justify-end"
                    style={{ height: "260px" }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-popover text-popover-foreground text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border">
                        <div className="font-bold text-base">
                          {week.volume.toLocaleString()}kg
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {week.sets} sets
                        </div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-popover border-b border-r rotate-45" />
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 cursor-pointer relative ${
                        isCurrentWeek
                          ? "bg-primary shadow-xl shadow-primary/30"
                          : "bg-muted-foreground/20 group-hover:bg-primary/70 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-105"
                      }`}
                      style={{
                        height: `${heightInPx}px`,
                        minHeight: week.volume > 0 ? "32px" : "0px",
                      }}
                    />
                  </div>

                  <div
                    className={`text-xs font-medium transition-colors whitespace-nowrap ${
                      isCurrentWeek
                        ? "text-primary font-semibold"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  >
                    {week.week}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Volume (kg)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
