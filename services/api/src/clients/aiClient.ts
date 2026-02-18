import axios from "axios";

const AI_ORCHESTRATOR_URL =
  process.env.AI_ORCHESTRATOR_URL || "http://localhost:8001";

/**
 * POST /routine/generate
 */
export async function generateRoutine(input: {
  userId: string;
  profile: Record<string, any>;
  available_exercises: Record<string, any>[];
  history?: Record<string, any>[];
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/routine/generate`, input, {
    timeout: 30000,
  });
  return data;
}

/**
 * POST /routine/adapt
 */
export async function adaptRoutine(input: {
  userId: string;
  profile: Record<string, any>;
  currentRoutine: Record<string, any>;
  available_exercises: Record<string, any>[];
  recentLogs?: Record<string, any>[];
  feedback?: string;
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/routine/adapt`, input, {
    timeout: 30000,
  });
  return data;
}

/**
 * POST /routine/explain
 */
export async function getRoutineExplanation(input: {
  routine: Record<string, any>;
  userId?: string;
  profile?: Record<string, any>;
}) {
  const { data } = await axios.post(`${AI_ORCHESTRATOR_URL}/routine/explain`, input, {
    timeout: 30000,
  });
  return data;
}
