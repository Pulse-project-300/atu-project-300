"use client";

import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isGenerating?: boolean;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  isGenerating = false,
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between gap-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep || isGenerating}
      >
        Back
      </Button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isGenerating}
        className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent">
          {isGenerating
            ? "Generating..."
            : isLastStep
            ? "Generate Plan"
            : "Continue"}
        </span>
      </button>
    </div>
  );
}
