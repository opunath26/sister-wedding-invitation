import { z } from "zod";

export const rsvpInput = z.object({
  submissionId: z.string().uuid(),
  guestName: z.string().trim().min(2).max(80),
  attendance: z.enum(["attending", "not_attending"]),
  guestCount: z.number().int().min(0).max(20),
  phone: z.string().trim().max(20).refine((v) => !v || /^[0-9+\-\s()]{6,20}$/.test(v)).optional(),
  message: z.string().trim().max(300).optional(),
  website: z.string().max(200).optional(),
}).superRefine((v, ctx) => {
  if (v.attendance === "attending" && v.guestCount < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guestCount"], message: "অতিথির সংখ্যা ১ থেকে ২০-এর মধ্যে দিন" });
  }
});

export type RsvpInput = z.infer<typeof rsvpInput>;
export type EmailStatus = "sent" | "pending" | "not_configured";