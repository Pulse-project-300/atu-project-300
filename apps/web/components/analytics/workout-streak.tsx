"use client";

import { useEffect, useState } from "react";
import { Flame, Award } from "lucide-react";
import {
  getAnalyticsOverview,
  type AnalyticsOverview,
} from "@/app/(app)/analytics/actions";

export function WorkoutStreak() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Workout Streak</h3>
          <p className="text-sm text-muted-foreground">
            Consecutive days training
          </p>
        </div>
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-muted-foreground/10 rounded-lg" />
          <div className="h-20 bg-muted-foreground/10 rounded-lg" />
        </div>
      </div>
    );
  }

  const currentStreak = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak ?? 0;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Workout Streak</h3>
        <p className="text-sm text-muted-foreground">
          Consecutive days training
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center gap-4 rounded-lg bg-primary/10 p-4">
          <div className="rounded-full bg-primary p-3">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Streak
            </p>
            <p className="text-4xl font-bold">
              {currentStreak}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                day{currentStreak !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-muted-foreground/20 p-3">
            <Award className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Best Streak
            </p>
            <p className="text-4xl font-bold">
              {bestStreak}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                day{bestStreak !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
