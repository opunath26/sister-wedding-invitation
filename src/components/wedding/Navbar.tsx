import { useEffect, useRef, useState } from "react";
import { Menu, Music, Share2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { wedding } from "@/data/wedding";
import { shareInvitation } from "@/lib/share";

export const navLinks = [
  ["home", "প্রচ্ছদ"],
  ["couple", "বর-কনে"],
  ["invitation", "নিমন্ত্রণ"],
  ["events", "অনুষ্ঠান"],
  ["venue", "বিবাহস্থল"],
  ["gallery", "ছবির গ্যালারি"],
  ["rsvp", "উপস্থিতি নিশ্চিত করুন"],
  ["wishes", "শুভেচ্ছা"],
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(wedding.musicSrc);
      audioRef.current.loop = true;
    }
    const a = audioRef.current;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    try {
      await a.play();
      setPlaying(true);
    } catch {
      toast("সংগীত ফাইলটি এখনো যুক্ত করা হয়নি");
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled || open ? "bg-burgundy/95 shadow-royal backdrop-blur" : "bg-transparent"}`}>
      <nav className="flex justify-between items-center gap-3 mx-auto px-4 sm:px-6 py-3 max-w-7xl" aria-label="প্রধান নেভিগেশন">
        <a href="#home" className="flex items-center gap-2" aria-label="প্রচ্ছদে যান">
          <img
            src="/images/wedding-logo.png"
            alt="শতাব্দী ও অর্ণবের বিবাহের লোগো"
            className="rounded-full w-12 h-12 object-contain"
          />
          <span className="hidden sm:inline font-bengali text-ivory text-lg">
            শুভ বিবাহ
          </span>
        </a>
        <ul className="hidden xl:flex items-center gap-5">
          {navLinks.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="font-bengali text-ivory/90 hover:text-gold text-sm nav-link">{label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={toggleMusic} className="icon-btn" aria-label={playing ? "সংগীত বন্ধ করুন" : "সংগীত চালু করুন"} aria-pressed={playing}>
            {playing ? <Music className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={shareInvitation} className="icon-btn" aria-label="আমন্ত্রণ শেয়ার করুন">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(!open)} className="xl:hidden icon-btn" aria-label="মেনু" aria-expanded={open}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="xl:hidden px-6 pt-2 pb-6 border-gold/30 border-t">
          {navLinks.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setOpen(false)} className="block py-3 border-gold/10 border-b font-bengali text-ivory hover:text-gold">{label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
