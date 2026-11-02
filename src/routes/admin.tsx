import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BarChart3, Check, Heart, Loader2, LogOut, Menu, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminDeleteWish, adminListRsvps, adminListWishes, adminMe, adminSetWishStatus, adminStats,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Lotus } from "@/components/wedding/Ornaments";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — শুভ বিবাহ" },
      { name: "description", content: "Private dashboard for managing wedding wishes and RSVPs." },
      { property: "og:title", content: "Admin Dashboard — শুভ বিবাহ" },
      { property: "og:description", content: "Private dashboard for managing wedding wishes and RSVPs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function useSession() {
  const [state, setState] = useState<{ ready: boolean; email: string | null }>({ ready: false, email: null });
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setState({ ready: true, email: s?.user.email ?? null }));
    supabase.auth.getSession().then(({ data }) => setState({ ready: true, email: data.session?.user.email ?? null }));
    return () => sub.subscription.unsubscribe();
  }, []);
  return state;
}

function AdminPage() {
  const session = useSession();
  const me = useServerFn(adminMe);
  const q = useQuery({ queryKey: ["admin", "me", session.email], queryFn: () => me(), enabled: !!session.email });
  const loading = <div className="grid min-h-screen place-items-center bg-burgundy"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  if (!session.ready) return loading;
  if (!session.email) return <Login />;
  if (q.isLoading) return loading;
  if (!q.data?.isAdmin) return <NotAdmin email={session.email} />;
  return <Dashboard username={session.email} />;
}

function NotAdmin({ email }: { email: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-maroon alpana-dark px-4">
      <div className="invite-panel w-full max-w-sm space-y-4 px-8 py-10 text-center">
        <Lotus className="mx-auto text-gold" size={52} />
        <h1 className="font-bengali text-2xl text-gold">No admin access</h1>
        <p className="text-sm text-ivory/80">{email} is signed in but isn't an admin.</p>
        <button className="btn-gold w-full justify-center" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    </div>
  );
}

function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !u || !p) return;
    setBusy(true); setErr(""); setInfo("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: u.trim(), password: p });
      if (error) { setErr("Invalid email or password."); return; }
      setP("");
    } catch {
      setErr("Login failed. Try again.");
    } finally { setBusy(false); }
  };
  const reset = async () => {
    if (!u) { setErr("Enter your email first."); return; }
    setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(u.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) setErr("Couldn't send reset email."); else setInfo("Check your inbox for a password link.");
  };
  const input = "w-full border border-gold/50 bg-ivory px-4 py-3 text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-gold";
  return (
    <div className="grid min-h-screen place-items-center bg-maroon alpana-dark px-4">
      <form onSubmit={submit} className="invite-panel w-full max-w-sm space-y-4 px-8 py-10">
        <Lotus className="mx-auto text-gold" size={52} />
        <h1 className="text-center font-bengali text-2xl text-gold">Admin Login</h1>
        <div>
          <label htmlFor="a-user" className="mb-1 block text-sm text-gold-soft">Email</label>
          <input id="a-user" type="email" autoComplete="username" className={input} value={u} onChange={(e) => setU(e.target.value)} />
        </div>
        <div>
          <label htmlFor="a-pass" className="mb-1 block text-sm text-gold-soft">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password" className={input} value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        {err && <p className="text-sm text-error-soft" role="alert">{err}</p>}
        {info && <p className="text-sm text-gold-soft">{info}</p>}
        <button className="btn-gold w-full justify-center" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}</button>
        <button type="button" onClick={reset} className="block w-full text-center text-xs text-gold-soft hover:text-gold">Set or reset password</button>
        <Link to="/" className="block text-center text-xs text-ivory/60 hover:text-gold">← Back to invitation</Link>
      </form>
    </div>
  );
}

type Tab = "overview" | "wishes" | "rsvps";

function Dashboard({ username }: { username: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const doLogout = async () => {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    qc.clear();
    toast.success("Logged out");
  };
  const nav: [Tab, string, ReactNode][] = [
    ["overview", "Overview", <BarChart3 key="o" className="h-4 w-4" />],
    ["wishes", "Wishes", <Heart key="w" className="h-4 w-4" />],
    ["rsvps", "RSVPs", <Users key="r" className="h-4 w-4" />],
  ];
  const Nav = (
    <nav className="space-y-1">
      {nav.map(([k, label, icon]) => (
        <button key={k} onClick={() => { setTab(k); setOpen(false); }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${tab === k ? "bg-gold text-burgundy" : "text-ivory/85 hover:bg-maroon"}`}>
          {icon}{label}
        </button>
      ))}
      <button onClick={doLogout} className="mt-6 flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ivory/70 hover:bg-maroon"><LogOut className="h-4 w-4" />Logout</button>
    </nav>
  );
  return (
    <div className="min-h-screen bg-ivory md:flex">
      <aside className="hidden w-60 shrink-0 bg-burgundy p-5 md:block">
        <div className="mb-8 flex items-center gap-2"><Lotus className="text-gold" size={32} /><span className="font-bengali text-xl text-gold">শুভ বিবাহ</span></div>
        {Nav}
        <p className="mt-8 px-4 text-xs text-ivory/50">Signed in as {username}</p>
      </aside>
      <header className="flex items-center justify-between bg-burgundy px-4 py-3 md:hidden">
        <span className="font-bengali text-lg text-gold">শুভ বিবাহ · Admin</span>
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="text-gold">{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="bg-burgundy p-3 md:hidden">{Nav}</div>}
      <main className="flex-1 p-4 sm:p-8">
        {tab === "overview" && <Overview />}
        {tab === "wishes" && <WishesAdmin />}
        {tab === "rsvps" && <RsvpsAdmin />}
      </main>
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="mb-6 font-bengali text-2xl font-semibold text-maroon">{children}</h2>;
}
const Spinner = () => <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-maroon" /></div>;
const Empty = ({ text }: { text: string }) => <p className="border border-dashed border-gold/60 py-12 text-center text-ink/60">{text}</p>;
const ErrorBox = () => <p className="border border-destructive/40 bg-card py-8 text-center text-destructive">Couldn't load data. Check the database connection and try again.</p>;

function Overview() {
  const stats = useServerFn(adminStats);
  const q = useQuery({ queryKey: ["admin", "stats"], queryFn: () => stats() });
  if (q.isLoading) return <Spinner />;
  if (q.isError || !q.data) return <ErrorBox />;
  const s = q.data;
  const cards: [string, number][] = [
    ["Total Wishes", s.totalWishes], ["Pending Wishes", s.pending], ["Approved Wishes", s.approved],
    ["Total RSVPs", s.totalRsvps], ["Attending", s.attending], ["Not Attending", s.notAttending], ["Confirmed Guests (headcount)", s.confirmedGuests],
  ];
  return (
    <>
      <Title>Dashboard Overview</Title>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([l, v]) => (
          <div key={l} className="event-card text-left">
            <p className="text-sm text-ink/60">{l}</p>
            <p className="mt-2 text-4xl font-semibold text-maroon">{v}</p>
          </div>
        ))}
      </div>
    </>
  );
}

type Confirm = { kind: "reject" | "delete"; id: string; name: string } | null;

function WishesAdmin() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const list = useServerFn(adminListWishes);
  const setStatus = useServerFn(adminSetWishStatus);
  const del = useServerFn(adminDeleteWish);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "wishes", filter], queryFn: () => list({ data: { status: filter } }) });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (id: string, fn: () => Promise<{ ok: boolean }>, msg: string) => {
    setBusy(id);
    try {
      const r = await fn();
      if (!r.ok) throw new Error();
      toast.success(msg);
      await qc.invalidateQueries({ queryKey: ["admin"] });
    } catch { toast.error("Action failed. Please try again."); }
    finally { setBusy(null); }
  };

  return (
    <>
      <Title>Manage Wishes</Title>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`border px-4 py-1.5 text-sm capitalize ${filter === f ? "border-maroon bg-maroon text-ivory" : "border-gold/60 text-maroon"}`}>{f}</button>
        ))}
      </div>
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox /> : !q.data?.length ? <Empty text="No wishes here." /> : (
        <ul className="space-y-3">
          {q.data.map((w) => (
            <li key={w.id} className="border-l-2 border-gold bg-card px-5 py-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line break-words font-bengali text-ink">“{w.message}”</p>
                  <p className="mt-2 text-sm text-gold-deep">— {w.name} · {new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs capitalize ${w.status === "approved" ? "bg-gold/30 text-maroon" : w.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted text-ink/70"}`}>{w.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {w.status !== "approved" && (
                  <button disabled={busy === w.id} onClick={() => run(w.id, () => setStatus({ data: { id: w.id, status: "approved" } }), "Wish approved")} className="inline-flex items-center gap-1 border border-maroon px-3 py-1 text-sm text-maroon hover:bg-maroon hover:text-ivory"><Check className="h-3.5 w-3.5" />Approve</button>
                )}
                {w.status !== "rejected" && (
                  <button disabled={busy === w.id} onClick={() => setConfirm({ kind: "reject", id: w.id, name: w.name })} className="inline-flex items-center gap-1 border border-gold/70 px-3 py-1 text-sm text-ink/80 hover:bg-muted"><X className="h-3.5 w-3.5" />Reject</button>
                )}
                <button disabled={busy === w.id} onClick={() => setConfirm({ kind: "delete", id: w.id, name: w.name })} className="inline-flex items-center gap-1 border border-destructive/50 px-3 py-1 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.kind === "delete" ? "Delete this wish?" : "Reject this wish?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "delete" ? `The wish from ${confirm?.name} will be permanently deleted.` : `The wish from ${confirm?.name} will be hidden from the public page.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const c = confirm; setConfirm(null); if (!c) return;
              if (c.kind === "delete") void run(c.id, () => del({ data: { id: c.id } }), "Wish deleted");
              else void run(c.id, () => setStatus({ data: { id: c.id, status: "rejected" } }), "Wish rejected");
            }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RsvpsAdmin() {
  const [filter, setFilter] = useState<"all" | "attending" | "not_attending">("all");
  const list = useServerFn(adminListRsvps);
  const q = useQuery({ queryKey: ["admin", "rsvps", filter], queryFn: () => list({ data: { attendance: filter } }) });
  const confirmed = (q.data ?? []).filter((r) => r.attendance === "attending").reduce((a, r) => a + r.guestCount, 0);
  return (
    <>
      <Title>Manage RSVPs</Title>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {([["all", "All"], ["attending", "Attending"], ["not_attending", "Not attending"]] as const).map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)} className={`border px-4 py-1.5 text-sm ${filter === f ? "border-maroon bg-maroon text-ivory" : "border-gold/60 text-maroon"}`}>{l}</button>
        ))}
        {filter !== "not_attending" && <span className="ml-auto text-sm text-maroon">Confirmed attendees: <strong>{confirmed}</strong></span>}
      </div>
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox /> : !q.data?.length ? <Empty text="No RSVPs yet." /> : (
        <div className="overflow-x-auto border border-gold/40 bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-burgundy text-gold">
              <tr>{["Guest", "Attendance", "Guests", "Phone", "Message", "Submitted"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {q.data.map((r) => (
                <tr key={r.id} className="border-t border-gold/20 align-top">
                  <td className="px-4 py-3 font-bengali text-ink">{r.guestName}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs ${r.attendance === "attending" ? "bg-gold/30 text-maroon" : "bg-muted text-ink/70"}`}>{r.attendance === "attending" ? "Attending" : "Not attending"}</span></td>
                  <td className="px-4 py-3">{r.guestCount}</td>
                  <td className="px-4 py-3">{r.phone ? <a href={`tel:${r.phone}`} className="text-maroon underline">{r.phone}</a> : "—"}</td>
                  <td className="max-w-xs whitespace-pre-line break-words px-4 py-3 font-bengali">{r.message || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{new Date(r.createdAt).toLocaleString()}{!r.emailSent && <span className="block text-xs text-destructive">email not sent</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
