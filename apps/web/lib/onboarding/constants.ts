import { FitnessGoal, ExperienceLevel, Equipment, Gender } from "./types";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const FITNESS_GOALS: { value: FitnessGoal; label: string; description: string }[] = [
  {
    value: "muscle_gain",
    label: "Build Muscle",
    description: "Focus on hypertrophy and muscle growth",
  },
  {
    value: "weight_loss",
    label: "Lose Weight",
    description: "Burn fat and improve body composition",
  },
  {
    value: "strength",
    label: "Get Stronger",
    description: "Increase overall strength and power",
  },
  {
    value: "endurance",
    label: "Improve Endurance",
    description: "Build cardiovascular fitness and stamina",
  },
  {
    value: "general_fitness",
    label: "General Fitness",
    description: "Stay healthy and active",
  },
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

export const DAYS_PER_WEEK_OPTIONS = [
  { value: 2, label: "2 days/week" },
  { value: 3, label: "3 days/week" },
  { value: 4, label: "4 days/week" },
  { value: 5, label: "5 days/week" },
  { value: 6, label: "6 days/week" },
];

export const WORKOUT_TIME_OPTIONS = [
  { value: "morning", label: "Morning (5am - 11am)" },
  { value: "afternoon", label: "Afternoon (11am - 5pm)" },
  { value: "evening", label: "Evening (5pm - 10pm)" },
  { value: "flexible", label: "Flexible" },
];

export const TOTAL_STEPS = 7;
