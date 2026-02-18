"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  RefreshCw,
  BookOpen,
  Save,
} from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface PlanDay {
  day: string;
  workout: Exercise[];
}

interface WorkoutPlan {
  version?: number;
  days: PlanDay[];
}

export interface AIAssistantContext {
  plan?: WorkoutPlan;
  profile?: {
    goal?: string;
    experience?: string;
  };
}

interface RoutineExerciseSummary {
  exercise_name: string;
  order_index: number;
  sets_data: { set_index: number; target_reps: number | null; target_weight_kg: number | null }[] | null;
  rest_seconds: number;
}

interface RoutineSummary {
  id: string;
  name: string;
  description: string | null;
  routine_exercises: RoutineExerciseSummary[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantDrawerProps {
  context?: AIAssistantContext;
}

export function AIAssistantDrawer({ context }: AIAssistantDrawerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your Pulse AI workout assistant. I can generate new plans, adapt your existing plan, or explain what your current plan does. Use the quick actions below or type a message.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedPlan, setLastGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [routinePickerItems, setRoutinePickerItems] = useState<RoutineSummary[]>([]);
  const [pickerMode, setPickerMode] = useState<"adapt" | "explain" | null>(null);
  const [pendingAdaptFeedback, setPendingAdaptFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    const msg: Message = {
      id: `${role}-${Date.now()}`,
      role,
      content,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const handleGeneratePlan = async () => {
    if (isLoading) return;
    addMessage("user", "Generate a new workout plan for me");
    setIsLoading(true);

    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current",
          profile: context?.profile || { goal: "strength", experience: "beginner" },
          history: [],
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const planText = formatPlanResponse(data);
      addMessage("assistant", planText);
      if (data.plan) setLastGeneratedPlan(data.plan);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't generate a plan. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsRoutine = async () => {
    if (!lastGeneratedPlan || isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/plans/save-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: lastGeneratedPlan }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      await res.json();
      addMessage("assistant", "Routine saved successfully! Redirecting to your routines...");
      setLastGeneratedPlan(null);
      router.push("/routines");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't save the routine. ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdaptPlan = async () => {
    if (isLoading) return;
    addMessage("user", "Adapt an existing routine");
    setIsLoading(true);

    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const routines: RoutineSummary[] = data.routines || [];

      if (routines.length === 0) {
        addMessage("assistant", "You don't have any routines yet. Try generating a plan first!");
        setRoutinePickerItems([]);
      } else {
        addMessage("assistant", "Which routine would you like me to adapt? Pick one below:");
        setRoutinePickerItems(routines);
        setPickerMode("adapt");
        setPendingAdaptFeedback("Progress the plan to the next level");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't load your routines. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainPlan = async () => {
    if (isLoading) return;
    addMessage("user", "Explain a routine");
    setIsLoading(true);

    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const routines: RoutineSummary[] = data.routines || [];

      if (routines.length === 0) {
        addMessage("assistant", "You don't have any routines yet. Try generating a plan first!");
        setRoutinePickerItems([]);
      } else {
        addMessage("assistant", "Which routine would you like me to explain? Pick one below:");
        setRoutinePickerItems(routines);
        setPickerMode("explain");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't load your routines. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoutine = async (routine: RoutineSummary) => {
    const mode = pickerMode;
    setRoutinePickerItems([]);
    setPickerMode(null);

    const currentPlan: WorkoutPlan = routineToWorkoutPlan(routine);

    if (mode === "adapt") {
      addMessage("user", `Adapt "${routine.name}"`);
      setIsLoading(true);
      setPendingAdaptFeedback(null);

      try {
        const res = await fetch("/api/plans/adapt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "current",
            profile: context?.profile || { goal: "strength", experience: "beginner" },
            currentPlan,
            recentLogs: [],
            feedback: pendingAdaptFeedback || "Progress the plan to the next level",
            currentVersion: currentPlan.version || 1,
          }),
        });

        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        const planText = formatPlanResponse(data);
        addMessage("assistant", planText);
        if (data.plan) setLastGeneratedPlan(data.plan);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addMessage("assistant", `Sorry, I couldn't adapt the plan. ${message}`);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "explain") {
      addMessage("user", `Explain "${routine.name}"`);
      setIsLoading(true);

      try {
        const res = await fetch("/api/plans/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: currentPlan,
            profile: context?.profile,
          }),
        });

        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        addMessage("assistant", data.explanation || JSON.stringify(data));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addMessage("assistant", `Sorry, I couldn't explain the plan. ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    addMessage("user", trimmed);
    setInput("");
    setIsLoading(true);

    // Detect intent from the message
    const lower = trimmed.toLowerCase();
    try {
      if (lower.includes("generate") || lower.includes("create") || lower.includes("new plan")) {
        const res = await fetch("/api/plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "current",
            profile: context?.profile || { goal: "strength", experience: "beginner" },
            history: [],
          }),
        });
        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        addMessage("assistant", formatPlanResponse(data));
      } else if (lower.includes("adapt") || lower.includes("change") || lower.includes("modify")) {
        // Fetch routines and show picker
        const routinesRes = await fetch("/api/routines");
        if (!routinesRes.ok) throw new Error(`Failed: ${routinesRes.statusText}`);
        const routinesData = await routinesRes.json();
        const routines: RoutineSummary[] = routinesData.routines || [];

        if (routines.length === 0) {
          addMessage("assistant", "You don't have any routines yet. Try generating a plan first!");
        } else {
          addMessage("assistant", "Which routine would you like me to adapt? Pick one below:");
          setRoutinePickerItems(routines);
          setPickerMode("adapt");
          setPendingAdaptFeedback(trimmed);
        }
      } else if (lower.includes("explain") || lower.includes("why") || lower.includes("what does")) {
        // Fetch routines and show picker for explain
        const routinesRes = await fetch("/api/routines");
        if (!routinesRes.ok) throw new Error(`Failed: ${routinesRes.statusText}`);
        const routinesData = await routinesRes.json();
        const routines: RoutineSummary[] = routinesData.routines || [];

        if (routines.length === 0) {
          addMessage("assistant", "You don't have any routines yet. Try generating a plan first!");
        } else {
          addMessage("assistant", "Which routine would you like me to explain? Pick one below:");
          setRoutinePickerItems(routines);
          setPickerMode("explain");
        }
      } else {
        addMessage(
          "assistant",
          "I can help you generate a new plan, adapt an existing one, or explain a plan. Try the quick actions above, or ask me something specific!"
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Something went wrong. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 pr-12">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Generate, adapt, or explain plans
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b p-3">
        <div className="flex gap-2">
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Generate
          </button>
          <button
            onClick={handleAdaptPlan}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Adapt
          </button>
          <button
            onClick={handleExplainPlan}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Explain
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="rounded-full bg-primary/10 p-1.5 h-fit shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            )}
            <div
              className={`rounded-lg p-3 max-w-[85%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {routinePickerItems.length > 0 && !isLoading && (
          <div className="space-y-2 px-2">
            {routinePickerItems.map((routine) => (
              <button
                key={routine.id}
                onClick={() => handleSelectRoutine(routine)}
                className="w-full text-left rounded-lg border bg-background p-3 hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium">{routine.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {routine.routine_exercises.length} exercise{routine.routine_exercises.length !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        )}

        {lastGeneratedPlan && !isLoading && (
          <div className="flex justify-center">
            <button
              onClick={handleSaveAsRoutine}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save as Routine"}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/10 p-1.5 h-fit shrink-0">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about your plan..."
            disabled={isLoading}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-primary px-3 py-2 text-white shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function routineToWorkoutPlan(routine: RoutineSummary): WorkoutPlan {
  // Group exercises by day prefix (e.g. "Mon - Squat" → day "Mon")
  // If no day prefix, group all under "Workout"
  const dayMap = new Map<string, Exercise[]>();

  for (const ex of routine.routine_exercises) {
    const dashIndex = ex.exercise_name.indexOf(" - ");
    let dayLabel: string;
    let exerciseName: string;

    if (dashIndex > -1) {
      dayLabel = ex.exercise_name.substring(0, dashIndex);
      exerciseName = ex.exercise_name.substring(dashIndex + 3);
    } else {
      dayLabel = "Workout";
      exerciseName = ex.exercise_name;
    }

    const sets = ex.sets_data?.length || 1;
    const reps = ex.sets_data?.[0]?.target_reps || 10;

    if (!dayMap.has(dayLabel)) dayMap.set(dayLabel, []);
    dayMap.get(dayLabel)!.push({ name: exerciseName, sets, reps });
  }

  const days: PlanDay[] = Array.from(dayMap.entries()).map(([day, workout]) => ({
    day,
    workout,
  }));

  return { version: 1, days };
}

function formatPlanResponse(data: { plan?: WorkoutPlan; explanation?: string }): string {
  if (data.explanation) return data.explanation;

  // Format a plan object into readable text
  const plan = data.plan;
  if (plan?.days && Array.isArray(plan.days)) {
    let text = `Here's your workout plan (v${plan.version || 1}):\n\n`;
    for (const day of plan.days) {
      text += `${day.day}:\n`;
      if (day.workout && Array.isArray(day.workout)) {
        for (const ex of day.workout) {
          text += `  - ${ex.name}: ${ex.sets} sets x ${ex.reps} reps\n`;
        }
      }
      text += "\n";
    }
    return text.trim();
  }

  return JSON.stringify(data, null, 2);
}
