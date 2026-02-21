import { createClient } from "@/lib/supabase/server";

const MAX_RECENT_WORKOUTS = 5;

interface WorkoutSetRow {
  exercise_name: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
}

interface WorkoutRow {
  id: string;
  completed_at: string;
  duration_seconds: number | null;
  workout_sets: WorkoutSetRow[];
}

interface CompactSet {
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
}

interface CompactExercise {
  name: string;
  sets: CompactSet[];
}

interface CompactWorkoutLog {
  date: string;
  duration_minutes: number | null;
  exercises: CompactExercise[];
}

/**
 * Fetch recent completed workouts with their sets, compacted into
 * a concise format suitable for AI prompt context.
 *
 * Optionally filter by routine_id to get logs for a specific routine.
 */
export async function fetchRecentWorkoutLogs(
  routineId?: string
): Promise<{ logs: CompactWorkoutLog[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { logs: [], error: "Not authenticated" };
  }

  let query = supabase
    .from("workouts")
    .select(
      `
      id, completed_at, duration_seconds,
      workout_sets ( exercise_name, set_index, weight_kg, reps, rpe, completed )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(MAX_RECENT_WORKOUTS);

  if (routineId) {
    query = query.eq("routine_id", routineId);
  }

  const { data, error } = await query;
  if (error) {
    return { logs: [], error: `Failed to fetch workout logs: ${error.message}` };
  }

  const logs: CompactWorkoutLog[] = (data as WorkoutRow[] | null || []).map((workout) => {
    // Group completed sets by exercise name, preserving set order
    const exerciseMap = new Map<string, CompactSet[]>();
    const exerciseOrder: string[] = [];

    for (const set of (workout.workout_sets || [])
      .filter((s) => s.completed)
      .sort((a, b) => a.set_index - b.set_index)) {
      if (!exerciseMap.has(set.exercise_name)) {
        exerciseMap.set(set.exercise_name, []);
        exerciseOrder.push(set.exercise_name);
      }
      exerciseMap.get(set.exercise_name)!.push({
        weight_kg: set.weight_kg,
        reps: set.reps,
        rpe: set.rpe,
      });
    }

    return {
      date: workout.completed_at?.split("T")[0] || "unknown",
      duration_minutes: workout.duration_seconds
        ? Math.round(workout.duration_seconds / 60)
        : null,
      exercises: exerciseOrder.map((name) => ({
        name,
        sets: exerciseMap.get(name)!,
      })),
    };
  });

  return { logs };
}
