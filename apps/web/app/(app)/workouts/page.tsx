import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Plus } from "lucide-react";
import Link from "next/link";
import type { Routine } from "@/lib/types/workouts";

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const { data: routines, error } = await supabase
    .from("routines")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Routines</h1>
          <p className="text-muted-foreground">
            Your workout routines
          </p>
        </div>
        <Link
          href="/routines/create"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          New Routine
        </Link>
      </div>

      {error ? (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-center">
          <p className="text-red-600">Failed to load routines</p>
        </div>
      ) : !routines || routines.length === 0 ? (
        <div className="p-12 border rounded-lg text-center">
          <div className="rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 mb-4 inline-block">
            <Dumbbell className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No routines yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workout routine to get started
          </p>
          <Link
            href="/routines/create"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Routine
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(routines as Routine[]).map((routine) => (
            <div
              key={routine.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-2.5">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">{routine.name}</h3>
                  {routine.description && (
                    <p className="text-sm text-muted-foreground">{routine.description}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/workout/start/${routine.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-2 text-sm font-medium hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
              >
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Start
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
