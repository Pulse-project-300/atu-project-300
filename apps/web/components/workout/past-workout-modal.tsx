"use client";

import { useEffect } from "react";
import { X, Check, Clock, Dumbbell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkoutHistoryDetail } from "@/app/(app)/analytics/actions";

interface PastWorkoutModalProps {
  workout: WorkoutHistoryDetail;
  onClose: () => void;
}

export function PastWorkoutModal({ workout, onClose }: PastWorkoutModalProps) {
  const exerciseGroups = groupSetsByExercise(workout.workout_sets);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const completedSets = workout.workout_sets.filter((s) => s.completed).length;
  const totalSets = workout.workout_sets.length;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{workout.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(workout.completed_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-sm">
                {formatDuration(workout.duration_seconds)}
              </span>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {completedSets}/{totalSets} sets
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {exerciseGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-muted/40 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="font-bold text-lg mb-2">No exercises recorded</h3>
              <p className="text-muted-foreground text-sm">
                This workout has no exercise data.
              </p>
            </div>
          ) : (
            exerciseGroups.map((group) => (
              <ReadOnlyExerciseCard key={group.exercise_name} group={group} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type SetData = WorkoutHistoryDetail["workout_sets"][number];

interface ExerciseGroup {
  exercise_name: string;
  exercise_library_id: string | null;
  sets: SetData[];
  order_index: number;
}

function ReadOnlyExerciseCard({ group }: { group: ExerciseGroup }) {
  const completedCount = group.sets.filter((s) => s.completed).length;

  return (
    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50 bg-card rounded-2xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            {group.exercise_name}
          </CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{group.sets.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {/* Sets Header */}
        <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-3 px-1 mb-3">
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            Set
          </div>
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            kg
          </div>
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            Reps
          </div>
        </div>

        {/* Sets Rows */}
        <div className="flex flex-col gap-2">
          {group.sets.map((set) => (
            <div
              key={set.id}
              className="grid grid-cols-[2.5rem_1fr_1fr] gap-3 items-center"
            >
              {/* Set Number */}
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-lg font-bold text-xs",
                    set.completed
                      ? "bg-primary text-white"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {set.completed ? <Check className="h-4 w-4" /> : set.set_index}
                </div>
              </div>

              {/* Weight Display */}
              <div className="h-11 flex items-center justify-center bg-muted/30 rounded-xl font-bold text-base">
                {set.weight_kg != null ? set.weight_kg : "—"}
              </div>

              {/* Reps Display */}
              <div className="h-11 flex items-center justify-center bg-muted/30 rounded-xl font-bold text-base">
                {set.reps != null ? set.reps : "—"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function groupSetsByExercise(sets: SetData[]): ExerciseGroup[] {
  const groups: Map<string, ExerciseGroup> = new Map();

  const sortedSets = [...sets].sort((a, b) => {
    const aKey = `${a.exercise_name}-${a.set_index}`;
    const bKey = `${b.exercise_name}-${b.set_index}`;
    return aKey.localeCompare(bKey);
  });

  const orderMap: Map<string, number> = new Map();
  let orderIndex = 0;

  for (const set of sortedSets) {
    const key = set.exercise_name;

    if (!groups.has(key)) {
      orderMap.set(key, orderIndex++);
      groups.set(key, {
        exercise_name: set.exercise_name,
        exercise_library_id: set.exercise_library_id,
        sets: [],
        order_index: orderMap.get(key)!,
      });
    }

    groups.get(key)!.sets.push(set);
  }

  for (const group of groups.values()) {
    group.sets.sort((a, b) => a.set_index - b.set_index);
  }

  return Array.from(groups.values()).sort((a, b) => a.order_index - b.order_index);
}
