import { Router, Request, Response } from "express";
import { z } from "zod";
import { generatePlan, adaptPlan, getPlanExplanation } from "../clients/aiClient.js";

const router: Router = Router();

// Validation schemas
const GenerateSchema = z.object({
  userId: z.string(),
  profile: z.record(z.any()),
  history: z.array(z.record(z.any())).optional(),
});

const AdaptSchema = z.object({
  userId: z.string(),
  profile: z.record(z.any()),
  currentPlan: z.record(z.any()),
  recentLogs: z.array(z.record(z.any())).optional(),
  feedback: z.string().optional(),
  currentVersion: z.number().optional(),
});

const ExplainSchema = z.object({
  plan: z.record(z.any()),
  userId: z.string().optional(),
  profile: z.record(z.any()).optional(),
});

// POST /plans/generate
router.post("/generate", async (req: Request, res: Response) => {
  let input;
  try {
    input = GenerateSchema.parse(req.body);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request body" });
    return;
  }
  try {
    const data = await generatePlan(input);
    res.json(data);
  } catch (err: unknown) {
    console.error("Error in /plans/generate:", err);
    const message = err instanceof Error ? err.message : "AI service error";
    res.status(502).json({ error: `AI service failed: ${message}` });
  }
});

// POST /plans/adapt
router.post("/adapt", async (req: Request, res: Response) => {
  let input;
  try {
    input = AdaptSchema.parse(req.body);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request body" });
    return;
  }
  try {
    const data = await adaptPlan(input);
    res.json(data);
  } catch (err: unknown) {
    console.error("Error in /plans/adapt:", err);
    const message = err instanceof Error ? err.message : "AI service error";
    res.status(502).json({ error: `AI service failed: ${message}` });
  }
});

// POST /plans/explain
router.post("/explain", async (req: Request, res: Response) => {
  let input;
  try {
    input = ExplainSchema.parse(req.body);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request body" });
    return;
  }
  try {
    const data = await getPlanExplanation(input);
    res.json(data);
  } catch (err: unknown) {
    console.error("Error in /plans/explain:", err);
    const message = err instanceof Error ? err.message : "AI service error";
    res.status(502).json({ error: `AI service failed: ${message}` });
  }
});

export default router;
