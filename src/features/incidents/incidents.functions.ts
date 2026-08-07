import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSession } from "@/shared/lib/server-auth";
import { throwHttpError } from "@/shared/lib/server-fn-error";

const sendSlackMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required."),
});

/**
 * Posts a plain-text status message to the configured Slack incoming webhook.
 * Webhook URL stays server-side only (`SLACK_WEBHOOK_URL`).
 */
export const sendIncidentSlackFn = createServerFn({ method: "POST" })
  .validator(sendSlackMessageSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireSession();

    const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      throwHttpError(
        "Slack is not configured. Set SLACK_WEBHOOK_URL on the server.",
        503,
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
