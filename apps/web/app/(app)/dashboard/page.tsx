
import { createClient } from "@/lib/supabase/server";
//import { useState } from 'react';

export default async function DashboardPage() {
  const supabase = await createClient();
  // State to hold generation status
  //const [status, setStatus] = useState('');
/*
  // Function to handle plan generation
  async function handleGenerate() {
    setStatus('Generating...');
    try {
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          profile: { goal: 'muscle gain', experience: 'beginner' }
        }),
      });

      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatus(err.message);
    }
  }
*/

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user name from database
  const { data: profileData } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user!.id)
    .single();

  const displayName = profileData?.name || "User";

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome to Pulse!</h1>
        <p className="text-muted-foreground">
          Logged in as {displayName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Workout Plans</h3>
          <p className="text-sm text-muted-foreground">
            Your personalized AI-generated workout routines will appear here.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Progress Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your fitness journey with detailed metrics and charts.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Achievements</h3>
          <p className="text-sm text-muted-foreground">
            Earn badges and track your streaks to stay motivated.
          </p>
        </div>
      </div>
    

    </div>
  );
}
