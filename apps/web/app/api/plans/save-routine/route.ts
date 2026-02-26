import { NextRequest, NextResponse } from "next/server";
import { createRoutine } from "@/app/(app)/routines/actions";
import type { CreateRoutineExerciseInput } from "@/lib/types/routines";

interface RoutineExerciseFromAI {
  exercise_name: string;
  exercise_library_id?: string;
  sets_data: { set_index: number; target_reps: number | null; target_weight_kg: number | null }[];
  rest_seconds: number;
  order_index: number;
  notes?: string;
}

interface SaveRoutineBody {
  routine: {
    name: string;
    description?: string;
    exercises: RoutineExerciseFromAI[];
  };
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveRoutineBody = await req.json();
    const { routine, name } = body;

    if (!routine?.exercises || !Array.isArray(routine.exercises)) {
      return NextResponse.json({ error: "Invalid routine data" }, { status: 400 });
    }

    const routineName = name || routine.name || "AI Routine";

    // Map AI-generated exercises directly to CreateRoutineExerciseInput
    const exercises: CreateRoutineExerciseInput[] = routine.exercises.map((ex) => ({
      exercise_library_id: ex.exercise_library_id,
      exercise_name: ex.exercise_name,
      target_sets: ex.sets_data.length,
      target_reps: ex.sets_data[0]?.target_reps ?? undefined,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
      sets_data: ex.sets_data,
    }));

    const result = await createRoutine(
      routineName,
      exercises,
      routine.description || "AI-generated workout routine"
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ routineId: result.routineId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save routine: ${message}` },
      { status: 500 }
    );
  }
}
