"use server";

import { createClient } from "@/lib/supabase/server";
import { OnboardingData } from "@/lib/onboarding/types";

export async function saveOnboardingProfile(data: OnboardingData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Upsert user profile (insert if doesn't exist, update if it does)
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      email: user.email || "",
      dob: data.dob,
      gender: data.gender,
      height_cm: data.heightCm,
      weight_kg: data.weightKg,
      fitness_goal: data.fitnessGoal,
      experience_level: data.experienceLevel,
      equipment: data.equipment,
      updated_at: new Date().toISOString(),
      onboarding_completed: true,
    },
    {
      onConflict: "user_id", // Use user_id as the unique constraint
    },
  );

  if (error) {
    console.error("Error saving profile:", error);
    return { error: error.message };
  }

  return { success: true };
}
