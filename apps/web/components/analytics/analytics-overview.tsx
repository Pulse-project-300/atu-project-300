"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Dumbbell,
  Timer,
  TrendingUp,
  Calendar,
  Flame,
  Award,
} from "lucide-react";
import {
  getAnalyticsOverview,
  type AnalyticsOverview as AnalyticsOverviewData,
} from "@/app/(app)/analytics/actions";

const statCards = [
  { key: "totalWorkouts", label: "Total Workouts", icon: Activity, format: (v: number) => `${v}` },
  { key: "totalTimeHours", label: "Total Hours", icon: Clock, format: (v: number) => `${v}h` },
  { key: "totalVolume", label: "Total Volume", icon: Dumbbell, format: (v: number) => `${Math.round(v).toLocaleString()}kg` },
  { key: "avgDuration", label: "Avg Duration", icon: Timer, format: (v: number) => `${v}m` },
  { key: "thisWeek", label: "This Week", icon: TrendingUp, format: (v: number) => `${v}` },
  { key: "thisMonth", label: "This Month", icon: Calendar, format: (v: number) => `${v}` },
  { key: "currentStreak", label: "Current Streak", icon: Flame, format: (v: number) => `${v}d` },
  { key: "bestStreak", label: "Best Streak", icon: Award, format: (v: number) => `${v}d` },
] as const;

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverviewData>({
    totalWorkouts: 0,
    totalTimeHours: 0,
    totalVolume: 0,
    avgDuration: 0,
    currentStreak: 0,
    bestStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = data[card.key];

        return (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-2xl sm:text-3xl font-bold truncate ${loading ? "animate-pulse text-muted-foreground" : ""}`}
                >
                  {card.format(value)}
                </p>
              </div>
              <div className="rounded-full bg-primary p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
