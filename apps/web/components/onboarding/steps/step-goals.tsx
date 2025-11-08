"use client";

import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/lib/onboarding/types";

interface StepGoalsProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepGoals({ data, onChange }: StepGoalsProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">What's your fitness goal?</h2>
        <p className="text-muted-foreground">
          Tell us what you want to achieve
        </p>
      </div>

      <div className="max-w-md">
        <Input
          id="fitnessGoal"
          type="text"
          placeholder="e.g., Build muscle, lose weight, improve endurance"
          className="text-lg h-12"
          value={data.fitnessGoal || ""}
          onChange={(e) => onChange({ fitnessGoal: e.target.value })}
          autoFocus
        />
      </div>
    </div>
  );
}
