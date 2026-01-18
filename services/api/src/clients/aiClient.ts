import axios from "axios"; // HTTP client

// AI Orchestrator service URL from env or default to localhost

const AI_ORCHESTRATOR_URL =
  process.env.AI_ORCHESTRATOR_URL || "http://localhost:8001";

/**
 * POST /plan/generate
 */
export async function generatePlan(input: {
  userId: string;
  profile: Record<string, any>;
  history?: Record<string, any>[];
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/plan/generate`, input, {
    timeout: 15000,
  });
  return data;
}

/**
 * POST /plan/adapt
 */
export async function adaptPlan(input: {
  userId: string;
  profile: Record<string, any>;
  currentPlan: Record<string, any>;
  recentLogs?: Record<string, any>[];
  feedback?: string;
  currentVersion?: number;
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/plan/adapt`, input, {
    timeout: 15000,
  });
  return data;
}

/**
 * POST /plan/explain
 * Generate an AI-powered explanation of a workout plan
 */
export async function getPlanExplanation(input: {
  plan: Record<string, any>;
  userId?: string;
  profile?: Record<string, any>;
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/plan/explain`, input, {
    timeout: 15000,
  });
  return data;
}

/**
 * POST /plan/chat
 * Engage in a chat conversation about the workout plan
 */
export async function chatAboutPlan(input: {
  userId: string;
  messages: { role: "user" | "assistant"; content: string }[];
  planContext?: Record<string, any>;
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/plan/chat`, input, {
    timeout: 15000,
  });
  return data;
} 
