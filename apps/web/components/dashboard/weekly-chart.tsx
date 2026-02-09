"use client";

import { useEffect, useState } from "react";
import {
  getWeeklyActivity,
  type WeeklyActivity,
} from "@/app/(app)/dashboard/actions";

export function WeeklyChart() {
  const [weekData, setWeekData] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyActivity()
      .then(setWeekData)
      .finally(() => setLoading(false));
  }, []);

  // Use 12 hours as the maximum scale for dramatic visual differences
  const maxScale = 12;

  // The current week is the last entry
  const currentWeekIndex = weekData.length - 1;

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Last 2 Months Activity</h3>
          <p className="text-sm text-muted-foreground">
            Hours spent working out per week
          </p>
        </div>
        <div className="flex items-end justify-between gap-4 px-2 animate-pulse" style={{ height: '400px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
              <div className="w-full bg-muted-foreground/10 rounded-t-xl" style={{ height: `${40 + Math.random() * 200}px` }} />
              <div className="h-3 w-10 bg-muted-foreground/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = weekData.some((w) => w.workouts > 0);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Last 2 Months Activity</h3>
        <p className="text-sm text-muted-foreground">
          Hours spent working out per week
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No workouts yet
          </p>
          <p className="text-xs text-muted-foreground">
            Complete a workout to see your activity here
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4 px-2" style={{ height: '400px' }}>
            {weekData.map((week, index) => {
              // Calculate height in pixels for much more dramatic differences
              const heightInPx = (week.hours / maxScale) * 380; // 380px out of 400px max
              const isCurrentWeek = index === currentWeekIndex;

              return (
                <div key={week.week} className="group flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  {/* Bar Container */}
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '380px' }}>
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                        <div className="font-bold text-base">{week.hours}h</div>
                        <div className="text-gray-300 text-xs">{week.workouts} workouts</div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
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
                        minHeight: week.hours > 0 ? "32px" : "0px",
                      }}
                    />
                  </div>

                  {/* Week label */}
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

          {/* Legend */}
          <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Workout Hours</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
