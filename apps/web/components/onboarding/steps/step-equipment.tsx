"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EQUIPMENT_OPTIONS } from "@/lib/onboarding/constants";

interface StepEquipmentProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepEquipment({ data, onChange }: StepEquipmentProps) {
  const handleToggle = (value: string) => {
    const current = data.equipmentAccess || [];
    const updated = current.includes(value as any)
      ? current.filter((item) => item !== value)
      : [...current, value as any];
    onChange({ equipmentAccess: updated });
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
          const isSelected = data.equipmentAccess?.includes(equipment.value);
          return (
            <button
              key={equipment.value}
              onClick={() => handleToggle(equipment.value)}
              className={`w-full text-left transition-all relative ${
                isSelected
                  ? "p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "inline-flex p-0.5 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500"
              }`}
            >
              {isSelected ? (
                <>
                  <div className="font-medium">{equipment.label}</div>
                  <div className="text-sm mt-1 text-white/90">{equipment.description}</div>
                </>
              ) : (
                <div className="w-full p-4 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:text-white">
                  <div className="font-medium text-foreground group-hover:text-white">{equipment.label}</div>
                  <div className="text-sm text-muted-foreground group-hover:text-white/90 mt-1">{equipment.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
