"use client";

export function StepWelcome() {
  return (
    <div className="space-y-8 py-12 text-center">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Pulse</h1>
          <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>
        <p className="text-base text-muted-foreground">
          Let's get your fitness journey started
        </p>
      </div>
    </div>
  );
}
