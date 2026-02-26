import CalendarClient from "./calendarclient";
import { createClient } from "@/lib/supabase/server";


export default async function CalendarPage() {
  const supabase = await createClient();

  // You can optionally verify auth here
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If you want to redirect unauth users, do it here (optional)
  // if (!user) redirect("/login");

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <CalendarClient />
    </div>
  );
}
