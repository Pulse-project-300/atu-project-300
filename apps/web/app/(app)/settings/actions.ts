"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  imported?: number;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  csv?: string;
  error?: string;
}

export interface ImportWorkoutData {
  name: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  sets: ImportSetData[];
}

export interface ImportSetData {
  exercise_name: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  set_type: "warmup" | "normal" | "dropset" | "failure";
}

/**
 * Delete all user data in correct order, then sign out
 */
export async function deleteAllUserData(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const userId = user.id;

    // Delete in correct order to respect foreign keys
    // 1. workout_sets (references workouts)
    const { error: setsError } = await supabase
      .from("workout_sets")
      .delete()
      .in(
        "workout_id",
        (
          await supabase
            .from("workouts")
            .select("id")
            .eq("user_id", userId)
        ).data?.map((w) => w.id) ?? []
      );
    if (setsError) throw setsError;

    // 2. workouts
    const { error: workoutsError } = await supabase
      .from("workouts")
      .delete()
      .eq("user_id", userId);
    if (workoutsError) throw workoutsError;

    // 3. routine_exercises (references routines)
    const { error: routineExError } = await supabase
      .from("routine_exercises")
      .delete()
      .in(
        "routine_id",
        (
          await supabase
            .from("routines")
            .select("id")
            .eq("user_id", userId)
        ).data?.map((r) => r.id) ?? []
      );
    if (routineExError) throw routineExError;

    // 4. routines
    const { error: routinesError } = await supabase
      .from("routines")
      .delete()
      .eq("user_id", userId);
    if (routinesError) throw routinesError;

    // 5. profiles
    const { error: profilesError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profilesError) throw profilesError;

    // Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (err) {
    console.error("Failed to delete user data:", err);
    return {
      success: false,
      error: `Failed to delete data: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Import pre-parsed workout data (from Hevy CSV)
 */
export async function importHevyWorkouts(
  workouts: ImportWorkoutData[]
): Promise<ImportResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    let importedCount = 0;

    for (const workout of workouts) {
      // Insert the workout
      const { data: newWorkout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: workout.name,
          status: "completed",
          started_at: workout.started_at,
          completed_at: workout.completed_at,
          duration_seconds: workout.duration_seconds,
        })
        .select("id")
        .single();

      if (workoutError || !newWorkout) {
        console.error("Failed to insert workout:", workoutError);
        continue;
      }

      // Batch insert all sets for this workout
      if (workout.sets.length > 0) {
        const setsToInsert = workout.sets.map((set) => ({
          workout_id: newWorkout.id,
          exercise_name: set.exercise_name,
          set_index: set.set_index,
          weight_kg: set.weight_kg,
          reps: set.reps,
          rpe: set.rpe,
          set_type: set.set_type,
          completed: true,
          completed_at: workout.completed_at,
        }));

        const { error: setsError } = await supabase
          .from("workout_sets")
          .insert(setsToInsert);

        if (setsError) {
          console.error("Failed to insert sets for workout:", setsError);
        }
      }

      importedCount++;
    }

    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    revalidatePath("/settings");

    return { success: true, imported: importedCount };
  } catch (err) {
    console.error("Failed to import workouts:", err);
    return {
      success: false,
      error: `Failed to import: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Export all completed workouts with their sets as a CSV string
 */
export async function exportWorkoutData(): Promise<ExportResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data: workouts, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_sets (*)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false });

    if (error) throw error;

    if (!workouts || workouts.length === 0) {
      return { success: false, error: "No completed workouts to export" };
    }

    // Build CSV - one row per set
    const headers = [
      "workout_name",
      "started_at",
      "completed_at",
      "duration_seconds",
      "exercise_name",
      "set_index",
      "weight_kg",
      "reps",
      "rpe",
      "set_type",
    ];

    const rows: string[] = [headers.join(",")];

    for (const workout of workouts) {
      const sets = workout.workout_sets || [];
      if (sets.length === 0) {
        // Include workout even with no sets
        rows.push(
          [
            csvEscape(workout.name),
            workout.started_at,
            workout.completed_at ?? "",
            workout.duration_seconds ?? "",
            "",
            "",
            "",
            "",
            "",
            "",
          ].join(",")
        );
      } else {
        for (const set of sets) {
          rows.push(
            [
              csvEscape(workout.name),
              workout.started_at,
              workout.completed_at ?? "",
              workout.duration_seconds ?? "",
              csvEscape(set.exercise_name),
              set.set_index,
              set.weight_kg ?? "",
              set.reps ?? "",
              set.rpe ?? "",
              set.set_type ?? "",
            ].join(",")
          );
        }
      }
    }

    return { success: true, csv: rows.join("\n") };
  } catch (err) {
    console.error("Failed to export workout data:", err);
    return {
      success: false,
      error: `Failed to export: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
