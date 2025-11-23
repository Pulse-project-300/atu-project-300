import { NextResponse, type NextRequest } from "next/server";

// POST /api/plans/adapt - Proxy to services/api
export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiBase}/plans/adapt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}