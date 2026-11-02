import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Lotus } from "@/components/wedding/Ornaments";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set password — শুভ বিবাহ" },
      { name: "description", content: "Set a new admin password." },
      { property: "og:title", content: "Set password — শুভ বিবাহ" },
      { property: "og:description", content: "Set a new admin password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [p, setP] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (p.length < 8) { setErr("Use at least 8 characters."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.auth.updateUser({ password: p });
    setBusy(false);
    if (error) { setErr("Link expired or invalid. Request a new one."); return; }
    void nav({ to: "/admin" });
  };
  const input = "w-full border border-gold/50 bg-ivory px-4 py-3 text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-gold";
  return (
    <div className="grid min-h-screen place-items-center bg-maroon alpana-dark px-4">
      <form onSubmit={submit} className="invite-panel w-full max-w-sm space-y-4 px-8 py-10">
        <Lotus className="mx-auto text-gold" size={52} />
        <h1 className="text-center font-bengali text-2xl text-gold">Set new password</h1>
        <input type="password" autoComplete="new-password" aria-label="New password" className={input} value={p} onChange={(e) => setP(e.target.value)} />
        {err && <p className="text-sm text-error-soft" role="alert">{err}</p>}
        <button className="btn-gold w-full justify-center" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save password"}</button>
      </form>
    </div>
  );
}
