import { useEffect, useRef, useState, type ReactNode } from "react";

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold sm:w-24" />
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <path d="M20 2c3 4 3 12 0 16-3-4-3-12 0-16Z" fill="currentColor" />
        <path d="M20 10c4-6 10-6 14-4-3 5-9 6-14 4ZM20 10c-4-6-10-6-14-4 3 5 9 6 14 4Z" fill="currentColor" opacity=".7" />
        <circle cx="2" cy="10" r="1.5" fill="currentColor" />
        <circle cx="38" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold sm:w-24" />
    </div>
  );
}

export function Lotus({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M50 5c8 12 8 32 0 50-8-18-8-38 0-50Z" />
      <path d="M50 55c-6-16-18-28-34-30 2 16 16 28 34 30Z" />
      <path d="M50 55c6-16 18-28 34-30-2 16-16 28-34 30Z" />
      <path d="M50 55C40 46 22 42 4 46c10 8 28 12 46 9Z" />
      <path d="M50 55c10-9 28-13 46-9-10 8-28 12-46 9Z" />
    </svg>
  );
}

/** Abstract Ganesha emblem — respectful stylised mark (trunk, ears, crown, tilak). */
export function GaneshaEmblem({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="শ্রী গণেশ প্রতীক" role="img" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
      <circle cx="50" cy="50" r="41" strokeWidth=".6" strokeDasharray="2 3" opacity=".6" />
      <path d="M38 24l6-8 6 6 6-6 6 8" />
      <path d="M36 26h28" />
      <path d="M36 30c-14-4-20 8-16 18 3 8 12 9 16 4" />
      <path d="M64 30c14-4 20 8 16 18-3 8-12 9-16 4" />
      <path d="M36 28c0 12 4 22 14 22s14-10 14-22" />
      <path d="M50 50c0 10-2 18 4 24 4 4 10 2 10-4" />
      <path d="M50 32v6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="43" cy="40" r="1.5" fill="currentColor" />
      <circle cx="57" cy="40" r="1.5" fill="currentColor" />
      <path d="M30 80c6 4 34 4 40 0" />
    </svg>
  );
}

export function Diya({ className = "" }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 4c3 5 4 9 0 14-4-5-3-9 0-14Z" className="fill-flame animate-flicker origin-bottom" />
      <path d="M4 22h32c-2 8-8 12-16 12S6 30 4 22Z" fill="currentColor" />
    </svg>
  );
}

export function SectionHeading({ eyebrow, title, light = false }: { eyebrow?: string; title: string; light?: boolean }) {
  return (
    <div className="mb-10 text-center sm:mb-14">
      {eyebrow && <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">{eyebrow}</p>}
      <h2 className={`mt-2 font-bengali text-3xl font-semibold sm:text-4xl ${light ? "text-ivory" : "text-maroon"}`}>{title}</h2>
      <Divider className="mt-4" />
    </div>
  );
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function GoldFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`gold-frame ${className}`}>{children}</div>;
}
