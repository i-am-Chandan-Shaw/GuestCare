import { z } from "zod";

const orderedStepSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  hint: z.string().optional(),
  position: z.number().int().nonnegative(),
});

const contactSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  name: z.string(),
  phone: z.string(),
  position: z.number().int().nonnegative(),
});

const customerFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "A valid email is required.",
    )
    .optional(),
  phone: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  pmsUrl: z.string().trim().optional(),
  pmsUsername: z.string().trim().optional(),
  pmsPassword: z.string().optional(),
  slackWebhookUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.startsWith("https://hooks.slack.com/"),
      "Enter a valid Slack incoming webhook URL.",
    )
    .optional(),
  contacts: z.array(contactSchema),
  guestVerificationSteps: z.array(orderedStepSchema),
});

export const createCustomerSchema = customerFieldsSchema;

export const updateCustomerSchema = customerFieldsSchema.extend({
  id: z.string().uuid("Invalid customer id."),
});

export const listCustomersQuerySchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  search: z.string().optional(),
});

export const customerIdSchema = z.object({
  id: z.string().uuid("Invalid customer id."),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
