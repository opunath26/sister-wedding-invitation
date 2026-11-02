
import type { Tables } from "@/integrations/supabase/types";

export type EmailConfig = {
  serviceId?: string | undefined;
  templateId?: string | undefined;
  publicKey?: string | undefined;
  privateKey?: string | undefined;
};

/** Only saved values are sent; the template owns the fixed organizer recipient. */
export async function sendSavedRsvpEmail(
  row: Tables<"wedding_rsvps">,
  config: EmailConfig,
  send: typeof fetch = fetch
) {
  if (
    !config.serviceId ||
    !config.templateId ||
    !config.publicKey ||
    !config.privateKey
  ) {
    return "not_configured" as const;
  }

  const submittedAt =
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(row.created_at)) + " (Asia/Dhaka, UTC+6)";

  try {
    const response = await send(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          accessToken: config.privateKey,
          template_params: {
            guest_name: row.guest_name,
            attendance:
              row.attendance === "attending"
                ? "Attending (উপস্থিত থাকবেন)"
                : "Not attending (উপস্থিত থাকবেন না)",
            guest_count: String(row.guest_count),
            phone: row.phone || "—",
            message: row.message || "—",
            submitted_at: submittedAt,
            submission_id: row.submission_id,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("RSVP EmailJS rejected request:", {
        status: response.status,
        message: errorText.slice(0, 500),
      });

      return "pending" as const;
    }

    return "sent" as const;
  } catch {
    console.error("RSVP EmailJS request failed or timed out");
    return "pending" as const;
  }
}
