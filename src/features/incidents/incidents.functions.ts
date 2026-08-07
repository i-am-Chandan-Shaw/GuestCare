import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toAgentAccess } from "@/features/reports/lib/report-scope";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import { assertCustomerAccess, requireSession } from "@/shared/lib/server-auth";
import { throwHttpError } from "@/shared/lib/server-fn-error";

const sendSlackMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required."),
  customerId: z.string().uuid("Invalid customer id."),
});

/**
 * Posts a plain-text status message to the customer's Slack incoming webhook
 * stored on `customers.slack_webhook_url`.
 */
export const sendIncidentSlackFn = createServerFn({ method: "POST" })
  .validator(sendSlackMessageSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    assertCustomerAccess(agent, data.customerId);

    const supabase = createSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("customers")
      .select("slack_webhook_url")
      .eq("id", data.customerId)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load customer Slack settings.", 500);
    if (!row) throwHttpError("Customer not found.", 404);

    const webhookUrl =
      typeof row.slack_webhook_url === "string" ? row.slack_webhook_url.trim() : "";
    if (!webhookUrl) {
      throwHttpError(
        "Add a Slack webhook URL for this customer in Directory → Basics to send messages.",
        400,
      );
    }

    let response: Response;
    try {
      response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.message }),
      });
    } catch {
      throwHttpError("Could not reach Slack. Try again in a moment.", 502);
    }

    if (!response.ok) {
      throwHttpError(
        `Slack rejected the message (${response.status}). Check the webhook configuration.`,
        502,
      );
    }

    return { ok: true };
  });
