export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type FitnessGoal =
  | "muscle_gain"
  | "weight_loss"
  | "strength"
  | "endurance"
  | "general_fitness";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type Equipment =
  | "full_gym"
  | "home_gym"
  | "dumbbells"
  | "resistance_bands"
  | "bodyweight_only";

export interface OnboardingData {
  // Step 2: Basics
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;

  // Step 3: Goals
  fitnessGoal?: FitnessGoal;

  // Step 4: Experience
  experienceLevel?: ExperienceLevel;

  // Step 5: Schedule
  daysPerWeek?: number;
  preferredWorkoutTime?: "morning" | "afternoon" | "evening" | "flexible";

  // Step 6: Equipment
  equipmentAccess?: Equipment[];

  // Step 7: Preferences
  injuries?: string;
  preferences?: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  isComplete: (data: OnboardingData) => boolean;
}
