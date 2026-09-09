import { z } from "zod";

export const indianMobile = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const quoteSchema = z.object({
  variantId: z.string().min(1),
  condition: z.record(z.string(), z.string()),
  extras: z.record(z.string(), z.string()),
  battery: z.string().min(1),
});

export const orderSchema = z.object({
  variantId: z.string().optional(),
  custom: z
    .object({
      brand: z.string().min(1),
      model: z.string().min(1),
      deviceType: z.string().min(1),
      ram: z.string().optional(),
      storage: z.string().optional(),
      processor: z.string().optional(),
      configuration: z.string().optional(),
      colour: z.string().optional(),
      purchaseYear: z.string().optional(),
      conditionNote: z.string().optional(),
      imeiOrSerial: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  deviceType: z.string().optional(),
  condition: z.record(z.string(), z.string()),
  extras: z.record(z.string(), z.string()),
  battery: z.string().min(1),
  photos: z.array(
    z.object({
      kind: z.string(),
      url: z.string(),
    }),
  ),
  customer: z.object({
    fullName: z.string().min(2).max(80),
    alternate: z.string().optional(),
    email: z.string().email("Enter a valid email address"),
    mobile: indianMobile,
  }),
  address: z.object({
    building: z.string().min(2),
    flatNumber: z.string().min(1),
    street: z.string().min(2),
    areaId: z.string().min(1),
    city: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    landmark: z.string().optional(),
  }),
  pickupDate: z.string().min(1),
  pickupSlotId: z.string().min(1),
  source: z.string().optional(),
  diagnosis: z
    .object({
      consent: z.record(z.string(), z.unknown()).optional(),
      detection: z.unknown().optional(),
      capabilities: z.unknown().optional(),
      tests: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          outcome: z.string(),
          source: z.string(),
          detail: z.string().optional(),
        }),
      ),
      battery: z.unknown().optional(),
      imei: z.string().optional(),
      serialNumber: z.string().optional(),
      aiAssessment: z.unknown().optional(),
      quote: z.unknown().optional(),
      issues: z.array(z.string()).optional(),
      events: z
        .array(
          z.object({
            step: z.string(),
            source: z.string(),
            label: z.string(),
            detail: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
}).refine((data) => Boolean(data.custom) || Boolean(data.variantId), {
  message: "Select a catalogue model or add your device manually",
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
  otp: z.string().optional(),
});

export const trackSchema = z.object({
  orderNumber: z.string().min(6),
  mobile: indianMobile,
});
