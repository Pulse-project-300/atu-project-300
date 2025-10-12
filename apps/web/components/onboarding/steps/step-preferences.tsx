"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StepPreferencesProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Final details</h2>
        <p className="text-muted-foreground">
          Help us personalize your experience (optional)
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="grid gap-2">
          <Label htmlFor="injuries">Injuries or limitations</Label>
          <Input
            id="injuries"
            placeholder="e.g., Lower back pain, knee injury"
            value={data.injuries || ""}
            onChange={(e) => onChange({ injuries: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            We'll adjust exercises to accommodate your needs
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="preferences">Special preferences</Label>
          <Input
            id="preferences"
            placeholder="e.g., Prefer compound lifts, avoid cardio"
            value={data.preferences || ""}
            onChange={(e) => onChange({ preferences: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Any specific training styles or exercises you prefer
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-primary/5 space-y-2">
          <h3 className="font-semibold">🎉 You're all set!</h3>
          <p className="text-sm text-muted-foreground">
            Click "Generate My Plan" to create your personalized workout routine
          </p>
        </div>
      </div>
    </div>
  );
}
