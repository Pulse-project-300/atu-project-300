import { Play, Dumbbell, Clock } from "lucide-react";
import Link from "next/link";

export function RoutinesList() {
  // Mock data - showing realistic workout routines
  const routines = [
    {
      id: 1,
      name: "Upper Body Strength",
      exercises: 8,
      duration: "45 min",
      lastCompleted: "2 days ago",
    },
    {
      id: 2,
      name: "Leg Day",
      exercises: 6,
      duration: "60 min",
      lastCompleted: "4 days ago",
    },
    {
      id: 3,
      name: "Core & Cardio",
      exercises: 10,
      duration: "30 min",
      lastCompleted: "Yesterday",
    },
  ];

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
          className="text-sm text-brand hover:text-brand/80 font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-brand/10 p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-brand" />
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
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-brand/20"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-lg bg-brand/10 p-2.5">
                  <Dumbbell className="h-5 w-5 text-brand" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{routine.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {routine.duration}
                    </span>
                    <span>{routine.exercises} exercises</span>
                    <span className="hidden sm:inline">
                      Last: {routine.lastCompleted}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/workout/${routine.id}`}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-brand/10"
              >
                <Play className="h-4 w-4 text-brand" />
                <span className="text-brand font-bold">
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
