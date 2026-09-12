import { z } from "zod";

export const punePincodeRegex = /^41\d{4}$/;
export const indianPhoneRegex = /^[6-9]\d{9}$/;

export const profileAddressSchema = z.object({
  line1: z.string().trim().min(5, "Address line must be at least 5 characters"),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim(),
  pincode: z
    .string()
    .trim()
    .regex(
      punePincodeRegex,
      "Delivery is available only for Pune pincodes (starting with 41, e.g. 412105)",
    ),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
  address: profileAddressSchema,
});

export type ProfileAddress = z.infer<typeof profileAddressSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
