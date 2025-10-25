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

  // Update user profile with onboarding data
  const { error } = await supabase
    .from("profiles")
    .update({
      dob: data.dob,
      gender: data.gender,
      height_cm: data.heightCm,
      weight_kg: data.weightKg,
      fitness_goal: data.fitnessGoal,
      experience_level: data.experienceLevel,
      equipment: data.equipment,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error saving profile:", error);
    return { error: error.message };
  }

  return { success: true };
}
