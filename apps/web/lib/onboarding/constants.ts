import { ExperienceLevel, Equipment, Gender } from "./types";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to working out or returning after a break",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Regular workouts for 6+ months",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Consistent training for 2+ years",
  },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  {
    value: "full_gym",
    label: "Full Gym Access",
    description: "Access to a commercial gym with all equipment",
  },
  {
    value: "home_gym",
    label: "Home Gym",
    description: "Barbells, rack, and plates at home",
  },
  {
    value: "dumbbells",
    label: "Dumbbells",
    description: "A set of dumbbells",
  },
  {
    value: "resistance_bands",
    label: "Resistance Bands",
    description: "Resistance bands or tubes",
  },
  {
    value: "bodyweight_only",
    label: "Bodyweight Only",
    description: "No equipment available",
  },
];

export const TOTAL_STEPS = 9;
