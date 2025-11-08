"use client";

import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/lib/onboarding/types";

interface StepWeightProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepWeight({ data, onChange }: StepWeightProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Your weight</h2>
        <p className="text-muted-foreground">In kilograms</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="weight"
          type="number"
          placeholder="70"
          className="text-lg h-12"
          value={data.weightKg || ""}
          onChange={(e) => onChange({ weightKg: parseInt(e.target.value) })}
          autoFocus
        />
      </div>
    </div>
  );
}
