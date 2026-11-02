import { beforeEach, describe, expect, it, vi } from "vitest";
import { rsvpInput } from "@/lib/rsvp.schema";
import { sendSavedRsvpEmail } from "@/lib/emailjs.server";
import type { Tables } from "@/integrations/supabase/types";

const state = vi.hoisted(() => ({ rows: [] as Record<string, unknown>[], allowed: true, failWrite: false }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: () => {
    let action = "read"; let value: Record<string, unknown> = {}; const filters: [string, unknown][] = [];
    const q = {
      select: () => q, eq: (key: string, val: unknown) => { filters.push([key, val]); return q; },
      upsert: (val: Record<string, unknown>) => { action = "insert"; value = val; return q; },
      update: (val: Record<string, unknown>) => { action = "update"; value = val; return q; },
      maybeSingle: async () => ({ data: state.rows.find(r => filters.every(([k,v]) => r[k] === v)) ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) => {
        if (state.failWrite) return Promise.resolve(resolve({ data: null, error: new Error("unavailable") }));
        let matches = state.rows.filter(r => filters.every(([k,v]) => r[k] === v));
        if (action === "insert") {
          matches = [];
          if (!state.rows.some(r => r["submission_id"] === value["submission_id"])) {
            const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), email_sent: false, ...value };
            state.rows.push(row); matches = [row];
          }
        } else if (action === "update") matches.forEach(r => Object.assign(r, value));
        return Promise.resolve(resolve({ data: matches, error: null }));
      },
    }; return q;
  },
} }));
vi.mock("@/lib/security.server", () => ({
  clean: (s: string) => s.replace(/[<>]/g, "").trim(), clientKey: async () => "test",
  rateLimit: async () => state.allowed, sha256Hex: async (s: string) => `hash:${s}`,
}));
import { notifySavedRsvp, persistRsvp } from "@/lib/rsvp.server";

const config = { serviceId: "test-service", templateId: "test-template", publicKey: "test-public", privateKey: "test-private" };
const input = () => ({ submissionId: crypto.randomUUID(), guestName: "Test Guest", attendance: "attending" as const, guestCount: 3, phone: "+8801700000000", message: "Test reply" });

beforeEach(() => { state.rows = []; state.allowed = true; state.failWrite = false; vi.restoreAllMocks(); });
describe("RSVP rules", () => {
  it("validates attending counts from 1 through 20", () => {
    expect(rsvpInput.safeParse({ ...input(), guestCount: 0 }).success).toBe(false);
    expect(rsvpInput.safeParse({ ...input(), guestCount: 20 }).success).toBe(true);
    expect(rsvpInput.safeParse({ ...input(), guestCount: 21 }).success).toBe(false);
  });
  it("rejects invalid phone and overlong names/messages", () => {
    expect(rsvpInput.safeParse({ ...input(), phone: "abc123" }).success).toBe(false);
    expect(rsvpInput.safeParse({ ...input(), guestName: "a".repeat(81) }).success).toBe(false);
    expect(rsvpInput.safeParse({ ...input(), message: "a".repeat(301) }).success).toBe(false);
  });
  it("saves attending fields and retains the row without credentials", async () => {
    const data = input(); const result = await persistRsvp(data, {});
    expect(result).toMatchObject({ ok: true, emailStatus: "not_configured" });
    expect(state.rows[0]).toMatchObject({ guest_name: data.guestName, guest_count: 3, phone: data.phone, message: data.message, email_sent: false });
  });
  it("saves not attending with zero guests", async () => {
    await persistRsvp({ ...input(), attendance: "not_attending", guestCount: 0 }, {});
    expect(state.rows[0]).toMatchObject({ attendance: "not_attending", guest_count: 0 });
  });
  it("prevents duplicate rows and duplicate sends under concurrent requests", async () => {
    const send = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("OK"));
    const data = input(); await Promise.all([persistRsvp(data, config), persistRsvp(data, config)]);
    expect(state.rows).toHaveLength(1); expect(send).toHaveBeenCalledTimes(1);
  });
  it("marks sent only after successful provider acceptance and includes submission time", async () => {
    const send = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      expect(state.rows[0]?.["email_sent"]).toBe(false); return new Response("OK");
    });
    const data = input(); const result = await persistRsvp(data, config);
    expect(result).toMatchObject({ ok: true, emailStatus: "sent" });
    expect(state.rows[0]?.["email_sent"]).toBe(true);
    const params = JSON.parse(String(send.mock.calls[0]?.[1]?.body)).template_params;
    expect(params).toMatchObject({ guest_name: data.guestName, phone: data.phone, guest_count: "3", message: data.message });
    expect(params.submitted_at).toContain("Asia/Dhaka");
  });
  it("retains saved RSVP on provider failure and retries without adding a row", async () => {
    const send = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("Denied", { status: 403 })).mockResolvedValue(new Response("OK"));
    const data = input(); const result = await persistRsvp(data, config);
    expect(result).toMatchObject({ ok: true, emailStatus: "pending" }); expect(state.rows[0]?.["email_sent"]).toBe(false);
    if (!result.ok || !result.emailToken) throw new Error("missing token");
    expect(await notifySavedRsvp(data.submissionId, result.emailToken, config)).toBe("sent");
    expect(state.rows).toHaveLength(1); expect(send).toHaveBeenCalledTimes(2);
  });
  it("rejects forged email retry tokens", async () => {
    const data = input(); await persistRsvp(data, {});
    const send = vi.spyOn(globalThis, "fetch");
    expect(await notifySavedRsvp(data.submissionId, "wrong-token", config)).toBe("pending");
    expect(send).not.toHaveBeenCalled(); expect(state.rows[0]?.["email_sent"]).toBe(false);
  });
  it("sends at most once when email retries race", async () => {
    const data = input(); const result = await persistRsvp(data, {});
    if (!result.ok || !result.emailToken) throw new Error("missing token");
    const send = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("OK"));
    await Promise.all([notifySavedRsvp(data.submissionId, result.emailToken, config), notifySavedRsvp(data.submissionId, result.emailToken, config)]);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("does not send or report success when database saving fails", async () => {
    state.failWrite = true; const send = vi.spyOn(globalThis, "fetch");
    await expect(persistRsvp(input(), config)).rejects.toThrow("unavailable"); expect(send).not.toHaveBeenCalled();
  });
  it("keeps a saved reply on network timeout", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("timeout"));
    const result = await persistRsvp(input(), config);
    expect(result).toMatchObject({ ok: true, emailStatus: "pending" }); expect(state.rows).toHaveLength(1);
  });
  it("returns not configured without a provider request", async () => {
    const send = vi.fn();
    expect(await sendSavedRsvpEmail({} as Tables<"wedding_rsvps">, {}, send)).toBe("not_configured");
    expect(send).not.toHaveBeenCalled();
  });
});