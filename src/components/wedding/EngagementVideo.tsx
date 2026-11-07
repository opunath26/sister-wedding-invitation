
import { useState } from "react";
import { LoaderCircle, Play } from "lucide-react";
import { wedding } from "@/data/wedding";
import { Divider, Lotus, Reveal } from "./Ornaments";

export function EngagementVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const video = wedding.engagementVideo;

  const finalEmbedUrl = isPlaying
    ? `${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
    : video.embedUrl;

  return (
    <section
      id="engagement"
      aria-labelledby="engagement-heading"
      className="bg-engagement-ivory px-4 sm:px-8 py-16 sm:py-20"
    >
      <Reveal className="mx-auto max-w-4xl text-center">
        <Divider className="mb-5 text-engagement-gold" />

        <h2
          id="engagement-heading"
          className="font-bengali font-semibold text-engagement-maroon text-3xl sm:text-4xl leading-relaxed"
        >
          {video.title}
        </h2>

        <p className="mx-auto mt-3 max-w-xl font-bengali text-engagement-maroon/80 text-base sm:text-lg leading-relaxed">
          {video.subtitle}
        </p>

        {/* Video Frame */}
        <div className="mx-auto mt-9 sm:mt-11 p-1.5 sm:p-2 rounded-lg engagement-frame">
          <div className="relative bg-engagement-burgundy rounded-md w-full aspect-video overflow-hidden">

            {/* Video Player */}
            {isPlaying && (
              <>
                {!loaded && (
                  <div className="z-20 absolute inset-0 flex flex-col justify-center items-center gap-3 bg-engagement-burgundy text-engagement-gold">
                    <LoaderCircle
                      className="w-8 h-8 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="font-bengali text-sm">
                      ভিডিও লোড হচ্ছে…
                    </span>
                  </div>
                )}

                <iframe
                  src={finalEmbedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={() => setLoaded(true)}
                  className="absolute inset-0 border-0 w-full h-full"
                />
              </>
            )}

            {/* Video Preview Cover */}
            {!isPlaying && (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="ভিডিও চালু করুন"
                className="group absolute inset-0 flex flex-col justify-center items-center w-full h-full overflow-hidden cursor-pointer"
              >
                {/* Preview Image */}
                <img
                  src="/images/didi.jpg"
                  alt="শতাব্দীর সুন্দর মুহূর্ত"
                  className="absolute inset-0 w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/25" />

                {/* Play Button */}
                <div className="z-10 relative flex flex-col items-center gap-4">
                  <div className="relative flex justify-center items-center bg-engagement-gold/95 group-hover:bg-engagement-gold shadow-xl group-hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] rounded-full w-16 sm:w-20 h-16 sm:h-20 text-engagement-maroon group-hover:scale-110 transition-all duration-300">
                    <Play className="fill-current w-7 sm:w-9 h-7 sm:h-9 translate-x-0.5" />

                    <span className="absolute inset-0 opacity-40 border-2 border-engagement-gold rounded-full animate-ping" />
                  </div>

                  <span className="bg-engagement-maroon/90 shadow-lg backdrop-blur-sm px-5 py-2 border border-engagement-gold/60 rounded-full font-bengali font-medium text-engagement-gold text-xs sm:text-sm">
                    🎬 ভিডিওটি দেখতে এখানে ক্লিক করুন
                  </span>
                </div>
              </button>
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
