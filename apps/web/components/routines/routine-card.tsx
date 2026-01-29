"use client";

import { useState } from "react";
import { Dumbbell, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteRoutine } from "@/app/(app)/routines/actions";
import type { Routine } from "@/lib/types/routines";

interface RoutineCardProps {
  routine: Routine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteRoutine(routine.id);

    if (!result.success) {
      alert(result.error || "Failed to delete routine");
    }

    setIsDeleting(false);
    setShowConfirm(false);
  };

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
            <Link
              href={`/workouts/start/${routine.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium hover:bg-brand/10 transition-all"
            >
              <span className="text-brand font-bold">
                Start
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
