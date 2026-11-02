import { useState } from "react";
import { LoaderCircle, Play } from "lucide-react";
import { wedding } from "@/data/wedding";
import { Divider, Lotus, Reveal } from "./Ornaments";

export function EngagementVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const video = wedding.engagementVideo;

  // Auto-play URL trigger when user clicks the attractive play cover
  const finalEmbedUrl = isPlaying
    ? `${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
    : video.embedUrl;

  return (
    <section id="engagement" aria-labelledby="engagement-heading" className="bg-engagement-ivory px-5 sm:px-8 py-16 sm:py-20">
      <Reveal className="mx-auto max-w-4xl text-center">
        <Divider className="mb-5 text-engagement-gold" />
        <h2 id="engagement-heading" className="font-bengali font-semibold text-engagement-maroon text-3xl sm:text-4xl leading-relaxed">
          {video.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl font-bengali text-engagement-maroon/80 text-base sm:text-lg leading-relaxed">
          {video.subtitle}
        </p>

        <div className="mx-auto mt-9 sm:mt-11 p-1.5 sm:p-2 rounded-lg engagement-frame">
          <div className="relative bg-engagement-burgundy rounded-md w-full aspect-video overflow-hidden">
            
            {/* 1. Iframe Video Player */}
            {isPlaying && (
              <>
                {!loaded && (
                  <div role="status" className="z-10 absolute inset-0 flex flex-col justify-center items-center gap-3 bg-engagement-burgundy text-engagement-gold pointer-events-none">
                    <LoaderCircle className="w-7 h-7 animate-spin" aria-hidden="true" />
                    <span className="font-bengali text-sm">ভিডিও লোড হচ্ছে…</span>
                  </div>
                )}
                <iframe
                  src={finalEmbedUrl}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={() => setLoaded(true)}
                  className="absolute inset-0 border-0 w-full h-full"
                />
              </>
            )}

            {/* 2. Attractive Cover / Poster & Animated Play Overlay */}
            {!isPlaying && (
              <div 
                onClick={() => setIsPlaying(true)}
                className="group relative inset-0 flex flex-col justify-center items-center bg-gradient-to-t from-engagement-burgundy via-engagement-maroon/90 to-engagement-burgundy/80 hover:brightness-105 w-full h-full transition-all duration-300 cursor-pointer"
              >
                {/* Optional Custom Poster Image (if defined in wedding.ts data) */}
                {video.posterUrl && (
                  <img 
                    src={video.posterUrl} 
                    alt={video.title}
                    className="absolute inset-0 opacity-60 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                )}

                {/* Decorative Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Glowing Animated Play Button Container */}
                <div className="z-10 relative flex flex-col items-center gap-3">
                  <div className="relative flex justify-center items-center bg-engagement-gold/90 group-hover:bg-engagement-gold shadow-lg group-hover:shadow-[0_0_25px_rgba(212,175,55,0.7)] backdrop-blur-sm rounded-full w-16 sm:w-20 h-16 sm:h-20 text-engagement-maroon group-hover:scale-110 transition-all duration-300">
                    <Play className="fill-current w-7 sm:w-9 h-7 sm:h-9 translate-x-0.5" />
                    {/* Ripple Effect Animation */}
                    <span className="absolute inset-0 bg-engagement-gold/40 rounded-full animate-ping" />
                  </div>
                  
                  {/* Bengali Prompt Badge */}
                  <span className="bg-engagement-maroon/80 group-hover:bg-engagement-maroon shadow-md backdrop-blur-md mt-2 px-4 py-1.5 border border-engagement-gold/40 group-hover:border-engagement-gold rounded-full font-bengali font-medium text-engagement-gold text-xs sm:text-sm transition-all">
                    🎬 ভিডিওটি দেখতে এখানে ক্লিক করুন
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        <Lotus className="mx-auto mt-8 text-engagement-gold" size={40} />
        <p className="mx-auto mt-4 max-w-2xl font-bengali text-engagement-maroon/80 text-sm sm:text-base leading-loose">
          {video.caption}
        </p>
      </Reveal>
    </section>
  );
}