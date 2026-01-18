"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveWorkoutPlan(plan: any) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Save the workout plan to the database
  const { data, error } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      plan_data: plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving workout plan:", error);
    return { error: error.message };
  }

  return { success: true, planId: data.id };
}

export async function getActiveWorkoutPlan() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", plan: null };
  }

  // Fetch the most recent active workout plan
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // If no plan exists, return null instead of error
    if (error.code === "PGRST116") {
      return { plan: null };
    }
    console.error("Error fetching workout plan:", error);
    return { error: error.message, plan: null };
  }

  return { plan: data };
}

export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", profile: null };
  }

  // Fetch user profile from database
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return { error: error.message, profile: null };
  }

  return { profile: data };
}
