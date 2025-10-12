"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/lib/onboarding/types";
import { GENDER_OPTIONS } from "@/lib/onboarding/constants";
import { Button } from "@/components/ui/button";

interface StepBasicsProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepBasics({ data, onChange }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground">
          This helps us customize your workout plan
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            value={data.age || ""}
            onChange={(e) => onChange({ age: parseInt(e.target.value) })}
          />
        </div>

        <div className="grid gap-2">
          <Label>Gender</Label>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={data.gender === option.value ? "default" : "outline"}
                onClick={() => onChange({ gender: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={data.heightCm || ""}
              onChange={(e) => onChange({ heightCm: parseInt(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={data.weightKg || ""}
              onChange={(e) => onChange({ weightKg: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
