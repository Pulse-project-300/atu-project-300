"use client";

import { useState } from "react";
import { Dumbbell, Trash2, Play, Loader2 } from "lucide-react";
import { deleteRoutine } from "@/app/(app)/routines/actions";
import { useWorkout } from "@/components/workout/workout-provider";
import type { Routine } from "@/lib/types/routines";

interface RoutineCardProps {
  routine: Routine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  
  const { startWorkout, activeWorkout, expand } = useWorkout();

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteRoutine(routine.id);

    if (!result.success) {
      alert(result.error || "Failed to delete routine");
    }

    setIsDeleting(false);
    setShowConfirm(false);
  };

  const handleStartOrContinueWorkout = async () => {
    // If there's already an active workout, just expand the modal
    if (activeWorkout) {
      expand();
      return;
    }
    
    setIsStarting(true);
    setStartError(null);
    
    try {
      await startWorkout(routine.id);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "Failed to start workout");
    } finally {
      setIsStarting(false);
    }
  };

  // Check if there's already an active workout
  const hasActiveWorkout = !!activeWorkout;
  const isThisRoutineActive = activeWorkout?.workout.routine_id === routine.id;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{routine.name}</h3>
          {routine.description && (
            <p className="text-sm text-muted-foreground">{routine.description}</p>
          )}
          {startError && (
            <p className="text-sm text-destructive mt-1">{startError}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "..." : "Yes"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-muted"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete routine"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleStartOrContinueWorkout}
              disabled={isStarting || (hasActiveWorkout && !isThisRoutineActive)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isThisRoutineActive 
                  ? "Continue this workout" 
                  : hasActiveWorkout 
                    ? "Finish your current workout first" 
                    : "Start workout"
              }
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-primary" />
              )}
              <span className="text-primary font-bold">
                {isThisRoutineActive ? "Continue" : hasActiveWorkout ? "In Progress" : "Start"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
