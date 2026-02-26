"use client";

import { useEffect, useState } from "react";
import { Clock, Dumbbell, ChevronRight } from "lucide-react";
import {
  getWorkoutHistory,
  getWorkoutDetail,
  type WorkoutHistoryItem,
  type WorkoutHistoryDetail,
} from "@/app/(app)/analytics/actions";
import { PastWorkoutModal } from "@/components/workout/past-workout-modal";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryDetail | null>(null);
  const [loadingWorkoutId, setLoadingWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    getWorkoutHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  const handleWorkoutClick = async (workoutId: string) => {
    setLoadingWorkoutId(workoutId);
    try {
      const detail = await getWorkoutDetail(workoutId);
      if (detail) {
        setSelectedWorkout(detail);
      }
    } catch (err) {
      console.error("Failed to load workout details:", err);
    } finally {
      setLoadingWorkoutId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Recent Workouts</h3>
          <p className="text-sm text-muted-foreground">
            Your last 10 completed workouts
          </p>
        </div>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-muted-foreground/10 rounded" />
                <div className="h-3 w-24 bg-muted-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Recent Workouts</h3>
          <p className="text-sm text-muted-foreground">
            Your last 10 completed workouts
          </p>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No workouts yet
            </p>
            <p className="text-xs text-muted-foreground">
              Complete a workout to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((workout) => (
              <button
                key={workout.id}
                onClick={() => handleWorkoutClick(workout.id)}
                disabled={loadingWorkoutId === workout.id}
                className="w-full group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50 text-left disabled:opacity-70"
              >
                <div className="rounded-full bg-primary/10 p-2.5">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{workout.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? "s" : ""} · {workout.totalSets} set{workout.totalSets !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {timeAgo(workout.completedAt)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Clock className="h-3 w-3" />
                    <span>{workout.durationMinutes}m</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedWorkout && (
        <PastWorkoutModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </>
  );
}
