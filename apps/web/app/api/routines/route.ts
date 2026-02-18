import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: routines, error } = await supabase
      .from("routines")
      .select(`
        id,
        name,
        description,
        routine_exercises (
          exercise_name,
          order_index,
          sets_data,
          rest_seconds
        )
      `)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ routines: routines || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch routines: ${message}` },
      { status: 500 }
    );
  }
}
