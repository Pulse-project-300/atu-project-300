import { z } from "zod";

export const profileSchema = z.object({
  dob: z.string(),
  gender: z.enum(["male", "female", "other"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  fitnessGoal: z.string().min(1),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  equipment: z
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

export const completeOnboardingSchema = profileSchema;
