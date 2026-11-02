
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rsvpInput } from "./rsvp.schema";

export const saveRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => rsvpInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const { persistRsvp } = await import("./rsvp.server");
      return await persistRsvp(data, {
        serviceId: process.env["EMAILJS_SERVICE_ID"],
        templateId: process.env["EMAILJS_TEMPLATE_ID"],
        publicKey: process.env["EMAILJS_PUBLIC_KEY"],
        privateKey: process.env["EMAILJS_PRIVATE_KEY"],
      });
    } catch (error) {
      console.error("RSVP could not be saved:", error);
      return {
        ok: false as const,
        error: "দুঃখিত, এখন উত্তর সংরক্ষণ করা যাচ্ছে না। পরে আবার চেষ্টা করুন",
      };
    }
  });

export const retryRsvpEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        emailToken: z.string().min(40).max(100),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { notifySavedRsvp } = await import("./rsvp.server");
      const { clientKey, rateLimit } = await import("./security.server");

      if (!(await rateLimit("rsvp-email", await clientKey(), 5, 3600))) {
        return { emailStatus: "pending" as const };
      }

      return {
        emailStatus: await notifySavedRsvp(data.submissionId, data.emailToken, {
          serviceId: process.env["EMAILJS_SERVICE_ID"],
          templateId: process.env["EMAILJS_TEMPLATE_ID"],
          publicKey: process.env["EMAILJS_PUBLIC_KEY"],
          privateKey: process.env["EMAILJS_PRIVATE_KEY"],
        }),
      };
    } catch (error) {
      console.error("RSVP email retry failed:", error);
      return { emailStatus: "pending" as const };
    }
  });
