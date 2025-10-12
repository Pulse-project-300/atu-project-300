"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EQUIPMENT_OPTIONS } from "@/lib/onboarding/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What equipment do you have access to?</h2>
        <p className="text-muted-foreground">
          Select all that apply
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {EQUIPMENT_OPTIONS.map((equipment) => (
          <Card
            key={equipment.value}
            className={`cursor-pointer transition-all ${
              data.equipmentAccess?.includes(equipment.value)
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => handleToggle(equipment.value)}
          >
            <CardHeader className="flex flex-row items-start space-y-0 gap-4">
              <Checkbox
                checked={data.equipmentAccess?.includes(equipment.value)}
                onCheckedChange={() => handleToggle(equipment.value)}
              />
              <div className="flex-1">
                <CardTitle className="text-lg">{equipment.label}</CardTitle>
                <CardDescription>{equipment.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
