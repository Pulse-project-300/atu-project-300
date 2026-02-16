import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Plus } from "lucide-react";
import Link from "next/link";
import type { Routine } from "@/lib/types/routines";
import { RoutineCard } from "@/components/routines/routine-card";
import { Button } from "@/components/ui/button";

export default async function RoutinesPage() {
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
        <Button asChild>
          <Link href="/routines/create">
            <Plus className="h-4 w-4" />
            New Routine
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-center">
          <p className="text-red-600">Failed to load routines</p>
        </div>
      ) : !routines || routines.length === 0 ? (
        <div className="p-12 border rounded-lg text-center">
          <div className="rounded-full bg-primary/5 p-4 mb-4 inline-block">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No routines yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workout routine to get started
          </p>
          <Button asChild>
            <Link href="/routines/create">
              <Plus className="h-4 w-4" />
              Create Routine
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {(routines as Routine[]).map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      )}
    </div>
  );
}
