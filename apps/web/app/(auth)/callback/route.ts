import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent"); // 'login' or 'signup'
  let next = "/sign-up";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-up`);
  }

  const supabase = await createClient();
  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error("Auth exchange error:", sessionError);
    return NextResponse.redirect(`${origin}/sign-up`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-up`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return NextResponse.redirect(`${origin}/sign-up`);
  }

  if (!profile) {
    // No profile exists
    if (intent === "login") {
      // User tried to login but has no profile, redirect to sign-up
      return NextResponse.redirect(`${origin}/sign-up`);
    }

    // Sign-up flow: create profile for OAuth users (Google sign-up)
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      user_id: user.id,
      email: user.email,
      name,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Profile insert error:", insertError);
      return NextResponse.redirect(`${origin}/sign-up`);
    }

    // New user, send to onboarding
    next = "/onboarding";
  } else {
    // Profile exists, check onboarding status
    next = profile.onboarding_completed ? "/dashboard" : "/onboarding";
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectUrl = isLocalEnv
    ? `${origin}${next}`
    : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`;

  return NextResponse.redirect(redirectUrl);
}
