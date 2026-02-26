import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../adapt/route";

vi.mock("@/lib/exercises/fetch-available", () => ({
  fetchAvailableExercises: vi.fn(),
}));

vi.mock("@/lib/workouts/fetch-recent-logs", () => ({
  fetchRecentWorkoutLogs: vi.fn(),
}));

import { fetchAvailableExercises } from "@/lib/exercises/fetch-available";
import { fetchRecentWorkoutLogs } from "@/lib/workouts/fetch-recent-logs";

const mockFetchExercises = vi.mocked(fetchAvailableExercises);
const mockFetchLogs = vi.mocked(fetchRecentWorkoutLogs);

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3001/api/plans/adapt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plans/adapt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  it("enriches request with exercises and workout logs, then proxies", async () => {
    const exercises = [{ rowid: 1, name: "Squat", category: "legs" }];
    const logs = [
      {
        date: "2026-02-15",
        duration_minutes: 45,
        exercises: [{ name: "Squat", sets: [{ weight_kg: 80, reps: 8, rpe: 7 }] }],
      },
    ];

    mockFetchExercises.mockResolvedValue({ exercises });
    mockFetchLogs.mockResolvedValue({ logs });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ routine: { name: "Adapted Routine" } }),
    });

    const body = {
      userId: "user-1",
      profile: { goal: "hypertrophy", experience: "intermediate", equipment: ["full_gym"] },
      currentRoutine: { name: "Old Routine", exercises: [] },
      routineId: "routine-abc",
      feedback: "Make it harder",
    };

    const res = await POST(createRequest(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.routine.name).toBe("Adapted Routine");

    // Verify workout logs fetched with routineId
    expect(mockFetchLogs).toHaveBeenCalledWith("routine-abc");

    // Verify proxy body
    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.available_exercises).toEqual(exercises);
    expect(proxyBody.recentLogs).toEqual(logs);
    expect(proxyBody.currentRoutine).toEqual({ name: "Old Routine", exercises: [] });
    expect(proxyBody.feedback).toBe("Make it harder");
  });

  it("falls back to body.recentLogs when fetched logs are empty", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const fallbackLogs = [{ date: "2026-01-01", duration_minutes: 30, exercises: [] }];
    const body = {
      currentRoutine: { name: "R" },
      recentLogs: fallbackLogs,
    };

    await POST(createRequest(body));

    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.recentLogs).toEqual(fallbackLogs);
  });

  it("sends empty recentLogs when no logs found and no fallback", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await POST(createRequest({ currentRoutine: { name: "R" } }));

    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.recentLogs).toEqual([]);
  });

  it("fetches logs without routineId for free-text adapt", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await POST(createRequest({ currentRoutine: { name: "R" }, feedback: "less volume" }));

    expect(mockFetchLogs).toHaveBeenCalledWith(undefined);
  });

  it("returns 500 when exercise fetch fails", async () => {
    mockFetchExercises.mockResolvedValue({
      exercises: [],
      error: "DB error",
    });

    const res = await POST(createRequest({ currentRoutine: {} }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("DB error");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 502 when the Express API is unreachable", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(createRequest({ currentRoutine: {} }));
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("Failed to reach API service");
  });

  it("forwards non-200 status from Express API", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Missing feedback" }),
    });

    const res = await POST(createRequest({ currentRoutine: {} }));
    expect(res.status).toBe(400);
  });

  it("proxies to the correct Express API endpoint", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://api:9000";
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetchLogs.mockResolvedValue({ logs: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await POST(createRequest({ currentRoutine: {} }));

    expect(mockFetch).toHaveBeenCalledWith(
      "http://api:9000/routines/adapt",
      expect.any(Object)
    );
  });
});
