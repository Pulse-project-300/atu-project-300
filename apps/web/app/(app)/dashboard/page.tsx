import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
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
    // Sections I want to include

    //Bar chart of hours this week
    // Allow user to click and explore analytics ?
    // Total Workouts completed, workouts this week, This month, Total time spent working out. Profile Pic?
    // View Full analytics
    <div className="w-full">
      <DashboardAnalytics />
    </div>

    // List Some of the routines with a start routine Button

    // Little chat box where you can chat to the AI
  );
}
