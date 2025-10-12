"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { DAYS_PER_WEEK_OPTIONS, WORKOUT_TIME_OPTIONS } from "@/lib/onboarding/constants";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface StepScheduleProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepSchedule({ data, onChange }: StepScheduleProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Let's plan your schedule</h2>
        <p className="text-muted-foreground">
          When can you work out?
        </p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-3">
          <Label>Days per week</Label>
          <div className="grid grid-cols-3 gap-2">
            {DAYS_PER_WEEK_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={data.daysPerWeek === option.value ? "default" : "outline"}
                onClick={() => onChange({ daysPerWeek: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Preferred workout time</Label>
          <div className="grid gap-2">
            {WORKOUT_TIME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={data.preferredWorkoutTime === option.value ? "default" : "outline"}
                onClick={() => onChange({ preferredWorkoutTime: option.value as any })}
                className="justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
