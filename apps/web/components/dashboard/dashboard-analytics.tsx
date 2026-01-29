import { Activity, Clock, TrendingUp, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";

export function DashboardAnalytics() {
  // Mock data for demonstration
  const mockData = {
    totalWorkouts: 47,
    totalTime: 32,
    thisWeek: 4,
    thisMonth: 18,
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Workouts Card */}
        <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Workouts
              </p>
              <p className="mt-2 text-3xl font-bold">{mockData.totalWorkouts}</p>
            </div>
            <div className="rounded-full bg-brand p-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Time Card */}
        <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-brand/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Time
              </p>
              <p className="mt-2 text-3xl font-bold">{mockData.totalTime}h</p>
            </div>
            <div className="rounded-full bg-brand p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Workouts This Week Card */}
        <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-brand/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Week
              </p>
              <p className="mt-2 text-3xl font-bold">{mockData.thisWeek}</p>
            </div>
            <div className="rounded-full bg-brand p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Workouts This Month Card */}
        <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-brand/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Month
              </p>
              <p className="mt-2 text-3xl font-bold">{mockData.thisMonth}</p>
            </div>
            <div className="rounded-full bg-brand p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Explore Analytics Button */}
      <div className="flex justify-center">
        <Link
          href="/analytics"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-brand/20 bg-brand/5 px-6 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md hover:bg-brand/10"
        >
          <BarChart3 className="h-4 w-4 text-brand" />
          <span className="text-brand font-bold">
            Explore All Analytics
          </span>
        </Link>
      </div>
    </div>
  );
}
