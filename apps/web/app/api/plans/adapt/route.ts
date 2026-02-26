import { NextResponse, type NextRequest } from "next/server";
import { fetchAvailableExercises } from "@/lib/exercises/fetch-available";
import { fetchRecentWorkoutLogs } from "@/lib/workouts/fetch-recent-logs";

// POST /api/plans/adapt - Fetch exercises + workout logs from DB, then proxy to services/api
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const equipment: string[] | undefined = body.profile?.equipment;

    const { exercises, error: exercisesError } = await fetchAvailableExercises(equipment);
    if (exercisesError) {
      return NextResponse.json({ error: exercisesError }, { status: 500 });
    }

    // Fetch recent workout logs (filtered by routine if provided)
    const { logs } = await fetchRecentWorkoutLogs(body.routineId);

    const { currentRoutine, ...rest } = body;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiBase}/routines/adapt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        currentRoutine,
        available_exercises: exercises,
        recentLogs: logs.length > 0 ? logs : (rest.recentLogs || []),
      }),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to reach API service: ${message}` },
      { status: 502 }
    );
  }
}
