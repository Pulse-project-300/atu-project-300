"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EXPERIENCE_LEVELS } from "@/lib/onboarding/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StepExperienceProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepExperience({ data, onChange }: StepExperienceProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What's your experience level?</h2>
        <p className="text-muted-foreground">
          This helps us set appropriate intensity and progression
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {EXPERIENCE_LEVELS.map((level) => (
          <Card
            key={level.value}
            className={`cursor-pointer transition-all ${
              data.experienceLevel === level.value
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onChange({ experienceLevel: level.value })}
          >
            <CardHeader>
              <CardTitle className="text-lg">{level.label}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
