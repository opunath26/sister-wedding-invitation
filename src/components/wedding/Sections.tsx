
import { useEffect, useState } from "react";
import {
  Flame,
  Flower2,
  Home,
  MapPin,
  Navigation,
  Sun,
  UtensilsCrossed,
  User,
} from "lucide-react";

import heroImg from "@/assets/hero-mandap.jpg";
import {
  wedding,
  getCountdown,
  toBn,
  type WeddingEvent,
} from "@/data/wedding";

import {
  Divider,
  Diya,
  GaneshaEmblem,
  GoldFrame,
  Lotus,
  Reveal,
  SectionHeading,
} from "./Ornaments";

const petals = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 1.3) % 12,
  dur: 10 + ((i * 7) % 8),
  size: 8 + ((i * 5) % 10),
}));

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex justify-center items-center bg-burgundy px-4 pt-24 pb-16 min-h-[100svh] overflow-hidden"
    >
      <img
        src={heroImg}
        alt=""
        aria-hidden
        width={1088}
        height={1440}
        className="absolute inset-0 opacity-90 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-hero-veil" aria-hidden />

      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {petals.map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div className="z-10 relative mx-auto max-w-xl text-center animate-rise">
        <GaneshaEmblem className="mx-auto text-gold" size={76} />

        <p className="mt-4 font-bengali text-gold-soft text-base sm:text-lg">
          শ্রী শ্রী গণেশায় নমঃ
        </p>

        <div className="px-4 w-full overflow-hidden text-center">
          <h1 className="mt-3 py-2 font-bengali font-bold text-gold-gradient text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-normal tracking-wide">
            শুভ বিবাহ
          </h1>
        </div>

        <Divider className="mt-5" />

        <p className="mt-5 font-bengali text-ivory text-lg sm:text-xl">
          দুটি প্রাণের এক অনন্ত বন্ধন
        </p>

        <p className="mt-6 font-bengali font-semibold text-ivory text-2xl sm:text-4xl">
          {wedding.bride.name}{" "}
          <span className="mx-2 text-gold">♥</span>{" "}
          {wedding.groom.name}
        </p>

        <p className="inline-block mt-5 px-6 py-2 border-gold/60 border-y font-bengali text-gold text-xl sm:text-2xl">
          {wedding.weddingDateBn}
        </p>

        <div className="mt-9">
          <a href="#blessing" className="btn-gold">
            আমন্ত্রণ গ্রহণ করুন
          </a>
        </div>
      </div>
    </section>
  );
}

export function Blessing() {
  return (
    <section
      id="blessing"
      className="bg-ivory px-4 py-16 sm:py-20 alpana-bg"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <GaneshaEmblem className="mx-auto text-maroon" size={64} />

        <Divider className="mt-5" />

        <p className="mt-6 font-bengali text-ink text-lg sm:text-xl leading-relaxed">
          বক্রতুণ্ড মহাকায় সূর্যকোটি সমপ্রভ।
          <br />
          নির্বিঘ্নং কুরু মে দেব সর্বকার্যেষু সর্বদা॥
        </p>

        <p className="mt-5 font-bengali text-ink/80">
          সিদ্ধিদাতা গণেশের আশীর্বাদে শুরু হোক এক নতুন জীবনের মঙ্গলময় পথচলা।
        </p>

        <Divider className="mt-6" />
      </Reveal>
    </section>
  );
}

function Portrait({
  name,
  role,
  photo,
  bio,
}: {
  name: string;
  role: string;
  photo: string;
  bio: string;
}) {
  return (
    <div className="text-center">
      <GoldFrame className="mx-auto w-56 sm:w-64 aspect-[3/4]">
        {photo ? (
          <img
            src={photo}
            alt={`${role} — ${name}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="place-items-center grid bg-silhouette w-full h-full text-gold/70"
            role="img"
            aria-label={`${role}-এর ছবি শীঘ্রই যুক্ত হবে`}
          >
            <User className="w-24 h-24" strokeWidth={0.8} />
          </div>
        )}
      </GoldFrame>

      <h3 className="mt-6 font-bengali font-semibold text-maroon text-2xl">
        {name}
      </h3>

      <p className="font-bengali text-gold-deep">{role}</p>

      {bio && (
        <p className="mx-auto mt-3 max-w-xs font-bengali text-ink/80 text-sm">
          {bio}
        </p>
      )}
    </div>
  );
}

export function Couple() {
  return (
    <section id="couple" className="bg-ivory px-4 py-20">
      <SectionHeading eyebrow="The Couple" title="বর-কনে" />

      <Reveal className="items-center gap-12 grid md:grid-cols-[1fr_auto_1fr] mx-auto max-w-5xl">
        <Portrait
          name={wedding.bride.name}
          role="কনে"
          photo={wedding.bride.photo}
          bio={wedding.bride.bio}
        />

        <div className="mx-auto max-w-xs text-center">
          <Lotus className="mx-auto text-gold" size={64} />

          <p className="mt-4 font-bengali text-ink/85 leading-relaxed">
            দুটি পরিবার, দুটি হৃদয় — ভালোবাসা আর আশীর্বাদের সুতোয় গাঁথা হবে এক
            নতুন সম্পর্ক।
          </p>
        </div>

        <Portrait
          name={wedding.groom.name}
          role="বর"
          photo={wedding.groom.photo}
          bio={wedding.groom.bio}
        />
      </Reveal>
    </section>
  );
}

export function Invitation() {
  const f = wedding.family;

  return (
    <section
      id="invitation"
      className="bg-maroon px-4 py-20 alpana-dark"
    >
      <Reveal className="mx-auto max-w-3xl">
        <div className="px-6 sm:px-14 py-12 text-center invite-panel">
          <Lotus className="mx-auto text-gold" size={56} />

          <h2 className="mt-3 font-bengali font-semibold text-gold text-3xl sm:text-4xl">
            সাদর নিমন্ত্রণ
          </h2>

          <Divider className="mt-4" />

          <p className="mt-7 font-bengali text-ivory text-lg leading-loose">
            পরম আনন্দের সঙ্গে আমাদের পরিবারের এই শুভ মুহূর্তে আপনাকে ও আপনার
            পরিবারকে সাদর আমন্ত্রণ জানাই। আপনাদের উপস্থিতি, ভালোবাসা ও আশীর্বাদ
            আমাদের নতুন জীবনের পথচলাকে আরও সুন্দর করে তুলবে।
          </p>

          {/* Bride and Groom Parents */}
          <div className="gap-8 grid sm:grid-cols-2 mt-10">
            {/* Bride's Family */}
            <div className="bg-white/5 px-4 py-6 border border-gold/40 rounded-xl">
              <p className="font-bengali text-gold-soft text-sm">
                কনের পিতা-মাতা
              </p>

              <Divider className="mt-3" />

              <p className="mt-4 font-bengali text-gold text-lg leading-relaxed">
                {f.brideParents}
              </p>
            </div>

            {/* Groom's Family */}
            <div className="bg-white/5 px-4 py-6 border border-gold/40 rounded-xl">
              <p className="font-bengali text-gold-soft text-sm">
                বরের পিতা-মাতা
              </p>

              <Divider className="mt-3" />

              <p className="mt-4 font-bengali text-gold text-lg leading-relaxed">
                অ্যাডভোকেট বাদল কান্তি দাশ - সুজল রানী দাশ
              </p>
            </div>
          </div>

          <Divider className="mt-8" />

          <div className="space-y-1 mt-7 font-bengali text-ivory/90">
            <p className="text-gold-soft text-sm">বিনীত</p>
            <p className="text-gold text-xl">{f.brideParents}</p>
            <p>{f.familyName}</p>
            <p className="text-ivory/70 text-sm">{f.inviter}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const t = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(t);
  }, []);

  const c = now === null ? null : getCountdown(wedding.weddingDateISO, now);

  const units = c
    ? [
      [c.days, "দিন"],
      [c.hours, "ঘণ্টা"],
      [c.minutes, "মিনিট"],
      [c.seconds, "সেকেন্ড"],
    ]
    : [];

  return (
    <section className="bg-burgundy px-4 py-16 text-center">
      <p className="font-bengali text-gold-soft text-lg">
        শুভ লগ্নের অপেক্ষায়
      </p>

      <Divider className="mt-3" />

      {now === null ? (
        <div className="h-28" />
      ) : c ? (
        <div
          className="gap-2 sm:gap-5 grid grid-cols-4 mx-auto mt-8 max-w-2xl"
          aria-live="polite"
        >
          {units.map(([v, l]) => (
            <div key={l as string} className="count-cell">
              <span className="font-bengali font-bold text-gold text-3xl sm:text-5xl">
                {toBn(String(v).padStart(2, "0"))}
              </span>

              <span className="block mt-1 font-bengali text-ivory/80 text-xs sm:text-sm">
                {l}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 font-bengali text-gold text-2xl">
          শুভ বিবাহ সম্পন্ন — সকলের আশীর্বাদে নবদম্পতির জীবন হোক মঙ্গলময়!
        </p>
      )}
    </section>
  );
}

const icons = {
  sun: Sun,
  flame: Flame,
  flower: Flower2,
  utensils: UtensilsCrossed,
  home: Home,
};

function EventCard({
  e,
  index,
}: {
  e: WeddingEvent;
  index: number;
}) {
  const Icon = icons[e.icon];

  return (
    <article className="group relative bg-white/80 shadow-md hover:shadow-xl p-6 border border-gold/40 hover:border-gold rounded-2xl overflow-hidden text-center transition-all hover:-translate-y-2 duration-500">
      {/* Decorative background */}
      <div className="-top-10 -right-10 absolute bg-gold/10 rounded-full w-28 h-28 group-hover:scale-150 transition-transform duration-500" />

      <div className="-bottom-10 -left-10 absolute bg-maroon/5 rounded-full w-28 h-28 group-hover:scale-150 transition-transform duration-500" />

      <div className="relative">
        {/* Event number */}
        <div className="flex justify-center items-center mx-auto mb-4 border border-gold/60 rounded-full w-7 h-7 font-serif text-gold-deep text-xs">
          {toBn(index + 1)}
        </div>

        {/* Icon */}
        <div className="flex justify-center items-center bg-maroon shadow-lg mx-auto border border-gold/60 rounded-full w-16 h-16 text-gold group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </div>

        {/* Event title */}
        <h3 className="mt-5 font-bengali font-semibold text-maroon text-xl">
          {e.title}

          {e.optional && (
            <span className="ml-1 font-normal text-ink/50 text-sm">
              (ঐচ্ছিক)
            </span>
          )}
        </h3>

        {/* Decorative divider */}
        <div className="flex justify-center items-center gap-2 mx-auto my-4">
          <span className="bg-gold/50 w-8 h-px" />
          <Flower2 className="w-4 h-4 text-gold" />
          <span className="bg-gold/50 w-8 h-px" />
        </div>

        {/* Date */}
        {e.date && (
          <p className="font-bengali font-medium text-gold-deep text-sm">
            {e.date}
          </p>
        )}

        {/* Time */}
        {e.time && (
          <p className="mt-2 font-bengali text-ink/70 text-sm">
            {e.time}
          </p>
        )}

        {/* Venue */}
        {e.venue && (
          <p className="mt-2 font-bengali text-ink/70 text-sm">
            {e.venue}
          </p>
        )}

        {/* Description */}
        {e.description && (
          <p className="mt-4 font-bengali text-ink/80 text-sm leading-relaxed">
            {e.description}
          </p>
        )}

        {e.confirmed && (
          <div className="inline-flex items-center gap-1 bg-gold/10 mt-5 px-3 py-1 border border-gold/30 rounded-full font-bengali text-gold-deep text-xs">
            <Flame className="w-3 h-3" />
            শুভ অনুষ্ঠান
          </div>
        )}
      </div>
    </article>
  );
}

export function Events() {
  return (
    <section
      id="events"
      className="relative bg-ivory px-4 py-20 overflow-hidden alpana-bg"
    >
      <SectionHeading eyebrow="Ceremonies" title="অনুষ্ঠানসূচি" />

      <Reveal className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto max-w-7xl">
        {wedding.events.map((e, index) => (
          <EventCard key={e.id} e={e} index={index} />
        ))}
      </Reveal>
    </section>
  );
}

export function Venue() {
  const v = wedding.venue;

  return (
    <section
      id="venue"
      className="bg-maroon px-4 py-20 alpana-dark"
    >
      <SectionHeading eyebrow="Venue" title="বিবাহস্থল" light />

      <Reveal className="mx-auto max-w-2xl">
        <div className="px-6 py-10 text-center invite-panel">
          <MapPin className="mx-auto w-10 h-10 text-gold" />

          {v.name ? (
            <>
              <h3 className="mt-4 font-bengali text-gold text-2xl">
                {v.name}
              </h3>

              {v.address && (
                <p className="mt-2 font-bengali text-ivory/90">
                  {v.address}
                </p>
              )}

              <p className="mt-3 font-bengali text-ivory">
                {wedding.weddingDateBn}
                {wedding.weddingTimeBn && ` · ${wedding.weddingTimeBn}`}
              </p>

              {v.mapsUrl && (
                <a
                  href={v.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-6 btn-gold"
                >
                  <Navigation className="w-4 h-4" />
                  পথনির্দেশ দেখুন
                </a>
              )}

              {v.mapEmbedUrl && (
                <iframe
                  src={v.mapEmbedUrl}
                  title="বিবাহস্থলের মানচিত্র"
                  loading="lazy"
                  className="mt-8 border border-gold/50 w-full h-72"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </>
          ) : (
            <>
              <p className="mt-4 font-bengali text-gold text-2xl">
                বিবাহস্থলের তথ্য শীঘ্রই জানানো হবে
              </p>

              <p className="mt-3 font-bengali text-ivory/80">
                {wedding.weddingDateBn}
              </p>
            </>
          )}

          <div className="flex justify-center gap-6 mt-8 text-gold">
            <Diya />
            <Diya />
            <Diya />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
