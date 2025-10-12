"use client";

import { OnboardingData } from "@/lib/onboarding/types";
import { WORKOUT_TIME_OPTIONS } from "@/lib/onboarding/constants";

interface StepTimeProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StepTime({ data, onChange }: StepTimeProps) {
  return (
    <div className="space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-foreground">Preferred time</h2>
        <p className="text-muted-foreground">When do you prefer to work out?</p>
      </div>

      <div className="space-y-2 max-w-xs">
        {WORKOUT_TIME_OPTIONS.map((option) => {
          const isSelected = data.preferredWorkoutTime === option.value;
          return isSelected ? (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ preferredWorkoutTime: option.value as any })}
              className="w-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-left"
            >
              {option.label}
            </button>
          ) : (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ preferredWorkoutTime: option.value as any })}
              className="w-full relative inline-flex items-center justify-start p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
              <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent text-left">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
