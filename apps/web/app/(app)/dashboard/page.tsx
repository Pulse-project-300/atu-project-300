"use client";

import { useEffect, useState } from "react";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RoutinesList } from "@/components/dashboard/routines-list";
import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";
import { BadgesWidget } from "@/components/dashboard/badges-widget";
import { getDashboardProfile } from "./actions";

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    getDashboardProfile().then(({ displayName }) =>
      setDisplayName(displayName),
    );
  }, []);

  return (
    <div className="w-full space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-primary">{displayName}</span>!
        </h1>
        <p className="text-muted-foreground">
          Here's your fitness overview and quick actions
        </p>
      </div>

      {/* Analytics Metrics */}
      <DashboardAnalytics />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <WeeklyChart />

        {/* Routines List */}
        <RoutinesList />
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges Widget */}
        <BadgesWidget />
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
