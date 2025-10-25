"use client";

import { useOnboarding } from "@/hooks/use-onboarding";
import { ProgressIndicator } from "./progress-indicator";
import { NavigationButtons } from "./navigation-buttons";
import { StepWelcome } from "./steps/step-welcome";
import { StepDob } from "./steps/step-dob";
import { StepGender } from "./steps/step-gender";
import { StepHeight } from "./steps/step-height";
import { StepWeight } from "./steps/step-weight";
import { StepGoals } from "./steps/step-goals";
import { StepExperience } from "./steps/step-experience";
import { StepEquipment } from "./steps/step-equipment";
import { TOTAL_STEPS } from "@/lib/onboarding/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingProfile } from "@/app/(onboarding)/onboarding/actions";

export function OnboardingContainer() {
  const { data, currentStep, updateData, nextStep, previousStep } =
    useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Welcome
        return true;
      case 2: // DOB
        return !!data.dob;
      case 3: // Gender
        return !!data.gender;
      case 4: // Height
        return !!data.heightCm;
      case 5: // Weight
        return !!data.weightKg;
      case 6: // Goals
        return !!data.fitnessGoal;
      case 7: // Experience
        return !!data.experienceLevel;
      case 8: // Equipment
        return !!data.equipment && data.equipment.length > 0;
      case 9: // Final
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS) {
      // Final step - generate plan
      setIsGenerating(true);
      setStatus("Generating...");
      try {
        const res = await fetch("/api/plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "demo-user",
            profile: {
              goal: data.fitnessGoal || "general fitness",
              experience: data.experienceLevel || "beginner",
              dob: data.dob,
              gender: data.gender,
              height_cm: data.heightCm,
              weight_kg: data.weightKg,
              equipment: data.equipment,
            },
          }),
        });

        const responseData = await res.json();
        setStatus(JSON.stringify(responseData, null, 2));
      } catch (error) {
        console.error("Error generating plan:", error);
        setStatus("Error: " + (error as Error).message);
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
        return <StepDob data={data} onChange={updateData} />;
      case 3:
        return <StepGender data={data} onChange={updateData} />;
      case 4:
        return <StepHeight data={data} onChange={updateData} />;
      case 5:
        return <StepWeight data={data} onChange={updateData} />;
      case 6:
        return <StepGoals data={data} onChange={updateData} />;
      case 7:
        return <StepExperience data={data} onChange={updateData} />;
      case 8:
        return <StepEquipment data={data} onChange={updateData} />;
      case 9:
        return (
          <div className="space-y-8 py-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-light text-foreground">Ready to start?</h2>
              <p className="text-muted-foreground">
                Click finish to generate your personalized workout plan
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-12">
        <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="min-h-[400px]">{renderStep()}</div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={previousStep}
          canProceed={canProceed()}
          isGenerating={isGenerating}
        />

        {status && (
          <div className="mt-8 p-4 bg-muted rounded-lg border">
            <h3 className="text-sm font-semibold mb-2">API Response:</h3>
            <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap">
              {status}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
