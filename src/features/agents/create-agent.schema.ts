import { z } from "zod";

const customerScopeSchema = z.union([
  z.object({ type: z.literal("all") }),
  z.object({
    type: z.literal("specific"),
    customerIds: z.array(z.string()).min(1),
  }),
]);

export const createAgentSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  role: z.enum(["admin", "manager", "user"]),
  isActive: z.boolean().optional(),
  customerScope: customerScopeSchema,
  password: z.string().min(1, "Password is required."),
});
