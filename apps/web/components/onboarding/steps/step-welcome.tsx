"use client";

export function StepWelcome() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to Pulse! 💪</h2>
        <p className="text-muted-foreground text-lg">
          Let's create your personalized fitness journey
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">✨ What to expect</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• AI-powered workout plans tailored to you</li>
            <li>• Track your progress and achievements</li>
            <li>• Adaptive training that evolves with you</li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">⏱️ This will take 2-3 minutes</h3>
          <p className="text-sm text-muted-foreground">
            We'll ask about your goals, experience, and preferences to create the perfect plan
          </p>
        </div>
      </div>
    </div>
  );
}
