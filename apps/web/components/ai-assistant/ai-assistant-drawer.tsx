"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  RefreshCw,
  BookOpen,
  Save,
} from "lucide-react";
import { RoutineExerciseCard } from "./routine-exercise-card";

interface GeneratedRoutineExercise {
  exercise_name: string;
  exercise_library_id?: string;
  sets_data: { set_index: number; target_reps: number | null; target_weight_kg: number | null }[];
  rest_seconds: number;
  order_index: number;
  notes?: string;
}

interface GeneratedRoutine {
  name: string;
  description?: string;
  exercises: GeneratedRoutineExercise[];
}

export interface AIAssistantContext {
  profile?: {
    goal?: string;
    experience?: string;
    equipment?: string[];
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
        "Hi! I'm your Pulse AI workout assistant. I can generate new routines, adapt your existing routines, or explain what a routine does. Use the quick actions below or type a message.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedRoutine, setLastGeneratedRoutine] = useState<GeneratedRoutine | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [routinePickerItems, setRoutinePickerItems] = useState<RoutineSummary[]>([]);
  const [pickerMode, setPickerMode] = useState<"adapt" | "explain" | null>(null);
  const [pendingAdaptFeedback, setPendingAdaptFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user profile from Supabase on mount
  const [userProfile, setUserProfile] = useState<AIAssistantContext["profile"] | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("fitness_goal, experience_level, equipment")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setUserProfile({
          goal: data.fitness_goal,
          experience: data.experience_level,
          equipment: data.equipment,
        });
      }
    };
    fetchProfile();
  }, []);

  const profileForApi = useCallback(() => {
    return context?.profile || userProfile || { goal: "strength", experience: "beginner" };
  }, [context?.profile, userProfile]);

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

  const handleUpdateExercise = (orderIndex: number, updated: GeneratedRoutineExercise) => {
    if (!lastGeneratedRoutine) return;
    setLastGeneratedRoutine({
      ...lastGeneratedRoutine,
      exercises: lastGeneratedRoutine.exercises.map((ex) =>
        ex.order_index === orderIndex ? updated : ex
      ),
    });
  };

  const handleGenerateRoutine = async () => {
    if (isLoading) return;
    addMessage("user", "Generate a new workout routine for me");
    setIsLoading(true);

    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current",
          profile: profileForApi(),
          history: [],
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const text = formatRoutineResponse(data);
      addMessage("assistant", text);
      if (data.routine) setLastGeneratedRoutine(data.routine);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't generate a routine. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsRoutine = async () => {
    if (!lastGeneratedRoutine || isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/plans/save-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routine: lastGeneratedRoutine }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      await res.json();
      addMessage("assistant", "Routine saved successfully! Redirecting to your routines...");
      setLastGeneratedRoutine(null);
      router.push("/routines");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't save the routine. ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdaptRoutine = async () => {
    if (isLoading) return;
    addMessage("user", "Adapt an existing routine");
    setIsLoading(true);

    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const routines: RoutineSummary[] = data.routines || [];

      if (routines.length === 0) {
        addMessage("assistant", "You don't have any routines yet. Try generating one first!");
        setRoutinePickerItems([]);
      } else {
        addMessage("assistant", "Which routine would you like me to adapt? Pick one below:");
        setRoutinePickerItems(routines);
        setPickerMode("adapt");
        setPendingAdaptFeedback("Progress the routine to the next level");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Sorry, I couldn't load your routines. ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainRoutine = async () => {
    if (isLoading) return;
    addMessage("user", "Explain a routine");
    setIsLoading(true);

    try {
      const res = await fetch("/api/routines");
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const routines: RoutineSummary[] = data.routines || [];

      if (routines.length === 0) {
        addMessage("assistant", "You don't have any routines yet. Try generating one first!");
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

    // Convert DB routine to the flat format the API expects
    const routineData = routineSummaryToRoutineData(routine);

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
            profile: profileForApi(),
            currentRoutine: routineData,
            routineId: routine.id,
            feedback: pendingAdaptFeedback || "Progress the routine to the next level",
          }),
        });

        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        const text = formatRoutineResponse(data);
        addMessage("assistant", text);
        if (data.routine) setLastGeneratedRoutine(data.routine);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addMessage("assistant", `Sorry, I couldn't adapt the routine. ${message}`);
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
            routine: routineData,
            profile: profileForApi(),
          }),
        });

        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        addMessage("assistant", data.explanation || JSON.stringify(data));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        addMessage("assistant", `Sorry, I couldn't explain the routine. ${message}`);
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

    const lower = trimmed.toLowerCase();
    const isAdaptIntent = lower.includes("adapt") || lower.includes("change") || lower.includes("modify") || lower.includes("replace") || lower.includes("swap") || lower.includes("remove") || lower.includes("switch") || lower.includes("add");
    try {
      if (lower.includes("generate") || lower.includes("create") || lower.includes("new routine") || lower.includes("new workout")) {
        const res = await fetch("/api/plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "current",
            profile: profileForApi(),
            history: [],
          }),
        });
        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        addMessage("assistant", formatRoutineResponse(data));
        if (data.routine) setLastGeneratedRoutine(data.routine);
      } else if (lastGeneratedRoutine && (isAdaptIntent || !lower.includes("explain"))) {
        // If we have a recent routine, treat the message as feedback to refine it
        const res = await fetch("/api/plans/adapt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "current",
            profile: profileForApi(),
            currentRoutine: lastGeneratedRoutine,
            feedback: trimmed,
          }),
        });
        if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
        const data = await res.json();
        addMessage("assistant", formatRoutineResponse(data));
        if (data.routine) setLastGeneratedRoutine(data.routine);
      } else if (isAdaptIntent) {
        const routinesRes = await fetch("/api/routines");
        if (!routinesRes.ok) throw new Error(`Failed: ${routinesRes.statusText}`);
        const routinesData = await routinesRes.json();
        const routines: RoutineSummary[] = routinesData.routines || [];

        if (routines.length === 0) {
          addMessage("assistant", "You don't have any routines yet. Try generating one first!");
        } else {
          addMessage("assistant", "Which routine would you like me to adapt? Pick one below:");
          setRoutinePickerItems(routines);
          setPickerMode("adapt");
          setPendingAdaptFeedback(trimmed);
        }
      } else if (lower.includes("explain") || lower.includes("why") || lower.includes("what does")) {
        const routinesRes = await fetch("/api/routines");
        if (!routinesRes.ok) throw new Error(`Failed: ${routinesRes.statusText}`);
        const routinesData = await routinesRes.json();
        const routines: RoutineSummary[] = routinesData.routines || [];

        if (routines.length === 0) {
          addMessage("assistant", "You don't have any routines yet. Try generating one first!");
        } else {
          addMessage("assistant", "Which routine would you like me to explain? Pick one below:");
          setRoutinePickerItems(routines);
          setPickerMode("explain");
        }
      } else {
        addMessage(
          "assistant",
          "I can help you generate a new routine, adapt an existing one, or explain a routine. Try the quick actions above, or ask me something specific!"
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
              Generate, adapt, or explain routines
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b p-3">
        <div className="flex gap-2">
          <button
            onClick={handleGenerateRoutine}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Generate
          </button>
          <button
            onClick={handleAdaptRoutine}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Adapt
          </button>
          <button
            onClick={handleExplainRoutine}
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

        {lastGeneratedRoutine && !isLoading && (
          <div className="space-y-3 px-1">
            {lastGeneratedRoutine.exercises.map((ex) => (
              <RoutineExerciseCard
                key={ex.order_index}
                exercise={ex}
                onChange={(updated) => handleUpdateExercise(ex.order_index, updated)}
              />
            ))}
            <div className="flex justify-center pt-1">
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
            placeholder="Ask about your routine..."
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

function routineSummaryToRoutineData(routine: RoutineSummary): GeneratedRoutine {
  return {
    name: routine.name,
    description: routine.description || undefined,
    exercises: routine.routine_exercises.map((ex) => ({
      exercise_name: ex.exercise_name,
      sets_data: ex.sets_data || [{ set_index: 1, target_reps: 10, target_weight_kg: null }],
      rest_seconds: ex.rest_seconds,
      order_index: ex.order_index,
    })),
  };
}

function formatRoutineResponse(data: { routine?: GeneratedRoutine; explanation?: string }): string {
  if (data.explanation) return data.explanation;

  const routine = data.routine;
  if (routine?.exercises && Array.isArray(routine.exercises)) {
    let text = `Here's your workout routine: "${routine.name}"`;
    if (routine.description) text += `\n${routine.description}`;
    text += `\n\n${routine.exercises.length} exercises — edit details below, then save when ready.`;
    return text;
  }

  return JSON.stringify(data, null, 2);
}
