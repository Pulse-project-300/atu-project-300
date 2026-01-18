"use server";

import { createClient } from "@/lib/supabase/server";

export interface WorkoutLogData {
  date: string;
  day: string;
  duration: number;
  exercises: {
    exerciseName: string;
    sets: {
      setNumber: number;
      weight: string;
      reps: string;
      completed: boolean;
    }[];
  }[];
}

export async function saveWorkoutLog(workoutLog: WorkoutLogData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Save the workout log to the database
    const { data, error } = await supabase
      .from("workout_logs")
      .insert({
        user_id: user.id,
        workout_date: workoutLog.date,
        day_name: workoutLog.day,
        duration_seconds: workoutLog.duration,
        exercises_data: workoutLog.exercises,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving workout log:", error);
      return { error: error.message };
    }

    return { success: true, logId: data.id };
  } catch (err) {
    console.error("Error in saveWorkoutLog:", err);
    return { error: "Failed to save workout log" };
  }
}

export async function getWorkoutLogs(limit: number = 10) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", logs: null };
  }

  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching workout logs:", error);
      return { error: error.message, logs: null };
    }

    return { logs: data };
  } catch (err) {
    console.error("Error in getWorkoutLogs:", err);
    return { error: "Failed to fetch workout logs", logs: null };
  }
}

export async function getWorkoutLogsByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", logs: null };
  }

  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("workout_date", startDate)
      .lte("workout_date", endDate)
      .order("workout_date", { ascending: false });

    if (error) {
      console.error("Error fetching workout logs:", error);
      return { error: error.message, logs: null };
    }

    return { logs: data };
  } catch (err) {
    console.error("Error in getWorkoutLogsByDateRange:", err);
    return { error: "Failed to fetch workout logs", logs: null };
  }
}
