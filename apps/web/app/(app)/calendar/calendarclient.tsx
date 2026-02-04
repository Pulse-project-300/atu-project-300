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

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

const btnStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
};

export default function CalendarClient() {
  const tz = useMemo(getUserTimeZone, []);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  const [countsByDay, setCountsByDay] = useState<Record<string, number>>({});
  const [workoutsForDay, setWorkoutsForDay] = useState<WorkoutRow[]>([]);

  // Month grid
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = useMemo(() => eachDay(gridStart, gridEnd), [gridStart, gridEnd]);

  const selectedKey = selectedDay
    ? format(
        new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate()),
        "yyyy-MM-dd"
      )
    : null;

  async function loadMonthCounts(nextMonthDate: Date) {
    setLoadingMonth(true);
    setCountsByDay({});

    const month = format(nextMonthDate, "yyyy-MM"); // e.g. "2026-02"

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

    const res = await fetch(
      `/api/calendar/day?day=${dayKey}&tz=${encodeURIComponent(tz)}`,
      { method: "GET", cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Failed to load day workouts");
      setLoadingDay(false);
      return;
    }

    const json = (await res.json()) as { workouts: WorkoutRow[] };
    setWorkoutsForDay(json.workouts ?? []);
    setLoadingDay(false);
  }

  // initial load + month changes
  useEffect(() => {
    loadMonthCounts(monthDate);
    // also load selected day (defaults to today)
    if (selectedDay) loadDayWorkouts(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMonthCounts(monthDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  return (
    <div>
      <Header
        monthDate={monthDate}
        onPrev={() => setMonthDate((d) => subMonths(d, 1))}
        onNext={() => setMonthDate((d) => addMonths(d, 1))}
        onToday={() => {
          const today = new Date();
          setMonthDate(today);
          setSelectedDay(today);
          loadDayWorkouts(today);
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Calendar */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <WeekdayRow />

          {loadingMonth ? (
            <div style={{ padding: 16 }}>Loading month…</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              {days.map((day) => {
                const inMonth = isSameMonth(day, monthDate);
                const key = format(day, "yyyy-MM-dd");
                const count = countsByDay[key] ?? 0;
                const isSelected = selectedKey ? key === selectedKey : false;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDay(day);
                      loadDayWorkouts(day);
                    }}
                    style={{
                      minHeight: 88,
                      padding: 10,
                      textAlign: "left",
                      border: "none",
                      borderRight: "1px solid #e5e7eb",
                      borderBottom: "1px solid #e5e7eb",
                      background: isSelected ? "#eef2ff" : "white",
                      opacity: inMonth ? 1 : 0.45,
                      cursor: "pointer",
                    }}
                    aria-label={`Open workouts for ${format(day, "PPP")}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 600 }}>{format(day, "d")}</div>

                      {count > 0 && (
                        <div
                          title={`${count} workout${count === 1 ? "" : "s"} completed`}
                          style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 999,
                            border: "1px solid #d1d5db",
                          }}
                        >
                          {count}
                        </div>
                      )}
                    </div>

                    {count > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: "#111827",
                              display: "inline-block",
                            }}
                          />
                        ))}
                        {count > 3 && (
                          <span style={{ fontSize: 12, color: "#374151" }}>+{count - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Day panel */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>
            {selectedDay ? format(selectedDay, "PPP") : "Select a day"}
          </h2>

          <div style={{ marginTop: 12 }}>
            {selectedDay && loadingDay && <div>Loading workouts…</div>}

            {selectedDay && !loadingDay && workoutsForDay.length === 0 && (
              <div style={{ color: "#6b7280" }}>No completed workouts logged.</div>
            )}

            {!loadingDay && workoutsForDay.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {workoutsForDay.map((w) => {
                  const duration = formatDuration(w.duration_seconds);
                  return (
                    <li key={w.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {w.name ?? "Workout"}
                        {w.status ? (
                          <span style={{ fontWeight: 500, color: "#6b7280", marginLeft: 8 }}>
                            ({w.status})
                          </span>
                        ) : null}
                      </div>

                      <div style={{ color: "#374151", fontSize: 13, marginTop: 4 }}>
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

                      {w.notes ? (
                        <div style={{ marginTop: 6, color: "#374151" }}>{w.notes}</div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selectedDay && isSameDay(selectedDay, new Date()) && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
              You’re viewing today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({
  monthDate,
  onPrev,
  onNext,
  onToday,
}: {
  monthDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <button onClick={onPrev} style={btnStyle}>
        ←
      </button>
      <div style={{ fontWeight: 800, fontSize: 18, minWidth: 220 }}>
        {format(monthDate, "MMMM yyyy")}
      </div>
      <button onClick={onNext} style={btnStyle}>
        →
      </button>
      <div style={{ flex: 1 }} />
      <button onClick={onToday} style={btnStyle}>
        Today
      </button>
    </div>
  );
}

function WeekdayRow() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
      {labels.map((d) => (
        <div
          key={d}
          style={{
            padding: 10,
            fontSize: 12,
            fontWeight: 700,
            color: "#374151",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          {d}
        </div>
      ))}
    </div>
  );
}
