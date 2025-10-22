"use client";

import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/lib/onboarding/types";

interface StepHeightProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepHeight({ data, onChange }: StepHeightProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Your height</h2>
        <p className="text-muted-foreground">In centimeters</p>
      </div>

      <div className="max-w-xs">
        <Input
          id="height"
          type="number"
          placeholder="175"
          className="text-lg h-12"
          value={data.heightCm || ""}
          onChange={(e) => onChange({ heightCm: parseInt(e.target.value) })}
          autoFocus
        />
      </div>
    </div>
  );
}
