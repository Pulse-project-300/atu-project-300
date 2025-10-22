"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/lib/onboarding/types";

interface StepAgeProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepAge({ data, onChange }: StepAgeProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">How old are you?</h2>
      </div>

      <div className="max-w-xs">
        <Input
          id="age"
          type="number"
          placeholder="25"
          className="text-lg h-12"
          value={data.age || ""}
          onChange={(e) => onChange({ age: parseInt(e.target.value) })}
          autoFocus
        />
      </div>
    </div>
  );
}
