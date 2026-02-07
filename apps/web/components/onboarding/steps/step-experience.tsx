"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EXPERIENCE_LEVELS } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

interface StepExperienceProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepExperience({ data, onChange }: StepExperienceProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Your experience level</h2>
        <p className="text-muted-foreground">
          Help us tailor the intensity
        </p>
      </div>

      <div className="space-y-3">
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = data.experienceLevel === level.value;
          return (
            <button
              key={level.value}
              onClick={() => onChange({ experienceLevel: level.value })}
              className={cn(
                "w-full text-left transition-all border-2 rounded-xl",
                isSelected
                  ? "p-4 border-primary bg-primary text-white shadow-md shadow-primary/10"
                  : "p-4 border-border bg-card hover:border-primary/30 text-foreground"
              )}
            >
              <div className="font-bold">{level.label}</div>
              <div className={cn(
                "text-sm mt-1",
                isSelected ? "text-white/80" : "text-muted-foreground"
              )}>{level.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
