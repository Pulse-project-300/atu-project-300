"use client";

import { useOnboarding } from "@/hooks/use-onboarding";
import { ProgressIndicator } from "./progress-indicator";
import { NavigationButtons } from "./navigation-buttons";
import { StepWelcome } from "./steps/step-welcome";
import { StepBasics } from "./steps/step-basics";
import { StepGoals } from "./steps/step-goals";
import { StepExperience } from "./steps/step-experience";
import { StepSchedule } from "./steps/step-schedule";
import { StepEquipment } from "./steps/step-equipment";
import { StepPreferences } from "./steps/step-preferences";
import { TOTAL_STEPS } from "@/lib/onboarding/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingContainer() {
  const { data, currentStep, updateData, nextStep, previousStep } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Welcome
        return true;
      case 2: // Basics
        return !!(data.age && data.gender && data.heightCm && data.weightKg);
      case 3: // Goals
        return !!data.fitnessGoal;
      case 4: // Experience
        return !!data.experienceLevel;
      case 5: // Schedule
        return !!(data.daysPerWeek && data.preferredWorkoutTime);
      case 6: // Equipment
        return !!data.equipmentAccess && data.equipmentAccess.length > 0;
      case 7: // Preferences
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS) {
      // Final step - generate plan
      setIsGenerating(true);
      try {
        // TODO: Call API to save profile and generate plan
        const response = await fetch("/api/plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "current-user", // TODO: Get from auth
            profile: data,
          }),
        });

        if (response.ok) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error generating plan:", error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome />;
      case 2:
        return <StepBasics data={data} onChange={updateData} />;
      case 3:
        return <StepGoals data={data} onChange={updateData} />;
      case 4:
        return <StepExperience data={data} onChange={updateData} />;
      case 5:
        return <StepSchedule data={data} onChange={updateData} />;
      case 6:
        return <StepEquipment data={data} onChange={updateData} />;
      case 7:
        return <StepPreferences data={data} onChange={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="min-h-[400px] flex items-center justify-center">
          {renderStep()}
        </div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={previousStep}
          canProceed={canProceed()}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
