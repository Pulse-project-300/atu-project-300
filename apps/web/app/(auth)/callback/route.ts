import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        // Create profile if it doesn't exist (for OAuth signups)
        if (!existingProfile) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            name: name,
            created_at: new Date().toISOString(),
          });
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // Local development
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Production with forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // Fallback
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/error`);
}
