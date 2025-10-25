"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Revalidate the home page to clear cached data
  revalidatePath("/", "layout");

  // Redirect to home page
  redirect("/");
}
