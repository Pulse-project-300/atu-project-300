"use client";

import { useState } from "react";
import { Dumbbell, Trash2, Play, Loader2 } from "lucide-react";
import { deleteRoutine } from "@/app/(app)/routines/actions";
import { useWorkout } from "@/components/workout/workout-provider";
import type { Routine } from "@/lib/types/routines";
import { Button } from "@/components/ui/button";

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
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              size="sm"
            >
              {isDeleting ? "..." : "Yes"}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              variant="outline"
              size="sm"
            >
              No
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={() => setShowConfirm(true)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              aria-label={`Delete ${routine.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleStartOrContinueWorkout}
              disabled={isStarting || (hasActiveWorkout && !isThisRoutineActive)}
              variant="outline"
              className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold"
              aria-label={
                isThisRoutineActive
                  ? "Continue this workout"
                  : hasActiveWorkout
                    ? "Finish your current workout first"
                    : "Start workout"
              }
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isThisRoutineActive ? "Continue" : hasActiveWorkout ? "In Progress" : "Start"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
