import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const WISH_PAGE = 6;
export type PublicWish = { id: string; name: string; message: string; createdAt: string };

const fail = (msg: string) => ({ ok: false as const, error: msg });

export const listApprovedWishes = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ page: z.number().int().min(0).max(500) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const from = data.page * WISH_PAGE;
      const { data: rows, error } = await supabaseAdmin
        .from("wedding_wishes").select("id,name,message,created_at").eq("status", "approved")
        .order("created_at", { ascending: false }).range(from, from + WISH_PAGE);
      if (error) throw error;
      return {
        ok: true as const,
        hasMore: rows.length > WISH_PAGE,
        items: rows.slice(0, WISH_PAGE).map((d): PublicWish => ({ id: d.id, name: d.name, message: d.message, createdAt: d.created_at })),
      };
    } catch (e) {
      console.error("listApprovedWishes", (e as Error).message);
      return { ok: false as const, hasMore: false, items: [] as PublicWish[] };
    }
  });

const wishInput = z.object({
  name: z.string().trim().min(2).max(60),
  message: z.string().trim().min(3).max(250),
  website: z.string().max(200).optional(), // honeypot
  elapsedMs: z.number().int().min(0),
});

export const submitWish = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => wishInput.parse(d))
  .handler(async ({ data }) => {
    if (data.website || data.elapsedMs < 2500) return { ok: true as const };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { clean, clientKey, rateLimit } = await import("./security.server");
      const name = clean(data.name, 60);
      const message = clean(data.message, 250);
      if (name.length < 2 || message.length < 3) return fail("নাম ও শুভেচ্ছাবার্তা সঠিকভাবে লিখুন");
      if ((message.match(/https?:\/\/|www\./gi) ?? []).length > 0) return fail("বার্তায় লিংক যোগ করা যাবে না");
      const ip = await clientKey();
      if (!(await rateLimit("wish", ip, 3, 600))) return fail("অনেকবার চেষ্টা করেছেন, কিছুক্ষণ পর আবার চেষ্টা করুন");
      const { count } = await supabaseAdmin.from("wedding_wishes").select("id", { count: "exact", head: true })
        .eq("ip_hash", ip).eq("message", message).gte("created_at", new Date(Date.now() - 86400000).toISOString());
      if (count) return { ok: true as const };
      const { error } = await supabaseAdmin.from("wedding_wishes").insert({ name, message, status: "pending", ip_hash: ip });
      if (error) throw error;
      return { ok: true as const };
    } catch (e) {
      console.error("submitWish", (e as Error).message);
      return fail("দুঃখিত, এখন বার্তা পাঠানো যাচ্ছে না। পরে আবার চেষ্টা করুন");
    }
  });

