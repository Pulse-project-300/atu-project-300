"use client";

import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/lib/onboarding/types";

interface StepDobProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepDob({ data, onChange }: StepDobProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">What's your date of birth?</h2>
      </div>

      <div className="max-w-xs">
        <Input
          id="dob"
          type="date"
          className="text-lg h-12"
          value={data.dob || ""}
          onChange={(e) => onChange({ dob: e.target.value })}
          autoFocus
        />
      </div>
    </div>
  );
}
