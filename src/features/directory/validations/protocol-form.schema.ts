import { z } from "zod";
import { PRIORITY_CATEGORIES } from "@/features/directory/lib/priority-from-category";

export const RESERVATION_VERIFICATIONS = [
  "Required",
  "Not Required",
  "Required on Escalated",
] as const;

const orderedStepSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  hint: z.string().optional(),
  position: z.number().int().nonnegative(),
});

const protocolFieldsSchema = z.object({
  propertyId: z.string().uuid("Invalid property id."),
  category: z.string().trim().min(1, "Category is required."),
  name: z.string().trim().min(1, "Name is required."),
  reservationVerification: z.enum(RESERVATION_VERIFICATIONS),
  priorityCategory: z.enum(PRIORITY_CATEGORIES),
  steps: z.array(orderedStepSchema),
  customerContactId: z.string().uuid("Invalid contact id.").nullable().optional(),
  escalationKind: z
    .enum(["host", "emergency-then-host", "next-day-followup", "cleaning", "custom"])
    .nullable()
    .optional(),
  escalationDetails: z.string().trim().optional(),
});

function refineEscalation(
  data: z.infer<typeof protocolFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  const hasContact = Boolean(data.customerContactId);
  const hasKind = Boolean(data.escalationKind);
  if (!hasContact && !hasKind) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a contact or an escalation preset.",
      path: ["escalationKind"],
    });
  }
  if (hasContact && hasKind) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Use either a contact or a preset, not both.",
      path: ["customerContactId"],
    });
  }
  if (data.escalationKind === "custom" && !data.escalationDetails?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom escalation details are required.",
      path: ["escalationDetails"],
    });
  }
}

export const createProtocolSchema = protocolFieldsSchema.superRefine(refineEscalation);

export const updateProtocolSchema = protocolFieldsSchema
  .extend({
    id: z.string().uuid("Invalid protocol id."),
  })
  .superRefine(refineEscalation);

export const listProtocolsQuerySchema = z.object({
  propertyId: z.string().uuid("Invalid property id."),
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  search: z.string().optional(),
});

export const protocolIdSchema = z.object({
  id: z.string().uuid("Invalid protocol id."),
});

export type CreateProtocolInput = z.infer<typeof createProtocolSchema>;
export type UpdateProtocolInput = z.infer<typeof updateProtocolSchema>;
