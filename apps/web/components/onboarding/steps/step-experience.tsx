"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { EXPERIENCE_LEVELS } from "@/lib/onboarding/constants";

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
              className={`w-full text-left transition-all relative ${
                isSelected
                  ? "p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "inline-flex p-0.5 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500"
              }`}
            >
              {isSelected ? (
                <>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm mt-1 text-white/90">{level.description}</div>
                </>
              ) : (
                <div className="w-full p-4 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:text-white">
                  <div className="font-medium text-foreground group-hover:text-white">{level.label}</div>
                  <div className="text-sm text-muted-foreground group-hover:text-white/90 mt-1">{level.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
