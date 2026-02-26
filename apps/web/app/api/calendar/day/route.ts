import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day"); // "yyyy-MM-dd"
  const tz = searchParams.get("tz") ?? "UTC";

  if (!day) {
    return NextResponse.json({ error: "Missing day" }, { status: 400 });
  }

  const [yStr, mStr, dStr] = day.split("-");
  const year = Number(yStr);
  const monthIndex = Number(mStr) - 1;
  const dateNum = Number(dStr);

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(dateNum)) {
    return NextResponse.json({ error: "Invalid day format" }, { status: 400 });
  }

  // Local midnight for requested day (conceptual local time)
  const localMidnight = new Date(year, monthIndex, dateNum);

  const startUtc = fromZonedTime(localMidnight, tz);
  const endUtcExclusive = fromZonedTime(addDays(localMidnight, 1), tz);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select(
      "id, user_id, routine_id, name, status, started_at, completed_at, duration_seconds, notes, created_at"
    )
    .not("completed_at", "is", null)
    .gte("completed_at", startUtc.toISOString())
    .lt("completed_at", endUtcExclusive.toISOString())
    .order("completed_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ workouts: data ?? [] });
}
