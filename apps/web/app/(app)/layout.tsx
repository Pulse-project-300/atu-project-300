import { WorkoutWrapper } from "@/components/workout/workout-wrapper";
import { Nav } from "@/components/nav";
import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <WorkoutWrapper>
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col items-center">
          <Nav authButton={<AuthButton />} />

          {/* Main content - add bottom padding on mobile for the fixed nav */}
          <div className="flex-1 flex flex-col w-full max-w-5xl p-5 pb-24 md:pb-5">
            {children}
          </div>

          {/* Footer - hidden on mobile */}
          <footer className="hidden md:flex w-full items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
            <p className="text-muted-foreground">
              © 2025 Pulse. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </WorkoutWrapper>
  );
}
