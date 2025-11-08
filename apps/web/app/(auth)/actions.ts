"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/callback`,
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Create profile entry
  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      user_id: authData.user.id,
      email: email,
      name: `${firstName} ${lastName}`,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect("/sign-up-success");
}
