import { NextResponse, type NextRequest } from "next/server";

// POST /api/plans/explain - Proxy to services/api
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Rename plan → routine for the new API
    const { plan, ...rest } = body;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiBase}/routines/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        routine: plan || body.routine,
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
