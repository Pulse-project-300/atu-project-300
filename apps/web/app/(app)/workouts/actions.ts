"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Workout,
  WorkoutSet,
  WorkoutWithSets,
  UpdateSetInput,
  RoutineWithExercises,
  RoutineSetData,
} from "@/lib/types/routines";

export interface StartWorkoutResult {
  success: boolean;
  workout?: WorkoutWithSets;
  error?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface UpdateSetResult {
  success: boolean;
  set?: WorkoutSet;
  error?: string;
}

export interface AddSetResult {
  success: boolean;
  set?: WorkoutSet;
  error?: string;
}

/**
 * Start a new workout from a routine template
 * Creates a workout record and copies all routine exercises as workout_sets
 */
export async function startWorkout(routineId: string): Promise<StartWorkoutResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Check if user already has an in-progress workout
    const { data: existingWorkout } = await supabase
      .from("workouts")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .single();

    if (existingWorkout) {
      return { 
        success: false, 
        error: `You already have an active workout: "${existingWorkout.name}". Please finish or cancel it first.` 
      };
    }

    // Get the routine with its exercises
    const { data: routine, error: routineError } = await supabase
      .from("routines")
      .select(`
        *,
        routine_exercises (*)
      `)
      .eq("id", routineId)
      .order("order_index", { referencedTable: "routine_exercises", ascending: true })
      .single();

    if (routineError || !routine) {
      return { success: false, error: "Routine not found" };
    }

    const typedRoutine = routine as RoutineWithExercises;
    const routineExercises = typedRoutine.routine_exercises || [];

    // Create the workout record
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        routine_id: routineId,
        name: typedRoutine.name,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (workoutError || !workout) {
      throw workoutError || new Error("Failed to create workout");
    }

    // Create workout_sets from routine_exercises
    const setsToInsert: Omit<WorkoutSet, "id">[] = [];

    for (const exercise of routineExercises) {
      const setsData = exercise.sets_data as RoutineSetData[] | null;

      // Get number of sets from sets_data array length
      const numSets = setsData?.length ?? 0;

      // Create the number of sets
      // Note: set_index starts at 1 due to database constraint (set_index > 0)
      for (let setIndex = 1; setIndex <= numSets; setIndex++) {
        const setData = setsData?.find(s => s.set_index === setIndex);

        setsToInsert.push({
          workout_id: workout.id,
          exercise_library_id: exercise.exercise_library_id,
          exercise_name: exercise.exercise_name,
          set_index: setIndex,
          weight_kg: setData?.target_weight_kg ?? null,
          reps: setData?.target_reps ?? null,
          completed: false,
          rpe: null,
          set_type: "normal",
          completed_at: null,
        });
      }
    }

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from("workout_sets")
        .insert(setsToInsert);

      if (setsError) {
        console.error("Failed to insert workout sets:", setsError);
        // Return error info so user knows what's wrong
        return {
          success: true,
          workout: {
            ...workout,
            workout_sets: [],
          } as WorkoutWithSets,
          error: `Workout created but sets failed: ${setsError.message}`,
        };
      }
    } else {
      // Return with a note that there are no exercises
      return {
        success: true,
        workout: {
          ...workout,
          workout_sets: [],
        } as WorkoutWithSets,
        error: "Workout created but this routine has no exercises. Please add exercises to your routine first.",
      };
    }

    // Fetch the complete workout with sets
    const { data: workoutWithSets, error: fetchError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_sets (*)
      `)
      .eq("id", workout.id)
      .single();

    if (fetchError || !workoutWithSets) {
      // Even if fetch fails, return the workout we created
      console.error("Failed to fetch workout with sets:", fetchError);
      return {
        success: true,
        workout: {
          ...workout,
          workout_sets: [],
        } as WorkoutWithSets,
      };
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");

    return { 
      success: true, 
      workout: {
        ...workoutWithSets,
        workout_sets: workoutWithSets.workout_sets || [],
      } as WorkoutWithSets 
    };
  } catch (err) {
    console.error("Failed to start workout:", err);
    return { success: false, error: `Failed to start workout: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

/**
 * Get the user's active (in-progress) workout if any
 */
export async function getActiveWorkout(): Promise<WorkoutWithSets | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_sets (*)
      `)
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .single();

    if (error || !data) return null;

    return data as WorkoutWithSets;
  } catch (err) {
    console.error("Failed to get active workout:", err);
    return null;
  }
}

/**
 * Update a workout set (weight, reps, completed status, etc.)
 */
export async function updateWorkoutSet(
  setId: string, 
  data: UpdateSetInput
): Promise<UpdateSetResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Build update object, only including defined values
    const updateData: Record<string, unknown> = {};
    
    if (data.weight_kg !== undefined) updateData.weight_kg = data.weight_kg;
    if (data.reps !== undefined) updateData.reps = data.reps;
    if (data.rpe !== undefined) updateData.rpe = data.rpe;
    if (data.set_type !== undefined) updateData.set_type = data.set_type;
    
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      updateData.completed_at = data.completed ? new Date().toISOString() : null;
    }

    const { data: set, error } = await supabase
      .from("workout_sets")
      .update(updateData)
      .eq("id", setId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, set: set as WorkoutSet };
  } catch (err) {
    console.error("Failed to update set:", err);
    return { success: false, error: "Failed to update set" };
  }
}

/**
 * Add a new set to an active workout
 */
export async function addSetToWorkout(
  workoutId: string,
  exerciseName: string,
  exerciseLibraryId?: string | null
): Promise<AddSetResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get the current max set_index for this exercise in this workout
    const { data: existingSets } = await supabase
      .from("workout_sets")
      .select("set_index, weight_kg, reps")
      .eq("workout_id", workoutId)
      .eq("exercise_name", exerciseName)
      .order("set_index", { ascending: false })
      .limit(1);

    const lastSet = existingSets?.[0];
    // Note: set_index starts at 1 due to database constraint (set_index > 0)
    const newSetIndex = lastSet ? lastSet.set_index + 1 : 1;

    const { data: set, error } = await supabase
      .from("workout_sets")
      .insert({
        workout_id: workoutId,
        exercise_library_id: exerciseLibraryId || null,
        exercise_name: exerciseName,
        set_index: newSetIndex,
        weight_kg: lastSet?.weight_kg ?? null,
        reps: lastSet?.reps ?? null,
        completed: false,
        rpe: null,
        set_type: "normal",
        completed_at: null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, set: set as WorkoutSet };
  } catch (err) {
    console.error("Failed to add set:", err);
    return { success: false, error: "Failed to add set" };
  }
}

/**
 * Complete a workout - marks it as completed and calculates duration
 */
export async function completeWorkout(workoutId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    // Get the workout to calculate duration
    const { data: workout, error: fetchError } = await supabase
      .from("workouts")
      .select("started_at")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !workout) {
      return { success: false, error: "Workout not found" };
    }

    const startedAt = new Date(workout.started_at);
    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    const { error } = await supabase
      .from("workouts")
      .update({
        status: "completed",
        completed_at: completedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", workoutId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/routines");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return { success: true };
  } catch (err) {
    console.error("Failed to complete workout:", err);
    return { success: false, error: "Failed to complete workout" };
  }
}

/**
 * Cancel a workout - marks it as cancelled
 */
export async function cancelWorkout(workoutId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("workouts")
      .update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
      })
      .eq("id", workoutId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/routines");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Failed to cancel workout:", err);
    return { success: false, error: "Failed to cancel workout" };
  }
}

/**
 * Delete a set from a workout
 */
export async function deleteWorkoutSet(setId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("workout_sets")
      .delete()
      .eq("id", setId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("Failed to delete set:", err);
    return { success: false, error: "Failed to delete set" };
  }
}
