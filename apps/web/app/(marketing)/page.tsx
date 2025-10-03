import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl px-5 text-center gap-8">
        <h1 className="text-4xl md:text-6xl font-bold">
          Your AI-Powered Fitness Companion
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Get personalized workout plans that adapt to your goals, progress, and
          lifestyle.
        </p>
        <div className="flex gap-4">
          {user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
