"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { FITNESS_GOALS } from "@/lib/onboarding/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StepGoalsProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepGoals({ data, onChange }: StepGoalsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What's your primary goal?</h2>
        <p className="text-muted-foreground">
          We'll design your workouts around this objective
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {FITNESS_GOALS.map((goal) => (
          <Card
            key={goal.value}
            className={`cursor-pointer transition-all ${
              data.fitnessGoal === goal.value
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onChange({ fitnessGoal: goal.value })}
          >
            <CardHeader>
              <CardTitle className="text-lg">{goal.label}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
