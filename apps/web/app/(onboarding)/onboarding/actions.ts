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
      age: data.age,
      gender: data.gender,
      height_cm: data.heightCm,
      weight_kg: data.weightKg,
      fitness_goal: data.fitnessGoal,
      experience_level: data.experienceLevel,
      days_per_week: data.daysPerWeek,
      preferred_workout_time: data.preferredWorkoutTime,
      equipment_access: data.equipmentAccess,
      injuries: data.injuries,
      preferences: data.preferences,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error saving profile:", error);
    return { error: error.message };
  }

  return { success: true };
}
