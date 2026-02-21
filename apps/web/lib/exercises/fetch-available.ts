import { createClient } from "@/lib/supabase/server";

const MAX_PER_CATEGORY = 12;

interface AvailableExercise {
  rowid: number;
  name: string;
  category: string;
}

/**
 * Fetch exercises from new_exercises filtered by user equipment,
 * then sample up to MAX_PER_CATEGORY per category to keep the
 * payload small enough for the AI prompt.
 */
export async function fetchAvailableExercises(
  equipment?: string[]
): Promise<{ exercises: AvailableExercise[]; error?: string }> {
  const supabase = await createClient();
  let query = supabase
    .from("new_exercises")
    .select("rowid, name, category");

  if (equipment && equipment.length > 0) {
    const equipmentFilters: string[] = [];
    for (const eq of equipment) {
      if (eq === "bodyweight_only") equipmentFilters.push("body only");
      else if (eq === "dumbbells") equipmentFilters.push("dumbbell");
      else if (eq === "resistance_bands") equipmentFilters.push("bands");
      else if (eq === "full_gym" || eq === "home_gym") {
        equipmentFilters.push(
          "barbell", "dumbbell", "cable", "machine",
          "body only", "e-z curl bar", "kettlebells"
        );
      }
    }
    const unique = [...new Set(equipmentFilters)];
    if (unique.length > 0) {
      query = query.in("equipment", unique);
    }
  }

  const { data, error } = await query;
  if (error) {
    return { exercises: [], error: `Failed to fetch exercises: ${error.message}` };
  }

  // Group by category and sample up to MAX_PER_CATEGORY each
  const byCategory = new Map<string, AvailableExercise[]>();
  for (const ex of data || []) {
    const cat = ex.category || "other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(ex);
  }

  const sampled: AvailableExercise[] = [];
  for (const [, exercises] of byCategory) {
    // Shuffle then take up to MAX_PER_CATEGORY
    for (let i = exercises.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
    }
    sampled.push(...exercises.slice(0, MAX_PER_CATEGORY));
  }

  return { exercises: sampled };
}
