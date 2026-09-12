import { z } from "zod";
import { profileAddressSchema } from "./profile";

export const subscriptionPlanTierSchema = z.enum(["starter", "power", "ultimate"]);
export const billingCycleSchema = z.enum(["weekly", "monthly", "quarterly"]);
export const deliverySlotSchema = z.enum(["morning", "afternoon", "evening"]);

export const subscriptionOnboardingSchema = z.object({
  planTier: subscriptionPlanTierSchema,
  billingCycle: billingCycleSchema,
  mealsPerWeek: z.number().int().min(3).max(7),
  fitnessGoal: z.enum(["weight_loss", "high_protein", "balanced", "keto", "vegan", "muscle_gain"]),
  calorieTarget: z.number().int().min(1200).max(3500),
  dietaryPreferences: z.array(z.string()).default([]),
  deliverySlot: deliverySlotSchema,
  deliveryAddress: profileAddressSchema,
  startDate: z.string().min(10, "Select a start date"),
});

export type SubscriptionPlanTier = z.infer<typeof subscriptionPlanTierSchema>;
export type BillingCycle = z.infer<typeof billingCycleSchema>;
export type DeliverySlot = z.infer<typeof deliverySlotSchema>;
export type SubscriptionOnboardingInput = z.infer<typeof subscriptionOnboardingSchema>;
