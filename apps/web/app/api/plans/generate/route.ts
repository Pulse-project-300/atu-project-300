import { NextResponse, type NextRequest } from "next/server";
import { fetchAvailableExercises } from "@/lib/exercises/fetch-available";

// POST /api/plans/generate - Fetch exercises from DB, then proxy to services/api
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const equipment: string[] | undefined = body.profile?.equipment;

    const { exercises, error: exercisesError } = await fetchAvailableExercises(equipment);
    if (exercisesError) {
      return NextResponse.json({ error: exercisesError }, { status: 500 });
    }

    // Proxy to Express API with exercises attached
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiBase}/routines/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        available_exercises: exercises,
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
