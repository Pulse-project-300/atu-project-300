import { z } from "zod";

export const basicsSchema = z.object({
  age: z.number().min(13).max(120),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
});

export const goalsSchema = z.object({
  fitnessGoal: z.enum([
    "muscle_gain",
    "weight_loss",
    "strength",
    "endurance",
    "general_fitness",
  ]),
});

export const experienceSchema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const scheduleSchema = z.object({
  daysPerWeek: z.number().min(2).max(6),
  preferredWorkoutTime: z.enum(["morning", "afternoon", "evening", "flexible"]),
});

export const equipmentSchema = z.object({
  equipmentAccess: z
    .array(
      z.enum([
        "full_gym",
        "home_gym",
        "dumbbells",
        "resistance_bands",
        "bodyweight_only",
      ])
    )
    .min(1),
});

export const preferencesSchema = z.object({
  injuries: z.string().optional(),
  preferences: z.string().optional(),
});

export const completeOnboardingSchema = basicsSchema
  .merge(goalsSchema)
  .merge(experienceSchema)
  .merge(scheduleSchema)
  .merge(equipmentSchema)
  .merge(preferencesSchema);
