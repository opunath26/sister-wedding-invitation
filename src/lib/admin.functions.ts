import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type AdminWish = { id: string; name: string; message: string; createdAt: string; status: "pending" | "approved" | "rejected" };
export type AdminRsvp = { id: string; guestName: string; attendance: "attending" | "not_attending"; guestCount: number; phone: string; message: string; createdAt: string; emailSent: boolean };

type Ctx = { supabase: SupabaseClient<Database>; userId: string };
async function assertAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || !data) throw new Error("Unauthorized");
}

export const adminMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const c = async (q: PromiseLike<{ count: number | null; error: unknown }>) => { const r = await q; if (r.error) throw r.error; return r.count ?? 0; };
    const w = () => sb.from("wedding_wishes").select("id", { count: "exact", head: true });
    const r = () => sb.from("wedding_rsvps").select("id", { count: "exact", head: true });
    const [totalWishes, pending, approved, totalRsvps, attending, notAttending, heads] = await Promise.all([
      c(w()), c(w().eq("status", "pending")), c(w().eq("status", "approved")),
      c(r()), c(r().eq("attendance", "attending")), c(r().eq("attendance", "not_attending")),
      readAllRsvps(sb, "attending"),
    ]);
    const confirmedGuests = heads.reduce((a, x) => a + x.guest_count, 0);
    return { totalWishes, pending, approved, totalRsvps, attending, notAttending, confirmedGuests };
  });

export const adminListWishes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ status: z.enum(["all", "pending", "approved", "rejected"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase.from("wedding_wishes").select("id,name,message,status,created_at").order("created_at", { ascending: false }).limit(500);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows.map((d): AdminWish => ({ id: d.id, name: d.name, message: d.message, status: d.status as AdminWish["status"], createdAt: d.created_at }));
  });

export const adminSetWishStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase.from("wedding_wishes").update({ status: data.status }).eq("id", data.id).select("id");
    if (error) throw error;
    return { ok: rows.length === 1 };
  });

export const adminDeleteWish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase.from("wedding_wishes").delete().eq("id", data.id).select("id");
    if (error) throw error;
    return { ok: rows.length === 1 };
  });

async function readAllRsvps(sb: SupabaseClient<Database>, attendance: "all" | "attending" | "not_attending") {
  const rows: Database["public"]["Tables"]["wedding_rsvps"]["Row"][] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from("wedding_rsvps").select("*").order("created_at", { ascending: false }).order("id", { ascending: false }).range(from, from + 999);
    if (attendance !== "all") q = q.eq("attendance", attendance);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

export const adminListRsvps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ attendance: z.enum(["all", "attending", "not_attending"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const rows = await readAllRsvps(context.supabase, data.attendance);
    return rows.map((d): AdminRsvp => ({
      id: d.id, guestName: d.guest_name, attendance: d.attendance as AdminRsvp["attendance"], guestCount: d.guest_count,
      phone: d.phone ?? "", message: d.message ?? "", createdAt: d.created_at, emailSent: d.email_sent,
    }));
  });
