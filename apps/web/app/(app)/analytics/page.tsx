"use client";

import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { WorkoutStreak } from "@/components/analytics/workout-streak";
import { PersonalRecords } from "@/components/analytics/personal-records";
import { WorkoutHistory } from "@/components/analytics/workout-history";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into your workout data and track your progress
        </p>
      </div>

      <AnalyticsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VolumeChart />
        <WorkoutStreak />
      </div>

      <PersonalRecords />

      <WorkoutHistory />
    </div>
  );
}
