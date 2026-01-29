"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EQUIPMENT_OPTIONS } from "@/lib/onboarding/constants";

interface StepEquipmentProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepEquipment({ data, onChange }: StepEquipmentProps) {
  const handleToggle = (value: string) => {
    const current = data.equipment || [];
    const updated = current.includes(value as any)
      ? current.filter((item) => item !== value)
      : [...current, value as any];
    onChange({ equipment: updated });
  };

  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Equipment access</h2>
        <p className="text-muted-foreground">
          Select all that apply
        </p>
      </div>

      <div className="space-y-3">
        {EQUIPMENT_OPTIONS.map((equipment) => {
          const isSelected = data.equipment?.includes(equipment.value);
          return (
            <button
              key={equipment.value}
              onClick={() => handleToggle(equipment.value)}
              className={cn(
                "w-full text-left transition-all border-2 rounded-xl",
                isSelected
                  ? "p-4 border-primary bg-primary text-white shadow-md shadow-primary/10"
                  : "p-4 border-border bg-card hover:border-brand/30 text-foreground"
              )}
            >
              <div className="font-bold">{equipment.label}</div>
              <div className={cn(
                "text-sm mt-1",
                isSelected ? "text-white/80" : "text-muted-foreground"
              )}>{equipment.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
