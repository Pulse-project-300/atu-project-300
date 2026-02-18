import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../generate/route";

// Mock fetchAvailableExercises
vi.mock("@/lib/exercises/fetch-available", () => ({
  fetchAvailableExercises: vi.fn(),
}));

import { fetchAvailableExercises } from "@/lib/exercises/fetch-available";
const mockFetchExercises = vi.mocked(fetchAvailableExercises);

// Mock global fetch for the Express API proxy
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3001/api/plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plans/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  it("enriches the request with available exercises and proxies to Express", async () => {
    const exercises = [
      { rowid: 1, name: "Squat", category: "legs" },
      { rowid: 2, name: "Bench Press", category: "chest" },
    ];
    mockFetchExercises.mockResolvedValue({ exercises });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ routine: { name: "Test Routine", exercises: [] } }),
    });

    const body = {
      userId: "user-1",
      profile: { goal: "strength", experience: "intermediate", equipment: ["dumbbells"] },
    };
    const res = await POST(createRequest(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.routine.name).toBe("Test Routine");

    // Verify exercises were fetched with profile equipment
    expect(mockFetchExercises).toHaveBeenCalledWith(["dumbbells"]);

    // Verify proxy call includes available_exercises
    expect(mockFetch).toHaveBeenCalledOnce();
    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.available_exercises).toEqual(exercises);
    expect(proxyBody.userId).toBe("user-1");
    expect(proxyBody.profile.goal).toBe("strength");
  });

  it("returns 500 when exercise fetch fails", async () => {
    mockFetchExercises.mockResolvedValue({
      exercises: [],
      error: "Failed to fetch exercises: connection refused",
    });

    const res = await POST(createRequest({ profile: {} }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Failed to fetch exercises");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("forwards the Express API status code on non-200 responses", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: "Invalid profile" }),
    });

    const res = await POST(createRequest({ profile: {} }));
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.error).toBe("Invalid profile");
  });

  it("returns 502 when the Express API is unreachable", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(createRequest({ profile: {} }));
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("Failed to reach API service");
    expect(data.error).toContain("ECONNREFUSED");
  });

  it("calls exercises with undefined when no equipment in profile", async () => {
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ routine: null }),
    });

    await POST(createRequest({ userId: "u1" }));

    expect(mockFetchExercises).toHaveBeenCalledWith(undefined);
  });

  it("proxies to the correct Express API URL", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://custom-api:9000";
    mockFetchExercises.mockResolvedValue({ exercises: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await POST(createRequest({ profile: {} }));

    expect(mockFetch).toHaveBeenCalledWith(
      "http://custom-api:9000/routines/generate",
      expect.any(Object)
    );
  });
});
