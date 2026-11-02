import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Facebook, Github, ImageIcon, Linkedin, Loader2, Mail, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { wedding, toBn, developerInfo } from "@/data/wedding";
import { shareInvitation } from "@/lib/share";
import { listApprovedWishes, submitWish, type PublicWish } from "@/lib/wedding.functions";
import { saveRsvp, retryRsvpEmail } from "@/lib/rsvp.functions";
import { rsvpInput } from "@/lib/rsvp.schema";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Divider, GoldFrame, Lotus, Reveal, SectionHeading } from "./Ornaments";

export function Gallery() {
  const [active, setActive] = useState<string | null>(null);
  const hasPhotos = wedding.gallery.some((g) => g.src);
  return (
    <section id="gallery" className="bg-ivory px-4 py-20">
      <SectionHeading eyebrow="Gallery" title="ছবির গ্যালারি" />
      <Reveal className="gap-4 sm:gap-6 grid grid-cols-2 md:grid-cols-3 mx-auto max-w-5xl">
        {wedding.gallery.map((g, i) => (
          <GoldFrame key={i} className="aspect-square">
            {g.src ? (
              <button onClick={() => setActive(g.src)} className="w-full h-full" aria-label={`${g.alt} বড় করে দেখুন`}>
                <img src={g.src} alt={g.alt} loading="lazy" className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="place-items-center grid bg-silhouette w-full h-full text-gold/80 text-center">
                <div>
                  <ImageIcon className="mx-auto w-8 h-8" strokeWidth={1} />
                  <p className="mt-2 font-bengali text-sm">{g.category}</p>
                </div>
              </div>
            )}
          </GoldFrame>
        ))}
      </Reveal>
      {!hasPhotos && <p className="mt-8 font-bengali text-ink/60 text-sm text-center">ছবিগুলো শীঘ্রই যুক্ত করা হবে।</p>}
      {active && (
        <div className="z-[60] fixed inset-0 place-items-center grid bg-burgundy/95 p-4" role="dialog" aria-modal onClick={() => setActive(null)}>
          <button className="top-4 right-4 absolute icon-btn" aria-label="বন্ধ করুন"><X className="w-4 h-4" /></button>
          <img src={active} alt="" className="border-2 border-gold max-w-full max-h-[85vh]" />
        </div>
      )}
    </section>
  );
}

type Status = "idle" | "loading" | "success" | "error";
type RsvpErrors = Partial<Record<"name" | "attending" | "guests" | "message" | "phone", string>>;
const emptyRsvp = { name: "", attending: "", guests: "1", phone: "", message: "", website: "" };

export function RSVP() {
  const [form, setForm] = useState(emptyRsvp);
  const [errors, setErrors] = useState<RsvpErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [emailPending, setEmailPending] = useState(false);
  // One id per RSVP attempt; reused on retry so the saved record is never duplicated.
  const submissionId = useRef<string>("");
  const save = useServerFn(saveRsvp);
  const retry = useServerFn(retryRsvpEmail);
  const busy = useRef(false);
  const [retrying, setRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const emailToken = useRef("");

  const validate = () => {
    const e: RsvpErrors = {};
    if (form.name.trim().length < 2) e.name = "অনুগ্রহ করে আপনার নাম লিখুন";
    if (!form.attending) e.attending = "উপস্থিত থাকবেন কি না নির্বাচন করুন";
    const g = Number(form.guests);
    if (form.attending === "yes" && (!Number.isInteger(g) || g < 1 || g > 20)) e.guests = "অতিথির সংখ্যা ১ থেকে ২০-এর মধ্যে দিন";
    if (form.phone && !/^[0-9+\-\s()]{6,20}$/.test(form.phone)) e.phone = "সঠিক ফোন নম্বর দিন";
    if (form.message.length > 300) e.message = "বার্তা ৩০০ অক্ষরের মধ্যে রাখুন";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy.current || status === "success") return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!submissionId.current) submissionId.current = crypto.randomUUID();
    const parsed = rsvpInput.safeParse({
      submissionId: submissionId.current, guestName: form.name.trim(),
      attendance: form.attending === "yes" ? "attending" : "not_attending",
      guestCount: form.attending === "yes" ? Number(form.guests) : 0,
      phone: form.phone.trim() || undefined, message: form.message.trim() || undefined,
      website: form.website || undefined,
    });
    if (!parsed.success) {
      setErrorMessage("নাম, ফোন নম্বর ও অতিথির সংখ্যা সঠিকভাবে লিখুন");
      setStatus("error"); return;
    }
    busy.current = true;
    setStatus("loading"); setErrorMessage("");
    try {
      const r = await save({ data: parsed.data });
      if (!r.ok) { setStatus("error"); setErrorMessage(r.error); toast.error(r.error); return; }
      emailToken.current = r.emailToken ?? "";
      setEmailPending(r.emailStatus !== "sent");
      setStatus("success");
      toast.success("আপনার উত্তর গ্রহণ করা হয়েছে");
    } catch {
      const message = "উত্তর নিশ্চিত করা যায়নি। আবার চেষ্টা করুন—একই উত্তর দুবার সংরক্ষণ হবে না।";
      setStatus("error"); setErrorMessage(message); toast.error(message);
    } finally { busy.current = false; }
  };

  const retryEmail = async () => {
    if (busy.current || !emailToken.current) return;
    busy.current = true; setRetrying(true);
    try {
      const result = await retry({ data: { submissionId: submissionId.current, emailToken: emailToken.current } });
      const ok = result.emailStatus === "sent";
      setEmailPending(!ok);
      if (ok) toast.success("নোটিফিকেশন পাঠানো হয়েছে");
      else toast.error("নোটিফিকেশন পাঠানো যায়নি, তবে আপনার উত্তর সংরক্ষিত আছে");
    } catch { toast.error("নোটিফিকেশন পাঠানো যায়নি, তবে আপনার উত্তর সংরক্ষিত আছে"); }
    finally { busy.current = false; setRetrying(false); }
  };

  const reset = () => {
    setStatus("idle"); setForm(emptyRsvp); setEmailPending(false); setErrorMessage("");
    submissionId.current = ""; emailToken.current = "";
  };

  const field = "w-full border border-gold/50 bg-ivory px-4 py-3 font-bengali text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-gold";

  return (
    <section id="rsvp" className="bg-maroon px-4 py-20 alpana-dark">
      <SectionHeading eyebrow="RSVP" title="উপস্থিতি নিশ্চিত করুন" light />
      <Reveal className="mx-auto max-w-xl">
        <div className="px-6 sm:px-10 py-10 invite-panel">
          {status === "success" ? (
            <div className="py-6 font-bengali text-ivory text-center" role="status">
              <Lotus className="mx-auto text-gold" size={56} />
              <p className="mt-4 text-gold text-2xl">ধন্যবাদ, {form.name}!</p>
              <p className="mt-2 text-ivory/80">আপনার উত্তর গ্রহণ ও সংরক্ষণ করা হয়েছে।</p>
              {emailPending && (
                <p className="mt-3 text-gold-soft text-sm">
                  পরিবারকে নোটিফিকেশন পাঠানো যায়নি।{" "}
                  {emailToken.current && <Button variant="link" disabled={retrying} onClick={retryEmail} className="p-0 h-auto text-inherit underline">{retrying ? "পাঠানো হচ্ছে…" : "আবার পাঠান"}</Button>}
                </p>
              )}
              <Button variant="link" disabled={retrying} onClick={reset} className="mt-6 p-0 h-auto font-bengali text-gold text-sm underline">আরেকজনের জন্য পূরণ করুন</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <div>
                <label htmlFor="r-name" className="block mb-1 font-bengali text-gold-soft text-sm">অতিথির নাম *</label>
                <input id="r-name" className={field} value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
                {errors.name && <p className="mt-1 font-bengali text-error-soft text-sm">{errors.name}</p>}
              </div>
              <fieldset>
                <legend className="mb-2 font-bengali text-gold-soft text-sm">উপস্থিত থাকবেন কি? *</legend>
                <div className="gap-3 grid grid-cols-2">
                  {([["yes", "হ্যাঁ, থাকব"], ["no", "দুঃখিত, পারব না"]] as const).map(([v, l]) => (
                    <label key={v} className={`cursor-pointer border px-3 py-3 text-center font-bengali text-sm transition ${form.attending === v ? "border-gold bg-gold text-burgundy" : "border-gold/50 text-ivory hover:border-gold"}`}>
                      <input type="radio" name="attending" value={v} className="sr-only" checked={form.attending === v} onChange={() => setForm({ ...form, attending: v })} />
                      {l}
                    </label>
                  ))}
                </div>
                {errors.attending && <p className="mt-1 font-bengali text-error-soft text-sm">{errors.attending}</p>}
              </fieldset>
              {form.attending === "yes" && (
                <div>
                  <label htmlFor="r-guests" className="block mb-1 font-bengali text-gold-soft text-sm">মোট অতিথির সংখ্যা</label>
                  <input id="r-guests" type="number" min={1} max={20} className={field} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} aria-invalid={!!errors.guests} />
                  {errors.guests && <p className="mt-1 font-bengali text-error-soft text-sm">{errors.guests}</p>}
                </div>
              )}
              <div>
                <label htmlFor="r-phone" className="block mb-1 font-bengali text-gold-soft text-sm">ফোন নম্বর (ঐচ্ছিক)</label>
                <input id="r-phone" type="tel" inputMode="tel" maxLength={20} className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="mt-1 font-bengali text-error-soft text-sm">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="r-msg" className="block mb-1 font-bengali text-gold-soft text-sm">শুভেচ্ছাবার্তা (ঐচ্ছিক)</label>
                <textarea id="r-msg" rows={3} maxLength={300} className={field} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors.message} />
                {errors.message && <p className="mt-1 font-bengali text-error-soft text-sm">{errors.message}</p>}
              </div>
              {status === "error" && <p role="alert" className="font-bengali text-error-soft text-sm">{errorMessage}</p>}
              <Button variant="ghost" type="submit" disabled={status === "loading"} className="justify-center rounded-none w-full h-auto btn-gold">
                {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> পাঠানো হচ্ছে…</> : "উত্তর পাঠান"}
              </Button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

export function Wishes() {
  const [items, setItems] = useState<PublicWish[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const startedAt = useRef(0);

  const load = async (p: number) => {
    setLoadingList(true);
    try {
      const r = await listApprovedWishes({ data: { page: p } });
      setItems((prev) => (p === 0 ? r.items : [...prev, ...r.items]));
      setHasMore(r.hasMore);
      setPage(p);
    } catch {
      /* keep current list */
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { startedAt.current = Date.now(); void load(0); }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (name.trim().length < 2 || text.trim().length < 3) return setErr("নাম ও শুভেচ্ছাবার্তা দুটিই লিখুন");
    setErr("");
    setSending(true);
    try {
      const r = await submitWish({ data: { name: name.trim(), message: text.trim(), website: website || undefined, elapsedMs: Date.now() - startedAt.current } });
      if (!r.ok) { setErr(r.error); toast.error(r.error); return; }
      toast.success("ধন্যবাদ! অনুমোদনের পর আপনার শুভেচ্ছা এখানে দেখা যাবে।");
      setName(""); setText("");
    } catch {
      toast.error("দুঃখিত, এখন বার্তা পাঠানো যাচ্ছে না");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="wishes" className="bg-ivory px-4 py-20 alpana-bg">
      <SectionHeading eyebrow="Blessings" title="শুভেচ্ছা ও আশীর্বাদ" />
      <div className="gap-8 grid md:grid-cols-2 mx-auto max-w-5xl">
        <form onSubmit={add} className="space-y-4 text-left event-card" noValidate>
          <p className="font-bengali text-ink/60 text-xs">আপনার শুভেচ্ছা পরিবারের অনুমোদনের পর সবার জন্য প্রকাশিত হবে।</p>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <div>
            <label htmlFor="w-name" className="block mb-1 font-bengali text-maroon text-sm">আপনার নাম</label>
            <input id="w-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} className="bg-ivory px-4 py-2.5 border border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold w-full font-bengali" />
          </div>
          <div>
            <label htmlFor="w-text" className="block mb-1 font-bengali text-maroon text-sm">শুভেচ্ছাবার্তা</label>
            <textarea id="w-text" rows={4} value={text} maxLength={250} onChange={(e) => setText(e.target.value)} className="bg-ivory px-4 py-2.5 border border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold w-full font-bengali" />
            <p className="font-bengali text-ink/50 text-xs text-right">{toBn(text.length)}/২৫০</p>
          </div>
          {err && <p className="font-bengali text-destructive text-sm">{err}</p>}
          <button className="btn-maroon" disabled={sending}>
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> পাঠানো হচ্ছে…</> : "শুভেচ্ছা জানান"}
          </button>
        </form>
        <div>
          <ul className="space-y-4 pr-1 max-h-[26rem] overflow-y-auto">
            {items.map((w) => (
              <li key={w.id} className="bg-card shadow-soft px-5 py-4 border-gold border-l-2">
                <p className="font-bengali text-ink leading-relaxed whitespace-pre-line">“{w.message}”</p>
                <p className="mt-2 font-bengali text-gold-deep text-sm">— {w.name}</p>
              </li>
            ))}
            {!loadingList && items.length === 0 && (
              <li className="px-5 py-8 border border-gold/60 border-dashed font-bengali text-ink/60 text-center">প্রথম শুভেচ্ছাটি আপনিই জানান।</li>
            )}
          </ul>
          {loadingList && <p className="flex justify-center items-center gap-2 mt-4 font-bengali text-ink/60 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে…</p>}
          {hasMore && !loadingList && (
            <div className="mt-4 text-center"><button onClick={() => load(page + 1)} className="font-bengali text-maroon text-sm underline">আরও দেখুন</button></div>
          )}
        </div>
      </div>
    </section>
  );
}


const isSet = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  !/^YOUR\s/i.test(value.trim());

export function Footer() {
  const familyName = isSet(wedding.family.familyName)
    ? wedding.family.familyName
    : "";

  const developerName = isSet(developerInfo.name)
    ? developerInfo.name
    : "";

  const socials = [
    { href: developerInfo.facebook, label: "Facebook", Icon: Facebook },
    { href: developerInfo.github, label: "GitHub", Icon: Github },
    { href: developerInfo.linkedin, label: "LinkedIn", Icon: Linkedin },
  ].filter(
    (social): social is typeof social & { href: string } =>
      isSet(social.href)
  );

  return (
    <footer className="bg-burgundy px-4 py-16 text-center">
      <Lotus className="mx-auto text-gold" size={64} />

      <p className="mt-4 font-bengali text-gold text-2xl">
        {wedding.bride.name} ♥ {wedding.groom.name}
      </p>

      <p className="mt-2 font-bengali text-ivory/90">
        {wedding.weddingDateBn}
      </p>

      <Divider className="mt-6" />

      <p className="mx-auto mt-6 max-w-md font-bengali text-ivory/85">
        আপনাদের ভালোবাসা ও আশীর্বাদ আমাদের কাছে অমূল্য।
      </p>

      {familyName && (
        <p className="mt-2 font-bengali text-gold-soft text-sm">
          — {familyName}
        </p>
      )}

      <div className="flex justify-center gap-3 mt-8">
        <button
          type="button"
          onClick={shareInvitation}
          className="btn-gold"
        >
          <Share2 className="w-4 h-4" />
          আমন্ত্রণ শেয়ার করুন
        </button>

        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="w-12 h-12 icon-btn"
          aria-label="উপরে ফিরে যান"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-auto mt-14 pt-10 border-gold/30 border-t max-w-2xl">
        <p className="font-bengali font-bold text-gold-gradient text-3xl">
          শুভ বিবাহ
        </p>

        <p className="mx-auto mt-4 max-w-lg font-bengali text-ivory/85 leading-relaxed">
          আপনাদের ভালোবাসা, শুভেচ্ছা ও আশীর্বাদ আমাদের নতুন জীবনের পথচলাকে আরও সুন্দর করে তুলবে।
        </p>

        {developerName && (
          <p className="mt-8 text-ivory/80 text-sm">
            Designed &amp; Developed with{" "}
            <span aria-label="love">❤️</span> by{" "}
            <span className="text-gold">{developerName}</span>
          </p>
        )}

        <div className="flex justify-center gap-3 mt-4">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 icon-btn"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}

          {isSet(developerInfo.email) && (
            <a
              href={`mailto:${developerInfo.email}`}
              aria-label="Email"
              className="w-10 h-10 icon-btn"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="mt-6 text-ivory/60 text-xs">
          © {new Date().getFullYear()}
          {familyName ? ` ${familyName}` : ""}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
