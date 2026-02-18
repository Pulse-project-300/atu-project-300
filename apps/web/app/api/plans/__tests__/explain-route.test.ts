import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../explain/route";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3001/api/plans/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plans/explain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  it("proxies the request to Express with routine field", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ explanation: "This routine focuses on compound lifts..." }),
    });

    const routine = { name: "Push Pull Legs", exercises: [{ name: "Squat" }] };
    const body = {
      routine,
      profile: { goal: "strength", experience: "advanced" },
    };

    const res = await POST(createRequest(body));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.explanation).toContain("compound lifts");

    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.routine).toEqual(routine);
    expect(proxyBody.profile.goal).toBe("strength");
  });

  it("renames legacy 'plan' field to 'routine'", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ explanation: "ok" }),
    });

    const body = {
      plan: { name: "Legacy Plan", exercises: [] },
      profile: { goal: "fat_loss" },
    };

    await POST(createRequest(body));

    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.routine).toEqual({ name: "Legacy Plan", exercises: [] });
    // Legacy 'plan' field should not be forwarded
    expect(proxyBody.plan).toBeUndefined();
  });

  it("prefers legacy 'plan' over 'routine' when both are present", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ explanation: "ok" }),
    });

    const body = {
      plan: { name: "From Plan" },
      routine: { name: "From Routine" },
    };

    await POST(createRequest(body));

    const proxyBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(proxyBody.routine).toEqual({ name: "From Plan" });
  });

  it("returns 502 when the Express API is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("Connection timeout"));

    const res = await POST(createRequest({ routine: {} }));
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("Failed to reach API service");
    expect(data.error).toContain("Connection timeout");
  });

  it("forwards non-200 status from Express API", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal AI error" }),
    });

    const res = await POST(createRequest({ routine: {} }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal AI error");
  });

  it("proxies to the correct Express API endpoint", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://custom:4000";
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await POST(createRequest({ routine: {} }));

    expect(mockFetch).toHaveBeenCalledWith(
      "http://custom:4000/routines/explain",
      expect.any(Object)
    );
  });
});
