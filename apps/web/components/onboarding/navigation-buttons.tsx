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
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isGenerating}
      >
        Back
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isGenerating}
      >
        {isGenerating
          ? "Generating..."
          : isLastStep
          ? "Generate My Plan"
          : "Next"}
      </Button>
    </div>
  );
}
