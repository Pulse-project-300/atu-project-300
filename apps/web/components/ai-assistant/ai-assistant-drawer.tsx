"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  RefreshCw,
  BookOpen,
} from "lucide-react";

export interface AIAssistantContext {
  plan?: any;
  profile?: {
    goal?: string;
    experience?: string;
  };
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI workout assistant. I can generate new plans, adapt your existing plan, or explain what your current plan does. Use the quick actions below or type a message.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (err: any) {
      addMessage("assistant", `Sorry, I couldn't generate a plan. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptPlan = async () => {
    if (isLoading) return;
    if (!context?.plan) {
      addMessage("user", "Adapt my current plan");
      addMessage(
        "assistant",
        "I don't have a plan loaded in the current context. Navigate to a page with a plan, or generate one first."
      );
      return;
    }

    addMessage("user", "Adapt my current workout plan");
    setIsLoading(true);

    try {
      const res = await fetch("/api/plans/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current",
          profile: context?.profile || { goal: "strength", experience: "beginner" },
          currentPlan: context.plan,
          recentLogs: [],
          feedback: "Progress the plan to the next level",
          currentVersion: context.plan.version || 1,
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      const planText = formatPlanResponse(data);
      addMessage("assistant", planText);
    } catch (err: any) {
      addMessage("assistant", `Sorry, I couldn't adapt the plan. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainPlan = async () => {
    if (isLoading) return;
    if (!context?.plan) {
      addMessage("user", "Explain my current plan");
      addMessage(
        "assistant",
        "I don't have a plan loaded in the current context. Navigate to a page with a plan, or generate one first."
      );
      return;
    }

    addMessage("user", "Explain my current workout plan");
    setIsLoading(true);

    try {
      const res = await fetch("/api/plans/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: context.plan,
          profile: context?.profile,
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      addMessage("assistant", data.explanation || JSON.stringify(data));
    } catch (err: any) {
      addMessage("assistant", `Sorry, I couldn't explain the plan. ${err.message}`);
    } finally {
      setIsLoading(false);
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
        if (!context?.plan) {
          addMessage("assistant", "I don't have a plan loaded to adapt. Try generating one first.");
        } else {
          const res = await fetch("/api/plans/adapt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: "current",
              profile: context?.profile || { goal: "strength", experience: "beginner" },
              currentPlan: context.plan,
              recentLogs: [],
              feedback: trimmed,
              currentVersion: context.plan.version || 1,
            }),
          });
          if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
          const data = await res.json();
          addMessage("assistant", formatPlanResponse(data));
        }
      } else if (lower.includes("explain") || lower.includes("why") || lower.includes("what does")) {
        if (!context?.plan) {
          addMessage("assistant", "I don't have a plan loaded to explain. Try generating one first.");
        } else {
          const res = await fetch("/api/plans/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: context.plan,
              profile: context?.profile,
            }),
          });
          if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
          const data = await res.json();
          addMessage("assistant", data.explanation || JSON.stringify(data));
        }
      } else {
        // Fallback: try explain endpoint as a general question about the plan
        if (context?.plan) {
          const res = await fetch("/api/plans/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: context.plan,
              profile: context?.profile,
              question: trimmed,
            }),
          });
          if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
          const data = await res.json();
          addMessage("assistant", data.explanation || JSON.stringify(data));
        } else {
          addMessage(
            "assistant",
            "I can help you generate a new plan, adapt an existing one, or explain a plan. Try the quick actions above, or ask me something specific!"
          );
        }
      }
    } catch (err: any) {
      addMessage("assistant", `Something went wrong. ${err.message}`);
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

function formatPlanResponse(data: any): string {
  if (data.explanation) return data.explanation;

  // Format a plan object into readable text
  const plan = data.plan || data;
  if (plan.days && Array.isArray(plan.days)) {
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
