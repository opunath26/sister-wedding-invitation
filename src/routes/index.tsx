import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/wedding/Navbar";
import {
  Blessing,
  Countdown,
  Couple,
  Events,
  Hero,
  Invitation,
  Venue,
} from "@/components/wedding/Sections";
import {
  Footer,
  Gallery,
  RSVP,
  Wishes,
} from "@/components/wedding/Interactive";
import { WeddingIntro } from "@/components/wedding/WeddingIntro";
import { EngagementVideo } from "@/components/wedding/EngagementVideo";

const title = "শতাব্দী ও অর্ণব-এর শুভ বিবাহ";

const description =
  "শ্রী শ্রী গণেশায় নমঃ। ২৬ নভেম্বর ২০২৬ — আমাদের পরিবারের শুভ বিবাহে আপনাকে ও আপনার পরিবারকে সাদর আমন্ত্রণ।";

// তোমার ওয়েবসাইটের আসল deployed domain বসাবে
const siteUrl = "https://YOUR-DOMAIN.com";

// public/images/og-wedding.jpg ছবিটির absolute URL
const ogImage = `${siteUrl}/images/og-wedding.jpg`;

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
    ],
    meta: [
      // Basic SEO
      {
        title,
      },
      {
        name: "description",
        content: description,
      },

      // Open Graph — Facebook, WhatsApp, Messenger
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:locale",
        content: "bn_BD",
      },
      {
        property: "og:url",
        content: siteUrl,
      },
      {
        property: "og:image",
        content: ogImage,
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "শুভ বিবাহ — বিবাহের নিমন্ত্রণ",
      },

      // Twitter / X
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: title,
      },
      {
        name: "twitter:description",
        content: description,
      },
      {
        name: "twitter:image",
        content: ogImage,
      },
    ],
  }),

  component: Index,
});

function Index() {
  return (
    <>
      <WeddingIntro />

      <Navbar />

      <main>
        <Hero />

        <Blessing />

        <Couple />

        <Invitation />

        <EngagementVideo />

        <Countdown />

        <Events />

        <Venue />

        <Gallery />

        <RSVP />

        <Wishes />
      </main>

      <Footer />
    </>
  );
}