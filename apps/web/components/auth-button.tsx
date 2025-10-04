import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "User";

  if (user) {
    // Fetch user name from database
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    displayName = profileData?.name || "User";
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {displayName}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
