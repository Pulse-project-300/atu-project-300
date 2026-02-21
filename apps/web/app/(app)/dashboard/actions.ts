"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardAnalytics {
  totalWorkouts: number;
  totalTimeHours: number;
  thisWeek: number;
  thisMonth: number;
}

export interface WeeklyActivity {
  week: string;
  hours: number;
  workouts: number;
}

export interface DashboardRoutine {
  id: string;
  name: string;
  exercises: number;
  lastCompleted: string | null;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalWorkouts: 0, totalTimeHours: 0, thisWeek: 0, thisMonth: 0 };
  }

  // Fetch all completed workouts for this user
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, duration_seconds, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed");

  if (error || !workouts) {
    console.error("Failed to fetch dashboard analytics:", error);
    return { totalWorkouts: 0, totalTimeHours: 0, thisWeek: 0, thisMonth: 0 };
  }

  const now = new Date();

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalWorkouts = workouts.length;

  const totalSeconds = workouts.reduce(
    (sum, w) => sum + (w.duration_seconds || 0),
    0,
  );
  const totalTimeHours = Math.round((totalSeconds / 3600) * 10) / 10;

  const thisWeek = workouts.filter((w) => {
    const completedAt = w.completed_at ? new Date(w.completed_at) : null;
    return completedAt && completedAt >= startOfWeek;
  }).length;

  const thisMonth = workouts.filter((w) => {
    const completedAt = w.completed_at ? new Date(w.completed_at) : null;
    return completedAt && completedAt >= startOfMonth;
  }).length;

  return { totalWorkouts, totalTimeHours, thisWeek, thisMonth };
}

export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Calculate 8 weeks ago
  const now = new Date();
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  eightWeeksAgo.setHours(0, 0, 0, 0);

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("duration_seconds, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", eightWeeksAgo.toISOString())
    .order("completed_at", { ascending: true });

  if (error || !workouts) {
    console.error("Failed to fetch weekly activity:", error);
    return [];
  }

  // Build 8 week buckets starting from Monday of each week
  const weeks: WeeklyActivity[] = [];

  // Find the Monday of the current week
  const currentMonday = new Date(now);
  const day = currentMonday.getDay();
  const diff = day === 0 ? 6 : day - 1;
  currentMonday.setDate(currentMonday.getDate() - diff);
  currentMonday.setHours(0, 0, 0, 0);

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(weekStart.getDate() - i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const label = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;

    const weekWorkouts = workouts.filter((w) => {
      const completedAt = w.completed_at ? new Date(w.completed_at) : null;
      return completedAt && completedAt >= weekStart && completedAt < weekEnd;
    });

    const totalSeconds = weekWorkouts.reduce(
      (sum, w) => sum + (w.duration_seconds || 0),
      0,
    );

    weeks.push({
      week: label,
      hours: Math.round((totalSeconds / 3600) * 10) / 10,
      workouts: weekWorkouts.length,
    });
  }

  return weeks;
}

export async function getDashboardRoutines(): Promise<DashboardRoutine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Fetch active routines with exercise count
  const { data: routines, error } = await supabase
    .from("routines")
    .select(
      `
      id,
      name,
      routine_exercises (id)
    `,
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(3);

  if (error || !routines) {
    console.error("Failed to fetch dashboard routines:", error);
    return [];
  }

  // For each routine, find the last completed workout
  const result: DashboardRoutine[] = await Promise.all(
    routines.map(async (routine) => {
      const { data: lastWorkout } = await supabase
        .from("workouts")
        .select("completed_at")
        .eq("routine_id", routine.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      let lastCompleted: string | null = null;
      if (lastWorkout?.completed_at) {
        const completedDate = new Date(lastWorkout.completed_at);
        const now = new Date();
        const diffMs = now.getTime() - completedDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          lastCompleted = "Today";
        } else if (diffDays === 1) {
          lastCompleted = "Yesterday";
        } else if (diffDays < 7) {
          lastCompleted = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          lastCompleted = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        } else {
          lastCompleted = completedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      }

      const exercises = Array.isArray(routine.routine_exercises)
        ? routine.routine_exercises.length
        : 0;

      return {
        id: routine.id,
        name: routine.name,
        exercises,
        lastCompleted,
      };
    }),
  );

  return result;
}

export async function getDashboardProfile(): Promise<{ displayName: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { displayName: "User" };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  return { displayName: profileData?.name || "User" };
}
