import { z } from "zod";

export const customerScopeSchema = z.union([
  z.object({ type: z.literal("all") }),
  z.object({
    type: z.literal("specific"),
    customerIds: z.array(z.string()).min(1),
  }),
]);

const agentFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  role: z.enum(["admin", "manager", "user"]),
  customerScope: customerScopeSchema,
});

export const createAgentSchema = agentFieldsSchema.extend({
  isActive: z.boolean().optional(),
  password: z.string().min(1, "Password is required."),
});

export const updateAgentSchema = agentFieldsSchema.extend({
  id: z.string().uuid("Invalid agent id."),
  isActive: z.boolean(),
  password: z.string().optional(),
});
