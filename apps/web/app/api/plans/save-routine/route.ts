import { NextRequest, NextResponse } from "next/server";
import { createRoutine } from "@/app/(app)/routines/actions";
import type { CreateRoutineExerciseInput, RoutineSetData } from "@/lib/types/routines";

interface PlanExercise {
  name: string;
  sets: number;
  reps: number;
}

interface PlanDay {
  day: string;
  workout: PlanExercise[];
}

interface SaveRoutineBody {
  plan: {
    version?: number;
    days: PlanDay[];
  };
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveRoutineBody = await req.json();
    const { plan, name } = body;

    if (!plan?.days || !Array.isArray(plan.days)) {
      return NextResponse.json({ error: "Invalid plan data" }, { status: 400 });
    }

    // Auto-generate routine name from the plan's days if not provided
    const dayNames = plan.days.map((d) => d.day).join("/");
    const routineName = name || `AI Plan (${dayNames})`;

    // Convert AI plan exercises to CreateRoutineExerciseInput format
    const exercises: CreateRoutineExerciseInput[] = [];

    for (const day of plan.days) {
      if (!day.workout || !Array.isArray(day.workout)) continue;

      for (const ex of day.workout) {
        const setsData: RoutineSetData[] = Array.from(
          { length: ex.sets },
          (_, i) => ({
            set_index: i,
            target_reps: ex.reps,
            target_weight_kg: null,
          })
        );

        exercises.push({
          exercise_name: `${day.day} - ${ex.name}`,
          target_sets: ex.sets,
          target_reps: ex.reps,
          rest_seconds: 60,
          sets_data: setsData,
        });
      }
    }

    const result = await createRoutine(
      routineName,
      exercises,
      `AI-generated workout plan (v${plan.version || 1})`
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
