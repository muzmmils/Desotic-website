import { z } from "zod";

export const addToCartSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(20),
  imageUrl: z.string().optional(),
  customizations: z.record(z.string()).optional(),
});

export const deliveryAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number is required"),
  line1: z.string().trim().min(5, "Flat / House No / Street is required"),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().default("Pune"),
  pincode: z
    .string()
    .trim()
    .regex(/^41\d{4}$/, "Delivery is currently available in Pune pincodes (41xxxx)"),
});

export const checkoutSchema = z.object({
  deliveryDate: z.string().min(10, "Select a delivery date"),
  deliverySlot: z.enum(["morning", "afternoon", "evening"]),
  address: deliveryAddressSchema,
  notes: z.string().max(250).optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
