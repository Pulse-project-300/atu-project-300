"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { GENDER_OPTIONS } from "@/lib/onboarding/constants";

interface StepGenderProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepGender({ data, onChange }: StepGenderProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Your gender</h2>
      </div>

      <div className="space-y-2 max-w-xs">
        {GENDER_OPTIONS.map((option) => {
          const isSelected = data.gender === option.value;
          return isSelected ? (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ gender: option.value })}
              className="w-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              {option.label}
            </button>
          ) : (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ gender: option.value })}
              className="w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
              <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent text-center">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
