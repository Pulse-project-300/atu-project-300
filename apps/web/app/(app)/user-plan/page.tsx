"use client";

import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";
import { useState, useEffect } from "react";
import { Dumbbell, Sparkles, Loader2, Wand2 } from "lucide-react";
import { getActiveWorkoutPlan, getUserProfile } from "@/app/(onboarding)/onboarding/plan-actions";
import { saveWorkoutPlan } from "@/app/(onboarding)/onboarding/plan-actions";

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
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingPlan, setIsFetchingPlan] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's saved workout plan and profile on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both plan and profile in parallel
        const [planResult, profileResult] = await Promise.all([
          getActiveWorkoutPlan(),
          getUserProfile()
        ]);

        // Set user profile
        if (profileResult.profile) {
          setUserProfile(profileResult.profile);
        }

        // Set workout plan
        if (planResult.plan?.plan_data) {
          setWorkoutPlan(planResult.plan.plan_data);
        } else {
          // If no saved plan, use sample plan
          setWorkoutPlan(SAMPLE_PLAN);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setWorkoutPlan(SAMPLE_PLAN);
      } finally {
        setIsFetchingPlan(false);
      }
    }
    fetchData();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    setExplanation(null);

    try {
      // Build profile from user's onboarding data
      const profile = userProfile ? {
        goal: userProfile.fitness_goal || "general fitness",
        experience: userProfile.experience_level || "beginner",
        equipment: userProfile.equipment || [],
        dob: userProfile.dob,
        gender: userProfile.gender,
        height_cm: userProfile.height_cm,
        weight_kg: userProfile.weight_kg,
      } : {
        // Fallback to defaults if no profile exists
        goal: "general fitness",
        experience: "beginner",
        equipment: ["bodyweight_only"],
      };

      // Call the generate endpoint with user's actual profile
      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          profile: profile,
          history: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate plan: ${response.statusText}`);
      }

      const data = await response.json();
      setWorkoutPlan(data.plan);

      // Save the newly generated plan to the database
      const savePlanResult = await saveWorkoutPlan(data.plan);
      if (savePlanResult.error) {
        console.error("Error saving plan:", savePlanResult.error);
        // Don't show error to user, plan is still generated
      }
    } catch (err: any) {
      console.error("Error generating plan:", err);
      setError(err.message || "Failed to generate workout plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplainPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build profile context for personalized explanations
      const profileContext = userProfile ? {
        goal: userProfile.fitness_goal || "general fitness",
        experience: userProfile.experience_level || "beginner",
        equipment: userProfile.equipment || [],
      } : undefined;

      // Call the explain endpoint
      const response = await fetch("/api/plans/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: workoutPlan,
          profile: profileContext,
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

  // Show loading state while fetching initial plan
  if (isFetchingPlan) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-muted-foreground">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Workout Plan
          </h1>
          <p className="text-muted-foreground">
            AI-powered personalized training program
          </p>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="shrink-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate New Plan
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workout Plan Section */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-2">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Your Workout Plan</h3>
                  <p className="text-xs text-muted-foreground">
                    Version {workoutPlan.version}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                    <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Generating your personalized workout plan...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Powered by GPT-4o
                    </p>
                  </div>
                </div>
              ) : (
                workoutPlan?.days?.map((day: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border bg-gradient-to-r from-purple-500/5 to-pink-500/5 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {day.day}
                      </span>
                    </div>
                    <h4 className="font-semibold text-base">{day.day}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {day.workout?.map((exercise: any, exerciseIdx: number) => (
                      <div
                        key={exerciseIdx}
                        className="flex items-center justify-between text-sm bg-white/50 dark:bg-slate-800/50 rounded-md p-3 border"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                          <span className="font-medium">{exercise.name}</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="border-t p-4">
              <button
                onClick={handleExplainPlan}
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                    <Sparkles className="h-4 w-4 text-white" />
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
                  <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4">
                    <p className="text-sm leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Widget Section */}
        <div className="flex flex-col gap-4">
          <AIChatWidget workoutPlan={workoutPlan} />
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-lg border bg-gradient-to-r from-purple-500/5 to-pink-500/5 p-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          About Your Personalized Plan
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This workout plan was generated based on your profile information from onboarding,
          including your fitness goals, experience level, and available equipment.
          Click "Generate New Plan" to create a fresh customized training program,
          or use "Explain This Plan" to get an in-depth AI analysis of the programming
          rationale, exercise selection, and how it aligns with your fitness objectives.
          All powered by GPT-4o for the highest quality recommendations.
        </p>
      </div>
    </div>
  );
}
