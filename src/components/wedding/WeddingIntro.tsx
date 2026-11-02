import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";
import { Divider, GaneshaEmblem, Lotus } from "./Ornaments";

type Phase = "closed" | "opening" | "revealed" | "leaving" | "done";

const sparks = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 41) % 100,
  delay: (i * 0.7) % 6,
  dur: 7 + ((i * 3) % 6),
  size: 2 + (i % 3),
}));
const burst = Array.from({ length: 16 }, (_, i) => ({
  x: Math.round(Math.cos((i / 16) * Math.PI * 2) * (120 + (i % 4) * 40)),
  y: Math.round(Math.sin((i / 16) * Math.PI * 2) * (120 + (i % 3) * 40)),
  delay: (i % 5) * 0.06,
}));

function Mandala({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth=".8">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="100" cy="55" rx="14" ry="42" transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="30" />
      <circle cx="100" cy="100" r="92" strokeDasharray="2 4" />
      <circle cx="100" cy="100" r="98" />
    </svg>
  );
}

export function WeddingIntro() {
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = () => {
    timers.current.forEach(clearTimeout);
    setPhase("done");
  };

  const open = () => {
    if (phase !== "closed") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    setPhase("opening");
    const t = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    t(1700, () => setPhase("revealed"));
    t(3900, () => setPhase("leaving"));
    t(4800, () => setPhase("done"));
  };

  if (phase === "done") return null;
  const busy = phase !== "closed";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="বিবাহের আমন্ত্রণপত্র"
      className={`intro-root fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-intro px-4 ${phase === "leaving" ? "intro-leave" : ""}`}
    >
      <div className="absolute inset-0 pointer-events-none intro-spotlight" aria-hidden />
      <Mandala className="-top-24 -left-24 absolute w-72 h-72 text-gold/15 animate-spin-slow pointer-events-none" />
      <Mandala className="-right-28 -bottom-28 absolute w-80 h-80 text-gold/15 animate-spin-slow pointer-events-none" />
      <div className="absolute inset-3 sm:inset-5 border border-gold/40 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {sparks.map((s, i) => (
          <span key={i} className="intro-spark" style={{ left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
        ))}
      </div>

      <button type="button" onClick={finish} className="top-5 sm:top-8 right-5 sm:right-8 z-20 absolute font-bengali text-gold-soft/80 hover:text-gold text-sm hover:underline underline-offset-4">
        Skip Intro
      </button>

      {/* Card */}
      <div className={`intro-stage relative ${busy ? "intro-tilt" : ""}`}>
        <div className="relative w-[min(78vw,21rem)] h-[min(64svh,30rem)] intro-card">
          {/* inner ivory page */}
          <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center intro-inner">
            <div className={`intro-inner-content ${phase === "revealed" || phase === "leaving" ? "intro-inner-in" : ""}`}>
              <Lotus className="mx-auto text-gold-deep" size={56} />
              <p className="mt-3 font-bengali text-maroon/80 text-sm">শ্রী শ্রী গণেশায় নমঃ</p>
              <h2 className="mt-2 font-bengali font-bold text-maroon text-4xl sm:text-5xl">শুভ বিবাহ</h2>
              <Divider className="mt-3" />
              <p className="mt-4 font-bengali font-semibold text-ink text-xl">{wedding.bride.name}</p>
              <p className="font-display text-gold-deep text-xl italic">&amp;</p>
              <p className="font-bengali font-semibold text-ink text-xl">{wedding.groom.name}</p>
              <p className="mt-4 font-bengali text-maroon">{wedding.weddingDateBn}</p>
            </div>
          </div>
          {/* front cover */}
          <div className={`intro-cover absolute inset-0 ${busy ? "intro-cover-open" : ""}`}>
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center intro-cover-front">
              <GaneshaEmblem className="text-gold" size={58} />
              <p className="mt-3 font-bengali text-gold-soft text-sm">শ্রী শ্রী গণেশায় নমঃ</p>
              <h1 className="mt-2 py-2 font-bengali font-bold text-gold-gradient text-4xl sm:text-5xl leading-relaxed">শুভ বিবাহ</h1>
              <Divider className="mt-3" />
              <p className="mt-4 font-bengali text-ivory text-lg">
                {wedding.bride.name} <span className="text-gold">♥</span> {wedding.groom.name}
              </p>
              <p className="mt-3 px-4 py-1 border-gold/60 border-y font-bengali text-gold">{wedding.weddingDateBn}</p>
              <span className="mt-6 intro-seal" aria-hidden>
                <Lotus className="text-burgundy" size={26} />
              </span>
            </div>
            <div className="absolute inset-0 intro-cover-back" aria-hidden />
          </div>
        </div>
        {(phase === "revealed" || phase === "leaving") && (
          <div className="top-1/2 left-1/2 absolute pointer-events-none" aria-hidden>
            {burst.map((b, i) => (
              <span key={i} className="intro-burst" style={{ ["--x" as string]: `${b.x}px`, ["--y" as string]: `${b.y}px`, animationDelay: `${b.delay}s` }} />
            ))}
          </div>
        )}
      </div>

      <div className={`relative z-10 mt-8 text-center transition-opacity duration-500 ${busy ? "opacity-0" : "opacity-100"}`}>
        <button type="button" onClick={open} disabled={busy} className="btn-gold intro-pulse">
          আমন্ত্রণপত্র খুলুন
        </button>
        <p className="mt-3 font-bengali text-gold-soft/90 text-sm">আপনাকে সাদর আমন্ত্রণ</p>
      </div>
    </div>
  );
}
