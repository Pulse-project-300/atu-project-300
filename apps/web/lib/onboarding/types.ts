export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type Gender = "male" | "female" | "other";

export type Equipment =
  | "full_gym"
  | "home_gym"
  | "dumbbells"
  | "resistance_bands"
  | "bodyweight_only";

export interface OnboardingData {
  dob?: string;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: ExperienceLevel;
  equipment?: Equipment[];
  fitnessGoal?: string;
}
