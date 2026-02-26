"use client";

import { useState } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Check,
  Plus,
  Clock,
  Dumbbell,
  ChevronUp,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useWorkout } from "./workout-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/lib/types/routines";

export function WorkoutModal() {
  const {
    activeWorkout,
    isExpanded,
    isLoading,
    exerciseGroups,
    completeSet,
    updateSet,
    addSet,
    deleteSet,
    finishWorkout,
    cancelWorkout,
    expand,
    minimize,
  } = useWorkout();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  if (!activeWorkout) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedSets = activeWorkout.sets.filter((s) => s.completed).length;
  const totalSets = activeWorkout.sets.length;

  // Get current exercise (first incomplete set's exercise)
  const currentExercise = exerciseGroups.find((g) =>
    g.sets.some((s) => !s.completed)
  )?.exercise_name || exerciseGroups[0]?.exercise_name || "Workout";

  // Minimized View
  if (!isExpanded) {
    return (
      <div
        onClick={expand}
        className="fixed bottom-0 left-0 right-0 z-50 cursor-pointer"
      >
        <div className="mx-4 mb-4 bg-card border rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm line-clamp-1">{currentExercise}</span>
              <span className="text-xs text-muted-foreground">
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-sm">
                {formatTime(activeWorkout.elapsedSeconds)}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                expand();
              }}
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded View
  return (
    <div data-testid="workout-modal" className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={minimize}
              aria-label="Minimize workout"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{activeWorkout.workout.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono font-medium">
                  {formatTime(activeWorkout.elapsedSeconds)}
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span>
                  {completedSets}/{totalSets} sets
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showCancelConfirm ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                <span className="text-sm text-muted-foreground">Cancel?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    cancelWorkout();
                    setShowCancelConfirm(false);
                  }}
                  disabled={isLoading}
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  No
                </Button>
              </div>
            ) : showFinishConfirm ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                <span className="text-sm text-muted-foreground">Finish?</span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    finishWorkout();
                    setShowFinishConfirm(false);
                  }}
                  disabled={isLoading}
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowFinishConfirm(false)}
                >
                  No
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 font-bold"
                  onClick={() => setShowFinishConfirm(true)}
                >
                  Finish
                </Button>
              </>
            )}
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
              <h3 className="font-bold text-lg mb-2">No exercises found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                This routine may not have any exercises, or they weren&apos;t loaded properly.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Debug: {activeWorkout.sets.length} sets in state
              </p>
            </div>
          ) : (
            exerciseGroups.map((group) => (
            <ExerciseCard
              key={group.exercise_name}
              group={group}
              onCompleteSet={completeSet}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onDeleteSet={deleteSet}
            />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  group: {
    exercise_name: string;
    exercise_library_id: string | null;
    sets: WorkoutSet[];
  };
  onCompleteSet: (setId: string, weight_kg?: number, reps?: number) => Promise<void>;
  onUpdateSet: (setId: string, data: { weight_kg?: number; reps?: number; completed?: boolean }) => Promise<void>;
  onAddSet: (exerciseName: string, exerciseLibraryId?: string | null) => Promise<void>;
  onDeleteSet: (setId: string) => Promise<void>;
}

function ExerciseCard({
  group,
  onCompleteSet,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
}: ExerciseCardProps) {
  const [localSets, setLocalSets] = useState<Record<string, { weight: string; reps: string }>>({});

  const getLocalValue = (set: WorkoutSet, field: "weight" | "reps") => {
    const local = localSets[set.id];
    if (local) {
      return field === "weight" ? local.weight : local.reps;
    }
    if (field === "weight") {
      return set.weight_kg?.toString() || "";
    }
    return set.reps?.toString() || "";
  };

  const handleInputChange = (setId: string, field: "weight" | "reps", value: string) => {
    setLocalSets((prev) => ({
      ...prev,
      [setId]: {
        weight: field === "weight" ? value : (prev[setId]?.weight || ""),
        reps: field === "reps" ? value : (prev[setId]?.reps || ""),
      },
    }));
  };

  const handleInputBlur = async (set: WorkoutSet, field: "weight" | "reps") => {
    const local = localSets[set.id];
    if (!local) return;

    const weight = parseFloat(local.weight) || null;
    const reps = parseInt(local.reps) || null;

    // Only update if value changed
    if (field === "weight" && weight !== set.weight_kg) {
      await onUpdateSet(set.id, { weight_kg: weight ?? undefined });
    } else if (field === "reps" && reps !== set.reps) {
      await onUpdateSet(set.id, { reps: reps ?? undefined });
    }
  };

  const handleToggleComplete = async (set: WorkoutSet) => {
    const local = localSets[set.id];
    const weight = local ? parseFloat(local.weight) || undefined : set.weight_kg ?? undefined;
    const reps = local ? parseInt(local.reps) || undefined : set.reps ?? undefined;

    if (set.completed) {
      // Uncomplete the set
      await onUpdateSet(set.id, { completed: false });
    } else {
      // Complete the set
      await onCompleteSet(set.id, weight, reps);
    }
  };

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
        <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 px-1 mb-3">
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            Set
          </div>
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            kg
          </div>
          <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
            Reps
          </div>
          <div className="w-12" />
        </div>

        {/* Sets Rows */}
        <div className="flex flex-col gap-2">
          {group.sets.map((set, index) => (
            <div
              key={set.id}
              className={cn(
                "grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-3 items-center group transition-all",
                set.completed && "opacity-60"
              )}
            >
              {/* Set Number */}
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-lg font-bold text-xs transition-all",
                    set.completed
                      ? "bg-primary text-white"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {set.completed ? <Check className="h-4 w-4" /> : set.set_index}
                </div>
              </div>

              {/* Weight Input */}
              <Input
                type="number"
                inputMode="decimal"
                value={getLocalValue(set, "weight")}
                onChange={(e) => handleInputChange(set.id, "weight", e.target.value)}
                onBlur={() => handleInputBlur(set, "weight")}
                placeholder="0"
                className={cn(
                  "h-11 text-center bg-muted/30 border-none font-bold text-base rounded-xl focus:ring-2 focus:ring-primary/20",
                  set.completed && "line-through"
                )}
                disabled={set.completed}
              />

              {/* Reps Input */}
              <Input
                type="number"
                inputMode="numeric"
                value={getLocalValue(set, "reps")}
                onChange={(e) => handleInputChange(set.id, "reps", e.target.value)}
                onBlur={() => handleInputBlur(set, "reps")}
                placeholder="0"
                className={cn(
                  "h-11 text-center bg-muted/30 border-none font-bold text-base rounded-xl focus:ring-2 focus:ring-primary/20",
                  set.completed && "line-through"
                )}
                disabled={set.completed}
              />

              {/* Complete/Delete Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleComplete(set)}
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all",
                    set.completed
                      ? "bg-primary text-white hover:bg-primary/80"
                      : "bg-muted/30 hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Set Button */}
        <Button
          variant="ghost"
          className="w-full h-10 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl mt-4 border-2 border-dashed border-muted-foreground/10"
          onClick={() => onAddSet(group.exercise_name, group.exercise_library_id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
}
