import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "yyyy-MM"
  const tz = searchParams.get("tz") ?? "UTC";

  if (!month) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  // Parse "yyyy-MM" safely
  const [yStr, mStr] = month.split("-");
  const year = Number(yStr);
  const monthIndex = Number(mStr) - 1; // 0-based
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return NextResponse.json({ error: "Invalid month format" }, { status: 400 });
  }

  const monthDateLocal = new Date(year, monthIndex, 1);

  const monthStartLocal = startOfMonth(monthDateLocal);
  const monthEndLocal = endOfMonth(monthDateLocal);

  const gridStartLocal = startOfWeek(monthStartLocal, { weekStartsOn: 1 });
  const gridEndLocal = endOfWeek(monthEndLocal, { weekStartsOn: 1 });

  const startUtc = fromZonedTime(gridStartLocal, tz);
  const endUtcExclusive = fromZonedTime(addDays(gridEndLocal, 1), tz);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id, completed_at")
    .not("completed_at", "is", null)
    .gte("completed_at", startUtc.toISOString())
    .lt("completed_at", endUtcExclusive.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build counts by local day key (yyyy-MM-dd) in the provided tz
  const countsByDay: Record<string, number> = {};

  // Avoid bringing in utcToZonedTime here; do a simple day-key by converting via Intl
  // But easiest/consistent: use date-fns-tz conversion via Date string and manual formatting
  // We'll use a stable ISO->local day key using Intl.DateTimeFormat.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  for (const row of data ?? []) {
    const iso = (row as { completed_at: string }).completed_at;
    const parts = fmt.formatToParts(new Date(iso));
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (!y || !m || !d) continue;
    const key = `${y}-${m}-${d}`;
    countsByDay[key] = (countsByDay[key] ?? 0) + 1;
  }

  return NextResponse.json({ countsByDay });
}
