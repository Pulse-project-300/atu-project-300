"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Routine,
  RoutineWithExercises,
  CreateRoutineExerciseInput,
  ExerciseLibraryItem
} from "@/lib/types/workouts";

export async function deleteRoutine(routineId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("routines")
      .delete()
      .eq("id", routineId);

    if (error) throw error;

    revalidatePath("/workouts");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete routine:", err);
    return { success: false, error: "Failed to delete routine" };
  }
}

export async function createRoutine(
  name: string,
  exercises: CreateRoutineExerciseInput[]
): Promise<{ success: boolean; routineId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Create the routine
    const { data: routine, error: routineError } = await supabase
      .from("routines")
      .insert({
        user_id: user.id,
        name: name.trim(),
      })
      .select()
      .single();

    if (routineError) throw routineError;

    // Create all exercises if any
    if (exercises.length > 0) {
      const exercisesToInsert = exercises.map((ex, index) => ({
        routine_id: routine.id,
        exercise_library_id: ex.exercise_library_id || null,
        exercise_name: ex.exercise_name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        order_index: index,
      }));

      const { error: exercisesError } = await supabase
        .from("routine_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;
    }

    revalidatePath("/workouts");
    return { success: true, routineId: routine.id };
  } catch (err) {
    console.error("Failed to create routine:", err);
    return { success: false, error: "Failed to create routine" };
  }
}

export async function getRoutines(): Promise<Routine[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch routines:", error);
    return [];
  }

  return data || [];
}

export async function getRoutineWithExercises(routineId: string): Promise<RoutineWithExercises | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routines")
    .select(`
      *,
      routine_exercises (*)
    `)
    .eq("id", routineId)
    .order("order_index", { referencedTable: "routine_exercises", ascending: true })
    .single();

  if (error) {
    console.error("Failed to fetch routine:", error);
    return null;
  }

  return data;
}

export async function searchExercises(query: string): Promise<ExerciseLibraryItem[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("new_exercises")
    .select("rowid, name, equipment, category")
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Failed to search exercises:", error);
    return [];
  }

  return (data || []) as ExerciseLibraryItem[];
}
