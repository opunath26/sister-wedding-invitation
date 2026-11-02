import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { clean, clientKey, rateLimit, sha256Hex } from "./security.server";
import { sendSavedRsvpEmail, type EmailConfig } from "./emailjs.server";
import type { EmailStatus, RsvpInput } from "./rsvp.schema";

export async function notifySavedRsvp(submissionId: string, emailToken: string, config: EmailConfig): Promise<EmailStatus> {
  const hash = await sha256Hex(emailToken);
  const { data: row, error } = await supabaseAdmin.from("wedding_rsvps").select("*")
    .eq("submission_id", submissionId).maybeSingle();
  if (error || !row) return "pending";
  if (row.email_sent) return "sent";
  if (row.email_token_hash !== hash || Date.now() - Date.parse(row.created_at) > 3600000) return "pending";
  if (!config.serviceId || !config.templateId || !config.publicKey || !config.privateKey) return "not_configured";
  // Compare-and-swap claims the existing token column; concurrent requests cannot both send.
  const claim = `sending:${crypto.randomUUID()}`;
  const { data: claimed, error: claimError } = await supabaseAdmin.from("wedding_rsvps")
    .update({ email_token_hash: claim }).eq("id", row.id).eq("email_token_hash", hash)
    .eq("email_sent", false).select("id");
  if (claimError || !claimed?.length) return "pending";
  const result = await sendSavedRsvpEmail(row, config);
  const { error: updateError } = await supabaseAdmin.from("wedding_rsvps").update(
    result === "sent" ? { email_sent: true, email_token_hash: null } : { email_token_hash: hash },
  ).eq("id", row.id).eq("email_token_hash", claim);
  // An accepted email with an uncertain flag must not be sent again automatically.
  if (updateError) console.error("RSVP email status could not be recorded");
  return result;
}

export async function persistRsvp(data: RsvpInput, config: EmailConfig) {
  if (data.website) return { ok: false as const, error: "উত্তর সংরক্ষণ করা যায়নি" };
  const guestName = clean(data.guestName, 80);
  if (guestName.length < 2) return { ok: false as const, error: "অনুগ্রহ করে আপনার নাম লিখুন" };
  const { data: existing, error: readError } = await supabaseAdmin.from("wedding_rsvps")
    .select("email_sent").eq("submission_id", data.submissionId).maybeSingle();
  if (readError) throw readError;
  if (existing) return { ok: true as const, emailToken: null, emailStatus: existing.email_sent ? "sent" as const : "pending" as const };
  if (!(await rateLimit("rsvp", await clientKey(), 5, 3600))) {
    return { ok: false as const, error: "অনেকবার চেষ্টা করেছেন, কিছুক্ষণ পর আবার চেষ্টা করুন" };
  }
  const emailToken = crypto.randomUUID() + crypto.randomUUID();
  const { data: inserted, error } = await supabaseAdmin.from("wedding_rsvps").upsert({
    submission_id: data.submissionId, guest_name: guestName, attendance: data.attendance,
    guest_count: data.attendance === "attending" ? data.guestCount : 0,
    phone: data.phone ? clean(data.phone, 20) : null,
    message: data.message ? clean(data.message, 300) : null,
    email_token_hash: await sha256Hex(emailToken),
  }, { onConflict: "submission_id", ignoreDuplicates: true }).select("id");
  if (error) throw error;
  if (!inserted?.length) return { ok: true as const, emailToken: null, emailStatus: "pending" as const };
  let emailStatus: EmailStatus = "pending";
  try { emailStatus = await notifySavedRsvp(data.submissionId, emailToken, config); }
  catch { console.error("Saved RSVP notification failed"); }
  return { ok: true as const, emailToken, emailStatus };
}