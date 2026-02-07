"use client";

import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";
import { useState } from "react";
import { Dumbbell, Sparkles, Loader2 } from "lucide-react";

// Sample workout plan for demonstration
const SAMPLE_PLAN = {
  version: 1,
  days: [
    { day: "Mon", workout: [{ name: "Squat", sets: 3, reps: 10 }] },
    { day: "Wed", workout: [{ name: "Bench Press", sets: 3, reps: 10 }] },
    { day: "Fri", workout: [{ name: "Deadlift", sets: 3, reps: 5 }] },
  ],
};

export default function Page() {
  const [workoutPlan, setWorkoutPlan] = useState(SAMPLE_PLAN);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplainPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the explain endpoint
      const response = await fetch("/api/plans/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: workoutPlan,
          // Optional: Add user profile for personalized explanations
          profile: {
            goal: "strength",
            experience: "beginner",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.statusText}`);
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err: any) {
      console.error("Error getting plan explanation:", err);
      setError(err.message || "Failed to get plan explanation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights and explanations for your workout plans
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workout Plan Section */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Your Workout Plan</h3>
                  <p className="text-xs text-muted-foreground">
                    Version {workoutPlan.version}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {workoutPlan.days.map((day, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <h4 className="font-semibold text-sm mb-2">{day.day}</h4>
                  <div className="space-y-2">
                    {day.workout.map((exercise, exerciseIdx) => (
                      <div
                        key={exerciseIdx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <button
                onClick={handleExplainPlan}
                disabled={isLoading}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting AI Explanation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Explain This Plan with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Explanation Section */}
          {(explanation || error) && (
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">AI Explanation</h3>
                    <p className="text-xs text-muted-foreground">
                      Powered by GPT-4o-mini
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {error ? (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-sm leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Widget Section */}
        <div className="flex flex-col gap-4">
          <AIChatWidget />
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-lg border bg-muted/20 p-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          About AI-Powered Explanations
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our AI assistant uses advanced language models to analyze your workout
          plans and provide personalized insights. Get detailed explanations about
          exercise selection, programming rationale, and how your plan aligns with
          your fitness goals. The AI considers your profile, experience level, and
          training objectives to deliver tailored guidance.
        </p>
      </div>
    </div>
  );
}
