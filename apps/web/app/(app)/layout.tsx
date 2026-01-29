import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
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
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center">
              <Link href={"/dashboard"} className="text-muted-foreground hover:text-brand transition-colors">
                Pulse
              </Link>
              <div className="flex gap-4 text-muted-foreground">
                <Link href="/routines" className="hover:text-brand transition-colors">
                  Routines
                </Link>
                <Link href="/progress" className="hover:text-brand transition-colors">
                  Progress
                </Link>
                <Link href="/achievements" className="hover:text-brand transition-colors">
                  Achievements
                </Link>
                <Link href="/ai-assistant" className="hover:text-brand transition-colors">
                  AI Assistant
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col w-full max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
          <p className="text-muted-foreground">
            © 2025 Pulse. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
