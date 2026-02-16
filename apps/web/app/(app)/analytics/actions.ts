"use server";

import { createClient } from "@/lib/supabase/server";

export interface AnalyticsOverview {
  totalWorkouts: number;
  totalTimeHours: number;
  totalVolume: number;
  avgDuration: number;
  currentStreak: number;
  bestStreak: number;
  thisWeek: number;
  thisMonth: number;
}

export interface WeeklyVolume {
  week: string;
  volume: number;
  sets: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface WorkoutHistoryItem {
  id: string;
  name: string;
  completedAt: string;
  durationMinutes: number;
  exerciseCount: number;
  totalSets: number;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: AnalyticsOverview = {
    totalWorkouts: 0,
    totalTimeHours: 0,
    totalVolume: 0,
    avgDuration: 0,
    currentStreak: 0,
    bestStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
  };

  if (!user) return empty;

  // Fetch all completed workouts
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, duration_seconds, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (error || !workouts) {
    console.error("Failed to fetch analytics overview:", error);
    return empty;
  }

  // Fetch total volume from completed sets
  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("weight_kg, reps, workout_id")
    .eq("completed", true)
    .in(
      "workout_id",
      workouts.map((w) => w.id),
    );

  if (setsError) {
    console.error("Failed to fetch sets for volume:", setsError);
  }

  const totalVolume = (sets || []).reduce((sum, s) => {
    return sum + (Number(s.weight_kg) || 0) * (s.reps || 0);
  }, 0);

  const now = new Date();

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;
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
  const avgDuration =
    totalWorkouts > 0 ? Math.round(totalSeconds / totalWorkouts / 60) : 0;

  const thisWeek = workouts.filter((w) => {
    const completedAt = w.completed_at ? new Date(w.completed_at) : null;
    return completedAt && completedAt >= startOfWeek;
  }).length;

  const thisMonth = workouts.filter((w) => {
    const completedAt = w.completed_at ? new Date(w.completed_at) : null;
    return completedAt && completedAt >= startOfMonth;
  }).length;

  // Calculate streaks from completed_at dates
  const workoutDates = workouts
    .filter((w) => w.completed_at)
    .map((w) => {
      const d = new Date(w.completed_at!);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  const uniqueDates = [...new Set(workoutDates)].sort().reverse();

  let currentStreak = 0;
  let bestStreak = 0;

  if (uniqueDates.length > 0) {
    // Check if today or yesterday had a workout (streak is still active)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Calculate all streaks
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const curr = new Date(uniqueDates[i - 1]);
      const prev = new Date(uniqueDates[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streak++;
      } else {
        if (streak > bestStreak) bestStreak = streak;
        streak = 1;
      }
    }
    if (streak > bestStreak) bestStreak = streak;

    // Current streak: count consecutive days ending at today or yesterday
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i - 1]);
        const prev = new Date(uniqueDates[i]);
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalWorkouts,
    totalTimeHours,
    totalVolume: Math.round(totalVolume),
    avgDuration,
    currentStreak,
    bestStreak,
    thisWeek,
    thisMonth,
  };
}

export async function getWeeklyVolume(): Promise<WeeklyVolume[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const now = new Date();
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  eightWeeksAgo.setHours(0, 0, 0, 0);

  // Fetch completed workouts in range
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", eightWeeksAgo.toISOString())
    .order("completed_at", { ascending: true });

  if (error || !workouts || workouts.length === 0) {
    if (error) console.error("Failed to fetch weekly volume:", error);
    return [];
  }

  // Fetch all completed sets for these workouts
  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("workout_id, weight_kg, reps")
    .eq("completed", true)
    .in(
      "workout_id",
      workouts.map((w) => w.id),
    );

  if (setsError) {
    console.error("Failed to fetch sets for volume chart:", setsError);
    return [];
  }

  // Build workout → sets map
  const workoutSetsMap = new Map<
    string,
    { weight_kg: number; reps: number }[]
  >();
  for (const s of sets || []) {
    const arr = workoutSetsMap.get(s.workout_id) || [];
    arr.push({ weight_kg: Number(s.weight_kg) || 0, reps: s.reps || 0 });
    workoutSetsMap.set(s.workout_id, arr);
  }

  // Build 8 week buckets
  const currentMonday = new Date(now);
  const day = currentMonday.getDay();
  const diff = day === 0 ? 6 : day - 1;
  currentMonday.setDate(currentMonday.getDate() - diff);
  currentMonday.setHours(0, 0, 0, 0);

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

  const weeks: WeeklyVolume[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(weekStart.getDate() - i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const label = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;

    const weekWorkouts = workouts.filter((w) => {
      const completedAt = w.completed_at ? new Date(w.completed_at) : null;
      return completedAt && completedAt >= weekStart && completedAt < weekEnd;
    });

    let volume = 0;
    let totalSets = 0;

    for (const w of weekWorkouts) {
      const wSets = workoutSetsMap.get(w.id) || [];
      totalSets += wSets.length;
      for (const s of wSets) {
        volume += s.weight_kg * s.reps;
      }
    }

    weeks.push({
      week: label,
      volume: Math.round(volume),
      sets: totalSets,
    });
  }

  return weeks;
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get completed workouts for this user
  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "completed");

  if (workoutsError || !workouts || workouts.length === 0) return [];

  // Get all completed sets with weight
  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("exercise_name, weight_kg, reps, completed_at")
    .eq("completed", true)
    .gt("weight_kg", 0)
    .in(
      "workout_id",
      workouts.map((w) => w.id),
    )
    .order("weight_kg", { ascending: false });

  if (setsError || !sets) {
    console.error("Failed to fetch personal records:", setsError);
    return [];
  }

  // Group by exercise, find max weight for each
  const exerciseMap = new Map<
    string,
    { weight: number; reps: number; date: string }
  >();
  const exerciseFrequency = new Map<string, number>();

  for (const s of sets) {
    const name = s.exercise_name;
    exerciseFrequency.set(name, (exerciseFrequency.get(name) || 0) + 1);

    const existing = exerciseMap.get(name);
    const weight = Number(s.weight_kg) || 0;
    if (!existing || weight > existing.weight) {
      exerciseMap.set(name, {
        weight,
        reps: s.reps || 0,
        date: s.completed_at || "",
      });
    }
  }

  // Sort by frequency (top 10 most-used exercises)
  const sorted = [...exerciseMap.entries()]
    .sort(
      (a, b) =>
        (exerciseFrequency.get(b[0]) || 0) -
        (exerciseFrequency.get(a[0]) || 0),
    )
    .slice(0, 10);

  return sorted.map(([name, data]) => ({
    exerciseName: name,
    weight: data.weight,
    reps: data.reps,
    date: data.date,
  }));
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      name,
      completed_at,
      duration_seconds,
      workout_sets (id, exercise_name)
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(10);

  if (error || !workouts) {
    console.error("Failed to fetch workout history:", error);
    return [];
  }

  return workouts.map((w) => {
    const sets = Array.isArray(w.workout_sets) ? w.workout_sets : [];
    const uniqueExercises = new Set(sets.map((s: { exercise_name: string }) => s.exercise_name));

    return {
      id: w.id,
      name: w.name,
      completedAt: w.completed_at || "",
      durationMinutes: Math.round((w.duration_seconds || 0) / 60),
      exerciseCount: uniqueExercises.size,
      totalSets: sets.length,
    };
  });
}
