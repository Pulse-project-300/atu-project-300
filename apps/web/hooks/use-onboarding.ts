"use client";

import { useState, useCallback } from "react";
import { OnboardingData } from "@/lib/onboarding/types";

/**
 * Custom hook for managing the onboarding flow state and navigation.
 *
 * This hook provides centralized state management for the multi-step onboarding process,
 * including user data collection and step navigation.
 *
 * @returns {Object} Onboarding state and control functions
 * @returns {OnboardingData} data - The collected user data (age, gender, fitness goals, etc.)
 * @returns {number} currentStep - The current step number (1-11)
 * @returns {Function} updateData - Function to update user data
 * @returns {Function} nextStep - Function to advance to the next step
 * @returns {Function} previousStep - Function to go back to the previous step
 * @returns {Function} resetOnboarding - Function to reset the entire onboarding state
 *
 * @example
 * const { data, currentStep, updateData, nextStep } = useOnboarding();
 *
 * // Update user's age
 * updateData({ age: 25 });
 *
 * // Move to next step
 * nextStep();
 */
export function useOnboarding() {
  // Store all the user's onboarding data (age, gender, goals, etc.)
  const [data, setData] = useState<OnboardingData>({});

  // Track which step of the onboarding process the user is on (1-11)
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Updates the onboarding data with new values.
   * Merges new data with existing data without overwriting other fields.
   *
   * @param {Partial<OnboardingData>} newData - The data to merge (e.g., { age: 25 })
   *
   * @example
   * updateData({ age: 25 }); // Updates only age
   * updateData({ gender: "male", heightCm: 180 }); // Updates multiple fields
   */
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  }, []);

  /**
   * Advances to the next step in the onboarding flow.
   * No maximum limit - the container component handles the final step logic.
   *
   * @example
   * nextStep(); // Moves from step 3 to step 4
   */
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  /**
   * Goes back to the previous step in the onboarding flow.
   * Prevents going below step 1 using Math.max.
   *
   * @example
   * previousStep(); // Moves from step 5 to step 4
   * // If on step 1, stays at step 1
   */
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  /**
   * Resets the entire onboarding state to initial values.
   * Clears all user data and returns to step 1.
   * Useful for testing or if user wants to restart the process.
   *
   * @example
   * resetOnboarding(); // Clears all data and returns to step 1
   */
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
