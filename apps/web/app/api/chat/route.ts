import { NextResponse, type NextRequest } from "next/server";

// POST /api/chat - Proxy to AI orchestrator chat endpoint
export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiBase}/plan/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
