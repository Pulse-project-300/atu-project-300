"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

type WorkoutRow = {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string | null;
  status: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
};

function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function eachDay(start: Date, end: Date) {
  const out: Date[] = [];
  let d = start;
  while (d <= end) {
    out.push(d);
    d = addDays(d, 1);
  }
  return out;
}


export default function CalendarClient() {
  const tz = useMemo(getUserTimeZone, []);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  const [countsByDay, setCountsByDay] = useState<Record<string, number>>({});
  const [workoutsForDay, setWorkoutsForDay] = useState<WorkoutRow[]>([]);

  // Month grid (desktop)
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = useMemo(() => eachDay(gridStart, gridEnd), [gridStart, gridEnd]);

  // Week strip (mobile) based on selected day
  const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDay, { weekStartsOn: 1 });
  const weekDays = useMemo(() => eachDay(weekStart, weekEnd), [weekStart, weekEnd]);

  const selectedKey = format(
    new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()),
    "yyyy-MM-dd"
  );

  async function loadMonthCounts(nextMonthDate: Date) {
    setLoadingMonth(true);
    setCountsByDay({});

    const month = format(nextMonthDate, "yyyy-MM");
    const res = await fetch(`/api/calendar/month?month=${month}&tz=${encodeURIComponent(tz)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to load month counts");
      setLoadingMonth(false);
      return;
    }

    const json = (await res.json()) as { countsByDay: Record<string, number> };
    setCountsByDay(json.countsByDay ?? {});
    setLoadingMonth(false);
  }

  async function loadDayWorkouts(day: Date) {
    setLoadingDay(true);
    setWorkoutsForDay([]);

    const dayKey = format(
      new Date(day.getFullYear(), day.getMonth(), day.getDate()),
      "yyyy-MM-dd"
    );

    const res = await fetch(`/api/calendar/day?day=${dayKey}&tz=${encodeURIComponent(tz)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to load day workouts");
      setLoadingDay(false);
      return;
    }

    const json = (await res.json()) as { workouts: WorkoutRow[] };
    setWorkoutsForDay(json.workouts ?? []);
    setLoadingDay(false);
  }

  useEffect(() => {
    loadMonthCounts(monthDate);
    loadDayWorkouts(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMonthCounts(monthDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  // If you change selected day into a different month, keep header month in sync
  useEffect(() => {
    if (!isSameMonth(selectedDay, monthDate)) {
      setMonthDate(new Date(selectedDay));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMonthDate((d) => subMonths(d, 1))}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          ←
        </button>

        <div className="min-w-[140px] text-base font-extrabold sm:min-w-[220px] sm:text-lg">
          {format(monthDate, "MMMM yyyy")}
        </div>

        <button
          onClick={() => setMonthDate((d) => addMonths(d, 1))}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          →
        </button>

        <div className="flex-1" />

        <button
          onClick={() => {
            const today = new Date();
            setMonthDate(today);
            setSelectedDay(today);
            loadDayWorkouts(today);
          }}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          Today
        </button>
      </div>

      {/* MOBILE: Week strip */}
      <div className="rounded-xl border border-border bg-card p-3 md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">{format(selectedDay, "PPP")}</div>
          <div className="text-xs text-muted-foreground">{tz}</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const count = countsByDay[key] ?? 0;
            const isSelected = key === selectedKey;

            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDay(day);
                  loadDayWorkouts(day);
                }}
                className={[
                  "flex flex-col items-center justify-center rounded-lg border px-1 py-2 transition-colors",
                  "border-border hover:bg-muted",
                  isSelected ? "bg-accent" : "bg-background",
                ].join(" ")}
                aria-label={`Select ${format(day, "PPP")}`}
              >
                <div className="text-[10px] font-semibold text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div className="text-sm font-semibold">{format(day, "d")}</div>
                <div className="mt-1 h-1.5">
                  {count > 0 ? (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP: Month grid + Day panel side-by-side */}
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        <div className="md:col-span-2 overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="border-r border-border px-3 py-2 text-xs font-semibold text-muted-foreground last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>

          {loadingMonth ? (
            <div className="p-4 text-sm text-muted-foreground">Loading month…</div>
          ) : (
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const inMonth = isSameMonth(day, monthDate);
                const key = format(day, "yyyy-MM-dd");
                const count = countsByDay[key] ?? 0;
                const isSelected = key === selectedKey;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDay(day);
                      loadDayWorkouts(day);
                    }}
                    className={[
                      "min-h-[92px] border-b border-r border-border p-3 text-left transition-colors",
                      "hover:bg-muted",
                      isSelected ? "bg-accent" : "bg-card",
                      inMonth ? "" : "opacity-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold">{format(day, "d")}</div>
                      {count > 0 && (
                        <div className="rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                          {count}
                        </div>
                      )}
                    </div>

                    {count > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <span key={i} className="h-2 w-2 rounded-full bg-primary" />
                        ))}
                        {count > 3 && (
                          <span className="text-xs text-muted-foreground">+{count - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DayPanel
          selectedDay={selectedDay}
          loadingDay={loadingDay}
          workoutsForDay={workoutsForDay}
        />
      </div>

      {/* MOBILE: Day panel below */}
      <div className="md:hidden">
        <DayPanel
          selectedDay={selectedDay}
          loadingDay={loadingDay}
          workoutsForDay={workoutsForDay}
        />
      </div>
    </div>
  );
}

function DayPanel({
  selectedDay,
  loadingDay,
  workoutsForDay,
}: {
  selectedDay: Date;
  loadingDay: boolean;
  workoutsForDay: WorkoutRow[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">{format(selectedDay, "PPP")}</h2>

      <div className="mt-3">
        {loadingDay && <div className="text-sm text-muted-foreground">Loading workouts…</div>}

        {!loadingDay && workoutsForDay.length === 0 && (
          <div className="text-sm text-muted-foreground">No completed workouts logged.</div>
        )}

        {!loadingDay && workoutsForDay.length > 0 && (
          <ul className="space-y-3">
            {workoutsForDay.map((w) => {
              const duration =
                w.duration_seconds && w.duration_seconds > 0
                  ? formatDuration(w.duration_seconds)
                  : null;

              return (
                <li key={w.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="font-semibold">
                    {w.name ?? "Workout"}
                    {w.status ? (
                      <span className="ml-2 font-normal text-muted-foreground">({w.status})</span>
                    ) : null}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {w.started_at ? (
                      <span>Started {format(new Date(w.started_at), "p")}</span>
                    ) : (
                      <span>Started —</span>
                    )}
                    {" · "}
                    {w.completed_at ? (
                      <span>Completed {format(new Date(w.completed_at), "p")}</span>
                    ) : (
                      <span>Completed —</span>
                    )}
                    {duration ? <span>{" · "}{duration}</span> : null}
                  </div>

                  {w.notes ? <div className="mt-2 text-sm">{w.notes}</div> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isSameDay(selectedDay, new Date()) && (
        <div className="mt-4 text-xs text-muted-foreground">You’re viewing today.</div>
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}