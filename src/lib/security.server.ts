import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Strip control chars / angle brackets, collapse whitespace, trim. Output is rendered as text (never HTML). */
export function clean(input: string, max: number): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hashed visitor identifier; raw IPs are never stored.
 * On Cloudflare, cf-connecting-ip is set by the edge and cannot be spoofed by the client.
 * X-Forwarded-For is deliberately ignored. Outside Cloudflare (local dev) we fall back to the socket address.
 */
export async function clientKey() {
  const ip = getRequestHeader("cf-connecting-ip")?.trim() || getRequestIP() || "unknown";
  return sha256("wedding|" + ip);
}

export const sha256Hex = sha256;

/**
 * Atomic fixed-window rate limit. The check, cleanup and insert run in one database
 * transaction under a per-key lock, so simultaneous requests cannot exceed the limit.
 * Returns true if allowed. Throws on database errors (callers fail closed).
 */
export async function rateLimit(bucket: string, id: string, limit: number, windowSec: number) {
  const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
    _key: `${bucket}:${id}`, _limit: limit, _window_seconds: windowSec,
  });
  if (error) throw error;
  return data === true;
}
