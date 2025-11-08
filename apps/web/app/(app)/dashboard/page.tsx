import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RoutinesList } from "@/components/dashboard/routines-list";
import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile from database
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const displayName = profileData?.name || "User";

  return (
    <div className="w-full space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome back, {displayName}!
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

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
