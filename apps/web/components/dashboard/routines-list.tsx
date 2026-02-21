"use client";

import { useEffect, useState } from "react";
import { Play, Dumbbell, Clock } from "lucide-react";
import Link from "next/link";
import {
  getDashboardRoutines,
  type DashboardRoutine,
} from "@/app/(app)/dashboard/actions";

export function RoutinesList() {
  const [routines, setRoutines] = useState<DashboardRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardRoutines()
      .then(setRoutines)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Routines</h3>
          <p className="text-sm text-muted-foreground">
            Quick access to your workout plans
          </p>
        </div>
        <Link
          href="/routines"
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border bg-card p-4 animate-pulse"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-lg bg-muted-foreground/10 p-2.5 h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted-foreground/10 rounded" />
                  <div className="h-3 w-48 bg-muted-foreground/10 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              No routines yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first workout routine to get started
            </p>
            <Link
              href="/routines/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              Create Routine
            </Link>
          </div>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{routine.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{routine.exercises} exercises</span>
                    {routine.lastCompleted && (
                      <span className="hidden sm:inline">
                        Last: {routine.lastCompleted}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href={`/workout/${routine.id}`}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-primary/10"
              >
                <Play className="h-4 w-4 text-primary" />
                <span className="text-primary font-bold">
                  Start
                </span>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
