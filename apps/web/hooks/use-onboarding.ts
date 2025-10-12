"use client";

import { useState, useCallback } from "react";
import { OnboardingData } from "@/lib/onboarding/types";

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({});
  const [currentStep, setCurrentStep] = useState(1);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const resetOnboarding = useCallback(() => {
    setData({});
    setCurrentStep(1);
  }, []);

  return {
    data,
    currentStep,
    updateData,
    nextStep,
    previousStep,
    resetOnboarding,
  };
}
